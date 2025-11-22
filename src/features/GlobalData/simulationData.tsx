import { type SimulationNodeMap } from "../Tape/simulationTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NdSimulation } from "../Tape/Simulation";

export type SimulationData = {
    simulation: NdSimulation | null;
    simulationName: string | null;

    setNdSimulation: (value : NdSimulation) => void;
    setSimulationName: (value: string) => void;
}

export const useSimulationData = (create<SimulationData>)()(
    persist(
        (set)=>({
                simulation: null,
                simulationName: null,
                setNdSimulation: (value)=>{
                    set({simulation: value})
                },
                setSimulationName: (value)=>{
                    set({simulationName: value})
                }
               }),
              {
                name: "simulation-data"
              }
            )
)
