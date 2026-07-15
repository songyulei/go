import {
  type Achievement,
  type CommunityPost,
  type CourseLevel,
  type DashboardMetric,
  type LanguageMeta,
  type PracticeModule,
  type ProgressPoint,
  type RecommendationPlan,
  type SkillPoint,
  type UserProfile,
} from '@/types/platform'

export const languages: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: '英语',
    accent: 'from-coral-400/80 to-amber-300/80',
    glow: 'shadow-[0_0_80px_rgba(251,113,133,0.25)]',
    description: '聚焦沟通、职场和考试场景，适合建立国际表达能力。',
    levelLabel: 'CEFR A1-C1',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日语',
    accent: 'from-rose-300/80 to-fuchsia-300/80',
    glow: 'shadow-[0_0_80px_rgba(244,114,182,0.25)]',
    description: '覆盖假名、语法、会话与 JLPT 进阶训练，强调语境沉浸。',
    levelLabel: 'JLPT N5-N1',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '韩语',
    accent: 'from-emerald-300/80 to-teal-300/80',
    glow: 'shadow-[0_0_80px_rgba(52,211,153,0.25)]',
    description: '围绕发音、实用表达与 TOPIK 路径设计，适合兴趣与考试双轨学习。',
    levelLabel: 'TOPIK 1-6',
  },
]

export const defaultUser: UserProfile = {
  id: 'user-01',
  name: '林知远',
  email: 'learner@example.com',
  avatar: 'L',
  targetLanguage: 'ja',
  currentLevel: 'N4 进阶',
  dailyGoalMinutes: 35,
  learningGoal: '半年内通过 JLPT N3 并提升口语自信',
  streakDays: 16,
  xp: 2840,
}

export const courseLevels: CourseLevel[] = [
  {
    id: 'ja-n5',
    language: 'ja',
    levelCode: 'N5',
    title: '入门音节与生存会话',
    description: '建立假名识别、基础词汇和简单问候场景。',
    progress: 100,
    unlocked: true,
    lessonCount: 18,
    focus: ['平假名', '片假名', '日常问候'],
  },
  {
    id: 'ja-n4',
    language: 'ja',
    levelCode: 'N4',
    title: '场景语法与高频表达',
    description: '强化动词活用、场景表达和阅读理解。',
    progress: 72,
    unlocked: true,
    lessonCount: 24,
    focus: ['动词变形', '听力速记', '短篇阅读'],
  },
  {
    id: 'ja-n3',
    language: 'ja',
    levelCode: 'N3',
    title: '中级阅读与表达升级',
    description: '面向考试与真实交流场景，提升语法判断与口语流畅度。',
    progress: 18,
    unlocked: true,
    lessonCount: 28,
    focus: ['复合句', '情景会话', '考试词汇'],
  },
  {
    id: 'en-b1',
    language: 'en',
    levelCode: 'B1',
    title: '职场英语表达训练',
    description: '提升邮件、会议和自我介绍等高频场景表达。',
    progress: 44,
    unlocked: true,
    lessonCount: 20,
    focus: ['职场词汇', '语气表达', '听说联动'],
  },
  {
    id: 'ko-2',
    language: 'ko',
    levelCode: 'TOPIK 2',
    title: '韩语发音与生活交流',
    description: '巩固发音规则并提升生活对话理解。',
    progress: 31,
    unlocked: true,
    lessonCount: 16,
    focus: ['收音', '礼貌表达', '生活场景'],
  },
]

