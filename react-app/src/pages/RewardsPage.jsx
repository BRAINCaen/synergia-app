// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// CODE COMPLET - Remplacer entièrement le fichier existant
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Award, 
  Star, 
  Crown, 
  Trophy, 
  Target, 
  CheckCircle, 
  Lock, 
  Zap,
  Gem,
  Shield,
  Flame,
  TrendingUp
} from 'lucide-react';

// ✅ Hook temporaire direct Firebase
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ✅ Écoute directe Firebase (synchronisation temps réel)
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 RewardsPage - Écoute Firebase pour:', user.uid);
    
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        console.log('✅ RewardsPage - Données Firebase mises à jour:', data.gamification?.totalXp);
      }
      setLoading(false);
    }, (error) => {
      console.error('❌ Erreur Firebase RewardsPage:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ Calcul des données depuis Firebase
  const gamificationData = userData?.gamification || {};
  const stats = {
    level: gamificationData.level || 1,
    totalXp: gamificationData.totalXp || 0,
    tasksCompleted: gamificationData.tasksCompleted || 0,
    loginStreak: gamificationData.loginStreak || 0,
    completionRate: gamificationData.completionRate || 0,
    projectsCreated: gamificationData.projectsCreated || 0
  };

  const badges = {
    badges: gamificationData.badges || [],
    count: (gamificationData.badges || []).length
  };

  const isReady = !loading && userData !== null;

  // ✅ Badges disponibles (intégrés avec Firebase)
  const availableBadges = [
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'Parmi les premiers utilisateurs de Synergia',
      icon: Flame,
      color: 'from-orange-400 to-red-500',
      xpReward: 50,
      condition: 'Être inscrit dans les 100 premiers',
      unlocked: badges.badges.some(b => b.id === 'early_adopter' || b.type === 'early_adopter')
    },
    {
      id: 'first_task',
      name: 'Première Tâche',
      description: 'Compléter votre première tâche',
      icon: CheckCircle,
      color: 'from-green-400 to-green-600',
      xpReward: 25,
      condition: 'Terminer 1 tâche',
      unlocked: badges.badges.some(b => b.id === 'first_task' || b.type === 'first_task') || stats.tasksCompleted >= 1
    },
    {
      id: 'task_master',
      name: 'Maître des Tâches',
      description: 'Compléter 10 tâches',
      icon: Target,
      color: 'from-blue-400 to-blue-600',
      xpReward: 100,
      condition: 'Terminer 10 tâches',
      unlocked: stats.tasksCompleted >= 10
    },
    {
      id: 'streak_warrior',
      name: 'Guerrier de la Série',
      description: 'Maintenir une série de 7 jours',
      icon: Flame,
      color: 'from-orange-400 to-red-500',
      xpReward: 75,
      condition: '7 jours consécutifs actif',
      unlocked: stats.loginStreak >= 7
    },
    {
      id: 'xp_collector',
      name: 'Collectionneur d\'XP',
      description: 'Atteindre 500 XP',
      icon: Star,
      color: 'from-yellow-400 to-yellow-600',
      xpReward: 100,
      condition: 'Atteindre 500 XP total',
      unlocked: stats.totalXp >= 500
    },
    {
      id: 'perfectionist',
      name: 'Perfectionniste',
      description: 'Atteindre 95% de taux de réussite',
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      xpReward: 150,
      condition: '95% taux de réussite sur 20+ tâches',
      unlocked: stats.completionRate >= 95 && stats.tasksCompleted >= 20
    }
  ];

  // Filtrer les badges selon la catégorie
  const filteredBadges = availableBadges.filter(badge => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return badge.unlocked;
    if (selectedCategory === 'locked') return !badge.unlocked;
    return true;
  });

  // ✅ Niveaux avec récompenses calculées depuis Firebase
  const levelRewards = [
    {
      level: 1,
      title: 'Débutant',
      description: 'Bienvenue dans Synergia !',
      xpRequired: 0,
      icon: Target,
      color: 'bg-gray-500',
      rewards: ['Accès aux tâches de base', 'Profil utilisateur'],
      unlocked: stats.level >= 1
    },
    {
      level: 2,
      title: 'Novice',
      description: 'Vous commencez à maîtriser les bases',
      xpRequired: 100,
      icon: Star,
      color: 'bg-blue-500',
      rewards: ['Badge "Premiers pas"', 'Statistiques détaillées'],
      unlocked: stats.level >= 2
    },
    {
      level: 3,
      title: 'Apprenti',
      description: 'Votre progression est notable',
      xpRequired: 250,
      icon: Award,
      color: 'bg-green-500',
      rewards: ['Badge "En progression"', 'Classement équipe', '+25 XP bonus'],
      unlocked: stats.level >= 3
    },
    {
      level: 4,
      title: 'Confirmé',
      description: 'Vous maîtrisez bien Synergia',
      xpRequired: 500,
      icon: Shield,
      color: 'bg-purple-500',
      rewards: ['Badge "Confirmé"', 'Fonctions avancées', '+50 XP bonus'],
      unlocked: stats.level >= 4
    },
    {
      level: 5,
      title: 'Expert',
      description: 'Votre expertise est reconnue',
      xpRequired: 1000,
      icon: Crown,
      color: 'bg-yellow-500',
      rewards: ['Badge "Expert"', 'Titre spécial', '+100 XP bonus'],
      unlocked: stats.level >= 5
    }
  ];

  // Loading state
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Synchronisation récompenses Firebase...</h2>
          <p className="text-gray-500 mt-2">Chargement des données temps réel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Gift className="w-8 h-8 mr-3 text-purple-500" />
            Récompenses
          </h1>
          <p className="text-gray-600 mt-2">
            Débloquez des badges et suivez votre progression
          </p>
        </div>

        {/* ✅ NOUVEAU: Aperçu des récompenses Firebase synchronisées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Badges obtenus */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Badges obtenus</p>
                <p className="text-3xl font-bold">{badges.count}/20</p>
                <p className="text-yellow-100 text-xs mt-1">Badges disponibles</p>
              </div>
              <Award className="w-8 h-8 text-yellow-200" />
            </div>
          </div>

          {/* XP des badges */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">XP des badges</p>
                <p className="text-3xl font-bold">
                  {badges.badges.reduce((sum, badge) => sum + (badge.xpReward || 25), 0)}
                </p>
                <p className="text-blue-100 text-xs mt-1">Points gagnés via badges</p>
              </div>
              <Zap className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          {/* ✅ Niveau actuel - FIREBASE SYNCHRONISÉ */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Niveau actuel</p>
                <p className="text-3xl font-bold">{stats.level}</p>
                <p className="text-purple-100 text-xs mt-1">Synchronisé Firebase</p>
              </div>
              <Crown className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          {/* ✅ XP Total - FIREBASE SYNCHRONISÉ */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">XP Total</p>
                <p className="text-3xl font-bold">{stats.totalXp}</p>
                <p className="text-green-100 text-xs mt-1">Synchronisé Firebase</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>

        {/* Message de synchronisation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-800 font-medium">
              ✅ Page synchronisée avec Firebase - Niveau {stats.level}, {stats.totalXp} XP - Données temps réel
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne principale - Progression des niveaux */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ✅ Progression de niveau Firebase */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-purple-500" />
                Progression de Niveau
              </h2>
              
              <div className="space-y-4">
                {levelRewards.map((reward) => {
                  const Icon = reward.icon;
                  const xpToNext = stats.level === reward.level - 1 ? (reward.level * 100) - stats.totalXp : 0;
                  
                  return (
                    <div 
                      key={reward.level}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        reward.unlocked 
                          ? 'border-green-200 bg-green-50' 
                          : stats.level === reward.level - 1
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            reward.unlocked ? reward.color : 'bg-gray-400'
                          }`}>
                            {reward.unlocked ? (
                              <Icon className="w-6 h-6 text-white" />
                            ) : (
                              <Lock className="w-6 h-6 text-white" />
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-bold text-gray-800">
                              Niveau {reward.level} - {reward.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{reward.description}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {reward.xpRequired} XP requis
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {reward.unlocked ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Débloqué
                            </span>
                          ) : stats.level === reward.level - 1 ? (
                            <div className="text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Prochain
                              </span>
                              <p className="text-xs text-blue-600 mt-1">
                                {xpToNext} XP manquants
                              </p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              <Lock className="w-4 h-4 mr-1" />
                              Verrouillé
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-700 mb-2">Récompenses :</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {reward.rewards.map((rewardItem, index) => (
                            <li key={index} className="flex items-center">
                              <Gem className="w-3 h-3 mr-2 text-purple-500" />
                              {rewardItem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Colonne latérale - Badges */}
          <div className="space-y-6">
            
            {/* Filtres badges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Filtrer les badges</h3>
              
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'Tous les badges', count: availableBadges.length },
                  { key: 'unlocked', label: 'Débloqués', count: availableBadges.filter(b => b.unlocked).length },
                  { key: 'locked', label: 'Verrouillés', count: availableBadges.filter(b => !b.unlocked).length }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedCategory(filter.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === filter.key
                        ? 'bg-purple-100 text-purple-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>{filter.label}</span>
                      <span className="text-sm opacity-75">({filter.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des badges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Badges ({filteredBadges.filter(b => b.unlocked).length}/{filteredBadges.length})
              </h3>
              
              <div className="space-y-4">
                {filteredBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.id} className={`p-4 rounded-lg border ${
                      badge.unlocked 
                        ? 'border-yellow-200 bg-yellow-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          badge.unlocked 
                            ? `bg-gradient-to-br ${badge.color}` 
                            : 'bg-gray-300'
                        }`}>
                          {badge.unlocked ? (
                            <Icon className="w-5 h-5 text-white" />
                          ) : (
                            <Lock className="w-5 h-5 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{badge.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{badge.description}</p>
                          <p className="text-gray-500 text-xs mt-2">{badge.condition}</p>
                          
                          {badge.unlocked && (
                            <div className="flex items-center mt-2">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-yellow-600 text-sm font-medium">
                                +{badge.xpReward} XP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
