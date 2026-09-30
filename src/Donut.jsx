export default function Donut({ segments, size = 96, stroke = 14, center }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0)
  let offset = 0

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label="สัดส่วนสถานะงาน">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        {total > 0 &&
          segments.map((s) => {
            if (s.value === 0) return null
            const len = (s.value / total) * c
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray .3s, stroke-dashoffset .3s' }}
              />
            )
            offset += len
            return el
          })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{center}</div>
    </div>
  )
}
