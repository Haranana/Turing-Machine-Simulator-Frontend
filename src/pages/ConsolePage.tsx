import { Editor } from "@monaco-editor/react";
import './page.css';

export default  function ConsolePage() {
    return(
        <div className="page">
            <Editor height="90vh" defaultLanguage="plaintext" defaultValue="Lorem Ipsum" />
        </div>
    );
}