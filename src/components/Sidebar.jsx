import { Users, Plus, Briefcase, Pencil, Check, X } from 'lucide-react'
import { useState } from 'react'
import { getClientColor } from '../data/clientColors'

export default function Sidebar({ clients, selectedClient, onSelectClient, onAddClient, onRenameClient }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    onAddClient(newName.trim())
    setNewName('')
    setAdding(false)
  }

  function startEdit(client, e) {
    e.stopPropagation()
    setEditingId(client.id)
    setEditName(client.name)
  }

  function confirmEdit(e) {
    e.preventDefault()
    if (!editName.trim()) return
    onRenameClient(editingId, editName.trim())
    setEditingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  return (
    <aside className="w-60 min-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Freelance Manager</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">Klienti</p>

        <button
          onClick={() => onSelectClient(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
            selectedClient === null
              ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Všichni klienti
        </button>

        {clients.map(client => (
          <div key={client.id} className="group relative mb-0.5">
            {editingId === client.id ? (
              <form onSubmit={confirmEdit} className="flex items-center gap-1 px-2 py-1">
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="flex-1 text-sm border border-indigo-300 dark:border-indigo-600 rounded px-2 py-1 outline-none focus:border-indigo-400 min-w-0 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
                <button type="submit" className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => onSelectClient(client.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  selectedClient === client.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getClientColor(clients, client.id).dot}`} />
                <span className="truncate flex-1">{client.name}</span>
                <span
                  role="button"
                  onClick={e => startEdit(client, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity flex-shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                </span>
              </button>
            )}
          </div>
        ))}

        {adding ? (
          <form onSubmit={handleAdd} className="mt-2 px-2">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Název klienta"
              className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 mb-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
            <div className="flex gap-1">
              <button type="submit" className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                Přidat
              </button>
              <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Zrušit
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mt-1"
          >
            <Plus className="w-4 h-4" />
            Přidat klienta
          </button>
        )}
      </nav>
    </aside>
  )
}
