"use client";

import { useGoogleFonts } from "@/hooks/use-google-fonts";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Type } from "lucide-react";
import { useEffect, useState } from "react";

interface FontSelectorProps {
  currentFont: string;
  onFontChange: (font: string) => void;
}

export function FontSelector({ currentFont, onFontChange }: FontSelectorProps) {
  const { fontList, loadFontForPDF } = useGoogleFonts();
  const [open, setOpen] = useState(false);

  // Load the initial font when the component mounts
  useEffect(() => {
    if (currentFont && currentFont !== "Helvetica") {
      loadFontForPDF(currentFont);
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${currentFont.replace(
        / /g,
        "+"
      )}:ital,wght@0,400;0,700;1,400&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, [currentFont, loadFontForPDF]);

  const handleFontSelect = async (newFont: string) => {
    // 1. Add to HTML Head for Web Preview
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${newFont.replace(
      / /g,
      "+"
    )}:ital,wght@0,400;0,700;1,400&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // 2. Register for PDF (Async)
    await loadFontForPDF(newFont);

    // 3. Update State & Close Dropdown
    onFontChange(newFont);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-slate-800/50 border border-slate-700/50">
          <Type className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <Label className="text-xs font-medium text-slate-300">Typography</Label>
      </div>

      {fontList.length === 0 ? (
        <div className="h-9 px-3 rounded-lg border border-slate-800 bg-slate-900/50 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading Google Fonts...
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full h-9 justify-between font-normal",
                "bg-slate-900/50 border-slate-800 text-xs text-slate-200",
                "hover:bg-slate-900 hover:text-slate-100",
                "focus:ring-1 focus:ring-violet-500/20 focus:ring-offset-0"
              )}
            >
              <span className="truncate">
                {currentFont || "Select a font..."}
              </span>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-950 border-slate-800">
            <Command className="bg-slate-950 text-slate-200">
              <CommandInput
                placeholder="Search font..."
                className="h-9 text-xs"
              />
              <CommandList>
                <CommandEmpty className="py-2 text-xs text-center text-slate-500">
                  No font found.
                </CommandEmpty>
                <CommandGroup>
                  {/* Standard Option */}
                  <CommandItem
                    value="Helvetica"
                    onSelect={() => {
                      onFontChange("Helvetica");
                      setOpen(false);
                    }}
                    className="text-xs aria-selected:bg-slate-900 aria-selected:text-violet-400"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        currentFont === "Helvetica"
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    Helvetica (Standard)
                  </CommandItem>
                  <CommandItem
                    value="Times-Roman" // <--- PDF Engine expects "Times-Roman"
                    onSelect={() => {
                      onFontChange("Times-Roman");
                      setOpen(false);
                    }}
                    className="text-xs aria-selected:bg-slate-900 aria-selected:text-violet-400 cursor-pointer"
                    style={{ fontFamily: "Times New Roman, serif" }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        currentFont === "Times-Roman"
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    Times New Roman
                  </CommandItem>

                  <CommandItem
                    value="Courier"
                    onSelect={() => {
                      onFontChange("Courier");
                      setOpen(false);
                    }}
                    className="text-xs aria-selected:bg-slate-900 aria-selected:text-violet-400 cursor-pointer"
                    style={{ fontFamily: "Courier New, monospace" }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5",
                        currentFont === "Courier" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Courier
                  </CommandItem>

                  {/* Google Fonts */}
                  {fontList.map((font) => (
                    <CommandItem
                      key={font.family}
                      value={font.family}
                      onSelect={() => handleFontSelect(font.family)}
                      className="text-xs aria-selected:bg-slate-900 aria-selected:text-violet-400 cursor-pointer"
                      // Inline style for immediate visual feedback in the list
                      style={{ fontFamily: font.family }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5",
                          currentFont === font.family
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {font.family}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
