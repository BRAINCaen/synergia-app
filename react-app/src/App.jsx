import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 CORRECTION : Imports selon VRAIE structure existante
import { useAuthStore } from './shared/stores/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/firebase';

// Layout existant
import MainLayout from './layouts/MainLayout';

// Pages existantes dans modules/ et pages/
import Login from './modules/auth/Login';
import Dashboard from './modules/dashboard/Dashboard';
import TaskList from './modules/tasks/TaskList';
import ProjectDashboard from './modules/projects/ProjectDashboard';
import GamificationDashboard from './modules/gamification/GamificationDashboard';
import Profile from './modules/profile/components/Profile';

// Pages dans pages/
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';

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
          {/* Route publique - Login (utilise pages/Login qui wrapp modules/auth/Login) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirection racine vers dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Routes protégées avec layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard principal (utilise pages/Dashboard) */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Tâches */}
            <Route path="/tasks" element={<TaskList />} />
            
            {/* Projets */}
            <Route path="/projects" element={<ProjectDashboard />} />
            
            {/* Gamification */}
            <Route path="/gamification" element={<GamificationDashboard />} />
            
            {/* Profil */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Route fallback - redirection vers dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
