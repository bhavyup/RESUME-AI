"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export function CreatorStory() {
  return (
    <section
      className="py-20 md:py-24 relative overflow-hidden"
      id="creator-story"
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-100/20 blur-[150px]"
      ></div>
      {/* Dark background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section heading with dark styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 inline-block mb-4 backdrop-blur-sm"
          >
            The Story Behind ResumeAI
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
            Meet the Creator
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-[400px_1fr] gap-10 items-center"
        >
          {/* Image Area with dark styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mx-auto md:mx-0"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative aspect-square w-64 md:w-96 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-amber-500/20 group">
              <Image
                src="/bhavy.webp"
                alt="Bhavy, creator of ResumeAI"
                fill
                sizes="(max-width: 768px) 256px, 384px"
                className="object-cover"
                priority
              />
              {/* Optional gradient overlay for better integration */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </motion.div>

          {/* Story Content with dark styling */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative"
          >
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Why I Built ResumeAI
              </h2>

              <div className="space-y-4 text-lg text-slate-300 leading-relaxed">
                <p>
                  Hi, I&apos;m Bhavy! I&apos;m a Computer Science student at the
                  VMSB Uttarakhand Technical University in Dehradun, and like
                  many students, I&apos;ve been through the challenging journey
                  of searching for tech internships.
                </p>

                <p>
                  ResumeAI is my passion project - a free, open-source resume
                  builder designed to help students and developers create
                  ATS-optimized resumes without the hefty subscription costs.
                  Because everyone deserves access to great tools.
                </p>

                <div className="flex gap-6 pt-4">
                  <motion.a
                    href="https://x.com/bhavy_upreti"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-amber-500/20 text-amber-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter
                  </motion.a>
                  <motion.a
                    href="https://github.com/bhavyup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-emerald-500/20 text-emerald-400 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
