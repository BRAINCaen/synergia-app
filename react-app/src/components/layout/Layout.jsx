// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT MIS À JOUR AVEC SYSTÈME DE PROGRESSION PAR RÔLES
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
    progression: true, // 🆕 Nouvelle section
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

  // Navigation structure COMPLÈTE avec système de progression
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
      id: 'progression', // 🆕 NOUVELLE SECTION
      title: 'Progression par Rôles',
      icon: Crown,
      highlight: true, // 🆕 Mise en évidence
      items: [
        { 
          path: '/role-progression', 
          label: 'Vue d\'ensemble', 
          icon: TrendingUp,
          description: 'Dashboard de progression'
        },
        { 
          path: '/role-tasks', 
          label: 'Tâches Spécialisées', 
          icon: Target,
          description: 'Tâches par niveau et rôle'
        },
        { 
          path: '/role-badges', 
          label: 'Badges Exclusifs', 
          icon: Medal,
          description: 'Collection de badges de rôle'
        }
      ]
    },
    {
      id: 'gamification',
      title: 'Gamification',
      icon: Trophy,
      items: [
        { path: '/gamification', label: 'Progression Générale', icon: Gamepad2 },
        { path: '/badges', label: 'Badges & Récompenses', icon: Medal },
        { path: '/rewards', label: 'Boutique', icon: Gift }
      ]
    },
    {
      id: 'team',
      title: 'Équipe & Social',
      icon: Users,
      items: [
        { path: '/team', label: 'Mon Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UserCheck }
      ]
    },
    {
      id: 'personal',
      title: 'Personnel',
      icon: User,
      items: [
        { path: '/profile', label: 'Mon Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings },
        { path: '/onboarding', label: 'Aide', icon: BookOpen },
        { path: '/timetrack', label: 'Temps', icon: Clock }
      ]
    }
  ];

  // Ajouter la section admin si l'utilisateur est admin
  if (isAdmin(user)) {
    navigationSections.push({
      id: 'admin',
      title: 'Administration',
      icon: Shield,
      items: [
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: CheckSquare },
        { path: '/admin/complete-test', label: 'Tests Complets', icon: Settings }
      ]
    });
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavigationItem = (item, isInSection = false) => {
    const isActive = location.pathname === item.path;
    
    return (
      <motion.div
        key={item.path}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={() => {
            navigate(item.path);
            if (isMobile) setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          } ${isInSection ? 'ml-4' : ''}`}
        >
          <item.icon className={`w-5 h-5 ${
            isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'
          }`} />
          
          <div className="flex-1 text-left">
            <div className={`font-medium ${isActive ? 'text-white' : ''}`}>
              {item.label}
            </div>
            {item.description && (
              <div className="text-xs text-gray-400 mt-0.5">
                {item.description}
              </div>
            )}
          </div>

          {/* Badge "Nouveau" pour les fonctionnalités de progression */}
          {item.path.includes('role-') && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
              Nouveau
            </span>
          )}

          {/* Indicateur d'activité */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="w-1 h-6 bg-white rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      </motion.div>
    );
  };

  const renderNavigationSection = (section) => {
    const isExpanded = expandedSections[section.id];
    const SectionIcon = section.icon;
    
    return (
      <div key={section.id} className="space-y-2">
        {/* En-tête de section */}
        <button
          onClick={() => toggleSection(section.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            section.highlight 
              ? 'bg-gradient-to-r from-orange-900 to-red-900 border border-orange-500/50' 
              : 'hover:bg-gray-700'
          }`}
        >
          <SectionIcon className={`w-5 h-5 ${
            section.highlight ? 'text-orange-400' : 'text-gray-400 group-hover:text-blue-400'
          }`} />
          
          <span className={`font-medium flex-1 text-left ${
            section.highlight ? 'text-orange-200' : 'text-gray-300 group-hover:text-white'
          }`}>
            {section.title}
          </span>

          {/* Badge spécial pour la section progression */}
          {section.highlight && (
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-orange-300 text-xs font-medium">HOT</span>
            </div>
          )}

          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'transform rotate-180' : ''
          }`} />
        </button>

        {/* Items de section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1 overflow-hidden"
            >
              {section.items.map(item => renderNavigationItem(item, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Overlay mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isMobile && !isSidebarOpen ? '-100%' : 0,
          width: isMobile ? '280px' : '300px'
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 z-50 flex flex-col ${
          isMobile ? 'w-80' : 'w-300'
        }`}
      >
        {/* En-tête avec profil utilisateur */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">
                {user?.displayName || 'Utilisateur'}
              </h3>
              <p className="text-gray-400 text-sm">
                {user?.role || 'Membre de l\'équipe'}
              </p>
            </div>
            
            {/* Menu hamburger mobile */}
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Badge de progression rapide */}
          <div className="mt-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-200 text-sm font-medium">Progression</span>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/4" />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Niveau 4</span>
              <span className="text-blue-300">2,450 XP</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {navigationSections.map(section => renderNavigationSection(section))}
        </div>

        {/* Pied de page avec déconnexion */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-red-600/20 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobile ? 'ml-0' : 'ml-300'
      }`}>
        {/* Header mobile */}
        {isMobile && (
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-white font-semibold">Synergia v3.5</h1>
            
            <div className="w-6" /> {/* Spacer */}
          </div>
        )}

        {/* Zone de contenu */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Notification toast pour les nouveautés */}
      <AnimatePresence>
        {location.pathname.includes('role-') && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 transform bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-30"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span className="font-medium">Nouvelle fonctionnalité !</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
