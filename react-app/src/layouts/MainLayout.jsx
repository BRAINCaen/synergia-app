// ==========================================
// 📁 react-app/src/layouts/MainLayout.jsx
// CORRECTION : Import authStore avec bon chemin
// ==========================================

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// 🔧 CORRECTION : Chemin correct pour authStore
import { useAuthStore } from '../shared/stores/authStore';

const MainLayout = () => {
  const { user, setUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">⚡ Synergia</h1>
            
            {/* Navigation */}
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>📊</span>
                Dashboard
              </a>
              
              <a
                href="/tasks"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/tasks'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>✅</span>
                Mes Tâches
              </a>
              
              <a
                href="/projects"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/projects'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>📁</span>
                Projets
              </a>
              
              <a
                href="/gamification"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/gamification'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>🎮</span>
                Gamification
              </a>
              
              <a
                href="/profile"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>👤</span>
                Profil
              </a>
            </nav>
          </div>
          
          {/* User info et logout */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">
                    {user?.displayName || user?.email}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
