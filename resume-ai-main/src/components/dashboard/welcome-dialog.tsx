'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useState, useEffect } from "react";

interface WelcomeDialogProps {
  isOpen: boolean;
}

export function WelcomeDialog({ isOpen: initialIsOpen }: WelcomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
    >
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Welcome to ResumeAI! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-4 space-y-6">
          <h3 className="font-medium text-slate-200">Here&apos;s how to get started:</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-sm font-semibold bg-gradient-to-br from-emerald-400 to-teal-400 bg-clip-text text-transparent">1</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-slate-400">Fill out your profile with your work experience, education, and skills</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
                <span className="text-sm font-semibold bg-gradient-to-br from-teal-400 to-cyan-400 bg-clip-text text-transparent">2</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-slate-400">Create base resumes for different types of roles you&apos;re interested in</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
                <span className="text-sm font-semibold bg-gradient-to-br from-cyan-400 to-emerald-400 bg-clip-text text-transparent">3</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-slate-400">Use your base resumes to create tailored versions for specific job applications</p>
              </div>
            </div>
          </div>
          <div className="pt-2 space-y-2">
            <Link href="/profile">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25">
                Start by Filling Your Profile
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
              onClick={() => setIsOpen(false)}
            >
              I&apos;ll do this later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 