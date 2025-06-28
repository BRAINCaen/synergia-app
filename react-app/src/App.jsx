// ==========================================
// 📁 react-app/src/App.jsx  
// APP.JSX MODIFIÉ - Ajout route admin-fix
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

// 🛡️ NOUVEAUX IMPORTS ADMIN  
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx'
import AdminProfileTestPage from './pages/AdminProfileTestPage.jsx'
// 🚀 NOUVEAU : Page de correctif admin
import AdminQuickFixPage from './pages/AdminQuickFixPage.jsx'

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
        setAppInitialized(true) // Permettre l'accès même en cas d'erreur
      }
    }

    initializeApp()
  }, [])

  // 🔄 Affichage du loading pendant l'initialisation
  if (!appInitialized || authLoading) {
    return <LoadingScreen message="Initialisation de Synergia..." />
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* 🎊 GESTIONNAIRE DE NOTIFICATIONS DE BADGES (global) */}
        {user && <BadgeNotificationManager />}
        
        <Routes>
          {/* ================== ROUTES PUBLIQUES ================== */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          {/* ================== ROUTES PROTÉGÉES PRINCIPALES ================== */}
          
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
          
          <Route path="/badges" element={
            <ProtectedRoute>
              <BadgesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rewards" element={
            <ProtectedRoute>
              <RewardsPage />
            </ProtectedRoute>
          } />

          {/* 👥 Pages équipe - AVEC LAYOUT */}
          <Route path="/users" element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          } />

          {/* 🎯 Page onboarding - AVEC LAYOUT */}
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

          {/* 🛡️ ROUTES ADMIN - AVEC LAYOUT */}
          <Route path="/admin-test" element={
            <ProtectedRoute>
              <CompleteAdminTestPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-profile-test" element={
            <ProtectedRoute>
              <AdminProfileTestPage />
            </ProtectedRoute>
          } />
          
          {/* 🚀 NOUVELLE ROUTE : Correctif Admin */}
          <Route path="/admin-fix" element={
            <ProtectedRoute>
              <AdminQuickFixPage />
            </ProtectedRoute>
          } />

          {/* 🧪 Pages de développement - AVEC LAYOUT */}
          <Route path="/test-dashboard" element={
            <ProtectedRoute>
              <TestDashboard />
            </ProtectedRoute>
          } />

          {/* ================== ROUTES SPÉCIALES ================== */}
          
          {/* 🏠 Redirection racine vers dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 🚫 Page 404 pour les routes non trouvées */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-400 mb-8">Page non trouvée</p>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retour au Dashboard
                </button>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App

// ==========================================
// 📝 DOCUMENTATION DES ROUTES
// ==========================================

/*
🏠 ROUTES PRINCIPALES :
- /dashboard - Dashboard principal avec widgets
- /tasks - Gestion des tâches
- /projects - Gestion des projets
- /analytics - Rapports et analyses

🎮 GAMIFICATION :
- /gamification - Page gamification principale
- /badges - Collection de badges
- /rewards - Système de récompenses

👥 ÉQUIPE :
- /users - Gestion des utilisateurs
- /onboarding - Processus d'intégration

⚙️ OUTILS :
- /timetrack - Suivi du temps
- /profile - Profil utilisateur
- /settings - Paramètres

🛡️ ADMINISTRATION :
- /admin-test - Page complète de test et config admin
- /admin-profile-test - Page de test basique admin
- /admin-fix - 🚀 NOUVEAU : Correctif rapide accès admin

🧪 DÉVELOPPEMENT :
- /test-dashboard - Dashboard de test
*/

// ==========================================
// 🚀 INTÉGRATION RAPIDE
// ==========================================

/*
POUR APPLIQUER CES MODIFICATIONS :

1. Remplacer complètement le contenu de react-app/src/App.jsx par ce code

2. Créer le fichier react-app/src/pages/AdminQuickFixPage.jsx 
   avec le contenu fourni dans l'artifact précédent

3. Tester en accédant à : /admin-fix

4. Une fois l'accès admin corrigé, utiliser : /admin-test

🎯 PROCÉDURE :
1. Aller sur /admin-fix
2. Cliquer sur "Vérifier le Statut"  
3. Si pas admin, cliquer sur "Corriger l'Accès Admin"
4. Une fois corrigé, aller sur /admin-test pour tester
*/
