import { useState } from 'react'
import { Cloud, CloudOff, RefreshCw, AlertCircle, LogIn, LogOut } from 'lucide-react'

const STATUS = {
  idle: { icon: Cloud, label: 'Připojuji…', className: 'text-slate-400' },
  syncing: { icon: RefreshCw, label: 'Synchronizuji…', className: 'text-slate-400', spin: true },
  synced: { icon: Cloud, label: 'Synchronizováno', className: 'text-green-600 dark:text-green-400' },
  offline: { icon: CloudOff, label: 'Offline, uloží se po připojení', className: 'text-amber-600 dark:text-amber-400' },
  error: { icon: AlertCircle, label: 'Synchronizace selhala', className: 'text-red-600 dark:text-red-400' },
}

const inputClass = 'w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100'

function LoginForm({ onSignIn, onCancel }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setBusy(true)
    setError('')
    const err = await onSignIn(email, password)
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <form onSubmit={handleSubmit} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 flex flex-col gap-2">
      <input
        autoFocus
        type="email"
        autoComplete="username"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="E-mail"
        className={inputClass}
      />
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Heslo"
        className={inputClass}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-1">
        <button type="submit" disabled={busy} className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
          {busy ? 'Přihlašuji…' : 'Přihlásit'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
          Zrušit
        </button>
      </div>
    </form>
  )
}

function BackupNotice({ backup, onRestore, onDiscard }) {
  const n = backup.data.tasks.length
  const when = backup.savedAt
    ? new Date(backup.savedAt).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''
  return (
    <div className="mt-2 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
      <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-snug">
        Na tomto zařízení jsou odložená data z doby před přihlášením ({when}, {n} úkolů).
      </p>
      <div className="flex gap-1 mt-2">
        <button onClick={onRestore} className="flex-1 bg-amber-600 text-white text-xs py-1.5 rounded-lg hover:bg-amber-700 transition-colors">
          Obnovit
        </button>
        <button onClick={onDiscard} className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
          Zahodit
        </button>
      </div>
    </div>
  )
}

export default function SyncPanel({ cloud, onRestoreBackup, onDiscardBackup }) {
  const [loginOpen, setLoginOpen] = useState(false)
  if (!cloud.enabled || !cloud.authReady) return null

  let content
  if (!cloud.email) {
    content = loginOpen ? (
      <LoginForm onSignIn={cloud.signIn} onCancel={() => setLoginOpen(false)} />
    ) : (
      <button
        onClick={() => setLoginOpen(true)}
        title="Přihlaste se a úkoly uvidíte na všech zařízeních"
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 py-2 rounded-lg transition-colors"
      >
        <LogIn className="w-3.5 h-3.5" /> Přihlásit pro synchronizaci
      </button>
    )
  } else {
    const s = STATUS[cloud.status] || STATUS.idle
    const Icon = s.icon
    content = (
      <div className="px-2">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${s.className}`}>
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${s.spin ? 'animate-spin' : ''}`} />
          <span className="flex-1 truncate">{s.label}</span>
          {cloud.status === 'error' && (
            <button onClick={cloud.retry} className="underline hover:no-underline flex-shrink-0">Zkusit znovu</button>
          )}
        </div>
        {cloud.status === 'error' && cloud.error && (
          <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 break-words">{cloud.error}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex-1" title={cloud.email}>{cloud.email}</span>
          <button
            onClick={() => { setLoginOpen(false); cloud.signOut() }}
            title="Odhlásit (data v tomto zařízení zůstanou)"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700 flex-shrink-0"
          >
            <LogOut className="w-3 h-3" /> Odhlásit
          </button>
        </div>
        {cloud.localBackup && (
          <BackupNotice backup={cloud.localBackup} onRestore={onRestoreBackup} onDiscard={onDiscardBackup} />
        )}
      </div>
    )
  }

  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">Synchronizace</p>
      {content}
    </div>
  )
}
