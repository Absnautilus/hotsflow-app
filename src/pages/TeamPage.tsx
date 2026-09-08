import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { CoreRole, JobTitle, MembershipStatus, TeamMember } from '@hotsflow/core-sdk'
import { BriefcaseBusiness, Pencil, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { Modal } from '../components/Modal'
import { core } from '../core/client'
import { useModuleRuntime } from '../core/ModuleRuntimeContext'

const suggestedJobs = [
  'Reception', 'Facchino', 'Cameriere/a ai piani', 'Bar', 'Cameriere colazione',
  'Governante', 'Addetto/a alle prenotazioni', 'Bar Manager', 'Front Office Manager',
  'Sales Manager', 'Rooms Division Manager',
]

type TeamState = { members: TeamMember[]; roles: CoreRole[]; jobTitles: JobTitle[]; canManage: boolean }
const emptyTeam: TeamState = { members: [], roles: [], jobTitles: [], canManage: false }

export function TeamPage() {
  const runtime = useModuleRuntime()
  const property = runtime.property
  const [team, setTeam] = useState<TeamState>(emptyTeam)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [jobEditor, setJobEditor] = useState<JobTitle | 'new' | null>(null)

  const loadTeam = useCallback(async () => {
    if (!property) return
    setLoading(true); setError(null)
    try {
      const [members, roles, jobTitles, canManage] = await Promise.all([
        core.getTeamMembers(property.id), core.getPropertyRoles(), core.getJobTitles(property.id),
        runtime.hasPermission('core.staff.manage'),
      ])
      setTeam({ members, roles, jobTitles, canManage })
    } catch (cause) { setError(readableError(cause)) }
    finally { setLoading(false) }
  }, [property, runtime.hasPermission])

  useEffect(() => { void loadTeam() }, [loadTeam])

  const currentMember = team.members.find((member) => member.profile.id === runtime.profile?.id)
  const assignableRoles = team.roles.filter((role) => role.rank < (currentMember?.role.rank ?? 0))
  const propertyName = property?.name ?? 'Struttura'

  return (
    <div className="page-stack shell-page team-page">
      <header className="page-heading split">
        <div><p className="eyebrow">{propertyName}</p><h1>Team</h1><p>Persone, accessi Hotsflow e mansioni operative della struttura.</p></div>
        {team.canManage ? <button className="primary-action" type="button" onClick={() => setInviteOpen(true)}><UserPlus size={17} /> Invita persona</button> : null}
      </header>

      <section className="shell-card team-principle-card">
        <div className="icon-tile"><ShieldCheck size={20} /></div>
        <div><strong>Accesso e mansione sono separati</strong><p>Il ruolo Hotsflow decide cosa si può fare nel software. La mansione descrive il lavoro reale in hotel e può essere personalizzata dalla struttura.</p></div>
      </section>

      {error ? <div className="shell-alert error" role="alert">{error}<button type="button" onClick={() => void loadTeam()}>Riprova</button></div> : null}

      <section className="shell-card">
        <div className="section-heading split">
          <div><h2>Persone</h2><p>Il team collegato a {propertyName}.</p></div>
          <span className="status-chip">{loading ? 'Caricamento…' : `${team.members.length} ${team.members.length === 1 ? 'profilo' : 'profili'}`}</span>
        </div>
        <div className="team-table" role="table" aria-label="Team">
          <div className="team-row team-row-head" role="row"><span>Persona</span><span>Accesso Hotsflow</span><span>Mansione</span><span>Stato</span><span aria-hidden="true" /></div>
          {!loading && team.members.map((member) => (
            <div className="team-row" role="row" key={member.membership.id}>
              <span className="team-person"><span className="mini-avatar">{initials(member.profile.fullName)}</span><strong>{member.profile.fullName}</strong></span>
              <span>{roleLabel(member.role.slug, member.role.displayName)}</span>
              <span className={member.jobTitle ? '' : 'muted'}>{member.jobTitle?.name ?? 'Da assegnare'}</span>
              <span><span className={`status-dot ${member.membership.status !== 'active' || member.employmentStatus !== 'active' ? 'inactive' : ''}`} /> {memberStatus(member)}</span>
              <span>{team.canManage ? <button className="row-action" type="button" onClick={() => setEditing(member)} aria-label={`Modifica ${member.profile.fullName}`}><Pencil size={15} /></button> : null}</span>
            </div>
          ))}
        </div>
        {!loading && team.members.length === 0 ? <div className="team-empty"><Users size={22} /><p>Nessuna persona collegata a questa struttura.</p></div> : null}
      </section>

      <section className="shell-card">
        <div className="section-heading split">
          <div><h2>Mansioni della struttura</h2><p>Attiva solo quelle utili o creane di specifiche per l’hotel.</p></div>
          {team.canManage ? <button className="secondary-action" type="button" onClick={() => setJobEditor('new')}><Plus size={16} /> Nuova mansione</button> : null}
        </div>
        <div className="job-role-grid">
          {team.jobTitles.filter((job) => job.active).map((job) => team.canManage
            ? <button className="job-role-chip active" type="button" key={job.id} onClick={() => setJobEditor(job)}><BriefcaseBusiness size={15} /><span>{job.name}</span><Pencil size={12} /></button>
            : <div className="job-role-chip active" key={job.id}><BriefcaseBusiness size={15} /><span>{job.name}</span></div>)}
          {team.jobTitles.filter((job) => job.active).length === 0 ? <span className="muted">Nessuna mansione attiva.</span> : null}
        </div>
        {team.canManage ? <SuggestedJobs existing={team.jobTitles} propertyId={property?.id ?? ''} onChanged={loadTeam} /> : null}
      </section>

      <InviteModal open={inviteOpen} propertyId={property?.id ?? ''} roles={assignableRoles} jobTitles={team.jobTitles.filter((job) => job.active)} onClose={() => setInviteOpen(false)} onSaved={async () => { setInviteOpen(false); await loadTeam() }} />
      <EditMemberModal member={editing} roles={assignableRoles} jobTitles={team.jobTitles.filter((job) => job.active)} currentProfileId={runtime.profile?.id ?? ''} propertyId={property?.id ?? ''} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await loadTeam() }} />
      <JobModal job={jobEditor} propertyId={property?.id ?? ''} onClose={() => setJobEditor(null)} onSaved={async () => { setJobEditor(null); await loadTeam() }} />
    </div>
  )
}

