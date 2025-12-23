"use client";

import React from "react";
import {
  Profile,
  WorkExperience,
  Education,
  Project,
  Skill,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Linkedin,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Upload,
  Save,
  Trash2,
  Loader2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  FileText,
  Zap,
  Camera,
  ImagePlus,
  X,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProfileBasicInfoForm } from "@/components/profile/profile-basic-info-form";
import { ProfileWorkExperienceForm } from "@/components/profile/profile-work-experience-form";
import { ProfileProjectsForm } from "@/components/profile/profile-projects-form";
import { ProfileEducationForm } from "@/components/profile/profile-education-form";
import { ProfileSkillsForm } from "@/components/profile/profile-skills-form";
import { ProfileConflictDialog } from "@/components/profile/profile-conflict-dialog";
import { formatProfileWithAI } from "../../utils/actions/profiles/ai";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { updateProfile } from "@/utils/actions/profiles/actions";
import { cn } from "@/lib/utils";
import pdfToText from "react-pdftotext";
import { LinkedInImportDialog } from "@/components/profile/linkedin-import-dialog";

interface ProfileEditFormProps {
  profile: Profile;
}

const sections = [
  { id: "basic", label: "Basic Info", icon: User, color: "emerald" },
  { id: "experience", label: "Experience", icon: Briefcase, color: "cyan" },
  { id: "projects", label: "Projects", icon: FolderGit2, color: "violet" },
  { id: "education", label: "Education", icon: GraduationCap, color: "amber" },
  { id: "skills", label: "Skills", icon: Wrench, color: "rose" },
];

