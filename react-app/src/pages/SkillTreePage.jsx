// ==========================================
// react-app/src/pages/SkillTreePage.jsx
// PAGE SKILL TREE RPG - SYNERGIA v5.0
// Interface RPG avec choix de talents
// ==========================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Star, Sparkles, ChevronRight, ChevronLeft,
  TrendingUp, Award, X, Info, Gift, Crown, Shield,
  Target, Users, Lightbulb, MessageCircle, Briefcase,
  BookOpen, Palette, AlertCircle
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useSkillTree } from '../shared/hooks/useSkillTree.js';

// ==========================================
// COMPOSANT PROGRESS BAR RPG
// ==========================================

const RPGProgressBar = ({ current, max, color = 'purple', showText = true, height = 'h-3' }) => {
  const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;

  const colorStyles = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-500'
  };

  return (
    <div className="relative">
      <div className={`${height} bg-black/50 rounded-full overflow-hidden border border-white/10`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colorStyles[color]} rounded-full`}
        />
      </div>
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {current} / {max} XP
          </span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPOSANT TIER BADGE
// ==========================================

const TierBadge = ({ tier, isUnlocked, hasTalent, isPending, onClick }) => {
  const tierStyles = {
    1: { color: 'blue', icon: Shield, name: 'Initié' },
    2: { color: 'purple', icon: Star, name: 'Expert' },
    3: { color: 'amber', icon: Crown, name: 'Maître' }
  };

  const style = tierStyles[tier];
  const Icon = style.icon;

  return (
    <motion.button
      whileHover={isPending ? { scale: 1.1 } : {}}
      whileTap={isPending ? { scale: 0.95 } : {}}
      onClick={isPending ? onClick : undefined}
      className={`
        relative w-12 h-12 rounded-xl flex items-center justify-center
        transition-all duration-300
        ${isUnlocked
          ? hasTalent
            ? 'bg-gradient-to-br from-emerald-500/30 to-green-600/30 border-2 border-emerald-400/50'
            : 'bg-gradient-to-br from-amber-500/30 to-orange-600/30 border-2 border-amber-400/50 animate-pulse'
          : 'bg-white/5 border border-white/10 opacity-50'
        }
        ${isPending ? 'cursor-pointer ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''}
      `}
    >
      <Icon className={`w-6 h-6 ${
        isUnlocked
          ? hasTalent ? 'text-emerald-400' : 'text-amber-400'
          : 'text-gray-500'
      }`} />

      {/* Badge tier number */}
      <div className={`
        absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold
        flex items-center justify-center
        ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-gray-300'}
      `}>
        {tier}
      </div>

      {/* Indicateur choix disponible */}
      {isPending && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2"
        >
          <Gift className="w-4 h-4 text-amber-400" />
        </motion.div>
      )}
    </motion.button>
  );
};

// ==========================================
// COMPOSANT SKILL CARD RPG
// ==========================================

const SkillCardRPG = ({ skill, onOpenTalentChoice }) => {
  const [expanded, setExpanded] = useState(false);

  if (!skill) return null;

  const { xp, level, progressToNext, nextTierXP, pendingChoices, chosenTalents, isMaxed } = skill;

  // Détermine les tiers débloqués et les talents choisis
  const tierStatus = [1, 2, 3].map(tier => ({
    tier,
    isUnlocked: level >= tier,
    hasTalent: chosenTalents.some(t => t.tier === tier),
    isPending: level >= tier && !chosenTalents.some(t => t.tier === tier)
  }));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white/5 backdrop-blur-lg rounded-2xl border overflow-hidden
        ${pendingChoices > 0
          ? 'border-amber-400/50 shadow-lg shadow-amber-500/20'
          : 'border-white/10'
        }
      `}
    >
      {/* Header du skill */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {/* Emoji et nom */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <span className="text-3xl">{skill.emoji}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white truncate">{skill.name}</h3>
              {pendingChoices > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full animate-pulse">
                  {pendingChoices} talent{pendingChoices > 1 ? 's' : ''} à choisir!
                </span>
              )}
              {isMaxed && (
                <Crown className="w-4 h-4 text-amber-400" />
              )}
            </div>

            {/* Barre de progression */}
            <div className="mt-2">
              <RPGProgressBar
                current={xp}
                max={nextTierXP || 1000}
                color={isMaxed ? 'green' : 'purple'}
                height="h-4"
              />
            </div>

            {/* Info niveau */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                Tier {level}/3
              </span>
              <span className="text-xs text-purple-400">
                {progressToNext}% vers tier {Math.min(level + 1, 3)}
              </span>
            </div>
          </div>

          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Contenu étendu */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-300">{skill.description}</p>

              {/* Tiers */}
              <div className="flex items-center justify-center gap-4">
                {tierStatus.map(({ tier, isUnlocked, hasTalent, isPending }) => (
                  <TierBadge
                    key={tier}
                    tier={tier}
                    isUnlocked={isUnlocked}
                    hasTalent={hasTalent}
                    isPending={isPending}
                    onClick={() => isPending && onOpenTalentChoice(skill, tier)}
                  />
                ))}
              </div>

              {/* Talents choisis */}
              {chosenTalents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase">Talents Actifs</h4>
                  {chosenTalents.map((talent, idx) => (
                    <div key={idx} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
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
              )}

              {/* Bouton choisir talent si disponible */}
              {pendingChoices > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onOpenTalentChoice(skill, tierStatus.find(t => t.isPending)?.tier)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Gift className="w-5 h-5" />
                  Choisir un Talent!
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT BRANCH CARD
// ==========================================

const BranchCard = ({ branch, stats, onClick, hasUnspentPoints }) => {
  const branchIcons = {
    relationnel: Users,
    technique: Target,
    communication: MessageCircle,
    organisation: Briefcase,
    creativite: Palette,
    pedagogie: BookOpen,
    commercial: TrendingUp
  };

  const Icon = branchIcons[branch.id] || Star;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative bg-white/5 backdrop-blur-lg rounded-2xl border p-6 text-left
        transition-all duration-300 overflow-hidden group
        ${hasUnspentPoints
          ? 'border-amber-400/50 shadow-lg shadow-amber-500/20'
          : 'border-white/10 hover:border-white/30'
        }
      `}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${branch.gradient || 'from-purple-500/10 to-pink-500/10'} opacity-0 group-hover:opacity-100 transition-opacity`} />

      {/* Indicateur points à dépenser */}
      {hasUnspentPoints && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute top-3 right-3"
        >
          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      )}

      <div className="relative">
        {/* Icon et titre */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${branch.gradient || 'from-purple-500/30 to-pink-500/30'} flex items-center justify-center`}>
            <span className="text-2xl">{branch.emoji}</span>
          </div>
          <div>
            <h3 className="font-bold text-white">{branch.name}</h3>
            <p className="text-xs text-gray-400">{branch.skills?.length || 4} compétences</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-400">{stats?.totalXP || 0}</div>
            <div className="text-xs text-gray-400">XP Total</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-emerald-400">{stats?.talentsChosen || 0}/12</div>
            <div className="text-xs text-gray-400">Talents</div>
          </div>
        </div>

        {/* Progression */}
        <RPGProgressBar
          current={stats?.talentsChosen || 0}
          max={12}
          color="green"
          showText={false}
          height="h-2"
        />
        <div className="text-xs text-gray-400 text-center mt-1">
          {Math.round((stats?.talentsChosen || 0) / 12 * 100)}% maîtrisée
        </div>
      </div>
    </motion.button>
  );
};

// ==========================================
// MODAL CHOIX DE TALENT
// ==========================================

const TalentChoiceModal = ({ skill, tier, talents, onChoose, onClose, processing }) => {
  const tierNames = {
    1: 'Initié',
    2: 'Expert',
    3: 'Maître'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center shrink-0">
              <span className="text-2xl sm:text-3xl">{skill?.emoji}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">{skill?.name}</h2>
              <p className="text-xs sm:text-sm text-amber-400">Tier {tier} - {tierNames[tier]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Message */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-amber-300 text-sm sm:text-base">
            <Gift className="w-5 h-5" />
            <span className="font-medium">Choisissez votre talent!</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-200/70 mt-1">
            Ce choix est définitif.
          </p>
        </div>

        {/* Options de talents */}
        <div className="space-y-3">
          {talents.map((talent, idx) => (
            <motion.button
              key={talent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChoose(talent.id)}
              disabled={processing}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl p-3 sm:p-4 text-left transition-all disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl">{talent.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm sm:text-base">{talent.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">{talent.description}</p>

                  {/* Bonus */}
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                    {Object.entries(talent.bonus || {}).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs rounded-lg"
                      >
                        +{value}% {key.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// MODAL SUCCÈS TALENT
// ==========================================

const TalentSuccessModal = ({ talent, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6 sm:p-8 max-w-md w-full text-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Animation celebratoire */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="relative inline-block mb-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-5xl">{talent?.emoji}</span>
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
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-400 rounded-full"
            />
          ))}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Nouveau Talent!
        </motion.h2>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-emerald-300 mb-4"
        >
          {talent?.name}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 mb-6"
        >
          {talent?.description}
        </motion.p>

        {/* Bonus acquis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 mb-6"
        >
          <p className="text-xs text-emerald-400 uppercase font-bold mb-2">Bonus Activés</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(talent?.bonus || {}).map(([key, value]) => (
              <span
                key={key}
                className="px-3 py-1 bg-emerald-500/30 text-emerald-300 text-sm rounded-full"
              >
                +{value}% {key.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onClose}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Génial!
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================

const SkillTreePage = () => {
  const {
    loading,
    processing,
    userSkills,
    totalUnspentPoints,
    activeBonus,
    branchStats,
    globalStats,
    chooseTalent,
    getSkillInfo,
    getBranchSkills,
    getAvailableTalents,
    lastTalentChoice,
    SKILL_BRANCHES
  } = useSkillTree();

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [talentModal, setTalentModal] = useState(null); // { skill, tier }
  const [successModal, setSuccessModal] = useState(null);

  // Obtenir les skills de la branche sélectionnée
  const branchSkills = useMemo(() => {
    if (!selectedBranch) return [];
    return getBranchSkills(selectedBranch);
  }, [selectedBranch, getBranchSkills]);

  // Vérifier si une branche a des points non dépensés
  const branchHasUnspentPoints = (branchId) => {
    const branch = SKILL_BRANCHES[branchId];
    if (!branch) return false;

    return branch.skills.some(skillId => {
      const info = getSkillInfo(skillId);
      return info && info.pendingChoices > 0;
    });
  };

  // Ouvrir le modal de choix de talent
  const openTalentChoice = (skill, tier) => {
    const talents = getAvailableTalents(skill.id, tier);
    if (talents.length > 0) {
      setTalentModal({ skill, tier, talents });
    }
  };

  // Choisir un talent
  const handleChooseTalent = async (talentId) => {
    if (!talentModal) return;

    const result = await chooseTalent(talentModal.skill.id, talentModal.tier, talentId);

    if (result.success) {
      setTalentModal(null);
      setSuccessModal(result.talent);
    }
  };

  // Fermer le modal de succès
  const closeSuccessModal = () => {
    setSuccessModal(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
          {/* Animated background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Chargement de l'arbre de compétences...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 sm:pb-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Arbre de Compétences
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Progressez via les quêtes et choisissez vos talents
            </p>
          </motion.div>

          {/* Alerte talents à choisir */}
          {totalUnspentPoints > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-amber-300 text-sm sm:text-base">
                  {totalUnspentPoints} talent{totalUnspentPoints > 1 ? 's' : ''} à choisir!
                </h3>
                <p className="text-xs sm:text-sm text-amber-200/70">
                  Sélectionnez vos bonus!
                </p>
              </div>
            </motion.div>
          )}

          {/* Stats Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">{globalStats.totalXP}</div>
              <div className="text-xs sm:text-sm text-gray-400">XP Total</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
                {globalStats.totalTalents}/{globalStats.maxTalents}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Talents</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                {globalStats.skillsStarted}/{globalStats.totalSkills}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Skills</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">
                +{Object.values(activeBonus).reduce((a, b) => a + b, 0)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-400">Bonus</div>
            </motion.div>
          </div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6 sm:mb-8 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-gray-300">
              <span className="font-bold text-blue-400">Comment ça marche:</span> Complétez des quêtes pour gagner de l'XP.
              À chaque palier (100, 400, 1000 XP), choisissez un talent. Les bonus s'accumulent!
            </div>
          </motion.div>

          {/* Vue branche sélectionnée ou liste des branches */}
          <AnimatePresence mode="wait">
            {selectedBranch ? (
              /* Vue détaillée d'une branche */
              <motion.div
                key="branch-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Header branche */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6">
                  <button
                    onClick={() => setSelectedBranch(null)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl sm:text-3xl">{SKILL_BRANCHES[selectedBranch]?.emoji}</span>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                        {SKILL_BRANCHES[selectedBranch]?.name}
                      </h2>
                      <p className="text-gray-400 text-xs sm:text-base truncate">
                        {SKILL_BRANCHES[selectedBranch]?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liste des skills de la branche */}
                <div className="grid gap-4 md:grid-cols-2">
                  {branchSkills.map(skill => (
                    <SkillCardRPG
                      key={skill.id}
                      skill={skill}
                      onOpenTalentChoice={openTalentChoice}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Liste des branches */
              <motion.div
                key="branch-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Branches de Compétences</h2>
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Object.entries(SKILL_BRANCHES).map(([branchId, branch], index) => (
                    <motion.div
                      key={branchId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BranchCard
                        branch={{ ...branch, id: branchId }}
                        stats={branchStats[branchId]}
                        onClick={() => setSelectedBranch(branchId)}
                        hasUnspentPoints={branchHasUnspentPoints(branchId)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Résumé des bonus actifs */}
          {Object.keys(activeBonus).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4 sm:p-6"
            >
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Vos Bonus Actifs
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Object.entries(activeBonus).map(([type, value]) => (
                  <div
                    key={type}
                    className="bg-white/10 rounded-xl px-3 sm:px-4 py-2"
                  >
                    <div className="text-base sm:text-lg font-bold text-emerald-400">+{value}%</div>
                    <div className="text-[10px] sm:text-xs text-gray-400 capitalize">{type.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Modal choix de talent */}
      <AnimatePresence>
        {talentModal && (
          <TalentChoiceModal
            skill={talentModal.skill}
            tier={talentModal.tier}
            talents={talentModal.talents}
            onChoose={handleChooseTalent}
            onClose={() => setTalentModal(null)}
            processing={processing}
          />
        )}
      </AnimatePresence>

      {/* Modal succès */}
      <AnimatePresence>
        {successModal && (
          <TalentSuccessModal
            talent={successModal}
            onClose={closeSuccessModal}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default SkillTreePage;
