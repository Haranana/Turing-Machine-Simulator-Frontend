import { Editor, useMonaco } from "@monaco-editor/react";
import { useSimulationAliases } from "../features/GlobalData/simulationAliases";
import { useSimulationInput } from "../features/GlobalData/simulationInput";
import type monaco from "monaco-editor";

import "./page.css";
import { useEffect, useRef } from "react";
import { useSimulationProgram } from "../features/GlobalData/simulationProgram";

const LANGUAGE_ID = "tm";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function ConsolePage() {
  const { simulationTapesAmount } = useSimulationInput();

  const monacoInstance = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const { sep1, sep2, left, stay, right } = useSimulationAliases();
  const { codeLines, setCodeLines, setHasErrors } = useSimulationProgram();

  function stripTerminators(lines: string[]): string[] {
    return lines.map(l => l.replace(/;\s*$/, ""));
  }

  function addTerminators(lines: string[]) : string[]{
    return lines.map(l=>l.trimEnd().endsWith(':')? l : l+";");
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
        { token: "invalid", foreground: "fc0303" }, // q1,a,q2,b,S
      ],
      colors: {},
    });
    monacoInstance.editor.setTheme("tm-theme");

    // Language + tokens
    monacoInstance.languages.register({ id: LANGUAGE_ID });

    const reComment = /\/\/.*/;
    const reAction = new RegExp(
      `(${esc(left)}|${esc(stay)}|${esc(right)})`
    );
    const reSep2 = new RegExp(esc(sep2));
    const reSep1 = new RegExp(esc(sep1));
    const reState = new RegExp(`((?!${esc(sep1)}|\\n).)+`);
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
          [reState, "string", "afterCurrentState"], // STATE_BEFORE
        ],

        whitespace: [
          [/[ \t\r]+/, "white"],
          [/\/\/.*/, "comment"],
        ],

        newline: [[/\r?\n/, "", "@popall"]],

        // STATE_BEFORE , READS...
        afterCurrentState: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSep1, "delimiter", "expectsReads"],
        ],

        // READS LIST: sym (sep1 sym)* ... until SEP2
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
          [reSep1, "delimiter", "expectsReads"], // kolejny read
          [reSep2, "constant", "afterSep2"], // koniec reads → SEP2
        ],

        // SEP2 STATE_AFTER
        afterSep2: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reState, "string", "afterNextState"], // STATE_AFTER
        ],

        // STATE_AFTER , WRITES...
        afterNextState: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reSep1, "delimiter", "expectsWrites"],
        ],

        // WRITES LIST: sym (sep1 sym)* ... ale gdy po sep1 zaczyna się akcja → przełącz na moves
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

        // Po sep1: albo zaczyna się move (action), albo kolejny write (symbol)
        afterWritesSep1: [
          [reTerm, { token: "delimiter", next: "@popall" }],
          { include: "@newline" },
          { include: "@whitespace" },
          [reAction, "function", "maybeMoreMoves"], // start MOVES
          [reSymbol, "variable", "maybeMoreWrites"], // nadal WRITES
        ],

        // MOVES LIST: action (sep1 action)*
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
  }, [monacoInstance, sep1, sep2, left, stay, right]);

  function validateModel(
    model: monaco.editor.ITextModel,
    monacoLib: typeof import("monaco-editor"),
    tapesAmount: number
  ) {
    const lines = model.getLinesContent();
    const markers: monaco.editor.IMarkerData[] = [];

    const s1 = esc(sep1);
    const s2 = esc(sep2);
    const act = `(?:${esc(left)}|${esc(stay)}|${esc(right)})`;
    const sym = `(?:.)`;
    const listN = (x: string) =>
      `\\s*${x}\\s*(?:${s1}\\s*${x}\\s*){${Math.max(tapesAmount - 1, 0)}}`;

    // pełny wzorzec linii:
    // stateBefore s1 [reads] s2 stateAfter s1 [writes] s1 [moves]
    const re = new RegExp(
  `^\\s*` +
    `(?<stateBefore>(?:(?!${s1}|\\n).)+)` +
    `\\s*${s1}` +
    `(?<reads>${listN(sym)})` +
    `\\s*${s2}\\s*` +
    `(?<stateAfter>(?:(?!${s1}|\\n).)+)` +
    `\\s*${s1}` +
    `(?<writes>${listN(sym)})` +
    `\\s*${s1}` +
    `(?<moves>${listN(act)})` +
    `\\s*;\\s*$`
);

    lines.forEach((rawLine, i) => {
      const code = rawLine.replace(/\/\/.*$/, "");
      if (!code.trim()) return;

      const m = code.match(re);
      if (!m) {
        markers.push({
          severity: monacoLib.MarkerSeverity.Error,
          message: `Niepoprawna składnia lub niewłaściwa liczba pól (oczekiwano ${tapesAmount} r/w/m).`,
          startLineNumber: i + 1,
          startColumn: 1,
          endLineNumber: i + 1,
          endColumn: rawLine.length + 1,
        });
        return;
      }

      // Rozbij „listy” po sep1 i sprawdź liczbę elementów + długość symboli
      const splitBySep1 = (s: string) =>
        s
          .split(new RegExp(`\\s*${s1}\\s*`))
          .map((x) => x.trim())
          .filter(Boolean);

      const readsRaw = splitBySep1(m.groups!.reads);
      const writesRaw = splitBySep1(m.groups!.writes);
      const movesRaw = splitBySep1(m.groups!.moves);

      if (
        readsRaw.length !== tapesAmount ||
        writesRaw.length !== tapesAmount ||
        movesRaw.length !== tapesAmount
      ) {
        markers.push({
          severity: monacoLib.MarkerSeverity.Error,
          message: `Liczba elementów (r/w/m) musi wynosić dokładnie ${tapesAmount}.`,
          startLineNumber: i + 1,
          startColumn: 1,
          endLineNumber: i + 1,
          endColumn: rawLine.length + 1,
        });
        return;
      }

      // symbole muszą być 1-znakowe
      const badSymIdx = [...readsRaw, ...writesRaw].findIndex(
        (s) => s.length !== 1
      );
      if (badSymIdx !== -1) {
        markers.push({
          severity: monacoLib.MarkerSeverity.Error,
          message: "Symbole r/w muszą mieć dokładnie 1 znak.",
          startLineNumber: i + 1,
          startColumn: 1,
          endLineNumber: i + 1,
          endColumn: rawLine.length + 1,
        });
        return;
      }

      // ruchy muszą odpowiadać aliasom
      const moveOk = new RegExp(`^${act}$`);
      const badMove = movesRaw.find((mv) => !moveOk.test(mv));
      if (badMove) {
        markers.push({
          severity: monacoLib.MarkerSeverity.Error,
          message: `Nieprawidłowy ruch '${badMove}'. Dozwolone: ${left}, ${stay}, ${right}.`,
          startLineNumber: i + 1,
          startColumn: 1,
          endLineNumber: i + 1,
          endColumn: rawLine.length + 1,
        });
        return;
      }
    });

    monacoLib.editor.setModelMarkers(model, "tm-validator", markers);
    return markers;
  }

  return (
    <div className="page">
      <Editor
        onMount={(editor, monacoLib) => {
          console.log(codeLines);
          editorRef.current = editor;

          const model = editor.getModel();
          if (!model) return;

          // Pierwsza walidacja + zapis
          const markers = validateModel(
            model,
            monacoLib,
            simulationTapesAmount
          );



          setCodeLines(stripTerminators(model.getLinesContent()));
          setHasErrors((markers ?? []).length > 0);

          // Jedna subskrypcja na zmiany treści
          const sub = editor.onDidChangeModelContent(() => {
            const m = validateModel(
              model,
              monacoLib,
              simulationTapesAmount
            );
            setCodeLines(stripTerminators(model.getLinesContent()));
            setHasErrors((m ?? []).length > 0);
          });

          editor.onDidDispose(() => sub.dispose());
        }}
        onChange={() => {
          if (!editorRef.current) return;
          const editor = editorRef.current;
          const model = editor.getModel();
          if (!model) return;
          setCodeLines(stripTerminators(model.getLinesContent()));
        }}
        className="code-editor"
        defaultLanguage={LANGUAGE_ID}
        value={ addTerminators(codeLines).join("\n")}
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
