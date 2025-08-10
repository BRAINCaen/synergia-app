// ==========================================
// 📁 react-app/src/pages/BadgesPage.jsx
// SYSTÈME DE BADGES SYNERGIA V3.5 - COMPLET ET SYNCHRONISÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Crown, Zap, Target, Gift, Users, Calendar, TrendingUp, Award, Clock, CheckCircle, Lock, Play, Gamepad2, BrainCircuit } from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useBadges } from '../shared/hooks/useBadges.js';
import { useToast } from '../shared/components/ui/Toast.jsx';
import firebaseDataSyncService from '../core/services/firebaseDataSyncService.js';

/**
 * 🏆 DÉFINITION DES BADGES SPÉCIALISÉS SYNERGIA
 */
const SYNERGIA_SPECIALIZED_BADGES = {
  // 🔧 BADGES MAINTENANCE & TECHNIQUE
  maintenance: [
    {
      id: 'maintenance_rookie',
      name: 'Apprenti Mécanicien',
      description: 'Première intervention technique réalisée',
      icon: '🔧',
      rarity: 'common',
      xpReward: 25,
      color: 'bg-orange-500',
      category: 'maintenance',
      condition: { role: 'maintenance', tasksCompleted: 1 }
    },
    {
      id: 'repair_specialist',
      name: 'Spécialiste Réparation',
      description: 'Expert en résolution de problèmes techniques',
      icon: '⚙️',
      rarity: 'rare',
      xpReward: 100,
      color: 'bg-purple-500',
      category: 'maintenance',
      condition: { role: 'maintenance', tasksCompleted: 25, difficulty: 'advanced' }
    },
    {
      id: 'safety_guardian',
      name: 'Gardien de la Sécurité',
      description: 'Vigilance exceptionnelle en sécurité',
      icon: '🛡️',
      rarity: 'epic',
      xpReward: 200,
      color: 'bg-blue-600',
      category: 'maintenance',
      condition: { role: 'maintenance', safetyChecks: 50, incidents: 0 }
    }
  ],

  // ⭐ BADGES RÉPUTATION & AVIS
  reputation: [
    {
      id: 'review_master',
      name: 'Maître des Avis',
      description: 'Excellence dans la gestion des avis clients',
      icon: '⭐',
      rarity: 'uncommon',
      xpReward: 75,
      color: 'bg-yellow-500',
      category: 'reputation',
      condition: { role: 'reputation', reviewsHandled: 10, averageRating: 4.5 }
    },
    {
      id: 'crisis_resolver',
      name: 'Résolveur de Crise',
      description: 'Expert en gestion des situations difficiles',
      icon: '🚨',
      rarity: 'rare',
      xpReward: 150,
      color: 'bg-red-500',
      category: 'reputation',
      condition: { role: 'reputation', negativeReviewsResolved: 5, satisfactionImprovement: 20 }
    }
  ],

  // 📦 BADGES STOCK & LOGISTIQUE
  stock: [
    {
      id: 'inventory_ninja',
      name: 'Ninja de l\'Inventaire',
      description: 'Maîtrise parfaite de la gestion des stocks',
      icon: '📦',
      rarity: 'uncommon',
      xpReward: 60,
      color: 'bg-green-500',
      category: 'stock',
      condition: { role: 'stock', inventoryAccuracy: 98, auditsCompleted: 10 }
    },
    {
      id: 'logistics_guru',
      name: 'Gourou Logistique',
      description: 'Optimisation exceptionnelle des flux',
      icon: '🚚',
      rarity: 'epic',
      xpReward: 250,
      color: 'bg-indigo-600',
      category: 'stock',
      condition: { role: 'stock', efficiencyImprovement: 30, costReduction: 15 }
    }
  ],

  // 🎮 BADGES ESCAPE GAME SPÉCIFIQUES
  escapeGame: [
    {
      id: 'game_master',
      name: 'Maître du Jeu',
      description: 'Animation exceptionnelle d\'escape games',
      icon: '🎭',
      rarity: 'rare',
      xpReward: 120,
      color: 'bg-purple-600',
      category: 'escape_game',
      condition: { gamesAnimated: 10, playerSatisfaction: 4.8 }
    },
    {
      id: 'puzzle_creator',
      name: 'Créateur d\'Énigmes',
      description: 'Innovation dans la création d\'énigmes',
      icon: '🧩',
      rarity: 'epic',
      xpReward: 200,
      color: 'bg-pink-500',
      category: 'escape_game',
      condition: { puzzlesCreated: 5, creativityRating: 4.5 }
    },
    {
      id: 'immersion_artist',
      name: 'Artiste de l\'Immersion',
      description: 'Création d\'expériences immersives mémorables',
      icon: '🎨',
      rarity: 'legendary',
      xpReward: 500,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      category: 'escape_game',
      condition: { immersionScore: 95, testimonials: 20 }
    }
  ],

  // 🧠 BADGES QUIZ GAME SPÉCIFIQUES
  quizGame: [
    {
      id: 'quiz_master',
      name: 'Maître du Quiz',
      description: 'Excellence dans l\'animation de quiz',
      icon: '🧠',
      rarity: 'uncommon',
      xpReward: 80,
      color: 'bg-cyan-500',
      category: 'quiz_game',
      condition: { quizzesAnimated: 5, participantEngagement: 85 }
    },
    {
      id: 'knowledge_architect',
      name: 'Architecte du Savoir',
      description: 'Création de quiz éducatifs innovants',
      icon: '🏗️',
      rarity: 'rare',
      xpReward: 180,
      color: 'bg-emerald-500',
      category: 'quiz_game',
      condition: { quizzesCreated: 10, educationalValue: 4.7 }
    },
    {
      id: 'trivia_legend',
      name: 'Légende du Trivia',
      description: 'Encyclopédie vivante et animateur hors pair',
      icon: '🎓',
      rarity: 'legendary',
      xpReward: 400,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      category: 'quiz_game',
      condition: { triviaWins: 50, knowledgeAreas: 10 }
    }
  ],

  // 🤝 BADGES COLLABORATION & ÉQUIPE
  collaboration: [
    {
      id: 'team_catalyst',
      name: 'Catalyseur d\'Équipe',
      description: 'Inspiration et motivation exceptionnelles',
      icon: '⚡',
      rarity: 'rare',
      xpReward: 150,
      color: 'bg-amber-500',
      category: 'collaboration',
      condition: { teamProjectsLed: 3, teamSatisfaction: 4.6 }
    },
    {
      id: 'synergy_builder',
      name: 'Bâtisseur de Synergie',
      description: 'Création d\'une dynamique d\'équipe parfaite',
      icon: '🌟',
      rarity: 'epic',
      xpReward: 300,
      color: 'bg-violet-600',
      category: 'collaboration',
      condition: { successfulCollaborations: 15, conflictsResolved: 5 }
    }
  ],

  // 🎯 BADGES PERFORMANCE & EXCELLENCE
  performance: [
    {
      id: 'efficiency_champion',
      name: 'Champion d\'Efficacité',
      description: 'Optimisation constante des processus',
      icon: '🚀',
      rarity: 'uncommon',
      xpReward: 90,
      color: 'bg-orange-600',
      category: 'performance',
      condition: { efficiencyGains: 25, processesOptimized: 8 }
    },
    {
      id: 'innovation_pioneer',
      name: 'Pionnier de l\'Innovation',
      description: 'Idées révolutionnaires qui transforment',
      icon: '💡',
      rarity: 'legendary',
      xpReward: 600,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      category: 'performance',
      condition: { innovationsImplemented: 3, impactScore: 90 }
    }
  ]
};

