"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth";
import { useState, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./form-validation-context";

export function SignupForm() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const {
    formData,
    setFormData,
    validations,
    validateField,
    touchedFields,
    setFieldTouched,
  } = useAuth();

  // Check if form is valid (all required fields are valid)
  const isFormValid = useMemo(() => {
    return (
      validations.name?.isValid &&
      validations.email.isValid &&
      validations.password.isValid
    );
  }, [validations]);

  // Collect validation error messages
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (
      touchedFields.name &&
      !validations.name?.isValid &&
      validations.name?.message
    ) {
      errors.push(validations.name.message);
    }
    if (
      touchedFields.email &&
      !validations.email.isValid &&
      validations.email.message
    ) {
      errors.push(validations.email.message);
    }
    if (
      touchedFields.password &&
      !validations.password.isValid &&
      validations.password.message
    ) {
      errors.push(validations.password.message);
    }

    return errors;
  }, [validations, touchedFields]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setSuccess(false);

    // Mark all fields as touched on submit
    setFieldTouched("name");
    setFieldTouched("email");
    setFieldTouched("password");

    // Validate all fields
    validateField("name", formData.name || "");
    validateField("email", formData.email);
    validateField("password", formData.password);

    // Check if all valid
    if (!isFormValid) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      // Generate username from email (before @ symbol)
      const username = formData.email.split("@")[0].toLowerCase();

      const registrationData = {
        username,
        email: formData.email,
        password: formData.password,
        fullName: formData.name || "",
      };

      await authService.register(registrationData);

      setSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ [field]: value });
    validateField(field, value);
  };

  if (success) {
    return (
      <Alert className="bg-emerald-900/20 text-emerald-400 border-emerald-800/50">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <AlertDescription>
          {process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === "true"
            ? "Account created! Please check your email to verify your account."
            : "Account created successfully! You can now sign in."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Backend error */}
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 text-red-400 border-red-800/50"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Validation errors summary */}
      {validationErrors.length > 0 && !error && (
        <Alert
          variant="destructive"
          className="bg-red-900/20 text-red-400 border-red-800/50"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx} className="text-xs">
                  {err}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-slate-300">
          Full Name
        </Label>
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
          validation={validations.name}
          isTouched={touchedFields.name}
          autoFocus
          className="h-11 bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 hover:bg-amber-100 hover:text-slate-800
            focus:border-emerald-500/50 focus:bg-amber-200 focus:text-slate-800 focus:ring-emerald-500/20 rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-300">
          Email
        </Label>
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
          validation={validations.email}
          isTouched={touchedFields.email}
          className="h-11 bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 hover:bg-amber-100 hover:text-slate-800
            focus:border-emerald-500/50 focus:bg-amber-200 focus:text-slate-800 focus:ring-emerald-500/20 rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-slate-300"
        >
          Password
        </Label>
        <div className="relative">
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
              validation={validations.password}
              isTouched={touchedFields.password}
              className="h-11 bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 hover:bg-amber-100 hover:text-slate-800
              focus:border-emerald-500/50 focus:bg-amber-200 focus:text-slate-800 focus:ring-emerald-500/20 rounded-lg"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={`absolute ${touchedFields.password ? "right-10" : "right-3"} top-[1.375rem] -translate-y-1/2 text-slate-500 hover:text-slate-200 
               transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded p-1 z-10`}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Password requirements hint */}
      <div className="text-xs text-slate-500 space-y-1">
        <p className="font-medium">Password must contain:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li
            className={formData.password.length >= 8 ? "text-emerald-400" : ""}
          >
            At least 8 characters
          </li>
          <li
            className={
              /[A-Z]/.test(formData.password) ? "text-emerald-400" : ""
            }
          >
            One uppercase letter
          </li>
          <li
            className={
              /[a-z]/.test(formData.password) ? "text-emerald-400" : ""
            }
          >
            One lowercase letter
          </li>
          <li
            className={
              /[0-9]/.test(formData.password) ? "text-emerald-400" : ""
            }
          >
            One number
          </li>
          <li
            className={
              /[!@#$%^&*()_+\[\]{}|;:'",.<>/?`~\-=\\]/.test(formData.password)
                ? "text-emerald-400"
                : ""
            }
          >
            One special character (!@#$%...)
          </li>
        </ul>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className={`w-full h-11 font-semibold rounded-lg shadow-lg transition-all duration-200 ${
          isFormValid
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 shadow-emerald-500/30 hover:shadow-emerald-500/50"
            : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
