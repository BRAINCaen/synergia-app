// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// Layout principal avec fonctionnalités de collaboration intégrées
// ==========================================

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar.jsx';
import NotificationCenter from '../collaboration/NotificationCenter.jsx';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🏗️ LAYOUT PRINCIPAL AVEC COLLABORATION
 * 
 * Layout enrichi avec :
 * - Sidebar de navigation
 * - Centre de notifications
 * - Support collaboration temps réel
 * - Gestion responsive
 * - Toast notifications
 */
const Layout = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Pages qui nécessitent un layout spécial
  const isAuthPage = location.pathname === '/login';
  const currentPageName = getCurrentPageName(location.pathname);

  if (isAuthPage) {
    return (
      <>
        <Outlet />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Header avec notifications */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Titre de la page */}
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentPageName}
                </h1>
              </div>

              {/* Actions header */}
              <div className="flex items-center space-x-4">
                {/* Informations utilisateur */}
                {user && (
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        En ligne
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {(user.displayName || user.email)?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Centre de notifications */}
                {user && <NotificationCenter />}

                {/* Menu mobile */}
                <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Zone de contenu */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Indicateur de collaboration en cours */}
      <CollaborationIndicator />
    </div>
  );
};

/**
 * 🔄 INDICATEUR DE COLLABORATION
 * Affiche les utilisateurs actifs sur la même page
 */
const CollaborationIndicator = () => {
  const [activeUsers, setActiveUsers] = React.useState([]);
  const location = useLocation();
  const { user } = useAuthStore();

  // Simuler la présence d'utilisateurs actifs
  React.useEffect(() => {
    // Dans une vraie implémentation, on écouterait les utilisateurs actifs via Firebase
    const mockActiveUsers = [
      { id: '1', name: 'Marie Dubois', avatar: '👩', color: 'bg-pink-500' },
      { id: '2', name: 'Thomas Martin', avatar: '👨', color: 'bg-blue-500' }
    ].filter(u => u.id !== user?.uid); // Exclure l'utilisateur actuel

    setActiveUsers(mockActiveUsers);
  }, [location.pathname, user?.uid]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((activeUser, index) => (
              <div
                key={activeUser.id}
                className={`
                  w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm
                  ${activeUser.color}
                `}
                title={activeUser.name}
                style={{ zIndex: activeUsers.length - index }}
              >
                {activeUser.avatar}
              </div>
            ))}
            {activeUsers.length > 3 && (
              <div className="w-8 h-8 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {activeUsers.length} utilisateur{activeUsers.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500">
              actif{activeUsers.length > 1 ? 's' : ''} sur cette page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 📄 OBTENIR LE NOM DE LA PAGE ACTUELLE
 */
function getCurrentPageName(pathname) {
  const routes = {
    '/': '📊 Tableau de bord',
    '/dashboard': '📊 Tableau de bord',
    '/tasks': '📋 Tâches',
    '/projects': '📁 Projets',
    '/analytics': '📈 Analytics',
    '/leaderboard': '🏆 Classement',
    '/gamification': '🎮 Gamification',
    '/badges': '🏅 Badges',
    '/profile': '👤 Profil',
    '/users': '👥 Équipe',
    '/notifications': '🔔 Notifications'
  };

  return routes[pathname] || '📄 Page';
}

export default Layout;
