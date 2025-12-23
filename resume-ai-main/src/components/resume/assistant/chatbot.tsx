"use client";

import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useChat } from "ai/react";
import { Card } from "@/components/ui/card";
import { Bot, Trash2, Pencil, ChevronDown, RefreshCw } from "lucide-react";
import {
  Education,
  Project,
  Resume,
  Skill,
  WorkExperience,
  Job,
} from "@/lib/types";
import { Message } from "ai";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import { MemoizedMarkdown } from "@/components/ui/memoized-markdown";
import { Suggestion } from "./suggestions";
import { SuggestionSkeleton } from "./suggestion-skeleton";
import ChatInput from "./chat-input";
import { LoadingDots } from "@/components/ui/loading-dots";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { WholeResumeSuggestion } from "./suggestions";
import { QuickSuggestions } from "./quick-suggestions";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
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
import { ApiKeyErrorAlert } from "@/components/ui/api-key-error-alert";
import { Textarea } from "@/components/ui/textarea";
import { getDefaultModel, type ApiKey } from "@/lib/ai-models";

const LOCAL_STORAGE_KEY = "ResumeAI-api-keys";
const MODEL_STORAGE_KEY = "resumeai-default-model";

interface ChatBotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[typeof field]) => void;
  job?: Job | null;
  onHeightChange?: (height: number) => void;
}

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <button
        className={cn(
          "absolute z-50 p-2",
          "bg-slate-900/90 hover:bg-cyan-950/90",
          "border border-cyan-500/50 hover:border-cyan-400",
          "shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]",
          "transition-all duration-300",
          "left-[50%] translate-x-[-50%] bottom-4"
        )}
        onClick={() => scrollToBottom()}
      >
        <ChevronDown className="h-4 w-4 text-cyan-400" />
      </button>
    )
  );
}

