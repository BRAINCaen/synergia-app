// ==========================================
// 📁 react-app/src/App.jsx
// VERSION SÉCURISÉE - SANS IMPORTS MANQUANTS
// ==========================================

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔐 AuthStore
import { useAuthStore } from './shared/stores/authStore.js';

// 🎯 Routes
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

// 🏗️ Layout
import DashboardLayout from './layouts/DashboardLayout.jsx';

// 📄 Pages principales - SEULEMENT CELLES QUI EXISTENT
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

console.log('🚀 SYNERGIA v3.5.3 - VERSION SÉCURISÉE');

/**
 * 🚀 APPLICATION PRINCIPALE SYNERGIA - VERSION SÉCURISÉE
 */
function App() {
  const { initializeAuth, isAuthenticated, user, loading } = useAuthStore();

  useEffect(() => {
    console.log('🔄 Initialisation de l\'authentification...');
    initializeAuth();
  }, [initializeAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Route publique - Login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Routes protégées avec layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Routes principales */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Routes avec pages de placeholder */}
          <Route path="tasks" element={<PlaceholderPage title="Tâches" icon="✅" />} />
          <Route path="projects" element={<PlaceholderPage title="Projets" icon="📁" />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" icon="📊" />} />
          <Route path="gamification" element={<PlaceholderPage title="Gamification" icon="🎮" />} />
          <Route path="badges" element={<PlaceholderPage title="Badges" icon="🏆" />} />
          <Route path="leaderboard" element={<PlaceholderPage title="Classement" icon="🥇" />} />
          <Route path="team" element={<PlaceholderPage title="Équipe" icon="👥" />} />
          <Route path="users" element={<PlaceholderPage title="Utilisateurs" icon="👤" />} />
          <Route path="onboarding" element={<PlaceholderPage title="Onboarding" icon="🚀" />} />
          <Route path="timetrack" element={<PlaceholderPage title="Time Tracking" icon="⏱️" />} />
          <Route path="profile" element={<PlaceholderPage title="Profil" icon="👤" />} />
          <Route path="settings" element={<PlaceholderPage title="Paramètres" icon="⚙️" />} />
          <Route path="rewards" element={<PlaceholderPage title="Récompenses" icon="🎁" />} />
          
          {/* Routes admin */}
          <Route path="admin/task-validation" element={<PlaceholderPage title="Validation Admin" icon="🛡️" />} />
          <Route path="admin/complete-test" element={<PlaceholderPage title="Test Admin" icon="🔧" />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * 📄 COMPOSANT PLACEHOLDER POUR LES PAGES EN COURS
 */
function PlaceholderPage({ title, icon }) {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-600 mb-6">
            Cette page est en cours de développement dans Synergia v3.5
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Fonctionnalité reconnectée !</strong><br />
              Cette page sera bientôt disponible avec toutes ses fonctionnalités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
