import { ListTodo, Calendar, Clock, Circle, CheckCircle2 } from 'lucide-react'
import { useFilterStore } from '@/stores/filterStore'
import type { FilterType } from '@/stores/filterStore'

export { type FilterType }

interface TodoFiltersProps {
  onFilterChange?: (filter: FilterType) => void
}

export function TodoFilters({ onFilterChange }: TodoFiltersProps) {
  const { filter, setFilter } = useFilterStore()

  const handleFilterClick = (filter: FilterType) => {
    setFilter(filter)
    onFilterChange?.(filter)
  }

  const filters = [
    { id: 'all' as const, label: '全部', icon: ListTodo },
    { id: 'pending' as const, label: '待办', icon: Circle },
    { id: 'completed' as const, label: '已办', icon: CheckCircle2 },
    { id: 'today' as const, label: '今天', icon: Calendar },
    { id: 'upcoming' as const, label: '即将到期', icon: Clock },
  ]

  return (
    <div className="space-y-2">
      {filters.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => handleFilterClick(id)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
            filter === id
              ? 'bg-primary text-white'
              : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
