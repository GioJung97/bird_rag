export type ChatRole = "user" | "assistant";

export type ChatImage = {
  name: string;
  dataUrl: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  image?: ChatImage;
  createdAt: number;
};
