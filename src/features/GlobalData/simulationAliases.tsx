import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AliasesFields = {
  sep1: string;
  sep2: string;
  blank: string;
  left: string;
  stay: string;
  right: string
}

export type SimulationAliases = AliasesFields & {
  setSimulationAliases: (values:AliasesFields) => void;
  setSimulationAlias: (k: keyof AliasesFields, v: string) => void;
}

export const useSimulationAliases = create<SimulationAliases>()(
    persist(
    (set)=>({
    sep1: ",",
    sep2: "=>",
    blank: "_",
    left: "L",
    stay: "S",
    right: "R",

    setSimulationAliases: (vals) => {
        set({
        sep1: vals.sep1,
        sep2: vals.sep2,
        blank: vals.blank,
        left: vals.left,
        stay: vals.stay,
        right: vals.right,
        });
    },

    setSimulationAlias: (k, v) => {
        set( {[k] : v}); 
    },
    
    }),
    {
        name: "simulation-aliases",
    })
);