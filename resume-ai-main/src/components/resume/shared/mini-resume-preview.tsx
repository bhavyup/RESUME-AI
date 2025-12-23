import { cn } from "@/lib/utils";
import { FileText, Clock, Target } from "lucide-react";

interface MiniResumePreviewProps {
  name: string;
  type: "base" | "tailored";
  updatedAt?: string;
  createdAt?: string;
  target_role?: string;
  className?: string;
}

export function MiniResumePreview({
  name,
  type,
  updatedAt,
  target_role,
  className,
}: MiniResumePreviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Theme configuration
  const theme =
    type === "base"
      ? {
          border: "border-cyan-500/20",
          hoverBorder: "group-hover:border-cyan-500/50",
          accent: "bg-cyan-500",
          text: "text-cyan-400",
          bg: "from-cyan-500/5 to-transparent",
          icon: "text-cyan-400",
        }
      : {
          border: "border-violet-500/20",
          hoverBorder: "group-hover:border-violet-500/50",
          accent: "bg-violet-500",
          text: "text-violet-400",
          bg: "from-violet-500/5 to-transparent",
          icon: "text-violet-400",
        };

  return (
    <div
      className={cn(
        "group relative w-full aspect-[210/297]", // A4 Ratio
        "rounded-xl overflow-hidden",
        "bg-slate-950",
        "border",
        theme.border,
        theme.hoverBorder,
        "transition-all duration-300 ease-out",
        "hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1",
        className
      )}
    >
      {/* --- DOCUMENT PREVIEW (SCALED DOWN UI) --- */}
      <div className="absolute inset-0 p-4 flex flex-col gap-3 opacity-80 group-hover:opacity-40 transition-opacity duration-300">
        {/* Header Mockup */}
        <div className="flex flex-col items-center gap-1.5 pb-3 border-b border-slate-800/50">
          <div className="h-2 w-24 bg-slate-700 rounded-full" />
          <div className="flex gap-1">
            <div className="h-1 w-12 bg-slate-800 rounded-full" />
            <div className="h-1 w-12 bg-slate-800 rounded-full" />
          </div>
        </div>

        {/* Body Content Mockup */}
        <div className="space-y-3">
          {/* Section 1 */}
          <div className="space-y-1.5">
            <div
              className={cn(
                "h-1.5 w-10 rounded-sm",
                theme.accent,
                "opacity-40"
              )}
            />
            <div className="space-y-1">
              <div className="h-1 w-full bg-slate-800/80 rounded-sm" />
              <div className="h-1 w-[90%] bg-slate-800/80 rounded-sm" />
              <div className="h-1 w-[95%] bg-slate-800/80 rounded-sm" />
            </div>
          </div>

          {/* Section 2 (Split Columns) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <div
                className={cn(
                  "h-1.5 w-8 rounded-sm",
                  theme.accent,
                  "opacity-40"
                )}
              />
              <div className="h-8 w-full bg-slate-800/50 rounded-sm border border-slate-800" />
            </div>
            <div className="space-y-1.5">
              <div
                className={cn(
                  "h-1.5 w-8 rounded-sm",
                  theme.accent,
                  "opacity-40"
                )}
              />
              <div className="h-8 w-full bg-slate-800/50 rounded-sm border border-slate-800" />
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <div
              className={cn(
                "h-1.5 w-12 rounded-sm",
                theme.accent,
                "opacity-40"
              )}
            />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2">
                <div className="h-1 w-1 bg-slate-700 rounded-full mt-0.5" />
                <div className="h-1 w-[85%] bg-slate-800/80 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- OVERLAY CONTENT (VISIBLE ON DEFAULT, ENHANCED ON HOVER) --- */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-4">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {/* Badge */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border",
                theme.border,
                theme.text
              )}
            >
              {type === "base" ? "Master Template" : "Tailored"}
            </span>

            {updatedAt && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                <Clock className="w-3 h-3" />
                {formatDate(updatedAt)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-100 leading-tight mb-1 group-hover:text-white transition-colors">
            {name}
          </h3>

          {/* Target Role (if tailored) */}
          {target_role && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Target className={cn("w-3 h-3", theme.icon)} />
              <span className="truncate">{target_role}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Accent Bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", theme.accent)} />

      {/* Decorative Glow */}
      <div
        className={cn(
          "absolute -inset-1 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
          theme.accent
        )}
      />
    </div>
  );
}
