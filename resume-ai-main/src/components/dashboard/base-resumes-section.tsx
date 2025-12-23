'use client';

import { useState, useTransition, useOptimistic, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Loader2, 
  Sparkles,
  Crown,
  Clock,
  MoreHorizontal,
  Eye,
  PenLine,
  Zap,
  Layers,
  ArrowRight,
  ArrowUpDown,
  ArrowDownAZ,
  Calendar,
  Briefcase,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateResumeDialog } from '@/components/resume/management/dialogs/create-resume-dialog';
import { deleteResume, copyResume } from '@/utils/actions/resumes/actions';
import { toast } from 'sonner';
import type { Profile, Resume } from '@/lib/types';

interface OptimisticResume extends Resume {
  isOptimistic?: boolean;
  originalId?: string;
}

type SortOption = 'name' | 'jobTitle' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface BaseResumesSectionProps {
  resumes: Resume[];
  profile: Profile;
  canCreateMore: boolean;
}

export function BaseResumesSection({ 
  resumes, 
  profile, 
  canCreateMore 
}: BaseResumesSectionProps) {
  const [, startTransition] = useTransition();
  const [deletingResumes, setDeletingResumes] = useState<Set<string>>(new Set());
  const [copyingResumes, setCopyingResumes] = useState<Set<string>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [optimisticResumes, updateOptimisticResumes] = useOptimistic(
    resumes as OptimisticResume[],
    (state, action: { type: 'delete' | 'add'; payload: string | OptimisticResume }) => {
      if (action.type === 'delete') {
        return state.filter(r => r.id !== action.payload);
      }
      if (action.type === 'add') {
        return [action.payload as OptimisticResume, ...state];
      }
      return state;
    }
  );

  const handleDelete = async (resume: OptimisticResume) => {
    setDeletingResumes(prev => new Set(prev).add(resume.id));
    updateOptimisticResumes({ type: 'delete', payload: resume.id });
    toast.loading(`Deleting "${resume.name}"...`, { id: resume.id });

    try {
      await deleteResume(resume.id);
      toast.success(`"${resume.name}" deleted`, { id: resume.id });
    } catch {
      toast.error(`Failed to delete "${resume.name}"`, { id: resume.id });
    } finally {
      setDeletingResumes(prev => {
        const next = new Set(prev);
        next.delete(resume.id);
        return next;
      });
    }
  };

  const handleCopy = async (resume: OptimisticResume) => {
    setCopyingResumes(prev => new Set(prev).add(resume.id));
    
    const optimisticCopy: OptimisticResume = {
      ...resume,
      id: `temp-${Date.now()}`,
      name: `${resume.name} (Copy)`,
      isOptimistic: true,
      originalId: resume.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    updateOptimisticResumes({ type: 'add', payload: optimisticCopy });
    toast.loading(`Copying "${resume.name}"...`, { id: `copy-${resume.id}` });

    try {
      await copyResume(resume.id);
      toast.success(`"${resume.name}" copied`, { id: `copy-${resume.id}` });
    } catch {
      toast.error(`Failed to copy "${resume.name}"`, { id: `copy-${resume.id}` });
    } finally {
      setCopyingResumes(prev => {
        const next = new Set(prev);
        next.delete(resume.id);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const sortedResumes = useMemo(() => {
    return [...optimisticResumes].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'jobTitle':
          comparison = (a.target_role || '').localeCompare(b.target_role || '');
          break;
        case 'createdAt':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [optimisticResumes, sortBy, sortDirection]);

  const sortOptions = [
    { value: 'name' as SortOption, label: 'Name', icon: ArrowDownAZ },
    { value: 'jobTitle' as SortOption, label: 'Job Title', icon: Briefcase },
    { value: 'createdAt' as SortOption, label: 'Creation Date', icon: Calendar },
  ];

  const handleSortChange = (option: SortOption) => {
    if (option === sortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  return (
    <section className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-lg opacity-50" />
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Layers className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Base Resumes
              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                {optimisticResumes.length}
              </span>
            </h2>
            <p className="text-sm text-slate-400">Your foundation for tailored applications</p>
          </div>
        </div>
        
        {/* Sort Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-0 "
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort by {sortOptions.find(o => o.value === sortBy)?.label}</span>
              <span className="sm:hidden">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 focus-visible:outline-none">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer focus-visible:outline-none"
              >
                <option.icon className="mr-2 h-4 w-4" />
                {option.label}
                {sortBy === option.value && (
                  <Check className="ml-auto h-4 w-4 text-emerald-400" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Create New Card */}
        {canCreateMore ? (
          <CreateResumeDialog type="base" profile={profile}>
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group relative aspect-[4/5] rounded-2xl overflow-hidden",
                "border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/60",
                "bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-slate-900/80",
                "transition-all duration-500 cursor-pointer",
                "flex flex-col items-center justify-center gap-4",
                "hover:shadow-2xl hover:shadow-emerald-500/20"
              )}
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.15),transparent_50%)]" />
              </div>

              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-emerald-400/40"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${30 + (i % 3) * 20}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 0.6, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Icon Container */}
              <motion.div 
                className="relative z-10"
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className={cn(
                  "relative h-16 w-16 rounded-2xl",
                  "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
                  "border border-emerald-500/30 group-hover:border-emerald-400/50",
                  "flex items-center justify-center",
                  "shadow-lg shadow-emerald-500/10",
                  "transition-all duration-500"
                )}>
                  <Plus className="h-8 w-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </div>
              </motion.div>

              {/* Text */}
              <div className="relative z-10 text-center">
                <p className="text-base font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  Create Base Resume
                </p>
                <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors mt-1">
                  Start from scratch or import
                </p>
              </div>

              {/* Bottom Glow Line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </CreateResumeDialog>
        ) : (
          <Link href="/subscription">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className={cn(
                "group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer",
                "border-2 border-dashed border-amber-500/30 hover:border-amber-400/60",
                "bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-slate-900/80",
                "flex flex-col items-center justify-center gap-4",
                "hover:shadow-2xl hover:shadow-amber-500/20",
                "transition-all duration-500"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-30" />
                <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-amber-400" />
                </div>
              </div>
              
              <div className="text-center relative z-10">
                <p className="text-base font-semibold text-amber-400">Limit Reached</p>
                <p className="text-xs text-slate-500 mt-1">Upgrade to Pro for unlimited</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-amber-400/70 group-hover:text-amber-400 transition-colors">
                <span>View Plans</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        )}

        {/* Resume Cards */}
        <AnimatePresence mode="popLayout">
          {sortedResumes.map((resume, index) => {
            const isDeleting = deletingResumes.has(resume.id);
            const isCopying = copyingResumes.has(resume.originalId || resume.id);
            const isHovered = hoveredCard === resume.id;

            return (
              <motion.div
                key={resume.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.05 
                }}
                onHoverStart={() => setHoveredCard(resume.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className={cn(
                  "group relative aspect-[4/5] rounded-2xl overflow-hidden",
                  "bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90",
                  "border border-slate-700/50 hover:border-emerald-500/30",
                  "shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-emerald-500/10",
                  "transition-all duration-500",
                  isDeleting && "opacity-50 pointer-events-none",
                  resume.isOptimistic && "animate-pulse"
                )}
              >
                {/* Card Background Effects */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
                </div>

                {/* Loading Overlay */}
                {resume.isOptimistic && (
                  <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                      <span className="text-xs text-emerald-400">Creating...</span>
                    </div>
                  </div>
                )}

                {/* Top Badge & Actions */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm"
                  >
                    <FileText className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Base</span>
                  </motion.div>

                  {!resume.isOptimistic && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-7 w-7 rounded-full",
                            "bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm",
                            "border border-slate-600/50 hover:border-slate-500/50",
                            "text-slate-400 hover:text-white",
                            "opacity-0 group-hover:opacity-100 transition-all duration-300"
                          )}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-48 bg-slate-900/95 backdrop-blur-xl border-slate-700"
                      >
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/resumes/${resume.id}`}
                            className="flex items-center gap-2 text-slate-200 hover:text-white cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                            View Resume
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link 
                            href={`/resumes/${resume.id}`}
                            className="flex items-center gap-2 text-slate-200 hover:text-white cursor-pointer"
                          >
                            <PenLine className="h-4 w-4" />
                            Edit Resume
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700/50" />
                        {canCreateMore ? (
                          <DropdownMenuItem
                            onClick={() => startTransition(() => handleCopy(resume))}
                            disabled={isCopying}
                            className="flex items-center gap-2 text-slate-200 hover:text-white cursor-pointer"
                          >
                            {isCopying ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            Duplicate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            asChild
                            className="flex items-center gap-2 text-amber-400 cursor-pointer"
                          >
                            <Link href="/subscription">
                              <Crown className="h-4 w-4" />
                              Upgrade to Copy
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-slate-700/50" />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="flex items-center gap-2 text-rose-400 hover:text-rose-300 cursor-pointer focus:text-rose-300"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-900 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Resume</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Are you sure you want to delete &quot;{resume.name}&quot;? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => startTransition(() => handleDelete(resume))}
                                className="bg-rose-500 text-white hover:bg-rose-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Resume Preview Content */}
                <Link href={`/resumes/${resume.id}`} className="block h-full">
                  <div className="relative h-full p-4 pt-14 flex flex-col">
                    {/* Mini Document Preview */}
                    <div className="flex-1 relative">
                      <div className={cn(
                        "absolute inset-0 rounded-lg overflow-hidden",
                        "bg-gradient-to-br from-slate-700/30 to-slate-800/30",
                        "border border-slate-600/30",
                        "p-3"
                      )}>
                        {/* Document Header Mock */}
                        <div className="text-center mb-3 pb-2 border-b border-slate-600/30">
                          <div className="h-2 w-20 mx-auto rounded-full bg-slate-500/50 mb-1.5" />
                          <div className="h-1.5 w-28 mx-auto rounded-full bg-slate-600/50" />
                        </div>
                        
                        {/* Document Content Mock */}
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="h-1.5 w-12 rounded-full bg-emerald-500/30" />
                            <div className="space-y-1">
                              <div className="h-1 w-full rounded-full bg-slate-600/40" />
                              <div className="h-1 w-4/5 rounded-full bg-slate-600/40" />
                              <div className="h-1 w-11/12 rounded-full bg-slate-600/40" />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="h-1.5 w-14 rounded-full bg-emerald-500/30" />
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className="h-1 w-20 rounded-full bg-slate-500/50" />
                                <div className="h-1 w-12 rounded-full bg-slate-600/40" />
                              </div>
                              <div className="h-1 w-full rounded-full bg-slate-600/40" />
                              <div className="h-1 w-3/4 rounded-full bg-slate-600/40" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="h-1.5 w-10 rounded-full bg-emerald-500/30" />
                            <div className="flex flex-wrap gap-1.5">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-1 w-10 rounded-full bg-slate-600/40" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 rounded-lg bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent flex items-end justify-center pb-4"
                      >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm">
                          <Eye className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-400">View Resume</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Resume Info Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <h3 className="font-semibold text-white truncate text-sm group-hover:text-emerald-400 transition-colors">
                        {resume.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-500">
                          {formatDate(resume.updated_at || resume.created_at)}
                        </span>
                        {resume.target_role && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-500 truncate">
                              {resume.target_role}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {optimisticResumes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center py-12"
        >
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-emerald-400" />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-white">No base resumes yet</h3>
          <p className="mt-2 text-slate-400 max-w-md mx-auto">
            Create your first base resume to get started. Base resumes serve as templates for tailored versions.
          </p>
          {canCreateMore && (
            <CreateResumeDialog type="base" profile={profile}>
              <Button className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25">
                <Zap className="h-4 w-4 mr-2" />
                Create Your First Resume
              </Button>
            </CreateResumeDialog>
          )}
        </motion.div>
      )}
    </section>
  );
}
