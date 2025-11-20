import { array, z } from "zod";

export type State = string;

export type TransitionAction = "LEFT" | "STAY" | "RIGHT";

export type SimulationExport = {
  initialState : string,
  acceptState : string,
  rejectState : string,
  program : string[],
  sep1 : string,
  sep2: string,
  blank: string,
  input : string[],
  tapesAmount: number,
}

/*
export type SimulationStep = {
    tapeIndex : number,
    action : TransitionAction, 
    readChar : string | null,
    writtenChar : string | null,
    stateBefore : State,
    stateAfter : State | null,
    tapeBefore : TapeState,
};*/

export type Simulation = {
    steps : SimulationStep[][];
    startingState : State,
    acceptingState: State,
    rejectingState: State,
}

export type TapeSymbol = string | null;          // usually a single char

export type Tape = Map<number, TapeSymbol>;

/*
export interface TapeState {
  head: number;
  tape: Tape; // only non empty ones!
}*/

export interface TapeViewInput {
  tapeState: TapeState;
  radius?: number;
  cellPx?: number;
  animateMs?: number;
}

export interface TapeInput {
  tapeId: number
  tapeState: TapeState;
  writtenChar : string | null;
  action : TransitionAction | null; //null in case of jumping to specific step 
  animationType: AnimationType;
  radius: number;
  cellPx: number;
  animateMs: number;
  callAfterAnimation: (id: number)=>void;
}

export type Phase = "idle" | "anim" | "snap";

export type AnimationType = "normal" | "reverse" | "none" | "jump" //"none" in case of actions such as changing animation speed when none step should be taken

export interface NdTmStep {
  tapeIndex: number;
  stepId: number;
  transitionAction: TransitionAction;
  readChar: string;
  writtenChar: string;
  state: State;
}

export interface NdTreeNode {
  id: number;
  edgeIds: number[];
}

export interface NdTreeEdge {
  id: number;
  tapesId: number;
  steps: NdTmStep[][];
  startNodeId: number;
  endNodeId: number;
}

/*
export interface NdTmReturnDto {
  nodeList: NdTreeNode[];
  edgeList: NdTreeEdge[];
}*/

const SendSimulationDtoSchema = z.object({
  initialState: z.string(),
  acceptState : z.string(),
  rejectState : z.string(),
  program     : z.array(z.string()),
  sep1   : z.string(),
  sep2:  z.string(),
  blank       : z.string(),
  input       : z.array(z.string()),
  tapesAmount : z.number(),
});

type SendSimulationDto = z.infer<typeof SendSimulationDtoSchema>;

const numericKey = z.string().regex(/^-?\d+$/);

const TapeStateSchema = z.object({
  head: z.number(),
  tape: z
    .record(numericKey, z.string())
    .transform(obj => new Map(Object.entries(obj).map(([k, v]) => [Number(k), v]))),
});
type TapeState = z.infer<typeof TapeStateSchema>;

const StateNameSchema = z.object({ name: z.string() }).transform(s => s.name);

const TransitionActionSchema = z.enum(["LEFT", "RIGHT", "STAY"]); 

const SimulationStepSchema = z.object({
  tapeIndex: z.number(),
  transitionAction: TransitionActionSchema,
  readChar: z.string().nullable(),
  writtenChar: z.string().nullable(),
  stateBefore: StateNameSchema,         
  stateAfter: StateNameSchema.nullable(),          
  tapeBefore: TapeStateSchema,          
});
export type SimulationStep = z.infer<typeof SimulationStepSchema>;

/*
export type SimulationStep = {
    tapeIndex : number,
    action : TransitionAction, 
    readChar : string | null,
    writtenChar : string | null,
    stateBefore : State,
    stateAfter : State | null,
    tapeBefore : TapeState,
};*/

export const CreatedSimulationSchema = z.object({
  steps: z.array(z.array(SimulationStepSchema)),
});
export type ReceiveSimulationDto = z.infer<typeof CreatedSimulationSchema>;

export const NdTmStepSchema = z.object({
  tapeIndex: z.number(),        
  stepId: z.number(),             
  transitionAction: TransitionActionSchema,
  readChar: z.string().min(1).max(1),
  writtenChar: z.string().min(1).max(1),
  stateBefore: StateNameSchema,         
  stateAfter: StateNameSchema,          
  tapeBefore: TapeStateSchema,    
});

export type NdTmStepDto = z.infer<typeof NdTmStepSchema>;

export const NdTreeNodeSchema = z.object({
  id: z.number(),
  edgeIds: z.array(z.number()),
});

export type NdTreeNodeDto = z.infer<typeof NdTreeNodeSchema>;

export const NdTreeEdgeSchema = z.object({
  id: z.number(),
  tapesId: z.number(),
  steps: z.array(z.array(NdTmStepSchema)), // NdTmStep[][]
  startNodeId: z.number(),
  endNodeId: z.number(),
});

export type NdTreeEdgeDto = z.infer<typeof NdTreeEdgeSchema>;

export const NdTmReturnDtoSchema = z.object({
  nodeList: z.array(NdTreeNodeSchema),
  edgeList: z.array(NdTreeEdgeSchema),
});

export type NdTmReturnDto = z.infer<typeof NdTmReturnDtoSchema>;

export const SimulationNodeSchema = z.object({
  id: z.number(),
  prevId: z.number().nullable(),
  nextIds: z.array(z.number()),
  step: z.array(SimulationStepSchema),
})
export type SimulationNode = z.infer<typeof SimulationNodeSchema>;

export const SimulationNodesMapSchema = z.map(z.number() , SimulationNodeSchema);
export type SimulationNodeMap = z.infer<typeof SimulationNodesMapSchema>;