import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useGameStore } from './stores/gameStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics'; // 🆕 Nouvelle page

// Components
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading, checkAuth } = useAuthStore();
  const { initializeGameData } = useGameStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      initializeGameData(user.uid);
    }
  }, [user, initializeGameData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Route publique */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Routes protégées */}
        <Route 
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="analytics" element={<Analytics />} /> {/* 🆕 Nouvelle route */}
        </Route>

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
