// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL AVEC CORRECTIF D'URGENCE USERS
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ==========================================
// 🚨 CORRECTIF D'URGENCE FIRST!
// ==========================================
import './core/emergencyFix.js';

// ==========================================
// 🔧 STORES ET SERVICES CORE
// ==========================================
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import userResolverService from './core/services/userResolverService.js';
import weeklyRecurrenceService from './core/services/weeklyRecurrenceService.js';
import recurrenceSchedulerService from './core/services/recurrenceSchedulerService.js';

// ==========================================
// 🎭 PAGES PRINCIPALES - CHEMINS CORRIGÉS
// ==========================================
import LoginPage from './pages/Login.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// ==========================================
// 🏆 PAGES GAMIFICATION - CHEMINS CORRIGÉS
// ==========================================
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN - CHEMINS CORRIGÉS
// ==========================================
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';
import {
  AdminObjectiveValidationPage,
  AdminRolePermissionsPage,
  AdminRewardsPage,
  AdminBadgesPage,
  AdminUsersPage,
  AdminAnalyticsPage,
  AdminSettingsPage,
  AdminDemoCleanerPage,
  AdminCompleteTestPage
} from './pages/RoleProgressionPage.jsx';

// ==========================================
// 📊 PAGES ANALYTICS ET ADMIN
// ==========================================
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AdminAnalyticsPageStandalone from './pages/AdminAnalyticsPage.jsx';

// ==========================================
// 🧠 NAVIGATION INTELLIGENTE
// ==========================================
import Navigation from './shared/components/Navigation.jsx';

// ==========================================
// 🛠️ UTILS & HELPERS
// ==========================================
import NotFound from './pages/NotFound.jsx';

// Initialisation des services en mode stable
const initializeAllServices = async () => {
  try {
    console.log('🚀 Initialisation services...');
    
    // 1. AuthStore (priorité absolue)
    await initializeAuthStore();
    console.log('✅ AuthStore initialisé');
    
    // 2. Services de base
    userResolverService.initialize();
    console.log('✅ UserResolverService initialisé');
    
    // 3. Services de récurrence (nouveau)
    weeklyRecurrenceService.initialize();
    console.log('📅 WeeklyRecurrenceService initialisé');
    
    recurrenceSchedulerService.initialize();
    console.log('⏰ RecurrenceSchedulerService initialisé');
    
    console.log('🎯 Tous les services sont prêts !');
    
  } catch (error) {
    console.error('❌ Erreur initialisation services:', error);
  }
};

/**
 * 🏠 COMPOSANT APP PRINCIPAL
 */
const App = () => {
  const { user, isAuthenticated, loading, initializeAuth } = useAuthStore();

  // ⚡ Initialisation au montage
  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.3 - MODE STABLE');
    console.log('✅ Service Worker désactivé définitivement');
    console.log('🧹 Nettoyage automatique terminé');
    
    const init = async () => {
      try {
        await initializeAuth();
        await initializeAllServices();
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
      }
    };
    
    init();
  }, [initializeAuth]);

  // 🔄 État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de Synergia...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        <main className="flex-1 p-6">
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
                <Route path="/badges" element={<BadgesPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/progression" element={<RoleProgressionPage />} />
                <Route path="/escape-progression" element={<EscapeProgressionPage />} />

                {/* 🛡️ Pages Admin */}
                <Route path="/admin/validation" element={<AdminTaskValidationPage />} />
                <Route path="/admin/test" element={<CompleteAdminTestPage />} />
                <Route path="/admin/objectives" element={<AdminObjectiveValidationPage />} />
                <Route path="/admin/roles" element={<AdminRolePermissionsPage />} />
                <Route path="/admin/rewards" element={<AdminRewardsPage />} />
                <Route path="/admin/badges" element={<AdminBadgesPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPageStandalone />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/demo-cleaner" element={<AdminDemoCleanerPage />} />
                <Route path="/admin/complete-test" element={<AdminCompleteTestPage />} />

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

  // Exposer des fonctions debug utiles
if (typeof window !== 'undefined') {
  window.forceReload = () => {
    console.log('🔄 Rechargement forcé...');
    window.location.reload();
  };
  
  window.emergencyClean = () => {
    console.log('🧹 Nettoyage d\'urgence...');
    localStorage.clear();
    sessionStorage.clear();
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    setTimeout(() => window.location.reload(), 1000);
  };
  
  console.log('✅ Fonctions debug: forceReload(), emergencyClean()');
}

export default App;
