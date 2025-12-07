import { z } from "zod";

// basic types

export type State = string;

export type TransitionAction = "LEFT" | "STAY" | "RIGHT";

export const TapeSymbolSchema = z.string().nullable();
export type TapeSymbol = z.infer<typeof TapeSymbolSchema>

export type Phase = "idle" | "anim" | "snap";

export type AnimationType = "normal" | "reverse" | "none" | "jump" //"none" in case of actions such as changing animation speed when none step should be taken

export type Tape = Map<number, TapeSymbol>;

const numericKey = z.string().regex(/^-?\d+$/);

// out dto
export type SimulationExport = {
  initialState : string,
  acceptState : string,
  rejectState : string | null,
  program : string[],
  sep1 : string,
  sep2: string,
  blank: string,
  input : string[],
  tapesAmount: number,
}

//schema types (persist and zod friendly)
//generally interfaces based on zod schemas are prefered unless they use non-serializable objects like maps
//in which case use either normal type or if it needs to be used with persist (which requires serialization)
//store record as zod object and translate it to map before usage

const StateNameSchema = z.object({ name: z.string() }).transform(s => s.name);

const TransitionActionSchema = z.enum(["LEFT", "RIGHT", "STAY"]); 

export const TapeStateRecordSchema = z.object({
  head: z.number(),
  tape: z.record(numericKey, z.string().nullable()),
});
export type TapeStateRecord = z.infer<typeof TapeStateRecordSchema>;

export const SimulationStepRecordSchema = z.object({
  tapeIndex: z.number(),
  transitionAction: TransitionActionSchema,        // skoro i tak masz TransitionActionSchema
  readChar: z.string().nullable(),
  writtenChar: z.string().nullable(),
  stateBefore: StateNameSchema,                   // zamiast z.string()
  stateAfter: StateNameSchema.nullable(),         // zamiast z.string().nullable()
  tapeBefore: TapeStateRecordSchema,
});

export type SimulationStepRecord = z.infer<typeof SimulationStepRecordSchema>;

export const CreatedSimulationSchema = z.object({
  steps: z.array(z.array(SimulationStepRecordSchema)),
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
  tapeBefore: TapeStateRecordSchema,    
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
  step: z.array(SimulationStepRecordSchema),
  output: z.string().nullable(),
})

export const SimulationNodesRecordSchema = z
  .record(z.string(), SimulationNodeSchema);
export type SimulationNodeRecord = z.infer<typeof SimulationNodesRecordSchema>;

export const SendSimulationDtoSchema = z.object({
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
export type SendSimulationDto = z.infer<typeof SendSimulationDtoSchema>;


// non-schema types (can be used in logic)

export type SimulationNodeMap = Map<number, SimulationNode>;

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

export type TapeState = {
  head: number;
  tape: Map<number, TapeSymbol>;
};

export type SimulationStep = {
  tapeIndex: number;
  transitionAction: TransitionAction;
  readChar: string | null;
  writtenChar: string | null;
  stateBefore: string;
  stateAfter: string | null;
  tapeBefore: TapeState; // <-- tu już Map
};

export type SimulationNode = {
  id: number;
  prevId: number | null;
  nextIds: number[];
  step: SimulationStep[]; 
  output: string | null
};