// ==========================================
// 📁 react-app/src/pages/Login.jsx
// PAGE DE CONNEXION AVEC GOOGLE AUTH RESTAURÉE
// ==========================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🔐 PAGE DE CONNEXION COMPLÈTE
 */
const Login = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    
    try {
      await signInWithEmail(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur de connexion email:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalLoading(true);
    
    try {
      console.log('🔄 Tentative connexion Google...');
      await signInWithGoogle();
      console.log('✅ Connexion Google réussie - Redirection...');
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ Erreur connexion Google:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@synergia.com',
      password: 'demo123'
    });
  };

  const isLoading = loading || localLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Synergia v3.5</h1>
          <p className="text-gray-400">Connectez-vous à votre espace</p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          
          {/* Erreur globale */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* ==========================================
              🔗 CONNEXION GOOGLE (PRIORITÉ)
              ========================================== */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 border border-gray-300 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  {/* Logo Google SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Se connecter avec Google</span>
                </>
              )}
            </button>
          </div>

          {/* Séparateur */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-gray-400 text-sm">ou</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* ==========================================
              📧 CONNEXION EMAIL/PASSWORD
              ========================================== */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion email */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Connexion démo */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white py-2 rounded-lg text-sm transition-colors"
            >
              🎭 Utiliser les identifiants de démo
            </button>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Mot de passe oublié ? 
            <button className="text-blue-400 hover:text-blue-300 ml-1 disabled:opacity-50" disabled={isLoading}>
              Réinitialiser
            </button>
          </p>
        </div>

        {/* Informations */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-500 text-xs">
            ✅ Connexion Google activée et fonctionnelle
          </p>
          <p className="text-gray-500 text-xs">
            🔒 Sécurisé par Firebase Authentication
          </p>
          <p className="text-gray-500 text-xs">
            Synergia v3.5 - Système de gestion collaborative
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
