import { Editor , useMonaco, } from "@monaco-editor/react";
import {useSimulationAliases} from '../features/SimulationAliases/simulationAliases'
import type monaco from 'monaco-editor';

import './page.css';
import { useEffect, useRef } from "react";
import { useSimulationProgram } from "../features/SimulationProgram/simulationProgram";

const LANGUAGE_ID = "tm";


const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");




export default function ConsolePage() {

    const monaco = useMonaco();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor|null>(null);

    const { sep1, sep2, left, stay, right} = useSimulationAliases();
    const {codeLines , setField} = useSimulationProgram();

    useEffect(() => {
      if (!monaco) return;

      monaco.editor.defineTheme("tm-theme", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "d11919", fontStyle: "italic" }, //Comment
        { token: "function", foreground: "f5f543"}, //Action
        { token: "constant", foreground: "bc3fbc" }, //Separator 2
        { token: "string", foreground: "23d18b"}, //States
        { token: "variable", foreground: "3b8eea" }, //Read and written symbol
        { token: "delimiter", foreground: "a31515" },
        { token: "invalid", foreground: "fc0303"},

        //q1,a,q2,b,S
        //https://gist.github.com/javifm86/073d8e05942a8849dd11fa6996955fc0
      ],
      colors: {}
    });

    

    monaco.editor.setTheme("tm-theme");

      monaco.languages.register({ id: LANGUAGE_ID });

      const reComment = /\/\/.*/;  
      const reAction = new RegExp(`(${esc(left)}|${esc(stay)}|${esc(right)})`)
      const reSep2 = new RegExp(`${esc(sep2)}`);     
      const reSep1 = new RegExp(`${esc(sep1)}`);     
      const reState = new RegExp(`((?!${esc(sep1)}|\\n).)+`);
      const reSymbol = new RegExp(`.`);

     monaco.languages.setMonarchTokensProvider(LANGUAGE_ID,{

        tokenPostfix: ".tm",
        defaultToken: "",
        brackets: [],
        keywords: [],

        tokenizer: {
            root:[
              [reComment, "comment"],
              [reState , "string" , "afterCurrentState"],
            ],

            whitespace: [
              [/[ \t\r]+/, "white"],
              [/\/\/.*/, "comment"],    
            ],

            newline: [
              [/\r?\n/, "", "@popall"]
            ],

            afterCurrentState:[
              { include: "@newline" },
              { include: "@whitespace" },
              [reSep1, "delimiter" , "expectsReadSymbol"],
            ],

            expectsReadSymbol:[
              { include: "@newline" },
              { include: "@whitespace" },
              [reSymbol , "variable" , "afterReadSymbol"],

            ],

            afterReadSymbol:[
              { include: "@newline" },
              { include: "@whitespace" },
              [reSep2, "constant", "afterSep2"],

            ],

            afterSep2:[
              { include: "@newline" },
              { include: "@whitespace" },
               [reState , "string" , "afterNextState"],

            ],

            afterNextState:[
              { include: "@newline" },
              { include: "@whitespace" },
               [reSep1 , "delimiter" , "expectsWrittenSymbol"],

            ],

            expectsWrittenSymbol:[
              { include: "@newline" },
              { include: "@whitespace" },
              [reSymbol, "variable" , "afterWrittenSymbol"],

            ],

            afterWrittenSymbol:[
              { include: "@newline" },
              { include: "@whitespace" },
              [reSep1, "delimiter", "expectsAction"],

            ],

            expectsAction: [
              { include: "@whitespace" },
              [reAction, "function", "@popall"],   
              [/\r?\n/, "", "@popall"],         
            ]
        }
    });


    }, [monaco , sep1, sep2, left, stay, right]);


    function validateModel(model: monaco.editor.ITextModel, monaco: typeof import('monaco-editor')){
 
      const lines = model.getLinesContent(); 
      const markers: monaco.editor.IMarkerData[] = [];
      
      const reTransition = new RegExp(
        `^\\s*((?:(?!${esc(sep1)}|\\n).)+)\\s*${esc(sep1)}\\s*(.)\\s*${esc(sep2)}\\s*((?:(?!${esc(sep1)}|\\n).)+)\\s*${esc(sep1)}\\s*(.)\\s*${esc(sep1)}\\s*(?:${esc(left)}|${esc(stay)}|${esc(right)})\\s*(?:\/\/.*)?$`
      );
      
      lines.forEach((rawLine, i) => {
        const code = rawLine.replace(/\/\/.*$/, ""); //delete comments
        if (!code.trim()) return;               // if line is empty (only whitelines) skip

        if (!reTransition.test(code)) {
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: "Niepoprawna składnia reguły.",
            startLineNumber: i + 1,
            startColumn: 1,
            endLineNumber: i + 1,
            endColumn: rawLine.length + 1,
          });
        }
      });

      monaco.editor.setModelMarkers(model, "tm-validator", markers);
      
    }

    /*
    const arr : string[] = ["aaa" , "bbb", "ccc"]; 
    const code : string = arr.join("\n");
    */

    return(
        <div className="page">

            <Editor 
            
            onMount={(editor, monaco) => { 



               editorRef.current = editor;
                const model = editor.getModel();
                if (!model) return;

                validateModel(model, monaco);

                const sub = editor.onDidChangeModelContent(() => {
                  validateModel(model, monaco);
                });

                editor.onDidDispose(() => sub.dispose());
           }}

           onChange={()=>{
              if(!editorRef.current) return;
              const editor = editorRef.current;
              const model = editor.getModel();
              if (!model) return;
              setField( model.getLinesContent())
           }}
            
            className="code-editor" 
             defaultLanguage={LANGUAGE_ID}
             value = {codeLines.join("\n")}
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
