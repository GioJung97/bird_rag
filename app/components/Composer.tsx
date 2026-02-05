"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { useRef } from "react";
import type { ComposerImage } from "../types/chat";

type ComposerProps = {
  value: string;
  image?: ComposerImage;
  error?: string;
  isSending?: boolean;
  onValueChange: (value: string) => void;
  onImageSelected: (file: File) => void;
  onRemoveImage: () => void;
  onSend: () => void;
};

export function Composer({
  value,
  image,
  error,
  isSending,
  onValueChange,
  onImageSelected,
  onRemoveImage,
  onSend
}: ComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isSending) {
        onSend();
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-ink-50 px-6 py-5 mb-4 rounded-2xl dark:bg-ink-900">
      <div className="flex flex-col gap-3">
        {image && (
          <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-700 dark:bg-ink-800">
            <img
              src={image.dataUrl}
              alt={image.name}
              className="h-14 w-14 rounded-lg object-cover"
            />
            <div className="flex-1 text-sm text-ink-700 dark:text-ink-100">
              <p className="truncate">{image.name}</p>
            </div>
            <button
              type="button"
              onClick={onRemoveImage}
              className="rounded-full border border-ink-200 px-2 py-1 text-xs text-ink-600 hover:bg-white dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-700"
              aria-label="Remove image"
            >
              X
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <label
              className="absolute left-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-2xl text-ink-700 leading-none hover:bg-ink-100 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800"
              aria-label="Upload image"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="block leading-none -translate-y-px">+</span>
            </label>
            <textarea
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Type a message..."
              className="w-full resize-none rounded-3xl border border-ink-200 bg-white px-12 py-4 text-sm text-ink-900 shadow-sm focus:border-ink-400 focus:outline-none dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50"
              aria-label="Message input"
            />
          </div>
          <button
            type="button"
            onClick={onSend}
            className="self-center rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-300 dark:bg-ink-50 dark:text-ink-900 dark:hover:bg-ink-200 dark:disabled:bg-ink-700"
            aria-label="Send message"
            disabled={isSending || (value.trim().length === 0 && !image)}
          >
            {isSending ? "Sending" : "Send"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
