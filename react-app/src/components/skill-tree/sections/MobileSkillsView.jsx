// ==========================================
// components/skill-tree/sections/MobileSkillsView.jsx
// VUE LISTE MOBILE-FRIENDLY
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Gift } from 'lucide-react';

const MobileSkillsView = ({ branchesData, onSkillClick, selectedSkill }) => {
  const [expandedBranch, setExpandedBranch] = useState(null);

  return (
    <div className="space-y-3 px-4 pb-24">
      {branchesData.map(({ branchId, branch, skills, config }) => {
        const isExpanded = expandedBranch === branchId;
        const totalXP = skills.reduce((sum, s) => sum + (s?.xp || 0), 0);
        const totalTalents = skills.reduce((sum, s) => sum + (s?.talentsChosen || 0), 0);
        const hasPending = skills.some(s => s?.pendingChoices > 0);

        return (
          <motion.div
            key={branchId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Header de branche */}
            <button
              onClick={() => setExpandedBranch(isExpanded ? null : branchId)}
              className="w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                <span className="text-2xl">{branch.emoji}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{config.label}</h3>
                  {hasPending && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full font-bold animate-pulse">
                      NOUVEAU
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{totalXP} XP</span>
                  <span>-</span>
                  <span>{totalTalents}/{skills.length * 3} talents</span>
                  <span>-</span>
                  <span>{skills.length} skills</span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            {/* Liste des skills */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {skills.map((skill, idx) => {
                      const hasPendingChoice = skill?.pendingChoices > 0;
                      const tierLevel = skill?.level || 0;
                      const progressPercent = skill?.progressToNext || 0;

                      return (
                        <motion.button
                          key={skill?.id || idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => onSkillClick(skill)}
                          className={`w-full p-3 rounded-xl border transition-all text-left ${
                            hasPendingChoice
                              ? 'bg-amber-500/20 border-amber-500/30'
                              : selectedSkill?.id === skill?.id
                                ? 'bg-purple-500/20 border-purple-500/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                              tierLevel >= 3 ? 'bg-purple-500/30' :
                              tierLevel >= 2 ? 'bg-blue-500/30' :
                              tierLevel >= 1 ? 'bg-emerald-500/30' : 'bg-white/10'
                            }`}>
                              {skill?.emoji || '⭐'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-white text-sm truncate">{skill?.name || 'Skill'}</h4>
                                {hasPendingChoice && (
                                  <Gift className="w-4 h-4 text-amber-400 animate-bounce flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      tierLevel >= 3 ? 'bg-purple-500' :
                                      tierLevel >= 2 ? 'bg-blue-500' :
                                      tierLevel >= 1 ? 'bg-emerald-500' : 'bg-gray-500'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400">T{tierLevel}/3</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MobileSkillsView;
