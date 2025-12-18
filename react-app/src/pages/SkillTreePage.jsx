// ==========================================
// react-app/src/pages/SkillTreePage.jsx
// PAGE SKILL TREE - SYNERGIA v4.0
// Module Skill Tree: Arbre de competences
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Lock, Check, ChevronRight, Star, Sparkles,
  TrendingUp, Award, X, Info
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useSkillTree } from '../shared/hooks/useSkillTree.js';

// ==========================================
// COMPOSANT SKILL NODE
// ==========================================

const SkillNode = ({ skill, status, onUnlock, unlocking, checkResult }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const statusStyles = {
    unlocked: {
      bg: 'bg-gradient-to-br from-emerald-500/30 to-green-600/30',
      border: 'border-emerald-400/50',
      icon: <Check className="w-5 h-5 text-emerald-400" />,
      glow: 'shadow-emerald-500/30'
    },
    available: {
      bg: 'bg-gradient-to-br from-blue-500/30 to-purple-600/30',
      border: 'border-blue-400/50 animate-pulse',
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      glow: 'shadow-blue-500/40'
    },
    needs_points: {
      bg: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
      border: 'border-amber-400/30',
      icon: <Star className="w-5 h-5 text-amber-400" />,
      glow: 'shadow-amber-500/20'
    },
    locked: {
      bg: 'bg-white/5',
      border: 'border-white/10',
      icon: <Lock className="w-5 h-5 text-gray-500" />,
      glow: ''
    }
  };

  const style = statusStyles[status] || statusStyles.locked;
  const canClick = status === 'available';

  return (
    <div className="relative">
      <motion.button
        onClick={() => canClick && onUnlock(skill.id)}
        disabled={!canClick || unlocking}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={canClick ? { scale: 1.05 } : {}}
        whileTap={canClick ? { scale: 0.95 } : {}}
        className={`
          relative w-20 h-20 rounded-2xl border-2 ${style.bg} ${style.border}
          flex flex-col items-center justify-center gap-1
          transition-all duration-300 cursor-pointer
          ${canClick ? 'hover:shadow-lg ' + style.glow : ''}
          ${status === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}
          disabled:opacity-50
        `}
      >
        <span className="text-2xl">{skill.emoji}</span>
        <span className="text-xs text-white/70 font-medium text-center leading-tight px-1 truncate w-full">
          {skill.name}
        </span>

        {/* Badge statut */}
        <div className="absolute -top-2 -right-2">
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${status === 'unlocked' ? 'bg-emerald-500' : ''}
            ${status === 'available' ? 'bg-blue-500' : ''}
            ${status === 'needs_points' ? 'bg-amber-500' : ''}
            ${status === 'locked' ? 'bg-gray-600' : ''}
          `}>
            {style.icon}
          </div>
        </div>

        {/* Badge cout */}
        {status !== 'unlocked' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 px-2 py-0.5 rounded-full">
            <span className="text-xs font-bold text-white">{skill.cost}pt</span>
          </div>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64"
          >
            <div className="bg-slate-800 border border-white/10 rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{skill.emoji}</span>
                <div>
                  <h4 className="font-bold text-white">{skill.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    status === 'unlocked' ? 'bg-emerald-500/20 text-emerald-400' :
                    status === 'available' ? 'bg-blue-500/20 text-blue-400' :
                    status === 'needs_points' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    Tier {skill.tier}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-2">{skill.description}</p>

              <div className="bg-white/5 rounded-lg p-2 mb-2">
                <p className="text-xs text-purple-300">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  {skill.effect}
                </p>
              </div>

              {status !== 'unlocked' && checkResult && !checkResult.canUnlock && (
                <p className="text-xs text-red-400">
                  <Lock className="w-3 h-3 inline mr-1" />
                  {checkResult.reason}
                </p>
              )}

              {status === 'available' && (
                <p className="text-xs text-blue-400 mt-2">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Cliquez pour debloquer!
                </p>
              )}

              {/* Arrow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                <div className="w-3 h-3 bg-slate-800 border-r border-b border-white/10 transform rotate-45 -translate-y-1.5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// COMPOSANT BRANCH TREE
// ==========================================

const BranchTree = ({ branch, skills, onUnlock, unlocking }) => {
  // Organiser par tier
  const skillsByTier = useMemo(() => {
    const tiers = { 1: [], 2: [], 3: [] };
    skills.forEach(skill => {
      if (tiers[skill.tier]) {
        tiers[skill.tier].push(skill);
      }
    });
    return tiers;
  }, [skills]);

  // Calculer la progression
  const progress = useMemo(() => {
    const unlocked = skills.filter(s => s.status === 'unlocked').length;
    return Math.round((unlocked / skills.length) * 100);
  }, [skills]);

  const branchInfo = {
    productivity: { gradient: 'from-yellow-500 to-orange-500' },
    teamwork: { gradient: 'from-blue-500 to-cyan-500' },
    leadership: { gradient: 'from-purple-500 to-pink-500' },
    mastery: { gradient: 'from-emerald-500 to-teal-500' },
    innovation: { gradient: 'from-rose-500 to-red-500' }
  };

  const gradient = branchInfo[branch.id]?.gradient || 'from-gray-500 to-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header de la branche */}
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{branch.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{branch.name}</h3>
              <p className="text-sm text-white/70">{branch.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{progress}%</div>
            <div className="text-xs text-white/70">Progression</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-white/50 rounded-full"
          />
        </div>
      </div>

      {/* Arbre des competences */}
      <div className="p-6">
        <div className="flex flex-col items-center gap-8">
          {/* Tier 3 - Maitre */}
          {skillsByTier[3].length > 0 && (
            <div className="flex flex-col items-center">
              <div className="text-xs text-amber-400 font-bold mb-2 flex items-center gap-1">
                <Award className="w-3 h-3" /> MAITRE
              </div>
              <div className="flex gap-4">
                {skillsByTier[3].map(skill => (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    status={skill.status}
                    checkResult={skill.checkResult}
                    onUnlock={onUnlock}
                    unlocking={unlocking}
                  />
                ))}
              </div>
              {/* Connecteur */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-amber-500/50 to-transparent" />
            </div>
          )}

          {/* Tier 2 - Avance */}
          {skillsByTier[2].length > 0 && (
            <div className="flex flex-col items-center">
              <div className="text-xs text-purple-400 font-bold mb-2">AVANCE</div>
              <div className="flex gap-4">
                {skillsByTier[2].map(skill => (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    status={skill.status}
                    checkResult={skill.checkResult}
                    onUnlock={onUnlock}
                    unlocking={unlocking}
                  />
                ))}
              </div>
              {/* Connecteurs */}
              <div className="flex gap-12 mt-2">
                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-transparent" />
                <div className="w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-transparent" />
              </div>
            </div>
          )}

          {/* Tier 1 - Base */}
          {skillsByTier[1].length > 0 && (
            <div className="flex flex-col items-center">
              <div className="text-xs text-blue-400 font-bold mb-2">BASE</div>
              <div className="flex gap-4">
                {skillsByTier[1].map(skill => (
                  <SkillNode
                    key={skill.id}
                    skill={skill}
                    status={skill.status}
                    checkResult={skill.checkResult}
                    onUnlock={onUnlock}
                    unlocking={unlocking}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// MODAL DE DEBLOCAGE
// ==========================================

const UnlockModal = ({ skill, onClose }) => {
  if (!skill) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 20 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/20 p-8 max-w-md w-full text-center"
          onClick={e => e.stopPropagation()}
        >
          {/* Animation celebratoire */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="relative inline-block mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-5xl">{skill.emoji}</span>
            </div>

            {/* Particules */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * Math.PI / 4) * 60,
                  y: Math.sin(i * Math.PI / 4) * 60
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-yellow-400 rounded-full"
              />
            ))}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Competence Debloquee!
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-purple-300 mb-4"
          >
            {skill.name}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300 mb-6"
          >
            {skill.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-emerald-300 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {skill.effect}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Genial!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================

const SkillTreePage = () => {
  const {
    loading,
    unlocking,
    unlockedSkills,
    availablePoints,
    userLevel,
    globalStats,
    unlockSkill,
    getBranchSkillsWithStatus,
    SKILL_BRANCHES
  } = useSkillTree();

  const [selectedBranch, setSelectedBranch] = useState('productivity');
  const [unlockModal, setUnlockModal] = useState(null);

  // Obtenir les competences de la branche selectionnee
  const branchSkills = useMemo(() => {
    return getBranchSkillsWithStatus(selectedBranch);
  }, [selectedBranch, getBranchSkillsWithStatus]);

  // Handler de deblocage
  const handleUnlock = async (skillId) => {
    const result = await unlockSkill(skillId);
    if (result.success) {
      setUnlockModal(result.skill);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement de l'arbre de competences...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              🌳 Arbre de Competences
            </h1>
            <p className="text-gray-400">
              Developpez vos capacites et debloquez des bonus
            </p>
          </motion.div>

          {/* Stats Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 text-center"
            >
              <div className="text-3xl font-bold text-purple-400">{availablePoints}</div>
              <div className="text-sm text-gray-400">Points Disponibles</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 text-center"
            >
              <div className="text-3xl font-bold text-blue-400">{userLevel}</div>
              <div className="text-sm text-gray-400">Niveau</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 text-center"
            >
              <div className="text-3xl font-bold text-emerald-400">
                {globalStats.unlockedCount}/{globalStats.totalSkills}
              </div>
              <div className="text-sm text-gray-400">Competences</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-4 text-center"
            >
              <div className="text-3xl font-bold text-amber-400">+{globalStats.totalXPBonus}%</div>
              <div className="text-sm text-gray-400">Bonus XP Total</div>
            </motion.div>
          </div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <span className="font-bold">Comment ca marche:</span> Vous gagnez 1 point de competence par niveau.
              Debloquez les competences de base pour acceder aux competences avancees.
              Chaque competence debloquee vous donne un bonus XP permanent!
            </div>
          </motion.div>

          {/* Navigation des branches */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {Object.values(SKILL_BRANCHES).map((branch, index) => {
              const progress = globalStats.branchStats[branch.id];
              const isSelected = selectedBranch === branch.id;

              return (
                <motion.button
                  key={branch.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setSelectedBranch(branch.id)}
                  className={`
                    px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2
                    ${isSelected
                      ? `bg-gradient-to-r ${branch.color} text-white shadow-lg`
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }
                  `}
                >
                  <span className="text-xl">{branch.emoji}</span>
                  <span>{branch.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {progress?.unlocked || 0}/{progress?.total || 0}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Arbre de la branche selectionnee */}
          <BranchTree
            branch={SKILL_BRANCHES[selectedBranch]}
            skills={branchSkills}
            onUnlock={handleUnlock}
            unlocking={unlocking}
          />

          {/* Legende */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-4 justify-center text-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <span className="text-gray-400">Debloquee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-gray-400">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500" />
              <span className="text-gray-400">Points insuffisants</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-600" />
              <span className="text-gray-400">Verrouillee</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Modal de deblocage */}
      {unlockModal && (
        <UnlockModal
          skill={unlockModal}
          onClose={() => setUnlockModal(null)}
        />
      )}
    </Layout>
  );
};

export default SkillTreePage;
