// src/App.jsx - Votre design original + routes tâches/projets
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'

// Import des nouveaux composants pour les tâches et projets
import { TaskList } from './modules/tasks/TaskList.jsx'
import { ProjectDashboard } from './modules/projects/ProjectDashboard.jsx'

// Composant Navigation
const Navigation = ({ user, onLogout }) => {
  const location = useLocation()
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tâches', icon: '📋' },
    { path: '/projects', label: 'Projets', icon: '🏗️' }
  ]

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Synergia</h1>
              <span className="text-xs text-green-400 bg-green-900 px-2 py-0.5 rounded-full">
                v2.0 • Modulaire
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">P</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">👤 Membre</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Composant Dashboard Original
const Dashboard = ({ user }) => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Message de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              Bonsoir, {user.name} ! 👋
            </h2>
            <p className="text-blue-100 mb-4">
              Bienvenue dans Synergia v2.0 avec la nouvelle architecture modulaire ! 🚀
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span className="text-blue-100">jeudi 19 juin</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span className="text-blue-100">Niveau {user.level}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⭐</span>
                <span className="text-blue-100">{user.xp} XP</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="relative">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">P</span>
              </div>
              <div className="absolute -bottom-1 -right-1">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  En ligne
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">STATUT</span>
            <div className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-400">✅</span>
            </div>
          </div>
          <p className="text-xl font-bold text-green-400">{user.status}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">NIVEAU</span>
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-400">🎯</span>
            </div>
          </div>
          <p className="text-xl font-bold text-white">{user.level}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-sm">EXPÉRIENCE</span>
            <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center">
              <span className="text-purple-400">⭐</span>
            </div>
          </div>
          <p className="text-xl font-bold text-purple-400">{user.xp} XP</p>
        </div>
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Architecture Modulaire */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🏗</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Architecture Modulaire</h3>
              <p className="text-gray-400 text-sm">Fondations solides pour l'évolution</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-400 text-sm">Services d'authentification optimisés</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-400 text-sm">Interface utilisateur moderne</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-green-400 text-sm">Système de tâches gamifié</span>
            </div>
          </div>
        </div>

        {/* Roadmap 2025 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Roadmap 2025</h3>
              <p className="text-gray-400 text-sm">Prochaines fonctionnalités</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Phase 1 - Architecture</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Terminé</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Phase 2 - Gamification</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Terminé</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Phase 3 - Tâches</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">En cours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules en développement */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>🚀</span>
          Modules en Développement
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tâches - NOUVEAU */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h4 className="text-lg font-semibold text-white mb-2">Tâches</h4>
              <p className="text-gray-400 text-sm mb-4">Gestion des tâches gamifiée</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">100%</p>
              <Link 
                to="/tasks"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Accéder
              </Link>
            </div>
          </div>

          {/* Projets - NOUVEAU */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">🏗️</div>
              <h4 className="text-lg font-semibold text-white mb-2">Projets</h4>
              <p className="text-gray-400 text-sm mb-4">Organisation par projets</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">100%</p>
              <Link 
                to="/projects"
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Accéder
              </Link>
            </div>
          </div>

          {/* Gamification */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h4 className="text-lg font-semibold text-white mb-2">Gamification</h4>
              <p className="text-gray-400 text-sm mb-4">Points, badges, niveaux</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">75%</p>
              <span className="bg-purple-600 text-white text-xs px-4 py-2 rounded-lg">
                En développement
              </span>
            </div>
          </div>

          {/* Pointage */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl mb-3">⏰</div>
              <h4 className="text-lg font-semibold text-white mb-2">Pointage</h4>
              <p className="text-gray-400 text-sm mb-4">Gestion du temps</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-gray-600 h-2 rounded-full" style={{width: '0%'}}></div>
              </div>
              <p className="text-xs text-gray-400 mb-3">0%</p>
              <span className="bg-gray-600 text-white text-xs px-4 py-2 rounded-lg">
                Planifié
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message de célébration */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
        <div className="text-2xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Synergia v2.0 avec système de tâches !
        </h3>
        <p className="text-gray-400 mb-4">
          Architecture modulaire déployée avec succès. Système de tâches gamifié maintenant disponible.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span>✨</span>
            <span className="text-gray-300">Interface moderne</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔧</span>
            <span className="text-gray-300">Architecture évolutive</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🚀</span>
            <span className="text-gray-300">Tâches gamifiées</span>
          </div>
        </div>
      </div>

      {/* Bouton PWA */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors">
          <div className="flex items-center space-x-2">
            <span>📱</span>
            <span className="hidden sm:inline text-sm">Installer l'app</span>
          </div>
        </button>
      </div>
    </main>
  )
}

// Layout pour les pages tâches et projets
const TaskLayout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

function App() {
  const { user } = useAuthStore() // ✅ Vraie auth Firebase

  const handleLogin = () => {
    setUser({
      name: 'Puck Time',
      level: 1,
      xp: 0,
      status: 'Inactif'
    })
  }

  const handleLogout = () => {
    setUser(null)
  }

  // Page de connexion
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Synergia</h1>
            <p className="text-gray-600">v2.0 • Modulaire</p>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  // Application avec routing
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* Dashboard principal */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <div>
              <Navigation user={user} onLogout={handleLogout} />
              <Dashboard user={user} />
            </div>
          } />
          
          {/* Pages Tâches */}
          <Route path="/tasks" element={
            <TaskLayout user={user} onLogout={handleLogout}>
              <TaskList />
            </TaskLayout>
          } />
          
          {/* Pages Projets */}
          <Route path="/projects" element={
            <TaskLayout user={user} onLogout={handleLogout}>
              <ProjectDashboard />
            </TaskLayout>
          } />
          
          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
