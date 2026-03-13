import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

const EMPTY_TASK = {
  title: '',
  description: '',
  clientId: '',
  priority: 'Střední',
  dueDate: '',
  status: 'K řešení',
  recurrence: 'Jednorázový',
}

export default function TaskModal({ task, clients, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_TASK)

  useEffect(() => {
    if (task) {
      setForm({ ...EMPTY_TASK, ...task })
    } else {
      setForm(EMPTY_TASK)
    }
  }, [task])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {task ? 'Upravit úkol' : 'Nový úkol'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Název úkolu *</label>
            <input
              autoFocus
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="např. Optimalizace Google Ads kampaně"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Popis</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Detaily k úkolu, poznámky..."
              rows={3}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 dark:focus:ring-indigo-900 resize-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Klient</label>
              <select
                value={form.clientId}
                onChange={e => set('clientId', e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="">— bez klienta —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Priorita</label>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option>Nízká</option>
                <option>Střední</option>
                <option>Vysoká</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Termín</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 dark:[color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option>K řešení</option>
                <option>Probíhá</option>
                <option>Hotovo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Opakování</label>
            <select
              value={form.recurrence || 'Jednorázový'}
              onChange={e => set('recurrence', e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <option>Jednorázový</option>
              <option>Týdenní</option>
              <option>Měsíční</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white text-sm py-2.5 rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              {task ? 'Uložit změny' : 'Přidat úkol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
