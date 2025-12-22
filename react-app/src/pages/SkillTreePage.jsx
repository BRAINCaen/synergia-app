// ==========================================
// react-app/src/pages/SkillTreePage.jsx
// PAGE SKILL TREE RPG - SYNERGIA v6.0
// Design radial avec branches stylisées
// ==========================================

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Star, Sparkles, ChevronRight, ChevronLeft,
  TrendingUp, Award, X, Info, Gift, Crown, Shield,
  Target, Users, Lightbulb, MessageCircle, Briefcase,
  BookOpen, Palette, AlertCircle, Lock, Check, ZoomIn, ZoomOut, Move,
  HelpCircle, List, LayoutGrid, ChevronDown, ChevronUp
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useSkillTree } from '../shared/hooks/useSkillTree.js';
import { useGamification } from '../shared/hooks/useGamification.js';
import { getFullProgressInfo, getRanks } from '../core/services/levelService.js';

// ==========================================
// TUTORIEL MODAL
// ==========================================

const TutorialModal = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "🎮 Bienvenue dans l'Arbre de Compétences !",
      content: "Ce système RPG vous permet de développer vos compétences professionnelles de manière ludique. Chaque action dans Synergia vous fait progresser !",
      icon: "🌳"
    },
    {
      title: "📊 Les 7 Branches de Compétences",
      content: "Votre arbre comporte 7 branches : Relationnel, Technique, Communication, Organisation, Créativité, Pédagogie et Commercial. Chaque branche contient plusieurs skills à développer.",
      icon: "🌿"
    },
    {
      title: "⭐ Comment gagner de l'XP ?",
      content: "Accomplissez des quêtes, participez aux défis d'équipe, connectez-vous quotidiennement... Chaque action vous rapporte de l'XP dans les compétences correspondantes !",
      icon: "✨"
    },
    {
      title: "🎯 Les Tiers de Progression",
      content: "Chaque skill a 3 tiers (niveaux). En atteignant un tier, vous débloquez le choix d'un talent qui vous donne des bonus permanents !",
      icon: "📈"
    },
    {
      title: "🎁 Choisir vos Talents",
      content: "Quand un skill atteint un nouveau tier, une notification apparaît. Cliquez sur le skill pour voir les talents disponibles et choisissez celui qui correspond à votre style !",
      icon: "🏆"
    },
    {
      title: "🚀 Les Rangs",
      content: "En accumulant de l'XP, vous montez en niveau et débloquez des rangs (Apprenti → Initié → Aventurier...). Chaque rang donne des bonus d'XP et des avantages exclusifs !",
      icon: "👑"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-purple-900/50 rounded-2xl border border-white/20 p-5 sm:p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{steps[step].icon}</span>
            <span className="text-xs text-gray-400">Étape {step + 1}/{steps.length}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Contenu */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{steps[step].title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">{steps[step].content}</p>

        {/* Indicateurs */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-purple-500 w-6' : 'bg-white/30'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-sm"
            >
              Précédent
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-colors text-sm"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-teal-500 transition-colors text-sm"
            >
              C'est compris ! 🎉
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// VUE LISTE MOBILE-FRIENDLY
// ==========================================

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
                  <span>•</span>
                  <span>{totalTalents}/{skills.length * 3} talents</span>
                  <span>•</span>
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

// ==========================================
// CONFIGURATION DES BRANCHES (positions radiales)
// ==========================================

const BRANCH_POSITIONS = {
  relationnel: { angle: -90, color: '#ec4899', gradient: 'from-pink-500 to-rose-600', label: 'Relationnel' },
  technique: { angle: -38, color: '#3b82f6', gradient: 'from-blue-500 to-cyan-600', label: 'Technique' },
  communication: { angle: 14, color: '#a855f7', gradient: 'from-purple-500 to-violet-600', label: 'Communication' },
  organisation: { angle: 65, color: '#22c55e', gradient: 'from-green-500 to-emerald-600', label: 'Organisation' },
  creativite: { angle: 116, color: '#f97316', gradient: 'from-orange-500 to-amber-600', label: 'Créativité' },
  pedagogie: { angle: 168, color: '#14b8a6', gradient: 'from-teal-500 to-cyan-600', label: 'Pédagogie' },
  commercial: { angle: 220, color: '#eab308', gradient: 'from-yellow-500 to-orange-600', label: 'Commercial' }
};

// ==========================================
// COMPOSANT NŒUD HEXAGONAL DE SKILL
// ==========================================

const SkillNode = ({ skill, position, branchColor, onClick, isSelected, size = 'normal' }) => {
  const nodeSize = size === 'large' ? 56 : size === 'small' ? 36 : 44;
  const fontSize = size === 'large' ? 'text-2xl' : size === 'small' ? 'text-sm' : 'text-lg';

  const tierLevel = skill?.level || 0;
  const hasPendingChoice = skill?.pendingChoices > 0;
  const isMaxed = skill?.isMaxed;

  // Couleurs selon le statut
  const getNodeStyle = () => {
    if (isMaxed) return 'from-amber-500/40 to-yellow-600/40 border-amber-400/60';
    if (hasPendingChoice) return 'from-amber-500/30 to-orange-600/30 border-amber-400/50 animate-pulse';
    if (tierLevel >= 3) return 'from-purple-500/30 to-pink-600/30 border-purple-400/50';
    if (tierLevel >= 2) return 'from-blue-500/30 to-cyan-600/30 border-blue-400/50';
    if (tierLevel >= 1) return 'from-emerald-500/30 to-teal-600/30 border-emerald-400/50';
    return 'from-white/5 to-white/10 border-white/20';
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15, zIndex: 50 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick?.(skill)}
      style={{
        position: 'absolute',
        left: position.x - nodeSize / 2,
        top: position.y - nodeSize / 2,
        width: nodeSize,
        height: nodeSize,
      }}
      className={`
        cursor-pointer transition-all duration-300
        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
      `}
    >
      {/* Hexagone avec clip-path */}
      <div
        className={`
          w-full h-full bg-gradient-to-br ${getNodeStyle()}
          backdrop-blur-sm border-2 flex items-center justify-center
          shadow-lg hover:shadow-xl transition-shadow
        `}
        style={{
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          borderColor: tierLevel > 0 ? branchColor : 'rgba(255,255,255,0.2)'
        }}
      >
        <span className={fontSize}>{skill?.emoji || skill?.icon || '?'}</span>
      </div>

      {/* Badge tier */}
      {tierLevel > 0 && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: branchColor }}
        >
          <span className="text-white">{tierLevel}</span>
        </div>
      )}

      {/* Indicateur choix disponible */}
      {hasPendingChoice && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2"
        >
          <Gift className="w-4 h-4 text-amber-400 drop-shadow-lg" />
        </motion.div>
      )}

      {/* Lock si tier 0 */}
      {tierLevel === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <Lock className="w-3 h-3 text-gray-400/50" />
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// COMPOSANT CONNEXION SVG ENTRE NŒUDS
// ==========================================

const ConnectionLine = ({ from, to, color, isActive, animated }) => {
  return (
    <motion.line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={isActive ? color : 'rgba(255,255,255,0.1)'}
      strokeWidth={isActive ? 3 : 2}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={animated ? 'animate-pulse' : ''}
      style={{
        filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none'
      }}
    />
  );
};

// ==========================================
// COMPOSANT CERCLE CENTRAL
// ==========================================

const CentralHub = ({ stats, onClick }) => {
  const progressPercent = stats.talentProgress || 0;
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', bounce: 0.3 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      onClick={onClick}
    >
      {/* Anneau de progression */}
      <svg width="200" height="200" className="absolute -left-[100px] -top-[100px]">
        {/* Fond de l'anneau */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Progression colorée (divisée par branches) */}
        {Object.entries(BRANCH_POSITIONS).map(([branchId, config], index) => {
          const segmentLength = circumference / 7;
          const offset = index * segmentLength;
          return (
            <motion.circle
              key={branchId}
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={config.color}
              strokeWidth="8"
              strokeDasharray={`${segmentLength - 4} ${circumference - segmentLength + 4}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: index * 0.1 }}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '100px 100px'
              }}
            />
          );
        })}
      </svg>

      {/* Cercle central */}
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-2 border-white/20 flex flex-col items-center justify-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-400" />
        </div>
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-400">Compétences</div>
          <div className="text-sm font-bold text-white">
            {stats.totalTalents}/{stats.maxTalents}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT BRANCHE DE COMPÉTENCES
// ==========================================

const SkillBranch = ({ branchId, branch, skills, config, centerX, centerY, onSkillClick, selectedSkill }) => {
  const angleRad = (config.angle * Math.PI) / 180;

  // Calculer les positions des skills le long de la branche
  const getSkillPositions = () => {
    const positions = [];
    const startRadius = 130; // Distance du centre
    const spacing = 70; // Espacement entre les nœuds

    skills.forEach((skill, index) => {
      // Position principale sur l'axe de la branche
      const radius = startRadius + index * spacing;
      const x = centerX + Math.cos(angleRad) * radius;
      const y = centerY + Math.sin(angleRad) * radius;

      // Ajouter un léger décalage pour les branches latérales
      const offsetAngle = (index % 2 === 0 ? 1 : -1) * 0.15;
      const offsetX = Math.cos(angleRad + offsetAngle) * (index > 0 ? 20 : 0);
      const offsetY = Math.sin(angleRad + offsetAngle) * (index > 0 ? 20 : 0);

      positions.push({
        x: x + offsetX,
        y: y + offsetY,
        skill
      });
    });

    return positions;
  };

  const positions = getSkillPositions();

  // Lignes de connexion
  const connections = [];
  positions.forEach((pos, index) => {
    if (index === 0) {
      // Connexion du centre vers le premier nœud
      connections.push({
        from: { x: centerX, y: centerY },
        to: { x: pos.x, y: pos.y },
        isActive: pos.skill?.level > 0
      });
    } else {
      // Connexion entre les nœuds
      connections.push({
        from: { x: positions[index - 1].x, y: positions[index - 1].y },
        to: { x: pos.x, y: pos.y },
        isActive: pos.skill?.level > 0 && positions[index - 1].skill?.level > 0
      });
    }
  });

  return (
    <g>
      {/* Lignes de connexion */}
      {connections.map((conn, idx) => (
        <ConnectionLine
          key={`conn-${branchId}-${idx}`}
          from={conn.from}
          to={conn.to}
          color={config.color}
          isActive={conn.isActive}
          animated={conn.isActive}
        />
      ))}

      {/* Label de la branche */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {(() => {
          const labelRadius = 130 + skills.length * 70 + 40;
          const labelX = centerX + Math.cos(angleRad) * labelRadius;
          const labelY = centerY + Math.sin(angleRad) * labelRadius;
          const rotation = config.angle > 90 || config.angle < -90 ? config.angle + 180 : config.angle;

          return (
            <text
              x={labelX}
              y={labelY}
              fill={config.color}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
              transform={`rotate(${rotation}, ${labelX}, ${labelY})`}
            >
              {config.label}
            </text>
          );
        })()}
      </motion.g>
    </g>
  );
};

// ==========================================
// MODAL DÉTAIL SKILL
// ==========================================

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
              <p className="text-sm text-gray-400">Tier {skill.level}/3 • {skill.xp} XP</p>
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
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-8 max-w-md w-full text-center"
        onClick={e => e.stopPropagation()}
      >
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

        <h2 className="text-2xl font-bold text-white mb-2">Nouveau Talent!</h2>
        <h3 className="text-xl text-emerald-300 mb-4">{talent?.name}</h3>
        <p className="text-gray-300 mb-6">{talent?.description}</p>

        <button
          onClick={onClose}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Génial!
        </button>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// COMPOSANT CARTE DE RANG
// ==========================================

const RankProgressCard = ({ totalXP }) => {
  const [showRankDetails, setShowRankDetails] = useState(false);
  const progressInfo = useMemo(() => getFullProgressInfo(totalXP), [totalXP]);
  const ranks = useMemo(() => getRanks(), []);
  const ranksArray = useMemo(() =>
    Object.values(ranks).sort((a, b) => a.minLevel - b.minLevel),
    [ranks]
  );

  const { currentRank, nextRank, currentLevel, xpNeeded, rankProgress, xpBoost } = progressInfo;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5"
    >
      {/* Header du rang actuel */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${currentRank?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-lg`}
        >
          <span className="text-3xl sm:text-4xl">{currentRank?.icon || '🌱'}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-xl sm:text-2xl font-bold ${currentRank?.textColor || 'text-gray-300'}`}>
              {currentRank?.name || 'Apprenti'}
            </h3>
            {xpBoost > 1 && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
                +{Math.round((xpBoost - 1) * 100)}% XP
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">{currentRank?.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg font-bold text-white">Niveau {currentLevel}</span>
            <span className="text-gray-500">•</span>
            <span className="text-purple-400 font-medium">{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Barre de progression vers le prochain rang */}
      {nextRank && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <span>{currentRank?.icon}</span>
              <span>{currentRank?.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>{nextRank?.icon}</span>
              <span>{nextRank?.name}</span>
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rankProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${currentRank?.color || 'from-purple-500 to-pink-500'} rounded-full`}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-gray-500">{Math.round(rankProgress)}% vers {nextRank?.name}</span>
            <span className="text-purple-400">{xpNeeded.toLocaleString()} XP restants</span>
          </div>
        </div>
      )}

      {/* Avantages du rang */}
      {currentRank?.perks && currentRank.perks.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <div className="text-xs text-gray-500 uppercase mb-2 font-medium">Avantages du rang</div>
          <div className="flex flex-wrap gap-2">
            {currentRank.perks.map((perk, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mini timeline des rangs avec dropdown */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <button
          onClick={() => setShowRankDetails(!showRankDetails)}
          className="w-full flex items-center justify-between text-xs text-gray-500 uppercase mb-3 font-medium hover:text-gray-300 transition-colors"
        >
          <span>Progression des Rangs</span>
          <motion.div
            animate={{ rotate: showRankDetails ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 rotate-90" />
          </motion.div>
        </button>

        {/* Timeline des rangs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {ranksArray.map((rank, idx) => {
            const isPast = currentLevel >= rank.maxLevel;
            const isCurrent = currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel;
            const isFuture = currentLevel < rank.minLevel;

            return (
              <div
                key={rank.id}
                className="flex items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer
                    ${isCurrent
                      ? `bg-gradient-to-br ${rank.color} ring-2 ring-white/50 shadow-lg`
                      : isPast
                        ? 'bg-white/20'
                        : 'bg-white/5 opacity-50'
                    }
                  `}
                  title={`${rank.name} (Niv. ${rank.minLevel}-${rank.maxLevel})`}
                  onClick={() => setShowRankDetails(!showRankDetails)}
                >
                  <span className={isFuture ? 'grayscale' : ''}>{rank.icon}</span>
                </motion.div>
                {idx < ranksArray.length - 1 && (
                  <div
                    className={`w-2 h-0.5 ${isPast ? 'bg-white/40' : 'bg-white/10'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Détails des rangs (déroulant) */}
        <AnimatePresence>
          {showRankDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {ranksArray.map((rank, idx) => {
                  const isPast = currentLevel >= rank.maxLevel;
                  const isCurrent = currentLevel >= rank.minLevel && currentLevel <= rank.maxLevel;
                  const isFuture = currentLevel < rank.minLevel;
                  const xpRequired = (rank.minLevel - 1) * 500; // Formule XP

                  return (
                    <motion.div
                      key={rank.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`
                        p-3 rounded-xl border transition-all
                        ${isCurrent
                          ? `bg-gradient-to-r ${rank.color.replace('from-', 'from-').replace('to-', 'to-')}/20 border-white/30`
                          : isPast
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/[0.02] border-white/5 opacity-60'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icône du rang */}
                        <div
                          className={`
                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isCurrent
                              ? `bg-gradient-to-br ${rank.color}`
                              : isPast
                                ? 'bg-white/20'
                                : 'bg-white/5'
                            }
                          `}
                        >
                          <span className={`text-xl ${isFuture ? 'grayscale' : ''}`}>{rank.icon}</span>
                        </div>

                        {/* Infos du rang */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-bold ${rank.textColor || 'text-gray-300'}`}>
                              {rank.name}
                            </h4>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] rounded font-medium">
                                ACTUEL
                              </span>
                            )}
                            {isPast && !isCurrent && (
                              <Check className="w-4 h-4 text-emerald-400" />
                            )}
                            {isFuture && (
                              <Lock className="w-3 h-3 text-gray-500" />
                            )}
                          </div>

                          <p className="text-xs text-gray-400 mt-0.5">{rank.description}</p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px]">
                            <span className="text-gray-500">
                              Niv. {rank.minLevel}-{rank.maxLevel}
                            </span>
                            <span className="text-gray-500">
                              {xpRequired.toLocaleString()} XP requis
                            </span>
                            {rank.boost > 1 && (
                              <span className="text-emerald-400 font-medium">
                                +{Math.round((rank.boost - 1) * 100)}% XP
                              </span>
                            )}
                          </div>

                          {/* Avantages */}
                          {rank.perks && rank.perks.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rank.perks.map((perk, perkIdx) => (
                                <span
                                  key={perkIdx}
                                  className={`
                                    px-1.5 py-0.5 rounded text-[10px]
                                    ${isFuture
                                      ? 'bg-white/5 text-gray-500'
                                      : 'bg-white/10 text-gray-300'
                                    }
                                  `}
                                >
                                  {perk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ==========================================
// PAGE PRINCIPALE - ARBRE RADIAL
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

  // Récupérer les données de gamification pour le rang
  const { totalXP, userStats } = useGamification();
  const userTotalXP = userStats?.totalXp || totalXP || 0;

  const containerRef = useRef(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 900, height: 900 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Nouveaux états pour mobile et tutoriel
  const [showTutorial, setShowTutorial] = useState(false);
  const [viewMode, setViewMode] = useState('auto'); // 'auto', 'tree', 'list'
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille d'écran
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Déterminer la vue effective
  const effectiveView = viewMode === 'auto' ? (isMobile ? 'list' : 'tree') : viewMode;

  // Centre du canvas
  const centerX = 450;
  const centerY = 450;

  // Préparer les données des branches
  const branchesData = useMemo(() => {
    return Object.entries(SKILL_BRANCHES).map(([branchId, branch]) => {
      const skills = getBranchSkills(branchId);
      const config = BRANCH_POSITIONS[branchId] || { angle: 0, color: '#888', gradient: 'from-gray-500 to-gray-600', label: branchId };
      return { branchId, branch, skills, config };
    });
  }, [SKILL_BRANCHES, getBranchSkills]);

  // Gestion du zoom
  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  // Gestion du pan (drag)
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Choisir un talent
  const handleChooseTalent = async (skillId, tier, talentId) => {
    const result = await chooseTalent(skillId, tier, talentId);
    if (result.success) {
      setSelectedSkill(null);
      setSuccessModal(result.talent);
    }
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
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
        {/* Background animé */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
        </div>

        {/* Header fixe */}
        <div className="relative z-20 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            {/* Titre avec boutons d'action */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-4"
            >
              <div className="flex-1">
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-0.5">
                  Arbre de Compétences
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Progressez via les quêtes et choisissez vos talents
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-2">
                {/* Toggle Vue */}
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      effectiveView === 'list'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Vue liste"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`p-2 rounded-lg transition-all ${
                      effectiveView === 'tree'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Vue arbre"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                {/* Bouton Aide */}
                <button
                  onClick={() => setShowTutorial(true)}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  title="Comment ça marche ?"
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {/* Stats rapides */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2 sm:p-3 text-center"
              >
                <div className="text-lg sm:text-2xl font-bold text-purple-400">{globalStats.totalXP}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">XP Total</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2 sm:p-3 text-center"
              >
                <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                  {globalStats.totalTalents}/{globalStats.maxTalents}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400">Talents</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2 sm:p-3 text-center"
              >
                <div className="text-lg sm:text-2xl font-bold text-blue-400">
                  {globalStats.skillsStarted}/{globalStats.totalSkills}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400">Skills</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2 sm:p-3 text-center"
              >
                <div className="text-lg sm:text-2xl font-bold text-amber-400">
                  +{Object.values(activeBonus).reduce((a, b) => a + b, 0)}%
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400">Bonus</div>
              </motion.div>
            </div>

            {/* Carte de progression du rang */}
            <div className="mb-4">
              <RankProgressCard totalXP={userTotalXP} />
            </div>

            {/* Alerte talents disponibles */}
            {totalUnspentPoints > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center gap-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Gift className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-amber-300 text-sm">
                    {totalUnspentPoints} talent{totalUnspentPoints > 1 ? 's' : ''} à choisir!
                  </h3>
                  <p className="text-xs text-amber-200/70">
                    Cliquez sur un skill pour sélectionner vos bonus
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Vue Liste Mobile */}
        {effectiveView === 'list' && (
          <MobileSkillsView
            branchesData={branchesData}
            onSkillClick={setSelectedSkill}
            selectedSkill={selectedSkill}
          />
        )}

        {/* Canvas de l'arbre (Vue Desktop) */}
        {effectiveView === 'tree' && (
        <div
          ref={containerRef}
          className="relative z-10 w-full flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${viewBox.width / zoom} ${viewBox.height / zoom}`}
            preserveAspectRatio="xMidYMid meet"
            className="select-none"
          >
            {/* Grille de fond subtile */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x="-500" y="-500" width="1900" height="1900" fill="url(#grid)" />

            {/* Branches */}
            {branchesData.map(({ branchId, branch, skills, config }) => (
              <SkillBranch
                key={branchId}
                branchId={branchId}
                branch={branch}
                skills={skills}
                config={config}
                centerX={centerX}
                centerY={centerY}
                onSkillClick={setSelectedSkill}
                selectedSkill={selectedSkill}
              />
            ))}
          </svg>

          {/* Nœuds des skills (en HTML pour meilleure interactivité) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {branchesData.map(({ branchId, skills, config }) => {
              const angleRad = (config.angle * Math.PI) / 180;
              const startRadius = 130;
              const spacing = 70;

              return skills.map((skill, index) => {
                const radius = startRadius + index * spacing;
                const offsetAngle = (index % 2 === 0 ? 1 : -1) * 0.15;
                const x = centerX + Math.cos(angleRad) * radius + Math.cos(angleRad + offsetAngle) * (index > 0 ? 20 : 0);
                const y = centerY + Math.sin(angleRad) * radius + Math.sin(angleRad + offsetAngle) * (index > 0 ? 20 : 0);

                // Ajuster pour le viewport SVG
                const viewportX = (x / viewBox.width) * 100;
                const viewportY = (y / viewBox.height) * 100;

                return (
                  <div
                    key={`node-${skill.id}`}
                    className="pointer-events-auto"
                    style={{
                      position: 'absolute',
                      left: `${viewportX}%`,
                      top: `${viewportY}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <SkillNode
                      skill={skill}
                      position={{ x: 0, y: 0 }}
                      branchColor={config.color}
                      onClick={() => setSelectedSkill(skill)}
                      isSelected={selectedSkill?.id === skill.id}
                      size={index === 0 ? 'large' : 'normal'}
                    />
                  </div>
                );
              });
            })}

            {/* Hub central */}
            <div
              className="pointer-events-auto"
              style={{
                position: 'absolute',
                left: `${(centerX / viewBox.width) * 100}%`,
                top: `${(centerY / viewBox.height) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <CentralHub stats={globalStats} onClick={resetView} />
            </div>
          </div>

          {/* Contrôles de zoom */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
            <button
              onClick={() => handleZoom(0.2)}
              className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZoom(-0.2)}
              className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={resetView}
              className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <Move className="w-5 h-5" />
            </button>
          </div>

          {/* Légende */}
          <div className="absolute bottom-4 left-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 z-30">
            <div className="text-xs text-gray-400 mb-2 font-medium">Légende</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BRANCH_POSITIONS).map(([id, config]) => (
                <div key={id} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-[10px] text-gray-400">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Bonus actifs (footer) */}
        {Object.keys(activeBonus).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 px-4 pb-4"
          >
            <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-xl rounded-xl border border-purple-500/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Bonus Actifs</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeBonus).map(([type, value]) => (
                  <div
                    key={type}
                    className="bg-white/10 rounded-lg px-2 py-1"
                  >
                    <span className="text-xs font-bold text-emerald-400">+{value}%</span>
                    <span className="text-[10px] text-gray-400 ml-1 capitalize">{type.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal détail skill */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailModal
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
            onChooseTalent={handleChooseTalent}
            getAvailableTalents={getAvailableTalents}
            processing={processing}
          />
        )}
      </AnimatePresence>

      {/* Modal succès */}
      <AnimatePresence>
        {successModal && (
          <TalentSuccessModal
            talent={successModal}
            onClose={() => setSuccessModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal Tutoriel */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialModal onClose={() => setShowTutorial(false)} />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default SkillTreePage;
