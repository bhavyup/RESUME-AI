"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

// Helper to check if a date is valid
const isValidDate = (date: Date | undefined): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const validValue = isValidDate(value) ? value : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            "bg-slate-800/50 border-slate-700 rounded-xl h-11",
            "text-slate-200 text-sm",
            "hover:bg-slate-800/70 hover:border-slate-600",
            "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
            "disabled:opacity-50",
            !validValue && "text-slate-500",
            className
          )}
        >
          {validValue ? format(validValue, "MMM d, yyyy") : <span>{placeholder}</span>}
          <ChevronDownIcon className="h-4 w-4 text-slate-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0 bg-slate-800 border-slate-700" align="start">
        <Calendar
          mode="single"
          selected={validValue}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
