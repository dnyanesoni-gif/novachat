"use client";

import { User, Users } from "lucide-react";

export type Gender = "male" | "female" | "anyone";

interface GenderSelectorProps {
  selected: Gender;
  onSelect: (gender: Gender) => void;
}

const genderOptions: { value: Gender; label: string; icon: React.ReactNode }[] = [
  {
    value: "male",
    label: "Male",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="10" cy="14" r="5" />
        <path d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
      </svg>
    ),
  },
  {
    value: "female",
    label: "Female",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="5" />
        <path d="M12 13v8M9 18h6" />
      </svg>
    ),
  },
  {
    value: "anyone",
    label: "Anyone",
    icon: <Users className="w-5 h-5" />,
  },
];

export function GenderSelector({ selected, onSelect }: GenderSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
        <User className="w-4 h-4" />
        <span className="hidden md:inline">Looking for</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {genderOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`
              relative flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl
              transition-all duration-200 group
              ${
                selected === option.value
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 text-foreground"
                  : "bg-sidebar-accent/50 border border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }
            `}
          >
            <div
              className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                transition-colors duration-200
                ${
                  selected === option.value
                    ? "bg-gradient-to-br from-primary to-accent text-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                }
              `}
            >
              {option.icon}
            </div>
            <span className="hidden md:inline font-medium">{option.label}</span>
            
            {/* Selection indicator */}
            {selected === option.value && (
              <div className="absolute right-3 w-2 h-2 rounded-full bg-primary hidden md:block" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
