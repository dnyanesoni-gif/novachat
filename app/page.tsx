"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30" />

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <span className="text-3xl font-bold text-foreground">ChatNova</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
          Talk to Strangers{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Instantly
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
          Connect with people worldwide in seconds. Anonymous, fast, and simple.
        </p>

        {/* CTA Button */}
        <Link href="/chat">
          <Button
            size="lg"
            className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Chatting
          </Button>
        </Link>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-12 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">2,847 online</span>
          </div>
          <div className="text-sm">100% Anonymous</div>
          <div className="text-sm">No Sign-up</div>
        </div>
      </div>
    </div>
  );
}
