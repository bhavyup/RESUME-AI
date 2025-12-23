"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Command, ListOrdered, Minus, Plus } from "lucide-react";

interface AIGenerationSettingsProps {
  numPoints: number;
  customPrompt: string;
  onNumPointsChange: (value: number) => void;
  onCustomPromptChange: (value: string) => void;
  promptPlaceholder?: string;
}

export function AIGenerationSettings({
  numPoints,
  customPrompt,
  onNumPointsChange,
  onCustomPromptChange,
  promptPlaceholder = "e.g. Focus on leadership and metrics...",
}: AIGenerationSettingsProps) {
  // Handlers to ensure we stay within bounds (1-8)
  const handleIncrement = () => {
    if (numPoints < 8) onNumPointsChange(numPoints + 1);
  };

  const handleDecrement = () => {
    if (numPoints > 1) onNumPointsChange(numPoints - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      // Clamp value between 1 and 8
      if (val >= 1 && val <= 8) onNumPointsChange(val);
    }
  };

  return (
    <div className="space-y-4">
      {/* Number of Points Control */}
      <div className="flex items-center justify-between gap-4 p-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-slate-800/50 border border-slate-700/50">
            <ListOrdered className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div className="flex flex-col">
            <Label className="text-[11px] font-medium text-slate-200">
              Bullet Points
            </Label>
            <span className="text-[10px] text-slate-500">Quantity (1-8)</span>
          </div>
        </div>

        {/* CUSTOM NUMBER STEPPER */}
        <div className="flex items-center h-8 rounded-lg bg-slate-950/50 border border-slate-800 shadow-sm">
          {/* Minus Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={numPoints <= 1}
            className={cn(
              "h-full px-2 text-slate-400 hover:text-violet-300 hover:bg-slate-800/50 transition-colors",
              "disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed",
              "rounded-l-lg border-r border-slate-800"
            )}
          >
            <Minus className="h-3 w-3" />
          </button>

          {/* The Input (Spinners Hidden) */}
          <input
            type="number"
            min={1}
            max={8}
            value={numPoints}
            onChange={handleInputChange}
            className={cn(
              "w-10 h-full text-center bg-transparent border-none outline-none",
              "text-xs font-semibold text-slate-200",
              "focus:ring-0 placeholder:text-slate-700",
              // Hides the default browser spinners
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />

          {/* Plus Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={numPoints >= 8}
            className={cn(
              "h-full px-2 text-slate-400 hover:text-violet-300 hover:bg-slate-800/50 transition-colors",
              "disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed",
              "rounded-r-lg border-l border-slate-800"
            )}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Custom Prompt Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Command className="h-3 w-3 text-violet-400" />
          <Label className="text-[11px] font-medium text-slate-200">
            Custom Instructions
          </Label>
          <span className="text-[10px] text-slate-500 ml-auto italic">
            Optional
          </span>
        </div>

        <div className="relative group">
          <Textarea
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            placeholder={promptPlaceholder}
            className={cn(
              "min-h-[80px] w-full text-xs resize-none p-3",
              "bg-slate-950/30 backdrop-blur-sm",
              "border-slate-800/60",
              "text-slate-300 placeholder:text-slate-600",
              "focus:bg-slate-950/50 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/10",
              "group-hover:border-slate-700/80",
              "transition-all duration-200",
              "rounded-xl"
            )}
          />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500 -z-10" />
        </div>
      </div>
    </div>
  );
}
