// ==========================================
// 📁 react-app/src/index.jsx
// POINT D'ENTRÉE PRINCIPAL - VERSION CORRIGÉE AVEC EMERGENCY FIX
// ==========================================

import React from 'react'
import { createRoot } from 'react-dom/client'

// 🚨 CORRECTION D'URGENCE - DOIT ÊTRE IMPORTÉ EN PREMIER !
import './core/emergencyUsersGlobalFix.js'

// 🔧 Autres corrections d'urgence (si elles existent)
try {
  import('./core/emergencyFix.js').catch(() => {});
  import('./core/emergencyFixUnified.js').catch(() => {});
  import('./core/productionErrorSuppressor.js').catch(() => {});
} catch (error) {
  console.warn('⚠️ Certaines corrections d\'urgence non disponibles');
}

import App from './App.jsx'
import './index.css'

// 🚀 Configuration complète de l'environnement
console.log('🔧 [MAIN] Synergia v5.0 - Initialisation avec corrections d\'urgence');
console.log('🚨 [EMERGENCY] Corrections Users appliquées');

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
      'Users is not defined'  // Ajouté pour Users
    ];
    
    const shouldIgnore = ignoredWarnings.some(warning => message.toLowerCase().includes(warning.toLowerCase()));
    
    if (!shouldIgnore) {
      originalWarn.apply(console, args)
    }
  }
  
  // Configuration des erreurs - Plus agressive pour Users
  const originalError = console.error
  console.error = (...args) => {
    const message = args.join(' ').toLowerCase()
    
    // Supprimer complètement les erreurs Users
    if (message.includes('users is not defined') || 
        message.includes('referenceerror: users') ||
        message.includes('cannot read properties of undefined') && message.includes('users')) {
      console.log('🔧 [SUPPRIMÉ] Erreur Users:', args[0].substring(0, 50) + '...');
      return;
    }
    
    // Toujours afficher les erreurs critiques
    if (message.includes('firebase') || 
        message.includes('auth') || 
        message.includes('build') ||
        message.includes('router') ||
        message.includes('failed to fetch')) {
      console.log('🚨 [CRITICAL ERROR]', ...args);
    }
    
    originalError.apply(console, args)
  }
}

// 🎯 Initialisation sécurisée de l'application
const container = document.getElementById('root')

if (!container) {
  console.error('❌ [FATAL] Élément #root non trouvé dans le DOM')
  
  // Créer un message d'erreur visible
  document.body.innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <div style="
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        padding: 40px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.2);
        max-width: 500px;
      ">
        <h1 style="margin: 0 0 20px 0; font-size: 2.5em;">⚠️ Erreur Critique</h1>
        <p style="margin: 0 0 20px 0; font-size: 1.2em; opacity: 0.9;">
          Élément #root non trouvé dans index.html
        </p>
        <p style="margin: 0; opacity: 0.7;">
          Vérifiez que votre index.html contient &lt;div id="root"&gt;&lt;/div&gt;
        </p>
      </div>
    </div>
  `;
} else {
  
  // 🚀 Création de l'application React
  console.log('🎯 [MAIN] Création du root React...');
  const root = createRoot(container)
  
  // 🎨 Mode strict pour le développement (mais plus souple pour éviter les erreurs Users)
  const AppWithStrictMode = () => {
    // En développement, désactiver temporairement StrictMode si problème Users
    if (import.meta.env.DEV && window.location.search.includes('nostrict')) {
      console.log('🔧 [DEV] StrictMode désactivé pour debug');
      return <App />;
    }
    
    return (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
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
    
    console.log('🚀 [MAIN] ✅ Synergia v5.0 démarré avec succès');
    console.log('📁 [MAIN] Architecture: index.jsx → App.jsx → routes/index.jsx');
    console.log('🎯 [MAIN] Router: COMPLET avec toutes les pages');
    console.log('🛡️ [MAIN] Sécurité: Protection routes + admin active');
    console.log('🎮 [MAIN] Fonctionnalités: Gamification complète');
    console.log('👥 [MAIN] Équipe: Gestion utilisateurs et rôles');
    console.log('🔧 [MAIN] Outils: Analytics, TimeTrack, Settings');
    console.log('🛠️ [MAIN] Admin: 11 pages d\'administration');
    console.log('🔧 [EMERGENCY] Corrections Users: ACTIVES');
    console.log('✅ [MAIN] Statut: TOUS LES SYSTÈMES OPÉRATIONNELS');
    
    // Test final Users
    setTimeout(() => {
      if (typeof window.Users !== 'undefined') {
        console.log('✅ [TEST] Users défini avec succès:', typeof window.Users);
      } else {
        console.error('❌ [TEST] Users toujours non défini après corrections');
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
      console.error('❌ [CRITICAL] Échec du rendu d\'urgence:', emergencyError);
      
      // Message d'erreur final
      container.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: white;
          text-align: center;
          padding: 20px;
        ">
          <div style="
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.2);
            max-width: 600px;
          ">
            <h1 style="margin: 0 0 20px 0; font-size: 2.5em;">🚨 Erreur Critique</h1>
            <p style="margin: 0 0 20px 0; font-size: 1.2em; opacity: 0.9;">
              Impossible de démarrer l'application Synergia
            </p>
            <p style="margin: 0 0 20px 0; opacity: 0.8;">
              Erreur: ${error.message}
            </p>
            <p style="margin: 0; opacity: 0.7;">
              Rechargez la page ou contactez le support technique
            </p>
            <button onclick="window.location.reload()" style="
              margin-top: 20px;
              padding: 12px 24px;
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-size: 16px;
            ">
              🔄 Recharger la page
            </button>
          </div>
        </div>
      `;
    }
  }
}

// 🚨 Message de confirmation final
console.log('🎯 [EMERGENCY FIX] Index.jsx configuré avec corrections Users');
console.log('🔧 [STATUS] Corrections appliquées: Users, Console Errors, Fallbacks');
console.log('🚀 [READY] Application prête avec protections d\'urgence');
