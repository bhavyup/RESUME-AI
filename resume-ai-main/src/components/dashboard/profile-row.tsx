"use client";

import { Profile } from "@/lib/types";
import { User, Briefcase, GraduationCap, Code, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileRowProps {
  profile: Profile;
}

export function ProfileRow({ profile }: ProfileRowProps) {
  return (
    <div className="group relative z-10">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />

      <div className="relative rounded-xl bg-slate-900/50 hover:bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-lg shadow-emerald-500/5 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-emerald-500/10 group-hover:-translate-y-0.5">
        <div className="px-4 sm:px-6 py-3">
          {/* Main container - stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 max-w-7xl mx-auto">
            {/* Left section with avatar, name and stats */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
              {/* Avatar and Name group */}
              <div className="flex items-center gap-4">
                {/* Enhanced Avatar Circle */}
                <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 p-[2px] shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-500">
                  <div className="h-full w-full rounded-full bg-slate-900 p-1.5 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>

                {/* Name with enhanced gradient */}
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent whitespace-nowrap">
                  {profile.first_name} {profile.last_name}
                </h3>
              </div>

              {/* Stats Row - hidden on mobile, visible on sm and up */}
              <div className="hidden sm:flex items-center gap-3">
                {[
                  {
                    icon: Briefcase,
                    label: "Experience",
                    count: profile.work_experience.length,
                    colors: {
                      bg: "from-emerald-500/10 to-teal-500/10",
                      text: "text-emerald-400",
                      iconBg: "bg-emerald-500/20",
                      border: "border-emerald-500/30",
                    },
                  },
                  {
                    icon: GraduationCap,
                    label: "Education",
                    count: profile.education.length,
                    colors: {
                      bg: "from-teal-500/10 to-cyan-500/10",
                      text: "text-teal-400",
                      iconBg: "bg-teal-500/20",
                      border: "border-teal-500/30",
                    },
                  },
                  {
                    icon: Code,
                    label: "Projects",
                    count: profile.projects.length,
                    colors: {
                      bg: "from-cyan-500/10 to-emerald-500/10",
                      text: "text-cyan-400",
                      iconBg: "bg-cyan-500/20",
                      border: "border-cyan-500/30",
                    },
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1 rounded-full",
                      "bg-gradient-to-r border backdrop-blur-sm",
                      "transition-all duration-500 hover:shadow-sm",
                      "hover:-translate-y-0.5",
                      stat.colors.bg,
                      stat.colors.border
                    )}
                  >
                    <div
                      className={cn(
                        "p-1 rounded-full transition-transform duration-300",
                        stat.colors.iconBg,
                        "group-hover:scale-110"
                      )}
                    >
                      <stat.icon className={cn("h-3 w-3", stat.colors.text)} />
                    </div>
                    <span className="text-sm whitespace-nowrap">
                      <span className={cn("font-semibold", stat.colors.text)}>
                        {stat.count}
                      </span>
                      <span className="text-slate-400 ml-1.5">
                        {stat.label}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Button with enhanced styling */}
            <Link href="/profile" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 
                           hover:bg-emerald-500/20 hover:text-white
                           transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/20 shadow-sm"
              >
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
