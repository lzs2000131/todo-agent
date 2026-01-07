import { create } from 'zustand'
import type { Category } from '@/types'
import { getDatabase } from '@/lib/db'
import { generateId } from '@/lib/utils'

interface CategoryState {
  categories: Category[]
  loading: boolean
  fetchCategories: () => Promise<void>
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true })
    try {
      const db = await getDatabase()
      const rows = await db.select<any[]>('SELECT * FROM categories')

      const categories: Category[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        icon: row.icon || undefined,
      }))

      set({ categories, loading: false })
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      set({ loading: false })
    }
  },

  addCategory: async (category) => {
    const db = await getDatabase()
    const id = generateId()

    const newCategory: Category = { ...category, id }

    await db.execute(
      'INSERT INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)',
      [newCategory.id, newCategory.name, newCategory.color, newCategory.icon || null]
    )

    set({ categories: [...get().categories, newCategory] })
  },

  updateCategory: async (id, updates) => {
    const db = await getDatabase()

    const fields: string[] = []
    const values: any[] = []

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id') return
      fields.push(`${key} = ?`)
      values.push(value)
    })

    values.push(id)

    await db.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    set({
      categories: get().categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    })
  },

  deleteCategory: async (id) => {
    const db = await getDatabase()
    await db.execute('DELETE FROM categories WHERE id = ?', [id])
    set({ categories: get().categories.filter((cat) => cat.id !== id) })
  },
}))
