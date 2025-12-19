// ==========================================
// 📁 react-app/src/components/shop/RewardDetailModal.jsx
// MODAL DÉTAILS RÉCOMPENSE - SYNERGIA v4.0 - MODULE 5
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ShoppingCart, Users, User, Zap, Trophy, Star,
  TrendingUp, Clock, Check, AlertCircle, Sparkles
} from 'lucide-react';

/**
 * 🎁 MODAL DÉTAILS RÉCOMPENSE
 * Affiche les détails complets d'une récompense avec option d'achat
 */
const RewardDetailModal = ({
  isOpen,
  onClose,
  reward,
  userSpendableXP = 0,
  userTotalXP = 0,
  teamPoolXP = 0,
  onPurchase,
  isPurchasing = false
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen || !reward) return null;

  const isTeamReward = reward.type === 'team';
  const availableXP = isTeamReward ? teamPoolXP : userSpendableXP;
  const canAfford = availableXP >= reward.xpCost;
  const missingXP = canAfford ? 0 : reward.xpCost - availableXP;
  const progressPercent = Math.min((availableXP / reward.xpCost) * 100, 100);

  const handlePurchaseClick = () => {
    if (canAfford) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmPurchase = () => {
    setShowConfirmation(false);
    onPurchase?.(reward);
  };

  // Couleur basée sur le coût
  const getGradientColor = () => {
    if (isTeamReward) return 'from-purple-600 to-indigo-600';
    const xp = reward.xpCost;
    if (xp <= 100) return 'from-green-600 to-emerald-600';
    if (xp <= 500) return 'from-blue-600 to-cyan-600';
    if (xp <= 1000) return 'from-yellow-600 to-orange-600';
    if (xp <= 2500) return 'from-red-600 to-pink-600';
    if (xp <= 5000) return 'from-purple-600 to-violet-600';
    return 'from-amber-500 to-yellow-500';
  };

  // Catégorie de rareté
  const getRarity = () => {
    const xp = reward.xpCost;
    if (xp <= 100) return { name: 'Commun', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    if (xp <= 500) return { name: 'Peu commun', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (xp <= 1000) return { name: 'Rare', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (xp <= 2500) return { name: 'Épique', color: 'text-purple-400', bg: 'bg-purple-500/20' };
    if (xp <= 5000) return { name: 'Légendaire', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { name: 'Mythique', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  };

  const rarity = getRarity();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec gradient */}
          <div className={`relative h-40 bg-gradient-to-br ${getGradientColor()} flex items-center justify-center`}>
            {/* Effet particules */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white/30"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * -50 - 20]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    bottom: '30%'
                  }}
                />
              ))}
            </div>

            {/* Icône principale */}
            <motion.span
              className="text-8xl filter drop-shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              {reward.icon}
            </motion.span>

            {/* Badge type */}
            <div className={`absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              isTeamReward ? 'bg-purple-500/30 text-purple-200' : 'bg-blue-500/30 text-blue-200'
            }`}>
              {isTeamReward ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isTeamReward ? 'Équipe' : 'Individuelle'}
            </div>

            {/* Badge rareté */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${rarity.bg} ${rarity.color}`}>
              <Sparkles className="w-3 h-3 inline mr-1" />
              {rarity.name}
            </div>

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute bottom-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {/* Titre et description */}
            <h2 className="text-2xl font-bold text-white mb-2">{reward.name}</h2>
            <p className="text-gray-400 mb-6">{reward.description}</p>

            {/* Catégorie */}
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                {reward.category}
              </span>
            </div>

            {/* Coût et progression */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400">Coût</span>
                </div>
                <span className="text-2xl font-bold text-white">
                  {reward.xpCost.toLocaleString()} <span className="text-sm text-gray-400">XP</span>
                </span>
              </div>

              {/* Barre de progression */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">
                    {isTeamReward ? 'Pool équipe' : 'XP dépensables'}
                  </span>
                  <span className={canAfford ? 'text-green-400' : 'text-gray-400'}>
                    {availableXP.toLocaleString()} / {reward.xpCost.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${canAfford ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Message selon état */}
              {canAfford ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Vous pouvez obtenir cette récompense !</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Il vous manque <strong>{missingXP.toLocaleString()}</strong> XP</span>
                </div>
              )}
            </div>

            {/* Info XP Prestige pour récompenses individuelles */}
            {!isTeamReward && (
              <div className="flex items-start gap-2 text-sm text-gray-500 mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>
                  Vos <strong className="text-yellow-400">{userTotalXP.toLocaleString()} XP de prestige</strong> restent intacts pour les classements et niveaux.
                </span>
              </div>
            )}

            {/* Bouton d'achat */}
            {!showConfirmation ? (
              <button
                onClick={handlePurchaseClick}
                disabled={!canAfford || isPurchasing}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  canAfford && !isPurchasing
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isPurchasing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : canAfford ? (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Demander cette récompense
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    XP insuffisants
                  </>
                )}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-center text-white font-semibold">
                  Confirmer la demande de <span className="text-yellow-400">{reward.name}</span> ?
                </p>
                <p className="text-center text-sm text-gray-400">
                  {reward.xpCost.toLocaleString()} XP seront déduits après validation admin.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Confirmer
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RewardDetailModal;
