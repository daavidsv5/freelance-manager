// Sloučení dat, když se mezi dvěma synchronizacemi změnila data na tomto zařízení i v cloudu
// (typicky úpravy offline na dvou zařízeních). Porovnává se proti poslední společné verzi (base):
//   - co se změnilo jen na jedné straně, převezme se z té strany,
//   - co se změnilo na obou stranách, vyhraje toto zařízení,
//   - smazaná položka zůstane smazaná, pokud ji druhá strana mezitím neupravila.
// Jednotkou je celý záznam (klient, sloupec, úkol, seznam v To do listu).

const COLLECTIONS = ['clients', 'columns', 'tasks', 'todo']

const byId = arr => new Map((arr || []).map(x => [x.id, x]))
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function mergeCollection(base, local, remote) {
  const B = byId(base)
  const L = byId(local)
  const R = byId(remote)

  function pick(id) {
    const b = B.get(id)
    const l = L.get(id)
    const r = R.get(id)
    if (!b) return l ?? r
    if (!l) return same(r, b) ? undefined : r
    if (!r) return same(l, b) ? undefined : l
    return same(l, b) ? r : l
  }

  // Pořadí podle tohoto zařízení, položky známé jen z cloudu se přidají na konec
  const result = []
  const seen = new Set()
  for (const x of [...(local || []), ...(remote || [])]) {
    if (seen.has(x.id)) continue
    seen.add(x.id)
    const v = pick(x.id)
    if (v) result.push(v)
  }
  return result
}

// Sjednocení dvou verzí bez společného základu (obnova odložených dat): nic se nesmaže,
// položky z preferred mají přednost, položky jen z other se přidají na konec.
export function unionData(preferred, other) {
  return Object.fromEntries(COLLECTIONS.map(k => {
    const ids = new Set((preferred[k] || []).map(x => x.id))
    return [k, [...(preferred[k] || []), ...(other[k] || []).filter(x => !ids.has(x.id))]]
  }))
}

export function mergeData(base, local, remote) {
  return Object.fromEntries(COLLECTIONS.map(k => [k, mergeCollection(base[k], local[k], remote[k])]))
}
