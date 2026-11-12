// Paleta barevných štítků pro klienty i sloupce.
// Třídy musí být napsané celé (ne skládané), aby je Tailwind našel při buildu.
export const COLORS = [
  { key: 'blue',        label: 'Modrá',         dot: 'bg-blue-500',   solid: 'bg-blue-500 text-white' },
  { key: 'navy',        label: 'Tmavě modrá',   dot: 'bg-blue-800',   solid: 'bg-blue-800 text-white' },
  { key: 'sky',         label: 'Světle modrá',  dot: 'bg-sky-300',    solid: 'bg-sky-400 text-white' },
  { key: 'teal',        label: 'Tyrkysová',     dot: 'bg-teal-500',   solid: 'bg-teal-500 text-white' },
  { key: 'green-light', label: 'Světle zelená', dot: 'bg-green-300',  solid: 'bg-green-400 text-white' },
  { key: 'green',       label: 'Tmavě zelená',  dot: 'bg-green-700',  solid: 'bg-green-700 text-white' },
  { key: 'yellow',      label: 'Žlutá',         dot: 'bg-yellow-400', solid: 'bg-yellow-400 text-yellow-950' },
  { key: 'orange',      label: 'Oranžová',      dot: 'bg-orange-400', solid: 'bg-orange-400 text-white' },
  { key: 'orange-dark', label: 'Tmavě oranžová',dot: 'bg-orange-600', solid: 'bg-orange-600 text-white' },
  { key: 'red',         label: 'Červená',       dot: 'bg-red-500',    solid: 'bg-red-500 text-white' },
  { key: 'pink',        label: 'Růžová',        dot: 'bg-pink-400',   solid: 'bg-pink-400 text-white' },
  { key: 'violet',      label: 'Fialová',       dot: 'bg-violet-400', solid: 'bg-violet-400 text-white' },
  { key: 'brown',       label: 'Hnědá',         dot: 'bg-stone-500',  solid: 'bg-stone-500 text-white' },
  { key: 'gray',        label: 'Šedá',          dot: 'bg-gray-400',   solid: 'bg-gray-500 text-white' },
]

const BY_KEY = Object.fromEntries(COLORS.map(c => [c.key, c]))

// Pořadí barev ve staré verzi (barva podle pořadí klienta) – použito při převodu dat.
export const LEGACY_ORDER = [
  'blue', 'green-light', 'brown', 'navy', 'red', 'sky',
  'green', 'orange', 'orange-dark', 'gray', 'pink', 'violet',
]

export function getColor(key) {
  return BY_KEY[key] || BY_KEY.gray
}

export function getClientColor(clients, clientId) {
  const client = clients.find(c => c.id === clientId)
  return getColor(client?.color)
}

// První barva, kterou ještě nikdo nepoužívá (pro nového klienta)
export function nextFreeColor(items) {
  const used = new Set(items.map(i => i.color))
  return (COLORS.find(c => !used.has(c.key)) || COLORS[items.length % COLORS.length]).key
}
