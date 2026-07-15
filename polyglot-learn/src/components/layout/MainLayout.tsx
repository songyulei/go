import type { ReactNode } from 'react'
import { Globe, GraduationCap, Languages, Sparkles, Trophy } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { languages } from '@/data/platformData'
import { usePlatformStore } from '@/store/usePlatformStore'

const navItems = [
  { to: '/', label: '首页', icon: Globe },
  { to: '/learn', label: '课程', icon: GraduationCap },
  { to: '/practice', label: '训练', icon: Languages },
  { to: '/dashboard', label: '进度', icon: Sparkles },
  { to: '/community', label: '社区', icon: Trophy },
]

interface MainLayoutProps {
  title: string
  eyebrow: string
  description: string
  children: ReactNode
}

export function MainLayout({ title, eyebrow, description, children }: MainLayoutProps) {
  const { selectedLanguage, setLanguage, user, dailyCompletion } = usePlatformStore()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(253,186,116,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.12),_transparent_26%),linear-gradient(180deg,_#07111f_0%,_#09172d_48%,_#0d1d33_100%)] text-stone-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-10 pt-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-amber-200 via-rose-200 to-cyan-200 text-slate-900 shadow-xl shadow-amber-500/20"
              >
                <Languages className="h-7 w-7" />
              </Link>
              <div>
                <p className="font-display text-xs uppercase tracking-[0.45em] text-amber-100/75">
                  Polyglot Atelier
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-300">{description}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => setLanguage(language.code)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      selectedLanguage === language.code
                        ? 'border-white/20 bg-white text-slate-900'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {language.nativeName}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-full border border-amber-200/20 bg-amber-100/10 px-4 py-2 text-sm text-amber-50">
                <span className="font-medium">{user.name}</span>
                <span className="text-amber-100/70">今日完成 {dailyCompletion}%</span>
              </div>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? 'bg-white text-slate-950 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/5 text-slate-200 hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? 'border-white bg-white text-slate-950'
                    : 'border-white/15 bg-transparent text-slate-200 hover:bg-white/10'
                }`
              }
            >
              登录 / 注册
            </NavLink>
          </nav>
        </header>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-100/60">{eyebrow}</p>
        </div>

        <main className="mt-4 flex-1">{children}</main>
      </div>
    </div>
  )
}
