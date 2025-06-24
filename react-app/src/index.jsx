// react-app/src/index.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ⭐ IMPORTER LE CACHE BUSTER
import './utils/cacheBuster.js'

// Configuration de développement
if (import.meta.env.DEV) {
  console.log('🔧 Mode développement activé - Synergia v3.5.1')
}

// ⭐ VÉRIFICATION VERSION AU DÉMARRAGE
const checkVersion = () => {
  const appVersion = '3.5.1'
  const storedVersion = localStorage.getItem('synergia_app_version')
  
  if (storedVersion && storedVersion !== appVersion) {
    console.log(`🔄 Version mise à jour détectée: ${storedVersion} → ${appVersion}`)
    console.log('🧹 Préparation nettoyage des caches obsolètes...')
  }
  
  localStorage.setItem('synergia_app_version', appVersion)
}

// ⭐ MASQUER LE LOADING SCREEN quand React est prêt
const hideLoadingScreen = () => {
  // Chercher le loader CSS dans l'index.html
  const loadingElements = [
    document.getElementById('loading-screen'),
    document.querySelector('.initial-loader'),
    document.querySelector('.loading-screen')
  ].filter(Boolean)
  
  if (loadingElements.length > 0) {
    setTimeout(() => {
      loadingElements.forEach(element => {
        element.style.opacity = '0'
        element.style.transition = 'opacity 0.5s ease-out'
        setTimeout(() => {
          element.remove()
        }, 500)
      })
    }, 800) // Attendre un peu pour voir le loader
  }
}

// ⭐ GESTION DES ERREURS CHUNK LOADING
const handleChunkError = (error) => {
  console.error('❌ Erreur de chunk détectée:', error.message)
  
  if (error.message?.includes('Loading chunk') || 
      error.message?.includes('ChunkLoadError')) {
    console.log('🔄 Erreur de chunk détectée, force refresh automatique dans 2s...')
    
    // Auto-refresh après erreur de chunk
    setTimeout(() => {
      console.log('🚀 Auto force refresh après erreur de chunk...')
      if (window.forceDashboardReload) {
        window.forceDashboardReload()
      } else {
        window.location.reload(true)
      }
    }, 2000)
  }
}

// ⭐ INITIALISATION
console.log('%c🚀 SYNERGIA v3.5.1 - INITIALISATION', 'color: #3b82f6; font-size: 16px; font-weight: bold;')
checkVersion()

// Initialisation de l'application React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ⭐ MASQUER LE LOADING SCREEN après le rendu
hideLoadingScreen()

// ⭐ CONSOLE INFO ET COMMANDES DISPONIBLES
console.log('%c✅ SYNERGIA v3.5.1 DÉMARRÉ AVEC SUCCÈS', 'color: #10b981; font-size: 14px; font-weight: bold;')
console.log('%cCommandes console disponibles:', 'color: #10b981; font-weight: bold;')
console.log('%c• forceDashboardReload() - Force le rechargement du dashboard', 'color: #6b7280;')
console.log('%c• debugCache() - Affiche l\'état détaillé des caches', 'color: #6b7280;')
console.log('%c• checkCacheHealth() - Vérifie la santé du cache', 'color: #6b7280;')
console.log('%c• emergencyClean() - Nettoyage d\'urgence complet', 'color: #6b7280;')
console.log('%c• simpleRefresh() - Rechargement simple de la page', 'color: #6b7280;')

// ⭐ GESTION DES ERREURS GLOBALES
window.addEventListener('error', (event) => {
  handleChunkError(event.error)
})

// ⭐ GESTION DES ERREURS DE PROMISE (chunks)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Loading chunk')) {
    console.error('❌ Erreur chunk promise:', event.reason)
    event.preventDefault() // Empêcher l'affichage de l'erreur
    handleChunkError(event.reason)
  }
})

// ⭐ VÉRIFICATION PÉRIODIQUE DE SANTÉ DU CACHE (toutes les 5 minutes)
setInterval(() => {
  if (window.checkCacheHealth) {
    window.checkCacheHealth().then(issues => {
      if (issues && issues.length > 0) {
        console.log('⚠️ Problèmes de cache détectés, nettoyage recommandé')
      }
    })
  }
}, 5 * 60 * 1000)

// ⭐ DÉTECTION ONGLET ACTIF/INACTIF pour optimiser les performances
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('👀 Onglet redevenu actif - Synergia')
    // Vérifier s'il y a des mises à jour quand l'utilisateur revient
    if (window.checkCacheHealth) {
      setTimeout(() => {
        window.checkCacheHealth()
      }, 1000)
    }
  }
})

// ⭐ NOTIFICATION DE SUCCÈS DU CHARGEMENT
setTimeout(() => {
  console.log('%c🎉 Application entièrement chargée et prête !', 'color: #f59e0b; font-weight: bold;')
  
  // Vérifier que les fonctions globales sont disponibles
  const availableFunctions = [
    'forceDashboardReload',
    'debugCache', 
    'checkCacheHealth',
    'emergencyClean',
    'simpleRefresh'
  ].filter(func => typeof window[func] === 'function')
  
  console.log(`✅ ${availableFunctions.length}/5 fonctions cache disponibles`)
  
  if (availableFunctions.length < 5) {
    console.warn('⚠️ Certaines fonctions cache ne sont pas disponibles')
  }
}, 2000)
