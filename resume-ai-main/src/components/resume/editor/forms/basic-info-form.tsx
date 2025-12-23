'use client';

import { Profile, Resume } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, User, UserCircle2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeContext } from '../resume-editor-context';
import { memo, useCallback } from 'react';

interface BasicInfoFormProps {
  profile: Profile;
}

function areBasicInfoPropsEqual(
  prevProps: BasicInfoFormProps,
  nextProps: BasicInfoFormProps
) {
  return prevProps.profile.id === nextProps.profile.id;
}

// Create memoized field component
const BasicInfoField = memo(function BasicInfoField({ 
  field, 
  value, 
  label, 
  icon: Icon,
  placeholder,
  type = 'text'
}: {
  field: keyof Resume;
  value: string;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  type?: string;
}) {
  const { dispatch } = useResumeContext();
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_FIELD', field, value: e.target.value });
  }, [dispatch, field]);

  return (
    <div className="relative group">
      {/* Floating label */}
      <label className="absolute -top-2.5 left-3 px-2 bg-gradient-to-r from-slate-900 to-slate-800 text-[10px] font-semibold text-violet-400 tracking-wider z-10 flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      
      <Input
        type={type}
        value={value || ''}
        onChange={handleChange}
        className="h-12 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500
          focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-slate-900/70
          hover:border-white/20 hover:bg-slate-900/60 transition-all duration-300
          pr-4 backdrop-blur-sm shadow-inner"
        placeholder={placeholder}
      />
      
      {/* Glow effect on focus */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-fuchsia-500/0 group-focus-within:from-violet-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-fuchsia-500/10 transition-all duration-500 pointer-events-none" />
    </div>
  );
});

export const BasicInfoForm = memo(function BasicInfoFormComponent({
  profile
}: BasicInfoFormProps) {
  const { state, dispatch } = useResumeContext();
  const { resume } = state;

  const updateField = (field: keyof typeof resume, value: string) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };

  const handleFillFromProfile = () => {
    if (!profile) return;
    
    // List of fields that exist on both Profile and Resume
    const fieldsToFill = [
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'location',
      'website',
      'linkedin_url',
      'github_url'
    ] as const;

    // Copy each field if it exists in the profile
    fieldsToFill.forEach((field) => {
      const value = profile[field as keyof Profile];
      if (value && typeof value === 'string') {
        updateField(field as keyof typeof resume, value);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-2xl hover:shadow-violet-500/10 transition-all duration-500">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardContent className="relative p-6">
          {profile && (
            <div className="mb-6">
              <Button
                onClick={handleFillFromProfile}
                className="w-full h-11 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5 border-0"
              >
                <UserCircle2 className="mr-2 h-4 w-4" />
                Auto-Fill from Profile
              </Button>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <BasicInfoField
                field="first_name"
                value={resume.first_name}
                label="FIRST NAME"
                icon={User}
                placeholder="First Name"
              />
              <BasicInfoField
                field="last_name"
                value={resume.last_name}
                label="LAST NAME"
                icon={User}
                placeholder="Last Name"
              />
            </div>

            <BasicInfoField
              field="email"
              value={resume.email}
              label="EMAIL"
              icon={Mail}
              placeholder="email@example.com"
              type="email"
            />

            <BasicInfoField
              field="phone_number"
              value={resume.phone_number || ''}
              label="PHONE"
              icon={Phone}
              placeholder="+1 (555) 000-0000"
              type="tel"
            />

            <BasicInfoField
              field="location"
              value={resume.location || ''}
              label="LOCATION"
              icon={MapPin}
              placeholder="City, State, Country"
            />

            {/* Links section with subtle separator */}
            <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
              <div className="text-[10px] font-semibold text-violet-400 tracking-wider mb-3">ONLINE PRESENCE</div>
              
              <BasicInfoField
                field="website"
                value={resume.website || ''}
                label="WEBSITE"
                icon={Globe}
                placeholder="https://your-website.com"
                type="url"
              />

              <BasicInfoField
                field="linkedin_url"
                value={resume.linkedin_url || ''}
                label="LINKEDIN"
                icon={Linkedin}
                placeholder="https://linkedin.com/in/username"
                type="url"
              />

              <BasicInfoField
                field="github_url"
                value={resume.github_url || ''}
                label="GITHUB"
                icon={Github}
                placeholder="https://github.com/username"
                type="url"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}, areBasicInfoPropsEqual); 