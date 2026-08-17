import { CurrencyProvider } from './lib/CurrencyContext';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initApiInterceptors } from './lib/apiInterceptors';
import './index.css';

// Initialize transparent API routing for multi-domain production setups
initApiInterceptors();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

