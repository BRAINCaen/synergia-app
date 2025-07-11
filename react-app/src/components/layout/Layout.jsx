// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT FINAL CORRIGÉ - UTILISE ROUTES CONSTANTS CORRECTES
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
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';
import { ROUTES } from '../../core/constants.js';

const Layout = () => { // ✅ Pas de props children car on utilise Outlet
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
      { id: 'rewards', path: ROUTES.REWARDS, label: 'Récompenses', icon: Gift },
      { id: 'leaderboard', path: ROUTES.LEADERBOARD, label: 'Classement', icon: Trophy }
    ],
    progression: [
      { id: 'role-progression', path: ROUTES.ROLE_PROGRESSION, label: 'Progression de Rôle', icon: TrendingUp },
      { id: 'role-tasks', path: ROUTES.ROLE_TASKS, label: 'Tâches de Rôle', icon: Target },
      { id: 'role-badges', path: ROUTES.ROLE_BADGES, label: 'Badges de Rôle', icon: Award }
    ],
    team: [
      { id: 'team', path: ROUTES.TEAM, label: 'Équipe', icon: Users },
      { id: 'users', path: ROUTES.USERS, label: 'Utilisateurs', icon: UserCheck }
    ],
    tools: [
      { id: 'profile', path: ROUTES.PROFILE, label: 'Profil', icon: User },
      { id: 'settings', path: ROUTES.SETTINGS, label: 'Paramètres', icon: Settings },
      { id: 'onboarding', path: ROUTES.ONBOARDING, label: 'Intégration', icon: BookOpen },
      { id: 'timetrack', path: ROUTES.TIMETRACK, label: 'Time Track', icon: Clock }
    ]
  };

  // Routes admin conditionnelles
  const adminItems = isAdmin(user) ? [
    { id: 'admin-task-validation', path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: Shield }
  ] : [];

  // Obtenir le titre de la page actuelle
  const getCurrentPageTitle = () => {
    const allItems = [
      ...navigationItems.main,
      ...navigationItems.gamification,
      ...navigationItems.progression,
      ...navigationItems.team,
      ...navigationItems.tools,
      ...adminItems
    ];
    
    const currentItem = allItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'SYNERGIA';
  };

  // Vérifier si un lien est actif
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Basculer l'expansion d'une section
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // Naviguer vers une route
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Rendu d'une section de navigation
  const renderNavigationSection = (sectionKey, title, items, defaultExpanded = true) => {
    const isExpanded = expandedSections[sectionKey] ?? defaultExpanded;
    
    return (
      <div key={sectionKey} className="mb-6">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-sm font-medium uppercase tracking-wide">{title}</span>
          <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1">
                {items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveLink(item.path);
                  
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 4 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Overlay mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
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
          {adminItems.length > 0 && renderNavigationSection('admin', 'Administration', adminItems, false)}
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
              className="text-gray-400 hover:text-white transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header principal */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          
          {/* Bouton menu mobile + titre */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getCurrentPageTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Star className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet /> {/* ✅ Utilise Outlet au lieu de children */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
