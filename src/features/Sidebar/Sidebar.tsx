import {Link} from 'react-router-dom';

import { MagnifyingGlassIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid"
import { UserIcon, AdjustmentsHorizontalIcon, CommandLineIcon, PlayIcon } from "@heroicons/react/24/solid"
import './sidebar.css';
import { Sitemap } from '../../assets/Sitemap';
import { useSimulationData } from '../GlobalData/GlobalData';
import { useEffect, useState } from 'react';
import { boolean } from 'zod';
import { getInitialTheme, THEME_KEY, type Theme } from '../../public/ThemeManager';

export default function Sidebar(){

    


   
    type Pages = "none" | "tapes" | "console" | "tree" | "search" | "account" | "settings";
    const {simulationDataNodes} = useSimulationData();
    const [currentSimulationIsNonDet , setCurrentSimulationIsNonDet] = useState<boolean>(false); //false if no simulation is currently loaded in
    const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
    const [chosenPage, setChosenPage] = useState<Pages>("none")

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    function toggleTheme() {
        const newTheme = theme==="light"? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    }
    
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
            <li className={`SidebarElement ${chosenPage==="tapes"? "HiglistedLink" : ""}`} id='simulator-link-button'>
                <Link onClick={()=>setChosenPage("tapes")} className='SidebarLink' to="index" title='Simulation'>
                    <PlayIcon className = "icon"></PlayIcon>
                    <p className='SidebarLinkTitle'>Simulation</p>
                </Link>
            </li>

            <li className={`SidebarElement ${chosenPage==="console"? "HiglistedLink" : ""}`} id='console-link-button'>
                <Link onClick={()=>setChosenPage("console")} className='SidebarLink' to="console" title='Console'>
                    <CommandLineIcon className = "icon"></CommandLineIcon>
                    <p className='SidebarLinkTitle'>Console</p>
                </Link>
            </li>

            <li className={`SidebarElement ${currentSimulationIsNonDet? "" : "disabledLinkButton"} ${chosenPage==="tree"? "HiglistedLink" : ""}`} id='tree-link-button'>
                <Link onClick={()=> (currentSimulationIsNonDet? setChosenPage("tree") : "")} className='SidebarLink' to="tree" title="Simulation tree">
                    <Sitemap></Sitemap>
                    <p className='SidebarLinkTitle'>Tree</p>
                </Link>
            </li>

            <li className={`SidebarElement ${chosenPage==="search"? "HiglistedLink" : ""}`} id='search-link-button'>
                <Link onClick={()=>setChosenPage("search")} className='SidebarLink'  to="search" title="Download turing machine">
                    <MagnifyingGlassIcon className = "icon"/>
                    <p className='SidebarLinkTitle'>Load</p>
                </Link>
            </li>

            <li className={`SidebarElement ${chosenPage==="account"? "HiglistedLink" : ""}`} id='account-link-button'>
                <Link onClick={()=>setChosenPage("account")} className='SidebarLink' to="account" title='Account'>
                    <UserIcon className = "icon"></UserIcon>
                    <p className='SidebarLinkTitle'>Account</p>
                </Link>
            </li>

            <li className={`SidebarElement ${chosenPage==="settings"? "HiglistedLink" : ""}`} id='settings-link-button'>
                <Link onClick={()=>setChosenPage("settings")} className='SidebarLink' to="settings" title='Settings'>
                    <AdjustmentsHorizontalIcon className = "icon"></AdjustmentsHorizontalIcon>
                    <p className='SidebarLinkTitle'>Settings</p>
                </Link>
            </li>

            <li className='SidebarElement StyleModeToggle'><button className='SidebarButton'  onClick={()=>toggleTheme()}>{theme === "light"? <SunIcon className = "icon"/> : <MoonIcon className = "icon"/> } </button></li>
        </ul>
    </nav>
);
}
