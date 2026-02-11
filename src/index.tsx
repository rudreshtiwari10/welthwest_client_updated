import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializePerformanceOptimizations } from './utils/cssLoader';

// Suppress MetaMask/Web3 extension errors that don't affect app functionality
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('MetaMask') ||
    event.message.includes('ethereum') ||
    event.message.includes('web3') ||
    event.filename?.includes('chrome-extension://')
  )) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Browser extension error suppressed:', event.message);
  }
});

// Suppress unhandled promise rejections from browser extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    String(event.reason).includes('MetaMask') ||
    String(event.reason).includes('ethereum') ||
    String(event.reason).includes('web3') ||
    event.reason?.message?.includes('chrome-extension://')
  )) {
    event.preventDefault();
    console.warn('Browser extension promise rejection suppressed:', event.reason);
  }
});

// Initialize performance optimizations
initializePerformanceOptimizations();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 