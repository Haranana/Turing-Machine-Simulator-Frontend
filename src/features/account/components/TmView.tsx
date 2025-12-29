import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeSlashIcon, TrashIcon } from "@heroicons/react/24/solid"
import { toast } from 'react-hot-toast';
import { useState } from "react";

import { useTuringMachineData, useTuringMachineSettings } from "@state/GlobalData";
import type { TuringMachineGetDto } from "@account/types/AccountDataTypes"
import { useApiFetch } from "@api/apiUtils";
import Modal from "@modal/Modal";
import TuringMachineToLoadDetails from "@account/components/TmViewDetails";

type inputProp = {tm: TuringMachineGetDto, tmId: number, handleDeleted: ()=>void, handleVisibilityChanged: ()=>void}

    export function dateToShowable(date: string){
        const DateTime: string[] = date.split("T");
        const time = DateTime[1].substring(0, 5);

        return DateTime[0]+" "+time;
    }   

    export function descriptionToShortened(desc: string){
        if(desc.length > 30){
            return (desc.substring(0,30).concat("..."));
        }else{
            return desc;
        }
    }

export default function TuringMachineToLoad(props: inputProp){

    const {tmDataName, setTmDataName, setTmDataTapesAmount, setTmDataProgram, setTmDataTapesInputs} = useTuringMachineData();
    const {setAliases, setSpecialStates,setOnlyComplete , setRejectOnNonAccept ,setAllowMultipleTapes, setAllowNondeterminism, setInputAlphabet, setTapeAlphabet, setStatesSet, setOnlyInputAlphabet, setOnlyTapeAlphabet, setOnlyStatesFromSet} = useTuringMachineSettings();

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

        let clearInput: string[] = [];
        for(let i =0 ; i < props.tm.tapesAmount; i++){
            clearInput.push("");
        } 
        setTmDataTapesInputs(clearInput);

        setAllowMultipleTapes(props.tm.specialSettings.allowMultipleTapes)
        setAllowNondeterminism(props.tm.specialSettings.allowNondeterminism)
        setOnlyComplete(props.tm.specialSettings.onlyComplete)
        setRejectOnNonAccept(props.tm.specialSettings.allowMultipleTapes)
        
        setOnlyInputAlphabet(props.tm.specialSettings.onlyInputAlphabet);
        setOnlyTapeAlphabet(props.tm.specialSettings.onlyTapeAlphabet);
        setOnlyStatesFromSet(props.tm.specialSettings.onlyStatesFromSet);

        setInputAlphabet(props.tm.specialSettings.inputAlphabet);
        setTapeAlphabet(props.tm.specialSettings.tapeAlphabet);
        setStatesSet(props.tm.specialSettings.statesSet);

        toast.success("Turing Machine loaded successfully");
    }

    async function deleteTuringMachine(){
        try{
            const res = await apiFetch(`http://localhost:9090/api/tm/${props.tm.name}` , {
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

    async function changeVisibility(){
            try{
            const res = await apiFetch(`http://localhost:9090/api/tm/visibility/${encodeURIComponent(props.tm.name)}` , {
                method: "POST",
            })
            if(res.status == 200){
                toast.success("Turing Machine Visibility changed successfully");
                props.handleVisibilityChanged();
            }else{
                toast.error(`Turing Machine visibility couldn't be changed\n${res.status} ${res.statusText}\n${res.text}`);
            }
        }catch(e: any){
            toast.error(`Error: Turing Machine visibility couldn't be changed\n${e}`);
        }
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
                <span className="TmRowDesc TmRowTextField">{descriptionToShortened(props.tm.description)}</span>
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
                {props.tm.isPublic? <span className="TmRowVisiblityIcon TmRowIcon" onClick={()=>changeVisibility()}><EyeIcon /></span>  : <span onClick={()=>changeVisibility()} className="TmRowVisiblityIcon TmRowIcon"><EyeSlashIcon/></span>}
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