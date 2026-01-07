import { create } from 'zustand'
import type { Todo } from '@/types'
import { getDatabase } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'

interface TodoState {
  todos: Todo[]
  loading: boolean
  fetchTodos: () => Promise<void>
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,

  fetchTodos: async () => {
    set({ loading: true })
    try {
      const db = await getDatabase()
      const rows = await db.select<any[]>('SELECT * FROM todos ORDER BY created_at DESC')

      const todos: Todo[] = rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        completed: Boolean(row.completed),
        priority: row.priority as 'high' | 'medium' | 'low',
        categoryId: row.category_id || undefined,
        tags: row.tags ? JSON.parse(row.tags) : [],
        dueDate: row.due_date ? new Date(row.due_date) : undefined,
        reminder: row.reminder ? new Date(row.reminder) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }))

      set({ todos, loading: false })
    } catch (error) {
      console.error('Failed to fetch todos:', error)
      set({ loading: false })
    }
  },

  addTodo: async (todo) => {
    const db = await getDatabase()
    const id = generateId()
    const now = new Date()

    const newTodo: Todo = {
      ...todo,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await db.execute(
      `INSERT INTO todos (id, title, description, completed, priority, category_id, tags, due_date, reminder, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTodo.id,
        newTodo.title,
        newTodo.description || null,
        newTodo.completed ? 1 : 0,
        newTodo.priority,
        newTodo.categoryId || null,
        JSON.stringify(newTodo.tags),
        newTodo.dueDate ? formatDate(newTodo.dueDate) : null,
        newTodo.reminder ? formatDate(newTodo.reminder) : null,
        formatDate(newTodo.createdAt),
        formatDate(newTodo.updatedAt),
      ]
    )

    set({ todos: [newTodo, ...get().todos] })
  },

  updateTodo: async (id, updates) => {
    const db = await getDatabase()
    const updatedAt = formatDate(new Date())

    const fields: string[] = []
    const values: any[] = []

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'createdAt') return

      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()

      if (key === 'tags') {
        fields.push(`${dbKey} = ?`)
        values.push(JSON.stringify(value))
      } else if (key === 'dueDate' || key === 'reminder') {
        fields.push(`${dbKey} = ?`)
        values.push(value ? formatDate(value as Date) : null)
      } else if (key === 'completed') {
        fields.push(`${dbKey} = ?`)
        values.push(value ? 1 : 0)
      } else {
        fields.push(`${dbKey} = ?`)
        values.push(value)
      }
    })

    fields.push('updated_at = ?')
    values.push(updatedAt)
    values.push(id)

    await db.execute(
      `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    set({
      todos: get().todos.map((todo) =>
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date(updatedAt) } : todo
      ),
    })
  },

  deleteTodo: async (id) => {
    const db = await getDatabase()
    await db.execute('DELETE FROM todos WHERE id = ?', [id])
    set({ todos: get().todos.filter((todo) => todo.id !== id) })
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id)
    if (todo) {
      await get().updateTodo(id, { completed: !todo.completed })
    }
  },
}))
