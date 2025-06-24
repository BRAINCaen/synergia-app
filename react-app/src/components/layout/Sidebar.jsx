// react-app/src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3, 
  Trophy, 
  User, 
  Users, 
  LogOut,
  Menu,
  X,
  Star,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore';
import { useGameStore } from '../../shared/stores/gameStore';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, signOut } = useAuthStore();
  const { userStats } = useGameStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Tâches',
      href: '/tasks',
      icon: CheckSquare,
      description: 'Gestion des tâches'
    },
    {
      name: 'Projets',
      href: '/projects',
      icon: FolderOpen,
      description: 'Gestion des projets'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Statistiques et analyses'
    },
    {
      name: 'Classement',
      href: '/leaderboard',
      icon: Trophy,
      description: 'Leaderboard'
    },
    {
      name: 'Profil',
      href: '/profile',
      icon: User,
      description: 'Mon profil'
    }
  ];

  // Ajouter la page Utilisateurs pour les admins
  if (user?.role === 'admin') {
    navigationItems.splice(-1, 0, {
      name: 'Utilisateurs',
      href: '/users',
      icon: Users,
      description: 'Gestion des utilisateurs'
    });
  }

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
      onClick={() => window.innerWidth < 1024 && onToggle()}
    >
      <item.icon className="mr-3 h-5 w-5" />
      <span className="flex-1">{item.name}</span>
    </NavLink>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg bg-white shadow-lg text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Logo et titre */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-white">Synergia</span>
          </div>
        </div>

        {/* Profile section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  <span>Niveau {userStats?.level || 1}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Zap className="h-3 w-3 mr-1 text-blue-500" />
                  <span>{userStats?.totalXP || 0} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progression</span>
              <span>{userStats?.progressToNextLevel || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${userStats?.progressToNextLevel || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Se déconnecter
          </button>
        </div>

        {/* Gamification stats */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="text-xs text-gray-600 mb-2 font-semibold">
            Statistiques Gamification
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-white rounded-lg shadow-sm">
              <div className="text-lg font-bold text-blue-600">
                {userStats?.completedTasks || 0}
              </div>
              <div className="text-xs text-gray-500">Tâches</div>
            </div>
            
            <div className="text-center p-2 bg-white rounded-lg shadow-sm">
              <div className="text-lg font-bold text-purple-600">
                {userStats?.badges?.length || 0}
              </div>
              <div className="text-xs text-gray-500">Badges</div>
            </div>
          </div>

          {/* Version */}
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-400">Synergia v3.5</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
