// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// DashboardLayout OPTIMISÉ avec 13 pages uniques (sans doublons)
// ==========================================

import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore'
import useUserStore from '../shared/stores/userStore'
import useNotificationStore from '../shared/stores/notificationStore'
import { Button } from '../shared/components/ui'

const DashboardLayout = ({ children }) => {
  const { user, signOut } = useAuthStore()
  const { stats } = useUserStore()
  const { unreadCount } = useNotificationStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({})

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  // 🚀 NAVIGATION OPTIMISÉE - 13 PAGES UNIQUES (DOUBLONS SUPPRIMÉS)
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
  ]

  // Calculer le total des pages
  const totalPages = navigationSections.reduce((total, section) => total + section.items.length, 0)

  const userInitials = user?.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?'

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
                  item.badge === 'HOT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-72 flex-col bg-white h-full">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-blue-600">Synergia v3.5</h1>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                {totalPages} pages
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Fermer sidebar</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {navigationSections.map(renderNavigationSection)}
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col bg-white border-r border-gray-200 h-full">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-blue-600">Synergia v3.5</h1>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                {totalPages} pages
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {navigationSections.map(renderNavigationSection)}
          </div>

          {/* Section gamification dans la sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="mr-2">🎮</span>
                Progression
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Niveau {stats?.level || 1}</span>
                  <span className="text-gray-600">{stats?.xp || 90} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((stats?.xp || 90) / ((stats?.level || 1) * 100)) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                  <span>🎯 {stats?.tasksCompleted || 0} tâches</span>
                  <span>🏆 {stats?.badges || 0} badges</span>
                  <span>📁 {stats?.projects || 0} projets</span>
                  <span>🔥 {stats?.streak || 0} jour(s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profil utilisateur en bas de sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
                ) : (
                  <span className="text-sm font-medium text-white">{userInitials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.displayName || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                title="Déconnexion"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
                >
                  <span className="sr-only">Ouvrir sidebar</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Indicateur de page actuelle */}
                <div className="ml-4 lg:ml-0">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    {navigationSections.flatMap(s => s.items).find(item => item.current)?.icon}
                    <span className="ml-2">
                      {navigationSections.flatMap(s => s.items).find(item => item.current)?.name || 'Dashboard'}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">
                    {location.pathname === '/onboarding' 
                      ? '🎯 Parcours d\'intégration avec quêtes et badges'
                      : location.pathname === '/gamification'
                      ? '🎮 XP, badges, classement et système de niveaux'
                      : location.pathname === '/users'
                      ? '👥 Gestion équipe avec classement intégré'
                      : `Synergia v3.5 Optimisé - ${totalPages} pages essentielles`
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Compteur de pages optimisé */}
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    {totalPages} pages
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    v3.5.2-CLEAN
                  </span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Voir notifications</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5h5m-5-5v-5a6 6 0 1 0-12 0v5H3l5 5H3" />
                  </svg>
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
                        Niveau {stats?.level || 1} • {stats?.xp || 90} XP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="py-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

// 🚀 Log de chargement
console.log('✅ DashboardLayout optimisé chargé - 13 pages uniques sans doublons');