function InviteModal({ open, propertyId, roles, jobTitles, onClose, onSaved }: { open: boolean; propertyId: string; roles: CoreRole[]; jobTitles: JobTitle[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (open) { setSaving(false); setError(null) } }, [open])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setSaving(true); setError(null)
    try {
      await core.inviteTeamMember({ propertyId, fullName: String(form.get('name')), email: String(form.get('email')), roleId: String(form.get('role')), jobTitleId: String(form.get('job')) || null })
      await onSaved()
    } catch (cause) { setError(readableError(cause)); setSaving(false) }
  }
  return <Modal open={open} title="Invita persona" description="Crea un unico account Hotsflow e collegalo alla struttura." onClose={onClose} footer={<><button className="btn btn-secondary" type="button" onClick={onClose}>Annulla</button><button className="btn btn-primary" type="submit" form="invite-form" disabled={saving || roles.length === 0}>{saving ? 'Invio…' : 'Invia invito'}</button></>}>
    <form className="modal-form" id="invite-form" onSubmit={submit}>
      <Field label="Nome e cognome"><input name="name" required minLength={2} maxLength={120} autoComplete="name" /></Field>
      <Field label="Email"><input name="email" type="email" required autoComplete="email" /></Field>
      <Field label="Accesso Hotsflow"><select name="role" required defaultValue=""><option value="" disabled>Seleziona ruolo</option>{roles.map((role) => <option key={role.id} value={role.id}>{roleLabel(role.slug, role.displayName)}</option>)}</select></Field>
      <Field label="Mansione"><select name="job" defaultValue=""><option value="">Da assegnare</option>{jobTitles.map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}</select></Field>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form>
  </Modal>
}

function EditMemberModal({ member, roles, jobTitles, currentProfileId, propertyId, onClose, onSaved }: { member: TeamMember | null; roles: CoreRole[]; jobTitles: JobTitle[]; currentProfileId: string; propertyId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (member) { setSaving(false); setError(null) } }, [member])
  const isSelf = member?.profile.id === currentProfileId
  const orgWide = member?.membership.propertyId == null
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!member) return; const form = new FormData(event.currentTarget); setSaving(true); setError(null)
    try {
      await core.updateTeamMember({
        membershipId: member.membership.id, profileId: member.profile.id, propertyId,
        ...(orgWide ? {} : { roleId: String(form.get('role')), membershipStatus: String(form.get('accessStatus')) as MembershipStatus }),
        jobTitleId: String(form.get('job')) || null,
        employmentStatus: String(form.get('employmentStatus')) as 'active' | 'inactive',
      })
      await onSaved()
    } catch (cause) { setError(readableError(cause)); setSaving(false) }
  }
  return <Modal open={Boolean(member)} title={member ? `Modifica ${member.profile.fullName}` : 'Modifica persona'} description={orgWide ? 'L’accesso organizzazione si modifica a livello organizzazione; qui puoi assegnare la mansione locale.' : undefined} onClose={onClose} footer={<><button className="btn btn-secondary" type="button" onClick={onClose}>Annulla</button><button className="btn btn-primary" type="submit" form="edit-member-form" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva'}</button></>}>
    {member ? <form className="modal-form" id="edit-member-form" onSubmit={submit}>
      <Field label="Accesso Hotsflow"><select name="role" defaultValue={member.role.id} disabled={orgWide || isSelf}><option value={member.role.id}>{roleLabel(member.role.slug, member.role.displayName)}</option>{roles.filter((role) => role.id !== member.role.id).map((role) => <option key={role.id} value={role.id}>{roleLabel(role.slug, role.displayName)}</option>)}</select></Field>
      <Field label="Stato accesso"><select name="accessStatus" defaultValue={member.membership.status} disabled={orgWide || isSelf}><option value="active">Attivo</option><option value="suspended">Sospeso</option></select></Field>
      <Field label="Mansione"><select name="job" defaultValue={member.jobTitle?.id ?? ''}><option value="">Da assegnare</option>{jobTitles.map((job) => <option key={job.id} value={job.id}>{job.name}</option>)}</select></Field>
      <Field label="Stato lavorativo"><select name="employmentStatus" defaultValue={member.employmentStatus}><option value="active">In organico</option><option value="inactive">Non più in organico</option></select></Field>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </form> : null}
  </Modal>
}

