
import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';

import EmailEditor from 'react-email-editor';
import type { EditorRef, EmailEditorProps } from 'react-email-editor';

const App = () => {
   
  const emailEditorRef = useRef<EditorRef>(null);

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.exportHtml((data) => {
      const {  html } = data;
      console.log('exportHtml', html);
      if (window.parent) {
      window.parent.postMessage({ type: 'FROM_IFRAME', content: html }, '*');
    }
    });
  };

  const onReady: EmailEditorProps['onReady'] = () => {
    // editor is ready
    // you can load your template here;
    // the design json can be obtained by calling
    // unlayer.loadDesign(callback) or unlayer.exportHtml(callback)

    // const templateJson = { DESIGN JSON GOES HERE };
    // unlayer.loadDesign(templateJson);
  };

  return (
    <div>
      <div>
        <button onClick={exportHtml}>Save & Export HTML</button>
      </div>

      <EmailEditor ref={emailEditorRef} onReady={onReady} minHeight={800}/>
    </div>
  );
};

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App