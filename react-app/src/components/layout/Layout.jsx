// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT PRINCIPAL CORRIGÉ - Function logout → signOut
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
  Flame
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

// Service admin simple
const isAdmin = (user) => {
  return user?.role === 'admin' || user?.email?.includes('admin');
};

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 🔧 CORRECTION: logout → signOut
  const { user, signOut } = useAuthStore();
  
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
      title: 'Équipe',
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
        { path: '/timetrack', label: 'Temps', icon: Clock },
        { path: '/settings', label: 'Paramètres', icon: Settings },
        { path: '/onboarding', label: 'Aide', icon: BookOpen }
      ]
    }
  ];

  // Ajouter section admin si permissions
  if (isAdmin(user)) {
    navigationSections.push({
      id: 'admin',
      title: 'Administration',
      icon: Shield,
      items: [
        { path: '/admin/task-validation', label: 'Validation', icon: CheckSquare },
        { path: '/admin/complete-test', label: 'Tests Système', icon: Settings }
      ]
    });
  }

  // Fonction pour gérer l'expansion des sections
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // 🔧 CORRECTION: Fonction de déconnexion corrigée
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Vérifier si un chemin est actif
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        bg-gray-900 text-white transition-all duration-300 flex flex-col
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 w-80 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'w-80'
        }
      `}>
        {/* Header Sidebar */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Synergia</h1>
                <p className="text-sm text-gray-400">v3.5.3</p>
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
        <div className="flex-1 overflow-y-auto py-4">
          {navigationSections.map((section) => (
            <div key={section.id} className="mb-6">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`
                  w-full px-6 py-2 text-left flex items-center justify-between text-sm font-medium
                  ${section.highlight 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-gray-300 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <section.icon className="w-4 h-4" />
                  <span>{section.title}</span>
                  {section.highlight && <Star className="w-3 h-3 text-yellow-400" />}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  expandedSections[section.id] ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Section Items */}
              {expandedSections[section.id] && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full px-8 py-2 text-left flex items-center space-x-3 text-sm
                        ${isActiveRoute(item.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <div className="flex-1">
                        <div>{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-gray-400">{item.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400">Membre actif</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col transition-all duration-300
        ${isMobile ? 'ml-0' : 'ml-300'}
      `}>
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
      {location.pathname.includes('role-') && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-30">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span className="font-medium">Nouvelle fonctionnalité !</span>
            <span className="text-xl">✨</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
