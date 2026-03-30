import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  language: 'en' | 'es'
  toggleLanguage: () => void
  setLanguage: (lang: 'en' | 'es') => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      language: 'es', // Default to Spanish as requested
      toggleLanguage: () => set((state) => ({ 
        language: state.language === 'en' ? 'es' : 'en' 
      })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'fantasy-ui-storage',
    }
  )
)
