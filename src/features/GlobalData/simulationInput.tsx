import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimulationInput = {
  simulationInput: string[],
  tapesAmount: number

  setSimulationInput : (value: string[], tapesAm: number) => void,
}

export const useSimulationInput = create<SimulationInput>()(
    persist(
    (set)=>({
    simulationInput: [""],
    tapesAmount: 1,

    setSimulationInput: (value, tapesAm)=>{
        set({
            simulationInput: value,
            tapesAmount: tapesAm
        })
    },
    
    }),
    {
        name: "simulation-input",
    })
);