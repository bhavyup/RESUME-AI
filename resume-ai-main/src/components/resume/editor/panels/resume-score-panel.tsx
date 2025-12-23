"use client";

import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Target, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { generateResumeScore } from "@/utils/actions/resumes/actions";
import { Resume, Job as JobType } from "@/lib/types";
import { ApiKey } from "@/utils/ai-tools";

export interface ResumeScoreMetrics {
  overallScore: {
    score: number;
    reason: string;
  };
  
  completeness: {
    contactInformation: {
      score: number;
      reason: string;
    };
    detailLevel: {
      score: number;
      reason: string;
    };
  };
  
  impactScore: {
    activeVoiceUsage: {
      score: number;
      reason: string;
    };
    quantifiedAchievements: {
      score: number;
      reason: string;
    };
  };

  roleMatch: {
    skillsRelevance: {
      score: number;
      reason: string;
    };
    experienceAlignment: {
      score: number;
      reason: string;
    };
    educationFit: {
      score: number;
      reason: string;
    };
  };

  // Job-specific scoring for tailored resumes
  jobAlignment?: {
    keywordMatch: {
      score: number;
      reason: string;
      matchedKeywords?: string[];
      missingKeywords?: string[];
    };
    requirementsMatch: {
      score: number;
      reason: string;
      matchedRequirements?: string[];
      gapAnalysis?: string[];
    };
    companyFit: {
      score: number;
      reason: string;
      suggestions?: string[];
    };
  };

  miscellaneous: {
    [key: string]: {
      score: number;
      reason: string;
    };
  };

  overallImprovements: string[];
  jobSpecificImprovements?: string[];
  isTailoredResume?: boolean;
}

// Add props interface
interface ResumeScorePanelProps {
  resume: Resume;
  job?: JobType | null;
}

const LOCAL_STORAGE_KEY = 'ResumeAI-resume-scores';
const MAX_SCORES = 10;

// Helper function to convert camelCase to readable labels
function camelCaseToReadable(text: string): string {
  return text
    // Insert space before uppercase letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase());
}

function getStoredScores(resumeId: string): ResumeScoreMetrics | null {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    
    const scores = new Map(JSON.parse(stored));
    return scores.get(resumeId) as ResumeScoreMetrics | null;
  } catch (error) {
    console.error('Error reading stored scores:', error);
    return null;
  }
}

function updateStoredScores(resumeId: string, score: ResumeScoreMetrics) {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const scores = stored ? new Map(JSON.parse(stored)) : new Map();

    // Maintain only MAX_SCORES entries
    if (scores.size >= MAX_SCORES) {
      const oldestKey = scores.keys().next().value;
      scores.delete(oldestKey);
    }

    scores.set(resumeId, score);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(scores)));
  } catch (error) {
    console.error('Error storing score:', error);
  }
}

