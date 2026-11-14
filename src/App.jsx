import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowUpDown, AlertTriangle, Calendar, X, Sun, Moon, Search, Undo2, Menu, SlidersHorizontal } from 'lucide-react'
import Sidebar from './components/Sidebar'
import KanbanBoard from './components/KanbanBoard'
import TaskModal from './components/TaskModal'
import Dashboard from './components/Dashboard'
import ArchiveView from './components/ArchiveView'
import ConfirmDialog from './components/ConfirmDialog'
import TodoView from './components/TodoView'
import { loadState, saveState, generateId, exportBackup, parseBackup } from './data/storage'
import { nextFreeColor } from './data/clientColors'
import { advanceDueDate, isOverdue, toISODate } from './data/dates'

const SORT_OPTIONS = [
  { value: 'default', label: 'Vlastní pořadí' },
  { value: 'priority', label: 'Podle priority' },
  { value: 'dueDate', label: 'Podle termínu' },
]

const PRIORITY_ORDER = { 'Vysoká': 0, 'Střední': 1, 'Nízká': 2 }

function sortTasks(tasks, sortBy) {
  if (sortBy === 'priority') {
    return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }
  if (sortBy === 'dueDate') {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  }
  return tasks
}

const plural = (n, one, few, many) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

export default function App() {
  const [initial] = useState(loadState)
  const [clients, setClients] = useState(initial.clients)
  const [columns, setColumns] = useState(initial.columns)
  const [tasks, setTasks] = useState(initial.tasks)
  const [todo, setTodo] = useState(initial.todo)

  const [view, setView] = useState('board') // 'board' | 'archive' | 'todo'
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedList, setSelectedList] = useState(null) // id seznamu v To do listu, null = všechny
  const [focusNewList, setFocusNewList] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // { task } nebo { defaults }
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ppc_dark') === 'true')

  // Ukládání do localStorage při každé změně
  useEffect(() => {
    saveState({ clients, columns, tasks, todo })
  }, [clients, columns, tasks, todo])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('ppc_dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = useCallback((message, undo) => setToast({ id: generateId(), message, undo }), [])
  const closeModal = useCallback(() => setModal(null), [])
  const closeConfirm = useCallback(() => setConfirm(null), [])
  const clearFocusNewList = useCallback(() => setFocusNewList(false), [])

  // ---------------------------------------------------------------- Klienti
  function handleAddClient(name, color) {
    setClients(prev => [...prev, { id: generateId(), name, color }])
  }

  function handleUpdateClient(id, patch) {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)))
  }

  function handleDeleteClient(client) {
    const count = tasks.filter(t => !t.archived && t.clientId === client.id).length
    setConfirm({
      title: `Smazat klienta „${client.name}“?`,
      message: count
        ? `Klient má ${count} ${plural(count, 'aktivní úkol', 'aktivní úkoly', 'aktivních úkolů')}. Úkoly zůstanou na nástěnce bez klienta.`
        : 'Klient nemá žádné aktivní úkoly.',
      confirmLabel: 'Smazat klienta',
      onConfirm: () => {
        setClients(prev => prev.filter(c => c.id !== client.id))
        setTasks(prev => prev.map(t => (t.clientId === client.id ? { ...t, clientId: '' } : t)))
        if (selectedClient === client.id) setSelectedClient(null)
      },
    })
  }

  // ---------------------------------------------------------------- Sloupce
  function handleAddColumn(name) {
    setColumns(prev => [...prev, { id: generateId(), name, color: nextFreeColor(prev) }])
  }

  function handleUpdateColumn(id, patch) {
    setColumns(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)))
  }

  function handleMoveColumn(id, dir) {
    setColumns(prev => {
      const i = prev.findIndex(c => c.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function handleDeleteColumn(column) {
    if (columns.length <= 1) return
    const target = columns.find(c => c.id !== column.id)
    const count = tasks.filter(t => !t.archived && t.columnId === column.id).length
    setConfirm({
      title: `Smazat sloupec „${column.name}“?`,
      message: count
        ? `Ve sloupci ${plural(count, 'je', 'jsou', 'je')} ${count} ${plural(count, 'úkol', 'úkoly', 'úkolů')}. Přesunou se do sloupce „${target.name}“.`
        : 'Sloupec je prázdný.',
      confirmLabel: 'Smazat sloupec',
      onConfirm: () => {
        setTasks(prev => prev.map(t => (t.columnId === column.id ? { ...t, columnId: target.id } : t)))
        setColumns(prev => prev.filter(c => c.id !== column.id))
      },
    })
  }

  // ---------------------------------------------------------------- Úkoly
  function handleSaveTask(form) {
    if (modal?.task) {
      setTasks(prev => prev.map(t => (t.id === modal.task.id ? { ...t, ...form } : t)))
    } else {
      setTasks(prev => [...prev, { ...form, id: generateId(), archived: false, completedAt: null }])
    }
    setModal(null)
  }

  function handleQuickAdd(columnId, title) {
    setTasks(prev => [...prev, {
      id: generateId(), title, description: '', clientId: selectedClient || '', priority: 'Střední',
      dueDate: '', columnId, recurrence: 'Jednorázový', checklist: [], archived: false, completedAt: null,
    }])
  }

  // Přesun úkolu (drag & drop): do sloupce columnId, před úkol beforeId (null = na konec)
  function handleMoveTask(taskId, columnId, beforeId) {
    if (taskId === beforeId) return
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId)
      if (!task) return prev
      const rest = prev.filter(t => t.id !== taskId)
      const moved = { ...task, columnId }
      let index = beforeId ? rest.findIndex(t => t.id === beforeId) : -1
      if (index === -1) index = rest.length
      rest.splice(index, 0, moved)
      return rest
    })
  }

  // Odškrtnutí: úkol jde do archivu. Opakovaný úkol se zároveň vrátí s dalším termínem.
  function handleCompleteTask(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const completedAt = new Date().toISOString()
    const recurring = task.recurrence && task.recurrence !== 'Jednorázový'
    const copyId = recurring ? generateId() : null

    setTasks(prev => {
      if (!recurring) return prev.map(t => (t.id === id ? { ...t, archived: true, completedAt } : t))
      const archivedCopy = { ...task, id: copyId, archived: true, completedAt }
      const next = {
        ...task,
        dueDate: advanceDueDate(task.dueDate, task.recurrence),
        columnId: columns[0]?.id || task.columnId,
        checklist: (task.checklist || []).map(i => ({ ...i, done: false })),
      }
      return [...prev.map(t => (t.id === id ? next : t)), archivedCopy]
    })

    showToast(
      recurring ? `„${task.title}“ splněno, další termín je naplánován` : `„${task.title}“ přesunuto do archivu`,
      () => setTasks(prev => prev.filter(t => t.id !== copyId).map(t => (t.id === id ? task : t)))
    )
  }

  function handleRestoreTask(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const columnId = columns.some(c => c.id === t.columnId) ? t.columnId : columns[0]?.id
      return { ...t, archived: false, completedAt: null, columnId }
    }))
    showToast('Úkol vrácen na nástěnku')
  }

  function handleDeleteTask(task) {
    const index = tasks.findIndex(t => t.id === task.id)
    setTasks(prev => prev.filter(t => t.id !== task.id))
    showToast(`„${task.title}“ smazáno`, () =>
      setTasks(prev => {
        const next = [...prev]
        next.splice(Math.min(index, next.length), 0, task)
        return next
      })
    )
  }

  function handleClearArchive() {
    const toRemove = tasks.filter(t => t.archived && (!selectedClient || t.clientId === selectedClient))
    if (!toRemove.length) return
    const clientLabel = selectedClient ? ` klienta ${clients.find(c => c.id === selectedClient)?.name}` : ''
    setConfirm({
      title: 'Vysypat archiv?',
      message: `Natrvalo se smaže ${toRemove.length} ${plural(toRemove.length, 'splněný úkol', 'splněné úkoly', 'splněných úkolů')}${clientLabel}. Tuto akci nelze vrátit.`,
      confirmLabel: 'Smazat natrvalo',
      onConfirm: () => {
        const ids = new Set(toRemove.map(t => t.id))
        setTasks(prev => prev.filter(t => !ids.has(t.id)))
      },
    })
  }

  // ---------------------------------------------------------------- To do list
  const updateList = (id, fn) => setTodo(prev => prev.map(l => (l.id === id ? fn(l) : l)))

  function handleAddList(name, color) {
    const id = generateId()
    setTodo(prev => [...prev, { id, name, color: color || nextFreeColor(prev), doneOpen: true, items: [] }])
    return id
  }

  function handleUpdateList(id, patch) {
    updateList(id, l => ({ ...l, ...patch }))
  }

  function handleDeleteList(list) {
    const count = list.items.length
    setConfirm({
      title: `Smazat seznam „${list.name}“?`,
      message: count
        ? `Seznam obsahuje ${count} ${plural(count, 'bod', 'body', 'bodů')}, smažou se spolu s ním.`
        : 'Seznam je prázdný.',
      confirmLabel: 'Smazat seznam',
      onConfirm: () => {
        const index = todo.findIndex(l => l.id === list.id)
        setTodo(prev => prev.filter(l => l.id !== list.id))
        if (selectedList === list.id) setSelectedList(null)
        showToast(`Seznam „${list.name}“ smazán`, () =>
          setTodo(prev => {
            const next = [...prev]
            next.splice(Math.min(index, next.length), 0, list)
            return next
          })
        )
      },
    })
  }

  function handleAddItems(listId, texts) {
    const items = texts.map(text => ({ id: generateId(), text, done: false, doneAt: null }))
    updateList(listId, l => ({ ...l, items: [...l.items, ...items] }))
  }

  function handleUpdateItem(listId, itemId, patch) {
    updateList(listId, l => ({ ...l, items: l.items.map(i => (i.id === itemId ? { ...i, ...patch } : i)) }))
  }

  function handleToggleItem(listId, itemId) {
    updateList(listId, l => ({
      ...l,
      items: l.items.map(i => (i.id === itemId ? { ...i, done: !i.done, doneAt: i.done ? null : new Date().toISOString() } : i)),
    }))
  }

  // silent = bez upozornění (prázdný bod smazaný po vymazání textu)
  function handleDeleteItem(listId, item, silent = false) {
    const list = todo.find(l => l.id === listId)
    const index = list ? list.items.findIndex(i => i.id === item.id) : -1
    updateList(listId, l => ({ ...l, items: l.items.filter(i => i.id !== item.id) }))
    if (silent || !item.text.trim()) return
    showToast(`„${item.text}“ smazáno`, () =>
      updateList(listId, l => {
        const items = [...l.items]
        items.splice(index < 0 ? items.length : Math.min(index, items.length), 0, item)
        return { ...l, items }
      })
    )
  }

  function handleClearDone(listId) {
    const list = todo.find(l => l.id === listId)
    if (!list) return
    const removed = list.items.filter(i => i.done)
    if (!removed.length) return
    const before = list.items
    updateList(listId, l => ({ ...l, items: l.items.filter(i => !i.done) }))
    showToast(`${removed.length} ${plural(removed.length, 'hotový bod smazán', 'hotové body smazány', 'hotových bodů smazáno')}`, () =>
      updateList(listId, l => {
        // vrátí původní pořadí, body přidané mezitím zůstanou na konci
        const known = new Set(before.map(i => i.id))
        return { ...l, items: [...before, ...l.items.filter(i => !known.has(i.id))] }
      })
    )
  }

  // Přetažení bodu: ze seznamu fromId do seznamu toId, před bod beforeId (null = za poslední nehotový)
  function handleMoveItem(fromId, itemId, toId, beforeId) {
    if (itemId === beforeId) return
    setTodo(prev => {
      const item = prev.find(l => l.id === fromId)?.items.find(i => i.id === itemId)
      if (!item) return prev
      return prev.map(l => {
        let items = l.id === fromId ? l.items.filter(i => i.id !== itemId) : l.items
        if (l.id === toId) {
          items = [...items]
          let index = beforeId ? items.findIndex(i => i.id === beforeId) : -1
          if (index === -1) index = items.map(i => i.done).lastIndexOf(false) + 1
          items.splice(index, 0, item)
        }
        return items === l.items ? l : { ...l, items }
      })
    })
  }

  function handleNewList() {
    setView('todo')
    setSelectedList(null)
    setFocusNewList(true)
  }

  // ---------------------------------------------------------------- Záloha
  function handleExport() {
    exportBackup({ clients, columns, tasks, todo })
  }

  function handleImport(file) {
    file.text().then(text => {
      let data
      try {
        data = parseBackup(text)
      } catch (err) {
        setConfirm({ title: 'Zálohu nejde načíst', message: err.message, confirmLabel: 'Rozumím', danger: false, onConfirm: () => {} })
        return
      }
      setConfirm({
        title: 'Nahrát data ze zálohy?',
        message: `Záloha obsahuje ${data.clients.length} klientů, ${data.columns.length} sloupců, ${data.tasks.length} úkolů${data.todo ? ` a ${data.todo.length} seznamů v To do listu` : ''}.\nSoučasná data se nahradí${data.todo ? '' : ' (seznamy v To do listu zůstanou, záloha je neobsahuje)'}. Doporučujeme si je nejdřív stáhnout.`,
        confirmLabel: 'Nahradit data',
        onConfirm: () => {
          setClients(data.clients)
          setColumns(data.columns)
          setTasks(data.tasks)
          if (data.todo) { setTodo(data.todo); setSelectedList(null) }
          setSelectedClient(null)
          showToast('Data ze zálohy nahrána')
        },
      })
    })
  }

  // ---------------------------------------------------------------- Filtry
  const clientNames = Object.fromEntries(clients.map(c => [c.id, c.name]))
  const query = search.trim().toLowerCase()

  function matchesSearch(t) {
    if (!query) return true
    return [t.title, t.description, clientNames[t.clientId], ...(t.checklist || []).map(i => i.text)]
      .some(v => v && v.toLowerCase().includes(query))
  }

  function matchesDate(dateStr) {
    if (!dateFrom && !dateTo) return true
    if (!dateStr) return false
    if (dateFrom && dateStr < dateFrom) return false
    if (dateTo && dateStr > dateTo) return false
    return true
  }

  const byClientAndSearch = tasks.filter(t => (!selectedClient || t.clientId === selectedClient) && matchesSearch(t))
  const activeTasks = byClientAndSearch.filter(t => !t.archived)
  const archivedTasks = byClientAndSearch.filter(t => t.archived)
  const boardTasks = sortTasks(activeTasks.filter(t => matchesDate(t.dueDate)), sortBy)
  const archiveList = archivedTasks.filter(t => matchesDate(t.completedAt ? toISODate(new Date(t.completedAt)) : ''))

  const overdueCount = activeTasks.filter(isOverdue).length
  const dateFilterActive = dateFrom || dateTo
  const clientName = selectedClient ? clientNames[selectedClient] : 'Všichni klienti'
  const isTodo = view === 'todo'
  const currentList = isTodo && selectedList ? todo.find(l => l.id === selectedList) : null
  const todoScope = currentList ? [currentList] : todo
  const todoOpen = todoScope.reduce((n, l) => n + l.items.filter(i => !i.done).length, 0)
  const todoDone = todoScope.reduce((n, l) => n + l.items.filter(i => i.done).length, 0)

  const searchBox = (
    <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 min-w-0 ${query ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'}`}>
      <Search className={`w-3.5 h-3.5 flex-shrink-0 ${query ? 'text-indigo-500' : 'text-slate-400'}`} />
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && setSearch('')}
        placeholder={isTodo ? 'Hledat v seznamech…' : 'Hledat úkol…'}
        className="text-sm text-slate-600 dark:text-slate-200 outline-none bg-transparent flex-1 min-w-0 md:w-40 md:flex-none placeholder-slate-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )

  const dateFilter = (
    <div
      title={view === 'board' ? 'Filtr podle termínu' : 'Filtr podle data splnění'}
      className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${dateFilterActive ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'}`}
    >
      <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${dateFilterActive ? 'text-indigo-500' : 'text-slate-400'}`} />
      <input
        type="date"
        value={dateFrom}
        onChange={e => setDateFrom(e.target.value)}
        className="text-sm text-slate-600 dark:text-slate-300 outline-none bg-transparent flex-1 min-w-0 md:w-32 md:flex-none dark:[color-scheme:dark]"
      />
      <span className="text-slate-300 dark:text-slate-500 text-sm">–</span>
      <input
        type="date"
        value={dateTo}
        onChange={e => setDateTo(e.target.value)}
        className="text-sm text-slate-600 dark:text-slate-300 outline-none bg-transparent flex-1 min-w-0 md:w-32 md:flex-none dark:[color-scheme:dark]"
      />
      {dateFilterActive && (
        <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )

  const sortSelect = view === 'board' && (
    <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700">
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300 flex-shrink-0" />
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        className="text-sm text-slate-600 dark:text-slate-100 outline-none bg-transparent flex-1 md:flex-none dark:[color-scheme:dark]"
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )

  const filtersActive = dateFilterActive || sortBy !== 'default'
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        clients={clients}
        tasks={tasks}
        view={view}
        onChangeView={v => { setView(v); closeSidebar() }}
        selectedClient={selectedClient}
        onSelectClient={id => { setSelectedClient(id); if (view === 'todo') setView('board'); closeSidebar() }}
        todo={todo}
        selectedList={selectedList}
        onSelectList={id => { setSelectedList(id); setView('todo'); closeSidebar() }}
        onAddList={handleAddList}
        onUpdateList={handleUpdateList}
        onDeleteList={handleDeleteList}
        onAddClient={handleAddClient}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Hlavička */}
        <div className="px-4 md:px-8 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 md:py-5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-700"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {isTodo ? (currentList ? currentList.name : 'To do list') : clientName}
                {view === 'archive' && <span className="text-slate-400 dark:text-slate-500 font-normal"> · Archiv</span>}
                {currentList && <span className="text-slate-400 dark:text-slate-500 font-normal"> · To do list</span>}
              </h1>
              <div className="flex items-center gap-2 md:gap-3 mt-0.5 flex-wrap">
                <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {isTodo
                    ? `${todoOpen} ${plural(todoOpen, 'bod', 'body', 'bodů')} k vyřízení · ${todoDone} ${plural(todoDone, 'hotový', 'hotové', 'hotových')}${currentList ? '' : ` · ${todo.length} ${plural(todo.length, 'seznam', 'seznamy', 'seznamů')}`}`
                    : view === 'board'
                    ? `${boardTasks.length} ${plural(boardTasks.length, 'aktivní úkol', 'aktivní úkoly', 'aktivních úkolů')}`
                    : `${archiveList.length} ${plural(archiveList.length, 'splněný úkol', 'splněné úkoly', 'splněných úkolů')}`}
                </span>
                {view === 'board' && overdueCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    <AlertTriangle className="w-3 h-3" />
                    {overdueCount} po termínu
                  </span>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {searchBox}
              {!isTodo && dateFilter}
              {sortSelect}
            </div>

            <button
              onClick={() => setDarkMode(d => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex-shrink-0"
              title={darkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => (isTodo ? handleNewList() : setModal({ defaults: { clientId: selectedClient || '' } }))}
              className="flex items-center gap-2 bg-green-600 text-white text-sm p-2 md:px-4 md:py-2 rounded-xl hover:bg-green-700 transition-colors font-medium flex-shrink-0"
              title={isTodo ? 'Nový seznam' : 'Nový úkol'}
            >
              <Plus className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline">{isTodo ? 'Nový seznam' : 'Nový úkol'}</span>
            </button>
          </div>

          {/* Mobil: hledání a filtry pod nadpisem */}
          <div className="md:hidden flex items-center gap-2 mt-3">
            <div className="flex-1 min-w-0">{searchBox}</div>
            {!isTodo && <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`relative p-2.5 rounded-lg border flex-shrink-0 ${
                filtersOpen || filtersActive
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300'
              }`}
              title="Filtry a řazení"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {filtersActive && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800" />}
            </button>}
          </div>
          {filtersOpen && !isTodo && (
            <div className="md:hidden flex flex-col gap-2 mt-2">
              {dateFilter}
              {sortSelect}
            </div>
          )}
        </div>

        {view === 'board' ? (
          <>
            <Dashboard tasks={activeTasks} archived={archivedTasks} />
            <div className="flex-1 min-h-0">
              <KanbanBoard
                columns={columns}
                tasks={boardTasks}
                clients={clients}
                onEditTask={task => setModal({ task })}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={handleCompleteTask}
                onMoveTask={handleMoveTask}
                onQuickAdd={handleQuickAdd}
                onAddColumn={handleAddColumn}
                onUpdateColumn={handleUpdateColumn}
                onMoveColumn={handleMoveColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            </div>
          </>
        ) : isTodo ? (
          <div className="flex-1 overflow-auto px-4 md:px-8 py-4 md:py-6 pb-24">
            <TodoView
              lists={todo}
              selectedListId={currentList ? currentList.id : null}
              query={query}
              focusNewList={focusNewList}
              onNewListFocused={clearFocusNewList}
              onAddList={handleAddList}
              onUpdateList={handleUpdateList}
              onDeleteList={handleDeleteList}
              onAddItems={handleAddItems}
              onUpdateItem={handleUpdateItem}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onClearDone={handleClearDone}
              onMoveItem={handleMoveItem}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto px-4 md:px-8 py-4 md:py-6">
            <ArchiveView
              tasks={archiveList}
              clients={clients}
              onRestore={handleRestoreTask}
              onDelete={handleDeleteTask}
              onOpen={task => setModal({ task })}
              onClear={handleClearArchive}
            />
          </div>
        )}
      </main>

      {modal && (
        <TaskModal
          task={modal.task}
          defaults={modal.defaults}
          clients={clients}
          columns={columns}
          onSave={handleSaveTask}
          onDelete={modal.task ? () => { handleDeleteTask(modal.task); setModal(null) } : null}
          onClose={closeModal}
        />
      )}

      {confirm && (
        <ConfirmDialog
          {...confirm}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null) }}
          onCancel={closeConfirm}
        />
      )}

      {toast && (
        <div key={toast.id} className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 bg-slate-900 dark:bg-slate-700 text-white text-sm pl-4 pr-2 py-2 rounded-xl shadow-lg max-w-[90vw]">
          <span className="truncate">{toast.message}</span>
          {toast.undo && (
            <button
              onClick={() => { toast.undo(); setToast(null) }}
              className="flex items-center gap-1 text-indigo-300 hover:text-white font-medium px-2 py-1 rounded-lg hover:bg-white/10 flex-shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" /> Vrátit
            </button>
          )}
          <button onClick={() => setToast(null)} className="p-1 text-slate-400 hover:text-white flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
