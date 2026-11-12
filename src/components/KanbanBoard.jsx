import { useEffect, useRef, useState } from 'react'
import { Plus, MoreHorizontal, Pencil, ArrowLeft, ArrowRight, Trash2, X } from 'lucide-react'
import TaskCard from './TaskCard'
import ColorPicker from './ColorPicker'
import { getColor } from '../data/clientColors'

function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [ref, onOutside, active])
}

function ColumnMenu({ column, isFirst, isLast, canDelete, onRename, onUpdate, onMove, onDelete, onClose }) {
  const ref = useRef(null)
  useClickOutside(ref, onClose, true)
  const item = 'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  return (
    <div ref={ref} className="absolute right-0 top-8 z-30 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5">
      <button className={`${item} text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700`} onClick={() => { onRename(); onClose() }}>
        <Pencil className="w-3.5 h-3.5" /> Přejmenovat
      </button>
      <button disabled={isFirst} className={`${item} text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700`} onClick={() => onMove(column.id, -1)}>
        <ArrowLeft className="w-3.5 h-3.5" /> Posunout doleva
      </button>
      <button disabled={isLast} className={`${item} text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700`} onClick={() => onMove(column.id, 1)}>
        <ArrowRight className="w-3.5 h-3.5" /> Posunout doprava
      </button>
      <div className="px-3 pt-2 pb-2.5 border-y border-slate-100 dark:border-slate-700 my-1">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Barva sloupce</p>
        <ColorPicker size="sm" value={column.color} onChange={color => onUpdate(column.id, { color })} />
      </div>
      <button
        disabled={!canDelete}
        title={canDelete ? '' : 'Poslední sloupec nejde smazat'}
        className={`${item} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30`}
        onClick={() => { onDelete(column); onClose() }}
      >
        <Trash2 className="w-3.5 h-3.5" /> Smazat sloupec
      </button>
    </div>
  )
}

function InlineInput({ placeholder, initial = '', onSubmit, onCancel, keepOpen = false, submitOnBlur = false, className = '' }) {
  const [value, setValue] = useState(initial)
  function submit(e) {
    e?.preventDefault()
    const v = value.trim()
    if (!v) return onCancel()
    onSubmit(v)
    if (keepOpen) setValue('')
  }
  return (
    <form onSubmit={submit} className={className}>
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && onCancel()}
        onBlur={() => { if (!value.trim()) onCancel(); else if (submitOnBlur) submit() }}
        placeholder={placeholder}
        className="w-full text-sm border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400"
      />
    </form>
  )
}

