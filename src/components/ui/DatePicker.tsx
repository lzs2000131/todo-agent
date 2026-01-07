import { useState, useRef, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  label?: string
  value?: Date | string
  onChange: (date: Date) => void
  placeholder?: string
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = '选择日期',
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Parse value to Date if string, or keep as Date, or null
  const selectedDate = typeof value === 'string' ? (value ? new Date(value) : undefined) : value

  // State for the calendar view (current month shown)
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentMonth(selectedDate)
    }

    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const spaceBelow = windowHeight - rect.bottom
      const requiredSpace = 320 // Approx height of calendar
      
      if (spaceBelow < requiredSpace && rect.top > requiredSpace) {
        setPlacement('top')
      } else {
        setPlacement('bottom')
      }
    }
  }, [isOpen, selectedDate])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <span className="font-medium text-gray-700">
          {format(currentMonth, 'yyyy年 MMMM', { locale: zhCN })}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
    )
  }

  const renderDays = () => {
    const dateFormat = "EEEEE" // M, T, W, T, F, S, S
    const days = []
    let startDate = startOfWeek(currentMonth, { locale: zhCN })

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-xs font-medium text-gray-400 text-center py-1">
          {format(startDate, dateFormat, { locale: zhCN })}
        </div>
      )
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
    }

    return <div className="grid grid-cols-7 mb-1">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { locale: zhCN })
    const endDate = endOfWeek(monthEnd, { locale: zhCN })

    const dateFormat = "d"
    
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isDayToday = isToday(day)

          return (
            <button
              key={day.toString()}
              type="button"
              disabled={!isCurrentMonth}
              onClick={() => {
                onChange(day)
                setIsOpen(false)
              }}
              className={cn(
                "h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors relative",
                !isCurrentMonth ? "text-gray-300 cursor-default" : "hover:bg-primary/10 text-gray-700",
                isSelected && isCurrentMonth ? "bg-primary text-white hover:bg-primary" : "",
                isDayToday && !isSelected && isCurrentMonth ? "border border-primary text-primary" : ""
              )}
            >
              {format(day, dateFormat, { locale: zhCN })}
              {isDayToday && !isSelected && !isCurrentMonth && (
                 <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("w-full relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 border rounded-md bg-white text-left transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          isOpen ? "border-primary ring-2 ring-primary ring-opacity-50" : "border-gray-300",
          "hover:border-primary/50"
        )}
      >
        <span className={cn("truncate", !selectedDate && "text-text-secondary")}>
          {selectedDate ? format(selectedDate, 'yyyy年M月d日', { locale: zhCN }) : placeholder}
        </span>
        <CalendarIcon size={18} className="text-text-secondary" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: placement === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === 'bottom' ? -10 : 10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-xl w-[280px] left-0",
              placement === 'bottom' ? "mt-1 top-full" : "mb-1 bottom-full"
            )}
          >
             <div className="bg-white"> 
                {renderHeader()}
                <div className="pt-2">
                    {renderDays()}
                    {renderCells()}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}