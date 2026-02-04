import { useEffect, useState } from "react";
import type { ChatMessage } from "../types/chat";
import { formatTimestamp } from "../lib/formatTimestamp";

const roleStyles: Record<ChatMessage["role"], string> = {
  user:
    "bg-neutral-100 text-neutral-900 ml-auto border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700",
  assistant: "text-ink-900 mr-auto -ml-3 dark:text-ink-50"
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!message.text) return;
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message.text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={
          "max-w-[80%] rounded-2xl px-4 py-3 " + roleStyles[message.role]
        }
        aria-label={
          message.role === "user" ? "User message" : "Assistant message"
        }
      >
        {message.text && (
          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.text}
          </p>
        )}
        {message.image && (
          <div className="mt-3 overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
            <img
              src={message.image.dataUrl}
              alt={message.image.name}
              className="max-h-64 w-full object-cover"
            />
          </div>
        )}
      </div>
      <div
        className={
          "flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400 " +
          (message.role === "user" ? "ml-auto" : "mr-auto, -mt-2")
        }
      >
        <span className="sr-only">{formatTimestamp(message.createdAt)}</span>
        {message.role === "assistant" && message.text && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-50 text-ink-700 hover:bg-ink-100 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800"
              aria-label="Copy response"
              title="Copy response"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill={copied ? "#000000" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <mask id="copy-mask">
                  <rect x="0" y="0" width="24" height="24" fill="white" />
                  <rect x="10" y="4" width="10" height="10" rx="2" fill="black" />
                </mask>
                <rect
                  x="6"
                  y="8"
                  width="10"
                  height="10"
                  rx="2"
                  mask="url(#copy-mask)"
                />
                <rect x="10" y="4" width="10" height="10" rx="2" />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-50 text-ink-700 hover:bg-ink-100 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800"
              aria-label="Thumbs up"
              title="Thumbs up"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 10v10H4V10h3Z" />
                <path d="M7 10l4-6a2 2 0 0 1 2-.9l1 .2a2 2 0 0 1 1.6 2.3L14 10h4a2 2 0 0 1 2 2l-1 6a2 2 0 0 1-2 1H7" />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-50 text-ink-700 hover:bg-ink-100 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800"
              aria-label="Thumbs down"
              title="Thumbs down"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 14V4H4v10h3Z" />
                <path d="M7 14l4 6a2 2 0 0 0 2 .9l1-.2a2 2 0 0 0 1.6-2.3L14 14h4a2 2 0 0 0 2-2l-1-6a2 2 0 0 0-2-1H7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
