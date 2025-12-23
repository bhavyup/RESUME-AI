'use client';

import { Project } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FolderGit2, Globe, Github, AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MonthYearPicker } from "@/components/ui/date-picker-pro";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parse } from "date-fns";
import React from "react";
import { cn } from "@/lib/utils";

interface ProfileProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProfileProjectsForm({ projects, onChange }: ProfileProjectsFormProps) {
  const [techInputs, setTechInputs] = React.useState<{ [key: number]: string }>(
    Object.fromEntries(projects.map((p, i) => [i, p.technologies?.join(', ') || '']))
  );
  
  const [activeInput, setActiveInput] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Only sync inputs that are NOT currently being edited
    setTechInputs(prev => {
      const newInputs: { [key: number]: string } = {};
      projects.forEach((p, i) => {
        if (i === activeInput) {
          // Keep the current typing value
          newInputs[i] = prev[i] ?? p.technologies?.join(', ') ?? '';
        } else {
          newInputs[i] = p.technologies?.join(', ') || '';
        }
      });
      return newInputs;
    });
  }, [projects, activeInput]);

  const addProject = () => {
    onChange([...projects, {
      name: "",
      description: [],
      technologies: [],
      url: "",
      github_url: "",
      date: ""
    }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // Check if a field is missing for validation display
  const isFieldMissing = (project: Project, field: 'name' | 'date') => {
    // Only show error if the entry has some data (not completely empty)
    const hasAnyData = project.name?.trim() || (project.description && project.description.some(d => d.trim())) || project.url?.trim() || project.github_url?.trim() || project.date?.trim() || (project.technologies && project.technologies.length > 0);
    if (!hasAnyData) return false;
    
    if (field === 'name') return !project.name?.trim();
    if (field === 'date') return !project.date?.trim() || !project.date.includes(' - ');
    return false;
  };

  // Parse date string "MMM yyyy - MMM yyyy" or "MMM yyyy - Present" into Date objects
  const parseProjectDate = (dateStr: string): { startDate: Date | undefined; endDate: Date | undefined; isPresent: boolean } => {
    if (!dateStr) return { startDate: undefined, endDate: undefined, isPresent: false };
    const parts = dateStr.split(' - ').map(p => p.trim());
    
    const parseMonthYear = (str: string): Date | undefined => {
      if (!str || str === 'Present') return undefined;
      try {
        const parsed = parse(str, 'MMM yyyy', new Date());
        // Check if the parsed date is valid
        if (isNaN(parsed.getTime())) return undefined;
        return parsed;
      } catch {
        return undefined;
      }
    };
    
    return {
      startDate: parseMonthYear(parts[0] || ''),
      endDate: parts[1] === 'Present' ? undefined : parseMonthYear(parts[1] || ''),
      isPresent: parts[1] === 'Present'
    };
  };

  // Update date from calendar picker
  const updateProjectDate = (index: number, part: 'start' | 'end', date: Date | undefined, isPresent?: boolean) => {
    const currentDate = projects[index].date || '';
    const parsed = parseProjectDate(currentDate);
    
    let newStartDate = part === 'start' ? date : parsed.startDate;
    let newEndDate = part === 'end' && !isPresent ? date : parsed.endDate;
    const newIsPresent = part === 'end' && isPresent !== undefined ? isPresent : parsed.isPresent;
    
    // If setting end to Present, clear end date
    if (newIsPresent) {
      newEndDate = undefined;
    }
    
    // Validate: start date cannot be after end date
    if (newStartDate && newEndDate && newStartDate > newEndDate) {
      if (part === 'start') {
        newEndDate = newStartDate;
      } else {
        newStartDate = newEndDate;
      }
    }
    
    // Build date string
    let newDateStr = '';
    if (newStartDate) {
      newDateStr = format(newStartDate, 'MMM yyyy');
      if (newIsPresent) {
        newDateStr += ' - Present';
      } else if (newEndDate) {
        newDateStr += ` - ${format(newEndDate, 'MMM yyyy')}`;
      }
    }
    
    updateProject(index, 'date', newDateStr);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
            <FolderGit2 className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No projects added yet</h3>
          <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
            Showcase your personal and professional projects to stand out
          </p>
          <Button 
            onClick={addProject}
            className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <Accordion 
          type="multiple" 
          className="space-y-3"
          defaultValue={projects.map((_, index) => `project-${index}`)}
        >
          {projects.map((project, index) => (
            <AccordionItem
              key={index}
              value={`project-${index}`}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-violet-500/30 transition-all duration-300 rounded-xl overflow-hidden group"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
                    <FolderGit2 className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-200">
                      {project.name || "Untitled Project"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.date || 'Date not specified'}
                    </div>
                  </div>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-end max-w-[200px]">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-md text-[10px] text-violet-300">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-5 pb-5 pt-6 space-y-5 border-t border-slate-700/50">
                  {/* Project Name and Delete Row */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 group/input relative">
                      <div className={cn(
                        "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                        isFieldMissing(project, 'name') ? "text-rose-400" : "text-violet-400/80"
                      )}>
                        PROJECT NAME <span className="text-rose-400">*</span>
                        {isFieldMissing(project, 'name') && <AlertCircle className="w-3 h-3" />}
                      </div>
                      <Input
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        className={cn(
                          "bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                          isFieldMissing(project, 'name')
                            ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-slate-700 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 hover:border-slate-600 hover:bg-slate-800/70"
                        )}
                        placeholder="My Awesome Project"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeProject(index)}
                      className="h-11 w-11 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* URLs Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group/input relative">
                      <div className="absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium text-violet-400/80 z-10">
                        LIVE URL
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Globe className="h-4 w-4 text-slate-600" />
                      </div>
                      <Input
                        type="url"
                        value={project.url || ''}
                        onChange={(e) => updateProject(index, 'url', e.target.value)}
                        className="pr-10 bg-slate-800/50 border-slate-700 rounded-xl h-11
                          text-slate-200 text-sm
                          focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                          hover:border-slate-600 hover:bg-slate-800/70 transition-all
                          placeholder:text-slate-600"
                        placeholder="https://myproject.com"
                      />
                    </div>
                    <div className="group/input relative">
                      <div className="absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium text-violet-400/80 z-10">
                        GITHUB URL
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Github className="h-4 w-4 text-slate-600" />
                      </div>
                      <Input
                        type="url"
                        value={project.github_url || ''}
                        onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                        className="pr-10 bg-slate-800/50 border-slate-700 rounded-xl h-11
                          text-slate-200 text-sm
                          focus:border-violet-500/50 focus:ring-2 focus:ring-slate-500/20
                          hover:border-slate-600 hover:bg-slate-800/70 transition-all
                          placeholder:text-slate-600"
                        placeholder="https://github.com/user/repo"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-4">
                    {/* Start Date */}
                    <div className="group/input relative">
                      <div className={cn(
                        "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                        isFieldMissing(project, 'date') && !parseProjectDate(project.date || '').startDate ? "text-rose-400" : "text-violet-400/80"
                      )}>
                        START DATE <span className="text-rose-400">*</span>
                      </div>
                      <MonthYearPicker
                        value={parseProjectDate(project.date || '').startDate}
                        onChange={(date: Date | undefined) => updateProjectDate(index, 'start', date)}
                        placeholder="Select start date"
                        showCalendar={false}
                        className={isFieldMissing(project, 'date') && !parseProjectDate(project.date || '').startDate ? "border-rose-500/50" : ""}
                      />
                    </div>
                    
                    {/* End Date */}
                    <div className="space-y-2">
                      <div className="group/input relative">
                        <div className={cn(
                          "absolute -top-2.5 left-3 px-2 bg-slate-900/60 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                          isFieldMissing(project, 'date') && parseProjectDate(project.date || '').startDate ? "text-rose-400" : "text-violet-400/80"
                        )}>
                          END DATE <span className="text-rose-400">*</span>
                          {isFieldMissing(project, 'date') && parseProjectDate(project.date || '').startDate && <AlertCircle className="w-3 h-3" />}
                        </div>
                        <MonthYearPicker
                          value={parseProjectDate(project.date || '').endDate}
                          onChange={(date: Date | undefined) => updateProjectDate(index, 'end', date, false)}
                          placeholder="Select end date"
                          disabled={parseProjectDate(project.date || '').isPresent}
                          showCalendar={false}
                          className={isFieldMissing(project, 'date') && parseProjectDate(project.date || '').startDate && !parseProjectDate(project.date || '').isPresent ? "border-rose-500/50" : ""}
                        />
                      </div>
                      <div className="flex items-center gap-2 ml-1">
                        <Checkbox
                          id={`present-${index}`}
                          checked={parseProjectDate(project.date || '').isPresent}
                          onCheckedChange={(checked: boolean) => {
                            updateProjectDate(index, 'end', undefined, checked);
                          }}
                          className={cn(
                            "data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500",
                            isFieldMissing(project, 'date') && parseProjectDate(project.date || '').startDate && !parseProjectDate(project.date || '').isPresent
                              ? "border-rose-500"
                              : "border-slate-600"
                          )}
                        />
                        <label
                          htmlFor={`present-${index}`}
                          className={cn(
                            "text-xs cursor-pointer select-none",
                            isFieldMissing(project, 'date') && parseProjectDate(project.date || '').startDate && !parseProjectDate(project.date || '').isPresent
                              ? "text-rose-400"
                              : "text-slate-400"
                          )}
                        >
                          Currently working on this project
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium text-violet-400/80">Technologies & Tools</Label>
                      <span className="text-[10px] text-slate-600">Separate with comma</span>
                    </div>
                    <Input
                      value={techInputs[index] || ''}
                      onFocus={() => setActiveInput(index)}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTechInputs(prev => ({ ...prev, [index]: newValue }));
                        // Update items for preview - split on comma with optional space
                        const technologies = newValue.split(/,\s*/).map(t => t.trim()).filter(Boolean);
                        updateProject(index, 'technologies', technologies);
                      }}
                      onBlur={(e) => {
                        setActiveInput(null);
                        // Clean up the input text when leaving the field
                        const technologies = e.target.value.split(/,\s*/).map(t => t.trim()).filter(Boolean);
                        updateProject(index, 'technologies', technologies);
                        if (technologies.length > 0) {
                          setTechInputs(prev => ({ ...prev, [index]: technologies.join(', ') }));
                        }
                      }}
                      placeholder="React, TypeScript, TailwindCSS..."
                      className="bg-slate-800/50 border-slate-700 rounded-xl h-11
                        text-slate-200 text-sm
                        focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                        hover:border-slate-600 hover:bg-slate-800/70 transition-all
                        placeholder:text-slate-600"
                    />
                  </div>

                  {/* Description Points */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium text-violet-400/80">Description</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = [...projects];
                          updated[index].description = [...updated[index].description, ""];
                          onChange(updated);
                        }}
                        className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 h-7 text-xs rounded-lg"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Point
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {project.description.map((desc, descIndex) => (
                        <div key={descIndex} className="flex gap-2 items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50 flex-shrink-0" />
                          <Input
                            value={desc}
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[index].description[descIndex] = e.target.value;
                              onChange(updated);
                            }}
                            placeholder="Describe a key feature or achievement..."
                            className="flex-1 bg-slate-800/50 border-slate-700 rounded-xl h-10
                              text-slate-200 text-sm
                              focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                              hover:border-slate-600 hover:bg-slate-800/70 transition-all
                              placeholder:text-slate-600"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updated = [...projects];
                              updated[index].description = updated[index].description.filter((_, i) => i !== descIndex);
                              onChange(updated);
                            }}
                            className="h-10 w-10 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      {project.description.length === 0 && (
                        <p className="text-xs text-slate-600 italic py-2 px-3 bg-slate-900/30 rounded-lg">
                          Add bullet points to describe your project&apos;s features and impact
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {projects.length > 0 && (
        <Button 
          variant="outline" 
          onClick={addProject}
          className={cn(
            "w-full h-12 rounded-xl",
            "bg-slate-800/30 hover:bg-slate-800/50",
            "border-2 border-dashed border-slate-700 hover:border-violet-500/30",
            "text-slate-400 hover:text-violet-400",
            "transition-all duration-300"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      )}
    </div>
  );
}
