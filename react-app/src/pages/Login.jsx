// ==========================================
// 📁 react-app/src/pages/Login.jsx
// LOGIN AVEC MODE INSCRIPTION FONCTIONNEL - CORRECTION DU BUG
// ==========================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🔐 LOGIN ET INSCRIPTION DANS LE MÊME COMPOSANT
 * CORRECTION: Ajout du mode inscription fonctionnel
 */
const Login = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUp } = useAuthStore();
  
  // États existants préservés
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ✅ NOUVEAU: État pour basculer entre connexion et inscription
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  // ✅ NOUVEAU: Champs supplémentaires pour l'inscription
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  console.log('🔐 Login page rendue - Mode:', isSignupMode ? 'Inscription' : 'Connexion');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
      console.log('✅ Connexion Google réussie');
    } catch (error) {
      console.error('❌ Erreur Google:', error);
      setError('Erreur de connexion Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
      console.log('✅ Connexion email réussie');
    } catch (error) {
      console.error('❌ Erreur email:', error);
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NOUVEAU: Handler pour l'inscription
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const displayName = `${firstName} ${lastName}`;
      await signUp(email, password, displayName);
      navigate('/dashboard');
      console.log('✅ Inscription réussie');
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      setError('Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NOUVEAU: Fonction pour basculer entre les modes
  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setError('');
    // Réinitialiser les champs spécifiques à l'inscription
    if (isSignupMode) {
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
    }
    console.log('🔄 Basculement vers mode:', !isSignupMode ? 'Inscription' : 'Connexion');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Synergia v3.5</h1>
          <p className="text-gray-400">
            {isSignupMode ? 'Créez votre compte' : 'Connectez-vous pour continuer'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          
          {/* Connexion Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <span className="text-xl">🔍</span>
            {isLoading ? 'Connexion...' : 'Continuer avec Google'}
          </button>

          {/* Séparateur */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink-0 px-4 text-gray-400 text-sm">OU</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          {/* Formulaire email */}
          <form onSubmit={isSignupMode ? handleEmailSignup : handleEmailLogin} className="space-y-4">
            
            {/* ✅ NOUVEAU: Champs prénom/nom pour l'inscription */}
            {isSignupMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {/* ✅ NOUVEAU: Confirmation mot de passe pour l'inscription */}
            {isSignupMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password || (isSignupMode && (!confirmPassword || !firstName || !lastName))}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isSignupMode ? 'Création...' : 'Connexion...') 
                : (isSignupMode ? 'Créer le compte' : 'Se connecter')
              }
            </button>
          </form>

          {/* ✅ CORRECTION: Lien inscription avec handler fonctionnel */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isSignupMode ? 'Déjà un compte ?' : 'Pas de compte ?'}{' '}
              <button 
                onClick={toggleMode}
                type="button"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isSignupMode ? 'Se connecter' : 'Créer un compte'}
              </button>
            </p>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-6 bg-gray-800/30 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">🔧 Debug Info</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <p>✅ Login page rendue avec succès</p>
            <p>🔄 Mode actuel: {isSignupMode ? 'Inscription' : 'Connexion'}</p>
            <p>🕒 Temps: {new Date().toLocaleTimeString()}</p>
            <p>🌐 URL: {window.location.pathname}</p>
            <p>🔧 BUG CORRIGÉ: Bouton "Créer un compte" fonctionnel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// ==========================================
// 📋 LOGS DE DEBUG
// ==========================================
console.log('✅ Login avec inscription fonctionnel chargé');
console.log('🔧 BUG CORRIGÉ: Bouton créer un compte maintenant actif');
console.log('🔄 Mode basculement connexion/inscription opérationnel');
