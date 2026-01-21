
import '@app/styles/index.css'

import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';

import SimulatorPage from '@tm/simulation/components/SimulatorPage'
import ConsolePage from '@console/components/ConsolePage'
import AccountPage from '@account/components/AccountPage'
import SettingsPage from '@settings/components/SettingsPage'
import SignUpPage from '@auth/components/SignUpPage'
import LoginPage from '@auth/components/LoginPage'
import Layout from "./Layout";
import ProtectedRoute from '@auth/components/ProtectedRoute'
import TreePage from '@tree/components/TreePage'
import NotFoundPage from '@app/NotFoundPage'
import AccountActivatedPage from '@auth/components/AccountActivatedPage'
import ChangePassword from '@account/components/ChangePassword'
import DeleteAccount from '@account/components/DeleteAccountConfirm'
import SearchPage from '@search/components/SearchPage'
import ForgotPasswordPage from '@auth/components/ForgotPasswordPage'

export default  function App() {
return (<>
      <div className="content">

          <Routes>
            <Route path="*" element={<Navigate to="/app" replace />} />
            
            <Route path = "/app" element={<Layout/>}>
              <Route index element={<SimulatorPage />} />
              <Route path="index" element={<SimulatorPage />} />
              <Route path="console" element={<ConsolePage />} />
              <Route path="tree" element={<TreePage></TreePage>}/>
              <Route path="forgotPassword" element={<ForgotPasswordPage/>}/>
              <Route path="password/change" element={<ChangePassword/>}/>
              <Route path='account/delete' element={<DeleteAccount/>}/>
              <Route path='search' element={<SearchPage/>}/>
            
              <Route element={<ProtectedRoute/>}>
                <Route path="account" element={<AccountPage/>} />
              </Route>

              <Route path="login" element={<LoginPage/>}/>
              <Route path="signup" element={<SignUpPage/>} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="activate/*" element={<AccountActivatedPage></AccountActivatedPage>} />
            </Route>

            <Route path="*" element={<NotFoundPage></NotFoundPage>} />
          </Routes>
      </div>
    <Toaster
        position="top-right"
        toastOptions={{
        className: 'Toast',
        style: {
          background: 'var(--color-strong)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-1)',
          borderRadius: 'var(--border-radius-strong)',
          padding: '10px 12px',
          boxShadow: 'var(--box-shadow-dark)',
          fontSize: '90%'
        },
        duration: 3000,
        success: { className: 'Toast Toast--success' },
        error:   { className: 'Toast Toast--error' },
      }}
      />
    </>
  );
}
