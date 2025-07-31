// ==========================================
// 📁 react-app/src/App.jsx
// VERSION SANS IMPORTS PROBLÉMATIQUES - CORRECTION TIMEOUT
// ==========================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ❌ SUPPRIMÉ - CAUSE PROBABLE DU TIMEOUT
// import './utils/secureImportFix.js';
// import './utils/safeFix.js';

// 🔧 SEULEMENT L'ESSENTIEL
import { useAuthStore } from './shared/stores/authStore.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// ✅ PAGES DE BASE SEULEMENT - PAS LES NOUVELLES PAGES PROBLÉMATIQUES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';

// ❌ TEMPORAIREMENT SUPPRIMÉ - CONTIENT POTENTIELLEMENT DES IMPORTS PROBLÉMATIQUES
// import AnalyticsPage from './pages/AnalyticsPage.jsx';
// import GamificationPage from './pages/GamificationPage.jsx';

// ✅ PAGES SIMPLES SANS DÉPENDANCES COMPLEXES
import TeamPage from './pages/TeamPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// ❌ TOUTES LES PAGES ADMIN SUPPRIMÉES TEMPORAIREMENT
// Elles contiennent potentiellement des imports qui causent le timeout

/**
 * 🚀 APPLICATION PRINCIPALE - VERSION DÉBOGAGE TIMEOUT
 * Imports réduits au minimum pour identifier la cause du timeout
 */
function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 🔓 Route publique */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          
          {/* 📊 Routes de base uniquement */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/tasks" 
            element={<ProtectedRoute><TasksPage /></ProtectedRoute>} 
          />
          <Route 
            path="/projects" 
            element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} 
          />
          
          {/* ✅ Pages simples sans dépendances complexes */}
          <Route 
            path="/team" 
            element={<ProtectedRoute><TeamPage /></ProtectedRoute>} 
          />
          <Route 
            path="/users" 
            element={<ProtectedRoute><UsersPage /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} 
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} 
          />
          
          {/* 🚫 ROUTES TEMPORAIREMENT DÉSACTIVÉES POUR DEBUG TIMEOUT */}
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <div style={{
                  minHeight: '100vh',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div>
                    <h1>📊 Analytics</h1>
                    <p>Page temporairement désactivée pour résoudre les problèmes de build</p>
                    <p>Sera réactivée une fois le timeout corrigé</p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <div style={{
                  minHeight: '100vh',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <div>
                    <h1>🎮 Gamification</h1>
                    <p>Système de réclamation d'objectifs avec validation admin</p>
                    <p>En cours de développement - Page temporairement désactivée</p>
                    <div style={{
                      marginTop: '20px',
                      padding: '15px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}>
                      <p>🎯 Fonctionnalités prévues :</p>
                      <p>• Réclamation d'objectifs par les utilisateurs</p>
                      <p>• Validation par les administrateurs</p>
                      <p>• Attribution automatique des XP</p>
                      <p>• Historique des réclamations</p>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* 🔄 Redirections vers pages temporaires pour les autres routes */}
          <Route 
            path="/badges" 
            element={<Navigate to="/gamification" replace />} 
          />
          <Route 
            path="/leaderboard" 
            element={<Navigate to="/gamification" replace />} 
          />
          <Route 
            path="/rewards" 
            element={<Navigate to="/gamification" replace />} 
          />
          <Route 
            path="/role/*" 
            element={<Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/escape-progression" 
            element={<Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/onboarding" 
            element={<Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/timetrack" 
            element={<Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/admin/*" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* 🔄 Redirections par défaut */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
