// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// SOLUTION ANTI-RE-RENDER - ÉTAT PROTÉGÉ
// ==========================================

import React, { useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, CheckSquare, FolderOpen, BarChart3, Trophy, Users, Settings, 
  Menu, X, User, LogOut, Award, Clock, BookOpen, UserCheck, Shield,
  Crown, TestTube, Lock, Gift, PieChart, Gamepad2, Zap
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

const isUserAdmin = (user) => {
  if (!user) return false;
  const adminEmails = ['alan.boehme61@gmail.com', 'tanguy.caron@gmail.com', 'admin@synergia.com'];
  return adminEmails.includes(user.email) || user.role === 'admin' || user.isAdmin === true;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  // ✅ PROTECTION ANTI-RE-RENDER avec useRef
  const sidebarStateRef = useRef(false);
  const [, forceUpdate] = useState({});
  
  // ✅ ÉTAT PROTÉGÉ qui survit aux re-renders
  const getSidebarOpen = () => sidebarStateRef.current;
  const setSidebarOpen = useCallback((value) => {
    console.log(`🔄 SIDEBAR: ${sidebarStateRef.current} → ${value}`);
    sidebarStateRef.current = value;
    forceUpdate({}); // Force le re-render de l'affichage
  }, []);

  const userIsAdmin = React.useMemo(() => {
    return isUserAdmin(user);
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      setSidebarOpen(false);
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  // ✅ FERMETURE CONTRÔLÉE
  const closeSidebar = useCallback(() => {
    console.log('🔴 FERMETURE DEMANDÉE');
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  const openSidebar = useCallback(() => {
    console.log('🟢 OUVERTURE DEMANDÉE');
    setSidebarOpen(true);
  }, [setSidebarOpen]);

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
      title: 'ÉQUIPE & SOCIAL',
      items: [
        { path: '/team', label: 'Équipe', icon: Users },
        { path: '/users', label: 'Utilisateurs', icon: UserCheck }
      ]
    },
    {
      title: 'OUTILS',
      items: [
        { path: '/onboarding', label: 'Intégration', icon: BookOpen },
        { path: '/timetrack', label: 'Pointeuse', icon: Clock },
        { path: '/profile', label: 'Mon Profil', icon: User },
        { path: '/settings', label: 'Paramètres', icon: Settings }
      ]
    }
  ];

  const adminSection = userIsAdmin ? {
    title: 'ADMINISTRATION',
    items: [
      { path: '/admin/task-validation', label: 'Validation Tâches', icon: Shield },
      { path: '/admin/complete-test', label: 'Test Admin', icon: TestTube },
      { path: '/admin/role-permissions', label: 'Permissions', icon: Lock },
      { path: '/admin/users', label: 'Admin Utilisateurs', icon: Crown },
      { path: '/admin/analytics', label: 'Admin Analytics', icon: PieChart },
      { path: '/admin/settings', label: 'Admin Config', icon: Settings }
    ]
  } : null;

  const allSections = adminSection ? [...navigationSections, adminSection] : navigationSections;
  const isActive = (path) => location.pathname === path;
  
  // ✅ VALEUR ACTUELLE PROTÉGÉE
  const sidebarOpen = getSidebarOpen();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* SIDEBAR DESKTOP IDENTIQUE */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-gray-900 z-30">
        <div className="flex items-center h-16 px-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold">Synergia</span>
              {userIsAdmin && <span className="text-red-400 text-xs ml-2">ADMIN</span>}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userIsAdmin ? 'Administrateur' : 'Membre'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {allSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isAdminItem = section.title === 'ADMINISTRATION';

                  return (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${active
                          ? isAdminItem ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'
                          : isAdminItem ? 'text-red-300 hover:bg-red-900' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`mr-3 w-5 h-5 ${
                        active
                          ? isAdminItem ? 'text-red-300' : 'text-blue-300'
                          : isAdminItem ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <span>{item.label}</span>
                      {isAdminItem && <Shield className="w-3 h-3 ml-auto text-red-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
          >
            <LogOut className="mr-3 w-5 h-5 text-gray-400" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        
        {/* ✅ OVERLAY MOBILE CONDITIONNEL */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
        )}

        {/* ✅ SIDEBAR MOBILE AVEC VISIBILITÉ CONTRÔLÉE */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-gray-900 transform transition-none">
            
            {/* Header Mobile */}
            <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white font-semibold">Synergia</span>
                  {userIsAdmin && <span className="text-red-400 text-xs ml-2">ADMIN</span>}
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="text-gray-400 hover:text-white p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Mobile */}
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.displayName || user?.email || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {userIsAdmin ? 'Administrateur' : 'Membre'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Mobile */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {allSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-6">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      const isAdminItem = section.title === 'ADMINISTRATION';

                      return (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          onClick={closeSidebar}
                          className={`
                            group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                            ${active
                              ? isAdminItem ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'
                              : isAdminItem ? 'text-red-300 hover:bg-red-900' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                          `}
                        >
                          <Icon className={`mr-3 w-5 h-5 ${
                            active
                              ? isAdminItem ? 'text-red-300' : 'text-blue-300'
                              : isAdminItem ? 'text-red-400' : 'text-gray-400'
                          }`} />
                          <span>{item.label}</span>
                          {isAdminItem && <Shield className="w-3 h-3 ml-auto text-red-400" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Déconnexion Mobile */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
              >
                <LogOut className="mr-3 w-5 h-5 text-gray-400" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}

        {/* HEADER MOBILE */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={openSidebar}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex items-center">
            Synergia
            {userIsAdmin && <span className="text-red-500 text-sm ml-2">ADMIN</span>}
          </h1>
          <div className="w-10" />
        </div>

        {/* CONTENU DES PAGES */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* ✅ DEBUG INFO (à supprimer en production) */}
      <div className="fixed bottom-4 right-4 bg-black text-white px-2 py-1 text-xs rounded lg:hidden">
        Sidebar: {sidebarOpen ? 'OUVERT' : 'FERMÉ'}
      </div>
    </div>
  );
};

export default Layout;
