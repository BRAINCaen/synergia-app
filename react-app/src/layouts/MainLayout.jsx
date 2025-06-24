import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore'

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuthStore()

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      console.log('✅ Déconnexion réussie')
    }
  }

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '🏠', description: 'Vue d\'ensemble et statistiques' },
    { path: '/tasks', name: 'Tâches', icon: '✅', description: 'Gestion des tâches gamifiées' },
    { path: '/projects', name: 'Projets', icon: '📋', description: 'Organisation par projets' },
    { path: '/gamification', name: 'Gamification', icon: '🎮', description: 'XP, badges et progression' },
    { path: '/team', name: 'Équipe', icon: '👥', description: 'Collaboration et leaderboard' },
    { path: '/analytics', name: 'Analytics', icon: '📊', description: 'Métriques et rapports' },
    { path: '/profile', name: 'Profil', icon: '👤', description: 'Paramètres utilisateur' },
  ]

  const currentPage = navItems.find(item => item.path === location.pathname)

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xl font-bold text-white">Synergia</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Version info */}
          <div className="mt-8 px-3">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Version</span>
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">v3.3</span>
              </div>
              <p className="text-xs text-gray-400">
                Application stable avec toutes les fonctionnalités gamification
              </p>
            </div>
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || user.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm">
                  👤
                </div>
              )}
            </div>
            <div className="text-sm flex-1">
              <p className="text-white font-medium truncate">
                {user?.displayName || user?.email || 'Utilisateur'}
              </p>
              <p className="text-gray-400 text-xs">
                {user?.email && user?.displayName ? user.email : 'Connecté avec Google'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              ☰
            </button>
            <h1 className="text-white font-semibold">Synergia</h1>
            <div></div>
          </div>
        </div>

        {/* Page header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  {currentPage?.icon} {currentPage?.name || 'Synergia'}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {currentPage?.description || 'Plateforme collaborative avec gamification'}
                </p>
              </div>

              {/* Quick actions selon la page */}
              <div className="flex items-center gap-3">
                {location.pathname === '/dashboard' && (
                  <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-600/30 px-3 py-2 rounded-lg">
                    <span className="text-blue-400 text-sm">🔥 Système Actif</span>
                  </div>
                )}
                {location.pathname === '/tasks' && (
                  <Link 
                    to="/tasks"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    + Nouvelle tâche
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default MainLayout