export function ProfileEditForm({
  profile: initialProfile,
}: ProfileEditFormProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeSection, setActiveSection] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isTextImportDialogOpen, setIsTextImportDialogOpen] = useState(false);
  const [isLinkedInDialogOpen, setIsLinkedInDialogOpen] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [textImportContent, setTextImportContent] = useState("");
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [isResumeDragging, setIsResumeDragging] = useState(false);
  const [isTextImportDragging, setIsTextImportDragging] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(initialProfile.photo_url || null);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Partial<Profile> | null>(
    null
  );
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Sync profile picture when profile changes
  useEffect(() => {
    setProfilePicture(initialProfile.photo_url || null);
  }, [initialProfile.photo_url]);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    if (
      !isResumeDialogOpen &&
      !isTextImportDialogOpen &&
      !isLinkedInDialogOpen
    ) {
      setApiKeyError("");
    }
  }, [isResumeDialogOpen, isTextImportDialogOpen, isLinkedInDialogOpen]);

  const updateField = (field: keyof Profile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // const EXTENSION_INSTALL_URL =
  //   process.env.NEXT_PUBLIC_EXTENSION_URL ||
  //   "https://chrome.google.com/webstore/category/extensions";

  // Validation state setter (errors are computed in real-time in navigation)
  const [, setSectionErrors] = React.useState<{
    basic: string[];
    experience: string[];
    projects: string[];
    education: string[];
    skills: string[];
  }>({ basic: [], experience: [], projects: [], education: [], skills: [] });

  // Helper to check if a skill entry is completely empty (can be removed)
  const isSkillEmpty = (skill: { category: string; items: string[] }) =>
    !skill.category?.trim() && (!skill.items || skill.items.length === 0);

  // Helper to check if entry is completely empty (can be removed)
  const isEducationEmpty = (edu: Education) =>
    !edu.school?.trim() &&
    !edu.degree?.trim() &&
    !edu.field?.trim() &&
    !edu.date?.trim() &&
    !edu.location?.trim() &&
    (!edu.achievements || edu.achievements.length === 0);

  const isProjectEmpty = (project: Project) =>
    !project.name?.trim() &&
    (!project.description ||
      project.description.filter((d) => d.trim()).length === 0) &&
    !project.url?.trim() &&
    !project.github_url?.trim() &&
    !project.date?.trim() &&
    (!project.technologies || project.technologies.length === 0);

  const isExperienceEmpty = (exp: WorkExperience) =>
    !exp.position?.trim() &&
    !exp.company?.trim() &&
    !exp.location?.trim() &&
    !exp.date?.trim() &&
    (!exp.description ||
      exp.description.filter((d) => d.trim()).length === 0) &&
    (!exp.technologies || exp.technologies.length === 0);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // First, remove completely empty entries silently
      const cleanedEducation = profile.education.filter(
        (edu) => !isEducationEmpty(edu)
      );
      const cleanedProjects = profile.projects.filter(
        (proj) => !isProjectEmpty(proj)
      );
      const cleanedExperiences = profile.work_experience.filter(
        (exp) => !isExperienceEmpty(exp)
      );
      const cleanedSkills = profile.skills.filter(
        (skill) => !isSkillEmpty(skill)
      );

      // Track validation errors by section
      const basicErrors: string[] = [];
      const educationErrors: { index: number; missing: string[] }[] = [];
      const projectErrors: { index: number; missing: string[] }[] = [];
      const experienceErrors: { index: number; missing: string[] }[] = [];
      const skillErrors: { index: number; missing: string[] }[] = [];

      // Validate basic info - all fields except social links are required
      // Only validate if user has started filling out basic info
      const hasBasicData =
        profile.first_name?.trim() ||
        profile.last_name?.trim() ||
        profile.email?.trim() ||
        profile.phone_number?.trim() ||
        profile.location?.trim();
      if (hasBasicData) {
        if (!profile.first_name?.trim()) basicErrors.push("First Name");
        if (!profile.last_name?.trim()) basicErrors.push("Last Name");
        if (!profile.email?.trim()) basicErrors.push("Email");
        if (!profile.phone_number?.trim()) basicErrors.push("Phone");
        if (!profile.location?.trim()) basicErrors.push("Location");
      }

      // Validate education entries - entries with any data must be complete
      cleanedEducation.forEach((edu, i) => {
        const missing: string[] = [];
        if (!edu.school?.trim()) missing.push("Institution");
        if (!edu.degree?.trim()) missing.push("Degree");
        if (!edu.field?.trim()) missing.push("Field");
        if (!edu.date?.trim() || !edu.date.includes(" - "))
          missing.push("End Date");
        if (missing.length > 0) {
          educationErrors.push({ index: i + 1, missing });
        }
      });

      // Validate project entries
      cleanedProjects.forEach((project, i) => {
        const missing: string[] = [];
        if (!project.name?.trim()) missing.push("Name");
        if (!project.date?.trim() || !project.date.includes(" - "))
          missing.push("End Date");
        if (missing.length > 0) {
          projectErrors.push({ index: i + 1, missing });
        }
      });

      // Validate work experience entries
      cleanedExperiences.forEach((exp, i) => {
        const missing: string[] = [];
        if (!exp.position?.trim()) missing.push("Title");
        if (!exp.company?.trim()) missing.push("Company");
        if (!exp.location?.trim()) missing.push("Location");
        if (!exp.date?.trim() || !exp.date.includes(" - "))
          missing.push("End Date");
        if (missing.length > 0) {
          experienceErrors.push({ index: i + 1, missing });
        }
      });

      // Validate skill entries - must have category name and at least one skill
      cleanedSkills.forEach((skill, i) => {
        const missing: string[] = [];
        if (!skill.category?.trim()) missing.push("Category Name");
        if (!skill.items || skill.items.length === 0)
          missing.push("At least one skill");
        if (missing.length > 0) {
          skillErrors.push({ index: i + 1, missing });
        }
      });

      // Update section errors state
      setSectionErrors({
        basic: basicErrors,
        experience: experienceErrors.map((e) => `#${e.index}`),
        projects: projectErrors.map((e) => `#${e.index}`),
        education: educationErrors.map((e) => `#${e.index}`),
        skills: skillErrors.map((e) => `#${e.index}`),
      });

      // If there are validation errors, show custom toast and STOP
      const hasErrors =
        basicErrors.length > 0 ||
        educationErrors.length > 0 ||
        projectErrors.length > 0 ||
        experienceErrors.length > 0 ||
        skillErrors.length > 0;

      if (hasErrors) {
        // Build formatted error messages
        const errorLines: string[] = [];

        if (basicErrors.length > 0) {
          errorLines.push(`Basic Info: Missing ${basicErrors.join(", ")}`);
        }
        experienceErrors.forEach((err) => {
          errorLines.push(
            `Experience #${err.index}: Missing ${err.missing.join(", ")}`
          );
        });
        projectErrors.forEach((err) => {
          errorLines.push(
            `Project #${err.index}: Missing ${err.missing.join(", ")}`
          );
        });
        educationErrors.forEach((err) => {
          errorLines.push(
            `Education #${err.index}: Missing ${err.missing.join(", ")}`
          );
        });
        skillErrors.forEach((err) => {
          errorLines.push(
            `Skills #${err.index}: Missing ${err.missing.join(", ")}`
          );
        });

        // Show custom styled toast
        toast.custom(
          (t) => (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-rose-500/30 rounded-2xl p-4 shadow-2xl shadow-rose-500/10 max-w-md animate-in slide-in-from-right-5 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-rose-400 mb-2">
                    Cannot Save — Incomplete Entries
                  </h4>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {errorLines.map((line, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                        <span className="text-slate-300">{line}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-700/50">
                    Complete all required fields or remove the entries
                  </p>
                </div>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ),
          { duration: 8000, position: "bottom-right" }
        );

        setIsSubmitting(false);
        return;
      }

      // Clear errors if validation passes
      setSectionErrors({
        basic: [],
        experience: [],
        projects: [],
        education: [],
        skills: [],
      });

      // Check for duplicates (warnings only - still allow save)
      const seenEducation = new Set<string>();
      let duplicateEducationFound = false;
      for (const edu of cleanedEducation) {
        if (edu.school?.trim()) {
          const key = `${edu.school.toLowerCase().trim()}|${edu.degree
            .toLowerCase()
            .trim()}|${edu.field.toLowerCase().trim()}`;
          if (seenEducation.has(key)) {
            duplicateEducationFound = true;
            break;
          }
          seenEducation.add(key);
        }
      }
      if (duplicateEducationFound) {
        toast.warning("Duplicate education entries detected", {
          description:
            "You have education entries with the same institution, degree, and field.",
          position: "bottom-left",
        });
      }

      const seenProjects = new Set<string>();
      let duplicateProjectFound = false;
      for (const project of cleanedProjects) {
        if (project.name?.trim()) {
          const key = `${project.name.toLowerCase().trim()}|${(
            project.date || ""
          )
            .toLowerCase()
            .trim()}`;
          if (seenProjects.has(key)) {
            duplicateProjectFound = true;
            break;
          }
          seenProjects.add(key);
        }
      }
      if (duplicateProjectFound) {
        toast.warning("Duplicate project entries detected", {
          description: "You have projects with the same name and date.",
          position: "bottom-left",
        });
      }

      const seenExperiences = new Set<string>();
      let duplicateExperienceFound = false;
      for (const exp of cleanedExperiences) {
        if (exp.position?.trim() && exp.company?.trim()) {
          const key1 = `${exp.position.toLowerCase().trim()}|${exp.company
            .toLowerCase()
            .trim()}|${(exp.date || "").toLowerCase().trim()}`;
          const key2 = `${exp.position.toLowerCase().trim()}|${exp.company
            .toLowerCase()
            .trim()}|${(exp.location || "").toLowerCase().trim()}`;
          if (
            seenExperiences.has(key1) ||
            (exp.location && seenExperiences.has(key2))
          ) {
            duplicateExperienceFound = true;
            break;
          }
          seenExperiences.add(key1);
          if (exp.location) seenExperiences.add(key2);
        }
      }
      if (duplicateExperienceFound) {
        toast.warning("Duplicate experience entries detected", {
          description:
            "You have experiences with the same position, company, and date/location.",
          position: "bottom-left",
        });
      }

      // Update profile with cleaned data (empty entries removed)
      const cleanedProfile = {
        ...profile,
        education: cleanedEducation,
        projects: cleanedProjects,
        work_experience: cleanedExperiences,
        skills: cleanedSkills,
      };

      setProfile(cleanedProfile);
      await updateProfile(cleanedProfile);

      toast.custom(
        (t) => (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10 max-w-sm animate-in slide-in-from-right-5 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-emerald-400">
                  Profile Saved!
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your changes have been saved successfully
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ),
        { duration: 3000, position: "bottom-right" }
      );

      router.refresh();
    } catch (error) {
      void error;
      toast.custom(
        (t) => (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-rose-500/30 rounded-2xl p-4 shadow-2xl shadow-rose-500/10 max-w-sm animate-in slide-in-from-right-5 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-rose-400">
                  Save Failed
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unable to save changes. Please try again.
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ),
        { duration: 4000, position: "bottom-right" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const resetProfile = {
        id: profile.id,
        user_id: profile.user_id,
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        location: "",
        website: "",
        linkedin_url: "",
        github_url: "",
        photo_url: null,
        work_experience: [],
        education: [],
        skills: [],
        projects: [],
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };

      setProfile(resetProfile);
      setProfilePicture(null);
      await updateProfile(resetProfile);

      toast.success("Profile reset successfully", {
        position: "bottom-right",
      });

      router.refresh();
    } catch (error: unknown) {
      toast.error("Failed to reset profile. Please try again.", {
        position: "bottom-right",
      });
      console.error(error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLinkedInImport = () => {
    setIsLinkedInDialogOpen(true);
    setIsResumeDialogOpen(false);
    setIsTextImportDialogOpen(false);
  };

  // Allow extension to inject normalized result directly via window.postMessage
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (
        data.source !== "resumeai-extension" ||
        data.type !== "linkedin-import-result"
      )
        return;
      if (!data.payload || !data.payload.result) return;

      setPendingProfile(data.payload.result);
      setIsConflictDialogOpen(true);
      setIsLinkedInDialogOpen(false);
      toast.success(
        "LinkedIn import received from extension. Review changes.",
        {
          position: "bottom-right",
          duration: 4000,
        }
      );
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleResumeUpload = async (content: string) => {
    try {
      setIsProcessingResume(true);

      const MODEL_STORAGE_KEY = "resumeai-default-model";
      const LOCAL_STORAGE_KEY = "resumeai-api-keys";

      const selectedModel =
        localStorage.getItem(MODEL_STORAGE_KEY) || "claude-sonnet-4-20250514";
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error("Error parsing API keys:", error);
      }

      const result = await formatProfileWithAI(content, {
        model: selectedModel,
        apiKeys,
      });

      if (result) {
        const cleanedProfile: Partial<Profile> = {
          first_name: result.first_name || null,
          last_name: result.last_name || null,
          email: result.email || null,
          phone_number: result.phone_number || null,
          location: result.location || null,
          website: result.website || null,
          linkedin_url: result.linkedin_url || null,
          github_url: result.github_url || null,
          work_experience: Array.isArray(result.work_experience)
            ? result.work_experience.map((exp: Partial<WorkExperience>) => ({
                company: exp.company || "",
                position: exp.position || "",
                location: exp.location || "",
                date: exp.date || "",
                description: Array.isArray(exp.description)
                  ? exp.description
                  : [exp.description || ""],
                technologies: Array.isArray(exp.technologies)
                  ? exp.technologies
                  : [],
              }))
            : [],
          education: Array.isArray(result.education)
            ? result.education.map((edu: Partial<Education>) => ({
                school: edu.school || "",
                degree: edu.degree || "",
                field: edu.field || "",
                location: edu.location || "",
                date: edu.date || "",
                gpa: edu.gpa ? parseFloat(edu.gpa.toString()) : undefined,
                achievements: Array.isArray(edu.achievements)
                  ? edu.achievements
                  : [],
              }))
            : [],
          skills: Array.isArray(result.skills)
            ? result.skills.map(
                (skill: {
                  category: string;
                  skills?: string[];
                  items?: string[];
                }) => ({
                  category: skill.category || "",
                  items: Array.isArray(skill.skills)
                    ? skill.skills
                    : Array.isArray(skill.items)
                    ? skill.items
                    : [],
                })
              )
            : [],
          projects: Array.isArray(result.projects)
            ? result.projects.map((proj: Partial<Project>) => ({
                name: proj.name || "",
                description: Array.isArray(proj.description)
                  ? proj.description
                  : [proj.description || ""],
                technologies: Array.isArray(proj.technologies)
                  ? proj.technologies
                  : [],
                url: proj.url || undefined,
                github_url: proj.github_url || undefined,
                date: proj.date || "",
              }))
            : [],
        };

        // MERGE new data with existing data instead of overwriting
        // Only update local state - don't save to database yet
        // User needs to click "Save Changes" to persist the data

        setPendingProfile(cleanedProfile);
        setIsConflictDialogOpen(true);
        setIsResumeDialogOpen(false);
        setIsTextImportDialogOpen(false);
        setIsLinkedInDialogOpen(false);
        setResumeContent("");
        setTextImportContent("");
        // setLinkedinContent("");
        // setLinkedinUrl("");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Resume upload error:", error);
        if (error.message.toLowerCase().includes("api key")) {
          setApiKeyError(
            "API key required. Please add your API key in settings or upgrade to Pro."
          );
        } else {
          toast.error("Failed to process content: " + error.message, {
            position: "bottom-right",
          });
        }
      }
    } finally {
      setIsProcessingResume(false);
    }
  };

  const handleConflictConfirm = (selectedBasicInfo: Partial<Profile>) => {
    if (!pendingProfile) return;

    setProfile((prev) => {
      // Helper to merge arrays and deduplicate
      const mergeWorkExperience = (
        existing: WorkExperience[],
        newItems: WorkExperience[]
      ) => {
        const existingKeys = new Set(
          existing.map(
            (e) =>
              `${(e.position || "").toLowerCase().trim()}|${(e.company || "")
                .toLowerCase()
                .trim()}|${(e.date || "").toLowerCase().trim()}`
          )
        );
        const uniqueNew = newItems.filter((item) => {
          const key = `${(item.position || "").toLowerCase().trim()}|${(
            item.company || ""
          )
            .toLowerCase()
            .trim()}|${(item.date || "").toLowerCase().trim()}`;
          return !existingKeys.has(key);
        });
        return [...existing, ...uniqueNew];
      };

      const mergeEducation = (existing: Education[], newItems: Education[]) => {
        const existingKeys = new Set(
          existing.map(
            (e) =>
              `${(e.school || "").toLowerCase().trim()}|${(e.degree || "")
                .toLowerCase()
                .trim()}|${(e.field || "").toLowerCase().trim()}`
          )
        );
        const uniqueNew = newItems.filter((item) => {
          const key = `${(item.school || "").toLowerCase().trim()}|${(
            item.degree || ""
          )
            .toLowerCase()
            .trim()}|${(item.field || "").toLowerCase().trim()}`;
          return !existingKeys.has(key);
        });
        return [...existing, ...uniqueNew];
      };

      const mergeProjects = (existing: Project[], newItems: Project[]) => {
        const existingKeys = new Set(
          existing.map((p) => `${(p.name || "").toLowerCase().trim()}`)
        );
        const uniqueNew = newItems.filter((item) => {
          const key = `${(item.name || "").toLowerCase().trim()}`;
          return !existingKeys.has(key);
        });
        return [...existing, ...uniqueNew];
      };

      const mergeSkills = (existing: Skill[], newItems: Skill[]) => {
        const existingCategories = new Map<string, Skill>();
        existing.forEach((s) => {
          existingCategories.set((s.category || "").toLowerCase().trim(), s);
        });

        const merged = [...existing];
        newItems.forEach((newSkill) => {
          const key = (newSkill.category || "").toLowerCase().trim();
          const existingSkill = existingCategories.get(key);
          if (existingSkill) {
            // Merge items into existing category
            const existingItems = new Set(
              existingSkill.items.map((i: string) => i.toLowerCase().trim())
            );
            const newUniqueItems = newSkill.items.filter(
              (i: string) => !existingItems.has(i.toLowerCase().trim())
            );
            existingSkill.items = [...existingSkill.items, ...newUniqueItems];
          } else {
            // Add new category
            merged.push(newSkill);
            existingCategories.set(key, newSkill);
          }
        });
        return merged;
      };

      return {
        ...prev,
        // Use selected basic info
        first_name: selectedBasicInfo.first_name ?? prev.first_name,
        last_name: selectedBasicInfo.last_name ?? prev.last_name,
        email: selectedBasicInfo.email ?? prev.email,
        phone_number: selectedBasicInfo.phone_number ?? prev.phone_number,
        location: selectedBasicInfo.location ?? prev.location,
        website: selectedBasicInfo.website ?? prev.website,
        linkedin_url: selectedBasicInfo.linkedin_url ?? prev.linkedin_url,
        github_url: selectedBasicInfo.github_url ?? prev.github_url,

        // Merge arrays - add new items, don't overwrite existing
        work_experience: mergeWorkExperience(
          prev.work_experience || [],
          pendingProfile.work_experience || []
        ),
        education: mergeEducation(
          prev.education || [],
          pendingProfile.education || []
        ),
        projects: mergeProjects(
          prev.projects || [],
          pendingProfile.projects || []
        ),
        skills: mergeSkills(prev.skills || [], pendingProfile.skills || []),
      };
    });

    toast.success(
      "Content imported! New data has been merged with existing. Review and click 'Save Changes' to save.",
      {
        position: "bottom-right",
        duration: 5000,
      }
    );
    setIsConflictDialogOpen(false);
    setPendingProfile(null);
  };

  const handleDrag = (
    e: React.DragEvent,
    isDraggingState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      isDraggingState(true);
    } else if (e.type === "dragleave") {
      isDraggingState(false);
    }
  };

  const handleDrop = async (
    e: React.DragEvent,
    setContent: React.Dispatch<React.SetStateAction<string>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResumeDragging(false);
    setIsTextImportDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      try {
        const text = await pdfToText(pdfFile);
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
      } catch (error) {
        console.error("PDF processing error:", error);
        toast.error("Failed to extract text from PDF.", {
          position: "bottom-right",
        });
      }
    } else {
      toast.error("Please drop a PDF file.", { position: "bottom-right" });
    }
  };

  const handleFileInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setContent: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const text = await pdfToText(file);
        setContent((prev) => prev + (prev ? "\n\n" : "") + text);
      } catch (error) {
        console.error("PDF processing error:", error);
        toast.error("Failed to extract text from PDF.", {
          position: "bottom-right",
        });
      }
    }
  };

  const getInitials = () => {
    const first = profile.first_name?.[0] || "";
    const last = profile.last_name?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB", {
          position: "bottom-right",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setProfilePicture(result);
        updateField("photo_url", result);
        toast.success("Profile picture updated! Don't forget to save.", { position: "bottom-right" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    updateField("photo_url", null);
    toast.success("Profile picture removed. Don't forget to save.", { position: "bottom-right" });
  };

  const profileCompleteness = () => {
    let score = 0;
    if (profile.first_name) score += 10;
    if (profile.last_name) score += 10;
    if (profile.email) score += 10;
    if (profile.phone_number) score += 5;
    if (profile.location) score += 5;
    if (profile.linkedin_url) score += 5;
    if (profile.github_url) score += 5;
    if (profile.work_experience?.length > 0) score += 20;
    if (profile.education?.length > 0) score += 15;
    if (profile.skills?.length > 0) score += 10;
    if (profile.projects?.length > 0) score += 5;
    return Math.min(100, score);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "basic":
        return (
          <ProfileBasicInfoForm
            profile={profile}
            onChange={(field, value) =>
              updateField(field as keyof Profile, value)
            }
          />
        );
      case "experience":
        return (
          <ProfileWorkExperienceForm
            experiences={profile.work_experience}
            onChange={(experiences) =>
              updateField("work_experience", experiences)
            }
          />
        );
      case "projects":
        return (
          <ProfileProjectsForm
            projects={profile.projects}
            onChange={(projects) => updateField("projects", projects)}
          />
        );
      case "education":
        return (
          <ProfileEducationForm
            education={profile.education}
            onChange={(education) => updateField("education", education)}
          />
        );
      case "skills":
        return (
          <ProfileSkillsForm
            skills={profile.skills}
            onChange={(skills) => updateField("skills", skills)}
          />
        );
      default:
        return null;
    }
  };

  const completeness = profileCompleteness();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

          <div className="relative px-6 py-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar with Upload */}
              <div
                className="relative group flex-shrink-0 ml-2"
                onMouseEnter={() => setIsAvatarHovered(true)}
                onMouseLeave={() => setIsAvatarHovered(false)}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        {getInitials()}
                      </span>
                      <span className="text-[8px] text-slate-400">
                        Upload Picture
                      </span>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />

                {/* Avatar Action Button with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-emerald-500/50 focus:outline-0 focus:ring-0",
                        isAvatarHovered && "ring-2 ring-emerald-500/30"
                      )}
                    >
                      {profilePicture ? (
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ImagePlus className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    side="bottom"
                    className="bg-slate-900 border-slate-700 min-w-[140px]"
                  >
                    <DropdownMenuItem
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer gap-2"
                    >
                      <ImagePlus className="w-4 h-4 text-emerald-400" />
                      {profilePicture ? "Replace" : "Upload"}
                    </DropdownMenuItem>
                    {profilePicture && (
                      <DropdownMenuItem
                        onClick={handleRemoveProfilePicture}
                        className="text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left min-w-0">
                <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent mb-1">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name || ""} ${
                        profile.last_name || ""
                      }`.trim()
                    : "Your Profile"}
                </h1>
                <p className="text-slate-400 text-sm mb-3">
                  {profile.email || "Add your email to get started"}
                </p>

                {/* Progress Bar */}
                <div className="max-w-sm mx-auto md:mx-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Profile Completeness</span>
                    <span className="text-emerald-400 font-medium">
                      {completeness}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Import Actions */}
              <div className="flex items-stretch gap-6 ">
                {/* Vertical Separator */}
                <div className="hidden lg:flex flex-col items-center py-1">
                  <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-600 to-slate-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 ring-2 ring-slate-800 my-1" />
                  <div className="w-px flex-1 bg-gradient-to-b from-slate-600 via-slate-600 to-transparent" />
                </div>

                {/* Import Methods Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Other Import Methods:
                    </span>
                  </div>

                  <Dialog
                    open={isResumeDialogOpen}
                    onOpenChange={setIsResumeDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button className="group relative flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-800/30 hover:bg-emerald-500/5 transition-all duration-300">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-[13px] font-medium text-slate-300 group-hover:text-emerald-400 transition-colors">
                            Upload Resume
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                            PDF format
                          </div>
                        </div>
                        <Sparkles className="w-3 h-3 text-emerald-500/50 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-slate-200 flex items-center gap-2">
                          <Zap className="h-5 w-5 text-emerald-400" />
                          Import Resume with AI
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Upload your resume and let AI extract your information
                          automatically.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <label
                          onDragEnter={(e) =>
                            handleDrag(e, setIsResumeDragging)
                          }
                          onDragLeave={(e) =>
                            handleDrag(e, setIsResumeDragging)
                          }
                          onDragOver={(e) => handleDrag(e, setIsResumeDragging)}
                          onDrop={(e) => handleDrop(e, setResumeContent)}
                          className={cn(
                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer",
                            isResumeDragging
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50"
                          )}
                        >
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={(e) =>
                              handleFileInput(e, setResumeContent)
                            }
                          />
                          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-emerald-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-slate-300">
                              Drop your PDF resume here
                            </p>
                            <p className="text-xs text-slate-500">
                              or click to browse files
                            </p>
                          </div>
                        </label>
                        <div className="relative">
                          <Textarea
                            value={resumeContent}
                            onChange={(e) => setResumeContent(e.target.value)}
                            placeholder="Or paste your resume text here..."
                            className="min-h-[100px] bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                      {apiKeyError && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-rose-400">
                                API Key Required
                              </p>
                              <p className="text-xs text-rose-400/80 mt-1">
                                {apiKeyError}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <ProUpgradeButton />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                  onClick={() =>
                                    (window.location.href = "/settings")
                                  }
                                >
                                  Add API Key
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsResumeDialogOpen(false)}
                          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleResumeUpload(resumeContent)}
                          disabled={isProcessingResume || !resumeContent.trim()}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                        >
                          {isProcessingResume ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Process with AI
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <button
                    onClick={handleLinkedInImport}
                    className="group relative flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-slate-700 hover:border-[#0077b5]/50 bg-slate-800/30 hover:bg-[#0077b5]/5 transition-all duration-300"
                  >
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#0077b5]/20 to-[#00a0dc]/20 border border-[#0077b5]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                    </div>
                    <div className="text-left">
                      <div className="text-[13px] font-medium text-slate-300 group-hover:text-[#0077b5] transition-colors">
                        Import LinkedIn
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        Profile sync
                      </div>
                    </div>
                    <Sparkles className="w-3 h-3 text-[#0077b5]/50 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <Dialog
                    open={isTextImportDialogOpen}
                    onOpenChange={setIsTextImportDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button className="group relative flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-slate-700 hover:border-violet-500/50 bg-slate-800/30 hover:bg-violet-500/5 transition-all duration-300">
                        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-[13px] font-medium text-slate-300 group-hover:text-violet-400 transition-colors">
                            Import Text
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                            Paste content
                          </div>
                        </div>
                        <Sparkles className="w-3 h-3 text-violet-500/50 absolute top-2 right-[34px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-slate-200 flex items-center gap-2">
                          <Zap className="h-5 w-5 text-violet-400" />
                          Import from Text
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Paste any text content and AI will extract relevant
                          profile information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <label
                          onDragEnter={(e) =>
                            handleDrag(e, setIsTextImportDragging)
                          }
                          onDragLeave={(e) =>
                            handleDrag(e, setIsTextImportDragging)
                          }
                          onDragOver={(e) =>
                            handleDrag(e, setIsTextImportDragging)
                          }
                          onDrop={(e) => handleDrop(e, setTextImportContent)}
                          className={cn(
                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer",
                            isTextImportDragging
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-slate-700 hover:border-violet-500/50 hover:bg-slate-800/50"
                          )}
                        >
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={(e) =>
                              handleFileInput(e, setTextImportContent)
                            }
                          />
                          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-violet-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-slate-300">
                              Drop your PDF here
                            </p>
                            <p className="text-xs text-slate-500">
                              or click to browse
                            </p>
                          </div>
                        </label>
                        <Textarea
                          value={textImportContent}
                          onChange={(e) => setTextImportContent(e.target.value)}
                          placeholder="Or paste your text content here..."
                          className="min-h-[100px] bg-slate-800/50 border-slate-700 text-slate-300 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                        />
                      </div>
                      {apiKeyError && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-rose-400">
                                API Key Required
                              </p>
                              <p className="text-xs text-rose-400/80 mt-1">
                                {apiKeyError}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsTextImportDialogOpen(false)}
                          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleResumeUpload(textImportContent)}
                          disabled={
                            isProcessingResume || !textImportContent.trim()
                          }
                          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                        >
                          {isProcessingResume ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Process with AI
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
                Profile Sections
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const count =
                    section.id === "experience"
                      ? profile.work_experience?.length
                      : section.id === "projects"
                      ? profile.projects?.length
                      : section.id === "education"
                      ? profile.education?.length
                      : section.id === "skills"
                      ? profile.skills?.length
                      : null;

                  // Compute errors in real-time based on current profile state
                  const computeSectionHasErrors = (): boolean => {
                    if (section.id === "basic") {
                      // Check if basic info has any data but is incomplete
                      const hasBasicData =
                        profile.first_name?.trim() ||
                        profile.last_name?.trim() ||
                        profile.email?.trim() ||
                        profile.phone_number?.trim() ||
                        profile.location?.trim();
                      if (!hasBasicData) return false;
                      return (
                        !profile.first_name?.trim() ||
                        !profile.last_name?.trim() ||
                        !profile.email?.trim() ||
                        !profile.phone_number?.trim() ||
                        !profile.location?.trim()
                      );
                    }

                    if (section.id === "experience") {
                      return (
                        profile.work_experience?.some((exp) => {
                          const hasAnyData =
                            exp.position?.trim() ||
                            exp.company?.trim() ||
                            exp.location?.trim() ||
                            exp.date?.trim() ||
                            (exp.description &&
                              exp.description.some((d) => d.trim()));
                          if (!hasAnyData) return false;
                          return (
                            !exp.position?.trim() ||
                            !exp.company?.trim() ||
                            !exp.location?.trim() ||
                            !exp.date?.trim() ||
                            !exp.date.includes(" - ")
                          );
                        }) || false
                      );
                    }

                    if (section.id === "projects") {
                      return (
                        profile.projects?.some((project) => {
                          const hasAnyData =
                            project.name?.trim() ||
                            (project.description &&
                              project.description.some((d) => d.trim())) ||
                            project.url?.trim() ||
                            project.github_url?.trim() ||
                            project.date?.trim() ||
                            (project.technologies &&
                              project.technologies.length > 0);
                          if (!hasAnyData) return false;
                          return (
                            !project.name?.trim() ||
                            !project.date?.trim() ||
                            !project.date.includes(" - ")
                          );
                        }) || false
                      );
                    }

                    if (section.id === "education") {
                      return (
                        profile.education?.some((edu) => {
                          const hasAnyData =
                            edu.school?.trim() ||
                            edu.degree?.trim() ||
                            edu.field?.trim() ||
                            edu.date?.trim() ||
                            edu.location?.trim() ||
                            (edu.achievements && edu.achievements.length > 0);
                          if (!hasAnyData) return false;
                          return (
                            !edu.school?.trim() ||
                            !edu.degree?.trim() ||
                            !edu.field?.trim() ||
                            !edu.date?.trim() ||
                            !edu.date.includes(" - ")
                          );
                        }) || false
                      );
                    }

                    if (section.id === "skills") {
                      return (
                        profile.skills?.some((skill) => {
                          const hasAnyData =
                            skill.category?.trim() ||
                            (skill.items && skill.items.length > 0);
                          if (!hasAnyData) return false;
                          return (
                            !skill.category?.trim() ||
                            !skill.items ||
                            skill.items.length === 0
                          );
                        }) || false
                      );
                    }

                    return false;
                  };

                  const hasErrors = computeSectionHasErrors();

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
                          : hasErrors
                          ? "text-rose-400 hover:text-rose-300 bg-rose-500/5 border border-rose-500/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {hasErrors && (
                          <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            isActive
                              ? "bg-emerald-500/20"
                              : hasErrors
                              ? "bg-rose-500/10"
                              : "bg-slate-800"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isActive
                                ? "text-emerald-400"
                                : hasErrors
                                ? "text-rose-400"
                                : "text-slate-500"
                            )}
                          />
                        </div>
                        <span>{section.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {count !== null && count > 0 && (
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              isActive
                                ? "bg-emerald-500/20 text-emerald-400"
                                : hasErrors
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-slate-800 text-slate-500"
                            )}
                          >
                            {count}
                          </span>
                        )}
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isActive
                              ? "rotate-90 text-emerald-400"
                              : hasErrors
                              ? "text-rose-400"
                              : "text-slate-600"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {profile.work_experience?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500">Jobs</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {profile.projects?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500">Projects</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-violet-400">
                      {profile.education?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500">Education</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {profile.skills?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500">Skill Sets</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[600px] mb-5">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              {/* Section Header with Actions */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {sections.map((section) => {
                    if (section.id !== activeSection) return null;
                    const Icon = section.icon;
                    return (
                      <div key={section.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-200">
                            {section.label}
                          </h2>
                          <p className="text-xs text-slate-500">
                            {section.id === "basic" &&
                              "Your personal and contact information"}
                            {section.id === "experience" &&
                              "Add your work history and achievements"}
                            {section.id === "projects" &&
                              "Showcase your personal and professional projects"}
                            {section.id === "education" &&
                              "Your academic background and certifications"}
                            {section.id === "skills" &&
                              "Technical and professional skills"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-9 px-3"
                        disabled={isResetting}
                      >
                        {isResetting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Reset</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-200">
                          Reset Profile
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                          This will clear all your profile data. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReset}
                          className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          Reset Profile
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 h-9 px-4"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Section Content */}
              <div className="animate-in fade-in-50 slide-in-from-right-5 duration-300">
                {renderSectionContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-16" />

      <LinkedInImportDialog
        isOpen={isLinkedInDialogOpen}
        onOpenChange={setIsLinkedInDialogOpen}
        onProcess={handleResumeUpload}
        isProcessing={isProcessingResume}
      />

      <ProfileConflictDialog
        isOpen={isConflictDialogOpen}
        onOpenChange={setIsConflictDialogOpen}
        currentProfile={profile}
        newProfile={pendingProfile || {}}
        onConfirm={handleConflictConfirm}
      />
    </div>
  );
}
