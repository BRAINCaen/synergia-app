// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION COMPATIBLE BUILD NETLIFY
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
  Zap,
  Plus,
  RefreshCw
} from 'lucide-react';

// Imports corrigés - SEULEMENT les imports qui fonctionnent
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 🎮 PAGE GAMIFICATION COMPATIBLE BUILD NETLIFY
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  const { gamification, isLoading: dataLoading, actions } = useUnifiedFirebaseData();

  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Données utilisateur avec fallbacks sécurisés
  const displayStats = {
    totalXp: gamification?.totalXp || 0,
    level: gamification?.level || 1,
    weeklyXp: gamification?.weeklyXp || 0,
    monthlyXp: gamification?.monthlyXp || 0,
    tasksCompleted: gamification?.tasksCompleted || 0,
    currentStreak: gamification?.currentStreak || 0,
    badges: gamification?.badges || [],
    loginStreak: gamification?.loginStreak || 1
  };

  // Stats utilisateur simulées pour les objectifs (temporaire)
  const userStats = {
    // Données quotidiennes 
    improvementsToday: Math.floor(Math.random() * 2),
    surpriseTeamsToday: Math.floor(Math.random() * 2),
    fiveStarReviewsToday: Math.floor(Math.random() * 3),
    colleagueHelpsToday: Math.floor(Math.random() * 2),
    securityCheckToday: Math.random() > 0.5,
    conflictsResolvedToday: Math.floor(Math.random() * 2),
    technicalFixesToday: Math.floor(Math.random() * 3),
    socialContentToday: Math.floor(Math.random() * 2),
    
    // Données hebdomadaires
    positiveReviewsThisWeek: Math.floor(Math.random() * 6),
    openingsThisWeek: Math.floor(Math.random() * 3),
    closingsThisWeek: Math.floor(Math.random() * 3),
    weekendWorkedThisWeek: Math.random() > 0.7,
    roomsAnimatedThisWeek: ['prison', 'quiz'].filter(() => Math.random() > 0.5)
  };

  // Calculs dérivés
  const xpForNextLevel = 100 * displayStats.level;
  const currentLevelXp = displayStats.totalXp % (100 * displayStats.level);
  const progressPercentage = Math.min(100, (currentLevelXp / xpForNextLevel) * 100);

  /**
   * 🎯 CALCULER LA PROGRESSION BASÉE SUR LES STATS
   */
  const calculateProgress = (objectiveId, target = 1) => {
    switch (objectiveId) {
      case 'daily_improvement':
        return Math.min(100, (userStats.improvementsToday / target) * 100);
      case 'daily_surprise_team':
        return Math.min(100, (userStats.surpriseTeamsToday / target) * 100);
      case 'daily_five_star':
        return Math.min(100, (userStats.fiveStarReviewsToday / target) * 100);
      case 'daily_help_colleague':
        return Math.min(100, (userStats.colleagueHelpsToday / target) * 100);
      case 'daily_security_check':
        return userStats.securityCheckToday ? 100 : 0;
      case 'daily_conflict_resolution':
        return Math.min(100, (userStats.conflictsResolvedToday / target) * 100);
      case 'daily_technical_fix':
        return Math.min(100, (userStats.technicalFixesToday / target) * 100);
      case 'daily_social_content':
        return Math.min(100, (userStats.socialContentToday / target) * 100);
      case 'weekly_positive_reviews':
        return Math.min(100, (userStats.positiveReviewsThisWeek / 5) * 100);
      case 'weekly_openings_closings':
        return Math.min(100, ((userStats.openingsThisWeek + userStats.closingsThisWeek) / 4) * 100);
      case 'weekly_weekend_work':
        return userStats.weekendWorkedThisWeek ? 100 : 0;
      case 'weekly_all_rooms':
        return Math.min(100, (userStats.roomsAnimatedThisWeek.length / 3) * 100);
      default:
        return 0;
    }
  };

  /**
   * 🎮 OBJECTIFS AVEC PROGRESSION CALCULÉE
   */
  const objectives = [
    // === OBJECTIFS QUOTIDIENS ===
    {
      id: 'daily_improvement',
      title: 'Propose une amélioration ou astuce',
      description: 'Partage une astuce d\'organisation sur le groupe équipe',
      target: 1,
      current: userStats.improvementsToday,
      progress: calculateProgress('daily_improvement', 1),
      xpReward: 50,
      badgeReward: 'Innovateur du Jour',
      icon: '💡',
      type: 'daily',
      category: 'innovation',
      categoryBonus: 15,
      totalXpReward: 65
    },
    {
      id: 'daily_surprise_team',
      title: 'Prends en charge une équipe surprise',
      description: 'Gère une équipe non prévue au planning',
      target: 1,
      current: userStats.surpriseTeamsToday,
      progress: calculateProgress('daily_surprise_team', 1),
      xpReward: 75,
      badgeReward: 'Héros Imprévu',
      icon: '🦸',
      type: 'daily',
      category: 'flexibility',
      categoryBonus: 20,
      totalXpReward: 95
    },
    {
      id: 'daily_five_star',
      title: 'Obtiens un retour 5 étoiles',
      description: 'Reçois un avis client "5 étoiles" dans la journée',
      target: 1,
      current: userStats.fiveStarReviewsToday,
      progress: calculateProgress('daily_five_star', 1),
      xpReward: 80,
      badgeReward: 'Excellence Client',
      icon: '⭐',
      type: 'daily',
      category: 'customer_service',
      categoryBonus: 25,
      totalXpReward: 105
    },
    {
      id: 'daily_help_colleague',
      title: 'Aide spontanément un·e collègue',
      description: 'Assiste sur une tâche qui n\'est pas la tienne',
      target: 1,
      current: userStats.colleagueHelpsToday,
      progress: calculateProgress('daily_help_colleague', 1),
      xpReward: 60,
      badgeReward: 'Esprit d\'Équipe',
      icon: '🤝',
      type: 'daily',
      category: 'teamwork',
      categoryBonus: 10,
      totalXpReward: 70
    },
    {
      id: 'daily_security_check',
      title: 'Tour sécurité complet',
      description: 'Vérifie portes, extincteurs, plans d\'évacuation, alarmes',
      target: 1,
      current: userStats.securityCheckToday ? 1 : 0,
      progress: calculateProgress('daily_security_check', 1),
      xpReward: 70,
      badgeReward: 'Gardien Sécurité',
      icon: '🛡️',
      type: 'daily',
      category: 'security',
      categoryBonus: 12,
      totalXpReward: 82
    },
    {
      id: 'daily_conflict_resolution',
      title: 'Gère un mini-conflit',
      description: 'Résous une situation tendue de façon autonome et débriefe',
      target: 1,
      current: userStats.conflictsResolvedToday,
      progress: calculateProgress('daily_conflict_resolution', 1),
      xpReward: 90,
      badgeReward: 'Médiateur',
      icon: '🎯',
      type: 'daily',
      category: 'leadership',
      categoryBonus: 30,
      totalXpReward: 120
    },
    {
      id: 'daily_technical_fix',
      title: 'Dépanne un élément technique',
      description: 'Répare une panne, bug ou accessoire dans la journée',
      target: 1,
      current: userStats.technicalFixesToday,
      progress: calculateProgress('daily_technical_fix', 1),
      xpReward: 65,
      badgeReward: 'Technicien Express',
      icon: '🔧',
      type: 'daily',
      category: 'maintenance',
      categoryBonus: 8,
      totalXpReward: 73
    },
    {
      id: 'daily_social_content',
      title: 'Propose du contenu réseaux sociaux',
      description: 'Publie ou propose une idée de contenu/story',
      target: 1,
      current: userStats.socialContentToday,
      progress: calculateProgress('daily_social_content', 1),
      xpReward: 55,
      badgeReward: 'Community Manager',
      icon: '📱',
      type: 'daily',
      category: 'marketing',
      categoryBonus: 18,
      totalXpReward: 73
    },

    // === OBJECTIFS HEBDOMADAIRES ===
    {
      id: 'weekly_positive_reviews',
      title: 'Obtenir 5 avis clients positifs',
      description: 'Reçois au moins 5 avis positifs sur Google, TripAdvisor ou Facebook',
      target: 5,
      current: userStats.positiveReviewsThisWeek,
      progress: calculateProgress('weekly_positive_reviews', 5),
      xpReward: 150,
      badgeReward: 'Champion Satisfaction',
      icon: '🌟',
      type: 'weekly',
      category: 'customer_service',
      categoryBonus: 25,
      totalXpReward: 175
    },
    {
      id: 'weekly_openings_closings',
      title: '2 ouvertures et 2 fermetures',
      description: 'Effectue 2 ouvertures et 2 fermetures dans la semaine',
      target: 4,
      current: userStats.openingsThisWeek + userStats.closingsThisWeek,
      progress: calculateProgress('weekly_openings_closings', 4),
      xpReward: 120,
      badgeReward: 'Maître des Clés',
      icon: '🗝️',
      type: 'weekly',
      category: 'responsibility',
      categoryBonus: 22,
      totalXpReward: 142
    },
    {
      id: 'weekly_weekend_work',
      title: 'Travaille un week-end entier',
      description: 'Assure le service sur un week-end complet',
      target: 1,
      current: userStats.weekendWorkedThisWeek ? 1 : 0,
      progress: calculateProgress('weekly_weekend_work', 1),
      xpReward: 180,
      badgeReward: 'Guerrier Weekend',
      icon: '🎪',
      type: 'weekly',
      category: 'dedication',
      categoryBonus: 35,
      totalXpReward: 215
    },
    {
      id: 'weekly_all_rooms',
      title: 'Anime chaque salle',
      description: 'Anime au moins une session dans chaque salle (escape ET quiz)',
      target: 3,
      current: userStats.roomsAnimatedThisWeek.length,
      progress: calculateProgress('weekly_all_rooms', 3),
      xpReward: 140,
      badgeReward: 'Maître Polyvalent',
      icon: '🎭',
      type: 'weekly',
      category: 'versatility',
      categoryBonus: 25,
      totalXpReward: 165
    }
  ];

  // Ajouter les propriétés calculées aux objectifs
  const objectivesWithStatus = objectives.map(objective => ({
    ...objective,
    status: objective.progress >= 100 ? 'completed' : 'active',
    isClaimed: false, // TODO: Connecter au vrai système de réclamation
    canClaim: objective.progress >= 100 && !false
  }));

  /**
   * 🎁 GESTIONNAIRE DE RÉCLAMATION TEMPORAIRE
   */
  const handleClaimReward = async (objective) => {
    try {
      console.log('🎯 Réclamation objectif (temporaire):', objective.title);

      if (objective.progress < 100) {
        setNotificationMessage('❌ Objectif non complété');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        return;
      }

      // Utiliser le système d'XP existant
      if (actions?.addXp) {
        await actions.addXp(objective.totalXpReward, `Objectif: ${objective.title}`);
      }

      // Notification de succès
      setNotificationMessage(`🎉 +${objective.totalXpReward} XP réclamés pour "${objective.title}"!`);
      setShowNotification(true);

      // Marquer comme réclamé localement
      objective.isClaimed = true;
      objective.canClaim = false;

      setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('');
      }, 5000);

    } catch (error) {
      console.error('❌ Erreur réclamation:', error);
      setNotificationMessage('❌ Une erreur est survenue');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  /**
   * 🧪 FONCTION DE TEST POUR INCRÉMENTER LES STATS
   */
  const testActions = {
    proposeImprovement: () => {
      userStats.improvementsToday += 1;
      setShowNotification(true);
      setNotificationMessage('💡 Amélioration proposée !');
      setTimeout(() => setShowNotification(false), 2000);
      // Rafraîchir les objectifs
      window.location.reload();
    },
    handleSurpriseTeam: () => {
      userStats.surpriseTeamsToday += 1;
      setShowNotification(true);
      setNotificationMessage('🦸 Équipe surprise gérée !');
      setTimeout(() => setShowNotification(false), 2000);
      window.location.reload();
    },
    receiveFiveStarReview: () => {
      userStats.fiveStarReviewsToday += 1;
      setShowNotification(true);
      setNotificationMessage('⭐ Avis 5 étoiles reçu !');
      setTimeout(() => setShowNotification(false), 2000);
      window.location.reload();
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

  // Statistiques des objectifs
  const objectiveStats = {
    total: objectivesWithStatus.length,
    completed: objectivesWithStatus.filter(obj => obj.status === 'completed').length,
    available: objectivesWithStatus.filter(obj => obj.canClaim).length,
    daily: objectivesWithStatus.filter(obj => obj.type === 'daily').length,
    weekly: objectivesWithStatus.filter(obj => obj.type === 'weekly').length
  };

  /**
   * 🧪 PANEL DE DEBUG POUR TESTER LES ACTIONS
   */
  const DebugPanel = () => (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold">🧪 Panel de Test (Mode Build Compatible)</h4>
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="text-gray-400 hover:text-white"
        >
          {showDebugPanel ? '−' : '+'}
        </button>
      </div>
      
      {showDebugPanel && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            onClick={testActions.proposeImprovement}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs"
          >
            💡 +Amélioration
          </button>
          <button
            onClick={testActions.handleSurpriseTeam}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs"
          >
            🦸 +Équipe surprise
          </button>
          <button
            onClick={testActions.receiveFiveStarReview}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs"
          >
            ⭐ +Avis 5 étoiles
          </button>
        </div>
      )}
    </div>
  );

  // Activités récentes basées sur les stats
  const recentActivities = [
    {
      id: 1,
      type: 'stat',
      action: 'Statistiques actuelles',
      detail: `${userStats.improvementsToday} améliorations, ${userStats.fiveStarReviewsToday} avis 5⭐`,
      xp: 'Simulé',
      time: 'Maintenant',
      icon: '📊'
    },
    {
      id: 2,
      type: 'weekly',
      action: 'Cette semaine',
      detail: `${userStats.positiveReviewsThisWeek} avis positifs, ${userStats.openingsThisWeek} ouvertures`,
      xp: 'En cours',
      time: 'Cette semaine',
      icon: '📈'
    }
  ];

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎉 NOTIFICATION */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-pulse border border-green-300 max-w-md">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-bold text-sm leading-tight">{notificationMessage}</p>
                <p className="text-xs opacity-90 mt-1">Version compatible build Netlify</p>
              </div>
            </div>
          </div>
        )}

        {/* 📊 EN-TÊTE */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification Game Master</h1>
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              Compatible Build
            </span>
          </div>
          <p className="text-gray-300 text-lg">
            Objectifs Game Master avec progression simulée - Version build Netlify
          </p>
        </div>

        {/* 🧪 PANEL DE DEBUG */}
        <DebugPanel />

        {/* 🎯 STATISTIQUES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Total */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{displayStats.totalXp.toLocaleString()}</p>
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
                <p className="text-white text-2xl font-bold">{displayStats.level}</p>
                <p className="text-gray-400 text-sm">Niveau</p>
              </div>
            </div>
          </div>

          {/* Objectifs disponibles */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className={`flex items-center gap-3`}>
              <div className={`p-3 rounded-lg ${objectiveStats.available > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{objectiveStats.available}</p>
                <p className="text-gray-400 text-sm">À réclamer</p>
              </div>
            </div>
          </div>

          {/* Objectifs complétés */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{objectiveStats.completed}</p>
                <p className="text-gray-400 text-sm">Complétés</p>
              </div>
            </div>
          </div>
        </div>

        {/* 📱 NAVIGATION TABS */}
        <div className="flex gap-4 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-2">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'objectives', label: 'Objectifs Game Master', icon: Target },
            { id: 'activities', label: 'Stats Simulées', icon: Activity }
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
                  <span>Niveau {displayStats.level}</span>
                  <span>{currentLevelXp} / {xpForNextLevel} XP</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-400 text-sm">
                  Plus que {xpForNextLevel - currentLevelXp} XP pour le niveau {displayStats.level + 1}
                </p>
              </div>
            </div>

            {/* Statistiques simulées */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-400" />
                Stats Simulées
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Améliorations aujourd'hui</span>
                  <span className="text-white font-semibold">{userStats.improvementsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avis 5⭐ aujourd'hui</span>
                  <span className="text-white font-semibold">{userStats.fiveStarReviewsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conflits résolus</span>
                  <span className="text-white font-semibold">{userStats.conflictsResolvedToday}</span>
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
                  Version compatible build Netlify • Progression simulée
                </p>
              </div>
              {objectiveStats.available > 0 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 animate-pulse">
                  <Gift className="w-4 h-4" />
                  {objectiveStats.available} DISPONIBLES !
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
              {objectivesWithStatus.map((objective) => (
                <div 
                  key={objective.id}
                  className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-200 ${
                    objective.canClaim 
                      ? 'border-green-400 shadow-lg shadow-green-400/20 animate-pulse' 
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
                            <span className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
                              🔄 Simulé
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
                          <span className="text-gray-400">Progression (simulée)</span>
                          <span className="text-white font-semibold">
                            {objective.current}/{objective.target} ({Math.round(objective.progress)}%)
                          </span>
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
                          <div className="text-xs">
                            {objective.current}/{objective.target}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS SIMULÉES */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            
            {/* Stats simulées en temps réel */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Statistiques Simulées
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Stats quotidiennes */}
                <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                  <h4 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
                    📅 Aujourd'hui
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Améliorations proposées</span>
                      <span className="text-white font-semibold">{userStats.improvementsToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Équipes surprises gérées</span>
                      <span className="text-white font-semibold">{userStats.surpriseTeamsToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avis 5 étoiles reçus</span>
                      <span className="text-white font-semibold">{userStats.fiveStarReviewsToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Collègues aidés</span>
                      <span className="text-white font-semibold">{userStats.colleagueHelpsToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tour sécurité fait</span>
                      <span className="text-white font-semibold">{userStats.securityCheckToday ? '✅' : '❌'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Conflits résolus</span>
                      <span className="text-white font-semibold">{userStats.conflictsResolvedToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dépannages techniques</span>
                      <span className="text-white font-semibold">{userStats.technicalFixesToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contenus sociaux proposés</span>
                      <span className="text-white font-semibold">{userStats.socialContentToday}</span>
                    </div>
                  </div>
                </div>

                {/* Stats hebdomadaires */}
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                  <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    🗓️ Cette semaine
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avis positifs reçus</span>
                      <span className="text-white font-semibold">{userStats.positiveReviewsThisWeek}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ouvertures effectuées</span>
                      <span className="text-white font-semibold">{userStats.openingsThisWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fermetures effectuées</span>
                      <span className="text-white font-semibold">{userStats.closingsThisWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weekend travaillé</span>
                      <span className="text-white font-semibold">{userStats.weekendWorkedThisWeek ? '✅' : '❌'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Salles animées</span>
                      <span className="text-white font-semibold">
                        {userStats.roomsAnimatedThisWeek.length}/3
                      </span>
                    </div>
                    {userStats.roomsAnimatedThisWeek.length > 0 && (
                      <div className="text-xs text-gray-400 mt-2">
                        Salles: {userStats.roomsAnimatedThisWeek.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats générales */}
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                  <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                    📊 Général
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP Total</span>
                      <span className="text-white font-semibold">{displayStats.totalXp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Niveau actuel</span>
                      <span className="text-white font-semibold">{displayStats.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XP cette semaine</span>
                      <span className="text-white font-semibold">{displayStats.weeklyXp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Série actuelle</span>
                      <span className="text-white font-semibold">{displayStats.currentStreak}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Badges obtenus</span>
                      <span className="text-white font-semibold">{displayStats.badges.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activités récentes */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Activités simulées
              </h3>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
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
            </div>
            
            {/* Message d'information */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 p-6">
              <div className="text-center">
                <h4 className="text-white text-lg font-semibold mb-2">
                  🔧 Version Compatible Build Netlify
                </h4>
                <p className="text-gray-300 text-sm mb-4">
                  Cette version utilise des données simulées pour éviter les erreurs de build. Les objectifs se basent sur des stats générées aléatoirement à chaque chargement. Utilise les boutons de test pour voir les objectifs changer !
                </p>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">
                    🔄 Données simulées
                  </span>
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded border border-green-500/30">
                    ✅ Build compatible
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded border border-purple-500/30">
                    🧪 Panel de test
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default GamificationPage;
