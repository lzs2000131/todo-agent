import { create } from 'zustand'

export type FilterType = 'all' | 'pending' | 'completed' | 'today' | 'upcoming'

interface FilterState {
  filter: FilterType
  setFilter: (filter: FilterType) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}))
