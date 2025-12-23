"use client";

import { WorkExperience } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Briefcase,
  Building2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DatePickerPro } from "@/components/ui/date-picker-pro";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parse } from "date-fns";
import React from "react";
import { cn } from "@/lib/utils";

interface ProfileWorkExperienceFormProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
}

export function ProfileWorkExperienceForm({
  experiences,
  onChange,
}: ProfileWorkExperienceFormProps) {
  const addExperience = () => {
    onChange([
      ...experiences,
      {
        company: "",
        position: "",
        location: "",
        date: "",
        description: [],
        technologies: [],
      },
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

  // Check if a field is missing for validation display
  const isFieldMissing = (
    exp: WorkExperience,
    field: "position" | "company" | "date" | "location"
  ) => {
    // Only show error if the entry has some data (not completely empty)
    const hasAnyData =
      exp.position?.trim() ||
      exp.company?.trim() ||
      exp.location?.trim() ||
      exp.date?.trim() ||
      (exp.description && exp.description.some((d) => d.trim()));
    if (!hasAnyData) return false;

    if (field === "position") return !exp.position?.trim();
    if (field === "company") return !exp.company?.trim();
    if (field === "location") return !exp.location?.trim();
    if (field === "date") return !exp.date?.trim() || !exp.date.includes(" - ");
    return false;
  };

  // Parse date string "MMM yyyy - MMM yyyy" or "MMM yyyy - Present" into Date objects
  const parseExperienceDate = (
    dateStr: string
  ): {
    startDate: Date | undefined;
    endDate: Date | undefined;
    isPresent: boolean;
  } => {
    if (!dateStr)
      return { startDate: undefined, endDate: undefined, isPresent: false };
    const parts = dateStr.split(" - ").map((p) => p.trim());

    const parseMonthYear = (str: string): Date | undefined => {
      if (!str || str === "Present") return undefined;
      try {
        const parsed = parse(str, "MMM yyyy", new Date());
        if (isNaN(parsed.getTime())) return undefined;
        return parsed;
      } catch {
        return undefined;
      }
    };

    return {
      startDate: parseMonthYear(parts[0] || ""),
      endDate:
        parts[1] === "Present" ? undefined : parseMonthYear(parts[1] || ""),
      isPresent: parts[1] === "Present",
    };
  };

  // Update date from DatePickerPro
  const updateExperienceDate = (
    index: number,
    part: "start" | "end",
    date: Date | undefined,
    isPresent?: boolean
  ) => {
    const currentDate = experiences[index].date || "";
    const parsed = parseExperienceDate(currentDate);

    let newStartDate = part === "start" ? date : parsed.startDate;
    let newEndDate = part === "end" && !isPresent ? date : parsed.endDate;
    const newIsPresent =
      part === "end" && isPresent !== undefined ? isPresent : parsed.isPresent;

    // If setting end to Present, clear end date
    if (newIsPresent) {
      newEndDate = undefined;
    }

    // Validate: start date cannot be after end date
    if (newStartDate && newEndDate && newStartDate > newEndDate) {
      if (part === "start") {
        newEndDate = newStartDate;
      } else {
        newStartDate = newEndDate;
      }
    }

    // Build date string
    let newDateStr = "";
    if (newStartDate) {
      newDateStr = format(newStartDate, "MMM yyyy");
      if (newIsPresent) {
        newDateStr += " - Present";
      } else if (newEndDate) {
        newDateStr += ` - ${format(newEndDate, "MMM yyyy")}`;
      }
    }

    updateExperience(index, "date", newDateStr);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const [techInputs, setTechInputs] = React.useState<{ [key: number]: string }>(
    Object.fromEntries(
      experiences.map((exp, i) => [i, exp.technologies?.join(", ") || ""])
    )
  );

  const [activeInput, setActiveInput] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Only sync inputs that are NOT currently being edited
    setTechInputs((prev) => {
      const newInputs: { [key: number]: string } = {};
      experiences.forEach((exp, i) => {
        if (i === activeInput) {
          // Keep the current typing value
          newInputs[i] = prev[i] ?? exp.technologies?.join(", ") ?? "";
        } else {
          newInputs[i] = exp.technologies?.join(", ") || "";
        }
      });
      return newInputs;
    });
  }, [experiences, activeInput]);

  return (
    <div className="space-y-4">
      {experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/20">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            No work experience yet
          </h3>
          <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
            Add your professional experience to help employers understand your
            background
          </p>
          <Button
            onClick={addExperience}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Experience
          </Button>
        </div>
      ) : (
        <Accordion
          type="multiple"
          className="space-y-3"
          defaultValue={experiences.map((_, index) => `experience-${index}`)}
        >
          {experiences.map((exp, index) => (
            <AccordionItem
              key={index}
              value={`experience-${index}`}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 rounded-xl overflow-hidden group"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-slate-200">
                      {exp.position || "Untitled Position"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {exp.company
                        ? `at ${exp.company}`
                        : "Company not specified"}
                      {exp.date && (
                        <span className="text-slate-600"> · {exp.date}</span>
                      )}
                    </div>
                  </div>
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-end max-w-[200px]">
                      {exp.technologies.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-700/50 rounded-md text-[10px] text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                      {exp.technologies.length > 3 && (
                        <span className="text-[10px] text-slate-500">
                          +{exp.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-5 pb-5 pt-6 space-y-5 border-t border-slate-700/50">
                  {/* Position and Delete Row */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 group/input relative">
                      <div
                        className={cn(
                          "absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                          isFieldMissing(exp, "position")
                            ? "text-rose-400"
                            : "text-cyan-400/80"
                        )}
                      >
                        POSITION <span className="text-rose-400">*</span>
                        {isFieldMissing(exp, "position") && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                      </div>
                      <Input
                        value={exp.position}
                        onChange={(e) =>
                          updateExperience(index, "position", e.target.value)
                        }
                        className={cn(
                          "bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                          isFieldMissing(exp, "position")
                            ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-slate-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 hover:bg-slate-800/70"
                        )}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(index)}
                      className="h-11 w-11 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Company */}
                  <div className="group/input relative">
                    <div
                      className={cn(
                        "absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                        isFieldMissing(exp, "company")
                          ? "text-rose-400"
                          : "text-cyan-400/80"
                      )}
                    >
                      COMPANY <span className="text-rose-400">*</span>
                      {isFieldMissing(exp, "company") && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-600" />
                    </div>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, "company", e.target.value)
                      }
                      className={cn(
                        "pr-10 bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                        isFieldMissing(exp, "company")
                          ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                          : "border-slate-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 hover:bg-slate-800/70"
                      )}
                      placeholder="Company Name"
                    />
                  </div>

                  {/* Date and Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group/input relative">
                      <div
                        className={cn(
                          "absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                          isFieldMissing(exp, "date") &&
                            !parseExperienceDate(exp.date).startDate
                            ? "text-rose-400"
                            : "text-cyan-400/80"
                        )}
                      >
                        START DATE <span className="text-rose-400">*</span>
                      </div>
                      <DatePickerPro
                        value={parseExperienceDate(exp.date).startDate}
                        onChange={(date: Date | undefined) =>
                          updateExperienceDate(index, "start", date)
                        }
                        placeholder="Select start"
                        showCalendar={false}
                        showMonths={true}
                        showYears={true}
                        className={
                          isFieldMissing(exp, "date") &&
                          !parseExperienceDate(exp.date).startDate
                            ? "border-rose-500/50"
                            : ""
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="group/input relative">
                        <div
                          className={cn(
                            "absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                            isFieldMissing(exp, "date") &&
                              parseExperienceDate(exp.date).startDate
                              ? "text-rose-400"
                              : "text-cyan-400/80"
                          )}
                        >
                          END DATE <span className="text-rose-400">*</span>
                          {isFieldMissing(exp, "date") &&
                            parseExperienceDate(exp.date).startDate && (
                              <AlertCircle className="w-3 h-3" />
                            )}
                        </div>
                        <DatePickerPro
                          value={parseExperienceDate(exp.date).endDate}
                          onChange={(date: Date | undefined) =>
                            updateExperienceDate(index, "end", date, false)
                          }
                          placeholder="Select end"
                          disabled={parseExperienceDate(exp.date).isPresent}
                          showCalendar={false}
                          showMonths={true}
                          showYears={true}
                          className={
                            isFieldMissing(exp, "date") &&
                            parseExperienceDate(exp.date).startDate &&
                            !parseExperienceDate(exp.date).isPresent
                              ? "border-rose-500/50"
                              : ""
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2 ml-1">
                        <Checkbox
                          id={`exp-present-${index}`}
                          checked={parseExperienceDate(exp.date).isPresent}
                          onCheckedChange={(checked: boolean) => {
                            updateExperienceDate(
                              index,
                              "end",
                              undefined,
                              checked
                            );
                          }}
                          className={cn(
                            "data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500",
                            isFieldMissing(exp, "date") &&
                              parseExperienceDate(exp.date).startDate &&
                              !parseExperienceDate(exp.date).isPresent
                              ? "border-rose-500"
                              : "border-slate-600"
                          )}
                        />
                        <label
                          htmlFor={`exp-present-${index}`}
                          className={cn(
                            "text-xs cursor-pointer select-none",
                            isFieldMissing(exp, "date") &&
                              parseExperienceDate(exp.date).startDate &&
                              !parseExperienceDate(exp.date).isPresent
                              ? "text-rose-400"
                              : "text-slate-400"
                          )}
                        >
                          Currently working here
                        </label>
                      </div>
                    </div>
                    <div className="group/input relative">
                      <div
                        className={cn(
                          "absolute -top-2.5 left-3 px-2 bg-slate-900/50 backdrop-blur-sm text-[10px] font-medium z-10 flex items-center gap-1",
                          isFieldMissing(exp, "location")
                            ? "text-rose-400"
                            : "text-cyan-400/80"
                        )}
                      >
                        LOCATION <span className="text-rose-400">*</span>
                        {isFieldMissing(exp, "location") && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <MapPin className="h-4 w-4 text-slate-600" />
                        </div>
                        <Input
                          value={exp.location}
                          onChange={(e) =>
                            updateExperience(index, "location", e.target.value)
                          }
                          className={cn(
                            "pr-10 bg-slate-800/50 rounded-xl h-11 text-slate-200 text-sm transition-all placeholder:text-slate-600",
                            isFieldMissing(exp, "location")
                              ? "border-rose-500/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                              : "border-slate-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-600 hover:bg-slate-800/70"
                          )}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium text-cyan-400/80">
                        Technologies & Skills
                      </Label>
                      <span className="text-[10px] text-slate-600">
                        Separate with comma
                      </span>
                    </div>
                    <Input
                      value={techInputs[index] || ""}
                      onFocus={() => setActiveInput(index)}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTechInputs((prev) => ({
                          ...prev,
                          [index]: newValue,
                        }));
                        // Update items for preview - split on both "," and ", "
                        const technologies = newValue
                          .split(/,\s*/)
                          .map((t) => t.trim())
                          .filter(Boolean);
                        updateExperience(index, "technologies", technologies);
                      }}
                      onBlur={(e) => {
                        setActiveInput(null);
                        // Clean up the input text when leaving the field
                        const technologies = e.target.value
                          .split(/,\s*/)
                          .map((t) => t.trim())
                          .filter(Boolean);
                        updateExperience(index, "technologies", technologies);
                        if (technologies.length > 0) {
                          setTechInputs((prev) => ({
                            ...prev,
                            [index]: technologies.join(", "),
                          }));
                        }
                      }}
                      placeholder="React, TypeScript, Node.js..."
                      className="bg-slate-800/50 border-slate-700 rounded-xl h-11
                        text-slate-200 text-sm
                        focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                        hover:border-slate-600 hover:bg-slate-800/70 transition-all
                        placeholder:text-slate-600"
                    />
                  </div>

                  {/* Description Points */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-medium text-cyan-400/80">
                        Key Achievements
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = [...experiences];
                          updated[index].description = [
                            ...updated[index].description,
                            "",
                          ];
                          onChange(updated);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 text-xs rounded-lg"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Point
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {exp.description.map((desc, descIndex) => (
                        <div
                          key={descIndex}
                          className="flex gap-2 items-center"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 flex-shrink-0" />
                          <Input
                            value={desc}
                            onChange={(e) => {
                              const updated = [...experiences];
                              updated[index].description[descIndex] =
                                e.target.value;
                              onChange(updated);
                            }}
                            placeholder="Start with a strong action verb..."
                            className="flex-1 bg-slate-800/50 border-slate-700 rounded-xl h-10
                              text-slate-200 text-sm
                              focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                              hover:border-slate-600 hover:bg-slate-800/70 transition-all
                              placeholder:text-slate-600"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updated = [...experiences];
                              updated[index].description = updated[
                                index
                              ].description.filter((_, i) => i !== descIndex);
                              onChange(updated);
                            }}
                            className="h-10 w-10 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      {exp.description.length === 0 && (
                        <p className="text-xs text-slate-600 italic py-2 px-3 bg-slate-900/30 rounded-lg">
                          Add bullet points to describe your responsibilities
                          and achievements
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

      {experiences.length > 0 && (
        <Button
          variant="outline"
          onClick={addExperience}
          className={cn(
            "w-full h-12 rounded-xl",
            "bg-slate-800/30 hover:bg-slate-800/50",
            "border-2 border-dashed border-slate-700 hover:border-cyan-500/30",
            "text-slate-400 hover:text-cyan-400",
            "transition-all duration-300"
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>
      )}
    </div>
  );
}
