import React from 'react';
import './style.css';


import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // 👈 ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* 👈 WRAP THE APP */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);



reportWebVitals();
