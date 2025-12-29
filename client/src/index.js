import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import { LocationProvider } from './context/LocationContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
