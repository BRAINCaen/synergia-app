// ==========================================
// 📁 react-app/src/pages/ProfilePage.jsx
// PROFILE PAGE MIGRÉE - Firebase comme source unique
// REMPLACE COMPLÈTEMENT le ProfilePage.jsx existant
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Award, Star, Settings, Edit, Save, X, Shield } from 'lucide-react';

// ✅ NOUVEAU: Import du hook unifié Firebase
import { useUnifiedUser, useUnifiedProfile } from '../shared/hooks/useUnifiedUser.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const ProfilePage = () => {
  const { user, signOut } = useAuthStore();
  
  // ✅ NOUVEAU: Hook unifié - source unique Firebase
  const {
    profile,
    displayName,
    bio,
    department,
    email,
    photoURL,
    updateProfile,
    loading,
    isReady
  } = useUnifiedProfile();
  
  // ✅ NOUVEAU: Données gamification depuis Firebase
  const {
    stats,
    xpProgress,
    badges
  } = useUnifiedUser();

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    department: ''
  });
  const [saving, setSaving] = useState(false);

  // Synchroniser les données avec le formulaire
  useEffect(() => {
    if (isReady) {
      setFormData({
        displayName: displayName || '',
        bio: bio || '',
        department: department || ''
      });
    }
  }, [isReady, displayName, bio, department]);

  // ✅ NOUVEAU: Sauvegarde avec Firebase
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Mise à jour Firebase - se propage automatiquement partout !
      await updateProfile(formData);
      
      setIsEditMode(false);
      
      // Notification de succès temporaire
      showSuccessNotification('Profil mis à jour avec succès !');
      
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      showErrorNotification('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: displayName || '',
      bio: bio || '',
      department: department || ''
    });
    setIsEditMode(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // Notification simple
  const showSuccessNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const showErrorNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  // Loading state
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Synchronisation profil Firebase...</h2>
          <p className="text-gray-500 mt-2">Chargement des données unifiées</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et vos paramètres
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne principale - Informations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Carte profil principal */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Informations personnelles</h2>
                
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Annuler</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Avatar et infos de base */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {displayName || 'Utilisateur'}
                    </h3>
                    <p className="text-gray-600">{email}</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Membre depuis 24/06/2025
                    </p>
                  </div>
                </div>

                {/* Formulaire de modification ou affichage */}
                <div className="space-y-4">
                  
                  {/* Email (non modifiable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{email}</span>
                      <span className="text-green-600 text-sm flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        Email vérifié
                      </span>
                    </div>
                  </div>

                  {/* Nom d'affichage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'affichage</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Votre nom d'affichage"
                      />
                    ) : (
                      <p className="text-gray-900">{displayName || 'Non défini'}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    {isEditMode ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Parlez-nous de vous..."
                      />
                    ) : (
                      <p className="text-gray-900">{bio || 'Aucune description'}</p>
                    )}
                  </div>

                  {/* Département */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                    {isEditMode ? (
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un département</option>
                        <option value="hr">Ressources Humaines</option>
                        <option value="it">Informatique</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Ventes</option>
                        <option value="finance">Finance</option>
                        <option value="operations">Opérations</option>
                        <option value="other">Autre</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{department || 'Non défini'}</p>
                    )}
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">Email vérifié</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale - Progression */}
          <div className="space-y-6">
            
            {/* ✅ NOUVEAU: Progression Firebase synchronisée */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Progression
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Niveau</span>
                    <span className="font-medium">{stats.level}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">XP Total</span>
                    <span className="font-medium">{stats.totalXp}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Tâches complétées</span>
                    <span className="font-medium">{stats.tasksCompleted}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Série de connexions</span>
                    <span className="font-medium">{stats.loginStreak} jour(s)</span>
                  </div>
                </div>
              </div>

              {/* Progression XP */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progression niveau {stats.level}</span>
                  <span className="text-gray-600">{xpProgress.progressXP}/100 XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress.progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {xpProgress.xpToNext} XP pour le niveau {stats.level + 1}
                </p>
              </div>
            </div>

            {/* ✅ NOUVEAU: Mes badges Firebase */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Mes badges
              </h3>
              
              {badges.count > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {badges.badges.slice(0, 4).map((badge, index) => (
                    <div key={index} className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Award className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-xs font-medium text-gray-700 capitalize">
                        {badge.name || badge.type?.replace('_', ' ') || 'Badge'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 text-sm">Aucun badge encore débloqué</p>
                  <p className="text-gray-400 text-xs mt-1">Complétez des tâches pour débloquer vos premiers badges</p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total badges</span>
                  <span className="font-medium text-gray-900">{badges.count}</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Paramètres</span>
                </Link>
                
                <Link
                  to="/gamification"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Star className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Gamification</span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                >
                  <User className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
