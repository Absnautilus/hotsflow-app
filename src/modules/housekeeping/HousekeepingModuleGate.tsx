import { useEffect, useState } from 'react'
import { HousekeepingModule } from '@hotsflow/housekeeping-module'
import '@hotsflow/housekeeping-module/style.css'
import { useModuleRuntime } from '../../core/ModuleRuntimeContext'
import { core, supabase } from '../../core/client'

type MappingState =
  | { status: 'loading'; hotelId: null }
  | { status: 'ready'; hotelId: string }
  | { status: 'unavailable'; hotelId: null }
  | { status: 'error'; hotelId: null }

export function HousekeepingModuleGate() {
  const runtime = useModuleRuntime()
  const [mapping, setMapping] = useState<MappingState>({ status: 'loading', hotelId: null })

  const entitled = runtime.entitlements.some((item) => item.enabled && item.slug === 'guest_requests')
  const propertyId = runtime.property?.id ?? null

  useEffect(() => {
    let cancelled = false

    if (!propertyId || !entitled) {
      setMapping({ status: 'unavailable', hotelId: null })
      return () => {
        cancelled = true
      }
    }

    setMapping({ status: 'loading', hotelId: null })
    void core
      .getGuestRequestsLegacyHotelId(propertyId)
      .then((hotelId) => {
        if (cancelled) return
        setMapping(hotelId ? { status: 'ready', hotelId } : { status: 'unavailable', hotelId: null })
      })
      .catch(() => {
        if (!cancelled) setMapping({ status: 'error', hotelId: null })
      })

    return () => {
      cancelled = true
    }
  }, [propertyId, entitled])

  if (mapping.status === 'loading') {
    return <main className="runtime-state">Caricamento Housekeeping…</main>
  }

  if (mapping.status === 'unavailable') {
    return <main className="runtime-state">Housekeeping non è disponibile per questa struttura.</main>
  }

  if (mapping.status === 'error') {
    return <main className="runtime-state">Impossibile caricare Housekeeping.</main>
  }

  return <HousekeepingModule supabase={supabase} hotelId={mapping.hotelId} basePath="/housekeeping" />
}
