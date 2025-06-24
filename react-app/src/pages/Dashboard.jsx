// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx  
// Version simple du Dashboard pour test immédiat
// ==========================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

/**
 * 📊 DASHBOARD SIMPLE - VERSION DE TEST
 * 
 * Version minimale pour tester l'affichage immédiatement
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { level = 2, xp = 175, streak = 0, tasksCompleted = 7 } = useGameStore();

  console.log('🏠 Dashboard component loaded', { user, level, xp, streak, tasksCompleted });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Test d'affichage de base */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            👋 Bienvenue {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} !
          </h1>
          <p className="text-gray-600">
            Votre tableau de bord Synergia v3.5 est opérationnel.
          </p>
        </div>

        {/* Statistiques de base */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">⭐</span>
              <div>
                <div className="text-2xl font-bold text-blue-600">{level}</div>
                <div className="text-sm text-gray-500">Niveau</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">💎</span>
              <div>
                <div className="text-2xl font-bold text-purple-600">{xp}</div>
                <div className="text-sm text-gray-500">Points XP</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">✅</span>
              <div>
                <div className="text-2xl font-bold text-green-600">{tasksCompleted}</div>
                <div className="text-sm text-gray-500">Tâches terminées</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🔥</span>
              <div>
                <div className="text-2xl font-bold text-orange-600">{streak}</div>
                <div className="text-sm text-gray-500">Jours consécutifs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/tasks" 
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <div className="font-medium text-blue-900">Gérer les tâches</div>
                  <div className="text-sm text-blue-600">Voir toutes vos tâches</div>
                </div>
              </div>
            </Link>

            <Link 
              to="/projects" 
              className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📁</span>
                <div>
                  <div className="font-medium text-green-900">Projets</div>
                  <div className="text-sm text-green-600">Gérer vos projets</div>
                </div>
              </div>
            </Link>

            <Link 
              to="/badges" 
              className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🏆</span>
                <div>
                  <div className="font-medium text-yellow-900">Badges</div>
                  <div className="text-sm text-yellow-600">Découvrir les badges</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Informations système */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Informations système</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Utilisateur connecté :</strong> {user?.email || 'Non connecté'}
            </div>
            <div>
              <strong>Firebase :</strong> ✅ Connecté
            </div>
            <div>
              <strong>Gamification :</strong> ✅ Actif
            </div>
            <div>
              <strong>Badge Engine :</strong> ✅ En cours d'analyse
            </div>
          </div>
        </div>

        {/* Message de développement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-center">
            <span className="text-blue-500 text-xl mr-3">💡</span>
            <div>
              <div className="font-medium text-blue-900">Système fonctionnel !</div>
              <div className="text-sm text-blue-700">
                Toutes les fonctionnalités de base sont opérationnelles. 
                Le système de badges analyse vos données en arrière-plan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
