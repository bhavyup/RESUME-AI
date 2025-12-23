import CoverLetterEditor from "./cover-letter-editor";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Eye, Loader2 } from "lucide-react";
import { useResumeContext } from "@/components/resume/editor/resume-editor-context";
import { toast } from "@/hooks/use-toast";

interface CoverLetterProps {
  containerWidth: number;
}

export default function CoverLetter({ containerWidth }: CoverLetterProps) {
  const { state, dispatch } = useResumeContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleContentChange = useCallback(
    (data: Record<string, unknown>) => {
      dispatch({
        type: "UPDATE_FIELD",
        field: "cover_letter",
        value: {
          content: data.content,
          lastUpdated: new Date().toISOString(),
        },
      });
    },
    [dispatch]
  );

  const generatePdfWithOverlay = async (content: string) => {
    // 1. Create a full-screen overlay to ensure visibility
    const overlay = document.createElement("div");
    overlay.id = "pdf-generation-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #ffffff; /* White background for clean capture */
      z-index: 99999;
      display: flex;
      justify-content: center;
      padding-top: 20px;
    `;

    // 2. Create the content container
    const container = document.createElement("div");
    
    // --- SCALING FIX ---
    // Letter Page is 8.5 inches wide.
    // We set width to 7.5 inches. With 0.5in margins in PDF config, this fits perfectly.
    container.style.cssText = `
      width: 7.5in; 
      background: white;
      color: black;
      font-family: 'Times New Roman', Times, serif; 
      font-size: 11pt; /* Standard doc size */
      line-height: 1.4;
      text-align: left;
      padding: 0.5in; /* Internal padding */
      box-sizing: border-box;
    `;
    
    // 3. Inject Content
    container.innerHTML = content;
    
    // Force styling on all children to prevent Tailwind conflicts
    const styleReset = document.createElement('style');
    styleReset.innerHTML = `
      #pdf-generation-overlay * { 
        color: #000000 !important; 
        background-color: transparent !important;
        box-sizing: border-box !important;
      }
      /* Ensure text wraps correctly */
      #pdf-generation-overlay p, 
      #pdf-generation-overlay li, 
      #pdf-generation-overlay div { 
        word-wrap: break-word; 
        overflow-wrap: break-word; 
        white-space: normal; /* Allow normal wrapping */
        max-width: 100%;
      }
      #pdf-generation-overlay p { margin-bottom: 1em; }
      #pdf-generation-overlay ul, #pdf-generation-overlay ol { margin-left: 24px; margin-bottom: 1em; }
      #pdf-generation-overlay li { margin-bottom: 0.5em; }
    `;
    
    overlay.appendChild(styleReset);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // 4. Force Repaint (Wait for styles to apply)
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 500)));

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 0.5, // 0.5 inch margin on PDF
        filename: `${state.resume.first_name || "Cover"}_${state.resume.last_name || "Letter"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0,
          windowWidth: 1200 // Ensure wider viewport simulation
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(container).save();
      
    } catch (err) {
      console.error("PDF Generation failed:", err);
      throw err;
    } finally {
      document.body.removeChild(overlay);
    }
  };

  if (!state.resume.has_cover_letter) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-emerald-600/50 text-emerald-700 hover:bg-emerald-50"
          onClick={() =>
            dispatch({
              type: "UPDATE_FIELD",
              field: "has_cover_letter",
              value: true,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Cover Letter
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      {/* Interactive editor */}
      <div className="[&_.print-hidden]:hidden">
        <CoverLetterEditor
          initialData={{ content: state.resume.cover_letter?.content || "" }}
          onChange={handleContentChange}
          containerWidth={containerWidth}
        />
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-blue-600/50 text-blue-700"
          disabled={isExporting}
          onClick={async () => {
            const content = state.resume.cover_letter?.content;
            if (!content) {
              return toast({
                title: "Empty Content",
                description: "Type something before exporting.",
                variant: "destructive",
              });
            }

            try {
              setIsExporting(true);
              toast({ title: "Generating PDF...", description: "Please wait a moment." });
              await generatePdfWithOverlay(content);
              toast({ title: "Success", description: "PDF Downloaded" });
            } catch (err: unknown) {
              toast({ title: "Error", description: "Export failed. Please try again. Error : " + (err instanceof Error ? err.message : String(err)), variant: "destructive" });
            } finally {
              setIsExporting(false);
            }
          }}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Download className="h-4 w-4 mr-2" />}
          {isExporting ? "Preparing..." : "Export as PDF"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full border-blue-600/50 text-blue-700 bg-slate-50"
          onClick={() => {
            const content = state.resume.cover_letter?.content;
            if (!content) return toast({ title: "Empty", description: "Nothing to preview" });

            const w = window.open("", "_blank");
            if (!w) return;
            
            w.document.write(`
              <html>
                <head>
                  <title>Preview</title>
                  <style>
                    body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #000; background: #fff; max-width: 7.5in; margin: 0 auto; line-height: 1.4; }
                    p { margin-bottom: 1em; }
                    ul { margin-left: 20px; }
                  </style>
                </head>
                <body>${content}</body>
              </html>
            `);
            w.document.close();
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>
    </div>
  );
}