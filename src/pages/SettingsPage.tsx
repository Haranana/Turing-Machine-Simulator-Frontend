import './page.css';
import './setting-page.css'
import {useSimulationAliases} from '../features/SimulationAliases/simulationAliases'
import type {AliasesFields} from '../features/SimulationAliases/simulationAliases'
import {CheckIcon} from "@heroicons/react/24/solid"
import { useRef } from 'react';





export default  function SettingsPage() {

    const { sep1, sep2, left, stay, right, setAll, setField} = useSimulationAliases()

    const sep1Ref = useRef<HTMLInputElement>(null);
    const sep2Ref = useRef<HTMLInputElement>(null);
    const leftRef = useRef<HTMLInputElement>(null);
    const stayRef = useRef<HTMLInputElement>(null);
    const rightRef = useRef<HTMLInputElement>(null);

    const saveSimulationAliases: () => void = () => {

        let sep1RefValue = sep1Ref.current?.value;
        sep1RefValue = sep1RefValue === undefined? sep1 : sep1RefValue as string;

        let sep2RefValue = sep2Ref.current?.value;
        sep2RefValue = sep2RefValue === undefined? sep2 : sep2RefValue as string;

        let leftRefValue = leftRef.current?.value;
        leftRefValue = leftRefValue === undefined? left : leftRefValue as string;

        let stayRefValue = stayRef.current?.value;
        stayRefValue = stayRefValue === undefined? stay : stayRefValue as string;

        let rightRefValue = rightRef.current?.value;
        rightRefValue = rightRefValue === undefined? right : rightRefValue as string;

        const newValues : AliasesFields = {
            sep1: sep1RefValue,
            sep2: sep2RefValue,
            left: leftRefValue,
            stay: stayRefValue,
            right: rightRefValue,
        }

        setAll(newValues);

        console.log(sep1);
    }


    return(
        <div className="page">
            <div className='simulation-aliases'>
                <input ref={sep1Ref} className="settings-text-field sep1-text-field" type="text" name="sep1-alias" id="sep1-alias" defaultValue={sep1}/>
                <input ref={sep2Ref} className="settings-text-field sep2-text-field" type="text" name="sep2-alias" id="sep2-alias" defaultValue={sep2}/>
                <input ref={leftRef} className="settings-text-field left-text-field" type="text" name="left-alias" id="left-alias" defaultValue={left}/>
                <input ref={stayRef} className="settings-text-field stay-text-field" type="text" name="stay-alias" id="stay-alias" defaultValue={stay}/>
                <input ref={rightRef} className="settings-text-field right-text-field" type="text" name="right-alias" id="right-alias" defaultValue={right}/>
                <button className='save-simulation-aliases' onClick={saveSimulationAliases} ><CheckIcon></CheckIcon></button>
            </div>
        </div>  
    );
}