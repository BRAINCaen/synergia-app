// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION - VERSION CORRIGÉE POUR BUILD
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

import LayoutComponent from '../layouts/LayoutComponent.jsx';

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
      badgeReward: 'Flexible',
      status: 'active',
      icon: '🤝',
      type: 'daily',
      canClaim: false,
      isClaimed: false
    },
    {
      id: 'weekly_maintenance',
      title: 'Maintenance équipement',
      description: 'Effectuer la maintenance préventive des équipements',
      target: 1,
      current: 1,
      progress: 100,
      xpReward: 75,
      badgeReward: 'Technicien Expert',
      status: 'completed',
      icon: '🔧',
      type: 'weekly',
      canClaim: true,
      isClaimed: false
    }
  ];

  /**
   * 📊 STATISTIQUES CALCULÉES
   */
  const objectiveStats = {
    total: temporaryObjectives.length,
    completed: temporaryObjectives.filter(obj => obj.status === 'completed').length,
    available: temporaryObjectives.filter(obj => obj.canClaim).length,
    claimed: temporaryObjectives.filter(obj => obj.isClaimed).length,
    pending: 0 // Pour la version temporaire
  };

  /**
   * 🎁 SIMULER UNE RÉCLAMATION (VERSION TEMPORAIRE)
   */
  const handleClaimReward = async (objective) => {
    setNotificationMessage(`🎯 Réclamation soumise ! En attendant la validation admin pour "${objective.title}"`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const handleRefresh = async () => {
    setNotificationMessage('🔄 Données mises à jour !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Afficher le loading pendant le chargement initial
  if (dataLoading) {
    return (
      <LayoutComponent>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-white text-lg">Chargement de vos objectifs...</p>
          </div>
        </div>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
        
        {/* Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
            {notificationMessage}
          </div>
        )}

        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Gamification
            </h1>
            <p className="text-blue-200 text-lg">
              Niveau {displayStats.level} • {displayStats.totalXp} XP • {displayStats.currentStreak} jours de suite
            </p>
            <div className="mt-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
              <p className="text-yellow-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Version temporaire - Système de réclamation avec validation admin en préparation
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Objectifs disponibles</p>
                <p className="text-3xl font-bold text-white">{objectiveStats.available}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">En développement</p>
                <p className="text-3xl font-bold text-yellow-400">Bientôt</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Objectifs complétés</p>
                <p className="text-3xl font-bold text-green-400">{objectiveStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">XP Total</p>
                <p className="text-3xl font-bold text-purple-400">{displayStats.totalXp}</p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex bg-white/10 rounded-xl p-1 mb-8 backdrop-blur-md border border-white/20">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble', icon: Activity },
            { id: 'objectives', label: '🎯 Objectifs (Démo)', icon: Target },
            { id: 'info', label: 'ℹ️ Information', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          
          {/* VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Progression générale */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  Votre progression
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Niveau {displayStats.level}</span>
                      <span className="text-blue-400">{displayStats.totalXp} XP</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" style={{width: `${(displayStats.totalXp % 100)}%`}}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{displayStats.tasksCompleted}</p>
                      <p className="text-gray-400 text-sm">Tâches complétées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-400">{displayStats.currentStreak}</p>
                      <p className="text-gray-400 text-sm">Jours consécutifs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objectifs à réclamer */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-green-400" />
                  Prêts à réclamer (Démo)
                </h3>
                
                {temporaryObjectives.filter(obj => obj.canClaim).length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucun objectif prêt à être réclamé</p>
                    <p className="text-sm text-gray-500 mt-2">Complétez des objectifs pour pouvoir les réclamer !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {temporaryObjectives.filter(obj => obj.canClaim).map((objective) => (
                      <div key={objective.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{objective.icon}</span>
                          <div>
                            <p className="text-white font-medium">{objective.title}</p>
                            <p className="text-green-400 text-sm">+{objective.xpReward} XP</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleClaimReward(objective)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          Réclamer (Démo)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OBJECTIFS DÉMO */}
          {activeTab === 'objectives' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-white">🎯 Objectifs (Version Démo)</h3>
                  <p className="text-gray-400 text-sm mt-1">Système de réclamation avec validation admin en développement</p>
                </div>
              </div>

              <div className="grid gap-6">
                {temporaryObjectives.map((objective) => (
                  <div key={objective.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{objective.icon}</span>
                          <div>
                            <h4 className="text-xl font-semibold text-white">{objective.title}</h4>
                            <p className="text-gray-400">{objective.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-semibold">+{objective.xpReward} XP</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 capitalize">{objective.type === 'daily' ? 'Quotidien' : 'Hebdomadaire'}</span>
                          </div>

                          {objective.badgeReward && (
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400">{objective.badgeReward}</span>
                            </div>
                          )}
                        </div>

                        {/* Barre de progression */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Progression</span>
                            <span className="text-white">{objective.current}/{objective.target}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                              style={{width: `${Math.min(objective.progress, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Bouton d'action */}
                      <div className="ml-6">
                        {objective.isClaimed ? (
                          <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg text-center">
                            ✅ Réclamé (Démo)
                          </div>
                        ) : objective.canClaim ? (
                          <button
                            onClick={() => handleClaimReward(objective)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold shadow-lg"
                          >
                            <Send className="w-5 h-5" />
                            Réclamer (Démo)
                          </button>
                        ) : (
                          <div className="bg-gray-600 text-gray-300 px-6 py-3 rounded-lg text-center">
                            {Math.round(objective.progress)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFORMATIONS */}
          {activeTab === 'info' && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Système de Réclamation en Développement
              </h3>
              
              <div className="space-y-6">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">🚀 Fonctionnalités à venir</h4>
                  <ul className="space-y-2 text-blue-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Réclamation d'objectifs avec preuves
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Validation par les administrateurs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Attribution automatique des XP après validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Historique des réclamations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Système de notifications
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-yellow-300 mb-3">⚠️ Version Temporaire</h4>
                  <p className="text-yellow-100">
                    Cette version affiche une démonstration du système. Le vrai système de réclamation avec validation admin sera déployé prochainement.
                  </p>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-300 mb-3">✅ Fonctionnement Prévu</h4>
                  <ol className="space-y-2 text-green-100 list-decimal list-inside">
                    <li>L'utilisateur complète un objectif</li>
                    <li>L'utilisateur clique sur "Réclamer" et ajoute des preuves</li>
                    <li>Une demande est envoyée aux administrateurs</li>
                    <li>L'administrateur valide ou rejette avec commentaires</li>
                    <li>Les XP sont attribués automatiquement si validé</li>
                    <li>L'utilisateur reçoit une notification du résultat</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutComponent>
  );
};

export default GamificationPage;
