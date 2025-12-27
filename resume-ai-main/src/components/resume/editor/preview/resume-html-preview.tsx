// src/components/resume/editor/preview/resume-preview.tsx
/**
 * Resume Preview Component
 *
 * This component renders an HTML preview of the resume for real-time editing.
 * The HTML preview is fast and doesn't flicker on updates.
 * PDF generation is handled separately only when downloading.
 */

"use client";

import { Resume } from "@/lib/types";
import { memo, useEffect, useState } from "react";
import { ResumeHTMLDocument } from "./resume-html-document";
import { ScalingWrapper } from "./scaling-wrapper";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  resume: Resume;
  variant?: "base" | "tailored";
  containerWidth: number;
}

/**
 * ResumePreview Component
 *
 * Displays an HTML preview of the resume that updates instantly.
 * No more PDF generation on every keystroke!
 */
export const ResumePreview = memo(
  function ResumePreview({
    resume,
    variant = "base",
    containerWidth,
  }: ResumePreviewProps) {
    // Track if custom font is loaded (for Google Fonts)
    const [fontLoaded, setFontLoaded] = useState(false);
    const requestedFont =
      resume.document_settings?.document_font_family || "Helvetica";

    // Load Google Font for HTML preview if needed
    useEffect(() => {
      const standardFonts = ["Helvetica", "Times-Roman", "Courier"];

      if (standardFonts.includes(requestedFont)) {
        setFontLoaded(true);
        return;
      }

      // Check if font is already loaded
      if (document.fonts.check(`12px "${requestedFont}"`)) {
        setFontLoaded(true);
        return;
      }

      // Load the font via Google Fonts CSS
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        requestedFont
      )}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
      link.rel = "stylesheet";

      link.onload = () => {
        // Wait for font to actually be ready
        document.fonts.ready.then(() => {
          setFontLoaded(true);
        });
      };

      link.onerror = () => {
        console.warn(`Failed to load font: ${requestedFont}`);
        setFontLoaded(true); // Continue with fallback font
      };

      document.head.appendChild(link);

      return () => {
        // Cleanup: don't remove the link as other components might use the font
      };
    }, [requestedFont]);

    return (
      <div className="h-full relative bg-muted/50 overflow-y-auto">
        <ScalingWrapper containerWidth={containerWidth}>
          <div
            className={cn(
              "shadow-xl transition-opacity duration-200",
              fontLoaded ? "opacity-100" : "opacity-0"
            )}
          >
            <ResumeHTMLDocument resume={resume} variant={variant} />
          </div>
        </ScalingWrapper>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.resume === nextProps.resume &&
      prevProps.variant === nextProps.variant &&
      prevProps.containerWidth === nextProps.containerWidth
    );
  }
);

export default ResumePreview;
