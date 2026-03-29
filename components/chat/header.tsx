"use client";

import { SkipForward, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConnectionStatus = "idle" | "searching" | "connected" | "disconnected";

interface ChatHeaderProps {
  status: ConnectionStatus;
  onNextChat: () => void;
  onEndChat: () => void;
}

export function ChatHeader({ status, onNextChat, onEndChat }: ChatHeaderProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "searching":
        return {
          text: "Finding someone...",
          color: "bg-yellow-500",
          animate: true,
        };
      case "connected":
        return {
          text: "Stranger Connected",
          color: "bg-green-500",
          animate: true,
        };
      case "disconnected":
        return {
          text: "Stranger Disconnected",
          color: "bg-red-500",
          animate: false,
        };
      default:
        return {
          text: "Not Connected",
          color: "bg-muted-foreground",
          animate: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="h-16 shrink-0 px-4 md:px-6 flex items-center justify-between bg-card border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${statusInfo.color} ${
                statusInfo.animate ? "animate-pulse" : ""
              }`}
            />
            <span className="font-medium text-foreground truncate">
              {statusInfo.text}
            </span>
          </div>
          {status === "connected" && (
            <span className="text-xs text-muted-foreground">
              Anonymous User
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={onNextChat}
          variant="outline"
          size="sm"
          className="h-9 px-4 border-border hover:bg-muted text-foreground"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Next</span>
        </Button>
        <Button
          onClick={onEndChat}
          variant="outline"
          size="sm"
          className="h-9 px-4 border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <X className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">End</span>
        </Button>
      </div>
    </div>
  );
}
