// ==========================================
// 📁 react-app/src/pages/RoleProgressionPage.jsx (VERSION FALLBACK SIMPLE)
// ==========================================

import React from 'react';
import { Crown, Target, TrendingUp } from 'lucide-react';

const RoleProgressionPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-yellow-400" />
            Progression par Rôles
          </h1>
          <p className="text-gray-400">Système de progression en cours de développement...</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Vue d'ensemble</h3>
            <p className="text-gray-400 text-sm">Dashboard de progression complet</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Tâches Spécialisées</h3>
            <p className="text-gray-400 text-sm">Tâches débloquées par niveau</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Badges Exclusifs</h3>
            <p className="text-gray-400 text-sm">Collection de badges par rôle</p>
          </div>
        </div>

        <div className="mt-8 bg-blue-900 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">🚀 Fonctionnalités à venir :</h3>
          <ul className="text-blue-200 space-y-2">
            <li>• Dashboard de progression en temps réel</li>
            <li>• Tâches spécialisées par rôle et niveau</li>
            <li>• Système de badges exclusifs</li>
            <li>• Déverrouillages progressifs</li>
            <li>• Recommandations personnalisées</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoleProgressionPage;

// ==========================================
// 📁 react-app/src/pages/RoleTasksPage.jsx (VERSION FALLBACK SIMPLE)
// ==========================================

export const RoleTasksPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Tâches par Rôle</h1>
        <p className="text-gray-400 mb-8">Système de tâches spécialisées en développement...</p>
        
        <div className="bg-gray-800 rounded-lg p-8">
          <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Tâches Spécialisées</h3>
          <p className="text-gray-400">
            Bientôt disponible : tâches qui se débloquent selon votre progression dans chaque rôle
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 📁 react-app/src/pages/RoleBadgesPage.jsx (VERSION FALLBACK SIMPLE)
// ==========================================

export const RoleBadgesPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Badges Exclusifs par Rôle</h1>
        <p className="text-gray-400 mb-8">Collection de badges spécialisés en développement...</p>
        
        <div className="bg-gray-800 rounded-lg p-8">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Badges de Rôle</h3>
          <p className="text-gray-400">
            Bientôt disponible : badges exclusifs à chaque domaine d'expertise
          </p>
        </div>
      </div>
    </div>
  );
};
