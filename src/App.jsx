import { useState, useEffect } from 'react'
import { Plus, ArrowUpDown, AlertTriangle, Calendar, X, Sun, Moon } from 'lucide-react'
import Sidebar from './components/Sidebar'
import KanbanBoard from './components/KanbanBoard'
import TaskModal from './components/TaskModal'
import Dashboard from './components/Dashboard'
import { loadClients, saveClients, loadTasks, saveTasks, generateId } from './data/storage'

const SORT_OPTIONS = [
  { value: 'default', label: 'Výchozí řazení' },
  { value: 'priority', label: 'Podle priority' },
  { value: 'dueDate', label: 'Podle termínu' },
]

const PRIORITY_ORDER = { 'Vysoká': 0, 'Střední': 1, 'Nízká': 2 }

function advanceDueDate(dueDate, recurrence) {
  if (!dueDate) return dueDate
  const d = new Date(dueDate)
  if (recurrence === 'Týdenní') {
    d.setDate(d.getDate() + 7)
  } else if (recurrence === 'Měsíční') {
    d.setMonth(d.getMonth() + 1)
  }
  return d.toISOString().slice(0, 10)
}

function sortTasks(tasks, sortBy) {
  if (sortBy === 'priority') {
    return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  }
  if (sortBy === 'dueDate') {
    return [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }
  return tasks
}

export default function App() {
  const [clients, setClients] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [sortBy, setSortBy] = useState('default')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('ppc_dark') === 'true'
  })

  useEffect(() => {
    setClients(loadClients())
    setTasks(loadTasks())
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('ppc_dark', darkMode)
  }, [darkMode])

  function handleSaveClients(updated) {
    setClients(updated)
    saveClients(updated)
  }

  function handleAddClient(name) {
    const updated = [...clients, { id: generateId(), name }]
    handleSaveClients(updated)
  }

  function handleRenameClient(id, name) {
    const updated = clients.map(c => c.id === id ? { ...c, name } : c)
    handleSaveClients(updated)
  }

  function handleSaveTask(form) {
    let taskData = { ...form }
    if (form.status === 'Hotovo' && taskData.recurrence && taskData.recurrence !== 'Jednorázový') {
      taskData = { ...taskData, status: 'K řešení', dueDate: advanceDueDate(taskData.dueDate, taskData.recurrence) }
    }
    let updated
    if (editingTask) {
      updated = tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t)
    } else {
      updated = [...tasks, { ...taskData, id: generateId() }]
    }
    setTasks(updated)
    saveTasks(updated)
    setModalOpen(false)
    setEditingTask(null)
  }

  function handleDeleteTask(id) {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)
    saveTasks(updated)
  }

  function handleDeleteAllByStatus(status) {
    const updated = tasks.filter(t => t.status !== status)
    setTasks(updated)
    saveTasks(updated)
  }

  function handleStatusChange(id, newStatus) {
    const updated = tasks.map(t => {
      if (t.id !== id) return t
      if (newStatus === 'Hotovo' && t.recurrence && t.recurrence !== 'Jednorázový') {
        return { ...t, status: 'K řešení', dueDate: advanceDueDate(t.dueDate, t.recurrence) }
      }
      return { ...t, status: newStatus }
    })
    setTasks(updated)
    saveTasks(updated)
  }

  function openNew() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  const filteredTasks = tasks.filter(t => {
    if (selectedClient && t.clientId !== selectedClient) return false
    if (dateFrom && t.dueDate && t.dueDate < dateFrom) return false
    if (dateTo && t.dueDate && t.dueDate > dateTo) return false
    if ((dateFrom || dateTo) && !t.dueDate) return false
    return true
  })

  const dateFilterActive = dateFrom || dateTo
  const sortedTasks = sortTasks(filteredTasks, sortBy)

  const overdueCount = filteredTasks.filter(t => {
    if (!t.dueDate || t.status === 'Hotovo' || t.status === 'Probíhá') return false
    return new Date(t.dueDate) < new Date(new Date().toDateString())
  }).length

  const clientName = selectedClient
    ? clients.find(c => c.id === selectedClient)?.name
    : 'Všichni klienti'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar
        clients={clients}
        selectedClient={selectedClient}
        onSelectClient={setSelectedClient}
        onAddClient={handleAddClient}
        onRenameClient={handleRenameClient}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{clientName}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm text-slate-500 dark:text-slate-400">{filteredTasks.length} úkolů celkem</span>
              {overdueCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {overdueCount} po termínu
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtr termínu */}
            <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 ${dateFilterActive ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'}`}>
              <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${dateFilterActive ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-400'}`} />
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                title="Termín od"
                className="text-sm text-slate-600 dark:text-slate-300 outline-none bg-transparent w-32 dark:[color-scheme:dark]"
              />
              <span className="text-slate-300 dark:text-slate-500 text-sm">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                title="Termín do"
                className="text-sm text-slate-600 dark:text-slate-300 outline-none bg-transparent w-32 dark:[color-scheme:dark]"
              />
              {dateFilterActive && (
                <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Řazení */}
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-300" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm text-slate-600 dark:text-slate-100 outline-none bg-transparent dark:[color-scheme:dark]"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(d => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              title={darkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Nový úkol
            </button>
          </div>
        </div>

        <Dashboard tasks={filteredTasks} />

        {/* Board */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <KanbanBoard
            tasks={sortedTasks}
            clients={clients}
            onEdit={openEdit}
            onDelete={handleDeleteTask}
            onDeleteAll={handleDeleteAllByStatus}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          clients={clients}
          onSave={handleSaveTask}
          onClose={() => { setModalOpen(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}
