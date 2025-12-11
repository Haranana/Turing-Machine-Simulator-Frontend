import "../pages/SearchPage.css"

import { useEffect, useRef, useState } from "react"
import { useTuringMachineData } from "../features/GlobalData/GlobalData";
import { useTuringMachineSettings } from "../features/GlobalData/GlobalData";
import type { TuringMachineGetDto } from "../features/AccountComponents/AccountDataTypes";
import toast from "react-hot-toast";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";


export default function SearchPage(){

    const {setTmDataProgram , setTmDataTapesAmount, setTmDataName, setTmDataTapesInputs} = useTuringMachineData();
    const {setAliases, setSpecialStates,setOnlyComplete , setRejectOnNonAccept ,setAllowMultipleTapes, setAllowNondeterminism, setInputAlphabet, setTapeAlphabet, setStatesSet, setOnlyInputAlphabet, setOnlyTapeAlphabet, setOnlyStatesFromSet} = useTuringMachineSettings();

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
        let clearInput: string[] = [];
        for(let i =0 ; i < tm.tapesAmount; i++){
            clearInput.push("");
        } 
        setTmDataTapesInputs(clearInput);

        setAllowMultipleTapes(tm.specialSettings.allowMultipleTapes)
        setAllowNondeterminism(tm.specialSettings.allowNondeterminism)
        setOnlyComplete(tm.specialSettings.onlyComplete)
        setRejectOnNonAccept(tm.specialSettings.allowMultipleTapes)
        
        setOnlyInputAlphabet(tm.specialSettings.onlyInputAlphabet);
        setOnlyTapeAlphabet(tm.specialSettings.onlyTapeAlphabet);
        setOnlyStatesFromSet(tm.specialSettings.onlyStatesFromSet);

        setInputAlphabet(tm.specialSettings.inputAlphabet);
        setTapeAlphabet(tm.specialSettings.tapeAlphabet);
        setStatesSet(tm.specialSettings.statesSet);

        toast.success(`turing machine ${tm.name} successfully loaded`);
    }

    return <div className="SearchPageWrapper">
    <div className="SearchPage">
        <h1 className="SearchPageHeadline">Enter turing machine share code</h1>
        <div className="SearchBarWrapper">
            <div className="SearchIcon"><MagnifyingGlassIcon className="icon"/></div>
            <input placeholder="5 character search code"  type="text" className="SearchBar" onChange={(e)=>onInputChange(e.target.value)}></input>    
            <button className={`SearchButton ${validationError!=null? "DisabledSearchButton" : ""}`} disabled={validationError!=null} onClick={()=>onSearchClicked()}>Load</button>
        </div>   
        {validationError!=null?  <p className="searchError">{validationError}</p> : ""}
    </div></div>
}