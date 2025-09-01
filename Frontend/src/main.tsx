import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import './index.css'
import App from './App.tsx'
import reduxStore from '@/app/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider store={reduxStore}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ReduxProvider>
  </StrictMode>,
)
