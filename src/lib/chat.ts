import type { Message } from "../db/schema";
import { getImageUrl } from "./uploads";

export type MessageDTO = {
  id: string;
  role: "user" | "assistant";
  text: string | null;
  imageUrl?: string;
  imageName?: string | null;
  createdAt: number;
};

export function toMessageDTO(message: Message): MessageDTO {
  return {
    id: message.id,
    role: message.role,
    text: message.text ?? null,
    imageUrl: message.imagePath ? getImageUrl(message.imagePath) : undefined,
    imageName: message.imageName ?? null,
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
