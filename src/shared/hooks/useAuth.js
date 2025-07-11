// src/shared/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../core/firebase'
import { useAuthStore } from '../stores/authStore' // 🔧 CORRECTION : Import nommé

export const useAuth = () => {
  const { 
    user, 
    loading, // 🔧 CORRECTION : 'loading' au lieu de 'isLoading'
    error, 
    isAuthenticated,
    setUser, 
    setLoading, 
    setInitialized,
    clearError 
  } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          createdAt: firebaseUser.metadata.creationTime,
          lastLoginAt: firebaseUser.metadata.lastSignInTime
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      
      setLoading(false)
      if (!isAuthenticated) {
        setInitialized(true)
      }
    })

    return unsubscribe
  }, [setUser, setLoading, setInitialized, isAuthenticated])

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (requiredRole) => {
    return user?.role === requiredRole
  }

  // Fonction pour vérifier si l'utilisateur a au moins un certain niveau de permission
  const hasPermission = (requiredRoles = []) => {
    if (!user?.role) return false
    return requiredRoles.includes(user.role)
  }

  return {
    user,
    isLoading: loading, // 🔧 CORRECTION : Mapper 'loading' vers 'isLoading' pour compatibilité
    error,
    isInitialized: isAuthenticated, // 🔧 CORRECTION : Utiliser isAuthenticated
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    clearError
  }
}

export default useAuth
