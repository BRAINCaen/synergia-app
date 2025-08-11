// ==========================================
// 📁 react-app/src/layouts/MainLayout.jsx  
// VERSION FINALE - MENU MOBILE GARANTI FONCTIONNEL
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
  Crown
} from 'lucide-react';

// Imports stores
import { useAuthStore } from '../shared/stores/authStore.js';

const MainLayout = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // États
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fermer la sidebar au changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // Vérification admin simple
  const isAdmin = user?.email === 'alan.boehme61@gmail.com' || user?.email === 'tanguy.caron@gmail.com';

  // Navigation organisée
  const navSections = [
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
        { path: '/rewards', label: 'Récompenses', icon: Gift }
      ]
    },
    {
      title: 'ÉQUIPE',
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

  // Section admin conditionnelle
  if (isAdmin) {
    navSections.push({
      title: 'ADMINISTRATION',
      items: [
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
        { path: '/admin/complete-test', label: 'Test Admin', icon: Crown }
      ]
    });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* SIDEBAR MOBILE - Position Fixed */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 shadow-xl">
            {/* Header sidebar */}
            <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-white">Synergia</span>
                {isAdmin && <span className="text-red-400 text-xs">ADMIN</span>}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Utilisateur */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {(user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white truncate">
                    {user?.displayName || user?.email || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400">Connecté</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {navSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      const isAdminSection = section.title === 'ADMINISTRATION';

                      return (
                        <NavLink
                          key={itemIndex}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                            ${active
                              ? isAdminSection
                                ? 'bg-red-900 text-red-100'
                                : 'bg-blue-900 text-blue-100'
                              : isAdminSection
                                ? 'text-red-300 hover:bg-red-900/50'
                                : 'text-gray-300 hover:bg-gray-700'
                            }
                          `}
                        >
                          <Icon className="mr-3 w-5 h-5" />
                          <span>{item.label}</span>
                          {isAdminSection && (
                            <Shield className="w-3 h-3 ml-auto text-red-400" />
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Déconnexion */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut className="mr-3 w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* HEADER */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Section gauche - BOUTON HAMBURGER TRÈS VISIBLE */}
            <div className="flex items-center space-x-4">
              {/* BOUTON HAMBURGER - GROS ET VISIBLE */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
                aria-label="Ouvrir le menu"
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
                {isAdmin && (
                  <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            {/* Navigation desktop - cachée sur mobile */}
            <nav className="hidden md:flex space-x-1">
              <NavLink to="/dashboard" className={({ isActive }) => 
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }>
                <span>🏠</span><span>Dashboard</span>
              </NavLink>
              <NavLink to="/tasks" className={({ isActive }) => 
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }>
                <span>✅</span><span>Tâches</span>
              </NavLink>
              <NavLink to="/projects" className={({ isActive }) => 
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }>
                <span>📁</span><span>Projets</span>
              </NavLink>
              <NavLink to="/analytics" className={({ isActive }) => 
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }>
                <span>📊</span><span>Analytics</span>
              </NavLink>
              <NavLink to="/gamification" className={({ isActive }) => 
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }>
                <span>🎮</span><span>Gamification</span>
              </NavLink>
              <NavLink to="/team" className={({ isActive }) => 
                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`
              }>
                <span>👥</span><span>Équipe</span>
              </NavLink>
            </nav>

            {/* Section droite - utilisateur */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-white">
                  {user?.displayName || user?.email || 'Utilisateur'}
                </div>
                <div className="text-xs text-gray-400">Connecté</div>
              </div>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {(user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              
              {/* Bouton déconnexion desktop */}
              <button
                onClick={handleLogout}
                className="hidden md:block text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation mobile du bas - optionnelle */}
      <nav className="md:hidden bg-gray-800 border-t border-gray-700 fixed bottom-0 left-0 right-0 z-30">
        <div className="flex justify-around py-2">
          <NavLink to="/dashboard" className={({ isActive }) => 
            `flex flex-col items-center py-2 px-3 transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            <span className="text-lg">🏠</span>
            <span className="text-xs mt-1">Dashboard</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => 
            `flex flex-col items-center py-2 px-3 transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            <span className="text-lg">✅</span>
            <span className="text-xs mt-1">Tâches</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => 
            `flex flex-col items-center py-2 px-3 transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            <span className="text-lg">📁</span>
            <span className="text-xs mt-1">Projets</span>
          </NavLink>
          <NavLink to="/gamification" className={({ isActive }) => 
            `flex flex-col items-center py-2 px-3 transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            <span className="text-lg">🎮</span>
            <span className="text-xs mt-1">Jeux</span>
          </NavLink>
          <NavLink to="/team" className={({ isActive }) => 
            `flex flex-col items-center py-2 px-3 transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
            }`
          }>
            <span className="text-lg">👥</span>
            <span className="text-xs mt-1">Équipe</span>
          </NavLink>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
