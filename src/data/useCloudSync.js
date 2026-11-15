import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { normalizeData, generateId, DATA_VERSION } from './storage'
import { mergeData } from './merge'

// ---------------------------------------------------------------------------
// Synchronizace přes Supabase
//   Tabulka app_state: jeden řádek na uživatele, sloupec data (jsonb) = { version, rev, savedAt,
//   clients, columns, tasks, todo }. rev je náhodné ID verze, mění se při každém uložení.
//   Lokálně si zařízení pamatuje, ze které verze cloudu vychází (META_KEY.rev) a jak ta data
//   vypadala (BASE_KEY). Díky tomu pozná, co se změnilo u něj a co v cloudu, a umí to sloučit.
//   Data dál zůstávají i v localStorage, aplikace tak funguje offline.
// ---------------------------------------------------------------------------

const TABLE = 'app_state'
const META_KEY = 'ppc_sync' // { userId, rev }
const BASE_KEY = 'ppc_sync_base' // data poslední synchronizované verze (JSON)
const BACKUP_KEY = 'ppc_backup_pred_sync' // lokální data zařízení před prvním převzetím dat z cloudu

const pickData = s => ({ clients: s.clients, columns: s.columns, tasks: s.tasks, todo: s.todo })
const serialize = s => JSON.stringify(pickData(s))

function readMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) || {}
  } catch {
    return {}
  }
}

function readBase(userId) {
  return readMeta().userId === userId ? localStorage.getItem(BASE_KEY) : null
}

function saveSynced(userId, rev, data) {
  localStorage.setItem(BASE_KEY, serialize(data))
  localStorage.setItem(META_KEY, JSON.stringify({ userId, rev }))
}

// Odložená data zařízení z doby před prvním přihlášením (null = nejsou)
function readLocalBackup() {
  try {
    const raw = JSON.parse(localStorage.getItem(BACKUP_KEY))
    if (!raw || !Array.isArray(raw.tasks)) return null
    return { savedAt: raw.savedAt, data: normalizeData(raw) }
  } catch {
    return null
  }
}

function errorMessage(err) {
  const msg = err?.message || String(err)
  if (/failed to fetch|network|load failed/i.test(msg)) return 'Nepodařilo se spojit se serverem.'
  return msg
}

function createEngine({ getState, applyData, setStatus, setError, onBackup }) {
  let userId = null
  let queue = Promise.resolve()

  async function fetchRemote(uid) {
    const { data, error } = await supabase.from(TABLE).select('data').eq('user_id', uid).maybeSingle()
    if (error) throw error
    return data?.data ?? null
  }

  // Uloží data do cloudu. expectedRev = verze, ze které data vycházejí; když už v cloudu mezitím
  // je jiná, nic se nepřepíše a vrátí se false (pak se data nejdřív sloučí).
  async function push(uid, data, expectedRev) {
    const rev = generateId()
    const savedAt = new Date().toISOString()
    const payload = { version: DATA_VERSION, rev, savedAt, ...pickData(data) }
    if (expectedRev) {
      const { data: rows, error } = await supabase
        .from(TABLE)
        .update({ data: payload, updated_at: savedAt })
        .eq('user_id', uid)
        .eq('data->>rev', expectedRev)
        .select('user_id')
      if (error) throw error
      if (!rows.length) return false
    } else {
      const { error } = await supabase.from(TABLE).insert({ user_id: uid, data: payload, updated_at: savedAt })
      if (error) {
        if (error.code === '23505') return false // řádek mezitím vytvořilo jiné zařízení
        throw error
      }
    }
    saveSynced(uid, rev, data)
    return true
  }

  function applyRemote(uid, remote) {
    const data = normalizeData(remote)
    saveSynced(uid, remote.rev, data)
    applyData(data)
  }

  async function sync() {
    const uid = userId
    if (!uid) return
    if (!navigator.onLine) {
      setStatus('offline')
      return
    }
    setStatus('syncing')
    for (let attempt = 0; attempt < 4; attempt++) {
      const remote = await fetchRemote(uid)
      if (uid !== userId) return // mezitím odhlášeno
      const local = getState()
      const localJson = serialize(local)
      const base = readBase(uid)
      const meta = readMeta()

      // Cloud je prázdný: nahrají se data z tohoto zařízení
      if (!remote) {
        if (await push(uid, local, null)) break
        continue
      }

      // První synchronizace na tomto zařízení: platí data z cloudu, lokální se odloží do zálohy
      if (!base) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify({ savedAt: new Date().toISOString(), ...pickData(local) }))
        applyRemote(uid, remote)
        onBackup()
        break
      }

      const dirty = localJson !== base

      // Cloud se nezměnil: případně odešlou lokální změny
      if (remote.rev === meta.rev) {
        if (!dirty || (await push(uid, local, meta.rev))) break
        continue
      }

      // V cloudu je novější verze a lokálně nic nového: převezme se
      if (!dirty) {
        if (serialize(getState()) !== localJson) continue // uživatel mezitím něco změnil
        applyRemote(uid, remote)
        break
      }

      // Změny na obou stranách: sloučí se
      const merged = normalizeData(mergeData(JSON.parse(base), pickData(local), pickData(remote)))
      if (await push(uid, merged, remote.rev)) {
        applyData(merged)
        break
      }
    }
    setError('')
    setStatus('synced')
  }

  function run() {
    queue = queue
      .then(sync)
      .catch(err => {
        console.error('Synchronizace selhala', err)
        if (!navigator.onLine) {
          setStatus('offline')
        } else {
          setError(errorMessage(err))
          setStatus('error')
        }
      })
    return queue
  }

  return {
    run,
    setUser(id) {
      userId = id
    },
    isDirty() {
      return userId != null && serialize(getState()) !== readBase(userId)
    },
  }
}

