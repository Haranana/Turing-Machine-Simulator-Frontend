import './page.css';
import './SettingsPage.css'
import {useSimulationAliases} from '../features/GlobalData/simulationAliases'
import { useSpecialStates } from '../features/GlobalData/specialStates';
import type {AliasesFields} from '../features/GlobalData/simulationAliases'
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';



export default  function SettingsPage() {

    const { sep1, sep2, blank, left, stay, right, setSimulationAliases} = useSimulationAliases()
    const { initialState, acceptState, rejectState, setSpecialStates} = useSpecialStates()

    const sep1Ref = useRef<HTMLInputElement>(null);
    const sep2Ref = useRef<HTMLInputElement>(null);
    const blankRef = useRef<HTMLInputElement>(null);
    const leftRef = useRef<HTMLInputElement>(null);
    const stayRef = useRef<HTMLInputElement>(null);
    const rightRef = useRef<HTMLInputElement>(null);

    const initialRef = useRef<HTMLInputElement>(null);
    const acceptRef = useRef<HTMLInputElement>(null);
    const rejectRef = useRef<HTMLInputElement>(null);

    const [allowedToSave, setAllowedToSave] = useState<boolean>(true);
    const [savedSuccesfuly, setSavedSuccesfuly] = useState<boolean | null>(null);

    const SaveSettings: () => void = () => {

        let sep1RefValue = sep1Ref.current?.value;
        sep1RefValue = sep1RefValue === undefined? sep1 : sep1RefValue as string;

        let sep2RefValue = sep2Ref.current?.value;
        sep2RefValue = sep2RefValue === undefined? sep2 : sep2RefValue as string;

        let blankRefValue = blankRef.current?.value;
        blankRefValue = blankRefValue === undefined? blank : blankRefValue as string;

        let leftRefValue = leftRef.current?.value;
        leftRefValue = leftRefValue === undefined? left : leftRefValue as string;

        let stayRefValue = stayRef.current?.value;
        stayRefValue = stayRefValue === undefined? stay : stayRefValue as string;

        let rightRefValue = rightRef.current?.value;
        rightRefValue = rightRefValue === undefined? right : rightRefValue as string;

        sep2RefValue = sep1RefValue // ! currently API only accepts 1 separator, change when API is updated

        let initialRefValue = initialRef.current?.value;
        initialRefValue = initialRefValue === undefined? initialState : initialRefValue as string;

        let acceptRefValue = acceptRef.current?.value;
        acceptRefValue = acceptRefValue === undefined? acceptState : acceptRefValue as string;

        let rejectRefValue = rejectRef.current?.value;
        rejectRefValue = rejectRefValue === undefined? rejectState : rejectRefValue as string;

        setSimulationAliases({
            sep1: sep1RefValue,
            sep2: sep2RefValue,
            blank: blankRefValue,
            left: leftRefValue,
            stay: stayRefValue,
            right: rightRefValue,
        });

        
        setSpecialStates(
            initialRefValue,
            acceptRefValue,
            rejectRefValue
        );

        toast.success('Changes saved');
    }

    function onInputChange(value: string){
        if(value==="" || value==null){
            setAllowedToSave(false);
        }else{
            setAllowedToSave(true);
        }

    }

    return(
        <div>
                <div className='SettingsSegment SimulationAliasesSegment'>
                    <div className='SegmentFirstColumn'>
                            <p className='SegmentTitle'>Simulation Aliases</p>
                            <p className='SegmentDescription'>Choose what symbol or word should indicate separator, move left, move right and stay in your Turing machine program.</p>
                    </div>
                    <div className="SegmentSecondColumn"> 
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="sep1-alias">Separator:</label>
                            <input
                            ref={sep1Ref}
                            className="SettingsTextField Sep1TextField"
                            type="text"
                            name="sep1-alias"
                            minLength={1}
                            maxLength={10}
                            id="sep1-alias"
                            defaultValue={sep1}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="sep2-alias">Separator 2:</label>
                            <input
                            ref={sep2Ref}
                            className="SettingsTextField Sep2TextField"
                            type="text"
                            name="sep2-alias"
                            minLength={1}
                            maxLength={10}
                            id="sep2-alias"
                            defaultValue={sep2}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="blank-alias">Blank:</label>
                            <input
                            ref={blankRef}
                            className="SettingsTextField BlankTextField"
                            type="text"
                            name="blank-alias"
                            minLength={1}
                            maxLength={10}
                            id="blank-alias"
                            defaultValue={blank}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="left-alias">Move head left:</label>
                            <input
                            ref={leftRef}
                            className="SettingsTextField LeftTextField"
                            type="text"
                            name="left-alias"
                            minLength={1}
                            maxLength={10}
                            id="left-alias"
                            defaultValue={left}
                           onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="stay-alias">Don't Move head:</label>
                            <input
                            ref={stayRef}
                            className="SettingsTextField StayTextField"
                            type="text"
                            name="stay-alias"
                            minLength={1}
                            maxLength={10}
                            id="stay-alias"
                            defaultValue={stay}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="right-alias">Move head right:</label>
                            <input
                            ref={rightRef}
                            className="SettingsTextField RightTextField"
                            type="text"
                            name="right-alias"
                            minLength={1}
                            maxLength={10}
                            id="right-alias"
                            defaultValue={right}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        
                    </div>
                </div>
                <hr className='LineSeparator'></hr>
                <div className='SettingsSegment SpecialStatesSegment'>
                    <div className='SegmentFirstColumn'>
                            <p className='SegmentTitle'>Special States</p>
                            <p className='SegmentDescription'>Choose how would you want to refer to special states inside your code.</p>
                    </div>
                    <div className="SegmentSecondColumn"> 
                                                <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="StateAccept">Accept state:</label>
                            <input
                            ref={rejectRef}
                            className="SettingsTextField LeftTextField"
                            type="text"
                            name="StateAccept"
                            minLength={1}
                            maxLength={20}
                            id="StateAccept"
                            defaultValue={acceptState}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="StateReject">Reject state</label>
                            <input
                            ref={acceptRef}
                            className="SettingsTextField StayTextField"
                            type="text"
                            name="StateReject"
                            minLength={1}
                            maxLength={20}
                            id="StateReject"
                            defaultValue={rejectState}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="StateInitial">Initial state:</label>
                            <input
                            ref={initialRef}
                            className="SettingsTextField RightTextField"
                            type="text"
                            name="StateInitial"
                            minLength={1}
                            maxLength={20}
                            id="StateInitial"
                            defaultValue={initialState}
                            onChange={(e)=>onInputChange(e.target.value)}
                            />
                        </div>
                    </div>
                </div>



                <button className={`SaveSettings  ${!allowedToSave? "DisabledButton tooltip lessTooltipPadding" : ""} `} onClick={SaveSettings}
                data-tooltip={!allowedToSave? "No field can be empty" : "Save settings"}
                    >Save</button>
        </div>  
    );
}