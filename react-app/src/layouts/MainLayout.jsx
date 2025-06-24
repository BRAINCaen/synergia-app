import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const { level, xp, nextLevelXP } = useGameStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '✅' },
    { path: '/projects', label: 'Projets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' }, // 🆕 Nouveau lien
    { path: '/leaderboard', label: 'Classement', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-white">Synergia</span>
                <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                  v3.3
                </span>
              </div>

              {/* Navigation principale */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Informations utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Barre XP */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    Niveau {level}
                  </div>
                  <div className="text-xs text-gray-400">
                    {xp} / {nextLevelXP} XP
                  </div>
                </div>
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((xp / nextLevelXP) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Menu utilisateur */}
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <img
                    src={user?.photoURL || 'https://via.placeholder.com/32'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-gray-600"
                  />
                  <span className="hidden sm:block text-sm">
                    {user?.displayName || 'Utilisateur'}
                  </span>
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                  title="Déconnexion"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation mobile */}
      <nav className="md:hidden bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
