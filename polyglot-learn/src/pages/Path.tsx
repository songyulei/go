import { ArrowRight, BrainCircuit, Flame, NotebookTabs, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MainLayout } from '@/components/layout/MainLayout'
import { usePlatformSnapshot } from '@/hooks/usePlatformSnapshot'

const iconMap = {
  course: NotebookTabs,
  practice: Sparkles,
  review: BrainCircuit,
  community: Flame,
}

export default function Path() {
  const { snapshot, loading } = usePlatformSnapshot()

  return (
    <MainLayout
      title="个性化学习路径推荐"
      eyebrow="Recommendation"
      description="根据你的目标、等级、薄弱项和学习节奏，为今天与本周自动生成学习路径。"
    >
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[34px] border border-white/10 bg-white/6 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">推荐逻辑</p>
          {loading || !snapshot ? (
            <div className="mt-6 space-y-4">
              <div className="h-20 animate-pulse rounded-[24px] bg-white/10" />
              <div className="h-20 animate-pulse rounded-[24px] bg-white/10" />
              <div className="h-20 animate-pulse rounded-[24px] bg-white/10" />
            </div>
          ) : (
            <>
              <h2 className="mt-4 text-3xl text-white">{snapshot.recommendation.focus}</h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">{snapshot.recommendation.coachTip}</p>
              <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm text-slate-400">当前薄弱项</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {snapshot.recommendation.weakPoints.map((point) => (
                    <span key={point} className="rounded-full bg-rose-200/10 px-3 py-2 text-sm text-rose-100">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </article>

        <article className="rounded-[34px] border border-white/10 bg-slate-950/35 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">今日任务链</p>
              <h2 className="mt-4 text-3xl text-white">推荐路径时间轴</h2>
            </div>
            <Link to="/practice" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:bg-white/10">
              进入训练
            </Link>
          </div>
          <div className="mt-8 space-y-4">
            {loading || !snapshot
              ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[24px] bg-white/10" />)
              : snapshot.recommendation.tasks.map((task, index) => {
                  const Icon = iconMap[task.type]

                  return (
                    <div key={task.id} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-amber-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Step {index + 1}</p>
                        <h3 className="mt-2 text-xl text-white">{task.title}</h3>
                        <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-300">
                          <span>{task.durationMinutes} 分钟</span>
                          <span className="inline-flex items-center gap-2 text-cyan-100">
                            立即开始
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
          </div>
        </article>
      </section>
    </MainLayout>
  )
}
