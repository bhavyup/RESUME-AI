import { Resume, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from 'react';
// import { readStreamableValue } from 'ai/rsc';
import type { AIConfig } from "@/utils/ai-tools";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import { generate } from "@/utils/actions/cover-letter/actions";
import { useResumeContext } from "../resume-editor-context";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";
import { CreateTailoredResumeDialog } from "@/components/resume/management/dialogs/create-tailored-resume-dialog";


interface CoverLetterPanelProps {
  resume: Resume;
  job: Job | null;
  aiConfig?: AIConfig;
}

export function CoverLetterPanel({
  resume,
  job,
  aiConfig,
}: CoverLetterPanelProps) {
  const { dispatch } = useResumeContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '' });

  const updateField = (field: keyof Resume, value: Resume[keyof Resume]) => {
    dispatch({ 
      type: 'UPDATE_FIELD',
      field,
      value
    });
  };

  const generateCoverLetter = async () => {
    if (!job) return;
    
    setIsGenerating(true);
    
    try {
      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = 'resumeai-default-model';
      const LOCAL_STORAGE_KEY = 'resumeai-api-keys';

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error('Error parsing API keys:', error);
      }

      // Prompt
      const prompt = `Write a professional cover letter for the following job using my resume information:
      ${JSON.stringify(job)}
      
      ${JSON.stringify(resume)}
      
      Today's date is ${new Date().toLocaleDateString()}.

      Please use my contact information in the letter:
      Full Name: ${resume.first_name} ${resume.last_name}
      Email: ${resume.email}
      ${resume.phone_number ? `Phone: ${resume.phone_number}` : ''}
      ${resume.linkedin_url ? `LinkedIn: ${resume.linkedin_url}` : ''}
      ${resume.github_url ? `GitHub: ${resume.github_url}` : ''}

      ${customPrompt ? `\nAdditional requirements: ${customPrompt}` : ''}`;
      

      console.log('-------------------------------generate cover letter--------------------------------------')
      console.log('[Cover Letter Generation] Using Model:', selectedModel);
      console.log('Resume.is_base_resume:', resume.is_base_resume);
      console.log('---------------------------------------------------------------------')
      console.log('[Cover Letter Generation] Prompt:', prompt);
      
      // Call The Model
      const { output } = await generate(prompt, {
        ...aiConfig,
        model: selectedModel || '',
        apiKeys
      });

      // Generated Content (server returns the final string)
      const generatedContent = output as string;

      console.log('Generated Cover Letter:', generatedContent);

      // Update resume context with the generated content
      updateField('cover_letter', {
        content: generatedContent,
      });
      
      console.log('Cover letter updated in resume context.');
      
    } catch (error: Error | unknown) {
      console.error('Generation error:', error);
      if (error instanceof Error && (
          error.message.toLowerCase().includes('api key') || 
          error.message.toLowerCase().includes('unauthorized') ||
          error.message.toLowerCase().includes('invalid key') ||
          error.message.toLowerCase().includes('invalid x-api-key'))
      ) {
        setErrorMessage({
          title: "API Key Error",
          description: "There was an issue with your API key. Please check your settings and try again."
        });
      } else {
        setErrorMessage({
          title: "Error",
          description: "Failed to generate cover letter. Please try again."
        });
      }
      setShowErrorDialog(true);
    } finally {
      setIsGenerating(false);
    }
  };

  if (resume.is_base_resume) {
    return (
      <div className={cn(
        "p-6 backdrop-blur-sm bg-violet-950/30 border-2 border-violet-500/50",
        "space-y-6 text-center relative"
      )}>
        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-violet-400/70" />
        <div className="absolute -top-6 right-0 w-4 h-4 border-t-2 border-r-2 border-violet-400/70" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-violet-400/70" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-violet-400/70" />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
        
        <div className="flex items-center gap-3 justify-center relative">
          <div className="p-2 bg-violet-950/50 border border-violet-500/50">
            <FileText className="h-5 w-5 text-violet-400" />
          </div>
          <h3 className="text-lg font-mono font-bold text-violet-100 uppercase tracking-wider">Cover Letter Protocol</h3>
        </div>
        
        <p className="text-sm text-violet-300/80 font-mono">
          {"// ERROR: BASE RESUME DETECTED // TAILORING REQUIRED"}
        </p>
        
        <CreateTailoredResumeDialog 
          baseResumes={[resume]}
        >
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-violet-500/50 bg-violet-950/30 text-violet-300 hover:bg-violet-900/50 hover:border-violet-400 rounded-none font-mono uppercase tracking-wider"
          >
            <Plus className="h-4 w-4 mr-2" />
            Initialize Tailoring
          </Button>
        </CreateTailoredResumeDialog>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-6 backdrop-blur-sm bg-black/50 border-2 border-cyan-500/50 relative",
      "space-y-6"
    )}>
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/70" />
      <div className="absolute -top-6 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/70" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/70" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/70" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
      
      <div className="flex items-center gap-3 mb-4 relative">
        <div className="p-2 bg-cyan-950/50 border border-cyan-500/50">
          <FileText className="h-5 w-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-mono font-bold text-cyan-100 uppercase tracking-wider">Cover Letter System</h3>
      </div>

      {resume.has_cover_letter ? (
        <div className="space-y-6">
          <div className={cn(
            "w-full p-4",
            "bg-slate-800/50",
            "border border-slate-700/50",
            "shadow-inner",
            "rounded-xl"
          )}>
            <AIImprovementPrompt
              value={customPrompt}
              onChange={setCustomPrompt}
              isLoading={isGenerating}
              placeholder="e.g., Focus on leadership experience and technical skills"
              hideSubmitButton
            />
          </div>

          <div className="space-y-4 relative">
            <Button
              variant="default"
              size="sm"
              className={cn(
                "w-full h-12 rounded-none",
                "bg-cyan-950/50 hover:bg-cyan-900/50",
                "text-cyan-300 hover:text-cyan-100 font-mono uppercase tracking-wider",
                "border border-cyan-500/50 hover:border-cyan-400",
                "shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]",
                "transition-all duration-300"
              )}
              onClick={generateCoverLetter}
              disabled={isGenerating || !job}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Execute Generation
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className={cn(
                "w-full h-12 rounded-none",
                "bg-red-950/30 hover:bg-red-900/50",
                "text-red-400 hover:text-red-300 font-mono uppercase tracking-wider",
                "border border-red-500/50 hover:border-red-400"
              )}
              onClick={() => updateField('has_cover_letter', false)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Terminate Protocol
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 relative">
          <div className="p-6 bg-slate-950/50 border border-dashed border-slate-700/50 text-center">
            <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">{"// NO PROTOCOL INITIALIZED //"}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full h-12 rounded-none",
              "bg-slate-900/50 hover:bg-cyan-950/30",
              "border-slate-700 hover:border-cyan-500/50",
              "text-slate-400 hover:text-cyan-300 font-mono uppercase tracking-wider",
              "transition-all duration-300"
            )}
            onClick={() => updateField('has_cover_letter', true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Initialize Protocol
          </Button>
        </div>
      )}

      <ApiErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={errorMessage}
        onUpgrade={() => {
          setShowErrorDialog(false);
          window.location.href = '/subscription';
        }}
        onSettings={() => {
          setShowErrorDialog(false);
          window.location.href = '/settings';
        }}
      />
    </div>
  );
} 