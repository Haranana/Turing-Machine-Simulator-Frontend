import '@settings/styles/Settings.css'

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

import { useTuringMachineSettings } from '@state/GlobalData';
import ChipList from '@chiplist/ChipList';

export default  function SettingsPage() {

    const { symbolSeparator, transitionArrow, blank, left, stay, right} = useTuringMachineSettings(s=>s.aliases)
    const {setAliases, setSpecialStates , setAllowMultipleTapes, setAllowNondeterminism,  setOnlyComplete, setOnlyInputAlphabet ,setOnlyStatesFromSet, setOnlyTapeAlphabet, setRejectOnNonAccept, setStatesSet , setTapeAlphabet, setInputAlphabet } = useTuringMachineSettings();
    const { initialState, acceptState, rejectState} = useTuringMachineSettings(s=>s.specialStates)
    const {allowMultipleTapes, allowNondeterminism, onlyComplete, onlyInputAlphabet, onlyStatesFromSet, onlyTapeAlphabet, rejectOnNonAccept, statesSet, tapeAlphabet, inputAlphabet} = useTuringMachineSettings(s=>s.specialSettings);
    

    const [symbolSeparatorFieldValue, setSymbolSeparatorFieldValue] =useState<string>(symbolSeparator);
    const [transitionArrowFieldValue, setTransitionArrowFieldValue] =useState<string>(transitionArrow);
    const [blankFieldValue, setBlankFieldValue] =useState<string>(blank);
    const [leftFieldValue, setLeftFieldValue] =useState<string>(left);
    const [stayFieldValue, setStayFieldValue] =useState<string>(stay);
    const [rightFieldValue, setRightFieldValue] =useState<string>(right);

    const [initialFieldValue, setInitialFieldValue] =useState<string>(initialState);
    const [acceptFieldValue, setAcceptFieldValue] =useState<string>(acceptState);
    const [rejectFieldValue, setRejectFieldValue] =useState<string>(rejectState == null? "" : rejectState);

    const [allowNondeterminismFieldValue, setAllowNondeterminismFieldValue] =useState<boolean>(allowNondeterminism);
    const [allowMultipleTapesFieldValue, setAllowMultipleTapesFieldValue] =useState<boolean>(allowMultipleTapes);
    const [onlyCompleteFieldValue, setOnlyCompleteFieldValue] =useState<boolean>(onlyComplete);
    const [rejectOnNonAcceptFieldValue, setRejectOnNonAcceptFieldValue] =useState<boolean>(rejectOnNonAccept);

    const [inputAlphabetFieldValue, setInputAlphabetFieldValue] = useState<string[]>(inputAlphabet);
    const [tapeAlphabetFieldValue, setTapeAlphabetFieldValue] =useState<string[]>(tapeAlphabet);
    const [statesSetFieldValue, setStatesSetFieldValue] = useState<string[]>(statesSet);

    const [onlyTapeAlphabetFieldValue , setOnlyTapeAlphabetFieldValue] = useState<boolean>(onlyTapeAlphabet);
    const [onlyInputAlphabetFieldValue , setOnlyInputAlphabetFieldValue] = useState<boolean>(onlyInputAlphabet);
    const [onlyStatesFromSetFieldValue , setOnlyStatesFromSetFieldValue] = useState<boolean>(onlyStatesFromSet);

    const [tapeAlphabetDetailsOpen, setTapeAlphabetDetailsOpen] = useState<boolean>(false );
    const [inputAlphabetDetailsOpen, setInputAlphabetDetailsOpen] = useState<boolean>(false );
    const [statesDetailsOpen, setStatesDetailsOpen] = useState<boolean>(false );

    const [_, setSaveError] = useState<string | null>(null);

    const validateAndSave: () => void = () => {
        const trimmedSymbolSeparator = symbolSeparatorFieldValue.trim();
        const trimmedTransitionArrow = transitionArrowFieldValue.trim();
        const trimmedBlank = blankFieldValue.trim();
        const trimmedLeft = leftFieldValue.trim();
        const trimmedStay = stayFieldValue.trim();
        const trimmedRight = rightFieldValue.trim();

        const trimmedInitial = initialFieldValue.trim();
        const trimmedAccept = acceptFieldValue.trim();
        const trimmedReject = rejectFieldValue==""? null : rejectFieldValue.trim() ;

        if (
            trimmedSymbolSeparator.length === 0 ||
            trimmedTransitionArrow.length === 0 ||
            trimmedBlank.length === 0 ||
            trimmedLeft.length === 0 ||
            trimmedStay.length === 0 ||
            trimmedRight.length === 0 ||
            trimmedInitial.length === 0 ||
            trimmedAccept.length === 0) {
                toast.error('Changes couldn\'t be saved\Syntax symbols, initial state and accept state must not be empty');
                setSaveError("Syntax symbols, initial state and accept state must not be empty");
                return;
        }

        if(inputAlphabetFieldValue.includes(trimmedBlank)){
            toast.error('Changes couldn\'t be saved\nInput alphabet cannot contain blank symbol');
            setSaveError("Input alphabet cannot contain blank symbol");
            return;
        }

        if( inputAlphabetFieldValue.some((v,_)=>!tapeAlphabetFieldValue.includes(v))){
            toast.error('Changes couldn\'t be saved\nInput alphabet must be subset of Tape alphabet');
            setSaveError("Input alphabet must be subset of Tape alphabet");
            return;
        }

        let statesSetWithSpecialStates = [...statesSetFieldValue];
        if(!statesSetFieldValue.includes(trimmedInitial)){
            statesSetWithSpecialStates.push(trimmedInitial);
        }
        if(!statesSetFieldValue.includes(trimmedAccept)){
            statesSetWithSpecialStates.push(trimmedAccept);
        }
        if(trimmedReject!=null && !statesSetFieldValue.includes(trimmedReject)){
            statesSetWithSpecialStates.push(trimmedReject);
        }

        setAliases({
            symbolSeparator: trimmedSymbolSeparator,
            transitionArrow: trimmedTransitionArrow,
            blank: trimmedBlank,
            left: trimmedLeft,
            stay: trimmedStay,
            right: trimmedRight,
        });

        
        setSpecialStates(
            trimmedInitial,
            trimmedAccept,
            trimmedReject
        );

        setOnlyComplete(onlyCompleteFieldValue);
        setAllowMultipleTapes(allowMultipleTapesFieldValue);
        setAllowNondeterminism(allowNondeterminismFieldValue);
        
        setOnlyInputAlphabet(onlyInputAlphabetFieldValue);
        setOnlyTapeAlphabet(onlyTapeAlphabetFieldValue);
        setOnlyStatesFromSet(onlyStatesFromSetFieldValue);
        setRejectOnNonAccept(rejectOnNonAcceptFieldValue);

        setInputAlphabet(inputAlphabetFieldValue);
        setTapeAlphabet(tapeAlphabetFieldValue);
        setStatesSet(statesSetWithSpecialStates);

        toast.success('Changes saved');
        setSaveError(null);
    }

    //adds blank to the alphabet if it's missing
    const onTapeAlphabetSetFieldValue: (alp: string[]) => void = (alp: string[]) =>{
        if(alp.find(v=>v.trim()==blank) == undefined){
            alp.push(blank);
        }
        setTapeAlphabetFieldValue(alp);
    }

    return(
        <div className='SettingsPage'>
                <div className='SettingsSegment SimulationAliasesSegment'>
                    <div className='SegmentFirstColumn'>
                            <p className='SegmentTitle'>Transition instruction syntax</p>
                            <p className='SegmentDescription'>Set what symbol or word should indicate separators, blank and moves in Turing machine's program.</p>
                    </div>
                    <div className="SegmentSecondColumn"> 
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="sep1-alias">Symbol separator:</label>
                            <input
                            value={symbolSeparatorFieldValue}
                            className="SettingsTextField Sep1TextField"
                            type="text"
                            name="sep1-alias"
                            minLength={1}
                            maxLength={10}
                            id="sep1-alias"
                            onChange={(e)=>setSymbolSeparatorFieldValue(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="sep2-alias">Transition arrow:</label>
                            <input
                            value={transitionArrowFieldValue}
                            className="SettingsTextField Sep2TextField"
                            type="text"
                            name="sep2-alias"
                            minLength={1}
                            maxLength={10}
                            id="sep2-alias"
                            onChange={(e)=>setTransitionArrowFieldValue(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="blank-alias">Blank:</label>
                            <input
                            value={blankFieldValue}
                            className="SettingsTextField BlankTextField"
                            type="text"
                            name="blank-alias"
                            minLength={1}
                            maxLength={10}
                            id="blank-alias"
                            onChange={(e)=>setBlankFieldValue(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="left-alias">Move head left:</label>
                            <input
                            value={leftFieldValue}
                            className="SettingsTextField LeftTextField"
                            type="text"
                            name="left-alias"
                            minLength={1}
                            maxLength={10}
                            id="left-alias"
                           onChange={(e)=>setLeftFieldValue(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="stay-alias">Don't Move head:</label>
                            <input
                            value={stayFieldValue}
                            className="SettingsTextField StayTextField"
                            type="text"
                            name="stay-alias"
                            minLength={1}
                            maxLength={10}
                            id="stay-alias"
                            onChange={(e)=>setStayFieldValue(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="right-alias">Move head right:</label>
                            <input
                            value={rightFieldValue}
                            className="SettingsTextField RightTextField"
                            type="text"
                            name="right-alias"
                            minLength={1}
                            maxLength={10}
                            id="right-alias"
                            onChange={(e)=>setRightFieldValue(e.target.value)}
                            />
                        </div>

                        
                    </div>
                </div>
                <hr className='LineSeparator'></hr>
                <div className='SettingsSegment SpecialStatesSegment'>
                    <div className='SegmentFirstColumn'>
                            <p className='SegmentTitle'>Special States</p>
                            <p className='SegmentDescription'>Set how would you want to refer to initial, accept and reject states inside code.</p>
                            <p className='SegmentDescription SmallSegmentDescription'>*Reject state is optional.</p>
                    </div>
                    <div className="SegmentSecondColumn"> 
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="StateAccept">Accept state:</label>
                            <input
                            value={acceptFieldValue}
                            className="SettingsTextField LeftTextField"
                            type="text"
                            name="StateAccept"
                            minLength={1}
                            maxLength={20}
                            id="StateAccept"
                            onChange={(e)=>setAcceptFieldValue(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="StateReject">Reject state*:</label>
                            <input
                            value={rejectFieldValue}
                            className="SettingsTextField StayTextField"
                            type="text"
                            name="StateReject"
                            minLength={1}
                            maxLength={20}
                            id="StateReject"
                            onChange={(e)=>setRejectFieldValue(e.target.value)}
                            />
                        </div>

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="StateInitial">Initial state:</label>
                            <input
                            value={initialFieldValue}
                            className="SettingsTextField RightTextField"
                            type="text"
                            name="StateInitial"
                            minLength={1}
                            maxLength={20}
                            id="StateInitial"
                            onChange={(e)=>setInitialFieldValue(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <hr className='LineSeparator'></hr>
                <div className='SettingsSegment SpecialSettingsSegment'>
                    <div className='SegmentFirstColumn'>
                            <p className='SegmentTitle'>Special Settings</p>
                            <p className='SegmentDescription'>Set additional restrictions to Turing machine and explicitly define alphabets and states set.</p>
                    </div>
                    <div className="SegmentSecondColumn">
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="NonDet">Allow nondeterminism:</label>
                            <input
                            checked={allowNondeterminismFieldValue}
                            className="SettingsCheckbox"
                            type="checkbox"
                            name="NonDet"
                            id="NonDet"
                            onChange={e=>setAllowNondeterminismFieldValue(e.target.checked)}
                            />
                        </div>
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="MultTapes">Allow Multiple tapes:</label>
                            <input
                            checked={allowMultipleTapesFieldValue}
                            className="SettingsCheckbox"
                            type="checkbox"
                            name="MultTapes"
                            id="MultTapes"
                             onChange={e=>setAllowMultipleTapesFieldValue(e.target.checked)}
                            />
                        </div>
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="OnlyComplete">Allow only complete machines:</label>
                            <input
                            checked={onlyCompleteFieldValue}
                            className="SettingsCheckbox"
                            type="checkbox"
                            name="OnlyComplete"
                            id="OnlyComplete"
                            onChange={e=>setOnlyCompleteFieldValue(e.target.checked)}
                            />
                        </div>
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="NonAcceptReject">Reject on non-accepts:</label>
                            <input
                            checked={rejectOnNonAcceptFieldValue}
                            className="SettingsCheckbox"
                            type="checkbox"
                            name="NonAcceptReject"
                            id="NonAcceptReject"
                            onChange={e=>setRejectOnNonAcceptFieldValue(e.target.checked)}
                            />
                        </div>
                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="InputAlphabet">Use defined input alphabet:</label>
                             <input
                                checked={onlyInputAlphabetFieldValue}
                                className="SettingsCheckbox"
                                type="checkbox"
                                name="InputAlphabet"
                                id="InputAlphabet"
                                onChange={e=>setOnlyInputAlphabetFieldValue(e.target.checked)}
                            />
                            <button className='SettingsDetailsButton' onClick={()=>setInputAlphabetDetailsOpen(!inputAlphabetDetailsOpen)}>{inputAlphabetDetailsOpen? <ChevronUpIcon/> : <ChevronDownIcon/>}</button>

                        </div>
                        {inputAlphabetDetailsOpen? <ChipList name='Input alphabet' singleCharacterMode={true} 
                            defaultValues={inputAlphabetFieldValue} 
                            defaultValuesMessage="Do not include blank. Make sure that input alphabet is subset of tape alphabet" 
                            defaultInputMessage="Write alphabet elements here"
                            onDataChanged={setInputAlphabetFieldValue}></ChipList> : ""
                        }

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="TapeAlphabet">Tape alphabet:</label>
                             <input
                                checked={onlyTapeAlphabetFieldValue}
                                className="SettingsCheckbox"
                                type="checkbox"
                                name="TapeAlphabet"
                                id="TapeAlphabet"
                                onChange={e=>setOnlyTapeAlphabetFieldValue(e.target.checked)}
                            />
                             <button className='SettingsDetailsButton' onClick={()=>setTapeAlphabetDetailsOpen(!tapeAlphabetDetailsOpen)}>{tapeAlphabetDetailsOpen? <ChevronUpIcon/> : <ChevronDownIcon/>}</button>
                        </div>
                        {tapeAlphabetDetailsOpen? <ChipList name='Tape alphabet' singleCharacterMode={true} 
                            defaultValues={tapeAlphabetFieldValue} 
                            defaultValuesMessage="Blank is included by default. Make sure that tape alphabet is overset of input alphabet" 
                            defaultInputMessage="Write alphabet elements here"
                            onDataChanged={ onTapeAlphabetSetFieldValue}></ChipList> : ""
                        }

                        <div className="SettingsTextFieldRow">
                            <label className="SettingsTextFieldLabel" htmlFor="States">States:</label>
                            <input
                                checked={onlyStatesFromSetFieldValue}
                                className="SettingsCheckbox"
                                type="checkbox"
                                name="States"
                                id="States"
                                onChange={e=>setOnlyStatesFromSetFieldValue(e.target.checked)}
                            />
                            <button className='SettingsDetailsButton' onClick={()=>setStatesDetailsOpen(!statesDetailsOpen)}>{statesDetailsOpen? <ChevronUpIcon/> : <ChevronDownIcon/>}</button>
                        </div>
                        {statesDetailsOpen? <ChipList name='States set' singleCharacterMode={false} 
                            defaultValues={statesSetFieldValue} 
                            defaultValuesMessage="initial state, accept state and reject state are included by default" 
                            defaultInputMessage="Write your states here"
                            onDataChanged = {setStatesSetFieldValue} ></ChipList> : ""
                        }
                    </div>
                </div>    
                            
                <div className='SaveSettingsDiv'>
                    <button className={`SaveSettings`} onClick={validateAndSave}>Save</button>
                    {/*saveError!=null? <p className='SettingsSaveError'>Error: {saveError}</p> : "" */}
                </div>
        </div>  
    );
}

