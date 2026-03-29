"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useCallback, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/sidebar";
import type { Gender } from "@/components/chat/gender-selector";
import { ChatHeader } from "@/components/chat/header";
import { ChatArea } from "@/components/chat/chat-area";
import { MessageInput } from "@/components/chat/message-input";

interface Message {
  id: string;
  text: string;
  sender: "user" | "stranger";
  timestamp: Date;
}

type ConnectionStatus = "idle" | "searching" | "connected" | "disconnected";

const TEST_ROOM_ID = "global-test-room-999";

export default function ChatPage() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(2847);
  const [selectedGender, setSelectedGender] = useState<Gender>("anyone");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    setCurrentUserId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", TEST_ROOM_ID)
      .order("created_at", { ascending: true });

    if (error) return;

    setMessages(
      (data || []).map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender === currentUserId ? "user" : "stranger",
        timestamp: new Date(msg.created_at),
      }))
    );
  }, [currentUserId]);

  useEffect(() => {
    if (status !== "connected") return;

    loadMessages();

    const channel = supabase
      .channel(`room-${TEST_ROOM_ID}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${TEST_ROOM_ID}`,
        },
        (payload) => {
          const msg = payload.new as any;

          const newMessage: Message = {
            id: msg.id,
            text: msg.message,
            sender: msg.sender === currentUserId ? "user" : "stranger",
            timestamp: new Date(msg.created_at),
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, currentUserId, loadMessages]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setStatus("searching");

    setTimeout(() => {
      setStatus("connected");
    }, 1000);
  }, []);

  const endChat = useCallback(() => {
    setStatus("idle");
    setMessages([]);
  }, []);

  const nextChat = useCallback(() => {
    startNewChat();
  }, [startNewChat]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (status !== "connected" || !currentUserId) return;

      await supabase.from("messages").insert([
        {
          room_id: TEST_ROOM_ID,
          sender: currentUserId,
          message: text,
        },
      ]);
    },
    [status, currentUserId]
  );

  const getInputPlaceholder = () => {
    switch (status) {
      case "idle":
        return "Start a chat to begin messaging...";
      case "searching":
        return "Finding someone to chat with...";
      default:
        return "Type your message...";
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <ChatSidebar
        onNewChat={startNewChat}
        isConnected={status === "connected"}
        onlineCount={onlineCount}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <ChatHeader status={status} onNextChat={nextChat} onEndChat={endChat} />
        <ChatArea messages={messages} status={status} isTyping={isTyping} />
        <MessageInput
          onSend={sendMessage}
          disabled={status !== "connected"}
          placeholder={getInputPlaceholder()}
        />
      </div>
    </div>
  );
}
