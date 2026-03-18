import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import logo from './assets/logo.png'

const currentFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
if (currentFavicon) {
  currentFavicon.href = logo
  currentFavicon.type = 'image/png'
} else {
  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/png'
  favicon.href = logo
  document.head.appendChild(favicon)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
