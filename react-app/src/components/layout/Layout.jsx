// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT CORRIGÉ - UTILISE OUTLET + BOUTON GRIS (PAS ROUGE)
// ==========================================

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom'; // ✅ IMPORT OUTLET
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3, 
  Trophy, 
  Medal, 
  Gamepad2, 
  Gift,
  Users, 
  UserCheck, 
  User, 
  Settings, 
  BookOpen, 
  Clock,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Star,
  Crown,
  Target,
  TrendingUp,
  Award,
  Zap,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

const Layout = () => { // ✅ PAS DE {children} car on utilise Outlet
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  // États pour la responsivité
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    gamification: true,
    progression: true,
    team: true,
    admin: false
  });

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation items
  const navigationItems = {
    main: [
      { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: Home },
      { id: 'tasks', path: '/tasks', label: 'Tâches', icon: CheckSquare },
      { id: 'projects', path: '/projects', label: 'Projets', icon: FolderOpen },
      { id: 'analytics', path: '/analytics', label: 'Analytics', icon: BarChart3 }
    ],
    gamification: [
      { id: 'gamification', path: '/gamification', label: 'Gamification', icon: Gamepad2 },
      { id: 'badges', path: '/badges', label: 'Badges', icon: Medal },
      { id: 'rewards', path: '/rewards', label: 'Récompenses', icon: Gift },
      { id: 'leaderboard', path: '/leaderboard', label: 'Classement', icon: Trophy }
    ],
    progression: [
      { id: 'role-progression', path: '/role/progression', label: 'Progression de Rôle', icon: TrendingUp },
      { id: 'role-tasks', path: '/role/tasks', label: 'Tâches de Rôle', icon: Target },
      { id: 'role-badges', path: '/role/badges', label: 'Badges de Rôle', icon: Award }
    ],
    team: [
      { id: 'team', path: '/team', label: 'Équipe', icon: Users },
      { id: 'users', path: '/users', label: 'Utilisateurs', icon: UserCheck }
    ],
    tools: [
      { id: 'onboarding', path: '/onboarding', label: 'Intégration', icon: BookOpen },
      { id: 'time-track', path: '/time-track', label: 'Suivi du Temps', icon: Clock },
      { id: 'profile', path: '/profile', label: 'Mon Profil', icon: User },
      { id: 'settings', path: '/settings', label: 'Paramètres', icon: Settings }
    ]
  };

  // Navigation admin
  const adminItems = [
    { id: 'admin-validation', path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
    { id: 'admin-test', path: '/admin/complete-test', label: 'Test Complet', icon: Zap }
  ];

  // Gestion déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // Toggle sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Vérifier si lien actif
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Rendu des liens de navigation
  const renderNavLink = (item) => (
    <motion.div
      key={item.id}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={() => navigate(item.path)}
        className={`
          w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActiveLink(item.path)
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }
        `}
      >
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.label}</span>
      </button>
    </motion.div>
  );

  // Rendu section de navigation
  const renderNavSection = (title, items, sectionKey, icon) => (
    <div className="mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-2 text-gray-400 hover:text-white transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon && <icon className="w-4 h-4" />}
          <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${
            expandedSections[sectionKey] ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1"
          >
            {items.map(renderNavLink)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -300 } : {}}
            className={`
              ${isMobile ? 'fixed' : 'relative'} 
              z-50 w-80 bg-gray-800 border-r border-gray-700 flex flex-col
            `}
          >
            {/* Header sidebar */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Synergia</h1>
                    <p className="text-xs text-gray-400">v3.5 - Professional</p>
                  </div>
                </div>
                
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {renderNavSection('Principal', navigationItems.main, 'main', Home)}
              {renderNavSection('Gamification', navigationItems.gamification, 'gamification', Gamepad2)}
              {renderNavSection('Progression', navigationItems.progression, 'progression', TrendingUp)}
              {renderNavSection('Équipe', navigationItems.team, 'team', Users)}
              {renderNavSection('Outils', navigationItems.tools, 'tools', Settings)}
              
              {isAdmin(user) && renderNavSection('Administration', adminItems, 'admin', Shield)}
            </div>

            {/* Footer utilisateur - ✅ BOUTON GRIS AU LIEU DE ROUGE */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.displayName?.[0] || user?.email?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              
              {/* ✅ BOUTON DÉCONNEXION GRIS - PAS ROUGE */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header mobile */}
        <header className="md:hidden bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-white hover:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-white font-bold">Synergia</span>
            </div>
            
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content - ✅ UTILISE OUTLET */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
