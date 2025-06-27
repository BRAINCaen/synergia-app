// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// CODE COMPLET - Remplacer entièrement le fichier existant
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search,
  Menu,
  X,
  LogOut
} from 'lucide-react';

// ✅ NOUVEAU: Hook Firebase pour synchronisation temps réel
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  
  // États de l'interface
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const [unreadCount] = useState(3);
  
  // ✅ NOUVEAU: États Firebase pour synchronisation
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // ✅ NOUVEAU: Synchronisation Firebase temps réel
  useEffect(() => {
    if (!user?.uid) {
      setUserData(null);
      setUserLoading(false);
      return;
    }

    console.log('🔄 DashboardLayout - Synchronisation Firebase pour:', user.uid);
    
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        console.log('✅ DashboardLayout - Données Firebase mises à jour:', data.gamification?.totalXp);
      }
      setUserLoading(false);
    }, (error) => {
      console.error('❌ Erreur Firebase DashboardLayout:', error);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ NOUVEAU: Calcul des statistiques depuis Firebase
  const getFirebaseStats = () => {
    if (!userData || userLoading) {
      return {
        level: 1,
        totalXp: 0,
        tasksCompleted: 0,
        projectsCreated: 0,
        badges: 0,
        loginStreak: 0,
        progressPercent: 0
      };
    }

    const gamification = userData.gamification || {};
    const stats = {
      level: gamification.level || 1,
      totalXp: gamification.totalXp || 0,
      tasksCompleted: gamification.tasksCompleted || 0,
      projectsCreated: gamification.projectsCreated || 0,
      badges: (gamification.badges || []).length,
      loginStreak: gamification.loginStreak || 0
    };

    // Calcul progression niveau
    const currentLevelXP = (stats.level - 1) * 100;
    const nextLevelXP = stats.level * 100;
    const progressXP = stats.totalXp - currentLevelXP;
    stats.progressPercent = Math.min(100, Math.max(0, (progressXP / 100) * 100));

    return stats;
  };

  const stats = getFirebaseStats();

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // Navigation sections
  const navigationSections = [
    {
      title: '📊 Principal',
      key: 'main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: '🏠', current: location.pathname === '/dashboard' },
        { name: 'Tâches', href: '/tasks', icon: '✅', current: location.pathname === '/tasks' },
        { name: 'Projets', href: '/projects', icon: '📁', current: location.pathname === '/projects' },
        { name: 'Analytics', href: '/analytics', icon: '📊', current: location.pathname === '/analytics' },
      ]
    },
    {
      title: '🎮 Gamification',
      key: 'gamification',
      items: [
        { name: 'Gamification', href: '/gamification', icon: '🎮', current: location.pathname === '/gamification', description: 'XP, badges, classement' },
        { name: 'Récompenses', href: '/rewards', icon: '🎁', current: location.pathname === '/rewards' },
      ]
    },
    {
      title: '👥 Collaboration',
      key: 'collaboration',
      items: [
        { name: 'Utilisateurs', href: '/users', icon: '👥', current: location.pathname === '/users', description: 'Équipe & classement' },
        { name: 'Intégration', href: '/onboarding', icon: '🎯', current: location.pathname === '/onboarding', badge: 'NEW' },
      ]
    },
    {
      title: '⚙️ Outils',
      key: 'tools',
      items: [
        { name: 'Time Track', href: '/timetrack', icon: '⏰', current: location.pathname === '/timetrack' },
        { name: 'Mon Profil', href: '/profile', icon: '👤', current: location.pathname === '/profile' },
        { name: 'Paramètres', href: '/settings', icon: '⚙️', current: location.pathname === '/settings' },
      ]
    }
  ];

  const userInitials = user?.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?';

  const renderNavigationSection = (section) => (
    <div key={section.key} className="mb-4">
      <button
        onClick={() => toggleSection(section.key)}
        className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
      >
        <span>{section.title}</span>
        <span className="text-xs">
          {collapsedSections[section.key] ? '▼' : '▲'}
        </span>
      </button>
      
      {!collapsedSections[section.key] && (
        <nav className="mt-2 space-y-1">
          {section.items.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                item.current
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-500 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 text-lg">{item.icon}</span>
                <div>
                  <div>{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </div>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  item.badge === 'NEW' ? 'bg-green-100 text-green-800' : 
                  item.badge === 'HOT' ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );

  // ✅ NOUVEAU: Widget Progression Firebase synchronisé
  const renderProgressionWidget = () => {
    if (userLoading) {
      return (
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 border-b border-gray-200">
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">
            ✅ Progression Firebase
          </h3>
          
          {/* ✅ NOUVEAU: Données depuis Firebase temps réel */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Niveau {stats.level}</span>
              <span className="text-gray-600">{stats.totalXp} XP</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.progressPercent}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <span>🎯 {stats.tasksCompleted} tâches</span>
              <span>🏆 {stats.badges} badges</span>
              <span>📁 {stats.projectsCreated} projets</span>
              <span>🔥 {stats.loginStreak} jour(s)</span>
            </div>

            {/* Indicateur de synchronisation */}
            <div className="flex items-center justify-center space-x-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Synchronisé</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}>
        
        {/* Header sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">Synergia v3.5</h1>
                <p className="text-xs text-gray-500">11 pages essentielles</p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        {!collapsed && (
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            {navigationSections.map(renderNavigationSection)}
          </div>
        )}

        {/* ✅ NOUVEAU: Widget Progression Firebase synchronisé */}
        {!collapsed && renderProgressionWidget()}

        {/* Profil utilisateur en bas de sidebar */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{userInitials}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 truncate">
                  {user?.displayName || 'Utilisateur'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header principal */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {navigationSections.flatMap(s => s.items).find(item => item.current)?.name || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Barre de recherche */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Raccourcis rapides optimisés */}
              <div className="hidden md:flex items-center space-x-2">
                {location.pathname !== '/onboarding' && (
                  <Link
                    to="/onboarding"
                    className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    <span>🎯</span>
                    <span>Intégration</span>
                  </Link>
                )}
                
                {location.pathname !== '/gamification' && (
                  <Link
                    to="/gamification"
                    className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    <span>🎮</span>
                    <span>Badges</span>
                  </Link>
                )}
              </div>

              {/* Profil utilisateur header */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-xs font-medium text-white">{userInitials}</span>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-700">
                      {user?.displayName || 'Utilisateur'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Niveau {stats.level} • {stats.totalXp} XP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
