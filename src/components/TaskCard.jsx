import { useEffect, useRef, useState } from 'react'
import { Calendar, Pencil, Trash2, AlertCircle, Repeat, Check, ListChecks, AlignLeft, ArrowRightLeft } from 'lucide-react'
import { getClientColor, getColor } from '../data/clientColors'
import { isOverdue, formatShort, todayISO } from '../data/dates'

const PRIORITY_STYLES = {
  'Vysoká': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  'Střední': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  'Nízká': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

// Barva okraje zaškrtávacího kolečka podle priority
const PRIORITY_RING = {
  'Vysoká': 'border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30',
  'Střední': 'border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30',
  'Nízká': 'border-slate-300 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700',
}

// Jak dlouho zůstane odškrtnutý úkol přeškrtnutý na nástěnce, než odejde do archivu
const ARCHIVE_DELAY_MS = 1200

export function CompleteCheckbox({ checked, priority, onToggle, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={e => { e.stopPropagation(); onToggle() }}
      onMouseDown={e => e.stopPropagation()}
      className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'bg-green-500 border-green-500' : PRIORITY_RING[priority] || PRIORITY_RING['Nízká']
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </button>
  )
}

export default function TaskCard({ task, clients, columns = [], onEdit, onDelete, onComplete, onMove }) {
  const [checked, setChecked] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const moveRef = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    if (!moveOpen) return
    function handle(e) {
      if (moveRef.current && !moveRef.current.contains(e.target)) setMoveOpen(false)
    }
    document.addEventListener('pointerdown', handle)
    return () => document.removeEventListener('pointerdown', handle)
  }, [moveOpen])
  // Časovač má volat vždy aktuální verzi funkce (s aktuálními daty z App)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })
  useEffect(() => () => clearTimeout(timer.current), [])

  function toggle() {
    if (checked) {
      clearTimeout(timer.current)
      setChecked(false)
    } else {
      setChecked(true)
      timer.current = setTimeout(() => {
        onCompleteRef.current(task.id)
        // Opakovaný úkol na nástěnce zůstává (s dalším termínem), proto zaškrtnutí zrušíme
        setChecked(false)
      }, ARCHIVE_DELAY_MS)
    }
  }

  const overdue = !checked && isOverdue(task)
  const dueToday = task.dueDate === todayISO()
  const client = clients.find(c => c.id === task.clientId)
  const clientColor = getClientColor(clients, task.clientId)
  const checklist = task.checklist || []
  const checklistDone = checklist.filter(i => i.done).length

  return (
    <div
      onClick={() => onEdit(task)}
      className={`rounded-xl border shadow-sm p-3.5 group transition-all hover:shadow-md cursor-pointer select-none ${
        checked ? 'opacity-60' : ''
      } ${
        overdue
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <CompleteCheckbox
          checked={checked}
          priority={task.priority}
          onToggle={toggle}
          title={checked ? 'Vrátit' : 'Označit jako splněné (přesune se do archivu)'}
        />
        <h3 className={`flex-1 min-w-0 text-sm font-medium leading-snug break-words transition-colors ${
          checked
            ? 'line-through text-slate-400 dark:text-slate-500'
            : overdue ? 'text-red-800 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'
        }`}>
          {task.title}
        </h3>
        {/* Mobil: přesun do jiného sloupce (přetahování na dotykovém displeji nefunguje) */}
        {columns.length > 1 && (
          <div ref={moveRef} className="relative md:hidden flex-shrink-0 -mt-1 -mr-1.5">
            <button
              title="Přesunout do sloupce"
              onClick={e => { e.stopPropagation(); setMoveOpen(o => !o) }}
              className="p-1.5 rounded-lg text-slate-400 active:bg-slate-100 dark:active:bg-slate-700"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            {moveOpen && (
              <div
                onClick={e => e.stopPropagation()}
                className="absolute right-0 top-8 z-30 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5"
              >
                <p className="text-[11px] font-medium text-slate-400 px-3 pt-1 pb-1.5">Přesunout do</p>
                {columns.map(col => (
                  <button
                    key={col.id}
                    disabled={col.id === task.columnId}
                    onClick={() => { setMoveOpen(false); onMove(task.id, col.id) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left rounded-lg text-slate-700 dark:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 disabled:opacity-40"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getColor(col.color).dot}`} />
                    <span className="truncate flex-1">{col.name}</span>
                    {col.id === task.columnId && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="hidden md:flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 -mt-0.5 -mr-1">
          <button
            title="Upravit"
            onClick={e => { e.stopPropagation(); onEdit(task) }}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            title="Smazat"
            onClick={e => { e.stopPropagation(); onDelete(task) }}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-7 line-clamp-2 ${checked ? 'line-through' : ''}`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 mt-2.5 ml-7 flex-wrap">
        {client && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium truncate max-w-[130px] ${clientColor.solid}`}>
            {client.name}
          </span>
        )}

        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>

        {task.recurrence && task.recurrence !== 'Jednorázový' && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
            <Repeat className="w-3 h-3" />
            {task.recurrence}
          </span>
        )}

        {checklist.length > 0 && (
          <span
            title="Podúkoly"
            className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
              checklistDone === checklist.length
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            {checklistDone}/{checklist.length}
          </span>
        )}

        {task.description && !checklist.length && (
          <AlignLeft className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" title="Má popis" />
        )}

        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ml-auto px-2 py-0.5 rounded-full font-medium border ${
            overdue
              ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
              : dueToday
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
          }`}>
            {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {dueToday ? 'Dnes' : formatShort(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}
