// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT AVEC MENU ADMIN ÉTENDU - GESTION DES RÔLES
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
  Star,
  Crown,
  Target,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Lock,
  UserPlus,
  Database,
  FileText,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';
import { ROUTES } from '../../core/constants.js';

const Layout = () => {
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

  // Navigation items avec les VRAIES ROUTES des constantes
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

  // ✅ MENU ADMIN ÉTENDU AVEC GESTION DES RÔLES
  const adminItems = isAdmin(user) ? [
    { 
      id: 'admin-task-validation', 
      path: '/admin/task-validation', 
      label: 'Validation Tâches', 
      icon: CheckSquare 
    },
    { 
      id: 'admin-badges', 
      path: '/admin/badges', 
      label: 'Gestion Badges', 
      icon: Trophy 
    },
    { 
      id: 'admin-users', 
      path: '/admin/users', 
      label: 'Gestion Utilisateurs', 
      icon: Users 
    },
    { 
      id: 'admin-analytics', 
      path: '/admin/analytics', 
      label: 'Analytics Admin', 
      icon: BarChart3 
    },
    // 🆕 NOUVELLE SECTION - GESTION DES RÔLES
    { 
      id: 'admin-role-permissions', 
      path: '/admin/role-permissions', 
      label: 'Permissions par Rôle', 
      icon: Shield,
      badge: 'Nouveau',
      description: 'Gérer les accès admin par rôle Synergia'
    },
    { 
      id: 'admin-settings', 
      path: '/admin/settings', 
      label: 'Paramètres Système', 
      icon: Settings 
    }
  ] : [];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderNavigationSection = (sectionId, title, items, defaultExpanded = true) => {
    const isExpanded = expandedSections[sectionId] ?? defaultExpanded;
    
    return (
      <div className="mb-6">
        <button
          onClick={() => toggleSection(sectionId)}
          className="flex items-center justify-between w-full px-6 py-2 text-left text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronDown size={16} className="rotate-180" />}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <nav className="space-y-1 px-3">
                {items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const IconComponent = item.icon;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      whileHover={{ x: 4 }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      
                      {/* Badge pour nouveautés */}
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Indicateur admin */}
                      {item.path.startsWith('/admin/') && (
                        <Crown className="w-3 h-3 text-yellow-400" />
                      )}
                    </motion.button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay pour mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${
        isMobile 
          ? `fixed left-0 top-0 h-full w-80 transform transition-transform duration-300 z-50 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-80'
      } bg-gray-900 border-r border-gray-800 flex flex-col`}>
        
        {/* Header sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SYNERGIA</h1>
              <p className="text-xs text-gray-400">v3.5</p>
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          {renderNavigationSection('main', 'Principal', navigationItems.main)}
          {renderNavigationSection('gamification', 'Gamification', navigationItems.gamification)}
          {renderNavigationSection('progression', 'Progression', navigationItems.progression)}
          {renderNavigationSection('team', 'Équipe', navigationItems.team)}
          {renderNavigationSection('tools', 'Outils', navigationItems.tools)}
          
          {/* Section admin conditionnelle */}
          {adminItems.length > 0 && (
            <div className="border-t border-gray-800 pt-6">
              {renderNavigationSection('admin', 'Administration', adminItems, false)}
            </div>
          )}
        </nav>

        {/* Footer sidebar - Profil utilisateur */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400">
                {isAdmin(user) ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header mobile */}
        {isMobile && (
          <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-gray-900">SYNERGIA</span>
              </div>
              <div className="w-6" /> {/* Spacer */}
            </div>
          </header>
        )}

        {/* Zone de contenu */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
