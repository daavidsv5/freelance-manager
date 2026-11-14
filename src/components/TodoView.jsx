import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Plus, MoreVertical, Pencil, Trash2, X, Check, ChevronRight, GripVertical, ListChecks, Eraser } from 'lucide-react'
import ColorPicker from './ColorPicker'
import { getColor } from '../data/clientColors'

const plural = (n, one, few, many) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

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

// Text vložený přes schránku s více řádky = více bodů
function splitLines(text) {
  return text.split(/\r?\n/).map(s => s.replace(/^\s*(?:[-*•]|\[[ xX]?\])\s*/, '').trim()).filter(Boolean)
}

function Checkbox({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={checked ? 'Vrátit mezi nehotové' : 'Odškrtnout'}
      className={`mt-[3px] w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked
          ? 'bg-indigo-500 border-indigo-500 dark:bg-indigo-500 dark:border-indigo-500'
          : 'border-slate-300 dark:border-slate-500 hover:border-indigo-400 dark:hover:border-indigo-400'
      }`}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
    </button>
  )
}

// Text bodu upravitelný přímo na místě, výška roste s textem
function ItemText({ value, onChange, onDone, className = '' }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={e => onChange(e.target.value.replace(/\r?\n/g, ' '))}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.currentTarget.blur() }
      }}
      onBlur={onDone}
      className={`flex-1 min-w-0 resize-none overflow-hidden bg-transparent outline-none text-sm leading-6 text-slate-700 dark:text-slate-200 rounded focus:bg-slate-50 dark:focus:bg-slate-700/50 px-1 -mx-1 ${className}`}
    />
  )
}

function CardMenu({ list, doneCount, onRename, onUpdate, onClearDone, onDelete, onClose }) {
  const ref = useRef(null)
  useClickOutside(ref, onClose, true)
  const item = 'w-full flex items-center gap-2 px-3 py-2 md:py-1.5 text-sm text-left rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  return (
    <div ref={ref} className="absolute right-2 top-11 z-30 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5">
      <button className={`${item} text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700`} onClick={() => { onRename(); onClose() }}>
        <Pencil className="w-3.5 h-3.5" /> Přejmenovat
      </button>
      <button
        disabled={!doneCount}
        className={`${item} text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700`}
        onClick={() => { onClearDone(); onClose() }}
      >
        <Eraser className="w-3.5 h-3.5" /> Smazat hotové body
      </button>
      <div className="px-3 pt-2 pb-2.5 border-y border-slate-100 dark:border-slate-700 my-1">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5">Barva seznamu</p>
        <ColorPicker size="sm" value={list.color} onChange={color => onUpdate({ color })} />
      </div>
      <button className={`${item} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30`} onClick={() => { onDelete(); onClose() }}>
        <Trash2 className="w-3.5 h-3.5" /> Smazat seznam
      </button>
    </div>
  )
}

