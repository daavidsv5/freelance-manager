import { Calendar, Pencil, Trash2, AlertCircle, Repeat } from 'lucide-react'
import { getClientColor } from '../data/clientColors'

const PRIORITY_STYLES = {
  'Vysoká': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  'Střední': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  'Nízká': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

const PRIORITY_DOT = {
  'Vysoká': 'bg-red-500',
  'Střední': 'bg-yellow-400',
  'Nízká': 'bg-slate-400',
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Hotovo' || status === 'Probíhá') return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
}

export default function TaskCard({ task, clientName, clients = [], onEdit, onDelete, alwaysShowDelete = false }) {
  const overdue = isOverdue(task.dueDate, task.status)
  const clientColor = getClientColor(clients, task.clientId)

  return (
    <div className={`rounded-xl border shadow-sm p-4 group transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing select-none ${
      overdue
        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
          <h3 className={`text-sm font-medium leading-snug break-words ${overdue ? 'text-red-800 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'}`}>
            {task.title}
          </h3>
        </div>
        <div className={`flex gap-1 transition-opacity flex-shrink-0 ${alwaysShowDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button onClick={() => onEdit(task)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-4 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-3 ml-4 flex-wrap">
        {clientName && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium truncate max-w-[120px] ${clientColor.solid}`}>
            {clientName}
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

        {task.dueDate && (
          <span className={`flex items-center gap-1 text-xs ml-auto px-2 py-0.5 rounded-full font-medium border ${
            overdue
              ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
          }`}>
            {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}
