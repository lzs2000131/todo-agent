import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Todo } from '@/types'
import { useTodoStore } from '@/stores/todoStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Input, Button, Modal } from '@/components/ui'

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
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? todo.dueDate.toISOString().split('T')[0] : ''
  )

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
      dueDate: dueDate ? new Date(dueDate) : undefined,
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
      setDueDate('')
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  if (todo) {
    return (
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
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              优先级
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              分类
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">无分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="截止日期"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            取消
          </Button>
          <Button type="submit">
            {todo ? '更新' : '添加'}
          </Button>
        </div>
      </motion.form>
    )
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
            title={todo ? '编辑待办' : '添加待办'}
          >
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
                autoFocus
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
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    优先级
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    分类
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">无分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="截止日期"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  取消
                </Button>
                <Button type="submit">
                  添加待办
                </Button>
              </div>
            </motion.form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}