/**
 * 🎨 COMPOSANT BADGE CARD AVANCÉ
 */
const BadgeCard = ({ badge, unlocked, progress, onClick }) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  const rarityBorders = {
    common: 'border-gray-500',
    uncommon: 'border-green-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500'
  };

  return (
    <div 
      className={`relative bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 ${
        unlocked ? rarityBorders[badge.rarity] : 'border-gray-300'
      } ${!unlocked ? 'opacity-70' : ''}`}
      onClick={() => onClick(badge)}
    >
      {/* Badge d'époque si légendaire */}
      {badge.rarity === 'legendary' && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          ✨ LÉGENDAIRE
        </div>
      )}

      {/* Icône principale */}
      <div className={`text-4xl mb-3 flex justify-center ${!unlocked ? 'grayscale' : ''}`}>
        {unlocked ? badge.icon : '🔒'}
      </div>

      {/* Informations */}
      <div className="text-center">
        <h3 className={`font-bold text-lg mb-1 ${!unlocked ? 'text-gray-500' : 'text-gray-800'}`}>
          {badge.name}
        </h3>
        <p className={`text-sm mb-3 ${!unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
          {badge.description}
        </p>

        {/* Rareté */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${rarityColors[badge.rarity]} mb-2`}>
          {badge.rarity.toUpperCase()}
        </div>

        {/* XP */}
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Zap className="w-4 h-4 mr-1" />
          +{badge.xpReward} XP
        </div>

        {/* Barre de progression pour badges non débloqués */}
        {!unlocked && progress && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {progress.current} / {progress.required}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 🏆 COMPOSANT PRINCIPAL BADGES PAGE
 */
const BadgesPage = () => {
  const { user } = useAuthStore();
  const { success, error, info } = useToast();
  const { 
    badges: systemBadges, 
    userBadges, 
    stats, 
    loading, 
    checkBadges 
  } = useBadges();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [badgeProgress, setBadgeProgress] = useState({});

  // Fusionner tous les badges
  const allAvailableBadges = React.useMemo(() => {
    const specializedBadges = Object.values(SYNERGIA_SPECIALIZED_BADGES).flat();
    return [...systemBadges, ...specializedBadges];
  }, [systemBadges]);

  // Charger les statistiques utilisateur
  const loadUserStats = async () => {
    if (!user?.uid) return;

    try {
      setLoadingStats(true);
      const stats = await firebaseDataSyncService.getUserCompleteStats(user.uid);
      setUserStats(stats);
      
      // Calculer la progression vers les badges
      calculateBadgeProgress(stats);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Calculer la progression vers les badges non débloqués
  const calculateBadgeProgress = (stats) => {
    if (!stats) return;

    const progress = {};
    const unlockedBadgeIds = userBadges.map(b => b.id);

    allAvailableBadges.forEach(badge => {
      if (!unlockedBadgeIds.includes(badge.id) && badge.condition) {
        const condition = badge.condition;
        let current = 0;
        let required = 1;

        // Calculer selon le type de condition
        if (condition.tasksCompleted) {
          required = condition.tasksCompleted;
          current = stats.gamification?.tasksCompleted || 0;
        } else if (condition.reviewsHandled) {
          required = condition.reviewsHandled;
          current = stats.reputation?.reviewsHandled || 0;
        } else if (condition.gamesAnimated) {
          required = condition.gamesAnimated;
          current = stats.escapeGame?.gamesAnimated || 0;
        } else if (condition.quizzesAnimated) {
          required = condition.quizzesAnimated;
          current = stats.quizGame?.quizzesAnimated || 0;
        }

        if (current < required) {
          progress[badge.id] = {
            current: Math.min(current, required),
            required,
            percentage: Math.round((current / required) * 100)
          };
        }
      }
    });

    setBadgeProgress(progress);
  };

  // Charger au montage
  useEffect(() => {
    loadUserStats();
  }, [user?.uid]);

  // Vérification manuelle des badges
  const handleManualCheck = async () => {
    try {
      info('🔍 Vérification des badges en cours...');
      const newBadges = await checkBadges();
      
      if (newBadges.length > 0) {
        success(`🎉 ${newBadges.length} nouveaux badges débloqués !`);
        // Recharger les stats
        await loadUserStats();
      } else {
        info('Aucun nouveau badge débloqué pour le moment');
      }
    } catch (err) {
      console.error('Erreur vérification:', err);
      error('Erreur lors de la vérification des badges');
    }
  };

  // Filtrer les badges par catégorie
  const filteredBadges = allAvailableBadges.filter(badge => {
    if (selectedCategory === 'all') return true;
    return badge.category === selectedCategory;
  });

  // Vérifier si un badge est débloqué
  const isBadgeUnlocked = (badge) => {
    return userBadges.some(userBadge => userBadge.id === badge.id);
  };

  // Catégories disponibles
  const categories = [
    { id: 'all', name: 'Tous les Badges', icon: Trophy, count: allAvailableBadges.length },
    { id: 'maintenance', name: 'Maintenance', icon: Target, count: SYNERGIA_SPECIALIZED_BADGES.maintenance.length },
    { id: 'reputation', name: 'Réputation', icon: Star, count: SYNERGIA_SPECIALIZED_BADGES.reputation.length },
    { id: 'stock', name: 'Stock & Logistique', icon: Gift, count: SYNERGIA_SPECIALIZED_BADGES.stock.length },
    { id: 'escape_game', name: 'Escape Game', icon: Gamepad2, count: SYNERGIA_SPECIALIZED_BADGES.escapeGame.length },
    { id: 'quiz_game', name: 'Quiz Game', icon: BrainCircuit, count: SYNERGIA_SPECIALIZED_BADGES.quizGame.length },
    { id: 'collaboration', name: 'Collaboration', icon: Users, count: SYNERGIA_SPECIALIZED_BADGES.collaboration.length },
    { id: 'performance', name: 'Performance', icon: TrendingUp, count: SYNERGIA_SPECIALIZED_BADGES.performance.length }
  ];

  const unlockedCount = userBadges.length;
  const totalCount = allAvailableBadges.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement de vos badges...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <Trophy className="w-10 h-10 mr-3 text-yellow-500" />
            Collection de Badges Synergia
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Débloquez des badges en accomplissant des défis et atteignez de nouveaux sommets !
          </p>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-600">{unlockedCount}</div>
              <div className="text-gray-600">Badges obtenus</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-600">{totalCount - unlockedCount}</div>
              <div className="text-gray-600">Badges disponibles</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-600">{completionPercentage}%</div>
              <div className="text-gray-600">Progression</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-orange-600">{stats?.totalXpFromBadges || 0}</div>
              <div className="text-gray-600">XP des badges</div>
            </div>
          </div>

          {/* Bouton de vérification */}
          <button
            onClick={handleManualCheck}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Vérifier les nouveaux badges
          </button>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
                <span className="ml-2 bg-black bg-opacity-20 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grille des badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={isBadgeUnlocked(badge)}
              progress={badgeProgress[badge.id]}
              onClick={setSelectedBadge}
            />
          ))}
        </div>

        {/* Message si aucun badge */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Medal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">Aucun badge dans cette catégorie</h3>
            <p className="text-gray-500">Sélectionnez une autre catégorie pour voir les badges disponibles.</p>
          </div>
        )}
      </div>

      {/* Modal détails badge */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedBadge.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedBadge.name}</h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Rareté:</span>
                    <div className={`inline-block ml-2 px-2 py-1 rounded text-white text-xs ${
                      selectedBadge.rarity === 'common' ? 'bg-gray-500' :
                      selectedBadge.rarity === 'uncommon' ? 'bg-green-500' :
                      selectedBadge.rarity === 'rare' ? 'bg-blue-500' :
                      selectedBadge.rarity === 'epic' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}>
                      {selectedBadge.rarity.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Récompense:</span>
                    <span className="ml-2">+{selectedBadge.xpReward} XP</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesPage;
