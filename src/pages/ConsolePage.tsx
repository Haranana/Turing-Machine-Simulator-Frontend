

import "./page.css";
import { useEffect, useRef } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import type monaco from "monaco-editor";
import { useTuringMachineData, useTuringMachineSettings } from "../features/GlobalData/GlobalData";

const LANGUAGE_ID = "tm";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function ConsolePage() {
  const monacoInstance = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const { symbolSeparator, transitionArrow, left, stay, right } = useTuringMachineSettings(s=>s.aliases);
  const { tmDataProgram, setTmDataProgram, setTmDataProgramHasError, setTmDataTapesInputs, tmDataTapesAmount } = useTuringMachineData();

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
        { token: "comment", foreground: "d11919", fontStyle: "italic" }, // Comment
        { token: "function", foreground: "f5f543" }, // Action
        { token: "constant", foreground: "bc3fbc" }, // Separator 2
        { token: "string", foreground: "23d18b" }, // States
        { token: "variable", foreground: "3b8eea" }, // Read and written symbol
        { token: "delimiter", foreground: "a31515" },
        { token: "invalid", foreground: "fc0303" }, 
      ],
      colors: {},
    });
    monacoInstance.editor.setTheme("tm-theme");
    monacoInstance.languages.register({ id: LANGUAGE_ID });

    const reComment = /\/\/.*/;
    const reAction = new RegExp(
      `(${esc(left)}|${esc(stay)}|${esc(right)})`
    );
    const reSep2 = new RegExp(esc(symbolSeparator));
    const reSep1 = new RegExp(esc(transitionArrow));
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
    tapesAmount: number
  ) {
    const lines = model.getLinesContent();
    const markers: monaco.editor.IMarkerData[] = [];

    const s1 = esc(symbolSeparator);
    const s2 = esc(transitionArrow);
    const act = `(?:${esc(left)}|${esc(stay)}|${esc(right)})`;
    const sym = `(?:.)`;
    const listN = (x: string) =>
      `\\s*${x}\\s*(?:${s1}\\s*${x}\\s*){${Math.max(tapesAmount - 1, 0)}}`;


    const re = new RegExp(
  `^\\s*` +
    `(?<stateBefore>(?:(?!${s1}|\\n).)+)` +
    `\\s*${s1}` +
    `(?<reads>${listN(sym)})` +
    `\\s*${s2}\\s*` +
    `(?<stateAfter>(?:(?!${s1}|\\n).)+)` + `\\s*${s1}` +
    `(?<writes>${listN(sym)})` +
    `\\s*${s1}` +
    `(?<moves>${listN(act)})` +`\\s*;\\s*$`
);

    lines.forEach((rawLine, i) => {
      const code = rawLine.replace(/\/\/.*$/, "");
      if (!code.trim()) return;

      const m = code.match(re);
      if (!m) {
        markers.push({
          severity: monacoLib.MarkerSeverity.Error,
          message: `Incorrect syntax`,
          startLineNumber: i + 1,
          startColumn: 1,
          endLineNumber: i + 1,
          endColumn: rawLine.length + 1,
        });
        return;
      }

      const splitBySep1 = (s: string) =>
        s
          .split(new RegExp(`\\s*${s1}\\s*`))
          .map((x) => x.trim())
          .filter(Boolean);

      const readsRaw = splitBySep1(m.groups!.reads);
      const writesRaw = splitBySep1(m.groups!.writes);
      const movesRaw = splitBySep1(m.groups!.moves);

    });

    monacoLib.editor.setModelMarkers(model, "tm-validator", markers);
    return markers;
  }

  return (
    <div className="page">
      <Editor
        onMount={(editor, monacoLib) => {
          console.log(tmDataProgram);
          editorRef.current = editor;

          const model = editor.getModel();
          if (!model) return;

          // Pierwsza walidacja + zapis
          const markers = validateModel(
            model,
            monacoLib,
            tmDataTapesAmount
          );



          setTmDataProgram(stripTerminators(model.getLinesContent()));
          setTmDataProgramHasError((markers ?? []).length > 0);

          // Jedna subskrypcja na zmiany treści
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
        }}
      />
    </div>
  );
}
