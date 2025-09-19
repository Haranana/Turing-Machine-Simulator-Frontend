
export type State = string;

export type TransitionAction = "LEFT" | "STAY" | "RIGHT";

export type SimulationStep = {
    tapeIndex : number,
    action : TransitionAction, 
    readChar : string,
    writtenChar : string,
    stateBefore : State,
    stateAfter : State,
    
};

export type Simulation = {
    steps : SimulationStep[];
    isEmpty : boolean,
}

export type TapeSymbol = string;          // usually a single char

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

export type Phase = "idle" | "anim" | "snap";