import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../../core/firebase.js';

const TaskComponent = () => {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-2xl font-bold text-white">Synergia</span>
              </Link>
              <span className="text-gray-400">→</span>
              <h1 className="text-xl font-bold text-white">🎯 Mes Tâches</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                🏠 Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
          <div className="text-8xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-white mb-4">Module Tâches en Construction</h2>
          <p className="text-gray-400 mb-6 text-lg">
            Le système de gestion des tâches gamifié sera disponible dans la prochaine version !
          </p>
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">🎮 Fonctionnalités à venir :</h3>
              <ul className="text-blue-200 text-left space-y-1">
                <li>• Création et gestion de tâches</li>
                <li>• Système XP et niveaux</li>
                <li>• Badges et récompenses</li>
                <li>• Leaderboard temps réel</li>
                <li>• Statistiques avancées</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8">
            <Link 
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span>🏠</span>
              <span>Retour au Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskComponent;
