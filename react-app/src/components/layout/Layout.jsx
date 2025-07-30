// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT ULTRA-SIMPLE QUI FONCTIONNE GARANTIE
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
  Gamepad2
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // 📊 NAVIGATION SIMPLIFIÉE ET FONCTIONNELLE
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/tasks', label: 'Tâches', icon: CheckSquare },
    { path: '/projects', label: 'Projets', icon: FolderOpen },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/gamification', label: 'Gamification', icon: Gamepad2 },
    { path: '/badges', label: 'Badges', icon: Award },
    { path: '/team', label: 'Équipe', icon: Users },
    { path: '/profile', label: 'Profil', icon: User },
    { path: '/settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Version simplifiée */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}
                  `} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info et déconnexion */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-300" />
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
            className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
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

      {/* Contenu principal - ZONE CRITIQUE */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-900">Synergia</span>
          <div className="w-6"></div> {/* Spacer */}
        </div>

        {/* ZONE DE CONTENU PRINCIPAL - GARANTIE D'AFFICHAGE */}
        <main className="flex-1 bg-white overflow-auto">
          <div className="w-full h-full">
            {/* Container pour s'assurer que le contenu s'affiche */}
            <div className="min-h-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
