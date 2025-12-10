import { useContext, useEffect, useState } from "react";
import { AccountDataContext } from "./AccountDataContext";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { useApiFetch } from "../../api/util";
import { toast } from 'react-hot-toast';
import Modal from "../Modal/Modal";
import type { TuringMachineEditDto, TuringMachineGetDto, TuringMachineSaveDto } from "./AccountDataTypes";
import { useTuringMachineData, useTuringMachineSettings } from "../GlobalData/GlobalData";


export default function SaveTuringMachine(){
    const accountData = useContext(AccountDataContext);
    const apiFetch = useApiFetch();

    const {tmDataProgram , tmDataTapesAmount, tmDataName, setTmDataName} = useTuringMachineData();
    const {onlyComplete, rejectOnNonAccept , allowMultipleTapes,allowNondeterminism, inputAlphabet, tapeAlphabet, statesSet, onlyInputAlphabet, onlyTapeAlphabet, onlyStatesFromSet} = useTuringMachineSettings(s=>s.specialSettings);
    const { symbolSeparator,transitionArrow,blank, left, right, stay} = useTuringMachineSettings(s=>s.aliases);
    const {initialState, acceptState, rejectState} = useTuringMachineSettings(s=>s.specialStates);

    //data from input fields in save as
    const [newTuringMachineName , setNewTuringMachineName] = useState<string>("");
    const [newTuringMachineDescription , setNewTuringMachineDescription] = useState<string>("");



    const [isSaveTmModalOpen, setSaveTmModalOpen] = useState<boolean>(false);
    const [tmToOverwrite, setTmToOverwrite] = useState<{id: number, name: string}|null>(null);

    function isAccountDataLoaded(){
        return accountData!=null&& accountData.id != null && accountData.email != null && accountData.status != null && accountData.createdAt != null;
    }

const [initialValidationPassed, setInitialValidationPassed] = useState<boolean>(false);
const [initialValidationError, setInitialValidationError] = useState<string | null>(null);

function initialValidation(name: string, description: string) {

  setInitialValidationPassed(false);
  setInitialValidationError(null);

  if (!accountData) {
    setInitialValidationError("Account data is null");
    return;
  }

  if (!accountData.id || !accountData.email || !accountData.status || !accountData.createdAt) {
    setInitialValidationError("Account data is incomplete");
    return;
  }

  if (name.length === 0) {
    setInitialValidationError("Name is required");
    return;
  }

  if (name.length > 30) {
    setInitialValidationError("Name must be at most 30 characters long");
    return;
  }

  if (description.length === 0) {
    setInitialValidationError("Description is required");
    return;
  }

  if (description.length > 255) {
    setInitialValidationError("Description must be at most 255 characters long");
    return;
  }


  setInitialValidationPassed(true);
  setInitialValidationError(null);
}

    async function handleSaveAs(e: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault();
         const sendBody : TuringMachineSaveDto = {
                    name: newTuringMachineName,
                    description: newTuringMachineDescription,
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
                    }
                };
        try{
            const res = await apiFetch("http://localhost:9090/api/tm" , {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    sendBody
                )
            });
            if(res.status == 200 || res.status == 201){
                toast.success(`Turing Machine saved successfully`);
                const dto : TuringMachineGetDto = await res.json();
                setTmDataName(dto.name);
                //setLoadedTmData(dto.name, dto.id);
                
            }else if(res.status == 409){
                const pd = await res.json(); 
                setTmToOverwrite({ id: pd.existingId, name: pd.name });
                setSaveTmModalOpen(true);
            }
            else{
                const text = await res.text();
                toast.error(`Turing Machine couldn't be saved\n${text}`);
            }
        }catch(e: any){
             toast.error(`[ex] Turing Machine couldn't be saved\n`);
        }

    }

    async function handleSave(e: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        e.preventDefault()

        //if tmToOverwrite is not null then we overwrite some tm, 
        //otherwise use id of lastly loaded tm
        //otherwise there's not any tm loaded, so error (just probably route to save as in the future)
        let tmToSaveName: string| null = null;
        let tmToSaveDescription: string| null = null;

        if(tmToOverwrite != null){ //overwritting some machine
            tmToSaveName = newTuringMachineName;
            tmToSaveDescription = newTuringMachineDescription
        }else if(tmDataName != null){ //no overwritting, just editing currently loaded one
            //tmToSaveId = loadedTmId;
            tmToSaveName = null;
            tmToSaveDescription = null;
        }else{ //oops
              toast.error(`No Turing Machine Loaded\nuse Save as to create new one!`);
              return;
        }

        if(tmDataName == null){
            toast.error("No turing machine is currently loaded,\nplease create new one by using Save as option");
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
                    }
                };
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

    useEffect(()=>{initialValidation("","")},[])

    return <>
    <div className="AccountPageSubpage SaveTuringMachineSubpage">
        {isAccountDataLoaded() ?
        
        <>
       
            <h1 className="CreateTuringMachineTitle">Create Turing Machine</h1>
       
            
        
         <form className="SaveTuringMachineForm">

            <label className="AccountInputFieldLabel">
            <textarea rows={1} className="TmNameInput AccountInputField"
              name="TmNameInput" id="TmNameInput" value={newTuringMachineName} placeholder="Name"
              onChange={(e)=>{initialValidation(e.target.value, newTuringMachineDescription); setNewTuringMachineName(e.target.value)}}
            maxLength={30}>
            </textarea>
            </label>
            <label className="AccountInputFieldLabel"><textarea rows={4} className="TmDescriptionInput AccountInputField"
             name="TmDescriptionInput" id="TmDescriptionInput" value={newTuringMachineDescription}  placeholder="Description"
              onChange={(e)=>{initialValidation(newTuringMachineName, e.target.value); setNewTuringMachineDescription(e.target.value)}} 
              maxLength={255}>
            </textarea>
                </label>
            {!initialValidationPassed? <p className="CreateTuringMachineError">{initialValidationError}</p> : "" }
            <button className={`AccountPageSaveFormButton ${initialValidationPassed? "" : "DisabledButton"}`}
             disabled={!initialValidationPassed} onClick={e=>handleSaveAs(e)}>Save as<PencilSquareIcon/></button>
        </form>
        </>
        :
        "User data couldn't be loaded."
        }

    </div>
    <Modal open={isSaveTmModalOpen} onClose={()=>{setSaveTmModalOpen(false); setTmToOverwrite(null)}}>
                    <div className="ModalTextWrapper OverwriteTmModalTextWrapper">
                        <h2>overwrite {newTuringMachineName} ?</h2>
                        <p>Turing machine named {newTuringMachineName} already exists, would you like to overwrite it?
                            You will Not be able to restore old Turing Machine once it's saved over.
                        </p>
                    </div>
                    <div className="ModalButtonsWrapper OverwriteTmModalButtonsWrapper">
                        <button className="ModalButton OverwriteTmModalButton OverwriteTmModalDeleteButton" 
                        onClick={(e)=>{handleSave(e);setSaveTmModalOpen(false)}}>Overwrtie</button>
                        <button className="ModalButton DeleteTmModalButton DeleteTmModalCancelButton" 
                        onClick={()=>setSaveTmModalOpen(false)}>Cancel</button>
                    </div>
    </Modal>
    </>
}