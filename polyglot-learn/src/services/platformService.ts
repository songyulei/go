import {
  achievements,
  communityPosts,
  courseLevels,
  dashboardMetrics,
  defaultUser,
  languages,
  practiceModules,
  progressTrend,
  recommendation,
  skills,
} from '@/data/platformData'
import type { LanguageCode, PlatformSnapshot, UserProfile } from '@/types/platform'

const wait = async () => new Promise((resolve) => window.setTimeout(resolve, 120))

export async function getPlatformSnapshot(language: LanguageCode): Promise<PlatformSnapshot> {
  await wait()

  return {
    user: {
      ...defaultUser,
      targetLanguage: language,
    },
    languages,
    courseLevels: courseLevels.filter((item) => item.language === language),
    practiceModules,
    dashboardMetrics,
    progressTrend,
    skills,
    recommendation,
    achievements,
    posts: communityPosts.filter((item) => item.language === language || item.language === 'en'),
  }
}

export async function saveOnboarding(payload: Partial<UserProfile>): Promise<UserProfile> {
  await wait()

  return {
    ...defaultUser,
    ...payload,
    targetLanguage: payload.targetLanguage ?? defaultUser.targetLanguage,
    currentLevel: payload.currentLevel ?? defaultUser.currentLevel,
    dailyGoalMinutes: payload.dailyGoalMinutes ?? defaultUser.dailyGoalMinutes,
    learningGoal: payload.learningGoal ?? defaultUser.learningGoal,
  }
}
