// ==========================================
// 📁 react-app/src/shared/layouts/MainLayout.jsx
// LAYOUT PRINCIPAL COMPLET AVEC NAVIGATION SIDEBAR
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CheckSquare,
  FolderOpen,
  BarChart3,
  Trophy,
  Award,
  Crown,
  Gift,
  Users,
  User,
  BookOpen,
  Clock,
  UserCircle,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==========================================
  // 🧭 CONFIGURATION DE LA NAVIGATION COMPLÈTE
  // ==========================================
  const navigationSections = [
    {
      id: 'main',
      title: 'Principal',
      items: [
        { path: '/dashboard', label: 'Tableau de Bord', icon: Home },
        { path: '/tasks', label: 'Tâches', icon: CheckSquare },
        { path: '/projects', label: 'Projets', icon: FolderOpen },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      id: 'gamification',
      title: 'Gamification',
      badge: 'HOT',
      items: [
        { path: '/gamification', label: 'Gamification', icon: Trophy },
        { path: '/badges', label: 'Badges', icon: Award },
        { path: '/leaderboard', label: 'Classement', icon: Crown },
        { path: '/rewards', label: 'Récompenses', icon: Gift }
      ]
    },
    {
      id: 'team',
      title: 'Équipe',
      items: [
        { path: '/team', label: 'Mon Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: User }
      ]
    },
    {
      id: 'tools',
      title: 'Outils',
      items: [
        { path: '/onboarding', label: 'Guide', icon: BookOpen },
        { path: '/timetrack', label: 'Pointeuse', icon: Clock },
        { path: '/profile', label: 'Profil', icon: UserCircle },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  // Section admin (conditionnelle)
  const adminSection = {
    id: 'admin',
    title: 'Administration',
    adminOnly: true,
    items: [
      { path: '/admin/dashboard-tuteur', label: 'Dashboard Tuteur', icon: Shield },
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: CheckSquare },
      { path: '/admin/complete-test', label: 'Test Complet', icon: Settings },
      { path: '/admin/role-permissions', label: 'Permissions', icon: Shield },
      { path: '/admin/rewards', label: 'Gestion Récompenses', icon: Gift },
      { path: '/admin/badges', label: 'Gestion Badges', icon: Award },
      { path: '/admin/users', label: 'Gestion Utilisateurs', icon: Users },
      { path: '/admin/analytics', label: 'Analytics Admin', icon: BarChart3 },
      { path: '/admin/settings', label: 'Config Admin', icon: Settings }
    ]
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || 
                 user?.profile?.role === 'admin' || 
                 user?.isAdmin === true ||
                 user?.email === 'alan.boehme61@gmail.com';

  // Ajouter la section admin si l'utilisateur est admin
  const allSections = [...navigationSections];
  if (isAdmin) {
    allSections.push(adminSection);
  }

  // ==========================================
  // 🎨 FONCTIONS UTILITAIRES
  // ==========================================
  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // ==========================================
  // 🧩 COMPOSANTS INTERNES
  // ==========================================
  
  // Badge pour les nouvelles sections
  const SectionBadge = ({ badge }) => {
    if (!badge) return null;
    
    const badgeColors = {
      'HOT': 'bg-red-500 text-white',
      'NOUVEAU': 'bg-green-500 text-white',
      'BETA': 'bg-orange-500 text-white'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-bold ${badgeColors[badge] || 'bg-blue-500 text-white'}`}>
        {badge}
      </span>
    );
  };

  // Item de navigation
  const NavigationItem = ({ item, onClick }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
          active
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`}
      >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`} />
        
        {!sidebarCollapsed && (
          <span className="font-medium">{item.label}</span>
        )}
        
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute right-2 w-2 h-2 bg-white rounded-full"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Tooltip pour sidebar collapsée */}
        {sidebarCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  // Section de navigation
  const NavigationSection = ({ section }) => {
    const SectionIcon = section.items[0]?.icon || Shield;

    return (
      <div className="mb-6">
        {/* Header de section */}
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between px-4 py-2 text-gray-300">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-sm uppercase tracking-wide">{section.title}</span>
              <SectionBadge badge={section.badge} />
            </div>
          </div>
        )}

        {/* Items de navigation */}
        <div className="space-y-1">
          {section.items.map((item) => (
            <NavigationItem
              key={item.path}
              item={item}
              onClick={closeMobileMenu}
            />
          ))}
        </div>
      </div>
    );
  };

  // ==========================================
  // 🎨 RENDU PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Header mobile */}
      <div className="lg:hidden bg-gray-900/90 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Synergia</span>
        </Link>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        
        {/* Sidebar Desktop */}
        <motion.nav
          initial={false}
          animate={{ width: sidebarCollapsed ? 80 : 320 }}
          className="hidden lg:flex flex-col bg-gray-900/90 backdrop-blur-sm border-r border-gray-700 h-screen sticky top-0"
        >
          
          {/* Header sidebar */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <Link to="/dashboard" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Synergia</h1>
                    <p className="text-sm text-gray-400">v3.5.3</p>
                  </div>
                </Link>
              )}
              
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation principale */}
          <div className="flex-1 overflow-y-auto p-4">
            {allSections.map((section) => (
              <NavigationSection key={section.id} section={section} />
            ))}
          </div>

          {/* Footer utilisateur */}
          <div className="p-4 border-t border-gray-700">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center space-x-2'} px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors`}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </motion.nav>

        {/* Menu mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={closeMobileMenu}
              />
              
              <motion.nav
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-700">
                  <Link to="/dashboard" className="flex items-center space-x-3" onClick={closeMobileMenu}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Synergia</h1>
                      <p className="text-sm text-gray-400">v3.5.3</p>
                    </div>
                  </Link>
                </div>

                <div className="p-4">
                  {allSections.map((section) => (
                    <NavigationSection key={section.id} section={section} />
                  ))}
                </div>

                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      <p className="text-gray-400 text-sm truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        <main className="flex-1 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ [LAYOUT] MainLayout complet créé');
console.log('🧭 [LAYOUT] Navigation avec sidebar collapsible');
console.log('📱 [LAYOUT] Menu mobile responsive');
console.log('🎨 [LAYOUT] Design premium avec animations');
console.log('🔒 [LAYOUT] Section admin conditionnelle');
console.log('👤 [LAYOUT] Profil utilisateur intégré');
