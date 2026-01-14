// ==========================================
// components/skill-tree/modals/SkillDetailModal.jsx
// MODAL DETAIL SKILL
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import { X, Gift, Lock, Check } from 'lucide-react';

const SkillDetailModal = ({ skill, onClose, onChooseTalent, getAvailableTalents, processing }) => {
  if (!skill) return null;

  const tierStatus = [1, 2, 3].map(tier => ({
    tier,
    isUnlocked: skill.level >= tier,
    hasTalent: skill.chosenTalents?.some(t => t.tier === tier),
    isPending: skill.level >= tier && !skill.chosenTalents?.some(t => t.tier === tier)
  }));

  const pendingTier = tierStatus.find(t => t.isPending)?.tier;
  const availableTalents = pendingTier ? getAvailableTalents(skill.id, pendingTier) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
              <span className="text-4xl">{skill.emoji || skill.icon}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{skill.name}</h2>
              <p className="text-sm text-gray-400">Tier {skill.level}/3 - {skill.xp} XP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-6">{skill.description}</p>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progression</span>
            <span>{skill.progressToNext}% vers Tier {Math.min(skill.level + 1, 3)}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.progressToNext}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>

        {/* Tiers */}
        <div className="flex justify-center gap-4 mb-6">
          {tierStatus.map(({ tier, isUnlocked, hasTalent, isPending }) => (
            <div
              key={tier}
              className={`
                relative w-16 h-16 rounded-xl flex flex-col items-center justify-center
                ${isUnlocked
                  ? hasTalent
                    ? 'bg-emerald-500/20 border-2 border-emerald-400/50'
                    : isPending
                      ? 'bg-amber-500/20 border-2 border-amber-400/50 animate-pulse'
                      : 'bg-purple-500/20 border-2 border-purple-400/50'
                  : 'bg-white/5 border border-white/10'
                }
              `}
            >
              {isUnlocked ? (
                hasTalent ? (
                  <Check className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Gift className="w-6 h-6 text-amber-400" />
                )
              ) : (
                <Lock className="w-6 h-6 text-gray-500" />
              )}
              <span className="text-xs text-gray-400 mt-1">T{tier}</span>
            </div>
          ))}
        </div>

        {/* Talents choisis */}
        {skill.chosenTalents?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-emerald-400 uppercase mb-3">Talents Actifs</h4>
            <div className="space-y-2">
              {skill.chosenTalents.map((talent, idx) => (
                <div key={idx} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{talent.emoji}</span>
                    <div>
                      <div className="text-sm font-medium text-emerald-300">{talent.name}</div>
                      <div className="text-xs text-emerald-400/70">{talent.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Choix de talent disponible */}
        {availableTalents.length > 0 && (
          <div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-amber-300">
                <Gift className="w-5 h-5" />
                <span className="font-medium">Choisissez votre talent Tier {pendingTier}!</span>
              </div>
            </div>

            <div className="space-y-3">
              {availableTalents.map((talent, idx) => (
                <motion.button
                  key={talent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onChooseTalent(skill.id, pendingTier, talent.id)}
                  disabled={processing}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl p-4 text-left transition-all disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{talent.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{talent.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">{talent.description}</p>
                      {talent.bonus && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(talent.bonus).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg"
                            >
                              +{typeof value === 'number' ? `${value}%` : value} {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SkillDetailModal;
