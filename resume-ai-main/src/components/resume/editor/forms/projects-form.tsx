"use client";

import { Project, Profile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Sparkles,
  Check,
  X,
  FolderCode,
  Link,
  Github,
  Calendar,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportFromProfileDialog } from "../../management/dialogs/import-from-profile-dialog";
import { useState, useRef, useEffect, memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AISuggestions } from "../../shared/ai-suggestions";
import {
  generateProjectPoints,
  improveProject,
} from "@/utils/actions/resumes/ai";
import { Badge } from "@/components/ui/badge";
import { KeyboardEvent } from "react";
import Tiptap from "@/components/ui/tiptap";
import { AIImprovementPrompt } from "../../shared/ai-improvement-prompt";
import { AIGenerationSettingsTooltip } from "../components/ai-generation-tooltip";
import { ApiErrorDialog } from "@/components/ui/api-error-dialog";

interface AISuggestion {
  id: string;
  point: string;
}

interface ImprovedPoint {
  original: string;
  improved: string;
}

interface ImprovementConfig {
  [key: number]: { [key: number]: string }; // projectIndex -> pointIndex -> prompt
}

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  profile: Profile;
}

function areProjectsPropsEqual(
  prevProps: ProjectsFormProps,
  nextProps: ProjectsFormProps
) {
  return (
    JSON.stringify(prevProps.projects) === JSON.stringify(nextProps.projects) &&
    prevProps.profile.id === nextProps.profile.id
  );
}

