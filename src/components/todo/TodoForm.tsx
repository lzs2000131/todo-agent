import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Todo } from '@/types'
import { useTodoStore } from '@/stores/todoStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Input, Button, Modal, Select, DatePicker } from '@/components/ui'
import { CategoryIcon } from '../category/CategoryIcon'

interface TodoFormProps {
  todo?: Todo
  onClose?: () => void
}

export function TodoForm({ todo, onClose }: TodoFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(todo?.title || '')
  const [description, setDescription] = useState(todo?.description || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(todo?.priority || 'medium')
  const [categoryId, setCategoryId] = useState(todo?.categoryId || '')
  const [dueDate, setDueDate] = useState<Date | undefined>(todo?.dueDate)

  const { addTodo, updateTodo } = useTodoStore()
  const { categories } = useCategoryStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const todoData = {
      title,
      description: description || undefined,
      completed: todo?.completed || false,
      priority,
      categoryId: categoryId || undefined,
      tags: [],
      dueDate: dueDate,
    }

    if (todo) {
      await updateTodo(todo.id, todoData)
      onClose?.()
    } else {
      await addTodo(todoData)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setCategoryId('')
      setDueDate(undefined)
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
  ]

  const categoryOptions = [
    { value: '', label: '无分类' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      icon: <CategoryIcon name={cat.icon} size={16} style={{ color: cat.color }} />
    }))
  ]

  const renderFormContent = () => (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入待办事项..."
        required
        autoFocus={!todo}
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加描述..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="优先级"
          value={priority}
          onChange={(val) => setPriority(val as any)}
          options={priorityOptions}
        />

        <Select
          label="分类"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
        />
      </div>

      <DatePicker
        label="截止日期"
        value={dueDate}
        onChange={setDueDate}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={handleClose}>
          取消
        </Button>
        <Button type="submit">
          {todo ? '更新' : '添加待办'}
        </Button>
      </div>
    </motion.form>
  )

  if (todo) {
    return renderFormContent()
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-bg-card rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors text-text-secondary hover:text-primary"
      >
        <Plus size={20} />
        <span>添加新待办...</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="添加待办"
          >
            {renderFormContent()}
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
