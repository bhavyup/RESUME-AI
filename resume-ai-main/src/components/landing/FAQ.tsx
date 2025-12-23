"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ() {
  // Refs for intersection observer
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // FAQ data - focused on ResumeAI specific questions
  const faqItems: FAQItem[] = [
    {
      question: "How does ResumeAI's intelligent optimization work?",
      answer:
        "Our advanced AI engine analyzes job postings and intelligently adapts your resume content, terminology, and presentation to align perfectly with what hiring managers and ATS platforms prioritize. It refines your accomplishments, emphasizes relevant competencies, and ensures your background directly addresses position requirements.",
    },
    {
      question: "Is ResumeAI completely free?",
      answer:
        "Absolutely! Our free tier offers 2 base resumes and 5 customized versions using your API credentials. Self-hosting is also available. Our Pro subscription ($20/month) unlocks unlimited resumes and grants access to premium AI capabilities without requiring your own API setup.",
    },
    {
      question: "What distinguishes ResumeAI from other platforms?",
      answer:
        "ResumeAI is purpose-built for tech professionals, featuring intelligent optimization, full ATS compatibility, and the capability to generate numerous tailored versions from a single master resume. Additionally, it's open-source with self-hosting options for maximum data sovereignty.",
    },
    {
      question: "How quickly can I build a resume with ResumeAI?",
      answer:
        "Most professionals complete their initial resume in under 15 minutes. Once established, creating job-specific versions takes only 2-3 minutes with our intelligent assistant.",
    },
    {
      question: "Are resumes built with ResumeAI ATS-compatible?",
      answer:
        "Definitely! ResumeAI is engineered to produce ATS-optimized documents. Our templates utilize proper structure, strategic keyword placement, and formatting that ATS platforms can accurately scan and rank favorably.",
    },
    {
      question: "Can I integrate my own AI API credentials?",
      answer:
        "Yes! Our free tier supports your own OpenAI, Anthropic, or compatible AI provider credentials. This provides complete control over expenses and usage while maintaining full access to ResumeAI's capabilities.",
    },
    {
      question: "How secure is my personal information?",
      answer:
        "Privacy is paramount. All information is encrypted, and self-hosting is available for total control. We never distribute your personal details or resume content to external parties.",
    },
    {
      question: "Is ResumeAI suitable for students or career transitions?",
      answer:
        "Certainly! ResumeAI excels for students, career transitioners, and professionals at every stage. Our AI effectively highlights transferable capabilities and optimizes your presentation regardless of your background level.",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20 px-4 relative overflow-hidden scroll-mt-20 bg-slate-950"
      id="faq"
      aria-labelledby="faq-heading"
    >
      {/* Simplified background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 blur-3xl"></div>

      {/* Compact Heading Section */}
      <div className="relative z-10 max-w-2xl mx-auto text-center mb-12">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-cyan-500/10 blur-3xl"></div>
        </div>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-3"
        >
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-sm text-emerald-400 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
        </motion.div>

        {/* Compact heading */}
        <motion.h2
          id="faq-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
        >
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Common Questions
          </span>
        </motion.h2>

        {/* Shorter description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base md:text-lg text-slate-400"
        >
          Everything you need to know about getting started with ResumeAI
        </motion.p>
      </div>

      {/* Compact FAQ Accordion */}
      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <Accordion type="single" collapsible className="space-y-2">
          {faqItems.map((item, index) => (
            <motion.div key={index} variants={itemVariants} className="group">
              <AccordionItem
                value={`item-${index}`}
                className="border border-slate-700/50 rounded-lg bg-slate-900/40 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-200 hover:shadow-sm hover:border-emerald-500/30 px-4 py-1"
              >
                <AccordionTrigger className="text-left hover:no-underline group-hover:text-emerald-400 transition-colors duration-200 py-4 text-sm md:text-base font-medium text-slate-200 [&[data-state=open]]:text-emerald-400">
                  <span className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed pb-4 pl-6 text-sm">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
