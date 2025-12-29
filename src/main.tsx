import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import '@app/styles/index.css'
import App from '@app/App.tsx'

import { AuthProvider } from '@auth/hooks/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
     <BrowserRouter>
      <App />
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
