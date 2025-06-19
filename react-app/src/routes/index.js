// src/routes/index.js
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../core/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';

// Lazy loading des pages
const Dashboard = React.lazy(() => import('../pages/Dashboard.jsx'));
const Login = React.lazy(() => import('../pages/Login.jsx'));
const Profile = React.lazy(() => import('../modules/profile/components/Profile.jsx'));
const NotFound = React.lazy(() => import('../pages/NotFound.jsx'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-gray-400">Chargement...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Route par défaut */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        
        {/* Routes publiques */}
        <Route path={ROUTES.LOGIN} element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        {/* Routes protégées */}
        <Route path={ROUTES.DASHBOARD} element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path={ROUTES.PROFILE} element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Future routes (Phase 2+) */}
        <Route path={ROUTES.GAMIFICATION} element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">🎮 Gamification</h2>
                <p className="text-gray-400">Module en développement - Phase 2</p>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
