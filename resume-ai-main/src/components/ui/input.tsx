import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validation?: {
    isValid?: boolean;
    message?: string;
  };
  showValidation?: boolean;
  isTouched?: boolean;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      validation,
      showPassword,
      setShowPassword,
      showValidation = true,
      isTouched = false,
      ...props
    },
    ref
  ) => {
    const isValid = validation?.isValid;
    const showStatus =
      showValidation && typeof isValid !== "undefined" && isTouched;

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            type={type}
            className={cn(
              // Base styles
              "flex h-11 w-full rounded-xl border bg-slate-800/50 px-4 py-2 text-base",
              "shadow-sm shadow-black/20",
              "placeholder:text-slate-500",
              "transition-all duration-300 ease-in-out",
              "text-slate-200",

              // Default state
              "border-slate-700",

              // Hover state
              "hover:border-slate-600 hover:bg-slate-800/70",

              // Focus state with enhanced ring
              "focus:border-emerald-500/50 focus:bg-slate-800/70 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0",
              "focus-visible:outline-none focus:outline-0 outline-none",

              // Validation states - only show when touched
              showStatus &&
                isValid &&
                "border-emerald-500/50 hover:border-emerald-500/60 focus:border-emerald-500/60 focus:ring-emerald-500/10",
              showStatus &&
                !isValid &&
                "border-red-500/50 hover:border-red-500/60 focus:border-red-500/60 focus:ring-red-500/10",

              // Icon padding
              showStatus && "pr-10",

              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800/50",

              // Autofill styles - prevent white background
              "autofill:shadow-[inset_0_0_0px_1000px_rgb(51_65_85_/_0.5)]",
              "autofill:[-webkit-text-fill-color:rgb(203_213_225)]",
              "autofill:bg-slate-800/50",

              // File input styles
              "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-300",

              className
            )}
            ref={ref}
            aria-invalid={showStatus && !isValid}
            {...props}
          />

          {/* Validation Icons */}
          {showStatus && (
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
                "transition-opacity duration-200",
                isTouched ? "opacity-100" : "opacity-0"
              )}
            >
              {isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 transition-transform duration-200" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 transition-transform duration-200" />
              )}
            </div>
          )}

          {(type === "password" || (type === "text" && setShowPassword)) && (
            <button
              type="button"
              onClick={() => setShowPassword && setShowPassword(!showPassword)}
              className={`absolute ${
                isTouched ? "right-10" : "right-3"
              } top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors focus:outline-none rounded p-1`}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {/* Validation Message */}
        {showStatus && validation?.message && !isValid && (
          <p
            className={cn(
              "text-xs text-red-500 mt-1 ml-1",
              "transition-all duration-200",
              isTouched
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-1"
            )}
          >
            {validation.message}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
