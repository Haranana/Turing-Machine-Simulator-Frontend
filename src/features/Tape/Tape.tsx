import "./tape.css";


import { PlayIcon, PauseIcon, StopIcon, PlayPauseIcon, ForwardIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useMemo, useEffect } from "react";
import type { Simulation ,TapeSymbol, TapeViewInput, Phase, SimulationStep , Tape } from "./tapeTypes";


export const TapeView = ({ tapeState, radius = 10, cellPx = 80, animateMs = 800 }: TapeViewInput) => {

  const [head, setHead] = useState<number>(tapeState.head);

  let defaultTape : Map<number, TapeSymbol> = tapeState.tape;

  const [tapeValues, setTapeValues] = useState<Map<number, TapeSymbol>>(
    tapeState.tape
  );

  // Przesunięcie wizualne taśmy (px). 0 oznacza “wyrównane”.
  const [offsetPx, setOffsetPx] = useState<number>(0);

  // Czy aktualnie trwa animacja (dla przycisków).
  const [isAnimating, setIsAnimating] = useState(false);

  // Flaga na “snap bez transition”.
  const [noTransition, setNoTransition] = useState(false);

  // Odtwarzanie.
  const [isPlaying, setIsPlaying] = useState(false);

  // Mała maszyna stanów: idle -> anim -> snap -> idle ...
  const [phase, setPhase] = useState<Phase>("idle");

  // Kierunek animacji.
  const dirRef = useRef<number>(0);

  // refs do diagnostyki / UI
  const stateRef = useRef<string>("");
  const outputRef = useRef<"Accepted" | "Rejected" | "Undecided" | "">("");
  const stepRef = useRef<number>(0);

  // simulation state (placeholder)
  const [simulation , setSimulation] = useState<Simulation>({
    steps: [],
    isEmpty: false,
  });

  //load debug simulation data
  useEffect(()=>{
    let simStep1TapeAfter : Tape = new Map<number, string>([
      [0 , "1"],
      [1 , "0"],
      [2 , "1"],
    ])

    let simStep2TapeAfter : Tape = new Map<number, string>([
      [0 , "1"],
      [1 , "1"],
      [2 , "1"],
    ])

    let simStep3TapeAfter : Tape = new Map<number, string>([
      [0 , "1"],
      [1 , "1"],
      [2 , "2"],
    ])

    let simStep1 : SimulationStep = {
      tapeIndex : 0,
      action : "RIGHT", 
      readChar : "0",
      writtenChar : "1",
      stateBefore : "q0",
      stateAfter : "q1",
      tapeAfter : simStep1TapeAfter,
    }

    let simStep2 : SimulationStep = {
      tapeIndex : 0,
      action : "RIGHT", 
      readChar : "0",
      writtenChar : "1",
      stateBefore : "q1",
      stateAfter : "q1",
      tapeAfter : simStep2TapeAfter,
    }

    let simStep3 : SimulationStep = {
      tapeIndex : 0,
      action : "STAY", 
      readChar : "0",
      writtenChar : "2",
      stateBefore : "q1",
      stateAfter : "q2",
      tapeAfter : simStep3TapeAfter,
    }

    let newSteps : Array<SimulationStep> = Array(simStep1, simStep2, simStep3);

    let newSimulation : Simulation = {
      steps: newSteps,
      isEmpty: false,
    }

    setSimulation(newSimulation);
  }, []);

  /*
  const [simulation] = ()=>{
    return useState<Simulation>({
    steps: [],
    isEmpty: false,
    });
  }*/

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


  const startStep = (dir: -1 | 0 | 1) => {

      //see if value of tape cell under head needs to be changed
    setTapeValues(prev => {
      const newMap = new Map(simulation.steps[stepRef.current].tapeAfter);
      //newMap.set(head, simulation.steps[stepRef.current].writtenChar);    
      return newMap;
    });

    if (phase !== "idle" || dir === 0) return;

    dirRef.current = dir;
    setPhase("anim");
    setIsAnimating(true);
    setNoTransition(false);
    forceReflow();                   
    setOffsetPx(-dir * cellPx);       // transition
  };

  
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current) return;
    if (e.propertyName !== "transform") return;
    if (phase !== "anim") return;

  
    setHead((h) => h + dirRef.current);
    stepRef.current += 1;
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

  useEffect(() => {
    if (!isPlaying) return;
    if (phase === "idle") {

      if(stepRef.current >= simulation.steps.length){
        setIsPlaying(false);
        
      }else{

      const stepDir : -1 | 0 | 1 = transActionToNumber();
      startStep(stepDir);
      }
    
    }
  }, [isPlaying, phase]); 

  const trackStyle: React.CSSProperties = {
    transform: `translate3d(${baseOffset + offsetPx}px, 0, 0)`,
    transition: noTransition ? "none" : `transform ${animateMs}ms ease`,
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

  const doNextSimulationStep = () => {
      const stepDir : -1 | 0 | 1 = transActionToNumber();
      startStep(stepDir);
  }

  const doPrevSimulationStep = () => {
    const stepDir : -1 | 0 | 1 = transActionToNumber(stepRef.current-1);
      startStep(stepDir);
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
    setTapeValues(
      defaultTape
    );
    setPhase("idle");
    requestAnimationFrame(() => setNoTransition(false));
  };

  const jumpToSimulation = (_step: number) => {
    // TODO
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

        <div className="tape-controls">
          <button onClick={doPrevSimulationStep} disabled={phase !== "idle"}>
            ◀︎
          </button>
          <span className="tape-head-index">head: {head}</span>
          <button onClick={doNextSimulationStep} disabled={phase !== "idle"}>
            ▶︎
          </button>
        </div>
      </div>

      <div className="simulation-controls">
        <button className="simulation-controls-button" onClick={playSimulation}>
          <PlayIcon />
        </button>
        <button className="simulation-controls-button" onClick={pauseSimulation}>
          <PauseIcon />
        </button>
        <button className="simulation-controls-button" onClick={resetSimulation}>
          <StopIcon />
        </button>
        <button className="simulation-controls-button" onClick={pauseSimulation}>
          <PlayPauseIcon />
        </button>

        <div className="simulation-jump">
          <button className="simulation-controls-button simulation-jump-button">
            <ForwardIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
