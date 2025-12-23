"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Loader2,
  Wand2,
  TrendingUp,
  Scissors,
  Hash,
  Zap,
  X,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AIImprovementPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  hideSubmitButton?: boolean;
}

export function AIImprovementPrompt({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Describe how you want to improve this...",
  hideSubmitButton = false,
}: AIImprovementPromptProps) {
  const maxLength = 300;
  const currentLength = (value || "").length;
  const isOverLimit = currentLength > maxLength;

  const presets = [
    {
      label: "More Impactful",
      text: "Make this more impact-oriented with measurable results.",
      icon: TrendingUp,
    },
    {
      label: "Shorten",
      text: "Shorten and make it more concise.",
      icon: Scissors,
    },
    {
      label: "Add Metrics",
      text: "Add numbers and quantitative metrics where possible.",
      icon: Hash,
    },
    {
      label: "Action Verbs",
      text: "Use strong action-oriented language and powerful verbs.",
      icon: Zap,
    },
  ];

  const applyPreset = (p: string) => {
    // Append or replace logic - usually for a prompt we might just append if empty,
    // or maybe the user wants to combine instructions.
    // Let's stick to appending if there is text, but handle spacing cleanly.
    const cleanValue = value?.trim();
    const next = cleanValue ? `${cleanValue} ${p}` : p;
    onChange(next.slice(0, maxLength));
  };

  return (
    <div className="space-y-3 w-full max-w-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-violet-300">
          <Wand2 className="w-3.5 h-3.5" />
          <Label className="text-[11px] font-semibold tracking-wide uppercase">
            AI Instructions
          </Label>
        </div>

        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            className="h-5 w-5 rounded-full text-slate-500 hover:text-white hover:bg-white/10"
            title="Clear prompt"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Input Area */}
      <div className="relative group">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "min-h-[80px] w-full text-sm resize-none",
            "bg-slate-950/50 backdrop-blur-md",
            "border-slate-800/60 group-hover:border-slate-700/80",
            "rounded-xl px-3 py-3",
            "text-slate-200 placeholder:text-slate-500/70",
            "focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 focus:bg-slate-900/80",
            "transition-all duration-300"
          )}
        />

        {/* Character Count Indicator */}
        <div
          className={cn(
            "absolute bottom-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded-md transition-colors",
            isOverLimit
              ? "bg-red-500/20 text-red-400"
              : "bg-black/20 text-slate-500",
            "backdrop-blur-sm"
          )}
        >
          {currentLength}/{maxLength}
        </div>
      </div>

      {/* Presets Chips */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-slate-500 font-medium px-1 uppercase tracking-wider">
          Quick Actions
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.text)}
              className={cn(
                "group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                "text-[10px] font-medium border transition-all duration-200",
                // Default State
                "bg-slate-800/40 border-slate-700/50 text-slate-400",
                // Hover State
                "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300 hover:shadow-[0_0_10px_-3px_rgba(139,92,246,0.3)]",
                // Active/Focus (optional feel)
                "active:scale-95"
              )}
            >
              <p.icon className="w-3 h-3 opacity-70 group-hover:opacity-100 group-hover:text-violet-400 transition-colors" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      {!hideSubmitButton && onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className={cn(
            "w-full h-9 rounded-xl text-xs font-semibold tracking-wide",
            "bg-gradient-to-r from-violet-600 to-indigo-600",
            "hover:from-violet-500 hover:to-indigo-500",
            "border border-white/10",
            "shadow-[0_4px_12px_-4px_rgba(124,58,237,0.5)]",
            "hover:shadow-[0_4px_20px_-4px_rgba(124,58,237,0.6)]",
            "hover:-translate-y-0.5",
            "disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0",
            "transition-all duration-300"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-white/70" />
              <span className="text-white/90">Optimizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-2 text-violet-100 fill-violet-100/20" />
              <span className="text-white">Generate Improvements</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
