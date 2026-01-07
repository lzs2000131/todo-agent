import { useEffect } from 'react'
import { Folder } from 'lucide-react'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTodoStore } from '@/stores/todoStore'

export function CategoryList() {
  const { categories, fetchCategories } = useCategoryStore()
  const { todos } = useTodoStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const getCategoryCount = (categoryId: string) => {
    return todos.filter((todo) => todo.categoryId === categoryId && !todo.completed).length
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-secondary px-4">分类</h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <button
            key={category.id}
            className="w-full flex items-center justify-between px-4 py-2 rounded-md text-text-secondary hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span>{category.icon || <Folder size={16} />}</span>
              <span>{category.name}</span>
            </div>
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {getCategoryCount(category.id)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
