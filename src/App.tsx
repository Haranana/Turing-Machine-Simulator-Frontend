
import SimulatorPage from './pages/SimulatorPage'
import ConsolePage from './pages/ConsolePage'
import AccountPage from './pages/AccountPage'
import { AuthProvider
 } from './auth/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import SettingsPage from './pages/SettingsPage'
import SignUpPage from './pages/SignUpPage'
import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Layout from "./Layout";
import LoginPage from './pages/LoginPage'
import { Toaster } from 'react-hot-toast';
import './index.css'
import ProtectedRoute from './auth/ProtectedRoute'
import TreePage from './pages/TreePage'
import NotFoundPage from './pages/NotFoundPage'
import AccountActivatedPage from './pages/AccountActivatedPage'
import ChangePassword from './features/AccountComponents/ChangePassword'

export default  function App() {

return (
  <>
      <div className="content">
          <Routes>
            <Route path = "/" element={<Layout/>}>
              <Route index element={<SimulatorPage />} />
              <Route path="index" element={<SimulatorPage />} />
              <Route path="console" element={<ConsolePage />} />
              <Route path="tree" element={<TreePage></TreePage>}/>
              <Route path="password/change" element={<ChangePassword/>}/>
            
              <Route element={<ProtectedRoute/>}>
                <Route path="account" element={<AccountPage/>} />
              </Route>

            <Route path="login" element={<LoginPage/>}/>
              <Route path="signup" element={<SignUpPage/>} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="activate" element={<AccountActivatedPage></AccountActivatedPage>} />
            </Route>

            <Route path="*" element={<NotFoundPage></NotFoundPage>} />
          </Routes>
      </div>
    <Toaster
        position="top-right"
        toastOptions={{
        className: 'Toast',
        style: {
          background: 'var(--color-bg-2)',
          color: 'var(--color-text-dark)',
          borderRadius: '10px',
          padding: '10px 12px',
          boxShadow: '0 8px 24px rgba(0,0,0,.25)',
        },
        duration: 3000,
        success: { className: 'Toast Toast--success' },
        error:   { className: 'Toast Toast--error' },
      }}
      />
    </>
  );
}