function TodoCard({
  list, query, single, autoFocusAdd, onAutoFocused, drag, setDrag,
  onUpdateList, onDeleteList, onAddItems, onUpdateItem, onToggleItem, onDeleteItem, onClearDone, onMoveItem,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(list.name)
  const [newText, setNewText] = useState('')
  const [armedId, setArmedId] = useState(null)
  const addRef = useRef(null)
  const color = getColor(list.color)

  useEffect(() => {
    if (autoFocusAdd && addRef.current) {
      addRef.current.focus()
      addRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      onAutoFocused()
    }
  }, [autoFocusAdd, onAutoFocused])

  const nameMatches = query && list.name.toLowerCase().includes(query)
  const visible = !query || nameMatches ? list.items : list.items.filter(i => i.text.toLowerCase().includes(query))
  const active = visible.filter(i => !i.done)
  const done = visible.filter(i => i.done).sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''))
  const total = list.items.length
  const doneTotal = list.items.filter(i => i.done).length
  const canDrag = !query
  const isTarget = drag?.overListId === list.id

  function submitNew(e) {
    e?.preventDefault()
    const text = newText.trim()
    if (!text) return
    onAddItems(list.id, [text])
    setNewText('')
  }

  function handlePaste(e) {
    const lines = splitLines(e.clipboardData.getData('text'))
    if (lines.length < 2) return
    e.preventDefault()
    onAddItems(list.id, lines)
  }

  function saveName() {
    const v = name.trim()
    if (v && v !== list.name) onUpdateList(list.id, { name: v })
    else setName(list.name)
    setRenaming(false)
  }

  // ---- přetahování bodů (jen počítač, za úchyt)
  function handleRowDragOver(e, index) {
    if (!drag) return
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const after = e.clientY > rect.top + rect.height / 2
    const beforeId = after ? (active[index + 1]?.id ?? null) : active[index].id
    if (drag.overListId !== list.id || drag.beforeId !== beforeId) setDrag({ ...drag, overListId: list.id, beforeId })
  }

  function handleListDragOver(e) {
    if (!drag) return
    e.preventDefault()
    if (drag.overListId !== list.id) setDrag({ ...drag, overListId: list.id, beforeId: null })
  }

  function handleDrop(e) {
    if (!drag) return
    e.preventDefault()
    onMoveItem(drag.listId, drag.itemId, list.id, drag.overListId === list.id ? drag.beforeId : null)
    setDrag(null)
  }

  const indicator = <li className="h-0.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mx-1" />

  return (
    <article
      className={`relative break-inside-avoid mb-4 bg-white dark:bg-slate-800 border rounded-xl shadow-sm transition-colors ${
        isTarget ? 'border-indigo-300 dark:border-indigo-600' : 'border-slate-200 dark:border-slate-700'
      }`}
      onDragOver={handleListDragOver}
      onDragLeave={e => { if (drag && !e.currentTarget.contains(e.relatedTarget)) setDrag({ ...drag, overListId: null, beforeId: null }) }}
      onDrop={handleDrop}
    >
      <div className={`h-1.5 rounded-t-xl ${color.dot}`} />

      {/* Hlavička karty */}
      <div className="flex items-start gap-2 pl-4 pr-2 pt-3 pb-1">
        {renaming ? (
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => {
              if (e.key === 'Enter') saveName()
              if (e.key === 'Escape') { setName(list.name); setRenaming(false) }
            }}
            className="flex-1 min-w-0 text-base font-semibold border-b border-indigo-400 bg-transparent outline-none text-slate-800 dark:text-slate-100"
          />
        ) : (
          <h3
            onClick={() => { setName(list.name); setRenaming(true) }}
            title="Kliknutím přejmenujete"
            className={`flex-1 min-w-0 font-semibold text-slate-800 dark:text-slate-100 break-words cursor-text ${single ? 'text-lg' : 'text-base'}`}
          >
            {list.name}
          </h3>
        )}
        {total > 0 && (
          <span className="mt-1 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap" title="Hotové / všechny body">
            {doneTotal}/{total}
          </span>
        )}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="p-1.5 -mt-0.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Možnosti seznamu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      {menuOpen && (
        <CardMenu
          list={list}
          doneCount={doneTotal}
          onRename={() => { setName(list.name); setRenaming(true) }}
          onUpdate={patch => onUpdateList(list.id, patch)}
          onClearDone={() => onClearDone(list.id)}
          onDelete={() => onDeleteList(list)}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {/* Nehotové body */}
      <ul className="px-2 pt-1">
        {active.map((item, index) => (
          <FragmentWithIndicator key={item.id} show={isTarget && drag?.beforeId === item.id} indicator={indicator}>
            <li
              draggable={canDrag && armedId === item.id}
              onDragStart={e => {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', item.text)
                setDrag({ listId: list.id, itemId: item.id, overListId: list.id, beforeId: item.id })
              }}
              onDragEnd={() => { setDrag(null); setArmedId(null) }}
              onDragOver={e => handleRowDragOver(e, index)}
              className={`group flex items-start gap-1.5 md:gap-2 py-0.5 rounded-lg ${drag?.itemId === item.id ? 'opacity-40' : ''}`}
            >
              {canDrag ? (
                <span
                  onMouseDown={() => setArmedId(item.id)}
                  onMouseUp={() => setArmedId(null)}
                  className="hidden md:flex mt-1 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                  title="Přetažením změníte pořadí"
                >
                  <GripVertical className="w-4 h-4" />
                </span>
              ) : (
                <span className="hidden md:block w-4" />
              )}
              <Checkbox checked={false} onToggle={() => onToggleItem(list.id, item.id)} />
              <ItemText
                value={item.text}
                onChange={text => onUpdateItem(list.id, item.id, { text })}
                onDone={() => { if (!item.text.trim()) onDeleteItem(list.id, item, true) }}
              />
              <button
                onClick={() => onDeleteItem(list.id, item)}
                title="Smazat bod"
                className="p-1.5 md:p-1 -my-0.5 rounded text-slate-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          </FragmentWithIndicator>
        ))}
        {isTarget && drag?.beforeId === null && indicator}
      </ul>

      {/* Přidání bodu */}
      {!query && (
        <form onSubmit={submitNew} className="flex items-center gap-1.5 md:gap-2 px-2 pb-2">
          <span className="hidden md:block w-4" />
          <Plus className="w-[18px] h-[18px] text-slate-400 flex-shrink-0" />
          <input
            ref={addRef}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={e => e.key === 'Escape' && (setNewText(''), e.currentTarget.blur())}
            placeholder="Přidat bod"
            className="flex-1 min-w-0 text-sm leading-6 bg-transparent outline-none py-1 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border-b border-transparent focus:border-indigo-300 dark:focus:border-indigo-600"
          />
        </form>
      )}

      {/* Hotové body */}
      {done.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-2 pt-1.5 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateList(list.id, { doneOpen: !list.doneOpen })}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1 py-1 rounded"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${list.doneOpen || query ? 'rotate-90' : ''}`} />
              {done.length} {plural(done.length, 'hotový bod', 'hotové body', 'hotových bodů')}
            </button>
            <span className="flex-1" />
            <button
              onClick={() => onClearDone(list.id)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded-lg transition-colors"
              title="Smazat všechny hotové body v tomto seznamu"
            >
              <Trash2 className="w-3 h-3" /> Smazat hotové
            </button>
          </div>
          {(list.doneOpen || query) && (
            <ul className="mt-0.5">
              {done.map(item => (
                <li key={item.id} className="group flex items-start gap-1.5 md:gap-2 py-0.5">
                  <span className="hidden md:block w-4" />
                  <Checkbox checked onToggle={() => onToggleItem(list.id, item.id)} />
                  <span className="flex-1 min-w-0 text-sm leading-6 line-through text-slate-400 dark:text-slate-500 break-words">{item.text}</span>
                  <button
                    onClick={() => onDeleteItem(list.id, item)}
                    title="Smazat bod"
                    className="p-1.5 md:p-1 -my-0.5 rounded text-slate-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  )
}

function FragmentWithIndicator({ show, indicator, children }) {
  return (
    <>
      {show && indicator}
      {children}
    </>
  )
}

function NewListBar({ onAdd, inputRef }) {
  const [value, setValue] = useState('')
  function submit(e) {
    e.preventDefault()
    const v = value.trim()
    if (!v) return
    onAdd(v)
    setValue('')
  }
  return (
    <form onSubmit={submit} className="max-w-xl mx-auto mb-6 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm px-4 py-2.5 focus-within:border-indigo-300 dark:focus-within:border-indigo-600">
      <ListChecks className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && (setValue(''), e.currentTarget.blur())}
        placeholder="Nový seznam, napište název a Enter"
        className="flex-1 min-w-0 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
      />
      {value.trim() && (
        <button type="submit" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2.5 py-1 rounded-lg">
          Vytvořit
        </button>
      )}
    </form>
  )
}

export default function TodoView({
  lists, selectedListId, query, focusNewList, onNewListFocused, onAddList,
  onUpdateList, onDeleteList, onAddItems, onUpdateItem, onToggleItem, onDeleteItem, onClearDone, onMoveItem,
}) {
  const [drag, setDrag] = useState(null) // { listId, itemId, overListId, beforeId }
  const [focusAddId, setFocusAddId] = useState(null)
  const newListRef = useRef(null)
  const clearFocusAdd = useCallback(() => setFocusAddId(null), [])

  useEffect(() => {
    if (focusNewList && newListRef.current) {
      newListRef.current.focus()
      onNewListFocused()
    }
  }, [focusNewList, onNewListFocused])

  const single = selectedListId ? lists.find(l => l.id === selectedListId) : null
  const shown = single
    ? [single]
    : lists.filter(l => !query || l.name.toLowerCase().includes(query) || l.items.some(i => i.text.toLowerCase().includes(query)))

  const cardProps = {
    query, drag, setDrag, onAutoFocused: clearFocusAdd,
    onUpdateList, onDeleteList, onAddItems, onUpdateItem, onToggleItem, onDeleteItem, onClearDone, onMoveItem,
  }

  if (single) {
    return (
      <div className="max-w-2xl mx-auto">
        <TodoCard list={single} single autoFocusAdd={focusAddId === single.id || single.items.length === 0} {...cardProps} />
      </div>
    )
  }

  return (
    <div>
      {!query && <NewListBar inputRef={newListRef} onAdd={name => setFocusAddId(onAddList(name))} />}

      {lists.length === 0 ? (
        <div className="flex flex-col items-center text-center text-slate-400 dark:text-slate-500 mt-12">
          <ListChecks className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm font-medium">Zatím nemáte žádný seznam</p>
          <p className="text-xs mt-1 max-w-xs">Napište název do pole nahoře, například „Nákup“ nebo „Nápady“, a do seznamu pak přidávejte body.</p>
        </div>
      ) : shown.length === 0 ? (
        <p className="text-sm text-center text-slate-400 dark:text-slate-500 mt-12">Žádný bod ani seznam neodpovídá hledání.</p>
      ) : (
        <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-4">
          {shown.map(list => (
            <TodoCard key={list.id} list={list} autoFocusAdd={focusAddId === list.id} {...cardProps} />
          ))}
        </div>
      )}
    </div>
  )
}
