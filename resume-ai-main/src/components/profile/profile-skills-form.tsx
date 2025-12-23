'use client';

import { Skill } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Wrench, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";
import { cn } from "@/lib/utils";

interface ProfileSkillsFormProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

export function ProfileSkillsForm({ skills, onChange }: ProfileSkillsFormProps) {
  // Check if a field is missing for validation display
  const isFieldMissing = (skill: Skill, field: 'category' | 'items') => {
    // Only show error if the entry has some data (not completely empty)
    const hasAnyData = skill.category?.trim() || (skill.items && skill.items.length > 0);
    if (!hasAnyData) return false;
    
    if (field === 'category') return !skill.category?.trim();
    if (field === 'items') return !skill.items || skill.items.length === 0;
    return false;
  };

  const addSkill = () => {
    onChange([...skills, {
      category: "",
      items: []
    }]);
  };

  // Track last shown duplicate to prevent spam
  const lastDuplicateRef = React.useRef<{ index: number; skill: string } | null>(null);

  const updateSkill = (index: number, field: keyof Skill, value: Skill[typeof field]) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };
  
  // Validate category on blur - if duplicate, clear it and show toast
  const validateCategory = (index: number, value: string) => {
    if (!value.trim()) return true;
    const isDuplicate = skills.some((s, i) => 
      i !== index && s.category.toLowerCase().trim() === value.toLowerCase().trim()
    );
    if (isDuplicate) {
      toast.error('Category already exists', {
        description: `"${value}" is already a category. Please use a different name.`,
      });
      // Clear the duplicate category to prevent saving
      updateSkill(index, 'category', '');
      return false;
    }
    return true;
  };
  
  // Process skills input - handles duplicates and formatting
  const processSkillsInput = (index: number, inputValue: string, isCommaTrigger: boolean = false) => {
    // Split on comma (with or without space after)
    const items = inputValue.split(/,\s*/).map(t => t.trim()).filter(Boolean);
    
    // Check for duplicates
    const seen = new Set<string>();
    const duplicates: string[] = [];
    const uniqueItems = items.filter(item => {
      const lowerItem = item.toLowerCase().trim();
      if (lowerItem && seen.has(lowerItem)) {
        duplicates.push(item);
        return false;
      }
      if (lowerItem) seen.add(lowerItem);
      return true;
    });
    
    if (duplicates.length > 0 && isCommaTrigger) {
      const dupSkill = duplicates[duplicates.length - 1];
      // Only show toast if it's a new duplicate (prevent spam)
      if (!lastDuplicateRef.current || 
          lastDuplicateRef.current.index !== index || 
          lastDuplicateRef.current.skill.toLowerCase() !== dupSkill.toLowerCase()) {
        lastDuplicateRef.current = { index, skill: dupSkill };
        toast.error('Duplicate skill removed', {
          description: `"${dupSkill}" already exists in this category.`,
        });
      }
      // Update input to remove duplicate immediately
      const cleanedInput = uniqueItems.join(', ') + ', ';
      setSkillInputs(prev => ({ ...prev, [index]: cleanedInput }));
      updateSkill(index, 'items', uniqueItems);
      return;
    }
    
    updateSkill(index, 'items', uniqueItems);
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const [skillInputs, setSkillInputs] = React.useState<{ [key: number]: string }>(
    Object.fromEntries(skills.map((s, i) => [i, s.items?.join(', ') || '']))
  );
  
  const [activeInput, setActiveInput] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Only sync inputs that are NOT currently being edited
    setSkillInputs(prev => {
      const newInputs: { [key: number]: string } = {};
      skills.forEach((s, i) => {
        if (i === activeInput) {
          // Keep the current typing value
          newInputs[i] = prev[i] ?? s.items?.join(', ') ?? '';
        } else {
          newInputs[i] = s.items?.join(', ') || '';
        }
      });
      return newInputs;
    });
  }, [skills, activeInput]);

  // Color variants for skill categories
  const colorVariants = [
    { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', hover: 'hover:border-rose-500/30', focus: 'focus:border-rose-500/50 focus:ring-rose-500/20' },
    { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', hover: 'hover:border-amber-500/30', focus: 'focus:border-amber-500/50 focus:ring-amber-500/20' },
    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', hover: 'hover:border-emerald-500/30', focus: 'focus:border-emerald-500/50 focus:ring-emerald-500/20' },
    { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', hover: 'hover:border-cyan-500/30', focus: 'focus:border-cyan-500/50 focus:ring-cyan-500/20' },
    { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', hover: 'hover:border-violet-500/30', focus: 'focus:border-violet-500/50 focus:ring-violet-500/20' },
  ];

  const getColorVariant = (index: number) => colorVariants[index % colorVariants.length];

  return (
    <div className="space-y-4">
      {skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No skills added yet</h3>
          <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
            Organize your skills into categories to help employers find what they need
          </p>
          <Button 
            onClick={addSkill}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Skill Category
          </Button>
        </div>
      ) : (
        <Accordion 
          type="multiple" 
          className="space-y-3"
          defaultValue={skills.map((_, index) => `skill-${index}`)}
        >
          {skills.map((skill, index) => {
            const variant = getColorVariant(index);
            return (
              <AccordionItem
                key={index}
                value={`skill-${index}`}
                className={cn(
                  "bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 rounded-xl overflow-hidden group",
                  variant.hover
                )}
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors",
                      variant.bg,
                      variant.border
                    )}>
                      <Sparkles className={cn("w-5 h-5", variant.text)} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-slate-200">
                        {skill.category || "New Skill Category"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {skill.items && skill.items.length > 0 
                          ? `${skill.items.length} skill${skill.items.length > 1 ? 's' : ''}`
                          : 'No skills added'}
                      </div>
                    </div>
                    {skill.items && skill.items.length > 0 && (
                      <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-end max-w-[300px]">
                        {skill.items.slice(0, 4).map((item, i) => (
                          <span key={i} className={cn(
                            "px-2 py-0.5 rounded-md text-[10px]",
                            variant.bg,
                            variant.border,
                            "border",
                            variant.text
                          )}>
                            {item}
                          </span>
                        ))}
                        {skill.items.length > 4 && (
                          <span className="text-[10px] text-slate-500">+{skill.items.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-5 pb-5 pt-6 space-y-5 border-t border-slate-700/50">
                    {/* Category and Delete Row */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1 group/input relative">
                        <div className={cn(
                          "absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                          isFieldMissing(skill, 'category') ? "text-rose-400" : variant.text
                        )}>
                          CATEGORY NAME <span className="text-rose-400">*</span>
                          {isFieldMissing(skill, 'category') && <AlertCircle className="w-3 h-3" />}
                        </div>
                        <Input
                          value={skill.category}
                          onChange={(e) => updateSkill(index, 'category', e.target.value)}
                          onBlur={(e) => validateCategory(index, e.target.value)}
                          className={cn(
                            "bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                            isFieldMissing(skill, 'category')
                              ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                              : cn("border-slate-700", variant.focus, "focus:ring-2 hover:border-slate-600 hover:bg-slate-800/70")
                          )}
                          placeholder="e.g., Programming Languages, Frameworks, Tools"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeSkill(index)}
                        className="h-11 w-11 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Skills Input */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className={cn(
                          "text-xs font-medium flex items-center gap-1",
                          isFieldMissing(skill, 'items') ? "text-rose-400" : variant.text
                        )}>
                          Skills in this category <span className="text-rose-400">*</span>
                          {isFieldMissing(skill, 'items') && <AlertCircle className="w-3 h-3" />}
                        </Label>
                        <span className="text-[10px] text-slate-600">Separate with comma</span>
                      </div>
                      <Input
                        value={skillInputs[index] || ''}
                        onFocus={() => setActiveInput(index)}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const oldValue = skillInputs[index] || '';
                          setSkillInputs(prev => ({ ...prev, [index]: newValue }));
                          
                          // Check if user just typed a comma
                          const justTypedComma = newValue.length > oldValue.length && 
                            (newValue.endsWith(',') || newValue.endsWith(', '));
                          
                          processSkillsInput(index, newValue, justTypedComma);
                        }}
                        onBlur={(e) => {
                          setActiveInput(null);
                          lastDuplicateRef.current = null; // Reset duplicate tracking on blur
                          // Clean up the input text when leaving the field
                          const items = e.target.value.split(/,\s*/).map(t => t.trim()).filter(Boolean);
                          updateSkill(index, 'items', items);
                          if (items.length > 0) {
                            setSkillInputs(prev => ({ ...prev, [index]: items.join(', ') }));
                          }
                        }}
                        placeholder="TypeScript, React, Node.js, AWS, Docker..."
                        className={cn(
                          "bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                          isFieldMissing(skill, 'items')
                            ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : cn("border-slate-700", variant.focus, "focus:ring-2 hover:border-slate-600 hover:bg-slate-800/70")
                        )}
                      />
                      
                      {/* Skills Preview */}
                      {skill.items && skill.items.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {skill.items.map((item, i) => (
                            <span key={i} className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium border",
                              variant.bg,
                              variant.border,
                              variant.text
                            )}>
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {skills.length > 0 && (
        <Button 
          variant="outline" 
          onClick={addSkill}
          className={cn(
            "w-full h-12 rounded-xl",
            "bg-slate-800/30 hover:bg-slate-800/50",
            "border-2 border-dashed border-slate-700 hover:border-rose-500/30",
            "text-slate-400 hover:text-rose-400",
            "transition-all duration-300"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill Category
        </Button>
      )}

      {/* Suggested Categories */}
      {skills.length > 0 && skills.length < 5 && (
        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 mb-3">Suggested categories:</p>
          <div className="flex flex-wrap gap-2">
            {['Programming Languages', 'Frameworks', 'Databases', 'Cloud & DevOps', 'Tools & Software', 'Soft Skills']
              .filter(cat => !skills.some(s => s.category.toLowerCase() === cat.toLowerCase()))
              .slice(0, 8)
              .map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onChange([...skills, { category: suggestion, items: [] }]);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 bg-slate-800/50 border border-slate-700 hover:border-slate-600 hover:text-slate-400 transition-all"
                >
                  + {suggestion}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
