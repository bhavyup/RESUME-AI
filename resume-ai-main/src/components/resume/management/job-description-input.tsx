import { cn } from "@/lib/utils";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  isInvalid: boolean;
}

export function JobDescriptionInput({ value, onChange, isInvalid }: JobDescriptionInputProps) {
  return (
    <div className="space-y-3">
      <textarea
        id="job-description"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full min-h-[120px] rounded-md bg-slate-800/50 border-2 border-slate-600 text-base text-white",
          "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 placeholder:text-slate-500",
          "resize-y p-4 shadow-sm",
          "hover:border-slate-500 transition-colors",
          isInvalid && "border-rose-500 shake"
        )}
        required
      />
    </div>
  );
} 