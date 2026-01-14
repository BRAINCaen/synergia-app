// ==========================================
// 📁 components/admin-rewards/modals/UserRedemptionModal.jsx
// MODAL GESTION PAR UTILISATEUR
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, RotateCcw, RefreshCw } from 'lucide-react';

const UserRedemptionModal = ({
  show,
  onClose,
  selectedReward,
  usersWhoRedeemed,
  loadingUsers,
  resettingUser,
  onResetUserRedemption
}) => {
  if (!show || !selectedReward) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        className="bg-slate-800 border border-white/20 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedReward.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{selectedReward.name}</h3>
              <p className="text-gray-400 text-sm">Utilisateurs ayant échangé cette récompense</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info limite */}
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-300">
            🔒 <strong>Limite :</strong> 1 échange par utilisateur. Cliquez sur <RotateCcw className="w-4 h-4 inline mx-1" /> pour remettre la récompense à disposition.
          </p>
        </div>

        {/* Contenu */}
        {loadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-3 text-gray-400">Chargement...</span>
          </div>
        ) : usersWhoRedeemed.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucun utilisateur n'a encore échangé cette récompense</p>
          </div>
        ) : (
          <div className="space-y-3">
            {usersWhoRedeemed.map((userInfo) => (
              <div
                key={userInfo.userId}
                className={`bg-white/5 border rounded-xl p-4 ${
                  userInfo.canRedeem
                    ? 'border-green-500/30'
                    : 'border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {userInfo.userName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{userInfo.userName || 'Utilisateur inconnu'}</p>
                      <p className="text-sm text-gray-400">{userInfo.userEmail}</p>
                      {userInfo.canRedeem ? (
                        <p className="text-xs text-green-400 mt-1">
                          ✓ Peut encore échanger ({userInfo.remainingCount} restant)
                        </p>
                      ) : (
                        <p className="text-xs text-amber-400 mt-1">
                          ⚠️ Limite atteinte ({userInfo.currentCount}/{userInfo.limitPerUser})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bouton reset si l'utilisateur a atteint sa limite */}
                  {!userInfo.canRedeem && (
                    <button
                      onClick={() => onResetUserRedemption(userInfo.userId, selectedReward.id)}
                      disabled={resettingUser === userInfo.userId}
                      className={`p-2 rounded-lg transition-colors ${
                        resettingUser === userInfo.userId
                          ? 'bg-gray-600 cursor-wait'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      title="Remettre à disposition"
                    >
                      {resettingUser === userInfo.userId ? (
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <RotateCcw className="w-5 h-5 text-white" />
                      )}
                    </button>
                  )}
                </div>

                {/* Historique des échanges */}
                {userInfo.redemptions && userInfo.redemptions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-2">Historique :</p>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.redemptions.map((r, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${
                            r.resetByAdmin
                              ? 'bg-gray-500/20 text-gray-400 line-through'
                              : r.status === 'approved'
                                ? 'bg-green-500/20 text-green-400'
                                : r.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {r.status === 'approved' ? '✓' : r.status === 'pending' ? '⏳' : '✗'}
                          {r.resetByAdmin && ' (reset)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserRedemptionModal;
