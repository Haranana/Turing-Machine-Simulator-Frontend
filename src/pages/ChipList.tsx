import React, { useState, type KeyboardEvent,type ChangeEvent } from "react";
import "./ChipList.css";
import "./../index.css"

type propsType = {name: string, singleCharacterMode: boolean, defaultValues : string[], defaultValuesMessage?: string|null, defaultInputMessage?: string | null, onDataChanged?: (data: string[])=>void }

export default function ChipList({name,singleCharacterMode, defaultValues , defaultValuesMessage, defaultInputMessage, onDataChanged} : propsType) {
  const [symbols, setSymbols] = useState<string[]>(defaultValues);
  const [input, setInput] = useState<string>("");

  const binaryDigits : string[] = ["0" , "1"];
  const decimalDigits: string[] = ["0" , "1" , "2", "3", "4", "5", "6", "7", "8", "9"];
  const hexadecimalDigits: string[] = ["0" , "1" , "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
  const englishAlphabet: string[] = [
        "a","b","c","d","e","f","g","h","i","j","k","l","m",
        "n","o","p","q","r","s","t","u","v","w","x","y","z",
        "A","B","C","D","E","F","G","H","I","J","K","L","M",
        "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
  ];

  const englishAlphabetWithDigits: string[] = [
        "0","1","2","3","4","5","6","7","8","9",
        "a","b","c","d","e","f","g","h","i","j","k","l","m",
        "n","o","p","q","r","s","t","u","v","w","x","y","z",
        "A","B","C","D","E","F","G","H","I","J","K","L","M",
        "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
  ];

  const presetAlphabets : Map<string ,string[]> = new Map<string ,string[]>([["binary digits" , binaryDigits],[
    "decimal digits" , decimalDigits], ["hexadecimal digits" , hexadecimalDigits]
    ,["english alphabet" , englishAlphabet] , ["english alphabet with digits" , englishAlphabetWithDigits]]);


  function addSymbol() {
    const raw = input;


        let values : string[] = [];
        if(singleCharacterMode){
            values = [...raw].map(c => c.trim()).filter(c => c.length > 0);
        }else{
            values = raw.split(" ").map(s => s.trim()).filter(s=>s.length>0);
        }

        if (values.length === 0) return;

        setSymbols(prev => {
            const existing = new Set(prev);
            const updated = [...prev];

            for (const v of values) {
                if (!existing.has(v)) {
                updated.push(v);
                existing.add(v);
                }
            }
          if(onDataChanged!=null){
            onDataChanged(updated);
          }
            return updated;
        });
   
    
    setInput("");

  }

  function handleInputChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSymbol();
    }
  }

  function removeSymbol(symbol: string) {
    setSymbols(prev => prev.filter(s => s !== symbol));
  }
  
  function loadPreset(preset: string){
    if(presetAlphabets.has(preset)){
      setInput([...presetAlphabets.get(preset)!.values()].join(""));
    }
  }

  function clearList(){
    setSymbols([]);
  }

  return (
    <div className="alphabet-editor">
      <label className="alphabet-label">{name}</label>

      <div className="alphabet-chips-container">
        {symbols.length === 0 && (
          <div className="alphabet-empty-info">
            {defaultValuesMessage!=null? defaultValuesMessage : ""}
          </div>
        )}

        <div className="alphabet-chips">
          {symbols.map(symbol => (
            <div className="alphabet-chip" key={symbol}>
              <span className="alphabet-chip-symbol">{symbol}</span>
              <button
                type="button"
                className="alphabet-chip-remove"
                onClick={() => removeSymbol(symbol)}
                aria-label={`Usuń symbol ${symbol}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="alphabet-input-row">

        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="alphabet-input"
          placeholder={defaultInputMessage!=null? defaultInputMessage: ""}
        />
        <details className="PresetsDropdown">
          <summary className="PresetsDropdownSummary">Preset alphabets</summary>
          <div className="PresetsDropdownList">
            <button type="button" className="PresetsDropdownButton" onClick={()=>loadPreset("binary digits")}>Binary digits</button>
            <button type="button" className="PresetsDropdownButton" onClick={()=>loadPreset("decimal digits")}>Decimal digits</button>
            <button type="button" className="PresetsDropdownButton" onClick={()=>loadPreset("hexadecimal digits")}>Hexadecimal digits</button>
            <button type="button" className="PresetsDropdownButton" onClick={()=>loadPreset("english alphabet")}>English alphabet</button>
            <button type="button" className="PresetsDropdownButton" onClick={()=>loadPreset("english alphabet with digits")}>English alphabet with digits</button>
          </div>
        </details>
        <button
          type="button"
          className="alphabet-add-button"
          onClick={clearList}
        >
          Clear
        </button>
        <button
          type="button"
          className="alphabet-add-button"
          onClick={addSymbol}
        >
          Enter
        </button>
      </div>

      <div className="alphabet-help">
        Each non-empty value will be added separately. Duplicates are ignored
      </div>
    </div>
  );
}
