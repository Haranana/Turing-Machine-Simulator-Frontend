// dto.ts
import { array, z } from "zod";
import type { SimulationExport } from "../features/Tape/tapeTypes";
import { useSimulationProgram } from "../features/GlobalData/simulationProgram.tsx"
import { useSimulationAliases } from "../features/GlobalData/simulationAliases.tsx";
import {useSimulationInput} from "../features/GlobalData/simulationInput.tsx"
import { useSpecialStates } from "../features/GlobalData/specialStates.tsx";
import { toast } from 'react-hot-toast';

function localCodeToGlobal(codeLines: string[] , sep1:string, left:string, right:string, stay:string, tapesAmount: number){
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sep1Re = new RegExp(`\\s*${esc(sep1)}\\s*`);
  const mapMove = (tok: string) => {
    const t = tok.trim();
    if (t === "LEFT" || t === "RIGHT" || t === "STAY") return t;
    if (t === left)  return "LEFT";
    if (t === right) return "RIGHT";
    if (t === stay)  return "STAY";
    return t; 
  };

  return codeLines.map((line) => {
    const m = line.match(/\/\/.*$/);
    const comment = m ? m[0] : "";
    const code = m ? line.slice(0, m.index) : line;

    const tokens = code.split(sep1Re);
    if (tokens.length === 0) return line;
    
    const N = Math.min(tapesAmount, tokens.length);
    for (let i = tokens.length - N; i < tokens.length; i++) {
      if (i >= 0) tokens[i] = mapMove(tokens[i]);
    }

    const rebuilt = tokens.join(` ${sep1} `);
    return rebuilt + comment;
  });
}

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
  readChar: z.string().min(1).max(1),
  writtenChar: z.string().min(1).max(1),
  stateBefore: StateNameSchema,         
  stateAfter: StateNameSchema,          
  tapeBefore: TapeStateSchema,          
});
export type SimulationStepDto = z.infer<typeof SimulationStepSchema>;

export const CreatedSimulationSchema = z.object({
  steps: z.array(z.array(SimulationStepSchema)),
});
export type ReceiveSimulationDto = z.infer<typeof CreatedSimulationSchema>;

export function buildSimulationExport(): SimulationExport{
  const { codeLines } = useSimulationProgram.getState();
  const { sep1, sep2, blank, left, right, stay } = useSimulationAliases.getState();
  const { simulationInput, simulationTapesAmount } = useSimulationInput.getState();
  const { initialState, acceptState, rejectState } = useSpecialStates.getState();

  const program = localCodeToGlobal(codeLines,sep1, left, right, stay, simulationTapesAmount);
  return { 
      initialState: initialState,
      acceptState: acceptState,
      rejectState: rejectState,
      program: program,
      sep1: sep1,
      sep2: sep2,
      blank: blank,
      input:simulationInput,
      tapesAmount:simulationTapesAmount
    };
}

export async function sendSimulation(obj: SimulationExport) {
  const result = SendSimulationDtoSchema.safeParse(obj);
  console.log("result: ", result);
  console.log("parsing obj: " , obj);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
    throw new Error("Validation failed:\n" + issues.join("\n"));
  }

  const dto : SendSimulationDto = result.data;

  const payload = JSON.stringify(dto);

  console.log("sent: ", payload);
  const res = await fetch("http://localhost:9090/api/simulations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

   if (!res.ok) {
    toast.error(`Simulation couldn't be loaded\n${res.status} ${res.statusText}\n${res.text}`);
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${res.text}`);
  }

  const response = await res.json();
  //console.log("response: ", response);
  return CreatedSimulationSchema.parse(response); 

}






