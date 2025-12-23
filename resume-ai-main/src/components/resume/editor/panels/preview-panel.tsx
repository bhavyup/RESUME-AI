'use client';

import { Resume } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CoverLetter from "@/components/cover-letter/cover-letter";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ResumePreview = dynamic(
  () => import("../preview/resume-preview").then((mod) => mod.ResumePreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[600px] w-full items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm text-slate-400">Loading Preview...</p>
        </div>
      </div>
    ),
  }
);

// 3. Dynamic Import for the Context Menu
// This also imports PDF generators for the "Download" function, so we lazy load it too.
const ResumeContextMenu = dynamic(
  () => import("../preview/resume-context-menu").then((mod) => mod.ResumeContextMenu),
  { ssr: false }
);

interface PreviewPanelProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  width: number;
  // percentWidth: number;
}

export function PreviewPanel({
  resume,
  // onResumeChange,
  width
}: PreviewPanelProps) {
  return (
    <ScrollArea className={cn(
      " z-50     bg-red-500 h-full",
      resume.is_base_resume
        ? "bg-purple-50/30"
        : "bg-pink-500/60 shadow-sm shadow-pink-200/20"
    )}>
      <div className="">
      <ResumeContextMenu resume={resume}>
          <ResumePreview resume={resume} containerWidth={width} />
        </ResumeContextMenu>
      </div>

      <CoverLetter 
        // resumeId={resume.id} 
        // hasCoverLetter={resume.has_cover_letter}
        // coverLetterData={resume.cover_letter}
        containerWidth={width}
        // onCoverLetterChange={(data: Record<string, unknown>) => {
        //   if ('has_cover_letter' in data) {
        //     onResumeChange('has_cover_letter', data.has_cover_letter as boolean);
        //   }
        //   if ('cover_letter' in data) {    
        //     onResumeChange('cover_letter', data.cover_letter as Record<string, unknown>);
        //   }
        // }}
      />
    </ScrollArea>
  );
} 