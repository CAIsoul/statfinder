import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LoadingProvider } from './components/LoadingIndicator/LoadingContext.tsx';
import LoadingIndicator from './components/LoadingIndicator/LoadingIndicator.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LoadingProvider>
        <LoadingIndicator />
        <App />
      </LoadingProvider>
    </BrowserRouter>
  </StrictMode>,
)
