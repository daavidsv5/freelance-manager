import { ListTodo, AlertTriangle, CalendarClock, CalendarDays, CheckCircle2 } from 'lucide-react'
import { todayISO, addDaysISO, parseDate, toISODate } from '../data/dates'

function startOfWeekISO() {
  const d = new Date()
  const day = (d.getDay() + 6) % 7 // pondělí = 0
  d.setDate(d.getDate() - day)
  return toISODate(d)
}

export default function Dashboard({ tasks, archived }) {
  const today = todayISO()
  const in7 = addDaysISO(today, 7)
  const weekStart = startOfWeekISO()
  const weekEnd = addDaysISO(weekStart, 6)

  const active = tasks.length
  const overdue = tasks.filter(t => t.dueDate && t.dueDate < today).length
  const dueToday = tasks.filter(t => t.dueDate === today).length
  const dueSoon = tasks.filter(t => t.dueDate && t.dueDate > today && t.dueDate <= in7).length
  const completedAt = t => (t.completedAt ? toISODate(new Date(t.completedAt)) : null)
  const done7 = archived.filter(t => completedAt(t) && completedAt(t) > addDaysISO(today, -7)).length

  // Plán týdne: splněné od pondělí / (splněné od pondělí + aktivní s termínem do neděle)
  const doneThisWeek = archived.filter(t => completedAt(t) && completedAt(t) >= weekStart).length
  const plannedLeft = tasks.filter(t => t.dueDate && t.dueDate <= weekEnd).length
  const weekTotal = doneThisWeek + plannedLeft
  const weekPercent = weekTotal > 0 ? Math.round((doneThisWeek / weekTotal) * 100) : 0

  const stats = [
    { label: 'Aktivní úkoly', value: active, icon: ListTodo, tone: 'neutral' },
    { label: 'Po termínu', value: overdue, icon: AlertTriangle, tone: overdue > 0 ? 'red' : 'muted' },
    { label: 'Termín dnes', value: dueToday, icon: CalendarClock, tone: dueToday > 0 ? 'amber' : 'muted' },
    { label: 'Dalších 7 dní', value: dueSoon, icon: CalendarDays, tone: 'blue' },
    { label: 'Splněno za 7 dní', value: done7, icon: CheckCircle2, tone: 'green' },
  ]

  const TONES = {
    neutral: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600',
    muted: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  }

  const weekLabel = `${parseDate(weekStart).getDate()}. až ${parseDate(weekEnd).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}`

  return (
    <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
      <div className="flex items-center gap-4">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border flex-1 ${TONES[s.tone]}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mb-0.5 whitespace-nowrap">{s.label}</p>
                <p className="text-xl font-bold leading-none">{s.value}</p>
              </div>
            </div>
          )
        })}

        <div
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
          title="Splněné úkoly od pondělí oproti všem úkolům s termínem do neděle"
        >
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Týden {weekLabel}</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{doneThisWeek} z {weekTotal}</p>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 dark:bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${weekPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
