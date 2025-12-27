/**
 * Resume Preview Component
 *
 * This component generates a PDF resume using @react-pdf/renderer and displays it using react-pdf.
 * It supports two variants: base and tailored resumes, with consistent styling and layout.
 * The PDF is generated client-side and updates whenever the resume data changes.
 */

"use client";

import { Resume } from "@/lib/types";
import { Document, Page, pdfjs } from "react-pdf";
import {
  useState,
  useEffect,
  memo,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { pdf } from "@react-pdf/renderer";
import { ResumePDFDocument } from "./resume-pdf-document";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Loader2, AlertTriangle } from "lucide-react";
import { useGoogleFonts, FontCapabilities } from "@/hooks/use-google-fonts";
import { cn } from "@/lib/utils";

// Import required CSS for react-pdf
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { de } from "date-fns/locale";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Cache for storing generated PDFs
const pdfCache = new Map<string, { url: string; timestamp: number }>();

// Cache cleanup interval (5 minutes)
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

/**
 * Generate a simple hash from the resume content
 * This is used as a cache key for PDF generation
 */
function generateResumeHash(resume: Resume): string {
  const content = JSON.stringify({
    basic: {
      name: `${resume.first_name} ${resume.last_name}`,
      contact: [
        resume.email,
        resume.phone_number,
        resume.location,
        resume.website,
        resume.linkedin_url,
        resume.github_url,
      ],
    },
    sections: {
      skills: resume.skills,
      experience: resume.work_experience,
      projects: resume.projects,
      education: resume.education,
    },
    settings: resume.document_settings, // Settings includes font family
  });

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Cleanup expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  for (const [hash, { url, timestamp }] of pdfCache.entries()) {
    if (now - timestamp > CACHE_EXPIRATION_TIME) {
      URL.revokeObjectURL(url);
      pdfCache.delete(hash);
    }
  }
}

// Setup cache cleanup interval
if (typeof window !== "undefined") {
  setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL);
}

// Add custom styles for PDF annotations to ensure links are clickable
const customStyles = `
  .react-pdf__Page__annotations {
    pointer-events: auto !important;
    z-index: 10 !important;
  }
  .react-pdf__Page__annotations.annotationLayer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }
`;

interface ResumePreviewProps {
  resume: Resume;
  variant?: "base" | "tailored";
  containerWidth: number; // This is now expected to be a percentage (0-100)
}

/**
 * ResumePreview Component
 *
 * Displays a PDF preview of the resume using react-pdf.
 * Handles PDF generation and responsive display.
 */
