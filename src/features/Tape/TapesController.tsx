import "./tape.css";


import { PlayIcon, PauseIcon, StopIcon,
   ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import type { Simulation ,TapeSymbol, TapeViewInput, SimulationStep, TapeInput, AnimationType, SimulationExport } from "./tapeTypes.tsx";
import {TapeComponent} from "./TapeComponent"
import { buildSimulationExport, sendSimulation} from "../../dtos/dto.ts"
import type {ReceiveSimulationDto} from "../../dtos/dto.ts" 
import { useSimulationProgram } from "../GlobalData/simulationProgram.tsx"
import {useSimulationInput} from "../GlobalData/simulationInput.tsx"
import { useSpecialStates } from "../GlobalData/specialStates.tsx";
import { number } from "zod";


export const TapesController = ({ tapeState, radius = 10, cellPx = 80, animateMs = 800 }: TapeViewInput) => {

  //const { sep1, sep2, left, stay, right} = useSimulationAliases();
  const {hasErrors} = useSimulationProgram();

  const { initialState, acceptState, rejectState } = useSpecialStates();

  const {setSimulationInput} = useSimulationInput();

  // Input taśmy, w przyszłości pewnie będzie zastąpiony listą stringów, dla każdej z taśm
  // Pole przechowuje wartosc tekstowa z inputu, niekoniecznie jest to zatwierdzony input programu
  const tapeInputRef = useRef<string[]>([""]);

  const [tapesAmount, setTapesAmount] = useState<number>(1);

    // Taśma używana w symilacji
  const [tapeValues] = useState<Map<number, TapeSymbol>[]>(
    [tapeState.tape]
  );

  // Id komórki na którą wskazuje głowica taśmy
  const [head] = useState<number[]>([tapeState.head]);

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


  function setAllIsAnimating(value: boolean){
    setIsAnimating(prev=>prev.map(()=>value));
  }

  function toggleInputFieldVisibility(id: number){
    setInputFieldVisibility((prev)=>prev.map((v,i)=>i === id ? !v : v));
  }

  function updateTape(){
   
    for(let i=0; i<tapesAmount; i++){

      const currentStep = stepRef.current;
      const currentStepDir = stepDirRef.current;
      const writtenChar = simulation.steps[i][currentStep].writtenChar;

      //Jesli robimy krok wstecz to bierzemy akcje z poprzedniego kroku i ja odwracamy
      let currentAction = currentStepDir === -1? simulation.steps[i][currentStep-1].action : simulation.steps[i][currentStep].action;
      if(currentStepDir === -1){
        if(currentAction === "LEFT"){
          currentAction = "RIGHT";
        }else if(currentAction === "RIGHT"){
          currentAction = "LEFT";
        }
      }

      const currentTapeState = currentStepDir === -1?  simulation.steps[i][currentStep-1].tapeBefore : simulation.steps[i][currentStep].tapeBefore;

      const stepDirToAnimationType = (stepDir:number)=> {
        switch(stepDir){
          case 0:{ return "none";}
          case 1:{ return "normal";}
          case -1:{ return "reverse";}
          default:{return "none";}
        }
      }
      const newAnimationType: AnimationType = stepDirToAnimationType(currentStepDir);
      setIsAnimating(prev=>prev.map((val,id)=>id===i? true : val));
      setTapeData(prev=>prev.map((val,id)=>id===i? {
          tapeId: i,
          tapeState: currentTapeState,
          writtenChar: writtenChar, 
          action : currentAction,
          animationType: newAnimationType,
          radius: tapeRadiusRef.current,
          cellPx: cellSizeRef.current,
          animateMs: animationSpeedRef.current,
          callAfterAnimation: handleAnimEnd,
      } : val));
    }
  }

  async function loadSimulation(){

    const simulationExport : SimulationExport = buildSimulationExport();
    try{
      const simulationData = await sendSimulation(simulationExport);
      SchemaToSimulation(simulationData);
      setIsSimulationLoaded(true);
    }catch(err){
      console.log("Simulation Error, please try again");
      setIsSimulationLoaded(false);
    }
  }

  function SchemaToSimulation(schema: ReceiveSimulationDto){

    const firstTapeSteps = schema.steps[0];

    let simulationSteps : Array<SimulationStep> = [];
    firstTapeSteps.forEach(step => {

      const tapeState: Map<number, string | null> = step.tapeBefore.tape;
      const head : number = step.tapeBefore.head;

      simulationSteps.push({
        tapeIndex: 0,
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

    let newSimulation : Simulation = {
      steps: [simulationSteps],
      startingState: initialState,
      acceptingState: acceptState,
      rejectingState: rejectState,
    }

    setSimulation(newSimulation);
    stateRef.current = newSimulation.steps[0][0].stateBefore;
  }

  function addTape(){
    setTapesAmount(prev=>prev+1);
  }

  function isEndingStep(step: number){
    return step === simulation.steps.length - 1;
  }

  //receives value in (0,1) and converts it to ms with chosen formula
  function setAnimationSpeed(x : number){
    const newAnimationSpeed = 1600 - 1600 * x;
    animationSpeedRef.current = newAnimationSpeed;
  }

  useEffect(() => {
    if (!isPlaying || isAnimating) return;
     const currentStep = stepRef.current;

    if(currentStep >= simulation.steps.length) {
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
    }
      
  }, [isPlaying, isAnimating]); 


  const doNextSimulationStep = () => {
    const currentStep = stepRef.current;
    if(currentStep >= simulation.steps.length) return;
    if(isAnimating) return;
    setIsPlaying(false);

    stepDirRef.current = 1;

    updateTape();
    if(!isEndingStep(currentStep)){
      stepRef.current=currentStep+1;
      stateRef.current = simulation.steps[0][currentStep+1].stateBefore;
    }
  }

  const doPrevSimulationStep = () => {
    const currentStep = stepRef.current;
    if(currentStep === 0) return;
    if(isAnimating) return;
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
    setSimulationInput(tapeInputRef.current, tapeId);
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
        <p>State: {stateRef.current}</p>
        <p>Output: {outputRef.current}</p>
        <p>Step: {stepRef.current ?? ""}</p>
      </div>
      {[...Array(tapesAmount)].map((_, i) => (
          <div className="TapeWrapper">
            <div className="TapeViewport" style={viewportStyle}>
                <TapeComponent tapeInput={tapeData[i]} />
            </div>
            <div className="TapeActions">
              <button className="TapeActionsButton ShowTapeInputButton" onClick={()=>toggleInputFieldVisibility(i)}>
                <ChevronDownIcon/>
              </button>
              <button className={`TapeActionsButton tooltip extraTooltipPadding AddTapeButton ${isSimulationLoaded? "DisabledButton" : ""}`} disabled={isSimulationLoaded} onClick={()=>addTape()} 
                data-tooltip={isSimulationLoaded? "Cannot add tape when Simulation is loaded" : "Add tape"}>
                <PlusIcon></PlusIcon>
              </button>
            </div>

            <div className={`InputContainer  ${isInputFieldVisible ? "InputContainerVisible" : ""}`}>
              <input id="TapeInputField" name="TapeInputField" className="TapeInputField" onChange={(e)=>{()=>onTapeInputChange(e.target.value, i)}}></input>
              <button className={`EnterInputButton SimulationControlsButton  tooltip extraTooltipPadding ${isSimulationLoaded? "DisabledButton" : ""}`}  onClick={()=>enterInput(i)}
              disabled={isSimulationLoaded}
                data-tooltip={isSimulationLoaded? "Cannot enter input when simulation is loaded" : "Enter input"}>
                Enter</button>
            </div>
          </div>
      ))}

      <div className="SimulationControls">
        <div className="JumpToControls">
          <input className="JumpToInput" type="number" min={0} 
           max={Math.max(0, simulation.steps.length-1)} 
           placeholder="step" id="JumpToInput" name="JumpToInput"
            onChange={(e)=>{
              e.target.value = (Math.min(parseInt(e.target.value), Math.max(0, simulation.steps.length-1))).toString();
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

          <button className={`StepForwardButton tooltip SimulationControlsButton ${!isSimulationLoaded || (stepRef.current === simulation.steps.length-1)? "DisabledButton" : ""}`} 
          disabled={!isSimulationLoaded || (stepRef.current === simulation.steps.length-1)} onClick={doNextSimulationStep}
          data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (stepRef.current === simulation.steps.length-1)? "Cannot step forward" :  "Next step"}>
            <ChevronRightIcon/>
          </button>
        
          <button className={`ToEndButton tooltip SimulationControlsButton ${!isSimulationLoaded || (stepRef.current === simulation.steps.length-1)? "DisabledButton" : ""}`} disabled={!isSimulationLoaded || (stepRef.current === simulation.steps.length-1)} onClick={()=>jumpToSimulation(simulation.steps.length-1)}
            data-tooltip={!isSimulationLoaded? "Simulation not loaded" : (stepRef.current === simulation.steps.length-1)? "Already at the end" :  "Jump to the end"} >
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
