import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SpecialStates = {
    initialState: string;
    acceptState: string;
    rejectState: string;

    setFields: (iState : string , aState : string , rState: string) => void;
    setInitialState: (value : string) => void;
    setAcceptState: (value : string) => void;
    setRejectState: (value : string) => void;
}

export const useSpecialStates = (create<SpecialStates>)()(
    persist(
        (set)=>({

                initialState: "START",
                acceptState: "ACCEPT",
                rejectState: "REJECT",

                setFields: (iState , aState, rState)=>{
                    set({
                        initialState: iState,
                        acceptState: aState,
                        rejectState: rState,
                    })
                },

                setInitialState: (value : string)=>{
                    set({
                        initialState: value
                    })
                },

                setAcceptState: (value : string)=>{
                    set({
                        acceptState: value
                    })
                },

                setRejectState: (value : string)=>{
                    set({
                        rejectState: value
                    })
                },
            }), 
            {
                name: "special-states"
            }
    )

);

