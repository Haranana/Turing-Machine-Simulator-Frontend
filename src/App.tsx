
import SimulatorPage from './pages/SimulatorPage'
import ConsolePage from './pages/ConsolePage'
import AccountPage from './pages/AccountPage'

import SettingsPage from './pages/SettingsPage'
import { Routes, Route } from 'react-router-dom'
import Layout from "./Layout";
import LoginPage from './pages/LoginPage'

export default  function App() {

return (
    <div className="content">
        <Routes>
          <Route path = "/" element={<Layout/>}>
            <Route index element={<SimulatorPage />} />
            <Route path="index" element={<SimulatorPage />} />
            <Route path="console" element={<ConsolePage />} />
            <Route path="account" element={<LoginPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
    </div>
  );
}
