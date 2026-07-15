interface SectionTitleProps {
  eyebrow: string
  title: string
  description: string
}

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-100/55">{eyebrow}</p>
      <h2 className="font-display text-3xl text-white sm:text-4xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
    </div>
  )
}
