import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTodoStore } from '@/stores/todoStore'
import { useFilterStore, type FilterType } from '@/stores/filterStore'
import { TodoItem, TodoItemDragOverlay } from './TodoItem'

export function TodoList() {
  const { todos, loading, fetchTodos, reorderTodos } = useTodoStore()
  const { filter } = useFilterStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  // 根据筛选条件过滤 todos
  const filteredTodos = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    switch (filter) {
      case 'pending':
        return todos.filter((t) => !t.completed)
      case 'completed':
        return todos.filter((t) => t.completed)
      case 'today':
        return todos.filter((t) => {
          if (!t.dueDate) return false
          const dueDate = new Date(t.dueDate)
          return dueDate >= today && dueDate < tomorrow
        })
      case 'upcoming':
        return todos.filter((t) => {
          if (!t.dueDate) return false
          const dueDate = new Date(t.dueDate)
          return dueDate >= tomorrow
        })
      default:
        return todos
    }
  }, [todos, filter])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      const oldIndex = filteredTodos.findIndex((t) => t.id === active.id)
      const newIndex = filteredTodos.findIndex((t) => t.id === over.id)
      reorderTodos(oldIndex, newIndex)
    }
  }

  const activeTodo = activeId ? filteredTodos.find((t) => t.id === activeId) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary"
        >
          加载中...
        </motion.div>
      </div>
    )
  }

  if (filteredTodos.length === 0) {
    const emptyMessages: Record<FilterType, { title: string; subtitle: string }> = {
      all: { title: '还没有待办事项', subtitle: '点击上方添加你的第一个待办' },
      pending: { title: '没有待办事项', subtitle: '太棒了，所有待办都已完成！' },
      completed: { title: '还没有已完成的待办', subtitle: '完成一些待办后会显示在这里' },
      today: { title: '今天没有待办', subtitle: '享受美好的一天！' },
      upcoming: { title: '没有即将到期的待办', subtitle: '暂时没有即将到期的待办' },
    }

    const message = emptyMessages[filter]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-text-secondary"
      >
        <p className="text-lg">{message.title}</p>
        <p className="text-sm mt-2">{message.subtitle}</p>
      </motion.div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={filteredTodos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeTodo ? <TodoItemDragOverlay todo={activeTodo} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
