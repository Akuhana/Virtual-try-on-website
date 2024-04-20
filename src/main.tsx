import React, { ReactNode, useContext, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
export const ModelPathContext = React.createContext<{
  fileURL: string;
  setFileURL: (url: string) => void;
}>({
  fileURL: '',
  setFileURL: () => {}
});

interface FileURLProviderProps {
  children: ReactNode; 
}

export const FileURLProvider: React.FC<FileURLProviderProps> = ({ children }) => {
  const [fileURL, setFileURL] = useState('');

  return (
    <ModelPathContext.Provider value={{ fileURL, setFileURL }}>
      {children}
    </ModelPathContext.Provider>
  );
};

function Overlay() {
  const { setFileURL } = useContext(ModelPathContext);
  
  const handleButtonClick = () => {
    // Programmatically click the hidden file input element
    document.getElementById('fileInput')?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const url = URL.createObjectURL(file);
      setFileURL(url);  // Update the context with the new URL
    }
  };
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }} // Hide the file input
        onChange={handleFileChange}
      />
      {/* Button that triggers file input click */}
      <button
        onClick={handleButtonClick}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: '13px' }}
      >
        Upload .obj
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FileURLProvider  >
      <App />
      <Overlay />
    </FileURLProvider>
  </React.StrictMode>,
)
