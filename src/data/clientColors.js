const PALETTE = [
  // 0: Sportega → modrá
  { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200',     solid: 'bg-blue-500 text-white' },
  // 1: Flystork → světle zelená
  { dot: 'bg-green-300',  badge: 'bg-green-50 text-green-600 border-green-200',   solid: 'bg-green-400 text-white' },
  // 2: Bioprodukt JT → hnědá
  { dot: 'bg-stone-500',  badge: 'bg-stone-50 text-stone-700 border-stone-200',   solid: 'bg-stone-500 text-white' },
  // 3: Sardinerie → tmavě modrá
  { dot: 'bg-blue-800',   badge: 'bg-blue-100 text-blue-900 border-blue-300',     solid: 'bg-blue-800 text-white' },
  // 4: OneClub → červená
  { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',         solid: 'bg-red-500 text-white' },
  // 5: PEF Mendelu → světle modrá
  { dot: 'bg-sky-300',    badge: 'bg-sky-50 text-sky-600 border-sky-200',         solid: 'bg-sky-400 text-white' },
  // 6: Celtic → tmavě zelená
  { dot: 'bg-green-700',  badge: 'bg-green-100 text-green-900 border-green-300',  solid: 'bg-green-700 text-white' },
  // 7: Přirozený běh → oranžová
  { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200',solid: 'bg-orange-400 text-white' },
  // 8: Colortap → tmavě oranžová
  { dot: 'bg-orange-600', badge: 'bg-orange-100 text-orange-800 border-orange-300',solid: 'bg-orange-600 text-white' },
  // 9: Tiny House → šedá
  { dot: 'bg-gray-400',   badge: 'bg-gray-50 text-gray-600 border-gray-200',      solid: 'bg-gray-500 text-white' },
  // 10: Zboží z Bali → růžová
  { dot: 'bg-pink-400',   badge: 'bg-pink-50 text-pink-700 border-pink-200',      solid: 'bg-pink-400 text-white' },
  // 11: (rezerva)
  { dot: 'bg-violet-400', badge: 'bg-violet-50 text-violet-700 border-violet-200',solid: 'bg-violet-400 text-white' },
]

// Deterministická barva podle indexu klienta v poli
export function getClientColor(clients, clientId) {
  const index = clients.findIndex(c => c.id === clientId)
  if (index === -1) return PALETTE[0]
  return PALETTE[index % PALETTE.length]
}
