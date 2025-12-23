'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Resume, Profile } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Plus, Brain, Copy } from "lucide-react";
import { createTailoredResume } from "@/utils/actions/resumes/actions";
import { CreateBaseResumeDialog } from "./create-base-resume-dialog";
import { tailorResumeToJob } from "@/utils/actions/jobs/ai";
import { formatJobListing } from "@/utils/actions/jobs/ai";
import { createJob } from "@/utils/actions/jobs/actions";
import { MiniResumePreview } from "../../shared/mini-resume-preview";
import { LoadingOverlay, type CreationStep } from "../loading-overlay";
import { BaseResumeSelector } from "../base-resume-selector"; 
import { ImportMethodRadioGroup } from "../import-method-radio-group";
import { JobDescriptionInput } from "../job-description-input";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";
import { cn } from "@/lib/utils";

interface CreateTailoredResumeDialogProps {
  children: React.ReactNode;
  baseResumes?: Resume[];
  profile?: Profile;
}

export function CreateTailoredResumeDialog({ children, baseResumes, profile }: CreateTailoredResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedBaseResume, setSelectedBaseResume] = useState<string>(baseResumes?.[0]?.id || '');
  const [jobDescription, setJobDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<CreationStep>('analyzing');
  const [dialogStep, setDialogStep] = useState<1 | 2>(1);
  const [importOption, setImportOption] = useState<'import-profile' | 'ai'>('ai');
  const [isBaseResumeInvalid, setIsBaseResumeInvalid] = useState(false);
  const [isJobDescriptionInvalid, setIsJobDescriptionInvalid] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: '', description: '', completeDescription: '' });
  const [showUpgradeButton, setShowUpgradeButton] = useState(true);
  const router = useRouter();
  

  const handleNext = () => {
    if (!selectedBaseResume) {
      setIsBaseResumeInvalid(true);
      toast({
        title: "Required Field Missing",
        description: "Please select a base resume to continue.",
        variant: "destructive",
      });
      return;
    }
    setDialogStep(2);
  };

  const handleBack = () => {
    setDialogStep(1);
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!selectedBaseResume) {
      setIsBaseResumeInvalid(true);
      toast({
        title: "Error",
        description: "Please select a base resume",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim() && importOption === 'ai') {
      setIsJobDescriptionInvalid(true);
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      setCurrentStep('analyzing');
      
      // Reset validation states
      setIsBaseResumeInvalid(false);
      setIsJobDescriptionInvalid(false);

      if (importOption === 'import-profile') {
        // Direct copy logic
        const baseResume = baseResumes?.find(r => r.id === selectedBaseResume);
        if (!baseResume) throw new Error("Base resume not found");

        let jobId: string | null = null;
        let jobTitle = 'Copied Resume';
        let companyName = '';

        if (jobDescription.trim()) {
          // Get model and API key from local storage
          const MODEL_STORAGE_KEY = 'resumeai-default-model'.toLocaleLowerCase();
          const LOCAL_STORAGE_KEY = 'resumeai-api-keys'.toLocaleLowerCase();

          const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
          const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
          let apiKeys = [];

          try {
            apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
          } catch (error) {
            console.error('Error parsing API keys:', error);
          }

          try {
            setCurrentStep('analyzing');
            const formattedJobListing = await formatJobListing(jobDescription, {
              model: selectedModel || '',
              apiKeys
            });

            setCurrentStep('formatting');
            const jobEntry = await createJob(formattedJobListing);
            if (!jobEntry?.id) throw new Error("Failed to create job entry");
            
            jobId = jobEntry.id;
            jobTitle = formattedJobListing.position_title || 'Copied Resume';
            companyName = formattedJobListing.company_name || '';
          } catch (error: Error | unknown) {
            // Prefer to show the specific provider/error message when available
            const raw = error instanceof Error ? error.message : String(error);
            const lower = raw.toLowerCase();

            if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('invalid key') || lower.includes('invalid x-api-key')) {
              setErrorMessage({
                title: 'API Key Error',
                description: `Provider error: ${raw}. Please open Settings → API Keys and verify the key for the selected provider.`,
                completeDescription: `${raw}`,
              });
              setShowUpgradeButton(false);
            } else if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('exceeded')) {
              setErrorMessage({
                title: 'Quota / Rate Limit',
                description: `Provider response: ${raw}. Consider upgrading or retrying later.`,
                completeDescription: `${raw}`,
              });
              setShowUpgradeButton(true);
            } else {
              setErrorMessage({
                title: 'Error',
                description: `Failed to process job description. ${raw}`,
                completeDescription: `${raw}`,
              });
              setShowUpgradeButton(true);
            }

            setShowErrorDialog(true);
            setIsCreating(false);
            return;
          }
        }

        // Close dialog immediately for better UX
        setOpen(false);
        
        // Show immediate loading toast
        // Create resume in background and navigate
        createTailoredResume(
          baseResume,
          jobId,
          jobTitle,
          companyName,
          {
            work_experience: baseResume.work_experience,
            education: baseResume.education.map(edu => ({
              ...edu,
              gpa: edu.gpa?.toString()
            })),
            skills: baseResume.skills,
            projects: baseResume.projects,
            target_role: baseResume.target_role
          }
        ).then((resume) => {
          toast({
            title: "Success",
            description: "Resume created successfully",
          });
          router.push(`/resumes/${resume.id}`);
        }).catch(() => {
          toast({
            title: "Error",
            description: "Failed to create resume. Please try again.",
          });
        });
        return;
      }

      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = 'Resumeai-default-model'.toLocaleLowerCase();
      const LOCAL_STORAGE_KEY = 'resumeai-api-keys'.toLocaleLowerCase();

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error('Error parsing API keys:', error);
      }
      // 1. Format the job listing
      let formattedJobListing;
      try {
        formattedJobListing = await formatJobListing(jobDescription, {
          model: selectedModel || '',
          apiKeys
        });
      } catch (error: Error | unknown) {
        const raw = error instanceof Error ? error.message : String(error);
        const lower = raw.toLowerCase();

        if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('invalid key') || lower.includes('invalid x-api-key')) {
          setErrorMessage({
            title: 'API Key Error',
            description: `Provider error: ${raw}. Please open Settings → API Keys and verify the key for the selected provider.`,
            completeDescription: `${raw}`,
          });
          setShowUpgradeButton(false);
        } else if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('exceeded')) {
          setErrorMessage({
            title: 'Quota / Rate Limit',
            description: `Provider response: ${raw}. Consider upgrading or retrying later.`,
            completeDescription: `${raw}`,
          });
          setShowUpgradeButton(true);
        } else {
          setErrorMessage({
            title: 'Error',
            description: `Failed to analyze job description. ${raw}`,
            completeDescription: `${raw}`,
          });
          setShowUpgradeButton(true);
        }

        setShowErrorDialog(true);
        setIsCreating(false);
        return;
      }

      setCurrentStep('formatting');

      // 2. Create job in database and get ID
      const jobEntry = await createJob(formattedJobListing);
      if (!jobEntry?.id) throw new Error("Failed to create job entry");


      // 3. Get the base resume object
      const baseResume = baseResumes?.find(r => r.id === selectedBaseResume);
      if (!baseResume) throw new Error("Base resume not found");

      setCurrentStep('tailoring');

      // 4. Tailor the resume using the formatted job listing
      let tailoredContent;

      try {
        tailoredContent = await tailorResumeToJob(baseResume, formattedJobListing, {
          model: selectedModel || '',
          apiKeys
        });
      } catch (error: Error | unknown) {
        const raw = error instanceof Error ? error.message : String(error);
        const lower = raw.toLowerCase();

        if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('invalid key') || lower.includes('invalid x-api-key')) {
          setErrorMessage({
            title: 'API Key Error',
            description: `Provider error: ${raw}. Please open Settings → API Keys and verify the key for the selected provider.`,
            completeDescription: `${raw}`,
          });
          setShowUpgradeButton(false);
        } else if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('exceeded')) {
          setErrorMessage({
            title: 'Quota / Rate Limit',
            description: `Provider response: ${raw}. Consider upgrading or retrying later.`,
            completeDescription: `${raw}`,
          });
          setShowUpgradeButton(true);
        } else {
          setErrorMessage({
            title: 'Error',
            description: `Failed to tailor resume. ${raw}`,
            completeDescription: `${raw}`,
          });
          setShowUpgradeButton(true);
        }

        setShowErrorDialog(true);
        setIsCreating(false);
        return;
      }


      setCurrentStep('finalizing');

      // Close dialog immediately for better UX
      setOpen(false);
      
      // 5. Create the tailored resume with job reference and navigate
      createTailoredResume(
        baseResume,
        jobEntry.id,
        formattedJobListing.position_title || '',
        formattedJobListing.company_name || '',
        tailoredContent,
      ).then((resume) => {
        toast({
          title: "Success",
          description: "Resume created successfully",
        });
        router.push(`/resumes/${resume.id}`);
      }).catch(() => {
        toast({
          title: "Error",
          description: "Failed to create resume. Please try again.",
        });
      });
    } catch (error: unknown) {
      console.error('Failed to create resume:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resume",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setJobDescription('');
      setDialogStep(1);
      setImportOption('ai');
      setSelectedBaseResume(baseResumes?.[0]?.id || '');
    }
  };

  if (!baseResumes || baseResumes.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent hideCloseButton className="sm:max-w-[500px] bg-slate-900 border border-slate-700 shadow-2xl shadow-teal-500/5 rounded-xl">
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
              <Sparkles className="w-6 h-6 text-teal-400" />
            </div>
            <div className="text-center space-y-2 max-w-sm">
              <h3 className="font-semibold text-lg text-white">No Base Resumes Found</h3>
              <p className="text-sm text-slate-400">
                You need to create a base resume first before you can create a tailored version.
              </p>
            </div>
            {profile ? (
              <CreateBaseResumeDialog profile={profile}>
                <Button className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Base Resume
                </Button>
              </CreateBaseResumeDialog>
            ) : (
              <Button disabled className="mt-2">
                No profile available to create base resume
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent
          hideCloseButton
          className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 shadow-2xl shadow-teal-500/5 rounded-xl">
          <style jsx global>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
              20%, 40%, 60%, 80% { transform: translateX(2px); }
            }
            .shake {
              animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
            }
          `}</style>
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <Sparkles className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-semibold text-white">
                  Create Tailored Resume
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-400">
                  {dialogStep === 1 
                    ? "Choose a base resume to start with"
                    : "Configure job details and tailoring method"
                  }
                </DialogDescription>
              </div>
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  dialogStep >= 1 ? "bg-teal-500 text-white" : "bg-slate-700 text-slate-400"
                )}>
                  1
                </div>
                <div className={cn(
                  "w-4 h-0.5",
                  dialogStep >= 2 ? "bg-teal-500" : "bg-slate-700"
                )} />
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  dialogStep >= 2 ? "bg-teal-500 text-white" : "bg-slate-700 text-slate-400"
                )}>
                  2
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-2 min-h-[400px] relative">
            {isCreating && <LoadingOverlay currentStep={currentStep} />}
            
            {dialogStep === 1 && (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 mb-1">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Choose Your Foundation</h3>
                  <p className="text-slate-400 max-w-sm mx-auto text-sm">
                    Select a base resume to tailor for this job opportunity.
                  </p>
                </div>
                
                {/* Resume Selector */}
                <div className="space-y-4">
                  <BaseResumeSelector
                    baseResumes={baseResumes}
                    selectedResumeId={selectedBaseResume}
                    onResumeSelect={setSelectedBaseResume}
                    isInvalid={isBaseResumeInvalid}
                  />
                </div>

              </div>
            )}

            {dialogStep === 2 && (
              <div className="space-y-6">

                {/* Selected Resume Summary */}
                <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <MiniResumePreview
                        name={baseResumes.find(r => r.id === selectedBaseResume)?.name || ''}
                        type="base"
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-teal-300">Foundation:</span>
                        <span className="text-sm text-teal-400 font-semibold truncate">
                          {baseResumes.find(r => r.id === selectedBaseResume)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <span className="text-teal-400 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Job Information <span className="text-rose-400">*</span></h4>
                      <p className="text-xs text-slate-400">Paste the job posting details</p>
                    </div>
                  </div>
                  
                  <div className="ml-10">
                    <JobDescriptionInput
                      value={jobDescription}
                      onChange={setJobDescription}
                      isInvalid={isJobDescriptionInvalid}
                    />
                  </div>
                </div>

                {/* Tailoring Method Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <span className="text-teal-400 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Tailoring Method</h4>
                      <p className="text-xs text-slate-400">Choose your customization approach</p>
                    </div>
                  </div>
                  
                  <div className="ml-10">
                    <ImportMethodRadioGroup
                      value={importOption}
                      onChange={setImportOption}
                    />
                  </div>
                </div>

                {/* Method Description */}
                {importOption === 'ai' && (
                  <div className="ml-10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Brain className="w-3 h-3 text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-medium text-blue-300 text-sm">AI Tailoring Process</h5>
                        <ul className="text-xs text-blue-300/80 space-y-0.5">
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            Analyzes job requirements and keywords
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            Optimizes your experience descriptions
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                            Highlights relevant skills and achievements
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {importOption === 'import-profile' && (
                  <div className="ml-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Copy className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-medium text-amber-300 text-sm">Direct Copy Process</h5>
                        <ul className="text-xs text-amber-300/80 space-y-0.5">
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                            Creates an exact copy of your base resume
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                            Links it to the job posting for organization
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                            You can manually edit it afterwards
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex justify-between">
              <div>
                {dialogStep === 2 && (
                  <Button variant="outline" onClick={handleBack} size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                  Cancel
                </Button>
                {dialogStep === 1 && (
                  <Button onClick={handleNext} size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
                    Next
                  </Button>
                )}
                {dialogStep === 2 && (
                  <Button 
                    onClick={handleCreate} 
                    disabled={isCreating}
                    size="sm"
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Resume'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
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
          showUpgrade={showUpgradeButton}
        />
    </>
  );
} 