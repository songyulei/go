import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

type Language = '英语' | '日语' | '韩语'
type ModuleType = 'vocabulary' | 'grammar' | 'speaking' | 'listening'

type PracticeModule = {
  id: string
  title: string
  type: ModuleType
  duration: number
  prompt: string
  hint: string
  scene: string
  terms?: Array<{ term: string; meaning: string }>
  question?: string
  options?: string[]
  answer?: string
  explanation?: string
  speechText?: string
  langCode?: string
}

type Course = {
  id: string
  language: Language
  level: string
  title: string
  description: string
  immersion: string
  modules: PracticeModule[]
}

type User = {
  id: string
  name: string
  email: string
  password: string
  focusLanguage: Language
  goal: string
  studyMinutes: number
  weakSkills: ModuleType[]
  completedModules: string[]
  streak: number
}

type CommunityPost = {
  id: string
  authorId: string
  authorName: string
  language: Language
  tag: string
  content: string
  likes: number
  createdAt: string
}

type Achievement = {
  id: string
  title: string
  description: string
}

const storageKeys = {
  users: 'llp-users',
  currentUserId: 'llp-current-user',
  posts: 'llp-community-posts',
} as const

const COURSES: Course[] = [
  {
    id: 'english-a1',
    language: '英语',
    level: 'A1 入门',
    title: '机场与旅行英语',
    description: '围绕值机、问路、点餐等真实场景建立基础表达。',
    immersion: '沉浸场景：国际机场 + 咖啡馆',
    modules: [
      {
        id: 'en-a1-vocab',
        title: '单词记忆：出行高频词',
        type: 'vocabulary',
        duration: 12,
        prompt: '记住以下高频词并建立场景联想。',
        hint: '把单词放进“到机场办理值机”的流程里会更容易记住。',
        scene: '值机柜台',
        terms: [
          { term: 'boarding pass', meaning: '登机牌' },
          { term: 'passport', meaning: '护照' },
          { term: 'window seat', meaning: '靠窗座位' },
        ],
      },
      {
        id: 'en-a1-grammar',
        title: '语法练习：一般现在时',
        type: 'grammar',
        duration: 10,
        prompt: '选择最合适的句子完成表达。',
        hint: '关注第三人称单数和动词原形。',
        scene: '酒店入住',
        question: 'She usually ___ breakfast at 7 a.m.',
        options: ['have', 'has', 'having', 'had'],
        answer: 'has',
        explanation: '主语是 she，动词要用第三人称单数形式 has。',
      },
      {
        id: 'en-a1-speaking',
        title: '口语跟读：自我介绍',
        type: 'speaking',
        duration: 8,
        prompt: '听示范后进行跟读，训练语音语调。',
        hint: '先分意群，再跟读完整句子。',
        scene: '语言交换活动',
        speechText: 'Hello, I am Mia. I am here to improve my English and make new friends.',
        langCode: 'en-US',
      },
      {
        id: 'en-a1-listening',
        title: '听力训练：咖啡点单',
        type: 'listening',
        duration: 9,
        prompt: '点击播放语音后，判断顾客点了什么。',
        hint: '注意听饮品和数量信息。',
        scene: '咖啡馆',
        speechText: 'Can I get two lattes and one blueberry muffin, please?',
        question: '顾客点了什么？',
        options: ['一杯拿铁和一个松饼', '两杯拿铁和一个蓝莓松饼', '两杯美式和一个松饼'],
        answer: '两杯拿铁和一个蓝莓松饼',
        explanation: '关键词是 two lattes 和 one blueberry muffin。',
        langCode: 'en-US',
      },
    ],
  },
  {
    id: 'english-b1',
    language: '英语',
    level: 'B1 进阶',
    title: '职场沟通与会议表达',
    description: '提升汇报、澄清需求、会议协作等场景表达。',
    immersion: '沉浸场景：跨国团队例会',
    modules: [
      {
        id: 'en-b1-vocab',
        title: '单词记忆：会议协作词汇',
        type: 'vocabulary',
        duration: 14,
        prompt: '掌握项目协作中的关键词。',
        hint: '把单词想象成你在会议中经常会说的话。',
        scene: '项目周会',
        terms: [
          { term: 'deadline', meaning: '截止时间' },
          { term: 'deliverable', meaning: '交付物' },
          { term: 'alignment', meaning: '信息对齐' },
        ],
      },
      {
        id: 'en-b1-grammar',
        title: '语法练习：条件句',
        type: 'grammar',
        duration: 10,
        prompt: '完成假设表达。',
        hint: '第一条件句常用 If + 一般现在时, will + 动词原形。',
        scene: '方案评审',
        question: 'If we finish early, we ___ the client today.',
        options: ['call', 'called', 'will call', 'are calling'],
        answer: 'will call',
        explanation: '这是第一条件句，主句要用 will call。',
      },
      {
        id: 'en-b1-speaking',
        title: '口语跟读：会议发言',
        type: 'speaking',
        duration: 9,
        prompt: '训练更自然的职场表达节奏。',
        hint: '注意重音放在 update 和 blockers 上。',
        scene: '站会汇报',
        speechText: 'Here is a quick update on the project. We are on track, but we still have two blockers to solve.',
        langCode: 'en-US',
      },
      {
        id: 'en-b1-listening',
        title: '听力训练：客户需求',
        type: 'listening',
        duration: 10,
        prompt: '播放后选出客户最关注的点。',
        hint: '抓住 need、priority、launch 等信号词。',
        scene: '客户沟通',
        speechText: 'Our top priority is to simplify onboarding before the product launch next month.',
        question: '客户目前最关注什么？',
        options: ['增加更多功能', '在上线前简化新手引导', '推迟产品发布时间'],
        answer: '在上线前简化新手引导',
        explanation: '句子里的 top priority 和 simplify onboarding 是关键信息。',
        langCode: 'en-US',
      },
    ],
  },
  {
    id: 'japanese-a1',
    language: '日语',
    level: 'N5 基础',
    title: '日常会话与校园表达',
    description: '学习问候、时间、地点和基础校园交流。',
    immersion: '沉浸场景：日本校园生活',
    modules: [
      {
        id: 'ja-a1-vocab',
        title: '单词记忆：校园生活词汇',
        type: 'vocabulary',
        duration: 10,
        prompt: '从每天会遇到的校园事物开始记忆。',
        hint: '结合图片或教室环境做联想更容易记住。',
        scene: '教室',
        terms: [
          { term: 'きょうしつ', meaning: '教室' },
          { term: 'せんせい', meaning: '老师' },
          { term: 'ともだち', meaning: '朋友' },
        ],
      },
      {
        id: 'ja-a1-grammar',
        title: '语法练习：助词 は / を',
        type: 'grammar',
        duration: 11,
        prompt: '根据句意选择正确助词。',
        hint: '主题用 は，宾语常用 を。',
        scene: '自我介绍',
        question: 'わたし___りんごをたべます。',
        options: ['が', 'に', 'は', 'で'],
        answer: 'は',
        explanation: '这里是在强调“我”作为主题，因此用 は。',
      },
      {
        id: 'ja-a1-speaking',
        title: '口语跟读：初次见面',
        type: 'speaking',
        duration: 8,
        prompt: '熟悉日语礼貌表达的节奏与语调。',
        hint: '跟读时注意句尾的语气下沉。',
        scene: '社团迎新',
        speechText: 'はじめまして。わたしはりなです。どうぞよろしくおねがいします。',
        langCode: 'ja-JP',
      },
      {
        id: 'ja-a1-listening',
        title: '听力训练：时间确认',
        type: 'listening',
        duration: 8,
        prompt: '播放后判断约定时间。',
        hint: '重点捕捉数字和时间表达。',
        scene: '课后约见',
        speechText: 'じゃあ、あしたのごごさんじに、としょかんであいましょう。',
        question: '他们约在什么时候见面？',
        options: ['明天下午三点', '明天上午三点', '今天下午三点'],
        answer: '明天下午三点',
        explanation: 'あしたのごごさんじ 表示“明天下午三点”。',
        langCode: 'ja-JP',
      },
    ],
  },
  {
    id: 'japanese-b1',
    language: '日语',
    level: 'N3 进阶',
    title: '旅行与礼貌表达',
    description: '围绕出行、订票、问路和礼貌请求开展训练。',
    immersion: '沉浸场景：东京自由行',
    modules: [
      {
        id: 'ja-b1-vocab',
        title: '单词记忆：交通与旅行',
        type: 'vocabulary',
        duration: 12,
        prompt: '学习自由行中常用的高频名词。',
        hint: '试着把词汇串成一段问路对话。',
        scene: '地铁站',
        terms: [
          { term: 'きっぷ', meaning: '车票' },
          { term: 'のりかえ', meaning: '换乘' },
          { term: 'しゅっぱつ', meaning: '出发' },
        ],
      },
      {
        id: 'ja-b1-grammar',
        title: '语法练习：〜てもいいです',
        type: 'grammar',
        duration: 10,
        prompt: '判断许可表达是否正确。',
        hint: '〜てもいいです 用于“可以……吗/可以……”。',
        scene: '酒店前台',
        question: 'ここでしゃしんを___いいですか。',
        options: ['とっても', 'とるて', 'とっては', 'とりて'],
        answer: 'とっても',
        explanation: '动词て形 + もいいです 表示允许。',
      },
      {
        id: 'ja-b1-speaking',
        title: '口语跟读：礼貌问路',
        type: 'speaking',
        duration: 9,
        prompt: '练习更自然的旅行问路表达。',
        hint: '注意停顿位置和礼貌语气。',
        scene: '街头问路',
        speechText: 'すみません、えきまでどうやっていけばいいですか。',
        langCode: 'ja-JP',
      },
      {
        id: 'ja-b1-listening',
        title: '听力训练：车站广播',
        type: 'listening',
        duration: 9,
        prompt: '听完后判断列车发车站台。',
        hint: '重点听ばんせん和列车名称。',
        scene: '新宿站',
        speechText: 'まもなく、さんばんせんにでんしゃがまいります。',
        question: '列车即将到达几号站台？',
        options: ['二号站台', '三号站台', '四号站台'],
        answer: '三号站台',
        explanation: 'さんばんせん 就是三号站台。',
        langCode: 'ja-JP',
      },
    ],
  },
  {
    id: 'korean-a1',
    language: '韩语',
    level: 'TOPIK 1',
    title: '生活韩语与基础问答',
    description: '从问候、购物、方向等日常场景开始训练。',
    immersion: '沉浸场景：首尔日常生活',
    modules: [
      {
        id: 'ko-a1-vocab',
        title: '单词记忆：日常物品词汇',
        type: 'vocabulary',
        duration: 10,
        prompt: '在生活场景中记住最常见的词汇。',
        hint: '配合“去便利店购物”的画面感来记忆。',
        scene: '便利店',
        terms: [
          { term: '물', meaning: '水' },
          { term: '우산', meaning: '雨伞' },
          { term: '지갑', meaning: '钱包' },
        ],
      },
      {
        id: 'ko-a1-grammar',
        title: '语法练习：이에요 / 예요',
        type: 'grammar',
        duration: 10,
        prompt: '选择正确的判断句词尾。',
        hint: '名词有收音通常用 이에요。',
        scene: '初次见面',
        question: '저는 학생___。',
        options: ['이에요', '예요', '입니다요', '해요'],
        answer: '이에요',
        explanation: '학생 以收音结尾，因此用 이에요。',
      },
      {
        id: 'ko-a1-speaking',
        title: '口语跟读：点餐表达',
        type: 'speaking',
        duration: 8,
        prompt: '跟读练习韩语点单语气。',
        hint: '注意把 주세요 读得更自然。',
        scene: '餐厅点餐',
        speechText: '비빔밥 하나하고 물 한 잔 주세요.',
        langCode: 'ko-KR',
      },
      {
        id: 'ko-a1-listening',
        title: '听力训练：购物问答',
        type: 'listening',
        duration: 8,
        prompt: '听后判断顾客要买什么。',
        hint: '注意数量词和商品名。',
        scene: '超市购物',
        speechText: '사과 두 개하고 우유 한 병 주세요.',
        question: '顾客要买什么？',
        options: ['两个苹果和一瓶牛奶', '两个橘子和一瓶牛奶', '两个苹果和一瓶水'],
        answer: '两个苹果和一瓶牛奶',
        explanation: '두 개 是两个，우유 한 병 是一瓶牛奶。',
        langCode: 'ko-KR',
      },
    ],
  },
  {
    id: 'korean-b1',
    language: '韩语',
    level: 'TOPIK 2',
    title: '职场与社交韩语',
    description: '加强会议沟通、请假说明和社交表达。',
    immersion: '沉浸场景：团队协作与社交场合',
    modules: [
      {
        id: 'ko-b1-vocab',
        title: '单词记忆：职场核心词',
        type: 'vocabulary',
        duration: 11,
        prompt: '记住会议和项目中常见的韩语词汇。',
        hint: '把每个词放进一句工作汇报里。',
        scene: '办公室',
        terms: [
          { term: '회의', meaning: '会议' },
          { term: '자료', meaning: '资料' },
          { term: '마감', meaning: '截止日期' },
        ],
      },
      {
        id: 'ko-b1-grammar',
        title: '语法练习：-(으)려고 하다',
        type: 'grammar',
        duration: 10,
        prompt: '选择表达“打算……”的正确形式。',
        hint: '表示计划或意图时常用 -(으)려고 하다。',
        scene: '工作安排',
        question: '오늘은 일찍 퇴근___ 해요.',
        options: ['으려고', '고 싶어', '아야', '게'],
        answer: '으려고',
        explanation: '퇴근하려고 해요 表示“打算早点下班”。',
      },
      {
        id: 'ko-b1-speaking',
        title: '口语跟读：会议发言',
        type: 'speaking',
        duration: 9,
        prompt: '练习更自然的韩语汇报语气。',
        hint: '重点模仿句中停顿和尾音。',
        scene: '部门例会',
        speechText: '이번 주에는 일정이 조금 바쁘지만, 계획대로 진행하고 있습니다.',
        langCode: 'ko-KR',
      },
      {
        id: 'ko-b1-listening',
        title: '听力训练：请假说明',
        type: 'listening',
        duration: 9,
        prompt: '听后判断说话人请假的原因。',
        hint: '重点抓住 이유 和 병원 等词。',
        scene: '请假沟通',
        speechText: '몸이 좀 안 좋아서 오늘 병원에 다녀오려고 합니다.',
        question: '说话人为什么请假？',
        options: ['要去出差', '身体不舒服要去医院', '要参加会议'],
        answer: '身体不舒服要去医院',
        explanation: '몸이 안 좋아서 和 병원 是直接线索。',
        langCode: 'ko-KR',
      },
    ],
  },
]

