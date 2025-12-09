import Sidebar from "./features/Sidebar/Sidebar.tsx";
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <aside className="sidebar-wrap">
        <Sidebar />
      </aside>

      <main className="outlet-wrap">
        <Outlet />
      </main>
    </>
  );
}