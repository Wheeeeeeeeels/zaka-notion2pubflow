import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('找不到根元素');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 