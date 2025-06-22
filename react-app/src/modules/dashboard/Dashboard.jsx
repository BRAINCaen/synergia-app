// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../core/firebase";
import useAuthStore from "../shared/stores/authStore";
import userService from "../modules/auth/services/userService";
import WelcomeWidget from "../modules/dashboard/widgets/WelcomeWidget";

export default function Dashboard() {
  const { user, userProfile, setUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const result = await userService.getUserProfile(user.uid);
      
      if (result.error) {
        setError(result.error);
      } else {
        setUserProfile(result.profile);
      }
    } catch (err) {
      console.error("Erreur chargement profil:", err);
      setError("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-white">Chargement du profil...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">❌ Erreur</div>
          <div className="text-white mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Modern */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Synergia</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs rounded-full font-medium">
                  v2.0 • Modulaire
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg"
                />
                <div className="hidden md:block text-right">
                  <p className="text-white font-medium">
                    {userProfile?.displayName || user.displayName || user.email}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {userProfile?.role === 'admin' ? '👑 Admin' : 
                     userProfile?.role === 'manager' ? '⭐ Manager' : 
                     '👤 Membre'}
                  </p>
                </div>
                <button
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Welcome Widget */}
        <div className="mb-8">
          <WelcomeWidget user={user} userProfile={userProfile} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Statut</p>
                <p className="text-2xl font-bold text-green-400">
                  {userProfile?.status === 'active' ? 'Actif' : 'Inactif'}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Niveau</p>
                <p className="text-2xl font-bold text-blue-400">
                  {userProfile?.gamification?.level || 1}
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Expérience</p>
                <p className="text-2xl font-bold text-purple-400">
                  {userProfile?.gamification?.xp || 0} XP
                </p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-600 rounded-lg mr-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Architecture Modulaire</h3>
                <p className="text-gray-400">Fondations solides pour l'évolution</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span>Services d'authentification optimisés</span>
              </div>
              <div className="flex items-center text-green-400">
                <span className="mr-2">✓</span>
                <span>Interface utilisateur moderne</span>
              </div>
              <div className="flex items-center text-yellow-400">
                <span className="mr-2">⏳</span>
                <span>Modules en cours de développement</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-600 rounded-lg mr-4">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Roadmap 2025</h3>
                <p className="text-gray-400">Prochaines fonctionnalités</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Phase 1 - Architecture</span>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Terminé</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Phase 2 - Gamification</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">En cours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Phase 3 - Pointage</span>
                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">Planifiée</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Roadmap */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">🚀</span>
            Modules en Développement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: 'Gamification', 
                icon: '🎮', 
                description: 'Points, badges, niveaux',
                status: 'En développement',
                progress: 75,
                color: 'purple'
              },
              { 
                name: 'Pointage', 
                icon: '⏰', 
                description: 'Gestion du temps',
                status: 'Planifié',
                progress: 0,
                color: 'blue'
              },
              { 
                name: 'Messagerie', 
                icon: '💬', 
                description: 'Chat d\'équipe',
                status: 'Planifié',
                progress: 0,
                color: 'green'
              },
              { 
                name: 'Boutique', 
                icon: '🛒', 
                description: 'Récompenses',
                status: 'Planifié',
                progress: 0,
                color: 'orange'
              }
            ].map((module) => (
              <div key={module.name} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all group hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-3">{module.icon}</div>
                  <h3 className="font-bold text-white mb-2">{module.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{module.description}</p>
                  
                  <div className="mb-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          module.color === 'purple' ? 'bg-purple-500' :
                          module.color === 'blue' ? 'bg-blue-500' :
                          module.color === 'green' ? 'bg-green-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">{module.progress}%</span>
                  </div>
                  
                  <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                    module.status === 'En développement' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {module.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">🎉 Synergia v2.0 est maintenant en ligne !</h3>
            <p className="text-gray-300 mb-4">
              Architecture modulaire déployée avec succès. Les prochaines fonctionnalités arriveront progressivement.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <span>✨ Interface moderne</span>
              <span>•</span>
              <span>🔧 Architecture évolutive</span>
              <span>•</span>
              <span>🚀 Prêt pour la gamification</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
