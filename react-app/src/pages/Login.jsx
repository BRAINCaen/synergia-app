import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../shared/stores/authStore'

const Login = () => {
  const navigate = useNavigate()
  const { signInWithGoogle, loading, error, clearError, user } = useAuthStore()
  const [localLoading, setLocalLoading] = useState(false)

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    setLocalLoading(true)
    clearError()
    
    try {
      const result = await signInWithGoogle()
      
      if (result.success) {
        console.log('✅ Connexion réussie, redirection...')
        navigate('/dashboard')
      } else {
        console.error('❌ Échec de la connexion:', result.error)
      }
    } catch (err) {
      console.error('❌ Erreur inattendue:', err)
    } finally {
      setLocalLoading(false)
    }
  }

  const isLoading = loading || localLoading

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <span className="text-3xl">⚡</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Synergia</h1>
          <h2 className="text-xl text-gray-300">Plateforme Collaborative</h2>
          <p className="text-gray-400 mt-2">
            Connectez-vous avec votre compte Google pour accéder à votre espace gamifié
          </p>
        </div>
        
        {/* Bouton de connexion Google */}
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                <span>Connexion en cours...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Se connecter avec Google</span>
              </div>
            )}
          </button>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <div>
                <h3 className="text-red-400 font-semibold">Erreur de connexion</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Réessayer
            </button>
          </div>
        )}
        
        {/* Informations sur l'application */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            🎮 Fonctionnalités Synergia
          </h3>
          <div className="text-xs text-blue-400 space-y-1">
            <p>• 🎯 Système de gamification complet avec XP et badges</p>
            <p>• 📊 Dashboard avec analytics temps réel</p>
            <p>• 📋 Gestion de projets et tâches collaborative</p>
            <p>• 🏆 Leaderboard équipe et compétitions</p>
            <p>• 👥 Interface moderne et responsive</p>
          </div>
        </div>

        {/* Version info */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Synergia v3.3 - Authentication Firebase + Google
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
