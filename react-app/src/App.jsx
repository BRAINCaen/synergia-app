// ==========================================
// 📁 react-app/src/App.jsx
// CODE COMPLET - Remplacer entièrement le fichier existant
// ==========================================

import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './shared/stores/authStore.js'
import LoadingScreen from './components/ui/LoadingScreen.jsx'

// ✅ IMPORT LAYOUT PRINCIPAL
import DashboardLayout from './layouts/DashboardLayout.jsx'

// 🎊 IMPORT NOUVEAU : Gestionnaire de notifications de badges
import { BadgeNotificationManager } from './components/gamification/BadgeNotification.jsx'

// Pages imports
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TasksPage from './pages/TasksPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import GamificationPage from './pages/GamificationPage.jsx'
import RewardsPage from './pages/RewardsPage.jsx'
import BadgesPage from './pages/BadgesPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import TimeTrackPage from './pages/TimeTrackPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TestDashboard from './pages/TestDashboard.jsx'

// ✅ Component protégé AVEC LAYOUT
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return <LoadingScreen message="Vérification de l'authentification..." />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // ✅ WRAPPER AVEC DASHBOARDLAYOUT pour toutes les pages protégées
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}

// Component route publique  
function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return <LoadingScreen message="Chargement de l'application..." />
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const { initializeAuth, user, loading: authLoading } = useAuthStore()
  const [appInitialized, setAppInitialized] = useState(false)

  // 🚀 Initialisation de l'application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation Synergia v3.5...');
        
        // Firebase est déjà initialisé dans firebase.js
        console.log('✅ Firebase déjà configuré');
        
        // Initialiser l'authentification
        await initializeAuth()
        console.log('✅ Auth initialisé');
        
        setAppInitialized(true)
        console.log('🎉 Synergia prêt !');
        
      } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        setAppInitialized(true); // Continuer même en cas d'erreur
      }
    }

    initializeApp()
  }, [initializeAuth])

  // Écran de chargement pendant l'initialisation
  if (!appInitialized || authLoading) {
    return <LoadingScreen message="Chargement de Synergia v3.5..." />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* ✅ NOUVEAU: Gestionnaire global des notifications de badges */}
        <BadgeNotificationManager />
        
        <Routes>
          {/* 🌐 Route publique : Login */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* 🏠 Redirection racine vers dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />

          {/* 📊 Pages principales - AVEC LAYOUT */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />

          {/* 🎮 Pages gamification - AVEC LAYOUT */}
          <Route path="/gamification" element={
            <ProtectedRoute>
              <GamificationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rewards" element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          } />

          <Route path="/badges" element={
            <ProtectedRoute>
              <BadgesPage />
            </ProtectedRoute>
          } />

          {/* 👥 Pages collaboration - AVEC LAYOUT */}
          <Route path="/users" element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          {/* ⚙️ Pages outils - AVEC LAYOUT */}
          <Route path="/timetrack" element={
            <ProtectedRoute>
              <TimeTrackPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />

          {/* 🧪 Pages de développement - AVEC LAYOUT */}
          <Route path="/test-dashboard" element={
            <ProtectedRoute>
              <TestDashboard />
            </ProtectedRoute>
          } />

          {/* 🚫 Page 404 pour les routes non trouvées */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-8">Page non trouvée</p>
                <Navigate to="/dashboard" replace />
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
