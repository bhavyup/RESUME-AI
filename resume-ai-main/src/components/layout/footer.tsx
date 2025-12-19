import Link from "next/link";
import { Github, Linkedin, Mail, Instagram } from "lucide-react";

interface FooterProps {
  variant?: "fixed" | "static";
}

export function Footer({ variant = "fixed" }: FooterProps) {
  return (
    <footer
      className={`h-auto md:h-14 w-full border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl z-50 ${
        variant === "fixed" ? "fixed bottom-0 left-0 right-0" : "static"
      }`}
    >
      <div className="container py-4 md:py-0 flex flex-col md:flex-row h-auto md:h-14 items-center justify-between gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-2 md:gap-4">
          <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-center md:text-left">
            ResumeAI © 2025
          </p>
          <span className="text-xs text-slate-600 text-center">
            Made with ❤️
          </span>
        </div>
        <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="mailto:support@resumeai.com"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors underline-offset-4 hover:underline"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Support</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="https://instagram.com/bhavy_upreti"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
            >
              <Instagram className="h-5 w-5 md:h-4 md:w-4" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/bhavy-upreti/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
            >
              <Linkedin className="h-5 w-5 md:h-4 md:w-4" />
            </Link>
            <Link
              href="https://github.com/bhavyup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-violet-400  h.over:bg-white transition-colors p-1"
            >
              <Github className="h-5 w-5 md:h-4 md:w-4" />
            </Link>
          </div>
        </nav>
      </div>
    </footer>
  );
}
