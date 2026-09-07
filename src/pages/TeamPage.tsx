import { BriefcaseBusiness, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { useModuleRuntime } from '../core/ModuleRuntimeContext'

const suggestedJobs = [
  'Reception',
  'Facchino',
  'Cameriere/a ai piani',
  'Bar',
  'Cameriere colazione',
  'Governante',
  'Addetto/a alle prenotazioni',
  'Bar Manager',
  'Front Office Manager',
  'Sales Manager',
  'Rooms Division Manager',
]

export function TeamPage() {
  const runtime = useModuleRuntime()
  const propertyName = runtime.property?.name ?? 'Struttura'
  const name = runtime.profile?.fullName ?? 'Utente Hotsflow'

  return (
    <div className="page-stack shell-page team-page">
      <header className="page-heading split">
        <div>
          <p className="eyebrow">{propertyName}</p>
          <h1>Team</h1>
          <p>Persone, accessi Hotsflow e mansioni operative della struttura.</p>
        </div>
        <button className="primary-action" type="button" disabled title="Inviti disponibili nel prossimo pass backend"><UserPlus size={17} /> Invita persona</button>
      </header>

      <section className="shell-card team-principle-card">
        <div className="icon-tile"><ShieldCheck size={20} /></div>
        <div>
          <strong>Accesso e mansione sono separati</strong>
          <p>Il ruolo Hotsflow decide cosa si può fare nel software. La mansione descrive il lavoro reale in hotel e può essere personalizzata dalla struttura.</p>
        </div>
      </section>

      <section className="shell-card">
        <div className="section-heading split">
          <div><h2>Persone</h2><p>Il team collegato a {propertyName}.</p></div>
          <span className="status-chip">1 profilo visibile</span>
        </div>
        <div className="team-table" role="table" aria-label="Team">
          <div className="team-row team-row-head" role="row"><span>Persona</span><span>Accesso Hotsflow</span><span>Mansione</span><span>Stato</span></div>
          <div className="team-row" role="row">
            <span className="team-person"><span className="mini-avatar">{name.trim().split(/\s+/).map((part) => part[0]).slice(0,2).join('').toUpperCase()}</span><strong>{name}</strong></span>
            <span>Ruolo Core</span>
            <span className="muted">Da assegnare</span>
            <span><span className="status-dot" /> Attivo</span>
          </div>
        </div>
        <p className="section-footnote">La lista completa verrà letta dal Core Team API; qui non mostriamo dati fittizi.</p>
      </section>

      <section className="shell-card">
        <div className="section-heading split">
          <div><h2>Mansioni della struttura</h2><p>Il Property Admin potrà attivare solo quelle utili e crearne di nuove.</p></div>
          <button className="secondary-action" type="button" disabled><Plus size={16} /> Nuova mansione</button>
        </div>
        <div className="job-role-grid">
          {suggestedJobs.map((job) => <div className="job-role-chip" key={job}><BriefcaseBusiness size={15} /><span>{job}</span></div>)}
        </div>
        <div className="inline-note"><Users size={16} /><span>Questi sono suggerimenti UI, non ruoli globali obbligatori.</span></div>
      </section>
    </div>
  )
}
