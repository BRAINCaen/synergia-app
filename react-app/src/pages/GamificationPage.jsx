// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION AVEC VRAI SYSTÈME FIREBASE
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

// Imports corrigés
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { useRealObjectives } from '../shared/hooks/useRealObjectives.js';

/**
 * 🎮 PAGE GAMIFICATION AVEC VRAI SYSTÈME FIREBASE
 */
const GamificationPage = () => {
  const { user } = useAuthStore();
  const { gamification, isLoading: dataLoading } = useUnifiedFirebaseData();
  
  // 🔥 Hook pour objectifs réels Firebase
  const { 
    objectives, 
    userStats,
    loading: objectivesLoading,
    error: objectivesError,
    claimObjective,
    incrementStat,
    gameMasterActions,
    stats: objectiveStats,
    isClaimingObjective,
    hasClaimableObjectives
  } = useRealObjectives();

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

  // Calculs dérivés
  const xpForNextLevel = 100 * displayStats.level;
  const currentLevelXp = displayStats.totalXp % (100 * displayStats.level);
  const progressPercentage = Math.min(100, (currentLevelXp / xpForNextLevel) * 100);

  /**
   * 🎁 GESTIONNAIRE DE RÉCLAMATION FIREBASE RÉEL
   */
  const handleClaimReward = async (objective) => {
    try {
      console.log('🎯 Réclamation objectif Firebase réel:', objective.title);

      const result = await claimObjective(objective);

      if (result.success) {
        // Afficher notification détaillée avec level up
        let message = result.message;
        if (result.levelUp) {
          message += ` 🎊 NIVEAU ${result.newLevel} ATTEINT !`;
        }
        
        setNotificationMessage(message);
        setShowNotification(true);

        // Masquer après 8 secondes pour laisser le temps de voir le level up
        setTimeout(() => {
          setShowNotification(false);
          setNotificationMessage('');
        }, 8000);

        console.log('✅ Objectif réclamé avec succès:', result);
      } else {
        // Afficher erreur détaillée
        setNotificationMessage(`❌ Erreur: ${result.error}`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 4000);
      }

    } catch (error) {
      console.error('❌ Erreur réclamation Firebase:', error);
      setNotificationMessage('❌ Une erreur Firebase est survenue lors de la réclamation');
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

  /**
   * 🧪 PANEL DE DEBUG FIREBASE POUR TESTER LES ACTIONS RÉELLES
   */
  const DebugPanel = () => (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold">🔥 Panel Firebase - Actions Game Master Réelles</h4>
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="text-gray-400 hover:text-white"
        >
          {showDebugPanel ? '−' : '+'}
        </button>
      </div>
      
      {showDebugPanel && (
        <>
          <p className="text-gray-400 text-xs mb-4">
            Ces actions mettent à jour tes vraies données Firebase et influencent la progression des objectifs en temps réel.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => gameMasterActions.proposeImprovement()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              💡 Amélioration
            </button>
            <button
              onClick={() => gameMasterActions.handleSurpriseTeam()}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              🦸 Équipe surprise
            </button>
            <button
              onClick={() => gameMasterActions.receiveFiveStarReview()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              ⭐ Avis 5 étoiles
            </button>
            <button
              onClick={() => gameMasterActions.helpColleague()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              🤝 Aide collègue
            </button>
            <button
              onClick={() => gameMasterActions.completeSecurityCheck()}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              🛡️ Tour sécurité
            </button>
            <button
              onClick={() => gameMasterActions.resolveConflict()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              🎯 Résoudre conflit
            </button>
            <button
              onClick={() => gameMasterActions.fixTechnicalIssue()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              🔧 Dépannage
            </button>
            <button
              onClick={() => gameMasterActions.receivePositiveReview()}
              className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded text-xs transition-colors"
            >
              🌟 Avis positif
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Activités récentes basées sur les vraies données Firebase
  const recentActivities = [
    {
      id: 1,
      type: 'stat',
      action: 'Stats Firebase temps réel',
      detail: `${userStats.improvementsToday || 0} améliorations, ${userStats.fiveStarReviewsToday || 0} avis 5⭐ aujourd'hui`,
      xp: '🔥 Live',
      time: 'Maintenant',
      icon: '📊'
    },
    {
      id: 2,
      type: 'weekly',
      action: 'Progression hebdomadaire',
      detail: `${userStats.positiveReviewsThisWeek || 0} avis positifs, ${(userStats.openingsThisWeek || 0) + (userStats.closingsThisWeek || 0)} ouv./ferm.`,
      xp: 'Firebase',
      time: 'Cette semaine',
      icon: '📈'
    },
    {
      id: 3,
      type: 'firebase',
      action: 'Données synchronisées',
      detail: `${objectives.length} objectifs chargés, ${objectiveStats.available} disponibles à réclamer`,
      xp: 'Sync OK',
      time: 'Temps réel',
      icon: '🔄'
    }
  ];

  if (dataLoading || objectivesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Connexion à Firebase...</p>
              <p className="text-sm text-gray-400 mt-2">Chargement des objectifs temps réel</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎉 NOTIFICATION DE RÉCLAMATION FIREBASE AMÉLIORÉE */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce border border-green-300 max-w-md">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🔥</span>
              <div>
                <p className="font-bold text-sm leading-tight">{notificationMessage}</p>
                <p className="text-xs opacity-90 mt-1">✅ Sauvegardé dans Firebase en temps réel !</p>
              </div>
            </div>
          </div>
        )}

        {/* 📊 EN-TÊTE AVEC BADGE FIREBASE */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Gamification Firebase</h1>
            <div className="flex flex-col gap-1">
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔥 FIREBASE LIVE
              </span>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                Temps réel
              </span>
            </div>
          </div>
          <p className="text-gray-300 text-lg">
            Objectifs Game Master connectés à tes vraies données Firebase • Progression temps réel
          </p>
        </div>

        {/* 🧪 PANEL DE DEBUG FIREBASE */}
        <DebugPanel />

        {/* 🚨 GESTION DES ERREURS FIREBASE */}
        {objectivesError && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚨</span>
              <div>
                <p className="font-semibold">Erreur de connexion Firebase</p>
                <p className="text-sm">{objectivesError}</p>
                <p className="text-xs mt-1 opacity-75">Vérifiez votre connexion internet et les configurations Firebase</p>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 STATISTIQUES PRINCIPALES FIREBASE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Total Firebase */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{displayStats.totalXp.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">XP Total Firebase</p>
              </div>
            </div>
          </div>

          {/* Niveau Firebase */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{displayStats.level}</p>
                <p className="text-gray-400 text-sm">Niveau Firebase</p>
              </div>
            </div>
          </div>

          {/* Objectifs disponibles */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${hasClaimableObjectives ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-2xl font-bold">{objectiveStats.available}</p>
                <p className="text-gray-400 text-sm">Prêts Firebase</p>
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
            { id: 'objectives', label: 'Objectifs Firebase', icon: Target },
            { id: 'activities', label: 'Stats Live Firebase', icon: Activity }
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
        
        {/* VUE D'ENSEMBLE FIREBASE */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Progression du niveau Firebase */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Progression Firebase Temps Réel
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-white">
                  <span>Niveau {displayStats.level}</span>
                  <span>{currentLevelXp} / {xpForNextLevel} XP</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                <p className="text-gray-400 text-sm">
                  Plus que {xpForNextLevel - currentLevelXp} XP pour le niveau {displayStats.level + 1}
                </p>
                
                <div className="bg-green-500/10 border border-green-500/30 rounded p-3 mt-4">
                  <p className="text-green-300 text-xs">
                    🔥 Données synchronisées avec Firebase • Mise à jour automatique lors des réclamations
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques Firebase temps réel */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-400" />
                Stats Firebase Live
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Améliorations aujourd'hui</span>
                  <span className="text-white font-semibold">{userStats.improvementsToday || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avis 5⭐ aujourd'hui</span>
                  <span className="text-white font-semibold">{userStats.fiveStarReviewsToday || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conflits résolus</span>
                  <span className="text-white font-semibold">{userStats.conflictsResolvedToday || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tour sécurité fait</span>
                  <span className="text-white font-semibold">{userStats.securityCheckToday ? '✅' : '❌'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Objectifs disponibles</span>
                  <span className="text-green-400 font-semibold animate-pulse">{objectiveStats.available}</span>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-4">
                  <p className="text-blue-300 text-xs">
                    📊 Données mises à jour en temps réel depuis votre base Firebase
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OBJECTIFS FIREBASE RÉELS */}
        {activeTab === 'objectives' && (
          <div>
            {/* En-tête objectifs Firebase */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white text-2xl font-semibold">Objectifs Firebase Temps Réel</h3>
                <p className="text-gray-400 text-sm mt-1">
                  🔥 Progression calculée depuis tes vraies données Firebase • Sauvegarde automatique
                </p>
              </div>
              {hasClaimableObjectives && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 animate-bounce">
                  <Gift className="w-4 h-4" />
                  {objectiveStats.available} FIREBASE PRÊTS !
                </div>
              )}
            </div>

            {/* Statistiques Firebase rapides */}
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

            {/* Liste des objectifs Firebase */}
            <div className="grid gap-6">
              {objectives.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400 text-lg">Connexion aux objectifs Firebase...</p>
                  <p className="text-gray-500 text-sm mt-2">Vérification des données temps réel</p>
                </div>
              ) : (
                objectives.map((objective) => (
                  <div 
                    key={objective.id}
                    className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
                      objective.canClaim 
                        ? 'border-green-400 shadow-lg shadow-green-400/20 animate-pulse' 
                        : 'border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      
                      {/* Info objectif Firebase */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{objective.icon}</span>
                          <div>
                            <h4 className="text-white text-lg font-semibold">
                              {objective.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                              <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded border border-green-500/30 animate-pulse">
                                🔥 Firebase Live
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
                        
                        {/* Progression Firebase RÉELLE */}
                        <div className="mb-4 ml-12">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Progression Firebase temps réel</span>
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
                        
                        {/* Récompense avec bonus Firebase */}
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

                      {/* Bouton de réclamation Firebase */}
                      <div className="ml-6">
                        {objective.isClaimed ? (
                          <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Réclamé Firebase
                          </div>
                        ) : objective.canClaim ? (
                          <button
                            onClick={() => handleClaimReward(objective)}
                            disabled={isClaimingObjective(objective.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold shadow-lg"
                          >
                            {isClaimingObjective(objective.id) ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Sauvegarde Firebase...
                              </>
                            ) : (
                              <>
                                <Gift className="w-5 h-5" />
                                Réclamer Firebase
                              </>
                            )}
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
                ))
              )}
            </div>
          </div>
        )}

        {/* STATS FIREBASE LIVE */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            
            {/* Stats Firebase en temps réel */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Statistiques Firebase Temps Réel
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Stats quotidiennes Firebase */}
                <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                  <h4 className="text-orange-300 font-semibold mb-3 flex items-center gap-2">
                    📅 Aujourd'hui (Firebase)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Améliorations proposées</span>
                      <span className="text-white font-semibold">{userStats.improvementsToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Équipes surprises gérées</span>
                      <span className="text-white font-semibold">{userStats.surpriseTeamsToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avis 5 étoiles reçus</span>
                      <span className="text-white font-semibold">{userStats.fiveStarReviewsToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Collègues aidés</span>
                      <span className="text-white font-semibold">{userStats.colleagueHelpsToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tour sécurité fait</span>
                      <span className="text-white font-semibold">{userStats.securityCheckToday ? '✅' : '❌'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Conflits résolus</span>
                      <span className="text-white font-semibold">{userStats.conflictsResolvedToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dépannages techniques</span>
                      <span className="text-white font-semibold">{userStats.technicalFixesToday || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contenus sociaux proposés</span>
                      <span className="text-white font-semibold">{userStats.socialContentToday || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Stats hebdomadaires Firebase */}
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                  <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                    🗓️ Cette semaine (Firebase)
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avis positifs reçus</span>
                      <span className="text-white font-semibold">{userStats.positiveReviewsThisWeek || 0}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ouvertures effectuées</span>
                      <span className="text-white font-semibold">{userStats.openingsThisWeek || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fermetures effectuées</span>
                      <span className="text-white font-semibold">{userStats.closingsThisWeek || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weekend travaillé</span>
                      <span className="text-white font-semibold">{userStats.weekendWorkedThisWeek ? '✅' : '❌'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Salles animées</span>
                      <span className="text-white font-semibold">
                        {(userStats.roomsAnimatedThisWeek || []).length}/3
                      </span>
                    </div>
                    {userStats.roomsAnimatedThisWeek && userStats.roomsAnimatedThisWeek.length > 0 && (
                      <div className="text-xs text-gray-400 mt-2">
                        Salles: {userStats.roomsAnimatedThisWeek.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats générales Firebase */}
                <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                  <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                    📊 Général (Firebase)
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

            {/* Activités récentes Firebase */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Activités Firebase en temps réel
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
            
            {/* Message Firebase avec instructions */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30 p-6">
              <div className="text-center">
                <h4 className="text-white text-lg font-semibold mb-2">
                  🔥 Système Firebase Temps Réel Connecté !
                </h4>
                <p className="text-gray-300 text-sm mb-4">
                  Tes objectifs sont maintenant <strong>100% connectés à Firebase</strong>. Toutes tes actions sont trackées en temps réel et sauvegardées automatiquement. Utilise le panel de test pour voir les objectifs se compléter instantanément !
                </p>
                <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                  <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded border border-green-500/30">
                    ✅ Firebase connecté
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">
                    🔄 Sync temps réel
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded border border-purple-500/30">
                    💾 Sauvegarde auto
                  </span>
                  <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded border border-yellow-500/30">
                    🎯 Progression réelle
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
