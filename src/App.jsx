import { useState, useRef } from 'react'
import { Plus, Search, X } from 'lucide-react'
import TodoItem from './TodoItem.jsx'
import Donut from './Donut.jsx'
import { PRI, CATS, FILTERS, addDays, dueStatus } from './helpers.js'

const STATUS_COLORS = { done: '#22c55e', active: '#6366f1', over: '#ef4444' }

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ซื้อของเข้าบ้าน', done: false, priority: 'medium', category: 'shopping', due: addDays(0) },
    { id: 2, text: 'ส่งรายงานให้หัวหน้า', done: false, priority: 'high', category: 'work', due: addDays(-2) },
    { id: 3, text: 'อ่านหนังสือ 20 หน้า', done: true, priority: 'low', category: 'personal', due: addDays(-1) },
    { id: 4, text: 'นัดตรวจสุขภาพประจำปี', done: false, priority: 'medium', category: 'health', due: addDays(5) },
  ])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('personal')
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const nextId = useRef(5)

  const update = (id, patch) => setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((ts) => [{ id: nextId.current++, text: v, done: false, priority, category, due }, ...ts])
    setText('')
    setDue('')
  }
  const del = (id) => {
    update(id, { removing: true })
    setTimeout(() => setTodos((ts) => ts.filter((t) => t.id !== id)), 250)
  }
  const clearDone = () => {
    setTodos((ts) => ts.map((t) => (t.done ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((ts) => ts.filter((t) => !t.done)), 250)
  }

  // Stats (over all todos)
  const total = todos.length
  const doneCount = todos.filter((t) => t.done).length
  const overCount = todos.filter((t) => dueStatus(t) === 'over').length
  const activeCount = total - doneCount - overCount
  const remaining = total - doneCount
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  const q = query.trim().toLowerCase()
  const shown = todos.filter(
    (t) =>
      (filter === 'all' || (filter === 'active' ? !t.done : t.done)) &&
      (catFilter === 'all' || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q))
  )
  const emptyMsg = q
    ? `ไม่พบงานที่ตรงกับ "${query.trim()}"`
    : { all: 'ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย', active: 'ไม่มีงานที่ค้างอยู่ 🎉', done: 'ยังไม่มีงานที่เสร็จ' }[filter]

  const catItems = [['all', 'ทั้งหมด', total], ...Object.entries(CATS).map(([k, v]) => [k, v, todos.filter((t) => t.category === k).length])]

  const legend = [
    { label: 'เสร็จแล้ว', value: doneCount, color: STATUS_COLORS.done },
    { label: 'กำลังทำ', value: activeCount, color: STATUS_COLORS.active },
    { label: 'เกินกำหนด', value: overCount, color: STATUS_COLORS.over },
  ]

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-5">รายการสิ่งที่ต้องทำ</h1>

      <div className="grid md:grid-cols-[210px_1fr] gap-4">
        {/* Sidebar */}
        <aside className="space-y-4 md:order-none">
          <nav className="card p-2 flex md:flex-col gap-1 overflow-x-auto" aria-label="หมวดหมู่">
            {catItems.map(([k, label, n]) => (
              <button
                key={k}
                onClick={() => setCatFilter(k)}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                style={{
                  background: catFilter === k ? 'var(--accent)' : 'transparent',
                  color: catFilter === k ? '#fff' : 'var(--text)',
                }}
              >
                <span>{label}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: catFilter === k ? 'rgba(255,255,255,.25)' : 'var(--line)' }}
                >
                  {n}
                </span>
              </button>
            ))}
          </nav>

          <section className="card p-4" aria-label="สถิติ">
            <h2 className="text-sm font-semibold mb-3">สถิติ</h2>
            <div className="flex items-center gap-4 md:flex-col md:items-start lg:flex-row lg:items-center">
              <Donut segments={legend} center={`${pct}%`} />
              <ul className="text-sm space-y-1 min-w-0">
                {legend.map((s) => (
                  <li key={s.label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span>{s.label}</span>
                    <span style={{ color: 'var(--muted)' }}>{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm mt-3" style={{ color: 'var(--muted)' }}>
              ทั้งหมด {total} งาน · เสร็จแล้ว {pct}%
            </p>
          </section>
        </aside>

        {/* Main */}
        <main className="min-w-0">
          <div className="card p-3 sm:p-4 mb-4 space-y-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="เพิ่มงานใหม่..."
              className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2"
              style={{ borderColor: 'var(--line)' }}
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                aria-label="ความสำคัญ"
                className="flex-1 min-w-[6rem] px-2 py-2 rounded-lg border outline-none"
                style={{ borderColor: 'var(--line)' }}
              >
                {Object.entries(PRI).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="หมวดหมู่"
                className="flex-1 min-w-[6rem] px-2 py-2 rounded-lg border outline-none"
                style={{ borderColor: 'var(--line)' }}
              >
                {Object.entries(CATS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                aria-label="วันที่กำหนดส่ง"
                className="flex-1 min-w-[9rem] px-2 py-2 rounded-lg border outline-none"
                style={{ borderColor: 'var(--line)' }}
              />
              <button
                onClick={add}
                className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-white font-medium"
                style={{ background: 'var(--accent)' }}
              >
                <Plus size={18} /> เพิ่ม
              </button>
            </div>
          </div>

          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหางาน..."
              aria-label="ค้นหางาน"
              className="card w-full pl-9 pr-9 py-2.5 outline-none focus:ring-2"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="ล้างการค้นหา"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-1 mb-3 p-1 rounded-xl card">
            {FILTERS.map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: filter === k ? 'var(--accent)' : 'transparent',
                  color: filter === k ? '#fff' : 'var(--muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            {shown.length === 0 ? (
              <p className="text-center py-10 px-4" style={{ color: 'var(--muted)' }}>{emptyMsg}</p>
            ) : (
              <ul>
                {shown.map((t) => (
                  <TodoItem
                    key={t.id}
                    t={t}
                    onToggle={(id) => update(id, { done: !t.done })}
                    onDelete={del}
                    onEdit={(id, v) => update(id, { text: v })}
                    onPriority={(id, v) => update(id, { priority: v })}
                    onCategory={(id, v) => update(id, { category: v })}
                    onDue={(id, v) => update(id, { due: v })}
                  />
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between px-4 py-3 text-sm" style={{ color: 'var(--muted)' }}>
              <span>เหลืออีก {remaining} งาน</span>
              <button onClick={clearDone} disabled={doneCount === 0} className="disabled:opacity-40 hover:underline">
                ล้างงานที่เสร็จแล้ว ({doneCount})
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
            ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · แตะป้ายความสำคัญ หมวดหมู่ หรือวันที่เพื่อเปลี่ยน
          </p>
        </main>
      </div>
    </div>
  )
}
