import { X, Plus, Check, Archive, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { generateId } from '../data/storage'

const EMPTY_TASK = {
  title: '',
  description: '',
  clientId: '',
  priority: 'Střední',
  dueDate: '',
  columnId: '',
  recurrence: 'Jednorázový',
  checklist: [],
}

const field = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
const label = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1'

export default function TaskModal({ task, defaults, clients, columns, onSave, onDelete, onClose }) {
  // Modal se při každém otevření připojí znovu, stačí tedy počáteční stav
  const [form, setForm] = useState(() =>
    task ? { ...EMPTY_TASK, ...task } : { ...EMPTY_TASK, columnId: columns[0]?.id || '', ...defaults }
  )
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function addItem() {
    const text = newItem.trim()
    if (!text) return
    set('checklist', [...form.checklist, { id: generateId(), text, done: false }])
    setNewItem('')
  }

  function toggleItem(id) {
    set('checklist', form.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function editItem(id, text) {
    set('checklist', form.checklist.map(i => i.id === id ? { ...i, text } : i))
  }

  function removeItem(id) {
    set('checklist', form.checklist.filter(i => i.id !== id))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    // Rozepsaný podúkol, který uživatel nepotvrdil Enterem, také uložíme
    const pending = newItem.trim()
    const checklist = [
      ...form.checklist.filter(i => i.text.trim()),
      ...(pending ? [{ id: generateId(), text: pending, done: false }] : []),
    ]
    onSave({ ...form, title: form.title.trim(), checklist })
  }

  const doneCount = form.checklist.filter(i => i.done).length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch md:items-center justify-center z-50 md:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 md:rounded-2xl shadow-xl w-full md:max-w-lg h-full md:h-auto md:max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 md:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 md:py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {task ? 'Upravit úkol' : 'Nový úkol'}
            {task?.archived && (
              <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 rounded-full px-2 py-0.5">
                <Archive className="w-3 h-3" /> v archivu
              </span>
            )}
          </h2>
          <button onClick={onClose} className="p-2 md:p-1 -mr-1 md:mr-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 md:px-6 pt-5 flex flex-col gap-4 overflow-y-auto flex-1 md:flex-initial">
          <div>
            <label className={label}>Název úkolu *</label>
            <input
              autoFocus={!task && window.matchMedia('(min-width: 768px)').matches}
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="např. Optimalizace Google Ads kampaně"
              className={field}
            />
          </div>

          <div>
            <label className={label}>Popis</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Detaily k úkolu, poznámky…"
              rows={3}
              className={`${field} resize-none`}
            />
          </div>

          {/* Podúkoly */}
          <div>
            <label className={label}>
              Podúkoly {form.checklist.length > 0 && <span className="text-slate-400">({doneCount}/{form.checklist.length})</span>}
            </label>
            {form.checklist.length > 0 && (
              <ul className="flex flex-col gap-1 mb-2">
                {form.checklist.map(item => (
                  <li key={item.id} className="group flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        item.done ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-500 hover:border-green-400'
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>
                    <input
                      value={item.text}
                      onChange={e => editItem(item.id, e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                      className={`flex-1 min-w-0 text-sm bg-transparent outline-none border-b border-transparent focus:border-slate-300 dark:focus:border-slate-600 py-0.5 ${
                        item.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="md:opacity-0 md:group-hover:opacity-100 p-1.5 md:p-0.5 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                placeholder="Přidat podúkol a Enter"
                className="flex-1 text-sm bg-transparent outline-none border-b border-slate-200 dark:border-slate-600 focus:border-indigo-400 py-1 text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Klient</label>
              <select value={form.clientId} onChange={e => set('clientId', e.target.value)} className={field}>
                <option value="">— bez klienta —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Priorita</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={field}>
                <option>Nízká</option>
                <option>Střední</option>
                <option>Vysoká</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Termín</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className={`${field} dark:[color-scheme:dark]`}
              />
            </div>

            <div>
              <label className={label}>Sloupec</label>
              <select value={form.columnId} onChange={e => set('columnId', e.target.value)} className={field}>
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Opakování</label>
            <select value={form.recurrence || 'Jednorázový'} onChange={e => set('recurrence', e.target.value)} className={field}>
              <option>Jednorázový</option>
              <option>Týdenní</option>
              <option>Měsíční</option>
            </select>
            {form.recurrence !== 'Jednorázový' && (
              <p className="text-[11px] text-slate-400 mt-1">
                Po odškrtnutí se splněný úkol uloží do archivu a na nástěnce se objeví znovu s dalším termínem.
              </p>
            )}
          </div>

          <div className="sticky bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] mt-auto bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 md:border-0 flex gap-3">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                title="Smazat úkol"
                className="p-2.5 border border-slate-300 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
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
