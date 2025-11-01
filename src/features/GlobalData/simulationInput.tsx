import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimulationInput = {
  simulationInput: string,

  setSimulationInput : (value: string) => void,
}

export const useSimulationInput = create<SimulationInput>()(
    persist(
    (set)=>({
    simulationInput: "",

    setSimulationInput: (value)=>{
        set({
            simulationInput: value
        })
    },
    
    }),
    {
        name: "simulation-input",
    })
);