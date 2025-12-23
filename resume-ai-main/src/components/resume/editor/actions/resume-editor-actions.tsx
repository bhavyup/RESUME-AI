"use client";

import { Resume } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Save, FileText, Check} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { pdf } from "@react-pdf/renderer";
import { TextImport } from "../../text-import";
import { ResumePDFDocument } from "../preview/resume-pdf-document";
import { cn } from "@/lib/utils";
import { useResumeContext } from "../resume-editor-context";

import { updateResume } from "@/utils/actions/resumes/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ResumeEditorActionsProps {
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function ResumeEditorActions({
  onResumeChange,
}: ResumeEditorActionsProps) {
  const { state, dispatch } = useResumeContext();
  const { resume, isSaving } = state;
  const [isDownloading, setIsDownloading] = useState(false); // Added loading state for download
  const [downloadOptions, setDownloadOptions] = useState({
    resume: true,
    coverLetter: true,
  });

  // --- HELPER: Generate Cover Letter PDF using Overlay Strategy ---
  const generateCoverLetterPdf = async () => {
    const content = resume.cover_letter?.content;
    if (!content) return;

    // 1. Create Overlay
    const overlay = document.createElement("div");
    overlay.id = "pdf-generation-overlay-global";
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background-color: #ffffff; z-index: 99999;
      display: flex; justify-content: center; padding-top: 20px;
    `;

    // 2. Create Container (Matches CoverLetter component styles)
    const container = document.createElement("div");
    container.style.cssText = `
      width: 7.5in; background: white; color: black;
      font-family: 'Times New Roman', Times, serif; font-size: 11pt;
      line-height: 1.4; text-align: left; padding: 0.5in; box-sizing: border-box;
    `;
    container.innerHTML = content;

    // 3. Force Styles
    const styleReset = document.createElement("style");
    styleReset.innerHTML = `
      #pdf-generation-overlay-global * { color: #000 !important; background: transparent !important; }
      #pdf-generation-overlay-global p { margin-bottom: 1em; word-wrap: break-word; }
      #pdf-generation-overlay-global ul { margin-left: 20px; }
    `;
    overlay.appendChild(styleReset);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // 4. Wait for Paint
    await new Promise((resolve) =>
      requestAnimationFrame(() => setTimeout(resolve, 500))
    );

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 0.5,
        filename: `${resume.first_name || "Cover"}_${
          resume.last_name || "Letter"
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
          windowWidth: 1200,
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };
      await html2pdf().set(opt).from(container).save();
    } finally {
      document.body.removeChild(overlay);
    }
  };

  // Save Resume
  const handleSave = async () => {
    try {
      dispatch({ type: "SET_SAVING", value: true });
      await updateResume(state.resume.id, state.resume);
      toast({
        title: "Changes saved",
        description: "Your resume has been updated successfully.",
      });
      console.log("Resume saved successfully.");
    } catch (error) {
      toast({
        title: "Save failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_SAVING", value: false });
    }
  };

  // Dynamic color classes based on resume type
  const isBase = resume.is_base_resume;
  const colors = isBase ? {
    importBg: "bg-gradient-to-r from-indigo-600 to-violet-600",
    importHover: "hover:from-indigo-500 hover:to-violet-500",
    importShadow: "shadow-indigo-500/20",
    actionBg: "bg-gradient-to-r from-violet-600 to-fuchsia-600",
    actionHover: "hover:from-violet-500 hover:to-fuchsia-500",
    actionShadow: "shadow-violet-500/20",
    tooltipBorder: "border-violet-500/20",
    checkboxActive: "bg-violet-500 border-violet-500"
  } : {
    importBg: "bg-gradient-to-r from-cyan-600 to-blue-600",
    importHover: "hover:from-cyan-500 hover:to-blue-500",
    importShadow: "shadow-cyan-500/20",
    actionBg: "bg-gradient-to-r from-blue-600 to-indigo-600",
    actionHover: "hover:from-blue-500 hover:to-indigo-500",
    actionShadow: "shadow-blue-500/20",
    tooltipBorder: "border-blue-500/20",
    checkboxActive: "bg-blue-500 border-blue-500"
  };
  
  const buttonBaseStyle = cn(
    "transition-all duration-300 relative overflow-hidden h-10 px-4 text-xs font-semibold tracking-wide",
    "rounded-xl border border-white/10 text-white shadow-lg",
    "hover:shadow-xl hover:-translate-y-0.5",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0",
    "backdrop-blur-sm"
  );

  const importButtonClasses = cn(
    buttonBaseStyle,
    colors.importBg,
    colors.importHover,
    colors.importShadow
  );
  const actionButtonClasses = cn(
    buttonBaseStyle,
    colors.actionBg,
    colors.actionHover,
    colors.actionShadow
  );

  return (
    <div className="px-1 py-2 @container">
      <div className="grid grid-cols-3 gap-2">
        {/* Text Import Button */}
        <TextImport
          resume={resume}
          onResumeChange={onResumeChange}
          className={importButtonClasses}
        />

        {/* Download Button */}
        <TooltipProvider delayDuration={1000}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                disabled={isDownloading} 
                onClick={async () => {
                  try {
                    setIsDownloading(true);
                    if (downloadOptions.resume) {
                      const blob = await pdf(<ResumePDFDocument resume={resume} />).toBlob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${resume.first_name}_${resume.last_name}_Resume.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                    if (downloadOptions.coverLetter && resume.has_cover_letter) {
                      await generateCoverLetterPdf();
                    }
                    toast({ title: "Download complete", description: "Your documents are ready." });
                  } catch (err: unknown) {
                    toast({ title: "Download failed", description: "Something went wrong. Errored: " + (err instanceof Error ? err.message : String(err)), variant: "destructive" });
                  } finally {
                    setIsDownloading(false);
                  }
                }}
                className={cn(buttonBaseStyle, colors.actionBg, colors.actionHover, colors.actionShadow)}
              >
                {isDownloading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                Download
              </Button>
            </TooltipTrigger>
            
            {/* --- REDESIGNED TOOLTIP CONTENT --- */}
            <TooltipContent 
              side="bottom" 
              align="center"
              sideOffset={8}
              className={cn(
                "w-56 p-0 overflow-hidden",
                "bg-slate-950/95 backdrop-blur-xl", // Glass dark background
                "border border-white/10", // Subtle light border
                "shadow-2xl shadow-black/50",
                "rounded-xl",
                "animate-in fade-in-0 zoom-in-95 duration-200"
              )}
            >
              <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Includes
                </span>
              </div>
              
              <div className="p-2 space-y-1">
                {/* Resume Option */}
                <div 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDownloadOptions(prev => ({ ...prev, resume: !prev.resume }));
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                      downloadOptions.resume ? "bg-white/10 text-white" : "bg-white/5 text-slate-500"
                    )}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      downloadOptions.resume ? "text-slate-200" : "text-slate-500"
                    )}>
                      Resume PDF
                    </span>
                  </div>
                  
                  {/* Custom Checkbox Look */}
                  <div className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                    downloadOptions.resume 
                      ? cn(colors.checkboxActive, "border-transparent shadow-[0_0_10px_currentColor]")
                      : "border-slate-600 bg-transparent"
                  )}>
                    {downloadOptions.resume && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>

                {/* Cover Letter Option */}
                {resume.has_cover_letter && (
                  <div 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDownloadOptions(prev => ({ ...prev, coverLetter: !prev.coverLetter }));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                        downloadOptions.coverLetter ? "bg-white/10 text-white" : "bg-white/5 text-slate-500"
                      )}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        downloadOptions.coverLetter ? "text-slate-200" : "text-slate-500"
                      )}>
                        Cover Letter
                      </span>
                    </div>
                    
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                      downloadOptions.coverLetter 
                        ? cn(colors.checkboxActive, "border-transparent shadow-[0_0_10px_currentColor]")
                        : "border-slate-600 bg-transparent"
                    )}>
                      {downloadOptions.coverLetter && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={actionButtonClasses}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
