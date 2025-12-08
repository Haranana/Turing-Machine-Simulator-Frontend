import { useState } from "react";
import type { TuringMachineGetDto } from "./AccountDataTypes";
import { dateToShowable } from "./TuringMachineToLoad";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

type inputProp = {tm: TuringMachineGetDto, isVisible: boolean, tmId: number}

export default function TuringMachineToLoadDetails({tm, isVisible}: inputProp){
    const [showInputAlphabet , setShowInputAlphabet] = useState<boolean>(false);
    const [showTapeAlphabet , setShowTapeAlphabet] = useState<boolean>(false);
    const [showStatesSet , setShowStatesSet] = useState<boolean>(false);

    return <div className={`TmDetails ${isVisible? "TmDetailsVisible" : ""}`}>
            <div className="TmDetailsColumn TmDetailsColumn1">
                <div className="TmDetailsSegment TmDetailsOneColumnSegment">
                    <div className="TmDetailsRow">
                        <p className=" TmDetailsTextTitle  TmDetailsDescriptionTitle">Description:</p>
                    </div>
                    <div className="TmDetailsRow TmDetailsTextAreaRow">
                       <textarea
                            className="TmDetailsDescription"
                            name="TmDetailsDescription"
                            value={tm.description}
                            placeholder="Description"
                            readOnly
                            />
                    </div>
                </div>

                <hr className="TmDetailsSeparator"></hr>

                <div className="TmDetailsSegment TmDetailsOneColumnSegment">
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Initial State:</p>
                        <p className="TmDetailsTextValue">{tm.initialState}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Accept State:</p>
                        <p className="TmDetailsTextValue">{tm.acceptState}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Reject State:</p>
                        <p className="TmDetailsTextValue">{tm.rejectState}</p>
                    </div>
                </div>

                <hr className="TmDetailsSeparator"></hr>

                <div className="TmDetailsSegment TmDetailsTwoColumnSegment">
                    <div className="TmDetailsSegmentColumn TmDetailsSegmentFirstColumn"> 
                        <div className="TmDetailsRow">
                            <p className="TmDetailsTextTitle">Blank:</p>
                            <p className="TmDetailsTextValue">{tm.blank}</p>
                        </div>
                        <div className="TmDetailsRow">
                            <p className="TmDetailsTextTitle">Symbol sep:</p>
                            <p className="TmDetailsTextValue">{tm.sep1}</p>
                        </div>
                        <div className="TmDetailsRow">
                            <p className="TmDetailsTextTitle">Arrow sep:</p>
                            <p className="TmDetailsTextValue">{tm.sep2}</p>
                        </div>
                    </div>
                

                    <div className="TmDetailsSegmentColumn TmDetailsSegmentSecondColumn"> 
                        <div className="TmDetailsRow">
                            <p className="TmDetailsTextTitle">Right:</p>
                            <p className="TmDetailsTextValue">{tm.moveRight}</p>
                        </div>
                        <div className="TmDetailsRow">
                            <p className="TmDetailsTextTitle">Left:</p>
                            <p className="TmDetailsTextValue">{tm.moveLeft}</p>
                        </div>
                        <div className="TmDetailsRow">
                            <p className="TmDetailsTextTitle">Stay:</p>
                            <p className="TmDetailsTextValue">{tm.moveStay}</p>
                        </div>
                    </div>

                </div>
                <hr className="TmDetailsSeparator"></hr>

                <div className="TmDetailsSegment TmDetailsOneColumnSegment">
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Tapes amount:</p>
                        <p className="TmDetailsTextValue">{tm.tapesAmount}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Created at:</p>
                        <p className="TmDetailsTextValue">{dateToShowable(tm.createdAt)}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Last update:</p>
                        <p className="TmDetailsTextValue">{dateToShowable(tm.updatedAt)}</p>
                    </div>
                </div>

                <hr className="TmDetailsSeparator"></hr>

                <div className="TmDetailsSegment TmDetailsOneColumnSegment">
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Public:</p>
                        <p className="TmDetailsTextValue">{tm.isPublic? "Yes" : "No"}</p>
                    </div>
                    {tm.isPublic?
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Share code:</p>
                        <p className="TmDetailsTextValue">{tm.shareCode}</p>
                    </div>: ""}      
                </div>

                <hr className="TmDetailsSeparator"></hr>

                
                <div className="TmDetailsSegment TmDetailsOneColumnSegment">
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Allow nondeterminism:</p>
                        <p className="TmDetailsTextValue">{tm.specialSettings.allowNondeterminism? "Yes" : "No"}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Allow multiple tapes:</p>
                        <p className="TmDetailsTextValue">{tm.specialSettings.allowMultipleTapes? "Yes" : "No"}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Reject on non-accept:</p>
                        <p className="TmDetailsTextValue">{tm.specialSettings.rejectOnNonAccept? "Yes" : "No"}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Force completeness:</p>
                        <p className="TmDetailsTextValue">{tm.specialSettings.onlyComplete? "Yes" : "No"}</p>
                    </div>
                </div>

                <div className="TmDetailsSegment TmDetailsOneColumnSegment">
                    
                    
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle"> defined input alphabet:</p>
                        <p className="TmDetailsTextValue">{tm.specialSettings.onlyInputAlphabet? "Yes" : "No"}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className=" TmDetailsTextTitle  TmDetailsDescriptionTitle">Input alphabet:</p>
                         <button className=" TmDetailsButton" onClick={()=>setShowInputAlphabet(!showInputAlphabet)}>{showInputAlphabet? <ChevronUpIcon className="TmDetailsButtonIcon"/> : <ChevronDownIcon className="TmDetailsButtonIcon"/> }</button>
                    </div>
                    {showInputAlphabet?
                    <div className="TmDetailsRow TmDetailsTextAreaRow">
                       <textarea
                            className="TmDetailsDescription"
                            name="TmDetailsDescription"
                            value={tm.specialSettings.inputAlphabet}
                            placeholder="Description"
                            readOnly
                            />
                    </div> : "" }

                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">defined tape alphabet:</p>
                        <p className="TmDetailsTextValue">{tm.specialSettings.onlyTapeAlphabet? "Yes" : "No"}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className=" TmDetailsTextTitle  TmDetailsDescriptionTitle">Tape alphabet:</p>
                         <button className=" TmDetailsButton" onClick={()=>setShowTapeAlphabet(!showTapeAlphabet)}>{showTapeAlphabet? <ChevronUpIcon className="TmDetailsButtonIcon" /> : <ChevronDownIcon className="TmDetailsButtonIcon"/> }</button>
                    </div>
                    {showTapeAlphabet?
                    <div className="TmDetailsRow TmDetailsTextAreaRow">
                       <textarea
                            className="TmDetailsDescription"
                            name="TmDetailsDescription"
                            value={tm.specialSettings.tapeAlphabet}
                            placeholder="Description"
                            readOnly
                            />
                    </div> : ""}
                    
                    <div className="TmDetailsRow">
                        <p className="TmDetailsTextTitle">Use defined states set:</p>
                        <p className="TmDetailsTextValue">{tm.specialSettings.onlyStatesFromSet? "Yes" : "No"}</p>
                    </div>
                    <div className="TmDetailsRow">
                        <p className=" TmDetailsTextTitle  TmDetailsDescriptionTitle">States set:</p>
                        <button className=" TmDetailsButton" onClick={()=>setShowStatesSet(!showStatesSet)}>{showStatesSet? <ChevronUpIcon className="TmDetailsButtonIcon"/> : <ChevronDownIcon className="TmDetailsButtonIcon"/> }</button>
                    </div>
                    {showStatesSet?
                    <div className="TmDetailsRow TmDetailsTextAreaRow">
                       <textarea
                            className="TmDetailsDescription"
                            name="TmDetailsDescription"
                            value={tm.specialSettings.statesSet}
                            placeholder="Description"
                            readOnly
                            />
                    </div> : ""}

                </div>
                
            </div>

            <div className="TmDetailsColumn TmDetailsColumn2">
                <textarea className="TmDetailsProgram" 
                        name="TmDetailsProgram" value={tm.program} placeholder="Program" readOnly>
                </textarea>
            </div>

        </div>
}