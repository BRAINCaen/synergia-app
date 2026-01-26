// ==========================================
// react-app/src/components/rewards/TeamRewardVoting.jsx
// COMPOSANT DE VOTE POUR RECOMPENSES EQUIPE
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Users,
  Trophy,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Crown,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import teamRewardVotingService, {
  VOTE_SESSION_STATUS,
  VOTE_THRESHOLDS
} from '../../core/services/teamRewardVotingService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

const TeamRewardVoting = ({
  teamRewards = [],
  teamPoolXP = 0,
  isAdmin = false,
  onRewardApproved
}) => {
  const { user } = useAuthStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger la session active
  useEffect(() => {
    const unsubscribe = teamRewardVotingService.subscribeToActiveSession((activeSession) => {
      setSession(activeSession);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrer les recompenses accessibles avec les XP equipe
  const affordableRewards = teamRewards.filter(r => r.xpCost <= teamPoolXP);

  // Votes de l'utilisateur actuel
  const userVotes = session ? teamRewardVotingService.getUserVotes(session, user?.uid) : [];

  // Classement des recompenses par votes
  const rewardRanking = session ? teamRewardVotingService.getRewardRanking(session) : [];

  // Creer une session de vote
  const handleCreateSession = async () => {
    if (!user) return;

    setLoading(true);
    const result = await teamRewardVotingService.createVoteSession(
      user.uid,
      user.displayName || user.email,
      teamPoolXP
    );

    if (!result.success) {
      alert(result.error);
    }
    setLoading(false);
    setShowCreateModal(false);
  };

  // Voter pour une recompense
  const handleVote = async (rewardId) => {
    if (!session || !user || voting) return;

    setVoting(true);
    const result = await teamRewardVotingService.voteForReward(
      session.id,
      rewardId,
      user.uid,
      user.displayName || user.email
    );

    if (!result.success) {
      alert(result.error);
    }
    setVoting(false);
  };

  // Retirer son vote
  const handleRemoveVote = async (rewardId) => {
    if (!session || !user || voting) return;

    setVoting(true);
    const result = await teamRewardVotingService.removeVote(
      session.id,
      rewardId,
      user.uid
    );

    if (!result.success) {
      alert(result.error);
    }
    setVoting(false);
  };

  // Cloturer la session
  const handleCloseSession = async () => {
    if (!session || !user) return;

    const confirmed = window.confirm(
      'Cloturer le vote et proposer la recompense gagnante a l\'admin ?'
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await teamRewardVotingService.closeSession(
      session.id,
      user.uid,
      user.displayName || user.email
    );

    if (!result.success) {
      alert(result.error);
    }
    setLoading(false);
  };

  // Admin: Approuver
  const handleApprove = async () => {
    if (!session || !user || !isAdmin) return;

    setLoading(true);
    const result = await teamRewardVotingService.approveWinningReward(
      session.id,
      user.uid,
      user.displayName || user.email
    );

    if (result.success && onRewardApproved) {
      onRewardApproved(session.winningRewardId);
    }
    setLoading(false);
  };

  // Admin: Rejeter
  const handleReject = async () => {
    if (!session || !user || !isAdmin) return;

    const reason = window.prompt('Raison du refus (optionnel):');

    setLoading(true);
    await teamRewardVotingService.rejectWinningReward(
      session.id,
      user.uid,
      user.displayName || user.email,
      reason || ''
    );
    setLoading(false);
  };

  // Obtenir les infos d'une recompense
  const getRewardInfo = (rewardId) => {
    return teamRewards.find(r => r.id === rewardId) || { name: 'Recompense', icon: '🎁', xpCost: 0 };
  };

  // Render: Pas de session active
  const renderNoSession = () => (
    <div className="text-center py-8">
      <Vote className="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-white font-semibold mb-2">Pas de vote en cours</h3>
      <p className="text-gray-400 text-sm mb-4">
        Lancez un vote pour decider ensemble quelle recompense equipe utiliser !
      </p>
      {affordableRewards.length > 0 ? (
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Lancer un vote
        </button>
      ) : (
        <p className="text-amber-400 text-sm">
          Pas assez d'XP equipe pour debloquer une recompense
        </p>
      )}
    </div>
  );

  // Render: Session active - Liste des recompenses a voter
  const renderVotingList = () => (
    <div className="space-y-3">
      {affordableRewards.map((reward) => {
        const voteCount = session?.voteCounts?.[reward.id] || 0;
        const hasVoted = userVotes.includes(reward.id);
        const isWinning = rewardRanking[0]?.rewardId === reward.id && voteCount > 0;

        return (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-white/5 border rounded-xl p-4 transition-all ${
              hasVoted
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Badge gagnant */}
            {isWinning && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" />
                En tete
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* Icone */}
              <span className="text-3xl">{reward.icon}</span>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold truncate">{reward.name}</h4>
                <p className="text-gray-400 text-sm">{reward.xpCost.toLocaleString()} XP</p>
              </div>

              {/* Compteur de votes */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                  voteCount > 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-400'
                }`}>
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{voteCount}</span>
                </div>

                {/* Bouton vote */}
                {session?.status === VOTE_SESSION_STATUS.ACTIVE && (
                  <button
                    onClick={() => hasVoted ? handleRemoveVote(reward.id) : handleVote(reward.id)}
                    disabled={voting}
                    className={`p-2 rounded-lg transition-all ${
                      hasVoted
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {voting ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : hasVoted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Vote className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Liste des votants */}
            {session?.votes?.[reward.id]?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-gray-500 text-xs mb-2">Votes:</p>
                <div className="flex flex-wrap gap-1">
                  {session.votes[reward.id].map((vote, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-full"
                    >
                      {vote.odName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  // Render: Session cloturee - En attente validation admin
  const renderClosedSession = () => {
    const winningReward = getRewardInfo(session?.winningRewardId);
    const voteCount = session?.voteCounts?.[session?.winningRewardId] || 0;

    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-4">
          <Clock className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Vote termine !</h3>
        <p className="text-gray-400 text-sm mb-4">En attente de validation admin</p>

        {/* Recompense gagnante */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl">{winningReward.icon}</span>
            <div>
              <h4 className="text-white font-bold text-lg">{winningReward.name}</h4>
              <p className="text-yellow-400">{voteCount} votes - {winningReward.xpCost.toLocaleString()} XP</p>
            </div>
          </div>
        </div>

        {/* Actions admin */}
        {isAdmin && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Approuver
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Refuser
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render: Modal creation session
  const renderCreateModal = () => (
    <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Vote className="w-6 h-6 text-purple-400" />
              Lancer un vote equipe
            </h3>

            <p className="text-gray-400 mb-4">
              Vous allez ouvrir un vote pour que l'equipe decide ensemble quelle recompense utiliser
              avec les <span className="text-purple-400 font-semibold">{teamPoolXP.toLocaleString()} XP</span> disponibles.
            </p>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Recompenses disponibles:</p>
              <div className="space-y-2">
                {affordableRewards.slice(0, 5).map((reward) => (
                  <div key={reward.id} className="flex items-center gap-2 text-white">
                    <span>{reward.icon}</span>
                    <span className="flex-1 truncate">{reward.name}</span>
                    <span className="text-gray-400 text-sm">{reward.xpCost} XP</span>
                  </div>
                ))}
                {affordableRewards.length > 5 && (
                  <p className="text-gray-500 text-sm">+{affordableRewards.length - 5} autres...</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateSession}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Lancer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Vote className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold">Vote recompense equipe</h3>
            <p className="text-gray-400 text-sm">
              {session?.status === VOTE_SESSION_STATUS.ACTIVE
                ? `${session.totalVoters} votant(s) - Choisissez ensemble !`
                : session?.status === VOTE_SESSION_STATUS.CLOSED
                  ? 'En attente de validation'
                  : 'Decidez ensemble comment utiliser les XP equipe'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge XP equipe */}
          <div className="hidden sm:flex items-center gap-1 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">{teamPoolXP.toLocaleString()}</span>
            <span className="text-sm">XP</span>
          </div>

          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 sm:px-5">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !session ? (
                renderNoSession()
              ) : session.status === VOTE_SESSION_STATUS.ACTIVE ? (
                <>
                  {renderVotingList()}

                  {/* Bouton cloturer */}
                  {session.totalVoters >= VOTE_THRESHOLDS.MIN_VOTES_TO_PROPOSE && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <button
                        onClick={handleCloseSession}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Cloturer le vote et proposer
                      </button>
                      <p className="text-gray-500 text-xs text-center mt-2">
                        Minimum {VOTE_THRESHOLDS.MIN_VOTES_TO_PROPOSE} votes atteint !
                      </p>
                    </div>
                  )}

                  {session.totalVoters < VOTE_THRESHOLDS.MIN_VOTES_TO_PROPOSE && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <p className="text-amber-300 text-sm">
                        Encore {VOTE_THRESHOLDS.MIN_VOTES_TO_PROPOSE - session.totalVoters} vote(s) necessaire(s) pour cloturer
                      </p>
                    </div>
                  )}
                </>
              ) : session.status === VOTE_SESSION_STATUS.CLOSED ? (
                renderClosedSession()
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal creation */}
      {renderCreateModal()}
    </div>
  );
};

export default TeamRewardVoting;
