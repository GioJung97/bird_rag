import { useEffect, useState } from "react";
import type { ChatMessage } from "../types/chat";
import { formatTimestamp } from "../lib/formatTimestamp";

const roleStyles: Record<ChatMessage["role"], string> = {
  user:
    "bg-neutral-100 text-neutral-900 ml-auto mr-2 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700",
  assistant: "text-ink-900 mr-auto ml-0 dark:text-ink-50"
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
          "max-w-[80%] rounded-2xl px-4 py-3 " +
          roleStyles[message.role] +
          (message.isPending ? " opacity-70" : "")
        }
        aria-label={
          message.role === "user" ? "User message" : "Assistant message"
        }
      >
        {message.text && (
          <p
            className={
              "whitespace-pre-wrap text-sm leading-6 " +
              (message.isPending ? "text-ink-500 dark:text-ink-400" : "")
            }
          >
            {message.isPending ? (
              <>
                Loading<span className="loading-dots" aria-hidden />
                <span className="sr-only">Loading...</span>
              </>
            ) : (
              message.text
            )}
          </p>
        )}
        {message.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
            <img
              src={message.imageUrl}
              alt={message.imageName ?? "Uploaded image"}
              className="max-h-64 w-full object-cover"
            />
          </div>
        )}
        {message.role === "assistant" &&
          message.citations &&
          message.citations.length > 0 && (
            <div className="mt-4 rounded-xl border border-ink-200 bg-white/70 p-3 text-xs text-ink-700 dark:border-ink-700 dark:bg-ink-900/70 dark:text-ink-200">
              <p className="font-semibold text-ink-900 dark:text-ink-50">
                Sources
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {message.citations.map((citation, index) => (
                  <div
                    key={citation.id ?? `${message.id}-citation-${index}`}
                    className="flex flex-col gap-1"
                  >
                    {citation.url ? (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-900 underline underline-offset-2 hover:text-ink-600 dark:text-ink-50 dark:hover:text-ink-200"
                      >
                        {index + 1}. {citation.title}
                      </a>
                    ) : (
                      <p className="text-ink-900 dark:text-ink-50">
                        {index + 1}. {citation.title}
                      </p>
                    )}
                    {citation.snippet && (
                      <p className="text-ink-600 dark:text-ink-300">
                        {citation.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
      <div
        className={
          "flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400 " +
          (message.role === "user" ? "ml-auto" : "mr-auto -mt-2 ml-5")
        }
      >
        <span className="sr-only">{formatTimestamp(message.createdAt)}</span>
        {message.role === "assistant" && message.text && !message.isPending && (
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
                fill={copied ? "currentColor" : "none"}
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
