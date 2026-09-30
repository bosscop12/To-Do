import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'

const PRI = {
  low: { label: 'ต่ำ', cls: 'pri-low' },
  medium: { label: 'ปานกลาง', cls: 'pri-medium' },
  high: { label: 'สูง', cls: 'pri-high' },
}
const FILTERS = [
  ['all', 'ทั้งหมด'],
  ['active', 'ยังไม่เสร็จ'],
  ['done', 'เสร็จแล้ว'],
]

function TodoItem({ t, onToggle, onDelete, onEdit, onPriority }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(t.text)
  const ref = useRef(null)

  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  const save = () => {
    const v = val.trim()
    if (v) onEdit(t.id, v)
    else setVal(t.text)
    setEditing(false)
  }
  const cycle = () => {
    const keys = Object.keys(PRI)
    onPriority(t.id, keys[(keys.indexOf(t.priority) + 1) % keys.length])
  }

  return (
    <li
      className={'item flex items-center gap-3 px-4 py-3 border-b ' + (t.removing ? 'out' : '')}
      style={{ borderColor: 'var(--line)' }}
    >
      <button
        onClick={() => onToggle(t.id)}
        aria-label="ทำเครื่องหมายเสร็จ"
        className="w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center text-white"
        style={{
          borderColor: t.done ? 'var(--accent)' : 'var(--muted)',
          background: t.done ? 'var(--accent)' : 'transparent',
        }}
      >
        {t.done && <Check size={14} />}
      </button>

      {editing ? (
        <input
          ref={ref}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') {
              setVal(t.text)
              setEditing(false)
            }
          }}
          className="flex-1 min-w-0 border-b outline-none py-0.5"
          style={{ borderColor: 'var(--accent)' }}
        />
      ) : (
        <span
          onDoubleClick={() => {
            setVal(t.text)
            setEditing(true)
          }}
          title="ดับเบิลคลิกเพื่อแก้ไข"
          className="flex-1 min-w-0 break-words select-none cursor-text"
          style={{
            textDecoration: t.done ? 'line-through' : 'none',
            color: t.done ? 'var(--muted)' : 'var(--text)',
          }}
        >
          {t.text}
        </span>
      )}

      <button
        onClick={cycle}
        title="เปลี่ยนความสำคัญ"
        className={'text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ' + PRI[t.priority].cls}
      >
        {PRI[t.priority].label}
      </button>
      <button
        onClick={() => onDelete(t.id)}
        aria-label="ลบ"
        className="p-1.5 rounded-lg hover:text-red-500 shrink-0"
        style={{ color: 'var(--muted)' }}
      >
        <Trash2 size={18} />
      </button>
    </li>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ซื้อของเข้าบ้าน', done: false, priority: 'medium' },
    { id: 2, text: 'ส่งรายงานให้หัวหน้า', done: false, priority: 'high' },
    { id: 3, text: 'อ่านหนังสือ 20 หน้า', done: true, priority: 'low' },
  ])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const nextId = useRef(4)

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((ts) => [{ id: nextId.current++, text: v, done: false, priority }, ...ts])
    setText('')
  }
  const toggle = (id) => setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const edit = (id, v) => setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, text: v } : t)))
  const setPri = (id, p) => setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, priority: p } : t)))
  const del = (id) => {
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((ts) => ts.filter((t) => t.id !== id)), 250)
  }
  const clearDone = () => {
    setTodos((ts) => ts.map((t) => (t.done ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((ts) => ts.filter((t) => !t.done)), 250)
  }

  const remaining = todos.filter((t) => !t.done).length
  const doneCount = todos.filter((t) => t.done).length
  const shown = todos.filter((t) => filter === 'all' || (filter === 'active' ? !t.done : t.done))
  const emptyMsg = {
    all: 'ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย',
    active: 'ไม่มีงานที่ค้างอยู่ 🎉',
    done: 'ยังไม่มีงานที่เสร็จ',
  }[filter]

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-5">รายการสิ่งที่ต้องทำ</h1>

      <div className="card p-3 sm:p-4 mb-4 flex flex-col sm:flex-row gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="เพิ่มงานใหม่..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border outline-none focus:ring-2"
          style={{ borderColor: 'var(--line)' }}
        />
        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 sm:flex-none px-2 py-2 rounded-lg border outline-none"
            style={{ borderColor: 'var(--line)' }}
          >
            {Object.entries(PRI).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={add}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-white font-medium"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={18} /> เพิ่ม
          </button>
        </div>
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
              <TodoItem key={t.id} t={t} onToggle={toggle} onDelete={del} onEdit={edit} onPriority={setPri} />
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
        ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · แตะป้ายความสำคัญเพื่อเปลี่ยนระดับ
      </p>
    </div>
  )
}
