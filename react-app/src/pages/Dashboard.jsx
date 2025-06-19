// src/pages/Dashboard.jsx
import React from "react";
import { auth } from "../core/firebase";

export default function Dashboard({ user, onLogout }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header avec nouvelle version */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">⚡ Synergia</h1>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full font-medium">
              v2.0 - Architecture Modulaire
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border-2 border-blue-400"
              />
              <span className="text-white font-medium">
                {user.displayName || user.email}
              </span>
              <button
                className="bg-pink-600 hover:bg-pink-700 rounded px-4 py-2 font-bold text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => { 
                  auth.signOut(); 
                  onLogout(); 
                }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Section de bienvenue améliorée */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-3">
                  {getGreeting()}, {user.displayName || 'Équipier'} ! 👋
                </h2>
                <p className="text-blue-100 mb-4 text-lg">
                  Bienvenue dans la nouvelle version de Synergia avec architecture modulaire ! 🚀
                </p>
                <div className="flex items-center space-x-6 text-blue-200">
                  <span className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>{formatDate()}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span>✨</span>
                    <span>Prêt pour la gamification</span>
                  </span>
                </div>
              </div>
              
              <div className="hidden md:block">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Nouvelles fonctionnalités */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Architecture modulaire */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                  <span className="text-2xl">🏗️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Architecture Modulaire</h3>
                  <p className="text-gray-400">Base solide pour l'évolution</p>
                </div>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Services d'authentification refactorisés
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  Structure modulaire prête
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-400 mr-2">⏳</span>
                  Migration progressive en cours
                </li>
              </ul>
            </div>

            {/* Prochaines étapes */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 p-3 rounded-lg mr-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Prochaines Étapes</h3>
                  <p className="text-gray-400">Roadmap de développement</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Phase 1 - Architecture</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">En cours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Phase 2 - Gamification</span>
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Prochaine</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Phase 3 - Pointage</span>
                  <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">Planifiée</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modules à venir - Version améliorée */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3">🚀</span>
              Modules en Développement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  name: 'Gamification', 
                  icon: '🎮', 
                  description: 'Système de points, badges et niveaux',
                  phase: 'Phase 2',
                  progress: 15,
                  color: 'from-purple-600 to-pink-600'
                },
                { 
                  name: 'Pointage', 
                  icon: '⏰', 
                  description: 'Gestion du temps et présence',
                  phase: 'Phase 3',
                  progress: 5,
                  color: 'from-blue-600 to-cyan-600'
                },
                { 
                  name: 'Messagerie', 
                  icon: '💬', 
                  description: 'Chat d\'équipe temps réel',
                  phase: 'Phase 4',
                  progress: 0,
                  color: 'from-green-600 to-emerald-600'
                },
                { 
                  name: 'Boutique', 
                  icon: '🛒', 
                  description: 'Récompenses et avantages',
                  phase: 'Phase 5',
                  progress: 0,
                  color: 'from-orange-600 to-red-600'
                }
              ].map((module) => (
                <div key={module.name} className="relative group">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 group-hover:transform group-hover:scale-105">
                    <div className="text-center">
                      <div className={`text-4xl mb-3 p-3 rounded-lg bg-gradient-to-r ${module.color} inline-block`}>
                        {module.icon}
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">{module.name}</h3>
                      <p className="text-gray-400 text-sm mb-3 h-10">{module.description}</p>
                      
                      {/* Barre de progression */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                            style={{ width: `${module.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">{module.progress}% complété</span>
                      </div>
                      
                      <span className={`inline-block px-3 py-1 bg-gradient-to-r ${module.color} text-white text-xs rounded-full font-medium`}>
                        {module.phase}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informations de migration */}
          <div className="mt-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <span className="text-3xl">🔧</span>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-bold text-lg mb-2">Migration en Cours</h3>
                <p className="text-yellow-200 mb-3">
                  Synergia évolue vers une architecture modulaire pour supporter les fonctionnalités avancées à venir.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-yellow-300 font-semibold mb-1">✅ Terminé :</h4>
                    <ul className="text-yellow-100 space-y-1">
                      <li>• Configuration modulaire</li>
                      <li>• Services d'authentification</li>
                      <li>• Interface utilisateur de base</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-yellow-300 font-semibold mb-1">🚧 En cours :</h4>
                    <ul className="text-yellow-100 space-y-1">
                      <li>• Composants UI réutilisables</li>
                      <li>• Gestion des profils utilisateur</li>
                      <li>• Préparation gamification</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
