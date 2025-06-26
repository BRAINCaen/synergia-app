// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// Page Récompenses - Système de gamification et badges
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore, useGameStore } from '../shared/stores';
import { 
  Award, 
  Star, 
  Trophy, 
  Target, 
  Zap, 
  Gift,
  Crown,
  Medal,
  Flame,
  CheckCircle,
  Lock,
  Sparkles
} from 'lucide-react';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const { userStats, badges } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableRewards, setAvailableRewards] = useState([]);

  // Système de récompenses
  useEffect(() => {
    const rewardsData = {
      badges: [
        {
          id: 'first_login',
          name: 'Premier Pas',
          description: 'Première connexion à Synergia',
          icon: '🎯',
          category: 'milestone',
          xpReward: 10,
          earned: true,
          earnedDate: '2025-06-20'
        },
        {
          id: 'task_master',
          name: 'Maître des Tâches',
          description: 'Complétez 10 tâches',
          icon: '✅',
          category: 'productivity',
          xpReward: 50,
          earned: userStats?.tasksCompleted >= 10,
          progress: Math.min(userStats?.tasksCompleted || 0, 10),
          maxProgress: 10
        },
        {
          id: 'week_warrior',
          name: 'Guerrier de la Semaine',
          description: 'Connexion 7 jours consécutifs',
          icon: '🔥',
          category: 'consistency',
          xpReward: 100,
          earned: (userStats?.loginStreak || 0) >= 7,
          progress: Math.min(userStats?.loginStreak || 0, 7),
          maxProgress: 7
        },
        {
          id: 'level_up',
          name: 'Montée en Grade',
          description: 'Atteignez le niveau 5',
          icon: '⭐',
          category: 'advancement',
          xpReward: 200,
          earned: (userStats?.level || 1) >= 5,
          progress: Math.min(userStats?.level || 1, 5),
          maxProgress: 5
        },
        {
          id: 'xp_collector',
          name: 'Collectionneur XP',
          description: 'Accumulez 1000 XP',
          icon: '💎',
          category: 'achievement',
          xpReward: 150,
          earned: (userStats?.totalXp || 0) >= 1000,
          progress: Math.min(userStats?.totalXp || 0, 1000),
          maxProgress: 1000
        },
        {
          id: 'perfectionist',
          name: 'Perfectionniste',
          description: 'Terminez 5 tâches sans erreur',
          icon: '🎨',
          category: 'quality',
          xpReward: 75,
          earned: false,
          progress: 3,
          maxProgress: 5
        },
        {
          id: 'team_player',
          name: 'Joueur d\'Équipe',
          description: 'Collaborez sur 3 projets',
          icon: '🤝',
          category: 'social',
          xpReward: 120,
          earned: false,
          progress: 1,
          maxProgress: 3
        },
        {
          id: 'speed_demon',
          name: 'Démon de Vitesse',
          description: 'Complétez 5 tâches en 1 jour',
          icon: '⚡',
          category: 'speed',
          xpReward: 80,
          earned: false,
          progress: 0,
          maxProgress: 5
        }
      ],
      
      levels: [
        { level: 1, name: 'Débutant', xpRequired: 0, rewards: ['🎯'] },
        { level: 2, name: 'Novice', xpRequired: 100, rewards: ['📚'] },
        { level: 3, name: 'Apprenti', xpRequired: 250, rewards: ['🔧'] },
        { level: 4, name: 'Pratiquant', xpRequired: 500, rewards: ['⚙️'] },
        { level: 5, name: 'Expert', xpRequired: 1000, rewards: ['⭐'] },
        { level: 6, name: 'Maître', xpRequired: 2000, rewards: ['👑'] }
      ],

      achievements: [
        {
          id: 'early_bird',
          name: 'Lève-tôt',
          description: 'Connectez-vous avant 7h',
          icon: '🌅',
          rarity: 'rare',
          earned: false
        },
        {
          id: 'night_owl',
          name: 'Oiseau de Nuit',
          description: 'Travaillez après 22h',
          icon: '🦉',
          rarity: 'rare',
          earned: false
        },
        {
          id: 'weekend_warrior',
          name: 'Guerrier du Weekend',
          description: 'Complétez des tâches le weekend',
          icon: '🏖️',
          rarity: 'epic',
          earned: false
        }
      ]
    };

    setAvailableRewards(rewardsData);
  }, [userStats]);

  const categories = [
    { id: 'all', name: 'Toutes', icon: Star },
    { id: 'milestone', name: 'Étapes', icon: Target },
    { id: 'productivity', name: 'Productivité', icon: Zap },
    { id: 'consistency', name: 'Régularité', icon: Flame },
    { id: 'advancement', name: 'Progression', icon: Crown },
    { id: 'achievement', name: 'Succès', icon: Trophy },
    { id: 'quality', name: 'Qualité', icon: Sparkles },
    { id: 'social', name: 'Social', icon: Medal },
    { id: 'speed', name: 'Rapidité', icon: Zap }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressColor = (earned) => {
    return earned ? 'bg-green-500' : 'bg-blue-500';
  };

  const filteredBadges = selectedCategory === 'all' 
    ? availableRewards.badges 
    : availableRewards.badges?.filter(badge => badge.category === selectedCategory);

  const earnedBadges = availableRewards.badges?.filter(badge => badge.earned) || [];
  const totalXP = earnedBadges.reduce((sum, badge) => sum + badge.xpReward, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Récompenses</h1>
          <p className="text-gray-600">
            Débloquez des badges et suivez votre progression
          </p>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Badges obtenus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earnedBadges.length}/{availableRewards.badges?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">XP des badges</p>
                <p className="text-2xl font-bold text-gray-900">{totalXP}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Niveau actuel</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.level || 1}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">XP Total</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.totalXp || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progression de niveau */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression de Niveau</h3>
          <div className="space-y-4">
            {availableRewards.levels?.map((levelData) => {
              const isUnlocked = (userStats?.level || 1) >= levelData.level;
              const isCurrent = (userStats?.level || 1) === levelData.level;
              
              return (
                <div key={levelData.level} className={`flex items-center p-4 rounded-lg border-2 ${
                  isCurrent ? 'border-blue-500 bg-blue-50' : 
                  isUnlocked ? 'border-green-500 bg-green-50' : 
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4 ${
                    isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {levelData.level}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{levelData.name}</h4>
                    <p className="text-sm text-gray-600">{levelData.xpRequired} XP requis</p>
                  </div>
                  
                  <div className="flex gap-1">
                    {levelData.rewards.map((reward, index) => (
                      <span key={index} className="text-2xl" title={`Récompense niveau ${levelData.level}`}>
                        {reward}
                      </span>
                    ))}
                  </div>
                  
                  {isUnlocked ? (
                    <CheckCircle className="w-6 h-6 text-green-500 ml-2" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtres des badges */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <IconComponent size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille des badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges?.map((badge) => (
            <div
              key={badge.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                badge.earned ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className={`p-6 ${badge.earned ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-gray-50'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-4xl ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                    {badge.icon}
                  </div>
                  {badge.earned ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                
                {/* Progression */}
                {!badge.earned && badge.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{badge.progress}/{badge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(badge.earned)}`}
                        style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    +{badge.xpReward} XP
                  </span>
                  {badge.earned && badge.earnedDate && (
                    <span className="text-xs text-gray-500">
                      Obtenu le {new Date(badge.earnedDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Succès spéciaux */}
        {availableRewards.achievements?.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Succès Spéciaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableRewards.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.earned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;
