"use client";

import { useState } from "react";
import {
  AlertOctagon,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Added DialogTitle
import { cn } from "@/lib/utils";

interface ApiErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: {
    title: string;
    description: string;
    completeDescription?: string;
  };
  onUpgrade: () => void;
  onSettings: () => void;
  showUpgrade?: boolean;
}

export function ApiErrorDialog({
  open,
  onOpenChange,
  errorMessage,
  onUpgrade,
  onSettings,
  showUpgrade = true,
}: ApiErrorDialogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(
        errorMessage.completeDescription || ""
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-[500px]">
        {/* Main Card - Performance Optimized: Removed heavy blurs/shadows */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0F1115] border border-white/10 ring-1 ring-red-500/20">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

          {/* Header Content */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                {/* Optimized Glow */}
                <div className="absolute inset-0 bg-red-500/10 rounded-full" />
                <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-950/50 border border-red-500/20 flex items-center justify-center">
                  <AlertOctagon className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {/* FIX: DialogTitle is required for A11y */}
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  System Interrupt
                </DialogTitle>
                <p className="text-red-200/60 font-medium text-sm">
                  {errorMessage.title}
                </p>
              </div>
            </div>

            {/* Error Message Preview */}
            <div
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-6 group cursor-pointer"
            >
              <div
                className={cn(
                  "relative rounded-lg bg-red-950/10 border border-red-500/10 p-4 transition-colors duration-200",
                  isExpanded
                    ? "rounded-b-none border-b-transparent bg-red-950/20"
                    : "hover:bg-red-950/20 hover:border-red-500/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400/70 flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Error Summary
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-red-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-red-400/50 group-hover:text-red-400" />
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-mono">
                  {errorMessage.description}
                </p>
              </div>

              {/* Expandable Terminal View - Performance Optimized */}
              {isExpanded && (
                <div className="border-x border-b border-red-500/10 rounded-b-lg bg-[#050505] animate-in slide-in-from-top-1 duration-200">
                  <div className="p-4 relative group/code">
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-slate-500 hover:text-white hover:bg-slate-800"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="relative max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-900/50">
                      <pre className="text-xs font-mono text-red-300/80 whitespace-pre-wrap break-all p-2">
                        {">"} {errorMessage.completeDescription}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3">
            <Button
              variant="outline"
              onClick={onSettings}
              className="flex-1 bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Check Keys
            </Button>

            {showUpgrade && (
              <Button
                onClick={onUpgrade}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
              >
                <Zap className="w-4 h-4 mr-2 fill-current" />
                Upgrade Plan
              </Button>
            )}

            {!showUpgrade && (
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 hover:bg-white/5 text-slate-400"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
