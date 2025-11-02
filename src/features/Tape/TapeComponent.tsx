import "./tape.css";


import { PlayIcon, PauseIcon, StopIcon, PlayPauseIcon, ForwardIcon,
   ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronDownIcon, PlusIcon } from "@heroicons/react/24/solid";
import { useState, useRef, useMemo, useEffect } from "react";
import type { Simulation ,TapeSymbol, TapeViewInput, Phase, SimulationStep , Tape, TapeState, TapeInput, AnimationType, TransitionAction } from "./tapeTypes";


type Props = { tapeInput: TapeInput };

export const TapeComponent = ({tapeInput}: Props) => {

 // Id komórki na którą wskazuje głowica taśmy
  const [head, setHead] = useState<number>(tapeInput.tapeState.head);

  // Predkosc animacji jednego ruchu
  const animationSpeedRef = useRef(tapeInput.animateMs);

  // Taśma używana w symilacji
  const [tapeValues, setTapeValues] = useState<Map<number, TapeSymbol>>(
    tapeInput.tapeState.tape
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
  const baseOffset = -BUFFER * tapeInput.cellPx;
  const from = head - tapeInput.radius - BUFFER;
  const to = head + tapeInput.radius + BUFFER;

  const cells = useMemo(() => {
    const list = [];
    for (let i = from; i <= to; i++) {
      const value: TapeSymbol | undefined = tapeValues.get(i);
      list.push(
        <div
          key={i}
          className={`TapeCell ${i === head ? "TapeCellHead" : ""}`}
          style={{ width: `${tapeInput.cellPx}px`, height: `${tapeInput.cellPx}px`, flex: `0 0 ${tapeInput.cellPx}px` }}
          title={`i=${i}`}
        >
          {value ?? " "}
        </div>
      );
    }
    return list;
  }, [from, to, head, tapeValues, tapeInput]);

  useEffect(()=>{
    dirRef.current = transActionToNumber(tapeInput.action);
    animationTypeRef.current = tapeInput.animationType;
    animationSpeedRef.current = tapeInput.animateMs;
    
    startStep();
  }, [tapeInput])

 

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

    console.log(tapeInput);

    const dir = dirRef.current;
    const animationType = animationTypeRef.current;

    if(animationType === "none") return;

     if (animationType === "jump") {
    setNoTransition(true);
    setIsAnimating(false);
    setPhase("idle");
    forceReflow(); 
    setOffsetPx(0);
    setTapeValues(new Map(tapeInput.tapeState.tape));
    setHead(tapeInput.tapeState.head);
    requestAnimationFrame(() => {
      setNoTransition(false);
      tapeInput.callAfterAnimation();
    });
    return;
  }

    if (phase !== "idle"){ 
      return;
    }

    if(animationType==="reverse" && dir===0){
      setTapeValues(prev => {
            const newMap = new Map(tapeInput.tapeState.tape);
            return newMap;
        });

        tapeInput.callAfterAnimation();
        return;  
    }
    
    if(animationType==="normal" ){
        setTapeValues(prev => {
            const newMap = new Map(tapeInput.tapeState.tape);
            
            if(tapeInput.writtenChar!=null) newMap.set(head, tapeInput.writtenChar);  
            return newMap;
        });

        if(dir===0){
          tapeInput.callAfterAnimation();
          return;  
        }

    }else if(animationType==="none"){
       setTapeValues(prev => {
            const newMap = new Map(tapeInput.tapeState.tape);
            
            if(tapeInput.writtenChar!=null) newMap.set(head, tapeInput.writtenChar);  
            return newMap;
        });

        tapeInput.callAfterAnimation();
          return;  
    }

    setPhase("anim");
    setIsAnimating(true);
    setNoTransition(false);
    forceReflow();                   
    setOffsetPx(-dir * tapeInput.cellPx);       // transition
  };


const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
  if (e.target !== trackRef.current) return;
  if (e.propertyName !== "transform") return;
  if (phase !== "anim") return;

  setHead(h => h + dirRef.current);
  setIsAnimating(false);
  setPhase("snap");
  setNoTransition(true);

  requestAnimationFrame(() => {
    setOffsetPx(0);
    forceReflow();

    requestAnimationFrame(() => {
      setNoTransition(false);
      setPhase("idle");

      if (animationTypeRef.current === "reverse") {
        console.log("before tape")
         setTapeValues(prev => {
            const newMap = new Map(tapeInput.tapeState.tape);

            return newMap;
        });
      }
      tapeInput.callAfterAnimation();
    });
  });
};


  const trackStyle: React.CSSProperties = {
    transform: `translate3d(${baseOffset + offsetPx}px, 0, 0)`,
    transition: noTransition ? "none" : `transform ${animationSpeedRef.current}ms ease`,
    willChange: "transform",
  };

  const viewportStyle: React.CSSProperties = {
    width: `${(2 * tapeInput.radius + 1) * tapeInput.cellPx}px`,
    height: `${tapeInput.cellPx + 2 * 8}px`,
  };

  return (
    <div className="TapeTrack" ref={trackRef} style={trackStyle} onTransitionEnd={handleTransitionEnd}>
            {cells}
    </div>
  );
};
