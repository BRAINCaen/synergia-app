// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT PRINCIPAL AVEC INTÉGRATION BADGES V3.5
// ==========================================

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Gamepad2, 
  Gift, 
  Trophy, 
  Target, 
  User, 
  Settings, 
  LogOut, 
  Shield,
  BarChart3,
  CheckSquare,
  FolderOpen,
  Clock,
  Star,
  Zap,
  Bell,
  Award
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

// 🏆 IMPORT HOOKS BADGES POUR AFFICHAGE TEMPS RÉEL
import { useBadges } from '../../shared/hooks/useBadges.js';

// ==========================================
// 🧭 CONFIGURATION DE LA NAVIGATION
// ==========================================
const NAVIGATION_CONFIG = {
  main: [
    { path: '/dashboard', name: 'Dashboard', icon: Home, color: 'blue' },
    { path: '/tasks', name: 'Tâches', icon: CheckSquare, color: 'green' },
    { path: '/projects', name: 'Projets', icon: FolderOpen, color: 'purple' },
    { path: '/team', name: 'Équipe', icon: Users, color: 'indigo' },
    { path: '/analytics', name: 'Analytics', icon: BarChart3, color: 'yellow' }
  ],
  gamification: [
    { path: '/gamification', name: 'Gamification', icon: Gamepad2, color: 'purple', badge: 'XP' },
    { path: '/rewards', name: 'Récompenses', icon: Gift, color: 'pink', badge: 'NEW' },
    { path: '/badges', name: 'Badges', icon: Trophy, color: 'yellow', badge: 'HOT' }, // 🏆 PAGE REFAITE
    { path: '/progression', name: 'Progression', icon: Target, color: 'orange' }
  ],
  personal: [
    { path: '/profile', name: 'Mon Profil', icon: User, color: 'gray' },
    { path: '/timetrack', name: 'Pointeuse', icon: Clock, color: 'blue' },
    { path: '/settings', name: 'Paramètres', icon: Settings, color: 'gray' }
  ],
  admin: [
    { path: '/admin/task-validation', name: 'Validation Tâches', icon: Shield, color: 'red' },
    { path: '/admin/objective-validation', name: 'Validation Objectifs', icon: Target, color: 'red' },
    { path: '/admin/users', name: 'Gestion Utilisateurs', icon: Users, color: 'red' },
    { path: '/admin/badges', name: 'Gestion Badges', icon: Trophy, color: 'red' },
    { path: '/admin/settings', name: 'Paramètres Admin', icon: Settings, color: 'red' }
  ]
};

// ==========================================
// 🎨 COMPOSANT BADGE DE NOTIFICATION
// ==========================================
const NotificationBadge = ({ count, color = 'red' }) => {
  if (!count || count === 0) return null;
  
  return (
    <span className={`absolute -top-1 -right-1 bg-${color}-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse`}>
      {count > 9 ? '9+' : count}
    </span>
  );
};

// ==========================================
// 🏆 COMPOSANT MINI WIDGET BADGES
// ==========================================
const BadgeWidget = () => {
  const { userBadges, stats, loading } = useBadges();
  
  if (loading) return null;

  const recentBadges = userBadges.slice(-3).reverse(); // Derniers 3 badges

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-3 mb-4 border border-yellow-500/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-white">Badges</span>
        </div>
        <span className="text-xs text-yellow-400">
          {stats?.earned || 0}/{stats?.total || 0}
        </span>
      </div>
      
      {recentBadges.length > 0 ? (
        <div className="flex space-x-1">
          {recentBadges.map((badge, index) => (
            <div
              key={badge.id}
              className="text-lg"
              title={badge.name}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {badge.icon}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">Aucun badge encore</p>
      )}
    </div>
  );
};

// ==========================================
// 🔔 COMPOSANT CENTRE DE NOTIFICATIONS
// ==========================================
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Écouter les nouveaux badges
    const handleNewBadge = (event) => {
      const { badge } = event.detail;
      const notification = {
        id: Date.now(),
        type: 'badge',
        title: 'Nouveau Badge !',
        message: `${badge.name} débloqué`,
        icon: badge.icon,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    };

    window.addEventListener('badgeUnlocked', handleNewBadge);
    
    return () => {
      window.removeEventListener('badgeUnlocked', handleNewBadge);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-900/30' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{notification.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-300">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 🧭 COMPOSANT ÉLÉMENT DE NAVIGATION
// ==========================================
const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive: navIsActive }) => {
        const active = navIsActive || isActive;
        return `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
          active
            ? `bg-${item.color}-600 text-white shadow-lg`
            : `text-gray-300 hover:bg-gray-700 hover:text-white`
        }`;
      }}
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        {item.badge && (
          <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold transform -rotate-12 animate-pulse`}>
            {item.badge}
          </span>
        )}
      </div>
      <span className="flex-1">{item.name}</span>
      
      {/* Indicateur visuel pour page active */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${item.color}-400 rounded-r transition-opacity duration-200 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`} />
    </NavLink>
  );
};

