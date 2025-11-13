import "./tape.css";


import { PlayIcon, PauseIcon, StopIcon,
   ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronDownIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import type { Simulation ,TapeSymbol, TapeViewInput, SimulationStep, TapeInput, AnimationType, SimulationExport, TransitionAction } from "./tapeTypes.tsx";
import {TapeComponent} from "./TapeComponent"
import { buildSimulationExport, sendSimulation} from "../../dtos/dto.ts"
import type {ReceiveSimulationDto} from "../../dtos/dto.ts" 
import { useSimulationProgram } from "../GlobalData/simulationProgram.tsx"
import {useSimulationInput} from "../GlobalData/simulationInput.tsx"
import { useSpecialStates } from "../GlobalData/specialStates.tsx";
import { number } from "zod";
import { toast } from 'react-hot-toast';


export const TapesController = ({ tapeState, radius = 10, cellPx = 80, animateMs = 800 }: TapeViewInput) => {

  //const { sep1, sep2, left, stay, right} = useSimulationAliases();
  const {hasErrors} = useSimulationProgram();

  const { initialState, acceptState, rejectState } = useSpecialStates();

  const {setSimulationInput , setSimulationTapesAmount, simulationTapesAmount} = useSimulationInput();

  // Input taśmy, w przyszłości pewnie będzie zastąpiony listą stringów, dla każdej z taśm
  // Pole przechowuje wartosc tekstowa z inputu, niekoniecznie jest to zatwierdzony input programu
  const tapeInputRef = useRef<string[]>([""]);

  const [tapesAmount, setTapesAmount] = useState<number>(simulationTapesAmount);

    // Taśma używana w symilacji
  const [tapeValues] = useState<Map<number, TapeSymbol>[]>(
    [tapeState.tape]
  );

  const [isInputFieldVisible , setInputFieldVisibility] = useState<boolean[]>([false]);

  // Predkosc animacji jednego ruchu
  const animationSpeedRef = useRef(animateMs);

  // Rozmiar komórki taśmy w px
  const cellSizeRef = useRef<number>(cellPx);

  //ilość komórek na prawo i lewo od heada w taśmie
  const tapeRadiusRef = useRef<number>(radius);

  // Taśma z załadowanym inputem ale bez wykonania żadnego ruchu
  let defaultTape : Map<number, TapeSymbol> = tapeState.tape;

  // Krok do którego użytkownik chce skoczyc
  let jumpToRef = useRef<number | null>(null);

  // Czy aplikacja otrzymala symulacje z API
  const [isSimulationLoaded, setIsSimulationLoaded] = useState<boolean>(false);

  // Czy aktualnie trwa animacja (dla przycisków).
  const [isAnimating, setIsAnimating] = useState<boolean[]>([false]);

  // Odtwarzanie
  const [isPlaying, setIsPlaying] = useState(false);

  // Czy maszyna inkrementuje czy dekrementuje ruchy
  const stepDirRef = useRef<-1 | 0| 1>(0);

  // refs do diagnostyki / UI
  const stateRef = useRef<string>("");

  // output programu zwracany przez API, 
  // "" oznacza, ze animacja trwa,
  //  Undecided oznacza, ze ilosc krokow przekroczyla limit API
  const outputRef = useRef<"Accepted" | "Rejected" | "Undecided" | "">("");

  // id obecnego ruchu
  const stepRef = useRef<number>(0);

  // simulation state (placeholder)
  const [simulation , setSimulation] = useState<Simulation>({
    steps: [],
    startingState: initialState,
    acceptingState: acceptState,
    rejectingState: rejectState
  });

  const handleAnimEnd = useCallback((id: number) => {
    setIsAnimating(prev=>prev.map((v,i)=>i===id? false : v));
  }, []);

  //contains all the data that tape needs to properly function
  const [tapeData , setTapeData] = useState<TapeInput[]>(
    [{
      tapeId: 0,
      tapeState: tapeState,
      writtenChar: null,
      action: "STAY",
      animationType: "none",
      radius: radius,
      cellPx: cellPx,
      animateMs: animateMs,
      callAfterAnimation: (id: number) => handleAnimEnd(id),
    }]
  );

  //return 0 if simulation is not loaded USE IT!!!
  function stepsAmount(){
    if(simulation.steps == undefined || simulation == undefined || simulation.steps[0] == undefined) return 0;
    else return simulation.steps[0].length;
  }


  function setAllIsAnimating(value: boolean){
    setIsAnimating(prev=>prev.map(()=>value));
  }

  function hasAllAnimationsEnded(){
    for(let i =0; i<tapesAmount; i++){
      if(isAnimating[i]) return false;  
    }
    return true;
  }

  function toggleInputFieldVisibility(id: number){
    console.log(`toggle, ${id}`)
    setInputFieldVisibility((prev)=>prev.map((v,i)=>i === id ? !v : v));
  }

  function updateTape() {
  for (let i = 0; i < tapesAmount; i++) {
    const currentStep = stepRef.current;
    const currentStepDir = stepDirRef.current;

    // skąd czytać krok: przy cofaniu bierz poprzedni
    const readIndex = currentStepDir === -1 ? currentStep - 1 : currentStep;

    // strażnik na brzegach – nic nie rób, jeśli poza zakresem
    if (readIndex < 0 || readIndex >= stepsAmount()) continue;

    const stepData = simulation.steps[i][readIndex];

    // akcja do animacji (+ ewentualne odwrócenie dla reverse)
    let currentAction = stepData.action;
    if (currentStepDir === -1) {
      if (currentAction === "LEFT") currentAction = "RIGHT";
      else if (currentAction === "RIGHT") currentAction = "LEFT";
      // STAY bez zmian
    }

    const writtenChar = stepData.writtenChar;
    const currentTapeState = stepData.tapeBefore;

    const stepDirToAnimationType = (dir: number): AnimationType => {
      switch (dir) {
        case 1: return "normal";
        case -1: return "reverse";
        default: return "none";
      }
    };
    const newAnimationType = stepDirToAnimationType(currentStepDir);

    setIsAnimating(prev => prev.map((val, id) => (id === i ? true : val)));
    setTapeData(prev =>
      prev.map((val, id) =>
        id === i
          ? {
              tapeId: i,
              tapeState: currentTapeState,
              writtenChar,
              action: currentAction,
              animationType: newAnimationType,
              radius: tapeRadiusRef.current,
              cellPx: cellSizeRef.current,
              animateMs: animationSpeedRef.current,
              callAfterAnimation: handleAnimEnd,
            }
          : val
      )
    );
  }
}

  async function loadSimulation(){

    const simulationExport : SimulationExport = buildSimulationExport();
    try{
      //console.log("sent to API: ", simulationExport);
      const simulationData = await sendSimulation(simulationExport);
      SchemaToSimulation(simulationData);
      setIsSimulationLoaded(true);
      toast.success(`Simulation loaded successfully`);
    }catch(err){
      toast.error(`Error: simulation couldn't be loaded\n${err}`);
      //console.log("Simulation Error, please try again");
      setIsSimulationLoaded(false);
    }
  }

  function SchemaToSimulation(schema: ReceiveSimulationDto){

    console.log("got schema: ", schema);
    const firstTapeSteps = schema.steps[0];

    let simulationSteps : Array<Array<SimulationStep>> = [];
    for(let i=0; i<schema.steps.length; i++){
      const currentTapeSteps = schema.steps[i];

      simulationSteps[i] = [];

      currentTapeSteps.forEach(step => {

        const tapeState: Map<number, string | null> = step.tapeBefore.tape;
        const head : number = step.tapeBefore.head;

        simulationSteps[i].push({
          tapeIndex: i,
          action: step.transitionAction,
          readChar: step.readChar,
          writtenChar: step.writtenChar,
          stateBefore: step.stateBefore,
          stateAfter: step.stateAfter,
          tapeBefore: {
            tape: tapeState,
            head: head,
          }  
        });
      });
    }

    let newSimulation : Simulation = {
      steps: simulationSteps,
      startingState: initialState,
      acceptingState: acceptState,
      rejectingState: rejectState,
    }

    setSimulation(newSimulation);
    stateRef.current = newSimulation.steps[0][0].stateBefore;
  }

  const makeDefaultTapeInput = (id: number): TapeInput => ({
    tapeId: id,
    tapeState: { head: 0, tape: new Map(defaultTape) },
    writtenChar: null,
    action: "STAY" as TransitionAction,        // albo TransitionAction.STAY jeśli to enum
    animationType: "none" as AnimationType,    // j.w.
    radius,
    cellPx,
    animateMs,
    callAfterAnimation: handleAnimEnd,
  });

  useEffect(() => {
    setTapesAmount(simulationTapesAmount);
  }, [simulationTapesAmount]);

  useEffect(() => {
    setTapeData(prev => {
      if (prev.length === tapesAmount) return prev;
      if (prev.length > tapesAmount) return prev.slice(0, tapesAmount);
      const startId = prev.length;
      const missing = Array.from(
        { length: tapesAmount - prev.length },
        (_, k) => makeDefaultTapeInput(startId + k)
      );
      return [...prev, ...missing];
    });

    setInputFieldVisibility(prev =>
      prev.length >= tapesAmount
        ? prev.slice(0, tapesAmount)
        : [...prev, ...Array(tapesAmount - prev.length).fill(false)]
    );

    setIsAnimating(prev =>
      prev.length >= tapesAmount
        ? prev.slice(0, tapesAmount)
        : [...prev, ...Array(tapesAmount - prev.length).fill(false)]
    );

    tapeInputRef.current =
      tapeInputRef.current.length >= tapesAmount
        ? tapeInputRef.current.slice(0, tapesAmount)
        : [
            ...tapeInputRef.current,
            ...Array(tapesAmount - tapeInputRef.current.length).fill(""),
          ];
  }, [tapesAmount]);

  function addTape(){
    if(tapesAmount >= 5) return;
    const newlyAddedId = tapesAmount;
    const realTapesAmount = tapesAmount+1;
    //console.log("local | zurand: " ,tapesAmount, " : ", simulationTapesAmount);
    setTapesAmount(realTapesAmount);
    setSimulationTapesAmount(realTapesAmount);
    
    //console.log("local | zurand: " ,tapesAmount, " : ", simulationTapesAmount);
    
    setInputFieldVisibility(prev=>[...prev,false]);
    setIsAnimating(prev=>[...prev,false]);
    setTapeData(prev=>[...prev,{
      tapeId: newlyAddedId,
      tapeState: { head: 0, tape: new Map(defaultTape) },
      writtenChar: null,
      action: "STAY",
      animationType: "none",
      radius: radius,
      cellPx: cellPx,
      animateMs: animateMs,
      callAfterAnimation: (id: number) => handleAnimEnd(id),}]);
  }

  function removeTape(){
    if(tapesAmount<=1) return;
    const realTapesAmount = tapesAmount-1;
    setTapesAmount(realTapesAmount);
    setSimulationTapesAmount(realTapesAmount);
    
    setInputFieldVisibility(prev=>prev.slice(0,-1));
    setIsAnimating(prev=>prev.slice(0,-1));
    setTapeData(prev=>prev.slice(0,-1));
  }

  function isEndingStep(step: number){
    return step === stepsAmount() - 1;
  }

  //receives value in (0,1) and converts it to ms with chosen formula
  function setAnimationSpeed(x : number){
    const newAnimationSpeed = 1600 - 1600 * x;
    animationSpeedRef.current = newAnimationSpeed;
  }

  useEffect(()=>{
    console.log("tapes:", simulationTapesAmount);
    setTapesAmount(simulationTapesAmount);
  },[])

  useEffect(() => {
    if (!isPlaying || !hasAllAnimationsEnded()) return;
     const currentStep = stepRef.current;

    if(currentStep >= stepsAmount()) {
      setIsPlaying(false);
      return;
    }
   
    stepDirRef.current = 1;
    updateTape();

    if(!isEndingStep(currentStep)){
      stepRef.current=currentStep+1;
      stateRef.current = simulation.steps[0][currentStep+1].stateBefore;
    }else{
      setIsPlaying(false);
      stepRef.current = currentStep + 1;
    }
      
  }, [isPlaying, isAnimating]); 


  const doNextSimulationStep = () => {
    const currentStep = stepRef.current;
    if(currentStep >= stepsAmount()) return;
    if(!hasAllAnimationsEnded()) return;
    setIsPlaying(false);

    stepDirRef.current = 1;

    updateTape();
    if(!isEndingStep(currentStep)){
      stepRef.current=currentStep+1;
      stateRef.current = simulation.steps[0][currentStep+1].stateBefore;
    }else {
    stepRef.current = currentStep + 1;
    }
  }

  const doPrevSimulationStep = () => {
    const currentStep = stepRef.current;
    if(currentStep === 0) return;
    if(!hasAllAnimationsEnded()) return;
    setIsPlaying(false);

    stepDirRef.current = -1;

    updateTape();
    stepRef.current=currentStep-1;
    stateRef.current = simulation.steps[0][currentStep-1].stateBefore;

  }

  function placeInputOnTape(newInput: string, tapeId: number)
  {
    let inputCopy : string = newInput.trim();
    let newTapeValues: Map<number , string> = new Map<number, string>();
    for(let i: number = 0; i<inputCopy.length; i++){
      newTapeValues.set(i , inputCopy.charAt(i));
    }

    setTapeData(prev=>prev.map((v,i)=>i===tapeId?
    {
        tapeState: {
          tape : newTapeValues,
          head : 0
        },
        writtenChar: null, 
        action : null,
        animationType: "jump",
        radius,
        cellPx,
        animateMs: animationSpeedRef.current,
        callAfterAnimation: handleAnimEnd,
        tapeId: tapeId,
    } : v
  ));
    
  }

  function enterInput(tapeId: number){
    setSimulationInput(tapeInputRef.current);
    placeInputOnTape(tapeInputRef.current[tapeId], tapeId);
  }

  const playSimulation = () => {
    setIsPlaying(true);
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
  };

  function onTapeInputChange(newInput: string, tapeId: number){
    tapeInputRef.current[tapeId] = newInput;
  }

  const resetSimulation = () => {

    setIsSimulationLoaded(false);
    setSimulation({steps: [],
    startingState: initialState,
    acceptingState: acceptState,
    rejectingState: rejectState});
    setIsPlaying(false);
    setAllIsAnimating(false);
    stepRef.current = 0;
    stepDirRef.current = 0;
    stateRef.current = simulation.startingState;


    setTapeData(prev =>
      prev.map((v, i) => ({
          tapeState: { head: 0, tape: new Map(defaultTape) },
          writtenChar: null,
          action: null,
          animationType: "jump",
          radius,
          cellPx,
          animateMs: animationSpeedRef.current,
          callAfterAnimation: handleAnimEnd,
          tapeId: i,
        }
      )));

  }

  const jumpToSimulation = (step: number) => {
    setIsPlaying(false);
    setAllIsAnimating(false);
    stepRef.current = step;
    stateRef.current = simulation.steps[0][step].stateBefore;
    
    setTapeData(prev=>prev.map((v,i)=>({
      tapeState: simulation.steps[i][step].tapeBefore,
      writtenChar: null,
      action: null,
      animationType: "jump",
      radius: tapeRadiusRef.current,
      cellPx: cellSizeRef.current,
      animateMs: animationSpeedRef.current,
      callAfterAnimation: handleAnimEnd,
      tapeId: i,
    })));
  };

  const viewportStyle: React.CSSProperties = {
    width: `${(2 * radius + 1) * cellPx}px`,
    height: `${cellPx + 2 * 8}px`,
  };

  return (
    <div className="simulation-interface">
      {/* shows current state, steps, and output */}
      <div className="SimulationData">
        <p>State: {stepRef.current===simulation.steps[0].length? simulation.steps[0][simulation.steps[0].length-1].stateAfter : stateRef.current}</p>
        <p>Output: {outputRef.current}</p>
        <p>Step: {stepRef.current ?? ""}</p>
      </div>

      {Array.from({ length: tapesAmount }).map((_, i) => (
        <div className="TapeWrapper" key={i}>
          <div className="TapeViewport" style={viewportStyle}>
            {tapeData[i] ? <TapeComponent tapeInput={tapeData[i]} /> : null}
          </div>

          <div className="TapeActions">
        
            <button
              className="TapeActionsButton ShowTapeInputButton"
              onClick={() => toggleInputFieldVisibility(i)}>
              <ChevronDownIcon />
            </button>

          {
          i===tapesAmount-1? 
          <button
              className={`TapeActionsButton AddTapeButton ${isSimulationLoaded ? "DisabledButton" : ""}`}
              disabled={isSimulationLoaded}
              onClick={addTape}
              data-tooltip={isSimulationLoaded ? "Cannot add tape when Simulation is loaded" : "Add tape"}>
              <PlusIcon /></button> :""
          }

          {
          i===tapesAmount-1? 
            <button
              className={`TapeActionsButton  RemoveTapeButton ${isSimulationLoaded ? "DisabledButton" : ""}`}
              disabled={isSimulationLoaded}
              onClick={removeTape}
              data-tooltip={isSimulationLoaded ? "Cannot remove tape when Simulation is loaded" : "Remove tape"}>
              <MinusIcon />
            </button>:""
          }
          

          </div>

          <div className={`InputContainer ${isInputFieldVisible[i] ? "InputContainerVisible" : ""}`}>
            <input
              id={`TapeInputField-${i}`}
              name={`TapeInputField-${i}`}
              className="TapeInputField"
              onChange={(e) => onTapeInputChange(e.target.value, i)}
            />
            <button
              className={`EnterInputButton SimulationControlsButton tooltip extraTooltipPadding ${isSimulationLoaded ? "DisabledButton" : ""}`}
              onClick={() => enterInput(i)}
              disabled={isSimulationLoaded}
              data-tooltip={isSimulationLoaded ? "Cannot enter input when simulation is loaded" : "Enter input"}
            >
              Enter
            </button>
          </div>
        </div>
      ))}

      <div className="SimulationControls">
        <div className="JumpToControls">
          <input className="JumpToInput" type="number" min={0} 
           max={Math.max(0, stepsAmount()-1)} 
           placeholder="step" id="JumpToInput" name="JumpToInput"
            onChange={(e)=>{
              e.target.value = (Math.min(parseInt(e.target.value), Math.max(0, stepsAmount()-1))).toString();
              jumpToRef.current=parseInt(e.target.value)}}
              >
          </input>

          <button className={`SimulationControlsButton tooltip TapeActionsButton  ${!isSimulationLoaded? "DisabledButton" : ""}`} onClick={()=>{if(jumpToRef.current!=null) jumpToSimulation(jumpToRef.current)}}
            disabled = {!isSimulationLoaded} data-tooltip={!isSimulationLoaded? "Simulation not loaded" : "Jump to given step"}>
            Jump
          </button>

        </div>

        <div className="FlowControls">

          <button className={`ToStartButton tooltip SimulationControlsButton ${!isSimulationLoaded || (stepRef.current === 0)? "DisabledButton" : ""}`} disabled={!isSimulationLoaded || (stepRef.current === 0)} 
          onClick={()=>jumpToSimulation(0)} data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (stepRef.current === 0)? "Already at the start" :  "Jump to start"} >
            <ChevronDoubleLeftIcon/>
          </button>

          <button className={`StepBackButton tooltip SimulationControlsButton ${!isSimulationLoaded || (stepRef.current === 0)? "DisabledButton" : ""}`} disabled={!isSimulationLoaded || (stepRef.current === 0)}   onClick={doPrevSimulationStep}
          data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (stepRef.current === 0)? "Cannot step backward" :  "Previous step"}>
            <ChevronLeftIcon/>
          </button>
        
          <button className={`PlayButton tooltip SimulationControlsButton ${!isSimulationLoaded || isPlaying? "DisabledButton" : ""}`} disabled={!isSimulationLoaded || isPlaying}  onClick={playSimulation}
          data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (isPlaying)? "Already playing" :  "Play simulation"}>
            <PlayIcon />
          </button>

          <button className={`PauseButton tooltip SimulationControlsButton ${!isSimulationLoaded || !isPlaying? "DisabledButton" : ""}`} disabled={!isSimulationLoaded || !isPlaying} onClick={pauseSimulation}
          data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (!isPlaying)? "Simulation not playing" :  "Pause simulation"}>
            <PauseIcon />
          </button>

          <button className={`StopButton tooltip SimulationControlsButton ${!isSimulationLoaded? "DisabledButton" : ""}`} disabled={!isSimulationLoaded} onClick={resetSimulation}
          data-tooltip={!isSimulationLoaded? "Simulation not loaded" :  "Discard simulation"}>
            <StopIcon />
          </button>

          <button className={`StepForwardButton tooltip SimulationControlsButton ${!isSimulationLoaded || (stepRef.current >= stepsAmount())? "DisabledButton" : ""}`} 
          disabled={!isSimulationLoaded || (stepRef.current >=stepsAmount())} onClick={doNextSimulationStep}
          data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (stepRef.current >= stepsAmount())? "Cannot step forward" :  "Next step"}>
            <ChevronRightIcon/>
          </button>
        
          <button className={`ToEndButton tooltip SimulationControlsButton ${!isSimulationLoaded || (stepRef.current === stepsAmount()-1)? "DisabledButton" : ""}`}
           disabled={!isSimulationLoaded || (stepRef.current === stepsAmount()-1)} onClick={()=>jumpToSimulation(stepsAmount()-1)}
            data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (stepRef.current === stepsAmount()-1)? "Already at the end" :  "Jump to the end"} >
            <ChevronDoubleRightIcon/>
          </button>
        </div>

        <div className="SpeedControls">
          <p className="SimulationData">Animation speed: </p>
          <input type="range" min="0.01" max="0.99" step="0.01" onChange={(e)=>{setAnimationSpeed(parseFloat(e.target.value))}}></input>
        </div>
       
      </div>
      <div className="LoadSimulationContainer">
        <button className={`LoadSimulationButton ${isSimulationLoaded || hasErrors? "tooltip DisabledButton" : ""}`} 
        data-tooltip={isSimulationLoaded? "Discrad this simulation before loading new one" : hasErrors? "Resolve code errors before loading simulation" : "Unidentified error has occured"}
          disabled={isSimulationLoaded} onClick={()=>loadSimulation()}>Load Simulation
        </button>
      </div>
    </div>
  );
};