function ensureEngine(engineRef, stateRef, applyRef, setStatus, setError, setLocalBackup) {
  if (!supabase) return null
  if (!engineRef.current) {
    engineRef.current = createEngine({
      getState: () => stateRef.current,
      applyData: data => applyRef.current(data),
      setStatus,
      setError,
      onBackup: () => setLocalBackup(readLocalBackup()),
    })
  }
  return engineRef.current
}

// Vrací stav přihlášení a synchronizace. applyData(data) nahradí data aplikace daty z cloudu.
export function useCloudSync(state, applyData) {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(!supabase)
  const [status, setStatus] = useState('idle') // idle | syncing | synced | offline | error
  const [error, setError] = useState('')
  const [localBackup, setLocalBackup] = useState(readLocalBackup)

  const stateRef = useRef(state)
  const applyRef = useRef(applyData)
  useLayoutEffect(() => {
    stateRef.current = state
    applyRef.current = applyData
  })

  // Synchronizace se vytváří až v efektu (ne během vykreslení), pak se drží v refu
  const engineRef = useRef(null)
  const getEngine = () => ensureEngine(engineRef, stateRef, applyRef, setStatus, setError, setLocalBackup)

  const userId = session?.user?.id ?? null

  // Přihlášení (sezení se pamatuje v localStorage, obnoví se samo)
  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setAuthReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Po přihlášení: první synchronizace, živé změny z jiných zařízení, návrat do aplikace, připojení k síti
  useEffect(() => {
    const engine = ensureEngine(engineRef, stateRef, applyRef, setStatus, setError, setLocalBackup)
    if (!engine) return
    engine.setUser(userId)
    if (!userId) return
    engine.run()

    const channel = supabase
      .channel(`app_state_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` }, () => engine.run())
      .subscribe()

    const onVisibility = () => {
      if (document.visibilityState === 'visible' || engine.isDirty()) engine.run()
    }
    const onOnline = () => engine.run()
    const onOffline = () => setStatus('offline')
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [userId])

  // Lokální změna: po krátké pauze se odešle do cloudu
  const { clients, columns, tasks, todo } = state
  useEffect(() => {
    const engine = ensureEngine(engineRef, stateRef, applyRef, setStatus, setError, setLocalBackup)
    if (!engine || !userId || !engine.isDirty()) return
    const t = setTimeout(() => engine.run(), 800)
    return () => clearTimeout(t)
  }, [userId, clients, columns, tasks, todo])

  async function signIn(email, password) {
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (!err) return null
    if (/invalid login credentials/i.test(err.message)) return 'Nesprávný e-mail nebo heslo.'
    if (/email not confirmed/i.test(err.message)) return 'E-mail ještě není potvrzený.'
    return errorMessage(err)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    enabled: !!supabase,
    authReady,
    email: session?.user?.email ?? null,
    status,
    error,
    signIn,
    signOut,
    retry: () => getEngine()?.run(),
    localBackup,
    // Odložená data se po obnovení nebo zahození jen přejmenují, aby se nedala přepsat
    clearLocalBackup() {
      const raw = localStorage.getItem(BACKUP_KEY)
      if (raw) localStorage.setItem(`${BACKUP_KEY}_${Date.now()}`, raw)
      localStorage.removeItem(BACKUP_KEY)
      setLocalBackup(null)
    },
  }
}
