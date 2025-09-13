import "./tape.css"

export type TapeSymbol = string;          // usually a singe char
export type Tape   = Map<number, TapeSymbol>;
import { useState , useRef, useMemo } from "react";

export interface TapeState {
  head: number;                
  tape: Tape;                  //only non empty ones!
}

interface TapeViewInput{
  tapeState: TapeState;
  radius?: number;
  cellPx?: number;
  animateMs?: number;  
}

export const TapeView = ({ tapeState , radius=10, cellPx=40, animateMs=400}: TapeViewInput) => {

    const [head, setHead] = useState<number>(tapeState.head);

  // Przesunięcie wizualne taśmy (px). 0 oznacza “wyrównane”.
  const [offsetPx, setOffsetPx] = useState<number>(0);

  // Czy aktualnie trwa animacja (aby ignorować kolejne kliknięcia).
  const [isAnimating, setIsAnimating] = useState(false);

  // Flaga na “snap bez transition” tuż po commicie ruchu.
  const [noTransition, setNoTransition] = useState(false);

    // Pamiętamy kierunek aktualnego kroku, żeby wiedzieć co zcommmitować w onTransitionEnd.
  const dirRef = useRef<number>(0);

 
  // Renderujemy pełne okno widoku (także puste komórki!)
  const from = head - radius;
  const to   = head + radius;

  const cells = useMemo(() => {
    const list = [];
    for (let i = from; i <= to; i++) {

      const value: TapeSymbol | undefined = tapeState.tape.get(i);
      
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
    // zależności: head, zakres, mapa (intencjonalnie minimalne)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, head, tapeState.tape, cellPx]);


  // Jeden krok: dir = -1 (w lewo), 0 (stój), +1 (w prawo)
  const step = (dir: -1 | 0 | 1) => {
    if (isAnimating) return;
    if (dir === 0) return;

    dirRef.current = dir;
    setIsAnimating(true);
    setNoTransition(false);

    // Jeżeli head idzie w prawo (+1), taśma wizualnie przesuwa się w lewo (−cellPx)
    const visualShift = -dir * cellPx;
    setOffsetPx(visualShift);
  };

  // Po zakończeniu transition “commit” i snap do 0 bez transition
  const handleTransitionEnd = () => {
    if (!isAnimating) return;

    // 1) commit: faktycznie zmieniamy head
    setHead(h => h + dirRef.current);

    // 2) natychmiast wyłączamy transition i cofamy offset do 0, aby nie było skoku
    setIsAnimating(false);
    setNoTransition(true);
    setOffsetPx(0);

    // 3) w następnym ticku znów włączymy transition dla kolejnych kroków
    //    (tutaj wystarczy zostawić noTransition=true do czasu kolejnego stepu)
  };

  const trackStyle: React.CSSProperties = {
    transform: `translateX(${offsetPx}px)`,
    transition: noTransition ? "none" : `transform ${animateMs}ms ease`,
  };

  const viewportStyle: React.CSSProperties = {
    width: `${(2 * radius + 1) * cellPx}px`,
    height: `${cellPx + 2 * 8}px`, // + padding/border jeśli chcesz
  };

  return (
    <div className="tape-wrapper">
      <div className="tape-viewport" style={viewportStyle}>
        <div className="tape-track" style={trackStyle} onTransitionEnd={handleTransitionEnd}>
          {cells}
        </div>
      </div>

      <div className="tape-controls">
        <button onClick={() => step(-1)} disabled={isAnimating}>◀︎</button>
        <span className="tape-head-index">head: {head}</span>
        <button onClick={() => step(+1)} disabled={isAnimating}>▶︎</button>
      </div>
    </div>
  );
};