export const practiceModules: PracticeModule[] = [
  {
    id: 'vocabulary',
    title: '单词记忆',
    description: '闪卡、拼写和错词回顾三段式训练。',
    accuracy: 88,
    completedToday: true,
    recommendedReason: '错词本中有 12 个词需要今天复习。',
    duration: '12 分钟',
  },
  {
    id: 'grammar',
    title: '语法练习',
    description: '填空、改错和场景选择题即时解析。',
    accuracy: 74,
    completedToday: false,
    recommendedReason: '最近 3 天助词判断准确率下降 9%。',
    duration: '18 分钟',
  },
  {
    id: 'speaking',
    title: '口语跟读',
    description: '标准发音对比、波形反馈和建议提示。',
    accuracy: 81,
    completedToday: false,
    recommendedReason: '连读与停顿节奏评分仍有提升空间。',
    duration: '10 分钟',
  },
  {
    id: 'listening',
    title: '听力训练',
    description: '短句听写、情景对话和关键词捕捉练习。',
    accuracy: 79,
    completedToday: true,
    recommendedReason: '中速对话理解已接近下一等级阈值。',
    duration: '15 分钟',
  },
]

export const dashboardMetrics: DashboardMetric[] = [
  { label: '本周学习时长', value: '4.8 小时', delta: '+18%' },
  { label: '课程完成率', value: '72%', delta: '+6%' },
  { label: '综合准确率', value: '82%', delta: '+4%' },
  { label: '连续打卡', value: '16 天', delta: '稳定保持' },
]

export const progressTrend: ProgressPoint[] = [
  { day: '周一', studyMinutes: 24, accuracy: 71 },
  { day: '周二', studyMinutes: 38, accuracy: 74 },
  { day: '周三', studyMinutes: 42, accuracy: 79 },
  { day: '周四', studyMinutes: 30, accuracy: 77 },
  { day: '周五', studyMinutes: 48, accuracy: 83 },
  { day: '周六', studyMinutes: 36, accuracy: 84 },
  { day: '周日', studyMinutes: 52, accuracy: 88 },
]

export const skills: SkillPoint[] = [
  { skill: '词汇', score: 86 },
  { skill: '语法', score: 72 },
  { skill: '听力', score: 79 },
  { skill: '口语', score: 81 },
  { skill: '阅读', score: 76 },
]

export const recommendation: RecommendationPlan = {
  focus: '本周重点攻克“助词辨析 + 中速听力抓取”',
  weakPoints: ['は/が/を 使用判断', '中长句停顿切分', '口语语调自然度'],
  coachTip: '先做语法，再进行 10 分钟听力输入，最后用跟读巩固表达，会明显提高记忆留存。',
  tasks: [
    { id: 'task-1', title: 'N4 助词专项课', type: 'course', durationMinutes: 22 },
    { id: 'task-2', title: '错词闪卡复习', type: 'review', durationMinutes: 10 },
    { id: 'task-3', title: '便利店对话跟读', type: 'practice', durationMinutes: 12 },
    { id: 'task-4', title: '发布学习打卡', type: 'community', durationMinutes: 5 },
  ],
}

export const achievements: Achievement[] = [
  {
    id: 'achv-1',
    title: '沉浸练习者',
    description: '连续 14 天完成至少一项互动训练。',
    progressLabel: '已达成',
  },
  {
    id: 'achv-2',
    title: '词汇收集家',
    description: '累计掌握 500 个高频词汇。',
    progressLabel: '423 / 500',
  },
  {
    id: 'achv-3',
    title: '社区点亮者',
    description: '连续 7 天参与学习社区互动。',
    progressLabel: '5 / 7',
  },
]

export const communityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'May',
    role: '日语学习搭子',
    language: 'ja',
    content: '今天终于把 N4 的助词专题刷完了，发现把句子拆成“主语-动作-对象”后准确率提升很多。',
    likes: 128,
    comments: 23,
    badge: '7 日打卡',
  },
  {
    id: 'post-2',
    author: 'Alex',
    role: '英语口语挑战官',
    language: 'en',
    content: '如果你也在练 shadowing，记得先模仿节奏而不是逐词对齐，流畅度会提升得更快。',
    likes: 95,
    comments: 17,
  },
  {
    id: 'post-3',
    author: '소영',
    role: '韩语 TOPIK 冲刺组',
    language: 'ko',
    content: 'TOPIK 听力里我会先听题干关键词，再带着问题二刷，正确率高了很多。',
    likes: 77,
    comments: 11,
    badge: '导师精选',
  },
]
