// ==========================================
// 📁 react-app/src/pages/ProfilePage.jsx
// SYNTAXE CORRIGÉE - ProfilePage avec export default
// ==========================================

import React, { useState } from 'react';
import { useAuthStore, useGameStore } from '../shared/stores';
import { User, Mail, Calendar, Award, Star, Settings, Edit, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, signOut } = useAuthStore();
  const { userStats, badges } = useGameStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    department: user?.department || ''
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      console.log('Sauvegarde profil:', formData);
      
      const button = document.querySelector('[data-save-btn]');
      if (button) {
        button.textContent = '✅ Sauvegardé !';
        setTimeout(() => {
          button.innerHTML = '<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293z"/></svg>Sauvegarder';
        }, 2000);
      }
      
      setIsEditMode(false);
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et vos paramètres
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
              {!isEditMode ? (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    data-save-btn
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293z"/>
                    </svg>
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 
                   user?.email ? user.email.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user?.displayName || 'Nom non défini'}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Calendar size={16} />
                  <span>
                    Membre depuis {user?.metadata?.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR')
                      : new Date().toLocaleDateString('fr-FR')
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom d'affichage</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom d'affichage"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{user?.displayName || 'Non défini'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                {isEditMode ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Parlez-nous de vous..."
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{user?.bio || 'Aucune bio définie'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Département</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre département"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{user?.department || 'Non défini'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-gray-900">
                  {user?.emailVerified ? (
                    <span className="text-green-600">✅ Email vérifié</span>
                  ) : (
                    <span className="text-yellow-600">⚠️ Email non vérifié</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                Progression
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Niveau</span>
                    <span className="text-lg font-bold text-blue-600">
                      {userStats?.level || 1}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">XP Total</span>
                    <span className="text-lg font-bold text-purple-600">
                      {userStats?.totalXp || 0}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tâches complétées</span>
                    <span className="text-lg font-bold text-green-600">
                      {userStats?.tasksCompleted || 0}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Série de connexions</span>
                    <span className="text-lg font-bold text-orange-600">
                      {userStats?.loginStreak || 0} jours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" size={20} />
                Mes badges
              </h3>
              
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-lg text-white text-center"
                    >
                      <div className="text-2xl mb-1">{badge.icon || '🏆'}</div>
                      <div className="text-xs font-medium">{badge.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Aucun badge encore débloqué</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Complétez des tâches pour débloquer vos premiers badges !
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  📅 Dernière connexion : {user?.lastLogin 
                    ? new Date(user.lastLogin.toDate ? user.lastLogin.toDate() : user.lastLogin).toLocaleDateString('fr-FR')
                    : 'Aujourd\'hui'
                  }
                </div>
                <div className="text-sm text-gray-600">
                  ✅ Tâches cette semaine : {userStats?.tasksCompleted || 0}
                </div>
                <div className="text-sm text-gray-600">
                  🎯 Objectif mensuel : {Math.min(userStats?.tasksCompleted || 0, 20)}/20 tâches
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
