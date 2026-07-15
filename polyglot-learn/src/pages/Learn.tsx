import { BookCopy, CheckCircle2, Clock3, LockOpen } from 'lucide-react'

import { MainLayout } from '@/components/layout/MainLayout'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { usePlatformSnapshot } from '@/hooks/usePlatformSnapshot'

export default function Learn() {
  const { snapshot, loading } = usePlatformSnapshot()

  return (
    <MainLayout
      title="分级课程学习"
      eyebrow="Courses"
      description="为英语、日语、韩语构建清晰的分级学习路径，覆盖章节、目标和课后巩固。"
    >
      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="rounded-[34px] border border-white/10 bg-white/6 p-6">
          <SectionTitle
            eyebrow="Course Logic"
            title="课程不是列表，而是持续解锁的语言旅程。"
            description="系统按目标语言展示当前可学等级和下一阶段课程，并把课程进度与训练反馈联动。"
          />
          <div className="mt-8 space-y-4">
            {loading || !snapshot ? (
              <>
                <div className="h-28 animate-pulse rounded-[26px] bg-white/10" />
                <div className="h-28 animate-pulse rounded-[26px] bg-white/10" />
              </>
            ) : (
              snapshot.courseLevels.map((course) => (
                <article key={course.id} className="rounded-[26px] border border-white/10 bg-slate-950/30 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{course.levelCode}</p>
                      <h3 className="mt-2 text-xl text-white">{course.title}</h3>
                    </div>
                    {course.unlocked ? (
                      <span className="rounded-full bg-emerald-200/10 px-3 py-2 text-sm text-emerald-200">
                        <LockOpen className="mr-2 inline h-4 w-4" />
                        已解锁
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{course.description}</p>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-300" style={{ width: `${course.progress}%` }} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.focus.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </aside>

        <div className="space-y-6">
          <article className="rounded-[34px] border border-white/10 bg-slate-950/40 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">章节体验</p>
            <h3 className="mt-4 text-3xl text-white">N4 场景语法与高频表达</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <BookCopy className="h-5 w-5 text-amber-100" />
                <p className="mt-3 text-sm text-slate-400">本章目标</p>
                <p className="mt-2 text-white">掌握助词辨析与服务场景表达</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <Clock3 className="h-5 w-5 text-amber-100" />
                <p className="mt-3 text-sm text-slate-400">预计时长</p>
                <p className="mt-2 text-white">28 分钟 + 10 分钟巩固</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 text-sm text-slate-400">课后输出</p>
                <p className="mt-2 text-white">自动跳转语法训练与口语跟读</p>
              </div>
            </div>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">课件内容示例</p>
              <p className="mt-3 text-base leading-8 text-slate-200">
                本节通过“便利店购物”和“餐厅点单”两个场景，解释「は」「が」「を」在真实会话中的区别，并配合例句、发音和随堂题帮助用户快速内化。
              </p>
            </div>
          </article>

          <article className="rounded-[34px] border border-white/10 bg-white/6 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">学习辅助</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm text-slate-400">课前提示</p>
                <p className="mt-3 text-white">系统会根据近 7 天错题记录，在本章前插入 3 分钟的复习热身。</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-slate-950/30 p-5">
                <p className="text-sm text-slate-400">课后动作</p>
                <p className="mt-3 text-white">完成课程后自动推荐语法专项 + 一段情景跟读，形成输入输出闭环。</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </MainLayout>
  )
}
