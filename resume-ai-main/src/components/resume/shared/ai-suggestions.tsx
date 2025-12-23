'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, X, Wand2 } from "lucide-react";
import Tiptap from "@/components/ui/tiptap";

interface AISuggestion {
  id: string;
  point: string;
}

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onApprove: (suggestion: AISuggestion) => void;
  onDelete: (suggestionId: string) => void;
}

export function AISuggestions({ suggestions, onApprove, onDelete }: AISuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="relative mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Wand2 className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <span className="text-xs font-semibold text-violet-300 uppercase tracking-wide">
          AI Suggested Points ({suggestions.length})
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-violet-500/20 to-transparent" />
      </div>

      {/* Grid Layout for Suggestions */}
      <div className="grid gap-3">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id} 
            className={cn(
              "group relative overflow-hidden",
              "rounded-xl border border-slate-700/50",
              "bg-slate-900/40 backdrop-blur-sm",
              "transition-all duration-300",
              "hover:border-violet-500/30 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-violet-900/10"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

            <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 p-1">
              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <Tiptap
                  content={suggestion.point}
                  onChange={() => {}}
                  readOnly={true}
                  className={cn(
                    "min-h-[60px] text-sm px-3 py-2",
                    "bg-transparent border-none shadow-none",
                    "text-slate-300",
                    "[&_.ProseMirror]:px-0 [&_.ProseMirror]:py-1" // Remove default Tiptap padding
                  )}
                />
              </div>

              {/* Action Buttons (Vertical on Desktop, Horizontal on Mobile) */}
              <div className="flex sm:flex-col items-center gap-1 p-2 sm:border-l sm:border-slate-800/50 bg-slate-900/30 sm:bg-transparent">
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onApprove(suggestion)}
                  className={cn(
                    "h-8 w-full sm:w-8 rounded-lg flex-1 sm:flex-none",
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                    "hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30",
                    "transition-all duration-200"
                  )}
                  title="Accept Suggestion"
                >
                  <Check className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(suggestion.id)}
                  className={cn(
                    "h-8 w-full sm:w-8 rounded-lg flex-1 sm:flex-none",
                    "bg-slate-800/50 text-slate-400 border border-slate-700/50",
                    "hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30",
                    "transition-all duration-200"
                  )}
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>

              </div>
            </div>
            
            {/* AI Badge Overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <Sparkles className="h-3 w-3 text-violet-500/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}