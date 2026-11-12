// Práce s daty ve formátu YYYY-MM-DD v místním čase (bez posunů kvůli UTC a letnímu času).

export function parseDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO() {
  return toISODate(new Date())
}

export function addDaysISO(str, days) {
  const d = parseDate(str)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function addMonthsISO(str, months) {
  const d = parseDate(str)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, lastDay))
  return toISODate(d)
}

export function advanceDueDate(dueDate, recurrence) {
  if (!dueDate) return dueDate
  if (recurrence === 'Týdenní') return addDaysISO(dueDate, 7)
  if (recurrence === 'Měsíční') return addMonthsISO(dueDate, 1)
  return dueDate
}

export function isOverdue(task) {
  return !!task.dueDate && !task.archived && task.dueDate < todayISO()
}

export function formatShort(str) {
  const d = parseDate(str)
  if (!d) return null
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })
}

export function formatLong(str) {
  const d = parseDate(str)
  if (!d) return null
  return d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
