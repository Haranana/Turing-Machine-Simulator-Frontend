import './page.css';
import type { TapeState, TapeSymbol } from "../features/Tape/tapeTypes.tsx"
import { TapesController } from '../features/Tape/TapesController.tsx';

function prepData(){
    const tapeMockInput: TapeState = {
        head: 0 ,
        tape: new Map<number, TapeSymbol>(),
        };
    


    return tapeMockInput;
}


export default  function SimulatorPage() {
    return(
        <div className="page">
            <TapesController tapeState={prepData()}></TapesController>
        </div>
    );
}