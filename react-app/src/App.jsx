// ==========================================
// 📁 react-app/src/App.jsx
// APP PRINCIPAL AVEC INTÉGRATION DU SERVICE DE RÉCURRENCE HEBDOMADAIRE
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ==========================================
// 🔧 STORES ET SERVICES CORE
// ==========================================
import { useAuthStore, initializeAuthStore } from './shared/stores/authStore.js';
import userResolverService from './core/services/userResolverService.js';
import weeklyRecurrenceService from './core/services/weeklyRecurrenceService.js';
import recurrenceSchedulerService from './core/services/recurrenceSchedulerService.js';

// ==========================================
// 🎭 PAGES PRINCIPALES
// ==========================================
import LoginPage from './pages/auth/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// ==========================================
// 🏆 PAGES GAMIFICATION
// ==========================================
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import RoleProgressionPage from './pages/RoleProgressionPage.jsx';
import EscapeProgressionPage from './pages/EscapeProgressionPage.jsx';

// ==========================================
// 🛡️ PAGES ADMIN
// ==========================================
import AdminTaskValidationPage from './pages/admin/AdminTaskValidationPage.jsx';
import AdminObjectiveValidationPage from './pages/admin/AdminObjectiveValidationPage.jsx';
import AdminRolePermissionsPage from './pages/admin/AdminRolePermissionsPage.jsx';
import AdminRewardsPage from './pages/admin/AdminRewardsPage.jsx';
import AdminBadgesPage from './pages/admin/AdminBadgesPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import AdminDemoCleanerPage from './pages/admin/AdminDemoCleanerPage.jsx';
import AdminCompleteTestPage from './pages/admin/AdminCompleteTestPage.jsx';

// ==========================================
// 📊 PAGES OUTILS
// ==========================================
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// ==========================================
// 🎨 STYLES GLOBAUX
// ==========================================
import './index.css';

