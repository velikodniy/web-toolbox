import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import './index.css';
// Page-specific CSS is imported here (not in page components) because
// Deno tests import components directly and can't process CSS files.
import './pages/uuid-tool.css';
import './pages/gpx-tool.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
