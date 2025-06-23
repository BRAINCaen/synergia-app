import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 CORRECTION : Chemin correct pour MainLayout
import { useAuthStore } from './shared/stores/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/firebase';

// Layout correct - dans layouts/
import MainLayout from './layouts/MainLayout';

// Pages existantes - adapter selon votre structure
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';

// Composants de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          // Utilisateur connecté
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          };
          setUser(userData);
        } else {
          // Utilisateur déconnecté
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erreur authentification:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [setUser, setLoading, setError]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirection racine vers dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Routes protégées avec layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard personnel */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Gestion des tâches personnelles */}
            <Route path="/tasks" element={<TasksPage />} />
            
            {/* Projets collaboratifs */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectsPage />} />
            
            {/* Analytics et métriques */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            
            {/* Classement gamification */}
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            
            {/* Paramètres utilisateur */}
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Route fallback - redirection vers dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
