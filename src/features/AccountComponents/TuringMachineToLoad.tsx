import { useSimulationProgram } from "../../features/GlobalData/simulationProgram"
import {useSpecialStates} from "../../features/GlobalData/specialStates"
import { useSimulationAliases } from "../../features/GlobalData/simulationAliases";
import { useSimulationInput } from "../GlobalData/simulationInput";
import type { TuringMachineGetDto } from "./AccountDataTypes"
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/24/solid"
import { useApiFetch } from "../../api/util";
import { toast } from 'react-hot-toast';
import Modal from "../Modal/Modal";
import { useState } from "react";
type inputProp = {tm: TuringMachineGetDto, handleDeleted: ()=>void}

export default function TuringMachineToLoad(props: inputProp){

    const {setCodeLines} = useSimulationProgram();
    const {setSpecialStates } = useSpecialStates();
    const {setSimulationAliases} = useSimulationAliases();
    const {setSimulationTapesAmount} = useSimulationInput();
    const apiFetch = useApiFetch();

    const [isDeleteTmModalOpen, setDeleteTmModalOpen] = useState<boolean>(false);

    function dateToShowable(date: string){
        const DateTime: string[] = date.split("T");
        const time = DateTime[1].substring(0, 5);

        return DateTime[0]+" "+time;
    }   

    function onLoadTuringMachine(){
        //console.log("Program to load: ", props.tm.program.split("\n"));
        setCodeLines(props.tm.program.split("\n"));
        setSpecialStates(props.tm.initialState, props.tm.acceptState, props.tm.rejectState);
        setSimulationAliases({
            sep1: props.tm.sep1,
            sep2: props.tm.sep2,
            blank: props.tm.blank,
            right: props.tm.moveRight,
            left: props.tm.moveLeft,
            stay: props.tm.moveStay,
        });
        setSimulationTapesAmount(props.tm.tapesAmount);
    }

    async function deleteTuringMachine(){
        try{
            const res = await apiFetch(`http://localhost:9090/api/tm/${props.tm.id}` , {
                method: "DELETE",
            })
            if(res.status == 200 || res.status == 204){
                //console.log("tm deleted succesfully: ", res.status);
                toast.success("Turing Machine deleted successfully");
            }else{
                //console.log("tm couldn't be deleted: ", res.status );
                toast.error(`Turing Machine couldn't be deleted\n${res.status} ${res.statusText}\n${res.text}`);
            }
        }catch(e: any){
            //console.log("Exception has occured when deleting tm");
            toast.error(`Error: Turing Machine couldn't be deleted\n${e}`);
        }
        props.handleDeleted();
    }

    return <>
        <div className="TuringMachineRow">
            <div className="TmRowShowWrapper TmRowButtonWrapper" >
                <button className="TmRowShowButton TmRowButton"><ChevronDownIcon ></ChevronDownIcon></button>
            </div>
            <div className="TmRowNameWrapper TmRowTextWrapper">
                <span className="TmRowName TmRowTextField">{props.tm.name}</span>
            </div>
            <div className="TmRowDescWrapper TmRowTextWrapper">
                <span className="TmRowDesc TmRowTextField">{props.tm.description}</span>
            </div>
            <div className="TmRowUpdateWrapper TmRowTextWrapper">
                <span className="TmRowUpdatedDate TmRowTextField">{dateToShowable(props.tm.updatedAt)}</span>
            </div>
            {/*<span className="TmRowCreatedDate TmRowTextField">{props.tm.createdAt}</span>*/}
            <div className="TmRowLoadWrapper TmRowButtonWrapper">
                <button className="TmRowLoadButton TmRowButton" onClick={()=>{onLoadTuringMachine()}}>Load</button>
            </div>
            <div className="TmRowDeleteWrapper TmRowButtonWrapper">
                <button className="TmRowDeleteButton TmRowButton" onClick={()=>{setDeleteTmModalOpen(true)}}><TrashIcon></TrashIcon></button>
            </div>
        </div>
        <Modal open={isDeleteTmModalOpen} onClose={()=>{setDeleteTmModalOpen(false)}}>
                <div className="DeleteTmModalTextWrapper">
                    <h2>Delete {props.tm.name} ?</h2>
                    <p>Deleting Turing machine is irreversible, please confirm you really mean it.</p>
                </div>
                <div className="DeleteTmModalButtonsWrapper">
                    <button className="ModalButton DeleteTmModalButton DeleteTmModalDeleteButton" onClick={()=>{deleteTuringMachine(); setDeleteTmModalOpen(false);}}>Delete</button>
                    <button className="ModalButton DeleteTmModalButton DeleteTmModalCancelButton" onClick={()=>{setDeleteTmModalOpen(false)}}>Cancel</button>
                </div>
        </Modal>
    </>
}