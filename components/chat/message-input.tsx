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
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 bg-card border-t border-border">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3">
          {/* Emoji Button */}
          <div className="relative" ref={emojiRef}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Smile className="w-5 h-5" />
            </Button>

            {/* Emoji Picker */}
            {showEmojis && (
              <div className="absolute bottom-12 left-0 bg-popover border border-border rounded-xl p-3 shadow-xl z-50">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors text-lg"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full h-12 px-5 bg-input border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5 text-foreground" />
          </Button>
        </div>
      </form>
    </div>
  );
}