const COMMUNITY_SEED: CommunityPost[] = [
  {
    id: 'seed-1',
    authorId: 'mentor-en',
    authorName: 'Coach Lena',
    language: '英语',
    tag: '口语打卡',
    content: '今天的英语挑战：用 30 秒完成一次机场值机自我介绍，先慢后快录两遍。',
    likes: 18,
    createdAt: '今天 09:00',
  },
  {
    id: 'seed-2',
    authorId: 'mentor-ja',
    authorName: 'Sora 老师',
    language: '日语',
    tag: '学习技巧',
    content: '日语助词容易混淆时，先把句子拆成“主题 + 动作 + 对象”，再填助词更稳。',
    likes: 12,
    createdAt: '今天 11:30',
  },
  {
    id: 'seed-3',
    authorId: 'mentor-ko',
    authorName: 'Min 教练',
    language: '韩语',
    tag: '听力训练',
    content: '韩语听力先抓数量词和场景词，别急着逐字翻译，先听懂大意再回听细节。',
    likes: 15,
    createdAt: '今天 14:10',
  },
]

const ACHIEVEMENTS: Achievement[] = [
  { id: 'starter', title: '启程学员', description: '完成第 1 个互动模块' },
  { id: 'focused', title: '专项突破', description: '完成 3 个薄弱项训练' },
  { id: 'streak', title: '学习连击', description: '累计完成 4 次学习打卡' },
  { id: 'social', title: '社区发光者', description: '发布第 1 条学习动态' },
  { id: 'explorer', title: '多语种探索者', description: '跨 2 门语言完成学习模块' },
]

