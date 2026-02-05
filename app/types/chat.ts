export type ChatRole = "user" | "assistant";

export type ComposerImage = {
  name: string;
  dataUrl: string;
  file: File;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string | null;
  imageUrl?: string;
  imageName?: string | null;
  createdAt: number;
};

export type ChatResponse = {
  conversationId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

export type ChatHistoryResponse = {
  conversationId: string;
  messages: ChatMessage[];
};

export type ConversationSummary = {
  id: string;
  createdAt: number;
  title: string;
  lastUpdatedAt: number;
};

export type ConversationsResponse = {
  conversations: ConversationSummary[];
};
