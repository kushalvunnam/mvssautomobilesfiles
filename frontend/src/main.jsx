import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Dynamically rewrite localhost API endpoints to current hostname for LAN/multi-laptop usage
const originalFetch = window.fetch.bind(window);
window.fetch = function (input, init) {
  const hostname = window.location.hostname;
  const isCloud = hostname.includes('vercel.app') || 
                  hostname.includes('surge.sh') || 
                  hostname.includes('github.io') || 
                  hostname.includes('loca.lt') || 
                  hostname.includes('pinggy') || 
                  hostname.includes('lhr.life') || 
                  hostname.includes('ngrok');
  if (!isCloud) {
    if (typeof input === 'string' && input.includes('localhost:5000')) {
      input = input.replace('localhost:5000', `${hostname}:5000`);
    } else if (input && typeof input === 'object' && input.url && input.url.includes('localhost:5000')) {
      try {
        const newUrl = input.url.replace('localhost:5000', `${hostname}:5000`);
        input = new Request(newUrl, input);
      } catch (e) {
        console.warn('Failed to rewrite Request object URL:', e);
      }
    }
  }
  return originalFetch(input, init);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