const moduleTypeLabels: Record<ModuleType, string> = {
  vocabulary: '单词记忆',
  grammar: '语法练习',
  speaking: '口语跟读',
  listening: '听力训练',
}

const moduleTypeIcons: Record<ModuleType, string> = {
  vocabulary: '词',
  grammar: '语',
  speaking: '说',
  listening: '听',
}

const goals = ['旅行沟通', '考试备考', '职场提升', '兴趣学习']

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}

function getModuleCatalog() {
  return COURSES.flatMap((course) =>
    course.modules.map((module) => ({
      ...module,
      language: course.language,
      level: course.level,
      courseId: course.id,
      courseTitle: course.title,
    })),
  )
}

const MODULE_CATALOG = getModuleCatalog()

function calculateAchievements(user: User, posts: CommunityPost[]) {
  const completedModules = MODULE_CATALOG.filter((module) =>
    user.completedModules.includes(module.id),
  )
  const postCount = posts.filter((post) => post.authorId === user.id).length
  const weakSkillCompleted = completedModules.filter((module) =>
    user.weakSkills.includes(module.type),
  ).length
  const uniqueLanguages = unique(completedModules.map((module) => module.language))

  return ACHIEVEMENTS.filter((achievement) => {
    if (achievement.id === 'starter') return completedModules.length >= 1
    if (achievement.id === 'focused') return weakSkillCompleted >= 3
    if (achievement.id === 'streak') return user.streak >= 4
    if (achievement.id === 'social') return postCount >= 1
    if (achievement.id === 'explorer') return uniqueLanguages.length >= 2
    return false
  })
}

