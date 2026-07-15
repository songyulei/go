import { useState } from 'react'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { MainLayout } from '@/components/layout/MainLayout'
import { languages } from '@/data/platformData'
import { saveOnboarding } from '@/services/platformService'
import { usePlatformStore } from '@/store/usePlatformStore'

const onboardingSchema = z.object({
  name: z.string().min(2, '请输入至少 2 个字符'),
  email: z.string().email('请输入有效邮箱'),
  targetLanguage: z.enum(['en', 'ja', 'ko']),
  currentLevel: z.string().min(2, '请填写当前水平'),
  dailyGoalMinutes: z.coerce.number().min(10, '建议至少 10 分钟').max(180, '请填写合理时长'),
  learningGoal: z.string().min(8, '请描述你的学习目标'),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export default function Auth() {
  const navigate = useNavigate()
  const updateUser = usePlatformStore((state) => state.updateUser)
  const [formError, setFormError] = useState('')

  const { register, handleSubmit, formState } = useForm<OnboardingValues>({
    defaultValues: {
      name: '林知远',
      email: 'learner@example.com',
      targetLanguage: 'ja',
      currentLevel: 'N4 进阶',
      dailyGoalMinutes: 35,
      learningGoal: '半年内通过 JLPT N3，并提升场景口语表达能力',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const parsed = onboardingSchema.safeParse(values)

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? '表单校验失败')
      return
    }

    setFormError('')
    const user = await saveOnboarding(parsed.data)
    updateUser(user)
    navigate('/path')
  })

  return (
    <MainLayout
      title="注册登录与学习目标初始化"
      eyebrow="Authentication"
      description="支持用户注册登录，并在首次进入时建立语言目标与学习画像。"
    >
      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="rounded-[34px] border border-white/10 bg-white/6 p-6 backdrop-blur-lg">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/55">欢迎加入</p>
          <h2 className="mt-4 font-display text-5xl text-white">把一次登录变成一条真正可执行的学习路线。</h2>
          <div className="mt-8 space-y-4">
            <div className="rounded-[26px] border border-white/10 bg-slate-950/30 p-5">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <p className="mt-3 text-lg text-white">目标驱动式注册</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">首次填写语言目标、当前水平和每日可投入时间，系统直接生成首周路径。</p>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-slate-950/30 p-5">
              <ShieldCheck className="h-5 w-5 text-amber-200" />
              <p className="mt-3 text-lg text-white">统一账号体系</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">支持邮箱、手机号和第三方登录接入，首版以前端表单与状态存储模拟完整流程。</p>
            </div>
          </div>
        </aside>

        <form onSubmit={onSubmit} className="rounded-[34px] border border-white/10 bg-slate-950/40 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">姓名</span>
              <input {...register('name')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-200/40" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">邮箱</span>
              <input {...register('email')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-200/40" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">目标语言</span>
              <select {...register('targetLanguage')} className="w-full rounded-2xl border border-white/10 bg-[#102039] px-4 py-3 text-white outline-none focus:border-cyan-200/40">
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.nativeName} / {language.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">当前水平</span>
              <input {...register('currentLevel')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-200/40" />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-slate-300">每日学习时长（分钟）</span>
              <input type="number" {...register('dailyGoalMinutes')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-200/40" />
            </label>
            <div className="rounded-[26px] border border-dashed border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">登录方式</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">原型版本展示统一账号入口，后续可扩展邮箱验证码、手机号、微信或 Google 登录。</p>
            </div>
          </div>
          <label className="mt-4 block space-y-2">
            <span className="text-sm text-slate-300">学习目标</span>
            <textarea
              {...register('learningGoal')}
              rows={5}
              className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-200/40"
            />
          </label>
          {formError ? <p className="mt-4 text-sm text-rose-300">{formError}</p> : null}
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:translate-y-[-1px] disabled:opacity-60"
          >
            {formState.isSubmitting ? '生成学习路径中...' : '注册并进入个性化路径'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </MainLayout>
  )
}
