"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./auth-context";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all duration-300 text-white font-medium"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export function LoginForm() {
  const [error, setError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const {
    formData,
    setFormData,
    setFieldLoading,
    validations,
    validateField,
    touchedFields,
    setFieldTouched,
  } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    // Mark all fields as touched on submit
    const fields = ["email", "password"] as const;
    fields.forEach((field) => setFieldTouched(field));

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      validateField(field as keyof typeof formData, value);
    });

    // Check if all required fields are valid
    const isValid = fields.every((field) => validations[field]?.isValid);

    if (!isValid) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    try {
      setFieldLoading("submit", true);
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);

      const result = await login(formDataToSend);
      if (!result.success) {
        setError(
          "Invalid credentials. If you just signed up, please check your email for a verification link."
        );
        setFieldLoading("submit", false);
      }
      // If success, the server action will redirect - don't set loading to false
    } catch (error: unknown) {
      // Check if this is a Next.js redirect (which is expected on success)
      if (error && typeof error === "object" && "digest" in error) {
        // This is a Next.js redirect, which means login was successful
        // Don't show an error or stop loading - let the redirect happen
        return;
      }
      // Only show error for actual errors
      setError("An error occurred during login");
      console.error("Login error:", error);
      setFieldLoading("submit", false);
    }
  }

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData({ [field]: value });
    validateField(field, value);
    // Simulate field validation loading state
    setFieldLoading(field, true);
    const timer = setTimeout(() => {
      setFieldLoading(field, false);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="login-email"
          className="text-sm font-medium text-slate-200"
        >
          Email
        </Label>
        <div className="relative">
          {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 " /> */}
          <Input
            autoFocus
            id="login-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onBlur={() => setFieldTouched("email")}
            placeholder="you@example.com"
            required
            className="h-11 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 hover:bg-slate-700/50 focus:bg-slate-700/50"
            validation={validations.email}
            isTouched={touchedFields.email}
            autoComplete="username"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="login-password"
            className="text-sm font-medium text-slate-200"
          >
            Password
          </Label>
          <Link
            href="/auth/reset-password"
            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          {/* <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" /> */}
          <Input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onBlur={() => setFieldTouched("password")}
            placeholder="••••••••"
            required
            minLength={8}
            className="h-11 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 hover:bg-slate-700/50 focus:bg-slate-700/50"
            validation={validations.password}
            isTouched={touchedFields.password}
            autoComplete="current-password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
      </div>
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 text-red-400 border-red-800/50"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <SubmitButton />
    </form>
  );
}
