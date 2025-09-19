import './page.css';
import {TapeView} from "../features/Tape/Tape.tsx"
import type { TapeState, TapeSymbol } from "../features/Tape/Tape.tsx"

function prepData(){
    const tapeMockInput: TapeState = {
        head: 0 ,
        tape: new Map<number, TapeSymbol>(),
        };
    
    for(let i=0; i<100; i++){
        (i+1)%10===0? tapeMockInput.tape.set(i, "1") : tapeMockInput.tape.set(i, "0");

    }

    return tapeMockInput;
}


export default  function SimulatorPage() {
    return(
        <div className="page">
            <TapeView tapeState={prepData()}></TapeView>
        </div>
    );
}