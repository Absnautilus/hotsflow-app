import { ChevronDown, Menu } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { shellNavigation } from '../app/navigation'

export function ShellLayout() {
  const modules = shellNavigation.filter((item) => item.kind === 'module')
  const platform = shellNavigation.filter((item) => item.kind === 'platform')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Hotsflow</div>
        <button className="property-switcher" type="button">
          <span><strong>Palazzo Veneziano</strong><small>Venezia</small></span>
          <ChevronDown size={16} />
        </button>
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
          <div className="brand">Hotsflow</div>
          <button type="button" aria-label="Apri menu"><Menu size={20} /></button>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
      <nav className="mobile-nav" aria-label="Navigazione mobile">
        {shellNavigation.slice(0, 4).map((item) => (
          <NavLink className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`} key={item.path} to={item.path}>
            <item.icon size={19} /><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
