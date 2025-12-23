'use client';

import { Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileBasicInfoFormProps {
  profile: Profile;
  onChange: (field: keyof Profile, value: string) => void;
}

export function ProfileBasicInfoForm({ profile, onChange }: ProfileBasicInfoFormProps) {
  // Check if a required field is missing - only show error if form has some data
  const hasAnyData = () => {
    return !!(profile.first_name?.trim() || profile.last_name?.trim() || 
              profile.email?.trim() || profile.phone_number?.trim() || 
              profile.location?.trim());
  };
  
  const isFieldMissing = (field: keyof Profile) => {
    if (!hasAnyData()) return false;
    const value = profile[field];
    return !value || (typeof value === 'string' && !value.trim());
  };

  return (
    <div className="space-y-8">
      {/* Personal Details Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-300">Personal Information</h3>
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group relative">
            <div className={cn(
              "absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium z-10 flex items-center gap-1",
              isFieldMissing('first_name') ? "text-rose-400" : "text-emerald-400/80"
            )}>
              FIRST NAME <span className="text-rose-400">*</span>
              {isFieldMissing('first_name') && <AlertCircle className="w-3 h-3" />}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-emerald-500/20 transition-colors">
                <User className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
            </div>
            <Input
              value={profile.first_name || ''}
              onChange={(e) => onChange('first_name', e.target.value)}
              className={cn(
                "pr-12 text-base font-medium bg-slate-800/50 rounded-xl h-12 text-slate-200 transition-all placeholder:text-slate-500",
                isFieldMissing('first_name')
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-600 hover:bg-slate-800/70"
              )}
              placeholder="John"
            />
          </div>
          
          <div className="group relative">
            <div className={cn(
              "absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium z-10 flex items-center gap-1",
              isFieldMissing('last_name') ? "text-rose-400" : "text-emerald-400/80"
            )}>
              LAST NAME <span className="text-rose-400">*</span>
              {isFieldMissing('last_name') && <AlertCircle className="w-3 h-3" />}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-emerald-500/20 transition-colors">
                <User className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
            </div>
            <Input
              value={profile.last_name || ''}
              onChange={(e) => onChange('last_name', e.target.value)}
              className={cn(
                "pr-12 text-base font-medium bg-slate-800/50 rounded-xl h-12 text-slate-200 transition-all placeholder:text-slate-500",
                isFieldMissing('last_name')
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-700 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 hover:border-slate-600 hover:bg-slate-800/70"
              )}
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group relative">
            <div className={cn(
              "absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium z-10 flex items-center gap-1",
              isFieldMissing('email') ? "text-rose-400" : "text-cyan-400/80"
            )}>
              EMAIL <span className="text-rose-400">*</span>
              {isFieldMissing('email') && <AlertCircle className="w-3 h-3" />}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-cyan-500/20 transition-colors">
                <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </div>
            <Input
              type="email"
              value={profile.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className={cn(
                "pr-12 bg-slate-800/50 rounded-xl h-12 text-slate-200 transition-all placeholder:text-slate-500",
                isFieldMissing('email')
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 hover:bg-slate-800/70"
              )}
              placeholder="john@example.com"
            />
          </div>
          
          <div className="group relative">
            <div className={cn(
              "absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium z-10 flex items-center gap-1",
              isFieldMissing('phone_number') ? "text-rose-400" : "text-cyan-400/80"
            )}>
              PHONE <span className="text-rose-400">*</span>
              {isFieldMissing('phone_number') && <AlertCircle className="w-3 h-3" />}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-cyan-500/20 transition-colors">
                <Phone className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </div>
            <Input
              type="tel"
              value={profile.phone_number || ''}
              onChange={(e) => onChange('phone_number', e.target.value)}
              className={cn(
                "pr-12 bg-slate-800/50 rounded-xl h-12 text-slate-200 transition-all placeholder:text-slate-500",
                isFieldMissing('phone_number')
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-slate-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 hover:bg-slate-800/70"
              )}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        {/* Location */}
        <div className="group relative">
          <div className={cn(
            "absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium z-10 flex items-center gap-1",
            isFieldMissing('location') ? "text-rose-400" : "text-teal-400/80"
          )}>
            LOCATION <span className="text-rose-400">*</span>
            {isFieldMissing('location') && <AlertCircle className="w-3 h-3" />}
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-teal-500/20 transition-colors">
              <MapPin className="h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
            </div>
          </div>
          <Input
            value={profile.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className={cn(
              "pr-12 bg-slate-800/50 rounded-xl h-12 text-slate-200 transition-all placeholder:text-slate-500",
              isFieldMissing('location')
                ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : "border-slate-700 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 hover:border-slate-600 hover:bg-slate-800/70"
            )}
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-900 px-4 text-xs text-slate-600">Online Presence</span>
        </div>
      </div>

      {/* Online Presence Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Globe className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-300">Social Links</h3>
        </div>

        {/* Website and LinkedIn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group relative">
            <div className="absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium text-violet-400/80 z-10">
              WEBSITE
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-violet-500/20 transition-colors">
                <Globe className="h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              </div>
            </div>
            <Input
              type="url"
              value={profile.website || ''}
              onChange={(e) => onChange('website', e.target.value)}
              className="pr-12 bg-slate-800/50 border-slate-700 rounded-xl h-12
                text-slate-200
                focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                hover:border-slate-600 hover:bg-slate-800/70 transition-all
                placeholder:text-slate-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div className="group relative">
            <div className="absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium text-[#0077b5]/80 z-10">
              LINKEDIN
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-[#0077b5]/20 transition-colors">
                <Linkedin className="h-4 w-4 text-slate-500 group-focus-within:text-[#0077b5] transition-colors" />
              </div>
            </div>
            <Input
              type="url"
              value={profile.linkedin_url || ''}
              onChange={(e) => onChange('linkedin_url', e.target.value)}
              className="pr-12 bg-slate-800/50 border-slate-700 rounded-xl h-12
                text-slate-200
                focus:border-[#0077b5]/50 focus:ring-2 focus:ring-[#0077b5]/20
                hover:border-slate-600 hover:bg-slate-800/70 transition-all
                placeholder:text-slate-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        {/* GitHub */}
        <div className="group relative">
          <div className="absolute -top-2.5 left-3 px-2 bg-slate-900 text-[10px] font-medium text-slate-400 z-10">
            GITHUB
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="p-1.5 rounded-full bg-slate-800 group-focus-within:bg-slate-700 transition-colors">
              <Github className="h-4 w-4 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
            </div>
          </div>
          <Input
            type="url"
            value={profile.github_url || ''}
            onChange={(e) => onChange('github_url', e.target.value)}
            className="pr-12 bg-slate-800/50 border-slate-700 rounded-xl h-12
              text-slate-200
              focus:border-slate-600 focus:ring-2 focus:ring-slate-500/20
              hover:border-slate-600 hover:bg-slate-800/70 transition-all
              placeholder:text-slate-500"
            placeholder="https://github.com/username"
          />
        </div>
      </div>
    </div>
  );
}
