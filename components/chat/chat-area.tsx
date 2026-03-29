"use client";

import { useRef, useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

interface Message {
  id: string;
  text: string;
  sender: "user" | "stranger";
  timestamp: Date;
}

type ConnectionStatus = "idle" | "searching" | "connected" | "disconnected";

interface ChatAreaProps {
  messages: Message[];
  status: ConnectionStatus;
  isTyping: boolean;
}

export function ChatArea({ messages, status, isTyping }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  if (status === "idle") {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-8 bg-background overflow-hidden">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Ready to Chat?
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Click &quot;Start New Chat&quot; to connect with a random stranger
          from around the world.
        </p>
      </div>
    );
  }

  if (status === "searching") {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center p-8 bg-background overflow-hidden">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/30 animate-ping" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Finding Someone...
        </h2>
        <p className="text-muted-foreground">
          Connecting you with a stranger. Please wait...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4 bg-background"
    >
      {status === "connected" && messages.length === 0 && (
        <div className="text-center py-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            You are now connected with a stranger. Say hi!
          </span>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && <TypingIndicator />}

      {status === "disconnected" && (
        <div className="text-center py-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            Stranger has disconnected. Click Next to find someone new.
          </span>
        </div>
      )}
    </div>
  );
}
