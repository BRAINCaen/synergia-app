import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './core/firebase.js'
import useAuthStore from './shared/stores/authStore.js'
import userService from './core/services/userService.js'
import AppRoutes from './routes/index.jsx'
import './index.css'

function App() {
  const { setUser, setUserProfile, setLoading } = useAuthStore()

  useEffect(() => {
    // Écouter les changements d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
        
        // Charger le profil utilisateur complet
        try {
          const result = await userService.getUserProfile(user.uid)
          if (result.profile) {
            setUserProfile(result.profile)
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [setUser, setUserProfile, setLoading])

  return (
    <BrowserRouter>
      <div className="App">
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}

export default App
