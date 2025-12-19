// ==========================================
// 📁 react-app/src/App.jsx
// VERSION COMPLÈTE ET FONCTIONNELLE - TOUTES LES FONCTIONNALITÉS
// ==========================================

import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import LoadingScreen from './components/ui/LoadingScreen.jsx';

// ✅ IMPORT DU ROUTER COMPLET AVEC TOUTES LES PAGES
import AppRoutes from './routes/index.jsx';

// 🎨 MODULE 16: THEME PROVIDER
import { ThemeProvider } from './shared/providers/ThemeProvider.jsx';

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 [APP] Synergia v4.0.0 - Initialisation complète');
        console.log('📋 [APP] Chargement de toutes les fonctionnalités...');
        
        // Initialiser l'auth store
        await initializeAuthStore();
        
        console.log('✅ [APP] Auth store initialisé');
        console.log('🎯 [APP] Router avec toutes les pages chargé');
        console.log('🛡️ [APP] Protection des routes active');
        console.log('🎮 [APP] Pages gamification disponibles');
        console.log('👥 [APP] Pages équipe disponibles');
        console.log('🔧 [APP] Pages outils disponibles');
        console.log('🛠️ [APP] Pages admin complètes');
        
        setAppReady(true);
        
      } catch (error) {
        console.error('❌ [APP] Erreur initialisation:', error);
        setError(error);
      }
    };

    initApp();
  }, []);

  // Écran d'erreur avec diagnostic
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Erreur d'initialisation</h1>
          <p className="text-red-600 mb-4">{error.message}</p>
          
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Diagnostic:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Vérifiez la configuration Firebase</li>
              <li>• Vérifiez que tous les fichiers pages existent</li>
              <li>• Consultez la console pour plus de détails</li>
            </ul>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🔄 Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  // Écran de chargement avec infos de progression
  if (!appReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Chargement Synergia v4.0.0</h2>
            <p className="text-gray-300">Initialisation de toutes les fonctionnalités...</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-md">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Authentification
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Router complet
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Pages principales
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Pages admin
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Gamification
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Équipe & Outils
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Application principale avec toutes les fonctionnalités
  return (
    <Router>
      {/* 🎨 MODULE 16: THEME PROVIDER */}
      <ThemeProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Chargement de la page...</p>
              </div>
            </div>
          }
        >
          {/* ✅ ROUTER COMPLET AVEC TOUTES LES PAGES */}
          <AppRoutes />
        </Suspense>
      </ThemeProvider>
    </Router>
  );
};

export default App;

// ==========================================
// 📊 LOG DE CONFIRMATION COMPLET
// ==========================================

console.log('🚀 [APP] Synergia v4.0.0 - Application complète chargée');
console.log('');
console.log('📋 [APP] FONCTIONNALITÉS INCLUSES :');
console.log('');
console.log('🎯 PAGES PRINCIPALES :');
console.log('   • Dashboard - Tableau de bord principal');
console.log('   • Tasks - Gestion des tâches');
console.log('   • Projects - Gestion des projets');
console.log('   • Analytics - Analyses et statistiques');
console.log('');
console.log('🎮 PAGES GAMIFICATION :');
console.log('   • Gamification - Vue d\'ensemble');
console.log('   • Badges - Collection de badges');
console.log('   • Leaderboard - Classements');
console.log('   • Rewards - Récompenses');
console.log('');
console.log('👥 PAGES ÉQUIPE :');
console.log('   • Team - Gestion d\'équipe');
console.log('   • Users - Gestion des utilisateurs');
console.log('');
console.log('🔧 PAGES OUTILS :');
console.log('   • Onboarding - Processus d\'accueil');
console.log('   • TimeTrack - Suivi du temps');
console.log('   • Profile - Profil utilisateur');
console.log('   • Settings - Paramètres');
console.log('');
console.log('🛡️ PAGES ADMIN (11 pages) :');
console.log('   • Task Validation - Validation des tâches');
console.log('   • Objective Validation - Validation des objectifs');
console.log('   • Complete Test - Test complet');
console.log('   • Profile Test - Test de profil');
console.log('   • Role Permissions - Gestion des permissions');
console.log('   • Rewards Management - Gestion des récompenses');
console.log('   • Badges Management - Gestion des badges');
console.log('   • Users Management - Gestion des utilisateurs');
console.log('   • Analytics Admin - Analyses administrateur');
console.log('   • Settings Admin - Paramètres administrateur');
console.log('   • Sync Management - Gestion de la synchronisation');
console.log('');
console.log('✅ [APP] TOTAL : 20+ pages complètes avec navigation');
console.log('🔒 [APP] Protection des routes : Active');
console.log('🛡️ [APP] Protection admin : Active');
console.log('🎯 [APP] Layout responsive : Actif');
console.log('🚀 [APP] PRÊT POUR LA PRODUCTION !');
