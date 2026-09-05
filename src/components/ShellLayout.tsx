import { ChevronDown, Menu } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { shellNavigation } from '../app/navigation'
import { useModuleRuntime } from '../core/ModuleRuntimeContext'

const moduleSlugByPath: Record<string, string> = {
  '/housekeeping': 'guest_requests',
  '/turni': 'shifts',
  '/transfer': 'transfers',
}

export function ShellLayout() {
  const runtime = useModuleRuntime()
  const enabledSlugs = new Set(runtime.entitlements.filter((item) => item.enabled).map((item) => item.slug))
  const modules = shellNavigation.filter((item) => item.kind === 'module' && enabledSlugs.has(moduleSlugByPath[item.path]))
  const platform = shellNavigation.filter((item) => item.kind === 'platform')

  if (runtime.status === 'loading') return <main className="runtime-state">Caricamento Hotsflow…</main>
  if (runtime.status === 'signed-out') return <main className="runtime-state">Accedi per continuare.</main>
  if (runtime.status === 'no-property') return <main className="runtime-state">Nessuna struttura accessibile.</main>
  if (runtime.status === 'error') return <main className="runtime-state"><strong>Impossibile caricare Hotsflow.</strong><button type="button" onClick={() => void runtime.refresh()}>Riprova</button></main>

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Hotsflow</div>
        <label className="property-switcher">
          <span><strong>{runtime.property?.name}</strong><small>{runtime.profile?.fullName ?? 'Staff'}</small></span>
          {runtime.properties.length > 1 ? (
            <select aria-label="Struttura attiva" value={runtime.property?.id ?? ''} onChange={(event) => runtime.selectProperty(event.target.value)}>
              {runtime.properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
            </select>
          ) : <ChevronDown size={16} aria-hidden="true" />}
        </label>
        <nav className="sidebar-nav" aria-label="Navigazione principale">
          <div className="nav-section-label">Moduli</div>
          {modules.map((item) => (
            <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} key={item.path} to={item.path}>
              <item.icon size={18} /><span>{item.label}</span>
            </NavLink>
          ))}
          <div className="nav-section-label platform">Piattaforma</div>
          {platform.map((item) => (
            <NavLink className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} key={item.path} to={item.path}>
              <item.icon size={18} /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell-content">
        <header className="mobile-header">
          <div><div className="brand">Hotsflow</div><small>{runtime.property?.name}</small></div>
          <button type="button" aria-label="Apri menu"><Menu size={20} /></button>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
      <nav className="mobile-nav" aria-label="Navigazione mobile">
        {[shellNavigation[0], ...modules.slice(0, 3)].map((item) => (
          <NavLink className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`} key={item.path} to={item.path}>
            <item.icon size={19} /><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
