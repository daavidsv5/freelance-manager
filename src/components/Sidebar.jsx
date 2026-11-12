import { Users, Plus, Briefcase, Pencil, Trash2, LayoutGrid, Archive, Download, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { getColor, nextFreeColor } from '../data/clientColors'
import ColorPicker from './ColorPicker'

function ClientForm({ initialName = '', initialColor, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), color)
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={e => e.key === 'Escape' && onCancel()}
      className="mx-1 my-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50"
    >
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Název klienta"
        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
      />
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5 mb-1.5">Barva štítku</p>
      <ColorPicker value={color} onChange={setColor} size="sm" />
      <div className="flex gap-1 mt-3">
        <button type="submit" className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
          Zrušit
        </button>
      </div>
    </form>
  )
}

function NavButton({ active, onClick, icon, children, badge }) {
  const Icon = icon
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2.5 md:py-2 rounded-lg text-sm mb-0.5 transition-colors ${
        active
          ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left">{children}</span>
      {badge > 0 && (
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">{badge}</span>
      )}
    </button>
  )
}

export default function Sidebar({
  clients, tasks, view, onChangeView, selectedClient, onSelectClient,
  onAddClient, onUpdateClient, onDeleteClient, onExport, onImport, open, onClose,
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const fileRef = useRef(null)

  const activeCount = id => tasks.filter(t => !t.archived && t.clientId === id).length
  const archivedCount = tasks.filter(t => t.archived && (!selectedClient || t.clientId === selectedClient)).length

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (file) onImport(file)
    e.target.value = ''
  }

  return (
    <>
    {/* Mobil: ztmavené pozadí pod vysunutým panelem */}
    <div
      onClick={onClose}
      className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    />
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] md:static md:z-auto md:w-60 md:max-w-none h-dvh bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 transition-transform duration-200 md:translate-x-0 ${
      open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
    }`}>
      <div className="px-4 py-4 md:py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex-1">Client manager</span>
          <button onClick={onClose} className="md:hidden p-1.5 -mr-1.5 rounded-lg text-slate-400 active:bg-slate-100 dark:active:bg-slate-700" title="Zavřít">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavButton active={view === 'board'} onClick={() => onChangeView('board')} icon={LayoutGrid}>
          Nástěnka
        </NavButton>
        <NavButton active={view === 'archive'} onClick={() => onChangeView('archive')} icon={Archive} badge={archivedCount}>
          Archiv
        </NavButton>

        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mt-5 mb-2">Klienti</p>

        <NavButton active={selectedClient === null} onClick={() => onSelectClient(null)} icon={Users}>
          Všichni klienti
        </NavButton>

        {clients.map(client => (
          <div key={client.id} className="group relative mb-0.5">
            {editingId === client.id ? (
              <ClientForm
                initialName={client.name}
                initialColor={client.color}
                submitLabel="Uložit"
                onSubmit={(name, color) => { onUpdateClient(client.id, { name, color }); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                onClick={() => onSelectClient(client.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 md:py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  selectedClient === client.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getColor(client.color).dot}`} />
                <span className="truncate flex-1">{client.name}</span>
                <span className="hidden md:inline text-[11px] text-slate-400 md:group-hover:hidden">{activeCount(client.id) || ''}</span>
                <span className="flex md:hidden md:group-hover:flex items-center gap-0.5 flex-shrink-0">
                  <button
                    title="Upravit klienta"
                    onClick={e => { e.stopPropagation(); setEditingId(client.id); setAdding(false) }}
                    className="p-1.5 md:p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    title="Smazat klienta"
                    onClick={e => { e.stopPropagation(); onDeleteClient(client) }}
                    className="p-1.5 md:p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
        ))}

        {adding ? (
          <ClientForm
            initialColor={nextFreeColor(clients)}
            submitLabel="Přidat"
            onSubmit={(name, color) => { onAddClient(name, color); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => { setAdding(true); setEditingId(null) }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mt-1"
          >
            <Plus className="w-4 h-4" />
            Přidat klienta
          </button>
        )}
      </nav>

      <div className="px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-slate-700">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">Záloha dat</p>
        <div className="flex gap-1">
          <button
            onClick={onExport}
            title="Stáhnout všechna data jako soubor JSON"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Stáhnout
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            title="Nahrát data ze zálohy (nahradí současná data)"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 py-1.5 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Nahrát
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </aside>
    </>
  )
}
