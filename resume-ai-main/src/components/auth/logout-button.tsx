"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { tokenManager } from "@/lib/api";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);

    // Step 1: Tell layout to FREEZE (don't re-render)
    window.dispatchEvent(new CustomEvent("auth-logout-start"));

    // Step 2: Small delay to let event propagate
    setTimeout(() => {
      // Step 3: Clear tokens
      tokenManager.clearTokens();

      // Step 4: Immediate redirect
      window.location.href = "/";
    }, 10); // Tiny 10ms delay just for event to process
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1",
        "text-sm font-medium text-slate-400 hover:text-amber-400",
        "transition-colors duration-200",
        className
      )}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">
        {isLoading ? "Signing out..." : "Logout"}
      </span>
    </Button>
  );
}
