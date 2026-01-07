import { useState } from 'react'
import { Trash2, Edit2, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Todo } from '@/types'
import { useTodoStore } from '@/stores/todoStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Modal } from '@/components/ui'
import { TodoForm } from './TodoForm'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { toggleTodo, deleteTodo } = useTodoStore()
  const { categories } = useCategoryStore()

  const category = categories.find((c) => c.id === todo.categoryId)

  const priorityColors = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-success',
  }

  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低',
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="bg-bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleTodo(todo.id)}
            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              todo.completed
                ? 'bg-success border-success'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <AnimatePresence>
              {todo.completed && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-3 h-3 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.h3
              layout
              className={`font-medium text-text-primary ${
                todo.completed ? 'line-through text-text-secondary' : ''
              }`}
            >
              {todo.title}
            </motion.h3>

            {todo.description && (
              <motion.p layout className="text-sm text-text-secondary mt-1">
                {todo.description}
              </motion.p>
            )}

            <motion.div layout className="flex items-center gap-2 mt-2 flex-wrap">
              {todo.dueDate && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 text-xs text-text-secondary"
                >
                  <Calendar size={12} />
                  {format(todo.dueDate, 'M月d日', { locale: zhCN })}
                </motion.span>
              )}

              {category && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon} {category.name}
                </motion.span>
              )}

              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex px-2 py-0.5 rounded-full text-xs text-white ${
                  priorityColors[todo.priority]
                }`}
              >
                {priorityLabels[todo.priority]}
              </motion.span>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="编辑"
            >
              <Edit2 size={16} className="text-text-secondary" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => deleteTodo(todo.id)}
              className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
              title="删除"
            >
              <Trash2 size={16} className="text-danger" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="编辑待办"
      >
        <TodoForm todo={todo} onClose={() => setIsEditOpen(false)} />
      </Modal>
    </>
  )
}
