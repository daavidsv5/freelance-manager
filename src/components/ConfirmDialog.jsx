import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function ConfirmDialog({ title, message, confirmLabel = 'Potvrdit', danger = true, onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full flex-shrink-0 ${danger ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
            {message && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 whitespace-pre-line">{message}</p>}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Zrušit
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className={`flex-1 text-white text-sm py-2 rounded-xl transition-colors font-medium ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
