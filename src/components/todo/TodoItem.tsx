import { useState } from 'react'
import { Trash2, Edit2, Calendar, GripVertical, Image, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo } from '@/types'
import { useTodoStore } from '@/stores/todoStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Modal } from '@/components/ui'
import { TodoForm } from './TodoForm'
import { CategoryIcon } from '../category/CategoryIcon'

interface TodoItemProps {
  todo: Todo
}

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

// 拖拽时显示的预览组件
export function TodoItemDragOverlay({ todo }: TodoItemProps) {
  const { categories } = useCategoryStore()
  const category = categories.find((c) => c.id === todo.categoryId)

  return (
    <div className="bg-bg-card rounded-lg p-4 shadow-xl ring-2 ring-primary cursor-grabbing">
      <div className="flex items-start gap-3">
        <div className="mt-1 p-1">
          <GripVertical size={16} className="text-primary" />
        </div>
        <div
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            todo.completed ? 'bg-success border-success' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {todo.completed && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-text-primary ${
              todo.completed ? 'line-through text-text-secondary' : ''
            }`}
          >
            {todo.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {todo.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                <Calendar size={12} />
                {format(todo.dueDate, 'M月d日', { locale: zhCN })}
              </span>
            )}
            {category && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
                style={{ backgroundColor: category.color }}
              >
                <CategoryIcon name={category.icon} size={12} />
                {category.name}
              </span>
            )}
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs text-white ${
                priorityColors[todo.priority]
              }`}
            >
              {priorityLabels[todo.priority]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { toggleTodo, deleteTodo } = useTodoStore()
  const { categories } = useCategoryStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const category = categories.find((c) => c.id === todo.categoryId)

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="拖拽排序"
          >
            <GripVertical size={16} className="text-gray-400 dark:text-gray-600" />
          </button>

          {/* Checkbox */}
          <button
            onClick={() => toggleTodo(todo.id)}
            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              todo.completed
                ? 'bg-success border-success'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary'
            }`}
          >
            {todo.completed && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-text-primary ${
                todo.completed ? 'line-through text-text-secondary' : ''
              }`}
            >
              {todo.title}
            </h3>

            {todo.description && (
              <p className="text-sm text-text-secondary mt-1">
                {todo.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {todo.dueDate && (
                <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                  <Calendar size={12} />
                  {format(todo.dueDate, 'M月d日', { locale: zhCN })}
                </span>
              )}

              {category && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <CategoryIcon name={category.icon} size={12} />
                  {category.name}
                </span>
              )}

              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs text-white ${
                  priorityColors[todo.priority]
                }`}
              >
                {priorityLabels[todo.priority]}
              </span>

              {/* 附件指示 */}
              {(todo.screenshot || (todo.attachments && todo.attachments.length > 0)) && (
                <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                  {(todo.screenshot || todo.attachments?.some(a => a.type === 'image')) && (
                    <>
                      <Image size={12} />
                      {(todo.attachments?.filter(a => a.type === 'image').length || 0) + (todo.screenshot ? 1 : 0)}
                    </>
                  )}
                  {todo.attachments?.some(a => a.type === 'file') && (
                    <>
                      <FileText size={12} className="ml-1" />
                      {todo.attachments.filter(a => a.type === 'file').length}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="编辑"
            >
              <Edit2 size={16} className="text-text-secondary" />
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
              title="删除"
            >
              <Trash2 size={16} className="text-danger" />
            </button>
          </div>
        </div>
      </div>

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
