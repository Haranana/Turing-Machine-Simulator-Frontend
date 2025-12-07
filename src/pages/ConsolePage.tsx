

import "./page.css";
import "./ConsolePage.css"
import { useEffect, useRef } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import type monaco from "monaco-editor";
import { useTuringMachineData, useTuringMachineSettings } from "../features/GlobalData/GlobalData";
import { boolean } from "zod";

const LANGUAGE_ID = "tm";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function ConsolePage() {
  const monacoInstance = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const { symbolSeparator, transitionArrow, left, stay, right, blank } = useTuringMachineSettings(s=>s.aliases);
  const {onlyComplete, onlyTapeAlphabet, onlyStatesFromSet, tapeAlphabet, allowMultipleTapes, allowNondeterminism, statesSet } = useTuringMachineSettings(s=>s.specialSettings);
  const { tmDataProgram, setTmDataProgram, setTmDataProgramHasError, setTmDataTapesInputs, tmDataTapesAmount } = useTuringMachineData();
  const {acceptState, rejectState} = useTuringMachineSettings(s=>s.specialStates);

  function stripTerminators(lines: string[]): string[] {
    return lines.map(l => l.replace(/;\s*$/, ""));
  }

  function addTerminators(lines: string[]) : string[]{
    return lines.map(l=> (l.trimEnd().endsWith(';') || l.trim().length == 0 || l.trim().startsWith("//"))? l : l+";");
  }

  useEffect(() => {
    if (!monacoInstance) return;

    // Theme
    monacoInstance.editor.defineTheme("tm-theme", {
      base: "vs",
      inherit: true,
      rules: [
      { token: "comment",   foreground: "6A9955", fontStyle: "italic" }, // Comment (zielony jak w VS Code)
      { token: "function",  foreground: "C586C0", fontStyle: "bold"   }, // Action (L/R/S) – fiolet
      { token: "constant",  foreground: "D7BA7D"                       }, // Transition arrow / separator 2 – złoty
      { token: "string",    foreground: "2B91AF", fontStyle: "bold"   }, // States – turkus
      { token: "variable",  foreground: "D16969"                       }, // Read and written symbol – czerwono-różowy
      { token: "delimiter", foreground: "C8C8C8"                       }, // Symbol separator (przecinek) – jasny szary
      { token: "invalid",   foreground: "FF0000", fontStyle: "bold"   }, // Error
    ],
      colors: {
        "editorCursor.foreground": "#919191ff",
      },
    });
    monacoInstance.editor.setTheme("tm-theme");
    monacoInstance.languages.register({ id: LANGUAGE_ID });

    const reComment = /\/\/.*/;
    const reAction = new RegExp(
      `(${esc(left)}|${esc(stay)}|${esc(right)})`
    );
    const reSep2 = new RegExp(esc(transitionArrow));
    const reSep1 = new RegExp(esc(symbolSeparator));
    const reState = new RegExp(`((?!${esc(symbolSeparator)}|\\n).)+`);
    const reSymbol = /./;
    const reTerm = /;\s*/; 

    monacoInstance.languages.setMonarchTokensProvider(LANGUAGE_ID, {
      tokenPostfix: ".tm",
      defaultToken: "",
      brackets: [],
      keywords: [],
      tokenizer: {
        root: [
          [reComment, "comment"],
          [reState, "string", "afterCurrentState"], 
        ],

        whitespace: [
          [/[ \t\r]+/, "white"],
          [/\/\/.*/, "comment"],
        ],

        newline: [[/\r?\n/, "", "@popall"]],

        afterCurrentState: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSep1, "delimiter", "expectsReads"],
        ],

        expectsReads: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSymbol, "variable", "maybeMoreReads"],
        ],

        maybeMoreReads: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSep1, "delimiter", "expectsReads"],
          [reSep2, "constant", "afterSep2"], 
        ],

        afterSep2: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reState, "string", "afterNextState"], 
        ],

        afterNextState: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSep1, "delimiter", "expectsWrites"],
        ],

        expectsWrites: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSymbol, "variable", "maybeMoreWrites"],
        ],

        maybeMoreWrites: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSep1, "delimiter", "afterWritesSep1"],
        ],

       
        afterWritesSep1: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reAction, "function", "maybeMoreMoves"], 
          [reSymbol, "variable", "maybeMoreWrites"], 
        ],

        expectsMoves: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reAction, "function", "maybeMoreMoves"],
        ],

        maybeMoreMoves: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSep1, "delimiter", "expectsMoves"],
          [/\r?\n/, "", "@popall"],
        ],
      },
    });
  }, [monacoInstance, symbolSeparator, transitionArrow, left, stay, right]);

