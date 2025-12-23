'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Loader2 } from "lucide-react";
import { AuthProvider } from "./auth-context";
import { signInWithGithub, signInWithGoogle } from "@/app/auth/login/actions";
import { Separator } from "@/components/ui/separator";

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const gradientClasses = {
  base: "bg-gradient-to-r from-emerald-500 to-teal-500",
  hover: "hover:from-emerald-400 hover:to-teal-400",
  shadow: "shadow-lg shadow-emerald-500/25",
  animation: "transition-all duration-300",
};

interface TabButtonProps {
  value: "login" | "signup";
  children: React.ReactNode;
}

interface AuthDialogProps {
  children?: React.ReactNode;
}

function TabButton({ value, children }: TabButtonProps) {
  return (
    <TabsTrigger 
      value={value}
      className="
        relative flex-1 h-9 px-3 text-sm font-medium rounded-lg
        transition-all duration-200 ease-out
        data-[state=inactive]:text-slate-400 data-[state=inactive]:bg-transparent
        data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:shadow-md
        data-[state=inactive]:hover:text-emerald-400 data-[state=inactive]:hover:bg-slate-800/50
        border-0 shadow-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-0
      "
    >
      {children}
    </TabsTrigger>
  );
}

function SocialAuth() {
  const [loadingProvider, setLoadingProvider] = useState<'github' | 'google' | null>(null);

  const handleGithubSignIn = async () => {
    try {
      setLoadingProvider('github');
      const result = await signInWithGithub();
      
      if (!result.success) {
        console.error('❌ GitHub sign in error:', result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('💥 Failed to sign in with GitHub:', error);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoadingProvider('google');
      const result = await signInWithGoogle();
      
      if (!result.success) {
        console.error('❌ Google sign in error:', result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('💥 Failed to sign in with Google:', error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3 mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="bg-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-900 px-3 text-slate-400">
            or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="
            h-10 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-emerald-500/50
            text-slate-200 font-medium transition-all duration-200
            focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0
            rounded-lg
          "
          onClick={handleGoogleSignIn}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="
            h-10 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-emerald-500/50
            text-slate-200 font-medium transition-all duration-200
            focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0
            rounded-lg
          "
          onClick={handleGithubSignIn}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === 'github' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function AuthDialog({ children }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      {/* AUTH DIALOG TRIGGER BUTTON */}
      <DialogTrigger asChild>
        {children || (
          <Button 
            size="lg" 
            className={`${gradientClasses.base} ${gradientClasses.hover} text-white font-semibold 
            text-lg py-6 px-10 ${gradientClasses.animation} group
            shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40
            ring-2 ring-white/20 hover:ring-white/30
            scale-105 hover:scale-110 transition-all duration-300
            rounded-xl relative overflow-hidden`}
            aria-label="Open authentication dialog"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center justify-center">
              Start Now
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent 
        className="
          sm:max-w-[420px] w-full max-h-[85vh] p-0 bg-slate-900 border border-slate-700 shadow-2xl 
          animate-in fade-in-0 zoom-in-95 duration-200
          rounded-xl overflow-hidden overflow-y-auto
        "
      >
        <AuthProvider>
          {/* Hidden accessibility elements */}
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <DialogDescription className="sr-only">Sign in or create an account</DialogDescription>

          {/* Content starts immediately with tabs */}
          <div className="px-6 pt-6">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "signup")} 
              className="w-full"
            >
              <TabsList className="
                w-full h-auto bg-slate-800/50 border border-slate-700 p-1
                flex gap-1 rounded-lg
              ">
                <TabButton value="login">
                  Sign In
                </TabButton>
                <TabButton value="signup">
                  Create Account
                </TabButton>
              </TabsList>

              {/* Forms Content */}
              <div className="mt-6 pb-6">
                <TabsContent value="login" className="mt-0 space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Welcome back</h3>
                    <p className="text-sm text-slate-400 mt-1">Sign in to continue</p>
                  </div>
                  <LoginForm />
                  <SocialAuth />
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0 space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Get started</h3>
                    <p className="text-sm text-slate-400 mt-1">Create your free account</p>
                  </div>
                  <SignupForm />
                  <SocialAuth />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </AuthProvider>
      </DialogContent>
    </Dialog>
  );
} 