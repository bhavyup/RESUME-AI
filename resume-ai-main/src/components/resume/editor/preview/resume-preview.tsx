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
    const [url, setUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const debouncedResume = useDebouncedValue(resume, 800);
    const debouncedWidth = useDebouncedValue(containerWidth, 100);
    const [isPending, startTransition] = useTransition();

    // --- 1. INTEGRATE GOOGLE FONTS HOOK ---
    const { loadFontForPDF, fontList } = useGoogleFonts();
    const [isFontReady, setIsFontReady] = useState(false);
    const [isError, setIsError] = useState(false);
    const [fontCapabilities, setFontCapabilities] =
      useState<FontCapabilities | null>(null);

    // Get the requested font from settings
    const requestedFont =
      resume.document_settings?.document_font_family || "Helvetica";

    // --- 2. LOAD FONT EFFECT ---
    useEffect(() => {
      const initFont = async () => {
        // Standard fonts are always ready
        if (
          requestedFont === "Helvetica" ||
          requestedFont === "Times-Roman" ||
          requestedFont === "Courier"
        ) {
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

    // Convert percentage to pixels based on parent container
    const getPixelWidth = useCallback(() => {
      if (typeof window === "undefined") return 0;
      return debouncedWidth;
    }, [debouncedWidth]);

    // Generate resume hash for caching
    const resumeHash = useMemo(() => generateResumeHash(debouncedResume), [debouncedResume]);

    // Add styles to document head
    useEffect(() => {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = customStyles;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }, []);

    // Generate or retrieve PDF from cache
    useEffect(() => {
      // --- 3. BLOCK GENERATION IF FONT NOT READY ---
      if (!isFontReady) return;

      let currentUrl: string | null = null;

      async function generatePDF() {
        // Check cache first - do this synchronously for instant load
        // Note: We might want to invalidate cache if font changed, but hash includes settings so it's safe
        const cached = pdfCache.get(resumeHash);
        if (cached) {
          currentUrl = cached.url;
          setUrl(cached.url);
          setIsError(false);
          return;
        }

        // Generate new PDF if not in cache - wrap in startTransition for non-blocking
        startTransition(async () => {
          try {
            const blob = await pdf(
              <ResumePDFDocument
                resume={debouncedResume}
                variant={variant}
                fontCapabilities={fontCapabilities}
              />
            ).toBlob();
            const newUrl = URL.createObjectURL(blob);
            currentUrl = newUrl;

            // Store in cache with timestamp
            pdfCache.set(resumeHash, { url: newUrl, timestamp: Date.now() });
            setUrl(newUrl);
            setIsError(false);
          } catch (error) {
            console.error("PDF Generation failed", error);
            setIsError(true);
          }
        });
      }

      startTransition(() => {
        generatePDF();
      });

      // Cleanup function
      return () => {
        if (currentUrl && !pdfCache.has(resumeHash)) {
          URL.revokeObjectURL(currentUrl);
        }
      };
    }, [resumeHash, variant, debouncedResume, isFontReady, fontCapabilities]); // Added isFontReady

    // Cleanup on component unmount
    useEffect(() => {
      return () => {
        // Final cleanup of this component's URL if not in cache
        if (url && !pdfCache.has(resumeHash)) {
          URL.revokeObjectURL(url);
        }
      };
    }, [resumeHash, url]);

    // Add state for text layer visibility
    const [shouldRenderTextLayer, setShouldRenderTextLayer] = useState(false);

    // Modify Page component to conditionally render text layer
    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
      setNumPages(numPages);
      // Enable text layer after document is stable
      setTimeout(() => setShouldRenderTextLayer(true), 1000);
    }

    // Disable text layer during updates
    useEffect(() => {
      setShouldRenderTextLayer(false);
    }, [resumeHash, variant]);

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
    if (!url || isPending || !isFontReady) {
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
        {isPending && (
          <div className="absolute top-4 right-4 z-50 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300">
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            <span className="text-xs font-medium text-white">Updating...</span>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="relative h-full flex flex-col items-center p-4"
          externalLinkTarget="_blank"
          loading={null}
          error={
            <div className="flex items-center justify-center h-full text-red-500 text-sm">
              Failed to load preview.
            </div>
          }
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              className="mb-4 shadow-xl bg-white"
              width={getPixelWidth()}
              renderAnnotationLayer={true}
              renderTextLayer={shouldRenderTextLayer}
              onRenderError={(error) => {
                if (error.name !== "AbortException") {
                  console.error("PDF Page Render Error:", error);
                }
              }}
            />
          ))}
        </Document>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to determine if re-render is needed
    return (
      prevProps.resume === nextProps.resume &&
      prevProps.variant === nextProps.variant &&
      prevProps.containerWidth === nextProps.containerWidth
    );
  }
);
