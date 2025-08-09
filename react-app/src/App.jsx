// ==========================================
// 📁 react-app/src/App.jsx
// RESTAURATION EXACTE - ROUTING QUI MARCHAIT
// ==========================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './shared/stores/authStore.js';
import MainLayout from './layouts/MainLayout.jsx';

// Pages principales RESTAURÉES
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import TimeTrackPage from './pages/TimeTrackPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Pages admin RESTAURÉES
import AdminTaskValidationPage from './pages/AdminTaskValidationPage.jsx';
import CompleteAdminTestPage from './pages/CompleteAdminTestPage.jsx';

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Composant principal App RESTAURÉ
function App() {
  const { initializeAuth } = useAuthStore();
  
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route de connexion */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées avec MainLayout ORIGINAL */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Pages principales RESTAURÉES */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            
            {/* Gamification RESTAURÉE */}
            <Route path="gamification" element={<GamificationPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            
            {/* Équipe RESTAURÉE */}
            <Route path="team" element={<TeamPage />} />
            <Route path="users" element={<UsersPage />} />
            
            {/* Outils RESTAURÉS */}
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="timetrack" element={<TimeTrackPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            
            {/* Admin RESTAURÉ */}
            <Route path="admin/task-validation" element={<AdminTaskValidationPage />} />
            <Route path="admin/complete-test" element={<CompleteAdminTestPage />} />
          </Route>
          
          {/* Route 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-gray-400">Page non trouvée</p>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retour au Dashboard
                </button>
              </div>
            </div>
          } />
        </Routes>
        
        {/* Toast notifications RESTAURÉES */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151'
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
