// ==========================================
// 📁 react-app/src/index.jsx
// 🚨 INDEX MINIMAL POUR TESTER LE DÉMARRAGE
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

console.log('🚨 [INDEX] Démarrage index.jsx minimal');

// Vérification élément root
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [FATAL] Élément root non trouvé !');
  document.body.innerHTML = `
    <div style="
      height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: #dc2626; 
      color: white; 
      font-family: Arial;
      text-align: center;
    ">
      <div>
        <h1>❌ ERREUR FATALE</h1>
        <p>Élément 'root' manquant dans index.html</p>
        <p>Vérifiez le fichier index.html</p>
      </div>
    </div>
  `;
  throw new Error('Root element not found');
}

console.log('✅ [INDEX] Élément root trouvé:', rootElement);

// Créer le root React 18
let root;
try {
  root = ReactDOM.createRoot(rootElement);
  console.log('✅ [INDEX] Root React créé');
} catch (error) {
  console.error('❌ [FATAL] Erreur création root:', error);
  throw error;
}

// Fonction de rendu ultra-sécurisée
const renderApp = () => {
  try {
    console.log('🚀 [INDEX] Tentative de rendu App...');
    
    root.render(<App />);
    
    console.log('✅ [INDEX] App rendu avec succès !');
    
    // Test après 1 seconde
    setTimeout(() => {
      const appRendered = document.querySelector('div');
      if (appRendered) {
        console.log('✅ [INDEX] App confirmé dans le DOM');
      } else {
        console.error('❌ [INDEX] App non trouvé dans le DOM');
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ [FATAL] Erreur rendu App:', error);
    
    // Fallback HTML pur
    document.body.innerHTML = `
      <div style="
        height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: linear-gradient(135deg, #dc2626, #7f1d1d); 
        color: white; 
        font-family: Arial;
        text-align: center;
      ">
        <div>
          <h1>🚨 ERREUR REACT</h1>
          <p>Impossible de rendre l'application React</p>
          <p><strong>Erreur:</strong> ${error.message}</p>
          <button onclick="window.location.reload()" style="
            padding: 10px 20px; 
            margin-top: 20px; 
            background: white; 
            color: #dc2626; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
          ">
            🔄 Recharger
          </button>
        </div>
      </div>
    `;
  }
};

// Démarrer
console.log('🎬 [INDEX] Lancement du rendu...');
renderApp();

// Gestion erreurs globales
window.addEventListener('error', (event) => {
  console.error('❌ [GLOBAL] Erreur JavaScript:', event.error);
  console.error('📍 [GLOBAL] Fichier:', event.filename);
  console.error('📍 [GLOBAL] Ligne:', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [GLOBAL] Promise rejetée:', event.reason);
});

console.log('🏁 [INDEX] Index.jsx initialisé');
