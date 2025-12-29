import '@account/styles/Account.css'

import { toast } from 'react-hot-toast';

import { useApiFetch } from '@api/apiUtils.ts';
import { useAuth } from '../../auth/hooks/AuthContext.tsx';
import { useEffect, useState } from 'react';
import EditProfile from '@account/components/EditAccount.tsx';
import LoadTuringMachine from '@account/components/ManageMachines.tsx';
import SaveTuringMachine from '@account/components/CreateTm.tsx';
import type { AccountData } from '../hooks/AccountDataContext.ts';
import { AccountDataContext } from '../hooks/AccountDataContext.ts';
import { ArrowRightStartOnRectangleIcon , ChevronUpIcon , ChevronDownIcon } from '@heroicons/react/24/solid';
import { useTuringMachineData, useTuringMachineSettings } from '@state/GlobalData.ts';
import type { TuringMachineEditDto } from '../types/AccountDataTypes.ts';

export default  function AccountPage() {

       const {tmDataProgram , tmDataTapesAmount, tmDataName} = useTuringMachineData();
       const {onlyComplete, rejectOnNonAccept , allowMultipleTapes,allowNondeterminism, inputAlphabet, tapeAlphabet, statesSet, onlyInputAlphabet, onlyTapeAlphabet, onlyStatesFromSet} = useTuringMachineSettings(s=>s.specialSettings);
       const { symbolSeparator,transitionArrow,blank, left, right, stay} = useTuringMachineSettings(s=>s.aliases);
       const {initialState, acceptState, rejectState} = useTuringMachineSettings(s=>s.specialStates);
   
    const [currentSubPage, setCurrentSubPage] = useState<"load" | "create"  | "edit">("load");
    const {logout} = useAuth();
    
    const apiFetch = useApiFetch();

    const subPages = {
        load: <LoadTuringMachine/>,
        create: <SaveTuringMachine/>,
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

    async function onSaveClicked(){

        if(tmDataName==null){
            setCurrentSubPage("create");
            return;
        }
        
         const sendBody : TuringMachineEditDto = { 
            name: tmDataName,
            description: null,
            program: tmDataProgram.join("\n"),
            initialState: initialState,
            acceptState: acceptState,
            rejectState: rejectState,
            blank: blank,
            sep1: symbolSeparator,
            sep2: transitionArrow,
            moveRight: right,
            moveLeft: left,
            moveStay: stay,
            tapesAmount: tmDataTapesAmount,

            specialSettings: {
                allowNondeterminism: allowNondeterminism,
                allowMultipleTapes: allowMultipleTapes,
                onlyComplete: onlyComplete,
                rejectOnNonAccept: rejectOnNonAccept,
        
                statesSet: statesSet,
                onlyStatesFromSet: onlyStatesFromSet,
        
                tapeAlphabet: tapeAlphabet,
                onlyTapeAlphabet: onlyTapeAlphabet,
        
                inputAlphabet: inputAlphabet,
                onlyInputAlphabet: onlyInputAlphabet,
                }};

                try{
                    const res = await apiFetch("http://localhost:9090/api/tm/edit" , {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(
                            sendBody
                        )
                    });
                    if(res.status == 200 ){
                        toast.success(`Turing Machine saved successfully`);
                    }
                    else{
                        toast.error(`Turing Machine couldn't be saved`);
                    }
                }catch(e: any){
                     toast.error(`Turing Machine couldn't be saved`);
                }
    }

    return(
        <div className="AccountPageWrapper">
            <div className='AccountPage'>
                <div className='AccountPageDashboard'>
                    
                        <button className={`AccountDashboardButton ${currentSubPage=="load"? "SelectedDashboardButton" : "" }`} onClick={()=>setCurrentSubPage("load")}>Manage{currentSubPage=="load"? <ChevronUpIcon/> : <ChevronDownIcon/> }</button>
                        <button className={`AccountDashboardButton ${currentSubPage=="create"? "SelectedDashboardButton" : "" }`} onClick={()=>setCurrentSubPage("create")}>Create {currentSubPage=="create"? <ChevronUpIcon/> : <ChevronDownIcon/> }</button>
                        <button className={`AccountDashboardButton ${currentSubPage=="edit"? "SelectedDashboardButton" : "" }`} onClick={()=>setCurrentSubPage("edit")}>Account {currentSubPage=="edit"? <ChevronUpIcon/> : <ChevronDownIcon/> }</button>
                        <button className={`AccountDashboardButton`} onClick={()=>onSaveClicked()} >Save</button>
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