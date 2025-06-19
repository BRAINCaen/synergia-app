// src/modules/auth/components/Login.jsx
import React, { useState } from "react";
import Button from "../../../shared/components/ui/Button.jsx";
import Input from "../../../shared/components/ui/Input.jsx";
import Card from "../../../shared/components/ui/Card.jsx";
import authService from "../services/authService.js";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage("");
    
    try {
      let result;
      
      if (isLogin) {
        result = await authService.signInWithEmail(formData.email, formData.password);
      } else {
        result = await authService.signUpWithEmail(formData.email, formData.password);
      }
      
      if (result.error) {
        setMessage(result.error);
      } else {
        onLogin(result.user);
      }
    } catch (error) {
      setMessage("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const result = await authService.signInWithGoogle();
      
      if (result.error) {
        setMessage(result.error);
      } else {
        onLogin(result.user);
      }
    } catch (error) {
      setMessage("Erreur lors de la connexion avec Google");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage("Veuillez entrer votre email pour réinitialiser le mot de passe");
      return;
    }
    
    setLoading(true);
    const result = await authService.resetPassword(formData.email);
    
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Email de réinitialisation envoyé !");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ⚡ Synergia
          </h1>
          <p className="text-gray-400">
            Plateforme de gestion d'équipe gamifiée
          </p>
        </div>

        <Card>
          <Card.Header>
            <Card.Title>
              {isLogin ? "Connexion" : "Créer un compte"}
            </Card.Title>
          </Card.Header>

          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Adresse email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
                disabled={loading}
              />

              <Input
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {isLogin ? "Se connecter" : "Créer le compte"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm">ou</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>

            {/* Google Sign In */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <span className="mr-2">🔗</span>
              Continuer avec Google
            </Button>

            {/* Messages */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes('envoyé') || message.includes('succès') 
                  ? 'bg-green-900/50 text-green-400 border border-green-700' 
                  : 'bg-red-900/50 text-red-400 border border-red-700'
              }`}>
                {message}
              </div>
            )}
          </Card.Content>

          <Card.Footer>
            <div className="space-y-3">
              {/* Toggle Login/Register */}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setMessage("");
                }}
                className="w-full text-blue-400 hover:text-blue-300 transition-colors"
                disabled={loading}
              >
                {isLogin 
                  ? "Pas encore de compte ? Créer un compte" 
                  : "Déjà inscrit ? Se connecter"
                }
              </button>

              {/* Forgot Password */}
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="w-full text-gray-400 hover:text-gray-300 transition-colors text-sm"
                  disabled={loading}
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          </Card.Footer>
        </Card>

        {/* Version */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Version 2.0.0 - Architecture Modulaire
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
