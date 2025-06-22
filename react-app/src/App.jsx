// ===================================================================
// 🚀 APP.JSX COMPLET AVEC TOUTES LES AMÉLIORATIONS
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

// 🏆 Import du système de badges (optionnel, si vous voulez un provider global)
// import { BadgeProvider } from './contexts/BadgeContext.jsx'

// 📱 Import du système PWA
import { registerSW, setupPWAInstall } from './utils/pwa.js'

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

  // 📱 Initialisation PWA
  useEffect(() => {
    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
      registerSW()
    }
    
    // Setup installation PWA
    setupPWAInstall()
    
    // Log de démarrage
    console.log('🚀 Synergia v3.0 - Application démarrée')
    console.log('🔧 Features: Toast system, Real-time data, Badge system, PWA')
  }, [])

  return (
    <BrowserRouter>
      {/* 🍞 Provider Toast Global - Englobe toute l'application */}
      <ToastProvider>
        {/* 🏆 Provider Badges Global (optionnel) */}
        {/* <BadgeProvider> */}
          
          <div className="min-h-screen bg-gray-50">
            {/* 🎯 Routes de l'application */}
            <AppRoutes />
            
            {/* 📱 Indicateur PWA (optionnel) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed bottom-4 left-4 z-40">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                  🚀 Dev Mode
                </div>
              </div>
            )}
          </div>
          
        {/* </BadgeProvider> */}
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App

// ===================================================================
// 📱 UTILITAIRES PWA (si pas encore créés)
// Fichier: react-app/src/utils/pwa.js
// ===================================================================

// Enregistrement du service worker
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('📱 SW enregistré:', registration.scope)
          
          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                if (confirm('🔄 Nouvelle version disponible. Recharger ?')) {
                  window.location.reload()
                }
              }
            })
          })
        })
        .catch((error) => {
          console.log('❌ Échec SW:', error)
        })
    })
  }
}

// Gestion de l'installation PWA
export const setupPWAInstall = () => {
  let deferredPrompt
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstallButton(deferredPrompt)
  })

  window.addEventListener('appinstalled', () => {
    console.log('📱 PWA installée')
    deferredPrompt = null
  })
}

const showInstallButton = (deferredPrompt) => {
  if (!document.getElementById('install-button')) {
    const installButton = document.createElement('button')
    installButton.id = 'install-button'
    installButton.textContent = '📱 Installer'
    installButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-40'
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`📱 Installation: ${outcome}`)
        deferredPrompt = null
        installButton.remove()
      }
    })
    
    document.body.appendChild(installButton)
    
    // Masquer après 10 secondes
    setTimeout(() => {
      if (installButton.parentNode) {
        installButton.style.opacity = '0.7'
      }
    }, 10000)
  }
}
