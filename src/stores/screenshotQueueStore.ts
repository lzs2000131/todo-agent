import { create } from 'zustand'
import type { ScreenshotQueueItem } from '@/types'
import { generateId } from '@/lib/utils'
import { extractTodosFromImage } from '@/services/openai'
import { useSettingsStore } from './settingsStore'
import { useCategoryStore } from './categoryStore'

interface ScreenshotQueueState {
  queue: ScreenshotQueueItem[]
  isQueueOpen: boolean
  addToQueue: (imageData: Uint8Array) => Promise<void>
  removeFromQueue: (id: string) => void
  clearQueue: () => void
  openQueue: () => void
  closeQueue: () => void
  updateQueueItem: (id: string, updates: Partial<ScreenshotQueueItem>) => void
}

export const useScreenshotQueueStore = create<ScreenshotQueueState>((set, get) => ({
  queue: [],
  isQueueOpen: false,

  addToQueue: async (imageData: Uint8Array) => {
    const id = generateId()
    const newItem: ScreenshotQueueItem = {
      id,
      imageData,
      extractedTodos: [],
      isExtracting: true,
      createdAt: new Date(),
    }

    set({ queue: [...get().queue, newItem], isQueueOpen: true })

    // 开始 AI 识别
    const {
      openaiApiKey,
      openaiBaseUrl,
      openaiModel,
      openaiCustomPrompt,
      openaiCustomHeaders,
      openaiCustomBody,
    } = useSettingsStore.getState()
    const { categories } = useCategoryStore.getState()
    const availableTags = categories.map((c) => c.name)

    if (!openaiApiKey) {
      set({
        queue: get().queue.map((item) =>
          item.id === id
            ? { ...item, isExtracting: false, error: '请先在设置中配置 OpenAI API Key' }
            : item
        ),
      })
      return
    }

    try {
      const todos = await extractTodosFromImage(imageData, {
        apiKey: openaiApiKey,
        baseURL: openaiBaseUrl,
        model: openaiModel,
        availableTags,
        customPrompt: openaiCustomPrompt,
        customHeaders: openaiCustomHeaders,
        customBody: openaiCustomBody,
      })
      set({
        queue: get().queue.map((item) =>
          item.id === id
            ? { ...item, isExtracting: false, extractedTodos: todos }
            : item
        ),
      })
    } catch (error) {
      set({
        queue: get().queue.map((item) =>
          item.id === id
            ? { ...item, isExtracting: false, error: error instanceof Error ? error.message : 'AI 识别失败' }
            : item
        ),
      })
    }
  },

  removeFromQueue: (id) => {
    set({ queue: get().queue.filter((item) => item.id !== id) })
  },

  clearQueue: () => {
    set({ queue: [], isQueueOpen: false })
  },

  openQueue: () => {
    set({ isQueueOpen: true })
  },

  closeQueue: () => {
    set({ isQueueOpen: false })
  },

  updateQueueItem: (id, updates) => {
    set({
      queue: get().queue.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })
  },
}))
