import type { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  meta?: string
}

export function FeatureCard({ icon: Icon, title, description, meta }: FeatureCardProps) {
  return (
    <article className="group rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-lg transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-100">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      {meta ? <p className="mt-4 text-xs uppercase tracking-[0.25em] text-cyan-100/55">{meta}</p> : null}
    </article>
  )
}
