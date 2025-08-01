// ==========================================
// 👤 PROFILE PAGE - SYNERGIA v3.5 - VERSION CORRIGÉE
// ==========================================
// Fichier: react-app/src/modules/profile/components/Profile.jsx
// Page de profil avec modales visibles corrigées
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Settings, Edit, Save, X } from 'lucide-react';
import { useAuthStore } from '../../../shared/stores/authStore.js';
import { useGameStore } from '../../../shared/stores/gameStore.js';
import { ROUTES } from '../../../core/constants.js';

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const { level, xp, badges } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    department: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      department: user?.department || ''
    });
    setShowEditModal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {/* Carte profil */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  Modifier
                </button>
              </div>

              {/* Avatar et informations de base */}
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                     user.email ? user.email.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user.displayName || 'Nom non défini'}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Calendar size={16} />
                    <span>Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className={`text-sm mt-1 ${user.emailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
                  </p>
                </div>
              </div>
              
              {user.bio && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Bio</p>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}

              {user.department && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Département</p>
                  <p className="text-gray-900">{user.department}</p>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mes badges</h2>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="font-medium text-gray-900">{badge.name}</p>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucun badge débloqué pour le moment
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Niveau actuel</span>
                  <span className="text-blue-600 font-semibold">Niveau {level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points XP</span>
                  <span className="text-blue-600 font-semibold">{xp} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Badges débloqués</span>
                  <span className="text-green-600 font-semibold">{badges?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Progression niveau */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Niveau {level}</span>
                  <span>Niveau {level + 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${((xp % 100) / 100) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {100 - (xp % 100)} XP pour le niveau suivant
                </p>
              </div>
            </div>

            {/* Paramètres rapides */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Paramètres
              </h3>
              <div className="space-y-2">
                <Link 
                  to={ROUTES.DASHBOARD}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                >
                  Tableau de bord
                </Link>
                <Link 
                  to={ROUTES.TASKS}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                >
                  Mes tâches
                </Link>
                <Link 
                  to={ROUTES.PROJECTS}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                >
                  Mes projets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && (
        <ProfileEditModal
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

// ==========================================
// ✏️ MODAL D'ÉDITION PROFIL - VERSION CORRIGÉE
// ==========================================

const ProfileEditModal = ({ formData, setFormData, onSave, onCancel }) => {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0" onClick={onCancel}></div>
        
        <div 
          className="relative rounded-lg shadow-xl p-6 max-w-md w-full"
          style={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              Modifier le profil
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Nom d'affichage */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Nom d'affichage
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: '#374151',
                  borderColor: '#4b5563',
                  color: '#ffffff'
                }}
                placeholder="Votre nom d'affichage"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border resize-none"
                style={{
                  backgroundColor: '#374151',
                  borderColor: '#4b5563',
                  color: '#ffffff'
                }}
                placeholder="Parlez-nous de vous..."
              />
            </div>

            {/* Département */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#d1d5db' }}>
                Département
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: '#374151',
                  borderColor: '#4b5563',
                  color: '#ffffff'
                }}
                placeholder="Votre département"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: '#374151' }}>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
