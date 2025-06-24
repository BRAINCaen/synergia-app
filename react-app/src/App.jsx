// react-app/src/App.jsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './shared/stores/authStore';
import { useGameStore } from './shared/stores/gameStore';

// Components
import Sidebar from './components/layout/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';

const App = () => {
  const { user, loading, initializeAuth } = useAuthStore();
  const { initializeGameStore } = useGameStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation de l\'application Synergia...');
        
        // Initialiser l'authentification
        const unsubscribe = initializeAuth();
        
        return unsubscribe;
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
      }
    };

    initializeApp();
  }, [initializeAuth]);

  // Initialiser la gamification quand l'utilisateur est connecté
  useEffect(() => {
    if (user?.uid) {
      console.log('🎮 Initialisation gamification pour:', user.email);
      initializeGameStore(user.uid).catch(error => {
        console.error('❌ Erreur init gamification:', error);
      });
    }
  }, [user?.uid, initializeGameStore]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Chargement de Synergia...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Authenticated - Layout avec sidebar
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Layout principal */}
        <div className="flex h-screen">
          
          {/* Sidebar */}
          <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <Sidebar 
              isOpen={true} // Toujours ouverte sur desktop
              onToggle={() => {}} // Pas de toggle sur desktop
            />
          </div>

          {/* Sidebar mobile */}
          <div className="lg:hidden">
            <Sidebar 
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
