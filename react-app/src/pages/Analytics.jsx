// react-app/src/pages/Analytics.jsx
// VERSION TEMPORAIRE pour fix build - remplacer plus tard par la version complète
import React from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';

const Analytics = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-400 mb-8">
            Module en cours de développement
          </p>
          
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Sprint 1 : Analytics en développement
            </h2>
            <p className="text-gray-300 mb-6">
              Les composants analytics sont en cours d'intégration.
              Cette page sera bientôt disponible avec :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">📈</div>
                <h3 className="text-white font-medium">Graphiques temps réel</h3>
                <p className="text-gray-400 text-sm">Progression tâches</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-white font-medium">Métriques équipe</h3>
                <p className="text-gray-400 text-sm">Vélocité & performance</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="text-white font-medium">Projets</h3>
                <p className="text-gray-400 text-sm">Suivi progression</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="text-white font-medium">Export rapports</h3>
                <p className="text-gray-400 text-sm">Données JSON/CSV</p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">
                🚀 Prochaines étapes
              </h4>
              <p className="text-blue-200 text-sm">
                Utilisateur connecté : <span className="font-medium">{user?.email}</span>
                <br />
                Une fois les composants analytics déployés, vous aurez accès à :
                • Métriques temps réel • Graphiques interactifs • Export de données
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
