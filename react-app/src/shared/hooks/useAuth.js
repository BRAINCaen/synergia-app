// src/shared/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, loading } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    // Alias pour compatibilité
    currentUser: user,
    uid: user?.uid
  };
};

export default useAuth;
