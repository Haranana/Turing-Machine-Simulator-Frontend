import "./tape.css";


import { PlayIcon, PauseIcon, StopIcon, PlayPauseIcon, ForwardIcon,
   ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useMemo, useEffect } from "react";
import type { Simulation ,TapeSymbol, TapeViewInput, Phase, SimulationStep , Tape, TapeState, TapeInput, AnimationType, TransitionAction } from "./tapeTypes";


export const TapeComponent = ({ tapeState, writtenChar, animationType, action, radius = 10, cellPx = 80, animateMs = 800}: TapeInput) => {

 // Id komórki na którą wskazuje głowica taśmy
  const [head, setHead] = useState<number>(tapeState.head);

  // Predkosc animacji jednego ruchu
  const animationSpeedRef = useRef(animateMs);

  // Taśma używana w symilacji
  const [tapeValues, setTapeValues] = useState<Map<number, TapeSymbol>>(
    tapeState.tape
  );

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

  const animationTypeRef = useRef<AnimationType>("none");

   const trackRef = useRef<HTMLDivElement | null>(null);

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
  }, [from, to, head, tapeState.tape, writtenChar, animationType, action, radius, cellPx, animateMs]);

  useEffect(()=>{
    dirRef.current = transActionToNumber(action);
    animationTypeRef.current = animationType;
    startStep();
  }, [tapeState, writtenChar, animationType, action])

 

    const transActionToNumber =  (action: TransitionAction | null) : -1 | 0 | 1 =>{
        if(action==null) return 0;
        switch (action){
          case "LEFT":
            return -1;
          case "STAY":
            return 0;
          case "RIGHT":
            return +1;
        }
    };

  //making sure transition is active
  const forceReflow = () => {
    trackRef.current?.getBoundingClientRect();
  };

  const startStep = () => {

    const dir = dirRef.current;
    const animationType = animationTypeRef.current;
    if (phase !== "idle") return;


    if(animationType!=="reverse"){
        setTapeValues(prev => {
            const newMap = new Map(tapeState.tape);
            newMap.set(head, writtenChar);    
            return newMap;
        });

        if(animationType === "none" || dir===0){
            return;
        }

    }   

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
    setIsAnimating(false);
    setPhase("snap");
    setNoTransition(true);
    requestAnimationFrame(() => {
      setOffsetPx(0);
      forceReflow();

      requestAnimationFrame(() => {
        setNoTransition(false);
        setPhase("idle");
      });
    });

    if(animationTypeRef.current === "reverse"){
            setTapeValues(prev => {
            const newMap = new Map(tapeState.tape);
            newMap.set(head, writtenChar);    
            return newMap;
        });
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

  return (
    <div className="tape-track" ref={trackRef} style={trackStyle} onTransitionEnd={handleTransitionEnd}>
            {cells}
    </div>
  );
};
