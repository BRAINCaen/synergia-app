// ==========================================
// 📁 react-app/src/App.jsx  
// Application principale RESPONSIVE - Mobile friendly
// ==========================================

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore.js';
import { useGameStore } from './shared/stores/gameStore.js';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Authentification
import { authService } from './core/firebase.js';

/**
 * 🎨 ÉCRAN DE CHARGEMENT PREMIUM (ORIGINAL)
 */
const PremiumLoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90"></div>
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
    
    <div className="relative z-10 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
          ⚡
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-2">
        Synergia
        <span className="ml-3 px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
          v3.5.1
        </span>
      </h1>
      
      <p className="text-xl text-blue-200 mb-8">
        Collaboration & Gamification
      </p>
      
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      <p className="text-blue-300 text-sm">
        Initialisation de l'application...
      </p>
    </div>
  </div>
);

/**
 * 🔐 PAGE DE CONNEXION PREMIUM (ORIGINAL)
 */
const PremiumLoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('🔐 Tentative de connexion Google...');
      
      const result = await authService.signInWithGoogle();
      console.log('✅ Connexion Google réussie:', result);
    } catch (error) {
      console.error('❌ Erreur de connexion Google:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-blue-900/90 to-purple-900/90"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              ⚡
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Bienvenue dans Synergia
            </h1>
            <p className="text-blue-200 text-sm sm:text-base">
              Plateforme de collaboration et gamification
            </p>
          </div>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Connexion...</span>
              </>
            ) : (
              <>
                <span>🔐</span>
                <span>Se connecter avec Google</span>
              </>
            )}
          </button>
          
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-blue-200/80">
              Connectez-vous pour accéder à vos projets,
              <br />
              tâches et système de gamification
            </p>
          </div>
        </div>
        
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-blue-300/60">
            Synergia v3.5.1 • Premium Edition
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 📱 HEADER MOBILE avec menu hamburger
 */
const MobileHeader = ({ onMenuToggle, isMenuOpen }) => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();

  const getUserInitials = () => {
    if (!user?.displayName && !user?.email) return 'U';
    const name = user.displayName || user.email;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
      {/* Logo et niveau */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">⚡</span>
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-sm">Synergia</h1>
          <p className="text-xs text-gray-500">Niveau {userStats?.level || 2} • {userStats?.totalXp || 175} XP</p>
        </div>
      </div>

      {/* User avatar et menu hamburger */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">{getUserInitials()}</span>
        </div>
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </div>
        </button>
      </div>
    </div>
  );
};

/**
 * 🎨 SIDEBAR PREMIUM RESPONSIVE
 */
const PremiumSidebar = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuthStore();
  const { userStats } = useGameStore();
  const location = useLocation();

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '✅' },
    { path: '/projects', label: 'Projets', icon: '📁' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/leaderboard', label: 'Classement', icon: '🏆' },
    { path: '/profile', label: 'Profil', icon: '👤' },
    { path: '/settings', label: 'Paramètres', icon: '⚙️' }
  ];

  const getUserInitials = () => {
    if (!user?.displayName && !user?.email) return 'U';
    const name = user.displayName || user.email;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Déconnexion...');
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const handleNavClick = () => {
    // Fermer le menu mobile lors d'un clic sur navigation
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        fixed lg:static 
        inset-y-0 left-0 
        w-72 
        bg-gradient-to-b from-gray-50 to-white 
        border-r border-gray-200 
        flex flex-col 
        h-screen 
        shadow-lg 
        transition-transform duration-300 ease-in-out 
        z-50
        lg:z-auto
      `}>
        {/* Header avec logo - Desktop only */}
        <div className="p-6 border-b border-gray-100 hidden lg:block">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">⚡</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Synergia</h1>
              <p className="text-xs text-gray-500">v3.5.1 • Premium</p>
            </div>
          </div>
        </div>

        {/* Header mobile avec fermeture */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">⚡</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Synergia</h1>
              <p className="text-xs text-gray-500">v3.5.1 • Premium</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-500 text-xl">✕</span>
          </button>
        </div>

        {/* Stats utilisateur */}
        <div className="p-4 mx-4 mt-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{getUserInitials()}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{user?.displayName || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          {/* Stats gamification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Niveau</span>
              <span className="text-sm font-bold text-blue-600">{userStats?.level || 2}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">XP Total</span>
              <span className="text-sm font-bold text-purple-600">{userStats?.totalXp || 175}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((userStats?.totalXp || 175) % 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Tâches</span>
              <span className="text-sm font-bold text-green-600">{userStats?.tasksCompleted || 12}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </a>
            );
          })}
        </nav>

        {/* Footer avec déconnexion */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};

/**
 * 🏗️ LAYOUT PREMIUM RESPONSIVE
 */
const PremiumLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header mobile */}
      <MobileHeader 
        onMenuToggle={toggleMobileMenu} 
        isMenuOpen={isMobileMenuOpen}
      />

      {/* Sidebar */}
      <PremiumSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={closeMobileMenu}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

/**
 * 🚀 COMPOSANT APP PRINCIPAL
 */
const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log('🚀 SYNERGIA v3.5.1 - INITIALISATION');
    
    const initApp = async () => {
      try {
        const unsubscribe = initializeAuth();
        
        window.forceDashboardReload = () => {
          console.log('🔄 Force reload dashboard');
          window.location.reload();
        };

        window.emergencyLogout = async () => {
          console.log('🚨 Emergency logout');
          await authService.signOut();
        };

        setAppReady(true);
        console.log('🎉 Application entièrement chargée et prête !');
        
        return unsubscribe;
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        setAppReady(true);
      }
    };

    initApp();
  }, [initializeAuth]);

  if (loading || !appReady) {
    return <PremiumLoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <PremiumLoginPage /> : <Navigate to="/dashboard" />} 
          />
          
          <Route
            path="/dashboard"
            element={user ? (
              <PremiumLayout>
                <Dashboard />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/tasks"
            element={user ? (
              <PremiumLayout>
                <TasksPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/projects"
            element={user ? (
              <PremiumLayout>
                <ProjectsPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/analytics"
            element={user ? (
              <PremiumLayout>
                <AnalyticsPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/leaderboard"
            element={user ? (
              <PremiumLayout>
                <LeaderboardPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/profile"
            element={user ? (
              <PremiumLayout>
                <ProfilePage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/settings"
            element={user ? (
              <PremiumLayout>
                <SettingsPage />
              </PremiumLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
