// ==========================================
// 📁 react-app/src/App.jsx
// VERSION TEST SANS LAYOUT - POUR IDENTIFIER LE PROBLÈME
// ==========================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 🛡️ IMPORT DU CORRECTIF SÉCURISÉ EN PREMIER
import './utils/secureImportFix.js';

// Stores uniquement
import { useAuthStore } from './shared/stores/authStore.js';

// Import du correctif d'erreurs
import './utils/safeFix.js';

// 🔐 Composant de protection ultra-simple
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Chargement de Synergia...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 🧪 PAGES DE TEST ULTRA-SIMPLES
const TestLogin = () => (
  <div style={{ padding: '50px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
    <h1 style={{ color: '#ff0000', fontSize: '48px' }}>🔓 LOGIN PAGE</h1>
    <p style={{ color: '#000000', fontSize: '24px' }}>Si tu vois ça, les pages fonctionnent !</p>
  </div>
);

const TestDashboard = () => (
  <div style={{ padding: '50px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
    <h1 style={{ color: '#1e40af', fontSize: '48px' }}>🏠 DASHBOARD</h1>
    <p style={{ color: '#000000', fontSize: '24px' }}>✅ Dashboard fonctionne sans Layout !</p>
    <div style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <strong>SUCCESS!</strong> Le routage fonctionne. Le problème venait du Layout.
    </div>
  </div>
);

const TestTasks = () => (
  <div style={{ padding: '50px', backgroundColor: '#f0fdf4', minHeight: '100vh' }}>
    <h1 style={{ color: '#166534', fontSize: '48px' }}>✅ TASKS PAGE</h1>
    <p style={{ color: '#000000', fontSize: '24px' }}>Page des tâches sans Layout</p>
  </div>
);

const TestProjects = () => (
  <div style={{ padding: '50px', backgroundColor: '#fefce8', minHeight: '100vh' }}>
    <h1 style={{ color: '#a16207', fontSize: '48px' }}>📁 PROJECTS PAGE</h1>
    <p style={{ color: '#000000', fontSize: '24px' }}>Page des projets sans Layout</p>
  </div>
);

const TestAnalytics = () => (
  <div style={{ padding: '50px', backgroundColor: '#fdf4ff', minHeight: '100vh' }}>
    <h1 style={{ color: '#7c2d12', fontSize: '48px' }}>📊 ANALYTICS PAGE</h1>
    <p style={{ color: '#000000', fontSize: '24px' }}>Page analytics sans Layout</p>
  </div>
);

const TestAdminAnalytics = () => (
  <div style={{ padding: '50px', backgroundColor: '#fee2e2', minHeight: '100vh' }}>
    <h1 style={{ color: '#dc2626', fontSize: '48px' }}>🛡️ ADMIN ANALYTICS</h1>
    <p style={{ color: '#000000', fontSize: '24px' }}>Page admin analytics sans Layout</p>
    <div style={{ backgroundColor: '#ef4444', color: '#ffffff', padding: '15px', borderRadius: '6px', marginTop: '15px' }}>
      Tu étais sur cette page quand tout était blanc !
    </div>
  </div>
);

// Menu de navigation simple
const SimpleNav = () => (
  <div style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#374151',
    padding: '15px',
    borderRadius: '8px',
    zIndex: 1000
  }}>
    <div style={{ color: '#ffffff', marginBottom: '10px', fontWeight: 'bold' }}>🧪 NAVIGATION TEST</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <a href="/dashboard" style={{ color: '#60a5fa', textDecoration: 'none' }}>🏠 Dashboard</a>
      <a href="/tasks" style={{ color: '#60a5fa', textDecoration: 'none' }}>✅ Tasks</a>
      <a href="/projects" style={{ color: '#60a5fa', textDecoration: 'none' }}>📁 Projects</a>
      <a href="/analytics" style={{ color: '#60a5fa', textDecoration: 'none' }}>📊 Analytics</a>
      <a href="/admin/analytics" style={{ color: '#60a5fa', textDecoration: 'none' }}>🛡️ Admin Analytics</a>
    </div>
  </div>
);

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    console.log('🚀 App - Test sans Layout');
    try {
      initialize();
    } catch (error) {
      console.error('❌ Erreur initialisation auth:', error);
    }
  }, [initialize]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🧪 TEST MODE</h1>
          <p>Chargement sans Layout...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* CSS pour l'animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        {/* Navigation de test */}
        <SimpleNav />
        
        <Routes>
          {/* Route de login */}
          <Route path="/login" element={<TestLogin />} />
          
          {/* Routes SANS Layout pour test */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <TestDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <TestTasks />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <TestProjects />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <TestAnalytics />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute>
                <TestAdminAnalytics />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection automatique */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />
          
          {/* Page 404 */}
          <Route 
            path="*" 
            element={
              <div style={{ padding: '50px', backgroundColor: '#fef2f2', minHeight: '100vh' }}>
                <h1 style={{ color: '#dc2626', fontSize: '48px' }}>404</h1>
                <p style={{ color: '#000000', fontSize: '24px' }}>Page non trouvée</p>
                <a href="/dashboard" style={{ color: '#2563eb' }}>← Retour Dashboard</a>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
