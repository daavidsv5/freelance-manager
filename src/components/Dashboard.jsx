import { ClipboardList, Loader2, CheckCircle2, AlertTriangle, ListTodo } from 'lucide-react'

const today = new Date(new Date().toDateString())

export default function Dashboard({ tasks }) {
  const total = tasks.length
  const todo = tasks.filter(t => t.status === 'K řešení').length
  const inProgress = tasks.filter(t => t.status === 'Probíhá').length
  const done = tasks.filter(t => t.status === 'Hotovo').length
  const overdue = tasks.filter(t => t.dueDate && t.status !== 'Hotovo' && t.status !== 'Probíhá' && new Date(t.dueDate) < today).length

  const donePercent = total > 0 ? Math.round((done / total) * 100) : 0

  const stats = [
    {
      label: 'Celkem úkolů',
      value: total,
      icon: ListTodo,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-700',
      border: 'border-slate-200 dark:border-slate-600',
    },
    {
      label: 'K řešení',
      value: todo,
      icon: ClipboardList,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-50 dark:bg-slate-700/50',
      border: 'border-slate-200 dark:border-slate-600',
    },
    {
      label: 'Probíhá',
      value: inProgress,
      icon: Loader2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Hotovo',
      value: done,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
    },
    {
      label: 'Po termínu',
      value: overdue,
      icon: AlertTriangle,
      color: overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500',
      bg: overdue > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-700/50',
      border: overdue > 0 ? 'border-red-200 dark:border-red-800' : 'border-slate-200 dark:border-slate-600',
    },
  ]

  return (
    <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
      <div className="flex items-center gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${s.bg} ${s.border} flex-1`}
            >
              <div className={`${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mb-0.5">{s.label}</p>
                <p className={`text-xl font-bold leading-none ${s.color}`}>{s.value}</p>
              </div>
            </div>
          )
        })}

        {/* Progress bar */}
        <div className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">Dokončeno</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{donePercent} %</p>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 dark:bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${donePercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
