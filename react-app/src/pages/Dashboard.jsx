// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../core/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../shared/stores/authStore.js";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      logout();
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white">Chargement du profil...</div>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur (ne devrait pas arriver grâce à ProtectedRoute)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Erreur d'authentification</h2>
          <p className="text-gray-400">Veuillez vous reconnecter</p>
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
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email || 'default'}`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400 shadow-lg"
                />
                <div className="hidden md:block text-right">
                  <p className="text-white font-medium">
                    {userProfile?.displayName || user.displayName || user.email || 'Utilisateur'}
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-3">
                {getGreeting()}, {userProfile?.displayName || user.displayName || 'Équipier'} ! 👋
              </h2>
              <p className="text-blue-100 text-lg mb-4">
                Bienvenue dans Synergia v2.0 avec la nouvelle architecture modulaire ! 🚀
              </p>
              <div className="flex flex-wrap gap-4 text-blue-200">
                <span className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>📅</span>
                  <span className="text-sm">
                    {new Date().toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </span>
                <span className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>🎯</span>
                  <span className="text-sm">Niveau {userProfile?.level || 1}</span>
                </span>
                <span className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>⭐</span>
                  <span className="text-sm">{userProfile?.xp || 0} XP</span>
                </span>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email || 'default'}`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  En ligne
                </div>
              </div>
            </div>
          </div>
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
                  {userProfile?.level || 1}
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
                  {userProfile?.xp || 0} XP
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

        {/* Success Message */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">🎉 Architecture Modulaire Déployée !</h3>
            <p className="text-gray-300 mb-4">
              Synergia v2.0 fonctionne parfaitement avec la nouvelle structure modulaire.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <span>✨ Stores Zustand</span>
              <span>•</span>
              <span>🛣️ React Router</span>
              <span>•</span>
              <span>🔐 Firebase Auth</span>
              <span>•</span>
              <span>🚀 Prêt pour Phase 2</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
