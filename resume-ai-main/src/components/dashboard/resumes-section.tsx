'use client';

import { Trash2, Copy, FileText, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { MiniResumePreview } from '@/components/resume/shared/mini-resume-preview';
import { CreateResumeDialog } from '@/components/resume/management/dialogs/create-resume-dialog';
import { ResumeSortControls, type SortOption, type SortDirection } from '@/components/resume/management/resume-sort-controls';
import type { Profile, Resume } from '@/lib/types';
import { deleteResume, copyResume } from '@/utils/actions/resumes/actions';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { useState, useOptimistic, useTransition } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { toast } from 'sonner';

// Extended Resume type for optimistic updates
interface OptimisticResume extends Resume {
  isOptimistic?: boolean;
  originalId?: string;
}

interface ResumesSectionProps {
  type: 'base' | 'tailored';
  resumes: Resume[];
  profile: Profile;
  sortParam: string;
  directionParam: string;
  currentSort: SortOption;
  currentDirection: SortDirection;
  baseResumes?: Resume[]; // Only needed for tailored type
  canCreateMore?: boolean;
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export function ResumesSection({ 
  type,
  resumes,
  profile,
  sortParam,
  directionParam,
  currentSort,
  currentDirection,
  baseResumes = [],
  canCreateMore
}: ResumesSectionProps) {
  // Optimistic state for deletions
  const [optimisticResumes, removeOptimisticResume] = useOptimistic(
    resumes as OptimisticResume[],
    (state, deletedResumeId: string) => 
      state.filter(resume => resume.id !== deletedResumeId)
  );

  // Optimistic state for copying
  const [optimisticCopiedResumes, addOptimisticCopy] = useOptimistic(
    optimisticResumes,
    (state, newResume: OptimisticResume) => {
      // Always add new resume at the beginning (leftmost position)
      return [newResume, ...state];
    }
  );

  const [, startTransition] = useTransition();
  const [deletingResumes, setDeletingResumes] = useState<Set<string>>(new Set());
  const [copyingResumes, setCopyingResumes] = useState<Set<string>>(new Set());

  const config = {
    base: {
      gradient: 'from-emerald-400 to-teal-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: FileText,
      accent: {
        bg: 'emerald-500/20',
        hover: 'emerald-500/30'
      }
    },
    tailored: {
      gradient: 'from-teal-400 to-cyan-400',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      icon: Sparkles,
      accent: {
        bg: 'teal-500/20',
        hover: 'teal-500/30'
      }
    }
  }[type];

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 7
  });

  // Handle optimistic deletion
  const handleDeleteResume = async (resumeId: string, resumeName: string) => {
    // Add to deleting set for visual feedback
    setDeletingResumes(prev => new Set(prev).add(resumeId));
    
    // Optimistically remove from UI immediately
    removeOptimisticResume(resumeId);
    
    // Show immediate feedback
    toast.loading(`Deleting "${resumeName}"...`, { id: resumeId });
    
    try {
      // Call server action in background
      await deleteResume(resumeId);
      
      // Success feedback
      toast.success(`"${resumeName}" deleted successfully`, { id: resumeId });
    } catch (error) {
      // On error, the optimistic update will automatically rollback
      console.error('Failed to delete resume:', error);
      toast.error(`Failed to delete "${resumeName}". Please try again.`, { id: resumeId });
    } finally {
      // Remove from deleting set
      setDeletingResumes(prev => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
  };

  // Handle optimistic copying
  const handleCopyResume = async (sourceResume: OptimisticResume) => {
    // Add to copying set for visual feedback
    setCopyingResumes(prev => new Set(prev).add(sourceResume.id));
    
    // Create optimistic copy
    const optimisticCopy: OptimisticResume = {
      ...sourceResume,
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary unique ID
      name: `${sourceResume.name} (Copy)`,
      isOptimistic: true,
      originalId: sourceResume.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Optimistically add to UI immediately
    addOptimisticCopy(optimisticCopy);
    
    // Show immediate feedback
    toast.loading(`Copying "${sourceResume.name}"...`, { id: `copy-${sourceResume.id}` });
    
    try {
      // Call server action in background
      await copyResume(sourceResume.id);
      
      // Success feedback - the real resume will appear via revalidation
      toast.success(`"${sourceResume.name}" copied successfully`, { id: `copy-${sourceResume.id}` });
    } catch (error) {
      // On error, the optimistic update will automatically rollback
      console.error('Failed to copy resume:', error);
      toast.error(`Failed to copy "${sourceResume.name}". Please try again.`, { id: `copy-${sourceResume.id}` });
    } finally {
      // Remove from copying set
      setCopyingResumes(prev => {
        const newSet = new Set(prev);
        newSet.delete(sourceResume.id);
        return newSet;
      });
    }
  };

  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedResumes = optimisticCopiedResumes.slice(startIndex, endIndex);

  function handlePageChange(page: number) {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }

  // Create Resume Card Component
  const CreateResumeCard = () => (
    <CreateResumeDialog 
      type={type} 
      profile={profile}
      {...(type === 'tailored' && { baseResumes })}
    >
      <button className={cn(
        "aspect-[8.5/11] rounded-lg",
        "relative overflow-hidden",
        "border-2 border-dashed transition-all duration-500",
        "group/new-resume flex flex-col items-center justify-center gap-4",
        type === 'base' 
          ? "border-emerald-500/40 hover:border-emerald-400"
          : "border-teal-500/40 hover:border-teal-400",
        type === 'base'
          ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10"
          : "bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-cyan-500/10",
        "hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1",
        "after:absolute after:inset-0 after:bg-gradient-to-br",
        type === 'base'
          ? "after:from-emerald-500/[0.05] after:to-teal-500/[0.05]"
          : "after:from-teal-500/[0.05] after:to-cyan-500/[0.05]",
        "after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500 w-full sm:w-auto mr-8 sm:mr-0"
      )}>
        <div className={cn(
          "relative z-10 flex flex-col items-center",
          "transform transition-all duration-500",
          "group-hover/new-resume:scale-105"
        )}>
          <div className={cn(
            "h-12 w-12 rounded-xl",
            "flex items-center justify-center",
            "transform transition-all duration-500",
            "shadow-sm group-hover/new-resume:shadow-md",
            type === 'base'
              ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
              : "bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30",
            "group-hover/new-resume:scale-110"
          )}>
            <config.icon className={cn(
              "h-5 w-5 transition-all duration-500",
              type === 'base' ? "text-emerald-400" : "text-teal-400",
              "group-hover/new-resume:scale-110"
            )} />
          </div>
          
          <span className={cn(
            "mt-4 text-sm font-medium",
            "transition-all duration-500",
            type === 'base' ? "text-emerald-400" : "text-teal-400",
            "group-hover/new-resume:font-semibold"
          )}>
            Create {type === 'base' ? 'Base' : 'Tailored'} Resume
          </span>
          
          <span className={cn(
            "mt-2 text-xs",
            "transition-all duration-500 opacity-0",
            type === 'base' ? "text-emerald-500/70" : "text-teal-500/70",
            "group-hover/new-resume:opacity-70"
          )}>
            Click to start
          </span>
        </div>
      </button>
    </CreateResumeDialog>
  );

  // Limit Reached Card Component
  const LimitReachedCard = () => (
    <Link 
      href="/subscription"
      className={cn(
        "group/limit block",
        "cursor-pointer",
        "transition-all duration-500",
        "hover:-translate-y-1",
      )}
    >
      <div className={cn(
        "aspect-[8.5/11] rounded-lg",
        "relative overflow-hidden",
        "border-2 border-dashed",
        "flex flex-col items-center justify-center gap-4",
        "border-amber-500/40",
        "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10",
        "transition-all duration-500",
        "hover:shadow-xl hover:shadow-amber-500/10",
        "hover:border-amber-400",
        "after:absolute after:inset-0 after:bg-gradient-to-br",
        "after:from-amber-500/[0.05] after:to-orange-500/[0.05]",
        "after:opacity-40 after:transition-opacity after:duration-500",
        "hover:after:opacity-60"
      )}>
        <div className={cn(
          "relative z-10 flex flex-col items-center",
          "transform transition-all duration-500",
          "group-hover/limit:scale-105"
        )}>
          <div className={cn(
            "h-12 w-12 rounded-xl",
            "flex items-center justify-center",
            "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
            "border border-amber-500/30",
            "text-amber-400",
            "shadow-md",
            "transition-all duration-500",
            "group-hover/limit:shadow-lg",
            "group-hover/limit:bg-gradient-to-br",
            "group-hover/limit:from-amber-500/30",
            "group-hover/limit:to-orange-500/30",
            "group-hover/limit:-translate-y-1"
          )}>
            <config.icon className={cn(
              "h-5 w-5",
              "transition-all duration-500",
              "group-hover/limit:scale-110"
            )} />
          </div>
          <span className={cn(
            "mt-4 text-sm font-medium",
            "text-amber-400",
            "transition-all duration-500",
            "group-hover/limit:text-amber-300"
          )}>
            {type === 'base' ? 'Base' : 'Tailored'} Limit Reached
          </span>
          <span className={cn(
            "mt-2 text-xs",
            "text-amber-500/70",
            "underline underline-offset-4",
            "transition-all duration-300",
            "group-hover/limit:text-amber-400"
          )}>
            Upgrade to create more
          </span>
        </div>
      </div>
    </Link>
  );

  // Resume Card Component with optimistic states
  const ResumeCard = ({ resume }: { resume: OptimisticResume }) => {
    const isDeleting = deletingResumes.has(resume.id);
    const isCopying = copyingResumes.has(resume.originalId || resume.id);

    return (
      <div className={cn(
        "group relative transition-all duration-300",
        isDeleting && "opacity-50 pointer-events-none",
        resume.isOptimistic && "animate-in slide-in-from-top-1 duration-300"
      )}>
        <AlertDialog>
          <div className="relative">
            {/* Resume Preview - Conditional Link */}
            {resume.isOptimistic ? (
              // Not clickable during processing
              <div className={cn(
                "cursor-wait",
                "relative"
              )}>
                <MiniResumePreview
                  name={resume.name}
                  type={type}
                  target_role={resume.target_role}
                  createdAt={resume.created_at}
                  className={cn(
                    "transition-all duration-300 opacity-60",
                    "pointer-events-none"
                  )}
                />
                {/* Loading Overlay */}
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Copying...</span>
                  </div>
                </div>
              </div>
            ) : (
              // Normal clickable resume
              <Link href={`/resumes/${resume.id}`}>
                <MiniResumePreview
                  name={resume.name}
                  type={type}
                  target_role={resume.target_role}
                  createdAt={resume.created_at}
                  className="hover:-translate-y-1 transition-transform duration-300"
                />
              </Link>
            )}

            {/* Action Buttons */}
            {!resume.isOptimistic && (
              <div className="absolute bottom-2 left-2 flex gap-2">
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isDeleting}
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      "bg-rose-500/10 hover:bg-rose-500/20",
                      "text-rose-400 hover:text-rose-300",
                      "border border-rose-500/30",
                      "shadow-sm",
                      "transition-all duration-300",
                      "hover:scale-105 hover:shadow-md",
                      "hover:-translate-y-0.5",
                      isDeleting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                
                {/* Copy Button - Check if can create more */}
                {canCreateMore ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      startTransition(() => {
                        handleCopyResume(resume);
                      });
                    }}
                    disabled={isDeleting || isCopying}
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      "bg-teal-500/10 hover:bg-teal-500/20",
                      "text-teal-400 hover:text-teal-300",
                      "border border-teal-500/30",
                      "shadow-sm",
                      "transition-all duration-300",
                      "hover:scale-105 hover:shadow-md",
                      "hover:-translate-y-0.5",
                      (isDeleting || isCopying) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isCopying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          "bg-amber-500/10 hover:bg-amber-500/20",
                          "text-amber-400 hover:text-amber-300",
                          "border border-amber-500/30",
                          "shadow-sm",
                          "transition-all duration-300",
                          "hover:scale-105 hover:shadow-md",
                          "hover:-translate-y-0.5"
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-100">Upgrade Required</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          You&apos;ve reached the maximum number of {type} resumes allowed on the free plan. 
                          Upgrade to Pro to create unlimited resumes and unlock additional features.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100">Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Link href="/subscription" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                            Upgrade to Pro
                          </Link>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
          <AlertDialogContent className="bg-slate-900 border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-100">Delete Resume</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Are you sure you want to delete &quot;{resume.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  startTransition(() => {
                    handleDeleteResume(resume.id, resume.name);
                  });
                }}
                className="bg-rose-500/90 text-white hover:bg-rose-500"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <div className="relative ">
      <div className="flex flex-col gap-4 w-full">
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className={`text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
            {type === 'base' ? 'Base' : 'Tailored'} Resumes
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <ResumeSortControls 
              sortParam={sortParam}
              directionParam={directionParam}
              currentSort={currentSort}
              currentDirection={currentDirection}
            />
          </div>
        </div>

        {/* Desktop Pagination (hidden on mobile) */}
        {optimisticCopiedResumes.length > pagination.itemsPerPage && (
          <div className="hidden md:flex w-full items-start justify-start -mt-4">
            <Pagination className="flex justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                
                {Array.from({ length: Math.ceil(optimisticCopiedResumes.length / pagination.itemsPerPage) }).map((_, index) => {
                  const pageNumber = index + 1;
                  const totalPages = Math.ceil(optimisticCopiedResumes.length / pagination.itemsPerPage);
                  
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={index}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className={cn(
                            "h-8 w-8 p-0",
                            "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
                            pagination.currentPage === pageNumber && "font-medium text-emerald-400 bg-slate-800/50"
                          )}
                        >
                          {pageNumber}
                        </Button>
                      </PaginationItem>
                    );
                  }

                  if (
                    pageNumber === 2 && pagination.currentPage > 3 ||
                    pageNumber === totalPages - 1 && pagination.currentPage < totalPages - 2
                  ) {
                    return (
                      <PaginationItem key={index}>
                        <span className="text-slate-500 px-2">...</span>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === Math.ceil(optimisticCopiedResumes.length / pagination.itemsPerPage)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <div className="relative pb-6">
        {/* Mobile View */}
        <div className="md:hidden w-full space-y-6">
          {/* Mobile Create Resume Button Row */}
          {canCreateMore ? (
            <div className="px-2 w-full  flex">
              <CreateResumeCard />
            </div>
          ) : (
            <div className="px-4 w-full">
              <LimitReachedCard />
            </div>
          )}

          {/* Mobile Resumes Carousel */}
          {paginatedResumes.length > 0 && (
            <div className="w-full">
              <Carousel className="w-full">
                <CarouselContent>
                  {paginatedResumes.map((resume) => (
                    <CarouselItem key={resume.id} className="basis-[85%] pl-4">
                      <ResumeCard resume={resume} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious className="absolute -left-12 top-1/2" />
                  <CarouselNext className="absolute -right-12 top-1/2" />
                </div>
              </Carousel>
            </div>
          )}
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {canCreateMore ? (
            <CreateResumeCard />
          ) : (
            <LimitReachedCard />
          )}

          {paginatedResumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
          {optimisticCopiedResumes.length === 0 && optimisticCopiedResumes.length + 1 < 4 && (
            <div className="col-span-2 md:col-span-1" />
          )}
        </div>
      </div>
    </div>
  );
} 