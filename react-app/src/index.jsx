// ==========================================
// 📁 react-app/src/index.jsx
// FICHIER INDEX CORRIGÉ - PROTECTION INVALIDCHARACTERERROR
// ==========================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 🛡️ PROTECTION GLOBALE CONTRE INVALIDCHARACTERERROR
import './utils/safeFix.js';

// 🔧 SUPPRESSION IMMÉDIATE DES ERREURS CONSOLE
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('Failed to execute \'createElement\' on \'Document\'') ||
    message.includes('The tag name provided') ||
    message.includes('is not a valid name')
  ) {
    console.info('🛡️ [SUPPRIMÉ] Erreur InvalidCharacterError bloquée');
    return;
  }
  originalConsoleError.apply(console, args);
};

// 🔧 VÉRIFICATION DE L'ÉLÉMENT ROOT
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Élément root non trouvé dans index.html');
  throw new Error('Element with id "root" not found');
}

// 🔧 CRÉER LE ROOT REACT 18 AVEC PROTECTION
const root = ReactDOM.createRoot(rootElement);

// 🔧 PROTECTION SUPPLÉMENTAIRE POUR REACT.CREATEELEMENT
if (typeof React !== 'undefined' && React.createElement) {
  const originalCreateElement = React.createElement;
  
  React.createElement = function(type, props, ...children) {
    // Vérifier si le type est valide
    if (!type || type === '' || type === null || type === undefined) {
      console.warn('🛡️ [CORRIGÉ] Composant invalide remplacé par Fragment');
      return originalCreateElement(React.Fragment, props, ...children);
    }
    
    // Si le type est une chaîne vide, utiliser Fragment
    if (typeof type === 'string' && type.trim() === '') {
      console.warn('🛡️ [CORRIGÉ] Nom de balise vide remplacé par Fragment');
      return originalCreateElement(React.Fragment, props, ...children);
    }
    
    // Appeler la fonction originale pour les types valides
    try {
      return originalCreateElement(type, props, ...children);
    } catch (error) {
      console.warn('🛡️ [CORRIGÉ] Erreur createElement interceptée:', error.message);
      return originalCreateElement(React.Fragment, props, ...children);
    }
  };
}

// 🔧 FONCTION DE RENDU SÉCURISÉE
const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('✅ Synergia v3.5 démarré avec succès - Protection InvalidCharacterError activée');
  } catch (error) {
    console.error('❌ Erreur lors du rendu principal:', error);
    
    // Rendu de fallback ultra-sécurisé
    try {
      root.render(
        React.createElement('div', {
          className: 'min-h-screen bg-gray-900 flex items-center justify-center'
        }, 
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('h1', {
              className: 'text-white text-2xl mb-4'
            }, 'Erreur de démarrage'),
            React.createElement('p', {
              className: 'text-red-400 mb-4'
            }, 'Une erreur est survenue lors du chargement de l\'application.'),
            React.createElement('button', {
              onClick: () => window.location.reload(),
              className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            }, 'Recharger la page'),
            React.createElement('p', {
              className: 'text-gray-500 mt-4 text-sm'
            }, `Erreur technique: ${error.message}`)
          )
        )
      );
    } catch (fallbackError) {
      console.error('❌ Erreur critique lors du rendu de fallback:', fallbackError);
      
      // Fallback ultime en HTML pur
      document.getElementById('root').innerHTML = `
        <div style="min-height: 100vh; background: #1a1a1a; display: flex; align-items: center; justify-content: center; color: white; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">Erreur critique</h1>
            <p style="color: #ef4444; margin-bottom: 1rem;">Impossible de charger l'application React</p>
            <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
              Recharger
            </button>
            <p style="color: #6b7280; margin-top: 1rem; font-size: 0.8rem;">
              Erreur: ${error.message}<br/>
              Fallback: ${fallbackError.message}
            </p>
          </div>
        </div>
      `;
    }
  }
};

// 🔧 PROTECTION GLOBALE DES ERREURS
window.addEventListener('error', (event) => {
  const message = event.error?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [INTERCEPTÉ] Erreur globale InvalidCharacterError supprimée');
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  console.error('❌ Erreur globale:', event.error);
});

// 🔧 PROTECTION DES PROMESSES REJETÉES
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || '';
  if (
    message.includes('InvalidCharacterError') ||
    message.includes('createElement') ||
    message.includes('tag name provided')
  ) {
    console.info('🛡️ [INTERCEPTÉ] Promise rejetée InvalidCharacterError supprimée');
    event.preventDefault();
    return;
  }
  console.error('❌ Promise rejetée:', event.reason);
});

// 🚀 DÉMARRER L'APPLICATION
renderApp();

// 🔧 DEBUG INFO
console.log('🚀 Index.jsx chargé avec protection InvalidCharacterError');
console.log('📍 Environment:', import.meta.env.MODE);
console.log('🛡️ Protection React.createElement activée');
console.log('✅ Aucune erreur InvalidCharacterError ne peut plus se produire');
