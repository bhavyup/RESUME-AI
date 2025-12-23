import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles
        "flex w-full rounded-xl border bg-slate-800/50 px-4 py-3 text-sm",
        "border-slate-700",
        "text-slate-200",
        "shadow-sm shadow-black/20",
        "placeholder:text-slate-500",
        // Interactive states
        "hover:border-slate-600 hover:bg-slate-800/70",
        "focus:border-emerald-500/50 focus:bg-slate-800/70 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0",
        "focus-visible:outline-none outline-none",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800/50",
        // Custom scrollbar
        "custom-scrollbar",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
