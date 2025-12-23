'use client';

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NeoCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'inset' | 'gradient';
  glow?: 'none' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
  animate?: boolean;
}

const glowColors = {
  none: '',
  violet: 'hover:shadow-violet-500/20 hover:border-violet-500/40',
  cyan: 'hover:shadow-cyan-500/20 hover:border-cyan-500/40',
  emerald: 'hover:shadow-emerald-500/20 hover:border-emerald-500/40',
  amber: 'hover:shadow-amber-500/20 hover:border-amber-500/40',
  rose: 'hover:shadow-rose-500/20 hover:border-rose-500/40',
};

const glowBorders = {
  none: 'border-white/10',
  violet: 'border-violet-500/20',
  cyan: 'border-cyan-500/20',
  emerald: 'border-emerald-500/20',
  amber: 'border-amber-500/20',
  rose: 'border-rose-500/20',
};

export function NeoCard({ 
  children, 
  className, 
  variant = 'default',
  glow = 'none',
  animate = true
}: NeoCardProps) {
  const baseStyles = cn(
    "relative rounded-2xl border transition-all duration-500",
    glowBorders[glow],
    glowColors[glow],
  );

  const variantStyles = {
    default: "bg-slate-900/60 backdrop-blur-xl shadow-xl",
    elevated: "bg-slate-800/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl hover:-translate-y-0.5",
    inset: "bg-slate-950/50 backdrop-blur-sm shadow-inner",
    gradient: "bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl shadow-xl",
  };

  const content = (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Floating input with animated label
interface NeoInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  className?: string;
}

export function NeoInput({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
  icon,
  className
}: NeoInputProps) {
  return (
    <div className={cn("relative group", className)}>
      {/* Animated border glow */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-500/0 via-cyan-500/0 to-violet-500/0 opacity-0 group-focus-within:opacity-100 group-focus-within:from-violet-500/30 group-focus-within:via-cyan-500/30 group-focus-within:to-violet-500/30 blur transition-all duration-500" />
      
      <div className="relative">
        {/* Floating label */}
        <label className={cn(
          "absolute left-3 px-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 z-10",
          "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-padding",
          value ? "-top-2 text-violet-400" : "top-3 text-slate-500 group-focus-within:-top-2 group-focus-within:text-violet-400"
        )}>
          <span className="flex items-center gap-1.5">
            {icon}
            {label}
          </span>
        </label>
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={value ? placeholder : ''}
          className={cn(
            "w-full h-12 px-4 pt-1",
            "bg-slate-900/80 rounded-xl",
            "border border-white/10 focus:border-violet-500/50",
            "text-white text-sm placeholder:text-slate-600",
            "outline-none focus:ring-2 focus:ring-violet-500/20",
            "transition-all duration-300"
          )}
        />
      </div>
    </div>
  );
}

// Section header with line decoration
interface NeoSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  color?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

const headerColors = {
  violet: 'from-violet-500 to-fuchsia-500',
  cyan: 'from-cyan-500 to-blue-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
};

export function NeoSectionHeader({
  title,
  subtitle,
  icon,
  action,
  color = 'violet'
}: NeoSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "p-2.5 rounded-xl bg-gradient-to-br shadow-lg",
            headerColors[color],
          )}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-white font-bold text-lg tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// Bullet point item with actions
interface NeoBulletItemProps {
  content: string;
  onChange: (content: string) => void;
  onDelete: () => void;
  onImprove?: () => void;
  isImproving?: boolean;
  index: number;
}

export function NeoBulletItem({
  content,
  onChange,
  onDelete,
  onImprove,
  isImproving,
  index
}: NeoBulletItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <div className="flex gap-3">
        {/* Index badge */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center">
          <span className="text-[10px] font-bold text-violet-400">{index + 1}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 relative">
          <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent" />
          
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className={cn(
              "w-full pl-4 pr-20 py-2.5",
              "bg-slate-800/50 rounded-xl",
              "border border-white/5 focus:border-violet-500/30",
              "text-slate-200 text-sm leading-relaxed",
              "placeholder:text-slate-600",
              "outline-none focus:ring-1 focus:ring-violet-500/20",
              "resize-none transition-all duration-300"
            )}
            placeholder="Describe your achievement..."
          />
          
          {/* Action buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onImprove && (
              <button
                onClick={onImprove}
                disabled={isImproving}
                className="p-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 hover:text-violet-300 transition-colors"
              >
                {isImproving ? (
                  <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Add button with gradient
interface NeoAddButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function NeoAddButton({ onClick, children, variant = 'primary' }: NeoAddButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full py-3 px-4 rounded-xl font-semibold text-sm",
        "flex items-center justify-center gap-2",
        "transition-all duration-300",
        variant === 'primary' ? [
          "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600",
          "hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500",
          "text-white shadow-lg shadow-violet-500/25",
          "hover:shadow-xl hover:shadow-violet-500/30"
        ] : [
          "bg-slate-800/50 border-2 border-dashed border-white/10",
          "hover:border-violet-500/30 hover:bg-slate-800",
          "text-slate-400 hover:text-white"
        ]
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {children}
    </motion.button>
  );
}
