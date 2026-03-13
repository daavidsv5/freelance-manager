export const SEED_CLIENTS = [
  { id: '1', name: 'Sportega' },
  { id: '2', name: 'Flystork' },
  { id: '3', name: 'Bioprodukt' },
  { id: '4', name: 'Sardinerie' },
  { id: '5', name: 'One Club' },
  { id: '6', name: 'PEF Mendelu' },
  { id: '7', name: 'Celtic-supply' },
  { id: '8', name: 'Přirozený běh' },
  { id: '9', name: 'Colortap' },
  { id: '10', name: 'Tiny House' },
  { id: '11', name: 'Zboží z Bali' },
]

export function loadClients() {
  const stored = localStorage.getItem('ppc_clients')
  if (!stored) {
    localStorage.setItem('ppc_clients', JSON.stringify(SEED_CLIENTS))
    return SEED_CLIENTS
  }
  return JSON.parse(stored)
}

export function saveClients(clients) {
  localStorage.setItem('ppc_clients', JSON.stringify(clients))
}

export const SEED_TASKS = [
  { id: 't1', title: 'Nastavit Google Ads kampaň', description: 'Vytvořit novou kampaň pro letní sezónu', clientId: '1', priority: 'Vysoká', dueDate: '2026-03-15', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 't2', title: 'Měsíční report', description: 'Připravit report výkonu za únor', clientId: '2', priority: 'Střední', dueDate: '2026-03-20', status: 'Probíhá', recurrence: 'Měsíční' },
  { id: 't3', title: 'Aktualizovat bannery', description: 'Nové vizuály pro display reklamy', clientId: '3', priority: 'Nízká', dueDate: '2026-03-25', status: 'K řešení', recurrence: 'Jednorázový' },
  { id: 't4', title: 'SEO audit webu', description: 'Technický audit a návrh optimalizací', clientId: '4', priority: 'Vysoká', dueDate: '2026-03-10', status: 'Hotovo', recurrence: 'Jednorázový' },
  { id: 't5', title: 'Správa Facebook stránky', description: 'Týdenní příspěvky a reakce na komentáře', clientId: '5', priority: 'Střední', dueDate: '2026-03-14', status: 'Probíhá', recurrence: 'Týdenní' },
  { id: 't6', title: 'Nastavit remarketingové kampaně', description: 'Segmenty publika a kreativy', clientId: '1', priority: 'Vysoká', dueDate: '2026-03-18', status: 'K řešení', recurrence: 'Jednorázový' },
]

export function loadTasks() {
  const stored = localStorage.getItem('ppc_tasks')
  if (!stored) {
    localStorage.setItem('ppc_tasks', JSON.stringify(SEED_TASKS))
    return SEED_TASKS
  }
  return JSON.parse(stored)
}

export function saveTasks(tasks) {
  localStorage.setItem('ppc_tasks', JSON.stringify(tasks))
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
