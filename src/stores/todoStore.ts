import { create } from 'zustand'
import type { Todo } from '@/types'
import { getDatabase } from '@/lib/db'
import { generateId, formatDate } from '@/lib/utils'

interface TodoState {
  todos: Todo[]
  deletedTodos: Todo[]
  loading: boolean
  fetchTodos: () => Promise<void>
  fetchDeletedTodos: () => Promise<void>
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'> & { screenshot?: string }) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  restoreTodo: (id: string) => Promise<void>
  permanentDeleteTodo: (id: string) => Promise<void>
  emptyTrash: () => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  reorderTodos: (startIndex: number, endIndex: number) => Promise<void>
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  deletedTodos: [],
  loading: false,

  fetchTodos: async () => {
    set({ loading: true })
    try {
      const db = await getDatabase()
      const rows = await db.select<any[]>('SELECT * FROM todos WHERE deleted_at IS NULL ORDER BY sort_order ASC, created_at DESC')

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
        screenshot: row.screenshot || undefined,
        attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
        sortOrder: row.sort_order || 0,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }))

      set({ todos, loading: false })
    } catch (error) {
      console.error('Failed to fetch todos:', error)
      set({ loading: false })
    }
  },

  fetchDeletedTodos: async () => {
    set({ loading: true })
    try {
      const db = await getDatabase()
      const rows = await db.select<any[]>('SELECT * FROM todos WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC')

      const deletedTodos: Todo[] = rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || undefined,
        completed: Boolean(row.completed),
        priority: row.priority as 'high' | 'medium' | 'low',
        categoryId: row.category_id || undefined,
        tags: row.tags ? JSON.parse(row.tags) : [],
        dueDate: row.due_date ? new Date(row.due_date) : undefined,
        reminder: row.reminder ? new Date(row.reminder) : undefined,
        screenshot: row.screenshot || undefined,
        attachments: row.attachments ? JSON.parse(row.attachments) : undefined,
        sortOrder: row.sort_order || 0,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        deletedAt: new Date(row.deleted_at),
      }))

      set({ deletedTodos, loading: false })
    } catch (error) {
      console.error('Failed to fetch deleted todos:', error)
      set({ loading: false })
    }
  },

  addTodo: async (todo) => {
    const db = await getDatabase()
    const id = generateId()
    const now = new Date()

    // 获取当前最大的 sortOrder
    const maxSortOrder = get().todos.reduce((max, t) => Math.max(max, t.sortOrder), -1)

    const newTodo: Todo = {
      ...todo,
      id,
      sortOrder: maxSortOrder + 1,
      createdAt: now,
      updatedAt: now,
    }

    await db.execute(
      `INSERT INTO todos (id, title, description, completed, priority, category_id, tags, due_date, reminder, screenshot, attachments, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        newTodo.screenshot || null,
        newTodo.attachments ? JSON.stringify(newTodo.attachments) : null,
        newTodo.sortOrder,
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

      if (key === 'tags' || key === 'attachments') {
        fields.push(`${dbKey} = ?`)
        values.push(value ? JSON.stringify(value) : null)
      } else if (key === 'dueDate' || key === 'reminder' || key === 'deletedAt') {
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
      deletedTodos: get().deletedTodos.map((todo) =>
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date(updatedAt) } : todo
      ),
    })
  },

  deleteTodo: async (id) => {
    const db = await getDatabase()
    const deletedAt = formatDate(new Date())

    await db.execute('UPDATE todos SET deleted_at = ? WHERE id = ?', [deletedAt, id])

    const deletedTodo = get().todos.find((t) => t.id === id)
    if (deletedTodo) {
      set({
        todos: get().todos.filter((todo) => todo.id !== id),
        deletedTodos: [{ ...deletedTodo, deletedAt: new Date(deletedAt) }, ...get().deletedTodos],
      })
    }
  },

  restoreTodo: async (id) => {
    const db = await getDatabase()

    await db.execute('UPDATE todos SET deleted_at = NULL WHERE id = ?', [id])

    const restoredTodo = get().deletedTodos.find((t) => t.id === id)
    if (restoredTodo) {
      const { deletedAt, ...todoWithoutDeleted } = restoredTodo
      set({
        deletedTodos: get().deletedTodos.filter((todo) => todo.id !== id),
        todos: [todoWithoutDeleted, ...get().todos],
      })
    }
  },

  permanentDeleteTodo: async (id) => {
    const db = await getDatabase()
    await db.execute('DELETE FROM todos WHERE id = ?', [id])

    set({
      deletedTodos: get().deletedTodos.filter((todo) => todo.id !== id),
    })
  },

  emptyTrash: async () => {
    const db = await getDatabase()
    await db.execute('DELETE FROM todos WHERE deleted_at IS NOT NULL')

    set({ deletedTodos: [] })
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id)
    if (todo) {
      await get().updateTodo(id, { completed: !todo.completed })
    }
  },

  reorderTodos: async (startIndex, endIndex) => {
    const todos = [...get().todos]
    const [removed] = todos.splice(startIndex, 1)
    todos.splice(endIndex, 0, removed)

    // 更新 sortOrder
    const updatedTodos = todos.map((todo, index) => ({
      ...todo,
      sortOrder: index,
    }))

    set({ todos: updatedTodos })

    // 批量更新数据库
    const db = await getDatabase()
    for (const todo of updatedTodos) {
      await db.execute('UPDATE todos SET sort_order = ? WHERE id = ?', [todo.sortOrder, todo.id])
    }
  },
}))
