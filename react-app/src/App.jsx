import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🔧 CORRECTION : Imports avec chemins corrects selon votre architecture
import { useAuthStore } from './shared/stores/authStore.js';
import { useGamificationStore } from './shared/stores/gamificationStore.js';

// Pages - Import depuis la structure modulaire existante
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';

// Components
import MainLayout from './components/MainLayout.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// Routes modulaires
import AppRoutes from './routes/index.jsx';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  const { user, loading, checkAuth } = useAuthStore();
  const { initializeGameData } = useGamificationStore();

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

        {/* Routes protégées avec layout */}
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
          <Route path="analytics" element={<Analytics />} />
          {/* Les autres routes seront ajoutées progressivement */}
        </Route>

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
