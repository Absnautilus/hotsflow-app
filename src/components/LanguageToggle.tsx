import { useEffect, useRef, useState } from 'react'
import { FlagIcon } from './FlagIcon'

type Lang = 'it' | 'en'

const LABELS: Record<Lang, string> = { it: 'Italiano', en: 'English' }

function readStoredLanguage(): Lang {
  return localStorage.getItem('hotsflow.language') === 'en' ? 'en' : 'it'
}

// Self-contained flag-based language switcher: reads/writes the same
// localStorage key and custom event as before, so every instance on the
// page (Settings, account menu) stays in sync without prop plumbing.
export function LanguageToggle({ align = 'left' }: { align?: 'left' | 'right' } = {}) {
  const [language, setLanguageState] = useState<Lang>(readStoredLanguage)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function syncLanguage(event: Event) {
      const next = (event as CustomEvent<string>).detail
      if (next === 'it' || next === 'en') setLanguageState(next)
    }
    window.addEventListener('hotsflow:language-change', syncLanguage)
    return () => window.removeEventListener('hotsflow:language-change', syncLanguage)
  }, [])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function select(next: Lang) {
    localStorage.setItem('hotsflow.language', next)
    setLanguageState(next)
    window.dispatchEvent(new CustomEvent('hotsflow:language-change', { detail: next }))
    setOpen(false)
  }

  return (
    <div className="lang-toggle" ref={rootRef}>
      <button
        type="button"
        className="lang-toggle-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Lingua: ${LABELS[language]}`}
        onClick={() => setOpen((value) => !value)}
      >
        <FlagIcon code={language} />
      </button>
      {open && (
        <ul role="listbox" className={`lang-toggle-panel${align === 'right' ? ' align-right' : ''}`}>
          {(['it', 'en'] as const).map((code) => (
            <li
              key={code}
              role="option"
              aria-selected={code === language}
              className={`lang-toggle-option${code === language ? ' current' : ''}`}
              onClick={() => select(code)}
            >
              <FlagIcon code={code} />
              <span>{LABELS[code]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
