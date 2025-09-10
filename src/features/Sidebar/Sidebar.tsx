import {Link} from 'react-router-dom';
import { } from "@heroicons/react/24/solid"
import { UserIcon, AdjustmentsHorizontalIcon, CommandLineIcon, PlayIcon } from "@heroicons/react/24/solid"
import './sidebar.css';

export default function Sidebar(){
    return(

    <nav className='sidebar'>
        <ul>
            <li className='link-button' id='simulator-link-button'><Link to="/index"><PlayIcon className = "icon"></PlayIcon></Link></li>
            <li className='link-button' id='console-link-button'><Link to="/console"><CommandLineIcon className = "icon"></CommandLineIcon></Link></li>
            <li className='link-button' id='account-link-button'><Link to="/account"><UserIcon className = "icon"></UserIcon></Link></li>
            <li className='link-button' id='settings-link-button'><Link to="/settings"><AdjustmentsHorizontalIcon className = "icon"></AdjustmentsHorizontalIcon></Link></li>
        </ul>
    </nav>
);
}
