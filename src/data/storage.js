import { LEGACY_ORDER } from './clientColors'

export const SEED_CLIENTS = [
  { id: '1', name: 'Sportega' },
  { id: '2', name: 'Flystork' },
  { id: '3', name: 'Bioprodukt JT' },
  { id: '4', name: 'Sardinerie' },
  { id: '5', name: 'One Club' },
  { id: '6', name: 'PEF Mendelu' },
  { id: '7', name: 'Celtic-supply' },
  { id: '8', name: 'Přirozený běh' },
  { id: '9', name: 'Colortap' },
  { id: '10', name: 'Tiny House' },
  { id: '11', name: 'Zboží z Bali' },
]

export const SEED_TASKS = [
  { id: 'mmfdfvde9kyv9s5z6ic', title: 'Věrnostní program - Popis kategorie', description: 'PL', clientId: '7', priority: 'Střední', dueDate: '2026-03-11', status: 'Probíhá', recurrence: 'Jednorázový' },
  { id: 'mmfdh0keyh2pdhyresj', title: 'Forecast finannčních výsledků', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmfdp7rmg5z8jrbv5mk', title: 'Nikol - napsat Reporting výsledků', description: '', clientId: '8', priority: 'Střední', dueDate: '2026-03-09', status: 'Probíhá', recurrence: 'Jednorázový' },
  { id: 'mmfdr13hf83wg77cf0g', title: 'Příprava zadání pro úpravu webu', description: '', clientId: '9', priority: 'Střední', dueDate: '2026-03-11', status: 'Probíhá', recurrence: 'Jednorázový' },
  { id: 'mmfdw8o2c9orj8dbj8c', title: 'Meta - nasadit reklamy', description: '', clientId: '11', priority: 'Vysoká', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmfel403tddiyeeokph', title: 'Poslat zadání na SMS kampaň', description: '', clientId: '7', priority: 'Vysoká', dueDate: '2026-03-09', status: 'Hotovo', recurrence: 'Jednorázový' },
  { id: 'mmfer1zb70ojt0c31ma', title: 'Velikonoce - nasadit reels na Meta', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmfes3t3dm9s8sq0whb', title: 'Úpravy UX na webu - poslat zadání na kodéra', description: 'Nákupní box, štítky na detailu produktu', clientId: '4', priority: 'Střední', dueDate: '2026-03-12', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmfesv6505ki8aq3pzja', title: 'Sklik - optimalizace kampaní', description: '', clientId: '9', priority: 'Vysoká', dueDate: '2026-03-09', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmfezq09kaljrdk9ql', title: 'Metrigo - dořešit', description: '', clientId: '3', priority: 'Vysoká', dueDate: '2026-03-09', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmff0f8k4daux8q7d6b', title: 'Meta CAPI - nasadit', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmff0xr394m4gf0qc9', title: 'Analýza prodejnosti za únor', description: '', clientId: '3', priority: 'Vysoká', dueDate: '2026-03-12', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmgsaoxs4cfdtc2aooh', title: 'Příprava na meeting', description: '', clientId: '6', priority: 'Vysoká', dueDate: '2026-03-16', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmgsc9q5y75cebyfrlg', title: 'Google Ads - nastavení účtu', description: 'Pmax, SEA Brand, rozšíření reklam', clientId: '11', priority: 'Střední', dueDate: '2026-03-12', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmgsd56f2hq04by312a', title: 'Analýza odchozích uživatelů a analýza retence', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmgsg9ok0mrthad3gae', title: 'Sklik - vytvoření účtu', description: '', clientId: '11', priority: 'Střední', dueDate: '2026-03-20', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmgsgytbwjs715o09l', title: 'Google Ads, Sklik, Meta - optimalizace kampaní', description: '', clientId: '6', priority: 'Střední', dueDate: '2026-03-09', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhd6ivpz3cr6w3pha', title: 'Upsell a cross sell - košík - prověření', description: '', clientId: '3', priority: 'Vysoká', dueDate: '2026-03-13', status: 'Hotovo', recurrence: 'Jednorázový' },
  { id: 'mmheho0lotqylv0ovkf', title: 'LeadHub - retenční analýza', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-09', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhf83cuy4y1dp0fv08', title: 'Reporting výsedků - úprava (odečtení dopravy)', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhf8odc0f1y07zw3eif', title: 'Sálové lekce - úprava měření', description: '', clientId: '5', priority: 'Střední', dueDate: '2026-03-12', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhf99ahnwpqex0wywf', title: 'Report výsledků únor - poslat Lucka', description: '', clientId: '5', priority: 'Střední', dueDate: '2026-03-09', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhf9wjyplb7bmvjf8c', title: 'Tábory - vytvořit reels', description: '', clientId: '5', priority: 'Střední', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhfbg1sqgxs3kpeqpb', title: 'Vytvoření GA4, GTM', description: '', clientId: '9', priority: 'Vysoká', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhfd92fw9akmd3byl', title: 'Týdenní report výsledků', description: '', clientId: '11', priority: 'Vysoká', dueDate: '2026-03-15', status: 'K řešení', recurrence: 'Týdenní' },
  { id: 'mmhfdsb9ekq7nxxqc2', title: 'Týdenní report výsledků', description: '', clientId: '3', priority: 'Vysoká', dueDate: '2026-03-14', status: 'Probíhá', recurrence: 'Týdenní' },
  { id: 'mmhfi61nc4zfck35sw4', title: 'Věrnostní program - Návrh web a emailing', description: '', clientId: '7', priority: 'Vysoká', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmhfkwzsrrjifcyq7', title: 'UK IE - Ověření reklamního účtu', description: '', clientId: '1', priority: 'Střední', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmiued67zsnno9gigrq', title: 'Meta - nasazení bannerů "Konec přihlášek"', description: '', clientId: '6', priority: 'Střední', dueDate: '2026-03-12', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj03e6fpnl292d36s', title: 'Meta - bannery "Jarní čistka" prodejna nasadit', description: '', clientId: '8', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj0iiqibiw0q6mz39', title: 'Analýza retence', description: '', clientId: '8', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj0y904vxzmhp9lfgg', title: 'Google Ads - SEA - Xero', description: '', clientId: '8', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj5g693ir9ktgzndo', title: 'Analýza Share of Search - poslat', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj5hgatm9si6xj58xe', title: 'Úpravy obrázků na webu - realizace', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-18', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj5i3ommf06iixtxfr', title: 'Vizuální identita - šablony bannerů', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-18', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj5jds3doykckg3fyq', title: 'Upsell a cross sell - nasadit bannery', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-18', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj5ne3rnq25toussgd', title: 'Za šípkovým keřem - zapnout kampaně 1.4.', description: '', clientId: '10', priority: 'Vysoká', dueDate: '2026-04-01', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmj5p6ugvi0049hjg9o', title: 'Meta - SK feed - úprava', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmjfeldlomgsgpre47', title: 'Kategorie (zahraničí) - doplnit popisy', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-11', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmjjjs0uz7pd8ofz66e', title: 'Export objednávek DPH', description: '', clientId: '8', priority: 'Střední', dueDate: '2026-03-09', status: 'Hotovo', recurrence: 'Jednorázový' },
  { id: 'mmkcu74pit7s366mw8r', title: 'Meta - Credit line', description: '', clientId: '1', priority: 'Střední', dueDate: '2026-03-12', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmkfgikb484t44id5lh', title: 'Homepage - překlad do SK', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-11', status: 'Probíhá', recurrence: 'Jednorázový' },
  { id: 'mml02fua5b1nr7fivpv', title: 'Meta - GLS vyhodnocení kampaně', description: '', clientId: '1', priority: 'Vysoká', dueDate: '2026-03-12', status: 'Hotovo', recurrence: 'Jednorázový' },
  { id: 'mml07avz67sdrhokr5q', title: 'MyFish - analýza', description: '', clientId: '4', priority: 'Střední', dueDate: '2026-03-16', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mml087su6piidtc6666', title: 'Narozeniny - kampaň', description: '', clientId: '4', priority: 'Střední', dueDate: '2026-04-14', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mml08wjemmoky5oc6ba', title: 'Google Ads - úprava fakturačních údajů', description: '', clientId: '4', priority: 'Střední', dueDate: '2026-03-16', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mml099ilyjsxeenystc', title: 'Emailing - nasazení', description: '', clientId: '4', priority: 'Vysoká', dueDate: '2026-03-16', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mml09v243ng63tmaqb5', title: 'Týdenní report výsledků', description: '', clientId: '4', priority: 'Vysoká', dueDate: '2026-03-10', status: 'Probíhá', recurrence: 'Týdenní' },
  { id: 'mml0au9k8rq9p7cfvee', title: 'UGC videa - otevření', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-17', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mml0bpgdu0laht0tww', title: 'Týdenní report výsledků - tábory', description: '', clientId: '5', priority: 'Vysoká', dueDate: '2026-03-09', status: 'Probíhá', recurrence: 'Týdenní' },
  { id: 'mml0lzr5cn1sdar5l27', title: 'Reporting výsledků - aplikace', description: '', clientId: '4', priority: 'Vysoká', dueDate: '2026-03-24', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmlkuhjj62r48dk2de8', title: 'Košík - Dýško skladníkovi', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-18', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmlm4lv1tu9sbtlqqrg', title: 'Meta - SK nasadit reels', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-11', status: 'Probíhá', recurrence: 'Jednorázový' },
  { id: 'mmlsjawk7kdrp8urp6e', title: 'Košík - boxy - odstranění adresy', description: '', clientId: '7', priority: 'Střední', dueDate: '2026-03-12', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmlx9ozphvhq12pr0w9', title: 'Meta - SK Sportega Try', description: '', clientId: '1', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmm448scaoaj32dtwjd', title: 'Meta - vendor kampaň - Babolat Pure Aero', description: '', clientId: '1', priority: 'Vysoká', dueDate: '2026-03-12', status: 'Hotovo', recurrence: 'Jednorázový' },
  { id: 'mmn82balw8yszl75utq', title: 'Meta - IG soutěž promo - dotáhnout', description: '', clientId: '1', priority: 'Střední', dueDate: '2026-03-13', status: 'Probíhá', recurrence: 'Jednorázový' },
  { id: 'mmna2xpo2pdp1sajbky', title: 'Meta, Google - vyloučení produktů zimní obuv', description: '', clientId: '8', priority: 'Střední', dueDate: '2026-03-13', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmnb6ce4qq781f6aqz', title: 'SEO - Automatizovaná konstrukce', description: '', clientId: '4', priority: 'Střední', dueDate: '2026-03-31', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmol5blle2ugfqajqtb', title: 'SK - Google Ads SEA - jablečné trubičky', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-18', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmoxb8qi1ym655n74o7', title: 'Sklik - vytvoření účtu - návod', description: '', clientId: '11', priority: 'Střední', dueDate: '2026-03-16', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 'mmoxkdl4ox04txxae6a', title: 'Reels - post - zasponzorovat', description: '', clientId: '3', priority: 'Střední', dueDate: '2026-03-16', status: 'K řešení', recurrence: 'Jednorázový' },
]

// ---------------------------------------------------------------------------
// Verze dat
//   1 = původní: Task.status ('K řešení' | 'Probíhá' | 'Hotovo'), barva klienta podle pořadí
//   2 = vlastní sloupce (Task.columnId), barva uložená u klienta, archiv (Task.archived),
//       podúkoly (Task.checklist)
// ---------------------------------------------------------------------------
const DATA_VERSION = 2

const KEYS = {
  clients: 'ppc_clients',
  tasks: 'ppc_tasks',
  columns: 'ppc_columns',
  version: 'ppc_version',
  backupV1: 'ppc_backup_v1',
  todo: 'ppc_todo',
}

// ---------------------------------------------------------------------------
// To do list: samostatné seznamy (podsekce) s body, nezávislé na úkolech a klientech
//   TodoList: { id, name, color, doneOpen, items: [{ id, text, done, doneAt }] }
//   Pořadí items = ruční pořadí bodů. Hotové body se zobrazují dole.
// ---------------------------------------------------------------------------
export function normalizeTodo(lists) {
  if (!Array.isArray(lists)) return []
  return lists
    .filter(l => l && l.id)
    .map(l => ({
      name: '',
      color: 'gray',
      doneOpen: true,
      ...l,
      items: (Array.isArray(l.items) ? l.items : [])
        .filter(i => i && i.id)
        .map(i => ({ text: '', done: false, doneAt: null, ...i })),
    }))
}

export const DEFAULT_COLUMNS = [
  { id: 'col-todo', name: 'K řešení', color: 'gray' },
  { id: 'col-doing', name: 'Probíhá', color: 'blue' },
]

const LEGACY_STATUS_TO_COLUMN = {
  'K řešení': 'col-todo',
  'Probíhá': 'col-doing',
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Doplní chybějící pole, aby zbytek aplikace mohl počítat s úplným tvarem úkolu.
export function normalizeTask(task, columns) {
  const firstColumnId = columns[0]?.id
  const columnExists = columns.some(c => c.id === task.columnId)
  return {
    title: '',
    description: '',
    clientId: '',
    priority: 'Střední',
    dueDate: '',
    recurrence: 'Jednorázový',
    checklist: [],
    archived: false,
    completedAt: null,
    ...task,
    columnId: columnExists ? task.columnId : firstColumnId,
  }
}

function migrateFromV1(clients, tasks) {
  // Záloha původních dat, kdyby převod něco pokazil
  if (!localStorage.getItem(KEYS.backupV1)) {
    writeJSON(KEYS.backupV1, { clients, tasks, savedAt: new Date().toISOString() })
  }

  const columns = DEFAULT_COLUMNS
  const migratedClients = clients.map((c, i) => ({
    ...c,
    color: c.color || LEGACY_ORDER[i % LEGACY_ORDER.length],
  }))

  const now = new Date().toISOString()
  const migratedTasks = tasks.map(t => {
    const { status, ...rest } = t
    const isDone = status === 'Hotovo'
    return normalizeTask({
      ...rest,
      columnId: rest.columnId || LEGACY_STATUS_TO_COLUMN[status] || 'col-todo',
      // Úkoly ze sloupce „Hotovo“ se přesunou do archivu
      archived: isDone,
      completedAt: isDone ? (rest.dueDate ? `${rest.dueDate}T12:00:00.000Z` : now) : null,
    }, columns)
  })

  return { clients: migratedClients, columns, tasks: migratedTasks }
}

// Načte všechna data, při prvním spuštění zapíše výchozí data a případně převede starou verzi.
export function loadState() {
  const version = Number(localStorage.getItem(KEYS.version) || 1)
  let clients = readJSON(KEYS.clients) ?? SEED_CLIENTS
  let tasks = readJSON(KEYS.tasks) ?? SEED_TASKS
  let columns = readJSON(KEYS.columns)

  if (version < 2 || !columns) {
    ({ clients, columns, tasks } = migrateFromV1(clients, tasks))
  } else {
    clients = clients.map(c => ({ ...c, color: c.color || 'gray' }))
    tasks = tasks.map(t => normalizeTask(t, columns))
  }

  const todo = normalizeTodo(readJSON(KEYS.todo))

  saveState({ clients, columns, tasks, todo })
  return { clients, columns, tasks, todo }
}

export function saveState({ clients, columns, tasks, todo }) {
  if (clients) writeJSON(KEYS.clients, clients)
  if (columns) writeJSON(KEYS.columns, columns)
  if (tasks) writeJSON(KEYS.tasks, tasks)
  if (todo) writeJSON(KEYS.todo, todo)
  localStorage.setItem(KEYS.version, String(DATA_VERSION))
}

// ---------------------------------------------------------------------------
// Záloha do souboru a obnova
// ---------------------------------------------------------------------------
export function exportBackup({ clients, columns, tasks, todo }) {
  const data = { app: 'client-manager', version: DATA_VERSION, exportedAt: new Date().toISOString(), clients, columns, tasks, todo }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `client-manager-zaloha-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Vrátí { clients, columns, tasks, todo } nebo vyhodí chybu s českou hláškou.
// todo je null, pokud záloha seznamy neobsahuje (starší záloha) – současné seznamy pak zůstanou.
export function parseBackup(text) {
  const result = parseTasksBackup(text)
  const data = JSON.parse(text)
  return { ...result, todo: Array.isArray(data.todo) ? normalizeTodo(data.todo) : null }
}

function parseTasksBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Soubor není platný JSON.')
  }
  if (!Array.isArray(data?.clients) || !Array.isArray(data?.tasks)) {
    throw new Error('Soubor neobsahuje klienty a úkoly z této aplikace.')
  }
  if (!Array.isArray(data.columns) || Number(data.version || 1) < 2) {
    return migrateFromV1(data.clients, data.tasks)
  }
  const columns = data.columns.length ? data.columns : DEFAULT_COLUMNS
  return {
    clients: data.clients.map(c => ({ ...c, color: c.color || 'gray' })),
    columns,
    tasks: data.tasks.map(t => normalizeTask(t, columns)),
  }
}
