import { Headphones, Languages, Mic, SpellCheck2 } from 'lucide-react'

import { MainLayout } from '@/components/layout/MainLayout'
import { usePlatformSnapshot } from '@/hooks/usePlatformSnapshot'

const iconMap = {
  vocabulary: Languages,
  grammar: SpellCheck2,
  speaking: Mic,
  listening: Headphones,
}

export default function Practice() {
  const { snapshot, loading } = usePlatformSnapshot()

  return (
    <MainLayout
      title="互动式学习模块"
      eyebrow="Practice Lab"
      description="把单词记忆、语法练习、口语跟读与听力训练整合到同一个练习中台。"
    >
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {loading || !snapshot
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-[30px] bg-white/10" />
              ))
            : snapshot.practiceModules.map((module) => {
                const Icon = iconMap[module.id]

                return (
                  <article key={module.id} className="rounded-[30px] border border-white/10 bg-white/6 p-6 backdrop-blur-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${module.completedToday ? 'bg-emerald-200/10 text-emerald-200' : 'bg-amber-200/10 text-amber-100'}`}>
                        {module.completedToday ? '今日已完成' : '待训练'}
                      </span>
                    </div>
                    <h2 className="mt-5 text-2xl text-white">{module.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{module.description}</p>
                    <div className="mt-5 rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                      <p className="text-sm text-slate-400">推荐原因</p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{module.recommendedReason}</p>
                    </div>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-sm text-slate-400">准确率</p>
                        <p className="mt-2 font-display text-4xl text-white">{module.accuracy}%</p>
                      </div>
                      <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                        开始 {module.duration}
                      </button>
                    </div>
                  </article>
                )
              })}
        </div>

        <aside className="space-y-6">
          <article className="rounded-[34px] border border-white/10 bg-slate-950/35 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">训练流设计</p>
            <h3 className="mt-4 text-3xl text-white">让练习更像连贯任务，而不是碎片化刷题。</h3>
            <ol className="mt-6 space-y-4">
              <li className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">1. 先做单词与语法热身，帮助大脑恢复上下文。</li>
              <li className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">2. 再进入听力和口语跟读，完成“输入 + 输出”的沉浸闭环。</li>
              <li className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">3. 系统自动记录错词、错误结构与发音建议，用于下一次推荐。</li>
            </ol>
          </article>

          <article className="rounded-[34px] border border-white/10 bg-white/6 p-6">
            <p className="text-sm text-slate-400">口语跟读预览</p>
            <div className="mt-4 rounded-[26px] border border-dashed border-cyan-200/30 bg-cyan-100/5 p-5">
              <p className="text-base text-white">标准句：すみません、これをお願いします。</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                原型中提供音频播放、录音按钮和发音得分展示位，后续可对接真实语音评测服务。
              </p>
              <div className="mt-4 flex gap-3">
                <button type="button" className="rounded-full bg-white px-4 py-2 text-sm text-slate-950">播放示范</button>
                <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white">开始录音</button>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </MainLayout>
  )
}
