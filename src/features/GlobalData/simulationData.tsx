import { type SimulationNodeMap, type SimulationNodeRecord } from "../Tape/simulationTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NdSimulation } from "../Tape/Simulation";

export type SimulationData = {
    simulationData: SimulationNodeRecord | null;
    simulationName: string | null;
    simulationPath: number[];

    setSimulationData: (value : SimulationNodeRecord | null) => void;
    setSimulationName: (value: string | null) => void;
    setSimulationPath: (value: number[]) => void;
}

export const useSimulationData = create<SimulationData>()(
    persist(
        (set)=>({
                simulationData: null,
                simulationName: null,
                simulationPath: [],
                setSimulationData: (value)=>{
                    set({simulationData: value})
                },
                setSimulationName: (value)=>{
                    set({simulationName: value})
                },
                setSimulationPath: (value)=>{
                    set({simulationPath: value})
                },
               }),
               {
                name: "simulation-data",
               }
            )
)
