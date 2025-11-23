import { type SimulationNodeMap } from "../Tape/simulationTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NdSimulation } from "../Tape/Simulation";

export type SimulationData = {
    simulationData: SimulationNodeMap | null;
    simulationName: string | null;

    setSimulationData: (value : SimulationNodeMap | null) => void;
    setSimulationName: (value: string | null) => void;
}

export const useSimulationData = (create<SimulationData>)()(
    persist(
        (set)=>({
                simulationData: null,
                simulationName: null,
                setSimulationData: (value)=>{
                    set({simulationData: value})
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
