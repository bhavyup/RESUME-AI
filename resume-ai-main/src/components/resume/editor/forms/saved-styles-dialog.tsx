import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentSettings } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Check, Save, Trash2, Plus, X, Clock, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SavedStylesDialogProps {
  currentSettings: DocumentSettings;
  onApplyStyle: (settings: DocumentSettings) => void;
}

interface SavedStyle {
  name: string;
  settings: DocumentSettings;
  timestamp: number;
}

export function SavedStylesDialog({ currentSettings, onApplyStyle }: SavedStylesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load saved styles
  useEffect(() => {
    const saved = localStorage.getItem("ResumeAI-saved-styles");
    if (saved) {
      try {
        setSavedStyles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved styles", e);
      }
    }
  }, []);

  const handleSaveStyle = () => {
    if (!newStyleName.trim()) return;

    const newStyle: SavedStyle = {
      name: newStyleName,
      settings: currentSettings,
      timestamp: Date.now(),
    };

    const updatedStyles = [newStyle, ...savedStyles]; // Add to top
    setSavedStyles(updatedStyles);
    localStorage.setItem("ResumeAI-saved-styles", JSON.stringify(updatedStyles));
    setNewStyleName("");
    setIsAddingNew(false);
  };

  const handleDeleteStyle = (timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedStyles = savedStyles.filter((style) => style.timestamp !== timestamp);
    setSavedStyles(updatedStyles);
    localStorage.setItem("ResumeAI-saved-styles", JSON.stringify(updatedStyles));
  };

  const handleApplyStyle = (settings: DocumentSettings) => {
    onApplyStyle(settings);
    setIsOpen(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start gap-2",
            "bg-slate-900/50 border-slate-800 text-slate-300",
            "hover:bg-teal-950/30 hover:text-teal-400 hover:border-teal-500/50",
            "transition-all duration-300"
          )}
        >
          <Save className="w-4 h-4" />
          <span>Saved Presets</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent hideCloseButton className="sm:max-w-[480px] bg-slate-950 border-slate-800 text-slate-100 shadow-2xl p-0 gap-0 overflow-hidden">
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-800/50 bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                <LayoutTemplate className="w-5 h-5 text-teal-400" />
              </div>
              <DialogTitle className="text-lg font-semibold">Style Presets</DialogTitle>
            </div>
            
            {!isAddingNew && (
              <Button
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="h-8 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Save Current
              </Button>
            )}
          </div>
          <DialogDescription className="text-slate-400 text-xs mt-1.5">
            Save your current font, spacing, and layout settings to reuse later.
          </DialogDescription>
        </DialogHeader>

        {/* Content Area */}
        <div className="p-6 bg-slate-950/50 min-h-[300px]">
          
          {/* Create New Input */}
          {isAddingNew && (
            <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-teal-500/30 shadow-lg shadow-teal-900/10 animate-in slide-in-from-top-2 duration-200">
              <Label className="text-xs font-medium text-teal-400 mb-2 block">
                Name your preset
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Modern Tech, Academic..."
                  value={newStyleName}
                  onChange={(e) => setNewStyleName(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-sm focus-visible:ring-teal-500/50 h-9"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveStyle()}
                />
                <Button
                  onClick={handleSaveStyle}
                  disabled={!newStyleName.trim()}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-500 text-white h-9"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddingNew(false)}
                  className="h-9 w-9 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* List */}
          <ScrollArea className="h-[280px] pr-4 -mr-4">
            <div className="space-y-3">
              {savedStyles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                  <Save className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No saved styles found</p>
                  <p className="text-xs opacity-60">Create one to get started</p>
                </div>
              ) : (
                savedStyles.map((style) => (
                  <div
                    key={style.timestamp}
                    onClick={() => handleApplyStyle(style.settings)}
                    className="group relative flex items-center justify-between p-3 rounded-xl border border-slate-800 
                      bg-slate-900/40 hover:bg-slate-800/60 hover:border-teal-500/30 
                      transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-200 group-hover:text-teal-400 transition-colors">
                        {style.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(style.timestamp)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>{style.settings.document_font_family}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => handleDeleteStyle(style.timestamp, e)}
                        title="Delete Preset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="h-4 w-[1px] bg-slate-700 mx-1" />
                      <Badge 
                        variant="secondary" 
                        className="bg-teal-500/10 text-teal-400 border-teal-500/20 pointer-events-none"
                      >
                        Apply
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t border-slate-800/50 bg-slate-950">
          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-200"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}