// ==========================================
// 📁 components/rewards/sections/RewardCard.jsx
// CARTE RECOMPENSE RESPONSIVE
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Package, Target, Eye, Edit2, Trash2 } from 'lucide-react';

const getRewardColor = (reward) => {
  if (reward.type === 'team') return 'from-purple-600 to-indigo-600';
  const xp = reward.xpCost;
  if (xp <= 100) return 'from-green-600 to-emerald-600';
  if (xp <= 200) return 'from-blue-600 to-cyan-600';
  if (xp <= 400) return 'from-yellow-600 to-orange-600';
  if (xp <= 700) return 'from-red-600 to-pink-600';
  if (xp <= 1000) return 'from-purple-600 to-violet-600';
  if (xp <= 1500) return 'from-indigo-600 to-blue-600';
  if (xp <= 2500) return 'from-pink-600 to-rose-600';
  if (xp <= 4000) return 'from-orange-600 to-red-600';
  if (xp <= 6000) return 'from-violet-600 to-purple-600';
  return 'from-yellow-500 to-amber-500';
};

const RewardCard = ({
  reward,
  canAfford,
  userSpendableXP,
  teamPoolXP,
  wishlistReward,
  onOpenDetail,
  onSetWishlist,
  onRemoveWishlist,
  userIsAdmin,
  onEdit,
  onDelete,
  stockInfo,
  userRedemptionInfo
}) => {
  // Stock checks
  const isOutOfStock = stockInfo?.stockType === 'limited' && (stockInfo?.stockRemaining || 0) <= 0;
  const isLowStock = stockInfo?.stockType === 'limited' && stockInfo?.stockRemaining > 0 && stockInfo?.stockRemaining <= 3;

  // User redemption checks
  const hasAlreadyRedeemed = userRedemptionInfo && !userRedemptionInfo.canRedeem;
  const userRedemptionCount = userRedemptionInfo?.currentCount || 0;
  const userRedemptionLimit = userRedemptionInfo?.limitPerUser || 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden transition-all ${
        canAfford && !isOutOfStock && !hasAlreadyRedeemed ? 'hover:border-purple-500/50' : 'opacity-60'
      }`}
    >
      {/* Header gradient */}
      <div className={`h-1.5 bg-gradient-to-r ${getRewardColor(reward)}`} />

      {/* Badge déjà échangé */}
      {hasAlreadyRedeemed && (
        <div className="absolute top-3 left-3 bg-amber-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <Check className="w-3 h-3" />
          Déjà échangé
        </div>
      )}

      {/* Badge stock épuisé */}
      {isOutOfStock && !hasAlreadyRedeemed && (
        <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <Package className="w-3 h-3" />
          Épuisé
        </div>
      )}

      {/* Badge wishlist */}
      {wishlistReward?.id === reward.id && (
        <div className="absolute top-3 right-3 bg-pink-500/80 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
          <Target className="w-3 h-3" />
          Objectif
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl sm:text-4xl">{reward.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">{reward.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              reward.type === 'team'
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {reward.type === 'team' ? '👥 Equipe' : '👤 Perso'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2">{reward.description}</p>

        {/* Prix et boutons */}
        <div className="space-y-3">
          {/* Prix */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-white">{reward.xpCost.toLocaleString()}</span>
              <span className="text-gray-400 ml-1 text-sm">XP</span>
            </div>
            {!canAfford && reward.type === 'individual' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  wishlistReward?.id === reward.id ? onRemoveWishlist() : onSetWishlist(reward);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  wishlistReward?.id === reward.id
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'bg-white/5 text-gray-400 hover:text-pink-400'
                }`}
              >
                <Target className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Indicateur de stock */}
          {stockInfo?.stockType === 'limited' && (
            <div className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
              isOutOfStock
                ? 'bg-red-500/10 text-red-400'
                : isLowStock
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-white/5 text-gray-400'
            }`}>
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {isOutOfStock ? 'Stock épuisé' : `${stockInfo.stockRemaining} disponible${stockInfo.stockRemaining > 1 ? 's' : ''}`}
              </span>
              {isLowStock && !isOutOfStock && <span className="text-[10px]">⚠️ Limité</span>}
            </div>
          )}

          {/* Bouton principal */}
          <button
            onClick={() => !isOutOfStock && !hasAlreadyRedeemed && onOpenDetail(reward)}
            disabled={isOutOfStock || hasAlreadyRedeemed}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              hasAlreadyRedeemed
                ? 'bg-amber-900/30 text-amber-400 cursor-not-allowed'
                : isOutOfStock
                  ? 'bg-red-900/30 text-red-400 cursor-not-allowed'
                  : canAfford
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-700/50 text-gray-400'
            }`}
          >
            {hasAlreadyRedeemed ? (
              <>
                <Check className="w-4 h-4" />
                Déjà échangé ({userRedemptionCount}/{userRedemptionLimit})
              </>
            ) : isOutOfStock ? (
              <>
                <Package className="w-4 h-4" />
                Stock épuisé
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                {canAfford ? 'Voir & Demander' : 'XP insuffisants'}
              </>
            )}
          </button>

          {/* Actions admin */}
          {userIsAdmin && (
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(reward); }}
                className="flex-1 py-2 bg-white/5 text-gray-300 rounded-lg text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                Modifier
              </button>
              {reward.isFirebase && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(reward); }}
                  className="flex-1 py-2 bg-red-900/30 text-red-400 rounded-lg text-xs hover:bg-red-900/50 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RewardCard;
