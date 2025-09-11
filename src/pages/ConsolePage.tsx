import { Editor } from "@monaco-editor/react";
import './page.css';

export default  function ConsolePage() {
    return(
        <div className="page">
            <Editor className="code-editor" defaultLanguage="plaintext"
             defaultValue="Lorem Ipsum"
             height="90vh"
             width="90vw"
             theme="light"
             />
        </div>
    );
}