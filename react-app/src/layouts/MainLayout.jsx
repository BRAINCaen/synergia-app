import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  BarChart3, 
  Users, 
  Award,
  Settings, 
  LogOut,
  Crown,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      description: 'Vue d\'ensemble personnelle'
    },
    {
      id: 'tasks',
      label: 'Mes Tâches',
      icon: CheckSquare,
      path: '/tasks',
      description: 'Gestion des tâches personnelles'
    },
    {
      id: 'projects',
      label: 'Projets',
      icon: FolderOpen,
      path: '/projects',
      description: 'Projets de l\'équipe'
    },
    {
      id: 'team',
      label: 'Équipe',
      icon: Users,
      path: '/team',
      description: 'Dashboard collaboratif équipe',
      highlight: true // Nouvelle fonctionnalité
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      description: 'Statistiques et rapports'
    },
    {
      id: 'leaderboard',
      label: 'Classement',
      icon: Award,
      path: '/leaderboard',
      description: 'Classement gamification'
    }
  ];

  // Items admin uniquement
  const adminItems = [
    {
      id: 'admin',
      label: 'Administration',
      icon: Crown,
      path: '/admin',
      description: 'Panneau administrateur'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('admin');

  return (
    <div className="min-h-screen bg-gray-900 flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        
        {/* Logo/Branding */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Synergia</h1>
              <p className="text-xs text-gray-400">Team Collaboration</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-white text-sm font-medium">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {user?.displayName || user?.email}
              </div>
              <div className="flex items-center gap-1">
                {isAdmin && <Crown className="w-3 h-3 text-yellow-400" />}
                <span className="text-gray-400 text-xs">
                  {user?.role === 'admin' ? 'Administrateur' : 
                   user?.role === 'manager' ? 'Manager' : 'Membre'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={item.description}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
                
                {/* Badge "Nouveau" pour l'équipe */}
                {item.highlight && (
                  <span className="ml-auto px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    New
                  </span>
                )}
              </button>
            );
          })}

          {/* Section Admin */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                  Administration
                </div>
              </div>
              {adminItems.map((item) => {
                const isActive = isActivePath(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-yellow-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title={item.description}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-yellow-400 group-hover:text-white'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          
          {/* Notifications/Messages */}
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
            <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Paramètres */}
          <button 
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </button>
          
          {/* Déconnexion */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Page Title */}
            <div>
              <h2 className="text-xl font-semibold text-white">
                {location.pathname === '/dashboard' && '📊 Dashboard Personnel'}
                {location.pathname === '/tasks' && '✅ Mes Tâches'}
                {location.pathname === '/projects' && '📁 Projets'}
                {location.pathname === '/team' && '👥 Dashboard Équipe'}
                {location.pathname === '/analytics' && '📈 Analytics'}
                {location.pathname === '/leaderboard' && '🏆 Classement'}
                {location.pathname === '/admin' && '👑 Administration'}
                {location.pathname === '/settings' && '⚙️ Paramètres'}
              </h2>
              <p className="text-gray-400 text-sm">
                {location.pathname === '/dashboard' && 'Vue d\'ensemble de vos activités'}
                {location.pathname === '/tasks' && 'Gérez vos tâches personnelles'}
                {location.pathname === '/projects' && 'Collaborez sur les projets d\'équipe'}
                {location.pathname === '/team' && 'Vue collaborative de l\'équipe - Qui fait quoi'}
                {location.pathname === '/analytics' && 'Statistiques et métriques de performance'}
                {location.pathname === '/leaderboard' && 'Classement et récompenses'}
                {location.pathname === '/admin' && 'Gestion et administration'}
                {location.pathname === '/settings' && 'Configuration et préférences'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              
              {/* Indicateur collaboration si sur page équipe */}
              {location.pathname === '/team' && (
                <div className="flex items-center gap-2 bg-green-900/20 border border-green-600/30 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Mode Collaboratif</span>
                </div>
              )}

              {/* Level et XP si disponibles */}
              {user?.gameData && (
                <div className="flex items-center gap-3 bg-gray-700 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">
                      Nv.{user.gameData.level}
                    </span>
                  </div>
                  <div className="w-16 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${(user.gameData.experience % 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {user.gameData.experience} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
