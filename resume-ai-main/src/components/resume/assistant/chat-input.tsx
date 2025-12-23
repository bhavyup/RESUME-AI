import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useCallback, useRef, useEffect } from "react";

interface ChatInputProps {
  isLoading: boolean;
  onSubmit: (message: string) => void;
  onStop: () => void;
  disabled?: boolean; // This prop is now used
}

export default function ChatInput({
  isLoading,
  onSubmit,
  onStop,
  disabled = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxHeight = window.innerHeight * 0.3;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Prevent submission if disabled
      if (disabled || isLoading) return;

      if (inputValue.trim()) {
        const cleanedMessage = inputValue.replace(/\n+$/, "").trim();
        onSubmit(cleanedMessage);
        setInputValue("");
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
          }
        }, 0);
      }
    },
    [inputValue, onSubmit, disabled, isLoading]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative z-10",
        "p-4 border-t-2 border-cyan-500/30",
        "bg-black/90",
        "backdrop-blur-sm",
        // Add visual indication when disabled
        disabled && "opacity-75 grayscale-[0.5]"
      )}
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
      <div className="absolute bottom-[0.5px] left-[0.5px] rounded-bl-lg w-4 h-4 border-b-2 border-l-2 border-cyan-400/50" />
      <div className="absolute bottom-[0.5px] right-[0.5px] rounded-br-lg w-4 h-4 border-b-2 border-r-2 border-cyan-400/50" />

      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

      <div className="relative flex gap-3 items-end">
        <div className="flex-1 relative">
          {/* Terminal Prompt Indicator */}
          <div
            className={cn(
              "absolute left-3 top-3 font-mono text-sm pointer-events-none z-10",
              disabled ? "text-slate-500" : "text-cyan-400"
            )}
          >
            &gt;
          </div>

          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            // Disable input when waiting for user action or loading
            disabled={disabled || isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                } else {
                  requestAnimationFrame(adjustTextareaHeight);
                }
              }
            }}
            // Change placeholder based on state
            placeholder={
              disabled ? "PENDING ACTION REQUIRED..." : "ENTER QUERY..."
            }
            rows={1}
            className={cn(
              "w-full rounded-none",
              "bg-slate-950/80 backdrop-blur-sm",
              "border border-cyan-500/50",
              "focus:border-cyan-400",
              "focus:ring-1 focus:ring-cyan-500/30",
              "focus:outline-none",
              "placeholder:text-slate-600 placeholder:font-mono placeholder:uppercase placeholder:tracking-wider",
              "text-cyan-100 text-sm font-mono",
              "pl-8 pr-3 py-3",
              "min-h-[48px]",
              "resize-none",
              "overflow-y-auto",
              "transition-all duration-200",
              "shadow-[0_0_15px_-5px_rgba(6,182,212,0.2)]",
              "hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]",
              // Disabled styles
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{
              maxHeight: "30vh",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          />

          <style jsx>{`
            textarea::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        <Button
          type={isLoading ? "button" : "submit"}
          onClick={isLoading ? onStop : undefined}
          // Disable button if 'disabled' prop is true AND we aren't loading (so we can't send new messages)
          // But always allow stopping if loading.
          disabled={disabled && !isLoading}
          size="icon"
          className={cn(
            "h-12 w-12 rounded-none shrink-0 relative overflow-hidden",
            "border transition-all duration-300",
            // Styles when disabled
            disabled && !isLoading
              ? [
                  "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50",
                ]
              : isLoading
              ? [
                  "bg-red-950/50 text-red-300",
                  "border-red-500/50",
                  "hover:bg-red-900/50 hover:border-red-400",
                  "hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]",
                ]
              : [
                  "bg-cyan-950/50 text-cyan-300",
                  "border-cyan-500/50",
                  "hover:bg-cyan-900/50 hover:border-cyan-400",
                  "hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]",
                ]
          )}
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50" />

          <div className="relative">
            {isLoading ? (
              <X className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </div>
        </Button>
      </div>
    </form>
  );
}
