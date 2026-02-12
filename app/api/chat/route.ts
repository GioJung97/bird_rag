import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/src/db";
import { conversations, messages } from "@/src/db/schema";
import { toMessageDTO } from "@/src/lib/chat";
import { search } from "@/src/lib/retrieval";
import { saveUploadedImage, validateImageFile } from "@/src/lib/uploads";
import { chatWithLlama } from "@/src/lib/llama";

export const runtime = "nodejs";

function buildRetrievalReply({
  contextText,
  citationsText,
  offlineMessage,
  usedFallbackQuery
}: {
  contextText: string;
  citationsText: string;
  offlineMessage: string;
  usedFallbackQuery: boolean;
}) {
  if (offlineMessage) {
    return `Retrieval is offline. Use general knowledge and respond helpfully. (${offlineMessage})`;
  }

  if (!contextText) {
    const note = usedFallbackQuery
      ? " I used a generic query because no text was provided."
      : "";
    return `No relevant sources were found in the local index. Respond using general knowledge.${note}`;
  }

  const note = usedFallbackQuery
    ? "\n\nNote: I used a generic query because no text was provided."
    : "";

  return `Use the following retrieved context to answer the user. If you use a source, cite it inline like [1].\n\nContext:\n${contextText}\n\nSources:\n${citationsText}${note}`;
}

function buildRetrievalStub({
  contextText,
  citationsText,
  offlineMessage,
  usedFallbackQuery
}: {
  contextText: string;
  citationsText: string;
  offlineMessage: string;
  usedFallbackQuery: boolean;
}) {
  if (offlineMessage) {
    return `${offlineMessage} (retrieval stub)`;
  }

  if (!contextText) {
    const note = usedFallbackQuery
      ? " I used a generic query because no text was provided."
      : "";
    return `I couldn't find relevant sources in the local index yet. (retrieval stub)${note}`;
  }

  const note = usedFallbackQuery
    ? "\n\nNote: I used a generic query because no text was provided."
    : "";

  return `Here are relevant sources I found:\n\nSummary (from retrieved text):\n${contextText}\n\n${citationsText}${note}`;
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const text = (formData.get("text")?.toString() ?? "").trim();
  const conversationId =
    formData.get("conversationId")?.toString().trim() || undefined;
  const image = formData.get("image");

  if (!text && !(image instanceof File)) {
    return NextResponse.json(
      { error: "Message text or image is required." },
      { status: 400 }
    );
  }

  let conversation = null;
  if (conversationId) {
    conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .get();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      );
    }
  }

  const effectiveConversationId = conversationId ?? randomUUID();
  if (!conversation) {
    await db.insert(conversations).values({
      id: effectiveConversationId,
      createdAt: Date.now(),
      title: null
    });
  }

  let savedImagePath: string | null = null;
  let savedImageName: string | null = null;

  if (image instanceof File) {
    const validationError = validateImageFile(image);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const saved = await saveUploadedImage(image);
    savedImagePath = saved.path;
    savedImageName = saved.name;
  }

  const userMessageId = randomUUID();
  const createdAt = Date.now();

  await db.insert(messages).values({
    id: userMessageId,
    conversationId: effectiveConversationId,
    role: "user",
    text: text || null,
    imagePath: savedImagePath,
    imageName: savedImageName,
    createdAt
  });

  const retrievalK = Number(process.env.RETRIEVAL_K ?? "5") || 5;
  const usedFallbackQuery = !text.trim() && Boolean(savedImageName);
  const retrievalQuery = text.trim() ? text : "bird";

  const { citations, contextText, offlineMessage } = await search(
    retrievalQuery,
    retrievalK
  );

  const citationsText = citations
    .map((citation, index) => {
      const title = citation.title || "Untitled source";
      const snippet = citation.snippet ? ` - ${citation.snippet}` : "";
      return `[${index + 1}] ${title}${snippet}`;
    })
    .join("\n");

  let assistantText: string;
  try {
    const systemPrompt = buildRetrievalReply({
      contextText,
      citationsText,
      offlineMessage,
      usedFallbackQuery
    });

    assistantText = await chatWithLlama({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text || "Please describe the image."
        }
      ],
      maxTokens: Number(process.env.LLAMA_MAX_TOKENS ?? "512") || 512,
      temperature: Number(process.env.LLAMA_TEMPERATURE ?? "0.4") || 0.4
    });
  } catch (error) {
    const fallback = buildRetrievalStub({
      contextText,
      citationsText,
      offlineMessage,
      usedFallbackQuery
    });
    assistantText = `${fallback}\n\n(LLM fallback: ${
      error instanceof Error ? error.message : "Unknown error"
    })`;
  }
  const assistantMessageId = randomUUID();
  const assistantCreatedAt = Date.now();

  await db.insert(messages).values({
    id: assistantMessageId,
    conversationId: effectiveConversationId,
    role: "assistant",
    text: assistantText,
    imagePath: null,
    imageName: null,
    citationsJson: citations.length > 0 ? JSON.stringify(citations) : null,
    createdAt: assistantCreatedAt
  });

  const userMessage = await db
    .select()
    .from(messages)
    .where(eq(messages.id, userMessageId))
    .get();

  const assistantMessage = await db
    .select()
    .from(messages)
    .where(eq(messages.id, assistantMessageId))
    .get();

  if (!userMessage || !assistantMessage) {
    return NextResponse.json(
      { error: "Failed to persist messages." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    conversationId: effectiveConversationId,
    userMessage: toMessageDTO(userMessage),
    assistantMessage: toMessageDTO(assistantMessage)
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId")?.toString();

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required." },
      { status: 400 }
    );
  }

  const conversation = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .get();

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return NextResponse.json({
    conversationId,
    messages: rows.map(toMessageDTO)
  });
}
