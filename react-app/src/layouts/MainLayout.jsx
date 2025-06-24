// ==========================================
// 📁 react-app/src/layouts/MainLayout.jsx
// Layout principal CORRIGÉ - Affichage sidebar + contenu
// ==========================================

import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore';

// Icons
import { 
  FaHome, 
  FaTasks, 
  FaProjectDiagram, 
  FaTrophy, 
  FaUsers, 
  FaChartLine, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaGamepad
} from 'react-icons/fa';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // ✅ Configuration de navigation
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FaHome,
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Tâches',
      href: '/tasks',
      icon: FaTasks,
      description: 'Gestion des tâches'
    },
    {
      name: 'Projets',
      href: '/projects',
      icon: FaProjectDiagram,
      description: 'Projets et collaborations'
    },
    {
      name: 'Gamification',
      href: '/gamification',
      icon: FaGamepad,
      description: 'XP et progression'
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: FaTrophy,
      description: 'Classements'
    },
    {
      name: 'Équipe',
      href: '/team',
      icon: FaUsers,
      description: 'Collaboration équipe'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: FaChartLine,
      description: 'Métriques et statistiques'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* ✅ Overlay mobile pour fermer sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header sidebar */}
        <div className="flex items-center justify-between h-16 px-6 bg-gray-900">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="ml-2 text-white font-semibold">Synergia</span>
          </div>
          
          {/* Bouton fermer mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* Version badge */}
        <div className="px-6 py-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            v3.3
          </span>
          <span className="ml-2 text-xs text-gray-400">
            Application stable avec toutes les fonctionnalités gamification
          </span>
        </div>

        {/* Navigation principale */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 transition-colors
                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                  `} />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Profil utilisateur */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center mb-3">
            <img
              className="h-8 w-8 rounded-full"
              src={user?.photoURL || 'https://via.placeholder.com/32'}
              alt={user?.displayName || 'Utilisateur'}
            />
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
            >
              <FaUser className="mr-3 h-4 w-4" />
              Profil
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-300 rounded-md hover:bg-red-600 hover:text-white transition-colors"
            >
              <FaSignOutAlt className="mr-3 h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <div className="lg:hidden bg-gray-800 px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <FaBars className="h-6 w-6" />
          </button>
          
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="ml-2 text-white font-semibold">Synergia</span>
          </div>
          
          <div className="w-8"></div> {/* Spacer */}
        </div>

        {/* ✅ Zone de contenu avec scroll */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
