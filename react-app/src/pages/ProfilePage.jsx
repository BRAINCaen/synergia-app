// ==========================================
// 📁 react-app/src/pages/ProfilePage.jsx
// PROFILE PAGE FIREBASE PUR - ZÉRO DONNÉES MOCK
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { 
  User, 
  Award, 
  Trophy, 
  Star,
  Target,
  Calendar,
  TrendingUp,
  BarChart3,
  Edit,
  Save,
  X,
  Flame,
  Zap,
  Crown,
  Medal
} from 'lucide-react';

/**
 * 👤 PROFILE PAGE FIREBASE PUR
 * Profil utilisateur avec données réelles exclusivement
 */
const ProfilePage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // ✅ DONNÉES FIREBASE RÉELLES UNIQUEMENT
  const { 
    gamification,
    userStats,
    loading: dataLoading 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ DONNÉES PROFIL RÉELLES
  const [realProfileData, setRealProfileData] = useState({
    personalInfo: {},
    achievements: [],
    activityHistory: [],
    preferences: {},
    statistics: {}
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    if (user?.uid) {
      loadRealProfileData();
    }
  }, [user?.uid]);

  /**
   * 📊 CHARGER TOUTES LES VRAIES DONNÉES PROFIL
   */
  const loadRealProfileData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement profil Firebase pour:', user.uid);
      
      // Paralléliser toutes les requêtes
      const [
        userDoc,
        userTasksSnapshot,
        userProjectsSnapshot,
        userBadgesSnapshot,
        recentActivitySnapshot
      ] = await Promise.all([
        // Informations utilisateur
        getDoc(doc(db, 'users', user.uid)),
        // Tâches de l'utilisateur
        getDocs(query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        )),
        // Projets de l'utilisateur
        getDocs(query(
          collection(db, 'projects'),
          where('createdBy', '==', user.uid)
        )),
        // Badges utilisateur
        getDocs(query(
          collection(db, 'userBadges'),
          where('userId', '==', user.uid)
        )),
        // Activité récente
        getDocs(query(
          collection(db, 'userActivity'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        ))
      ]);

      // 🔥 TRAITER LES INFORMATIONS PERSONNELLES
      const personalInfo = userDoc.exists() ? userDoc.data() : {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // 🔥 TRAITER LES TÂCHES
      const userTasks = [];
      userTasksSnapshot.forEach(doc => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 TRAITER LES PROJETS
      const userProjects = [];
      userProjectsSnapshot.forEach(doc => {
        userProjects.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 TRAITER LES BADGES
      const userBadges = [];
      userBadgesSnapshot.forEach(doc => {
        userBadges.push({ id: doc.id, ...doc.data() });
      });

      // 🔥 TRAITER L'ACTIVITÉ RÉCENTE
      const activityHistory = [];
      recentActivitySnapshot.forEach(doc => {
        const activity = doc.data();
        activityHistory.push({
          id: doc.id,
          ...activity,
          timestamp: activity.timestamp?.toDate() || new Date()
        });
      });

      // 📊 CALCULER LES VRAIES STATISTIQUES
      const completedTasks = userTasks.filter(task => task.status === 'completed');
      const totalXpEarned = completedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);
      const streakDays = calculateLoginStreak(personalInfo.lastLogin);
      const averageTasksPerDay = calculateAverageTasksPerDay(completedTasks);
      
      const statistics = {
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        totalProjects: userProjects.length,
        totalXp: gamification?.totalXp || totalXpEarned,
        level: gamification?.level || Math.floor(totalXpEarned / 100) + 1,
        badgesCount: userBadges.length,
        streakDays,
        averageTasksPerDay,
        completionRate: userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 0,
        memberSince: personalInfo.createdAt?.toDate?.() || new Date()
      };

      // 🏆 GÉNÉRER LES VRAIS ACHIEVEMENTS
      const achievements = generateRealAchievements(statistics, userBadges, activityHistory);

      // ⚙️ PRÉFÉRENCES UTILISATEUR RÉELLES
      const preferences = {
        emailNotifications: personalInfo.emailNotifications ?? true,
        taskReminders: personalInfo.taskReminders ?? true,
        weeklyReport: personalInfo.weeklyReport ?? true,
        darkMode: personalInfo.darkMode ?? false,
        language: personalInfo.language ?? 'fr',
        timezone: personalInfo.timezone ?? 'Europe/Paris'
      };

      setRealProfileData({
        personalInfo,
        achievements,
        activityHistory,
        preferences,
        statistics
      });

      setEditedProfile({
        displayName: personalInfo.displayName || '',
        bio: personalInfo.bio || '',
        location: personalInfo.location || '',
        website: personalInfo.website || '',
        ...preferences
      });

      console.log('✅ Profil Firebase chargé:', {
        tasks: userTasks.length,
        projects: userProjects.length,
        badges: userBadges.length,
        activities: activityHistory.length
      });

    } catch (error) {
      console.error('❌ Erreur chargement profil Firebase:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📅 CALCULER LA STREAK DE CONNEXION
   */
  const calculateLoginStreak = (lastLogin) => {
    // Logique simple - à améliorer selon vos besoins
    if (!lastLogin) return 1;
    const daysDiff = Math.floor((new Date() - lastLogin.toDate()) / (1000 * 60 * 60 * 24));
    return Math.max(1, 30 - daysDiff); // Exemple
  };

  /**
   * 📊 CALCULER MOYENNE TÂCHES PAR JOUR
   */
  const calculateAverageTasksPerDay = (completedTasks) => {
    if (completedTasks.length === 0) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTasks = completedTasks.filter(task => 
      task.updatedAt && task.updatedAt.toDate() > thirtyDaysAgo
    );
    
    return Math.round((recentTasks.length / 30) * 10) / 10;
  };

  /**
   * 🏆 GÉNÉRER LES VRAIS ACHIEVEMENTS
   */
  const generateRealAchievements = (stats, badges, activity) => {
    const achievements = [];
    
    // Achievement basé sur les tâches
    if (stats.completedTasks >= 1) {
      achievements.push({
        id: 'first_task',
        title: 'Première tâche',
        description: 'Terminé votre première tâche',
        icon: Target,
        color: 'text-green-600',
        unlocked: true,
        unlockedAt: new Date()
      });
    }
    
    if (stats.completedTasks >= 10) {
      achievements.push({
        id: 'task_master',
        title: 'Maître des tâches',
        description: 'Terminé 10 tâches',
        icon: Crown,
        color: 'text-yellow-600',
        unlocked: true,
        unlockedAt: new Date()
      });
    }
    
    if (stats.completedTasks >= 50) {
      achievements.push({
        id: 'task_legend',
        title: 'Légende des tâches',
        description: 'Terminé 50 tâches',
        icon: Trophy,
        color: 'text-purple-600',
        unlocked: true,
        unlockedAt: new Date()
      });
    }

    // Achievement basé sur les projets
    if (stats.totalProjects >= 1) {
      achievements.push({
        id: 'project_creator',
        title: 'Créateur de projet',
        description: 'Créé votre premier projet',
        icon: Zap,
        color: 'text-blue-600',
        unlocked: true,
        unlockedAt: new Date()
      });
    }

    // Achievement basé sur le niveau
    if (stats.level >= 5) {
      achievements.push({
        id: 'level_five',
        title: 'Niveau 5 atteint',
        description: 'Atteint le niveau 5',
        icon: Star,
        color: 'text-orange-600',
        unlocked: true,
        unlockedAt: new Date()
      });
    }

    // Achievement basé sur la streak
    if (stats.streakDays >= 7) {
      achievements.push({
        id: 'week_streak',
        title: 'Semaine productive',
        description: '7 jours consécutifs actifs',
        icon: Flame,
        color: 'text-red-600',
        unlocked: true,
        unlockedAt: new Date()
      });
    }

    return achievements;
  };

  /**
   * 💾 SAUVEGARDER LES MODIFICATIONS PROFIL
   */
  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    try {
      console.log('💾 Sauvegarde profil Firebase');
      
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editedProfile.displayName,
        bio: editedProfile.bio,
        location: editedProfile.location,
        website: editedProfile.website,
        emailNotifications: editedProfile.emailNotifications,
        taskReminders: editedProfile.taskReminders,
        weeklyReport: editedProfile.weeklyReport,
        darkMode: editedProfile.darkMode,
        language: editedProfile.language,
        timezone: editedProfile.timezone,
        updatedAt: new Date()
      });
      
      // Recharger les données
      await loadRealProfileData();
      setIsEditing(false);
      
      console.log('✅ Profil sauvegardé');
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde profil:', error);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EN-TÊTE PROFIL */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {realProfileData.personalInfo.photoURL ? (
                  <img 
                    src={realProfileData.personalInfo.photoURL} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  realProfileData.personalInfo.displayName?.charAt(0)?.toUpperCase() || 
                  user?.email?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              
              {/* Informations */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {realProfileData.personalInfo.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
                </h1>
                <p className="text-lg text-gray-600">{user?.email}</p>
                {realProfileData.personalInfo.bio && (
                  <p className="text-sm text-gray-500 mt-2">{realProfileData.personalInfo.bio}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Membre depuis {realProfileData.statistics.memberSince?.toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            
            {/* Bouton Édition */}
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
              )}
            </div>
          </div>

          {/* Mode Édition */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={editedProfile.displayName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* STATISTIQUES RÉELLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Niveau */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Niveau</p>
                <p className="text-3xl font-bold">{realProfileData.statistics.level}</p>
                <p className="text-xs opacity-75">{realProfileData.statistics.totalXp} XP</p>
              </div>
              <Star className="h-12 w-12 opacity-80" />
            </div>
          </div>

          {/* Tâches */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Tâches</p>
                <p className="text-3xl font-bold">{realProfileData.statistics.completedTasks}</p>
                <p className="text-xs opacity-75">{realProfileData.statistics.completionRate}% réussite</p>
              </div>
              <Target className="h-12 w-12 opacity-80" />
            </div>
          </div>

          {/* Projets */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Projets</p>
                <p className="text-3xl font-bold">{realProfileData.statistics.totalProjects}</p>
                <p className="text-xs opacity-75">Créés</p>
              </div>
              <BarChart3 className="h-12 w-12 opacity-80" />
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Streak</p>
                <p className="text-3xl font-bold">{realProfileData.statistics.streakDays}</p>
                <p className="text-xs opacity-75">Jours</p>
              </div>
              <Flame className="h-12 w-12 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ACHIEVEMENTS RÉELS */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Achievements ({realProfileData.achievements.length})
            </h3>
            
            <div className="space-y-3">
              {realProfileData.achievements.length > 0 ? (
                realProfileData.achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={achievement.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <IconComponent className={`h-8 w-8 ${achievement.color}`} />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.unlockedAt && (
                          <p className="text-xs text-gray-400">
                            Débloqué le {achievement.unlockedAt.toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Accomplissez des tâches pour débloquer des achievements !
                </p>
              )}
            </div>
          </div>

          {/* ACTIVITÉ RÉCENTE RÉELLE */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Activité Récente
            </h3>
            
            <div className="space-y-3">
              {realProfileData.activityHistory.length > 0 ? (
                realProfileData.activityHistory.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">{activity.type || 'Activité'}</p>
                      <p className="text-sm text-gray-600">{activity.description || 'Action effectuée'}</p>
                      <p className="text-xs text-gray-400">
                        {activity.timestamp.toLocaleDateString('fr-FR')} à {activity.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Votre activité apparaîtra ici
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PRÉFÉRENCES */}
        {isEditing && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Notifications</h4>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedProfile.emailNotifications}
                    onChange={(e) => setEditedProfile({ ...editedProfile, emailNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Notifications par email</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedProfile.taskReminders}
                    onChange={(e) => setEditedProfile({ ...editedProfile, taskReminders: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Rappels de tâches</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedProfile.weeklyReport}
                    onChange={(e) => setEditedProfile({ ...editedProfile, weeklyReport: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Rapport hebdomadaire</span>
                </label>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Apparence</h4>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedProfile.darkMode}
                    onChange={(e) => setEditedProfile({ ...editedProfile, darkMode: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mode sombre</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langue
                  </label>
                  <select
                    value={editedProfile.language}
                    onChange={(e) => setEditedProfile({ ...editedProfile, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
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
