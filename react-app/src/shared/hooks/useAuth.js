import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../core/firebase'
import useAuthStore from '../stores/authStore'

export const useAuth = () => {
  const { 
    user, 
    isLoading, 
    error, 
    isInitialized,
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
      if (!isInitialized) {
        setInitialized(true)
      }
    })

    return unsubscribe
  }, [setUser, setLoading, setInitialized, isInitialized])

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
    isLoading,
    error,
    isInitialized,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    clearError
  }
}

export default useAuth
