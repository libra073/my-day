import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/claymorphic-auth.css'
import './styles/motion-system.css'
import './styles/apple-liquid-glass.css'
import './styles/liquid-glass-v2.css'
import './styles/portfolio.css'
import './styles/theme-polish.css'
import './styles/surface-upgrade.css'
import './styles/glass-interaction.css'
import './styles/lab-lens.css'
import './styles/ux-polish.css'
import './styles/glass-select.css'
import './styles/glass-date.css'
import './styles/ai-pill.css'
import './styles/touch-accent.css'
import './styles/pointer-rose.css'
import './styles/sunset-glass.css'
import './styles/md-hero.css'
import './styles/back-to-top.css'
import './styles/mobile.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)