// ==========================================
// 🛡️ COMPOSANT DE PROTECTION DES ROUTES
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ==========================================
// 🚀 COMPOSANT APP PRINCIPAL
// ==========================================
const App = () => {
  const { isAuthenticated, loading, user } = useAuthStore();

  // ==========================================
  // 🔧 INITIALISATION UNIQUE
  // ==========================================
  useEffect(() => {
    console.log('🚀 Initialisation App principale...');
    
    // Initialiser l'AuthStore une seule fois
    initializeAuthStore();
    
    // Initialiser userResolverService globalement
    if (typeof window !== 'undefined') {
      window.userResolverService = userResolverService;
      console.log('✅ UserResolverService disponible globalement');
    }
    
    console.log('✅ App initialisée');
  }, []);

  // ==========================================
  // 📅 INITIALISATION DU SYSTÈME DE RÉCURRENCE HEBDOMADAIRE COMPLET
  // ==========================================
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      initializeRecurrenceSystem();
    }

    // Nettoyage lors de la déconnexion
    return () => {
      if (!isAuthenticated) {
        recurrenceSchedulerService.stop();
      }
    };
  }, [isAuthenticated, user?.uid]);

  const initializeRecurrenceSystem = async () => {
    try {
      console.log('📅 Initialisation système de récurrence hebdomadaire complet...');
      
      // 1. Initialiser le service de récurrence de base
      const initResult = await weeklyRecurrenceService.initialize();
      
      if (initResult.success) {
        console.log('✅ Service de récurrence hebdomadaire initialisé');
        
        // 2. Effectuer une vérification matinale
        await recurrenceSchedulerService.morningStartupCheck();
        
        // 3. Démarrer le planificateur automatique (vérification toutes les 30 minutes)
        recurrenceSchedulerService.start(30 * 60 * 1000); // 30 minutes
        
        console.log('✅ Système de récurrence complet initialisé avec succès');
        
        // 4. Programmer une vérification à minuit pour les nouveaux jours
        scheduleMidnightCheck();
        
      } else {
        console.warn('⚠️ Erreur initialisation récurrence:', initResult.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur critique initialisation récurrence:', error);
    }
  };

  const scheduleMidnightCheck = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Minuit prochain
    
    const timeToMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(async () => {
      try {
        console.log('🌙 Vérification de minuit - Nouveau jour détecté');
        await recurrenceSchedulerService.morningStartupCheck();
        
        // Reprogrammer pour le prochain minuit
        scheduleMidnightCheck();
      } catch (error) {
        console.error('❌ Erreur vérification de minuit:', error);
      }
    }, timeToMidnight);
    
    console.log(`🌙 Prochaine vérification programmée dans ${Math.round(timeToMidnight / 1000 / 60)} minutes`);
  };

  // ==========================================
  // 🔄 LOADING GLOBAL
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de Synergia...</p>
          <p className="text-blue-200 text-sm mt-2">Initialisation des services...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 📱 SYSTÈME DE ROUTING PRINCIPAL
  // ==========================================
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* 🔐 Page de connexion */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
            } 
          />

          {/* 🏠 Dashboard principal */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* ✅ Gestion des tâches avec récurrence */}
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } 
          />

          {/* 📁 Projets */}
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />

          {/* 👥 Équipe */}
          <Route 
            path="/team" 
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            } 
          />

          {/* 👨‍💼 Profil utilisateur */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
               🏆 ROUTES GAMIFICATION
               ========================================== */}

          {/* 🎮 Gamification principale */}
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <GamificationPage />
              </ProtectedRoute>
            } 
          />

          {/* 🏆 Badges */}
          <Route 
            path="/badges" 
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            } 
          />

          {/* 🥇 Classement */}
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            } 
          />

          {/* 🎁 Récompenses */}
          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            } 
          />

          {/* 🎯 Progression des rôles */}
          <Route 
            path="/role-progression" 
            element={
              <ProtectedRoute>
                <RoleProgressionPage />
              </ProtectedRoute>
            } 
          />

          {/* 🚀 Escape Progression */}
          <Route 
            path="/escape-progression" 
            element={
              <ProtectedRoute>
                <EscapeProgressionPage />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
               📊 ROUTES OUTILS
               ========================================== */}

          {/* 📊 Analytics */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />

          {/* 📚 Intégration/Onboarding */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />

          {/* ⏰ Pointeuse */}
          <Route 
            path="/timetrack" 
            element={
              <ProtectedRoute>
                <TimeTrackPage />
              </ProtectedRoute>
            } 
          />

          {/* ⚙️ Paramètres */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
               🛡️ ROUTES ADMIN
               ========================================== */}

          {/* 🛡️ Validation des tâches */}
          <Route 
            path="/admin/task-validation" 
            element={
              <ProtectedRoute>
                <AdminTaskValidationPage />
              </ProtectedRoute>
            } 
          />

          {/* 🎯 Validation des objectifs */}
          <Route 
            path="/admin/objective-validation" 
            element={
              <ProtectedRoute>
                <AdminObjectiveValidationPage />
              </ProtectedRoute>
            } 
          />

          {/* 🔐 Permissions des rôles */}
          <Route 
            path="/admin/role-permissions" 
            element={
              <ProtectedRoute>
                <AdminRolePermissionsPage />
              </ProtectedRoute>
            } 
          />

          {/* 🎁 Gestion des récompenses */}
          <Route 
            path="/admin/rewards" 
            element={
              <ProtectedRoute>
                <AdminRewardsPage />
              </ProtectedRoute>
            } 
          />

          {/* 🏆 Gestion des badges */}
          <Route 
            path="/admin/badges" 
            element={
              <ProtectedRoute>
                <AdminBadgesPage />
              </ProtectedRoute>
            } 
          />

          {/* 👥 Gestion des utilisateurs */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            } 
          />

          {/* 📈 Analytics admin */}
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            } 
          />

          {/* ⚙️ Paramètres admin */}
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <AdminSettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* 🧹 Nettoyage des données */}
          <Route 
            path="/admin/demo-cleaner" 
            element={
              <ProtectedRoute>
                <AdminDemoCleanerPage />
              </ProtectedRoute>
            } 
          />

          {/* 🧪 Test complet */}
          <Route 
            path="/admin/complete-test" 
            element={
              <ProtectedRoute>
                <AdminCompleteTestPage />
              </ProtectedRoute>
            } 
          />

          {/* ==========================================
               🔄 ROUTES PAR DÉFAUT
               ========================================== */}

          {/* Redirection racine */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
            } 
          />

          {/* Route 404 */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page introuvable</p>
                    <Navigate to="/dashboard" />
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />

        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;
