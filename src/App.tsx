
import SimulatorPage from './pages/SimulatorPage'
import ConsolePage from './pages/ConsolePage'
import AccountPage from './pages/AccountPage'
import SettingsPage from './pages/SettingsPage'
import SignUpPage from './pages/SignUpPage'
import { Routes, Route } from 'react-router-dom'
import Layout from "./Layout";
import LoginPage from './pages/LoginPage'
import { Toaster } from 'react-hot-toast';
import './index.css'
import ProtectedRoute from './auth/ProtectedRoute'
import TreePage from './pages/TreePage'
import NotFoundPage from './pages/NotFoundPage'
import AccountActivatedPage from './pages/AccountActivatedPage'
import ChangePassword from './features/AccountComponents/ChangePassword'
import DeleteAccount from './features/AccountComponents/DeleteAccount'
import SearchPage from './pages/SearchPage'

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
              <Route path='account/delete' element={<DeleteAccount/>}/>
              <Route path='search' element={<SearchPage/>}/>
            
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
