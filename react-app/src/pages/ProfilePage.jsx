// react-app/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit3, 
  Settings, 
  Camera, 
  Crown, 
  Star, 
  Trophy, 
  Award,
  Target,
  Calendar,
  CheckCircle,
  BarChart3,
  Save,
  X
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useGameStore } from '../shared/stores/gameStore.js';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { userStats, addXP } = useGameStore();
  
  // États locaux
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    department: '',
    preferences: {
      notifications: true,
      publicProfile: false,
      emailUpdates: true
    }
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        department: user.department || '',
        preferences: {
          notifications: true,
          publicProfile: false,
          emailUpdates: true
        }
      });
    }
  }, [user]);

  // Sauvegarder le profil
  const saveProfile = async () => {
    setSaving(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ajouter de l'XP pour la mise à jour du profil
      try {
        await addXP(10, 'Mise à jour du profil');
      } catch (xpError) {
        console.warn('⚠️ Erreur ajout XP:', xpError);
      }

      setEditing(false);
    } catch (error) {
      console.error('❌ Erreur sauvegarde profil:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculer les données de niveau de manière sécurisée
  const getLevelData = () => {
    if (!userStats) {
      return {
        currentLevel: 1,
        totalXP: 0,
        progressPercentage: 0,
        nextLevelXP: 100,
        currentLevelXP: 0
      };
    }

    const currentLevel = userStats.level || 1;
    const totalXP = userStats.totalXp || 0;
    const currentLevelXP = (currentLevel - 1) * 100;
    const nextLevelXP = currentLevel * 100;
    const progressXP = totalXP - currentLevelXP;
    const progressPercentage = Math.round((progressXP / 100) * 100);

    return {
      currentLevel,
      totalXP,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
      nextLevelXP,
      currentLevelXP,
      progressXP: Math.max(0, progressXP),
      remainingXP: Math.max(0, nextLevelXP - totalXP)
    };
  };

  const levelData = getLevelData();

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Non défini';
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'gamification', name: 'Gamification', icon: Trophy },
    { id: 'settings', name: 'Paramètres', icon: Settings }
  ];

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* En-tête du profil */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="text-xl font-bold text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                  placeholder="Votre nom"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">
                  {formData.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                </h1>
              )}
              
              <p className="text-gray-600">{user?.email}</p>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Niveau {levelData.currentLevel}</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-blue-500" />
                  <span>{levelData.totalXP} XP</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="Parlez-nous de vous..."
            />
          ) : (
            <p className="text-gray-600">
              {formData.bio || 'Aucune bio renseignée'}
            </p>
          )}
        </div>

        {/* Département */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
          {editing ? (
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre département"
            />
          ) : (
            <p className="text-gray-600">
              {formData.department || 'Aucun département renseigné'}
            </p>
          )}
        </div>
      </div>

      {/* Informations du compte */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Informations du compte</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Membre depuis</label>
            <p className="text-gray-900">
              {formatDate(user?.metadata?.creationTime)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Dernière connexion</label>
            <p className="text-gray-900">
              {formatDate(user?.metadata?.lastSignInTime)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Actif
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const GamificationTab = () => (
    <div className="space-y-6">
      {/* Progression du niveau */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Progression</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Niveau actuel */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {levelData.currentLevel}
            </div>
            <div className="text-sm text-gray-600">Niveau actuel</div>
          </div>
          
          {/* XP Total */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {levelData.totalXP}
            </div>
            <div className="text-sm text-gray-600">XP Total</div>
          </div>
          
          {/* Badges */}
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {userStats?.badges?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progrès vers le niveau {levelData.currentLevel + 1}</span>
            <span>{levelData.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${levelData.progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{levelData.progressXP} XP</span>
            <span>{levelData.remainingXP} XP restants</span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {userStats?.tasksCompleted || 0}
            </div>
            <div className="text-sm text-gray-600">Tâches complétées</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {userStats?.projectsCompleted || 0}
            </div>
            <div className="text-sm text-gray-600">Projets terminés</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {userStats?.loginStreak || 0}
            </div>
            <div className="text-sm text-gray-600">Série de connexions</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {levelData.currentLevel}
            </div>
            <div className="text-sm text-gray-600">Niveau atteint</div>
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Paramètres</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Recevoir des notifications sur les activités</p>
            </div>
            <input
              type="checkbox"
              checked={formData.preferences.notifications}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  notifications: e.target.checked
                }
              })}
              className="h-4 w-4 text-blue-600"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Profil public</h3>
              <p className="text-sm text-gray-600">Autoriser les autres à voir votre profil</p>
            </div>
            <input
              type="checkbox"
              checked={formData.preferences.publicProfile}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  publicProfile: e.target.checked
                }
              })}
              className="h-4 w-4 text-blue-600"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Emails de mise à jour</h3>
              <p className="text-sm text-gray-600">Recevoir des emails sur les nouveautés</p>
            </div>
            <input
              type="checkbox"
              checked={formData.preferences.emailUpdates}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  emailUpdates: e.target.checked
                }
              })}
              className="h-4 w-4 text-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et vos paramètres</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'gamification' && <GamificationTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default ProfilePage;
