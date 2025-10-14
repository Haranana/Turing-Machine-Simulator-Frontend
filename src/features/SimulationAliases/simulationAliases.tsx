import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AliasesFields = {
  sep1: string;
  sep2: string;
  left: string;
  stay: string;
  right: string
}

export type SimulationAliases = AliasesFields & {
  setAll: (values:AliasesFields) => void;

  //keyof so k is string in union: "sep1" | "sep2" | "left" | "stay" | "right"
  setField: (k: keyof AliasesFields, v: string) => void;
}

export const useSimulationAliases = create<SimulationAliases>()(
    persist(
    (set)=>({
    sep1: ",",
    sep2: ",",
    left: "L",
    stay: "S",
    right: "R",

    setAll: (vals) => {
        set({
        sep1: vals.sep1,
        sep2: vals.sep2,
        left: vals.left,
        stay: vals.stay,
        right: vals.right,
        });
    },

    setField: (k, v) => {
        set( {[k] : v}); 
    },
    
    }),
    {
        name: "simulation-aliases",
    })
);