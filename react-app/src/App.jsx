// react-app/src/App.jsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './core/stores/authStore';
import { useGameStore } from './core/stores/gameStore';
import { authService } from './core/services/authService';

// Components
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import OnboardingPage from './pages/OnboardingPage';

const App = () => {
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const { initializeGameData } = useGameStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          await initializeGameData(currentUser.uid);
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setLoading, initializeGameData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Authenticated
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Routes */}
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