function JobModal({ job, propertyId, onClose, onSaved }: { job: JobTitle | 'new' | null; propertyId: string; onClose: () => void; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const existing = job && job !== 'new' ? job : null
  useEffect(() => { if (job) { setSaving(false); setError(null) } }, [job])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null)
    try {
      const name = String(new FormData(event.currentTarget).get('name'))
      if (existing) await core.updateJobTitle(existing.id, { name })
      else await core.createJobTitle(propertyId, name)
      await onSaved()
    }
    catch (cause) { setError(readableError(cause)); setSaving(false) }
  }
  async function deactivate() {
    if (!existing) return
    setSaving(true); setError(null)
    try { await core.updateJobTitle(existing.id, { active: false }); await onSaved() }
    catch (cause) { setError(readableError(cause)); setSaving(false) }
  }
  return <Modal open={Boolean(job)} title={existing ? 'Modifica mansione' : 'Nuova mansione'} description="La mansione descrive il lavoro, non modifica i permessi Hotsflow." onClose={onClose} footer={<>{existing ? <button className="btn btn-danger push-left" type="button" onClick={() => void deactivate()} disabled={saving}>Disattiva</button> : null}<button className="btn btn-secondary" type="button" onClick={onClose}>Annulla</button><button className="btn btn-primary" type="submit" form="job-form" disabled={saving}>{saving ? 'Salvataggio…' : 'Salva'}</button></>}>
    <form className="modal-form" id="job-form" onSubmit={submit}><Field label="Nome mansione"><input name="name" required minLength={1} maxLength={80} defaultValue={existing?.name ?? ''} /></Field>{error ? <p className="form-error" role="alert">{error}</p> : null}</form>
  </Modal>
}

function SuggestedJobs({ existing, propertyId, onChanged }: { existing: JobTitle[]; propertyId: string; onChanged: () => Promise<void> }) {
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const existingNames = useMemo(() => new Set(existing.map((job) => job.name.toLocaleLowerCase('it'))), [existing])
  const missing = suggestedJobs.filter((job) => !existingNames.has(job.toLocaleLowerCase('it')))
  if (missing.length === 0) return null
  async function activate(job: string) {
    setSaving(job); setError(null)
    try { await core.createJobTitle(propertyId, job); await onChanged() }
    catch (cause) { setError(readableError(cause)) }
    finally { setSaving(null) }
  }
  return <div className="job-suggestions"><span>Suggerimenti</span><div>{missing.map((job) => <button type="button" key={job} disabled={saving !== null} onClick={() => void activate(job)}><Plus size={13} />{saving === job ? 'Attivazione…' : job}</button>)}</div>{error ? <p className="form-error" role="alert">{error}</p> : null}</div>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="form-field"><span>{label}</span>{children}</label> }
function initials(name: string) { return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() }
function roleLabel(slug: string, fallback: string) { return ({ organization_admin: 'Admin organizzazione', property_admin: 'Admin struttura', manager: 'Manager', receptionist: 'Operatore' } as Record<string, string>)[slug] ?? fallback }
function memberStatus(member: TeamMember) { if (member.employmentStatus === 'inactive') return 'Fuori organico'; if (member.membership.status === 'suspended') return 'Accesso sospeso'; return 'Attivo' }
function readableError(cause: unknown) { const message = cause instanceof Error ? cause.message : ''; if (/already|exists|409/i.test(message)) return 'Esiste già un account con questa email.'; if (/permission|forbidden|42501/i.test(message)) return 'Non hai i permessi necessari per questa operazione.'; return 'Operazione non riuscita. Riprova.' }