function validateModel(
  model: monaco.editor.ITextModel,
  monacoLib: typeof import("monaco-editor"),
  tapesAmount: number) {
  const lines = model.getLinesContent();
  const markers: monaco.editor.IMarkerData[] = [];

  const s1 = symbolSeparator;   
  const s2 = transitionArrow;  

  //transitions splitted by symbolSep and transArrow (also trimmed and without semicolon)
  //for use in second validation when checking for unreachable states, completeness etc.
  type ParsedTransition = {
    stateBefore: string,
    read: string[],
    stateAfter: string,
    written: string[],
    moves: string[],
    originalLineId: number,
  }

  let parsedTransitions : ParsedTransition[] = [];

  //set all of strings used in code
  let usedStates : Set<{state: string, lineId: number}> = new Set<{state: string, lineId: number}>();

  //set of tape alphabet used in code
  let usedSymbols : Set<string> = new Set<string>(blank);

  lines.forEach((rawLine, i) => {
    const lineNumber = i + 1;
    const code = rawLine.replace(/\/\/.*$/, ""); 

    if (!code.trim()) return; 

    //semicolon
    if (!/;\s*$/.test(code)) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: "Missing ';' at the end of the line",
        startLineNumber: lineNumber,
        startColumn: rawLine.length || 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }

    const withoutTerm = code.replace(/;\s*$/, "");

    //proper use of transition arrow
    const arrowParts = withoutTerm.split(s2);
    if (arrowParts.length !== 2) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: `Expected exactly one '${s2}' separating before/after state`,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }

    const [beforePartRaw, afterPartRaw] = arrowParts;
    const beforePart = beforePartRaw.trim();
    const afterPart = afterPartRaw.trim();

    //left side of transition validation
    const beforePieces = beforePart.split(s1).map(x => x.trim()).filter(Boolean);

    if (beforePieces.length < 1 + tapesAmount) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: `Expected state + ${tapesAmount} read symbols before '${s2}', got ${Math.max(beforePieces.length - 1, 0)}`,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }
    if (beforePieces.length > 1 + tapesAmount) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: `Too many read symbols before '${s2}' (expected ${tapesAmount})`,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }

    const stateBefore = beforePieces[0];
    const reads = beforePieces.slice(1);

    if (!stateBefore.trim()) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: "State before transition cannot be empty",
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }

    //right side of transition validation
    const afterPieces = afterPart.split(s1).map(x => x.trim()).filter(Boolean);
    if (afterPieces.length !== 1 + tapesAmount + tapesAmount) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: `Expected state + ${tapesAmount} write symbols + ${tapesAmount} moves after '${s2}', got ${afterPieces.length - 1} elements`,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }

    const stateAfter = afterPieces[0];
    const writes = afterPieces.slice(1, 1 + tapesAmount);
    const moves = afterPieces.slice(1 + tapesAmount);

    //is state directly after transition arrow
    if (!stateAfter.trim()) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: "State after transition cannot be empty",
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }

    //Move validation
    const allowedMoves = new Set([left, stay, right]);
    const badMoveIndex = moves.findIndex(m => !allowedMoves.has(m));
    if (badMoveIndex !== -1) {
      markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: `Invalid move '${moves[badMoveIndex]}', expected one of ${Array.from(allowedMoves).join(", ")}`,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }

    //at this point structure of line is correct
    //now program checks for restrictions specified in special settings of turing machine

    parsedTransitions.push({
      stateBefore: beforePieces[0].trim(),
      read: beforePieces.slice(1),
      stateAfter: afterPieces[0].trim(),
      written: afterPieces.slice(1, tapesAmount),
      moves: afterPieces.slice(tapesAmount),
      originalLineId: i
    })
    usedStates.add({state: stateBefore.trim(), lineId: i});
    parsedTransitions[parsedTransitions.length-1].read.forEach((v,_)=>usedSymbols.add(v));
    parsedTransitions[parsedTransitions.length-1].written.forEach((v,_)=>usedSymbols.add(v));

    //usedStates.add({state: stateAfter.trim(), lineId: i});

    //States set validation
    if(onlyStatesFromSet && (!statesSet.includes(stateBefore.trim()) || !statesSet.includes(stateAfter.trim()))){
       markers.push({
        severity: monacoLib.MarkerSeverity.Error,
        message: "State is not included in states set",
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: rawLine.length + 1,
      });
      return;
    }


    //check if read and written symbols are in tape alphabet (if specified)
    if(onlyTapeAlphabet){
      if(beforePieces.slice(1).some((s)=>!tapeAlphabet.includes(s))){
        markers.push({
          severity: monacoLib.MarkerSeverity.Error,
          message: "Read symbol is not from specified tape alphabet",
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: rawLine.length + 1,
        });
        return;
      }      
      
      if(afterPieces.slice(1 , -tapesAmount).some((s)=>!tapeAlphabet.includes(s))){
        markers.push({
          severity: monacoLib.MarkerSeverity.Error,
          message: "Written symbol is not from specified tape alphabet",
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: rawLine.length + 1,
        });
        return;
      }   
    }
  });

  let reachableStates : Set<string> = new Set();
  parsedTransitions.forEach((line, id)=>{
      //check if there's duplicated line
      for(let i=id+1; i<parsedTransitions.length; i++){
        const otherLine : ParsedTransition = parsedTransitions[i];
        if( line.stateBefore === otherLine.stateBefore && line.read.every((r,rId)=>r===otherLine.read[rId])  && line.stateAfter === otherLine.stateAfter && 
        line.written.every((r,rId)=>r===otherLine.written[rId]) && line.moves.every((r,rId)=>r===otherLine.moves[rId])){
          markers.push({
            severity: monacoLib.MarkerSeverity.Warning,
            message: "Duplicate line",
            startLineNumber: line.originalLineId+1,
            startColumn: 1,
            endLineNumber: line.originalLineId+1,
            endColumn: lines[line.originalLineId+1].length + 1,
          });
        }

        if(!allowNondeterminism && line.stateBefore === otherLine.stateBefore && line.read.every((r,rId)=>r===otherLine.read[rId])){
          markers.push({
            severity: monacoLib.MarkerSeverity.Error,
            message: "Nondeterminism is forbidden due to chosen settings",
            startLineNumber: line.originalLineId+1,
            startColumn: 1,
            endLineNumber: line.originalLineId+1,
            endColumn: lines[line.originalLineId+1].length + 1,
          });
        }
      }
  
      //add end state to list of reachable states
      reachableStates.add(line.stateAfter);
  })

  usedStates.forEach((usedState,_)=>{
    if(!reachableStates.has(usedState.state)){
      markers.push({
            severity: monacoLib.MarkerSeverity.Warning,
            message: "Unreachable state: " + usedState.state,
            startLineNumber: usedState.lineId+1,
            startColumn: 1,
            endLineNumber: usedState.lineId+1,
            endColumn: lines[usedState.lineId].length+1,
          });
    }
  })

  //checking if machine is complete
  //deterministic turing machine is complete if for each state (excluding accept and reject) it has |tapeAlphabet|^tapesAmount different transitions
  //nondeterministic turing machine must have at least |tapeAlphabet|^tapesAmount different transition beginnings 
  if(onlyComplete){
    let UniqueTransitionsPerState : Map<string, number> = new Map();
    usedStates.forEach( (state,_) => {
      if(state.state!==acceptState && state.state !== rejectState) UniqueTransitionsPerState.set(state.state , 0);
    }); 

    parsedTransitions.forEach((line, id)=>{
      const stateExistInTransitionCounter = UniqueTransitionsPerState.has(line.stateBefore);
      if(!stateExistInTransitionCounter) return;
      let isTransitionBeginUnique: boolean = true;

      for(let i=id+1; i<parsedTransitions.length; i++){
          const otherLine : ParsedTransition = parsedTransitions[i];
          if(line.stateBefore === otherLine.stateBefore && line.read.every((s,sId)=>s===otherLine.read[sId])){
            isTransitionBeginUnique = false
          }
      }

      if(isTransitionBeginUnique){
        const val = UniqueTransitionsPerState.get(line.stateBefore)!;
        UniqueTransitionsPerState.set(line.stateBefore, val+1);
      }
    })

    const expectedUniqueTransitions = Math.pow(usedSymbols.size , tapesAmount);

    let foundNonComplete = false;
    UniqueTransitionsPerState.forEach( (transitions,state) => {
      if(foundNonComplete) return;
        if(transitions!==expectedUniqueTransitions){
           markers.push({
            severity: monacoLib.MarkerSeverity.Error,
            message: `Machine is not complete but is specified to be in settings\nState missing transitions: ${state}\nMissing transitions: ${expectedUniqueTransitions - transitions}` ,
            startLineNumber: lines.length,
            startColumn: 1,
            endLineNumber: lines.length,
            endColumn: lines[lines.length-1].length+1,
          });
          foundNonComplete = true;
        }
    }); 
  }
  

  monacoLib.editor.setModelMarkers(model, "tm-validator", markers);
  return markers;
}

  return (
    <div className="page">
    <div className="ConsoleWrapper">
      <Editor
        onMount={(editor, monacoLib) => {

          editorRef.current = editor;

          const model = editor.getModel();
          if (!model) return;


          const markers = validateModel(
            model,
            monacoLib,
            tmDataTapesAmount
          );

          setTmDataProgram(stripTerminators(model.getLinesContent()));
          setTmDataProgramHasError((markers ?? []).length > 0);

          const sub = editor.onDidChangeModelContent(() => {
            const m = validateModel(
              model,
              monacoLib,
              tmDataTapesAmount
            );
            setTmDataProgram(stripTerminators(model.getLinesContent()));
            setTmDataProgramHasError((m ?? []).length > 0);
          });

          editor.onDidDispose(() => sub.dispose());
        }}
        onChange={() => {
          if (!editorRef.current) return;
          const editor = editorRef.current;
          const model = editor.getModel();
          if (!model) return;
          setTmDataProgram(stripTerminators(model.getLinesContent()));
        }}
        className="code-editor"
        defaultLanguage={LANGUAGE_ID}
        defaultValue={ addTerminators(tmDataProgram).join("\n")}
        height="90vh"
        width="90vw"
        theme="tm-theme"
    
        options={{
          fontSize: 24,
          minimap: {
            enabled: false,
          },
        }}
      />
    </div>
    </div>
  );
}
