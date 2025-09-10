import Sidebar from "./features/Sidebar/Sidebar";
import SimulatorPage from './pages/SimulatorPage'
import ConsolePage from './pages/ConsolePage'
import AccountPage from './pages/AccountPage'
import SettingsPage from './pages/SettingsPage'
import { Routes, Route } from 'react-router-dom'

export default  function App() {

return (
    <div className="main-layout">
      <Sidebar />
      <div className="content">
        <Routes>
          <Route path="/index" element={<SimulatorPage />} />
          <Route path="/console" element={<ConsolePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}
