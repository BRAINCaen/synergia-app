// ==========================================
// react-app/src/components/challenges/TeamChallengeCard.jsx
// CARTE DEFI D'EQUIPE - SYNERGIA v4.0
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Users,
  Trophy,
  Clock,
  TrendingUp,
  Plus,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Calendar,
  Award,
  Coins
} from 'lucide-react';

import {
  TEAM_CHALLENGE_TYPES,
  TEAM_CHALLENGE_REWARDS,
  TEAM_CHALLENGE_STATUS
} from '../../core/services/teamChallengeService.js';

const TeamChallengeCard = ({
  challenge,
  onContribute,
  onUpdateValue,
  onApprove,
  onReject,
  onDelete,
  isAdmin = false,
  compact = false
}) => {
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionDesc, setContributionDesc] = useState('');
  const [newValue, setNewValue] = useState(challenge.currentValue || 0);

  const typeInfo = TEAM_CHALLENGE_TYPES[challenge.type] || TEAM_CHALLENGE_TYPES.reputation;
  const rewardInfo = TEAM_CHALLENGE_REWARDS[challenge.rewardLevel] || TEAM_CHALLENGE_REWARDS.medium;
  const statusInfo = TEAM_CHALLENGE_STATUS[challenge.status] || TEAM_CHALLENGE_STATUS.active;

  // Calculer la progression - utiliser floor pour ne pas arrondir à 100% avant d'y être
  const rawProgress = (challenge.currentValue / challenge.targetValue) * 100;
  const progress = challenge.currentValue >= challenge.targetValue
    ? 100
    : Math.min(99, Math.floor(rawProgress)); // Jamais 100% tant que pas atteint
  const isCompleted = challenge.status === 'completed';
  const isActive = challenge.status === 'active';

  // Formater les nombres - plus de précision pour montrer la vraie progression
  const formatNumber = (num, target = null) => {
    // Si on compare avec une cible, montrer plus de détails près de l'objectif
    if (target && num >= 1000 && num < target && (target - num) < 100) {
      // Proche de l'objectif mais pas encore atteint : montrer le nombre exact
      return num.toLocaleString();
    }
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'; // Plus de précision pour les milliers
    return num.toString();
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Soumettre une contribution
  const handleContribute = () => {
    const amount = Number(contributionAmount);
    if (amount > 0 && onContribute) {
      onContribute(challenge.id, amount, contributionDesc);
      setShowContributeModal(false);
      setContributionAmount('');
      setContributionDesc('');
    }
  };

  // Mettre a jour la valeur
  const handleUpdateValue = () => {
    if (onUpdateValue) {
      onUpdateValue(challenge.id, Number(newValue));
      setShowUpdateModal(false);
    }
  };

  // Version compacte
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 ${
          isCompleted ? 'border-green-400/30' : ''
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-2xl flex-shrink-0`}>
            {typeInfo.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white truncate">{challenge.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full rounded-full ${
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}
                />
              </div>
              <span className="text-sm text-gray-400 flex-shrink-0">
                {formatNumber(challenge.currentValue, challenge.targetValue)}/{formatNumber(challenge.targetValue)}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-yellow-400 font-bold">+{challenge.xpReward}</span>
            <span className="text-gray-400 text-sm ml-1">XP</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/10 backdrop-blur-xl border rounded-xl overflow-hidden transition-all hover:shadow-lg ${
          isCompleted
            ? 'border-green-400/50 hover:shadow-green-500/20'
            : 'border-white/20 hover:border-purple-400/50 hover:shadow-purple-500/20'
        }`}
      >
        {/* Header gradient */}
        <div className={`h-2 bg-gradient-to-r ${typeInfo.color}`} />

        <div className="p-6">
          {/* En-tete */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-3xl shadow-lg`}>
                {typeInfo.emoji}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.emoji} {statusInfo.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {rewardInfo.emoji} {rewardInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Badge XP */}
            <div className="bg-yellow-500/20 border border-yellow-400/30 px-3 py-2 rounded-xl text-center">
              <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <span className="text-yellow-400 font-bold text-lg">+{challenge.xpReward}</span>
              <p className="text-yellow-400/70 text-xs">XP Equipe</p>
            </div>
          </div>

          {/* Description */}
          {challenge.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {challenge.description}
            </p>
          )}

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Progression
              </span>
              <span className="text-white font-bold">
                {formatNumber(challenge.currentValue, challenge.targetValue)} / {formatNumber(challenge.targetValue)} {challenge.unit}
              </span>
            </div>

            <div className="relative">
              <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full relative ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                  }`}
                >
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>

              {/* Pourcentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold drop-shadow-lg">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Infos supplementaires */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Contributeurs</p>
                <p className="text-white font-semibold">{challenge.contributorsCount || 0}</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Cree le</p>
                <p className="text-white font-semibold">{formatDate(challenge.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Actions selon le statut */}
          {isActive && !isAdmin && (
            <button
              onClick={() => setShowContributeModal(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              Contribuer
            </button>
          )}

          {isCompleted && (
            <div className="py-3 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">Defi Accompli !</span>
              <span className="text-yellow-400 font-bold">+{challenge.xpReward} XP</span>
            </div>
          )}

          {/* Actions Admin */}
          {isAdmin && (
            <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
              {challenge.status === 'pending_approval' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove && onApprove(challenge.id)}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Raison du rejet:');
                      if (reason && onReject) onReject(challenge.id, reason);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              )}

              {isActive && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewValue(challenge.currentValue);
                      setShowUpdateModal(true);
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modifier valeur
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(challenge.id)}
                    className="py-2 px-4 bg-red-600/50 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal Contribution */}
      <AnimatePresence>
        {showContributeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowContributeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="text-green-400" />
                Contribuer au defi
              </h3>

              <p className="text-gray-400 mb-4">
                Defi: <strong className="text-white">{challenge.title}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Combien ajoutez-vous ? ({challenge.unit})
                </label>
                <input
                  type="number"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder={`Ex: 10`}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  min="1"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Description (optionnel)
                </label>
                <input
                  type="text"
                  value={contributionDesc}
                  onChange={(e) => setContributionDesc(e.target.value)}
                  placeholder="Ex: 5 avis obtenus aujourd'hui"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowContributeModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleContribute}
                  disabled={!contributionAmount || Number(contributionAmount) <= 0}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  Contribuer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Mise a jour valeur (Admin) */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Edit3 className="text-blue-400" />
                Modifier la valeur
              </h3>

              <p className="text-gray-400 mb-4">
                Objectif: <strong className="text-white">{challenge.targetValue} {challenge.unit}</strong>
              </p>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Nouvelle valeur actuelle
                </label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateValue}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium"
                >
                  Mettre a jour
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeamChallengeCard;
