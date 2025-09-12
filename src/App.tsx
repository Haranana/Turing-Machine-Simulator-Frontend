
import SimulatorPage from './pages/SimulatorPage'
import ConsolePage from './pages/ConsolePage'
import AccountPage from './pages/AccountPage'

import SettingsPage from './pages/SettingsPage'
import SignUpPage from './pages/SignUpPage'
import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Layout from "./Layout";
import LoginPage from './pages/LoginPage'

export default  function App() {

const [logged, setLogged] = useState(false);

return (
    <div className="content">
        <Routes>
          <Route path = "/" element={<Layout/>}>
            <Route index element={<SimulatorPage />} />
            <Route path="index" element={<SimulatorPage />} />
            <Route path="console" element={<ConsolePage />} />
            <Route path="account" element={logged? <AccountPage /> : <LoginPage/>} />
            <Route path="signup" element={<SignUpPage/>} />
            <Route path="settings" element={<SettingsPage />} />

          </Route>

          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
    </div>
  );
}
