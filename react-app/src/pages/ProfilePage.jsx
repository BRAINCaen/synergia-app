// ==========================================
// 📁 react-app/src/pages/ProfilePage.jsx
// PAGE PROFIL AVEC DESIGN PREMIUM HARMONISÉ
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User,
  Edit,
  Save,
  X,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Award,
  Trophy,
  Star,
  Target,
  TrendingUp,
  Zap,
  Crown,
  Medal,
  Shield,
  Activity,
  Camera,
  Settings,
  CheckCircle,
  Clock,
  Flame,
  Eye,
  EyeOff
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES (conservés)
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES PROFIL (conservées et étendues)
const PROFILE_SECTIONS = {
  personal: { name: 'Informations personnelles', icon: User },
  achievements: { name: 'Réalisations', icon: Trophy },
  activity: { name: 'Activité récente', icon: Activity },
  preferences: { name: 'Préférences', icon: Settings }
};

const PRIVACY_LEVELS = {
  public: { name: 'Public', icon: Eye, color: 'green' },
  team: { name: 'Équipe seulement', icon: Users, color: 'blue' },
  private: { name: 'Privé', icon: EyeOff, color: 'gray' }
};

/**
 * 🏆 COMPOSANT SECTION ACHIEVEMENTS PREMIUM
 */
