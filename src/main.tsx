import { CurrencyProvider } from './lib/CurrencyContext';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <CurrencyProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </CurrencyProvider>
    </HelmetProvider>
  </React.StrictMode>
);

