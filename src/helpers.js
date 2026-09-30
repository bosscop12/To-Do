export const PRI = {
  low: { label: 'ต่ำ', cls: 'pri-low' },
  medium: { label: 'ปานกลาง', cls: 'pri-medium' },
  high: { label: 'สูง', cls: 'pri-high' },
}

export const CATS = {
  work: 'งาน',
  personal: 'ส่วนตัว',
  shopping: 'ช้อปปิ้ง',
  health: 'สุขภาพ',
}

export const FILTERS = [
  ['all', 'ทั้งหมด'],
  ['active', 'ยังไม่เสร็จ'],
  ['done', 'เสร็จแล้ว'],
]

// Local date as YYYY-MM-DD (avoids UTC off-by-one issues)
export function toISO(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function todayISO() {
  return toISO(new Date())
}

export function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export function formatDue(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

// 'over' | 'today' | 'future' | null
export function dueStatus(t) {
  if (!t.due) return null
  const today = todayISO()
  if (t.due === today) return 'today'
  if (t.due < today) return t.done ? 'future' : 'over'
  return 'future'
}
