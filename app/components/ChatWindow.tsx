"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/chat";
import { MessageBubble } from "./MessageBubble";

export function ChatWindow({ messages }: { messages: ChatMessage[] }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-4 py-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-ink-400 dark:text-ink-500">
          Start a conversation.
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
