import { Award, Flame, Trophy, Users2 } from 'lucide-react'

import { PostCard } from '@/components/community/PostCard'
import { MainLayout } from '@/components/layout/MainLayout'
import { usePlatformSnapshot } from '@/hooks/usePlatformSnapshot'

export default function Community() {
  const { snapshot, loading } = usePlatformSnapshot()

  return (
    <MainLayout
      title="社区交流与成就激励"
      eyebrow="Community"
      description="通过学习动态、讨论、徽章和排行榜，建立更强的坚持动力与社群归属感。"
    >
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <article className="rounded-[34px] border border-white/10 bg-white/6 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">学习小组 24 个</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">今日新增打卡 1,248</span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">热门话题 18 个</span>
            </div>
            <h2 className="mt-5 text-3xl text-white">学习不是孤岛，让每一次进步都被看见。</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              用户可以记录每日学习动态、提出问题、回复他人经验，并通过勋章、连续打卡和榜单获得即时正反馈。
            </p>
          </article>

          {loading || !snapshot
            ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-[28px] bg-white/10" />)
            : snapshot.posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>

        <aside className="space-y-6">
          <article className="rounded-[34px] border border-white/10 bg-slate-950/35 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">成就系统</p>
            <div className="mt-6 space-y-4">
              {loading || !snapshot
                ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-[24px] bg-white/10" />)
                : snapshot.achievements.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                      <p className="text-lg text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.25em] text-amber-100/70">{item.progressLabel}</p>
                    </div>
                  ))}
            </div>
          </article>

          <article className="rounded-[34px] border border-white/10 bg-white/6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <Users2 className="h-5 w-5 text-cyan-100" />
                <p className="mt-3 text-sm text-slate-400">学习小组</p>
                <p className="mt-2 text-lg text-white">口语冲刺组</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <Flame className="h-5 w-5 text-amber-100" />
                <p className="mt-3 text-sm text-slate-400">连续打卡</p>
                <p className="mt-2 text-lg text-white">16 天</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <Award className="h-5 w-5 text-emerald-300" />
                <p className="mt-3 text-sm text-slate-400">本周新徽章</p>
                <p className="mt-2 text-lg text-white">沉浸练习者</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/30 p-4">
                <Trophy className="h-5 w-5 text-rose-200" />
                <p className="mt-3 text-sm text-slate-400">小组排名</p>
                <p className="mt-2 text-lg text-white">Top 12%</p>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </MainLayout>
  )
}
