"use client"
import React from 'react';
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { SplitContent } from '../ui/split-content';
import { AuthDialog } from "@/components/auth/auth-dialog";

const FeatureHighlights = () => {
  // Enhanced features with metrics, testimonials, and benefit-focused language


  // Trusted by logos
  const companies = [
    { name: "Google", logo: "/logos/google.png" },
    { name: "Microsoft", logo: "/logos/microsoft1.webp" },
    { name: "Amazon", logo: "/logos/amazon2.png" },
    { name: "Meta", logo: "/logos/meta3.png" },
    { name: "Netflix", logo: "/logos/netflix.png" },
  ];

  // Statistics counters
  const stats = [
    { value: "500+", label: "Resumes Created" },
    { value: "89%", label: "Interview Rate" },
    { value: "4.9/5", label: "User Rating" },
    { value: "15 min", label: "Average Setup Time" },
  ];

  // Animation variants for scroll reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-slate-950">
      {/* Enhanced decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 blur-3xl"></div>
 
      {/* Redesigned heading section with enhanced visual appeal */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Decorative elements specific to the heading */}
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-500/15 to-teal-500/15 blur-3xl -z-10"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 blur-3xl -z-10"></div>
        
        {/* Leading badges - multi-color approach inspired by Hero.tsx */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-3 mb-4"
        >
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-sm text-emerald-400">
            AI-Powered
          </span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-sm text-teal-400">
            ATS-Optimized
          </span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-sm text-cyan-400">
            100% Free
          </span>
        </motion.div>
        
        {/* Heading with enhanced typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mb-4"
        >
          <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            <span className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Intelligent Resume Optimization
            </span>
            <br />
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="inline-block mt-1 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Powered by Advanced AI
            </motion.span>
          </h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mt-3"
          >
            Leverage cutting-edge AI to tailor your resume for every opportunity, boosting your callback rate by up to <span className="font-semibold text-emerald-400">3x</span>
          </motion.p>
        </motion.div>

        {/* Enhanced statistics with animated reveal - no cards, just colorful inline stats */}
        <motion.div 
          className="flex flex-wrap justify-center gap-8 md:gap-12 mx-auto mt-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {stats.map((stat, index) => {
            // Different gradient colors for each stat
            const gradients = [
              "from-emerald-400 to-teal-400",
              "from-teal-400 to-cyan-400", 
              "from-cyan-400 to-emerald-400",
              "from-emerald-400 to-green-400"
            ];
            
            const textColors = [
              "text-emerald-400",
              "text-teal-400",
              "text-cyan-400", 
              "text-green-400"
            ];
            
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="text-center relative"
              >
                <motion.p 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="text-3xl md:text-4xl font-bold"
                >
                  <span className={`bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>
                    {stat.value}
                  </span>
                </motion.p>
                <p className={`text-sm md:text-base ${textColors[index]} mt-1`}>
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Colorful separators */}
        <div className="flex justify-center my-12">
          <div className="w-16 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-1"></div>
          <div className="w-16 h-[3px] bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mx-1"></div>
          <div className="w-16 h-[3px] bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full mx-1"></div>
        </div>
      </div>
      
      {/* Enhanced Features Section with improved card styling */}
      <div className="flex flex-col gap-24 py-24 relative" id="features">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/30 to-transparent"></div>
            
            <SplitContent
              imageSrc="/SS Chat.png"
              heading="Intelligent Resume Assistant"
              description="Receive instant, actionable recommendations from our sophisticated AI. Enhance your bullet points, refine your achievements, and ensure every word resonates with hiring managers and ATS algorithms."
              imageOnLeft={false}
              imageOverflowRight={true}
              badgeText="90% more effective content"
              badgeGradient="from-emerald-500/20 to-teal-500/20"
              bulletPoints={[
                "Context-aware content recommendations",
                "Instant optimization feedback",
                "Role-specific refinements"
              ]}
            />

            <SplitContent
              imageSrc="/Dashboard Image.png"
              heading="Unified Resume Command Center"
              description="Control your entire job search from a single, elegant interface. Build master resumes, create job-specific variations instantly, and monitor your applications with complete visibility."
              imageOnLeft={true}
              badgeText="Streamline your applications"
              badgeGradient="from-teal-500/20 to-cyan-500/20"
              bulletPoints={[
                "Centralized resume library",
                "Smart version management",
                "Application tracking dashboard"
              ]}
            />

            <SplitContent
              imageSrc="/SS Score.png"
              heading="Advanced Performance Analytics"
              description="Access deep insights into your resume's impact with our data-driven scoring engine. Monitor critical metrics, pinpoint optimization opportunities, and maximize your visibility to both recruiters and ATS platforms."
              imageOnLeft={false}
              imageOverflowRight={true}
              badgeText="3x higher callback rates"
              badgeGradient="from-cyan-500/20 to-emerald-500/20"
              bulletPoints={[
                "Comprehensive ATS compatibility analysis",
                "Strategic keyword recommendations",
                "Actionable improvement roadmap"
              ]}
            />

            <SplitContent
              imageSrc="/SS Cover Letter.png"
              heading="Smart Cover Letter Engine"
              description="Generate persuasive, customized cover letters instantly with our intelligent writing assistant. Automatically adapt your narrative to each role while ensuring a polished, compelling message that stands out."
              imageOnLeft={true}
              badgeText="Save 30+ minutes per letter"
              badgeGradient="from-emerald-500/20 to-green-500/20"
              bulletPoints={[
                "Job-specific content adaptation",
                "Professionally crafted structure",
                "Achievement-focused narratives"
              ]}
            />
      </div>
      
      {/* Social proof section - Trusted by companies */}
      <motion.div 
        className="mt-24 text-center relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        {/* Lighting effect behind logos */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-cyan-500/10 blur-3xl"></div>
        </div>
        
        <h3 className="text-xl text-slate-400 mb-8">Trusted by professionals from companies like</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 max-w-4xl mx-auto">
          {companies.map((company, index) => (
            <div key={index} className="w-24 h-12 relative transition-all duration-300 hover:scale-110">
              {/* Individual glow effect per logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-lg blur-xl"></div>
              <Image 
                src={company.logo} 
                alt={company.name} 
                fill
                className="object-contain filter brightness-110 contrast-110" 
                sizes="100px"
              />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Enhanced CTA section */}
      <motion.div 
        className="mt-28 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto px-6 py-12 rounded-2xl bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Ready to accelerate your career?
            </span>
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join 50,000+ professionals landing more interviews with ResumeAI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AuthDialog>
              <button 
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-medium shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Start Building Free
              </button>
            </AuthDialog>
            <Link 
              href="https://github.com/bhavyup/RESUME-AI/" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-lg bg-slate-800/80 border border-slate-600/40 text-lg font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                View on GitHub
              </span>
            </Link>
          </div>
          
          <p className="text-sm text-slate-400 mt-6 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            No credit card required • 100% free forever
          </p>
        </div>
      </motion.div>

      {/* Sticky mobile CTA - only visible on mobile/tablet */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 px-4">
        <AuthDialog>
          <button 
            className="flex items-center justify-center w-full py-3.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg"
          >
            Start Free Now
          </button>
        </AuthDialog>
      </div>
    </section>
  );
};

export default FeatureHighlights;
