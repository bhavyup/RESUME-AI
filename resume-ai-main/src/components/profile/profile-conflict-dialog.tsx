"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/types";
import { Check, ArrowRight, AlertCircle, User, Globe, Linkedin, Github, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileConflictDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: Profile;
  newProfile: Partial<Profile>;
  onConfirm: (selectedBasicInfo: Partial<Profile>) => void;
}

type FieldKey =
  | "first_name"
  | "last_name"
  | "email"
  | "phone_number"
  | "location"
  | "website"
  | "linkedin_url"
  | "github_url";

const FIELD_LABELS: Record<FieldKey, { label: string; icon: React.ElementType }> = {
  first_name: { label: "First Name", icon: User },
  last_name: { label: "Last Name", icon: User },
  email: { label: "Email", icon: Mail },
  phone_number: { label: "Phone", icon: Phone },
  location: { label: "Location", icon: MapPin },
  website: { label: "Website", icon: Globe },
  linkedin_url: { label: "LinkedIn", icon: Linkedin },
  github_url: { label: "GitHub", icon: Github },
};

export function ProfileConflictDialog({
  isOpen,
  onOpenChange,
  currentProfile,
  newProfile,
  onConfirm,
}: ProfileConflictDialogProps) {
  const [selections, setSelections] = useState<Record<string, "current" | "new">>({});

  // Identify fields that have new data
  const conflictingFields = useMemo(() => (Object.keys(FIELD_LABELS) as FieldKey[]).filter(
    (key) => {
      const newVal = newProfile[key];
      // Only show if there is a new value
      return newVal && newVal.trim() !== "";
    }
  ), [newProfile]);

  // Initialize selections when dialog opens or profiles change
  useEffect(() => {
    if (isOpen) {
      const initialSelections: Record<string, "current" | "new"> = {};
      conflictingFields.forEach((key) => {
        initialSelections[key] = "new";
      });
      setSelections(initialSelections);
    }
  }, [isOpen, conflictingFields]);

  const handleConfirm = () => {
    const result: Partial<Profile> = {};
    
    conflictingFields.forEach((key) => {
      if (selections[key] === "new") {
        result[key] = newProfile[key] as string; // We checked it's not null/undefined in conflictingFields
      } else {
        result[key] = currentProfile[key] as string;
      }
    });

    onConfirm(result);
  };

  const toggleSelection = (key: string, value: "current" | "new") => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  if (conflictingFields.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-slate-900 border-slate-700 max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-200 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Review Basic Information
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              We found some basic information in your resume. Please review and choose which values to keep.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 text-sm font-medium text-slate-500 px-4 mb-2">
              <div>Current Value</div>
              <div className="w-8"></div>
              <div>New Value</div>
            </div>

            {conflictingFields.map((key) => {
              const currentVal = currentProfile[key] || "";
              const newVal = newProfile[key] || "";
              const isSelectedNew = selections[key] === "new";
              const Icon = FIELD_LABELS[key].icon;

              return (
                <div
                  key={key}
                  className={cn(
                    "group relative grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-xl border transition-all",
                    isSelectedNew
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : "bg-slate-800/30 border-slate-700"
                  )}
                >
                  {/* Label */}
                  <div className="absolute -top-2.5 left-4 px-2 bg-slate-900 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Icon className="w-3 h-3" />
                    {FIELD_LABELS[key].label}
                  </div>

                  {/* Current Value */}
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm break-all cursor-pointer transition-colors border",
                      !isSelectedNew
                        ? "bg-slate-800 border-slate-600 text-slate-200 ring-2 ring-slate-600"
                        : "bg-slate-900/50 border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                    )}
                    onClick={() => toggleSelection(key, "current")}
                  >
                    {currentVal || <span className="text-slate-600 italic">Empty</span>}
                  </div>

                  {/* Arrow / Action */}
                  <div className="flex items-center justify-center w-8">
                    <ArrowRight className={cn("w-4 h-4", isSelectedNew ? "text-emerald-500" : "text-slate-600")} />
                  </div>

                  {/* New Value */}
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm break-all cursor-pointer transition-colors border relative overflow-hidden",
                      isSelectedNew
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 ring-2 ring-emerald-500/50"
                        : "bg-slate-900/50 border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                    )}
                    onClick={() => toggleSelection(key, "new")}
                  >
                    {newVal}
                    {isSelectedNew && (
                      <div className="absolute top-0 right-0 p-1 bg-emerald-500/20 rounded-bl-lg">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-slate-800 bg-slate-900">
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              Apply Selected Changes
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
