import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Star, Briefcase, FileSearch } from "lucide-react";

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    text: "Rate my Resume out of 10",
    icon: Star,
  },
  {
    text: "Improve the work experience section",
    icon: Briefcase,
  },
  {
    text: "Critique my resume",
    icon: FileSearch,
  },
];

export function QuickSuggestions({ onSuggestionClick }: QuickSuggestionsProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 flex-1 h-full min-h-[300px]">
      {/* Header with Terminal Aesthetic */}
      <div className="relative">
        <div className={cn(
          "flex items-center gap-3 px-6 py-3",
          "bg-slate-950/80 backdrop-blur-sm",
          "border border-cyan-500/50",
          "shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]"
        )}>
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
          
          <Bot className="h-4 w-4 text-cyan-400" />
          <p className="text-sm text-cyan-300 font-mono uppercase tracking-wider">
            {"// Initialize Query //"}
          </p>
        </div>
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
        </div>
      </div>

      {/* Command Buttons */}
      <div className="flex flex-wrap justify-center gap-3 max-w-[600px]">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={suggestion.text}
              variant="ghost"
              onClick={() => onSuggestionClick(suggestion.text)}
              className={cn(
                "relative group",
                "h-auto px-4 py-3 rounded-none",
                "bg-slate-900/80 backdrop-blur-sm",
                "text-cyan-300 text-xs font-mono uppercase tracking-wider",
                "border border-cyan-500/50",
                "hover:bg-cyan-950/80 hover:border-cyan-400 hover:text-cyan-100",
                "hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]",
                "transition-all duration-300",
                "overflow-hidden"
              )}
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
              
              {/* Content */}
              <div className="relative flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{suggestion.text}</span>
              </div>
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          );
        })}
      </div>
    </div>
  );
} 