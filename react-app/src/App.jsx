// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL VERSION STABLE D'URGENCE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ==========================================
// 🚨 CORRECTIF D'URGENCE UNIFIÉ (USERS + ROLES)
// ==========================================
import './core/emergencyFixUnified.js';

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
// 🧠 NAVIGATION (si elle existe)
// ==========================================
let Navigation = null;
try {
  Navigation = require('./shared/components/Navigation.jsx').default;
} catch (error) {
  console.warn('⚠️ Navigation component non trouvé, utilisation du fallback');
}

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
// 🧩 NAVIGATION FALLBACK SIMPLE
// ==========================================
const SimpleNavigation = () => (
  <nav className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between h-16">
        <div className="flex items-center space-x-8">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">Synergia</span>
          </div>
          <div className="flex space-x-4">
            <a href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm">Dashboard</a>
            <a href="/tasks" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm">Tâches</a>
            <a href="/projects" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm">Projets</a>
            <a href="/team" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm">Équipe</a>
            <a href="/gamification" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm">Gamification</a>
          </div>
        </div>
        <div className="flex items-center">
          <button className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm">
            Profil
          </button>
        </div>
      </div>
    </div>
  </nav>
);

/**
 * 🏠 COMPOSANT APP PRINCIPAL - VERSION STABLE
 */
const App = () => {
  const { user, isAuthenticated, loading, initializeAuth } = useAuthStore();

  // ⚡ Initialisation simple au montage
  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.3 - MODE STABLE D\'URGENCE');
    
    const init = async () => {
      try {
        if (initializeAuth) {
          await initializeAuth();
        } else {
          console.warn('⚠️ initializeAuth non disponible');
        }
      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
      }
    };
    
    init();
  }, [initializeAuth]);

  // 🔄 État de chargement simple
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  // 🔐 Redirection si non authentifié
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // 🎯 App principale pour utilisateurs authentifiés
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation - utilise le composant s'il existe, sinon fallback */}
        {Navigation ? <Navigation /> : <SimpleNavigation />}
        
        <main className="py-6">
          <AnimatePresence mode="wait">
            <Routes>
              {/* 🏠 Pages principales */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* 🏆 Pages Gamification */}
              <Route path="/gamification" element={<GamificationPage />} />

              {/* 🔐 Pages Système */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
};

// Exposer des fonctions debug simples
if (typeof window !== 'undefined') {
  window.forceReload = () => {
    console.log('🔄 Rechargement forcé...');
    window.location.reload();
  };
  
  window.emergencyClean = () => {
    console.log('🧹 Nettoyage d\'urgence...');
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(() => window.location.reload(), 1000);
  };
  
  console.log('✅ Fonctions debug disponibles: forceReload(), emergencyClean()');
}

export default App;
