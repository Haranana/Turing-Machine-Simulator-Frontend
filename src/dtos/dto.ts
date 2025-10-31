// dto.ts
import { array, z } from "zod";
import type { SimulationExport } from "../features/Tape/tapeTypes";
import { useSimulationProgram } from "../features/GlobalData/simulationProgram.tsx"
import { useSimulationAliases } from "../features/GlobalData/simulationAliases.tsx";
import {useSimulationInput} from "../features/GlobalData/simulationInput.tsx"
import { useSpecialStates } from "../features/GlobalData/specialStates.tsx";

function localCodeToGlobal(codeLines: string[] , left:string, right:string, stay:string){

   // codeLines[0].replace(new RegExp(left + '$'), 'LEFT').replace(new RegExp(right + '$'), 'RIGHT').replace(new RegExp(stay + '$'), 'STAY');

    return codeLines.map(line=>
        line.replace(new RegExp(left + '$'), 'LEFT').replace(new RegExp(right + '$'), 'RIGHT').replace(new RegExp(stay + '$'), 'STAY')
    );

    /*
    return codeLines.map(line => 
        line
        .replaceAll(left , "LEFT")
        .replaceAll(right , "RIGHT")
        .replaceAll(stay , "STAY")
    );*/
}

const SendSimulationDtoSchema = z.object({
  initialState: z.string(),
  acceptState : z.string(),
  rejectState : z.string(),
  program     : z.array(z.string()),
  separator   : z.string(),
  input       : z.string(),
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

export async function sendSimulation(obj: SimulationExport) {


  const result = SendSimulationDtoSchema.safeParse(obj);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
    throw new Error("Walidacja nieudana:\n" + issues.join("\n"));
  }

  const dto : SendSimulationDto = result.data;

  const payload = JSON.stringify(dto);

  const res = await fetch("http://localhost:9090/api/simulations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

   if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${res.text}`);
  }

  

   const response = await res.json();
   console.log(response);
  return CreatedSimulationSchema.parse(response); 

}


export function buildSimulationExport(){
  const { codeLines } = useSimulationProgram.getState();
  const { sep1, left, right, stay } = useSimulationAliases.getState();
  const { input } = useSimulationInput.getState();
  const { initialState, acceptState, rejectState } = useSpecialStates.getState();

  const program = localCodeToGlobal(codeLines, left, right, stay);
  return { initialState, acceptState, rejectState, program, separator: sep1, input };
}



