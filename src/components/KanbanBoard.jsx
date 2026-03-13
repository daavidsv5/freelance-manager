import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import TaskCard from './TaskCard'

const COLUMNS = [
  { id: 'K řešení', label: 'K řešení', color: 'bg-slate-400' },
  { id: 'Probíhá', label: 'Probíhá', color: 'bg-blue-400' },
  { id: 'Hotovo', label: 'Hotovo', color: 'bg-green-400' },
]

export default function KanbanBoard({ tasks, clients, onEdit, onDelete, onDeleteAll, onStatusChange }) {
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c.name]))
  const [dragOverCol, setDragOverCol] = useState(null)
  const [draggingId, setDraggingId] = useState(null)

  function getTasksByStatus(status) {
    return tasks.filter(t => t.status === status)
  }

  function handleDragStart(e, taskId) {
    setDraggingId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('taskId', taskId)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverCol(null)
  }

  function handleDragOver(e, colId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  function handleDrop(e, colId) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) onStatusChange(taskId, colId)
    setDragOverCol(null)
    setDraggingId(null)
  }

  return (
    <div className="grid grid-cols-3 gap-5 h-full">
      {COLUMNS.map(col => {
        const colTasks = getTasksByStatus(col.id)
        const isOver = dragOverCol === col.id
        return (
          <div
            key={col.id}
            className="flex flex-col min-h-0"
            onDragOver={e => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{col.label}</h2>
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 rounded-full px-2 py-0.5">
                {colTasks.length}
              </span>
              {col.id === 'Hotovo' && colTasks.length > 0 && (
                <button
                  onClick={() => onDeleteAll('Hotovo')}
                  className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-0.5 rounded-lg transition-colors"
                  title="Smazat všechny hotové úkoly"
                >
                  <Trash2 className="w-3 h-3" />
                  Smazat vše
                </button>
              )}
            </div>

            <div className={`flex flex-col gap-3 overflow-y-auto pb-4 flex-1 rounded-xl transition-colors px-1 py-1 -mx-1 -my-1 ${
              isOver ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-300 dark:ring-indigo-700' : ''
            }`}>
              {colTasks.length === 0 && !isOver && (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-8 text-center text-xs text-slate-400 dark:text-slate-600">
                  Žádné úkoly
                </div>
              )}
              {isOver && colTasks.length === 0 && (
                <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl py-8 text-center text-xs text-indigo-400">
                  Přetáhni sem
                </div>
              )}
              {colTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`transition-opacity ${draggingId === task.id ? 'opacity-40' : 'opacity-100'}`}
                >
                  <TaskCard
                    task={task}
                    clientName={clientMap[task.clientId]}
                    clients={clients}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    alwaysShowDelete={col.id === 'Hotovo'}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
