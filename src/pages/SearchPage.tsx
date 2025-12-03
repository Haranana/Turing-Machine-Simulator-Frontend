import "../pages/SearchPage.css"

import { useEffect, useRef, useState } from "react"
import { useTuringMachineData } from "../features/GlobalData/GlobalData";
import { useTuringMachineSettings } from "../features/GlobalData/GlobalData";
import type { TuringMachineGetDto } from "../features/AccountComponents/AccountDataTypes";
import toast from "react-hot-toast";


export default function SearchPage(){

    const {setTmDataProgram , setTmDataTapesAmount, setTmDataName} = useTuringMachineData();
    const {setAliases, setSpecialStates} = useTuringMachineSettings()

    const inputRef = useRef<string>("");
    const [validationError, setValidationError] = useState<string | null>(null);



    function validate(value: string){
         if(value.length !== 5){
            setValidationError("Share code must be exactly 5 characters long");
            return;
        }
        if(! (/^([a-zA-Z0-9]{5})$/.test(value))){
            setValidationError("Share code must use only english alphabet characters and digits");
            return;
        }
        setValidationError(null)
    }

    function onInputChange(value: string){
        const trimmed = value.trim();
        validate(trimmed);
        inputRef.current = trimmed;
    }

    useEffect(()=>{
        validate("")
    },[])

    async function onSearchClicked(){
        try{
            const res = await fetch( `http://localhost:9090/api/tm/public/${encodeURIComponent(inputRef.current)}` , {
                method: "GET",
            });
            if(res.ok){
                console.log("got machines: ", res.status);
                const tm: TuringMachineGetDto = await res.json();
                await loadSimulation(tm);
                toast.success(`turing machine ${tm.name} successfully loaded`);
            }else{
                toast.error(`turing machine couldn't be loaded`);
            }
        }catch(e: any){
            toast.error(`turing machine couldn't be loaded`);
        }
       
    }

    async function loadSimulation(tm: TuringMachineGetDto){
        setTmDataProgram(tm.program.split("\n"));
        setSpecialStates(tm.initialState, tm.acceptState, tm.rejectState);
        setAliases({
            symbolSeparator: tm.sep1,
            transitionArrow: tm.sep2,
            blank: tm.blank,
            right: tm.moveRight,
            left: tm.moveLeft,
            stay: tm.moveStay,
        });
        setTmDataTapesAmount(tm.tapesAmount);
        setTmDataName(tm.name);
    }

    return <div className="SearchPage">
        <h1 className="SearchPageHeadline">Enter 5 characters long code and load shared Turing machine</h1>
        <div className="SearchBarWrapper">
            <input placeholder="5 character search code"  type="text" className="SearchBar" onChange={(e)=>onInputChange(e.target.value)}></input>    
            <button className={`SearchButton ${validationError!=null? "DisabledSearchButton" : ""}`} disabled={validationError!=null} onClick={()=>onSearchClicked()}>Load</button>
        </div>   
        {validationError!=null?  <p className="searchError">{validationError}</p> : ""}
    </div>
}