import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/src/db";
import { conversations, messages } from "@/src/db/schema";
import { buildStubAssistantReply, toMessageDTO } from "@/src/lib/chat";
import { saveUploadedImage, validateImageFile } from "@/src/lib/uploads";

export const runtime = "nodejs";

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

  // TODO: Replace this stub with the VLM + RAG pipeline.
  const assistantText = buildStubAssistantReply(text, savedImageName);
  const assistantMessageId = randomUUID();
  const assistantCreatedAt = Date.now();

  await db.insert(messages).values({
    id: assistantMessageId,
    conversationId: effectiveConversationId,
    role: "assistant",
    text: assistantText,
    imagePath: null,
    imageName: null,
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
