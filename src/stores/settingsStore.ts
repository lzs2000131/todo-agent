import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'

interface SettingsState extends Settings {
  updateSettings: (updates: Partial<Settings>) => void
  clearApiKeys: () => void
}

const defaultSettings: Settings = {
  screenshotShortcut: 'CmdOrCtrl+Shift+E',
  theme: 'system',
  syncEnabled: false,
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o-mini',
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({ ...state, ...updates }))
      },

      clearApiKeys: () => {
        set({
          openaiApiKey: undefined,
          s3Config: undefined,
        })
      },
    }),
    {
      name: 'todo-agent-settings',
    }
  )
)
