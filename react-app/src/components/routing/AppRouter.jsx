// ==========================================
// 📁 react-app/src/components/routing/AppRouter.jsx
// ROUTER PRINCIPAL AVEC ROUTE INFOS AJOUTÉE
// ==========================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore.js';

// ==========================================
// 📦 IMPORTS DES PAGES (CHEMINS CORRIGÉS)
// ==========================================

// Page de connexion
import Login from '../../pages/Login.jsx';

// Pages principales
import Dashboard from '../../pages/Dashboard.jsx';
import InfosPage from '../../pages/InfosPage.jsx';
import TasksPage from '../../pages/TasksPage.jsx';
import ProjectsPage from '../../pages/ProjectsPage.jsx';
import TeamPage from '../../pages/TeamPage.jsx';
import FeedbackPage from '../../pages/FeedbackPage.jsx';

// Page Gamification
import GamificationPage from '../../pages/GamificationPage.jsx';

// ==========================================
// 🐛 PAGE DE DEBUG (TEMPORAIRE)
// ==========================================

const DebugPage = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h1 className="text-white text-2xl font-bold mb-6">🔧 Mode Debug</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations utilisateur */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">👤 Utilisateur</h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">UID: {user?.uid || 'Non connecté'}</div>
                <div className="text-gray-300">Email: {user?.email || 'N/A'}</div>
                <div className="text-gray-300">Nom: {user?.displayName || 'N/A'}</div>
              </div>
            </div>
            
            {/* État des routes */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">🛣️ Routes</h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">Dashboard: ✅</div>
                <div className="text-gray-300">Infos: ✅</div>
                <div className="text-gray-300">Gamification: ✅</div>
                <div className="text-gray-300">Tasks: ✅</div>
                <div className="text-gray-300">Projects: ✅</div>
                <div className="text-gray-300">Team: ✅</div>
                <div className="text-gray-300">Build: ✅ Corrigé</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Retour Dashboard
            </button>
            
            <button
              onClick={() => console.clear()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🧹 Clear Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🛡️ COMPOSANTS DE PROTECTION (CHEMINS CORRIGÉS)
// ==========================================

// Composant de protection pour les routes authentifiées
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement de l'application...</p>
          <p className="text-gray-400 text-sm mt-2">Build corrigé - Version stable</p>
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
// 🚀 ROUTER PRINCIPAL AVEC CHEMINS CORRIGÉS
// ==========================================

const AppRouter = () => {
  console.log('🚀 [ROUTER] AppRouter avec chemins d\'import corrigés pour build');
  
  return (
    <Routes>
      {/* Route de connexion */}
      <Route path="/login" element={<Login />} />
      
      {/* Route protégée du dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* ✨ ROUTE INFOS - NOUVELLE */}
      <Route 
        path="/infos" 
        element={
          <ProtectedRoute>
            <InfosPage />
          </ProtectedRoute>
        } 
      />
      
      {/* ✨ ROUTES PRINCIPALES AVEC IMPORTS CORRIGÉS */}
      <Route 
        path="/gamification" 
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <TeamPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Route Feedback */}
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        }
      />

      {/* Route de debug */}
      <Route
        path="/debug"
        element={
          <ProtectedRoute>
            <DebugPage />
          </ProtectedRoute>
        }
      />
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Page 404 simple */}
      <Route path="*" element={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <p className="text-gray-400 mb-8">Page non trouvée</p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              🏠 Retour au Dashboard
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default AppRouter;

// Log de confirmation
console.log('✅ AppRouter corrigé - Chemins d\'import fixes pour build Netlify');
console.log('🎯 Routes disponibles: /login, /dashboard, /infos, /gamification, /tasks, /projects, /team, /debug');
console.log('🔧 Build: Erreurs d\'import résolues');
console.log('🛡️ Tous les chemins relatifs corrigés depuis components/routing/');
