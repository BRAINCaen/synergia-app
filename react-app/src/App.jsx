// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL SANS NAVIGATION DU HAUT - VERSION ORIGINALE RESTAURÉE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ==========================================
// 🚨 CORRECTIFS D'URGENCE COMPLETS (seuls ajouts nécessaires)
// ==========================================
import './utils/productionErrorSuppression.js';
import './utils/secureImportFix.js';

// Correctifs supplémentaires (créés si ils n'existent pas)
try {
  import('./core/emergencyFixUnified.js');
} catch (e) {
  console.log('⚠️ emergencyFixUnified.js non trouvé, continuons sans');
}

try {
  import('./core/arrayMapFix.js');
} catch (e) {
  console.log('⚠️ arrayMapFix.js non trouvé, continuons sans');
}

try {
  import('./core/assignRoleFinalFix.js');
} catch (e) {
  console.log('⚠️ assignRoleFinalFix.js non trouvé, continuons sans');
}

// ==========================================
// 🔧 STORES ET SERVICES CORE (seulement les essentiels)
// ==========================================
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';

// ==========================================
// 🎭 PAGES PRINCIPALES (imports sécurisés)
// ==========================================
import LoginPage from './pages/Login.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// ==========================================
// 🏆 PAGES GAMIFICATION
// ==========================================
import GamificationPage from './pages/GamificationPage.jsx';

// ==========================================
// 📊 PAGES ANALYTICS
// ==========================================
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// ==========================================
// 🧠 NAVIGATION (supprimée - plus besoin)
// ==========================================
let Navigation = null;
// Navigation component supprimé - plus de barre du haut !

// ==========================================
// 🛠️ PAGE 404 SIMPLE
// ==========================================
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Page non trouvée</p>
      <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Retour à l'accueil
      </a>
    </div>
  </div>
);

// ==========================================
// 🛡️ COMPOSANT DE PROTECTION
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de l'application...</p>
          <p className="text-gray-400 text-sm mt-2">Synergia v3.5.3 - Version stable</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ==========================================
// 🚀 COMPOSANT APP PRINCIPAL
// ==========================================
const App = () => {
  const { loading, initialize } = useAuthStore();

  // 🔥 INITIALISATION AU MONTAGE
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 [APP] Initialisation Synergia v3.5.3...');
        
        // Initialiser le store d'authentification
        await initializeAuthStore();
        await initialize();
        
        console.log('✅ [APP] Initialisation terminée');
      } catch (error) {
        console.error('❌ [APP] Erreur initialisation:', error);
      }
    };

    initApp();
  }, [initialize]);

  // 🔄 AFFICHAGE DE CHARGEMENT GLOBAL
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
          <h1 className="text-white text-2xl font-bold mb-2">Synergia v3.5.3</h1>
          <p className="text-gray-400">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app min-h-screen">
        
        {/* SUPPRESSION COMPLÈTE DE LA NAVIGATION DU HAUT */}
        {/* Plus de SimpleNavigation ni de Navigation component ! */}
        
        <AnimatePresence mode="wait">
          <Routes>
            {/* 🔐 Route de connexion */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* 🏠 Route principale - Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 🎮 Route gamification */}
            <Route 
              path="/gamification" 
              element={
                <ProtectedRoute>
                  <GamificationPage />
                </ProtectedRoute>
              } 
            />
            
            {/* ✅ Route tâches */}
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 📁 Route projets */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 👥 Route équipe */}
            <Route 
              path="/team" 
              element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 📊 Route analytics */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 👤 Route profil */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* 🏆 Route récompenses */}
            <Route 
              path="/rewards" 
              element={
                <ProtectedRoute>
                  <GamificationPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 🔄 Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 🚫 Page 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;

// ==========================================
// 🎉 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ [APP] Version sans navigation du haut chargée');
console.log('🚫 [APP] SimpleNavigation supprimée');
console.log('🎯 [APP] Interface full screen activée');
console.log('🍔 [APP] Navigation via menu hamburger uniquement');
