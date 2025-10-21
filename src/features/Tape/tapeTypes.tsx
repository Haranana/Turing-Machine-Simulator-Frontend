
export type State = string;

export type TransitionAction = "LEFT" | "STAY" | "RIGHT";

export type SimulationStep = {
    tapeIndex : number,
    action : TransitionAction, 
    readChar : string | null,
    writtenChar : string | null,
    stateBefore : State,
    stateAfter : State | null,
    tapeBefore : TapeState,
};

export type Simulation = {
    steps : SimulationStep[];
    startingState : State,
    acceptingState: State,
    rejectingState: State,
    isEmpty : boolean,
}

export type TapeSymbol = string | null;          // usually a single char

export type Tape = Map<number, TapeSymbol>;

export interface TapeState {
  head: number;
  tape: Tape; // only non empty ones!
}

export interface TapeViewInput {
  tapeState: TapeState;
  radius?: number;
  cellPx?: number;
  animateMs?: number;
}

export interface TapeInput {
  tapeState: TapeState;
  writtenChar : string | null;
  action : TransitionAction | null; //null in case of jumping to specific step 
  animationType: AnimationType;
  radius: number;
  cellPx: number;
  animateMs: number;
  callAfterAnimation: ()=>void;
}

export type Phase = "idle" | "anim" | "snap";

export type AnimationType = "normal" | "reverse" | "none" | "jump" //"none" in case of actions such as changing animation speed when none step should be taken

