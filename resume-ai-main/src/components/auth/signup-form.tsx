"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/app/auth/login/actions";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
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
          Creating Account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  );
}

interface FormState {
  error?: string;
  success?: boolean;
}

export function SignupForm() {
  const [formState, setFormState] = useState<FormState>({});
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
    setFormState({});

    // Mark all fields as touched on submit
    const fields = ["email", "password", "name"] as const;
    fields.forEach((field) => setFieldTouched(field));

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      if (field !== "confirmPassword") {
        validateField(field as keyof typeof formData, value);
      }
    });

    // Check if all required fields are valid
    const isValid = fields.every((field) => validations[field]?.isValid);

    if (!isValid) {
      setFormState({
        error: "Please fix the validation errors before submitting",
      });
      return;
    }

    try {
      setFieldLoading("submit", true);
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("name", formData.name || "");

      const result = await signup(formDataToSend);
      if (!result.success) {
        setFormState({ error: result.error || "Failed to create account" });
        return;
      }

      setFormState({ success: true });
    } catch (error: unknown) {
      console.error("Signup error:", error);
      setFormState({ error: "An unexpected error occurred" });
    } finally {
      setFieldLoading("submit", false);
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ [field]: value });
    validateField(field, value);
    setFieldLoading(field, true);
    const timer = setTimeout(() => {
      setFieldLoading(field, false);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <>
      {formState.success ? (
        <Alert className="bg-emerald-900/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <AlertDescription>
            Account created successfully! Please check your email to confirm
            your account.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formState.error && (
            <Alert
              variant="destructive"
              className="bg-red-900/20 text-red-400 border-red-500/30"
            >
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-slate-200"
            >
              Full Name
            </Label>
            <div className="relative">
              {/* <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" /> */}
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={() => setFieldTouched("name")}
                placeholder="John Doe"
                required
                minLength={2}
                maxLength={50}
                className="h-11 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 hover:bg-slate-700/50 focus:bg-slate-700/50"
                validation={validations.name}
                isTouched={touchedFields.name}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-200"
            >
              Email
            </Label>
            <div className="relative">
              {/* <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" /> */}
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => setFieldTouched("email")}
                placeholder="you@example.com"
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className="h-11 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 hover:bg-slate-700/50 focus:bg-slate-700/50"
                validation={validations.email}
                isTouched={touchedFields.email}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-200"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onBlur={() => setFieldTouched("password")}
                placeholder="••••••••"
                required
                minLength={8}
                maxLength={100}
                className="h-11 bg-slate-800/50 text-slate-200 placeholder:text-slate-500 hover:bg-slate-700/50 focus:bg-slate-700/50"
                validation={validations.password}
                isTouched={touchedFields.password}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </div>
          </div>

          <SubmitButton />
        </form>
      )}
    </>
  );
}
