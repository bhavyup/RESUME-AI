'use client';

import { Education, Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GraduationCap, MapPin, Calendar, BookOpen, Trophy, Award } from "lucide-react";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { memo } from 'react';
import { cn } from "@/lib/utils";
import Tiptap from "@/components/ui/tiptap";


interface EducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
  profile: Profile;
}

function areEducationPropsEqual(
  prevProps: EducationFormProps,
  nextProps: EducationFormProps
) {
  return (
    JSON.stringify(prevProps.education) === JSON.stringify(nextProps.education) &&
    prevProps.profile.id === nextProps.profile.id
  );
}

export const EducationForm = memo(function EducationFormComponent({
  education,
  onChange,
  profile
}: EducationFormProps) {
  const addEducation = () => {
    onChange([{
      school: "",
      degree: "",
      field: "",
      location: "",
      date: "",
      gpa: undefined,
      achievements: []
    }, ...education]);
  };

  const updateEducation = (index: number, field: keyof Education, value: Education[keyof Education]) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedEducation: Education[]) => {
    onChange([...importedEducation, ...education]);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onClick={addEducation}
          className={cn(
            "flex-1 h-11 relative overflow-hidden group/btn",
            "bg-gradient-to-r from-slate-900/90 to-slate-800/90",
            "hover:from-indigo-950/90 hover:to-blue-950/90",
            "border border-indigo-500/30 hover:border-indigo-400/50",
            "text-indigo-300 hover:text-indigo-200",
            "transition-all duration-500",
            "rounded-xl",
            "shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]",
            "hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/10 to-indigo-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Add Education</span>
        </Button>

        <ImportFromProfileDialog<Education>
          profile={profile}
          onImport={handleImportFromProfile}
          type="education"
          buttonClassName={cn(
            "flex-1 h-11",
            "bg-gradient-to-r from-slate-900/90 to-slate-800/90",
            "border border-slate-600/30 hover:border-indigo-400/50",
            "text-slate-300 hover:text-indigo-200",
            "transition-all duration-500",
            "rounded-xl"
          )}
        />
      </div>

      {/* Education Cards */}
      {education.map((edu, index) => (
        <div 
          key={index} 
          className={cn(
            "relative group",
            "bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/95",
            "backdrop-blur-xl",
            "border border-slate-700/50",
            "rounded-2xl",
            "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
            "overflow-hidden",
            "transition-all duration-500",
            "hover:border-indigo-500/40",
            "hover:shadow-[0_8px_40px_-8px_rgba(99,102,241,0.25)]"
          )}
        >
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Card Content */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Header Row */}
            <div className="flex items-start gap-3">
              {/* Institution Icon */}
              <div className={cn(
                "p-2.5 rounded-xl shrink-0",
                "bg-gradient-to-br from-indigo-600/20 to-blue-600/20",
                "border border-indigo-500/30"
              )}>
                <GraduationCap className="h-5 w-5 text-indigo-400" />
              </div>
              
              {/* School Input */}
              <div className="flex-1 relative">
                <Input
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                  placeholder="University of California, Berkeley"
                  className={cn(
                    "h-11 text-base font-semibold",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-white placeholder:text-slate-500",
                    "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
                    "hover:border-indigo-500/30 hover:bg-slate-800/70",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[10px] font-medium text-indigo-400/80 bg-slate-900 rounded">
                  INSTITUTION
                </span>
              </div>

              {/* Delete Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeEducation(index)}
                className={cn(
                  "h-10 w-10 shrink-0 rounded-xl",
                  "text-slate-500 hover:text-rose-400",
                  "hover:bg-rose-500/10 hover:border-rose-500/30",
                  "transition-all duration-300"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Location Row */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <MapPin className="h-4 w-4" />
              </div>
              <Input
                value={edu.location}
                onChange={(e) => updateEducation(index, 'location', e.target.value)}
                placeholder="Berkeley, CA"
                className={cn(
                  "h-10 pl-10 text-sm",
                  "bg-slate-800/50 border-slate-700/50 rounded-xl",
                  "text-slate-200 placeholder:text-slate-500",
                  "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
                  "hover:border-indigo-500/30",
                  "transition-all duration-300"
                )}
              />
              <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                LOCATION
              </span>
            </div>

            {/* Degree and Field Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <BookOpen className="h-4 w-4" />
                </div>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  placeholder="Bachelor of Science"
                  className={cn(
                    "h-10 pl-10 text-sm",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-slate-200 placeholder:text-slate-500",
                    "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
                    "hover:border-indigo-500/30",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                  DEGREE
                </span>
              </div>
              
              <div className="relative">
                <Input
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  placeholder="Computer Science"
                  className={cn(
                    "h-10 text-sm",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-slate-200 placeholder:text-slate-500",
                    "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
                    "hover:border-indigo-500/30",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                  FIELD OF STUDY
                </span>
              </div>
            </div>

            {/* Date and GPA Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  value={edu.date}
                  onChange={(e) => updateEducation(index, 'date', e.target.value)}
                  placeholder="2019 - 2023"
                  className={cn(
                    "h-10 pl-10 text-sm",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-slate-200 placeholder:text-slate-500",
                    "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
                    "hover:border-indigo-500/30",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                  DATE RANGE
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Award className="h-4 w-4" />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(index, 'gpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="3.85"
                  className={cn(
                    "h-10 pl-10 text-sm",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-slate-200 placeholder:text-slate-500",
                    "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
                    "hover:border-indigo-500/30",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                  GPA
                </span>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
                <Trophy className="h-3.5 w-3.5 text-indigo-400/60" />
                <span className="text-[11px] font-semibold text-indigo-400/80 tracking-wider uppercase">
                  Achievements & Activities
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-indigo-500/30 to-transparent" />
              </div>

              <Tiptap
                content={(edu.achievements || []).join('\n')}
                onChange={(newContent) => updateEducation(index, 'achievements', 
                  newContent.split('\n').filter(Boolean)
                )}
                editorProps={{
                  attributes: {
                    placeholder: "• Dean's List 2020-2021\n• President of Computer Science Club\n• First Place in Hackathon 2022"
                  }
                }}
                className={cn(
                  "min-h-[100px] text-sm",
                  "bg-slate-800/30 border-slate-700/50 rounded-xl",
                  "text-slate-300",
                  "focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20",
                  "hover:border-indigo-500/30",
                  "transition-all duration-300"
                )}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}, areEducationPropsEqual); 