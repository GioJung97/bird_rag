"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../types/chat";
import { MessageBubble } from "./MessageBubble";

const SCROLL_BOTTOM_THRESHOLD = 40;

export function ChatWindow({
  messages,
  isLoading
}: {
  messages: ChatMessage[];
  isLoading?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const lastMessageKey = useMemo(() => {
    if (messages.length === 0) return "empty";
    const last = messages[messages.length - 1];
    return `${last.id}-${messages.length}`;
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const distanceFromBottom =
          doc.scrollHeight - window.scrollY - window.innerHeight;
        const atBottom = distanceFromBottom < SCROLL_BOTTOM_THRESHOLD;
        setIsAtBottom(atBottom);
        setShowJumpButton(!atBottom && messages.length > 0);
        if (atBottom) {
          setUnreadCount(0);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [messages.length]);

  const handleScrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0) {
      setShowJumpButton(false);
      setUnreadCount(0);
      return;
    }
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      setShowJumpButton(false);
      setUnreadCount(0);
    } else {
      setShowJumpButton(true);
      setUnreadCount((count) => count + 1);
    }
  }, [lastMessageKey, isAtBottom, messages.length]);

  return (
    <div className="relative flex min-h-0 flex-1">
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-400 dark:text-ink-500">
            {isLoading ? "Loading conversation..." : "Start a conversation."}
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      {showJumpButton && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center">
          <button
            type="button"
            onClick={handleScrollToBottom}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-4 py-2 text-sm font-semibold text-ink-800 shadow-lg backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-ink-400/70 dark:border-ink-700 dark:bg-ink-900/90 dark:text-ink-100 dark:hover:bg-ink-900"
            aria-label="Scroll to latest message"
          >
            Jump to latest
          </button>
        </div>
      )}
    </div>
  );
}
