// src/components/Navigation.jsx - NAVIGATION AVEC LIEN TÂCHES
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../core/firebase';
import useAuthStore from '../shared/stores/authStore';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/tasks',
      label: 'Tâches',
      icon: '🎯'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-xl">⚡</span>
              </div>
              <span className="text-2xl font-bold text-white">Synergia</span>
            </Link>
            
            <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs rounded-full font-medium">
              v3.0 • Gamifié
            </span>
          </div>

          {/* Navigation principale */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Profil utilisateur et déconnexion */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={user?.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.email}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border-2 border-blue-400"
              />
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-medium">
                  {user?.displayName || user?.email?.split('@')[0]}
                </p>
                <p className="text-gray-400 text-xs">
                  {user?.profile?.role === 'admin' ? '👑 Admin' : 
                   user?.profile?.role === 'manager' ? '⭐ Manager' : 
                   '👤 Membre'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
                  ${isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
