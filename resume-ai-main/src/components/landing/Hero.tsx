import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { AuthDialog } from "@/components/auth/auth-dialog";

export function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 py-12 md:py-16 lg:py-20">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 space-y-8">
        {/* Product Hunt Badge */}

        {/* Tagline with simplified gradient text */}
        {/* Tagline with dark theme gradient */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="block text-slate-100">Professional</span>
          <span className="block bg-gradient-to-r from-amber-400 via-yellow-500 to-emerald-400 bg-clip-text text-transparent">
            AI-Powered Resume Builder
          </span>
          <span className="block text-slate-200">for Modern Careers</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-400 max-w-md">
          Create ATS-optimized resumes in under 10 minutes. 3x your interview
          chances with AI-powered tailoring.
        </p>

        {/* CTAs with simplified effects */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <AuthDialog>
            <button
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/50 flex items-center justify-center group"
              aria-label="Create your resume now"
            >
              <span>Create Resume</span>
              <svg
                className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </AuthDialog>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium transition-all duration-300 hover:-translate-y-1 hover:bg-slate-700 hover:border-slate-600"
            aria-label="View source code on GitHub"
          >
            View on Github
          </Link>
        </div>

        {/* Feature badges with simplified styling */}
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-sm border border-amber-500/20 text-amber-400">
            AI-Powered
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-sm border border-emerald-500/20 text-emerald-400">
            ATS-Optimized
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-500/10 text-sm border border-slate-500/20 text-slate-400">
            100% Free
          </span>
        </div>

        {/* Simplified social proof section */}
        <div className="mt-8">
          <div className="flex items-center p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:-translate-y-1">
            {/* Stats highlight */}
            <div className="flex-shrink-0 mr-5">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/20">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
                  500+
                </span>
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1">
              <h3 className="font-semibold text-base text-slate-200">
                Join our growing community
              </h3>
              <p className="text-sm text-slate-400">
                Trusted by over 500 tech professionals
              </p>

              <p className="text-xs italic mt-1 text-amber-400">
                &ldquo;Landed 3 interviews in my first week&rdquo; — Sarah K.
              </p>

              {/* Avatar stack */}
              <div className="flex items-center mt-3">
                <div className="flex -space-x-2 mr-3">
                  <Avatar className="h-7 w-7 border-2 border-slate-900">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-900 text-xs font-semibold">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-900">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-900 text-xs font-semibold">
                      SR
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-900">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-slate-900 text-xs font-semibold">
                      KL
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-900">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-slate-900 text-xs font-semibold">
                      MP
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-7 w-7 border-2 border-slate-900">
                    <AvatarFallback className="bg-slate-800 text-xs text-amber-400 font-medium border border-amber-500/20">
                      496+
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-slate-500">
                  Active this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Simplified resume mockups */}
      <div className="w-full lg:w-1/2 relative">
        {/* Main resume mockup with simplified visuals */}
        {/* Main resume mockup */}
        <div className="relative w-full aspect-[3/4] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 overflow-hidden transform transition-all duration-300 hover:-translate-y-2">
          {/* Resume header */}
          <div className="absolute top-0 left-0 w-full h-[15%] bg-gradient-to-r from-amber-600 to-yellow-600">
            <div className="absolute top-6 left-8 w-[50%] h-[20%] bg-white/95 rounded-sm"></div>
            <div className="absolute bottom-0 left-8 w-[30%] h-[20%] bg-white/90 rounded-t-lg"></div>
          </div>

          {/* Resume content */}
          <div className="absolute top-[20%] left-8 w-[80%] h-[4%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[26%] left-8 w-[60%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[30%] left-8 w-[70%] h-[3%] bg-slate-700 rounded-md"></div>

          {/* Experience Section */}
          <div className="absolute top-[36%] left-8 w-[35%] h-[4%] bg-amber-500/20 border border-amber-500/30 rounded-md"></div>
          <div className="absolute top-[42%] left-8 w-[80%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[46%] left-8 w-[75%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[50%] left-8 w-[70%] h-[3%] bg-slate-700 rounded-md"></div>

          {/* Skills Section */}
          <div className="absolute top-[56%] left-8 w-[35%] h-[4%] bg-emerald-500/20 border border-emerald-500/30 rounded-md"></div>
          <div className="absolute top-[62%] right-8 flex flex-wrap gap-2 w-[80%]">
            <div className="h-[12px] w-[60px] bg-amber-400/20 border border-amber-400/30 rounded-full"></div>
            <div className="h-[12px] w-[70px] bg-emerald-400/20 border border-emerald-400/30 rounded-full"></div>
            <div className="h-[12px] w-[50px] bg-blue-400/20 border border-blue-400/30 rounded-full"></div>
            <div className="h-[12px] w-[80px] bg-amber-400/20 border border-amber-400/30 rounded-full"></div>
            <div className="h-[12px] w-[65px] bg-emerald-400/20 border border-emerald-400/30 rounded-full"></div>
          </div>

          {/* Education Section */}
          <div className="absolute top-[70%] left-8 w-[35%] h-[4%] bg-slate-600/50 rounded-md"></div>
          <div className="absolute top-[76%] left-8 w-[80%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[80%] left-8 w-[75%] h-[3%] bg-slate-700 rounded-md"></div>
          <div className="absolute top-[84%] left-8 w-[70%] h-[3%] bg-slate-700 rounded-md"></div>

          {/* AI optimization indicator */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
            AI Optimized
          </div>
        </div>

        {/* Tailored variant */}
        <div className="absolute -bottom-12 -left-8 w-[40%] aspect-[3/4] rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/40 overflow-hidden rotate-[-8deg] z-10 transition-all duration-300 hover:rotate-[-4deg]">
          <div className="w-full h-[10%] bg-gradient-to-r from-emerald-600 to-teal-600">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white/90 rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-700 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-emerald-500/20 border border-emerald-500/30 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-700 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400">
            Tailored
          </div>
        </div>

        {/* Technical variant */}
        <div className="absolute -top-10 -right-6 w-[40%] aspect-[3/4] rounded-xl bg-slate-900 border border-slate-800 shadow-xl shadow-black/40 overflow-hidden rotate-[8deg] z-10 transition-all duration-300 hover:rotate-[4deg]">
          <div className="w-full h-[10%] bg-gradient-to-r from-blue-600 to-cyan-600">
            <div className="absolute top-2 left-2 w-[40%] h-[5%] bg-white/90 rounded-sm"></div>
          </div>
          <div className="absolute top-[15%] left-2 right-2 h-[80%] flex flex-col gap-1">
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[70%] bg-slate-700 rounded-sm"></div>
            <div className="mt-2 h-[8px] w-[50%] bg-blue-500/20 border border-blue-500/30 rounded-sm"></div>
            <div className="h-[8px] w-[80%] bg-slate-700 rounded-sm"></div>
            <div className="h-[8px] w-[75%] bg-slate-700 rounded-sm"></div>
          </div>
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] text-blue-400">
            Technical
          </div>
        </div>
      </div>
    </section>
  );
}
