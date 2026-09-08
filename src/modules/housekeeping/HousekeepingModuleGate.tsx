import { HousekeepingModule } from '@hotsflow/housekeeping-module'
import '@hotsflow/housekeeping-module/style.css'
import { supabase } from '../../core/client'
import { useHousekeepingAccess } from './useHousekeepingAccess'

// Deep links (typed URL, refresh, or a saved bookmark) reach this gate
// directly even when the nav/Home entry point that normally leads here is
// hidden (see useHousekeepingAccess) -- so every non-"compatible" state must
// explain itself rather than fall through to a blank or ambiguous screen.
export function HousekeepingModuleGate() {
  const access = useHousekeepingAccess()

  if (access.status === 'loading') {
    return <main className="runtime-state">Caricamento Housekeeping…</main>
  }

  if (access.status === 'not-entitled') {
    return <main className="runtime-state">Housekeeping non è abilitato per questa struttura.</main>
  }

  if (access.status === 'no-mapping') {
    return <main className="runtime-state">Housekeeping non è ancora collegato a questa struttura.</main>
  }

  if (access.status === 'no-profile') {
    return (
      <main className="runtime-state">
        Non hai un profilo operativo Housekeeping per questa struttura.
        <small>Gli accessi operativi si gestiscono da Team.</small>
      </main>
    )
  }

  if (access.status === 'error') {
    return (
      <main className="runtime-state">
        <strong>Impossibile caricare Housekeeping.</strong>
        <small style={{ maxWidth: 720, textAlign: 'center', overflowWrap: 'anywhere' }}>{access.message || 'Errore sconosciuto'}</small>
      </main>
    )
  }

  return (
    <HousekeepingModule
      supabase={supabase}
      hotelId={access.hotelId}
      basePath="/housekeeping"
      platformStaffManagement={{
        href: '/team',
        label: 'Apri Team',
        description: 'Gli account e gli accessi si gestiscono una sola volta in Hotsflow Team. Qui trovi il roster operativo di Housekeeping.',
      }}
    />
  )
}
