import { useState } from 'react'
import { ListTodo, Calendar, Clock } from 'lucide-react'

type FilterType = 'all' | 'today' | 'upcoming'

interface TodoFiltersProps {
  onFilterChange?: (filter: FilterType) => void
}

export function TodoFilters({ onFilterChange }: TodoFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  const filters = [
    { id: 'all', label: '全部', icon: ListTodo },
    { id: 'today', label: '今天', icon: Calendar },
    { id: 'upcoming', label: '即将到期', icon: Clock },
  ] as const

  return (
    <div className="space-y-2">
      {filters.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => handleFilterClick(id)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
            activeFilter === id
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-gray-100'
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
