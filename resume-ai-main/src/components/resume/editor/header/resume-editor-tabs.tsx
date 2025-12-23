/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { User, Briefcase, FolderGit2, GraduationCap, Wrench, LayoutTemplate } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResumeEditorTabs() {
  const handleTabClick = (value: string) => () => {
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(new CustomEvent('resume-editor:tab-change', { detail: { value } }));
    } catch (err) {
      // ignore
    }
  };
  return (
    <>
      {/* AI Tools Section */}
      <div className="mb-4">
        <TabsList className="h-full w-full relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden grid grid-cols-2 gap-2 p-2 shadow-2xl shadow-violet-500/10">
          
          {/* Resume Score */}
          <TabsTrigger 
            value="resume-score" 
            onClick={handleTabClick('resume-score')}
            className="group relative h-12 flex items-center justify-center gap-2 px-4 rounded-xl font-semibold transition-all duration-500 overflow-hidden
              data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-teal-500 data-[state=active]:to-cyan-500
              data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/30
              data-[state=inactive]:bg-slate-800/50 data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-700/50 data-[state=inactive]:hover:text-white
              data-[state=inactive]:border data-[state=inactive]:border-white/5"
          >
            <svg className="h-4 w-4 transition-transform duration-300 group-data-[state=active]:scale-110" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span className="text-sm tracking-wide">AI Score</span>
            
            {/* Shimmer effect on active */}
            <div className="absolute inset-0 -translate-x-full group-data-[state=active]:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </TabsTrigger>

          {/* Cover Letter */}
          <TabsTrigger 
            value="cover-letter" 
            onClick={handleTabClick('cover-letter')}
            className="group relative h-12 flex items-center justify-center gap-2 px-4 rounded-xl font-semibold transition-all duration-500 overflow-hidden
              data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:via-orange-500 data-[state=active]:to-pink-500
              data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-amber-500/30
              data-[state=inactive]:bg-slate-800/50 data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-700/50 data-[state=inactive]:hover:text-white
              data-[state=inactive]:border data-[state=inactive]:border-white/5"
          >
            <svg className="h-4 w-4 transition-transform duration-300 group-data-[state=active]:scale-110" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span className="text-sm tracking-wide">Cover Letter</span>
            
            {/* Shimmer effect on active */}
            <div className="absolute inset-0 -translate-x-full group-data-[state=active]:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Main Content Tabs */}
      <TabsList className="h-full w-full relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden grid grid-cols-3 @[500px]:grid-cols-6 gap-1 p-1.5 shadow-2xl shadow-slate-900/50">
        {/* Basic Info Tab */}
        <TabsTrigger 
          value="basic" 
          onClick={handleTabClick('basic')}
          className="group relative h-10 flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl font-medium transition-all duration-300 overflow-hidden
            data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500/20 data-[state=active]:via-purple-500/10 data-[state=active]:to-fuchsia-500/20
            data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 data-[state=active]:border data-[state=active]:border-violet-500/30
            data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-800/50 data-[state=inactive]:hover:text-white"
        >
          <User className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=active]:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] tracking-wide font-semibold">Info</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-hover:opacity-50 transition-opacity duration-500" />
        </TabsTrigger>

        {/* Work Tab */}
        <TabsTrigger 
          value="work" 
          onClick={handleTabClick('work')}
          className="group relative h-10 flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl font-medium transition-all duration-300 overflow-hidden
            data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500/20 data-[state=active]:via-blue-500/10 data-[state=active]:to-cyan-500/20
            data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 data-[state=active]:border data-[state=active]:border-cyan-500/30
            data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-800/50 data-[state=inactive]:hover:text-white"
        >
          <Briefcase className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=active]:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] tracking-wide font-semibold">Work</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-hover:opacity-50 transition-opacity duration-500" />
        </TabsTrigger>

        {/* Projects Tab */}
        <TabsTrigger 
          value="projects" 
          onClick={handleTabClick('projects')}
          className="group relative h-10 flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl font-medium transition-all duration-300 overflow-hidden
            data-[state=active]:bg-gradient-to-br data-[state=active]:from-fuchsia-500/20 data-[state=active]:via-purple-500/10 data-[state=active]:to-pink-500/20
            data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-fuchsia-500/20 data-[state=active]:border data-[state=active]:border-fuchsia-500/30
            data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-800/50 data-[state=inactive]:hover:text-white"
        >
          <FolderGit2 className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=active]:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] tracking-wide font-semibold">Projects</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-hover:opacity-50 transition-opacity duration-500" />
        </TabsTrigger>

        {/* Education Tab */}
        <TabsTrigger 
          value="education" 
          onClick={handleTabClick('education')}
          className="group relative h-10 flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl font-medium transition-all duration-300 overflow-hidden
            data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500/20 data-[state=active]:via-blue-500/10 data-[state=active]:to-indigo-500/20
            data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 data-[state=active]:border data-[state=active]:border-indigo-500/30
            data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-800/50 data-[state=inactive]:hover:text-white"
        >
          <GraduationCap className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=active]:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] tracking-wide font-semibold">Education</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-hover:opacity-50 transition-opacity duration-500" />
        </TabsTrigger>

        {/* Skills Tab */}
        <TabsTrigger 
          value="skills" 
          onClick={handleTabClick('skills')}
          className="group relative h-10 flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl font-medium transition-all duration-300 overflow-hidden
            data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-500/20 data-[state=active]:via-pink-500/10 data-[state=active]:to-red-500/20
            data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/20 data-[state=active]:border data-[state=active]:border-rose-500/30
            data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-800/50 data-[state=inactive]:hover:text-white"
        >
          <Wrench className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=active]:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] tracking-wide font-semibold">Skills</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-hover:opacity-50 transition-opacity duration-500" />
        </TabsTrigger>

        {/* Settings Tab */}
        <TabsTrigger 
          value="settings" 
          onClick={handleTabClick('settings')}
          className="group relative h-10 flex flex-col items-center justify-center gap-0.5 px-2 rounded-xl font-medium transition-all duration-300 overflow-hidden
            data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-500/20 data-[state=active]:via-gray-500/10 data-[state=active]:to-zinc-500/20
            data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-500/20 data-[state=active]:border data-[state=active]:border-slate-500/30
            data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:bg-slate-800/50 data-[state=inactive]:hover:text-white"
        >
          <LayoutTemplate className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=active]:scale-110" strokeWidth={2.5} />
          <span className="text-[10px] tracking-wide font-semibold">Layout</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-data-[state=active]:opacity-100 group-hover:opacity-50 transition-opacity duration-500" />
        </TabsTrigger>
      </TabsList>

    
    </>
  );
} 