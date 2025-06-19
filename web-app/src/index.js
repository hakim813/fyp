import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { UserProvider } from './utils/UserContext'; // ⬅️ import this

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider> {/* ⬅️ wrap App with this */}
      <App />
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
