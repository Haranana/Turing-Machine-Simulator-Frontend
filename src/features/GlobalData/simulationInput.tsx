import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimulationInput = {
  simulationInput: string[],
  simulationTapesAmount: number

  setSimulationInputData : (value: string[], tapesAm: number) => void,
  setSimulationInput : (value: string[]) => void,
  setSimulationTapesAmount : (value: number) => void,
}

 const useSimulationInput = create<SimulationInput>()(
    persist(
    (set)=>({
    simulationInput: [""],
    simulationTapesAmount: 1,

    setSimulationInputData: (value, tapesAm)=>{
        set({
            simulationInput: value,
            simulationTapesAmount: tapesAm
        })
    },

    setSimulationInput: (value)=>{
        set({
            simulationInput: value,
        })
    },

    setSimulationTapesAmount: (value)=>{
        set({
            simulationTapesAmount: value
        })
    },
    
    }),
    {
        name: "simulation-input",
    })
);