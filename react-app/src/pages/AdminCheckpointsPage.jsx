// ==========================================
// react-app/src/pages/AdminCheckpointsPage.jsx
// Page admin pour gérer les Checkpoints (Maître de Guilde)
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  Users,
  Clock,
  CheckCircle,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Trophy,
  Brain,
  MessageSquare,
  Target,
  Sparkles,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  Send
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../shared/stores/authStore';
import {
  checkpointService,
  CHECKPOINT_STATUS,
  CHECKPOINT_QUARTERS,
  REFLECTION_QUESTIONS,
  PEER_FEEDBACK_QUESTIONS
} from '../core/services/checkpointService';

const STATUS_CONFIG = {
  [CHECKPOINT_STATUS.DRAFT]: { label: 'Brouillon', color: 'bg-gray-500', textColor: 'text-gray-400' },
  [CHECKPOINT_STATUS.REFLECTION]: { label: 'Réflexion', color: 'bg-blue-500', textColor: 'text-blue-400' },
  [CHECKPOINT_STATUS.FEEDBACK]: { label: 'Feedbacks', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  [CHECKPOINT_STATUS.REVIEW]: { label: 'À valider', color: 'bg-orange-500', textColor: 'text-orange-400' },
  [CHECKPOINT_STATUS.COMPLETED]: { label: 'Terminé', color: 'bg-green-500', textColor: 'text-green-400' },
  [CHECKPOINT_STATUS.CANCELLED]: { label: 'Annulé', color: 'bg-red-500', textColor: 'text-red-400' }
};

const AdminCheckpointsPage = () => {
  const { user } = useAuthStore();
  const [checkpoints, setCheckpoints] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    quarter: '',
    search: ''
  });
  const [expandedId, setExpandedId] = useState(null);

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allCheckpoints, pending, statistics] = await Promise.all([
        checkpointService.getAllCheckpoints(),
        checkpointService.getPendingReviews(),
        checkpointService.getCheckpointStats()
      ]);

      setCheckpoints(allCheckpoints);
      setPendingReviews(pending);
      setStats(statistics);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les checkpoints
  const filteredCheckpoints = checkpoints.filter(cp => {
    if (filters.status && cp.status !== filters.status) return false;
    if (filters.quarter && cp.quarter !== filters.quarter) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return cp.user?.displayName?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Valider un checkpoint
  const handleValidateCheckpoint = async () => {
    if (!selectedCheckpoint) return;

    setIsValidating(true);
    try {
      await checkpointService.completeCheckpoint(
        selectedCheckpoint.id,
        user.uid,
        user.displayName || 'Maître de Guilde',
        managerNotes
      );

      // Recharger les données
      await loadData();
      setShowDetailModal(false);
      setSelectedCheckpoint(null);
      setManagerNotes('');
    } catch (err) {
      console.error('Erreur validation:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // Ouvrir le détail d'un checkpoint
  const openCheckpointDetail = (checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setShowDetailModal(true);
    setManagerNotes(checkpoint.managerReview?.notes || '');
  };

  // État de chargement
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <motion.div
            className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Flag size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestion des Checkpoints</h1>
              <p className="text-gray-400">Maître de Guilde</p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl font-bold text-orange-400">{pendingReviews.length}</div>
              <div className="text-sm text-gray-400">À valider</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl font-bold text-green-400">{stats.byStatus?.[CHECKPOINT_STATUS.COMPLETED] || 0}</div>
              <div className="text-sm text-gray-400">Terminés</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl font-bold text-blue-400">{stats.completionRate}%</div>
              <div className="text-sm text-gray-400">Taux complétion</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="text-3xl font-bold text-yellow-400">{stats.averageXpEarned}</div>
              <div className="text-sm text-gray-400">XP moyen</div>
            </div>
          </motion.div>
        )}

        {/* Checkpoints en attente de validation */}
        {pendingReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl p-6 border border-orange-500/30"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-orange-400" />
              En attente de validation ({pendingReviews.length})
            </h2>

            <div className="space-y-3">
              {pendingReviews.map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    {cp.user?.photoURL ? (
                      <img
                        src={cp.user.photoURL}
                        alt={cp.user.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {cp.user?.displayName?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-white">{cp.user?.displayName}</div>
                      <div className="text-sm text-gray-400">
                        {CHECKPOINT_QUARTERS[cp.quarter]?.label} {cp.year}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openCheckpointDetail(cp)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-white font-medium transition-colors"
                  >
                    <Eye size={18} />
                    Examiner
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-4"
        >
          {/* Recherche */}
          <div className="relative flex-1 min-w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Rechercher un aventurier..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Filtre status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Filtre trimestre */}
          <select
            value={filters.quarter}
            onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">Tous les trimestres</option>
            {Object.entries(CHECKPOINT_QUARTERS).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </motion.div>

        {/* Liste des checkpoints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {filteredCheckpoints.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Flag size={40} className="mx-auto mb-3 opacity-50" />
              <p>Aucun checkpoint trouvé</p>
            </div>
          ) : (
            filteredCheckpoints.map((cp) => {
              const statusConfig = STATUS_CONFIG[cp.status] || STATUS_CONFIG[CHECKPOINT_STATUS.DRAFT];
              const isExpanded = expandedId === cp.id;

              return (
                <motion.div
                  key={cp.id}
                  layout
                  className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : cp.id)}
                  >
                    <div className="flex items-center gap-3">
                      {cp.user?.photoURL ? (
                        <img
                          src={cp.user.photoURL}
                          alt={cp.user.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {cp.user?.displayName?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{cp.user?.displayName}</div>
                        <div className="text-sm text-gray-400">
                          {CHECKPOINT_QUARTERS[cp.quarter]?.label} {cp.year}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}/20 ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>

                      {cp.status === CHECKPOINT_STATUS.COMPLETED && (
                        <span className="text-yellow-400 font-medium">
                          +{cp.xpEarned || 0} XP
                        </span>
                      )}

                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Contenu expandé */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-700/50"
                      >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Récap */}
                          <div className="bg-gray-700/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <Trophy size={16} />
                              Récap trimestre
                            </div>
                            <div className="text-white">
                              {cp.recap?.quests?.total || 0} quêtes, +{cp.recap?.quests?.totalXp || 0} XP
                            </div>
                          </div>

                          {/* Réflexion */}
                          <div className="bg-gray-700/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <Brain size={16} />
                              Auto-réflexion
                            </div>
                            <div className={cp.selfReflection?.completed ? 'text-green-400' : 'text-yellow-400'}>
                              {cp.selfReflection?.completed ? 'Complétée' : 'En cours'}
                            </div>
                          </div>

                          {/* Feedbacks */}
                          <div className="bg-gray-700/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <MessageSquare size={16} />
                              Feedbacks peers
                            </div>
                            <div className="text-white">
                              {cp.peerFeedback?.receivedFeedbacks?.length || 0}/{cp.peerFeedback?.minRequired || 2}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-700/50 flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCheckpointDetail(cp);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                          >
                            <Eye size={16} />
                            Voir détails
                          </button>

                          {cp.status === CHECKPOINT_STATUS.REVIEW && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCheckpointDetail(cp);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 rounded-lg text-white font-medium transition-colors"
                            >
                              <CheckCircle size={16} />
                              Valider
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Modal de détail */}
      <AnimatePresence>
        {showDetailModal && selectedCheckpoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header modal */}
              <div className="sticky top-0 z-10 bg-gray-900 px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedCheckpoint.user?.photoURL ? (
                    <img
                      src={selectedCheckpoint.user.photoURL}
                      alt={selectedCheckpoint.user.displayName}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {selectedCheckpoint.user?.displayName?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedCheckpoint.user?.displayName}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {CHECKPOINT_QUARTERS[selectedCheckpoint.quarter]?.label} {selectedCheckpoint.year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenu modal */}
              <div className="p-6 space-y-6">
                {/* Récap */}
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-400" />
                    Récap du trimestre
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {selectedCheckpoint.recap?.quests?.total || 0}
                      </div>
                      <div className="text-sm text-gray-400">Quêtes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        +{selectedCheckpoint.recap?.quests?.totalXp || 0}
                      </div>
                      <div className="text-sm text-gray-400">XP gagnés</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-400">
                        {selectedCheckpoint.recap?.boosts?.total || 0}
                      </div>
                      <div className="text-sm text-gray-400">Boosts reçus</div>
                    </div>
                  </div>
                </div>

                {/* Auto-réflexion */}
                {selectedCheckpoint.selfReflection?.completed && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Brain size={18} className="text-blue-400" />
                      Auto-réflexion
                    </h3>
                    <div className="space-y-4">
                      {REFLECTION_QUESTIONS.map((question) => {
                        const answer = selectedCheckpoint.selfReflection?.answers?.[question.id];
                        if (!answer) return null;

                        return (
                          <div key={question.id}>
                            <div className="text-sm text-indigo-400 mb-1">{question.question}</div>
                            <p className="text-gray-300 whitespace-pre-wrap">{answer}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feedbacks peers */}
                {selectedCheckpoint.peerFeedback?.receivedFeedbacks?.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageSquare size={18} className="text-pink-400" />
                      Feedbacks peers ({selectedCheckpoint.peerFeedback.receivedFeedbacks.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedCheckpoint.peerFeedback.receivedFeedbacks.map((feedback, index) => (
                        <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                          <div className="font-medium text-white mb-2">{feedback.fromUserName}</div>
                          {PEER_FEEDBACK_QUESTIONS.map((question) => {
                            const answer = feedback.answers?.[question.id];
                            if (!answer) return null;

                            return (
                              <div key={question.id} className="mb-2">
                                <div className="text-xs text-pink-400">{question.question}</div>
                                <p className="text-sm text-gray-300">{answer}</p>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objectifs */}
                {selectedCheckpoint.goals?.items?.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Target size={18} className="text-purple-400" />
                      Objectifs définis ({selectedCheckpoint.goals.items.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedCheckpoint.goals.items.map((goal, index) => (
                        <div key={goal.id || index} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Target size={16} className="text-purple-400" />
                          </div>
                          <div>
                            <div className="text-white">{goal.title}</div>
                            {goal.description && (
                              <div className="text-sm text-gray-400">{goal.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes du manager */}
                {selectedCheckpoint.status === CHECKPOINT_STATUS.REVIEW && (
                  <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-400" />
                      Notes de validation
                    </h3>
                    <textarea
                      value={managerNotes}
                      onChange={(e) => setManagerNotes(e.target.value)}
                      placeholder="Ajoute un commentaire pour l'aventurier (optionnel)..."
                      className="w-full h-24 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                    />
                  </div>
                )}

                {/* Notes du manager si déjà validé */}
                {selectedCheckpoint.status === CHECKPOINT_STATUS.COMPLETED && selectedCheckpoint.managerReview?.notes && (
                  <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-400" />
                      Notes du Maître de Guilde
                    </h3>
                    <p className="text-gray-300">{selectedCheckpoint.managerReview.notes}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Validé par {selectedCheckpoint.managerReview.managerName}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer modal - Actions */}
              {selectedCheckpoint.status === CHECKPOINT_STATUS.REVIEW && (
                <div className="sticky bottom-0 bg-gray-900 px-6 py-4 border-t border-gray-700/50 flex justify-end gap-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleValidateCheckpoint}
                    disabled={isValidating}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                  >
                    {isValidating ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Valider le checkpoint (+100 XP)
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminCheckpointsPage;
