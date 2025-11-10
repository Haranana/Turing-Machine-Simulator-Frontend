import { useState } from "react"
import type { TuringMachineGetDto } from "./AccountDataTypes"
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/24/solid"

type inputProp = {tm: TuringMachineGetDto}

function dateToShowable(date: string){
        const DateTime: string[] = date.split("T");
        const time = DateTime[1].substring(0, 5);

        return DateTime[0]+" "+time;
}

export default function TuringMachineToLoad(props: inputProp){

    return <div className="TuringMachineRow">
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
            <button className="TmRowLoadButton TmRowButton">Load</button>
        </div>
        <div className="TmRowDeleteWrapper TmRowButtonWrapper">
            <button className="TmRowDeleteButton TmRowButton"><TrashIcon></TrashIcon></button>
        </div>
    </div>
}