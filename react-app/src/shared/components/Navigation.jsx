// src/shared/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useGameLevel, useGameXP } from '../stores/gameStore';

const Navigation = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const currentLevel = useGameLevel();
  const currentXP = useGameXP();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/gamification',
      label: 'Progression',
      icon: '🎮'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Titre */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-2xl font-bold text-purple-400">
              ⚡ Synergia
            </Link>
            
            {/* Badge de niveau (mini) */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2 bg-purple-900/30 px-3 py-1 rounded-full">
                <span className="text-purple-300 text-sm">Niv. {currentLevel}</span>
                <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${(currentXP % 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation centrale */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Menu utilisateur */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Infos utilisateur */}
                <div className="hidden sm:flex items-center space-x-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-gray-400 text-xs">{currentXP} XP</p>
                  </div>
                </div>

                {/* Bouton déconnexion */}
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🚪 Déconnexion
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden border-t border-gray-700">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
