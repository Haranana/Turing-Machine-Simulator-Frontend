import "./tape.css";


import { PlayIcon, PauseIcon, StopIcon, PlayPauseIcon, ForwardIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useMemo, useEffect } from "react";
import type { Simulation ,TapeSymbol, TapeViewInput, Phase, SimulationStep , Tape, TapeState } from "./tapeTypes";


export const TapeView = ({ tapeState, radius = 10, cellPx = 80, animateMs = 800 }: TapeViewInput) => {

  // Id komórki na którą wskazuje głowica taśmy
  const [head, setHead] = useState<number>(tapeState.head);

  // Predkosc animacji jednego ruchu
  const animationSpeedRef = useRef(animateMs);

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

  //making sure transition is active
  const forceReflow = () => {
    trackRef.current?.getBoundingClientRect();
  };

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

  const startStep = (dir: -1 | 0 | 1) => {

    const currentStep = stepRef.current;

    if (phase !== "idle") return;
    
    if(currentStep >= simulation.steps.length){
      setIsPlaying(false);
      return;
    }

    if(!isEndingStep(currentStep)){
      setTapeValues(prev => {
        const newMap = new Map(simulation.steps[currentStep].tapeBefore.tape);
        newMap.set(head, simulation.steps[currentStep].writtenChar);    
        return newMap;
      });
    }
    

    dirRef.current = dir;
    stepDirRef.current = 1;
    if(dir === 0){  
      setNextStep();
      setCurrentState();
      return;
    }

    
    setPhase("anim");
    setIsAnimating(true);
    setNoTransition(false);
    forceReflow();                   
    setOffsetPx(-dir * cellPx);       // transition
  };

  const reverseStep = (dir : -1 | 0 | 1) => {

    const currentStep = stepRef.current;

    if(currentStep === 0){
      return;
    }

    console.log("move: ", dir);
    if(dir === 0){
      stepRef.current-=1;
      stateRef.current = simulation.steps[stepRef.current].stateBefore;
      setTapeValues(prev => {
      const newMap = new Map(simulation.steps[stepRef.current].tapeBefore.tape);    
      return newMap;
      });
      return;

    }
    
    dirRef.current = dir;
    setPhase("anim");
    setIsAnimating(true);
    setNoTransition(false);
    stepDirRef.current = -1;
    forceReflow();                   
    setOffsetPx(-dir * cellPx);       // transition
  }

    useEffect(() => {
    if (!isPlaying) return;
    if (phase === "idle") {

      if(stepRef.current >= simulation.steps.length){
        setIsPlaying(false);
      }else{
        console.log("1");
        const stepDir : -1 | 0 | 1 = transActionToNumber();
        startStep(stepDir);
      }
    
    }
  }, [isPlaying, phase]); 

  const doNextSimulationStep = () => {
    if(stepRef.current >= simulation.steps.length){
      
      return;
    }

    setIsPlaying(false);
    
    const stepDir : -1 | 0 | 1 = transActionToNumber();
    startStep(stepDir);
  }

  const doPrevSimulationStep = () => {
    if(stepRef.current === 0) return;

    setIsPlaying(false);

    let stepDir : -1 | 0 | 1 = transActionToNumber(stepRef.current-1);
    if(stepDir===-1){
      stepDir = 1;
    }else if (stepDir===1){
      stepDir = -1;
    }
    
    reverseStep(stepDir);
  }

  
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {

    if(stepRef.current >= simulation.steps.length){
      console.log("size error");
      return;
    }

    if (e.target !== trackRef.current) return;
    if (e.propertyName !== "transform") return;
    if (phase !== "anim") return;

  
    setHead((h) => h + dirRef.current);
    stepRef.current += stepDirRef.current;
    const currentStep = stepRef.current;
    
    setIsAnimating(false);

    setPhase("snap");
    setNoTransition(true);

    // offset = 0, return without transition
    requestAnimationFrame(() => {
      setOffsetPx(0);
      forceReflow();

      // set trans to true and set phase to idle
      requestAnimationFrame(() => {
        setNoTransition(false);
        setPhase("idle");
      });
    });

    if(stepDirRef.current === -1){
        setTapeValues(prev => {
        const newMap = new Map(simulation.steps[currentStep].tapeBefore.tape);    
        return newMap;
      });
    }

    stepDirRef.current = 0;
    if(currentStep >= simulation.steps.length - 1 && simulation.steps[currentStep].stateAfter!=null){
        stateRef.current = simulation.steps[currentStep].stateAfter;
      }else{
        stateRef.current = simulation.steps[currentStep+1].stateBefore;
      }

    console.log("3");
  };

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



  const trackStyle: React.CSSProperties = {
    transform: `translate3d(${baseOffset + offsetPx}px, 0, 0)`,
    transition: noTransition ? "none" : `transform ${animationSpeedRef.current}ms ease`,
    willChange: "transform",
  };

  const viewportStyle: React.CSSProperties = {
    width: `${(2 * radius + 1) * cellPx}px`,
    height: `${cellPx + 2 * 8}px`,
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
    setNoTransition(true);
    setOffsetPx(0);
    setHead(tapeState.head);
    stepRef.current = 0;
    stateRef.current = simulation.startingState;
    setTapeValues(
      defaultTape
    );
    setPhase("idle");
    requestAnimationFrame(() => setNoTransition(false));
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
          <div
            className="tape-track"
            ref={trackRef}
            style={trackStyle}
            onTransitionEnd={handleTransitionEnd}
          >
            {cells}
          </div>
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

          <button className="ToStartButton SimulationControlsButton" onClick={()=>jumpToSimulation(0)}>
            <ChevronDoubleLeftIcon/>
          </button>

          <button className="StepBackButton SimulationControlsButton" onClick={doPrevSimulationStep}>
            <ChevronLeftIcon/>
          </button>
        


          <button className="PlayButton SimulationControlsButton" onClick={playSimulation}>
            <PlayIcon />
          </button>

          <button className="PauseButton SimulationControlsButton" onClick={pauseSimulation}>
            <PauseIcon />
          </button>

          <button className="StopButton SimulationControlsButton" onClick={resetSimulation}>
            <StopIcon />
          </button>

          <button className="StepForwardButton SimulationControlsButton" onClick={doNextSimulationStep}>
            <ChevronRightIcon/>
          </button>
        
          <button className="ToStartButton SimulationControlsButton" onClick={()=>jumpToSimulation(simulation.steps.length-1)}>
            <ChevronDoubleRightIcon/>
          </button>
        </div>

        <div className="SpeedControls">
          <input type="range" min="0.01" max="0.99" step="0.01" onChange={(e)=>{setAnimationSpeed(parseFloat(e.target.value))}}></input>
        </div>
       
        
        <div className="simulation-jump">
          
        </div>
      </div>
    </div>
  );
};
