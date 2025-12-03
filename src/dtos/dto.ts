
import { CreatedSimulationSchema, NdTmReturnDtoSchema, SendSimulationDtoSchema, SimulationNodesRecordSchema, type SendSimulationDto, type SimulationExport, type SimulationNodeMap, type SimulationNodeRecord } from "../features/Tape/simulationTypes.tsx";

import { useTuringMachineSettings } from "../features/GlobalData/GlobalData.ts";
import { useTuringMachineData } from "../features/GlobalData/GlobalData.ts";

function localCodeToGlobal(
  codeLines: string[],
  sep1: string,
  left: string,
  right: string,
  stay: string,
  tapesAmount: number
) {
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sep1Re = new RegExp(`\\s*${esc(sep1)}\\s*`);
  const mapMove = (tok: string) => {
    const t = tok.trim();
    if (t === "LEFT" || t === "RIGHT" || t === "STAY") return t;
    if (t === left) return "LEFT";
    if (t === right) return "RIGHT";
    if (t === stay) return "STAY";
    return t;
  };

  return codeLines.reduce<string[]>((acc, line) => {
    const m = line.match(/\/\/.*$/);
    const code = m ? line.slice(0, m.index) : line;

    if (code.trim().length === 0) {
      return acc;
    }

    const tokens = code.split(sep1Re);
    if (tokens.length === 0) {
      return acc;
    }

    const N = Math.min(tapesAmount, tokens.length);
    for (let i = tokens.length - N; i < tokens.length; i++) {
      if (i >= 0) tokens[i] = mapMove(tokens[i]);
    }

    const rebuilt = tokens.join(` ${sep1} `);
    acc.push(rebuilt);
    return acc;
  }, []);
}

export function buildSimulationExport(): SimulationExport{
  //const { codeLines } = useSimulationProgram.getState();
  //const { sep1, sep2, blank, left, right, stay } = useSimulationAliases.getState();
  //const { simulationInput, simulationTapesAmount } = useSimulationInput.getState();
  //const { initialState, acceptState, rejectState } = useSpecialStates.getState();

  const { tmDataProgram , tmDataTapesInputs, tmDataTapesAmount } = useTuringMachineData.getState();
  const {symbolSeparator, transitionArrow, blank, left, right, stay} = useTuringMachineSettings.getState().aliases;
  const {initialState, acceptState, rejectState } = useTuringMachineSettings.getState().specialStates;

  const program = localCodeToGlobal(tmDataProgram ,symbolSeparator, left, right, stay, tmDataTapesAmount);
  return { 
      initialState: initialState,
      acceptState: acceptState,
      rejectState: rejectState,
      program: program,
      sep1: symbolSeparator,
      sep2: transitionArrow,
      blank: blank,
      input:tmDataTapesInputs,
      tapesAmount:tmDataTapesAmount
    };
}

export async function sendSimulation(objToSend: SimulationExport) : Promise<SimulationNodeRecord> {

  const objToSendSchema = SendSimulationDtoSchema.safeParse(objToSend);
  if (!objToSendSchema.success) {
    const issues = objToSendSchema.error.issues.map(i => `${i.path.join(".")}: ${i.message}`);
    throw new Error("Validation failed:\n" + issues.join("\n"));
  }
  const simulationSendDto : SendSimulationDto = objToSendSchema.data;

  const payload = JSON.stringify(simulationSendDto);
  const apiResponse = await fetch("http://localhost:9090/api/simulations/nd", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

   if (!apiResponse.ok) {
    throw new Error(`HTTP ${apiResponse.status} ${apiResponse.statusText}`);
  }

  const responseJson = await apiResponse.json();
  console.log("got: ", responseJson);
  return SimulationNodesRecordSchema.parse(responseJson.nodes); 
}