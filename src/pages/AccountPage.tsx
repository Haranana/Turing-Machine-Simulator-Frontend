import './page.css';
import './AccountPage.css'
import { useApiFetch } from '../api/util.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { useEffect, useState } from 'react';
import EditProfile from '../features/AccountComponents/EditProfile.tsx';
import LoadTuringMachine from '../features/AccountComponents/LoadTuringMachine.tsx';
import SaveTuringMachine from '../features/AccountComponents/SaveTuringMachine.tsx';
import type { AccountData } from '../features/AccountComponents/AccountDataContext.ts';
import { toast } from 'react-hot-toast';
import { AccountDataContext } from '../features/AccountComponents/AccountDataContext.ts';
import { ArrowRightStartOnRectangleIcon , ChevronUpIcon , ChevronDownIcon } from '@heroicons/react/24/solid';

export default  function AccountPage() {

    const [currentSubPage, setCurrentSubPage] = useState<"load" | "save" | "edit">("load");
    const {logout} = useAuth();
    
    const apiFetch = useApiFetch();

    const subPages = {
        load: <LoadTuringMachine/>,
        save: <SaveTuringMachine/>,
        edit: <EditProfile/>
        } as const;

    const [accountData, setAccountData] = useState<AccountData>({id: null, email: null, status: null, createdAt: null})

    useEffect(()=>{
        const run = async ()=>{
            try {
                const res = await apiFetch("http://localhost:9090/api/account", {method: "GET"})
                if (res.status == 200 ) {
                    const data = (await res.json()) as AccountData;
                    setAccountData(data);
                }else{
                    toast.error(`user data couldn't be loaded, \n${res.status} ${res.statusText}\n${res.text}`);        
                }
            }catch(e: any){
                toast.error(`user data couldn't be loaded`);
            }
        };
        run().catch(console.error);

    }, [apiFetch]);

    return(
        <div className="AccountPageWrapper">
            <div className='AccountPage'>
                <div className='AccountPageDashboard'>
                    
                        <button className={`AccountDashboardButton ${currentSubPage=="load"? "SelectedDashboardButton" : "" }`} onClick={()=>setCurrentSubPage("load")}>Manage{currentSubPage=="load"? <ChevronUpIcon/> : <ChevronDownIcon/> }</button>
                        <button className={`AccountDashboardButton ${currentSubPage=="save"? "SelectedDashboardButton" : "" }`} onClick={()=>setCurrentSubPage("save")}>Save {currentSubPage=="save"? <ChevronUpIcon/> : <ChevronDownIcon/> }</button>
                        <button className={`AccountDashboardButton ${currentSubPage=="edit"? "SelectedDashboardButton" : "" }`} onClick={()=>setCurrentSubPage("edit")}>Account {currentSubPage=="edit"? <ChevronUpIcon/> : <ChevronDownIcon/> }</button>
                    
                     <button className='AccountDashboardButton LogoutButton'onClick={()=>logout()}><ArrowRightStartOnRectangleIcon/></button>
                </div>
                {/*<hr className='LineSeparator'></hr>*/}
                <AccountDataContext value={accountData}>
                    {subPages[currentSubPage]}
                </AccountDataContext>
            </div>
        </div>
    );
}