function Column({
  column, tasks, clients, index, columnCount, dropTarget, setDropTarget, draggingId, setDraggingId,
  onMoveTask, onEditTask, onDeleteTask, onCompleteTask, onQuickAdd,
  onUpdateColumn, onMoveColumn, onDeleteColumn,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [quickAdd, setQuickAdd] = useState(false)
  const isTarget = dropTarget?.columnId === column.id

  function handleCardDragOver(e, taskIndex) {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const after = e.clientY > rect.top + rect.height / 2
    const beforeId = after ? (tasks[taskIndex + 1]?.id ?? null) : tasks[taskIndex].id
    if (dropTarget?.columnId !== column.id || dropTarget?.beforeId !== beforeId) {
      setDropTarget({ columnId: column.id, beforeId })
    }
  }

  function handleColumnDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isTarget) setDropTarget({ columnId: column.id, beforeId: null })
  }

  function handleDrop(e) {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) onMoveTask(taskId, column.id, dropTarget?.columnId === column.id ? dropTarget.beforeId : null)
    setDropTarget(null)
    setDraggingId(null)
  }

  const indicator = <div className="h-1 rounded-full bg-indigo-400 dark:bg-indigo-500 -my-1" />

  return (
    <div
      className="flex flex-col min-h-0 w-[300px] flex-shrink-0"
      onDragOver={handleColumnDragOver}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropTarget(null) }}
      onDrop={handleDrop}
    >
      {/* Hlavička sloupce */}
      <div className="relative flex items-center gap-2 mb-3 min-h-[28px]">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getColor(column.color).dot}`} />
        {renaming ? (
          <InlineInput
            className="flex-1"
            initial={column.name}
            submitOnBlur
            placeholder="Název sloupce"
            onSubmit={name => { onUpdateColumn(column.id, { name }); setRenaming(false) }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <h2
            onDoubleClick={() => setRenaming(true)}
            title="Dvojklikem přejmenujete"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate"
          >
            {column.name}
          </h2>
        )}
        {!renaming && (
          <>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 rounded-full px-2 py-0.5">
              {tasks.length}
            </span>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Možnosti sloupce"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </>
        )}
        {menuOpen && (
          <ColumnMenu
            column={column}
            isFirst={index === 0}
            isLast={index === columnCount - 1}
            canDelete={columnCount > 1}
            onRename={() => setRenaming(true)}
            onUpdate={onUpdateColumn}
            onMove={onMoveColumn}
            onDelete={onDeleteColumn}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>

      {/* Úkoly */}
      <div className={`flex flex-col gap-2.5 overflow-y-auto flex-1 rounded-xl transition-colors p-1 -m-1 ${
        isTarget && draggingId ? 'bg-indigo-50/70 dark:bg-indigo-900/20' : ''
      }`}>
        {tasks.map((task, i) => (
          <div key={task.id} className="flex flex-col gap-2.5">
            {isTarget && draggingId && dropTarget.beforeId === task.id && indicator}
            <div
              draggable
              onDragStart={e => {
                setDraggingId(task.id)
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('taskId', task.id)
              }}
              onDragEnd={() => { setDraggingId(null); setDropTarget(null) }}
              onDragOver={e => handleCardDragOver(e, i)}
              className={`transition-opacity ${draggingId === task.id ? 'opacity-40' : ''}`}
            >
              <TaskCard
                task={task}
                clients={clients}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onComplete={onCompleteTask}
              />
            </div>
          </div>
        ))}
        {isTarget && draggingId && dropTarget.beforeId === null && tasks.length > 0 && indicator}

        {tasks.length === 0 && (
          <div className={`border-2 border-dashed rounded-xl py-6 text-center text-xs ${
            isTarget && draggingId
              ? 'border-indigo-300 dark:border-indigo-600 text-indigo-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600'
          }`}>
            {isTarget && draggingId ? 'Přetáhni sem' : 'Žádné úkoly'}
          </div>
        )}

        {quickAdd ? (
          <InlineInput
            keepOpen
            placeholder="Název úkolu a Enter (Esc zavře)"
            onSubmit={title => onQuickAdd(column.id, title)}
            onCancel={() => setQuickAdd(false)}
          />
        ) : (
          <button
            onClick={() => setQuickAdd(true)}
            className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Přidat úkol
          </button>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ columns, tasks, ...handlers }) {
  const [dropTarget, setDropTarget] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [addingColumn, setAddingColumn] = useState(false)

  return (
    <div className="flex gap-5 h-full items-stretch">
      {columns.map((col, i) => (
        <Column
          key={col.id}
          column={col}
          index={i}
          columnCount={columns.length}
          tasks={tasks.filter(t => t.columnId === col.id)}
          clients={handlers.clients}
          dropTarget={dropTarget}
          setDropTarget={setDropTarget}
          draggingId={draggingId}
          setDraggingId={setDraggingId}
          {...handlers}
        />
      ))}

      <div className="w-[260px] flex-shrink-0">
        {addingColumn ? (
          <div className="flex items-center gap-1">
            <InlineInput
              className="flex-1"
              keepOpen
              placeholder="Název sloupce a Enter"
              onSubmit={name => handlers.onAddColumn(name)}
              onCancel={() => setAddingColumn(false)}
            />
            <button onClick={() => setAddingColumn(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingColumn(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl py-2.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Přidat sloupec
          </button>
        )}
      </div>
    </div>
  )
}
