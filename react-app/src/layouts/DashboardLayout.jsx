// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// DASHBOARD LAYOUT CORRIGÉ - AFFICHAGE CONTENU FIXÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Bell,
  Search,
  User,
  Crown,
  Shield,
  CheckSquare
} from 'lucide-react';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminBadgeService.js';

// Composants
import ToastContainer from '../shared/components/ui/ToastContainer.jsx';

/**
 * 🎨 DASHBOARD LAYOUT AVEC SIDEBAR ET HEADER
 */
const DashboardLayout = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  
  // États UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // 🛡️ Vérification admin
  const userIsAdmin = isAdmin(user);

  // Sections de navigation
  const navigationSections = [
    {
      title: '🏠 Principal',
      key: 'main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: '🏠', current: location.pathname === '/dashboard' },
        { name: 'Tâches', href: '/tasks', icon: '✅', current: location.pathname === '/tasks' },
        { name: 'Projets', href: '/projects', icon: '📁', current: location.pathname === '/projects' },
        { name: 'Analytics', href: '/analytics', icon: '📊', current: location.pathname === '/analytics' },
      ]
    },
    {
      title: '🎮 Gamification',
      key: 'gamification',
      items: [
        { name: 'Gamification', href: '/gamification', icon: '🎮', current: location.pathname === '/gamification', description: 'XP, badges, classement' },
        { name: 'Récompenses', href: '/rewards', icon: '🎁', current: location.pathname === '/rewards' },
      ]
    },
    {
      title: '👥 Collaboration',
      key: 'collaboration',
      items: [
        { name: 'Utilisateurs', href: '/users', icon: '👥', current: location.pathname === '/users', description: 'Équipe & classement' },
        { name: 'Intégration', href: '/onboarding', icon: '🎯', current: location.pathname === '/onboarding', badge: 'NEW' },
      ]
    },
    // 🛡️ SECTION ADMIN CONDITIONNELLE
    ...(userIsAdmin ? [{
      title: '🛡️ Administration',
      key: 'admin',
      items: [
        { 
          name: 'Validation Tâches', 
          href: '/admin/task-validation', 
          icon: '✅', 
          current: location.pathname === '/admin/task-validation',
          description: 'Valider soumissions',
          badge: '3',
          priority: true
        },
        { 
          name: 'Test Admin', 
          href: '/admin/profile-test', 
          icon: '🧪', 
          current: location.pathname === '/admin/profile-test',
          description: 'Diagnostics'
        },
      ]
    }] : []),
    {
      title: '⚙️ Outils',
      key: 'tools',
      items: [
        { name: 'Time Track', href: '/timetrack', icon: '⏰', current: location.pathname === '/timetrack' },
        { name: 'Mon Profil', href: '/profile', icon: '👤', current: location.pathname === '/profile' },
        { name: 'Paramètres', href: '/settings', icon: '⚙️', current: location.pathname === '/settings' },
      ]
    }
  ];

  // Obtenr les initiales utilisateur
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  // Déconnexion
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // Render item de navigation
  const renderNavItem = (item) => (
    <Link
      key={item.name}
      to={item.href}
      className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        item.current
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      } ${item.priority ? 'ring-2 ring-orange-300 ring-opacity-50' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{item.icon}</span>
        {!sidebarCollapsed && (
          <div className="flex-1">
            <span>{item.name}</span>
            {item.description && (
              <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
            )}
          </div>
        )}
      </div>
      
      {!sidebarCollapsed && item.badge && (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          item.badge === 'NEW' 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {item.badge}
        </span>
      )}
    </Link>
  );

  // Render section de navigation
  const renderNavSection = (section) => (
    <div key={section.key} className="mb-6">
      {!sidebarCollapsed && (
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {section.title}
        </h3>
      )}
      <nav className="space-y-1">
        {section.items.map(renderNavItem)}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col border-r border-gray-200`}>
        
        {/* Header sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Synergia
                  {userIsAdmin && <Crown className="w-5 h-5 text-yellow-500" />}
                </h1>
                <p className="text-xs text-gray-500">v3.5 Admin Ready</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          {navigationSections.map(renderNavSection)}
        </div>

        {/* 🛡️ Quick Admin Access */}
        {userIsAdmin && !sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/admin/task-validation"
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            >
              <CheckSquare className="w-5 h-5" />
              <div className="flex-1">
                <span className="font-medium">Valider Tâches</span>
                <p className="text-xs opacity-90">3 en attente</p>
              </div>
            </Link>
          </div>
        )}

        {/* Widget progression utilisateur */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {user?.displayName || user?.email}
                  </h4>
                  <p className="text-xs text-gray-600">Niveau 4 • 175 XP</p>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>175/200 XP</span>
                <span>Niveau 5</span>
              </div>
            </div>
          </div>
        )}

        {/* Profil utilisateur */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  userIsAdmin 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                    : 'bg-gray-600'
                }`}>
                  {getUserInitials()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.displayName || user?.email}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    {userIsAdmin && <Crown className="w-3 h-3 text-yellow-500" />}
                    {userIsAdmin ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>
              </button>

              {/* Menu utilisateur */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mon Profil</span>
                    </Link>
                    
                    {userIsAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-1"></div>
                        <Link
                          to="/admin/task-validation"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          <span>Panel Admin</span>
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Titre de page */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle(location.pathname)}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {getPageDescription(location.pathname)}
              </p>
            </div>

            {/* Actions header */}
            <div className="flex items-center space-x-4">
              
              {/* 🛡️ Badge Admin */}
              {userIsAdmin && (
                <Link
                  to="/admin/task-validation"
                  className="relative flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Admin</span>
                  {/* Badge notification */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </Link>
              )}

              {/* Recherche */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications.length}
                  </div>
                )}
              </button>

              {/* Avatar utilisateur mobile */}
              <div className="md:hidden">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    userIsAdmin 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                      : 'bg-gray-600'
                  }`}
                >
                  {getUserInitials()}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 🔥 CONTENU DE LA PAGE - CORRECTION PRINCIPALE */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

// Fonction pour obtenir le titre de la page
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/tasks': 'Tâches',
    '/projects': 'Projets', 
    '/analytics': 'Analytics',
    '/gamification': 'Gamification',
    '/rewards': 'Récompenses',
    '/users': 'Utilisateurs',
    '/onboarding': 'Intégration',
    '/timetrack': 'Time Tracking',
    '/profile': 'Mon Profil',
    '/settings': 'Paramètres',
    '/admin/task-validation': 'Validation des Tâches',
    '/admin/profile-test': 'Test Admin Profile',
    '/admin/complete-test': 'Test Admin Complet'
  };
  return titles[pathname] || 'Synergia';
};

// Fonction pour obtenir la description de la page
const getPageDescription = (pathname) => {
  const descriptions = {
    '/dashboard': 'Vue d\'ensemble de votre activité',
    '/tasks': 'Gérez vos tâches et objectifs',
    '/projects': 'Collaborez sur vos projets',
    '/analytics': 'Analysez vos performances',
    '/gamification': 'Badges, XP et progression',
    '/rewards': 'Vos récompenses et achievements',
    '/users': 'Équipe et classements',
    '/onboarding': 'Parcours d\'intégration gamifié',
    '/timetrack': 'Suivi du temps de travail',
    '/profile': 'Gérez votre profil utilisateur',
    '/settings': 'Configuration de l\'application',
    '/admin/task-validation': 'Examinez et validez les soumissions d\'équipe',
    '/admin/profile-test': 'Diagnostics et tests des permissions admin',
    '/admin/complete-test': 'Tests complets du système administrateur'
  };
  return descriptions[pathname] || 'Application de gestion collaborative';
};

export default DashboardLayout;
