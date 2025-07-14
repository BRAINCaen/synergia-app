// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT COMPLET AVEC MENU ORIGINAL TOUTES LES PAGES
// ==========================================

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
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
  ChevronRight,
  Star,
  Target,
  Award,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { ROUTES } from '../../core/constants.js';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  // États pour la responsivité
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    gamification: true,
    progression: true,
    team: true,
    tools: true,
    admin: false
  });

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🎯 MENU COMPLET AVEC TOUTES TES PAGES
  const navigationItems = {
    main: [
      { id: 'dashboard', path: ROUTES.DASHBOARD, label: 'Dashboard', icon: Home },
      { id: 'tasks', path: ROUTES.TASKS, label: 'Tâches', icon: CheckSquare },
      { id: 'projects', path: ROUTES.PROJECTS, label: 'Projets', icon: FolderOpen },
      { id: 'analytics', path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 }
    ],
    gamification: [
      { id: 'gamification', path: ROUTES.GAMIFICATION, label: 'Gamification', icon: Gamepad2 },
      { id: 'badges', path: ROUTES.BADGES, label: 'Badges', icon: Medal },
      { id: 'leaderboard', path: ROUTES.LEADERBOARD, label: 'Classement', icon: Trophy },
      { id: 'rewards', path: ROUTES.REWARDS, label: 'Récompenses', icon: Gift }
    ],
    progression: [
      { id: 'role-progression', path: ROUTES.ROLE_PROGRESSION, label: 'Progression Rôles', icon: Target },
      { id: 'role-tasks', path: ROUTES.ROLE_TASKS, label: 'Tâches par Rôle', icon: CheckSquare },
      { id: 'role-badges', path: ROUTES.ROLE_BADGES, label: 'Badges Rôles', icon: Award },
      { id: 'escape-progression', path: ROUTES.ESCAPE_PROGRESSION, label: 'Escape Progression', icon: Flame }
    ],
    team: [
      { id: 'team', path: ROUTES.TEAM, label: 'Équipe', icon: Users },
      { id: 'users', path: ROUTES.USERS, label: 'Utilisateurs', icon: UserCheck }
    ],
    tools: [
      { id: 'onboarding', path: ROUTES.ONBOARDING, label: 'Onboarding', icon: BookOpen },
      { id: 'timetrack', path: ROUTES.TIMETRACK, label: 'Pointeuse', icon: Clock },
      { id: 'profile', path: ROUTES.PROFILE, label: 'Profil', icon: User },
      { id: 'settings', path: ROUTES.SETTINGS, label: 'Paramètres', icon: Settings }
    ]
  };

  // 🛡️ MENU ADMIN COMPLET - TOUTES LES PAGES ADMIN
  const adminItems = user?.role === 'admin' || user?.isAdmin ? [
    { 
      id: 'admin-validation-taches', 
      path: ROUTES.ADMIN_TASK_VALIDATION, 
      label: 'Validation Tâches', 
      icon: CheckSquare,
      badge: '👑'
    },
    { 
      id: 'admin-gestion-badges', 
      path: '/admin/badges', 
      label: 'Gestion Badges', 
      icon: Medal,
      badge: '👑'
    },
    { 
      id: 'admin-gestion-utilisateurs', 
      path: '/admin/users', 
      label: 'Gestion Utilisateurs', 
      icon: Users,
      badge: '👑'
    },
    { 
      id: 'admin-analytics', 
      path: '/admin/analytics', 
      label: 'Analytics Admin', 
      icon: BarChart3,
      badge: '👑'
    },
    { 
      id: 'admin-permissions-role', 
      path: '/admin/role-permissions', 
      label: 'Permissions par Rôle', 
      icon: Shield,
      badge: 'Nouveau',
      isNew: true
    },
    { 
      id: 'admin-parametres-systeme', 
      path: '/admin/settings', 
      label: 'Paramètres Système', 
      icon: Settings,
      badge: '👑'
    }
  ] : [];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const renderNavigationSection = (sectionId, title, items) => {
    const isExpanded = expandedSections[sectionId];
    
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionId)}
          className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
          {isExpanded ? 
            <ChevronDown className="w-4 h-4" /> : 
            <ChevronRight className="w-4 h-4" />
          }
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 mt-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2 rounded-lg text-left transition-colors
                      ${isActivePath(item.path) 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    
                    {/* Badge pour les éléments admin */}
                    {item.badge && (
                      <span className={`
                        px-2 py-1 text-xs rounded-full font-medium
                        ${item.isNew 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      
      {/* 📱 OVERLAY MOBILE */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 🎯 SIDEBAR COMPLÈTE */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? (isMobile ? 280 : 280) : 0
        }}
        transition={{ duration: 0.3 }}
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          top-0 left-0 h-screen bg-gray-800/90 backdrop-blur-sm border-r border-gray-700 
          overflow-hidden z-50 flex flex-col
        `}
      >
        
        {/* 🔥 HEADER SIDEBAR */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Synergia</h1>
                <p className="text-xs text-gray-400">v3.5</p>
              </div>
            </div>
            
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 👤 PROFIL UTILISATEUR */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400">
                {user?.role || 'Membre'}
              </p>
            </div>
          </div>
        </div>

        {/* 🧭 NAVIGATION COMPLÈTE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          
          {/* Section Principale */}
          {renderNavigationSection('main', 'Principal', navigationItems.main)}
          
          {/* Section Gamification */}
          {renderNavigationSection('gamification', 'Gamification', navigationItems.gamification)}
          
          {/* Section Progression */}
          {renderNavigationSection('progression', 'Progression', navigationItems.progression)}
          
          {/* Section Équipe */}
          {renderNavigationSection('team', 'Équipe', navigationItems.team)}
          
          {/* Section Outils */}
          {renderNavigationSection('tools', 'Outils', navigationItems.tools)}
          
          {/* Section Admin */}
          {adminItems.length > 0 && 
            renderNavigationSection('admin', 'Administration', adminItems)
          }
        </div>

        {/* 🚪 DÉCONNEXION */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.aside>

      {/* 📄 CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* 📱 HEADER MOBILE */}
        {isMobile && (
          <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <h1 className="text-lg font-bold text-white">Synergia</h1>
              
              <div className="w-6" /> {/* Spacer */}
            </div>
          </header>
        )}

        {/* 🎯 CONTENU DES PAGES */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