function App() {
  const [users, setUsers] = useState<User[]>(() => readStorage(storageKeys.users, []))
  const [currentUserId, setCurrentUserId] = useState<string | null>(() =>
    readStorage<string | null>(storageKeys.currentUserId, null),
  )
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    readStorage(storageKeys.posts, COMMUNITY_SEED),
  )
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id)
  const [selectedModuleId, setSelectedModuleId] = useState<string>(COURSES[0].modules[0].id)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    focusLanguage: '英语' as Language,
    goal: goals[0],
    studyMinutes: 20,
    weakSkills: ['speaking', 'listening'] as ModuleType[],
  })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [postDraft, setPostDraft] = useState({ language: '英语' as Language, tag: '学习打卡', content: '' })
  const [vocabReveal, setVocabReveal] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('欢迎来到 LinguaVerse，开始你的沉浸式学习。')

  const currentUser = users.find((user) => user.id === currentUserId) ?? null

  useEffect(() => {
    localStorage.setItem(storageKeys.users, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(storageKeys.currentUserId, JSON.stringify(currentUserId))
    } else {
      localStorage.removeItem(storageKeys.currentUserId)
    }
  }, [currentUserId])

  useEffect(() => {
    localStorage.setItem(storageKeys.posts, JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    if (!currentUser) return
    const recommendedCourse =
      COURSES.find((course) => course.language === currentUser.focusLanguage) ?? COURSES[0]
    setSelectedCourseId(recommendedCourse.id)
  }, [currentUser])

  const selectedCourse =
    COURSES.find((course) => course.id === selectedCourseId) ??
    COURSES.find((course) => course.language === currentUser?.focusLanguage) ??
    COURSES[0]

  useEffect(() => {
    const firstModule = selectedCourse.modules[0]
    const moduleStillExists = selectedCourse.modules.some((module) => module.id === selectedModuleId)
    if (!moduleStillExists && firstModule) {
      setSelectedModuleId(firstModule.id)
    }
    setVocabReveal(null)
    setSelectedAnswer('')
    setFeedback('')
  }, [selectedCourse, selectedModuleId])

  const currentModule =
    selectedCourse.modules.find((module) => module.id === selectedModuleId) ??
    selectedCourse.modules[0]

  const earnedAchievements = currentUser ? calculateAchievements(currentUser, posts) : []

  const progress = useMemo(() => {
    if (!currentUser) {
      return {
        completedCount: 0,
        totalCount: MODULE_CATALOG.length,
        percent: 0,
      }
    }
    const completedCount = currentUser.completedModules.length
    return {
      completedCount,
      totalCount: MODULE_CATALOG.length,
      percent: Math.round((completedCount / MODULE_CATALOG.length) * 100),
    }
  }, [currentUser])

  const courseProgress = useMemo(() => {
    if (!currentUser) {
      return Object.fromEntries(COURSES.map((course) => [course.id, 0])) as Record<string, number>
    }

    return Object.fromEntries(
      COURSES.map((course) => {
        const completed = course.modules.filter((module) =>
          currentUser.completedModules.includes(module.id),
        ).length
        return [course.id, Math.round((completed / course.modules.length) * 100)]
      }),
    ) as Record<string, number>
  }, [currentUser])

  const recommendations = useMemo(() => {
    if (!currentUser) {
      return MODULE_CATALOG.slice(0, 4)
    }

    const preferred = MODULE_CATALOG.filter(
      (module) =>
        module.language === currentUser.focusLanguage &&
        !currentUser.completedModules.includes(module.id),
    )

    preferred.sort((a, b) => {
      const aPriority = currentUser.weakSkills.includes(a.type) ? 0 : 1
      const bPriority = currentUser.weakSkills.includes(b.type) ? 0 : 1
      return aPriority - bPriority
    })

    return preferred.slice(0, 4)
  }, [currentUser])

  function updateCurrentUser(updater: (user: User) => User) {
    if (!currentUser) return
    setUsers((prev) => prev.map((user) => (user.id === currentUser.id ? updater(user) : user)))
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (users.some((user) => user.email === registerForm.email)) {
      setStatusMessage('该邮箱已注册，请直接登录。')
      setAuthMode('login')
      return
    }

    const nextUser: User = {
      id: crypto.randomUUID(),
      name: registerForm.name || '新学员',
      email: registerForm.email,
      password: registerForm.password,
      focusLanguage: registerForm.focusLanguage,
      goal: registerForm.goal,
      studyMinutes: Number(registerForm.studyMinutes),
      weakSkills: registerForm.weakSkills,
      completedModules: [],
      streak: 0,
    }

    setUsers((prev) => [...prev, nextUser])
    setCurrentUserId(nextUser.id)
    setPostDraft((prev) => ({ ...prev, language: nextUser.focusLanguage }))
    setStatusMessage(`欢迎加入，${nextUser.name}。已为你生成 ${nextUser.focusLanguage} 优先学习路径。`)
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const matched = users.find(
      (user) => user.email === loginForm.email && user.password === loginForm.password,
    )

    if (!matched) {
      setStatusMessage('邮箱或密码不正确，请重试。')
      return
    }

    setCurrentUserId(matched.id)
    setPostDraft((prev) => ({ ...prev, language: matched.focusLanguage }))
    setStatusMessage(`欢迎回来，${matched.name}。继续你的 ${matched.focusLanguage} 学习计划吧。`)
  }

  function handleQuickStart() {
    const demoEmail = 'demo@linguaverse.ai'
    const existing = users.find((user) => user.email === demoEmail)

    if (existing) {
      setCurrentUserId(existing.id)
      setStatusMessage('已进入演示账号，你可以立即体验课程、进度与社区功能。')
      return
    }

    const demoUser: User = {
      id: crypto.randomUUID(),
      name: '演示学员',
      email: demoEmail,
      password: 'demo1234',
      focusLanguage: '英语',
      goal: '职场提升',
      studyMinutes: 25,
      weakSkills: ['speaking', 'listening'],
      completedModules: ['en-a1-vocab'],
      streak: 1,
    }

    setUsers((prev) => [...prev, demoUser])
    setCurrentUserId(demoUser.id)
    setPostDraft((prev) => ({ ...prev, language: demoUser.focusLanguage }))
    setStatusMessage('已创建演示账号，建议先体验推荐路径中的口语跟读与听力训练。')
  }

  function toggleWeakSkill(skill: ModuleType) {
    setRegisterForm((prev) => {
      const hasSkill = prev.weakSkills.includes(skill)
      const weakSkills = hasSkill
        ? prev.weakSkills.filter((item) => item !== skill)
        : [...prev.weakSkills, skill]

      return {
        ...prev,
        weakSkills: weakSkills.length > 0 ? weakSkills : [skill],
      }
    })
  }

  function playSpeech(module: PracticeModule) {
    if (!module.speechText || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStatusMessage('当前浏览器不支持语音播放，请直接阅读示范文本进行跟读。')
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(module.speechText)
    utterance.lang = module.langCode ?? 'en-US'
    window.speechSynthesis.speak(utterance)
    setStatusMessage(`正在播放 ${moduleTypeLabels[module.type]} 示例语音。`)
  }

  function handleCheckAnswer() {
    if (!currentModule.answer || !selectedAnswer) {
      setFeedback('请选择一个答案后再提交。')
      return
    }

    if (selectedAnswer === currentModule.answer) {
      setFeedback(`回答正确。${currentModule.explanation ?? ''}`)
      setStatusMessage('练习反馈：回答正确，可以标记本模块已完成。')
      return
    }

    setFeedback(`回答不正确。${currentModule.explanation ?? '再试一次。'}`)
    setStatusMessage('练习反馈：本题还可以再听一遍或复习提示。')
  }

  function completeCurrentModule() {
    if (!currentUser) {
      setStatusMessage('请先注册或登录，再记录学习进度。')
      return
    }

    const nextCompleted = unique([...currentUser.completedModules, currentModule.id])
    const nextUser = {
      ...currentUser,
      completedModules: nextCompleted,
      streak: currentUser.streak + 1,
    }
    const previousAchievements = calculateAchievements(currentUser, posts).map((item) => item.id)
    const nextAchievements = calculateAchievements(nextUser, posts)
    const unlocked = nextAchievements.find((item) => !previousAchievements.includes(item.id))

    updateCurrentUser(() => nextUser)
    setStatusMessage(
      unlocked
        ? `已完成 ${currentModule.title}，并解锁成就“${unlocked.title}”。`
        : `已完成 ${currentModule.title}，学习进度已更新。`,
    )
  }

  function handleCreatePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentUser) {
      setStatusMessage('登录后才能参与社区交流。')
      return
    }

    if (!postDraft.content.trim()) {
      setStatusMessage('请输入你的学习心得或提问。')
      return
    }

    const nextPost: CommunityPost = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      language: postDraft.language,
      tag: postDraft.tag,
      content: postDraft.content.trim(),
      likes: 0,
      createdAt: '刚刚',
    }

    const nextPosts = [nextPost, ...posts]
    const previousAchievements = calculateAchievements(currentUser, posts).map((item) => item.id)
    const nextAchievements = calculateAchievements(currentUser, nextPosts)
    const unlocked = nextAchievements.find((item) => !previousAchievements.includes(item.id))

    setPosts(nextPosts)
    setPostDraft((prev) => ({ ...prev, content: '' }))
    setStatusMessage(
      unlocked
        ? `动态已发布，并解锁成就“${unlocked.title}”。`
        : '动态已发布，去社区和其他学习者互动吧。',
    )
  }

  function handleLikePost(postId: string) {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)),
    )
  }

  const todaysPlan = recommendations.map((module, index) => {
    const sessionLabel = ['晨读', '午间', '晚间', '加练'][index] ?? `阶段 ${index + 1}`
    return `${sessionLabel}：${moduleTypeLabels[module.type]} · ${module.courseTitle}`
  })

  return (
    <div className="app-shell">
      <header className="hero-banner">
        <div>
          <span className="badge">LinguaVerse</span>
          <h1>多语种沉浸式在线教育平台</h1>
          <p className="hero-copy">
            用分级课程、互动训练、进度追踪与社群激励，帮助学习者系统掌握英语、日语、韩语。
          </p>
          <div className="hero-actions">
            <button type="button" className="primary" onClick={handleQuickStart}>
              立即体验
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))}
            >
              {authMode === 'login' ? '切换注册' : '切换登录'}
            </button>
          </div>
        </div>
        <div className="hero-panel">
          <div className="metric">
            <span>支持语种</span>
            <strong>3 大主流语言</strong>
          </div>
          <div className="metric">
            <span>互动模块</span>
            <strong>单词 / 语法 / 口语 / 听力</strong>
          </div>
          <div className="metric">
            <span>学习氛围</span>
            <strong>社区共学 + 成就激励</strong>
          </div>
        </div>
      </header>

      <section className="status-bar">
        <span>{statusMessage}</span>
        <span>{currentUser ? `当前用户：${currentUser.name}` : '当前状态：未登录'}</span>
      </section>

      <main className="dashboard-grid">
        <section className="card auth-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">用户中心</span>
              <h2>注册登录</h2>
            </div>
            {currentUser ? (
              <button type="button" className="ghost" onClick={() => setCurrentUserId(null)}>
                退出登录
              </button>
            ) : null}
          </div>

          {!currentUser ? (
            <>
              <div className="tab-group">
                <button
                  type="button"
                  className={authMode === 'register' ? 'tab active' : 'tab'}
                  onClick={() => setAuthMode('register')}
                >
                  注册
                </button>
                <button
                  type="button"
                  className={authMode === 'login' ? 'tab active' : 'tab'}
                  onClick={() => setAuthMode('login')}
                >
                  登录
                </button>
              </div>

              {authMode === 'register' ? (
                <form className="auth-form" onSubmit={handleRegister}>
                  <input
                    required
                    placeholder="昵称"
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                  />
                  <input
                    required
                    type="email"
                    placeholder="邮箱"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                  <input
                    required
                    type="password"
                    placeholder="密码"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                  <select
                    value={registerForm.focusLanguage}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        focusLanguage: event.target.value as Language,
                      }))
                    }
                  >
                    <option value="英语">英语</option>
                    <option value="日语">日语</option>
                    <option value="韩语">韩语</option>
                  </select>
                  <select
                    value={registerForm.goal}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({ ...prev, goal: event.target.value }))
                    }
                  >
                    {goals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    step={5}
                    value={registerForm.studyMinutes}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        studyMinutes: Number(event.target.value),
                      }))
                    }
                  />
                  <div className="skill-picker">
                    {(['vocabulary', 'grammar', 'speaking', 'listening'] as ModuleType[]).map(
                      (skill) => (
                        <button
                          key={skill}
                          type="button"
                          className={
                            registerForm.weakSkills.includes(skill) ? 'chip active' : 'chip'
                          }
                          onClick={() => toggleWeakSkill(skill)}
                        >
                          {moduleTypeLabels[skill]}
                        </button>
                      ),
                    )}
                  </div>
                  <button type="submit" className="primary">
                    创建学习档案
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleLogin}>
                  <input
                    required
                    type="email"
                    placeholder="邮箱"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                  <input
                    required
                    type="password"
                    placeholder="密码"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                  <button type="submit" className="primary">
                    登录并继续学习
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="profile-card">
              <div className="profile-top">
                <div>
                  <span className="eyebrow">个性化学习路径</span>
                  <h3>{currentUser.name}</h3>
                </div>
                <span className="badge subtle">{currentUser.focusLanguage}</span>
              </div>
              <p>
                目标：{currentUser.goal} · 每日学习 {currentUser.studyMinutes} 分钟
              </p>
              <p>当前薄弱项：{currentUser.weakSkills.map((skill) => moduleTypeLabels[skill]).join(' / ')}</p>
              <div className="progress-strip">
                <span>总进度 {progress.percent}%</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
              <div className="mini-metrics">
                <div>
                  <strong>{progress.completedCount}</strong>
                  <span>已完成模块</span>
                </div>
                <div>
                  <strong>{currentUser.streak}</strong>
                  <span>连续学习值</span>
                </div>
                <div>
                  <strong>{earnedAchievements.length}</strong>
                  <span>已解锁成就</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="card courses-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">课程体系</span>
              <h2>分级课程</h2>
            </div>
          </div>
          <div className="course-list">
            {COURSES.map((course) => (
              <button
                key={course.id}
                type="button"
                className={selectedCourseId === course.id ? 'course-item active' : 'course-item'}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <div>
                  <strong>
                    {course.language} · {course.level}
                  </strong>
                  <p>{course.title}</p>
                </div>
                <span>{courseProgress[course.id] ?? 0}%</span>
              </button>
            ))}
          </div>
          <div className="course-detail">
            <div>
              <span className="badge subtle">{selectedCourse.immersion}</span>
              <h3>{selectedCourse.title}</h3>
              <p>{selectedCourse.description}</p>
            </div>
            <div className="module-grid">
              {selectedCourse.modules.map((module) => {
                const completed = currentUser?.completedModules.includes(module.id) ?? false
                return (
                  <button
                    key={module.id}
                    type="button"
                    className={selectedModuleId === module.id ? 'module-card active' : 'module-card'}
                    onClick={() => setSelectedModuleId(module.id)}
                  >
                    <div className="module-card-top">
                      <span className="icon-badge">{moduleTypeIcons[module.type]}</span>
                      <span>{module.duration} 分钟</span>
                    </div>
                    <strong>{module.title}</strong>
                    <p>{module.scene}</p>
                    <span className={completed ? 'badge success' : 'badge subtle'}>
                      {completed ? '已完成' : moduleTypeLabels[module.type]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <section className="card practice-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">互动式学习</span>
              <h2>{currentModule.title}</h2>
            </div>
            <button type="button" className="primary" onClick={completeCurrentModule}>
              标记完成
            </button>
          </div>
          <p className="module-intro">{currentModule.prompt}</p>
          <p className="module-hint">提示：{currentModule.hint}</p>

          {currentModule.type === 'vocabulary' ? (
            <div className="vocab-list">
              {currentModule.terms?.map((term, index) => (
                <button
                  type="button"
                  key={term.term}
                  className="vocab-card"
                  onClick={() => setVocabReveal(vocabReveal === index ? null : index)}
                >
                  <strong>{term.term}</strong>
                  <span>{vocabReveal === index ? term.meaning : '点击查看释义'}</span>
                </button>
              ))}
            </div>
          ) : null}

          {currentModule.type === 'grammar' || currentModule.type === 'listening' ? (
            <div className="quiz-panel">
              {currentModule.type === 'listening' ? (
                <button type="button" className="secondary" onClick={() => playSpeech(currentModule)}>
                  播放音频
                </button>
              ) : null}
              <h3>{currentModule.question}</h3>
              <div className="option-list">
                {currentModule.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={selectedAnswer === option ? 'option active' : 'option'}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="quiz-actions">
                <button type="button" className="primary" onClick={handleCheckAnswer}>
                  提交答案
                </button>
                {feedback ? <p>{feedback}</p> : null}
              </div>
            </div>
          ) : null}

          {currentModule.type === 'speaking' ? (
            <div className="speaking-panel">
              <p className="speech-text">{currentModule.speechText}</p>
              <div className="hero-actions">
                <button type="button" className="primary" onClick={() => playSpeech(currentModule)}>
                  播放示范
                </button>
                <button type="button" className="secondary" onClick={completeCurrentModule}>
                  完成跟读
                </button>
              </div>
              <p>建议流程：先听示范 2 遍，再分句跟读，最后完整复述 1 遍。</p>
            </div>
          ) : null}
        </section>

        <section className="card path-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">推荐引擎</span>
              <h2>个性化学习路径</h2>
            </div>
          </div>
          <div className="recommendation-list">
            {recommendations.map((module) => (
              <div key={module.id} className="recommendation-item">
                <div>
                  <strong>{module.title}</strong>
                  <p>
                    {module.language} · {module.level} · {module.courseTitle}
                  </p>
                </div>
                <span className="badge subtle">{moduleTypeLabels[module.type]}</span>
              </div>
            ))}
          </div>
          <div className="plan-box">
            <h3>今日建议安排</h3>
            {todaysPlan.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>

        <section className="card achievements-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">成长激励</span>
              <h2>成就系统</h2>
            </div>
          </div>
          <div className="achievement-grid">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = earnedAchievements.some((item) => item.id === achievement.id)
              return (
                <div key={achievement.id} className={unlocked ? 'achievement unlocked' : 'achievement'}>
                  <strong>{achievement.title}</strong>
                  <p>{achievement.description}</p>
                  <span>{unlocked ? '已解锁' : '待解锁'}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="card community-card">
          <div className="section-head">
            <div>
              <span className="eyebrow">社区交流</span>
              <h2>学习者社区</h2>
            </div>
          </div>
          <form className="community-form" onSubmit={handleCreatePost}>
            <select
              value={postDraft.language}
              onChange={(event) =>
                setPostDraft((prev) => ({ ...prev, language: event.target.value as Language }))
              }
            >
              <option value="英语">英语</option>
              <option value="日语">日语</option>
              <option value="韩语">韩语</option>
            </select>
            <input
              placeholder="标签，例如：学习打卡 / 提问 / 口语练习"
              value={postDraft.tag}
              onChange={(event) => setPostDraft((prev) => ({ ...prev, tag: event.target.value }))}
            />
            <textarea
              rows={3}
              placeholder="分享你的学习心得、提问或打卡内容"
              value={postDraft.content}
              onChange={(event) => setPostDraft((prev) => ({ ...prev, content: event.target.value }))}
            />
            <button type="submit" className="primary">
              发布动态
            </button>
          </form>
          <div className="post-list">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-top">
                  <div>
                    <strong>{post.authorName}</strong>
                    <p>
                      {post.language} · {post.tag}
                    </p>
                  </div>
                  <span>{post.createdAt}</span>
                </div>
                <p>{post.content}</p>
                <button type="button" className="ghost" onClick={() => handleLikePost(post.id)}>
                  点赞 {post.likes}
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
