// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT CORRIGÉ - SUPPRESSION ERREURS BLOQUANTES
// ==========================================

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3, 
  Trophy, 
  Users, 
  Settings, 
  Menu, 
  X, 
  User, 
  LogOut,
  Target,
  Award,
  Flame,
  Clock,
  BookOpen,
  UserCheck,
  Shield,
  Crown,
  TestTube,
  Lock,
  Gift,
  PieChart,
  UsersIcon,
  SettingsIcon,
  Gamepad2,
  GraduationCap,
  Activity,
  Calendar,
  Zap,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🎯 LAYOUT PRINCIPAL CORRIGÉ
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🎯 Layout rendu pour:', user?.email);

  // Gérer la fermeture automatique du sidebar sur mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // ✅ NAVIGATION COMPLÈTE - STRUCTURE SIMPLIFIÉE
  const navigationSections = [
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
        { path: '/leaderboard', label: 'Classement', icon: Trophy },
        { path: '/rewards', label: 'Récompenses', icon: Gift }
      ]
    },
    {
      title: 'PROGRESSION',
      items: [
        { path: '/role-progression', label: 'Progression Rôles', icon: Target },
        { path: '/role-tasks', label: 'Tâches par Rôle', icon: CheckSquare },
        { path: '/role-badges', label: 'Badges Rôles', icon: Award },
        { path: '/escape-progression', label: 'Escape Progression', icon: Activity }
      ]
    },
    {
      title: 'ÉQUIPE & SOCIAL',
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UsersIcon }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Onboarding', icon: BookOpen },
        { path: '/time-track', label: 'Pointeuse', icon: Clock },
        { path: '/profile', label: 'Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { path: '/admin/dashboard-tuteur', label: 'Dashboard Tuteur', icon: GraduationCap },
        { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
        { path: '/admin/test', label: 'Test Complet', icon: TestTube },
        { path: '/admin/role-permissions', label: 'Permissions Rôles', icon: Lock },
        { path: '/admin/rewards', label: 'Gestion Récompenses', icon: Gift },
        { path: '/admin/badges', label: 'Gestion Badges', icon: Trophy },
        { path: '/admin/users', label: 'Gestion Utilisateurs', icon: Users },
        { path: '/admin/analytics', label: 'Analytics Admin', icon: PieChart },
        { path: '/admin/settings', label: 'Paramètres Admin', icon: SettingsIcon }
      ]
    }
  ];

  // Fonction pour déterminer si un item est actif
  const isActiveItem = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* ==========================================
          📱 SIDEBAR
          ========================================== */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        
        {/* Header sidebar */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-semibold">Synergia</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 pb-20 overflow-y-auto">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveItem(item.path);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                        ${isActive
                          ? 'bg-gray-800 text-white border-r-2 border-blue-500'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`
                        mr-3 flex-shrink-0 h-4 w-4 transition-colors duration-200
                        ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}
                      `} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info et déconnexion */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-white text-sm font-medium">
                  {user?.displayName?.[0] || user?.email?.[0] || '?'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* ==========================================
          📱 OVERLAY MOBILE
          ========================================== */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==========================================
          📄 CONTENU PRINCIPAL
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-semibold text-gray-900">Synergia</span>
            </div>
            <div className="w-6 h-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Contenu des pages */}
        <main className="flex-1 overflow-auto">
          {/* ✅ RENDU DIRECT DES ENFANTS */}
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ Layout.jsx corrigé et simplifié');
console.log('🎯 Sidebar complète avec toutes les pages');
console.log('🚀 Rendu direct des enfants sans Outlet');
