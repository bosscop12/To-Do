import { useState, useRef, useEffect } from 'react'
import { Trash2, Check, CalendarDays } from 'lucide-react'
import { PRI, CATS, dueStatus, formatDue } from './helpers.js'

export default function TodoItem({ t, onToggle, onDelete, onEdit, onPriority, onCategory, onDue }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(t.text)
  const ref = useRef(null)
  const dateRef = useRef(null)

  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  const save = () => {
    const v = val.trim()
    if (v) onEdit(t.id, v)
    else setVal(t.text)
    setEditing(false)
  }
  const cycle = (map, cur) => {
    const keys = Object.keys(map)
    return keys[(keys.indexOf(cur) + 1) % keys.length]
  }
  const openPicker = () => {
    const el = dateRef.current
    if (!el) return
    if (el.showPicker) el.showPicker()
    else el.focus()
  }

  const status = dueStatus(t)
  const dueCls = { over: 'due-over', today: 'due-today', future: 'due-future' }[status] || 'due-future'
  const dueText =
    status === 'over' ? `เกินกำหนด · ${formatDue(t.due)}` : status === 'today' ? 'วันนี้' : t.due ? formatDue(t.due) : 'ตั้งวันที่'

  return (
    <li className={'item px-4 py-3 border-b ' + (t.removing ? 'out' : '')} style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center gap-3">
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
          onClick={() => onDelete(t.id)}
          aria-label="ลบ"
          className="p-1.5 rounded-lg hover:text-red-500 shrink-0"
          style={{ color: 'var(--muted)' }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-2 pl-8">
        <button
          onClick={() => onPriority(t.id, cycle(PRI, t.priority))}
          title="เปลี่ยนความสำคัญ"
          className={'text-xs font-medium px-2.5 py-1 rounded-full ' + PRI[t.priority].cls}
        >
          {PRI[t.priority].label}
        </button>
        <button
          onClick={() => onCategory(t.id, cycle(CATS, t.category))}
          title="เปลี่ยนหมวดหมู่"
          className="cat-tag text-xs font-medium px-2.5 py-1 rounded-full"
        >
          {CATS[t.category]}
        </button>
        <span className="relative">
          <button
            onClick={openPicker}
            title="เปลี่ยนวันที่กำหนดส่ง"
            className={'text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ' + dueCls}
          >
            <CalendarDays size={12} /> {dueText}
          </button>
          <input
            ref={dateRef}
            type="date"
            value={t.due || ''}
            onChange={(e) => onDue(t.id, e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute left-0 bottom-0 w-0 h-0 opacity-0 pointer-events-none"
          />
        </span>
      </div>
    </li>
  )
}
