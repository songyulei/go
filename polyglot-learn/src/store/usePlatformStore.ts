import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { defaultUser } from '@/data/platformData'
import type { LanguageCode, UserProfile } from '@/types/platform'

interface PlatformState {
  selectedLanguage: LanguageCode
  user: UserProfile
  dailyCompletion: number
  setLanguage: (language: LanguageCode) => void
  updateUser: (user: UserProfile) => void
}

export const usePlatformStore = create<PlatformState>()(
  persist(
    (set) => ({
      selectedLanguage: defaultUser.targetLanguage,
      user: defaultUser,
      dailyCompletion: 68,
      setLanguage: (selectedLanguage) => set({ selectedLanguage }),
      updateUser: (user) => set({ user, selectedLanguage: user.targetLanguage }),
    }),
    {
      name: 'polyglot-learn-store',
    },
  ),
)
