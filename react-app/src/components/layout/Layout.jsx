// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT MIS À JOUR AVEC DASHBOARD MANAGER
// ==========================================

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
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
  Activity // ← Import ajouté pour Dashboard Manager
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { ROUTES } from '../../core/constants.js';

const Layout = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Gérer la fermeture automatique du sidebar sur mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('👋 Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // 📊 NAVIGATION PRINCIPALE
  const mainNavItems = {
    main: [
      { id: 'dashboard', path: ROUTES.DASHBOARD, label: 'Dashboard', icon: Home },
      { id: 'tasks', path: ROUTES.TASKS, label: 'Tâches', icon: CheckSquare },
      { id: 'projects', path: ROUTES.PROJECTS, label: 'Projets', icon: FolderOpen },
      { id: 'analytics', path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 }
    ],
    gamification: [
      { id: 'gamification', path: ROUTES.GAMIFICATION, label: 'Gamification', icon: Gamepad2 },
      { id: 'badges', path: ROUTES.BADGES, label: 'Badges', icon: Award },
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

  // 🛡️ MENU ADMIN COMPLET AVEC DASHBOARD MANAGER
  const adminItems = (user?.email === 'alan.boehme61@gmail.com' || 
                     user?.role === 'admin' || 
                     user?.isAdmin === true ||
                     user?.profile?.role === 'admin') ?
    [
      { id: 'admin-dashboard-manager', path: ROUTES.ADMIN_DASHBOARD_MANAGER, label: 'Dashboard Manager', icon: Activity }, // ← AJOUTÉ
      { id: 'admin-task-validation', path: ROUTES.ADMIN_TASK_VALIDATION, label: 'Validation Tâches', icon: Shield },
      { id: 'admin-complete-test', path: ROUTES.ADMIN_COMPLETE_TEST, label: 'Test Complet', icon: TestTube },
      { id: 'admin-role-permissions', path: ROUTES.ADMIN_ROLE_PERMISSIONS, label: 'Permissions Rôles', icon: Lock },
      { id: 'admin-rewards', path: ROUTES.ADMIN_REWARDS, label: 'Gestion Récompenses', icon: Gift },
      { id: 'admin-badges', path: ROUTES.ADMIN_BADGES, label: 'Gestion Badges', icon: Trophy },
      { id: 'admin-users', path: ROUTES.ADMIN_USERS, label: 'Gestion Utilisateurs', icon: UsersIcon },
      { id: 'admin-analytics', path: ROUTES.ADMIN_ANALYTICS, label: 'Analytics Admin', icon: PieChart },
      { id: 'admin-settings', path: ROUTES.ADMIN_SETTINGS, label: 'Paramètres Admin', icon: SettingsIcon }
    ] : [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdminUser = adminItems.length > 0;

  // Composant MenuItem
  const MenuItem = ({ item, isAdmin = false }) => (
    <Link
      to={item.path}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
        isActive(item.path)
          ? isAdmin 
            ? 'bg-red-600 text-white'
            : 'bg-blue-600 text-white'
          : isAdmin
            ? 'text-red-300 hover:bg-red-800/50 hover:text-red-100'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
      title={item.label}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium">{item.label}</span>
    </Link>
  );

  // Composant Section
  const MenuSection = ({ title, items, isAdmin = false }) => (
    <div className="mb-6">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
        isAdmin ? 'text-red-400' : 'text-gray-400'
      }`}>
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Logo et titre */}
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold text-white">Synergia</h1>
          </div>
          
          {/* Bouton fermeture mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          
          {/* Navigation principale */}
          <MenuSection title="Principal" items={mainNavItems.main} />
          <MenuSection title="Gamification" items={mainNavItems.gamification} />
          <MenuSection title="Progression" items={mainNavItems.progression} />
          <MenuSection title="Équipe & Social" items={mainNavItems.team} />
          <MenuSection title="Outils" items={mainNavItems.tools} />
          
          {/* Navigation admin */}
          {isAdminUser && (
            <>
              <div className="border-t border-gray-700 my-6"></div>
              <MenuSection title="Administration" items={adminItems} isAdmin={true} />
            </>
          )}
        </div>

        {/* Profile utilisateur */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
