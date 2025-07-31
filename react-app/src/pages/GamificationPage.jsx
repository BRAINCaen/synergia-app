// ==========================================
// 📁 react-app/src/pages/GamificationPage.jsx
// PAGE GAMIFICATION AVEC SYSTÈME DE RÉCLAMATION ET VALIDATION ADMIN
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
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';
import { useObjectives } from '../shared/hooks/useObjectives.js';

/**
 * 🎮 PAGE GAMIFICATION AVEC SYSTÈME DE RÉCLAMATION
 */
const GamificationPage = () => {
  const { user } = useAuth();
  const { gamification, isLoading: dataLoading } = useUnifiedFirebaseData();
  
  // Hook pour objectifs avec système de réclamation
  const { 
    objectives, 
    userClaims,
    loading: objectivesLoading,
    error: objectivesError,
    submitObjectiveClaim,
    refreshData,
    stats: objectiveStats,
    claimStats,
    pendingClaims,
    approvedClaims,
    isSubmittingClaim,
    hasClaimableObjectives,
    hasPendingClaims
  } = useObjectives();

  // États locaux
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [evidenceText, setEvidenceText] = useState('');

  // Données utilisateur avec fallbacks sécurisés
  const displayStats = {
    totalXp: gamification?.totalXp || 0,
    level: gamification?.level || 1,
    weeklyXp: gamification?.weeklyXp || 0,
    tasksCompleted: gamification?.tasksCompleted || 0,
    currentStreak: gamification?.currentStreak || 0
  };

  /**
   * 🎁 OUVRIR LA MODAL DE RÉCLAMATION
   */
  const openClaimModal = (objective) => {
    setSelectedObjective(objective);
    setEvidenceText('');
    setShowClaimModal(true);
  };

  /**
   * 📝 SOUMETTRE UNE RÉCLAMATION D'OBJECTIF
   */
  const handleSubmitClaim = async () => {
    if (!selectedObjective) return;

    try {
      const result = await submitObjectiveClaim(selectedObjective, evidenceText);
      
      if (result.success) {
        setNotificationMessage(`🎯 Réclamation soumise ! ${result.message}`);
        setShowNotification(true);
        setShowClaimModal(false);
        setSelectedObjective(null);
        setEvidenceText('');
        
        // Masquer la notification après 5 secondes
        setTimeout(() => setShowNotification(false), 5000);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      alert(`Erreur lors de la soumission: ${error.message}`);
    }
  };

  /**
   * 🎨 OBTENIR LA COULEUR DU STATUT DE RÉCLAMATION
   */
  const getClaimStatusColor = (objective) => {
    if (objective.isAlreadyClaimed) return 'bg-green-500 text-white';
    if (objective.hasActiveClaim) return 'bg-yellow-500 text-white';
    if (objective.canClaim) return 'bg-blue-500 text-white';
    return 'bg-gray-500 text-white';
  };

  /**
   * 📊 OBTENIR LE TEXTE DU STATUT
   */
  const getStatusText = (objective) => {
    if (objective.isAlreadyClaimed) return '✅ Validé';
    if (objective.hasActiveClaim) return '⏳ En attente';
    if (objective.canClaim) return '🎯 Prêt à réclamer';
    return `${Math.round(objective.progress)}%`;
  };

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const handleRefresh = async () => {
    await refreshData();
    setNotificationMessage('🔄 Données mises à jour !');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Afficher le loading pendant le chargement initial
  if (dataLoading || objectivesLoading) {
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
                <p className="text-yellow-200 text-sm">En attente validation</p>
                <p className="text-3xl font-bold text-yellow-400">{objectiveStats.pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Objectifs validés</p>
                <p className="text-3xl font-bold text-green-400">{objectiveStats.claimed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">XP gagnés (réclamations)</p>
                <p className="text-3xl font-bold text-purple-400">{claimStats?.totalXPEarned || 0}</p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex bg-white/10 rounded-xl p-1 mb-8 backdrop-blur-md border border-white/20">
          {[
            { id: 'overview', label: '📊 Vue d\'ensemble', icon: Activity },
            { id: 'objectives', label: '🎯 Objectifs', icon: Target },
            { id: 'claims', label: '📝 Mes réclamations', icon: MessageSquare },
            { id: 'stats', label: '📈 Statistiques', icon: TrendingUp }
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
                  Prêts à réclamer ({objectiveStats.available})
                </h3>
                
                {objectives.filter(obj => obj.canClaim).length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucun objectif prêt à être réclamé</p>
                    <p className="text-sm text-gray-500 mt-2">Complétez des objectifs pour pouvoir les réclamer !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {objectives.filter(obj => obj.canClaim).slice(0, 3).map((objective) => (
                      <div key={objective.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{objective.icon}</span>
                          <div>
                            <p className="text-white font-medium">{objective.title}</p>
                            <p className="text-green-400 text-sm">+{objective.xpReward} XP</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openClaimModal(objective)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          Réclamer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OBJECTIFS */}
          {activeTab === 'objectives' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-white">🎯 Vos objectifs</h3>
                <div className="text-sm text-gray-400">
                  {objectives.length} objectifs • {objectiveStats.completed} complétés • {objectiveStats.claimed} validés
                </div>
              </div>

              <div className="grid gap-6">
                {objectives.map((objective) => (
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
                            <span className="text-blue-400 capitalize">{objective.type}</span>
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

                        {/* Informations sur la réclamation */}
                        {objective.hasActiveClaim && objective.lastClaim && (
                          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 font-medium">Réclamation en cours de validation</span>
                            </div>
                            <p className="text-sm text-gray-300">
                              Soumise le {new Date(objective.lastClaim.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                            {objective.lastClaim.evidence && (
                              <p className="text-sm text-gray-400 mt-1">
                                💬 {objective.lastClaim.evidence}
                              </p>
                            )}
                          </div>
                        )}

                        {objective.isAlreadyClaimed && objective.lastClaim && (
                          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium">Objectif validé !</span>
                            </div>
                            <p className="text-sm text-gray-300">
                              Validé le {new Date(objective.lastClaim.approvedAt).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-sm text-green-400 font-semibold">
                              +{objective.lastClaim.xpAmount} XP attribués
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bouton d'action */}
                      <div className="ml-6">
                        {objective.isAlreadyClaimed ? (
                          <div className={`px-6 py-3 rounded-lg text-center ${getClaimStatusColor(objective)}`}>
                            ✅ Validé
                          </div>
                        ) : objective.hasActiveClaim ? (
                          <div className={`px-6 py-3 rounded-lg text-center ${getClaimStatusColor(objective)}`}>
                            ⏳ En attente
                          </div>
                        ) : objective.canClaim ? (
                          <button
                            onClick={() => openClaimModal(objective)}
                            disabled={isSubmittingClaim(objective.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold shadow-lg"
                          >
                            {isSubmittingClaim(objective.id) ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Envoi...
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                Réclamer
                              </>
                            )}
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

          {/* MES RÉCLAMATIONS */}
          {activeTab === 'claims' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-white">📝 Mes réclamations</h3>
                <div className="text-sm text-gray-400">
                  {userClaims.length} réclamations • {claimStats?.successRate || 0}% approuvées
                </div>
              </div>

              {userClaims.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-400 mb-2">Aucune réclamation</h4>
                  <p className="text-gray-500">Vous n'avez pas encore soumis de réclamations d'objectifs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userClaims.map((claim) => (
                    <div key={claim.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{claim.objectiveTitle}</h4>
                            
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              claim.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              claim.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {claim.status === 'pending' && '⏳ En attente'}
                              {claim.status === 'approved' && '✅ Approuvée'}
                              {claim.status === 'rejected' && '❌ Rejetée'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span>📅 {new Date(claim.createdAt).toLocaleDateString('fr-FR')}</span>
                            <span>🏆 +{claim.xpAmount} XP</span>
                            <span>🎯 {claim.objectiveCategory}</span>
                          </div>

                          {claim.evidence && (
                            <div className="bg-white/5 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-300">
                                <strong>Preuves fournies:</strong> {claim.evidence}
                              </p>
                            </div>
                          )}

                          {claim.adminNotes && (
                            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                              <p className="text-sm text-blue-300">
                                <strong>Notes de l'administrateur:</strong> {claim.adminNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATISTIQUES */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Statistiques des objectifs */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Objectifs
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-semibold">{objectiveStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Complétés</span>
                    <span className="text-green-400 font-semibold">{objectiveStats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Validés</span>
                    <span className="text-blue-400 font-semibold">{objectiveStats.claimed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taux de réussite</span>
                    <span className="text-purple-400 font-semibold">{objectiveStats.completionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Statistiques des réclamations */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  Réclamations
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total soumises</span>
                    <span className="text-white font-semibold">{claimStats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">En attente</span>
                    <span className="text-yellow-400 font-semibold">{claimStats?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Approuvées</span>
                    <span className="text-green-400 font-semibold">{claimStats?.approved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rejetées</span>
                    <span className="text-red-400 font-semibold">{claimStats?.rejected || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taux d'approbation</span>
                    <span className="text-blue-400 font-semibold">{claimStats?.successRate || 0}%</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-gray-400">XP totaux gagnés</span>
                    <span className="text-purple-400 font-bold">{claimStats?.totalXPEarned || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de réclamation */}
        {showClaimModal && selectedObjective && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Réclamer l'objectif
                  </h2>
                  <button
                    onClick={() => setShowClaimModal(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{selectedObjective.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedObjective.title}</h3>
                      <p className="text-gray-400">{selectedObjective.description}</p>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Récompense</span>
                      <span className="text-green-400 font-bold text-lg">+{selectedObjective.xpReward} XP</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">
                    💬 Preuves ou justifications (optionnel)
                  </label>
                  <textarea
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    placeholder="Décrivez comment vous avez accompli cet objectif, fournissez des détails ou des preuves..."
                    className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Ces informations aideront l'administrateur à valider votre réclamation plus rapidement.
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowClaimModal(false)}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={handleSubmitClaim}
                    disabled={isSubmittingClaim(selectedObjective.id)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingClaim(selectedObjective.id) ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Soumettre la réclamation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
};

export default GamificationPage;
