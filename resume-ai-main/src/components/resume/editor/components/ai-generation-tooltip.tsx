"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Loader2, Sparkles, Settings2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIGenerationSettings } from "../../shared/ai-generation-settings";

interface AIGenerationTooltipProps {
  index: number;
  loadingAI: boolean;
  generateAIPoints: (index: number) => void;
  aiConfig: { numPoints: number; customPrompt: string };
  onNumPointsChange: (value: number) => void;
  onCustomPromptChange: (value: string) => void;
  // Removed complex colorClass prop in favor of internal consistent styling
  className?: string;
}

export function AIGenerationSettingsTooltip({
  index,
  loadingAI,
  generateAIPoints,
  aiConfig,
  onNumPointsChange,
  onCustomPromptChange,
  className,
}: AIGenerationTooltipProps) {
  const currentCount = aiConfig?.numPoints || 3;

  return (
    <div className={cn("flex items-center gap-1 group/ai", className)}>
      {/* 1. Primary Action Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => generateAIPoints(index)}
        disabled={loadingAI}
        className={cn(
          "flex-1 h-9 relative overflow-hidden transition-all duration-300",
          "bg-slate-900 border-violet-500/30 text-violet-300",
          "hover:bg-violet-950/30 hover:border-violet-500/60 hover:text-violet-100",
          "rounded-l-xl rounded-r-md", // Asymmetric rounding for split feel
          "shadow-[0_0_15px_-3px_rgba(124,58,237,0.1)] hover:shadow-[0_0_20px_-3px_rgba(124,58,237,0.3)]"
        )}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent translate-x-[-100%] group-hover/ai:translate-x-[100%] transition-transform duration-1000" />

        {loadingAI ? (
          <>
            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-violet-400" />
            <span className="text-xs font-medium">Writing...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 mr-2 text-violet-400 fill-violet-400/20" />
            <span className="text-xs font-medium">
              Auto-Write ({currentCount})
            </span>
          </>
        )}
      </Button>

      {/* 2. Settings Trigger (Split Button) */}
      <TooltipProvider delayDuration={1000}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={loadingAI}
              className={cn(
                "h-9 w-8 shrink-0",
                "bg-slate-900 border-violet-500/30 text-violet-400",
                "hover:bg-violet-950/30 hover:border-violet-500/60 hover:text-white",
                "rounded-l-md rounded-r-xl", // Mates with the left button
                "transition-all duration-300"
              )}
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>

          <TooltipContent
            side="bottom"
            align="end"
            sideOffset={5}
            className={cn(
              "w-80 p-0 overflow-hidden",
              "bg-slate-950/95 backdrop-blur-xl",
              "border border-violet-500/30",
              "shadow-2xl shadow-black/50",
              "rounded-xl",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
            )}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-violet-500/5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                AI Configuration
              </span>
            </div>

            {/* Content Body */}
            <div className="p-4">
              <AIGenerationSettings
                numPoints={currentCount}
                customPrompt={aiConfig?.customPrompt || ""}
                onNumPointsChange={onNumPointsChange}
                onCustomPromptChange={onCustomPromptChange}
              />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
