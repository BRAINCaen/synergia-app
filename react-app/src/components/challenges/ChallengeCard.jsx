// ==========================================
// 📁 react-app/src/components/challenges/ChallengeCard.jsx
// CARTE DÉFI PERSONNEL - SYNERGIA v4.0
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Upload,
  Trash2,
  User,
  Calendar,
  Award,
  MoreVertical
} from 'lucide-react';

import {
  CHALLENGE_TYPES,
  CHALLENGE_DIFFICULTY,
  CHALLENGE_STATUS
} from '../../core/services/challengeService.js';

const ChallengeCard = ({
  challenge,
  onSubmitCompletion,
  onDelete,
  isAdmin = false,
  onApprove,
  onReject,
  onValidate,
  compact = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofDescription, setProofDescription] = useState('');

  const typeInfo = CHALLENGE_TYPES[challenge.type] || CHALLENGE_TYPES.competence;
  const difficultyInfo = CHALLENGE_DIFFICULTY[challenge.difficulty] || CHALLENGE_DIFFICULTY.medium;
  const statusInfo = CHALLENGE_STATUS[challenge.status] || CHALLENGE_STATUS.pending_approval;

  // Formater la date
  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Soumettre la preuve de completion
  const handleSubmitProof = () => {
    if (onSubmitCompletion) {
      onSubmitCompletion(challenge.id, {
        description: proofDescription.trim(),
        url: null
      });
      setShowProofModal(false);
      setProofDescription('');
    }
  };

  if (compact) {
    // Version compacte pour les listes
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-700/30 transition-all ${statusInfo.bgColor}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeInfo.emoji}</span>
            <div>
              <h4 className="font-semibold text-white">{challenge.title}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={difficultyInfo.color}>{difficultyInfo.emoji} {difficultyInfo.label}</span>
                <span>•</span>
                <span className={statusInfo.color}>{statusInfo.emoji} {statusInfo.label}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">+{challenge.xpReward} XP</span>
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
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/50 transition-all"
      >
        {/* Header avec gradient selon le type */}
        <div className={`h-2 bg-gradient-to-r ${typeInfo.color}`} />

        <div className="p-6">
          {/* En-tete */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeInfo.color} flex items-center justify-center text-2xl`}>
                {typeInfo.emoji}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color} border border-current/20`}>
                    {statusInfo.emoji} {statusInfo.label}
                  </span>
                  <span className={`text-xs ${difficultyInfo.color}`}>
                    {difficultyInfo.emoji} {difficultyInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu actions */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
              >
                <MoreVertical size={18} />
              </button>

              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10"
                >
                  {challenge.status === 'active' && onSubmitCompletion && (
                    <button
                      onClick={() => {
                        setShowProofModal(true);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-green-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Upload size={16} />
                      Soumettre accomplissement
                    </button>
                  )}

                  {(challenge.status === 'pending_approval' || challenge.status === 'rejected') && onDelete && (
                    <button
                      onClick={() => {
                        onDelete(challenge.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  )}

                  {showActions && !onSubmitCompletion && !onDelete && (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Aucune action disponible
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Description */}
          {challenge.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {challenge.description}
            </p>
          )}

          {/* Infos */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User size={14} />
              <span>{challenge.userName || 'Aventurier'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={14} />
              <span>{formatDate(challenge.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Target size={14} />
              <span>{typeInfo.label}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award size={14} className="text-yellow-400" />
              <span className="text-yellow-400 font-bold">+{challenge.xpReward} XP</span>
            </div>
          </div>

          {/* Raison de rejet si applicable */}
          {challenge.status === 'rejected' && challenge.rejectionReason && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">
                <strong>Raison du rejet:</strong> {challenge.rejectionReason}
              </p>
            </div>
          )}

          {/* Preuve soumise si applicable */}
          {challenge.status === 'pending_validation' && challenge.proofDescription && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4">
              <p className="text-purple-400 text-sm">
                <strong>Preuve soumise:</strong> {challenge.proofDescription}
              </p>
            </div>
          )}

          {/* Actions Admin */}
          {isAdmin && (
            <div className="border-t border-gray-700/50 pt-4 mt-4">
              {challenge.status === 'pending_approval' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove && onApprove(challenge.id)}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Apposer le Sceau
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Raison du rejet:');
                      if (reason && onReject) {
                        onReject(challenge.id, reason);
                      }
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle size={16} />
                    Renvoyer
                  </button>
                </div>
              )}

              {challenge.status === 'pending_validation' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onValidate && onValidate(challenge.id)}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Valider (+{challenge.xpReward} XP)
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Raison du rejet:');
                      if (reason && onReject) {
                        onReject(challenge.id, reason);
                      }
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle size={16} />
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bouton soumission pour utilisateur */}
          {!isAdmin && challenge.status === 'active' && onSubmitCompletion && (
            <button
              onClick={() => setShowProofModal(true)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Upload size={18} />
              J'ai accompli ce defi !
            </button>
          )}

          {/* Badge accompli */}
          {challenge.status === 'completed' && (
            <div className="flex items-center justify-center gap-2 py-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="text-green-400" size={20} />
              <span className="text-green-400 font-bold">Defi accompli !</span>
              <span className="text-yellow-400 font-bold">+{challenge.xpReward} XP</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal preuve */}
      {showProofModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowProofModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="text-green-400" />
              Soumettre l'accomplissement
            </h3>

            <p className="text-gray-400 mb-4">
              Decrivez comment vous avez accompli le defi "<strong className="text-white">{challenge.title}</strong>"
            </p>

            <textarea
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="Decrivez ce que vous avez fait, les resultats obtenus..."
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
              rows={4}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProofModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitProof}
                disabled={!proofDescription.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Soumettre
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ChallengeCard;
