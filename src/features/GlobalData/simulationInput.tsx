import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimulationInput = {
  input: string,

  setSimulationInput : (value: string) => void,
}



export const useSimulationInput = create<SimulationInput>()(
    persist(
    (set)=>({
    input: "",

    setSimulationInput: (value)=>{
        set({
            input: value
        })
    },
    
    }),
    {
        name: "simulation-input",
    })
);