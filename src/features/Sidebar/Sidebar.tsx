import {Link} from 'react-router-dom';

import { } from "@heroicons/react/24/solid"
import { UserIcon, AdjustmentsHorizontalIcon, CommandLineIcon, PlayIcon } from "@heroicons/react/24/solid"
import './sidebar.css';

export default function Sidebar(){
    return(
    <nav className='sidebar'>
        <ul>
            <li className='link-button' id='simulator-link-button'><Link to="index" title='Simulation'><PlayIcon className = "icon"></PlayIcon></Link></li>
            <li className='link-button' id='console-link-button'><Link to="console" title='Console'><CommandLineIcon className = "icon"></CommandLineIcon></Link></li>
            <li className='link-button' id='account-link-button'><Link to="account" title='Account'><UserIcon className = "icon"></UserIcon></Link></li>
            <li className='link-button' id='settings-link-button'><Link to="settings" title='Settings'><AdjustmentsHorizontalIcon className = "icon"></AdjustmentsHorizontalIcon></Link></li>
        </ul>
    </nav>
);
}
