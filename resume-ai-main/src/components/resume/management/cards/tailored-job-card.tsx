"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Trash2,
  Loader2,
  Plus,
  Sparkles,
  AlertCircle,
  Building2,
  Globe,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Job, Resume } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { updateResume } from "@/utils/actions/resumes/actions";
import { createJob, deleteJob } from "@/utils/actions/jobs/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useResumeContext } from "../../editor/resume-editor-context";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { formatJobListing } from "@/utils/actions/jobs/ai";

interface TailoredJobCardProps {
  jobId: string | null;
  job?: Job | null;
  isLoading?: boolean;
}

export function TailoredJobCard({
  jobId,
  job: externalJob,
  isLoading: externalIsLoading,
}: TailoredJobCardProps) {
  const router = useRouter();
  const { state, dispatch } = useResumeContext();

  const [internalJob, setInternalJob] = useState<Job | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(true);

  const effectiveJob = externalJob ?? internalJob;
  const effectiveIsLoading = externalIsLoading ?? internalIsLoading;

  useEffect(() => {
    if (externalJob !== undefined) return;

    async function fetchJob() {
      if (!jobId) {
        setInternalJob(null);
        setInternalIsLoading(false);
        return;
      }

      try {
        setInternalIsLoading(true);
        const supabase = createClient();
        const { data: jobData, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (error) {
          if (error.code !== "PGRST116") throw error;
          setInternalJob(null);
          return;
        }

        setInternalJob(jobData);
      } catch (error) {
        console.error("Error fetching job:", error);
        if (error instanceof Error && error.message !== "No rows returned") {
          setInternalJob(null);
        }
      } finally {
        setInternalIsLoading(false);
      }
    }

    fetchJob();
  }, [jobId, externalJob]);

  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    jobDescription?: string;
  }>({});

  const formatWorkLocation = (workLocation: Job["work_location"]) => {
    if (!workLocation) return "Location N/A";
    return workLocation.replace("_", " ");
  };

  const validateJobDescription = (value: string) => {
    const errors: { jobDescription?: string } = {};
    if (!value.trim()) {
      errors.jobDescription = "Job description is required";
    } else if (value.trim().length < 50) {
      errors.jobDescription =
        "Please provide more detail (at least 50 characters)";
    }
    return errors;
  };

  const handleCreateJobWithAI = async () => {
    const errors = validateJobDescription(jobDescription);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsFormatting(true);
      const MODEL_STORAGE_KEY = "resumeai-default-model";
      const LOCAL_STORAGE_KEY = "ResumeAI-api-keys";
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (e) {
        console.error(e);
      }

      const formattedJob = await formatJobListing(jobDescription, {
        model: selectedModel || "",
        apiKeys,
      });

      setIsFormatting(false);
      setIsCreating(true);

      const newJob = await createJob(formattedJob);
      dispatch({ type: "UPDATE_FIELD", field: "job_id", value: newJob.id });
      await updateResume(state.resume.id, {
        ...state.resume,
        job_id: newJob.id,
      });

      setCreateDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job listing",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
      setIsCreating(false);
      setJobDescription("");
    }
  };

  // --- SUB-COMPONENTS ---

  const LoadingSkeleton = () => (
    <div className="space-y-6 p-2 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3 w-full">
          <div className="h-7 w-2/3 bg-slate-800 rounded-md" />
          <div className="h-5 w-1/3 bg-slate-800/60 rounded-md" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-6 w-24 bg-slate-800 rounded-full" />
        <div className="h-6 w-24 bg-slate-800 rounded-full" />
        <div className="h-6 w-24 bg-slate-800 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-4 w-full bg-slate-800/40 rounded" />
        <div className="h-4 w-5/6 bg-slate-800/40 rounded" />
        <div className="h-4 w-4/6 bg-slate-800/40 rounded" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="group relative overflow-hidden border border-dashed border-slate-700 hover:border-violet-500/50 rounded-lg p-8 transition-all duration-300 bg-slate-900/30 hover:bg-slate-900/50">
      <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10">
        <div className="p-3 bg-slate-800/50 rounded-full group-hover:bg-violet-900/30 group-hover:scale-110 transition-all duration-300 border border-slate-700 group-hover:border-violet-500/30">
          <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-violet-400" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-200">No Job Linked</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Link a job description to unlock AI tailoring features.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 text-white hover:bg-violet-500 transition-all shadow-[0_0_15px_-3px_rgba(124,58,237,0.5)] border border-violet-500/50 h-9 text-xs uppercase tracking-wider font-medium">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Add Job Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] gap-6 bg-slate-950 border-slate-800 text-slate-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-100">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Add Job Description
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Paste the full job description. AI will extract key skills,
                requirements, and formatting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <Textarea
                  placeholder="Paste JD here (e.g., 'We are looking for a Senior React Developer...')"
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    if (validationErrors.jobDescription)
                      setValidationErrors({});
                  }}
                  className={cn(
                    "relative min-h-[240px] resize-none font-mono text-sm leading-relaxed p-4",
                    "bg-slate-900 border-slate-700 text-slate-300",
                    "focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50",
                    "placeholder:text-slate-600",
                    validationErrors.jobDescription &&
                      "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                  )}
                />
                {validationErrors.jobDescription && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] text-red-300 bg-red-950/80 px-2 py-1 rounded border border-red-500/30 backdrop-blur-sm">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.jobDescription}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="sm:justify-between items-center border-t border-slate-800 pt-4">
              <span className="text-[10px] text-slate-500 hidden sm:flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                AI Extraction Protocol Ready
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setCreateDialogOpen(false)}
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateJobWithAI}
                  disabled={isFormatting || isCreating}
                  className="bg-violet-600 hover:bg-violet-500 text-white min-w-[120px]"
                >
                  {isFormatting || isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      <span className="text-xs uppercase tracking-wide">
                        Processing
                      </span>
                    </>
                  ) : (
                    "Analyze & Save"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  // --- MAIN RENDER ---

  if (!jobId) return <EmptyState />;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <AnimatePresence mode="wait">
        {effectiveIsLoading ? (
          <LoadingSkeleton />
        ) : effectiveJob ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100 leading-tight tracking-tight">
                  {effectiveJob.position_title || "Untitled Position"}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-slate-400">
                  <Building2 className="w-4 h-4 text-violet-400" />
                  <span className="font-medium text-sm">
                    {effectiveJob.company_name || "Unknown Company"}
                  </span>
                </div>
              </div>

              {/* Meta Badges */}
              <div className="flex flex-wrap gap-2">
                {effectiveJob.location && (
                  <Badge
                    variant="outline"
                    className="bg-slate-900/50 text-slate-300 border-slate-700 py-1"
                  >
                    <MapPin className="w-3 h-3 mr-1.5 text-cyan-400" />
                    {effectiveJob.location}
                  </Badge>
                )}
                {effectiveJob.work_location && (
                  <Badge
                    variant="outline"
                    className="bg-slate-900/50 text-slate-300 border-slate-700 py-1 capitalize"
                  >
                    <Globe className="w-3 h-3 mr-1.5 text-blue-400" />
                    {formatWorkLocation(effectiveJob.work_location)}
                  </Badge>
                )}
                {effectiveJob.salary_range && (
                  <Badge
                    variant="outline"
                    className="bg-slate-900/50 text-slate-300 border-slate-700 py-1"
                  >
                    <DollarSign className="w-3 h-3 mr-1 text-emerald-400" />
                    {effectiveJob.salary_range}
                  </Badge>
                )}
                {effectiveJob.employment_type && (
                  <Badge
                    variant="outline"
                    className="bg-slate-900/50 text-slate-300 border-slate-700 py-1 capitalize"
                  >
                    <Clock className="w-3 h-3 mr-1.5 text-violet-400" />
                    {effectiveJob.employment_type.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {effectiveJob.description && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Role Description
                </h4>
                <div className="text-sm text-slate-300/90 leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-lg border border-slate-800/60 shadow-inner">
                  {effectiveJob.description}
                </div>
              </div>
            )}

            {/* Keywords */}
            {effectiveJob.keywords && effectiveJob.keywords.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Key Requirements
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {effectiveJob.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/50 border border-slate-700 text-slate-300 shadow-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="p-6 text-center border border-dashed border-red-900/50 rounded-lg bg-red-950/10 text-red-400">
            <p className="text-sm">Failed to load job details.</p>
            <Button
              variant="link"
              onClick={() => router.refresh()}
              className="text-red-400 underline text-xs mt-1"
            >
              Reload
            </Button>
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
}

interface TailoredJobAccordionProps {
  resume: Resume;
  job: Job | null;
  isLoading?: boolean;
}

export function TailoredJobAccordion({
  resume,
  job,
  isLoading,
}: TailoredJobAccordionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (resume.is_base_resume) return null;

  const handleDelete = async () => {
    if (!resume.job_id) return;
    try {
      setIsDeleting(true);
      await deleteJob(resume.job_id);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AccordionItem
      value="job"
      className="mb-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50 shadow-lg transition-all data-[state=open]:ring-1 data-[state=open]:ring-violet-500/20 data-[state=open]:border-slate-700"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-900/50 transition-colors group">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300",
              job
                ? "bg-violet-950/30 text-violet-400 border border-violet-500/20 group-hover:border-violet-500/40"
                : "bg-slate-900 text-slate-500 border border-slate-800"
            )}
          >
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span
              className={cn(
                "text-sm font-semibold transition-colors",
                job ? "text-slate-100" : "text-slate-400"
              )}
            >
              {job?.position_title || "Target Job Listing"}
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              {job ? job.company_name : "Link a job to enable AI tailoring"}
            </span>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-0 pb-0 border-t border-slate-800/60 bg-slate-950/30">
        <div className="p-4 sm:p-6">
          <TailoredJobCard
            jobId={resume.job_id || null}
            job={job}
            isLoading={isLoading}
          />

          {job && (
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-slate-500 hover:text-red-400 hover:bg-red-950/10 h-8 text-xs font-medium"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-2" />
                )}
                Unlink Job
              </Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
