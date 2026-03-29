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
  const [isTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(2847);
  const [selectedGender, setSelectedGender] = useState<Gender>("anyone");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
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

      const formatted: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender === currentUserId ? "user" : "stranger",
        timestamp: new Date(msg.created_at),
      }));

      setMessages(formatted);
    },
    [currentUserId]
  );

  useEffect(() => {
    if (!currentRoomId) return;

    loadMessages(currentRoomId);

    const channel = supabase
      .channel(`messages-${currentRoomId}`)
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
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId, currentUserId, loadMessages]);

  useEffect(() => {
    if (!currentUserId || status !== "searching" || currentRoomId) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .or(`user1.eq.${currentUserId},user2.eq.${currentUserId}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error polling room:", error);
        return;
      }

      if (data && data.length > 0) {
        setCurrentRoomId(String(data[0].id));
        setStatus("connected");
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentUserId, status, currentRoomId]);

  const startNewChat = useCallback(async () => {
    if (!currentUserId) return;

    setMessages([]);
    setCurrentRoomId(null);
    setStatus("searching");

    // remove old waiting entry of this user
    await supabase.from("waiting_users").delete().eq("id", currentUserId);

    // check if someone else is waiting
    const { data: waitingUsers, error: waitingError } = await supabase
      .from("waiting_users")
      .select("*")
      .neq("id", currentUserId)
      .order("created_at", { ascending: true })
      .limit(1);

    if (waitingError) {
      console.error("Waiting fetch error:", waitingError);
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
        console.error("Room create error:", roomError);
        setStatus("idle");
        return;
      }

      await supabase.from("waiting_users").delete().eq("id", partner.id);

      if (roomData && roomData.length > 0) {
        setCurrentRoomId(String(roomData[0].id));
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
      console.error("Insert waiting user error:", insertError);
      setStatus("idle");
    }
  }, [currentUserId, selectedGender]);

  const endChat = useCallback(async () => {
    if (currentUserId) {
      await supabase.from("waiting_users").delete().eq("id", currentUserId);
    }

    setStatus("idle");
    setMessages([]);
    setCurrentRoomId(null);
  }, [currentUserId]);

  const nextChat = useCallback(async () => {
    await endChat();
    setTimeout(() => {
      startNewChat();
    }, 300);
  }, [endChat, startNewChat]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentRoomId || !currentUserId || status !== "connected") return;

      const { error } = await supabase.from("messages").insert([
        {
          room_id: currentRoomId,
          sender: currentUserId,
          message: text,
        },
      ]);

      if (error) {
        console.error("Message send error:", error);
      }
    },
    [currentRoomId, currentUserId, status]
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
