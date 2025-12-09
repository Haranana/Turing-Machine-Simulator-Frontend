import "./tape.css";

import { PlayIcon, PauseIcon, StopIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronDownIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useEffect, useCallback } from "react";
import {type TapeSymbol, type TapeViewInput, type SimulationStep, type TapeInput, type AnimationType, type SimulationExport, type TransitionAction } from "./simulationTypes.tsx";
import {TapeComponent} from "./TapeComponent"
import { buildSimulationExport, sendSimulation} from "../../dtos/dto.ts"
import { toast } from 'react-hot-toast';
import { NdSimulation } from "./Simulation.ts";
import type { SimulationNodeRecord } from "./simulationTypes.tsx";
import { useAuth } from "../../auth/AuthContext.tsx";
import { useSimulationData, useTuringMachineData, useTuringMachineSettings } from "../GlobalData/GlobalData.ts";

export const TapesController = ({ tapeState, radius = 10, cellPx = 80, animateMs = 800 }: TapeViewInput) => {

  const { isAuthenticated } = useAuth();
  const {tmDataProgram, tmDataName, tmDataProgramHasError, tmDataTapesInputs, setTmDataTapesInputs, tmDataTapesAmount, setTmDataTapesAmount} = useTuringMachineData();
  const {simulationDataNodes , setSimulationDataNodes, simulationDataNodesPath, setSimulationDataNodesPath} = useSimulationData();
  const {initialState, acceptState, rejectState} = useTuringMachineSettings(s=>s.specialStates);
  const {allowMultipleTapes, onlyInputAlphabet, inputAlphabet} = useTuringMachineSettings(s=>s.specialSettings);


  // Input taśmy, w przyszłości pewnie będzie zastąpiony listą stringów, dla każdej z taśm
  // Pole przechowuje wartosc tekstowa z inputu, niekoniecznie jest to zatwierdzony input programu
  const tapeInputRef = useRef<string[]>([""]);

  const [tapesAmount, setTapesAmount] = useState<number>(tmDataTapesAmount);

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

  const viewportOuterRef = useRef<HTMLDivElement | null>(null);

  // Taśma z załadowanym inputem ale bez wykonania żadnego ruchu
  let defaultTape : Map<number, TapeSymbol> = tapeState.tape;

  // Krok do którego użytkownik chce skoczyc
  let jumpToRef = useRef<number | null>(null);

  // Czy aplikacja otrzymala symulacje z API
  //const [isSimulationLoaded, setIsSimulationLoaded] = useState<boolean>(false);

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
  
  /*
  const [simulation , setSimulation] = useState<Simulation>({
    steps: [],
    startingState: initialState,
    acceptingState: acceptState,
    rejectingState: rejectState
  });*/

  const [simulation , setSimulation] = useState<NdSimulation | null>(null);

  const handleAnimEnd = useCallback((id: number) => {
    setIsAnimating(prev=>prev.map((v,i)=>i===id? false : v));
  }, []);

  //contains all the data that tape needs to properly process given step
  const [tapeData , setTapeData] = useState<TapeInput[]>(
    [{
      tapeId: 0,
      tapeState: tapeState,
      writtenChar: null,
      action: "STAY",
      animationType: "none",
      radius: tapeRadiusRef.current,
      cellPx: cellPx,
      animateMs: animateMs,
      callAfterAnimation: (id: number) => handleAnimEnd(id),
    }]
  );

  function isSimulationLoaded(){
    return simulation != null;
  }

  //return 0 if simulation is not loaded otherwise returns length of current path excluding root
  function stepsAmount(){
    if(simulation == null) return 0;
    return simulation.pathLength();
  }

  function isCurrentStepLeaf(){
    if(simulation == null) return false;
    return simulation.isLeaf(stepRef.current);
  }

  function setAllIsAnimating(value: boolean){
    setIsAnimating(prev=>prev.map(()=>value));
  }

  function validateInput(value: string, id: number){
  
    if(!onlyInputAlphabet) return true;

    return [...value].every((char, _)=> inputAlphabet.includes(char));    
  }

  function hasAllAnimationsEnded(){
    for(let i =0; i<tapesAmount; i++){
      if(isAnimating[i]) return false;  
    }
    return true;
  }

  function toggleInputFieldVisibility(id: number){
    setInputFieldVisibility((prev)=>prev.map((v,i)=>i === id ? !v : v));
  }

  function updateTape() {
    if(simulation == null) return;
      const currentStep = stepRef.current;
    const currentStepDir = stepDirRef.current;

    // skąd czytać krok: przy cofaniu bierz poprzedni
    const readIndex = currentStepDir === -1 ? currentStep - 1 : currentStep;
    const stepsData = simulation.getSteps(readIndex);
    if(stepsData == null || stepsData.length != tapesAmount) return;

    for (let i = 0; i < tapesAmount; i++) {

      // strażnik na brzegach – nic nie rób, jeśli poza zakresem
      if (readIndex < 0 || readIndex >= stepsAmount()) continue;

      //const stepData = simulation.steps[i][readIndex];
      const stepData = stepsData[i];
      

      // akcja do animacji (+ ewentualne odwrócenie dla reverse)
      let currentAction = stepData.transitionAction;
      if (currentStepDir === -1) {
        if (currentAction === "LEFT") currentAction = "RIGHT";
        else if (currentAction === "RIGHT") currentAction = "LEFT";
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
      const simulationNodeRecord : SimulationNodeRecord = await sendSimulation(simulationExport);
      SchemaToSimulation(simulationNodeRecord);
      toast.success(`Simulation loaded successfully`);
    }catch(err){
      toast.error(`Error: simulation couldn't be loaded`);

    }
  }

  function SchemaToSimulation(schema: SimulationNodeRecord){
        stepRef.current = 0;
    stepDirRef.current = 0;
    stateRef.current = initialState;
    outputRef.current = "";
    const newSimulation = new NdSimulation(schema);
    newSimulation.updatePath();
    setSimulationDataNodes(schema);
    setSimulationDataNodesPath(newSimulation.path);
    setSimulation(newSimulation);
  }

  const makeDefaultTapeInput = (id: number): TapeInput => ({
    tapeId: id,
    tapeState: { head: 0, tape: new Map(defaultTape) },
    writtenChar: null,
    action: "STAY" as TransitionAction,       
    animationType: "none" as AnimationType,   
    radius: tapeRadiusRef.current,
    cellPx,
    animateMs,
    callAfterAnimation: handleAnimEnd,
  });

  //save data to Zustand storage, in future should probably also store inputs and simulation
  useEffect(() => {
    setTapesAmount(tmDataTapesAmount);    
  }, [tmDataTapesAmount]);

    //loads tapes amount data from zustand storage,
  useEffect(()=>{
    let tapesNum: number = tmDataTapesAmount;
    if(!allowMultipleTapes && tmDataTapesAmount > 0 ){
      setTmDataTapesAmount(1);
      tapesNum = 1;
    }
    
    setTapesAmount(tapesNum);
    let tapesInput: string[] = tmDataTapesInputs;

    /* safeguard */
    if(tapesInput.length < tapesNum){
      tapesInput = [];
      for(let i = 0; i<tapesNum; i++){
        tapesInput.push("");
      }
    }

    tapeInputRef.current = tapesInput;

    for(let tapeId=0; tapeId < tapesNum; tapeId++){
      placeInputOnTape(tapesInput[tapeId], tapeId);
    }
  },[])

  //loads simulationData from zustand storage
  useEffect(()=>{
    if(!simulationDataNodes) return;

    const newSimulation = new NdSimulation(simulationDataNodes);

    if (simulationDataNodesPath.length > 0) {
    newSimulation.path = simulationDataNodesPath;
  } else {
    newSimulation.updatePath();
  }

    setSimulation(newSimulation);
  },[simulationDataNodes])

  
  //updates states upon new tape creation
const recalcRadius = useCallback(() => {
  const el = viewportOuterRef.current;
  if (!el) return;

  const availableWidth = el.getBoundingClientRect().width;
  if (availableWidth <= 0) return;

  const borderPx = 3; // TapeCell ma border: 3px
  const effectiveCellWidth = cellSizeRef.current + 2 * borderPx;

  const cellsVisible = Math.max(
    3,
    Math.floor(availableWidth / effectiveCellWidth)
  );
  const newRadius = Math.floor((cellsVisible - 1) / 2);

  if (newRadius === tapeRadiusRef.current) return;

  tapeRadiusRef.current = newRadius;

  setTapeData(prev =>
    prev.map(t => ({
      ...t,
      radius: newRadius,
    }))
  );
}, []);

useEffect(() => {
  recalcRadius();
}, [recalcRadius]);

useEffect(() => {
  window.addEventListener("resize", recalcRadius);
  return () => window.removeEventListener("resize", recalcRadius);
}, [recalcRadius]);

useEffect(() => {
  const el = viewportOuterRef.current;
  if (!el || typeof ResizeObserver === "undefined") {
    return;
  }

  const observer = new ResizeObserver(() => {
    recalcRadius();
  });

  observer.observe(el);

  return () => {
    observer.disconnect();
  };
}, [recalcRadius]);



  
  function addTape(){
    if (tapesAmount >= 5) return;

    const realTapesAmount = tapesAmount + 1;
    setTapesAmount(realTapesAmount);
    setTmDataTapesAmount(realTapesAmount);
    setTmDataTapesInputs([...tmDataTapesInputs, ""]);
  }

  function removeTape(){
     if (tapesAmount <= 1) return;

  const realTapesAmount = tapesAmount - 1;
  setTapesAmount(realTapesAmount);
  setTmDataTapesAmount(realTapesAmount);
  setTmDataTapesInputs(tmDataTapesInputs.slice(0, -1));
  }

  function isEndingStep(step: number){
    return step === stepsAmount() - 1;
  }

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

  //receives value in (0,1) and converts it to ms with chosen formula
  function setAnimationSpeed(x : number){
    const newAnimationSpeed = 1600 - 1600 * x;
    animationSpeedRef.current = newAnimationSpeed;
  }

  useEffect(() => {
    if (!isPlaying || !hasAllAnimationsEnded() || simulation == null) return;
    const currentStep = stepRef.current;
    
    if(currentStep >= stepsAmount()) {
      setIsPlaying(false);
      return;
    }
   
    stepDirRef.current = 1;
    updateTape();

    if(!isEndingStep(currentStep)){
    stepRef.current = currentStep + 1;
    const currentStepNode = simulation.getStep(currentStep + 1 , 0);
    stateRef.current = currentStepNode!.stateBefore;
  } else {

    setIsPlaying(false);
  }
      
  }, [isPlaying, isAnimating]); 

  const doNextSimulationStep = () => {
    const currentStep = stepRef.current;
    if(currentStep >= stepsAmount() || simulation == null) return;
    if(!hasAllAnimationsEnded()) return;
    setIsPlaying(false);

    stepDirRef.current = 1;

    updateTape();
    if(!isEndingStep(currentStep)){
    stepRef.current = currentStep + 1;
    const currentStepNode = simulation.getStep(currentStep + 1 , 0);
    stateRef.current = currentStepNode!.stateBefore;
  } else {

  setIsPlaying(false);
  }
  }

  const doPrevSimulationStep = () => {
    const currentStep = stepRef.current;
    if(currentStep === 0 || simulation == null) return;
    if(!hasAllAnimationsEnded()) return;
    setIsPlaying(false);

    stepDirRef.current = -1;

    updateTape();
    stepRef.current=currentStep-1;
    const currentStepNode = simulation.getStep(currentStep-1 , 0);
    stateRef.current = currentStepNode!.stateBefore 
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
        radius: tapeRadiusRef.current,
        cellPx,
        animateMs: animationSpeedRef.current,
        callAfterAnimation: handleAnimEnd,
        tapeId: tapeId,
    } : v
  ));
    
  }

  function enterInput(tapeId: number){
    if(validateInput(tapeInputRef.current[tapeId], tapeId)){

    setTmDataTapesInputs(tapeInputRef.current);
      placeInputOnTape(tapeInputRef.current[tapeId], tapeId);
    }
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

  //Discards simulation
  const resetSimulation = () => {
    setSimulation(null);
    setSimulationDataNodes(null);
    setSimulationDataNodesPath([]);
    setTmDataTapesInputs(tmDataTapesInputs.map((_,__)=>""));
    
    stepRef.current = 0;
    stepDirRef.current = 0;
    stateRef.current = initialState;
    outputRef.current = "";

    
    setTapeData(prev =>
      prev.map((_ , i) => ({
          tapeId: i,
          tapeState: { head: 0, tape: new Map(defaultTape) },
          writtenChar: null,
          action: null,
          animationType: "jump",
          radius: tapeRadiusRef.current,
          cellPx,
          animateMs: animationSpeedRef.current,
          callAfterAnimation: handleAnimEnd,
          
        }
      )));


  }

  const jumpToSimulation = (step: number) => {
    
    if(simulation == null || simulation.getSteps(step) == null) return;
    const stepsNode : SimulationStep[]= simulation.getSteps(step)!;

    setIsPlaying(false);
    setAllIsAnimating(false);

    stepRef.current = step;
    stateRef.current = stepsNode[0].stateBefore;
    
    setTapeData(prev=>prev.map((_,i)=>({
      tapeState: stepsNode[i].tapeBefore,
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
  width: `${(2 * tapeRadiusRef.current + 1) * cellPx}px`,
  height: `${cellPx + 2 * 8}px`,
};
  function getCurrentState(){
    if(simulation==null) return "";
    //const currentStep : number = stepRef.current;
    
    const out = isCurrentStepLeaf()? simulation.getLastStep(0)!.stateAfter : stateRef.current;
    return out;
    //return currentStep === stepsAmount()? simulation.getLastStep(0)!.stateAfter : stateRef.current;
  }

  function getCurrentOutput(_: number){
    if(simulation==null) return "";
    const out = simulation.getOutput(stepRef.current)
    return out == null? "" : out;
    /*
    if(simulation==null) return "";
    const isLastStep = isCurrentStepLeaf();
    if(isLastStep){
      if(simulation.getLastStep(0)!.stateAfter === acceptState){
        return "Accept";
      }else if(simulation.getLastStep(0)!.stateAfter  === rejectState){
        return "Reject";
      }else{
        return "Reject";
      }
    }else{
      return "";
    }*/
  }


  return (
    <div className="TapesPage">

      {isAuthenticated && tmDataName!=null?
        <div className="SimulationNameWrapper">
          <p className="SimulationName">{tmDataName}</p>
        </div>: ""
      }
     
      <div className="SimulationData">
        <p className="SimulationDataParagraph">State: {getCurrentState()}</p>
        <p className="SimulationDataParagraph">Output: {getCurrentOutput(stepRef.current)}</p>
        <p className="SimulationDataParagraph">Step: {stepRef.current ?? ""}</p>
      </div>

      {Array.from({ length: tapesAmount }).map((_, i) => (
    <div className="TapeWrapper" key={i}>
        <div className="TapeViewportOuter" ref={i === 0 ? viewportOuterRef : null}>
          <div className="TapeViewport" style={viewportStyle}>
            {tapeData[i] ? <TapeComponent tapeInput={tapeData[i]} /> : null}
          </div>
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
              className={`TapeActionsButton AddTapeButton ${isSimulationLoaded() ? "DisabledButton" : ""}`}
              disabled={isSimulationLoaded() || !allowMultipleTapes}
              onClick={addTape}
              data-tooltip={isSimulationLoaded() ? "Cannot add tape when Simulation is loaded" : "Add tape"}>
              <PlusIcon /></button> :""
          }

          {
          i===tapesAmount-1? 
            <button
              className={`TapeActionsButton  RemoveTapeButton ${isSimulationLoaded() ? "DisabledButton" : ""}`}
              disabled={isSimulationLoaded()}
              onClick={removeTape}
              data-tooltip={isSimulationLoaded() ? "Cannot remove tape when Simulation is loaded" : "Remove tape"}>
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
              className={`EnterInputButton tooltip extraTooltipPadding ${isSimulationLoaded() ? "DisabledButton" : ""}`}
              onClick={() => enterInput(i)}
              disabled={isSimulationLoaded()}
              data-tooltip={isSimulationLoaded() ? "Cannot enter input when simulation is loaded" : "Enter input"}
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

          <button className={`JumpToButton tooltip  ${!isSimulationLoaded()? "DisabledButton" : ""}`} onClick={()=>{if(jumpToRef.current!=null) jumpToSimulation(jumpToRef.current)}}
            disabled = {!isSimulationLoaded()} data-tooltip={!isSimulationLoaded()? "Simulation not loaded" : "Jump to given step"}>
              Jump
          </button>

        </div>

        <div className="FlowControls">

          <button className={`ToStartButton tooltip SimulationControlsButton ${!isSimulationLoaded() || (stepRef.current === 0)? "DisabledButton" : ""}`} disabled={!isSimulationLoaded() || (stepRef.current === 0)} 
          onClick={()=>jumpToSimulation(0)} data-tooltip={!isSimulationLoaded()? "Simulation not loaded" : (stepRef.current === 0)? "Already at the start" :  "Jump to start"} >
            <ChevronDoubleLeftIcon/>
          </button>

          <button className={`StepBackButton tooltip SimulationControlsButton ${!isSimulationLoaded() || (stepRef.current === 0)? "DisabledButton" : ""}`} disabled={!isSimulationLoaded() || (stepRef.current === 0)}   onClick={doPrevSimulationStep}
          data-tooltip={!isSimulationLoaded()? "Simulation not loaded" : (stepRef.current === 0)? "Cannot step backward" :  "Previous step"}>
            <ChevronLeftIcon/>
          </button>
        
          <button className={`PlayButton tooltip SimulationControlsButton ${!isSimulationLoaded() || isPlaying? "DisabledButton" : ""}`} disabled={!isSimulationLoaded() || isPlaying}  onClick={playSimulation}
          data-tooltip={!isSimulationLoaded()? "Simulation not loaded" : (isPlaying)? "Already playing" :  "Play simulation"}>
            <PlayIcon />
          </button>

          <button className={`PauseButton tooltip SimulationControlsButton ${!isSimulationLoaded() || !isPlaying? "DisabledButton" : ""}`} disabled={!isSimulationLoaded() || !isPlaying} onClick={pauseSimulation}
          data-tooltip={!isSimulationLoaded()? "Simulation not loaded" : (!isPlaying)? "Simulation not playing" :  "Pause simulation"}>
            <PauseIcon />
          </button>

          <button className={`StopButton tooltip SimulationControlsButton ${!isSimulationLoaded()? "DisabledButton" : ""}`} disabled={!isSimulationLoaded()} onClick={resetSimulation}
          data-tooltip={!isSimulationLoaded()? "Simulation not loaded" :  "Discard simulation"}>
            <StopIcon />
          </button>

          <button className={`StepForwardButton tooltip SimulationControlsButton ${!isSimulationLoaded() || (stepRef.current >= stepsAmount())? "DisabledButton" : ""}`} 
          disabled={!isSimulationLoaded() || (stepRef.current >=stepsAmount())} onClick={doNextSimulationStep}
          data-tooltip={!isSimulationLoaded()? "Simulation not loaded" : (stepRef.current >= stepsAmount())? "Cannot step forward" :  "Next step"}>
            <ChevronRightIcon/>
          </button>
        
          <button className={`ToEndButton tooltip SimulationControlsButton ${!isSimulationLoaded() || (stepRef.current >= stepsAmount())? "DisabledButton" : ""}`}
           disabled={!isSimulationLoaded() || (stepRef.current >= stepsAmount())} onClick={()=>jumpToSimulation(stepsAmount()-1)}
            data-tooltip={!isSimulationLoaded()? "Simulation not loaded" : (stepRef.current >= stepsAmount())? "Already at the end" :  "Jump to the end"} >
            <ChevronDoubleRightIcon/>
          </button>
        </div>

        <div className="SpeedControls">
          <p className="SimulationData">Animation speed: </p>
          <input type="range" min="0.01" max="0.99" step="0.01" onChange={(e)=>{setAnimationSpeed(parseFloat(e.target.value))}}></input>
        </div>
       
      </div>
      <div className="LoadSimulationContainer">
        <button className={`LoadSimulationButton ${isSimulationLoaded() || tmDataProgramHasError? "tooltip DisabledButton" : ""}`} 
        data-tooltip={isSimulationLoaded()? "Discrad this simulation before loading new one" : tmDataProgramHasError? "Resolve code errors before loading simulation" : "Unidentified error has occured"}
          disabled={isSimulationLoaded()} onClick={()=>loadSimulation()}>Load Simulation
        </button>
      </div>
    </div>
  );
};
