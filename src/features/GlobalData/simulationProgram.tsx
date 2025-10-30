import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimulationProgram = {
    codeLines: string[];
    hasErrors: boolean;

    setCodeLines: (value : string[]) => void;
    setHasErrors: (value: boolean)=>void;
}

export const useSimulationProgram = (create<SimulationProgram>)()(
    persist(
        (set)=>({
                codeLines: ["q1,a,q2,b,S"],
                hasErrors: false,

                setCodeLines: (value)=>{
                    set({
                        codeLines: value,
                    })
                },

                setHasErrors: (value)=>{
                    set({
                        hasErrors: value,
                    })
                }
            }), 
            {
                name: "simulation-program"
            }
    )

);

