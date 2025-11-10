import { useSimulationProgram } from "../../features/GlobalData/simulationProgram"
import {useSpecialStates} from "../../features/GlobalData/specialStates"
import { useSimulationAliases } from "../../features/GlobalData/simulationAliases";
import { useContext, useState } from "react";
import { AccountDataContext } from "./AccountDataContext";
import type { AccountData } from "./AccountDataContext";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { useApiFetch } from "../../api/util";


export default function SaveTuringMachine(){
    const accountData = useContext(AccountDataContext);
    const apiFetch = useApiFetch();
    const {codeLines, setCodeLines} = useSimulationProgram();
    const { initialState, acceptState, rejectState, setSpecialStates } = useSpecialStates();
    const {sep1, sep2, blank, left, right, stay , setSimulationAliases} = useSimulationAliases();
    const [newTuringMachineName , setNewTuringMachineName] = useState<string>("");
    const [newTuringMachineDescription , setNewTuringMachineDescription] = useState<string>("");
    const [initialValidationPassed, setInitialValidationPassed] = useState<boolean>(false);

    function isAccountDataLoaded(){
        return accountData!=null&& accountData.id != null && accountData.email != null && accountData.status != null && accountData.createdAt != null;
    }

    function initialValidation(name: string, description: string){
        accountData!=null && name.length > 0 && name.length <= 30 && description.length > 0 && description.length <= 255 &&
        accountData.id != null && accountData.email != null && accountData.status != null && accountData.createdAt != null ? setInitialValidationPassed(true) : setInitialValidationPassed(false);
    }

    async function handleSubmit(e: React.MouseEvent){
        e.preventDefault();
        const sendBody = {
            name: newTuringMachineName,
            description: newTuringMachineDescription,
            program: codeLines.join("\n"),
            initialState: initialState,
            acceptState: acceptState,
            rejectState: rejectState,
            blank: blank,
            sep1: sep1,
            sep2: sep2,
            tapesAmount: 1,
                };
        try{
            console.log(`sent: ${sendBody} | location: http://localhost:9090/api/tm`);
            const res = await apiFetch("http://localhost:9090/api/tm" , {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    sendBody
                )
            });
            if(res.status == 200 || res.status == 201){
                console.log("machine saved succefully: ", res.status);
            }else{
                console.log("error while saving machine has occured: ", res.status);
            }
        }catch(e: any){
            console.log("exception while saving machine has occured: ", e);
        }
    }

    return <div className="AccountPageSubpage SaveTuringMachineSubpage">
        {isAccountDataLoaded()?
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
            <button className={`AccountPageSaveFormButton ${initialValidationPassed? "" : "DisabledButton"}`} disabled={!initialValidationPassed} onClick={handleSubmit}>Save<PencilSquareIcon/></button>
        </form>
        :
        "Account data not loaded :("
        }

    </div>
}