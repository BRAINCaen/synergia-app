// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT PRINCIPAL - Menu à gauche responsive + vraies pages reconnectées
// ==========================================

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { isAdmin } from '../../core/services/adminService.js';

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

  // Navigation structure complète
  const navigationSections = [
    {
      id: 'main',
      title: 'Principal',
      icon: Home,
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/tasks', label: 'Tâches', icon: CheckSquare },
        { path: '/projects', label: 'Projets', icon: FolderOpen },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 }
      ]
    },
    {
      id: 'gamification',
      title: 'Gamification',
      icon: Trophy,
      items: [
        { path: '/leaderboard', label: 'Classement', icon: Trophy },
        { path: '/badges', label: 'Badges', icon: Medal },
        { path: '/gamification', label: 'Progression', icon: Gamepad2 },
        { path: '/rewards', label: 'Récompenses', icon: Gift }
      ]
    },
    {
      id: 'team',
      title: 'Équipe & Social',
      icon: Users,
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UserCheck }
      ]
    },
    {
      id: 'personal',
      title: 'Personnel',
      icon: User,
      items: [
        { path: '/profile', label: 'Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings },
        { path: '/onboarding', label: 'Guide', icon: BookOpen },
        { path: '/timetrack', label: 'Temps', icon: Clock }
      ]
    }
  ];

  // Section admin conditionnelle
  const adminSection = {
    id: 'admin',
    title: 'Administration',
    icon: Shield,
    items: [
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: CheckSquare },
      { path: '/admin/profile-test', label: 'Test Profil', icon: User },
      { path: '/admin/complete-test', label: 'Test Complet', icon: Settings }
    ]
  };

  // Ajouter la section admin si l'utilisateur est admin
  const allSections = isAdmin(user) 
    ? [...navigationSections, adminSection]
    : navigationSections;

  // Toggle section
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Navigation handler
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Check if route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <>
            {/* Mobile overlay */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar content */}
            <motion.div
              initial={isMobile ? { x: -300 } : false}
              animate={isMobile ? { x: 0 } : {}}
              exit={isMobile ? { x: -300 } : {}}
              className={`
                fixed left-0 top-0 h-full w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 z-40
                flex flex-col overflow-hidden
                ${isMobile ? 'shadow-2xl' : ''}
              `}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Synergia</h1>
                    <p className="text-sm text-gray-300">v3.5</p>
                  </div>
                </div>

                {/* User info */}
                {user && (
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-300">
                        {isAdmin(user) ? '👑 Administrateur' : '👤 Utilisateur'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allSections.map((section) => {
                  const SectionIcon = section.icon;
                  const isExpanded = expandedSections[section.id];
                  
                  return (
                    <div key={section.id} className="space-y-1">
                      {/* Section header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <SectionIcon className="w-5 h-5" />
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Section items */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-4 space-y-1 overflow-hidden"
                          >
                            {section.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isActive = isActiveRoute(item.path);
                              
                              return (
                                <button
                                  key={item.path}
                                  onClick={() => handleNavigation(item.path)}
                                  className={`
                                    w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                                    ${isActive 
                                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-400/30' 
                                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }
                                  `}
                                >
                                  <ItemIcon className="w-4 h-4" />
                                  <span className="font-medium">{item.label}</span>
                                  {isActive && (
                                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />
                                  )}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Footer avec déconnexion */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`
        transition-all duration-300 min-h-screen
        ${isSidebarOpen && !isMobile ? 'ml-80' : 'ml-0'}
      `}>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