export const ResumePreview = memo(
  function ResumePreview({
    resume,
    variant = "base",
    containerWidth,
  }: ResumePreviewProps) {
    // --- STATE MANAGEMENT FOR DOUBLE BUFFERING ---
    const [activeUrl, setActiveUrl] = useState<string | null>(null);
    const [frozenUrl, setFrozenUrl] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [numPages, setNumPages] = useState<number>(0);
    const debouncedResume = useDebouncedValue(resume, 800);
    const debouncedWidth = useDebouncedValue(containerWidth, 100);
    const [isPending, startTransition] = useTransition();

    // Font Loading
    const { loadFontForPDF, fontList } = useGoogleFonts();
    const [isFontReady, setIsFontReady] = useState(false);
    const [isError, setIsError] = useState(false);
    const [fontCapabilities, setFontCapabilities] =
      useState<FontCapabilities | null>(null);

    const requestedFont =
      resume.document_settings?.document_font_family || "Helvetica";

    // --- FONT EFFECT ---
    useEffect(() => {
      const initFont = async () => {
        if (["Helvetica", "Times-Roman", "Courier"].includes(requestedFont)) {
          setFontCapabilities(null);
          setIsFontReady(true);
          return;
        }

        if (fontList.length > 0) {
          setIsFontReady(false);
          setIsError(false);
          try {
            const caps = await loadFontForPDF(requestedFont);
            setFontCapabilities(caps);
            setIsFontReady(true);
          } catch (e) {
            console.error("Font load error", e);
            setIsError(true);
          }
        }
      };
      initFont();
    }, [requestedFont, fontList, loadFontForPDF]);

    const getPixelWidth = useCallback(() => {
      if (typeof window === "undefined") return 0;
      return debouncedWidth;
    }, [debouncedWidth]);

    // Use debouncedResume for hash to avoid rapid cache misses
    const resumeHash = useMemo(
      () => generateResumeHash(debouncedResume),
      [debouncedResume]
    );

    useEffect(() => {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = customStyles;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }, []);

    // --- PDF GENERATION EFFECT ---
    useEffect(() => {
      if (!isFontReady) return;

      async function generatePDF() {
        // 1. Check Cache
        const cached = pdfCache.get(resumeHash);
        if (cached) {
          if (cached.url !== activeUrl) {
            setIsTransitioning(true); // Start fade transition
            setActiveUrl(cached.url);
            setIsError(false);
          }
          return;
        }

        // 2. Generate New
        startTransition(async () => {
          try {
            setIsTransitioning(true); // Start fade transition

            const blob = await pdf(
              <ResumePDFDocument
                resume={debouncedResume}
                variant={variant}
                fontCapabilities={fontCapabilities}
              />
            ).toBlob();

            const newUrl = URL.createObjectURL(blob);

            pdfCache.set(resumeHash, { url: newUrl, timestamp: Date.now() });
            setActiveUrl(newUrl);
            setIsError(false);
          } catch (error) {
            console.error("PDF Generation failed", error);
            setIsError(true);
          }
        });
      }

      generatePDF();

      // Note: We deliberately rely on GC or cache expiration for cleanup
      // to avoid revoking the URL while it's still being cross-faded.
    }, [resumeHash, variant, debouncedResume, isFontReady, fontCapabilities]);

    // --- HANDLE PAGE LOAD SUCCESS (THE SWAP) ---
    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
      setNumPages(numPages);

      // The new PDF is ready in the DOM.
      // Wait a tiny bit for the canvas to paint, then update the frozen layer.
      setTimeout(() => {
        setFrozenUrl(activeUrl);
        setIsTransitioning(false); // Fade in complete
      }, 150);
    }

    if (isError) {
      return (
        <div className="w-full aspect-[8.5/8] bg-white shadow-lg p-8 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-xs">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Font Not Supported
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                The font <strong>"{requestedFont}"</strong> is causing issues.
                It might be a "Variable Font" which PDF readers struggle with.
              </p>
            </div>
            <div className="text-xs text-blue-600">
              Please select a standard font like <strong>Roboto</strong>,{" "}
              <strong>Open Sans</strong>, or <strong>Lato</strong>.
            </div>
          </div>
        </div>
      );
    }

    // Show loading state while PDF is being generated OR FONT IS LOADING
    if ((!activeUrl && !frozenUrl) || !isFontReady) {
      return (
        <div className="w-full aspect-[8.5/11] bg-white shadow-lg p-8">
          <div className="space-y-0 animate-pulse">
            {/* ... SKELETON UI (Keep existing) ... */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 w-1/3 mx-auto" />
              <div className="flex justify-center gap-4">
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>

            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                <span className="text-sm text-gray-500">
                  {!isFontReady
                    ? `Loading ${requestedFont}...`
                    : "Generating Preview..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Display the generated PDF using react-pdf
    return (
      <div className=" h-full relative bg-black/15 overflow-y-auto">
        {/* Loading Overlay for updates */}
        {(isPending || isTransitioning) && (
          <div className="absolute top-4 right-4 z-50 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300">
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            <span className="text-xs font-medium text-white">Updating...</span>
          </div>
        )}

        <div className="relative min-h-full flex flex-col items-center p-4">
          {/* LAYER 1: FROZEN (BACKGROUND) */}
          {/* This stays visible while the new one loads */}
          {frozenUrl && (
            <div className="absolute inset-0 z-0 flex flex-col items-center p-4 pointer-events-none">
              <Document file={frozenUrl} loading={null}>
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`frozen_page_${index + 1}`}
                    pageNumber={index + 1}
                    className="mb-4 shadow-xl bg-white"
                    width={getPixelWidth()}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            </div>
          )}

          {/* LAYER 2: ACTIVE (FOREGROUND) */}
          {/* This fades in over the old one */}
          <div
            className={cn(
              "relative z-10 transition-opacity duration-300",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
          >
            <Document
              file={activeUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={null}
              externalLinkTarget="_blank"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  className="mb-4 shadow-xl bg-white"
                  width={getPixelWidth()}
                  renderAnnotationLayer={true}
                  renderTextLayer={!isTransitioning} // Only render text when stable
                />
              ))}
            </Document>
          </div>
        </div>
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
