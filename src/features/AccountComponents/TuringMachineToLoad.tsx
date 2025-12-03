import { useTuringMachineData } from "../GlobalData/GlobalData";
import { useTuringMachineSettings } from "../GlobalData/GlobalData";
import type { TuringMachineGetDto } from "./AccountDataTypes"
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeSlashIcon, TrashIcon } from "@heroicons/react/24/solid"
import { useApiFetch } from "../../api/util";
import { toast } from 'react-hot-toast';
import Modal from "../Modal/Modal";
import { useState } from "react";
import TuringMachineToLoadDetails from "./TuringMachineToLoadDetails";

type inputProp = {tm: TuringMachineGetDto, tmId: number, handleDeleted: ()=>void}

    export function dateToShowable(date: string){
        const DateTime: string[] = date.split("T");
        const time = DateTime[1].substring(0, 5);

        return DateTime[0]+" "+time;
    }   

export default function TuringMachineToLoad(props: inputProp){

    const {tmDataName, setTmDataName, setTmDataTapesAmount, setTmDataProgram} = useTuringMachineData();
    const {setAliases, setSpecialStates} = useTuringMachineSettings();

    const apiFetch = useApiFetch();

    const [isDeleteTmModalOpen, setDeleteTmModalOpen] = useState<boolean>(false);
    const [areDetailsVisible , setDetailsVisible] = useState<boolean>(false);



    function onLoadTuringMachine(){
        setTmDataProgram(props.tm.program.split("\n"));
        setSpecialStates(props.tm.initialState, props.tm.acceptState, props.tm.rejectState);
        setAliases({
            symbolSeparator: props.tm.sep1,
            transitionArrow: props.tm.sep2,
            blank: props.tm.blank,
            right: props.tm.moveRight,
            left: props.tm.moveLeft,
            stay: props.tm.moveStay,
        });
        setTmDataTapesAmount(props.tm.tapesAmount);
        setTmDataName(props.tm.name);
    }

    async function deleteTuringMachine(){
        try{
            const res = await apiFetch(`http://localhost:9090/api/tm/${props.tm.id}` , {
                method: "DELETE",
            })
            if(res.status == 200 || res.status == 204){
                toast.success("Turing Machine deleted successfully");
                if(props.tm.name === tmDataName){
                    setTmDataName(null);
                }
            }else{
                toast.error(`Turing Machine couldn't be deleted\n${res.status} ${res.statusText}\n${res.text}`);
            }
        }catch(e: any){
            toast.error(`Error: Turing Machine couldn't be deleted\n${e}`);
        }
        props.handleDeleted();
    }

    return <>
        <div className="TuringMachineRow">
            <div className="TmRowShowWrapper TmRowButtonWrapper" >
                <button className="TmRowShowButton TmRowButton" onClick={()=>setDetailsVisible(!areDetailsVisible)}>{areDetailsVisible? <ChevronUpIcon/> : <ChevronDownIcon/>}</button>
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
            <div className="TmRowLoadWrapper TmRowButtonWrapper">
                <button className="TmRowLoadButton TmRowButton" onClick={()=>{onLoadTuringMachine()}}>Load</button>
            </div>
            <div className="TmRowDeleteWrapper TmRowButtonWrapper">
                <button className="TmRowDeleteButton TmRowButton" onClick={()=>{setDeleteTmModalOpen(true)}}><TrashIcon></TrashIcon></button>
            </div>
            <div className="TmRowVisibilityWrapper TmRowButtonWrapper">
                {props.tm.isVisible? <span className="TmRowVisiblityIcon TmRowIcon"><EyeIcon /></span>  : <span className="TmRowVisiblityIcon TmRowIcon"><EyeSlashIcon/></span>}
            </div>
        </div>
        <TuringMachineToLoadDetails tm={props.tm} tmId={props.tmId} isVisible={areDetailsVisible}/>
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