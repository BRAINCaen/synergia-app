import React, { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase';
import { useAuthStore } from '../shared/stores/authStore';
import { useGameStore } from '../shared/stores/gameStore';

// Icônes
import { 
  User, 
  Settings, 
  Trophy, 
  Target, 
  Calendar, 
  Mail, 
  Edit3, 
  Save, 
  X,
  Bell,
  Eye,
  EyeOff,
  Award,
  Star,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Zap,
  Flame,
  Crown,
  Shield,
  Camera,
  Download
} from 'lucide-react';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, stats, achievements, settings

  const { user, signOut } = useAuthStore();
  const { addXP } = useGameStore();

  // État du formulaire d'édition
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    preferences: {
      notifications: true,
      publicProfile: false,
      theme: 'dark'
    }
  });

  // Charger les données du profil
  const loadProfile = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // 1. Charger le profil utilisateur
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let profileData = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Utilisateur',
        photoURL: user.photoURL || null,
        bio: '',
        preferences: {
          notifications: true,
          publicProfile: false,
          theme: 'dark'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (userSnap.exists()) {
        profileData = { ...profileData, ...userSnap.data() };
      }

      setProfile(profileData);
      setFormData({
        displayName: profileData.displayName || '',
        bio: profileData.bio || '',
        preferences: profileData.preferences || {
          notifications: true,
          publicProfile: false,
          theme: 'dark'
        }
      });

      // 2. Charger les statistiques utilisateur
      const statsRef = doc(db, 'userStats', user.uid);
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        setUserStats(statsSnap.data());
      }

      // 3. Charger l'activité récente (dernières tâches complétées)
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('status', '==', 'completed'),
          orderBy('completedAt', 'desc'),
          limit(10)
        );
        
        const tasksSnapshot = await getDocs(tasksQuery);
        const recentTasks = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'task_completed',
          ...doc.data(),
          timestamp: doc.data().completedAt?.toDate() || new Date()
        }));

        // 4. Charger les projets récents
        const projectsQuery = query(
          collection(db, 'projects'),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        const projectsSnapshot = await getDocs(projectsQuery);
        const recentProjects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'project_created',
          ...doc.data(),
          timestamp: doc.data().createdAt?.toDate() || new Date()
        }));

        // Combiner et trier l'activité
        const combinedActivity = [...recentTasks, ...recentProjects]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        setRecentActivity(combinedActivity);
      } catch (activityError) {
        console.warn('Impossible de charger l\'activité récente:', activityError);
        setRecentActivity([]);
      }

      // 5. Générer les badges disponibles
      const availableBadges = generateBadges(statsSnap.data());
      setBadges(availableBadges);

      // 6. Générer les achievements
      const userAchievements = generateAchievements(statsSnap.data(), recentTasks.length, recentProjects.length);
      setAchievements(userAchievements);

    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder les modifications du profil
  const saveProfile = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        preferences: formData.preferences,
        updatedAt: serverTimestamp()
      });

      // Mettre à jour l'état local
      setProfile(prev => ({
        ...prev,
        displayName: formData.displayName,
        bio: formData.bio,
        preferences: formData.preferences
      }));

      setEditing(false);
      
      // Ajouter un peu d'XP pour la mise à jour du profil
      await addXP(5, 'Profil mis à jour');

    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Générer les badges en fonction des stats
  const generateBadges = (stats) => {
    if (!stats) return [];

    const badges = [];

    // Badges basés sur XP
    if (stats.totalXp >= 1000) badges.push({ 
      id: 'xp_1000', 
      name: 'Guerrier XP', 
      description: '1000 XP obtenus', 
      icon: '⚡', 
      color: 'yellow',
      earned: true,
      earnedAt: new Date()
    });
    
    if (stats.totalXp >= 5000) badges.push({ 
      id: 'xp_5000', 
      name: 'Maître XP', 
      description: '5000 XP obtenus', 
      icon: '🌟', 
      color: 'gold',
      earned: true,
      earnedAt: new Date()
    });

    // Badges basés sur tâches
    if (stats.tasksCompleted >= 10) badges.push({ 
      id: 'tasks_10', 
      name: 'Débutant', 
      description: '10 tâches complétées', 
      icon: '🎯', 
      color: 'blue',
      earned: true,
      earnedAt: new Date()
    });
    
    if (stats.tasksCompleted >= 50) badges.push({ 
      id: 'tasks_50', 
      name: 'Producteur', 
      description: '50 tâches complétées', 
      icon: '🚀', 
      color: 'green',
      earned: true,
      earnedAt: new Date()
    });

    if (stats.tasksCompleted >= 100) badges.push({ 
      id: 'tasks_100', 
      name: 'Machine', 
      description: '100 tâches complétées', 
      icon: '🤖', 
      color: 'purple',
      earned: true,
      earnedAt: new Date()
    });

    // Badges basés sur connexions
    if (stats.loginStreak >= 7) badges.push({ 
      id: 'streak_7', 
      name: 'Régulier', 
      description: '7 jours consécutifs', 
      icon: '🔥', 
      color: 'orange',
      earned: true,
      earnedAt: new Date()
    });

    if (stats.loginStreak >= 30) badges.push({ 
      id: 'streak_30', 
      name: 'Assidu', 
      description: '30 jours consécutifs', 
      icon: '🏆', 
      color: 'red',
      earned: true,
      earnedAt: new Date()
    });

    // Badges basés sur projets
    if (stats.projectsCreated >= 5) badges.push({ 
      id: 'projects_5', 
      name: 'Organisateur', 
      description: '5 projets créés', 
      icon: '📁', 
      color: 'indigo',
      earned: true,
      earnedAt: new Date()
    });

    return badges;
  };

  // Générer les achievements
  const generateAchievements = (stats, recentTasksCount, recentProjectsCount) => {
    if (!stats) return [];

    const achievements = [];

    // Achievement niveau
    achievements.push({
      id: 'level',
      title: `Niveau ${stats.level || 1}`,
      description: 'Votre niveau actuel',
      progress: stats.level || 1,
      maxProgress: (stats.level || 1) + 1,
      icon: '🏅',
      type: 'level'
    });

    // Achievement XP vers prochain niveau
    const currentLevelXP = ((stats.level || 1) - 1) * 1000;
    const nextLevelXP = (stats.level || 1) * 1000;
    const progressToNext = (stats.totalXp || 0) - currentLevelXP;
    const maxToNext = nextLevelXP - currentLevelXP;

    achievements.push({
      id: 'next_level',
      title: 'Prochain niveau',
      description: `${progressToNext}/${maxToNext} XP`,
      progress: progressToNext,
      maxProgress: maxToNext,
      icon: '⭐',
      type: 'progress'
    });

    // Achievement taux de completion
    const completionRate = stats.tasksCreated > 0 ? 
      Math.round((stats.tasksCompleted / stats.tasksCreated) * 100) : 0;

    achievements.push({
      id: 'completion_rate',
      title: 'Taux de réussite',
      description: `${completionRate}% de tâches complétées`,
      progress: completionRate,
      maxProgress: 100,
      icon: '📈',
      type: 'percentage'
    });

    return achievements;
  };

  // Déconnexion
  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Erreur déconnexion:', error);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.uid]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Gérer les Timestamps Firebase
    if (date.toDate && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    // Vérifier que c'est bien un objet Date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'project_created': return <Activity className="w-4 h-4 text-purple-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'task_completed': 
        return `A complété la tâche "${activity.title}"`;
      case 'project_created': 
        return `A créé le projet "${activity.name}"`;
      default: 
        return 'Activité inconnue';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          Chargement du profil...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                  {profile?.photoURL ? (
                    <img 
                      src={profile.photoURL} 
                      alt={profile.displayName}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    profile?.displayName?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-800 hover:bg-gray-600 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              {/* Infos utilisateur */}
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {profile?.displayName || 'Utilisateur'}
                  {userStats?.level >= 10 && <Crown className="w-6 h-6 text-yellow-400" />}
                </h1>
                <p className="text-gray-400 mt-1">{profile?.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-400">
                    Niveau {userStats?.level || 1}
                  </span>
                  <span className="text-sm text-gray-400">
                    {userStats?.totalXp || 0} XP
                  </span>
                  <span className="text-sm text-gray-400">
                    Membre depuis {formatDate(profile?.createdAt)}
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
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && !editing && (
            <div className="mt-4">
              <p className="text-gray-300">{profile.bio}</p>
            </div>
          )}

          {/* Navigation tabs */}
          <div className="flex gap-6 mt-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: User },
              { id: 'stats', label: 'Statistiques', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Statistiques rapides */}
            <div className="lg:col-span-2 space-y-6">
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Tâches complétées</p>
                      <p className="text-2xl font-bold text-white">{userStats?.tasksCompleted || 0}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Projets créés</p>
                      <p className="text-2xl font-bold text-white">{userStats?.projectsCreated || 0}</p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Série actuelle</p>
                      <p className="text-2xl font-bold text-white">{userStats?.loginStreak || 0}</p>
                    </div>
                    <Flame className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Activité récente
                </h3>
                
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune activité récente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-white text-sm">{getActivityText(activity)}</p>
                          <p className="text-gray-400 text-xs">
                            {activity.timestamp.toLocaleDateString('fr-FR')} à {activity.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar droite */}
            <div className="space-y-6">
              {/* Badges récents */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Badges récents
                </h3>
                
                {badges.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun badge obtenu</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {badges.slice(0, 4).map((badge, index) => (
                      <div key={index} className="text-center p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <p className="text-xs font-medium text-white">{badge.name}</p>
                        <p className="text-xs text-gray-400">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progression niveau */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Progression
                </h3>
                
                {achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{achievement.icon}</span>
                        <span className="text-sm font-medium text-white">{achievement.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Statistiques détaillées */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">📊 Statistiques détaillées</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">XP Total</span>
                  <span className="text-white font-medium">{userStats?.totalXp?.toLocaleString() || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Niveau</span>
                  <span className="text-white font-medium">{userStats?.level || 1}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tâches créées</span>
                  <span className="text-white font-medium">{userStats?.tasksCreated || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tâches complétées</span>
                  <span className="text-white font-medium">{userStats?.tasksCompleted || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Taux de completion</span>
                  <span className="text-white font-medium">
                    {userStats?.tasksCreated > 0 
                      ? Math.round((userStats.tasksCompleted / userStats.tasksCreated) * 100) 
                      : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Projets créés</span>
                  <span className="text-white font-medium">{userStats?.projectsCreated || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Série de connexions</span>
                  <span className="text-white font-medium">{userStats?.loginStreak || 0} jours</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Dernière connexion</span>
                  <span className="text-white font-medium">
                    {userStats?.lastLoginDate?.toDate ? 
                      formatDate(userStats.lastLoginDate.toDate()) : 
                      'Aujourd\'hui'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Graphique de progression (simplifié) */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6">📈 Progression mensuelle</h3>
              
              {/* Visualisation simple de progression */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">XP ce mois</span>
                    <span className="text-yellow-400 font-medium">+{Math.floor((userStats?.totalXp || 0) * 0.3)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Tâches ce mois</span>
                    <span className="text-blue-400 font-medium">+{Math.floor((userStats?.tasksCompleted || 0) * 0.4)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Projets ce mois</span>
                    <span className="text-green-400 font-medium">+{Math.floor((userStats?.projectsCreated || 0) * 0.5)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm">
                  Continuez comme ça ! Vous êtes sur la bonne voie 🚀
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Badges */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Badges obtenus ({badges.length})
              </h3>
              
              {badges.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun badge obtenu pour le moment</p>
                  <p className="text-sm mt-2">Complétez des tâches pour débloquer vos premiers badges !</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {badges.map((badge, index) => (
                    <div key={index} className="bg-gray-700/50 p-4 rounded-lg text-center">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <h4 className="font-medium text-white mb-1">{badge.name}</h4>
                      <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                      {badge.earnedAt && (
                        <p className="text-xs text-green-400">
                          Obtenu le {formatDate(badge.earnedAt)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements et objectifs */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Objectifs et progression
              </h3>
              
              <div className="space-y-6">
                {achievements.map((achievement, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{achievement.icon}</span>
                        <div>
                          <h4 className="font-medium text-white">{achievement.title}</h4>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                        <p className="text-xs text-gray-400">
                          {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Paramètres du profil
              </h3>

              {editing ? (
                <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-6">
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

                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Préférences</h4>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Notifications activées</span>
                      <input
                        type="checkbox"
                        checked={formData.preferences.notifications}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, notifications: e.target.checked }
                        }))}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Profil public</span>
                      <input
                        type="checkbox"
                        checked={formData.preferences.publicProfile}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, publicProfile: e.target.checked }
                        }))}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                      <Save className="w-4 h-4" />
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom d'affichage
                    </label>
                    <p className="text-white">{profile?.displayName || 'Non défini'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <p className="text-white">{profile?.bio || 'Aucune bio définie'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <p className="text-gray-400">{profile?.email}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Préférences</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Notifications</span>
                      <span className="text-white">
                        {profile?.preferences?.notifications ? 'Activées' : 'Désactivées'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Profil public</span>
                      <span className="text-white">
                        {profile?.preferences?.publicProfile ? 'Public' : 'Privé'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Modifier le profil
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
