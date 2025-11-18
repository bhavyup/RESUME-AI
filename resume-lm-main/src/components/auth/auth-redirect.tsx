"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (authService.isAuthenticated()) {
      router.push("/home");
    }
  }, [router]);

  return null; // This component doesn't render anything
}
