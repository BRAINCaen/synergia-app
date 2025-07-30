// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION AVEC TOUS LES IMPORTS CORRIGÉS
// ==========================================

import React, { useState } from 'react';
import { 
  Star, 
  Trophy, 
  Target, 
  Activity,
  CheckCircle,
  Clock,
  Flame,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Award,
  Zap
} from 'lucide-react';

// 🔧 CORRECTION: Utiliser les imports existants qui fonctionnent
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 🎮 PAGE GAMIFICATION AVEC IMPORTS CORRIGÉS
 */
const GamificationPage = () => {
  // 🔧 CORRECTION: Utiliser useAuthStore au lieu de useAuth
  const { user } = useAuthStore();
  const { gamification, isLoading: dataLoading } = useUnifiedFirebaseData();

  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Données utilisateur avec fallbacks sécurisés
  const userStats = {
    totalXp: gamification?.totalXp || 0,
    level: gamification?.level || 1,
    weeklyXp: gamification?.weeklyXp || 0,
    monthlyXp: gamification?.monthlyXp || 0,
    tasksCompleted: gamification?.tasksCompleted || 0,
    currentStreak: gamification?.currentStreak || 0,
    badges: gamification?.badges || [],
    loginStreak: gamification?.loginStreak || 1
  };

  // Calculs dérivés
  const xpForNextLevel = 100 * userStats.level;
  const currentLevelXp = userStats.totalXp % (100 * userStats.level);
  const progressPercentage = Math.min(100, (currentLevelXp / xpForNextLevel) * 100);

  // OBJECTIFS GAME MASTER SELON VOS SPÉCIFICATIONS
  const objectives = [
    {
      id: 'daily_improvement',
      title: 'Propose une amélioration ou astuce',
      description: 'Partage une astuce d\'organisation sur le groupe équipe',
      progress: 0,
      xpReward: 50,
      badgeReward: 'Innovateur du Jour',
      status: 'active',
      icon: '💡',
      type: 'daily',
      category: 'innovation',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 15,
      totalXpReward: 65
    },
    {
      id: 'daily_surprise_team',
      title: 'Prends en charge une équipe surprise',
      description: 'Gère une équipe non prévue au planning',
      progress: 100,
      xpReward: 75,
      badgeReward: 'Héros Imprévu',
      status: 'completed',
      icon: '🦸',
      type: 'daily',
      category: 'flexibility',
      isClaimed: false,
      canClaim: true,
      categoryBonus: 20,
      totalXpReward: 95
    },
    {
      id: 'daily_five_star',
      title: 'Obtiens un retour 5 étoiles',
      description: 'Reçois un avis client "5 étoiles" dans la journée',
      progress: 100,
      xpReward: 80,
      badgeReward: 'Excellence Client',
      status: 'completed',
      icon: '⭐',
      type: 'daily',
      category: 'customer_service',
      isClaimed: false,
      canClaim: true,
      categoryBonus: 25,
      totalXpReward: 105
    },
    {
      id: 'daily_help_colleague',
      title: 'Aide spontanément un·e collègue',
      description: 'Assiste sur une tâche qui n\'est pas la tienne',
      progress: 50,
      xpReward: 60,
      badgeReward: 'Esprit d\'Équipe',
      status: 'active',
      icon: '🤝',
      type: 'daily',
      category: 'teamwork',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 10,
      totalXpReward: 70
    },
    {
      id: 'daily_security_check',
      title: 'Tour sécurité complet',
      description: 'Vérifie portes, extincteurs, plans d\'évacuation, alarmes',
      progress: 0,
      xpReward: 70,
      badgeReward: 'Gardien Sécurité',
      status: 'active',
      icon: '🛡️',
      type: 'daily',
      category: 'security',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 12,
      totalXpReward: 82
    },
    {
      id: 'daily_conflict_resolution',
      title: 'Gère un mini-conflit',
      description: 'Résous une situation tendue de façon autonome et débriefe',
      progress: 100,
      xpReward: 90,
      badgeReward: 'Médiateur',
      status: 'completed',
      icon: '🎯',
      type: 'daily',
      category: 'leadership',
      isClaimed: false,
      canClaim: true,
      categoryBonus: 30,
      totalXpReward: 120
    },
    {
      id: 'daily_technical_fix',
      title: 'Dépanne un élément technique',
      description: 'Répare une panne, bug ou accessoire dans la journée',
      progress: 75,
      xpReward: 65,
      badgeReward: 'Technicien Express',
      status: 'active',
      icon: '🔧',
      type: 'daily',
      category: 'maintenance',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 8,
      totalXpReward: 73
    },
    {
      id: 'daily_social_content',
      title: 'Propose du contenu réseaux sociaux',
      description: 'Publie ou propose une idée de contenu/story',
      progress: 0,
      xpReward: 55,
      badgeReward: 'Community Manager',
      status: 'active',
      icon: '📱',
      type: 'daily',
      category: 'marketing',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 18,
      totalXpReward: 73
    },
    // OBJECTIFS HEBDOMADAIRES
    {
      id: 'weekly_positive_reviews',
      title: 'Obtenir 5 avis clients positifs',
      description: 'Reçois au moins 5 avis positifs sur Google, TripAdvisor ou Facebook',
      progress: 60,
      xpReward: 150,
      badgeReward: 'Champion Satisfaction',
      status: 'active',
      icon: '🌟',
      type: 'weekly',
      category: 'customer_service',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 25,
      totalXpReward: 175
    },
    {
      id: 'weekly_openings_closings',
      title: '2 ouvertures et 2 fermetures',
      description: 'Effectue 2 ouvertures et 2 fermetures dans la semaine',
      progress: 75,
      xpReward: 120,
      badgeReward: 'Maître des Clés',
      status: 'active',
      icon: '🗝️',
      type: 'weekly',
      category: 'responsibility',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 22,
      totalXpReward: 142
    },
    {
      id: 'weekly_weekend_work',
      title: 'Travaille un week-end entier',
      description: 'Assure le service sur un week-end complet',
      progress: 100,
      xpReward: 180,
      badgeReward: 'Guerrier Weekend',
      status: 'completed',
      icon: '🎪',
      type: 'weekly',
      category: 'dedication',
      isClaimed: false,
      canClaim: true,
      categoryBonus: 35,
      totalXpReward: 215
    },
    {
      id: 'weekly_all_rooms',
      title: 'Anime chaque salle',
      description: 'Anime au moins une session dans chaque salle (escape ET quiz)',
      progress: 50,
      xpReward: 140,
      badgeReward: 'Maître Polyvalent',
      status: 'active',
      icon: '🎭',
      type: 'weekly',
      category: 'versatility',
      isClaimed: false,
      canClaim: false,
      categoryBonus: 25,
      totalXpReward: 165
    }
  ];

  /**
   * 🎁 GESTIONNAIRE DE RÉCLAMATION SIMPLIFIÉ
   */
  const handleClaimReward = async (objective) => {
    try {
      console.log('🎯 Réclamation objectif Game Master:', objective.title);

      if (!objective.canClaim) {
        setNotificationMessage('❌ Objectif non disponible à la réclamation');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        return;
      }

      // Simulation de réclamation réussie avec animation
      setNotificationMessage(`🎉 +${objective.totalXpReward} XP réclamés pour "${objective.title}"!`);
      setShowNotification(true);

      // Marquer comme réclamé temporairement
      const objectiveIndex = objectives.findIndex(obj => obj.id === objective.id);
      if (objectiveIndex !== -1) {
        objectives[objectiveIndex].isClaimed = true;
        objectives[objectiveIndex].canClaim = false;
      }

      // Animation plus longue pour la satisfaction
      setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('');
      }, 5000);

      console.log(`✅ Objectif Game Master réclamé: ${objective.title} (+${objective.totalXpReward} XP)`);

    } catch (error) {
      console.error('❌ Erreur réclamation Game Master:', error);
      setNotificationMessage('❌ Une erreur est survenue lors de la réclamation');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  /**
   * 🎨 OBTENIR LA COULEUR DE PROGRESSION
   */
  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  /**
   * 🏷️ OBTENIR LE LABEL D'UNE CATÉGORIE
   */
  const getCategoryLabel = (category) => {
    const labels = {
      'innovation': 'Innovation',
      'flexibility': 'Flexibilité',  
      'customer_service': 'Service Client',
      'teamwork': 'Équipe',
      'security': 'Sécurité',
      'leadership': 'Leadership',
      'maintenance': 'Maintenance',
      'marketing': 'Marketing',
      'responsibility': 'Responsabilité',
      'dedication': 'Dévouement',
      'versatility': 'Polyvalence',
      'creativity': 'Créativité'
    };
    return labels[category] || 'Autre';
  };

  // Activités récentes pour les Game Masters
  const recentActivities = [
    {
      id: 1,
      type: 'objective',
      action: 'Objectif complété',
      detail: 'Gère un mini-conflit avec succès',
      xp: '+120 XP',
      time: 'Il y a 1h',
      icon: '🎯'
    },
    {
      id: 2,
      type: 'session',
      action: 'Session escape animée',
      detail: 'Prison Break - Équipe de 6 personnes',
      xp: '+45 XP',
      time: 'Il y a 2h',
      icon: '🎮'
    },
    {
      id: 3,
      type: 'review',
      action: 'Avis 5 étoiles reçu',
      detail: 'Excellente animation selon les clients',
      xp: '+25 XP',
      time: 'Il y a 3h',
      icon: '⭐'
    },
    {
      id: 4,
      type: 'badge',
      action: 'Badge débloqué',
      detail: 'Guerrier Weekend obtenu',
      xp: '+50 XP',
      time: 'Hier',
      icon: '🏆'
    }
  ];

  // Statistiques spécifiques aux objectifs
  const objectiveStats = {
    total: objectives.length,
    completed: objectives.filter(obj => obj.status === 'completed').length,
    available: objectives.filter(obj => obj.canClaim).length,
    daily: objectives.filter(obj => obj.type === 'daily').length,
    weekly: objectives.filter(obj => obj.type === 'weekly').length
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Chargement de votre progression Game Master...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎉 NOTIFICATION DE RÉCLAMATION AMÉLIORÉE */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-pulse border border-green-300">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold">{notificationMessage}</p>
                <p className="text-sm opacity-90">Objectif Game Master accompli !</p>
              </div>
            </div>
          </div>
        )}

        {/* 📊 EN-TÊTE AVEC STATISTIQUES */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification Game Master</h1>
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              Escape Game Edition
            </span>
          </div>
          <p className="text-gray-300 text-lg">
            Suivez votre progression et débloquez des récompenses adaptées à votre métier
          </p>
        </div>

        {/* 🎯 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Total */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{userStats.totalXp.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">XP Total</p>
              </div>
            </div>
          </div>

          {/* Niveau */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{userStats.level}</p>
                <p className="text-gray-400 text-sm">Niveau Game Master</p>
              </div>
            </div>
          </div>

          {/* Objectifs disponibles */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{objectiveStats.available}</p>
                <p className="text-gray-400 text-sm">À réclamer</p>
              </div>
            </div>
          </div>

          {/* Série */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{userStats.currentStreak}</p>
                <p className="text-gray-400 text-sm">Série active</p>
              </div>
            </div>
          </div>
        </div>

        {/* 📱 NAVIGATION TABS */}
        <div className="flex gap-4 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-2">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'objectives', label: 'Objectifs Game Master', icon: Target },
            { id: 'activities', label: 'Activités', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-900 font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 📊 CONTENU DES TABS */}
        
        {/* VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Progression du niveau */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Progression Game Master
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-white">
                  <span>Niveau {userStats.level}</span>
                  <span>{currentLevelXp} / {xpForNextLevel} XP</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-400 text-sm">
                  Plus que {xpForNextLevel - currentLevelXp} XP pour le niveau {userStats.level + 1}
                </p>
              </div>
            </div>

            {/* Statistiques de la semaine */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Performance cette semaine
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">XP gagnés</span>
                  <span className="text-white font-semibold">{userStats.weeklyXp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Objectifs complétés</span>
                  <span className="text-white font-semibold">{objectiveStats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Série de connexion</span>
                  <span className="text-white font-semibold">{userStats.loginStreak} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Objectifs disponibles</span>
                  <span className="text-green-400 font-semibold">{objectiveStats.available}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OBJECTIFS GAME MASTER */}
        {activeTab === 'objectives' && (
          <div>
            {/* En-tête objectifs */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white text-2xl font-semibold">Objectifs Game Master</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Petites réussites quotidiennes et défis hebdomadaires adaptés à votre activité escape game
                </p>
              </div>
              {objectiveStats.available > 0 && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 animate-pulse">
                  <Gift className="w-4 h-4" />
                  {objectiveStats.available} objectifs à réclamer !
                </div>
              )}
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-orange-500/20 text-orange-300 px-4 py-3 rounded-lg text-center border border-orange-500/30">
                <div className="text-2xl font-bold">{objectiveStats.daily}</div>
                <div className="text-sm">Quotidiens</div>
              </div>
              <div className="bg-blue-500/20 text-blue-300 px-4 py-3 rounded-lg text-center border border-blue-500/30">
                <div className="text-2xl font-bold">{objectiveStats.weekly}</div>
                <div className="text-sm">Hebdomadaires</div>
              </div>
              <div className="bg-green-500/20 text-green-300 px-4 py-3 rounded-lg text-center border border-green-500/30">
                <div className="text-2xl font-bold">{objectiveStats.completed}</div>
                <div className="text-sm">Complétés</div>
              </div>
              <div className="bg-purple-500/20 text-purple-300 px-4 py-3 rounded-lg text-center border border-purple-500/30">
                <div className="text-2xl font-bold">{objectiveStats.available}</div>
                <div className="text-sm">À réclamer</div>
              </div>
            </div>

            {/* Liste des objectifs */}
            <div className="grid gap-6">
              {objectives.map((objective) => (
                <div 
                  key={objective.id}
                  className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-200 ${
                    objective.canClaim 
                      ? 'border-green-400 shadow-lg shadow-green-400/20' 
                      : 'border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    
                    {/* Info objectif */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{objective.icon}</span>
                        <div>
                          <h4 className="text-white text-lg font-semibold">
                            {objective.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              objective.type === 'daily' 
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}>
                              {objective.type === 'daily' ? '📅 Quotidien' : '🗓️ Hebdomadaire'}
                            </span>
                            <span className="text-purple-400 text-xs bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30">
                              {getCategoryLabel(objective.category)}
                            </span>
                            {objective.isClaimed && (
                              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                                ✓ Réclamé
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 mb-4 ml-12">{objective.description}</p>
                      
                      {/* Progression */}
                      <div className="mb-4 ml-12">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progression</span>
                          <span className="text-white font-semibold">{objective.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(objective.progress)}`}
                            style={{ width: `${Math.min(100, objective.progress)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Récompense avec bonus */}
                      <div className="flex items-center gap-4 text-sm flex-wrap ml-12">
                        <span className="text-green-400 font-semibold">
                          +{objective.xpReward} XP
                        </span>
                        {objective.categoryBonus && (
                          <span className="text-blue-400 font-semibold">
                            +{objective.categoryBonus} bonus
                          </span>
                        )}
                        <span className="text-yellow-400 font-bold">
                          = {objective.totalXpReward} XP total
                        </span>
                        {objective.badgeReward && (
                          <span className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/30">
                            🏆 {objective.badgeReward}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bouton de réclamation */}
                    <div className="ml-6">
                      {objective.isClaimed ? (
                        <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Réclamé
                        </div>
                      ) : objective.canClaim ? (
                        <button
                          onClick={() => handleClaimReward(objective)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold shadow-lg"
                        >
                          <Gift className="w-5 h-5" />
                          Réclamer
                        </button>
                      ) : (
                        <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg text-center">
                          <div className="text-lg font-bold">{Math.round(objective.progress)}%</div>
                          <div className="text-xs">En cours</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITÉS */}
        {activeTab === 'activities' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Activités récentes Game Master
            </h3>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="text-3xl">{activity.icon}</div>
                  
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm">{activity.detail}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-green-400 font-semibold text-lg">{activity.xp}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message motivationnel */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
              <p className="text-center text-white text-sm">
                🎮 <strong>Continuez comme ça !</strong> Votre progression en tant que Game Master est excellente.
                <br />
                <span className="text-gray-300">Plus vous complétez d'objectifs, plus vous débloquez de récompenses exclusives !</span>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GamificationPage;