export const ProjectsForm = memo(function ProjectsFormComponent({
  projects,
  onChange,
  profile,
}: ProjectsFormProps) {
  // WeakMap to store stable keys for project objects to avoid index-key reordering bugs
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
  const textareaRefs = useRef<{ [key: number]: HTMLTextAreaElement }>({});
  const [newTechnologies, setNewTechnologies] = useState<{
    [key: number]: string;
  }>({});

  useEffect(() => {
    Object.entries(popoverOpen).forEach(([index, isOpen]) => {
      if (isOpen && textareaRefs.current[Number(index)]) {
        setTimeout(() => {
          textareaRefs.current[Number(index)]?.focus();
        }, 100);
      }
    });
  }, [popoverOpen]);

  const addProject = () => {
    onChange([
      {
        name: "",
        description: [],
        technologies: [],
        date: "",
        url: "",
        github_url: "",
      },
      ...projects,
    ]);
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: Project[keyof Project]
  ) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const handleImportFromProfile = (importedProjects: Project[]) => {
    onChange([...importedProjects, ...projects]);
  };

  // --- AI GENERATION ---
  const generateAIPoints = async (index: number) => {
    const project = projects[index];
    const config = aiConfig[index] || { numPoints: 3, customPrompt: "" };
    setLoadingAI((prev) => ({ ...prev, [index]: true }));
    setPopoverOpen((prev) => ({ ...prev, [index]: false }));

    try {
      const MODEL_STORAGE_KEY = "resumeai-default-model";
      const LOCAL_STORAGE_KEY = "ResumeAI-api-keys";
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (e) {}

      const result = await generateProjectPoints(
        project.name,
        project.technologies || [],
        "Software Engineer",
        config.numPoints,
        config.customPrompt,
        { model: selectedModel || "", apiKeys }
      );

      const suggestions = result.points.map((point: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        point,
      }));

      setAiSuggestions((prev) => ({
        ...prev,
        [index]: suggestions,
      }));
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
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
  const approveSuggestion = (
    projectIndex: number,
    suggestion: AISuggestion
  ) => {
    const updated = [...projects];

    // Create new object with new description array
    updated[projectIndex] = {
      ...updated[projectIndex],
      description: [...updated[projectIndex].description, suggestion.point],
    };
    onChange(updated);

    setAiSuggestions((prev) => ({
      ...prev,
      [projectIndex]: prev[projectIndex].filter((s) => s.id !== suggestion.id),
    }));
  };

  const deleteSuggestion = (projectIndex: number, suggestionId: string) => {
    setAiSuggestions((prev) => ({
      ...prev,
      [projectIndex]: prev[projectIndex].filter((s) => s.id !== suggestionId),
    }));
  };

  // --- IMMUTABLE FIX: Rewrite Point ---
  const rewritePoint = async (projectIndex: number, pointIndex: number) => {
    const project = projects[projectIndex];
    const point = project.description[pointIndex];
    const customPrompt = improvementConfig[projectIndex]?.[pointIndex];

    setLoadingPointAI((prev) => ({
      ...prev,
      [projectIndex]: { ...(prev[projectIndex] || {}), [pointIndex]: true },
    }));

    try {
      const MODEL_STORAGE_KEY = "resumeai-default-model";
      const LOCAL_STORAGE_KEY = "ResumeAI-api-keys";
      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];
      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (e) {}

      const improvedPoint = await improveProject(point, customPrompt, {
        model: selectedModel || "",
        apiKeys,
      });

      setImprovedPoints((prev) => ({
        ...prev,
        [projectIndex]: {
          ...(prev[projectIndex] || {}),
          [pointIndex]: {
            original: point,
            improved: improvedPoint,
          },
        },
      }));

      // FIX: Immutable Update
      const updated = [...projects];
      const newDesc = [...updated[projectIndex].description];
      newDesc[pointIndex] = improvedPoint;

      updated[projectIndex] = {
        ...updated[projectIndex],
        description: newDesc,
      };
      onChange(updated);
    } catch (error: unknown) {
      setShowErrorDialog(true);
    } finally {
      setLoadingPointAI((prev) => ({
        ...prev,
        [projectIndex]: { ...(prev[projectIndex] || {}), [pointIndex]: false },
      }));
    }
  };

  // --- IMMUTABLE FIX: Undo Improvement ---
  const undoImprovement = (projectIndex: number, pointIndex: number) => {
    const improvedPoint = improvedPoints[projectIndex]?.[pointIndex];
    if (improvedPoint) {
      const updated = [...projects];
      const newDesc = [...updated[projectIndex].description];
      newDesc[pointIndex] = improvedPoint.original;

      updated[projectIndex] = {
        ...updated[projectIndex],
        description: newDesc,
      };
      onChange(updated);

      setImprovedPoints((prev) => {
        const newState = { ...prev };
        if (newState[projectIndex]) {
          delete newState[projectIndex][pointIndex];
          if (Object.keys(newState[projectIndex]).length === 0) {
            delete newState[projectIndex];
          }
        }
        return newState;
      });
    }
  };

  // --- IMMUTABLE FIX: Add Technology ---
  const addTechnology = (projectIndex: number) => {
    const techToAdd = newTechnologies[projectIndex]?.trim();
    if (!techToAdd) return;

    const updated = [...projects];
    const currentTechnologies = updated[projectIndex].technologies || [];

    if (!currentTechnologies.includes(techToAdd)) {
      // Explicitly creating a new object
      updated[projectIndex] = {
        ...updated[projectIndex],
        technologies: [...currentTechnologies, techToAdd],
      };
      onChange(updated);
    }
    setNewTechnologies({ ...newTechnologies, [projectIndex]: "" });
  };

  const handleTechKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    projectIndex: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechnology(projectIndex);
    }
  };

  // --- IMMUTABLE FIX: Remove Technology ---
  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const updated = [...projects];
    // Create new array filtered
    const newTechs = (updated[projectIndex].technologies || []).filter(
      (_, i) => i !== techIndex
    );

    // Assign new object
    updated[projectIndex] = {
      ...updated[projectIndex],
      technologies: newTechs,
    };
    onChange(updated);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={addProject}
            className={cn(
              "flex-1 h-11 relative overflow-hidden group/btn",
              "bg-gradient-to-r from-slate-900/90 to-slate-800/90",
              "hover:from-cyan-950/90 hover:to-teal-950/90",
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
            <span className="text-sm font-medium">Add Project</span>
          </Button>

          <ImportFromProfileDialog<Project>
            profile={profile}
            onImport={handleImportFromProfile}
            type="projects"
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

        {/* Project Cards */}
        {projects.map((project, index) =>  (
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

            {/* Drag Handle */}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-left-3">
              <div
                className={cn(
                  "p-2 cursor-move rounded-xl",
                  "bg-gradient-to-r from-cyan-600/20 to-teal-600/20",
                  "border border-cyan-500/30",
                  "backdrop-blur-sm"
                )}
              >
                <GripVertical className="h-4 w-4 text-cyan-400" />
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Header Row */}
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-xl shrink-0",
                    "bg-gradient-to-br from-cyan-600/20 to-teal-600/20",
                    "border border-cyan-500/30"
                  )}
                >
                  <FolderCode className="h-5 w-5 text-cyan-400" />
                </div>

                <div className="flex-1 relative">
                  <Input
                    value={project.name}
                    onChange={(e) =>
                      updateProject(index, "name", e.target.value)
                    }
                    placeholder="My Awesome Project"
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
                    PROJECT NAME
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProject(index)}
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

              {/* URLs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Link className="h-4 w-4" />
                  </div>
                  <Input
                    value={project.url || ""}
                    onChange={(e) =>
                      updateProject(index, "url", e.target.value)
                    }
                    placeholder="https://myproject.com"
                    className={cn(
                      "h-10 pl-10 text-sm",
                      "bg-slate-800/50 border-slate-700/50 rounded-xl",
                      "text-slate-200 placeholder:text-slate-500",
                      "focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30",
                      "transition-all duration-300"
                    )}
                  />
                  <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                    LIVE URL
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Github className="h-4 w-4" />
                  </div>
                  <Input
                    value={project.github_url || ""}
                    onChange={(e) =>
                      updateProject(index, "github_url", e.target.value)
                    }
                    placeholder="https://github.com/user/repo"
                    className={cn(
                      "h-10 pl-10 text-sm",
                      "bg-slate-800/50 border-slate-700/50 rounded-xl",
                      "text-slate-200 placeholder:text-slate-500",
                      "focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20",
                      "hover:border-cyan-500/30",
                      "transition-all duration-300"
                    )}
                  />
                  <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                    GITHUB URL
                  </span>
                </div>
              </div>

              {/* Date Row */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  value={project.date || ""}
                  onChange={(e) => updateProject(index, "date", e.target.value)}
                  placeholder="Jan 2023 - Present"
                  className={cn(
                    "h-10 pl-10 text-sm",
                    "bg-slate-800/50 border-slate-700/50 rounded-xl",
                    "text-slate-200 placeholder:text-slate-500",
                    "focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20",
                    "hover:border-cyan-500/30",
                    "transition-all duration-300"
                  )}
                />
                <span className="absolute -top-2 left-3 px-1.5 text-[9px] font-medium text-slate-500 bg-slate-900 rounded">
                  DATE
                </span>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
                  <span className="text-[11px] font-semibold text-cyan-400/80 tracking-wider uppercase">
                    Features & Achievements
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-cyan-500/30 to-transparent" />
                </div>

                <div className="space-y-2">
                  {project.description.map((desc, descIndex) => (
                    <div
                      key={descIndex}
                      className="flex gap-2 items-start group/item"
                    >
                      <div className="flex-1 relative">
                        {/* --- IMMUTABLE FIX: Tiptap Change --- */}
                        <Tiptap
                          content={desc}
                          onChange={(newContent) => {
                            const updated = [...projects];
                            const newDesc = [...updated[index].description];
                            newDesc[descIndex] = newContent;

                            updated[index] = {
                              ...updated[index],
                              description: newDesc,
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
                            "text-slate-300",
                            "focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20",
                            "hover:border-cyan-500/30",
                            "transition-all duration-300",
                            improvedPoints[index]?.[descIndex] && [
                              "border-cyan-500/50",
                              "bg-gradient-to-r from-cyan-900/30 to-teal-900/30",
                              "shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]",
                            ]
                          )}
                        />

                        {improvedPoints[index]?.[descIndex] && (
                          <div className="absolute -top-2 right-12 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full backdrop-blur-sm">
                            <span className="text-[10px] font-medium text-cyan-300 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Enhanced
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
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
                                const updated = [...projects];
                                const newDesc = updated[
                                  index
                                ].description.filter((_, i) => i !== descIndex);
                                updated[index] = {
                                  ...updated[index],
                                  description: newDesc,
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
                                    size="icon"
                                    onClick={() =>
                                      rewritePoint(index, descIndex)
                                    }
                                    disabled={
                                      loadingPointAI[index]?.[descIndex]
                                    }
                                    className={cn(
                                      "h-8 w-8 rounded-lg opacity-50 group-hover/item:opacity-100",
                                      "bg-cyan-500/10 hover:bg-cyan-500/20",
                                      "text-cyan-400 hover:text-cyan-300",
                                      "border border-cyan-500/30",
                                      "transition-all duration-300"
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
                                    "border border-cyan-500/30",
                                    "shadow-[0_8px_32px_-8px_rgba(6,182,212,0.4)]",
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

                  {project.description.length === 0 &&
                    !aiSuggestions[index]?.length && (
                      <div
                        className={cn(
                          "text-sm text-slate-500 italic px-4 py-4",
                          "bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50",
                          "text-center"
                        )}
                      >
                        Add points to describe your project features and
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
                      const updated = [...projects];
                      const newDesc = [...updated[index].description, ""];
                      updated[index] = {
                        ...updated[index],
                        description: newDesc,
                      };
                      onChange(updated);
                    }}
                    className={cn(
                      "flex-1 h-9",
                      "bg-slate-800/50 hover:bg-slate-800/70",
                      "border border-slate-700/50 hover:border-cyan-500/30",
                      "text-slate-400 hover:text-cyan-300",
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
                    className="flex-1 sm:flex-none sm:w-auto"
                  />
                </div>
              </div>

              {/* Technologies Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-teal-500/30 to-transparent" />
                  <Code2 className="h-3.5 w-3.5 text-teal-400/60" />
                  <span className="text-[11px] font-semibold text-teal-400/80 tracking-wider uppercase">
                    Technologies Used
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-teal-500/30 to-transparent" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(project.technologies || []).map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
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
                      {tech}
                      <button
                        onClick={() => removeTechnology(index, techIndex)}
                        className={cn(
                          "ml-2 w-4 h-4 rounded-full",
                          "flex items-center justify-center",
                          "bg-slate-800/50 hover:bg-rose-500/50",
                          "text-slate-400 hover:text-white",
                          "transition-all duration-300"
                        )}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                {(project.technologies || []).length === 0 && (
                  <div
                    className={cn(
                      "text-sm text-slate-500 italic px-4 py-3",
                      "bg-slate-800/30 rounded-xl border border-dashed border-slate-700/50",
                      "text-center"
                    )}
                  >
                    Add technologies used in this project
                  </div>
                )}

                {/* Add Technology Input */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newTechnologies[index] || ""}
                      onChange={(e) =>
                        setNewTechnologies({
                          ...newTechnologies,
                          [index]: e.target.value,
                        })
                      }
                      onKeyPress={(e) => handleTechKeyPress(e, index)}
                      placeholder="Type technology and press Enter"
                      className={cn(
                        "h-10 text-sm",
                        "bg-slate-800/50 border-slate-700/50 rounded-xl",
                        "text-slate-200 placeholder:text-slate-500",
                        "focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20",
                        "hover:border-teal-500/30",
                        "transition-all duration-300"
                      )}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTechnology(index)}
                    className={cn(
                      "h-10 px-4 rounded-xl",
                      "bg-teal-500/10 hover:bg-teal-500/20",
                      "border border-teal-500/30 hover:border-teal-400/50",
                      "text-teal-300 hover:text-teal-200",
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
areProjectsPropsEqual);
