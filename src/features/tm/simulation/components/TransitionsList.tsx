import "@simulation/styles/Simulation.css";

import {useMemo} from "react";

import type { NdSimulation } from "../domain/Simulation";
import { useTuringMachineSettings } from '@state/GlobalData';
import type { SimulationNode } from "../types/simulationTypes";

export type TransitionListProps = {
    simulation: NdSimulation;
    currentStep: number;
}

export default function TransitionsList(props: TransitionListProps){

    const { symbolSeparator, transitionArrow} = useTuringMachineSettings(s=>s.aliases)

    const transitionInstructions = useMemo(()=>{

        let newTransitionInstructions: string[] = [];
        props.simulation.path.forEach((v,i)=>{
            if(i==0) return;

            const currentNode : SimulationNode = props.simulation.nodes.get(v)!;
            let newInstruction: string = "";
            newInstruction += (i-1) + ". ";

            newInstruction += currentNode.stateBefore + " " + symbolSeparator + " " ;
            currentNode.step.forEach((stepV, stepI) => {
                newInstruction += stepV.readChar + " ";
                if(stepI!=currentNode.step.length-1) newInstruction += symbolSeparator + " " ;
            })

            newInstruction += transitionArrow + " ";

            newInstruction += currentNode.stateAfter + " " + symbolSeparator + " " ;
            currentNode.step.forEach((stepV, _) => {
                newInstruction += stepV.writtenChar + " " + symbolSeparator + " " ;
            })
            currentNode.step.forEach((stepV, stepI) => {
                newInstruction += stepV.transitionAction + " ";
                if(stepI!=currentNode.step.length-1) newInstruction += symbolSeparator + " " ;
            })

            newTransitionInstructions.push(newInstruction);
        });

        return newTransitionInstructions;
    }, [props.simulation.path, props.simulation.nodes]);

    return <ul className="TransitionList">
        {transitionInstructions.map((v,i) =>( 
            <li key={i} className={`TransitionInstuction ${i==props.currentStep? "CurrentTransitionInstruction" : ""}`}>{v}</li> 
        ))}
    </ul>
}