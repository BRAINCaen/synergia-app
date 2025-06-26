// ==========================================
// 📁 react-app/src/layouts/DashboardLayout.jsx
// DashboardLayout CORRIGÉ - Imports fixes pour authStore
// ==========================================

import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
// 🚀 CORRECTION: Import nommé pour authStore
import { useAuthStore } from '../shared/stores/authStore'
// ✅ Ces imports sont corrects (default exports)
import useUserStore from '../shared/stores/userStore'
import useNotificationStore from '../shared/stores/notificationStore'
import { Button } from '../shared/components/ui'

const DashboardLayout = ({ children }) => {
  const { user, signOut } = useAuthStore()
  const { stats } = useUserStore()
  const { unreadCount } = useNotificationStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠', current: location.pathname === '/dashboard' },
    { name: 'Mon Profil', href: '/profile', icon: '👤', current: location.pathname === '/profile' },
    { name: 'Mon Équipe', href: '/team', icon: '👥', current: location.pathname === '/team' },
    { name: 'Tâches', href: '/tasks', icon: '✅', current: location.pathname === '/tasks' },
    { name: 'Pointage', href: '/timetrack', icon: '⏰', current: location.pathname === '/timetrack' },
    { name: 'Récompenses', href: '/rewards', icon: '🏆', current: location.pathname === '/rewards' },
  ]

  const userInitials = user?.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">Synergia</h1>
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
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">Synergia</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
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
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Voir notifications</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5h5m-5-5v-5a6 6 0 1 0-12 0v5H3l5 5H3" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profil utilisateur */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {userInitials}
                        </span>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.displayName || user?.email}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Déconnexion
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
