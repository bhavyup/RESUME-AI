import { useState } from "react";
import {
  ShieldAlert,
  Settings,
  Zap,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ApiKeyErrorAlertProps {
  error: unknown;
  router: ReturnType<typeof useRouter>;
}

export function ApiKeyErrorAlert({ error, router }: ApiKeyErrorAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpgradeHovered, setIsUpgradeHovered] = useState(false);

  const getErrorDetails = (err: unknown) => {
    const errorString =
      typeof err === "string" ? err : (err as Error)?.message || "";
    const errorJson = JSON.stringify(err);

    if (
      errorString.includes("Quota exceeded") ||
      errorString.includes("quota") ||
      errorJson.includes("insufficient_quota")
    ) {
      return {
        title: "RESOURCE EXHAUSTED",
        message:
          "API quota limit reached. System requires upgrade for continued operation.",
      };
    }

    if (
      errorString.includes("rate") ||
      errorString.includes("Rate") ||
      errorJson.includes("rate_limit")
    ) {
      return {
        title: "RATE LIMIT EXCEEDED",
        message: "Request frequency too high. Cool-down period initiated.",
      };
    }

    if (
      errorString.includes("API key") ||
      errorString.includes("api key") ||
      errorJson.includes("invalid_api_key") ||
      errorJson.includes("authentication_error")
    ) {
      return {
        title: "AUTHENTICATION FAILURE",
        message:
          "Invalid or missing API credentials. Security verification failed.",
      };
    }

    if (
      (err as Error)?.name === "DataCloneError" ||
      errorString.includes("structuredClone")
    ) {
      return {
        title: "DATA INTEGRITY ERROR",
        message: "Response processing failed. Retrying operation recommended.",
      };
    }

    return {
      title: "SYSTEM MALFUNCTION",
      message: errorString || "An unexpected error occurred.",
    };
  };

  const { title, message } = getErrorDetails(error);

  const getFullErrorDetails = (err: unknown): string => {
    if (typeof err === "string") return err;
    if (err instanceof Error) {
      return `${err.name}: ${err.message}${
        err.stack ? "\n\nStack Trace:\n" + err.stack : ""
      }`;
    }
    try {
      const json = JSON.stringify(err, null, 2);
      return json === "{}" ? "No additional error details available." : json;
    } catch {
      return "Unable to parse error details.";
    }
  };

  const fullErrorDetails = getFullErrorDetails(error);

  const copyFullErrorDetails = () => {
    navigator.clipboard.writeText(fullErrorDetails);
  };

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500 w-full my-4">
      {/* Container */}
      <div
        className="relative overflow-hidden p-5"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          boxShadow: "0 0 30px -10px rgba(220, 38, 38, 0.15)",
        }}
      >
        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(255,0,0,0.02), rgba(255,0,0,0.06))",
            backgroundSize: "100% 4px, 3px 100%",
          }}
        />

        {/* Corner accents */}
        <div
          className="absolute top-0 left-0 w-4 h-4"
          style={{
            borderLeft: "2px solid rgba(239, 68, 68, 0.6)",
            borderTop: "2px solid rgba(239, 68, 68, 0.6)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-4 h-4"
          style={{
            borderRight: "2px solid rgba(239, 68, 68, 0.6)",
            borderTop: "2px solid rgba(239, 68, 68, 0.6)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-4 h-4"
          style={{
            borderLeft: "2px solid rgba(239, 68, 68, 0.6)",
            borderBottom: "2px solid rgba(239, 68, 68, 0.6)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-4 h-4"
          style={{
            borderRight: "2px solid rgba(239, 68, 68, 0.6)",
            borderBottom: "2px solid rgba(239, 68, 68, 0.6)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4">
          {/* Header */}
          <div
            className="flex items-center gap-3 pb-3"
            style={{ borderBottom: "1px solid rgba(239, 68, 68, 0.2)" }}
          >
            <div
              className="p-1.5 rounded-md animate-pulse"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <ShieldAlert className="w-4 h-4" style={{ color: "#f87171" }} />
            </div>
            <div className="flex flex-col">
              <span
                className="text-[10px] font-mono tracking-[0.2em] uppercase"
                style={{ color: "rgba(239, 68, 68, 0.7)" }}
              >
                System Alert
              </span>
              <span
                className="text-sm font-bold tracking-wide font-mono"
                style={{ color: "#fecaca" }}
              >
                {title}
              </span>
            </div>
          </div>

          {/* Message & Expandable Details */}
          <div className="flex flex-col gap-2">
            <div className="relative flex gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-start gap-2 text-left font-mono text-xs leading-relaxed transition-colors"
                style={{ color: "rgba(254, 202, 202, 0.8)" }}
              >
                <span className="mt-0.5 shrink-0" style={{ color: "#ef4444" }}>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </span>
                <span
                  className="break-words hover:underline"
                  style={{
                    textDecorationColor: "rgba(239, 68, 68, 0.3)",
                    textUnderlineOffset: "4px",
                  }}
                >
                  {message}
                </span>
              </button>

              {isExpanded && (
                <>
                  <div className="relative border-l-2 border-red-600/30 animate-in slide-in-from-top-2 duration-200"></div>
                  <button
                    onClick={copyFullErrorDetails}
                    className="flex items-start gap-2 text-left font-mono text-xs leading-relaxed transition-colors break-words hover:underline text-[#ef4444]"
                  >
                    Copy Error Details
                  </button>
                </>
              )}
            </div>

            {isExpanded && (
              <div
                className="ml-5 mt-2 p-3 rounded text-[10px] font-mono overflow-x-auto animate-in slide-in-from-top-2 duration-200"
                style={{
                  backgroundColor: "rgba(69, 10, 10, 0.3)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "rgba(252, 165, 165, 0.7)",
                }}
              >
                <pre className="whitespace-pre-wrap break-all">
                  {fullErrorDetails}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            {/* Upgrade Button */}
            <button
              onClick={() => router.push("/subscription")}
              onMouseEnter={() => setIsUpgradeHovered(true)}
              onMouseLeave={() => setIsUpgradeHovered(false)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[13px] font-mono uppercase tracking-wider transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "#ff934d",
                border: isUpgradeHovered
                  ? "1px solid #ff0000"
                  : "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ffffff",
                boxShadow: isUpgradeHovered
                  ? "0 0 20px -5px rgba(220, 38, 38, 0.6)"
                  : "none",
              }}
            >
              <Zap
                className="w-3 h-3 transition-colors"
                style={{ color: "#ff0000" }}
              />
              Upgrade to Pro
            </button>

            {/* Settings Button */}
            <button
              onClick={() => router.push("/settings")}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_-5px_rgba(220,38,38,0.2)] hover:scale-105"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "rgba(252, 255, 255, 0.7)",
              }}
            >
              <Settings className="w-3 h-3" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
