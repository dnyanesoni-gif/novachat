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

// Simulated stranger responses for demo
const STRANGER_RESPONSES = [
  "Hey! Nice to meet you!",
  "Hi there! How are you doing today?",
  "Hello! Where are you from?",
  "That's interesting! Tell me more.",
  "I agree with you on that!",
  "Haha, that's funny!",
  "Oh really? That's cool!",
  "Nice! What else do you like to do?",
  "I was just thinking about that too!",
  "That sounds amazing!",
];

export default function ChatPage() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(2847);
  const [selectedGender, setSelectedGender] = useState<Gender>("anyone");

  // Simulate online count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const startNewChat = useCallback(async () => {
  setMessages([]);
  setStatus("searching");
  setIsTyping(false);

  const userId = crypto.randomUUID();

  const { data, error } = await supabase.from("waiting_users").insert([
    {
      id: userId,
      gender: selectedGender,
      preference: "anyone",
    },
  ]);

  console.log("Inserted into waiting_users:", data, error);

  if (error) {
    console.error("Error adding user to waiting list:", error);
    setStatus("idle");
    return;
  }

  // Temporary fake connect after insert
  setTimeout(() => {
    setStatus("connected");
  }, 2000);
}, [selectedGender]);

  const endChat = useCallback(() => {
    setStatus("idle");
    setMessages([]);
    setIsTyping(false);
  }, []);

  const nextChat = useCallback(() => {
    startNewChat();
  }, [startNewChat]);

  const sendMessage = useCallback(
    (text: string) => {
      if (status !== "connected") return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Simulate stranger typing and response
      setIsTyping(true);

      const responseDelay = 1500 + Math.random() * 2000;
      setTimeout(() => {
        setIsTyping(false);

        // Small chance stranger disconnects
        if (Math.random() < 0.05) {
          setStatus("disconnected");
          return;
        }

        const strangerMessage: Message = {
          id: `stranger-${Date.now()}`,
          text: STRANGER_RESPONSES[
            Math.floor(Math.random() * STRANGER_RESPONSES.length)
          ],
          sender: "stranger",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, strangerMessage]);
      }, responseDelay);
    },
    [status]
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
      {/* Sidebar */}
      <ChatSidebar
        onNewChat={startNewChat}
        isConnected={status === "connected"}
        onlineCount={onlineCount}
        selectedGender={selectedGender}
        onGenderChange={setSelectedGender}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader status={status} onNextChat={nextChat} onEndChat={endChat} />

        {/* Chat Messages */}
        <ChatArea messages={messages} status={status} isTyping={isTyping} />

        {/* Input */}
        <MessageInput
          onSend={sendMessage}
          disabled={status !== "connected"}
          placeholder={getInputPlaceholder()}
        />
      </div>
    </div>
  );
}
