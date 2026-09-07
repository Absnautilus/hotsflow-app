import type { ReactNode } from 'react'
import { Bell, Building2, ChevronRight, Globe2, LockKeyhole, Puzzle, UserRound } from 'lucide-react'
import { useModuleRuntime } from '../core/ModuleRuntimeContext'

export function SettingsPage() {
  const runtime = useModuleRuntime()
  const propertyName = runtime.property?.name ?? 'Struttura'
  const profileName = runtime.profile?.fullName ?? 'Utente Hotsflow'
  const language = localStorage.getItem('hotsflow.language') === 'en' ? 'English' : 'Italiano'

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
          <SettingRow title="Informazioni struttura" detail={propertyName} />
          <SettingRow title="Preferenze operative" detail="Fuso orario, formati e impostazioni comuni" />
        </div>
      </section>

      <section className="settings-section" id="account">
        <div className="settings-section-title"><UserRound size={18} /><div><h2>Account</h2><p>Preferenze personali valide in tutta la suite.</p></div></div>
        <div className="settings-list shell-card">
          <SettingRow icon={<UserRound size={17} />} title="Profilo" detail={profileName} />
          <SettingRow icon={<Globe2 size={17} />} title="Lingua" detail={language} />
          <SettingRow icon={<Bell size={17} />} title="Notifiche" detail="Preferenze globali" />
          <SettingRow icon={<LockKeyhole size={17} />} title="Sicurezza" detail="Password e sessioni" />
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title"><Puzzle size={18} /><div><h2>Impostazioni moduli</h2><p>Configurazioni specifiche, senza duplicare le preferenze globali.</p></div></div>
        <div className="settings-list shell-card">
          <SettingRow title="Housekeeping" detail="Categorie, richieste e configurazione operativa" />
          <SettingRow title="Turni" detail="Disponibile dopo l'integrazione del modulo" muted />
          <SettingRow title="Transfer" detail="Disponibile dopo l'integrazione del modulo" muted />
        </div>
      </section>
    </div>
  )
}

function SettingRow({ title, detail, icon, muted = false }: { title: string; detail: string; icon?: ReactNode; muted?: boolean }) {
  return (
    <button className={`settings-row${muted ? ' muted' : ''}`} type="button" disabled={muted}>
      <span className="settings-row-main">{icon ? <span className="settings-row-icon">{icon}</span> : null}<span><strong>{title}</strong><small>{detail}</small></span></span>
      <ChevronRight size={17} />
    </button>
  )
}
