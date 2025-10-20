import "./tape.css";


import { PlayIcon, PauseIcon, StopIcon, PlayPauseIcon, ForwardIcon,
   ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import type { Simulation ,TapeSymbol, TapeViewInput, Phase, SimulationStep , Tape, TapeState, TapeInput, AnimationType } from "./tapeTypes.tsx";
import {TapeComponent} from "./TapeComponent"

export const TapesController = ({ tapeState, radius = 10, cellPx = 80, animateMs = 800 }: TapeViewInput) => {

  // Id komórki na którą wskazuje głowica taśmy
  const [head, setHead] = useState<number>(tapeState.head);

  const [isInputFieldVisible , setInputFieldVisibility] = useState<boolean>(false);

  // Predkosc animacji jednego ruchu
  const animationSpeedRef = useRef(animateMs);

  // Rozmiar komórki taśmy w px
  const cellSizeRef = useRef<number>(cellPx);

  //ilość komórek na prawo i lewo od heada w taśmie
  const tapeRadiusRef = useRef<number>(radius);

  // Input taśmy, w przyszłości pewnie będzie zastąpiony listą stringów, dla każdej z taśm
  const tapeInputRef = useRef<string>("");

  // Taśma z załadowanym inputem ale bez wykonania żadnego ruchu
  let defaultTape : Map<number, TapeSymbol> = tapeState.tape;

  // Taśma używana w symilacji
  const [tapeValues, setTapeValues] = useState<Map<number, TapeSymbol>>(
    tapeState.tape
  );

  // Krok do którego użytkownik chce skoczyc
  let jumpToRef = useRef<number | null>(null);

  // Przesunięcie wizualne taśmy (px). 0 oznacza “wyrównane”.
  const [offsetPx, setOffsetPx] = useState<number>(0);

  // Czy aplikacja otrzymala symulacje z API
  const [isSimulationLoaded, setIsSimulationLoaded] = useState<boolean>(false);

  // Czy aktualnie trwa animacja (dla przycisków).
  const [isAnimating, setIsAnimating] = useState(false);

  // Flaga na “snap bez transition”
  const [noTransition, setNoTransition] = useState(false);

  // Odtwarzanie
  const [isPlaying, setIsPlaying] = useState(false);

  // maszyna stanów: idle -> anim -> snap -> idle ..., używana do animacji
  const [phase, setPhase] = useState<Phase>("idle");

  // Kierunek animacji (-1 ,0 ,1)
  const dirRef = useRef<number>(0);

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
  console.log("animation: ", isAnimating);
  }, []);

    const [tapeInput , setTapeInput] = useState<TapeInput>(
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

  //load debug simulation data
  useEffect(()=>{
    let simStep1Tape : Tape = new Map<number, string>([
      [0 , "0"],
      [1 , "0"],
      [2 , "1"],
    ])

    const simStep1TapeBefore : TapeState = {
      tape: simStep1Tape,
      head: 0,
    };

    let simStep2Tape : Tape = new Map<number, string>([
      [0 , "1"],
      [1 , "0"],
      [2 , "1"],
    ])

    const simStep2TapeBefore : TapeState = {
      tape: simStep2Tape,
      head: 1,
    };

    let simStep3Tape : Tape = new Map<number, string>([
      [0 , "1"],
      [1 , "1"],
      [2 , "1"],
    ])

    const simStep3TapeBefore : TapeState = {
      tape: simStep3Tape,
      head: 2,
    };

    let simStep4Tape : Tape = new Map<number, string>([
      [0 , "1"],
      [1 , "1"],
      [2 , "2"],
    ])

    const simStep4TapeBefore : TapeState = {
      tape: simStep4Tape,
      head: 1,
    };

    let simStep5Tape : Tape = new Map<number, string>([
      [0 , "1"],
      [1 , "3"],
      [2 , "2"],
    ])

    const simStep5TapeBefore : TapeState = {
      tape: simStep5Tape,
      head: 1,
    };

    let simStep1 : SimulationStep = {
      tapeIndex : 0,
      action : "RIGHT", 
      readChar : "0",
      writtenChar : "1",
      stateBefore : "q0",
      stateAfter : "q1",
      tapeBefore : simStep1TapeBefore,
    }

    let simStep2 : SimulationStep = {
      tapeIndex : 0,
      action : "RIGHT", 
      readChar : "0",
      writtenChar : "1",
      stateBefore : "q1",
      stateAfter : "q1",
      tapeBefore : simStep2TapeBefore,
    }

    let simStep3 : SimulationStep = {
      tapeIndex : 0,
      action : "LEFT", 
      readChar : "0",
      writtenChar : "2",
      stateBefore : "q1",
      stateAfter : "q2",
      tapeBefore : simStep3TapeBefore,
    }

    let simStep4 : SimulationStep = {
      tapeIndex : 0,
      action : "STAY", 
      readChar : "1",
      writtenChar : "3",
      stateBefore : "q2",
      stateAfter : "q3",
      tapeBefore : simStep4TapeBefore,
    }

    let simStep5 : SimulationStep = {
      tapeIndex : 0,
      action : "STAY", 
      readChar : null,
      writtenChar : null,
      stateBefore : "q3",
      stateAfter : null,
      tapeBefore : simStep5TapeBefore,
    }

    let newSteps : Array<SimulationStep> = Array(simStep1, simStep2, simStep3, simStep4, simStep5);

    let newSimulation : Simulation = {
      steps: newSteps,
      isEmpty: false,
      startingState: "q0",
      acceptingState: "q3",
      rejectingState: "q4"
    }

    setSimulation(newSimulation);
    stateRef.current = newSimulation.steps[0].stateBefore;
  }, []);

  const BUFFER = 1;
  const baseOffset = -BUFFER * cellPx;
  const from = head - radius - BUFFER;
  const to = head + radius + BUFFER;

  const cells = useMemo(() => {
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

  const trackRef = useRef<HTMLDivElement | null>(null);

  function toggleInputFieldVisibility(){
    isInputFieldVisible? setInputFieldVisibility(false) : setInputFieldVisibility(true);
  }


  function updateTape(tapeId: number = 0){

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
    console.log("about to move");
    setIsAnimating(true);
    setTapeInput((prev)=>{return{
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

  //making sure transition is active
  const forceReflow = () => {
    trackRef.current?.getBoundingClientRect();
  };

  function loadSimulation(){
    setIsSimulationLoaded(true);
  }

  function addTape(){
    //to be implemented
  }

  function isEndingStep(step: number){
    return step === simulation.steps.length - 1;
  }

  //receives value in (0,1) and converts it to ms with chosen formula
  function setAnimationSpeed(x : number){
    animationSpeedRef.current = 1600 - 1600 * x;
  }

  
  function setCurrentState(){
     const currentStep = stepRef.current;
     if( currentStep>=simulation.steps.length) return;
     stateRef.current = simulation.steps[currentStep].stateBefore;
  }

  function setNextStep(){
    const currentStep = stepRef.current;
    if(currentStep === simulation.steps.length -1) return;
    stepRef.current+=1;
  }

  function setPrevStep(){
    const currentStep = stepRef.current;
    if(currentStep === 0) return;
    stepRef.current-=1;
  }

  useEffect(() => {
    console.log("sigma: ", isPlaying, isAnimating)
    if (!isPlaying || isAnimating) return;
    if(stepRef.current >= simulation.steps.length) {
      setIsPlaying(false);
      return;
    }
    stepDirRef.current = 1;
    updateTape();
    stepRef.current+=1;
      
  }, [isPlaying, isAnimating]); 


  const doNextSimulationStep = () => {
    if(stepRef.current >= simulation.steps.length) return;
    if(isAnimating) return;
    setIsPlaying(false);

    stepDirRef.current = 1;

    updateTape();
    stepRef.current+=1;
  }

  const doPrevSimulationStep = () => {
    if(stepRef.current === 0) return;
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
    stepRef.current-=1;

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

  const clearTape = () => {
    setTapeValues(prev => {
      const cleared = new Map<number, TapeSymbol>();
      prev.forEach((_, key) => {
        cleared.set(key, ""); 
      });
      return cleared;
    });
  }

  const writeInputOnTape = (input: string) => {
    const inputArray : string[] = input.split('');
    setTapeValues(() => {
      const newMap = new Map<number, TapeSymbol>();
      for(let i: number = 0; i < inputArray.length; i++){
        newMap.set(i, inputArray[i]);
      }
      return newMap;
    });
  }

  const returnHeadToStart = () => {
    setHead(0);
  }

  const restartSimulation = () => {

  }

  const playSimulation = () => {
    setIsPlaying(true);
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
  };

  const resetSimulation = () => {

     setIsPlaying(false);
  setIsAnimating(false);
  stepRef.current = 0;
  stepDirRef.current = 0;
  stateRef.current = simulation.startingState; // lub tapeState.startingState jeśli trzymasz gdzie indziej

  // wyślij do dziecka „skok” bez animacji
  setTapeInput({
    tapeState: {
      head: 0, // albo tapeState.head jeśli tak chcesz
      tape: new Map(defaultTape), // KOPIA!
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
    if(step < 0 || step >= simulation.steps.length) return;

    pauseSimulation();

    setTapeValues(prev => {
      const newMap = new Map(simulation.steps[step].tapeBefore.tape); 
      return newMap;
    });

    setHead(prev=>{
      const newHead = simulation.steps[step].tapeBefore.head;
      return newHead;
    });

    stepRef.current = step;
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
            <TapeComponent tapeInput={tapeInput} />
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
          <input id="TapeInputField" name="TapeInputField" className="TapeInputField" onChange={(e)=>{tapeInputRef.current = e.target.value }}></input>
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
