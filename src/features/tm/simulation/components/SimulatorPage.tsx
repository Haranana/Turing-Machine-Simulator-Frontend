import type { TapeState, TapeSymbol } from "@simulation/types/simulationTypes.ts"
import { TapesController } from '@simulation/components/TapesController.tsx';

function prepData(){
    const tapeMockInput: TapeState = {
        head: 0 ,
        tape: new Map<number, TapeSymbol>(),
        };
    return tapeMockInput;
}


export default  function SimulatorPage() {
    return(
        <div className="TapesPageWrapper">
            <TapesController tapeState={prepData()}></TapesController>
        </div>
    );
}