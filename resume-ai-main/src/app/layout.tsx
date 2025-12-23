import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as LocalToaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/footer";
import { AppHeader } from "@/components/layout/app-header";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ResumeAI.com"),
  title: {
    default: "ResumeAI - Next-Generation AI Resume Builder",
    template: "%s | ResumeAI"
  },
  description: "Build professional, ATS-friendly resumes in minutes. Boost your interview callback rate by 3x with intelligent AI optimization.",
  applicationName: "ResumeAI",
  keywords: ["resume builder", "AI resume", "ATS optimization", "tech jobs", "career tools", "job application", "intelligent resume", "professional resume"],
  authors: [{ name: "ResumeAI" }],
  creator: "ResumeAI",
  publisher: "ResumeAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    type: "website",
    siteName: "ResumeAI",
    title: "ResumeAI - Next-Generation AI Resume Builder",
    description: "Build professional, ATS-friendly resumes in minutes. Boost your interview callback rate by 3x with intelligent AI optimization.",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "ResumeAI - Intelligent Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeAI - AI-Powered Resume Builder",
    description: "Create tailored, ATS-optimized resumes powered by AI. Land your dream tech job with personalized resume optimization.",
    images: ["/og.webp"],
    creator: "@resumeai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // verification: {
  //   google: "google-site-verification-code", // Replace with actual verification code
  // },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Run all async operations in parallel for faster loading
  const [supabase, cookieStore] = await Promise.all([
    createClient(),
    cookies()
  ]);
  
  const { data: { user } } = await supabase.auth.getUser();

  // Detect impersonation via cookie set during /admin/impersonate flow
  const isImpersonating = cookieStore.get('is_impersonating')?.value === 'true';

  // Don't block layout on subscription - let AppHeader fetch it client-side
  // This makes navigation instant

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950`}>
        {isImpersonating && user && (
          <div className="bg-amber-500 text-white text-center text-sm py-2">
            Impersonating&nbsp;<span className="font-semibold">{user.email ?? user.id}</span>.&nbsp;
            <Link href="/stop-impersonation" className="underline font-medium">
              Stop impersonating
            </Link>
          </div>
        )}
        <div className="relative min-h-screen h-screen flex flex-col">
          {user && <AppHeader />}
          {/* Padding for header and footer */}
          <main className="py-14 h-full">
            {children}
            <Analytics />
          </main>
          {user && <Footer /> }
        </div>
        {/* Local toaster for in-app toasts (use-toast) */}
        <LocalToaster />
        {/* Sonner toaster kept for components that use sonner.toast */}
        <SonnerToaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            style: {
              fontSize: "1rem",
              padding: "16px",
              minWidth: "400px",
              maxWidth: "500px",
            },
          }}
        />
      </body>
    </html>
  );
}