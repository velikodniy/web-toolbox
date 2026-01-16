import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import './index.css';
// CSS is imported here (not in components) because Deno tests import
// components directly and can't process CSS files.
import './components/ui/components.css';
import './features/uuid/uuid-tool.css';
import './features/gpx/gpx-tool.css';
import './features/password/password-tool.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
