import "./tape.css"


export type TapeSymbol = string;          // usually a singe char
export type Tape   = Map<number, TapeSymbol>;

export interface TapeState {
  head: number;                
  tape: Tape;                  //only non empty ones!
}

interface TapeViewInput{
    tapeState: TapeState;
}

export const TapeView = ({ tapeState }: TapeViewInput) => {
  const radius = 10; //how many cells are shown at one given time
  const cells = [];

  for (let i = tapeState.head - radius; i <= tapeState.head + radius; i++) {
    const value : TapeSymbol | undefined = tapeState.tape.get(i);
    if (value != null){
        cells.push(
            <div key={i} className="tape-cell">
                {value}
            </div>
            );
        }
    }
    
  return (
    <div className="tape">
      {cells}
    </div>
  );
};