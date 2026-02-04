"use client";

import { useMemo, useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { Composer } from "./components/Composer";
import { ThemeToggle } from "./components/ThemeToggle";
import type { ChatImage, ChatMessage } from "./types/chat";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [value, setValue] = useState("");
  const [image, setImage] = useState<ChatImage | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const hasMessages = messages.length > 0;

  const canSend = useMemo(
    () => value.trim().length > 0 || Boolean(image),
    [value, image]
  );

  const handleImageSelected = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image is too large. Please select a file under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImage({ name: file.name, dataUrl: result });
        setError(undefined);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    setError(undefined);
  };

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      text: value.trim(),
      image,
      createdAt: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setValue("");
    setImage(undefined);
    setError(undefined);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        text: "Got it. (stub response)",
        createdAt: Date.now()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50 transition-colors duration-200 ease-out dark:bg-ink-900">
      <header className="border-b border-ink-200 bg-white px-6 py-4 dark:border-ink-800 dark:bg-ink-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <h1 className="text-lg font-semibold text-ink-900 dark:text-ink-50">Bird Chat</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col">
          {hasMessages ? (
            <>
              <div className="flex-1">
                <ChatWindow messages={messages} />
              </div>
              <div className="transition-transform duration-800 ease-out translate-y-0">
                <Composer
                  value={value}
                  image={image}
                  error={error}
                  onValueChange={setValue}
                  onImageSelected={handleImageSelected}
                  onRemoveImage={handleRemoveImage}
                  onSend={handleSend}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="-translate-y-24">
                <p className="text-3xl font-semibold text-ink-900 dark:text-ink-50">
                  Let&#39;s talk about birds!
                </p>
                <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
                  Please upload the image of the bird if you need.
                </p>
              </div>
              <div className="mt-4 w-full transition-transform duration-800 ease-out -translate-y-24">
                <Composer
                  value={value}
                  image={image}
                  error={error}
                  onValueChange={setValue}
                  onImageSelected={handleImageSelected}
                  onRemoveImage={handleRemoveImage}
                  onSend={handleSend}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
