// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL CORRIGÉ POUR BUILD
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ✅ CORRECTION CRITIQUE - Chemin Firebase corrigé
import './core/firebase.js'; // Import Firebase pour initialisation
import App from './App.jsx';
import './index.css';

// Suppressions d'erreurs pour production
import './core/networkErrorSuppression.js';

// Initialisation React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

console.log('🚀 Index.jsx chargé - Synergia v3.5');
console.log('📍 Environment:', import.meta.env.MODE);

// ==========================================
// 🔧 ALTERNATIVE - Si le problème persiste
// ==========================================

/*
Si l'erreur continue, créez ce fichier exact :
react-app/src/index.jsx

ET vérifiez que ces fichiers existent :
- react-app/src/core/firebase.js
- react-app/src/App.jsx
- react-app/src/index.css

SI firebase.js n'existe pas, créez-le avec :
*/

// ==========================================
// 📁 react-app/src/core/firebase.js
// CONFIGURATION FIREBASE MINIMALE POUR BUILD
// ==========================================
/*
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

console.log('✅ Firebase initialisé');
*/

// ==========================================
// 📁 react-app/src/App.jsx  
// APP PRINCIPAL MINIMAL POUR BUILD
// ==========================================
/*
import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Synergia v3.5</h1>
        <p>Application en cours de chargement...</p>
      </header>
    </div>
  );
}

export default App;
*/
