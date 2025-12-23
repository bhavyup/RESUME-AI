import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DocumentSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  Settings,
  FileText,
  Type,
  Briefcase,
  FolderCode,
  GraduationCap,
  Layers,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SavedStylesDialog } from "./saved-styles-dialog";
import { LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { FontSelector } from "../../settings/font-selector";

interface DocumentSettingsFormProps {
  documentSettings: DocumentSettings;
  onChange: (field: "document_settings", value: DocumentSettings) => void;
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

function NumberInput({ value, onChange, min, max, step }: NumberInputProps) {
  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(Number(newValue.toFixed(2)));
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(Number(newValue.toFixed(2)));
  };

  const displayValue = Number(value.toFixed(2));

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-slate-400 w-8 font-mono">
        {displayValue}
      </span>
      <div className="flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 rounded",
            "hover:bg-violet-500/20",
            "text-slate-400 hover:text-violet-300",
            "transition-all duration-200"
          )}
          onClick={increment}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 rounded",
            "hover:bg-violet-500/20",
            "text-slate-400 hover:text-violet-300",
            "transition-all duration-200"
          )}
          onClick={decrement}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function DocumentSettingsForm({
  documentSettings,
  onChange,
}: DocumentSettingsFormProps) {
  const defaultSettings = {
    // Global Settings
    document_font_size: 10,
    document_line_height: 1.5,
    document_margin_vertical: 36,
    document_margin_horizontal: 36,

    // Header Settings
    header_name_size: 24,
    header_name_bottom_spacing: 24,

    // Skills Section
    skills_margin_top: 2,
    skills_margin_bottom: 2,
    skills_margin_horizontal: 0,
    skills_item_spacing: 2,

    // Experience Section
    experience_margin_top: 2,
    experience_margin_bottom: 2,
    experience_margin_horizontal: 0,
    experience_item_spacing: 4,

    // Projects Section
    projects_margin_top: 2,
    projects_margin_bottom: 2,
    projects_margin_horizontal: 0,
    projects_item_spacing: 4,

    // Education Section
    education_margin_top: 2,
    education_margin_bottom: 2,
    education_margin_horizontal: 0,
    education_item_spacing: 4,
  };

  // Initialize document_settings if it doesn't exist
  if (!documentSettings) {
    onChange("document_settings", defaultSettings);
    return null; // Return null while initializing to prevent errors
  }

  const handleSettingsChange = (newSettings: DocumentSettings) => {
    onChange("document_settings", newSettings);
  };

  const handleFontSizeChange = (value: number) => {
    const newSettings: DocumentSettings = {
      ...documentSettings, // Don't spread defaultSettings here
      document_font_size: value,
    };
    handleSettingsChange(newSettings);
  };

  const SectionSettings = ({
    title,
    section,
  }: {
    title: string;
    section: "skills" | "experience" | "projects" | "education";
  }) => (
    <div
      className={cn(
        "space-y-4 p-4 rounded-xl",
        "bg-slate-800/30 border border-slate-700/50"
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">
            Space Above {title} Section
          </Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_margin_top`] ?? 2}
              min={0}
              max={48}
              step={1}
              onChange={(value) =>
                handleSettingsChange({
                  ...documentSettings,
                  [`${section}_margin_top`]: value,
                })
              }
            />
            <span className="text-xs text-slate-500 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[Number(documentSettings?.[`${section}_margin_top`] ?? 2)]}
          min={0}
          max={48}
          step={1}
          className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
          onValueChange={([value]) =>
            handleSettingsChange({
              ...documentSettings,
              [`${section}_margin_top`]: value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">
            Space Below {title} Section
          </Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_margin_bottom`] ?? 2}
              min={0}
              max={48}
              step={1}
              onChange={(value) =>
                handleSettingsChange({
                  ...documentSettings,
                  [`${section}_margin_bottom`]: value,
                })
              }
            />
            <span className="text-xs text-slate-500 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[Number(documentSettings?.[`${section}_margin_bottom`] ?? 2)]}
          min={0}
          max={48}
          step={1}
          className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
          onValueChange={([value]) =>
            handleSettingsChange({
              ...documentSettings,
              [`${section}_margin_bottom`]: value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">
            Horizontal Margins
          </Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_margin_horizontal`] ?? 0}
              min={0}
              max={72}
              step={2}
              onChange={(value) =>
                handleSettingsChange({
                  ...documentSettings,
                  [`${section}_margin_horizontal`]: value,
                })
              }
            />
            <span className="text-xs text-slate-500 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[
            Number(documentSettings?.[`${section}_margin_horizontal`] ?? 0),
          ]}
          min={0}
          max={72}
          step={2}
          className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
          onValueChange={([value]) =>
            handleSettingsChange({
              ...documentSettings,
              [`${section}_margin_horizontal`]: value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">
            Space Between Items
          </Label>
          <div className="flex items-center">
            <NumberInput
              value={documentSettings?.[`${section}_item_spacing`] ?? 4}
              min={0}
              max={16}
              step={0.5}
              onChange={(value) =>
                handleSettingsChange({
                  ...documentSettings,
                  [`${section}_item_spacing`]: value,
                })
              }
            />
            <span className="text-xs text-slate-500 ml-1">pt</span>
          </div>
        </div>
        <Slider
          value={[Number(documentSettings?.[`${section}_item_spacing`] ?? 4)]}
          min={0}
          max={16}
          step={0.5}
          className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
          onValueChange={([value]) =>
            handleSettingsChange({
              ...documentSettings,
              [`${section}_item_spacing`]: value,
            })
          }
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Layout Presets Card */}
      <div
        className={cn(
          "relative",
          "bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/95",
          "backdrop-blur-xl",
          "border border-slate-700/50",
          "rounded-2xl",
          "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
          "overflow-hidden"
        )}
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        <div className="p-4 sm:p-5 space-y-4">
          {/* Saved Styles */}
          <div className="flex items-center gap-3">
            <SavedStylesDialog
              currentSettings={documentSettings || defaultSettings}
              onApplyStyle={(settings) => handleSettingsChange(settings)}
            />
          </div>

          {/* Layout Presets */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSettingsChange({ ...defaultSettings })}
              className={cn(
                "relative h-48 group p-0 overflow-hidden",
                "bg-slate-800/50 border-slate-700/50",
                "hover:border-teal-500/50",
                "transition-all duration-300"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full flex flex-col items-center">
                <div
                  className={cn(
                    "w-full p-2 text-xs font-medium",
                    "text-teal-400 border-b border-slate-700/50",
                    "bg-slate-800/80"
                  )}
                >
                  <LayoutTemplate className="w-3 h-3 inline-block mr-1" />
                  Default Layout
                </div>
                <div className="flex-1 w-full p-3 flex flex-col justify-between">
                  <div>
                    <div className="w-3/4 h-2 bg-slate-600 rounded mb-4" />
                    <div className="flex space-x-2 mb-3">
                      <div className="w-1/3 h-1 bg-slate-600 rounded" />
                      <div className="w-1/3 h-1 bg-slate-600 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="w-1/3 h-1.5 bg-slate-600 rounded" />
                      <div className="w-full h-1 bg-slate-700 rounded" />
                      <div className="w-11/12 h-1 bg-slate-700 rounded" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-1/3 h-1.5 bg-slate-600 rounded" />
                      <div className="w-full h-1 bg-slate-700 rounded" />
                      <div className="w-10/12 h-1 bg-slate-700 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleSettingsChange({
                  ...documentSettings,
                  footer_width: 0,
                  show_ubc_footer: false,
                  header_name_size: 24,
                  skills_margin_top: 0,
                  document_font_size: 10,
                  projects_margin_top: 0,
                  skills_item_spacing: 0,
                  document_line_height: 1.2,
                  education_margin_top: 0,
                  skills_margin_bottom: 2,
                  experience_margin_top: 2,
                  projects_item_spacing: 0,
                  education_item_spacing: 0,
                  projects_margin_bottom: 0,
                  education_margin_bottom: 0,
                  experience_item_spacing: 1,
                  document_margin_vertical: 20,
                  experience_margin_bottom: 0,
                  skills_margin_horizontal: 0,
                  document_margin_horizontal: 28,
                  header_name_bottom_spacing: 16,
                  projects_margin_horizontal: 0,
                  education_margin_horizontal: 0,
                  experience_margin_horizontal: 0,
                })
              }
              className={cn(
                "relative h-48 group p-0 overflow-hidden",
                "bg-slate-800/50 border-slate-700/50",
                "hover:border-pink-500/50",
                "transition-all duration-300"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full w-full flex flex-col items-center">
                <div
                  className={cn(
                    "w-full p-2 text-xs font-medium",
                    "text-pink-400 border-b border-slate-700/50",
                    "bg-slate-800/80"
                  )}
                >
                  <LayoutTemplate className="w-3 h-3 inline-block mr-1" />
                  Compact Layout
                </div>
                <div className="flex-1 w-full p-3 flex flex-col justify-start space-y-2">
                  <div>
                    <div className="w-2/3 h-2 bg-slate-600 rounded mb-2" />
                    <div className="flex space-x-1.5 mb-2">
                      <div className="w-1/4 h-1 bg-slate-600 rounded" />
                      <div className="w-1/4 h-1 bg-slate-600 rounded" />
                      <div className="w-1/4 h-1 bg-slate-600 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="w-1/4 h-1.5 bg-slate-600 rounded" />
                      <div className="w-full h-1 bg-slate-700 rounded" />
                      <div className="w-11/12 h-1 bg-slate-700 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-1/4 h-1.5 bg-slate-600 rounded" />
                      <div className="w-full h-1 bg-slate-700 rounded" />
                      <div className="w-9/12 h-1 bg-slate-700 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-1/4 h-1.5 bg-slate-600 rounded" />
                      <div className="w-full h-1 bg-slate-700 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div
        className={cn(
          "relative",
          "bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/95",
          "backdrop-blur-xl",
          "border border-slate-700/50",
          "rounded-2xl",
          "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
          "overflow-hidden"
        )}
      >
        <div className="p-4 sm:p-5 space-y-6">
          {/* Footer Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-violet-400" />
              <Label className="text-sm font-semibold text-violet-300">
                Footer Options
              </Label>
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
            </div>

            <div
              className={cn(
                "space-y-3 p-4 rounded-xl",
                "bg-slate-800/30 border border-slate-700/50"
              )}
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-300">
                  Show UBC Science Co-op Footer
                </Label>
                <Switch
                  checked={documentSettings?.show_ubc_footer ?? false}
                  onCheckedChange={(checked) =>
                    handleSettingsChange({
                      ...documentSettings,
                      show_ubc_footer: checked,
                    })
                  }
                  className="data-[state=checked]:bg-violet-500"
                />
              </div>
              <p className="text-xs text-slate-500">
                By enabling this footer, I confirm that I am a UBC Faculty of
                Science Co-op student.
              </p>

              {documentSettings?.show_ubc_footer && (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-300">
                      Footer Width
                    </Label>
                    <div className="flex items-center">
                      <NumberInput
                        value={documentSettings?.footer_width ?? 95}
                        min={50}
                        max={100}
                        step={1}
                        onChange={(value) =>
                          handleSettingsChange({
                            ...documentSettings,
                            footer_width: value,
                          })
                        }
                      />
                      <span className="text-xs text-slate-500 ml-1">%</span>
                    </div>
                  </div>
                  <Slider
                    value={[documentSettings?.footer_width ?? 95]}
                    min={50}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
                    onValueChange={([value]) =>
                      handleSettingsChange({
                        ...documentSettings,
                        footer_width: value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Document Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <Label className="text-sm font-semibold text-cyan-300">
                Document
              </Label>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
            </div>

            <div
              className={cn(
                "space-y-4 p-4 rounded-xl",
                "bg-slate-800/30 border border-slate-700/50"
              )}
            >
              <div className="space-y-2 pb-4 border-b border-slate-700/50">
                <FontSelector
                  currentFont={
                    documentSettings?.document_font_family || "Helvetica"
                  }
                  onFontChange={(newFont) =>
                    handleSettingsChange({
                      ...documentSettings,
                      document_font_family: newFont,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-300">
                    Font Size
                  </Label>
                  <div className="flex items-center">
                    <NumberInput
                      value={documentSettings?.document_font_size ?? 10}
                      min={8}
                      max={12}
                      step={0.5}
                      onChange={handleFontSizeChange}
                    />
                    <span className="text-xs text-slate-500 ml-1">pt</span>
                  </div>
                </div>
                <Slider
                  value={[documentSettings?.document_font_size ?? 10]}
                  min={8}
                  max={12}
                  step={0.5}
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-400"
                  onValueChange={([value]) =>
                    handleSettingsChange({
                      ...documentSettings,
                      document_font_size: value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-300">
                    Line Height
                  </Label>
                  <div className="flex items-center">
                    <NumberInput
                      value={documentSettings?.document_line_height ?? 1.5}
                      min={1}
                      max={2}
                      step={0.1}
                      onChange={(value) =>
                        handleSettingsChange({
                          ...documentSettings,
                          document_line_height: value,
                        })
                      }
                    />
                    <span className="text-xs text-slate-500 ml-1">x</span>
                  </div>
                </div>
                <Slider
                  value={[documentSettings?.document_line_height ?? 1.5]}
                  min={1}
                  max={2}
                  step={0.1}
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-400"
                  onValueChange={([value]) =>
                    handleSettingsChange({
                      ...documentSettings,
                      document_line_height: value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-300">
                    Vertical Margins
                  </Label>
                  <div className="flex items-center">
                    <NumberInput
                      value={documentSettings?.document_margin_vertical ?? 36}
                      min={18}
                      max={108}
                      step={2}
                      onChange={(value) =>
                        handleSettingsChange({
                          ...documentSettings,
                          document_margin_vertical: value,
                        })
                      }
                    />
                    <span className="text-xs text-slate-500 ml-1">pt</span>
                  </div>
                </div>
                <Slider
                  value={[documentSettings?.document_margin_vertical ?? 36]}
                  min={18}
                  max={108}
                  step={2}
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-400"
                  onValueChange={([value]) =>
                    handleSettingsChange({
                      ...documentSettings,
                      document_margin_vertical: value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-300">
                    Horizontal Margins
                  </Label>
                  <div className="flex items-center">
                    <NumberInput
                      value={documentSettings?.document_margin_horizontal ?? 36}
                      min={18}
                      max={108}
                      step={2}
                      onChange={(value) =>
                        handleSettingsChange({
                          ...documentSettings,
                          document_margin_horizontal: value,
                        })
                      }
                    />
                    <span className="text-xs text-slate-500 ml-1">pt</span>
                  </div>
                </div>
                <Slider
                  value={[documentSettings?.document_margin_horizontal ?? 36]}
                  min={18}
                  max={108}
                  step={2}
                  className="[&_[role=slider]]:bg-cyan-500 [&_[role=slider]]:border-cyan-400"
                  onValueChange={([value]) =>
                    handleSettingsChange({
                      ...documentSettings,
                      document_margin_horizontal: value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Header Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-teal-400" />
              <Label className="text-sm font-semibold text-teal-300">
                Header
              </Label>
              <div className="h-px flex-1 bg-gradient-to-r from-teal-500/30 to-transparent" />
            </div>

            <div
              className={cn(
                "space-y-4 p-4 rounded-xl",
                "bg-slate-800/30 border border-slate-700/50"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-300">
                    Name Size
                  </Label>
                  <div className="flex items-center">
                    <NumberInput
                      value={documentSettings?.header_name_size ?? 24}
                      min={0}
                      max={40}
                      step={1}
                      onChange={(value) =>
                        handleSettingsChange({
                          ...documentSettings,
                          header_name_size: value,
                        })
                      }
                    />
                    <span className="text-xs text-slate-500 ml-1">pt</span>
                  </div>
                </div>
                <Slider
                  value={[documentSettings?.header_name_size ?? 24]}
                  min={0}
                  max={40}
                  step={1}
                  className="[&_[role=slider]]:bg-teal-500 [&_[role=slider]]:border-teal-400"
                  onValueChange={([value]) =>
                    handleSettingsChange({
                      ...documentSettings,
                      header_name_size: value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-300">
                    Space Below Name
                  </Label>
                  <div className="flex items-center">
                    <NumberInput
                      value={documentSettings?.header_name_bottom_spacing ?? 24}
                      min={0}
                      max={50}
                      step={1}
                      onChange={(value) =>
                        handleSettingsChange({
                          ...documentSettings,
                          header_name_bottom_spacing: value,
                        })
                      }
                    />
                    <span className="text-xs text-slate-500 ml-1">pt</span>
                  </div>
                </div>
                <Slider
                  value={[documentSettings?.header_name_bottom_spacing ?? 24]}
                  min={0}
                  max={50}
                  step={1}
                  className="[&_[role=slider]]:bg-teal-500 [&_[role=slider]]:border-teal-400"
                  onValueChange={([value]) =>
                    handleSettingsChange({
                      ...documentSettings,
                      header_name_bottom_spacing: value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-rose-400" />
              <Label className="text-sm font-semibold text-rose-300">
                Skills
              </Label>
              <div className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
            </div>
            <SectionSettings title="Skills" section="skills" />
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-violet-400" />
              <Label className="text-sm font-semibold text-violet-300">
                Experience
              </Label>
              <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
            </div>
            <SectionSettings title="Experience" section="experience" />
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderCode className="h-4 w-4 text-cyan-400" />
              <Label className="text-sm font-semibold text-cyan-300">
                Projects
              </Label>
              <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
            </div>
            <SectionSettings title="Projects" section="projects" />
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              <Label className="text-sm font-semibold text-indigo-300">
                Education
              </Label>
              <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
            </div>
            <SectionSettings title="Education" section="education" />
          </div>
        </div>
      </div>
    </div>
  );
}
