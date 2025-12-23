'use client';

import { Education } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GraduationCap, MapPin, Award, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DatePickerPro } from "@/components/ui/date-picker-pro";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { cn } from "@/lib/utils";

interface ProfileEducationFormProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

export function ProfileEducationForm({ education, onChange }: ProfileEducationFormProps) {
  // Track which textarea is active to prevent useEffect overwriting
  const [activeTextarea, setActiveTextarea] = React.useState<number | null>(null);
  const [achievementInputs, setAchievementInputs] = React.useState<{ [key: number]: string }>(
    Object.fromEntries(education.map((e, i) => [i, e.achievements?.join('\n') || '']))
  );

  // Sync achievement inputs when education changes (but not for active input)
  React.useEffect(() => {
    setAchievementInputs(prev => {
      const newInputs = { ...prev };
      education.forEach((e, i) => {
        if (i !== activeTextarea) {
          newInputs[i] = e.achievements?.join('\n') || '';
        }
      });
      return newInputs;
    });
  }, [education, activeTextarea]);

  const addEducation = () => {
    onChange([...education, {
      school: "",
      degree: "",
      field: "",
      location: "",
      date: "",
      gpa: undefined,
      achievements: []
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: Education[typeof field]) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // Check if a field is missing for validation display
  const isFieldMissing = (edu: Education, field: 'school' | 'degree' | 'field' | 'date') => {
    // Only show error if the entry has some data (not completely empty)
    const hasAnyData = edu.school?.trim() || edu.degree?.trim() || edu.field?.trim() || edu.date?.trim() || edu.location?.trim() || (edu.achievements && edu.achievements.length > 0);
    if (!hasAnyData) return false;
    
    if (field === 'school') return !edu.school?.trim();
    if (field === 'degree') return !edu.degree?.trim();
    if (field === 'field') return !edu.field?.trim();
    if (field === 'date') return !edu.date?.trim() || !edu.date.includes(' - ');
    return false;
  };

  // Handle GPA input - only allow valid decimal numbers 0-4
  const handleGpaChange = (index: number, value: string) => {
    // Allow empty value
    if (value === '') {
      updateEducation(index, 'gpa', undefined);
      return;
    }
    // Only allow numbers and one decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;
    // Validate GPA range (0-4)
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 10) return;
    updateEducation(index, 'gpa', value);
  };

  // Parse date string "YYYY - YYYY" or "YYYY - Present" into Date objects
  const parseEducationDate = (dateStr: string): { startDate: Date | undefined; endDate: Date | undefined; isPresent: boolean } => {
    if (!dateStr) return { startDate: undefined, endDate: undefined, isPresent: false };
    const parts = dateStr.split(' - ').map(p => p.trim());
    
    const parseYear = (str: string): Date | undefined => {
      if (!str || str === 'Present') return undefined;
      const year = parseInt(str);
      if (isNaN(year)) return undefined;
      return new Date(year, 0, 1); // January 1st of that year
    };
    
    return {
      startDate: parseYear(parts[0] || ''),
      endDate: parts[1] === 'Present' ? undefined : parseYear(parts[1] || ''),
      isPresent: parts[1] === 'Present'
    };
  };

  // Update date from DatePickerPro
  const updateEducationDate = (index: number, part: 'start' | 'end', date: Date | undefined, isPresent?: boolean) => {
    const currentDate = education[index].date || '';
    const parsed = parseEducationDate(currentDate);
    
    let newStartDate = part === 'start' ? date : parsed.startDate;
    let newEndDate = part === 'end' && !isPresent ? date : parsed.endDate;
    const newIsPresent = part === 'end' && isPresent !== undefined ? isPresent : parsed.isPresent;
    
    // If setting end to Present, clear end date
    if (newIsPresent) {
      newEndDate = undefined;
    }
    
    // Validate: start year cannot be after end year
    if (newStartDate && newEndDate && newStartDate.getFullYear() > newEndDate.getFullYear()) {
      if (part === 'start') {
        newEndDate = newStartDate;
      } else {
        newStartDate = newEndDate;
      }
    }
    
    // Build date string (year only format)
    let newDateStr = '';
    if (newStartDate) {
      newDateStr = newStartDate.getFullYear().toString();
      if (newIsPresent) {
        newDateStr += ' - Present';
      } else if (newEndDate) {
        newDateStr += ` - ${newEndDate.getFullYear()}`;
      }
    }
    
    updateEducation(index, 'date', newDateStr);
  };

  const removeEducation = (index: number) => {
    onChange(education.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {education.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No education added yet</h3>
          <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
            Add your educational background to showcase your qualifications
          </p>
          <Button 
            onClick={addEducation}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Education
          </Button>
        </div>
      ) : (
        <Accordion 
          type="multiple" 
          className="space-y-3"
          defaultValue={education.map((_, index) => `education-${index}`)}
        >
          {education.map((edu, index) => (
            <AccordionItem
              key={index}
              value={`education-${index}`}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 rounded-xl overflow-hidden group"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                    <GraduationCap className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-200">
                      {edu.degree ? `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}` : 'New Education'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {edu.school || 'Institution not specified'}
                      {edu.date && <span className="text-slate-600"> · {edu.date}</span>}
                    </div>
                  </div>
                  {edu.gpa && (
                    <div className="hidden md:flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 font-medium">
                        GPA: {edu.gpa}
                      </span>
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-5 pb-5 pt-6  space-y-5 border-t border-slate-700/50">
                  {/* Institution and Delete Row */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 group/input relative">
                      <div className={cn(
                        "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                        isFieldMissing(edu, 'school') ? "text-rose-400" : "text-amber-400/80"
                      )}>
                        INSTITUTION <span className="text-rose-400">*</span>
                        {isFieldMissing(edu, 'school') && <AlertCircle className="w-3 h-3" />}
                      </div>
                      <Input
                        value={edu.school}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        className={cn(
                          "bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                          isFieldMissing(edu, 'school')
                            ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-slate-700 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 hover:border-slate-600 hover:bg-slate-800/70"
                        )}
                        placeholder="Stanford University"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeEducation(index)}
                      className="h-11 w-11 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Location */}
                  <div className="group/input relative">
                    <div className="absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium text-slate-500 z-10">
                      LOCATION
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MapPin className="h-4 w-4 text-slate-600" />
                    </div>
                    <Input
                      value={edu.location}
                      onChange={(e) => updateEducation(index, 'location', e.target.value)}
                      className="pr-10 bg-slate-800/50 border-slate-700 rounded-xl h-11
                        text-slate-200 text-sm
                        focus:border-slate-600 focus:ring-2 focus:ring-slate-500/20
                        hover:border-slate-600 hover:bg-slate-800/70 transition-all
                        placeholder:text-slate-600"
                      placeholder="Stanford, CA"
                    />
                  </div>

                  {/* Degree and Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group/input relative">
                      <div className={cn(
                        "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                        isFieldMissing(edu, 'degree') ? "text-rose-400" : "text-amber-400/80"
                      )}>
                        DEGREE <span className="text-rose-400">*</span>
                        {isFieldMissing(edu, 'degree') && <AlertCircle className="w-3 h-3" />}
                      </div>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className={cn(
                          "bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                          isFieldMissing(edu, 'degree')
                            ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-slate-700 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 hover:border-slate-600 hover:bg-slate-800/70"
                        )}
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div className="group/input relative">
                      <div className={cn(
                        "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                        isFieldMissing(edu, 'field') ? "text-rose-400" : "text-amber-400/80"
                      )}>
                        FIELD OF STUDY <span className="text-rose-400">*</span>
                        {isFieldMissing(edu, 'field') && <AlertCircle className="w-3 h-3" />}
                      </div>
                      <Input
                        value={edu.field}
                        onChange={(e) => updateEducation(index, 'field', e.target.value)}
                        className={cn(
                          "bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                          isFieldMissing(edu, 'field')
                            ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-slate-700 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 hover:border-slate-600 hover:bg-slate-800/70"
                        )}
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  {/* Date and GPA */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="group/input relative">
                      <div className={cn(
                        "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                        isFieldMissing(edu, 'date') && !parseEducationDate(edu.date).startDate ? "text-rose-400" : "text-amber-400/80"
                      )}>
                        START YEAR <span className="text-rose-400">*</span>
                      </div>
                      <DatePickerPro
                        value={parseEducationDate(edu.date).startDate}
                        onChange={(date: Date | undefined) => updateEducationDate(index, 'start', date)}
                        placeholder="Select year"
                        showCalendar={false}
                        showMonths={false}
                        showYears={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="group/input relative">
                        <div className={cn(
                          "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                          isFieldMissing(edu, 'date') && parseEducationDate(edu.date).startDate ? "text-rose-400" : "text-amber-400/80"
                        )}>
                          END YEAR <span className="text-rose-400">*</span>
                          {isFieldMissing(edu, 'date') && parseEducationDate(edu.date).startDate && <AlertCircle className="w-3 h-3" />}
                        </div>
                        <DatePickerPro
                          value={parseEducationDate(edu.date).endDate}
                          onChange={(date: Date | undefined) => updateEducationDate(index, 'end', date, false)}
                          placeholder="Select year"
                          disabled={parseEducationDate(edu.date).isPresent}
                          showCalendar={false}
                          showMonths={false}
                          showYears={true}
                          className={isFieldMissing(edu, 'date') && parseEducationDate(edu.date).startDate && !parseEducationDate(edu.date).isPresent ? "border-rose-500/50" : ""}
                        />
                      </div>
                      <div className="flex items-center gap-2 ml-1">
                        <Checkbox
                          id={`edu-present-${index}`}
                          checked={parseEducationDate(edu.date).isPresent}
                          onCheckedChange={(checked: boolean) => {
                            updateEducationDate(index, 'end', undefined, checked);
                          }}
                          className={cn(
                            "data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500",
                            isFieldMissing(edu, 'date') && parseEducationDate(edu.date).startDate && !parseEducationDate(edu.date).isPresent
                              ? "border-rose-500"
                              : "border-slate-600"
                          )}
                        />
                        <label
                          htmlFor={`edu-present-${index}`}
                          className={cn(
                            "text-xs cursor-pointer select-none",
                            isFieldMissing(edu, 'date') && parseEducationDate(edu.date).startDate && !parseEducationDate(edu.date).isPresent
                              ? "text-rose-400"
                              : "text-slate-400"
                          )}
                        >
                          Currently studying
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2 group/input relative">
                      <div className="absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-md text-[10px] font-medium text-amber-400/80 z-10">
                        GPA
                      </div>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={edu.gpa || ''}
                        onChange={(e) => handleGpaChange(index, e.target.value)}
                        className="bg-slate-800/50 border-slate-700 rounded-xl h-11
                          text-slate-200 text-sm
                          focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20
                          hover:border-slate-600 hover:bg-slate-800/70 transition-all
                          placeholder:text-slate-600"
                        placeholder="3.8 (max 10.0)"
                      />
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-400/60" />
                      <Label className="text-xs font-medium text-amber-400/80">Achievements & Activities</Label>
                    </div>
                    <Textarea
                      value={achievementInputs[index] || ''}
                      onFocus={() => setActiveTextarea(index)}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setAchievementInputs(prev => ({ ...prev, [index]: newValue }));
                        // Update achievements array for preview (keep empty lines while typing)
                        const achievements = newValue.split('\n');
                        updateEducation(index, 'achievements', achievements);
                      }}
                      onBlur={() => {
                        setActiveTextarea(null);
                        // Clean up empty lines on blur
                        const achievements = (achievementInputs[index] || '').split('\n').filter(Boolean);
                        updateEducation(index, 'achievements', achievements);
                        setAchievementInputs(prev => ({ ...prev, [index]: achievements.join('\n') }));
                      }}
                      placeholder="• Dean's List 2020-2023&#10;• Computer Science Club President&#10;• First Place, University Hackathon"
                      className="min-h-[100px] bg-slate-800/50 border-slate-700 rounded-xl
                        text-slate-200 text-sm
                        focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20
                        hover:border-slate-600 hover:bg-slate-800/70 transition-all
                        placeholder:text-slate-600 resize-none"
                    />
                    <p className="text-[10px] text-slate-600">One achievement per line</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {education.length > 0 && (
        <Button 
          variant="outline" 
          onClick={addEducation}
          className={cn(
            "w-full h-12 rounded-xl",
            "bg-slate-800/30 hover:bg-slate-800/50",
            "border-2 border-dashed border-slate-700 hover:border-amber-500/30",
            "text-slate-400 hover:text-amber-400",
            "transition-all duration-300"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      )}
    </div>
  );
}
