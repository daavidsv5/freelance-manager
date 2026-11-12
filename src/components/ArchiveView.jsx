import { Archive, RotateCcw, Trash2, Calendar } from 'lucide-react'
import { getClientColor } from '../data/clientColors'
import { CompleteCheckbox } from './TaskCard'
import { todayISO, addDaysISO, toISODate, formatLong, formatShort } from '../data/dates'

function groupLabel(dateISO) {
  const today = todayISO()
  if (dateISO === today) return 'Dnes'
  if (dateISO === addDaysISO(today, -1)) return 'Včera'
  const long = formatLong(dateISO)
  return long.charAt(0).toUpperCase() + long.slice(1)
}

export default function ArchiveView({ tasks, clients, onRestore, onDelete, onOpen, onClear }) {
  const sorted = [...tasks].sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))

  const groups = []
  for (const task of sorted) {
    const key = task.completedAt ? toISODate(new Date(task.completedAt)) : 'neznámé'
    const last = groups[groups.length - 1]
    if (last?.key === key) last.tasks.push(task)
    else groups.push({ key, tasks: [task] })
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 dark:text-slate-500">
        <Archive className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">Archiv je prázdný</p>
        <p className="text-xs mt-1 max-w-xs">Úkol se sem přesune, když ho na nástěnce odškrtnete jako splněný.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Odškrtnutím vrátíte úkol zpět na nástěnku. Kliknutím na úkol ho otevřete.
        </p>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" /> Vysypat archiv
        </button>
      </div>

      {groups.map(group => (
        <section key={group.key} className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {group.key === 'neznámé' ? 'Bez data splnění' : groupLabel(group.key)}
            <span className="ml-2 font-normal normal-case tracking-normal">{group.tasks.length}</span>
          </h3>
          <ul className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
            {group.tasks.map(task => {
              const client = clients.find(c => c.id === task.clientId)
              return (
                <li
                  key={task.id}
                  onClick={() => onOpen(task)}
                  className="group flex items-center gap-3 px-3 md:px-4 py-3 md:py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40"
                >
                  <CompleteCheckbox checked priority={task.priority} onToggle={() => onRestore(task.id)} title="Vrátit na nástěnku" />
                  <span className="flex-1 min-w-0 text-sm line-through text-slate-400 dark:text-slate-500 truncate">{task.title}</span>
                  {client && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium truncate max-w-[100px] md:max-w-[140px] opacity-80 ${getClientColor(clients, task.clientId).solid}`}>
                      {client.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap" title="Původní termín">
                      <Calendar className="w-3 h-3" /> {formatShort(task.dueDate)}
                    </span>
                  )}
                  <span className="hidden md:flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      title="Vrátit na nástěnku"
                      onClick={e => { e.stopPropagation(); onRestore(task.id) }}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Smazat natrvalo"
                      onClick={e => { e.stopPropagation(); onDelete(task) }}
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
