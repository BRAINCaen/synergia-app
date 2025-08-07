// ==========================================
// 📁 react-app/src/layouts/MainLayout.jsx
// CORRECTION MENU MOBILE - SIDEBAR FONCTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3,
  Gamepad2,
  Users,
  User,
  Settings,
  LogOut,
  Trophy,
  Award,
  Gift,
  Clock,
  BookOpen,
  UserCheck,
  Shield,
  Crown,
  PieChart
} from 'lucide-react';

// 🔧 CORRECTION: Imports depuis les bons chemins
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

/**
 * 🛡️ DÉTECTION ADMIN
 */
const isUserAdmin = (user) => {
  if (!user) return false;
  
  const adminEmails = [
    'alan.boehme61@gmail.com',
    'tanguy.caron@gmail.com',
    'admin@synergia.com'
  ];
  
  return adminEmails.includes(user.email) || user.role === 'admin' || user.isAdmin === true;
};

const MainLayout = () => {
  const { user, signOut } = useAuthStore();
  const { level, xp, nextLevelXP } = useGameStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour le menu mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fermer le menu lors du changement de page
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Fermer le menu si on redimensionne en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const userIsAdmin = isUserAdmin(user);

  // 🚀 NAVIGATION COMPLÈTE ORGANISÉE PAR SECTIONS
  const navigationSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/tasks', label: 'Tâches', icon: CheckSquare },
        { path: '/projects', label: 'Projets', icon: FolderOpen },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'GAMIFICATION',
      items: [
        { path: '/gamification', label: 'Gamification', icon: Gamepad2 },
        { path: '/badges', label: 'Badges', icon: Award },
        { path: '/leaderboard', label: 'Classement', icon: Trophy },
        { path: '/rewards', label: 'Récompenses', icon: Gift }
      ]
    },
    {
      title: 'ÉQUIPE & SOCIAL',
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UserCheck }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Intégration', icon: BookOpen },
        { path: '/timetrack', label: 'Pointeuse', icon: Clock },
        { path: '/profile', label: 'Mon Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  // SECTION ADMIN
  const adminSection = {
    title: 'ADMINISTRATION',
    items: [
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
      { path: '/admin/complete-test', label: 'Test Admin', icon: Crown },
      { path: '/admin/role-permissions', label: 'Permissions', icon: Shield },
      { path: '/admin/users', label: 'Admin Utilisateurs', icon: Crown },
      { path: '/admin/analytics', label: 'Admin Analytics', icon: PieChart },
      { path: '/admin/settings', label: 'Admin Config', icon: Settings }
    ]
  };

  const allSections = userIsAdmin 
    ? [...navigationSections, adminSection]
    : navigationSections;

  // Navigation principale pour header desktop
  const mainNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '✅' },
    { path: '/projects', label: 'Projets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/gamification', label: 'Gamification', icon: '🎮' },
    { path: '/team', label: 'Équipe', icon: '👥' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* SIDEBAR MOBILE */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:hidden
      `}>
        {/* Header Sidebar */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-white">Synergia</span>
            {userIsAdmin && <span className="text-red-400 text-xs">ADMIN</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Utilisateur */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                Niveau {level || 1} • {xp || 0} XP
              </p>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {allSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isAdminItem = section.title === 'ADMINISTRATION';

                  return (
                    <NavLink
                      key={itemIndex}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                        ${active
                          ? isAdminItem
                            ? 'bg-red-900 text-red-100'
                            : 'bg-blue-900 text-blue-100'
                          : isAdminItem
                            ? 'text-red-300 hover:bg-red-900 hover:text-red-100'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`mr-3 w-5 h-5 flex-shrink-0 ${
                        active
                          ? isAdminItem ? 'text-red-300' : 'text-blue-300'
                          : isAdminItem ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <span className="truncate">{item.label}</span>
                      {isAdminItem && (
                        <Shield className="w-3 h-3 ml-auto text-red-400 flex-shrink-0" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Déconnexion mobile */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5 text-gray-400" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header Desktop */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Bouton menu mobile + Logo */}
            <div className="flex items-center space-x-4">
              {/* Bouton hamburger - VISIBLE UNIQUEMENT SUR MOBILE */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-white">Synergia</span>
                <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                  v3.5
                </span>
                {userIsAdmin && (
                  <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            {/* Navigation principale - CACHÉE SUR MOBILE */}
            <nav className="hidden md:flex space-x-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Section utilisateur - ADAPTÉE MOBILE */}
            <div className="flex items-center space-x-4">
              {/* Progression XP - CACHÉE SUR PETIT MOBILE */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    Niveau {level || 1}
                  </div>
                  <div className="text-xs text-gray-400">
                    {xp || 0} / {nextLevelXP || 1000} XP
                  </div>
                </div>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((xp || 0) / (nextLevelXP || 1000)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Menu utilisateur */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">
                    {user?.displayName || user?.email || 'Utilisateur'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Connecté
                  </div>
                </div>
                
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                
                {/* Bouton déconnexion desktop */}
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation mobile en bas - SIMPLIFIÉE */}
      <nav className="md:hidden bg-gray-800 border-t border-gray-700">
        <div className="flex justify-around py-2">
          {mainNavItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 transition-colors ${
                  isActive
                    ? 'text-blue-400'
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