const AchievementsSection = ({ achievements, gamification }) => {
  const recentBadges = achievements.slice(0, 6);
  const level = gamification?.level || 1;
  const totalXP = gamification?.totalXp || 0;
  const nextLevelXP = level * 100;
  const currentLevelXP = totalXP % 100;
  const progressPercentage = (currentLevelXP / 100) * 100;

  return (
    <PremiumCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Réalisations</h3>
        <Trophy className="w-6 h-6 text-yellow-400" />
      </div>

      {/* Progression de niveau */}
      <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Niveau {level}</h4>
              <p className="text-gray-300 text-sm">{totalXP.toLocaleString()} XP total</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-medium">{currentLevelXP}/100 XP</p>
            <p className="text-gray-400 text-sm">vers niveau {level + 1}</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-600 rounded-full h-3">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-center text-gray-300 text-sm mt-2">
          {100 - currentLevelXP} XP pour le niveau suivant
        </p>
      </div>

      {/* Badges récents */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4">Badges récents</h4>
        {recentBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recentBadges.map((badge, index) => (
              <motion.div
                key={badge.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-700/50 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{badge.icon || '🏆'}</div>
                <h5 className="text-white font-medium text-sm mb-1">{badge.name}</h5>
                <p className="text-gray-400 text-xs line-clamp-2">{badge.description}</p>
                {badge.earnedAt && (
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Medal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Aucun badge débloqué pour le moment</p>
            <p className="text-gray-500 text-sm">Complétez des tâches pour gagner vos premiers badges !</p>
          </div>
        )}
      </div>
    </PremiumCard>
  );
};

/**
 * 📊 COMPOSANT SECTION ACTIVITÉ PREMIUM
 */
const ActivitySection = ({ activityHistory }) => {
  return (
    <PremiumCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Activité récente</h3>
        <Activity className="w-6 h-6 text-blue-400" />
      </div>

      {activityHistory.length > 0 ? (
        <div className="space-y-4">
          {activityHistory.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${activity.type === 'task_completed' ? 'bg-green-500/20 text-green-400' :
                  activity.type === 'badge_earned' ? 'bg-yellow-500/20 text-yellow-400' :
                  activity.type === 'level_up' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-blue-500/20 text-blue-400'}
              `}>
                {activity.type === 'task_completed' ? <CheckCircle className="w-5 h-5" /> :
                 activity.type === 'badge_earned' ? <Award className="w-5 h-5" /> :
                 activity.type === 'level_up' ? <TrendingUp className="w-5 h-5" /> :
                 <Target className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                <h4 className="text-white font-medium">{activity.title}</h4>
                <p className="text-gray-400 text-sm">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500 text-xs">
                    {new Date(activity.timestamp).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              
              {activity.xp && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">+{activity.xp}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">Aucune activité récente</p>
          <p className="text-gray-500 text-sm">Votre activité apparaîtra ici</p>
        </div>
      )}
    </PremiumCard>
  );
};

/**
 * 👤 PAGE PROFIL PREMIUM COMPLÈTE
 */
const ProfilePage = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES FIREBASE RÉELLES (conservées)
  const { 
    gamification,
    userStats,
    loading: dataLoading 
  } = useUnifiedFirebaseData(user?.uid);
  
  // ✅ ÉTATS PRINCIPAUX (conservés)
  const [loading, setLoading] = useState(true);
  const [realProfileData, setRealProfileData] = useState({
    personalInfo: {},
    achievements: [],
    activityHistory: [],
    preferences: {},
    statistics: {}
  });
  
  // ✅ ÉTATS UI
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [activeSection, setActiveSection] = useState('personal');
  const [showEditModal, setShowEditModal] = useState(false);

  // ✅ CHARGEMENT DES DONNÉES (conservé)
  useEffect(() => {
    if (user?.uid) {
      loadRealProfileData();
    }
  }, [user?.uid]);

  /**
   * 📊 CHARGER TOUTES LES VRAIES DONNÉES PROFIL (conservé)
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
        getDoc(doc(db, 'users', user.uid)),
        getDocs(query(
          collection(db, 'tasks'),
          where('assignedTo', '==', user.uid),
          orderBy('updatedAt', 'desc'),
          limit(5)
        )),
        getDocs(query(
          collection(db, 'projects'),
          where('createdBy', '==', user.uid)
        )),
        getDocs(query(
          collection(db, 'userBadges'),
          where('userId', '==', user.uid)
        )),
        getDocs(query(
          collection(db, 'userActivity'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        ))
      ]);

      // Traitement des données
      const personalInfo = userDoc.exists() ? userDoc.data() : {};
      
      const achievements = [];
      userBadgesSnapshot.forEach(doc => {
        achievements.push({ id: doc.id, ...doc.data() });
      });

      const activityHistory = [];
      recentActivitySnapshot.forEach(doc => {
        activityHistory.push({ id: doc.id, ...doc.data() });
      });

      const statistics = {
        totalTasks: userTasksSnapshot.size,
        totalProjects: userProjectsSnapshot.size,
        totalBadges: achievements.length,
        memberSince: personalInfo.createdAt?.toDate?.() || new Date()
      };

      setRealProfileData({
        personalInfo,
        achievements,
        activityHistory,
        preferences: personalInfo.preferences || {},
        statistics
      });

      setEditedProfile({
        displayName: personalInfo.displayName || '',
        bio: personalInfo.bio || '',
        department: personalInfo.department || '',
        location: personalInfo.location || '',
        website: personalInfo.website || ''
      });

    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAUVEGARDE DES MODIFICATIONS
  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...editedProfile,
        updatedAt: new Date()
      });
      
      // Mettre à jour les données locales
      setRealProfileData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, ...editedProfile }
      }));
      
      setIsEditing(false);
      setShowEditModal(false);
      console.log('✅ Profil mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur sauvegarde profil:', error);
    }
  };

  // 📊 STATISTIQUES CALCULÉES
  const profileStats = useMemo(() => {
    const level = gamification?.level || 1;
    const totalXP = gamification?.totalXp || 0;
    const tasksCompleted = gamification?.tasksCompleted || 0;
    const badgesCount = realProfileData.achievements.length;

    return { level, totalXP, tasksCompleted, badgesCount };
  }, [gamification, realProfileData.achievements]);

  // 📊 STATISTIQUES POUR HEADER PREMIUM
  const headerStats = [
    { 
      label: "Niveau", 
      value: profileStats.level, 
      icon: Crown, 
      color: "text-yellow-400" 
    },
    { 
      label: "XP Total", 
      value: profileStats.totalXP.toLocaleString(), 
      icon: Zap, 
      color: "text-purple-400" 
    },
    { 
      label: "Tâches", 
      value: profileStats.tasksCompleted, 
      icon: Target, 
      color: "text-green-400" 
    },
    { 
      label: "Badges", 
      value: profileStats.badgesCount, 
      icon: Award, 
      color: "text-blue-400" 
    }
  ];

  // 🎯 ACTIONS HEADER PREMIUM
  const headerActions = (
    <>
      <PremiumButton
        variant="secondary"
        icon={Settings}
        onClick={() => window.location.href = '/settings'}
      >
        Paramètres
      </PremiumButton>
      
      <PremiumButton
        variant="primary"
        icon={Edit}
        onClick={() => setShowEditModal(true)}
      >
        Modifier le profil
      </PremiumButton>
    </>
  );

  // 🚨 GESTION CHARGEMENT
  if (loading || dataLoading) {
    return (
      <PremiumLayout
        title="Mon Profil"
        subtitle="Chargement de votre profil..."
        icon={User}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Synchronisation de votre profil...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Mon Profil"
      subtitle="Gérez vos informations personnelles et suivez votre progression"
      icon={User}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 👤 SECTION PROFIL PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Informations personnelles */}
        <div className="lg:col-span-2">
          <PremiumCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Informations personnelles</h3>
              <PremiumButton
                variant="secondary"
                size="sm"
                icon={Edit}
                onClick={() => setShowEditModal(true)}
              >
                Modifier
              </PremiumButton>
            </div>

            {/* Avatar et infos de base */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.displayName?.charAt(0)?.toUpperCase() || 
                    user.email?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {realProfileData.personalInfo.displayName || user.displayName || 'Nom non défini'}
                </h2>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  
                  {realProfileData.personalInfo.department && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Briefcase className="w-4 h-4" />
                      <span>{realProfileData.personalInfo.department}</span>
                    </div>
                  )}
                  
                  {realProfileData.personalInfo.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{realProfileData.personalInfo.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Membre depuis {realProfileData.statistics.memberSince 
                        ? new Date(realProfileData.statistics.memberSince).toLocaleDateString('fr-FR')
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {/* Statut de vérification */}
                <div className="flex items-center gap-2 mt-3">
                  <div className={`
                    flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${user.emailVerified 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                    }
                  `}>
                    {user.emailVerified ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {realProfileData.personalInfo.bio && (
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">À propos</h4>
                <p className="text-gray-300">{realProfileData.personalInfo.bio}</p>
              </div>
            )}
          </PremiumCard>
        </div>

        {/* Statistiques détaillées */}
        <div className="space-y-6">
          <StatCard
            title="Niveau de progression"
            value={profileStats.level}
            icon={Star}
            color="yellow"
            trend={`${Math.round(((profileStats.totalXP % 100) / 100) * 100)}% vers niveau ${profileStats.level + 1}`}
          />
          
          <StatCard
            title="XP ce mois"
            value={gamification?.monthlyXp || 0}
            icon={Flame}
            color="purple"
            trend="Performance mensuelle"
          />
          
          <StatCard
            title="Tâches terminées"
            value={profileStats.tasksCompleted}
            icon={CheckCircle}
            color="green"
            trend="Productivité"
          />
          
          <StatCard
            title="Collection de badges"
            value={profileStats.badgesCount}
            icon={Medal}
            color="blue"
            trend="Réalisations"
          />
        </div>
      </div>

      {/* 🏆 SECTION RÉALISATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AchievementsSection 
          achievements={realProfileData.achievements}
          gamification={gamification}
        />
        
        <ActivitySection 
          activityHistory={realProfileData.activityHistory}
        />
      </div>

      {/* ⚙️ MODAL D'ÉDITION */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <PremiumCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Modifier le profil</h3>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Nom d'affichage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom d'affichage
                      </label>
                      <input
                        type="text"
                        value={editedProfile.displayName}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre nom d'affichage"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    {/* Département */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Département
                      </label>
                      <input
                        type="text"
                        value={editedProfile.department}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre département"
                      />
                    </div>

                    {/* Localisation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Localisation
                      </label>
                      <input
                        type="text"
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre ville ou région"
                      />
                    </div>

                    {/* Site web */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Site web
                      </label>
                      <input
                        type="url"
                        value={editedProfile.website}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://votre-site.com"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-8">
                    <PremiumButton
                      variant="secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Annuler
                    </PremiumButton>
                    
                    <PremiumButton
                      variant="primary"
                      icon={Save}
                      onClick={handleSaveProfile}
                    >
                      Sauvegarder
                    </PremiumButton>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
};

export default ProfilePage;
