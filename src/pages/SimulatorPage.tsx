import './page.css';
import {TapeView} from "../features/Tape/Tape.tsx"
import type { TapeState, TapeSymbol } from "../features/Tape/Tape.tsx"

function prepData(){
    const tapeMockInput: TapeState = {
        head: 0 ,
        tape: new Map<number, TapeSymbol>(),
        };
    
    for(let i=0; i<100; i++){
        tapeMockInput.tape.set(i, i.toString());
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