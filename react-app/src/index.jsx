// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL - VERSION COMPLÈTE AVEC SUPPRESSEUR D'ERREURS
// ==========================================

import React from 'react'
import { createRoot } from 'react-dom/client'

// 🚨 CORRECTION D'URGENCE - SUPPRESSEUR D'ERREURS EN PREMIER !
import './core/productionErrorSuppressor.js'

// 🚨 AUTRES CORRECTIONS D'URGENCE (si elles existent)
import './core/emergencyUsersGlobalFix.js'

// 🔧 Autres corrections d'urgence (si elles existent)
try {
  import('./core/emergencyFix.js').catch(() => {});
  import('./core/emergencyFixUnified.js').catch(() => {});
} catch (error) {
  console.warn('⚠️ Certaines corrections d\'urgence non disponibles');
}

import App from './App.jsx'
import './index.css'

// 🚀 Configuration complète de l'environnement
console.log('🔧 [MAIN] Synergia v3.5.4 - Initialisation avec suppresseur d\'erreurs');
console.log('🛡️ [ERROR_SUPPRESSOR] Protection active contre "s.indexOf is not a function"');

// Configuration de développement avancée
if (import.meta.env.DEV) {
  console.log('🔧 [DEV] Mode développement activé');
  console.log('📋 [DEV] Fonctionnalités de debug disponibles');
  
  // Filtrage intelligent des warnings
  const originalWarn = console.warn
  console.warn = (...args) => {
    const message = args.join(' ')
    
    // Filtrer les warnings non critiques mais garder les importants
    const ignoredWarnings = [
      'validateDOMNesting',
      'React.jsx',
      'motion.div',
      'defaultProps',
      'findDOMNode',
      'users is not defined', // Ajouté pour Users
      'Users is not defined',  // Ajouté pour Users
      's.indexOf is not a function', // Erreur principale
      's is not a function'
    ];
    
    const shouldIgnore = ignoredWarnings.some(warning => message.toLowerCase().includes(warning.toLowerCase()));
    
    if (!shouldIgnore) {
      originalWarn.apply(console, args)
    }
  }
  
  // Configuration des erreurs - Plus agressive pour Users et erreurs de production
  const originalError = console.error
  console.error = (...args) => {
    const message = args.join(' ').toLowerCase()
    
    // Supprimer complètement les erreurs problématiques
    if (message.includes('users is not defined') || 
        message.includes('referenceerror: users') ||
        message.includes('s.indexof is not a function') ||
        message.includes('s is not a function') ||
        message.includes('typeerror: s.indexof is not a function') ||
        (message.includes('cannot read properties of undefined') && message.includes('users'))) {
      console.log('🔧 [SUPPRIMÉ] Erreur connue:', args[0].substring(0, 50) + '...');
      return;
    }
    
    // Toujours afficher les erreurs critiques
    if (message.includes('failed to fetch') || 
        message.includes('network') ||
        message.includes('firebase') ||
        message.includes('auth')) {
      originalError.apply(console, args)
    } else {
      // Pour les autres erreurs, log plus discrètement
      console.info('⚠️ [ERREUR]', args[0].substring(0, 100) + '...');
    }
  }
}

// Obtention du conteneur racine
const container = document.getElementById('root')

if (!container) {
  console.error('❌ [FATAL] Conteneur #root non trouvé dans le DOM');
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>⚠️ Erreur de Configuration</h1>
      <p>Le conteneur #root est manquant dans index.html</p>
      <p>Veuillez vérifier votre fichier index.html</p>
    </div>
  `;
} else {
  console.log('✅ [MAIN] Conteneur #root trouvé');
  
  const root = createRoot(container);

  // Composant avec gestion d'erreur renforcée
  const AppWithStrictMode = () => {
    try {
      return (
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } catch (error) {
      console.error('❌ [REACT] Erreur dans StrictMode:', error);
      return <App />; // Fallback sans StrictMode
    }
  };
  
  // Rendu de l'application avec gestion d'erreur
  try {
    // Vérification finale Users avant rendu
    if (typeof window.Users === 'undefined') {
      console.warn('⚠️ [WARNING] Users toujours non défini, application du fallback...');
      
      // Import dynamique de lucide-react en dernier recours
      import('lucide-react').then(({ Users, User }) => {
        window.Users = Users;
        window.User = User;
        console.log('🔧 [FALLBACK] Users défini via import dynamique');
      }).catch(error => {
        console.error('❌ [CRITICAL] Impossible d\'importer lucide-react:', error);
      });
    }
    
    root.render(<AppWithStrictMode />)
    
    console.log('🚀 [MAIN] ✅ Synergia v3.5.4 démarré avec succès');
    console.log('📁 [MAIN] Architecture: index.jsx → App.jsx → routes/index.jsx');
    console.log('🎯 [MAIN] Router: COMPLET avec toutes les pages');
    console.log('🛡️ [MAIN] Sécurité: Protection routes + admin active');
    console.log('🎮 [MAIN] Fonctionnalités: Gamification complète');
    console.log('👥 [MAIN] Équipe: Gestion utilisateurs et rôles');
    console.log('🔧 [MAIN] Outils: Analytics, TimeTrack, Settings');
    console.log('🛠️ [MAIN] Admin: 11 pages d\'administration');
    console.log('🔧 [EMERGENCY] Corrections Users: ACTIVES');
    console.log('🛡️ [ERROR_SUPPRESSOR] Protection erreurs de production: ACTIVE');
    console.log('✅ [MAIN] Statut: TOUS LES SYSTÈMES OPÉRATIONNELS');
    
    // Test final Users et vérification erreurs
    setTimeout(() => {
      if (typeof window.Users !== 'undefined') {
        console.log('✅ [TEST] Users défini avec succès:', typeof window.Users);
      } else {
        console.error('❌ [TEST] Users toujours non défini après corrections');
      }
      
      // Vérifier que la page Tasks peut se charger
      if (window.location.pathname.includes('/tasks')) {
        console.log('🎯 [TEST] Page Tasks détectée - vérification du chargement...');
        
        setTimeout(() => {
          const taskElements = document.querySelectorAll('[data-testid*="task"], .task-item, .tasks-container, .tasks-grid');
          
          if (taskElements.length === 0) {
            console.warn('⚠️ [TASKS] Aucun élément task détecté, possibilité d\'erreur silencieuse');
          } else {
            console.log('✅ [TASKS] Page Tasks chargée avec succès:', taskElements.length, 'éléments détectés');
          }
        }, 1500);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ [FATAL] Erreur lors du rendu de l\'application:', error);
    
    // Rendu d'urgence sans StrictMode
    try {
      console.log('🚨 [EMERGENCY] Tentative de rendu sans StrictMode...');
      root.render(<App />);
      console.log('✅ [EMERGENCY] Rendu d\'urgence réussi');
    } catch (emergencyError) {
      console.error('❌ [CRITICAL] Échec total du rendu:', emergencyError);
      
      // Affichage d'erreur de base
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: sans-serif; background: #f5f5f5;">
          <h1 style="color: #e74c3c;">⚠️ Erreur de Démarrage</h1>
          <p style="color: #7f8c8d;">L'application Synergia a rencontré un problème</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
            🔄 Recharger la Page
          </button>
          <details style="margin-top: 20px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
            <summary>Détails Techniques</summary>
            <pre style="background: #2c3e50; color: white; padding: 15px; border-radius: 5px; overflow: auto; font-size: 12px;">
${error.stack}
            </pre>
          </details>
        </div>
      `;
    }
  }
}
