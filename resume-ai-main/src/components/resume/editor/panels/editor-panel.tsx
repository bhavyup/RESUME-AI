'use client';

import { Resume, Profile, Job, DocumentSettings } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import React, { Suspense, useRef } from "react";
import { cn } from "@/lib/utils";
import { ResumeEditorActions } from "../actions/resume-editor-actions";
import { TailoredJobAccordion } from "../../management/cards/tailored-job-card";
import { BasicInfoForm } from "../forms/basic-info-form";
import ChatBot from "../../assistant/chatbot";
import { CoverLetterPanel } from "./cover-letter-panel";
import {
  WorkExperienceForm,
  EducationForm,
  SkillsForm,
  ProjectsForm,
  DocumentSettingsForm
} from '../dynamic-components';
import { ResumeEditorTabs } from "../header/resume-editor-tabs";
import ResumeScorePanel from "./resume-score-panel";



interface EditorPanelProps {
  resume: Resume;
  profile: Profile;
  job: Job | null;
  isLoadingJob: boolean;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
}

export function EditorPanel({
  resume,
  profile,
  job,
  isLoadingJob,
  onResumeChange,
}: EditorPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatBotRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col sm:mr-4 relative h-full max-h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 sm:pr-2" ref={scrollAreaRef}>
          <div className="relative px-1 pb-5" >
            {/* Glassmorphic Header */}
            <div className={cn(
              "sticky top-0 z-40 backdrop-blur-xl rounded-2xl mb-6 border",
              "bg-slate-900/80 shadow-2xl",
              resume.is_base_resume
                ? "border-violet-500/20 shadow-violet-500/10"
                : "border-cyan-500/20 shadow-cyan-500/10"
            )}>
              <div className="p-4">
                <ResumeEditorActions
                  onResumeChange={onResumeChange}
                />
              </div>
            </div>


            {/* Tailored Job Accordion */}
            <Accordion type="single" collapsible defaultValue="basic" className="mt-6">
              <TailoredJobAccordion
                resume={resume}
                job={job}
                isLoading={isLoadingJob}
              />
            </Accordion>

            {/* Tabs */}  
            <Tabs defaultValue="basic" className="mb-4">
              <ResumeEditorTabs />

              {/* Basic Info Form */}
              <TabsContent value="basic">
                <BasicInfoForm
                  profile={profile}
                />
              </TabsContent>

              {/* Work Experience Form */}
              <TabsContent value="work">
                <Suspense fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-muted rounded-md w-1/3" />
                    <div className="h-24 bg-muted rounded-md" />
                    <div className="h-24 bg-muted rounded-md" />
                  </div>
                }>
                  <WorkExperienceForm
                    experiences={resume.work_experience}
                    onChange={(experiences) => onResumeChange('work_experience', experiences)}
                    profile={profile}
                    targetRole={resume.target_role}
                  />
                </Suspense>
              </TabsContent>

              {/* Projects Form */}
              <TabsContent value="projects">
                <Suspense fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-muted rounded-md w-1/3" />
                    <div className="h-24 bg-muted rounded-md" />
                  </div>
                }>
                  <ProjectsForm
                    projects={resume.projects}
                    onChange={(projects) => onResumeChange('projects', projects)}
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Education Form */}
              <TabsContent value="education">
                <Suspense fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-muted rounded-md w-1/3" />
                    <div className="h-24 bg-muted rounded-md" />
                  </div>
                }>
                  <EducationForm
                    education={resume.education}
                    onChange={(education) => onResumeChange('education', education)}
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Skills Form */}
              <TabsContent value="skills">
                <Suspense fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-muted rounded-md w-1/3" />
                    <div className="h-24 bg-muted rounded-md" />
                  </div>
                }>
                  <SkillsForm
                    skills={resume.skills}
                    onChange={(skills) => onResumeChange('skills', skills)}
                    profile={profile}
                  />
                </Suspense>
              </TabsContent>

              {/* Document Settings Form */}
              <TabsContent value="settings">
                <Suspense fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-muted rounded-md w-1/3" />
                    <div className="h-24 bg-muted rounded-md" />
                  </div>
                }>
                  <DocumentSettingsForm
                    documentSettings={resume.document_settings!}
                    onChange={(_field: 'document_settings', value: DocumentSettings) => {
                      onResumeChange('document_settings', value);
                    }}
                  />
                </Suspense>
              </TabsContent>

              {/* Cover Letter Form */}
              <TabsContent value="cover-letter">
                <CoverLetterPanel
                  resume={resume}
                  job={job}
                />
              </TabsContent>


              {/* Resume Score Form */}
              <TabsContent value="resume-score">
                <ResumeScorePanel
                  resume={resume}
                  job={job}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Floating AI Assistant */}
      <div 
        ref={chatBotRef}
        className={cn(
          "relative w-full max-h-full z-50 rounded-t-2xl border-t backdrop-blur-xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)]",
          resume.is_base_resume
            ? "bg-slate-900/95 border-violet-500/20 shadow-violet-500/20"
            : "bg-slate-900/95 border-cyan-500/20 shadow-cyan-500/20"
        )}
        // style={{ maxHeight: '85vh' }}
      >
        <ChatBot 
          resume={resume} 
          onResumeChange={onResumeChange}
          job={job}
        />
      </div>
    </div>
  );
} 