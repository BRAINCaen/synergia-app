// src/modules/dashboard/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores/authStore';
import { useGameLevel, useGameXP } from '../../shared/stores/gameStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const currentLevel = useGameLevel();
  const currentXP = useGameXP();

  return (
    <div className="space-y-6">
      {/* Header de bienvenue */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-6 border border-purple-500/20">
        <h1 className="text-3xl font-bold text-white mb-2">
          Bienvenue, {user?.displayName || user?.email?.split('@')[0]} ! 👋
        </h1>
        <p className="text-purple-300">
          Votre espace de travail personnel dans Synergia
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Niveau actuel</p>
              <p className="text-2xl font-bold text-white">{currentLevel}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">XP Total</p>
              <p className="text-2xl font-bold text-white">{currentXP}</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Statut</p>
              <p className="text-lg font-medium text-green-400">Actif</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            🚀 Actions Rapides
          </h3>
          <div className="space-y-3">
            <Link
              to="/gamification"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 px-4 rounded-lg transition-colors"
            >
              🎮 Voir ma Progression
            </Link>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
              📋 Créer une Tâche
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors">
              📊 Voir les Statistiques
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            📈 Aperçu Récent
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-white text-sm font-medium">Objectif atteint</p>
                  <p className="text-gray-400 text-xs">Il y a 2 heures</p>
                </div>
              </div>
              <span className="text-green-400 text-sm">+25 XP</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-white text-sm font-medium">Connexion quotidienne</p>
                  <p className="text-gray-400 text-xs">Aujourd'hui</p>
                </div>
              </div>
              <span className="text-blue-400 text-sm">+10 XP</span>
            </div>

            <div className="text-center mt-4">
              <Link
                to="/gamification"
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
              >
                Voir toute l'activité →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du compte */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          👤 Informations du Compte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Membre depuis</p>
            <p className="text-white">
              {user?.metadata?.creationTime 
                ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR')
                : 'Récemment'
              }
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Dernière connexion</p>
            <p className="text-white">
              {user?.metadata?.lastSignInTime 
                ? new Date(user.metadata.lastSignInTime).toLocaleDateString('fr-FR')
                : 'Maintenant'
              }
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Statut de vérification</p>
            <p className={user?.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
              {user?.emailVerified ? '✅ Vérifié' : '⏳ En attente'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
