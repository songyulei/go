import { Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

import { MainLayout } from '@/components/layout/MainLayout'
import { MetricCard } from '@/components/ui/MetricCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { usePlatformSnapshot } from '@/hooks/usePlatformSnapshot'

export default function Dashboard() {
  const { snapshot, loading } = usePlatformSnapshot()

  return (
    <MainLayout
      title="学习进度追踪"
      eyebrow="Dashboard"
      description="通过趋势、能力雷达与连续打卡，把学习成果持续可视化。"
    >
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading || !snapshot
            ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-[26px] bg-white/10" />)
            : snapshot.dashboardMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <article className="rounded-[34px] border border-white/10 bg-white/6 p-6">
            <SectionTitle
              eyebrow="Trend"
              title="过去 7 天学习投入与准确率"
              description="让用户直观看见投入时长与练习效果之间的关系，便于调整每日任务分配。"
            />
            <div className="mt-8 h-[320px]">
              {loading || !snapshot ? (
                <div className="h-full animate-pulse rounded-[24px] bg-white/10" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={snapshot.progressTrend}>
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis yAxisId="left" stroke="#94a3b8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#fde68a" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 20,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: '#09111f',
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="studyMinutes" stroke="#67e8f9" strokeWidth={3} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#fcd34d" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="rounded-[34px] border border-white/10 bg-slate-950/35 p-6">
            <SectionTitle
              eyebrow="Skill Profile"
              title="能力画像雷达"
              description="帮助用户识别强项与薄弱项，为下一步推荐路径提供依据。"
            />
            <div className="mt-8 h-[320px]">
              {loading || !snapshot ? (
                <div className="h-full animate-pulse rounded-[24px] bg-white/10" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={snapshot.skills}>
                    <PolarGrid stroke="rgba(255,255,255,0.16)" />
                    <PolarAngleAxis dataKey="skill" stroke="#e2e8f0" />
                    <Radar dataKey="score" stroke="#fda4af" fill="#fda4af" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </div>
      </section>
    </MainLayout>
  )
}
