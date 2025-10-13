import { Editor , useMonaco } from "@monaco-editor/react";
import {useSimulationAliases} from '../features/SimulationAliases/simulationAliases'
import type {AliasesFields} from '../features/SimulationAliases/simulationAliases'

import './page.css';
import { useEffect } from "react";

const LANGUAGE_ID = "tm";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function ConsolePage() {

    const monaco = useMonaco();

    const { sep1, sep2, left, stay, right} = useSimulationAliases();

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
                  [/\s+/, "white"],
                  [/\/\/.*/, "comment"],
                  
            ],

            afterCurrentState:[
              { include: "@whitespace" },
              [reSep1, "delimiter" , "expectsReadSymbol"],
              [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],
            ],

            expectsReadSymbol:[
              { include: "@whitespace" },
              [reSymbol , "variable" , "afterReadSymbol"],
              [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],
            ],

            afterReadSymbol:[
              { include: "@whitespace" },
              [reSep2, "constant", "afterSep2"],
              [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],
            ],

            afterSep2:[
              { include: "@whitespace" },
               [reState , "string" , "afterNextState"],
               [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],
            ],

            afterNextState:[
              { include: "@whitespace" },
               [reSep1 , "delimiter" , "expectsWrittenSymbol"],
               [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],
            ],

            expectsWrittenSymbol:[
              { include: "@whitespace" },
              [reSymbol, "variable" , "afterWrittenSymbol"],
              [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],
            ],

            afterWrittenSymbol:[
              { include: "@whitespace" },
              [reSep1, "delimiter", "expectsAction"],
              [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],
            ],

            expectsAction:[
              { include: "@whitespace" },
              [reAction, "function", "@pop"],
              [/.*/, { cases: { '@eos': { token: 'invalid', next: '@pop' } } }],         
            ],
        }
    });


    }, [monaco , sep1, sep2, left, stay, right]);
    
   
   



    return(
        <div className="page">
            <Editor className="code-editor" 
             defaultLanguage={LANGUAGE_ID}
             defaultValue="q1,a,q2,b,S"
             height="90vh"
             width="90vw"
             theme="light"
             options={{
                fontSize: 24,
            }}
             />
        </div>
    );
}
