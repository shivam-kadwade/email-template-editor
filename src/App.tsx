import React, { useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import EmailEditor from 'react-email-editor';
import type { EditorRef, EmailEditorProps } from 'react-email-editor';
import defaultTemplate from './data/defaultTemplate.data';

const App = () => {
   
  const emailEditorRef = useRef<EditorRef>(null);

  // export HTML, Design
  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;
    
    if (!unlayer) {
      console.error('Email editor not ready');
      return;
    }

    // Export HTML
    unlayer.exportHtml((data) => {
      const { html} = data;
      
      // Export JSON design
      unlayer.saveDesign((designData: any) => {
        const designJson = designData;
        
        // Post both HTML and JSON to parent
        if (window.parent) {
          window.parent.postMessage({ 
            type: 'FROM_IFRAME', 
            content: {
              templateHTML: html,
              templateDesign: designJson
            }
          }, '*');
        }
      });
    });
  };

  // listen for messages from parent
  const listenToParent = () => {
    const handleMessage = (event : any) => {

      // if (event.origin !== "https://org-domain.com") return;
      
      if (event.data && event.data.type === 'LOAD_TEMPLATE') {
        const templateJson = event.data.template;
        loadTemplate(templateJson);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  };

  // load template
  const loadTemplate = (templateJson : any) => {
    const unlayer = emailEditorRef.current?.editor;
    
    if (!unlayer) {
      console.error('Email editor not ready');
      return;
    }

    if (templateJson) {
      unlayer.loadDesign(templateJson);
    } else {
      unlayer.loadDesign(defaultTemplate);
    }
  };

  // listener on component mount
  useEffect(() => {
    const cleanup = listenToParent();
    return cleanup;
  }, []);

  const onReady: EmailEditorProps['onReady'] = (unlayer) => {
    loadTemplate(defaultTemplate);
    // Check if parent wants to send a template, otherwise load default
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ 
        type: 'REQUEST_TEMPLATE'
      }, '*');
      
      // load default if no response from parent
      setTimeout(() => {
        // load if no template has been loaded
        unlayer.saveDesign((data: any) => {
          // check for current state of design
          if (!data.body.rows || data.body.rows.length === 0) {
            loadTemplate(defaultTemplate);
          }
        });
      }, 1000);
    } else {
      // Load default template if not in iframe
      loadTemplate(defaultTemplate);
    }
  };

  return (
    <div>
      <div style={{ padding: '5px',  borderBottom: '1px solid #ddd' }}>
        <button 
          onClick={exportHtml}
          style={{
            padding: '10px 20px',
            backgroundColor: '#36454F',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Save & Export HTML
        </button>
      </div>

      <EmailEditor 
        ref={emailEditorRef} 
        onReady={onReady} 
        minHeight={800}
      />
    </div>
  );
};

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;