export default function ChatBot({ resume, onResumeChange, job }: ChatBotProps) {
  const router = useRouter();
  const [accordionValue, setAccordionValue] = React.useState<string>("");
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [defaultModel, setDefaultModel] = React.useState<string>(
    getDefaultModel(false)
  );
  const [originalResume, setOriginalResume] = React.useState<Resume | null>(
    null
  );
  const [isInitialLoading, setIsInitialLoading] = React.useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Load settings from local storage
  useEffect(() => {
    const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);

    if (storedKeys) {
      try {
        setApiKeys(JSON.parse(storedKeys));
      } catch (error) {
        console.error("Error loading API keys:", error);
      }
    }

    if (storedModel) {
      setDefaultModel(storedModel);
    }

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MODEL_STORAGE_KEY && e.newValue) {
        setDefaultModel(e.newValue);
      } else if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          setApiKeys(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing API keys:", error);
        }
      }
    };

    // Listen for custom event from same tab (dispatched by settings)
    const handleLocalStorageUpdate = () => {
      const updatedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      if (updatedModel) {
        setDefaultModel(updatedModel);
      }
      const updatedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (updatedKeys) {
        try {
          setApiKeys(JSON.parse(updatedKeys));
        } catch (error) {
          console.error("Error parsing API keys:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdate", handleLocalStorageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageUpdate",
        handleLocalStorageUpdate
      );
    };
  }, []);

  const config = {
    model: defaultModel,
    apiKeys,
  };

  const {
    messages,
    error,
    append,
    isLoading,
    addToolResult,
    stop,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      target_role: resume.target_role,
      resume: resume,
      config,
      job: job,
    },
    maxSteps: 5,
    onResponse() {
      setIsInitialLoading(false);
    },
    onError() {
      setIsInitialLoading(false);
    },
    async onToolCall({ toolCall }) {
      // 1. Handle "getResume" (Auto-Executed)
      if (toolCall.toolName === "getResume") {
        const params = toolCall.args as { sections: string[] };

        const personalInfo = {
          first_name: resume.first_name,
          last_name: resume.last_name,
          email: resume.email,
          phone_number: resume.phone_number,
          location: resume.location,
          website: resume.website,
          linkedin_url: resume.linkedin_url,
          github_url: resume.github_url,
        };

        const sectionMap = {
          personal_info: personalInfo,
          work_experience: resume.work_experience,
          education: resume.education,
          skills: resume.skills,
          projects: resume.projects,
        };

        const result = params.sections.includes("all")
          ? { ...sectionMap, target_role: resume.target_role }
          : params.sections.reduce(
              (acc, section) => ({
                ...acc,
                [section]: sectionMap[section as keyof typeof sectionMap],
              }),
              {}
            );

        addToolResult({ toolCallId: toolCall.toolCallId, result });
        return result;
      }

      // 2. Handle "modifyWholeResume" (Auto-Executed)
      if (toolCall.toolName === "modifyWholeResume") {
        const updates = toolCall.args as {
          basic_info?: Partial<{
            first_name: string;
            last_name: string;
            email: string;
            phone_number: string;
            location: string;
            website: string;
            linkedin_url: string;
            github_url: string;
          }>;
          work_experience?: WorkExperience[];
          education?: Education[];
          skills?: Skill[];
          projects?: Project[];
        };

        setOriginalResume({ ...resume });

        if (updates.basic_info) {
          Object.entries(updates.basic_info).forEach(([key, value]) => {
            if (value !== undefined) {
              onResumeChange(key as keyof Resume, value);
            }
          });
        }

        const sections = {
          work_experience: updates.work_experience,
          education: updates.education,
          skills: updates.skills,
          projects: updates.projects,
        };

        Object.entries(sections).forEach(([key, value]) => {
          if (value !== undefined) {
            onResumeChange(key as keyof Resume, value);
          }
        });

        const result = { success: true };
        addToolResult({ toolCallId: toolCall.toolCallId, result });
        return result;
      }

      // 3. IMPORTANT: Suggestion Tools (MANUAL EXECUTION)
      // We do NOT return anything here. This keeps the tool in 'call' state.
      // The user must click "Accept" or "Reject" in the UI to call addToolResult().
      if (toolCall.toolName.startsWith("suggest_")) {
        // Do nothing. Wait for UI interaction.
        return;
      }
    },
    onFinish() {
      setIsInitialLoading(false);
    },
  });

  const isWaitingForUserAction = useMemo(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return false;

    // Check if there are tool invocations that don't have a result yet
    // and aren't purely server-side tools like "getResume" (which resolve automatically)
    return (
      lastMessage.toolInvocations?.some(
        (tool) =>
          tool.state !== "result" && tool.toolName.startsWith("suggest_") // Only block for suggestion tools
      ) ?? false
    );
  }, [messages]);

  // Memoize the submit handler
  const handleSubmit = useCallback(
    (message: string) => {
      setIsInitialLoading(true);
      append({
        content: message.replace(/\s+$/, ""), // Extra safety: trim trailing whitespace
        role: "user",
      });

      setAccordionValue("chat");
    },
    [append]
  );

  // Add delete handler
  const handleDelete = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  // Add edit handler
  const handleEdit = (id: string, content: string) => {
    setEditingMessageId(id);
    setEditContent(content);
  };

  // Add save handler
  const handleSaveEdit = (id: string) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, content: editContent } : message
      )
    );
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setOriginalResume(null);
    setEditingMessageId(null);
    setEditContent("");
  }, [setMessages]);

  return (
    <Card
      ref={containerRef}
      className={cn(
        "flex flex-col w-full mx-auto h-full",
        "bg-transparent",
        "border-none",
        "shadow-none",
        "overflow-hidden",
        "relative"
      )}
    >
      <Accordion
        type="single"
        collapsible
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="flex flex-col h-full min-h-0 overflow-hidden"
      >
        <AccordionItem
          value="chat"
          className="border-none flex flex-col h-full min-h-0 overflow-hidden"
        >
          {/* Accordion Trigger - Fixed at top */}
          <div className="sticky top-0 z-20 flex-1 bg-slate-900/95">
            <AccordionTrigger
              className={cn(
                "px-4 py-3",
                "hover:no-underline",
                "group",
                "transition-all duration-300",
                "data-[state=open]:border-b border-cyan-500/30",
                "data-[state=closed]:bg-transparent",
                "bg-transparent"
              )}
            >
              <div
                className={cn(
                  "flex items-center w-full",
                  "transition-transform duration-300",
                  "group-hover:translate-x-1"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5",
                      "bg-cyan-950/50 text-cyan-400",
                      "group-hover:bg-cyan-900/50",
                      "transition-colors duration-300",
                      "border border-cyan-500/50"
                    )}
                  >
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-mono font-bold text-cyan-100 uppercase tracking-wider">
                      ResumeAI Terminal
                    </span>
                    <span className="text-[10px] text-cyan-500/70 font-mono">
                      SYSTEM ONLINE //{" "}
                      {defaultModel.toUpperCase().replace(/[^A-Z0-9.]/g, "-")}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  className={cn(
                    "absolute right-12 top-1/2 -translate-y-1/2",
                    "px-3 py-1 rounded-lg",
                    "bg-slate-800/50 text-slate-400 border border-slate-700/50",
                    "hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30",
                    "transition-all duration-300",
                    "focus:outline-none",
                    "disabled:opacity-50",
                    "flex items-center gap-2",
                    (accordionValue !== "chat" || isAlertOpen) && "hidden"
                  )}
                  disabled={messages.length === 0}
                  aria-label="Clear chat history"
                  variant="ghost"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span className="text-xs font-medium">Clear</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                className={cn(
                  "bg-black/95 border-2 border-red-500/50 rounded-none",
                  "shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)]"
                )}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-300 font-mono uppercase tracking-wider">
                    {"// CLEAR PROTOCOL //"}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-red-400/70 font-mono text-sm">
                    This will purge all messages and reset the system. Operation
                    cannot be reversed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className={cn(
                      "bg-slate-900/50 text-slate-300 border border-slate-700 rounded-none",
                      "hover:bg-slate-800 hover:text-white font-mono uppercase text-xs tracking-wider"
                    )}
                  >
                    Abort
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearChat}
                    className={cn(
                      "bg-red-950/50 text-red-300 border border-red-500/50 rounded-none",
                      "hover:bg-red-900/50 hover:text-red-100 hover:border-red-400",
                      "font-mono uppercase text-xs tracking-wider"
                    )}
                  >
                    Execute
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Accordion Content - Scrollable middle section */}
          <AccordionContent className="flex-1 h-[60vh]  overflow-y-auto flex flex-col">
            <StickToBottom
              className="flex-1 h-full overflow-y-auto px-4 relative custom-scrollbar"
              resize="smooth"
              initial="smooth"
            >
              <StickToBottom.Content className="flex flex-col custom-scrollbar">
                {messages.length === 0 ? (
                  <QuickSuggestions onSuggestionClick={handleSubmit} />
                ) : (
                  <>
                    {/* Messages */}
                    {messages.map((m: Message, index) => (
                      <React.Fragment key={index}>
                        {/* Regular Message Content */}
                        {m.content && (
                          <div className="my-2">
                            <div
                              className={`mb-4 flex ${
                                m.role === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={cn(
                                  "px-4 py-3 max-w-[90%] text-sm relative group items-center",
                                  m.role === "user"
                                    ? [
                                        "bg-cyan-950/50 border border-cyan-500/50",
                                        "text-cyan-100",
                                        "shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]",
                                        "ml-auto",
                                      ]
                                    : [
                                        "bg-slate-900/80",
                                        "border border-slate-700/50",
                                        "text-slate-200",
                                        "shadow-sm",
                                        "backdrop-blur-sm",
                                      ]
                                )}
                              >
                                {/* Edit Message */}
                                {editingMessageId === m.id ? (
                                  <div className="flex flex-col gap-2">
                                    <Textarea
                                      value={editContent}
                                      onChange={(e) =>
                                        setEditContent(e.target.value)
                                      }
                                      className={cn(
                                        "w-full min-h-[80px] p-3 rounded-none font-mono",
                                        "bg-black/50 backdrop-blur-sm",
                                        "text-cyan-100 placeholder-slate-600",
                                        "border border-cyan-500/50 focus:border-cyan-400",
                                        "focus:outline-none focus:ring-1 focus:ring-cyan-500/30",
                                        "::webkit-scrollbar { display: none; }"
                                      )}
                                      style={{
                                        maxHeight: "30vh", // Cap at 30% of viewport height (reduced from 50vh)
                                        scrollbarWidth: "none", // Firefox
                                        msOverflowStyle: "none", // IE/Edge
                                      }}
                                    />
                                    <button
                                      onClick={() => handleSaveEdit(m.id)}
                                      className={cn(
                                        "self-end px-4 py-2 rounded-none text-xs",
                                        "bg-cyan-950/50 text-cyan-300 border border-cyan-500/50",
                                        "hover:bg-cyan-900/50 hover:text-cyan-100",
                                        "transition-colors duration-200 font-mono uppercase tracking-wider"
                                      )}
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <MemoizedMarkdown
                                    id={m.id}
                                    content={m.content}
                                  />
                                )}

                                {/* Message Actions */}
                                <div className="absolute -bottom-4 left-0 flex gap-2">
                                  <button
                                    onClick={() => handleDelete(m.id)}
                                    className={cn(
                                      "transition-colors duration-200",
                                      m.role === "user"
                                        ? "text-cyan-500/60 hover:text-cyan-400"
                                        : "text-slate-600 hover:text-slate-400"
                                    )}
                                    aria-label="Delete message"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(m.id, m.content)}
                                    className={cn(
                                      "transition-colors duration-200",
                                      m.role === "user"
                                        ? "text-cyan-500/60 hover:text-cyan-400"
                                        : "text-slate-600 hover:text-slate-400"
                                    )}
                                    aria-label="Edit message"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tool Invocations as Separate Bubbles */}
                        {m.toolInvocations?.map(
                          (toolInvocation: ToolInvocation) => {
                            const { toolName, toolCallId, state, args } =
                              toolInvocation;

                            // Define toolConfig here so it is available for both CALL and RESULT states
                            const toolConfig = {
                              suggest_work_experience_improvement: {
                                type: "work_experience",
                                field: "work_experience",
                                content: "improved_experience",
                              },
                              suggest_project_improvement: {
                                type: "project",
                                field: "projects",
                                content: "improved_project",
                              },
                              suggest_skill_improvement: {
                                type: "skill",
                                field: "skills",
                                content: "improved_skill",
                              },
                              suggest_education_improvement: {
                                type: "education",
                                field: "education",
                                content: "improved_education",
                              },
                            } as const;

                            // ---------------------------------------------------------
                            // 1. HANDLE RESULT STATE (Action Completed)
                            // ---------------------------------------------------------
                            if (state === "result") {
                              if (toolName === "getResume") return null;
                              if (toolName === "modifyWholeResume") return null;

                              // Handle Suggestions in Result State (Keep visible but read-only)
                              if (toolName.startsWith("suggest_")) {
                                const result = (toolInvocation as any).result;
                                const action = result?.action; // 'accepted' | 'rejected'
                                const config =
                                  toolConfig[
                                    toolName as keyof typeof toolConfig
                                  ];

                                if (!config) return null;

                                return (
                                  <div
                                    key={toolCallId}
                                    className={cn(
                                      "mt-2 w-[90%] border-l-2 pl-4 py-2 transition-all duration-300 rounded-r-lg",
                                      action === "accepted"
                                        ? "border-emerald-500 bg-emerald-950/20"
                                        : "border-red-500 bg-red-950/20 opacity-70 grayscale-[0.5]"
                                    )}
                                  >
                                    {/* Render content in "Read Only" mode using pointer-events-none to block clicks */}
                                    <div className="pointer-events-none">
                                      <Suggestion
                                        type={config.type as any}
                                        content={args[config.content]}
                                        // Try to find the item to show 'diff' context (best effort)
                                        currentContent={
                                          resume[config.field] &&
                                          typeof args.index === "number"
                                            ? (resume[config.field] as any[])[
                                                args.index
                                              ]
                                            : undefined
                                        }
                                        isReadOnly={true}
                                        // Empty handlers since it's done
                                        onAccept={() => {}}
                                        onReject={() => {}}
                                      />
                                    </div>

                                    {/* Status Label */}
                                    <div
                                      className={cn(
                                        "text-[10px] font-mono mt-2 uppercase tracking-wider flex items-center gap-2 border-t pt-2 border-dashed",
                                        action === "accepted"
                                          ? "text-emerald-400 border-emerald-500/30"
                                          : "text-red-400 border-red-500/30"
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          action === "accepted"
                                            ? "bg-emerald-500"
                                            : "bg-red-500"
                                        )}
                                      />
                                      {action === "accepted"
                                        ? "SUGGESTION APPLIED"
                                        : "SUGGESTION REJECTED"}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }

                            // ---------------------------------------------------------
                            // 2. HANDLE CALL STATE (Action Pending)
                            // ---------------------------------------------------------
                            if (state === "call") {
                              if (toolName === "getResume") {
                                return (
                                  <div
                                    key={toolCallId}
                                    className="mt-2 w-[90%]"
                                  >
                                    <div className="flex justify-start">
                                      <div
                                        className={cn(
                                          "px-4 py-2 max-w-[90%] text-sm font-mono",
                                          "bg-slate-900/80 border border-emerald-500/30",
                                          "text-emerald-300",
                                          "shadow-sm backdrop-blur-sm"
                                        )}
                                      >
                                        <p>{`// RESUME DATA LOADED (${
                                          args.sections?.join(", ") || "all"
                                        }) ✓ //`}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              if (toolName === "modifyWholeResume") {
                                return (
                                  <div
                                    key={toolCallId}
                                    className="mt-2 w-[90%]"
                                  >
                                    <div
                                      className={cn(
                                        "w-full px-4 py-2 font-mono",
                                        "bg-slate-900/80 border border-cyan-500/30",
                                        "text-cyan-300",
                                        "shadow-sm backdrop-blur-sm"
                                      )}
                                    >
                                      {"// PREPARING MODIFICATIONS //"}
                                    </div>
                                  </div>
                                );
                              }

                              // Suggestions (Active Buttons)
                              if (toolName.startsWith("suggest_")) {
                                const config =
                                  toolConfig[
                                    toolName as keyof typeof toolConfig
                                  ];
                                if (!config) return null;

                                return (
                                  <div
                                    key={toolCallId}
                                    className="mt-2 w-[90%]"
                                  >
                                    <Suggestion
                                      type={config.type as any}
                                      content={args[config.content]}
                                      currentContent={
                                        resume[config.field] &&
                                        typeof args.index === "number"
                                          ? (resume[config.field] as any[])[
                                              args.index
                                            ]
                                          : undefined
                                      }
                                      onAccept={() => {
                                        const currentList =
                                          (resume[config.field] as any[]) || [];
                                        const newItem = args[config.content];
                                        const targetIndex = args.index;

                                        let newList;
                                        if (
                                          typeof targetIndex === "number" &&
                                          targetIndex >= 0 &&
                                          targetIndex < currentList.length
                                        ) {
                                          newList = currentList.map((item, i) =>
                                            i === targetIndex ? newItem : item
                                          );
                                        } else {
                                          newList = [...currentList, newItem];
                                        }
                                        onResumeChange(
                                          config.field as any,
                                          newList
                                        );

                                        // Persist result (switches to result state)
                                        addToolResult({
                                          toolCallId,
                                          result: { action: "accepted" },
                                        });
                                      }}
                                      onReject={() => {
                                        // Persist result (switches to result state)
                                        addToolResult({
                                          toolCallId,
                                          result: { action: "rejected" },
                                        });
                                      }}
                                    />
                                  </div>
                                );
                              }
                            }

                            // ---------------------------------------------------------
                            // 3. HANDLE PARTIAL STATE (Streaming)
                            // ---------------------------------------------------------
                            if (state === "partial-call") {
                              if (toolName.startsWith("suggest_")) {
                                return <SuggestionSkeleton key={toolCallId} />;
                              }
                            }

                            return null;
                          }
                        )}

                        {/* Loading Dots Message - Modified condition */}
                        {((isInitialLoading &&
                          index === messages.length - 1 &&
                          m.role === "user") ||
                          (isLoading &&
                            index === messages.length - 1 &&
                            m.role === "assistant")) && (
                          <div className="mt-2">
                            <div className="flex justify-start">
                              <div
                                className={cn(
                                  "px-4 py-2.5 min-w-[60px]",
                                  "bg-slate-900/80",
                                  "border border-cyan-500/30",
                                  "shadow-sm",
                                  "backdrop-blur-sm"
                                )}
                              >
                                <LoadingDots className="text-cyan-400" />
                              </div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                )}

                {error &&
                  messages.length > 0 &&
                  (error.message === "Rate limit exceeded. Try again later." ? (
                    <div
                      className={cn(
                        "p-4 text-sm font-mono relative",
                        "bg-red-950/30 border border-red-500/50",
                        "text-red-300"
                      )}
                    >
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500/50" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red-500/50" />
                      <p className="uppercase tracking-wider">
                        {"// RATE LIMIT EXCEEDED //"}
                      </p>
                      <p className="font-bold mt-2 text-red-100">
                        RETRY AFTER:{" "}
                        {new Date(
                          Date.now() + 5 * 60 * 60 * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <ApiKeyErrorAlert error={error} router={router} />
                  ))}
              </StickToBottom.Content>

              <ScrollToBottom />
            </StickToBottom>
          </AccordionContent>

          {/* Input Bar - Fixed at bottom, expands upward */}
          <div className="relative flex-1 z-10">
            <ChatInput
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onStop={stop}
              disabled={isWaitingForUserAction}
            />
          </div>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
