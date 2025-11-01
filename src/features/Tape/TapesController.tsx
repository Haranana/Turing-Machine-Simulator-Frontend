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


export const TapesController = ({ tapeState, radius = 10, cellPx = 80, animateMs = 800 }: TapeViewInput) => {

  //const { sep1, sep2, left, stay, right} = useSimulationAliases();
  const {hasErrors} = useSimulationProgram();

  const { initialState, acceptState, rejectState } = useSpecialStates();

  const {setSimulationInput} = useSimulationInput();

  // Input taśmy, w przyszłości pewnie będzie zastąpiony listą stringów, dla każdej z taśm
  // Pole przechowuje wartosc tekstowa z inputu, niekoniecznie jest to zatwierdzony input programu
  const tapeInputRef = useRef<string>("");

    // Taśma używana w symilacji
  const [tapeValues] = useState<Map<number, TapeSymbol>>(
    tapeState.tape
  );

  // Id komórki na którą wskazuje głowica taśmy
  const [head] = useState<number>(tapeState.head);

  const [isInputFieldVisible , setInputFieldVisibility] = useState<boolean>(false);

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
  const [isAnimating, setIsAnimating] = useState(false);

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
    isEmpty: false,
    startingState: "start",
    acceptingState: "acc",
    rejectingState: "rej"
  });

  const handleAnimEnd = useCallback(() => {
  setIsAnimating(false);
  }, []);

  //contains all the data that tape needs to properly function
  const [tapeData , setTapeData] = useState<TapeInput>(
    {tapeState: tapeState,
      writtenChar: null,
      action: "STAY",
      animationType: "none",
      radius: radius,
      cellPx: cellPx,
      animateMs: animateMs,
      callAfterAnimation: handleAnimEnd
    }
  );

  const BUFFER = 1;
  const from = head - radius - BUFFER;
  const to = head + radius + BUFFER;

  useMemo(() => {

    const list = [];
    for (let i = from; i <= to; i++) {
      const value: TapeSymbol | undefined = tapeValues.get(i);
      list.push(
        <div
          key={i}
          className={`tape-cell ${i === head ? "tape-cell-head" : ""}`}
          style={{ width: `${cellPx}px`, height: `${cellPx}px`, flex: `0 0 ${cellPx}px` }}
          title={`i=${i}`}
        >
          {value ?? " "}
        </div>
      );
    }
    return list;
  }, [from, to, head, tapeState.tape, cellPx, tapeValues]);

  function toggleInputFieldVisibility(){
    isInputFieldVisible? setInputFieldVisibility(false) : setInputFieldVisibility(true);
  }

  function updateTape(){
   
    const currentStep = stepRef.current;
    const currentStepDir = stepDirRef.current;
    const writtenChar = simulation.steps[currentStep].writtenChar;

    //Jesli robimy krok wstecz to bierzemy akcje z poprzedniego kroku i ja odwracamy
    let currentAction = currentStepDir === -1? simulation.steps[currentStep-1].action : simulation.steps[currentStep].action;
    if(currentStepDir === -1){
      if(currentAction === "LEFT"){
        currentAction = "RIGHT";
      }else if(currentAction === "RIGHT"){
        currentAction = "LEFT";
      }
    }

    const currentTapeState = currentStepDir === -1?  simulation.steps[currentStep-1].tapeBefore : simulation.steps[currentStep].tapeBefore;

    const stepDirToAnimationType = (stepDir:number)=> {
      switch(stepDir){
        case 0:{ return "none";}
        case 1:{ return "normal";}
        case -1:{ return "reverse";}
        default:{return "none";}
      }
    }
    const newAnimationType: AnimationType = stepDirToAnimationType(currentStepDir);
    setIsAnimating(true);
    setTapeData(()=>{return{
        tapeState: currentTapeState,
        writtenChar: writtenChar, 
        action : currentAction,
        animationType: newAnimationType,
        radius: tapeRadiusRef.current,
        cellPx: cellSizeRef.current,
        animateMs: animationSpeedRef.current,
        callAfterAnimation: handleAnimEnd,
    }})

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
      steps: simulationSteps,
      isEmpty: false,
      startingState: initialState,
      acceptingState: acceptState,
      rejectingState: rejectState,
    }

    setSimulation(newSimulation);
    stateRef.current = newSimulation.steps[0].stateBefore;
  }

  function addTape(){
    //to be implemented
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
      stateRef.current = simulation.steps[currentStep+1].stateBefore;
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
      stateRef.current = simulation.steps[currentStep+1].stateBefore;
    }
  }

  const doPrevSimulationStep = () => {
    const currentStep = stepRef.current;
    if(currentStep === 0) return;
    if(isAnimating) return;
    setIsPlaying(false);

    stepDirRef.current = -1;

    let stepDir : -1 | 0 | 1 = transActionToNumber(stepRef.current-1);
    if(stepDir===-1){
      stepDir = 1;
    }else if (stepDir===1){
      stepDir = -1;
    }
    updateTape();
    stepRef.current=currentStep-1;
    stateRef.current = simulation.steps[currentStep-1].stateBefore;

  }

  // translate transaction action (move Left, move right etc.) of given step from simulation to number (-1, 0, 1)
  // by default it translates current step
    const transActionToNumber =  (stepId : number = stepRef.current) : -1 | 0 | 1 =>{
        switch (simulation.steps[stepId].action){
          case "LEFT":
            return -1;
          case "STAY":
            return 0;
          case "RIGHT":
            return +1;
        }
    };
  
  function placeInputOnTape(newInput: string){
    let inputCopy : string = newInput.trim();
    let newTapeValues: Map<number , string> = new Map<number, string>();
    for(let i: number = 0; i<inputCopy.length; i++){
      newTapeValues.set(i , inputCopy.charAt(i));
    }
    
    setTapeData(()=>{return{
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
    }})
  }

  function enterInput(){
    setSimulationInput(tapeInputRef.current);
    placeInputOnTape(tapeInputRef.current);
  }

  const playSimulation = () => {
    setIsPlaying(true);
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
  };

  function onTapeInputChange(newInput: string){
    tapeInputRef.current = newInput;
  }

  const resetSimulation = () => {

    setIsPlaying(false);
    setIsAnimating(false);
    stepRef.current = 0;
    stepDirRef.current = 0;
    stateRef.current = simulation.startingState;

    setTapeData({
      tapeState: {
        head: 0, 
        tape: new Map(defaultTape), 
      },
      writtenChar: null,
      action: null,
      animationType: "jump",
      radius,
      cellPx,
      animateMs: animationSpeedRef.current,
      callAfterAnimation: handleAnimEnd,
    });
  };

  const jumpToSimulation = (step: number) => {
    setIsPlaying(false);
    setIsAnimating(false);
    stepRef.current = step;
    stateRef.current = simulation.steps[step].stateBefore;
    
    setTapeData({
      tapeState: simulation.steps[step].tapeBefore,
      writtenChar: null,
      action: null,
      animationType: "jump",
      radius: tapeRadiusRef.current,
      cellPx: cellSizeRef.current,
      animateMs: animationSpeedRef.current,
      callAfterAnimation: handleAnimEnd,
    });
  };

    const viewportStyle: React.CSSProperties = {
    width: `${(2 * radius + 1) * cellPx}px`,
    height: `${cellPx + 2 * 8}px`,
  };

  return (
    <div className="simulation-interface">
      {/* shows current state, steps, and output */}
      <div className="simulation-data">
        <p>State: {stateRef.current}</p>
        <p>Output: {outputRef.current}</p>
        <p>Step: {stepRef.current ?? ""}</p>
      </div>

      <div className="tape-wrapper">
        <div className="tape-viewport" style={viewportStyle}>
            <TapeComponent tapeInput={tapeData} />
        </div>
        <div className="TapeActions">
          <button className="TapeActionsButton ShowTapeInputButton" onClick={toggleInputFieldVisibility}>
            <ChevronDownIcon/>
          </button>
          <button className={`TapeActionsButton AddTapeButton ${isSimulationLoaded? "DisabledButton" : ""}`} disabled={isSimulationLoaded} onClick={()=>addTape()} >
            <PlusIcon></PlusIcon>
          </button>
        </div>

        <div className={`InputContainer ${isInputFieldVisible ? "InputContainerVisible" : ""}`}>
          <input id="TapeInputField" name="TapeInputField" className="TapeInputField" onChange={(e)=>{onTapeInputChange(e.target.value)}}></input>
          <button className={`EnterInputButton ${!isSimulationLoaded? "DisabledButton" : ""}`}  onClick={()=>enterInput()}></button>
        </div>
      </div>

      <div className="SimulationControls">
        <div className="JumpToControls">
          <input className="JumpToInput" type="number" min={0} 
           max={simulation==null? 0 : simulation.steps.length} 
           placeholder="step"
            onChange={(e)=>{jumpToRef.current=parseInt(e.target.value)}}>
          </input>

          <button className="simulation-controls-button simulation-jump-button" onClick={()=>{if(jumpToRef.current!=null) jumpToSimulation(jumpToRef.current)}}>
            Jump
          </button>

        </div>

        <div className="FlowControls">

          <button className={`ToStartButton SimulationControlsButton ${!isSimulationLoaded? "DisabledButton" : ""}`} disabled={!isSimulationLoaded} 
          onClick={()=>jumpToSimulation(0)}>
            <ChevronDoubleLeftIcon/>
          </button>

          <button className={`StepBackButton SimulationControlsButton ${!isSimulationLoaded? "DisabledButton" : ""}`} disabled={!isSimulationLoaded}   onClick={doPrevSimulationStep}>
            <ChevronLeftIcon/>
          </button>
        
          <button className={`PlayButton SimulationControlsButton ${!isSimulationLoaded || isPlaying? "DisabledButton" : ""}`} disabled={!isSimulationLoaded}  onClick={playSimulation}>
            <PlayIcon />
          </button>

          <button className={`PauseButton SimulationControlsButton ${!isSimulationLoaded || !isPlaying? "DisabledButton" : ""}`} disabled={!isSimulationLoaded} onClick={pauseSimulation}>
            <PauseIcon />
          </button>

          <button className={`StopButton SimulationControlsButton ${!isSimulationLoaded? "DisabledButton" : ""}`} disabled={!isSimulationLoaded} onClick={resetSimulation}>
            <StopIcon />
          </button>

          <button className={`StepForwardButton SimulationControlsButton ${!isSimulationLoaded? "DisabledButton" : ""}`} disabled={!isSimulationLoaded} onClick={doNextSimulationStep}>
            <ChevronRightIcon/>
          </button>
        
          <button className={`ToEndButton SimulationControlsButton ${!isSimulationLoaded? "DisabledButton" : ""}`} disabled={!isSimulationLoaded} onClick={()=>jumpToSimulation(simulation.steps.length-1)}>
            <ChevronDoubleRightIcon/>
          </button>
        </div>

        <div className="SpeedControls">
          <input type="range" min="0.01" max="0.99" step="0.01" onChange={(e)=>{setAnimationSpeed(parseFloat(e.target.value))}}></input>
        </div>
       
        
        <div className="simulation-jump">
          
        </div>
      </div>
      <div className="LoadSimulationContainer">
        <button className={`LoadSimulationButton  ${isSimulationLoaded? "DisabledButton" : ""}`}
          disabled={isSimulationLoaded} onClick={()=>loadSimulation()}>Load Simulation</button>
      </div>
    </div>
  );
};
