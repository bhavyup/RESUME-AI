'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Sparkles } from "lucide-react";
import { WorkExperience, Project, Skill, Education } from "@/lib/types";
import { useState } from 'react';
import Tiptap from "@/components/ui/tiptap";

const DIFF_HIGHLIGHT_CLASSES = "bg-cyan-500/20 border border-cyan-400/50 px-1 text-cyan-100";

type SuggestionContent = WorkExperience | Project | Skill | Education;

interface SuggestionProps {
  type: 'work_experience' | 'project' | 'skill' | 'education';
  content: SuggestionContent;
  currentContent: SuggestionContent | null;
  onAccept: () => void;
  onReject: () => void;
  isReadOnly?: boolean;
}

interface WholeResumeSuggestionProps {
  onReject: () => void;
}

interface WorkExperienceSuggestionProps {
  content: WorkExperience;
  currentContent: WorkExperience | null;
}

function WorkExperienceSuggestion({ content: work, currentContent: currentWork }: WorkExperienceSuggestionProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className={cn(
            "text-base font-bold font-mono text-cyan-100 uppercase tracking-wider",
            !currentWork || currentWork.position !== work.position && DIFF_HIGHLIGHT_CLASSES
          )}>
            {work.position.replace(/\*\*/g, '')}
          </h3>
          <p className={cn(
            "text-xs font-mono text-slate-400",
            !currentWork || currentWork.company !== work.company && DIFF_HIGHLIGHT_CLASSES
          )}>
            {work.company}
          </p>
        </div>
        <span className={cn(
          "text-[10px] font-mono text-slate-500",
          !currentWork || currentWork.date !== work.date && DIFF_HIGHLIGHT_CLASSES
        )}>
          {work.date}
        </span>
      </div>
      <div className="space-y-2">
        {work.description.map((point, index) => {
          const currentPoint = currentWork?.description?.[index];
          const comparedWords = currentPoint 
            ? compareDescriptions(currentPoint, point)
            : [{ text: point.replace(/\*\*/g, ''), isNew: true, isBold: false, isStart: true, isEnd: true }];

          return (
            <div key={index} className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5 text-xs">▸</span>
              <p className="text-sm text-slate-300 font-mono flex-1 flex flex-wrap">
                {comparedWords.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={cn(
                      "inline-flex items-center",
                      word.isStart && "pl-1",
                      word.isEnd && "pr-1",
                      wordIndex < comparedWords.length - 1 && "mr-1",
                      word.isNew && "bg-cyan-500/20 border border-cyan-400/50 px-1 mx-0 text-cyan-100",
                    )}
                  >
                    {word.isBold ? (
                      <strong>{word.text}</strong>
                    ) : (
                      word.text
                    )}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProjectSuggestionProps {
  content: Project;
  currentContent: Project | null;
}

function ProjectSuggestion({ content: project, currentContent: currentProject }: ProjectSuggestionProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <h3 className={cn(
          "text-lg font-bold font-mono text-cyan-100 uppercase tracking-wider",
          !currentProject || currentProject.name !== project.name && DIFF_HIGHLIGHT_CLASSES
        )}>
          {project.name}
        </h3>
        {project.date && (
          <span className={cn(
            "text-xs font-mono text-slate-500",
            !currentProject || currentProject.date !== project.date && DIFF_HIGHLIGHT_CLASSES
          )}>
            {project.date}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {project.description.map((point, index) => {
          const currentPoint = currentProject?.description?.[index];
          const comparedWords = currentPoint 
            ? compareDescriptions(currentPoint, point)
            : [{ text: point.replace(/\*\*/g, ''), isNew: true, isBold: false, isStart: true, isEnd: true }];

          return (
            <div key={index} className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5 text-xs">▸</span>
              <p className="text-xs text-slate-300 font-mono flex-1 flex flex-wrap">
                {comparedWords.map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    className={cn(
                      "inline-flex items-center",
                      word.isStart && "pl-1",
                      word.isEnd && "pr-1",
                      wordIndex < comparedWords.length - 1 && "mr-1",
                      word.isNew && "bg-cyan-500/20 border border-cyan-400/50 px-1 mx-0 text-cyan-100",
                    )}
                  >
                    {word.isBold ? (
                      <strong>{word.text}</strong>
                    ) : (
                      word.text
                    )}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
      {project.technologies && (
        <div className="flex flex-wrap gap-2 mt-2">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className={cn(
                "px-2 py-1 text-xs font-mono uppercase tracking-wider border text-slate-300",
                !currentProject || isNewItem(currentProject.technologies, project.technologies, tech)
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-100"
                  : "bg-slate-950/80 border-slate-700"
              )}
            >
              {tech.replace(/\*\*/g, '')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface SkillSuggestionProps {
  content: Skill;
  currentContent: Skill | null;
}

function SkillSuggestion({ content: skill, currentContent: currentSkill }: SkillSuggestionProps) {
  return (
    <div className="space-y-3">
      {/* Category Header */}
      <div className="flex-1">
        <Tiptap
          content={skill.category}
          onChange={() => {}}
          readOnly={true}
          variant="skill"
          className={cn(
            "text-sm font-mono font-bold uppercase tracking-wider",
            "bg-transparent",
            "border-none shadow-none",
            !currentSkill || currentSkill.category !== skill.category && "bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 px-2 py-1"
          )}
        />
      </div>

      {/* Skills Grid */}
      <div className="flex flex-wrap gap-2">
        {skill.items.map((item, index) => {
          const isNew = !currentSkill || isNewItem(currentSkill.items, skill.items, item);
          
          return (
            <div
              key={index}
              className={cn(
                "relative group transition-all duration-300",
                "overflow-hidden",
                isNew ? [
                  "bg-slate-950/80 backdrop-blur-sm",
                  "border border-cyan-500/50",
                  "shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]",
                ] : [
                  "bg-slate-900/80 backdrop-blur-sm",
                  "border border-slate-700/50",
                  "shadow-sm",
                ],
                "hover:border-cyan-400",
                "hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]",
                "transition-all duration-300"
              )}
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

              {/* Skill Content */}
              <div className="relative px-3 py-1.5">
                <Tiptap
                  content={item}
                  onChange={() => {}}
                  readOnly={true}
                  variant="skill"
                  className={cn(
                    "border-none shadow-none p-0",
                    "text-sm font-mono",
                    "bg-transparent",
                    isNew ? "text-cyan-300" : "text-slate-400"
                  )}
                />
              </div>

              {/* New Indicator */}
              {isNew && (
                <div className="absolute -top-1 -right-1">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 bg-cyan-500"></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EducationSuggestionProps {
  content: Education;
  currentContent: Education | null;
}

function EducationSuggestion({ content: education, currentContent: currentEducation }: EducationSuggestionProps) {
  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-start">
        <div>
          <h3 className={cn(
            "font-medium font-mono text-cyan-100 uppercase tracking-wider",
            !currentEducation || (currentEducation.degree !== education.degree || currentEducation.field !== education.field) && DIFF_HIGHLIGHT_CLASSES
          )}>
            <span>
              {education.degree.split(/(\*\*.*?\*\*)/).map((part, i) => 
                part.startsWith('**') && part.endsWith('**') ? 
                  <strong key={i}>{part.slice(2, -2)}</strong> : 
                  part
              )}
            </span>
            {' in '}
            <span>
              {education.field.split(/(\*\*.*?\*\*)/).map((part, i) => 
                part.startsWith('**') && part.endsWith('**') ? 
                  <strong key={i}>{part.slice(2, -2)}</strong> : 
                  part
              )}
            </span>
          </h3>
          <p className={cn(
            "text-sm font-mono text-slate-400",
            !currentEducation || currentEducation.school !== education.school && DIFF_HIGHLIGHT_CLASSES
          )}>
            {education.school.replace(/\*\*/g, '')}
          </p>
        </div>
        <span className={cn(
          "text-xs font-mono text-slate-500",
          !currentEducation || currentEducation.date !== education.date && DIFF_HIGHLIGHT_CLASSES
        )}>
          {education.date.replace(/\*\*/g, '')}
        </span>
      </div>
      {education.achievements && (
        <div className="space-y-2">
          {education.achievements.map((achievement, index) => {
            const currentAchievement = currentEducation?.achievements?.[index];
            const comparedWords = currentAchievement 
              ? compareDescriptions(currentAchievement, achievement)
              : [{ text: achievement.replace(/\*\*/g, ''), isNew: true, isBold: false, isStart: true, isEnd: true }];

            return (
              <div key={index} className="flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 text-xs">▸</span>
                <p className="text-xs text-slate-300 font-mono flex-1 flex flex-wrap">
                  {comparedWords.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className={cn(
                        "inline-flex items-center",
                        word.isStart && "pl-1",
                        word.isEnd && "pr-1",
                        wordIndex < comparedWords.length - 1 && "mr-1",
                        word.isNew && "bg-cyan-500/20 border border-cyan-400/50 px-1 mx-0 text-cyan-100",
                      )}
                    >
                      {word.isBold ? (
                        <strong>{word.text}</strong>
                      ) : (
                        word.text
                      )}
                    </span>
                  ))}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function compareDescriptions(current: string, suggested: string): {
  text: string;
  isNew: boolean;
  isBold: boolean;
  isStart: boolean;
  isEnd: boolean;
}[] {
  // Clean the text by normalizing spaces and removing extra whitespace
  const cleanText = (text: string): string => {
    return text.trim().replace(/\s+/g, ' ');
  };

  // Split text into words, preserving bold markdown
  const splitText = (text: string): string[] => {
    // First, split by bold markdown
    const parts = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean);
    
    // Then split non-bold parts by spaces while preserving bold parts
    return parts.flatMap(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return [part];
      }
      return part.split(/\s+/).filter(Boolean);
    });
  };

  const currentText = cleanText(current);
  const suggestedText = cleanText(suggested);
  
  const currentWords = splitText(currentText);
  const suggestedWords = splitText(suggestedText);
  
  return suggestedWords.map((word, index) => {
    const isBold = word.startsWith('**') && word.endsWith('**');
    const cleanedWord = isBold ? word.slice(2, -2) : word;
    
    // Check if the word exists in current text (considering bold status)
    const isNew = !currentWords.some(currentWord => {
      const currentIsBold = currentWord.startsWith('**') && currentWord.endsWith('**');
      const currentCleaned = currentIsBold ? currentWord.slice(2, -2) : currentWord;
      return currentCleaned === cleanedWord;
    });
    
    // Check if adjacent words are new
    const prevWord = index > 0 ? suggestedWords[index - 1] : null;
    const nextWord = index < suggestedWords.length - 1 ? suggestedWords[index + 1] : null;
    
    const prevIsNew = prevWord ? !currentWords.includes(prevWord) : false;
    const nextIsNew = nextWord ? !currentWords.includes(nextWord) : false;
    
    return {
      text: cleanedWord,
      isNew,
      isBold,
      isStart: isNew && !prevIsNew,
      isEnd: isNew && !nextIsNew
    };
  });
}
  

function isNewItem<T>(current: T[] | undefined, suggested: T[] | undefined, item: T): boolean {
  if (!current) return true;
  return !current.includes(item);
}

// const renderBoldText = (text: string) => {
//   return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
//     if (part.startsWith('**') && part.endsWith('**')) {
//       return <strong key={index}>{part.slice(2, -2)}</strong>;
//     }
//     return part;
//   });
// };

export function Suggestion({ type, content, currentContent, onAccept, onReject, isReadOnly = false }: SuggestionProps) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  const handleAccept = () => {
    setStatus('accepted');
    onAccept();
  };

  const handleReject = () => {
    setStatus('rejected');
    onReject();
  };

  // Helper function to get status-based styles
  const getStatusStyles = () => {
    switch (status) {
      case 'accepted':
        return {
          card: "bg-slate-950/80 border-green-500/50 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]",
          icon: "bg-green-950/50",
          iconColor: "text-green-400",
          label: "text-green-300",
          text: "// ACCEPTED //"
        };
      case 'rejected':
        return {
          card: "bg-slate-950/80 border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
          icon: "bg-red-950/50",
          iconColor: "text-red-400",
          label: "text-red-300",
          text: "// REJECTED //"
        };
      default:
        return {
          card: "bg-slate-950/80 border-cyan-500/50 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]",
          icon: "bg-cyan-950/50",
          iconColor: "text-cyan-400",
          label: "text-cyan-300",
          text: "// AI MODIFICATION //"
        };
    }
  };

  const statusStyles = getStatusStyles();

  // Helper function to render content based on type
  const renderContent = () => {
    switch (type) {
      case 'work_experience':
        return <WorkExperienceSuggestion content={content as WorkExperience} currentContent={currentContent as WorkExperience | null} />;
      case 'project':
        return <ProjectSuggestion content={content as Project} currentContent={currentContent as Project | null} />;
      case 'skill':
        return <SkillSuggestion content={content as Skill} currentContent={currentContent as Skill | null} />;
      case 'education':
        return <EducationSuggestion content={content as Education} currentContent={currentContent as Education | null} />;
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden",
      "border",
      "rounded-none",
      statusStyles.card,
      "backdrop-blur-sm",
      "transition-all duration-300"
    )}>
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
      
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 opacity-50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 opacity-50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 opacity-50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 opacity-50" />

      {/* Content */}
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 border", statusStyles.icon, "border-" + statusStyles.iconColor.replace('text-', ''))}>
              <Sparkles className={cn("h-3.5 w-3.5", statusStyles.iconColor)} />
            </div>
            <span className={cn("font-mono font-bold text-sm uppercase tracking-wider", statusStyles.label)}>{statusStyles.text}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-black/50 backdrop-blur-sm p-4 border border-slate-700/50">
          {renderContent()}
        </div>

        {/* Action Buttons */}
        {status === 'pending' && !isReadOnly && (
          <div className="flex justify-end gap-3 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReject}
              className={cn(
                "relative group/button overflow-hidden",
                "h-9 px-4 text-xs rounded-none",
                "bg-red-950/50 backdrop-blur-sm",
                "text-red-300 font-mono uppercase tracking-wider",
                "border border-red-500/50",
                "hover:bg-red-900/50 hover:border-red-400",
                "hover:shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]",
                "transition-all duration-300"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />
              
              <div className="relative flex items-center justify-center gap-2">
                <X className="h-3.5 w-3.5" />
                <span className="font-bold">Reject</span>
              </div>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAccept}
              className={cn(
                "relative group/button overflow-hidden",
                "h-9 px-4 text-xs rounded-none",
                "bg-green-950/50 backdrop-blur-sm",
                "text-green-300 font-mono uppercase tracking-wider",
                "border border-green-500/50",
                "hover:bg-green-900/50 hover:border-green-400",
                "hover:shadow-[0_0_15px_-5px_rgba(34,197,94,0.5)]",
                "transition-all duration-300"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none" />
              
              <div className="relative flex items-center justify-center gap-2">
                <Check className="h-3.5 w-3.5" />
                <span className="font-bold">Accept</span>
              </div>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export function WholeResumeSuggestion({ onReject }: WholeResumeSuggestionProps) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  const handleAccept = () => {
    setStatus('accepted');
    // No need to do anything as changes are already applied
  };

  const handleReject = () => {
    setStatus('rejected');
    onReject();
  };

  const statusStyles = {
    pending: {
      card: "bg-slate-950/80 border-cyan-500/50 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]",
      icon: "bg-cyan-950/50 border-cyan-500/50",
      iconColor: "text-cyan-400",
      label: "text-cyan-300",
      text: "// FULL RESUME MODIFICATION //"
    },
    accepted: {
      card: "bg-slate-950/80 border-green-500/50 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]",
      icon: "bg-green-950/50 border-green-500/50",
      iconColor: "text-green-400",
      label: "text-green-300",
      text: "// CHANGES ACCEPTED //"
    },
    rejected: {
      card: "bg-slate-950/80 border-red-500/50 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
      icon: "bg-red-950/50 border-red-500/50",
      iconColor: "text-red-400",
      label: "text-red-300",
      text: "// CHANGES REJECTED //"
    }
  }[status];

  return (
    <Card className={cn(
      "group relative overflow-hidden p-4",
      "border rounded-none",
      statusStyles.card,
      "backdrop-blur-sm",
      "transition-all duration-300"
    )}>
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
      
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 opacity-50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 opacity-50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 opacity-50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 opacity-50" />

      <div className="relative flex items-center gap-2 mb-3">
        <div className={cn("p-1.5 border", statusStyles.icon)}>
          <Sparkles className={cn("h-3.5 w-3.5", statusStyles.iconColor)} />
        </div>
        <span className={cn("font-mono font-bold text-sm uppercase tracking-wider", statusStyles.label)}>
          {statusStyles.text}
        </span>
      </div>

      {status === 'pending' && (
        <div className="relative flex justify-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReject}
            className={cn(
              "relative group/button overflow-hidden",
              "h-9 px-4 text-xs rounded-none",
              "bg-red-950/50 backdrop-blur-sm",
              "text-red-300 font-mono uppercase tracking-wider",
              "border border-red-500/50",
              "hover:bg-red-900/50 hover:border-red-400",
              "hover:shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]",
              "transition-all duration-300"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />
            
            <div className="relative flex items-center justify-center gap-2">
              <X className="h-3.5 w-3.5" />
              <span className="font-bold">Undo</span>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAccept}
            className={cn(
              "relative group/button overflow-hidden",
              "h-9 px-4 text-xs rounded-none",
              "bg-green-950/50 backdrop-blur-sm",
              "text-green-300 font-mono uppercase tracking-wider",
              "border border-green-500/50",
              "hover:bg-green-900/50 hover:border-green-400",
              "hover:shadow-[0_0_15px_-5px_rgba(34,197,94,0.5)]",
              "transition-all duration-300"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none" />
            
            <div className="relative flex items-center justify-center gap-2">
              <Check className="h-3.5 w-3.5" />
              <span className="font-bold">Keep</span>
            </div>
          </Button>
        </div>
      )}
    </Card>
  );
}
