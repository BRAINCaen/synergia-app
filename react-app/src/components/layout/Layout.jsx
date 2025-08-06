// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT STABLE AVEC DÉTECTION ADMIN CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Gamepad2,
  GraduationCap,
  Activity,
  Calendar,
  Zap,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🛡️ DÉTECTION ADMIN AMÉLIORÉE
 */
const isUserAdmin = (user) => {
  if (!user) return false;
  
  // Plusieurs méthodes de détection admin
  const adminChecks = [
    user.role === 'admin',
    user.isAdmin === true,
    user.profile?.role === 'admin',
    user.customClaims?.admin === true,
    user.permissions?.includes('admin_access'),
    user.email === 'admin@synergia.com', // Admin par défaut
    user.email === 'alain.bochec4@gmail.com' // Votre email admin
  ];
  
  const isAdmin = adminChecks.some(check => check === true);
  console.log('🛡️ Vérification admin:', { 
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    profileRole: user.profile?.role,
    result: isAdmin
  });
  
  return isAdmin;
};

/**
 * 🎯 LAYOUT PRINCIPAL STABLE AVEC ADMIN
 */
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🎯 Layout avec admin - User:', user?.email);

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

  // Détecter si l'utilisateur est admin
  const userIsAdmin = isUserAdmin(user);

  // ✅ NAVIGATION COMPLÈTE AVEC ADMIN
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
        { path: '/achievements', label: 'Accomplissements', icon: Star }
      ]
    },
    {
      title: 'ÉQUIPE',
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UserCheck }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Intégration', icon: BookOpen },
        { path: '/timetrack', label: 'Time Track', icon: Clock },
        { path: '/profile', label: 'Mon Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  // ✅ SECTION ADMIN CONDITIONNELLE
  const adminSection = {
    title: 'ADMINISTRATION',
    items: [
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield, badge: 'Admin' },
      { path: '/admin/complete-test', label: 'Test Complet', icon: TestTube, badge: 'Admin' },
      { path: '/admin/role-permissions', label: 'Permissions Rôles', icon: Lock, badge: 'Admin' },
      { path: '/admin/users', label: 'Gestion Utilisateurs', icon: Crown, badge: 'Admin' },
      { path: '/admin/analytics', label: 'Analytics Admin', icon: PieChart, badge: 'Admin' },
      { path: '/admin/settings', label: 'Paramètres Admin', icon: Settings, badge: 'Admin' }
    ]
  };

  // Ajouter la section admin si l'utilisateur est admin
  const allSections = userIsAdmin 
    ? [...navigationSections, adminSection]
    : navigationSections;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Synergia</h1>
              <p className="text-sm text-gray-600">v3.5 • {userIsAdmin ? 'Admin' : 'Standard'}</p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
              {user?.displayName?.[0] || user?.email?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              {userIsAdmin && (
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-600 font-medium">Administrateur</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {allSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-8' : ''}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isAdminItem = section.title === 'ADMINISTRATION';

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        active
                          ? isAdminItem
                            ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                            : 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                          : isAdminItem
                            ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-3 w-5 h-5 ${
                        active
                          ? isAdminItem ? 'text-red-500' : 'text-blue-500'
                          : isAdminItem ? 'text-red-400' : 'text-gray-400'
                      } group-hover:${isAdminItem ? 'text-red-500' : 'text-gray-500'}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          item.badge === 'Admin' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 w-5 h-5 text-gray-400" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Synergia</h1>
          <div className="w-10"></div>
        </div>

        {/* Zone de contenu */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
