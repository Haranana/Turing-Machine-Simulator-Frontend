import type { TuringMachineGetDto } from "./AccountDataTypes";
import { dateToShowable } from "./TuringMachineToLoad";

type inputProp = {tm: TuringMachineGetDto, isVisible: boolean, tmId: number}

export default function TuringMachineToLoadDetails({tm, isVisible}: inputProp){
    return <div className={`TmDetails ${isVisible? "TmDetailsVisible" : ""}`}>
            <div className="TmDetailsColumn TmDetailsColumn1">
                <p className="TmDetailsRow TmDetailsText TmDetailsName">name: {tm.name}</p>
                <div className="TmDetailsRow">
                    <p className=" TmDetailsText "></p>
                    <textarea rows={4} cols={30}  className="TmDetailsDescription" 
                        name="TmDetailsDescription" value={tm.description} placeholder="Description" readOnly>
                    </textarea>
                 </div>
            
                <hr className="TmDetailsSeparator"></hr>
                <p className="TmDetailsRow TmDetailsText TmDetailsInitialState">Initial State: {tm.initialState}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsAcceptState">Accept State: {tm.acceptState}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsRejectState">Reject State: {tm.rejectState}</p>
                <hr className="TmDetailsSeparator"></hr>
                <p className="TmDetailsRow TmDetailsText TmDetailsBlank">Blank: {tm.blank}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsSep1">Sep1: {tm.sep1}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsSep2">Sep2: {tm.sep2}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsRight">Right: {tm.moveRight}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsLeft">Left: {tm.moveLeft}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsStay">Stay: {tm.moveStay}</p>
                <hr className="TmDetailsSeparator"></hr>
                <p className="TmDetailsRow TmDetailsText TmDetailsTapes">Tapes Amount: {tm.tapesAmount}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsCreatedAt">Created at: {dateToShowable( tm.createdAt)}</p>
                <p className="TmDetailsRow TmDetailsText TmDetailsUpdatedAt">Last update: {dateToShowable(tm.updatedAt)}</p>
            </div>
            <div className="TmDetailsColumn TmDetailsColumn2">
                <textarea  cols={50} rows={40}  className="TmDetailsProgram" 
                        name="TmDetailsProgram" value={tm.program} placeholder="Program" readOnly>
                </textarea>
            </div>

        </div>
}