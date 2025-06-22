// src/routes/index.jsx - ROUTES COMPLÈTES AVEC GAMIFICATION
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../shared/stores/authStore.js';

// Pages principales
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';

// Composants de fonctionnalités
import TaskComponent from '../components/TaskComponent.jsx';

// Composants de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg">Chargement...</div>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Composant de redirection pour utilisateurs connectés
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg">Chargement...</div>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Composant de route d'administration
const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.profile?.role === 'admin';
  
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

// Composant Leaderboard simple
const LeaderboardComponent = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">🏆 Classement</h1>
          <p className="text-gray-400 mb-8">Fonctionnalité en cours de développement</p>
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-bold text-white mb-2">Bientôt disponible</h2>
            <p className="text-gray-400 mb-6">
              Le leaderboard complet sera disponible dans une prochaine mise à jour.
            </p>
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retour au Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Profil simple
const ProfileComponent = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">👤 Profil</h1>
          <p className="text-gray-400 mb-8">Gestion du profil utilisateur</p>
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-xl font-bold text-white mb-2">En cours de développement</h2>
            <p className="text-gray-400 mb-6">
              La page de gestion du profil sera disponible prochainement.
            </p>
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retour au Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Settings simple
const SettingsComponent = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">⚙️ Paramètres</h1>
          <p className="text-gray-400 mb-8">Configuration de l'application</p>
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-xl font-bold text-white mb-2">Bientôt disponible</h2>
            <p className="text-gray-400 mb-6">
              Les paramètres de l'application seront disponibles dans une prochaine version.
            </p>
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retour au Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Admin simple
const AdminComponent = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">👑 Administration</h1>
          <p className="text-gray-400 mb-8">Panneau d'administration</p>
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-6xl mb-4">🛠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Interface d'administration</h2>
            <p className="text-gray-400 mb-6">
              Les outils d'administration seront déployés dans une version ultérieure.
            </p>
            <a 
              href="/dashboard" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retour au Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
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
      
      {/* Routes protégées principales */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* 🎯 ROUTE TÂCHES - GAMIFICATION ACTIVE */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TaskComponent />
          </ProtectedRoute>
        }
      />
      
      {/* 🏆 Route Leaderboard */}
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardComponent />
          </ProtectedRoute>
        }
      />
      
      {/* 👤 Route Profil */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileComponent />
          </ProtectedRoute>
        }
      />
      
      {/* ⚙️ Route Paramètres */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsComponent />
          </ProtectedRoute>
        }
      />
      
      {/* 👑 Route Administration (Admin seulement) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminComponent />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Routes futures (placeholders) */}
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎮</div>
                <h1 className="text-2xl font-bold mb-4">Gamification</h1>
                <p className="text-gray-400 mb-6">Interface de gamification dédiée en cours de développement</p>
                <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                  Retour au Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/time"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">⏰</div>
                <h1 className="text-2xl font-bold mb-4">Suivi du Temps</h1>
                <p className="text-gray-400 mb-6">Module de time tracking en cours de développement</p>
                <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                  Retour au Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">💬</div>
                <h1 className="text-2xl font-bold mb-4">Messagerie</h1>
                <p className="text-gray-400 mb-6">Chat d'équipe en cours de développement</p>
                <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                  Retour au Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-2xl font-bold mb-4">Boutique</h1>
                <p className="text-gray-400 mb-6">Boutique de récompenses en cours de développement</p>
                <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                  Retour au Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📊</div>
                <h1 className="text-2xl font-bold mb-4">Analytics</h1>
                <p className="text-gray-400 mb-6">Tableaux de bord analytiques en cours de développement</p>
                <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
                  Retour au Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      
      {/* Route par défaut */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* Route 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-8xl mb-4">😵</div>
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <h2 className="text-xl text-gray-300 mb-6">Page introuvable</h2>
              <p className="text-gray-400 mb-8">
                La page que vous recherchez n'existe pas ou a été déplacée.
              </p>
              <div className="space-x-4">
                <a 
                  href="/dashboard" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🏠 Retour au Dashboard
                </a>
                <a 
                  href="/tasks" 
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  🎯 Mes Tâches
                </a>
              </div>
              
              {/* Liens utiles */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-gray-500 text-sm mb-4">Liens utiles :</p>
                <div className="flex justify-center space-x-6 text-sm">
                  <a href="/leaderboard" className="text-blue-400 hover:text-blue-300">🏆 Classement</a>
                  <a href="/profile" className="text-blue-400 hover:text-blue-300">👤 Profil</a>
                  <a href="/settings" className="text-blue-400 hover:text-blue-300">⚙️ Paramètres</a>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
