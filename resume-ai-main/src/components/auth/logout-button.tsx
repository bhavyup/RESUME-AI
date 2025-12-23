'use client'


import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { logout } from "@/app/auth/login/actions";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const result = await logout();
      if (result?.success) {
        router.push('/');
        return;
      }
      throw new Error(result?.error || 'Failed to sign out');
    } catch {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1",
        "text-sm font-medium text-purple-600/80 hover:text-purple-900/95 hover:bg-red-500/70",
        "transition-colors duration-200",
        className
      )}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{isLoading ? 'Signing out...' : 'Logout'}</span>
    </Button>
  );
} 