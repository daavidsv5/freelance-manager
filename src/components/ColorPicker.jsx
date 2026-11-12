import { Check } from 'lucide-react'
import { COLORS } from '../data/clientColors'

export default function ColorPicker({ value, onChange, size = 'md' }) {
  const box = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLORS.map(c => (
        <button
          key={c.key}
          type="button"
          title={c.label}
          onClick={() => onChange(c.key)}
          className={`${box} rounded-full ${c.dot} flex items-center justify-center transition-transform hover:scale-110 ${
            value === c.key ? 'ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-800' : ''
          }`}
        >
          {value === c.key && <Check className="w-3 h-3 text-white drop-shadow" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}
