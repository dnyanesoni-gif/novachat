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

export default function ChatPage() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(2847);
  const [selectedGender, setSelectedGender] = useState<Gender>("anyone");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userId = crypto.randomUUID();
    setCurrentUserId(userId);
  }, []);

  const loadMessages = useCallback(
    async (roomId: string) => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender === currentUserId ? "user" : "stranger",
        timestamp: new Date(msg.created_at),
      }));

      setMessages(formattedMessages);
    },
    [currentUserId]
  );

  useEffect(() => {
    if (!currentRoomId) return;

    loadMessages(currentRoomId);

    const channel = supabase
      .channel(`room-${currentRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${currentRoomId}`,
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
            const alreadyExists = prev.some((m) => m.id === newMessage.id);
            if (alreadyExists) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId, currentUserId, loadMessages]);

  const startNewChat = useCallback(async () => {
    if (!currentUserId) return;

    setMessages([]);
    setStatus("searching");
    setIsTyping(false);
    setCurrentRoomId(null);

    const { data: waitingUsers, error: fetchError } = await supabase
      .from("waiting_users")
      .select("*")
      .neq("id", currentUserId)
      .limit(1);

    if (fetchError) {
      console.error("Error fetching waiting users:", fetchError);
      setStatus("idle");
      return;
    }

    if (waitingUsers && waitingUsers.length > 0) {
      const partner = waitingUsers[0];

      const { data: roomData, error: roomError } = await supabase
        .from("chat_rooms")
        .insert([
          {
            user1: partner.id,
            user2: currentUserId,
          },
        ])
        .select();

      if (roomError) {
        console.error("Error creating room:", roomError);
        setStatus("idle");
        return;
      }

      const { error: deleteError } = await supabase
        .from("waiting_users")
        .delete()
        .eq("id", partner.id);

      if (deleteError) {
        console.error("Error deleting waiting user:", deleteError);
      }

      if (roomData && roomData.length > 0) {
        setCurrentRoomId(roomData[0].id);
        setStatus("connected");
      }

      return;
    }

    const { error: insertError } = await supabase.from("waiting_users").insert([
      {
        id: currentUserId,
        gender: selectedGender,
        preference: "anyone",
      },
    ]);

    if (insertError) {
      console.error("Error adding waiting user:", insertError);
      setStatus("idle");
      return;
    }
  }, [selectedGender, currentUserId]);

  const endChat = useCallback(() => {
    setStatus("idle");
    setMessages([]);
    setIsTyping(false);
    setCurrentRoomId(null);
  }, []);

  const nextChat = useCallback(() => {
    startNewChat();
  }, [startNewChat]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (status !== "connected" || !currentRoomId || !currentUserId) return;

      const { error } = await supabase.from("messages").insert([
        {
          room_id: currentRoomId,
          sender: currentUserId,
          message: text,
        },
      ]);

      if (error) {
        console.error("Error sending message:", error);
      }
    },
    [status, currentRoomId, currentUserId]
  );

  const getInputPlaceholder = () => {
    switch (status) {
      case "idle":
        return "Start a chat to begin messaging...";
      case "searching":
        return "Finding someone to chat with...";
      case "disconnected":
        return "Stranger disconnected. Click Next to find someone new.";
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

      <div className="flex-1 flex flex-col min-w-0">
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
