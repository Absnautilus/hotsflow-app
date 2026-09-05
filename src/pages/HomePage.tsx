import { ArrowRight, CalendarDays, Hotel, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useModuleRuntime } from '../core/ModuleRuntimeContext'

const moduleCatalog = [
  { slug: 'guest_requests', title: 'Housekeeping', description: 'Richieste ospiti e operatività camere.', path: '/housekeeping', icon: Hotel },
  { slug: 'shifts', title: 'Turni', description: 'Pianificazione e copertura dei turni.', path: '/turni', icon: CalendarDays },
  { slug: 'transfers', title: 'Transfer', description: 'Gestione transfer e spostamenti ospiti.', path: '/transfer', icon: Wrench },
]

export function HomePage() {
  const runtime = useModuleRuntime()
  const enabled = new Set(runtime.entitlements.filter((item) => item.enabled).map((item) => item.slug))
  const modules = moduleCatalog.filter((module) => enabled.has(module.slug))

  return (
    <div className="page-stack">
      <section className="page-heading">
        <p className="eyebrow">{runtime.property?.name}</p>
        <h1>Home</h1>
        <p className="page-subtitle">Una vista rapida su ciò che richiede attenzione.</p>
      </section>
      <section className="module-grid">
        {modules.map((module) => (
          <article className="module-card" key={module.title}>
            <div className="module-card-top">
              <div className="module-icon"><module.icon size={20} /></div>
              <span className="status-pill">Attivo</span>
            </div>
            <div><h2>{module.title}</h2><p>{module.description}</p></div>
            <Link className="card-link" to={module.path}>Apri <ArrowRight size={16} /></Link>
          </article>
        ))}
      </section>
      <section className="attention-card">
        <div><p className="eyebrow">Attenzione</p><h2>Nessuna criticità urgente</h2><p>Gli stati operativi cross-modulo verranno collegati nei prossimi step.</p></div>
      </section>
    </div>
  )
}
