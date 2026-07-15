export type LanguageCode = 'en' | 'ja' | 'ko'

export interface LanguageMeta {
  code: LanguageCode
  name: string
  nativeName: string
  accent: string
  glow: string
  description: string
  levelLabel: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  targetLanguage: LanguageCode
  currentLevel: string
  dailyGoalMinutes: number
  learningGoal: string
  streakDays: number
  xp: number
}

export interface CourseLevel {
  id: string
  language: LanguageCode
  levelCode: string
  title: string
  description: string
  progress: number
  unlocked: boolean
  lessonCount: number
  focus: string[]
}

export interface PracticeModule {
  id: 'vocabulary' | 'grammar' | 'speaking' | 'listening'
  title: string
  description: string
  accuracy: number
  completedToday: boolean
  recommendedReason: string
  duration: string
}

export interface DashboardMetric {
  label: string
  value: string
  delta: string
}

export interface ProgressPoint {
  day: string
  studyMinutes: number
  accuracy: number
}

export interface SkillPoint {
  skill: string
  score: number
}

export interface RecommendationTask {
  id: string
  title: string
  type: 'course' | 'practice' | 'review' | 'community'
  durationMinutes: number
}

export interface RecommendationPlan {
  focus: string
  weakPoints: string[]
  tasks: RecommendationTask[]
  coachTip: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  progressLabel: string
}

export interface CommunityPost {
  id: string
  author: string
  role: string
  language: LanguageCode
  content: string
  likes: number
  comments: number
  badge?: string
}

export interface PlatformSnapshot {
  user: UserProfile
  languages: LanguageMeta[]
  courseLevels: CourseLevel[]
  practiceModules: PracticeModule[]
  dashboardMetrics: DashboardMetric[]
  progressTrend: ProgressPoint[]
  skills: SkillPoint[]
  recommendation: RecommendationPlan
  achievements: Achievement[]
  posts: CommunityPost[]
}
