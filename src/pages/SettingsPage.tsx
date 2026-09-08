import { useEffect, useState, type ReactNode } from 'react'
import { Bell, Building2, ChevronRight, Globe2, LockKeyhole, Puzzle, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useModuleRuntime } from '../core/ModuleRuntimeContext'

export function SettingsPage() {
  const runtime = useModuleRuntime()
  const propertyName = runtime.property?.name ?? 'Struttura'
  const profileName = runtime.profile?.fullName ?? 'Utente Hotsflow'
  const [language, setLanguage] = useState(() => localStorage.getItem('hotsflow.language') === 'en' ? 'en' : 'it')

  useEffect(() => {
    function syncLanguage(event: Event) {
      const next = (event as CustomEvent<string>).detail
      if (next === 'it' || next === 'en') setLanguage(next)
    }
    window.addEventListener('hotsflow:language-change', syncLanguage)
    return () => window.removeEventListener('hotsflow:language-change', syncLanguage)
  }, [])

  function selectLanguage(next: 'it' | 'en') {
    localStorage.setItem('hotsflow.language', next)
    setLanguage(next)
    window.dispatchEvent(new CustomEvent('hotsflow:language-change', { detail: next }))
  }

  return (
    <div className="page-stack shell-page settings-page">
      <header className="page-heading">
        <p className="eyebrow">Hotsflow</p>
        <h1>Impostazioni</h1>
        <p>Preferenze della struttura, del tuo account e dei moduli.</p>
      </header>

      <section className="settings-section">
        <div className="settings-section-title"><Building2 size={18} /><div><h2>Struttura</h2><p>Configurazione condivisa di {propertyName}.</p></div></div>
        <div className="settings-list shell-card">
          <SettingRow title="Informazioni struttura" detail={propertyName} status="Sola lettura" />
          <SettingRow title="Preferenze operative" detail="Fuso orario, formati e impostazioni comuni" status="Non ancora disponibile" muted />
        </div>
      </section>

      <section className="settings-section" id="account">
        <div className="settings-section-title"><UserRound size={18} /><div><h2>Account</h2><p>Preferenze personali valide in tutta la suite.</p></div></div>
        <div className="settings-list shell-card">
          <SettingRow icon={<UserRound size={17} />} title="Profilo" detail={profileName} status="Sola lettura" />
          <div className="settings-row settings-row-control">
            <span className="settings-row-main"><span className="settings-row-icon"><Globe2 size={17} /></span><span><strong>Lingua</strong><small>{language === 'en' ? 'English' : 'Italiano'}</small></span></span>
            <div className="language-segment" aria-label="Lingua della suite">
              <button type="button" className={language === 'it' ? 'active' : ''} aria-pressed={language === 'it'} onClick={() => selectLanguage('it')}>IT</button>
              <button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => selectLanguage('en')}>EN</button>
            </div>
          </div>
          <SettingRow icon={<Bell size={17} />} title="Notifiche" detail="Preferenze globali" status="Non ancora disponibile" muted />
          <SettingRow icon={<LockKeyhole size={17} />} title="Sicurezza" detail="Password e sessioni" status="Non ancora disponibile" muted />
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title"><Puzzle size={18} /><div><h2>Impostazioni moduli</h2><p>Configurazioni specifiche, senza duplicare le preferenze globali.</p></div></div>
        <div className="settings-list shell-card">
          <SettingRow title="Housekeeping" detail="Categorie, richieste e configurazione operativa" to="/housekeeping/admin/menu" />
          <SettingRow title="Turni" detail="Disponibile dopo l'integrazione del modulo" status="Non ancora disponibile" muted />
          <SettingRow title="Transfer" detail="Disponibile dopo l'integrazione del modulo" status="Non ancora disponibile" muted />
        </div>
      </section>
    </div>
  )
}

type SettingRowProps = {
  title: string
  detail: string
  icon?: ReactNode
  muted?: boolean
  status?: string
  to?: string
}

function SettingRow({ title, detail, icon, muted = false, status, to }: SettingRowProps) {
  const content = (
    <>
      <span className="settings-row-main">{icon ? <span className="settings-row-icon">{icon}</span> : null}<span><strong>{title}</strong><small>{detail}</small></span></span>
      {to ? <ChevronRight size={17} /> : <span className="settings-row-status">{status}</span>}
    </>
  )

  if (to) return <Link className="settings-row" to={to}>{content}</Link>
  return <div className={`settings-row settings-row-static${muted ? ' muted' : ''}`}>{content}</div>
}
