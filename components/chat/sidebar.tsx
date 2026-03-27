"use client";

import { MessageCircle, Plus, Settings, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GenderSelector, type Gender } from "./gender-selector";

interface SidebarProps {
  onNewChat: () => void;
  isConnected: boolean;
  onlineCount: number;
  selectedGender: Gender;
  onGenderChange: (gender: Gender) => void;
}

export function ChatSidebar({ onNewChat, isConnected, onlineCount, selectedGender, onGenderChange }: SidebarProps) {
  return (
    <div className="w-20 md:w-72 h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-4 md:p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <span className="text-xl font-bold text-sidebar-foreground hidden md:block">
            ChatNova
          </span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-3 md:p-4">
        <Button
          onClick={onNewChat}
          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all font-semibold text-foreground"
        >
          <Plus className="w-5 h-5 md:mr-2" />
          <span className="hidden md:inline">Start New Chat</span>
        </Button>
      </div>

      {/* Gender Selection */}
      <div className="p-3 md:p-4 border-b border-sidebar-border">
        <GenderSelector selected={selectedGender} onSelect={onGenderChange} />
      </div>

      {/* Status Section */}
      <div className="flex-1 p-3 md:p-4">
        <div className="bg-sidebar-accent rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-muted-foreground"
              }`}
            />
            <span className="text-sm text-sidebar-foreground hidden md:block">
              {isConnected ? "Connected" : "Not Connected"}
            </span>
          </div>

          <div className="hidden md:block space-y-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Online Users</span>
              <span className="text-sidebar-foreground font-medium">
                {onlineCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Your Status</span>
              <span className="text-green-400 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 md:p-4 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-center md:justify-start h-11 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Settings className="w-5 h-5 md:mr-3" />
          <span className="hidden md:inline">Settings</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-center md:justify-start h-11 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <HelpCircle className="w-5 h-5 md:mr-3" />
          <span className="hidden md:inline">Help</span>
        </Button>
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-center md:justify-start h-11 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-5 h-5 md:mr-3" />
            <span className="hidden md:inline">Exit</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
