import { Background } from "@/components/landing/Background";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import { Hero } from "@/components/landing/Hero";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { VideoShowcase } from "@/components/landing/VideoShowcase";
//import { CreatorStory } from "@/components/landing/creator-story";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/layout/footer";
import { NavLinks } from "@/components/layout/nav-links";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";

// Page-specific metadata that extends the base metadata from layout.tsx
export const metadata: Metadata = {
  title: "ResumeAI - Next-Generation AI Resume Builder",
  description: "Build professional, ATS-friendly resumes in minutes. Boost your interview callback rate by 3x with intelligent AI optimization.",
  openGraph: {
    title: "ResumeAI - Next-Generation AI Resume Builder",
    description: "Build professional, ATS-friendly resumes in minutes. Boost your interview callback rate by 3x with intelligent AI optimization.",
    url: "https://ResumeAI.com",
  },
  twitter: {
    title: "ResumeAI - Next-Generation AI Resume Builder",
    description: "Build professional, ATS-friendly resumes in minutes. Boost your interview callback rate by 3x with intelligent AI optimization.",
  },
};

export default async function Page() {
  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is authenticated, redirect to home page
  if (user) {
    redirect("/home");
  }
  
  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <Script
        id="schema-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ResumeAI",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "Build professional, ATS-friendly resumes in minutes. Boost your interview callback rate by 3x with intelligent AI optimization.",
            "operatingSystem": "Web",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "500"
            }
          })
        }}
      />
    
      <main aria-label="ResumeAI landing page" className="bg-slate-950">
        {/* Dark Professional Navigation */}
        <nav aria-label="Main navigation" className="border-b border-slate-800 fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl z-[50] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
            <div className="flex items-center justify-between h-16">
              <Logo />
              <NavLinks />
            </div>
          </div>
        </nav>
        
        {/* Background component */}
        <Background />
        
        {/* Main content */}
        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-24 flex flex-col justify-center">
          {/* Hero Section */}
          <Hero />
        </div>
        
        {/* Video Showcase Section */}
        <section id="product-demo">
          <VideoShowcase />
        </section>
        
        {/* Feature Highlights Section */}
        <section id="features" aria-labelledby="features-heading">
          <FeatureHighlights />
        </section>
        
        {/* Creator Story Section
        <section id="about" aria-labelledby="about-heading">
          <CreatorStory />
        </section> */}
        
        {/* Pricing Plans Section */}
        <section id="pricing" aria-labelledby="pricing-heading">
          <PricingPlans />
        </section>
        
        {/* FAQ Section */}
        <FAQ />

        <Footer variant="static"/>
      </main>
    </>
  );
}