export default function ResumeScorePanel({ resume, job }: ResumeScorePanelProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [scoreData, setScoreData] = useState<ResumeScoreMetrics | null>(() => {
    // Initialize with stored score if available
    return getStoredScores(resume.id);
  });

  // Add useEffect for initial load
  useEffect(() => {
    const storedScore = getStoredScores(resume.id);
    if (storedScore) {
      setScoreData(storedScore);
    }
  }, [resume.id]);

  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
        const MODEL_STORAGE_KEY = 'resumeai-default-model';
        // const LOCAL_STORAGE_KEY = 'ResumeAI-api-keys';
  
        const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
        // const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
        const apiKeys: string[] = [];
        
      // Convert job type to match the expected schema
      const jobForScoring = job ? {
        ...job,
        employment_type: job.employment_type || undefined
      } : null;

      // Call the generateResumeScore action with current resume
      const newScore = await generateResumeScore({
        ...resume,
        section_configs: undefined,
        section_order: undefined
      }, jobForScoring, {
        model: selectedModel || '',
        apiKeys: apiKeys as unknown as ApiKey[]
      });

      // Update state and storage
      setScoreData(newScore as ResumeScoreMetrics);
      updateStoredScores(resume.id, newScore as ResumeScoreMetrics);
    } catch (error) {
      console.error("Error generating score:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // If no score data is available, show the empty state
  if (!scoreData) {
    return (
      <div className="space-y-4">
        <Card className="bg-black/50 border-2 border-cyan-500/50 rounded-none relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/50" />
          
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
          
          <CardContent className="flex flex-col items-center gap-6 py-12 text-center relative">
            <div className="p-3 bg-cyan-950/50 border border-cyan-500/50">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-cyan-100 uppercase tracking-wider mb-3">Resume Analysis System</h3>
              <p className="text-sm text-cyan-400/70 mb-6 font-mono">
                {"// INITIATE COMPREHENSIVE EVALUATION PROTOCOL //"}
              </p>
              <Button
                onClick={handleRecalculate}
                disabled={isCalculating}
                className="w-full sm:w-auto bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 rounded-none font-mono uppercase tracking-wider"
              >
                <RefreshCw 
                  className={cn(
                    "mr-2 h-4 w-4",
                    isCalculating && "animate-spin"
                  )} 
                />
                {isCalculating ? "Processing..." : "Execute Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // When we have score data, show the full analysis
  return (
    <div className="space-y-6">
      {/* Header with recalculate button */}
      <div className="flex justify-between items-center p-4 bg-black/30 border border-cyan-500/30 relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
        <h3 className="text-base font-mono font-bold text-cyan-100 uppercase tracking-wider">Analysis Results</h3>
        <Button
          onClick={handleRecalculate}
          disabled={isCalculating}
          variant="outline"
          size="sm"
          className="rounded-none border-cyan-500/50 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 hover:text-cyan-100 font-mono uppercase text-xs"
        >
          <RefreshCw 
            className={cn(
              "mr-2 h-3 w-3",
              isCalculating && "animate-spin"
            )} 
          />
          Recalc
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card className="bg-cyan-950/20 border-2 border-cyan-500/50 rounded-none relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50" />
        
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 flex-shrink-0">
              <CircularProgressbar
                value={scoreData.overallScore.score}
                text={`${scoreData.overallScore.score}%`}
                styles={buildStyles({
                  pathColor: scoreData.overallScore.score >= 70 ? '#06b6d4' : scoreData.overallScore.score >= 50 ? '#f59e0b' : '#ef4444',
                  textColor: '#06b6d4',
                  trailColor: '#1e293b',
                  pathTransitionDuration: 1,
                  textSize: '20px'
                })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-mono font-bold text-cyan-100 uppercase tracking-wider mb-2">Overall Score</h4>
              <p className="text-sm text-cyan-400/80 font-mono">{scoreData.overallScore.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Improvements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Key Improvements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {scoreData.overallImprovements.slice(0, 5).map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 text-sm"
              >
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-muted-foreground">{improvement}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job-Specific Improvements for Tailored Resumes */}
      {scoreData.isTailoredResume && scoreData.jobSpecificImprovements && scoreData.jobSpecificImprovements.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Award className="h-4 w-4" />
              Job-Specific Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {scoreData.jobSpecificImprovements.slice(0, 5).map((improvement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <p className="text-blue-700">{improvement}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Alignment Section for Tailored Resumes */}
      {scoreData.isTailoredResume && scoreData.jobAlignment && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Target className="h-4 w-4" />
              Job Alignment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {Object.entries(scoreData.jobAlignment).map(([label, data]) => (
                <JobAlignmentItem key={label} label={label} data={data} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {Object.entries({
        Completeness: { icon: Award, metrics: scoreData.completeness },
        "Impact Score": { icon: TrendingUp, metrics: scoreData.impactScore },
        "Role Match": { icon: Target, metrics: scoreData.roleMatch }
      }).map(([title, { icon: Icon, metrics }]) => (
        <Card key={title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {Object.entries(metrics).map(([label, data]) => (
                <ScoreItem key={label} label={label} {...data} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ScoreItem({ label, score, reason }: { label: string; score: number; reason: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{camelCaseToReadable(label)}</span>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          score >= 70 ? "bg-green-100 text-green-700" : 
          score >= 50 ? "bg-yellow-100 text-yellow-700" : 
          "bg-red-100 text-red-700"
        )}>
          {score}/100
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", getScoreColor(score))}
        />
      </div>
      <p className="text-xs text-muted-foreground">{reason}</p>
    </motion.div>
  );
}

function JobAlignmentItem({ 
  label, 
  data 
}: { 
  label: string; 
  data: {
    score: number;
    reason: string;
    matchedKeywords?: string[];
    missingKeywords?: string[];
    matchedRequirements?: string[];
    gapAnalysis?: string[];
    suggestions?: string[];
  };
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-700">{camelCaseToReadable(label)}</span>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          data.score >= 70 ? "bg-blue-100 text-blue-700" : 
          data.score >= 50 ? "bg-yellow-100 text-yellow-700" : 
          "bg-red-100 text-red-700"
        )}>
          {data.score}/100
        </span>
      </div>
      <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", getScoreColor(data.score))}
        />
      </div>
      <p className="text-xs text-blue-600">{data.reason}</p>
      
      {/* Show matched keywords */}
      {data.matchedKeywords && data.matchedKeywords.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-600">Matched Keywords:</p>
          <div className="flex flex-wrap gap-1">
            {data.matchedKeywords.slice(0, 5).map((keyword, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Show missing keywords */}
      {data.missingKeywords && data.missingKeywords.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-red-600">Missing Keywords:</p>
          <div className="flex flex-wrap gap-1">
            {data.missingKeywords.slice(0, 5).map((keyword, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Show gap analysis */}
      {data.gapAnalysis && data.gapAnalysis.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-orange-600">Areas to Address:</p>
          <div className="space-y-1">
            {data.gapAnalysis.slice(0, 3).map((gap, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="mt-1.5 h-1 w-1 rounded-full bg-orange-500 flex-shrink-0" />
                <p className="text-orange-600">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}