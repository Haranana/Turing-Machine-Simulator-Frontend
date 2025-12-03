import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SimulationNodeRecord } from "../Tape/simulationTypes";

type AliasesFields = {
  symbolSeparator: string;   
  transitionArrow: string;
  blank: string;
  left: string;
  stay: string;
  right: string;
};

type SpecialStatesFields = {
  initialState: string;
  acceptState: string;
  rejectState: string | null;
};

type SpecialSettingsFields = {
  allowNondeterminism: boolean;
  allowMultipleTapes: boolean;
  onlyComplete: boolean;
  rejectOnNonAccept: boolean;

  statesSet: string[];
  onlyStatesFromSet: boolean;

  tapeAlphabet: string[];
  onlyTapeAlphabet: boolean;

  inputAlphabet: string[];
  onlyInputAlphabet: boolean;
};

type SettingsState = {
  aliases: AliasesFields;
  specialStates: SpecialStatesFields;
  specialSettings: SpecialSettingsFields;
};

type SettingsActions = {
  setAliases: (values: AliasesFields) => void;
  setAlias: (k: keyof AliasesFields, v: string) => void;

  setSpecialStates: (iState: string, aState: string, rState: string | null) => void;
  setInitialState: (value: string) => void;
  setAcceptState: (value: string) => void;
  setRejectState: (value: string | null) => void;

  setAllowNondeterminism: (value: boolean) => void;
  setAllowMultipleTapes: (value: boolean) => void;
  setOnlyComplete: (value: boolean) => void;

  setStatesSet: (value: string[]) => void;
  setOnlyStatesFromSet: (value: boolean) => void;

  setTapeAlphabet: (value: string[]) => void;
  setOnlyTapeAlphabet: (value: boolean) => void;

  setInputAlphabet: (value: string[]) => void;
  setOnlyInputAlphabet: (value: boolean) => void;
  setRejectOnNonAccept: (value: boolean) => void;
};

export type Settings = SettingsState & SettingsActions;

export type SimulationData = {
    simulationDataNodes: SimulationNodeRecord | null;
    simulationDataNodesPath: number[];

    setSimulationDataNodes: (value : SimulationNodeRecord | null) => void;
    setSimulationDataNodesPath: (value: number[]) => void;
}

export type TuringMachineData = {
    tmDataTapesInputs: string[],
    tmDataTapesAmount: number
    tmDataProgram: string[];
    tmDataProgramHasError: boolean;
    tmDataName: string | null; //null if no Turing Machine is currently loaded (working on a new one or if not logged in)

    setTmDataTapesInputs : (value: string[]) => void,
    setTmDataTapesAmount : (value: number) => void,
    setTmDataProgram: (value : string[]) => void;
    setTmDataProgramHasError: (value: boolean)=>void;
    setTmDataName: (value: string | null) => void;
}

export const useSimulationData = create<SimulationData>()(persist(
    (set)=>({
        simulationDataNodes: null,
        simulationDataNodesPath: [],
        setSimulationDataNodes(value){
            set({simulationDataNodes: value})
        },
        setSimulationDataNodesPath(value) {
            set({simulationDataNodesPath: value})
        },

    }), {name: "simulation-data"}
));


export const useTuringMachineData = create<TuringMachineData>()(persist(
    (set)=>({
        tmDataTapesInputs: [""],
        tmDataTapesAmount: 1,
        tmDataProgram: [],
        tmDataProgramHasError: false,
        tmDataName: null,
        setTmDataTapesInputs(value){
            set({tmDataTapesInputs: value})
        },
        setTmDataTapesAmount(value){
            set({tmDataTapesAmount: value})
        },
        setTmDataProgram(value){
            set({tmDataProgram: value})
        },
        setTmDataProgramHasError(value){
            set({tmDataProgramHasError: value})
        },
        setTmDataName(value){
            set({tmDataName: value})
        },
    }), {name: "tm-data"}
));



export const useTuringMachineSettings = create<Settings>()(
  persist(
    (set, _) => ({
      aliases: {
        symbolSeparator: "|",
        transitionArrow: "->",
        blank: "_",
        left: "L",
        stay: "S",
        right: "R",
      },

      specialStates: {
        initialState: "q0",
        acceptState: "qa",
        rejectState: "qr",
      },

      specialSettings: {
        allowNondeterminism: false,
        allowMultipleTapes: false,
        onlyComplete: false,
        rejectOnNonAccept: true,

        statesSet: [],
        onlyStatesFromSet: false,

        tapeAlphabet: [],
        onlyTapeAlphabet: false,

        inputAlphabet: [],
        onlyInputAlphabet: false,
      },

      setAliases(values) {
        set((state) => ({
          ...state,
          aliases: {
            ...state.aliases,
            ...values,
          },
        }));
      },

      setAlias(k, v) {
        set((state) => ({
          ...state,
          aliases: {
            ...state.aliases,
            [k]: v,
          },
        }));
      },

      setSpecialStates(iState, aState, rState) {
        set((state) => ({
          ...state,
          specialStates: {
            ...state.specialStates,
            initialState: iState,
            acceptState: aState,
            rejectState: rState,
          },
        }));
      },

      setInitialState(value) {
        set((state) => ({
          ...state,
          specialStates: {
            ...state.specialStates,
            initialState: value,
          },
        }));
      },

      setAcceptState(value) {
        set((state) => ({
          ...state,
          specialStates: {
            ...state.specialStates,
            acceptState: value,
          },
        }));
      },

      setRejectState(value) {
        set((state) => ({
          ...state,
          specialStates: {
            ...state.specialStates,
            rejectState: value,
          },
        }));
      },

      setAllowNondeterminism(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            allowNondeterminism: value,
          },
        }));
      },

      setAllowMultipleTapes(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            allowMultipleTapes: value,
          },
        }));
      },

      setOnlyComplete(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            onlyComplete: value,
          },
        }));
      },

      setStatesSet(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            statesSet: value,
          },
        }));
      },

      setOnlyStatesFromSet(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            onlyStatesFromSet: value,
          },
        }));
      },

      setTapeAlphabet(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            tapeAlphabet: value,
          },
        }));
      },

      setOnlyTapeAlphabet(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            onlyTapeAlphabet: value,
          },
        }));
      },

      setInputAlphabet(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            inputAlphabet: value,
          },
        }));
      },

      setOnlyInputAlphabet(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            onlyInputAlphabet: value,
          },
        }));
      },

      setRejectOnNonAccept(value) {
        set((state) => ({
          ...state,
          specialSettings: {
            ...state.specialSettings,
            rejectOnNonAccept: value,
          },
        }));
      },

    }),
    { name: "tm-settings" }
  )
);