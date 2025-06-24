// react-app/src/index.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ⭐ IMPORTER LE CACHE BUSTER
import cacheBuster from './utils/cacheBuster.js'

// Configuration de développement
if (import.meta.env.DEV) {
  console.log('🔧 Mode développement activé')
}

// ⭐ FONCTIONS GLOBALES POUR LA CONSOLE
window.forceDashboardReload = () => {
  console.log('🚀 Force Dashboard Reload activé...')
  cacheBuster.forceRefresh()
}

window.debugCache = () => {
  console.log('🔍 Debug cache activé...')
  cacheBuster.debugCacheStatus()
}

window.clearAllCaches = () => {
  console.log('🧹 Nettoyage complet des caches...')
  cacheBuster.clearAllCaches()
}

// ⭐ VÉRIFICATION VERSION AU DÉMARRAGE
const checkVersion = () => {
  const appVersion = '3.5.1'
  const storedVersion = localStorage.getItem('synergia_app_version')
  
  if (storedVersion && storedVersion !== appVersion) {
    console.log(`🔄 Version mise à jour: ${storedVersion} → ${appVersion}`)
    console.log('🧹 Nettoyage des caches obsolètes...')
    
    // Nettoyer automatiquement après 1 seconde
    setTimeout(() => {
      cacheBuster.forceRefresh()
    }, 1000)
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
    }, 500) // Attendre un peu pour voir le loader
  }
}

// ⭐ INITIALISATION
checkVersion()

// Rendu de l'application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ⭐ MASQUER LE LOADING SCREEN après le rendu
hideLoadingScreen()

// ⭐ CONSOLE INFO
console.log('%c🚀 SYNERGIA v3.5.1 DÉMARRÉ', 'color: #3b82f6; font-size: 16px; font-weight: bold;')
console.log('%cCommandes console disponibles:', 'color: #10b981; font-weight: bold;')
console.log('%c• forceDashboardReload() - Force le rechargement du dashboard', 'color: #6b7280;')
console.log('%c• debugCache() - Affiche l\'état des caches', 'color: #6b7280;')
console.log('%c• clearAllCaches() - Vide tous les caches', 'color: #6b7280;')

// ⭐ GESTION DES ERREURS GLOBALES
window.addEventListener('error', (event) => {
  console.error('❌ Erreur globale:', event.error)
  
  // Si erreur de cache/réseau, proposer un force refresh
  if (event.error?.message?.includes('Loading chunk') || 
      event.error?.message?.includes('ChunkLoadError')) {
    console.log('🔄 Erreur de chunk détectée, force refresh recommandé')
    
    // Auto-refresh après erreur de chunk
    setTimeout(() => {
      console.log('🚀 Auto force refresh après erreur de chunk...')
      cacheBuster.forceRefresh()
    }, 2000)
  }
})

// ⭐ GESTION DES ERREURS DE CHUNK REACT
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Loading chunk')) {
    console.error('❌ Erreur chunk promise:', event.reason)
    event.preventDefault()
    
    setTimeout(() => {
      console.log('🚀 Force refresh après erreur chunk promise...')
      cacheBuster.forceRefresh()
    }, 1000)
  }
})
