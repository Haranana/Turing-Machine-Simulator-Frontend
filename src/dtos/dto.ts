// dto.ts
import { array, z } from "zod";
import type { SimulationExport } from "../features/Tape/tapeTypes";
import { useSimulationProgram } from "../features/GlobalData/simulationProgram.tsx"
import { useSimulationAliases } from "../features/GlobalData/simulationAliases.tsx";
import {useSimulationInput} from "../features/GlobalData/simulationInput.tsx"
import { useSpecialStates } from "../features/GlobalData/specialStates.tsx";

function localCodeToGlobal(codeLines: string[] , left:string, right:string, stay:string){
    return codeLines.map(line => 
        line
        .replaceAll(left , "LEFT")
        .replaceAll(right , "RIGHT")
        .replaceAll(stay , "STAY")
    );
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

export async function sendSimulation(obj: SimulationExport) {

   // 1) Walidacja bez wyjątków
  const result = SendSimulationDtoSchema.safeParse(obj);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
    throw new Error("Walidacja nieudana:\n" + issues.join("\n"));
  }

  const dto : SendSimulationDto = result.data;

  const payload = JSON.stringify(dto);

  const res = await fetch("/api/simulation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}\n${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text; 
  }
}


export function buildSimulationExport(){
  const { codeLines } = useSimulationProgram.getState();
  const { sep1, left, right, stay } = useSimulationAliases.getState();
  const { input } = useSimulationInput.getState();
  const { initialState, acceptState, rejectState } = useSpecialStates.getState();

  const program = localCodeToGlobal(codeLines, left, right, stay);
  return { initialState, acceptState, rejectState, program, separator: sep1, input };
}



