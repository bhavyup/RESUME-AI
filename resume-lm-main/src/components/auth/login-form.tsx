"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth";
import { useState, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./form-validation-context";

export function LoginForm() {
  //const router = useRouter();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    formData,
    setFormData,
    validations,
    validateField,
    touchedFields,
    setFieldTouched,
  } = useAuth();

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return validations.email.isValid && validations.password.isValid;
  }, [validations]);

  // Collect validation error messages
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

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

    // Mark all fields as touched
    setFieldTouched("email");
    setFieldTouched("password");

    // Validate fields
    validateField("email", formData.email);
    validateField("password", formData.password);

    // Check if valid
    if (!isFormValid) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({
        username: formData.email,
        password: formData.password,
      });

      // Redirect immediately after successful login
      window.location.href = "/home";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setIsLoading(false); // Only reset loading on error
    }
    // Don't reset isLoading on success - we're redirecting anyway
  }

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData({ [field]: value });
    validateField(field, value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <Label
          htmlFor="login-email"
          className="text-sm font-medium text-slate-300"
        >
          Email or Username
        </Label>
        <Input
          autoFocus
          id="login-email"
          name="email"
          type="text"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          onBlur={() => setFieldTouched("email")}
          placeholder="you@example.com or username"
          required
          validation={validations.email}
          isTouched={touchedFields.email}
          autoComplete="username"
          className="h-11 bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 hover:bg-amber-100 hover:text-slate-800
            focus:border-emerald-500/50 focus:bg-amber-200 focus:text-slate-800 focus:ring-emerald-500/20 rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="login-password"
          className="text-sm font-medium text-slate-300"
        >
          Password
        </Label>
        <div className="relative">
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              onBlur={() => setFieldTouched("password")}
              placeholder="••••••••"
              required
              minLength={6}
              validation={validations.password}
              isTouched={touchedFields.password}
              autoComplete="current-password"
              className="h-11 bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 hover:bg-amber-100 hover:text-slate-800
            focus:border-emerald-500/50 focus:bg-amber-200 focus:text-slate-800 focus:ring-emerald-500/20 rounded-lg"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={`absolute ${
                touchedFields.password ? "right-10" : "right-3"
              } top-[1.375rem] -translate-y-1/2 text-slate-500 hover:text-slate-200 
              transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded p-1`}
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

      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className={`w-full h-11 font-semibold rounded-lg shadow-lg transition-all duration-200 ${
          isFormValid
            ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 shadow-amber-500/30 hover:shadow-amber-500/50"
            : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
