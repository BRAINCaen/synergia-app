// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// VERSION SIMPLIFIÉE QUI FONCTIONNE
// ==========================================

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

const DashboardLayout = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation items simples
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Tâches', href: '/tasks', icon: '✅' },
    { name: 'Projets', href: '/projects', icon: '📁' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Gamification', href: '/gamification', icon: '🎮' },
    { name: 'Badges', href: '/badges', icon: '🏆' },
    { name: 'Classement', href: '/leaderboard', icon: '🥇' },
    { name: 'Récompenses', href: '/rewards', icon: '🎁' },
    { name: 'Équipe', href: '/team', icon: '👥' },
    { name: 'Utilisateurs', href: '/users', icon: '👤' },
    { name: 'Progression Rôle', href: '/role-progression', icon: '📈' },
    { name: 'Tâches Rôle', href: '/role-tasks', icon: '🎯' },
    { name: 'Badges Rôle', href: '/role-badges', icon: '🏅' },
    { name: 'Mon Profil', href: '/profile', icon: '🧑‍💼' },
    { name: 'Paramètres', href: '/settings', icon: '⚙️' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <div className={`bg-gray-800 text-white transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">⚡ Synergia</h1>
                <p className="text-xs text-gray-300">v3.5 • Admin</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          {!sidebarCollapsed && (
            <div className="mb-3">
              <p className="text-sm font-medium text-white">
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <span className="mr-2">🚪</span>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="bg-white shadow-sm p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle(location.pathname)}
              </h1>
              <p className="text-gray-600">
                {getPageDescription(location.pathname)}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                👑 Admin
              </div>
              <div className="text-gray-500 text-sm">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Fonction pour obtenir le titre de la page
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/tasks': 'Tâches',
    '/projects': 'Projets',
    '/analytics': 'Analytics',
    '/gamification': 'Gamification',
    '/badges': 'Badges',
    '/leaderboard': 'Classement',
    '/rewards': 'Récompenses',
    '/team': 'Équipe',
    '/users': 'Utilisateurs',
    '/role-progression': 'Progression Rôle',
    '/role-tasks': 'Tâches Rôle',
    '/role-badges': 'Badges Rôle',
    '/profile': 'Mon Profil',
    '/settings': 'Paramètres',
    '/onboarding': 'Intégration',
    '/timetrack': 'Time Tracking',
    '/admin/task-validation': 'Validation des Tâches',
    '/admin/complete-test': 'Test Complet Admin'
  };
  return titles[pathname] || 'Synergia';
};

// Fonction pour obtenir la description de la page
const getPageDescription = (pathname) => {
  const descriptions = {
    '/dashboard': 'Vue d\'ensemble de votre activité',
    '/tasks': 'Gérez vos tâches et objectifs',
    '/projects': 'Collaborez sur vos projets',
    '/analytics': 'Analysez vos performances',
    '/gamification': 'Badges, XP et progression',
    '/badges': 'Galerie de vos badges',
    '/leaderboard': 'Classement et compétition',
    '/rewards': 'Vos récompenses et achievements',
    '/team': 'Gérez votre équipe',
    '/users': 'Gestion des utilisateurs',
    '/role-progression': 'Progression par domaine d\'expertise',
    '/role-tasks': 'Tâches spécialisées par rôle',
    '/role-badges': 'Badges exclusifs par domaine',
    '/profile': 'Gérez votre profil utilisateur',
    '/settings': 'Configuration de l\'application',
    '/onboarding': 'Parcours d\'intégration gamifié',
    '/timetrack': 'Suivi du temps de travail',
    '/admin/task-validation': 'Examinez et validez les soumissions d\'équipe',
    '/admin/complete-test': 'Tests complets du système'
  };
  return descriptions[pathname] || 'Application de gestion collaborative';
};

export default DashboardLayout;