// ==========================================
// 🏠 COMPOSANT LAYOUT PRINCIPAL
// ==========================================
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout, isAdmin } = useAuthStore();
  const location = useLocation();

  // 🏆 DONNÉES BADGES TEMPS RÉEL
  const { stats: badgeStats, loading: badgesLoading } = useBadges();

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fermer sidebar au changement de route
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* ==========================================
          📱 SIDEBAR MOBILE OVERLAY
          ========================================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==========================================
          🧭 SIDEBAR NAVIGATION
          ========================================== */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Synergia</h1>
              <p className="text-xs text-gray-400">v3.5 • Badges Premium</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profil utilisateur */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.displayName?.[0] || user?.email?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {isAdmin ? '👑 Administrateur' : '👤 Membre'}
              </p>
              {!badgesLoading && badgeStats && (
                <p className="text-xs text-yellow-400">
                  🏆 {badgeStats.earned} badges • {badgeStats.percentage}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 🏆 Widget Badges */}
        <div className="p-4 border-b border-gray-700">
          <BadgeWidget />
        </div>

        {/* Navigation principale */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section principale */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Principal
            </h4>
            <div className="space-y-1">
              {NAVIGATION_CONFIG.main.map(item => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isCurrentPath(item.path)}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </div>
          </div>

          {/* Section Gamification */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
              🎮 Gamification
              <Star className="w-3 h-3 ml-2 text-yellow-400 animate-pulse" />
            </h4>
            <div className="space-y-1">
              {NAVIGATION_CONFIG.gamification.map(item => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isCurrentPath(item.path)}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </div>
          </div>

          {/* Section Personnel */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Personnel
            </h4>
            <div className="space-y-1">
              {NAVIGATION_CONFIG.personal.map(item => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isCurrentPath(item.path)}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </div>
          </div>

          {/* Section Admin */}
          {isAdmin && (
            <div>
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center">
                <Shield className="w-3 h-3 mr-2" />
                Administration
              </h4>
              <div className="space-y-1">
                {NAVIGATION_CONFIG.admin.map(item => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={isCurrentPath(item.path)}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {/* Horloge */}
          <div className="text-center">
            <p className="text-lg font-mono text-white">
              {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <p className="text-xs text-gray-400">
              {currentTime.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </p>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          📱 HEADER MOBILE
          ========================================== */}
      <div className="md:ml-80">
        <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Bouton menu mobile */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>

                {/* Titre de page */}
                <div className="hidden sm:block">
                  <h2 className="text-lg font-semibold text-white">
                    {NAVIGATION_CONFIG.main.find(item => isCurrentPath(item.path))?.name ||
                     NAVIGATION_CONFIG.gamification.find(item => isCurrentPath(item.path))?.name ||
                     NAVIGATION_CONFIG.personal.find(item => isCurrentPath(item.path))?.name ||
                     (isAdmin && NAVIGATION_CONFIG.admin.find(item => isCurrentPath(item.path))?.name) ||
                     'Synergia'}
                  </h2>
                </div>
              </div>

              {/* Actions header */}
              <div className="flex items-center space-x-4">
                {/* Niveau et XP */}
                {!badgesLoading && badgeStats && (
                  <div className="hidden sm:flex items-center space-x-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">
                      {badgeStats.earned} badges
                    </span>
                    <div className="w-px h-4 bg-gray-600" />
                    <span className="text-yellow-400">
                      {badgeStats.totalXpFromBadges} XP
                    </span>
                  </div>
                )}

                {/* Centre de notifications */}
                <NotificationCenter />

                {/* Avatar utilisateur */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user?.displayName?.[0] || user?.email?.[0] || '?'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ==========================================
            📄 CONTENU PRINCIPAL
            ========================================== */}
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
