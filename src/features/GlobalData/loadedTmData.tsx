import { create } from "zustand";
import { persist } from "zustand/middleware";

type loadedTmData = {
    isTmLoaded: boolean,
    loadedTmName: string | null,
    loadedTmId: number | null,
    setLoadedTmData: (name: string, id: number) => void,
    resetTmData: ()=>void,
}

const useLoadedTmData = create<loadedTmData>()(
    persist((set)=>({
        isTmLoaded: false,
        loadedTmName: null,
        loadedTmId: null,

        setLoadedTmData: (name: string, id: number)=>{
            set({isTmLoaded: true, loadedTmName: name, loadedTmId: id })
        },

        resetTmData:()=>{
            set({isTmLoaded: false, loadedTmName: null, loadedTmId: null})
        },
    }),
    {
        name: "loaded-tm-data",
    }
    )
)