import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimulationProgram = {
    codeLines: string[];

    setField: (value : string[]) => void;
}

export const useSimulationProgram = (create<SimulationProgram>)()(
    persist(
        (set)=>({
                codeLines: ["q1,a,q2,b,S"],

                setField: (value)=>{
                    set({
                        codeLines: value,
                    })
                },
            }), 
            {
                name: "simulation-program"
            }
    )

);

