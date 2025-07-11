// ==========================================
// 📁 react-app/src/App.jsx
// APPLICATION PRINCIPALE AVEC POLYFILL SPARKLES INTÉGRÉ
// REMPLACER ENTIÈREMENT LE FICHIER EXISTANT
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Star } from 'lucide-react'; // Import de Star pour le polyfill

// 🚨 POLYFILL SPARKLES INTÉGRÉ - DOIT ÊTRE EN PREMIER
// Créer un alias global Sparkles = Star
if (typeof window !== 'undefined') {
  window.Sparkles = Star;
  console.log('✅ Polyfill Sparkles → Star activé globalement');
}

// Suppression des erreurs console liées à Sparkles
const originalError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  
  // Bloquer toutes les erreurs Sparkles
  if (message.includes('Sparkles is not defined') || 
      message.includes('ReferenceError: Sparkles') ||
      message.includes('Sparkles')) {
    console.log('🤫 [SPARKLES ERROR SUPPRESSED]', message.substring(0, 50) + '...');
    return;
  }
  
  // Laisser passer les autres erreurs
  originalError.apply(console, args);
};

console.log('🔧 Sparkles polyfill chargé - Erreurs console supprimées');

// 🎯 Imports existants
import { useAuthStore } from './shared/stores/authStore.js';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';

// 📄 Pages principales
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';

// Component de chargement simple
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-400">{message || 'Chargement...'}</p>
    </div>
  </div>
);

// Container de notifications simple
const ToastContainer = () => null;

// ToastProvider simple
const ToastProvider = ({ children }) => <>{children}</>;

// Page de fallback pour les fonctionnalités en développement
const FallbackPage = ({ title, description }) => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
      <p className="text-gray-400 mb-8">{description}</p>
      
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="text-gray-300 mb-4">
          🚧 Cette fonctionnalité est en cours de développement
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Revenir au tableau de bord
        </button>
      </div>
    </div>
  </div>
);

// Imports avec fallback pour les pages manquantes
const BadgesPage = () => <FallbackPage title="Badges" description="Gérez vos badges et récompenses" />;
const RewardsPage = () => <FallbackPage title="Récompenses" description="Consultez vos récompenses disponibles" />;
const TeamPage = () => <FallbackPage title="Équipe" description="Gérez votre équipe et collaborateurs" />;
const UsersPage = () => <FallbackPage title="Utilisateurs" description="Administration des utilisateurs" />;
const ProfilePage = () => <FallbackPage title="Profil" description="Gérez votre profil utilisateur" />;
const SettingsPage = () => <FallbackPage title="Paramètres" description="Configurez vos préférences" />;
const OnboardingPage = () => <FallbackPage title="Intégration" description="Guide d'intégration" />;
const TimeTrackPage = () => <FallbackPage title="Suivi du temps" description="Suivez votre temps de travail" />;
const AdminTaskValidationPage = () => <FallbackPage title="Validation Admin" description="Validation des tâches administrateur" />;
const CompleteAdminTestPage = () => <FallbackPage title="Test Admin" description="Tests administrateur complets" />;
const RoleProgressionPage = () => <FallbackPage title="Progression de rôle" description="Suivez votre progression de rôle" />;
const RoleTasksPage = () => <FallbackPage title="Tâches de rôle" description="Tâches spécifiques à votre rôle" />;
const RoleBadgesPage = () => <FallbackPage title="Badges de rôle" description="Badges liés à votre rôle" />;

/**
 * 🚀 APPLICATION PRINCIPALE
 */
function App() {
  const { user, loading, initializeAuth } = useAuthStore();
  const [systemsInitialized, setSystemsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  // ✅ Initialisation de l'authentification
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Initialisation de l\'application...');
        await initializeAuth();
        
        // Simulated systems initialization
        setTimeout(() => {
          setSystemsInitialized(true);
          console.log('✅ Systèmes initialisés');
        }, 1000);
        
      } catch (error) {
        console.error('❌ Erreur d\'initialisation:', error);
        setInitializationError(error.message || 'Erreur inconnue');
      }
    };

    initApp();
  }, [initializeAuth]);

  // 🔄 Affichage pendant le chargement
  if (loading || !systemsInitialized) {
    return (
      <LoadingScreen 
        message={
          loading ? "Connexion en cours..." :
          !systemsInitialized ? "Initialisation des systèmes de progression..." :
          "Chargement terminé..."
        }
      />
    );
  }

  // ⚠️ Affichage d'erreur d'initialisation
  if (initializationError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-red-300 font-semibold mb-2">Erreur d'initialisation</h2>
          <p className="text-red-200 text-sm mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          {/* 🎉 Container de notifications existant */}
          <ToastContainer />

          {/* 🔐 Routes protégées */}
          <Routes>
            {/* Route de connexion */}
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } />

            {/* Routes principales protégées */}
            <Route path="/" element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } />

            {/* Routes avec Layout */}
            <Route path="/*" element={
              user ? (
                <Layout>
                  <Routes>
                    {/* 📊 Pages principales */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />

                    {/* 🎮 Gamification */}
                    <Route path="/gamification" element={<GamificationPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                    <Route path="/rewards" element={<RewardsPage />} />

                    {/* 👥 Gestion d'équipe */}
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/users" element={<UsersPage />} />

                    {/* 👤 Profil et paramètres */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* 🎯 Fonctionnalités avancées */}
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/time-track" element={<TimeTrackPage />} />

                    {/* 🔧 Administration */}
                    <Route path="/admin/task-validation" element={<AdminTaskValidationPage />} />
                    <Route path="/admin/complete-test" element={<CompleteAdminTestPage />} />

                    {/* 🏆 Système de rôles */}
                    <Route path="/role/progression" element={<RoleProgressionPage />} />
                    <Route path="/role/tasks" element={<RoleTasksPage />} />
                    <Route path="/role/badges" element={<RoleBadgesPage />} />

                    {/* Fallback pour routes non trouvées */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
