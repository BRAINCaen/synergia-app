// src/pages/ProfilePage.jsx
// Page de profil complète avec gamification corrigée
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
import { useGamification } from '../shared/hooks/useGamification.js';
import { useRealTimeUser, useUpdateUser } from '../shared/hooks/useRealTimeUser.js';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { userData, loading: userLoading } = useRealTimeUser();
  const { updateUserData } = useUpdateUser();
  const { 
    userStats, 
    addXPForEvent, 
    currentLevel, 
    levelProgress,
    getUnlockedBadges,
    getUserInsights 
  } = useGamification();

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
    if (userData) {
      setFormData({
        displayName: userData.profile?.displayName || userData.displayName || '',
        bio: userData.profile?.bio || '',
        department: userData.profile?.department || '',
        preferences: {
          notifications: userData.profile?.preferences?.notifications ?? true,
          publicProfile: userData.profile?.preferences?.publicProfile ?? false,
          emailUpdates: userData.profile?.preferences?.emailUpdates ?? true
        }
      });
    }
  }, [userData]);

  // Sauvegarder le profil
  const saveProfile = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const updates = {
        profile: {
          displayName: formData.displayName,
          bio: formData.bio,
          department: formData.department,
          preferences: formData.preferences,
          completedAt: new Date().toISOString()
        }
      };

      await updateUserData(updates);

      // ✅ Ajouter XP pour la mise à jour du profil (MÉTHODE CORRIGÉE)
      try {
        const xpResult = await addXPForEvent('profile_update');
        if (xpResult.success) {
          console.log('✅ XP ajouté pour mise à jour profil:', xpResult);
        } else {
          console.warn('⚠️ Impossible d\'ajouter XP:', xpResult.error);
        }
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

  // Fonctions utilitaires
  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Non défini';
    }
  };

  const getUserLevel = () => currentLevel || 1;
  const getTotalXP = () => userStats?.totalXp || 0;
  const getUnlockedBadgesList = () => getUnlockedBadges() || [];
  
  // Données de simulation pour les réalisations
  const achievements = [
    {
      id: 1,
      title: 'Première tâche',
      description: 'Créer votre première tâche',
      progress: userStats?.tasksCreated || 0,
      maxProgress: 1,
      icon: Target,
      unlocked: (userStats?.tasksCreated || 0) >= 1
    },
    {
      id: 2,
      title: 'Productif',
      description: 'Compléter 10 tâches',
      progress: userStats?.tasksCompleted || 0,
      maxProgress: 10,
      icon: CheckCircle,
      unlocked: (userStats?.tasksCompleted || 0) >= 10
    },
    {
      id: 3,
      title: 'Série de connexions',
      description: 'Se connecter 7 jours consécutifs',
      progress: userStats?.loginStreak || 0,
      maxProgress: 7,
      icon: Calendar,
      unlocked: (userStats?.loginStreak || 0) >= 7
    },
    {
      id: 4,
      title: 'Niveau expert',
      description: 'Atteindre le niveau 10',
      progress: getUserLevel(),
      maxProgress: 10,
      icon: Crown,
      unlocked: getUserLevel() >= 10
    }
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* En-tête du profil */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            {/* Avatar et infos */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {userData?.profile?.photoURL ? (
                    <img 
                      src={userData.profile.photoURL} 
                      alt={userData.profile?.displayName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    userData?.profile?.displayName?.charAt(0)?.toUpperCase() || 
                    user?.displayName?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-800 hover:bg-gray-600 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              {/* Infos utilisateur */}
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {userData?.profile?.displayName || user?.displayName || 'Utilisateur'}
                  {getUserLevel() >= 10 && <Crown className="w-6 h-6 text-yellow-400" />}
                </h1>
                <p className="text-gray-400 mt-1">{user?.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-400">
                    Niveau {getUserLevel()}
                  </span>
                  <span className="text-sm text-gray-400">
                    {getTotalXP()} XP
                  </span>
                  <span className="text-sm text-gray-400">
                    Membre depuis {formatDate(userData?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                {editing ? 'Annuler' : 'Modifier'}
              </button>
            </div>
          </div>

          {/* Barre de progression niveau */}
          {levelProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Progression niveau {getUserLevel()}</span>
                <span>{levelProgress.current}/{levelProgress.needed} XP</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation onglets */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'profile', label: 'Profil', icon: User },
            { id: 'stats', label: 'Statistiques', icon: BarChart3 },
            { id: 'achievements', label: 'Réalisations', icon: Trophy },
            { id: 'settings', label: 'Paramètres', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Informations personnelles
                </h3>

                {editing ? (
                  <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom d'affichage
                      </label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Département
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un département</option>
                        <option value="tech">Technique</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Ventes</option>
                        <option value="hr">Ressources Humaines</option>
                        <option value="finance">Finance</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Préférences</h4>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.preferences.notifications}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, notifications: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Recevoir les notifications</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.preferences.publicProfile}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, publicProfile: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Profil public</span>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.preferences.emailUpdates}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: { ...prev.preferences, emailUpdates: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Mises à jour par email</span>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom d'affichage
                      </label>
                      <p className="text-white">{userData?.profile?.displayName || 'Non défini'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <p className="text-white">{userData?.profile?.bio || 'Aucune bio définie'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Département
                      </label>
                      <p className="text-white">{userData?.profile?.department || 'Non défini'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <p className="text-gray-400">{user?.email}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Préférences</h4>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Notifications</span>
                        <span className="text-white">
                          {userData?.profile?.preferences?.notifications ? 'Activées' : 'Désactivées'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Profil public</span>
                        <span className="text-white">
                          {userData?.profile?.preferences?.publicProfile ? 'Public' : 'Privé'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Mises à jour par email</span>
                        <span className="text-white">
                          {userData?.profile?.preferences?.emailUpdates ? 'Activées' : 'Désactivées'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistiques rapides */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tâches complétées</span>
                    <span className="text-white font-semibold">{userStats?.tasksCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Projets créés</span>
                    <span className="text-white font-semibold">{userStats?.projectsCreated || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points XP</span>
                    <span className="text-blue-400 font-semibold">{getTotalXP()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Série de connexions</span>
                    <span className="text-orange-400 font-semibold">{userStats?.loginStreak || 0}</span>
                  </div>
                </div>
              </div>

              {/* Badges récents */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Badges débloqués
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {getUnlockedBadgesList().slice(0, 6).map((badge, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 p-2 rounded text-center"
                      title={badge.name || `Badge ${index + 1}`}
                    >
                      <div className="text-lg">{badge.icon || '🏆'}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {badge.name || `Badge ${index + 1}`}
                      </div>
                    </div>
                  ))}
                  {getUnlockedBadgesList().length === 0 && (
                    <div className="col-span-3 text-center text-gray-400 py-4">
                      Aucun badge débloqué
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cartes de statistiques */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">XP Total</p>
                  <p className="text-2xl font-bold text-blue-400">{getTotalXP()}</p>
                </div>
                <Star className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Niveau</p>
                  <p className="text-2xl font-bold text-purple-400">{getUserLevel()}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tâches complétées</p>
                  <p className="text-2xl font-bold text-green-400">{userStats?.tasksCompleted || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Série actuelle</p>
                  <p className="text-2xl font-bold text-orange-400">{userStats?.loginStreak || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Réalisations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border ${
                        achievement.unlocked
                          ? 'bg-green-900/20 border-green-500'
                          : 'bg-gray-700 border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className={`w-6 h-6 ${
                          achievement.unlocked ? 'text-green-400' : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-white">{achievement.title}</h4>
                          <p className="text-sm text-gray-400">{achievement.description}</p>
                        </div>
                        {achievement.unlocked && (
                          <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span>Progression</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.unlocked
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}
                          style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Paramètres du compte
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-white mb-4">Informations du compte</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Compte créé le</span>
                      <span className="text-white">{formatDate(userData?.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dernière connexion</span>
                      <span className="text-white">{formatDate(userData?.lastLoginAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h4 className="font-medium text-white mb-4">Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                      Changer le mot de passe
                    </button>
                    <button className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white">
                      Exporter mes données
                    </button>
                    <button className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white">
                      Supprimer le compte
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
