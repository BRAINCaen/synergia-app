// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// CORRECTION IMPORT LAYOUT - COMPATIBLE BUILD
// ==========================================

import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Send,
  Eye,
  Calendar
} from 'lucide-react';

// ✅ CORRECTION CRITIQUE : Utiliser PremiumLayout au lieu de LayoutComponent
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';

// 🔧 IMPORTS CORRIGÉS - Utiliser les hooks existants
import { useAuthStore } from '../shared/stores/authStore.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

/**
 * 🎮 PAGE GAMIFICATION - VERSION COMPATIBLE BUILD
 */
const GamificationPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { gamification, isLoading: dataLoading } = useUnifiedFirebaseData();

  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(false);

  // Données utilisateur avec fallbacks sécurisés
  const displayStats = {
    totalXp: gamification?.totalXp || 0,
    level: gamification?.level || 1,
    weeklyXp: gamification?.weeklyXp || 0,
    tasksCompleted: gamification?.tasksCompleted || 0,
    currentStreak: gamification?.currentStreak || 0
  };

  /**
   * 📊 OBJECTIFS TEMPORAIRES POUR DEMO
   */
  const temporaryObjectives = [
    {
      id: 'daily_improvement',
      title: 'Proposer une amélioration',
      description: 'Suggérer une amélioration pour l\'équipe ou le processus',
      target: 1,
      current: 0,
      progress: 0,
      xpReward: 25,
      badgeReward: 'Innovateur',
      status: 'active',
      icon: '💡',
      type: 'daily',
      canClaim: false,
      isClaimed: false
    },
    {
      id: 'daily_team_help',
      title: 'Aider l\'équipe surprise',
      description: 'Gérer une équipe non prévue au planning',
      target: 1,
      current: 0,
      progress: 0,
      xpReward: 30,
      badgeReward: 'Sauveur d\'équipe',
      status: 'active',
      icon: '🤝',
      type: 'daily',
      canClaim: false,
      isClaimed: false
    },
    {
      id: 'weekly_leadership',
      title: 'Prendre des initiatives',
      description: 'Proposer et mener des initiatives d\'amélioration',
      target: 3,
      current: 1,
      progress: 33,
      xpReward: 50,
      badgeReward: 'Leader',
      status: 'active',
      icon: '🎯',
      type: 'weekly',
      canClaim: false,
      isClaimed: false
    },
    {
      id: 'monthly_innovation',
      title: 'Innovation du mois',
      description: 'Implémenter une innovation majeure',
      target: 1,
      current: 0,
      progress: 0,
      xpReward: 100,
      badgeReward: 'Innovateur du mois',
      status: 'active',
      icon: '🚀',
      type: 'monthly',
      canClaim: false,
      isClaimed: false
    }
  ];

  // Calculs XP
  const xpForNextLevel = 100 * displayStats.level;
  const progressToNextLevel = (displayStats.totalXp % xpForNextLevel) / xpForNextLevel * 100;

  // Badges temporaires
  const userBadges = [
    { id: 1, name: 'Premier pas', icon: '🎯', earned: true, description: 'Complété le premier objectif' },
    { id: 2, name: 'Collaborateur', icon: '🤝', earned: true, description: 'Aidé 5 collègues' },
    { id: 3, name: 'Innovateur', icon: '💡', earned: false, description: 'Proposé 10 améliorations' },
    { id: 4, name: 'Leader', icon: '👑', earned: false, description: 'Mené 3 initiatives' }
  ];

  // Actions du header
  const headerActions = (
    <div className="flex space-x-3">
      <button
        onClick={() => setActiveTab('claims')}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
      >
        <Trophy className="w-4 h-4" />
        <span>Réclamer</span>
      </button>
      
      <button
        onClick={() => window.location.reload()}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Actualiser</span>
      </button>
    </div>
  );

  // Statistiques pour le header
  const headerStats = [
    { label: "XP Total", value: displayStats.totalXp, icon: Star, color: "text-yellow-400" },
    { label: "Niveau", value: displayStats.level, icon: Trophy, color: "text-blue-400" },
    { label: "Tâches", value: displayStats.tasksCompleted, icon: CheckCircle, color: "text-green-400" },
    { label: "Série", value: displayStats.currentStreak, icon: Flame, color: "text-red-400" }
  ];

  // Chargement initial
  useEffect(() => {
    setObjectives(temporaryObjectives);
  }, []);

  // Fonction de réclamation d'objectif
  const handleClaimObjective = async (objectiveId) => {
    setLoading(true);
    
    try {
      // Simulation de réclamation
      console.log(`🎯 Réclamation objectif: ${objectiveId}`);
      
      // Mettre à jour l'objectif localement
      setObjectives(prev => prev.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, isClaimed: true, status: 'claimed' }
          : obj
      ));
      
      // Notification de succès
      setNotificationMessage(`🎉 Réclamation envoyée pour validation !`);
      setShowNotification(true);
      
      setTimeout(() => setShowNotification(false), 3000);
      
    } catch (error) {
      console.error('❌ Erreur réclamation:', error);
      setNotificationMessage(`❌ Erreur lors de la réclamation`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <PremiumLayout
        title="Gamification"
        subtitle="Système de récompenses et objectifs"
        icon={Trophy}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de la gamification...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Gamification"
      subtitle="Système de récompenses, objectifs et badges"
      icon={Trophy}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {notificationMessage}
        </div>
      )}

      {/* Onglets */}
      <div className="mb-8">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
              { id: 'objectives', label: 'Objectifs', icon: Target },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'claims', label: 'Réclamations', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Progression niveau */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Niveau {displayStats.level}</h3>
                <p className="text-gray-400">Progression vers le niveau suivant</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-400">
              <span>{displayStats.totalXp} XP</span>
              <span>{xpForNextLevel} XP</span>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{displayStats.weeklyXp}</div>
              <div className="text-sm text-gray-400">XP cette semaine</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{displayStats.tasksCompleted}</div>
              <div className="text-sm text-gray-400">Tâches complétées</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center">
              <Flame className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{displayStats.currentStreak}</div>
              <div className="text-sm text-gray-400">Jours consécutifs</div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{userBadges.filter(b => b.earned).length}</div>
              <div className="text-sm text-gray-400">Badges obtenus</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'objectives' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Objectifs Disponibles</h3>
            <span className="text-gray-400">{objectives.length} objectifs</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {objectives.map((objective) => (
              <div
                key={objective.id}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-6 transition-all duration-300 ${
                  objective.isClaimed 
                    ? 'border-green-500/50 bg-green-900/20' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{objective.icon}</span>
                    <div>
                      <h4 className="font-bold text-white">{objective.title}</h4>
                      <p className="text-sm text-gray-400">{objective.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    objective.type === 'daily' ? 'bg-blue-600 text-blue-100' :
                    objective.type === 'weekly' ? 'bg-purple-600 text-purple-100' :
                    'bg-yellow-600 text-yellow-100'
                  }`}>
                    {objective.type}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progression</span>
                    <span>{objective.current}/{objective.target}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${objective.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-yellow-400">
                      <Star className="w-4 h-4 inline mr-1" />
                      {objective.xpReward} XP
                    </span>
                    <span className="text-purple-400">
                      <Award className="w-4 h-4 inline mr-1" />
                      {objective.badgeReward}
                    </span>
                  </div>
                  
                  {objective.isClaimed ? (
                    <span className="text-green-400 text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Réclamé
                    </span>
                  ) : objective.canClaim ? (
                    <button
                      onClick={() => handleClaimObjective(objective.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Réclamer
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm">En cours</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Collection de Badges</h3>
            <span className="text-gray-400">
              {userBadges.filter(b => b.earned).length}/{userBadges.length} obtenus
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBadges.map((badge) => (
              <div
                key={badge.id}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-lg p-6 text-center transition-all duration-300 ${
                  badge.earned 
                    ? 'border-yellow-500/50 bg-yellow-900/20' 
                    : 'border-gray-700/50 opacity-50'
                }`}
              >
                <span className="text-4xl mb-3 block">{badge.icon}</span>
                <h4 className="font-bold text-white mb-2">{badge.name}</h4>
                <p className="text-sm text-gray-400 mb-4">{badge.description}</p>
                
                {badge.earned ? (
                  <span className="inline-flex items-center text-yellow-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Obtenu
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">Non obtenu</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-8 text-center">
            <MessageSquare className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Système de Réclamations</h3>
            <p className="text-gray-400 mb-6">
              Réclamez vos objectifs accomplis et attendez la validation des administrateurs.
            </p>
            
            <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4 mb-6">
              <h4 className="text-blue-400 font-bold mb-2">📋 Comment ça marche ?</h4>
              <ul className="text-blue-300 text-sm text-left space-y-1">
                <li>• Accomplissez vos objectifs quotidiens/hebdomadaires</li>
                <li>• Cliquez sur "Réclamer" pour demander validation</li>
                <li>• Un administrateur vérifie et valide votre réclamation</li>
                <li>• Vous recevez automatiquement vos XP et badges</li>
              </ul>
            </div>
            
            <button
              onClick={() => setActiveTab('objectives')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <Target className="w-5 h-5" />
              <span>Voir les Objectifs</span>
            </button>
          </div>
        </div>
      )}
    </PremiumLayout>
  );
};

export default GamificationPage;

// ==========================================
// 📋 LOGS DE CONFIRMATION
// ==========================================
console.log('✅ GamificationPage.jsx corrigé');
console.log('🔧 Import LayoutComponent → PremiumLayout');
console.log('🎮 Page gamification avec système de réclamation');
console.log('🚀 Build Netlify compatible');
