import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { ModuleRuntimeProvider } from './core/ModuleRuntimeContext'
import './styles.css'

// The approved v2 shell is light-only for now. Keeping the explicit theme
// prevents the documented future dark tokens from becoming active via OS
// preference before dark mode is intentionally implemented and reviewed.
document.documentElement.setAttribute('data-theme', 'light')

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ModuleRuntimeProvider>
        <App />
      </ModuleRuntimeProvider>
    </BrowserRouter>
  </StrictMode>,
)
