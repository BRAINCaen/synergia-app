// ==========================================
// 📁 react-app/src/App.jsx
// Version TEMPORAIRE sans ToastProvider (pour éviter erreur build)
// ==========================================

import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './core/firebase.js'
import { useAuthStore } from './shared/stores/authStore.js'
import AppRoutes from './routes/index.jsx'
// TODO: Ajouter ToastProvider quand le fichier sera créé
// import { ToastProvider } from './shared/components/ToastNotification.jsx'

function App() {
  const { setUser, setLoading, setError } = useAuthStore()

  useEffect(() => {
    let mounted = true

    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        if (!mounted) return
        
        if (user) {
          // Utilisateur connecté
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            createdAt: user.metadata?.creationTime,
            lastSignInAt: user.metadata?.lastSignInTime
          }
          setUser(userData)
        } else {
          // Utilisateur déconnecté
          setUser(null)
        }
        
        setLoading(false)
      },
      (error) => {
        if (!mounted) return
        console.error('Erreur authentification:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [setUser, setLoading, setError])

  return (
    // TODO: Wrapper avec <ToastProvider> quand créé
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App
