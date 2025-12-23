'use client';

import { Skill, Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { useState, KeyboardEvent } from 'react';

interface SkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  profile: Profile;
}

export function SkillsForm({
  skills,
  onChange,
  profile
}: SkillsFormProps) {
  const [newSkills, setNewSkills] = useState<{ [key: number]: string }>({});

  const addSkillCategory = () => {
    onChange([{
      category: "",
      items: []
    }, ...skills]);
  };

  const updateSkillCategory = (index: number, field: keyof Skill, value: string | string[]) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeSkillCategory = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const addSkill = (categoryIndex: number) => {
    const skillToAdd = newSkills[categoryIndex]?.trim();
    if (!skillToAdd) return;

    const updated = [...skills];
    const currentItems = updated[categoryIndex].items || [];
    if (!currentItems.includes(skillToAdd)) {
      updated[categoryIndex] = {
        ...updated[categoryIndex],
        items: [...currentItems, skillToAdd]
      };
      onChange(updated);
    }
    setNewSkills({ ...newSkills, [categoryIndex]: '' });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>, categoryIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(categoryIndex);
    }
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    const updated = skills.map((skill, idx) => {
      if (idx === categoryIndex) {
        return {
          ...skill,
          items: skill.items.filter((_, i) => i !== skillIndex)
        };
      }
      return skill;
    });
    onChange(updated);
  };

  const handleImportFromProfile = (importedSkills: Skill[]) => {
    onChange([...importedSkills, ...skills]);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          onClick={addSkillCategory}
          className={cn(
            "flex-1 h-11 relative overflow-hidden group/btn",
            "bg-gradient-to-r from-slate-900/90 to-slate-800/90",
            "hover:from-cyan-950/90 hover:to-blue-950/90",
            "border border-cyan-500/30 hover:border-cyan-400/50",
            "text-cyan-300 hover:text-cyan-200",
            "transition-all duration-500",
            "rounded-xl",
            "shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]",
            "hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)]"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/0 via-cyan-600/10 to-cyan-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Add Category</span>
        </Button>

        <ImportFromProfileDialog<Skill>
          profile={profile}
          onImport={handleImportFromProfile}
          type="skills"
          buttonClassName={cn(
            "flex-1 h-11",
            "bg-gradient-to-r from-slate-900/90 to-slate-800/90",
            "border border-slate-600/30 hover:border-cyan-400/50",
            "text-slate-300 hover:text-cyan-200",
            "transition-all duration-500",
            "rounded-xl"
          )}
        />
      </div>

      {/* Skill Category Cards */}
      {skills.map((skill, index) => (
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
            "hover:border-cyan-500/40",
            "hover:shadow-[0_8px_40px_-8px_rgba(6,182,212,0.25)]"
          )}
        >
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Card Content */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Header Row */}
            <div className="flex items-start gap-3">
              {/* Category Icon */}
              <div className={cn(
                "p-2.5 rounded-xl shrink-0",
                "bg-gradient-to-br from-cyan-600/20 to-blue-600/20",
                "border border-cyan-500/30"
              )}>
                <Layers className="h-5 w-5 text-cyan-400" />
              </div>
              
              {/* Category Input */}
              <div className="flex-1 relative">
                <Input
                  value={skill.category}
                  onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                  placeholder="Programming Languages"
                  className={cn(
                    "h-11 text-base font-semibold",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-white placeholder:text-slate-500",
                    "focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20",
                    "hover:border-cyan-500/30 hover:bg-slate-800/70",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[10px] font-medium text-cyan-400/80 bg-slate-900 rounded">
                  CATEGORY
                </span>
              </div>

              {/* Delete Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeSkillCategory(index)}
                className={cn(
                  "h-10 w-10 shrink-0 rounded-xl",
                  "text-slate-500 hover:text-cyan-400",
                  "hover:bg-cyan-500/10 hover:border-cyan-500/30",
                  "transition-all duration-300"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Skills Tags */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {skill.items.map((item, skillIndex) => (
                  <Badge
                    key={skillIndex}
                    className={cn(
                      "py-1.5 px-3 text-sm font-mono",
                      "bg-slate-950/80",
                      "border border-cyan-500/50",
                      "text-cyan-300",
                      "hover:bg-cyan-950/60 hover:text-cyan-100",
                      "hover:border-cyan-400",
                      "transition-all duration-300",
                      "group/badge cursor-default rounded-none"
                    )}
                  >
                    {item}
                    <button
                      onClick={() => removeSkill(index, skillIndex)}
                      className={cn(
                        "ml-2 w-4 h-4",
                        "flex items-center justify-center",
                        "bg-transparent hover:bg-cyan-500/20",
                        "text-cyan-500/50 hover:text-cyan-300",
                        "transition-all duration-300"
                      )}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              {skill.items.length === 0 && (
                <div className={cn(
                  "text-sm text-slate-500 italic px-4 py-3",
                  "bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50",
                  "text-center"
                )}>
                  Add skills to this category below
                </div>
              )}

              {/* Add Skill Input */}
              <div className="flex gap-2 mt-3">
                <div className="flex-1 relative">
                  <Input
                    value={newSkills[index] || ''}
                    onChange={(e) => setNewSkills({ ...newSkills, [index]: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    placeholder="Type skill and press Enter"
                    className={cn(
                      "h-10 text-sm",
                      "bg-slate-800/50 border-slate-700/50 rounded-xl",
                      "text-slate-200 placeholder:text-slate-500",
                      "focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30",
                      "transition-all duration-300"
                    )}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(index)}
                  className={cn(
                    "h-10 px-4 rounded-xl",
                    "bg-cyan-500/10 hover:bg-cyan-500/20",
                    "border border-cyan-500/30 hover:border-cyan-400/50",
                    "text-cyan-300 hover:text-cyan-200",
                    "transition-all duration-300"
                  )}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 