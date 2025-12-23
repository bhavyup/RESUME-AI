"use client";

import { WorkExperience, Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Loader2,
  Sparkles,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";

import { useState, useRef, useEffect, memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Tiptap from "@/components/ui/tiptap";
import {
  generateWorkExperiencePoints,
  improveWorkExperience,
} from "@/utils/actions/resumes/ai";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import { AIGenerationSettingsTooltip } from "../components/ai-generation-tooltip";
import { AISuggestions } from "../../shared/ai-suggestions";

interface AISuggestion {
  id: string;
  point: string;
}

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
  profile: Profile;
  targetRole?: string;
}

interface ImprovedPoint {
  original: string;
  improved: string;
}

interface ImprovementConfig {
  [key: number]: { [key: number]: string }; // expIndex -> pointIndex -> prompt
}

// Sanitize AI-generated HTML
const sanitizeAIHtml = (input: string) => {
  if (!input) return "";

  let cleanText = input;

  // 1. Remove Markdown Code Blocks
  cleanText = cleanText.replace(/```[\s\S]*?```/g, (match) => {
    return match
      .replace(/```(?:html|css|js|typescript|text)?/gi, "")
      .replace(/```/g, "");
  });

  // 2. Remove Inline Code Backticks
  cleanText = cleanText.replace(/`([^`]+)`/g, "$1");

  // 3. Sanitize HTML
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanText, "text/html");

    const elementsWithStyle = doc.body.querySelectorAll("[style]");
    elementsWithStyle.forEach((el) => el.removeAttribute("style"));

    const elementsWithClass = doc.body.querySelectorAll("[class]");
    elementsWithClass.forEach((el) => el.removeAttribute("class"));

    const allowedTags = [
      "B",
      "STRONG",
      "I",
      "EM",
      "U",
      "P",
      "UL",
      "OL",
      "LI",
      "BR",
    ];

    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach((el) => {
      if (!allowedTags.includes(el.tagName)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
      }
    });

    cleanText = doc.body.innerHTML;
  } catch (e) {
    console.error("Sanitization failed", e);
  }

  return cleanText.trim();
};

function areWorkExperiencePropsEqual(
  prevProps: WorkExperienceFormProps,
  nextProps: WorkExperienceFormProps
) {
  return (
    prevProps.targetRole === nextProps.targetRole &&
    JSON.stringify(prevProps.experiences) ===
      JSON.stringify(nextProps.experiences) &&
    prevProps.profile.id === nextProps.profile.id
  );
}

// Export the memoized component
export const WorkExperienceForm = memo(function WorkExperienceFormComponent({
  experiences,
  onChange,
  profile,
  targetRole = "Software Engineer",
}: WorkExperienceFormProps) {
  const [aiSuggestions, setAiSuggestions] = useState<{
    [key: number]: AISuggestion[];
  }>({});
  const [loadingAI, setLoadingAI] = useState<{ [key: number]: boolean }>({});
  const [loadingPointAI, setLoadingPointAI] = useState<{
    [key: number]: { [key: number]: boolean };
  }>({});
  const [aiConfig, setAiConfig] = useState<{
    [key: number]: { numPoints: number; customPrompt: string };
  }>({});
  const [popoverOpen, setPopoverOpen] = useState<{ [key: number]: boolean }>(
    {}
  );
  const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement }>({});
  const [improvedPoints, setImprovedPoints] = useState<{
    [key: number]: { [key: number]: ImprovedPoint };
  }>({});
  const [improvementConfig, setImprovementConfig] = useState<ImprovementConfig>(
    {}
  );
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    Object.entries(popoverOpen).forEach(([index, isOpen]) => {
      if (isOpen && textareaRefs.current[Number(index)]) {
        setTimeout(() => {
          textareaRefs.current[Number(index)]?.focus();
        }, 100);
      }
    });
  }, [popoverOpen]);

  const addExperience = () => {
    onChange([
      {
        company: "",
        position: "",
        location: "",
        date: "",
        description: [],
        technologies: [],
      },
      ...experiences,
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string | string[]
  ) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedExperiences: WorkExperience[]) => {
    onChange([...importedExperiences, ...experiences]);
  };

  // --- AI GENERATION ---
  const generateAIPoints = async (index: number) => {
    const exp = experiences[index];
    const config = aiConfig[index] || { numPoints: 3, customPrompt: "" };
    setLoadingAI((prev) => ({ ...prev, [index]: true }));
    setPopoverOpen((prev) => ({ ...prev, [index]: false }));

    try {
      const MODEL_STORAGE_KEY = "resumeai-default-model";
      const LOCAL_STORAGE_KEY = "resumeai-api-keys";

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error("Error parsing API keys:", error);
      }

      const result = await generateWorkExperiencePoints(
        exp.position,
        exp.company,
        exp.technologies || [],
        targetRole,
        config.numPoints,
        config.customPrompt,
        {
          model: selectedModel || "",
          apiKeys,
        }
      );

      const suggestions = result.points.map((point: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        point: sanitizeAIHtml(point),
      }));

      setAiSuggestions((prev) => ({
        ...prev,
        [index]: suggestions,
      }));
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        // Error handling logic
        setErrorMessage({
          title: "Error",
          description: "Failed to generate AI points. Please try again.",
        });
      }
      setShowErrorDialog(true);
    } finally {
      setLoadingAI((prev) => ({ ...prev, [index]: false }));
    }
  };

  // --- IMMUTABLE FIX: Approve Suggestion ---
  const approveSuggestion = (expIndex: number, suggestion: AISuggestion) => {
    const updated = [...experiences];
    // Create a NEW object for this experience to avoid mutation
    updated[expIndex] = {
      ...updated[expIndex],
      description: [
        ...updated[expIndex].description,
        sanitizeAIHtml(suggestion.point),
      ],
    };
    onChange(updated);

    setAiSuggestions((prev) => ({
      ...prev,
      [expIndex]: prev[expIndex].filter((s) => s.id !== suggestion.id),
    }));
  };

  const deleteSuggestion = (expIndex: number, suggestionId: string) => {
    setAiSuggestions((prev) => ({
      ...prev,
      [expIndex]: prev[expIndex].filter((s) => s.id !== suggestionId),
    }));
  };

  // --- IMMUTABLE FIX: Rewrite Point ---
  const rewritePoint = async (expIndex: number, pointIndex: number) => {
    const exp = experiences[expIndex];
    const point = exp.description[pointIndex];
    const customPrompt = improvementConfig[expIndex]?.[pointIndex];

    setLoadingPointAI((prev) => ({
      ...prev,
      [expIndex]: { ...(prev[expIndex] || {}), [pointIndex]: true },
    }));

    try {
      // ... (API Key Logic same as before)
      const MODEL_STORAGE_KEY = "resumeai-default-model";
      const LOCAL_STORAGE_KEY = "ResumeAI-api-keys";
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (e) {}

      const improvedPoint = await improveWorkExperience(point, customPrompt, {
        model: selectedModel || "",
        apiKeys,
      });

      const cleaned = sanitizeAIHtml(improvedPoint);

      setImprovedPoints((prev) => ({
        ...prev,
        [expIndex]: {
          ...(prev[expIndex] || {}),
          [pointIndex]: {
            original: point,
            improved: cleaned,
          },
        },
      }));

      // FIX: Immutable Update
      const updated = [...experiences];
      const newDescription = [...updated[expIndex].description];
      newDescription[pointIndex] = cleaned;

      updated[expIndex] = {
        ...updated[expIndex],
        description: newDescription,
      };
      onChange(updated);
    } catch (error) {
      setShowErrorDialog(true);
    } finally {
      setLoadingPointAI((prev) => ({
        ...prev,
        [expIndex]: { ...(prev[expIndex] || {}), [pointIndex]: false },
      }));
    }
  };

  // --- IMMUTABLE FIX: Undo Improvement ---
  const undoImprovement = (expIndex: number, pointIndex: number) => {
    const improvedPoint = improvedPoints[expIndex]?.[pointIndex];
    if (improvedPoint) {
      const updated = [...experiences];
      const newDescription = [...updated[expIndex].description];
      newDescription[pointIndex] = improvedPoint.original;

      updated[expIndex] = {
        ...updated[expIndex],
        description: newDescription,
      };
      onChange(updated);

      setImprovedPoints((prev) => {
        const newState = { ...prev };
        if (newState[expIndex]) {
          delete newState[expIndex][pointIndex];
          if (Object.keys(newState[expIndex]).length === 0) {
            delete newState[expIndex];
          }
        }
        return newState;
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={addExperience}
            className={cn(
              "flex-1 h-11 relative overflow-hidden group/btn",
              "bg-gradient-to-r from-slate-900/90 to-slate-800/90",
              "hover:from-violet-950/90 hover:to-purple-950/90",
              "border border-violet-500/30 hover:border-violet-400/50",
              "text-violet-300 hover:text-violet-200",
              "transition-all duration-500",
              "rounded-xl",
              "shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]",
              "hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)]"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/10 to-violet-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Add Experience</span>
          </Button>

          <ImportFromProfileDialog<WorkExperience>
            profile={profile}
            onImport={handleImportFromProfile}
            type="work_experience"
            buttonClassName={cn(
              "flex-1 h-11",
              "bg-gradient-to-r from-slate-900/90 to-slate-800/90",
              "border border-slate-600/30 hover:border-violet-400/50",
              "text-slate-300 hover:text-violet-200",
              "transition-all duration-500",
              "rounded-xl"
            )}
          />
        </div>

        {experiences.map((exp, index) => (
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
              "hover:border-violet-500/40",
              "hover:shadow-[0_8px_40px_-8px_rgba(139,92,246,0.25)]"
            )}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-left-3">
              <div
                className={cn(
                  "p-2 cursor-move rounded-xl",
                  "bg-gradient-to-r from-violet-600/20 to-purple-600/20",
                  "border border-violet-500/30",
                  "backdrop-blur-sm"
                )}
              >
                <GripVertical className="h-4 w-4 text-violet-400" />
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Header Row */}
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-xl shrink-0",
                    "bg-gradient-to-br from-violet-600/20 to-purple-600/20",
                    "border border-violet-500/30"
                  )}
                >
                  <Briefcase className="h-5 w-5 text-violet-400" />
                </div>

                <div className="flex-1 relative group/input">
                  <Input
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(index, "position", e.target.value)
                    }
                    placeholder="Senior Software Engineer"
                    className={cn(
                      "h-11 text-base font-semibold",
                      "bg-slate-800/50 border-slate-700/50 rounded-xl",
                      "text-white placeholder:text-slate-500",
                      "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
                      "hover:border-violet-500/30 hover:bg-slate-800/70",
                      "transition-all duration-300"
                    )}
                  />
                  <span className="absolute -top-2 left-3 px-1.5 text-[10px] font-medium text-violet-400/80 bg-slate-900 rounded">
                    POSITION
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExperience(index)}
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

              {/* Company and Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative group/input">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(index, "company", e.target.value)
                    }
                    placeholder="Company Name"
                    className={cn(
                      "h-10 pl-10 text-sm",
                      "bg-slate-800/50 border-slate-700/50 rounded-xl",
                      "text-slate-200 placeholder:text-slate-500",
                      "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
                      "hover:border-violet-500/30",
                      "transition-all duration-300"
                    )}
                  />
                  <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                    COMPANY
                  </span>
                </div>

                <div className="relative group/input">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <Input
                    value={exp.location}
                    onChange={(e) =>
                      updateExperience(index, "location", e.target.value)
                    }
                    placeholder="San Francisco, CA"
                    className={cn(
                      "h-10 pl-10 text-sm",
                      "bg-slate-800/50 border-slate-700/50 rounded-xl",
                      "text-slate-200 placeholder:text-slate-500",
                      "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
                      "hover:border-violet-500/30",
                      "transition-all duration-300"
                    )}
                  />
                  <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                    LOCATION
                  </span>
                </div>
              </div>

              {/* Date Row */}
              <div className="relative group/input">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  value={exp.date}
                  onChange={(e) =>
                    updateExperience(index, "date", e.target.value)
                  }
                  placeholder="Jan 2023 - Present"
                  className={cn(
                    "h-10 pl-10 text-sm",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-slate-200 placeholder:text-slate-500",
                    "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
                    "hover:border-violet-500/30",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                  DATE RANGE
                </span>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
                  <span className="text-[11px] font-semibold text-violet-400/80 tracking-wider uppercase">
                    Key Achievements
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-violet-500/30 to-transparent" />
                </div>

                <div className="space-y-2">
                  {exp.description.map((desc, descIndex) => (
                    <div
                      key={descIndex}
                      className="flex gap-2 items-start group/item"
                    >
                      <div className="flex-1 relative">
                        {/* --- IMMUTABLE FIX: Tiptap Change --- */}
                        <Tiptap
                          content={desc}
                          onChange={(newContent) => {
                            const updated = [...experiences];
                            const newDescription = [
                              ...updated[index].description,
                            ];
                            newDescription[descIndex] = newContent;

                            updated[index] = {
                              ...updated[index],
                              description: newDescription,
                            };
                            onChange(updated);

                            if (improvedPoints[index]?.[descIndex]) {
                              setImprovedPoints((prev) => {
                                const newState = { ...prev };
                                if (newState[index]) {
                                  delete newState[index][descIndex];
                                  if (
                                    Object.keys(newState[index]).length === 0
                                  ) {
                                    delete newState[index];
                                  }
                                }
                                return newState;
                              });
                            }
                          }}
                          className={cn(
                            "min-h-[60px] text-sm",
                            "bg-slate-800/30 border-slate-700/50 rounded-xl",
                            "!text-slate-300",
                            "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
                            "hover:border-violet-500/30",
                            "transition-all duration-300",
                            improvedPoints[index]?.[descIndex] && [
                              "border-purple-500/50",
                              "bg-gradient-to-r from-purple-900/30 to-violet-900/30",
                              "shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]",
                            ]
                          )}
                        />

                        {improvedPoints[index]?.[descIndex] && (
                          <div className="absolute -top-2 right-12 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-[10px] font-medium text-purple-300 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Enhanced
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        {improvedPoints[index]?.[descIndex] ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setImprovedPoints((prev) => {
                                  const newState = { ...prev };
                                  if (newState[index]) {
                                    delete newState[index][descIndex];
                                    if (
                                      Object.keys(newState[index]).length === 0
                                    ) {
                                      delete newState[index];
                                    }
                                  }
                                  return newState;
                                });
                              }}
                              className={cn(
                                "h-8 w-8 rounded-lg",
                                "bg-emerald-500/10 hover:bg-emerald-500/20",
                                "text-emerald-400 hover:text-emerald-300",
                                "border border-emerald-500/30",
                                "transition-all duration-300"
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => undoImprovement(index, descIndex)}
                              className={cn(
                                "h-8 w-8 rounded-lg",
                                "bg-rose-500/10 hover:bg-rose-500/20",
                                "text-rose-400 hover:text-rose-300",
                                "border border-rose-500/30",
                                "transition-all duration-300"
                              )}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* --- IMMUTABLE FIX: Delete Point --- */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updated = [...experiences];
                                const newDescription = updated[
                                  index
                                ].description.filter((_, i) => i !== descIndex);

                                updated[index] = {
                                  ...updated[index],
                                  description: newDescription,
                                };
                                onChange(updated);
                              }}
                              className={cn(
                                "h-8 w-8 rounded-lg opacity-50 group-hover/item:opacity-100",
                                "text-slate-500 hover:text-rose-400",
                                "hover:bg-rose-500/10",
                                "transition-all duration-300"
                              )}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      rewritePoint(index, descIndex)
                                    }
                                    disabled={
                                      loadingPointAI[index]?.[descIndex]
                                    }
                                    className={cn(
                                      "h-9 px-3 rounded-lg flex items-center gap-2 opacity-70 group-hover/item:opacity-100",
                                      "bg-violet-500/8 hover:bg-violet-500/16",
                                      "text-violet-300 hover:text-violet-200",
                                      "border border-violet-500/20",
                                      "transition-all duration-300",
                                      loadingPointAI[index]?.[descIndex] &&
                                        "opacity-60"
                                    )}
                                  >
                                    {loadingPointAI[index]?.[descIndex] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="start"
                                  sideOffset={2}
                                  className={cn(
                                    "w-72 p-4",
                                    "bg-slate-900/95 backdrop-blur-xl",
                                    "border border-violet-500/30",
                                    "shadow-[0_8px_32px_-8px_rgba(139,92,246,0.4)]",
                                    "rounded-xl"
                                  )}
                                >
                                  <AIImprovementPrompt
                                    value={
                                      improvementConfig[index]?.[descIndex] ||
                                      ""
                                    }
                                    onChange={(value) =>
                                      setImprovementConfig((prev) => ({
                                        ...prev,
                                        [index]: {
                                          ...(prev[index] || {}),
                                          [descIndex]: value,
                                        },
                                      }))
                                    }
                                    onSubmit={() =>
                                      rewritePoint(index, descIndex)
                                    }
                                    isLoading={
                                      loadingPointAI[index]?.[descIndex]
                                    }
                                  />
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  <AISuggestions
                    suggestions={aiSuggestions[index] || []}
                    onApprove={(suggestion) =>
                      approveSuggestion(index, suggestion)
                    }
                    onDelete={(suggestionId) =>
                      deleteSuggestion(index, suggestionId)
                    }
                  />

                  {exp.description.length === 0 &&
                    !aiSuggestions[index]?.length && (
                      <div
                        className={cn(
                          "text-sm text-slate-500 italic px-4 py-4",
                          "bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50",
                          "text-center"
                        )}
                      >
                        Add bullet points to describe your responsibilities and
                        achievements
                      </div>
                    )}
                </div>

                {/* --- IMMUTABLE FIX: Add Point --- */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = [...experiences];
                      // Create a NEW description array with the new empty string
                      const newDescription = [
                        ...updated[index].description,
                        "",
                      ];
                      // Assign a NEW object to updated[index] with the new description
                      updated[index] = {
                        ...updated[index],
                        description: newDescription,
                      };
                      onChange(updated);
                    }}
                    className={cn(
                      "flex-1 h-9",
                      "bg-slate-800/50 hover:bg-slate-800/70",
                      "border border-slate-700/50 hover:border-violet-500/30",
                      "text-slate-400 hover:text-violet-300",
                      "rounded-xl",
                      "transition-all duration-300"
                    )}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Point
                  </Button>

                  <AIGenerationSettingsTooltip
                    index={index}
                    loadingAI={loadingAI[index]}
                    generateAIPoints={generateAIPoints}
                    aiConfig={
                      aiConfig[index] || { numPoints: 3, customPrompt: "" }
                    }
                    onNumPointsChange={(value) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        [index]: { ...prev[index], numPoints: value },
                      }))
                    }
                    onCustomPromptChange={(value) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        [index]: { ...prev[index], customPrompt: value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ApiErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorMessage={errorMessage}
        onUpgrade={() => {
          setShowErrorDialog(false);
          window.location.href = "/subscription";
        }}
        onSettings={() => {
          setShowErrorDialog(false);
          window.location.href = "/settings";
        }}
      />
    </>
  );
},
areWorkExperiencePropsEqual);
