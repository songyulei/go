interface MetricCardProps {
  label: string
  value: string
  delta: string
}

export function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <article className="rounded-[26px] border border-white/10 bg-slate-950/30 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 font-display text-4xl text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-emerald-300">{delta}</p>
    </article>
  )
}
