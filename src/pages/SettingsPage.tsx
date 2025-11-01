import './page.css';
import './setting-page.css'
import {useSimulationAliases} from '../features/GlobalData/simulationAliases'
import type {AliasesFields} from '../features/GlobalData/simulationAliases'
import { useRef } from 'react';



export default  function SettingsPage() {

    const { sep1, sep2, blank, left, stay, right, setAll} = useSimulationAliases()

    const sep1Ref = useRef<HTMLInputElement>(null);
    const sep2Ref = useRef<HTMLInputElement>(null);
    const blankRef = useRef<HTMLInputElement>(null);
    const leftRef = useRef<HTMLInputElement>(null);
    const stayRef = useRef<HTMLInputElement>(null);
    const rightRef = useRef<HTMLInputElement>(null);

    const saveSimulationAliases: () => void = () => {

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

        const newValues : AliasesFields = {
            sep1: sep1RefValue,
            sep2: sep2RefValue,
            blank: blankRefValue,
            left: leftRefValue,
            stay: stayRefValue,
            right: rightRefValue,
        }

        setAll(newValues);

        console.log(sep1);
    }

    return(
        <div>
            <div className='settings-segment'>
                <div className='settings-segment-text'>
                    <p className='settings-segment-text-title'>Simulation Aliases</p>
                    <p className='settings-segment-text-description'>Choose what symbol or word should indicate separator, move left, move right and stay in your Turing machine program.</p>
                </div>
                <div className='simulation-aliases'>
                    <div className='settings-text-field-row'>
                        <label className="settings-text-field-label" htmlFor='sep1-alias' >Separator:</label>
                        <input ref={sep1Ref} className="settings-text-field sep1-text-field" type="text" name="sep1-alias" maxLength={10} id="sep1-alias" defaultValue={sep1}/>
                    </div>
                    
                    <div className='settings-text-field-row'>
                        <label className="settings-text-field-label" htmlFor='sep2-alias'>Separator 2:</label>
                        <input ref={sep2Ref} className="settings-text-field sep2-text-field" type="text" name="sep2-alias" maxLength={10}  id="sep2-alias" defaultValue={sep2}/>
                    </div>

                    <div className='settings-text-field-row'>
                        <label className="settings-text-field-label" htmlFor='blank-alias'>Blank:</label>
                        <input ref={blankRef} className="settings-text-field blank-text-field" type="text" name="blank-alias" maxLength={10}  id="blank-alias" defaultValue={blank}/>
                    </div>

                    <div className='settings-text-field-row'>
                        <label className="settings-text-field-label" htmlFor='left-alias'>Move head left:</label>
                        <input ref={leftRef} className="settings-text-field left-text-field" type="text" name="left-alias" maxLength={10}  id="left-alias" defaultValue={left}/>
                            
                    </div>
                    <div className='settings-text-field-row'>
                        <label className="settings-text-field-label" htmlFor='stay-alias'>Don't Move head:</label>
                        <input ref={stayRef} className="settings-text-field stay-text-field" type="text" name="stay-alias" maxLength={10}  id="stay-alias" defaultValue={stay}/>
                            
                    </div>
                    <div className='settings-text-field-row'>
                        <label className="settings-text-field-label" htmlFor='right-alias'>Move head right:</label>
                        <input ref={rightRef} className="settings-text-field right-text-field" type="text" name="right-alias" maxLength={10}  id="right-alias" defaultValue={right}/>
                            
                    </div>
                    <button className='save-simulation-aliases' onClick={saveSimulationAliases} >Save</button>
                </div>
            </div>

            <hr className='line-separator'></hr>
        </div>  
    );
}