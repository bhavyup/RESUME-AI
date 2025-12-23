"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDownIcon, Calendar } from "lucide-react"
import { format, setMonth, setYear } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ViewMode = "calendar" | "months" | "years"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

interface DatePickerProProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  /** Enable calendar (day) view - default: true */
  showCalendar?: boolean
  /** Enable month picker view - default: true */
  showMonths?: boolean
  /** Enable year picker view - default: true */
  showYears?: boolean
  /** Format for displaying the selected date */
  displayFormat?: string
}

// Helper to check if a date is valid
const isValidDate = (date: Date | undefined): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

// Get days in a month grid (includes previous/next month days)
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()
  
  const days: { date: number; month: number; year: number; isCurrentMonth: boolean }[] = []
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonthLastDay - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false
    })
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: i, month, year, isCurrentMonth: true })
  }
  
  // Next month days (fill to 42 for consistent 6 rows)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false
    })
  }
  
  return days
}

export function DatePickerPro({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  showCalendar = true,
  showMonths = true,
  showYears = true,
  displayFormat,
}: DatePickerProProps) {
  // Determine the initial/default view based on enabled views
  const getDefaultView = (): ViewMode => {
    if (showCalendar) return "calendar"
    if (showMonths) return "months"
    if (showYears) return "years"
    return "calendar"
  }

  // Determine display format based on enabled views
  const getDisplayFormat = (): string => {
    if (displayFormat) return displayFormat
    if (showCalendar) return "MMM d, yyyy"
    if (showMonths) return "MMM yyyy"
    return "yyyy"
  }

  const [open, setOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>(getDefaultView())
  const [viewDate, setViewDate] = React.useState(() => {
    return isValidDate(value) ? value : new Date()
  })
  const [yearRangeStart, setYearRangeStart] = React.useState(() => {
    const year = isValidDate(value) ? value.getFullYear() : new Date().getFullYear()
    return Math.floor(year / 12) * 12
  })
  const [direction, setDirection] = React.useState(0) // -1 for prev, 1 for next

  const validValue = isValidDate(value) ? value : undefined

  // Reset view when opening
  React.useEffect(() => {
    if (open) {
      const defaultView = showCalendar ? "calendar" : showMonths ? "months" : "years"
      setViewMode(defaultView)
      if (validValue) {
        setViewDate(validValue)
        setYearRangeStart(Math.floor(validValue.getFullYear() / 12) * 12)
      }
    }
  }, [open, validValue, showCalendar, showMonths])

  const handlePrevious = () => {
    setDirection(-1)
    if (viewMode === "calendar") {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    } else if (viewMode === "months") {
      setViewDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))
    } else if (viewMode === "years") {
      setYearRangeStart(prev => prev - 12)
    }
  }

  const handleNext = () => {
    setDirection(1)
    if (viewMode === "calendar") {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    } else if (viewMode === "months") {
      setViewDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))
    } else if (viewMode === "years") {
      setYearRangeStart(prev => prev + 12)
    }
  }

  const handleHeaderClick = () => {
    setDirection(0)
    if (viewMode === "calendar" && showMonths) {
      setViewMode("months")
    } else if (viewMode === "calendar" && showYears) {
      setViewMode("years")
    } else if (viewMode === "months" && showYears) {
      setViewMode("years")
    }
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(viewDate, monthIndex)
    setViewDate(newDate)
    
    if (showCalendar) {
      setViewMode("calendar")
    } else {
      // If no calendar view, select this month
      onChange?.(new Date(newDate.getFullYear(), monthIndex, 1))
      setOpen(false)
    }
  }

  const handleYearSelect = (year: number) => {
    const newDate = setYear(viewDate, year)
    setViewDate(newDate)
    setYearRangeStart(Math.floor(year / 12) * 12)
    
    if (showMonths) {
      setViewMode("months")
    } else if (showCalendar) {
      setViewMode("calendar")
    } else {
      // If only years view, select this year
      onChange?.(new Date(year, 0, 1))
      setOpen(false)
    }
  }

  const handleDaySelect = (day: { date: number; month: number; year: number }) => {
    const newDate = new Date(day.year, day.month, day.date)
    onChange?.(newDate)
    setOpen(false)
  }

  const getHeaderText = () => {
    if (viewMode === "calendar") {
      return format(viewDate, "MMMM yyyy")
    } else if (viewMode === "months") {
      return viewDate.getFullYear().toString()
    } else {
      return `${yearRangeStart} - ${yearRangeStart + 11}`
    }
  }

  const canDrillUp = () => {
    if (viewMode === "calendar") return showMonths || showYears
    if (viewMode === "months") return showYears
    return false
  }

  const calendarDays = getCalendarDays(viewDate.getFullYear(), viewDate.getMonth())
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i)

  const slideVariants = {
    enter: (dir: number) => ({ x: dir === 0 ? 0 : dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir === 0 ? 0 : dir > 0 ? -50 : 50, opacity: 0 })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal group",
            "bg-slate-800/50 border-slate-700/50 rounded-xl h-11",
            "text-slate-200 text-sm",
            "hover:bg-slate-800/70 hover:border-slate-600 hover:shadow-lg hover:shadow-violet-500/5",
            "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
            "disabled:opacity-50",
            "transition-all duration-200",
            !validValue && "text-slate-500",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
            {validValue ? format(validValue, getDisplayFormat()) : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "p-0 overflow-hidden border-0",
          "bg-gradient-to-b from-slate-800/95 to-slate-900/95",
          "backdrop-blur-xl shadow-2xl shadow-black/40",
          "ring-1 ring-white/10",
          viewMode === "calendar" ? "w-[320px]" : "w-[280px]"
        )}
        align="start"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
          <button
            onClick={handleHeaderClick}
            disabled={!canDrillUp()}
            className={cn(
              "text-sm font-semibold transition-all duration-200",
              canDrillUp() 
                ? "text-violet-400 hover:text-violet-300 cursor-pointer" 
                : "text-slate-300 cursor-default"
            )}
          >
            {getHeaderText()}
          </button>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Calendar View */}
            {viewMode === "calendar" && showCalendar && (
              <motion.div
                key={`calendar-${viewDate.getMonth()}-${viewDate.getFullYear()}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-3"
              >
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-2">
                  {WEEKDAYS.map((day, i) => (
                    <div key={i} className="text-center text-[11px] font-medium text-slate-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Days grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day, i) => {
                    const isSelected = validValue && 
                      day.date === validValue.getDate() && 
                      day.month === validValue.getMonth() && 
                      day.year === validValue.getFullYear()
                    const isToday = 
                      day.date === new Date().getDate() && 
                      day.month === new Date().getMonth() && 
                      day.year === new Date().getFullYear()
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleDaySelect(day)}
                        className={cn(
                          "h-9 w-9 rounded-lg text-sm font-medium transition-all duration-150",
                          "flex items-center justify-center relative",
                          "hover:bg-white/10",
                          day.isCurrentMonth 
                            ? "text-slate-200" 
                            : "text-slate-600",
                          isSelected && "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-400 hover:to-purple-500",
                          isToday && !isSelected && "ring-1 ring-violet-500/50 text-violet-300"
                        )}
                      >
                        {day.date}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Months View */}
            {viewMode === "months" && showMonths && (
              <motion.div
                key={`months-${viewDate.getFullYear()}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-4"
              >
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month, i) => {
                    const isSelected = validValue && 
                      i === validValue.getMonth() && 
                      viewDate.getFullYear() === validValue.getFullYear()
                    const isCurrentMonth = 
                      i === new Date().getMonth() && 
                      viewDate.getFullYear() === new Date().getFullYear()
                    
                    return (
                      <button
                        key={month}
                        onClick={() => handleMonthSelect(i)}
                        className={cn(
                          "py-3 px-2 rounded-xl text-sm font-medium transition-all duration-150",
                          "hover:bg-white/10",
                          "text-slate-300",
                          isSelected && "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30",
                          isCurrentMonth && !isSelected && "ring-1 ring-violet-500/50 text-violet-300"
                        )}
                      >
                        {month}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Years View */}
            {viewMode === "years" && showYears && (
              <motion.div
                key={`years-${yearRangeStart}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-4"
              >
                <div className="grid grid-cols-3 gap-2">
                  {years.map((year) => {
                    const isSelected = validValue && year === validValue.getFullYear()
                    const isCurrentYear = year === new Date().getFullYear()
                    
                    return (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={cn(
                          "py-3 px-2 rounded-xl text-sm font-medium transition-all duration-150",
                          "hover:bg-white/10",
                          "text-slate-300",
                          isSelected && "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30",
                          isCurrentYear && !isSelected && "ring-1 ring-violet-500/50 text-violet-300"
                        )}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer indicator */}
        <div className="flex justify-center gap-1.5 pb-3 pt-1">
          {showCalendar && (
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-200",
              viewMode === "calendar" ? "bg-violet-500 w-4" : "bg-slate-600"
            )} />
          )}
          {showMonths && (
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-200",
              viewMode === "months" ? "bg-violet-500 w-4" : "bg-slate-600"
            )} />
          )}
          {showYears && (
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-200",
              viewMode === "years" ? "bg-violet-500 w-4" : "bg-slate-600"
            )} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Re-export with old name for backward compatibility
export { DatePickerPro as MonthYearPicker }
