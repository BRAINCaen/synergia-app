// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../core/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../shared/stores/authStore";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
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
        <div className="text-white">Chargement du profil...</div>
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
                  <span className="text-sm">Niveau {userProfile?.gamification?.level || 1}</span>
                </span>
                <span className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span>⭐</span>
                  <span className="text-sm">{userProfile?.gamification?.xp || 0} XP</span>
                </span>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
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
                  {userProfile?.status === 'active' ? 'Actif' : 'Actif'}
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

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">🎉 Synergia v2.0 est maintenant en ligne !</h3>
            <p className="text-gray-300 mb-4">
              Architecture modulaire déployée avec succès. Phase 2.4 Gamification en cours de finalisation.
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
