"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Linkedin,
  Loader2,
  Sparkles,
  FileText,
  Zap,
  Download,
  Chrome,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import pdfToText from "react-pdftotext";

interface LinkedInImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProcess: (content: string) => Promise<void>;
  isProcessing: boolean;
}

type ImportMethod = "extension" | "pdf" | "paste";

const EXTENSION_INSTALL_URL =
  process.env.NEXT_PUBLIC_EXTENSION_URL ||
  "https://chrome.google.com/webstore/category/extensions";

export function LinkedInImportDialog({
  isOpen,
  onOpenChange,
  onProcess,
  isProcessing,
}: LinkedInImportDialogProps) {
  const [method, setMethod] = useState<ImportMethod>("extension");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<
    "checking" | "installed" | "not-installed"
  >("checking");
  const [isCheckingExtension, setIsCheckingExtension] = useState(false);

  // Check extension on mount and when dialog opens
  const checkExtension = useCallback(async () => {
    if (typeof window === "undefined") return;

    setIsCheckingExtension(true);
    const requestId = `ping-${Date.now()}`;

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        window.removeEventListener("message", listener);
        setExtensionStatus("not-installed");
        setIsCheckingExtension(false);
        resolve(false);
      }, 1500);

      const listener = (event: MessageEvent) => {
        if (
          event.data?.source === "resumeai-extension" &&
          event.data?.type === "linkedin-extension-pong" &&
          event.data?.requestId === requestId
        ) {
          clearTimeout(timeout);
          window.removeEventListener("message", listener);
          setExtensionStatus("installed");
          setIsCheckingExtension(false);
          resolve(true);
        }
      };

      window.addEventListener("message", listener);
      window.postMessage(
        {
          source: "resumeai-app",
          type: "linkedin-extension-ping",
          requestId,
        },
        "*"
      );
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkExtension();
    }
  }, [isOpen, checkExtension]);

  // Listen for extension ready message
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        event.data?.source === "resumeai-extension" &&
        event.data?.type === "linkedin-extension-ready"
      ) {
        setExtensionStatus("installed");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleExtensionImport = async () => {
    const url = linkedinUrl.trim();
    if (!url) {
      toast.error("Please enter a LinkedIn profile URL", {
        position: "bottom-right",
      });
      return;
    }

    if (!url.includes("linkedin.com/in/")) {
      toast.error(
        "Invalid LinkedIn URL. Expected format: linkedin.com/in/username",
        {
          position: "bottom-right",
        }
      );
      return;
    }

    const hasExtension = await checkExtension();

    if (!hasExtension) {
      toast.info(
        "Installing the ResumeLM extension is recommended for best results.",
        {
          position: "bottom-right",
          action: {
            label: "Install",
            onClick: () => window.open(EXTENSION_INSTALL_URL, "_blank"),
          },
        }
      );
      return;
    }

    const requestId = `start-${Date.now()}`;

    window.postMessage(
      {
          source: "resumeai-app",
        type: "linkedin-extension-start",
        payload: {
          profileUrl: url.startsWith("http") ? url : `https://${url}`,
          requestId,
        },
      },
      "*"
    );

    toast.info(
      "Opening LinkedIn... the extension will scrape your profile automatically.",
      {
        position: "bottom-right",
        duration: 5000,
      }
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      await processPdfFile(pdfFile);
    } else {
      toast.error("Please drop a PDF file.", { position: "bottom-right" });
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      await processPdfFile(file);
    }
  };

  const processPdfFile = async (file: File) => {
    try {
      toast.info("Extracting text from PDF...", { position: "bottom-right" });
      const text = await pdfToText(file);
      setPasteContent((prev) => prev + (prev ? "\n\n" : "") + text);
      setMethod("paste"); // Switch to paste tab to show content
      toast.success("PDF text extracted! Click 'Process' to continue.", {
        position: "bottom-right",
      });
    } catch (error) {
      console.error("PDF processing error:", error);
      toast.error(
        "Failed to extract text from PDF. Try copy-pasting instead.",
        {
          position: "bottom-right",
        }
      );
    }
  };

  const handleProcess = async () => {
    const content = pasteContent.trim();
    if (!content) {
      toast.error("Please paste some content first", {
        position: "bottom-right",
      });
      return;
    }

    // Prepend LinkedIn URL if provided
    const combined = linkedinUrl
      ? `LinkedIn Profile URL: ${linkedinUrl}\n\n${content}`
      : content;

    await onProcess(combined);
  };

  const methods = [
    {
      id: "extension" as ImportMethod,
      label: "Quick Import",
      description: "Use browser extension",
      icon: Chrome,
      recommended: true,
    },
    {
      id: "pdf" as ImportMethod,
      label: "PDF Upload",
      description: "LinkedIn 'Save to PDF'",
      icon: FileText,
      recommended: false,
    },
    {
      id: "paste" as ImportMethod,
      label: "Paste Text",
      description: "Copy & paste content",
      icon: Download,
      recommended: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-200 flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-[#0077b5]" />
            Import from LinkedIn
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Import your LinkedIn profile to quickly populate your ResumeLM
            profile.
          </DialogDescription>
        </DialogHeader>

        {/* Method Selection */}
        <div className="grid grid-cols-3 gap-2 py-3">
          {methods.map((m) => {
            const Icon = m.icon;
            const isActive = method === m.id;

            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                  isActive
                    ? "border-[#0077b5] bg-[#0077b5]/10"
                    : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                )}
              >
                {m.recommended && (
                  <span className="absolute -top-2 right-2 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Best
                  </span>
                )}
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-[#0077b5]" : "text-slate-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-[#0077b5]" : "text-slate-300"
                  )}
                >
                  {m.label}
                </span>
                <span className="text-[10px] text-slate-500">
                  {m.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Extension Method */}
        {method === "extension" && (
          <div className="space-y-4 py-2">
            {/* Extension Status */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                extensionStatus === "installed"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : extensionStatus === "not-installed"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-slate-700 bg-slate-800/50"
              )}
            >
              {isCheckingExtension ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : extensionStatus === "installed" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <div className="flex-1 text-sm">
                {isCheckingExtension ? (
                  <span className="text-slate-400">
                    Checking for extension...
                  </span>
                ) : extensionStatus === "installed" ? (
                  <span className="text-emerald-400">Extension detected</span>
                ) : (
                  <span className="text-amber-400">Extension not found</span>
                )}
              </div>
              {extensionStatus === "not-installed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(EXTENSION_INSTALL_URL, "_blank")}
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                >
                  Install
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">
                LinkedIn Profile URL
              </label>
              <input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/your-username"
                className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-[#0077b5]/60 focus:ring-2 focus:ring-[#0077b5]/20 outline-none"
              />
            </div>

            <Button
              onClick={handleExtensionImport}
              disabled={isProcessing || !linkedinUrl.trim()}
              className="w-full bg-[#0077b5] hover:bg-[#006097] text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Start Quick Import
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              The extension will open LinkedIn, scrape your profile, and send
              the data back here.
            </p>
          </div>
        )}

        {/* PDF Method */}
        {method === "pdf" && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-2">
                How to get your LinkedIn PDF:
              </h4>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
                <li>Go to your LinkedIn profile</li>
                <li>Click &quot;More&quot; button below your profile photo</li>
                <li>Select &quot;Save to PDF&quot;</li>
                <li>Drop the downloaded PDF below</li>
              </ol>
            </div>

            <label
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                isDragging
                  ? "border-[#0077b5] bg-[#0077b5]/10"
                  : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
              )}
            >
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileInput}
              />
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#0077b5]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  Drop your LinkedIn PDF here
                </p>
                <p className="text-xs text-slate-500">or click to browse</p>
              </div>
            </label>
          </div>
        )}

        {/* Paste Method */}
        {method === "paste" && (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">
                LinkedIn Profile URL (optional)
              </label>
              <input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/your-username"
                className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-[#0077b5]/60 focus:ring-2 focus:ring-[#0077b5]/20 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">
                Profile Content
              </label>
              <Textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste your LinkedIn profile text here (About, Experience, Education, Skills sections)..."
                className="min-h-[150px] bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-[#0077b5]/50 focus:ring-[#0077b5]/20 resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          {(method === "pdf" || method === "paste") && (
            <Button
              onClick={handleProcess}
              disabled={isProcessing || !pasteContent.trim()}
              className="bg-gradient-to-r from-[#0077b5] to-[#0a66c2] hover:from-[#0a66c2] hover:to-[#004182] text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Process with AI
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
