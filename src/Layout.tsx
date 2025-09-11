import Sidebar from "./features/Sidebar/Sidebar.tsx";
import { Outlet } from 'react-router-dom';

export default function Layout(){
    return(
        <div className="main-layout">
            <aside className="sidebar-wrap">
                <Sidebar />
            </aside>
            <main className="outlet-wrap">
                <Outlet />
            </main>
        </div>

    );

}