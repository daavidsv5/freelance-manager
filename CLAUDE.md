# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite default http://localhost:5173, or next free port)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Deployment

Hosted on Vercel (project `freelance-manager`, live at https://freelance-manager-one.vercel.app). Vercel's GitHub integration builds and deploys production automatically on every push to `main` of `github.com/daavidsv5/freelance-manager` — there is no Vercel CLI or `.vercel` link locally. A push to `main` therefore goes live; work on a feature branch and merge only when the user asks to deploy. Check the result with `gh api repos/daavidsv5/freelance-manager/commits/<sha>/status` (context `Vercel`). Data stays in each browser's `localStorage`, so deploys never touch user data.

## Architecture

**Stack:** Vite + React (JSX, no TypeScript), Tailwind CSS v3 with `darkMode: 'class'`, Lucide React icons.

**Persistence:** All data lives in `localStorage` — no backend. Keys: `ppc_clients`, `ppc_columns`, `ppc_tasks`, `ppc_todo`, `ppc_version` (currently `2`), `ppc_dark`. `loadState()` in `storage.js` writes seed data on first load and migrates v1 data (Task.status → columnId, tasks from "Hotovo" → archive, client color from index → stored `color`); before migrating it saves the original v1 data to `ppc_backup_v1`. App saves all four collections via one `useEffect` on every change. Users can download/upload a JSON backup from the sidebar (`exportBackup` / `parseBackup`, which also accepts v1 backups).

**State management:** Single `App.jsx` owns all state (`clients`, `columns`, `tasks`, view, filters, modal, confirm dialog, toast). All mutations use functional `setState(prev => …)` in App handlers passed down as props. No context, no external state library.

**Data model (v2):**
- Client: `{ id, name, color }` — `color` is a key from `COLORS` in `clientColors.js`
- Column: `{ id, name, color }` — order of the array = order on the board; at least one column always exists
- Task: `{ id, title, description, clientId, priority ('Nízká'|'Střední'|'Vysoká'), dueDate (YYYY-MM-DD), columnId, recurrence ('Jednorázový'|'Týdenní'|'Měsíční'), checklist: [{ id, text, done }], archived (bool), completedAt (ISO|null) }`
- Order of tasks in the `tasks` array = manual order within a column ("Vlastní pořadí").
- TodoList: `{ id, name, color, doneOpen, items: [{ id, text, done, doneAt (ISO|null) }] }` — independent of clients and tasks; order of `items` = manual order. A missing `ppc_todo` just means no lists (no version bump needed).

**To do list (`view === 'todo'`):** Google Keep–style checklists in `TodoView.jsx`. Sidebar section "To do list" lists them (`selectedList`, null = all as a masonry grid via CSS `columns-*`). Checked items drop into a collapsible "N hotové body" block at the bottom (sorted by `doneAt` desc) with a "Smazat hotové" button; unchecking returns the item to its original array position. Items are edited inline (auto-growing textarea, empty text on blur deletes the item), pasting several lines adds several items, and items can be dragged by a grip (desktop only, also between lists). Deleting an item, clearing done items or deleting a list shows an undo toast. Date filter and sort are hidden in this view; search filters items and list names. Backups include `todo`; `parseBackup` returns `todo: null` for older backups and the import then keeps the current lists.

**Completing tasks:** The round checkbox on a card strikes the task through and after 1.2 s calls `handleCompleteTask` → `archived: true`. A recurring task instead gets an archived copy, and the original moves to the first column with the next due date and a reset checklist. A toast offers undo. The archive view (`ArchiveView.jsx`) restores (unarchive) or permanently deletes tasks.

**Dates:** Always use helpers in `src/data/dates.js` (local-time parsing of YYYY-MM-DD; comparisons as strings). Don't use `new Date('YYYY-MM-DD')` / `toISOString()` for due dates — UTC shifts break around DST.

**Colors:** `src/data/clientColors.js` holds the `COLORS` palette (full Tailwind class strings so JIT picks them up), `getColor(key)`, `getClientColor(clients, id)` and `nextFreeColor(items)`. Used for both clients and columns via `ColorPicker.jsx`.

**Drag & drop:** Native HTML5 DnD in `KanbanBoard.jsx`. Dropping onto a card inserts before/after it (by mouse Y), dropping on empty column space appends. Calls `onMoveTask(taskId, columnId, beforeId)`.

**Mobile (< `md`, 768 px):** Sidebar is an off-canvas drawer (`open`/`onClose` props, ☰ in header). Header shows search + filter toggle (date filter and sort inside). Board columns are 85vw wide with horizontal scroll-snap and a column chip bar on top (`KanbanBoard.jsx`). HTML5 drag & drop doesn't work on touch, so cards show a "Přesunout do sloupce" button (`md:hidden`); hover-only actions are hidden on mobile (delete is in the task modal). Task modal is full-screen with a sticky footer. `index.css` forces 16 px inputs on mobile to stop iOS zoom. Use `h-dvh` for full height and `env(safe-area-inset-*)` for notch padding.

**Dark mode:** Toggled by adding/removing the `dark` class on `document.documentElement`. Tailwind `dark:` variants handle styling. Preference persisted in `localStorage` under `ppc_dark`.

**Key files:**
- `src/data/storage.js` — load/save, v1→v2 migration, seed data, backup export/import, `generateId()`
- `src/data/dates.js` — date helpers, recurrence (`advanceDueDate`), `isOverdue`
- `src/data/clientColors.js` — shared color palette
- `src/components/Sidebar.jsx` — Nástěnka/Archiv switch, clients (add with color, edit, delete), backup buttons
- `src/components/Dashboard.jsx` — stats (active, overdue, due today, next 7 days, done in 7 days, week progress)
- `src/components/KanbanBoard.jsx` — columns (add, rename, color, move, delete), quick add, drag & drop
- `src/components/TaskCard.jsx` — card with complete checkbox (`CompleteCheckbox` also used in archive)
- `src/components/TaskModal.jsx` — add/edit modal incl. checklist (podúkoly)
- `src/components/ArchiveView.jsx` — completed tasks grouped by completion date
- `src/components/TodoView.jsx` — To do list cards (checklists), new-list bar, item drag & drop
- `src/components/ConfirmDialog.jsx` — confirmation dialog used for destructive actions
