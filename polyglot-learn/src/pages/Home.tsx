import { motion } from 'framer-motion'
import {
  BookOpenText,
  BotMessageSquare,
  ChartColumnBig,
  MessagesSquare,
  Mic,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { MainLayout } from '@/components/layout/MainLayout'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { usePlatformSnapshot } from '@/hooks/usePlatformSnapshot'

const features = [
  {
    icon: BookOpenText,
    title: '分级课程体系',
    description: '英语、日语、韩语按能力等级组织课程，兼顾零基础入门与考试提升。',
    meta: '课程路径',
  },
  {
    icon: Sparkles,
    title: '互动式学习模块',
    description: '把单词、语法、口语、听力拆成高频微训练，让学习更像挑战而不是刷题。',
    meta: '练习引擎',
  },
  {
    icon: ChartColumnBig,
    title: '学习进度追踪',
    description: '用趋势图、雷达图和连续打卡记录成长，帮助用户清楚感知进步。',
    meta: '成长反馈',
  },
  {
    icon: BotMessageSquare,
    title: '个性化学习路径',
    description: '根据目标语言、当前水平和薄弱项，动态给出今天该学什么。',
    meta: '推荐系统',
  },
  {
    icon: MessagesSquare,
    title: '社区与成就激励',
    description: '通过打卡动态、学习小组、徽章与榜单激活持续学习动力。',
    meta: '学习社群',
  },
  {
    icon: Mic,
    title: '沉浸式口语训练',
    description: '跟读录音、节奏对比与场景会话结合，强化真实表达能力。',
    meta: '听说联动',
  },
]

export default function Home() {
  const { snapshot, loading } = usePlatformSnapshot()

  return (
    <MainLayout
      title="多语种沉浸式学习平台"
      eyebrow="Brand Experience"
      description="一套覆盖课程、训练、推荐、社区与成长反馈的完整在线教育平台原型。"
    >
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[36px] border border-white/10 bg-white/6 p-7 backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100">
              沉浸式语言学习体验
            </span>
            <span className="rounded-full bg-amber-100/10 px-4 py-2 text-sm text-amber-50">
              英语 / 日语 / 韩语
            </span>
          </div>
          <h2 className="mt-6 max-w-3xl font-display text-5xl leading-tight text-white sm:text-6xl">
            把课程、练习、反馈与社群整合成一个真正能坚持下去的学习闭环。
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            平台从首次注册开始建立学习画像，自动推荐分级课程与训练任务，并在每次完成学习后更新你的成长曲线。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:translate-y-[-1px]"
            >
              立即注册体验
            </Link>
            <Link
              to="/path"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white transition hover:bg-white/10"
            >
              查看推荐路径
            </Link>
          </div>
        </motion.article>

        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="rounded-[36px] border border-white/10 bg-slate-950/35 p-6"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-amber-100/55">今日学习画像</p>
          {loading || !snapshot ? (
            <div className="mt-5 space-y-4">
              <div className="h-24 animate-pulse rounded-3xl bg-white/10" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/10" />
              <div className="h-24 animate-pulse rounded-3xl bg-white/10" />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">目标</p>
                <p className="mt-2 text-lg text-white">{snapshot.user.learningGoal}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">当前等级</p>
                <p className="mt-2 font-display text-4xl text-white">{snapshot.user.currentLevel}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">今日建议</p>
                <p className="mt-2 text-base leading-7 text-slate-200">{snapshot.recommendation.focus}</p>
              </div>
            </div>
          )}
        </motion.aside>
      </section>

      <section className="mt-16">
        <SectionTitle
          eyebrow="Core Capabilities"
          title="围绕学习效率与坚持动力设计的六大能力"
          description="所有核心功能都围绕真实语言学习路径打造，避免模块孤立、反馈滞后和动力断层。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * index }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        <article className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/60">路径一体化</p>
          <h3 className="mt-3 text-2xl text-white">从注册目标到今日任务自动生成</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            平台在注册阶段采集目标语言、等级和学习节奏，自动生成首周课程、复习和训练组合。
          </p>
        </article>
        <article className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/60">训练即反馈</p>
          <h3 className="mt-3 text-2xl text-white">每一次练习都回流到能力画像</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            词汇、语法、听说成绩实时沉淀，推荐系统会基于薄弱项生成新的复习链路。
          </p>
        </article>
        <article className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/60">社群驱动</p>
          <h3 className="mt-3 text-2xl text-white">通过成就和交流让学习真正持续</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            学习打卡、经验徽章、学习小组与讨论帖共同构成长期留存与成长激励体系。
          </p>
        </article>
      </section>
    </MainLayout>
  )
}
