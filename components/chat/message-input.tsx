"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMOJI_LIST = [
  "😊", "😂", "🥰", "😍", "🤗", "😎", "🤔", "😢",
  "😮", "🙄", "👍", "👎", "❤️", "🔥", "✨", "🎉",
  "👋", "🙏", "💪", "🤝", "👀", "💯", "⭐", "🌟",
];

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmojis(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage("");
    setShowEmojis(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="p-4 bg-card border-t border-border shrink-0">
      <form onSubmit={handleSubmit} className="relative" autoComplete="off">
        <div className="flex items-center gap-3">
          {/* Emoji Button */}
          <div className="relative" ref={emojiRef}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60 transition-all"
              onClick={() => setShowEmojis((prev) => !prev)}
            >
              <Smile className="w-5 h-5" />
            </Button>

            {/* Emoji Picker */}
            {showEmojis && (
              <div className="absolute bottom-16 left-0 w-[280px] rounded-2xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl p-3 z-50">
                <div className="mb-2 text-xs font-medium text-muted-foreground px-1">
                  Choose an emoji
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted transition-all text-2xl"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              className="w-full h-14 px-6 bg-input/70 border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5 text-foreground" />
          </Button>
        </div>
      </form>
    </div>
  );
}
