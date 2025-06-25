// ==========================================
// 📁 react-app/src/App.jsx  
// Design EXACT Synergia avec couleurs de l'image
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
 * 🎨 ÉCRAN DE CHARGEMENT SYNERGIA EXACT
 */
const SynergiaLoadingScreen = () => (
  <div className="min-h-screen bg-[#1a1b3a] flex items-center justify-center">
    {/* Arrière-plan exact */}
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#4c1d95]"></div>
    
    <div className="relative z-10 text-center">
      {/* Logo Synergia */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
          ⚡
        </div>
      </div>
      
      {/* Titre avec badge */}
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-4xl font-bold text-white mr-4">Synergia</h1>
        <span className="px-3 py-1 text-sm bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-full font-medium">
          v3.5 • Premium
        </span>
      </div>
      
      {/* Animation de chargement */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="w-3 h-3 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-[#8b5cf6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-[#ec4899] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      <p className="text-[#a5b4fc] text-sm">
        Chargement de votre espace collaboratif...
      </p>
    </div>
  </div>
);

/**
 * 🔐 PAGE DE CONNEXION SYNERGIA EXACT
 */
const SynergiaLoginPage = () => {
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
    <div className="min-h-screen bg-[#1a1b3a] flex items-center justify-center p-4 sm:p-6">
      {/* Arrière-plan exact */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#4c1d95]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Card de connexion glassmorphism */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Header avec logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-xl font-bold shadow-lg">
              ⚡
            </div>
            <div className="flex items-center justify-center mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mr-3">Synergia</h1>
              <span className="px-2 py-1 text-xs bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-full font-medium">
                v3.5 • Premium
              </span>
            </div>
            <p className="text-[#a5b4fc] text-sm">
              Collaboration & Gamification
            </p>
          </div>
          
          {/* Bouton de connexion */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5856eb] hover:to-[#7c3aed] text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
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
            <p className="text-xs sm:text-sm text-[#a5b4fc]/80">
              Connectez-vous pour accéder à vos projets,
              <br />
              tâches et système de gamification
            </p>
          </div>
        </div>
        
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-[#a5b4fc]/60">
            Synergia v3.5 • Premium Edition
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 📱 HEADER MOBILE SYNERGIA
 */
const SynergiaHeader = ({ onMenuToggle, isMenuOpen }) => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();

  const getUserInitials = () => {
    if (!user?.displayName && !user?.email) return 'U';
    const name = user.displayName || user.email;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-[#1a1b3a] border-b border-[#6366f1]/20 px-4 py-3 flex items-center justify-between lg:hidden">
      {/* Logo et stats */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">⚡</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-white text-sm">Synergia</h1>
            <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-full">
              v3.5
            </span>
          </div>
          <p className="text-xs text-[#a5b4fc]">Niveau {userStats?.level || 2} • {userStats?.totalXp || 175} XP</p>
        </div>
      </div>

      {/* User et menu */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#ec4899] to-[#be185d] rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">{getUserInitials()}</span>
        </div>
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </div>
        </button>
      </div>
    </div>
  );
};

/**
 * 🎨 SIDEBAR SYNERGIA EXACT
 */
const SynergiaSidebar = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuthStore();
  const { userStats } = useGameStore();
  const location = useLocation();

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', gradient: 'from-[#6366f1] to-[#8b5cf6]' },
    { path: '/tasks', label: 'Tâches', icon: '✅', gradient: 'from-[#10b981] to-[#059669]' },
    { path: '/projects', label: 'Projets', icon: '📁', gradient: 'from-[#8b5cf6] to-[#a855f7]' },
    { path: '/analytics', label: 'Analytics', icon: '📊', gradient: 'from-[#f59e0b] to-[#d97706]' },
    { path: '/leaderboard', label: 'Classement', icon: '🏆', gradient: 'from-[#eab308] to-[#ca8a04]' },
    { path: '/profile', label: 'Profil', icon: '👤', gradient: 'from-[#ec4899] to-[#be185d]' },
    { path: '/settings', label: 'Paramètres', icon: '⚙️', gradient: 'from-[#6b7280] to-[#4b5563]' }
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
        bg-gradient-to-b from-[#1a1b3a] to-[#0f172a] 
        border-r border-[#6366f1]/20 
        flex flex-col 
        h-screen 
        shadow-2xl 
        transition-transform duration-300 ease-in-out 
        z-50
        lg:z-auto
      `}>
        {/* Header avec logo - Desktop */}
        <div className="p-6 border-b border-[#6366f1]/20 hidden lg:block">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-white text-xl">Synergia</h1>
                <span className="px-2 py-1 text-xs bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-full">
                  v3.5 • Premium
                </span>
              </div>
              <p className="text-xs text-[#a5b4fc]">Collaboration & Gamification</p>
            </div>
          </div>
        </div>

        {/* Header mobile */}
        <div className="p-4 border-b border-[#6366f1]/20 flex items-center justify-between lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">⚡</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-white text-lg">Synergia</h1>
                <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-full">
                  v3.5
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="text-white text-xl">✕</span>
          </button>
        </div>

        {/* Stats utilisateur glassmorphism */}
        <div className="p-4 mx-4 mt-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#be185d] rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">{getUserInitials()}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{user?.displayName || 'Utilisateur'}</p>
              <p className="text-xs text-[#a5b4fc]">{user?.email}</p>
            </div>
          </div>
          
          {/* Stats gamification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a5b4fc]">Niveau</span>
              <span className="text-sm font-bold text-[#6366f1]">{userStats?.level || 2}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a5b4fc]">XP Total</span>
              <span className="text-sm font-bold text-[#8b5cf6]">{userStats?.totalXp || 175}</span>
            </div>
            {/* Barre de progression */}
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((userStats?.totalXp || 175) % 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#a5b4fc]">Tâches</span>
              <span className="text-sm font-bold text-[#10b981]">{userStats?.tasksCompleted || 12}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105` 
                    : 'text-[#a5b4fc] hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </a>
            );
          })}
        </nav>

        {/* Footer déconnexion */}
        <div className="p-4 border-t border-[#6366f1]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-[#a5b4fc] hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-200"
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
 * 🏗️ LAYOUT SYNERGIA RESPONSIVE
 */
const SynergiaLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#4c1d95]">
      {/* Header mobile */}
      <SynergiaHeader 
        onMenuToggle={toggleMobileMenu} 
        isMenuOpen={isMobileMenuOpen}
      />

      <div className="flex">
        {/* Sidebar */}
        <SynergiaSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={closeMobileMenu}
        />

        {/* Main content */}
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
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
    return <SynergiaLoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <SynergiaLoginPage /> : <Navigate to="/dashboard" />} 
          />
          
          <Route
            path="/dashboard"
            element={user ? (
              <SynergiaLayout>
                <Dashboard />
              </SynergiaLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/tasks"
            element={user ? (
              <SynergiaLayout>
                <TasksPage />
              </SynergiaLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/projects"
            element={user ? (
              <SynergiaLayout>
                <ProjectsPage />
              </SynergiaLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/analytics"
            element={user ? (
              <SynergiaLayout>
                <AnalyticsPage />
              </SynergiaLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/leaderboard"
            element={user ? (
              <SynergiaLayout>
                <LeaderboardPage />
              </SynergiaLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/profile"
            element={user ? (
              <SynergiaLayout>
                <ProfilePage />
              </SynergiaLayout>
            ) : (
              <Navigate to="/login" />
            )}
          />
          
          <Route
            path="/settings"
            element={user ? (
              <SynergiaLayout>
                <SettingsPage />
              </SynergiaLayout>
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
