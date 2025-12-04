import {Link} from 'react-router-dom';

import { MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import { UserIcon, AdjustmentsHorizontalIcon, CommandLineIcon, PlayIcon } from "@heroicons/react/24/solid"
import './sidebar.css';
import { Sitemap } from '../../assets/Sitemap';
import { useSimulationData } from '../GlobalData/GlobalData';
import { useEffect, useState } from 'react';
import { boolean } from 'zod';

export default function Sidebar(){

    const {simulationDataNodes} = useSimulationData();
    const [currentSimulationIsNonDet , setCurrentSimulationIsNonDet] = useState<boolean>(false); //false if no simulation is currently loaded in
    
    
    useEffect(()=>{
        if(simulationDataNodes == null){
            setCurrentSimulationIsNonDet(false);
            return;
        }
        for (const [_, value] of Object.entries(simulationDataNodes)) {
            if(value.nextIds.length>1){
                setCurrentSimulationIsNonDet(true);
                return
            }
        }
        setCurrentSimulationIsNonDet(false);
    },[simulationDataNodes])

    return(
    <nav className='sidebar'>
        <ul>
            <li className='link-button' id='simulator-link-button'><Link to="index" title='Simulation'><PlayIcon className = "icon"></PlayIcon></Link></li>
            <li className='link-button' id='console-link-button'><Link to="console" title='Console'><CommandLineIcon className = "icon"></CommandLineIcon></Link></li>
            <li className={`link-button ${currentSimulationIsNonDet? "" : "disabledLinkButton"}`} id='tree-link-button'><Link to="tree" title="Simulation tree"><Sitemap></Sitemap></Link></li>
            <li className='link-button' id='search-link-button'><Link  to="search" title="Download turing machine"><MagnifyingGlassIcon className = "icon"/></Link></li>
            <li className='link-button' id='account-link-button'><Link to="account" title='Account'><UserIcon className = "icon"></UserIcon></Link></li>
            <li className='link-button' id='settings-link-button'><Link to="settings" title='Settings'><AdjustmentsHorizontalIcon className = "icon"></AdjustmentsHorizontalIcon></Link></li>
        </ul>
    </nav>
);
}
