import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12 md:py-16 lg:py-20">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 space-y-8">
        {/* Product Hunt Badge - Dark Theme */}
        <div className="flex justify-start">
          <a 
            href="https://www.producthunt.com/products/ResumeAI" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-transform duration-300 hover:-translate-y-1"
          >
            <Image 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=982199&theme=dark&t=1750633039421" 
              alt="ResumeAI - AI-Powered Resume Builder | Product Hunt" 
              width={250} 
              height={54} 
            />
          </a>
        </div>
        
        {/* Tagline - Dark Professional */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          <span className="block">Next-generation</span>
          <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">AI-Powered Resume</span>
          <span className="block">that gets you hired faster</span>
        </h1>
        
        {/* Description - Professional gray */}
        <p className="text-lg md:text-xl text-slate-400 max-w-md">
          Build professional, ATS-friendly resumes in minutes. Boost your interview callback rate by 3x with intelligent AI optimization.
        </p>
        
        {/* CTAs - Modern dark buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <AuthDialog>
            <button 
              className="group px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1 flex items-center justify-center"
              aria-label="Build your resume now"
            >
              <span>Build Your Resume</span>
              <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </AuthDialog>
          <Link 
            href="https://github.com/bhavyup/RESUME-AI/" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 font-medium transition-all duration-300 hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-1 backdrop-blur-sm"
            aria-label="View source code on GitHub"
          >
            View on GitHub
          </Link>
        </div>
        
        {/* Feature badges - Dark theme */}
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-sm border border-emerald-500/20 text-emerald-400 backdrop-blur-sm">AI-Powered</span>
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-sm border border-teal-500/20 text-teal-400 backdrop-blur-sm">ATS-Optimized</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-sm border border-cyan-500/20 text-cyan-400 backdrop-blur-sm">100% Free</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-sm border border-blue-500/20 text-blue-400 backdrop-blur-sm">Privacy-First</span>
        </div>
        
        {/* Social proof - Dark glassmorphism */}
        <div className="mt-8">
          <div className="flex items-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-slate-600/50">
            {/* Stats highlight */}
            <div className="flex-shrink-0 mr-5">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">500+</span>
              </div>
            </div>
            
            {/* Text content */}
            <div className="flex-1">
              <h3 className="font-semibold text-base text-white">Join thousands of professionals</h3>
              <p className="text-sm text-slate-400">Trusted by 500+ tech job seekers worldwide</p>
              
              <p className="text-xs italic mt-1 text-emerald-400">&ldquo;Got 3 interview calls within a week using ResumeAI&rdquo; — Sarah K.</p>
              
              {/* Avatar stack */}
              <div className="flex items-center mt-3">
                <div className="flex -space-x-2 mr-3">
                  <Avatar className="h-7 w-7 border-2 border-slate-800">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-xs">JD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-800">
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs">SR</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-800">
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs">KL</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-800">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs">MP</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-800">
                    <AvatarFallback className="bg-slate-700 text-xs text-emerald-400 font-medium">496+</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-slate-500">Active this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Content - Dark resume mockups */}
      <div className="w-full lg:w-1/2 relative">
        {/* Main resume mockup - Dark professional */}
        <div className="relative w-full aspect-[3/4] rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-emerald-500/20">
          {/* Resume header */}
          <div className="absolute top-0 left-0 w-full h-[15%] bg-gradient-to-r from-emerald-500 to-teal-500">
            <div className="absolute top-6 left-8 w-[50%] h-[20%] bg-white rounded-sm"></div>
            <div className="absolute bottom-0 left-8 w-[30%] h-[20%] bg-white/90 rounded-t-lg"></div>
          </div>
          
          {/* Resume content */}
          <div className="absolute top-[20%] left-8 w-[80%] h-[4%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[26%] left-8 w-[60%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[30%] left-8 w-[70%] h-[3%] bg-slate-700 rounded-md"></div>
          
          {/* Experience Section */}
          <div className="absolute top-[36%] left-8 w-[35%] h-[4%] bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-md"></div>
          <div className="absolute top-[42%] left-8 w-[80%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[46%] left-8 w-[75%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[50%] left-8 w-[70%] h-[3%] bg-slate-700 rounded-md"></div>
          
          {/* Skills Section */}
          <div className="absolute top-[56%] left-8 w-[35%] h-[4%] bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-md"></div>
          <div className="absolute top-[62%] right-8 flex flex-wrap gap-2 w-[80%]">
            <div className="h-[12px] w-[60px] bg-emerald-500/20 border border-emerald-500/30 rounded-full"></div>
            <div className="h-[12px] w-[70px] bg-teal-500/20 border border-teal-500/30 rounded-full"></div>
            <div className="h-[12px] w-[50px] bg-cyan-500/20 border border-cyan-500/30 rounded-full"></div>
            <div className="h-[12px] w-[80px] bg-blue-500/20 border border-blue-500/30 rounded-full"></div>
            <div className="h-[12px] w-[65px] bg-indigo-500/20 border border-indigo-500/30 rounded-full"></div>
          </div>
          
          {/* Education Section */}
          <div className="absolute top-[70%] left-8 w-[35%] h-[4%] bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-md"></div>
          <div className="absolute top-[76%] left-8 w-[80%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[80%] left-8 w-[75%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[84%] left-8 w-[70%] h-[3%] bg-slate-700 rounded-md"></div>
          
          {/* AI optimization indicator */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400">
            AI Optimized
          </div>
        </div>
        
        {/* Tailored resume variant */}
        <div className="absolute -bottom-12 -left-8 w-[40%] aspect-[3/4] rounded-xl bg-slate-900 border border-slate-700/50 shadow-xl overflow-hidden rotate-[-8deg] z-10 transition-all duration-300 hover:rotate-[-4deg] hover:shadow-pink-500/20">
          <div className="w-full h-[10%] bg-gradient-to-r from-pink-500 to-rose-500">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-700 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-pink-500/20 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-700 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-pink-500/20 border border-pink-500/30 text-[8px] text-pink-400">
            Tailored
          </div>
        </div>
        
        {/* Technical role variant */}
        <div className="absolute -top-10 -right-6 w-[40%] aspect-[3/4] rounded-xl bg-slate-900 border border-slate-700/50 shadow-xl overflow-hidden rotate-[8deg] z-10 transition-all duration-300 hover:rotate-[4deg] hover:shadow-cyan-500/20">
          <div className="w-full h-[10%] bg-gradient-to-r from-cyan-500 to-blue-500">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-700 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-cyan-500/20 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-700 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-[8px] text-cyan-400">
            Technical
          </div>
        </div>
      </div>
    </section>
  );
}