# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:5175)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

## Architecture

**Stack:** Vite + React (JSX, no TypeScript), Tailwind CSS v3 with `darkMode: 'class'`, Lucide React icons.

**Persistence:** All data lives in `localStorage` — no backend. Keys: `ppc_clients`, `ppc_tasks`, `ppc_dark`. Seed clients and seed tasks are written once on first load (when respective key is missing). To reset to seed data: `localStorage.removeItem('ppc_tasks')` in browser console.

**State management:** Single `App.jsx` owns all state (`clients`, `tasks`, dark mode). All mutations go through handlers in App and are passed down as props. No context, no external state library.

**Data model:**
- Client: `{ id, name }`
- Task: `{ id, title, description, clientId, priority ('Nízká'|'Střední'|'Vysoká'), dueDate (YYYY-MM-DD string), status ('K řešení'|'Probíhá'|'Hotovo'), recurrence ('Jednorázový'|'Týdenní'|'Měsíční') }`

**Client colors:** `src/data/clientColors.js` derives a color deterministically from a client's index in the `clients` array. Both `Sidebar` and `TaskCard` import `getClientColor(clients, clientId)` — the same palette index means the same color everywhere.

**Drag & drop:** Native HTML5 DnD implemented in `KanbanBoard.jsx`. `draggable` is set on the wrapper div around each `TaskCard`. Drop handlers call `onStatusChange(taskId, newStatus)` which bubbles up to App.

**Dark mode:** Toggled by adding/removing the `dark` class on `document.documentElement`. Tailwind `dark:` variants handle styling. Preference persisted in `localStorage` under `ppc_dark`.

**Key files:**
- `src/data/storage.js` — all localStorage read/write + seed data + `generateId()`
- `src/data/clientColors.js` — shared color palette for clients
- `src/components/Dashboard.jsx` — stats bar (counts by status + progress bar), rendered between header and board
- `src/components/KanbanBoard.jsx` — drag & drop, column rendering, "delete all done" button
- `src/components/TaskCard.jsx` — individual task card, overdue detection
- `src/components/TaskModal.jsx` — add/edit modal
- `src/components/Sidebar.jsx` — client list with inline rename
