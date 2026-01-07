import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTodoStore } from '@/stores/todoStore'
import { TodoItem } from './TodoItem'

export function TodoList() {
  const { todos, loading, fetchTodos } = useTodoStore()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

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

  if (todos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-text-secondary"
      >
        <p className="text-lg">还没有待办事项</p>
        <p className="text-sm mt-2">点击上方添加你的第一个待办</p>
      </motion.div>
    )
  }

  return (
    <motion.div layout className="space-y-3">
      <AnimatePresence>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
