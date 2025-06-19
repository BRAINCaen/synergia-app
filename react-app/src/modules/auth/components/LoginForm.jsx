import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../../../shared/components/ui'
import { validateLoginForm } from '../../../shared/utils/validation'
import useAuthStore from '../../../shared/stores/authStore'
import useNotificationStore from '../../../shared/stores/notificationStore'

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore()
  const { success: showSuccess, error: showError } = useNotificationStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Effacer l'erreur générale
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation côté client
    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    // Tentative de connexion
    const result = await login(formData.email, formData.password)
    if (result.success) {
      showSuccess('Connexion réussie ! Bienvenue sur Synergia 🎉')
    } else {
      setErrors({ general: result.error })
    }
  }

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle()
    if (result.success) {
      showSuccess('Connexion avec Google réussie ! 🎉')
    } else {
      showError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connexion
        </h2>
        <p className="text-gray-600">
          Connectez-vous à votre compte Synergia
        </p>
      </div>

      {/* Erreur générale */}
      {(error || errors.general) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error || errors.general}</p>
          </div>
        </div>
      )}

      {/* Champs du formulaire */}
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="votre@email.com"
          autoComplete="email"
        />

        <Input
          label="Mot de passe"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {/* Lien mot de passe oublié */}
      <div className="text-right">
        <Link 
          to="/forgot-password" 
          className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      {/* Bouton de connexion */}
      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={isLoading}
      >
        Se connecter
      </Button>

      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou</span>
        </div>
      </div>

      {/* Connexion Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuer avec Google
      </Button>

      {/* Lien d'inscription */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link 
            to="/signup" 
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </form>
  )
}

export default LoginForm
