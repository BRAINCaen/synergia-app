// ===================================================================
// 🚀 APP.JSX CORRIGÉ - SUPPRESSION DES DOUBLONS
// Fichier: react-app/src/App.jsx
// ===================================================================

import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './core/firebase.js'
import { useAuthStore } from './shared/stores/authStore.js'
import AppRoutes from './routes/index.jsx'

// 🍞 Import du système de toast amélioré
import { ToastProvider } from './shared/components/ui/Toast.jsx'

function App() {
  const { setUser, setLoading, setError } = useAuthStore()

  useEffect(() => {
    let mounted = true

    // 🔥 Authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, 
      async (user) => {
        if (!mounted) return
        
        if (user) {
          // Utilisateur connecté - Créer profil s'il n'existe pas
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
          console.log('✅ Utilisateur connecté:', userData.displayName || userData.email)
          
        } else {
          // Utilisateur déconnecté
          setUser(null)
          console.log('👋 Utilisateur déconnecté')
        }
        
        setLoading(false)
      },
      (error) => {
        if (!mounted) return
        console.error('❌ Erreur authentification:', error)
        setError(error.message)
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [setUser, setLoading, setError])

  // 📱 Initialisation PWA basique
  useEffect(() => {
    // Enregistrement simple du service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('📱 SW enregistré:', registration.scope)
          })
          .catch((error) => {
            console.log('❌ Échec SW:', error)
          })
      })
    }
    
    // Installation PWA basique
    let deferredPrompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      
      // Créer bouton d'installation simple
      if (!document.getElementById('install-pwa')) {
        const installBtn = document.createElement('button')
        installBtn.id = 'install-pwa'
        installBtn.textContent = '📱 Installer'
        installBtn.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-40'
        installBtn.onclick = async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            console.log('📱 Installation:', outcome)
            installBtn.remove()
            deferredPrompt = null
          }
        }
        document.body.appendChild(installBtn)
        
        // Masquer après 8 secondes
        setTimeout(() => installBtn.remove(), 8000)
      }
    })
    
    // Log de démarrage
    console.log('🚀 Synergia v3.0 - Application démarrée')
    console.log('🔧 Features: Toast system, Real-time data, PWA')
  }, [])

  return (
    <BrowserRouter>
      {/* 🍞 Provider Toast Global - Englobe toute l'application */}
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          {/* 🎯 Routes de l'application */}
          <AppRoutes />
          
          {/* 📱 Indicateur développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 z-40">
              <div className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                🔧 Dev
              </div>
            </div>
          )}
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
