// ==========================================
// 📁 react-app/src/pages/ProfilePage.jsx
// ==========================================

import React from 'react';
import { useAuthStore, useGameStore } from '../shared/stores';

const ProfilePage = () => {
  const { user, signOut } = useAuthStore();
  const { userStats } = useGameStore();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations personnelles */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Informations personnelles</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <p className="mt-1 text-gray-900">{user?.displayName || 'Non défini'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Membre depuis</label>
              <p className="mt-1 text-gray-900">
                {user?.metadata?.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 
                  'Non disponible'
                }
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🚪 Se déconnecter
            </button>
          </div>
        </div>

        {/* Statistiques gamification */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Gamification</h2>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{userStats.level}</div>
              <div className="text-sm text-gray-600">Niveau</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userStats.totalXp}</div>
              <div className="text-sm text-gray-600">XP Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{userStats.badges?.length || 0}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{userStats.tasksCompleted || 0}</div>
              <div className="text-sm text-gray-600">Tâches complétées</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
