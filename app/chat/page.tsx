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

  const startNewChat = useCallback(async () => {
    if (!currentUserId) {
      alert("No current user id");
      return;
    }

    alert("Start chat clicked");

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
      alert("Fetch waiting users error: " + fetchError.message);
      console.error(fetchError);
      setStatus("idle");
      return;
    }

    alert("Waiting users found: " + (waitingUsers?.length || 0));

    if (waitingUsers && waitingUsers.length > 0) {
      const partner = waitingUsers[0];
      alert("Partner found: " + partner.id);

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
        alert("Room create error: " + roomError.message);
        console.error(roomError);
        setStatus("idle");
        return;
      }

      alert("Room created");

      const { error: deleteError } = await supabase
        .from("waiting_users")
        .delete()
        .eq("id", partner.id);

      if (deleteError) {
        alert("Delete waiting user error: " + deleteError.message);
        console.error(deleteError);
      } else {
        alert("Waiting user deleted");
      }

      if (roomData && roomData.length > 0) {
        setCurrentRoomId(roomData[0].id);
        setStatus("connected");
        alert("Connected!");
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
      alert("Insert waiting user error: " + insertError.message);
      console.error(insertError);
      setStatus("idle");
      return;
    }

    alert("User added to waiting list");
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

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      const { error } = await supabase.from("messages").insert([
        {
          room_id: currentRoomId,
          sender: currentUserId,
          message: text,
        },
      ]);

      if (error) {
        alert("Message insert error: " + error.message);
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
