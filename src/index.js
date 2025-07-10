import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// No necesitas importar CSS aquí porque ya se importa en App.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);