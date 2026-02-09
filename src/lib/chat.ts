import type { Message } from "../db/schema";
import { getImageUrl } from "./uploads";

export type Citation = {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  score?: number;
};

export type MessageDTO = {
  id: string;
  role: "user" | "assistant";
  text: string | null;
  imageUrl?: string;
  imageName?: string | null;
  citations?: Citation[];
  createdAt: number;
};

function parseCitations(raw: string | null | undefined): Citation[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed.filter((item) => item && typeof item === "object");
  } catch {
    return undefined;
  }
}

export function toMessageDTO(message: Message): MessageDTO {
  return {
    id: message.id,
    role: message.role,
    text: message.text ?? null,
    imageUrl: message.imagePath ? getImageUrl(message.imagePath) : undefined,
    imageName: message.imageName ?? null,
    citations: message.citationsJson ? parseCitations(message.citationsJson) : undefined,
    createdAt: message.createdAt
  };
}

export function buildStubAssistantReply(text: string, imageName?: string | null) {
  const snippet = text.trim().slice(0, 120);
  const base = snippet ? `Got it. (stub response) You said: ${snippet}` : "Got it. (stub response)";
  if (imageName) {
    return `${base} I received an image named ${imageName}.`;
  }
  return base;
}
