import React from 'react';
import { Link } from 'react-router-dom';

const BadgeCollection = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
          <div className="text-8xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-white mb-4">Collection de Badges</h2>
          <p className="text-gray-400 mb-6 text-lg">
            Votre collection de badges sera disponible ici !
          </p>
          
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

export default BadgeCollection;
