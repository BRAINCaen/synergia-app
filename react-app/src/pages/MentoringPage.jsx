// ==========================================
// react-app/src/pages/MentoringPage.jsx
// PAGE MENTORING - SYNERGIA v4.0
// Module Mentorat: Sessions de coaching
// ==========================================

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, Clock, Star, Plus, X, Check, Play,
  MessageSquare, Award, TrendingUp, ChevronRight, Filter,
  AlertTriangle, Shield, CheckCircle, FileText, Download,
  Trash2, Upload, File, FileSpreadsheet, FileImage, Video,
  Edit3, GraduationCap, BookOpen, Target, Zap, Trophy,
  School, PenTool, ClipboardCheck, Medal, Sparkles
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import SponsorshipSection from '../components/mentoring/SponsorshipSection.jsx';
import { useMentoring } from '../shared/hooks/useMentoring.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ==========================================
// COMPOSANT STATS CARDS
// ==========================================

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Sessions Mentor',
      value: stats.asMentor.completed,
      total: stats.asMentor.total,
      emoji: '🎓',
      iconBg: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      label: 'Sessions Mentee',
      value: stats.asMentee.completed,
      total: stats.asMentee.total,
      emoji: '📚',
      iconBg: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      label: 'Temps Total',
      value: `${Math.round(stats.overall.totalMinutes / 60)}h`,
      subtext: `${stats.overall.totalMinutes} min`,
      emoji: '⏱️',
      iconBg: 'bg-emerald-500/20',
      textColor: 'text-emerald-400'
    },
    {
      label: 'XP Gagne',
      value: stats.overall.totalXP,
      emoji: '⚡',
      iconBg: 'bg-amber-500/20',
      textColor: 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 hover:bg-white/10 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 ${card.iconBg} rounded-xl`}>
              <span className="text-xl sm:text-2xl">{card.emoji}</span>
            </div>
            {card.total !== undefined && (
              <span className="text-[10px] sm:text-xs bg-white/10 border border-white/10 px-2 py-0.5 rounded-full text-gray-400">
                {card.total} total
              </span>
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${card.textColor}`}>{card.value}</div>
          <div className="text-xs sm:text-sm text-gray-400">{card.label}</div>
          {card.subtext && (
            <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{card.subtext}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// 🎓 COMPOSANT SECTION ALTERNANCE
// Objectifs scolaires pour les alternants
// ==========================================

const SCHOOL_OBJECTIVES = [
  {
    id: 'attendance',
    category: 'presence',
    title: 'Assiduité exemplaire',
    description: 'Aucune absence injustifiée ce mois-ci',
    icon: ClipboardCheck,
    xpReward: 50,
    color: 'emerald',
    frequency: 'monthly'
  },
  {
    id: 'homework',
    category: 'work',
    title: 'Devoirs rendus à temps',
    description: 'Tous les travaux rendus avant la deadline',
    icon: BookOpen,
    xpReward: 40,
    color: 'blue',
    frequency: 'weekly'
  },
  {
    id: 'good_grade',
    category: 'grades',
    title: 'Bonne note obtenue',
    description: 'Note supérieure à 14/20 sur un examen',
    icon: Star,
    xpReward: 75,
    color: 'amber',
    frequency: 'per_event'
  },
  {
    id: 'excellent_grade',
    category: 'grades',
    title: 'Excellence académique',
    description: 'Note supérieure à 16/20 sur un examen',
    icon: Trophy,
    xpReward: 150,
    color: 'yellow',
    frequency: 'per_event'
  },
  {
    id: 'project_completed',
    category: 'projects',
    title: 'Projet scolaire terminé',
    description: 'Projet rendu et validé par l\'école',
    icon: Target,
    xpReward: 100,
    color: 'purple',
    frequency: 'per_event'
  },
  {
    id: 'presentation',
    category: 'skills',
    title: 'Présentation orale',
    description: 'Soutenance ou présentation réussie',
    icon: MessageSquare,
    xpReward: 80,
    color: 'pink',
    frequency: 'per_event'
  },
  {
    id: 'semester_pass',
    category: 'milestones',
    title: 'Semestre validé',
    description: 'Validation de tous les modules du semestre',
    icon: Medal,
    xpReward: 300,
    color: 'indigo',
    frequency: 'semester'
  },
  {
    id: 'year_pass',
    category: 'milestones',
    title: 'Année validée',
    description: 'Passage en année supérieure confirmé',
    icon: GraduationCap,
    xpReward: 500,
    color: 'cyan',
    frequency: 'yearly'
  },
  {
    id: 'diploma',
    category: 'milestones',
    title: 'Diplôme obtenu !',
    description: 'Félicitations ! Diplôme en poche !',
    icon: Sparkles,
    xpReward: 1000,
    color: 'rose',
    frequency: 'once'
  }
];

const OBJECTIVE_CATEGORIES = {
  presence: { label: 'Présence', icon: ClipboardCheck, color: 'emerald' },
  work: { label: 'Travaux', icon: PenTool, color: 'blue' },
  grades: { label: 'Notes', icon: Star, color: 'amber' },
  projects: { label: 'Projets', icon: Target, color: 'purple' },
  skills: { label: 'Compétences', icon: Zap, color: 'pink' },
  milestones: { label: 'Étapes clés', icon: Trophy, color: 'indigo' }
};

const AlternanceSection = ({ user, onValidateObjective, onCreateObjective, onUpdateObjective, onDeleteObjective, alternanceData, isAdmin, isTutor, isAlternant, tutoredAlternants = [], customObjectives = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [validationNote, setValidationNote] = useState('');
  const [selectedAlternantId, setSelectedAlternantId] = useState(null);

  // États pour la gestion des objectifs personnalisés
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    xpReward: 50,
    category: 'work',
    color: 'blue'
  });

  // Combiner les objectifs par défaut avec les objectifs personnalisés
  const allObjectives = [
    ...SCHOOL_OBJECTIVES,
    ...customObjectives.map(obj => ({
      ...obj,
      icon: OBJECTIVE_CATEGORIES[obj.category]?.icon || Target,
      isCustom: true
    }))
  ];

  // Pour les tuteurs/admins, permettre de sélectionner un alternant
  const currentAlternantData = selectedAlternantId
    ? tutoredAlternants.find(a => a.id === selectedAlternantId) || alternanceData
    : alternanceData;

  // Déterminer si l'utilisateur peut valider (tuteur ou admin)
  const canValidate = isTutor || isAdmin;

  // Données de l'alternant (récupérées ou par défaut)
  const alternantInfo = currentAlternantData || {
    schoolName: 'École non renseignée',
    diploma: 'Diplôme en cours',
    startDate: null,
    expectedEndDate: null,
    currentYear: 1,
    totalYears: 2,
    completedObjectives: [],
    totalXpEarned: 0
  };

  // Calcul de la progression vers le diplôme
  const progressPercent = Math.min(
    ((alternantInfo.currentYear - 1) / alternantInfo.totalYears) * 100 +
    (alternantInfo.completedObjectives?.length || 0) * 2,
    100
  );

  // Filtrer les objectifs par catégorie
  const filteredObjectives = selectedCategory === 'all'
    ? allObjectives
    : allObjectives.filter(obj => obj.category === selectedCategory);

  // Handlers pour la gestion des objectifs personnalisés
  const handleOpenCreateObjective = () => {
    setEditingObjective(null);
    setObjectiveForm({
      title: '',
      description: '',
      xpReward: 50,
      category: 'work',
      color: 'blue'
    });
    setShowObjectiveModal(true);
  };

  const handleOpenEditObjective = (objective) => {
    setEditingObjective(objective);
    setObjectiveForm({
      title: objective.title,
      description: objective.description,
      xpReward: objective.xpReward,
      category: objective.category,
      color: objective.color
    });
    setShowObjectiveModal(true);
  };

  const handleSaveObjective = async () => {
    if (!objectiveForm.title.trim()) {
      alert('❌ Le titre est obligatoire');
      return;
    }

    if (editingObjective) {
      // Modification
      await onUpdateObjective?.(editingObjective.id, objectiveForm);
    } else {
      // Création
      await onCreateObjective?.({
        ...objectiveForm,
        id: `custom_${Date.now()}`,
        frequency: 'per_event'
      });
    }
    setShowObjectiveModal(false);
  };

  const handleDeleteObjective = async (objective) => {
    if (!confirm(`Supprimer l'objectif "${objective.title}" ?`)) return;
    await onDeleteObjective?.(objective.id);
  };

  // Vérifier si un objectif a été validé
  const isObjectiveCompleted = (objectiveId) => {
    return alternantInfo.completedObjectives?.some(c => c.objectiveId === objectiveId);
  };

  // Obtenir le nombre de validations d'un objectif
  const getObjectiveCount = (objectiveId) => {
    return alternantInfo.completedObjectives?.filter(c => c.objectiveId === objectiveId).length || 0;
  };

  // Handler pour ouvrir le modal de validation
  const handleValidateClick = (objective) => {
    setSelectedObjective(objective);
    setValidationNote('');
    setShowValidateModal(true);
  };

  // Handler pour confirmer la validation
  const handleConfirmValidation = async () => {
    if (!selectedObjective || !onValidateObjective) return;

    // Passer l'alternant sélectionné pour que l'XP aille à la bonne personne
    const success = await onValidateObjective({
      objectiveId: selectedObjective.id,
      xpReward: selectedObjective.xpReward,
      note: validationNote,
      validatedAt: new Date().toISOString()
    }, currentAlternantData);

    if (success) {
      setShowValidateModal(false);
      setSelectedObjective(null);
    }
  };

  const colorClasses = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-teal-500' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', gradient: 'from-blue-500 to-cyan-500' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500 to-yellow-500' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', gradient: 'from-yellow-400 to-amber-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500 to-pink-500' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', gradient: 'from-pink-500 to-rose-500' },
    indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', gradient: 'from-indigo-500 to-purple-500' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', gradient: 'from-cyan-500 to-blue-500' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', gradient: 'from-rose-500 to-pink-500' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8 sm:mt-10 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/20 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 sm:p-6 overflow-hidden relative"
    >
      {/* Effet décoratif */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Photo de l'alternant si tuteur/admin */}
          {canValidate && currentAlternantData?.userPhoto ? (
            <img
              src={currentAlternantData.userPhoto}
              alt={currentAlternantData.userName}
              className="w-12 h-12 rounded-xl border-2 border-indigo-500/50 object-cover"
            />
          ) : (
            <div className="p-3 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-xl border border-white/10 rounded-xl">
              <GraduationCap className="w-7 h-7 text-indigo-300" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {/* Afficher le nom de l'alternant si tuteur/admin avec sélection */}
              {canValidate && currentAlternantData?.userName ? (
                <>
                  {currentAlternantData.userName}
                  <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs rounded-full">
                    🎓 Alternant
                  </span>
                </>
              ) : (
                <>
                  Parcours Alternance
                  <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs rounded-full">
                    {isAlternant ? '🎓 Mon parcours' : isTutor ? '👨‍🏫 Tuteur' : '👑 Admin'}
                  </span>
                </>
              )}
            </h2>
            <p className="text-gray-400 text-sm">
              {canValidate && currentAlternantData?.userName
                ? `Validez les objectifs scolaires de ${currentAlternantData.userName.split(' ')[0]}`
                : isAlternant ? 'Gagne de l\'XP avec ton parcours scolaire !' : 'Suivez et validez les objectifs de vos alternants'
              }
            </p>
          </div>
        </div>

        {/* Sélecteur d'alternant pour tuteurs/admins */}
        <div className="flex flex-col sm:flex-row gap-3">
          {canValidate && tutoredAlternants.length > 0 && (
            <select
              value={selectedAlternantId || ''}
              onChange={(e) => setSelectedAlternantId(e.target.value || null)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none min-w-[200px]"
            >
              <option value="" className="bg-slate-800">
                {tutoredAlternants.length > 0 ? '👤 Choisir un alternant...' : 'Aucun alternant'}
              </option>
              {tutoredAlternants.map(alt => (
                <option key={alt.id} value={alt.id} className="bg-slate-800">
                  🎓 {alt.userName || alt.email || alt.userId}
                </option>
              ))}
            </select>
          )}

          {/* Stats rapides */}
          <div className="flex gap-3">
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <div className="text-xs text-gray-400">XP Scolaire</div>
            <div className="text-lg font-bold text-indigo-400 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {alternantInfo.totalXpEarned || 0}
            </div>
          </div>
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
            <div className="text-xs text-gray-400">Objectifs</div>
            <div className="text-lg font-bold text-emerald-400">
              {alternantInfo.completedObjectives?.length || 0}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Infos école et progression */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Carte info école */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <School className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-medium">Mon parcours</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">École</span>
              <span className="text-white">{alternantInfo.schoolName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Diplôme visé</span>
              <span className="text-white">{alternantInfo.diploma}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Année</span>
              <span className="text-white">{alternantInfo.currentYear}/{alternantInfo.totalYears}</span>
            </div>
          </div>
        </div>

        {/* Progression vers le diplôme */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-white font-medium">Vers le diplôme</span>
            </div>
            <span className="text-amber-400 font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
          <p className="text-gray-400 text-xs text-center">
            Continue comme ça ! Chaque objectif te rapproche du diplôme 🎓
          </p>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="relative flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          Tous
        </button>
        {Object.entries(OBJECTIVE_CATEGORIES).map(([catId, cat]) => {
          const CatIcon = cat.icon;
          return (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                selectedCategory === catId
                  ? `bg-${cat.color}-600 text-white`
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Liste des objectifs */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredObjectives.map((objective) => {
          const ObjIcon = objective.icon;
          const colors = colorClasses[objective.color];
          const completed = isObjectiveCompleted(objective.id);
          const count = getObjectiveCount(objective.id);

          return (
            <motion.div
              key={objective.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative p-4 rounded-xl border transition-all ${
                completed
                  ? `${colors.bg} ${colors.border} ring-1 ring-${objective.color}-500/30`
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Badge XP */}
              <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                +{objective.xpReward} XP
              </div>

              {/* Boutons edit/delete pour les objectifs personnalisés (tuteur/admin) */}
              {canValidate && objective.isCustom && (
                <div className="absolute top-2 right-14 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenEditObjective(objective); }}
                    className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 transition-colors"
                    title="Modifier"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteObjective(objective); }}
                    className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <ObjIcon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm mb-0.5 flex items-center gap-2">
                    {objective.title}
                    {completed && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </h4>
                  <p className="text-gray-400 text-xs line-clamp-2">{objective.description}</p>

                  {/* Compteur si répétable */}
                  {count > 0 && objective.frequency !== 'once' && (
                    <div className="mt-2 text-xs text-gray-500">
                      Validé {count} fois
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton valider (tuteur ou admin) */}
              {canValidate && (
                <button
                  onClick={() => handleValidateClick(objective)}
                  className={`mt-3 w-full py-2 rounded-lg text-xs font-medium transition-all ${
                    completed && objective.frequency === 'once'
                      ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${colors.gradient} text-white hover:opacity-90`
                  }`}
                  disabled={completed && objective.frequency === 'once'}
                >
                  {completed && objective.frequency === 'once' ? '✓ Déjà validé' : 'Valider cet objectif'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bouton créer un objectif personnalisé (tuteur/admin) */}
      {canValidate && (
        <div className="relative mt-4">
          <button
            onClick={handleOpenCreateObjective}
            className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer un objectif personnalisé
          </button>
        </div>
      )}

      {/* Message motivation */}
      <div className="relative mt-6 p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-indigo-500/20 text-center">
        <p className="text-gray-300 text-sm">
          💡 <span className="text-indigo-300 font-medium">Astuce :</span> Ton tuteur ou manager peut valider tes objectifs scolaires.
          N'hésite pas à partager tes réussites avec ton équipe !
        </p>
      </div>

      {/* Modal de validation */}
      <AnimatePresence>
        {showValidateModal && selectedObjective && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowValidateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[selectedObjective.color].bg}`}>
                  <selectedObjective.icon className={`w-6 h-6 ${colorClasses[selectedObjective.color].text}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Valider l'objectif</h3>
                  <p className="text-gray-400 text-sm">{selectedObjective.title}</p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-300 text-sm">Récompense XP</span>
                  <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    +{selectedObjective.xpReward}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Note / Commentaire (optionnel)
                </label>
                <textarea
                  value={validationNote}
                  onChange={(e) => setValidationNote(e.target.value)}
                  placeholder="Ex: Excellent travail sur le projet de fin de semestre..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidateModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmValidation}
                  className={`flex-1 px-4 py-3 bg-gradient-to-r ${colorClasses[selectedObjective.color].gradient} text-white font-medium rounded-xl hover:opacity-90 transition-opacity`}
                >
                  Valider +{selectedObjective.xpReward} XP
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal création/modification d'objectif */}
      <AnimatePresence>
        {showObjectiveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowObjectiveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-500/20">
                  <Target className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingObjective ? 'Modifier l\'objectif' : 'Nouvel objectif'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {editingObjective ? 'Modifiez les détails de l\'objectif' : 'Créez un objectif personnalisé pour vos alternants'}
                  </p>
                </div>
              </div>

              {/* Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={objectiveForm.title}
                    onChange={(e) => setObjectiveForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Rapport mensuel validé"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={objectiveForm.description}
                    onChange={(e) => setObjectiveForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez l'objectif à atteindre..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Récompense XP</label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      step="10"
                      value={objectiveForm.xpReward}
                      onChange={(e) => setObjectiveForm(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 50 }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Catégorie</label>
                    <select
                      value={objectiveForm.category}
                      onChange={(e) => setObjectiveForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {Object.entries(OBJECTIVE_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key} className="bg-gray-800">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Couleur</label>
                  <div className="flex gap-2 flex-wrap">
                    {['emerald', 'blue', 'amber', 'purple', 'pink', 'indigo', 'cyan', 'rose'].map(color => (
                      <button
                        key={color}
                        onClick={() => setObjectiveForm(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full transition-all ${
                          objectiveForm.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                        }`}
                        style={{ backgroundColor: `var(--color-${color}-500, ${color === 'emerald' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'amber' ? '#f59e0b' : color === 'purple' ? '#a855f7' : color === 'pink' ? '#ec4899' : color === 'indigo' ? '#6366f1' : color === 'cyan' ? '#06b6d4' : '#f43f5e'})` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowObjectiveModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveObjective}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  {editingObjective ? 'Enregistrer' : 'Créer l\'objectif'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// HELPER - GET FILE ICON
// ==========================================

const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
  if (fileType?.includes('sheet') || fileType?.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
  if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return <FileText className="w-5 h-5 text-orange-400" />;
  if (fileType?.includes('image')) return <FileImage className="w-5 h-5 text-blue-400" />;
  if (fileType?.includes('video')) return <Video className="w-5 h-5 text-purple-400" />;
  return <File className="w-5 h-5 text-gray-400" />;
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ==========================================
// COMPOSANT SESSION CARD
// ==========================================

const SessionCard = ({ session, onStart, onComplete, onCancel, onFeedback, onAddDocument, onRemoveDocument, onEdit, currentUserId }) => {
  const { MENTORING_STATUS, SESSION_TYPES, DIFFICULTY_LEVELS } = useMentoring();
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const status = MENTORING_STATUS[session.status] || MENTORING_STATUS.scheduled;
  const sessionType = SESSION_TYPES[session.type] || SESSION_TYPES.skill_transfer;
  const difficulty = DIFFICULTY_LEVELS?.[session.difficulty] || DIFFICULTY_LEVELS?.beginner;
  const isOwner = session.mentorId === currentUserId;
  const isParticipant = session.mentorId === currentUserId || session.menteeId === currentUserId;
  const scheduledDate = session.scheduledDate?.toDate?.();
  const canGiveFeedback = session.status === 'completed' && (
    (isOwner && !session.mentorFeedback) || (!isOwner && !session.menteeFeedback)
  );
  const canEdit = isOwner && (session.status === 'scheduled' || session.status === 'in_progress');

  // Calcul XP avec difficulte pour le mentee
  const menteeXP = Math.round((sessionType?.xpMentee || 35) * (difficulty?.xpMultiplier || 1));

  // Handler pour l'upload de fichier
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onAddDocument) return;

    setUploading(true);
    setUploadError(null);

    const result = await onAddDocument(session.id, file);

    if (!result.success) {
      setUploadError(result.error);
    }

    setUploading(false);
    // Reset input
    e.target.value = '';
  };

  // Handler pour la suppression de document
  const handleDeleteDocument = async (doc) => {
    if (!onRemoveDocument) return;
    if (window.confirm(`Supprimer "${doc.name}" ?`)) {
      await onRemoveDocument(session.id, doc);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl ${status.bgColor} flex items-center justify-center text-2xl`}>
              {sessionType.emoji}
            </div>
            <div>
              <h3 className="font-bold text-white">{session.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <span className={status.textColor}>{status.emoji} {status.label}</span>
                <span>•</span>
                <span>{sessionType.label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{isOwner ? `Mentee: ${session.menteeName}` : `Mentor: ${session.mentorName}`}</span>
                {scheduledDate && (
                  <>
                    <span>•</span>
                    <span>{scheduledDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.bgColor} ${difficulty.textColor}`}>
                {difficulty.emoji} {difficulty.label}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
              {session.duration} min
            </span>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded content */}
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
              {session.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                  <p className="text-white text-sm">{session.description}</p>
                </div>
              )}

              {/* Objectifs */}
              {session.objectives?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Objectifs</h4>
                  <div className="space-y-1">
                    {session.objectives.map((obj, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          session.objectivesCompleted?.includes(i) ? 'bg-emerald-500' : 'bg-white/10'
                        }`}>
                          {session.objectivesCompleted?.includes(i) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-gray-300">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {session.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Notes</h4>
                  <p className="text-white text-sm bg-white/5 rounded-lg p-3">{session.notes}</p>
                </div>
              )}

              {/* XP Info */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">XP a gagner</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">Mentor: +{sessionType.xpMentor} XP</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-purple-400">
                      Mentee: +{menteeXP} XP
                      {difficulty?.xpMultiplier > 1 && (
                        <span className="text-xs text-gray-500 ml-1">
                          (×{difficulty.xpMultiplier})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Documents supports ({session.documents?.length || 0})
                  </h4>
                  {isParticipant && (
                    <label className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                          Upload...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Ajouter
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        accept=".pdf,.xlsx,.xls,.ppt,.pptx,.doc,.docx,.mp4,.webm,.mov,.jpg,.jpeg,.png,.gif"
                      />
                    </label>
                  )}
                </div>

                {uploadError && (
                  <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs">
                    {uploadError}
                  </div>
                )}

                {session.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {session.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
                      >
                        {getFileIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">{doc.name}</div>
                          <div className="text-gray-500 text-xs">
                            {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-cyan-500/20 rounded-lg text-cyan-400 transition-colors"
                            title="Telecharger"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {(isOwner || doc.uploadedBy === currentUserId) && (
                            <button
                              onClick={() => handleDeleteDocument(doc)}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Aucun document pour cette formation
                    <div className="text-xs mt-1 text-gray-600">
                      PDF, Excel, PowerPoint, Word, Videos, Images
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {/* Bouton Modifier - visible pour le créateur si session non terminée */}
                {canEdit && onEdit && (
                  <button
                    onClick={() => onEdit(session)}
                    className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modifier
                  </button>
                )}

                {session.status === 'scheduled' && isOwner && (
                  <>
                    <button
                      onClick={() => onStart(session.id)}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Demarrer
                    </button>
                    <button
                      onClick={() => onCancel(session.id)}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </>
                )}

                {session.status === 'in_progress' && isOwner && (
                  <button
                    onClick={() => onComplete(session.id)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Terminer
                  </button>
                )}

                {canGiveFeedback && (
                  <button
                    onClick={() => onFeedback(session)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Donner un feedback
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// MODAL CREATION SESSION
// ==========================================

const CreateSessionModal = ({ isOpen, onClose, onCreate, availableUsers, currentUser, SESSION_TYPES, MENTORING_TOPICS, DIFFICULTY_LEVELS }) => {
  const [form, setForm] = useState({
    menteeId: '',
    menteeName: '',
    type: 'skill_transfer',
    topic: 'technical',
    difficulty: 'beginner',
    title: '',
    description: '',
    objectives: [''],
    scheduledDate: '',
    duration: 45
  });
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleAddObjective = () => {
    setForm(f => ({ ...f, objectives: [...f.objectives, ''] }));
  };

  const handleRemoveObjective = (index) => {
    setForm(f => ({ ...f, objectives: f.objectives.filter((_, i) => i !== index) }));
  };

  const handleObjectiveChange = (index, value) => {
    setForm(f => ({
      ...f,
      objectives: f.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.menteeId || !form.title) return;

    setCreating(true);
    const result = await onCreate({
      ...form,
      mentorId: currentUser.uid,
      mentorName: currentUser.displayName || currentUser.email,
      objectives: form.objectives.filter(o => o.trim())
    });

    if (result.success) {
      onClose();
      setForm({
        menteeId: '',
        menteeName: '',
        type: 'skill_transfer',
        topic: 'technical',
        difficulty: 'beginner',
        title: '',
        description: '',
        objectives: [''],
        scheduledDate: '',
        duration: 45
      });
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Nouvelle Session de Mentorat
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mentee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mentee *
            </label>
            <select
              value={form.menteeId}
              onChange={(e) => {
                const selectedUser = availableUsers.find(u => u.id === e.target.value);
                setForm(f => ({
                  ...f,
                  menteeId: e.target.value,
                  menteeName: selectedUser?.displayName || ''
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              required
            >
              <option value="">Selectionnez un mentee</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.avatar} {user.displayName} (Niveau {user.level})
                </option>
              ))}
            </select>
          </div>

          {/* Type de session */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de session
              </label>
              <select
                value={form.type}
                onChange={(e) => {
                  const type = SESSION_TYPES[e.target.value];
                  setForm(f => ({
                    ...f,
                    type: e.target.value,
                    duration: type?.duration || 30
                  }));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {Object.values(SESSION_TYPES).map(type => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sujet
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm(f => ({ ...f, topic: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              >
                {MENTORING_TOPICS.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.emoji} {topic.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Niveau de difficulte */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Niveau de difficulte
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTY_LEVELS && Object.values(DIFFICULTY_LEVELS).map(level => {
                const isSelected = form.difficulty === level.id;
                const sessionType = SESSION_TYPES[form.type];
                const baseXP = sessionType?.xpMentee || 35;
                const xpWithMultiplier = Math.round(baseXP * level.xpMultiplier);

                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, difficulty: level.id }))}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `${level.bgColor} border-${level.color}-500/50`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">{level.emoji}</div>
                    <div className={`text-sm font-medium ${isSelected ? level.textColor : 'text-white'}`}>
                      {level.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      +{xpWithMultiplier} XP
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Les XP du mentee sont multiplies selon la difficulte
            </p>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la session *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Introduction aux bonnes pratiques..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Decrivez le contenu de la session..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Objectifs
            </label>
            <div className="space-y-2">
              {form.objectives.map((obj, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder={`Objectif ${index + 1}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  {form.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(index)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
              >
                + Ajouter un objectif
              </button>
            </div>
          </div>

          {/* Date et duree */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date et heure
              </label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duree (minutes)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                min={15}
                max={180}
                step={15}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* XP Preview */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-300">XP a gagner a la completion</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">
                  Vous: +{SESSION_TYPES[form.type]?.xpMentor || 40} XP
                </span>
                <span className="text-emerald-400">
                  Mentee: +{SESSION_TYPES[form.type]?.xpMentee || 35} XP
                </span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating || !form.menteeId || !form.title}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? 'Creation...' : 'Creer la session'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// MODAL FEEDBACK
// ==========================================

const FeedbackModal = ({ isOpen, onClose, session, onSubmit, FEEDBACK_RATINGS }) => {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    const result = await onSubmit(session.id, { rating, comment });
    if (result.success) {
      onClose();
      setRating('');
      setComment('');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-md"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Feedback Session
          </h2>
          <p className="text-sm text-gray-400 mt-1">{session.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Comment s'est passee la session ?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.values(FEEDBACK_RATINGS).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRating(r.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    rating === r.id
                      ? 'border-amber-400 bg-amber-500/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-2xl text-center">{r.emoji}</div>
                  <div className="text-xs text-gray-400 text-center mt-1">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre experience..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !rating}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// MODAL EDITION SESSION
// ==========================================

const EditSessionModal = ({ isOpen, onClose, onUpdate, session, SESSION_TYPES, DIFFICULTY_LEVELS }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    type: 'skill_transfer',
    duration: 45
  });
  const [saving, setSaving] = useState(false);

  // Charger les données de la session quand la modal s'ouvre
  useEffect(() => {
    if (session && isOpen) {
      setForm({
        title: session.title || '',
        description: session.description || '',
        difficulty: session.difficulty || 'beginner',
        type: session.type || 'skill_transfer',
        duration: session.duration || 45
      });
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;

    setSaving(true);
    const result = await onUpdate(session.id, form);
    if (result.success) {
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-purple-400" />
            Modifier la session
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la session *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Introduction aux bonnes pratiques..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Niveau de difficulte */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Niveau de difficulte
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTY_LEVELS && Object.values(DIFFICULTY_LEVELS).map(level => {
                const isSelected = form.difficulty === level.id;
                const sessionType = SESSION_TYPES[form.type];
                const baseXP = sessionType?.xpMentee || 35;
                const xpWithMultiplier = Math.round(baseXP * level.xpMultiplier);

                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, difficulty: level.id }))}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `${level.bgColor} border-${level.color}-500/50`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-lg mb-1">{level.emoji}</div>
                    <div className={`text-sm font-medium ${isSelected ? level.textColor : 'text-white'}`}>
                      {level.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      +{xpWithMultiplier} XP mentee
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Les XP du mentee sont multiplies selon la difficulte
            </p>
          </div>

          {/* Type de session */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type de session
            </label>
            <select
              value={form.type}
              onChange={(e) => {
                const type = SESSION_TYPES[e.target.value];
                setForm(f => ({
                  ...f,
                  type: e.target.value,
                  duration: type?.duration || 30
                }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            >
              {Object.values(SESSION_TYPES).map(type => (
                <option key={type.id} value={type.id} className="bg-slate-800">
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Decrivez le contenu de la session..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>

          {/* Duree */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duree (minutes)
            </label>
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
              min={15}
              max={180}
              step={15}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* XP Preview */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-300">XP apres modification</span>
              <div className="flex items-center gap-3">
                <span className="text-purple-400">
                  Mentor: +{SESSION_TYPES[form.type]?.xpMentor || 40} XP
                </span>
                <span className="text-purple-400">
                  Mentee: +{Math.round((SESSION_TYPES[form.type]?.xpMentee || 35) * (DIFFICULTY_LEVELS[form.difficulty]?.xpMultiplier || 1))} XP
                </span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !form.title}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================

const MentoringPage = () => {
  const { user } = useAuthStore();
  const {
    loading,
    sessions,
    scheduledSessions,
    completedSessions,
    inProgressSessions,
    stats,
    availableUsers,
    createSession,
    startSession,
    completeSession,
    cancelSession,
    updateSession,
    submitFeedback,
    addDocument,
    removeDocument,
    SESSION_TYPES,
    MENTORING_TOPICS,
    FEEDBACK_RATINGS,
    DIFFICULTY_LEVELS
  } = useMentoring();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [editSession, setEditSession] = useState(null);
  const [filter, setFilter] = useState('all'); // all, mentor, mentee

  // États pour les formations
  const [trainings, setTrainings] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [trainingsLoading, setTrainingsLoading] = useState(true);
  const [activeTrainingView, setActiveTrainingView] = useState('trainings'); // trainings, certifications, plan
  const [selectedTrainingType, setSelectedTrainingType] = useState('all'); // Filtre par type
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);

  // États pour les alternants
  const [alternanceData, setAlternanceData] = useState(null);
  const [isAlternant, setIsAlternant] = useState(false);
  const [isTutor, setIsTutor] = useState(false);
  const [tutoredAlternants, setTutoredAlternants] = useState([]);
  const [customObjectives, setCustomObjectives] = useState([]);

  // Types de formations
  const trainingTypes = [
    { id: 'internal', label: 'Formation interne', color: 'blue', icon: '🏠' },
    { id: 'external', label: 'Formation externe', color: 'purple', icon: '🏫' },
    { id: 'elearning', label: 'E-learning', color: 'green', icon: '💻' },
    { id: 'certification', label: 'Certification', color: 'orange', icon: '📜' },
    { id: 'safety', label: 'Sécurité', color: 'red', icon: '🦺' }
  ];

  // Filtrer les formations par type
  const filteredTrainings = useMemo(() => {
    if (selectedTrainingType === 'all') return trainings;
    return trainings.filter(t => t.type === selectedTrainingType);
  }, [trainings, selectedTrainingType]);

  // Charger les formations
  useEffect(() => {
    const loadTrainingData = async () => {
      try {
        setTrainingsLoading(true);

        // Charger les formations
        const trainingsRef = collection(db, 'hr_trainings');
        const trainingsSnapshot = await getDocs(query(trainingsRef, orderBy('date', 'desc')));
        const trainingsData = trainingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrainings(trainingsData);

        // Charger les certifications
        const certsRef = collection(db, 'hr_certifications');
        const certsSnapshot = await getDocs(certsRef);
        const certsData = certsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCertifications(certsData);

      } catch (error) {
        console.error('Erreur chargement formations:', error);
      } finally {
        setTrainingsLoading(false);
      }
    };

    loadTrainingData();
  }, []);

  // Charger les données d'alternance de l'utilisateur
  useEffect(() => {
    const loadAlternanceData = async () => {
      if (!user?.uid) return;

      try {
        // Vérifier les permissions de l'utilisateur via modulePermissions
        // NOTE: Les permissions sont stockées comme un TABLEAU de strings, pas un objet booléen
        const userPermissions = user.modulePermissions?.alternance || [];
        const permissionsArray = Array.isArray(userPermissions) ? userPermissions : [];
        const isUserAdmin = user.isAdmin || user.role === 'admin';

        // Vérifier le statut alternant via les permissions (tableau.includes)
        const hasAlternantPermission = permissionsArray.includes('alternance_is_alternant');
        // Vérifier le statut tuteur via les permissions
        const hasTutorPermission = permissionsArray.includes('alternance_is_tutor') ||
                                   permissionsArray.includes('alternance_validate');

        console.log(`🔍 [ALTERNANCE] Permissions utilisateur:`, permissionsArray);
        console.log(`   → isAlternant: ${hasAlternantPermission}, isTutor: ${hasTutorPermission}, isAdmin: ${isUserAdmin}`);

        // Fallback: vérifier aussi le type de contrat pour rétrocompatibilité
        const isAltByContract = user.contractType === 'alternance' ||
                                user.contractType === 'apprentissage' ||
                                user.isAlternant === true;

        const isAlt = hasAlternantPermission || isAltByContract;
        const isTut = hasTutorPermission || isUserAdmin;

        setIsAlternant(isAlt);
        setIsTutor(isTut);

        // Si alternant, charger ses propres données
        if (isAlt) {
          const altRef = collection(db, 'alternance_tracking');
          const altQuery = query(altRef, where('userId', '==', user.uid));
          const altSnapshot = await getDocs(altQuery);

          if (!altSnapshot.empty) {
            const altData = altSnapshot.docs[0].data();
            setAlternanceData({
              id: altSnapshot.docs[0].id,
              ...altData,
              completedObjectives: altData.completedObjectives || []
            });
          } else {
            // Données par défaut pour un nouvel alternant
            setAlternanceData({
              schoolName: user.schoolName || 'École non renseignée',
              diploma: user.diploma || 'Diplôme en cours',
              currentYear: user.currentYear || 1,
              totalYears: user.totalYears || 2,
              completedObjectives: [],
              totalXpEarned: 0
            });
          }
        }

        // Si tuteur ou admin, charger la liste des alternants depuis la collection users
        console.log(`🔍 [ALTERNANCE] Condition tuteur/admin: isTut=${isTut}, isUserAdmin=${isUserAdmin}`);
        if (isTut || isUserAdmin) {
          console.log('📂 [ALTERNANCE] Chargement des utilisateurs...');
          // 1. Charger tous les utilisateurs avec la permission alternant
          const usersRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersRef);
          console.log(`📊 [ALTERNANCE] ${usersSnapshot.docs.length} utilisateurs chargés`);

          // Filtrer les alternants (ceux avec la permission ou le flag)
          // NOTE: modulePermissions.alternance est un TABLEAU de strings!
          const alternantUsers = usersSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(u => {
              const perms = u.modulePermissions?.alternance || [];
              const permsArray = Array.isArray(perms) ? perms : [];
              return permsArray.includes('alternance_is_alternant') ||
                     u.contractType === 'alternance' ||
                     u.contractType === 'apprentissage' ||
                     u.isAlternant === true;
            })
            // Pour les tuteurs non-admin, filtrer par tutorId si défini
            .filter(u => {
              if (isUserAdmin) return true;
              // Si l'alternant a un tutorId défini, vérifier qu'il correspond
              if (u.tutorId) return u.tutorId === user.uid;
              // Sinon, le tuteur voit tous les alternants sans tuteur assigné
              return true;
            });

          console.log(`👥 [ALTERNANCE] ${alternantUsers.length} alternant(s) après filtrage:`,
            alternantUsers.map(u => ({
              name: u.displayName || u.email,
              perms: u.modulePermissions?.alternance,
              contractType: u.contractType,
              isAlternant: u.isAlternant
            }))
          );

          // 2. Pour chaque alternant, charger ses données de tracking (avec gestion d'erreur individuelle)
          const alternants = [];
          for (const altUser of alternantUsers) {
            try {
              const trackingRef = collection(db, 'alternance_tracking');
              const trackingQuery = query(trackingRef, where('userId', '==', altUser.id));
              const trackingSnap = await getDocs(trackingQuery);
              const trackingData = trackingSnap.empty ? {} : trackingSnap.docs[0].data();

              alternants.push({
                id: altUser.id,
                odocTrackingId: trackingSnap.empty ? null : trackingSnap.docs[0].id,
                userId: altUser.id,
                userName: altUser.displayName || altUser.email || 'Alternant',
                userPhoto: altUser.photoURL,
                email: altUser.email,
                schoolName: altUser.schoolName || trackingData.schoolName || 'École non renseignée',
                diploma: altUser.diploma || trackingData.diploma || 'Diplôme en cours',
                currentYear: altUser.currentYear || trackingData.currentYear || 1,
                totalYears: altUser.totalYears || trackingData.totalYears || 2,
                tutorId: altUser.tutorId,
                completedObjectives: trackingData.completedObjectives || [],
                totalXpEarned: trackingData.totalXpEarned || 0
              });
            } catch (trackingError) {
              console.warn(`⚠️ [ALTERNANCE] Erreur chargement tracking pour ${altUser.displayName}:`, trackingError);
              // Ajouter quand même l'alternant avec données par défaut
              alternants.push({
                id: altUser.id,
                userId: altUser.id,
                userName: altUser.displayName || altUser.email || 'Alternant',
                userPhoto: altUser.photoURL,
                email: altUser.email,
                schoolName: altUser.schoolName || 'École non renseignée',
                diploma: altUser.diploma || 'Diplôme en cours',
                currentYear: altUser.currentYear || 1,
                totalYears: altUser.totalYears || 2,
                completedObjectives: [],
                totalXpEarned: 0
              });
            }
          }

          console.log(`✅ [ALTERNANCE] ${alternants.length} alternant(s) trouvé(s)`);
          setTutoredAlternants(alternants);

          // Si pas alternant mais tuteur/admin, utiliser les données du premier alternant pour l'affichage
          if (!isAlt && alternants.length > 0) {
            setAlternanceData(alternants[0]);
          }
        }
      } catch (error) {
        console.error('Erreur chargement données alternance:', error);
      }
    };

    loadAlternanceData();
  }, [user?.uid, user?.modulePermissions, user?.isAdmin]);

  // Charger les objectifs personnalisés
  useEffect(() => {
    const loadCustomObjectives = async () => {
      try {
        const objectivesRef = collection(db, 'alternance_objectives');
        const objectivesSnapshot = await getDocs(objectivesRef);
        const objectives = objectivesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomObjectives(objectives);
        console.log(`📋 [OBJECTIVES] ${objectives.length} objectif(s) personnalisé(s) chargé(s)`);
      } catch (error) {
        console.error('Erreur chargement objectifs personnalisés:', error);
      }
    };

    loadCustomObjectives();
  }, []);

  // Handler pour créer un objectif personnalisé
  const handleCreateObjective = async (objectiveData) => {
    try {
      const docRef = await addDoc(collection(db, 'alternance_objectives'), {
        ...objectiveData,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });

      setCustomObjectives(prev => [...prev, { id: docRef.id, ...objectiveData }]);
      alert('✅ Objectif créé avec succès !');
      return true;
    } catch (error) {
      console.error('Erreur création objectif:', error);
      alert('❌ Erreur lors de la création');
      return false;
    }
  };

  // Handler pour modifier un objectif personnalisé
  const handleUpdateObjective = async (objectiveId, objectiveData) => {
    try {
      const { doc: docFn, updateDoc } = await import('firebase/firestore');
      await updateDoc(docFn(db, 'alternance_objectives', objectiveId), {
        ...objectiveData,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid
      });

      setCustomObjectives(prev => prev.map(obj =>
        obj.id === objectiveId ? { ...obj, ...objectiveData } : obj
      ));
      alert('✅ Objectif modifié avec succès !');
      return true;
    } catch (error) {
      console.error('Erreur modification objectif:', error);
      alert('❌ Erreur lors de la modification');
      return false;
    }
  };

  // Handler pour supprimer un objectif personnalisé
  const handleDeleteObjective = async (objectiveId) => {
    try {
      const { doc: docFn, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docFn(db, 'alternance_objectives', objectiveId));

      setCustomObjectives(prev => prev.filter(obj => obj.id !== objectiveId));
      alert('✅ Objectif supprimé !');
      return true;
    } catch (error) {
      console.error('Erreur suppression objectif:', error);
      alert('❌ Erreur lors de la suppression');
      return false;
    }
  };

  // Fonction pour valider un objectif scolaire
  // alternantData peut être passé pour valider pour un alternant spécifique (tuteur/admin)
  const handleValidateSchoolObjective = async (objectiveData, targetAlternant = null) => {
    if (!user?.uid) return false;

    // Utiliser l'alternant cible ou les données par défaut
    const targetData = targetAlternant || alternanceData;
    if (!targetData) return false;

    // L'ID de l'alternant qui recevra l'XP
    const alternantUserId = targetData.userId || targetData.id;
    const alternantUserName = targetData.userName || targetData.displayName || 'Alternant';

    if (!alternantUserId) {
      alert('❌ Aucun alternant sélectionné');
      return false;
    }

    try {
      console.log('🎯 [VALIDATION] Début validation pour:', {
        alternantUserId,
        alternantUserName,
        objectiveData,
        targetData: targetData ? { id: targetData.id, userId: targetData.userId } : null
      });

      const newObjective = {
        ...objectiveData,
        validatedBy: user.uid,
        validatedByName: user.displayName || user.email,
        validatedAt: new Date().toISOString()
      };

      const updatedObjectives = [...(targetData.completedObjectives || []), newObjective];
      const newTotalXp = (targetData.totalXpEarned || 0) + objectiveData.xpReward;

      // Mettre à jour ou créer le document de tracking pour l'ALTERNANT
      console.log('📝 [VALIDATION] Recherche tracking existant...');
      const altRef = collection(db, 'alternance_tracking');
      const docRef = await getDocs(query(altRef, where('userId', '==', alternantUserId)));
      console.log('📝 [VALIDATION] Tracking existant:', !docRef.empty);

      if (!docRef.empty) {
        const { updateDoc, doc: docFn } = await import('firebase/firestore');
        await updateDoc(docFn(db, 'alternance_tracking', docRef.docs[0].id), {
          completedObjectives: updatedObjectives,
          totalXpEarned: newTotalXp,
          updatedAt: serverTimestamp()
        });
        console.log('✅ [VALIDATION] Tracking mis à jour');
      } else {
        // Créer le document pour cet alternant
        await addDoc(collection(db, 'alternance_tracking'), {
          userId: alternantUserId,
          userName: alternantUserName,
          completedObjectives: updatedObjectives,
          totalXpEarned: newTotalXp,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log('✅ [VALIDATION] Nouveau tracking créé');
      }

      // 🎯 IMPORTANT: Ajouter l'XP au profil de L'ALTERNANT (pas du tuteur!)
      try {
        const { doc: docFn, updateDoc, increment } = await import('firebase/firestore');
        await updateDoc(docFn(db, 'users', alternantUserId), {
          'gamification.totalXp': increment(objectiveData.xpReward),
          'gamification.xp': increment(objectiveData.xpReward),
          'gamification.lastXpGain': {
            amount: objectiveData.xpReward,
            source: 'school_objective',
            objectiveId: objectiveData.objectiveId,
            validatedBy: user.uid,
            timestamp: new Date().toISOString()
          }
        });
        console.log(`✅ [ALTERNANCE] +${objectiveData.xpReward} XP ajoutés à ${alternantUserName}`);
      } catch (xpError) {
        console.error('Erreur ajout XP:', xpError);
      }

      // Mettre à jour l'état local
      setAlternanceData(prev => ({
        ...prev,
        completedObjectives: updatedObjectives,
        totalXpEarned: newTotalXp
      }));

      // Mettre à jour aussi dans tutoredAlternants si applicable
      setTutoredAlternants(prev => prev.map(alt =>
        alt.userId === alternantUserId
          ? { ...alt, completedObjectives: updatedObjectives, totalXpEarned: newTotalXp }
          : alt
      ));

      alert(`✅ Objectif validé pour ${alternantUserName} ! +${objectiveData.xpReward} XP`);
      return true;
    } catch (error) {
      console.error('❌ [VALIDATION] Erreur complète:', error);
      console.error('❌ [VALIDATION] Message:', error.message);
      console.error('❌ [VALIDATION] Code:', error.code);
      alert(`❌ Erreur lors de la validation: ${error.message}`);
      return false;
    }
  };

  // Fonction pour supprimer une formation (admin uniquement)
  const handleDeleteTraining = async (trainingId) => {
    if (!user?.isAdmin && user?.role !== 'admin') {
      alert('❌ Vous n\'avez pas les droits pour supprimer une formation');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'hr_trainings', trainingId));
      setTrainings(prev => prev.filter(t => t.id !== trainingId));
      alert('✅ Formation supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression formation:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Fonction pour modifier le statut d'une formation (admin uniquement)
  const handleUpdateTrainingStatus = async (trainingId, newStatus) => {
    if (!user?.isAdmin && user?.role !== 'admin') {
      alert('❌ Vous n\'avez pas les droits pour modifier une formation');
      return;
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'hr_trainings', trainingId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setTrainings(prev => prev.map(t =>
        t.id === trainingId ? { ...t, status: newStatus } : t
      ));
      alert('✅ Formation mise à jour');
    } catch (error) {
      console.error('Erreur mise à jour formation:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  // Vérifier si l'utilisateur est admin
  const isUserAdmin = user?.isAdmin || user?.role === 'admin';

  // Stats formations
  const trainingStats = {
    totalTrainings: trainings.length,
    completedThisYear: trainings.filter(t => {
      const date = t.date?.toDate?.() || new Date(t.date);
      return date.getFullYear() === new Date().getFullYear() && t.status === 'completed';
    }).length,
    upcomingTrainings: trainings.filter(t => {
      const date = t.date?.toDate?.() || new Date(t.date);
      return date > new Date() && t.status === 'scheduled';
    }).length,
    expiringCerts: certifications.filter(c => {
      const expiry = c.expiryDate?.toDate?.() || new Date(c.expiryDate);
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      return expiry <= threeMonths && expiry > new Date();
    }).length
  };

  // Sessions filtrees
  const filteredSessions = useMemo(() => {
    if (filter === 'mentor') return sessions.filter(s => s.role === 'mentor');
    if (filter === 'mentee') return sessions.filter(s => s.role === 'mentee');
    return sessions;
  }, [sessions, filter]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Chargement des sessions...</p>
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
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-8 max-w-6xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  🎓 Académie
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Mentorat, formations et partage de connaissances
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 text-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle Session</span>
              <span className="sm:hidden">Nouvelle</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <StatsCards stats={stats} />

          {/* Sessions en cours highlight */}
          {inProgressSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <h2 className="text-base sm:text-lg font-bold text-yellow-400 mb-3 sm:mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <Play className="w-4 h-4" />
                </div>
                Sessions en cours ({inProgressSessions.length})
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {inProgressSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    currentUserId={user?.uid}
                    onStart={startSession}
                    onComplete={completeSession}
                    onCancel={cancelSession}
                    onFeedback={setFeedbackSession}
                    onAddDocument={addDocument}
                    onRemoveDocument={removeDocument}
                    onEdit={setEditSession}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Filter className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Filtrer:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {[
                { id: 'all', label: 'Toutes' },
                { id: 'mentor', label: 'Mentor' },
                { id: 'mentee', label: 'Mentee' }
              ].map(f => (
                <motion.button
                  key={f.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
              >
                <div className="text-4xl sm:text-6xl mb-4">🎓</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Aucune session</h3>
                <p className="text-gray-400 text-sm mb-6 px-4">
                  Commencez a partager vos connaissances ou trouvez un mentor
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 text-sm"
                >
                  Creer ma premiere session
                </motion.button>
              </motion.div>
            ) : (
              filteredSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={user?.uid}
                  onStart={startSession}
                  onComplete={completeSession}
                  onCancel={cancelSession}
                  onFeedback={setFeedbackSession}
                  onAddDocument={addDocument}
                  onRemoveDocument={removeDocument}
                  onEdit={setEditSession}
                />
              ))
            )}
          </div>

          {/* ==========================================
              🤝 SECTION PARRAINAGE
              ========================================== */}
          <div className="mt-8 sm:mt-10">
            <SponsorshipSection />
          </div>

          {/* ==========================================
              🎓 SECTION FORMATIONS & CERTIFICATIONS
              ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 sm:mt-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-500/30 to-orange-500/20 backdrop-blur-xl border border-white/10 rounded-xl">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Formations & Certifications</h2>
                  <p className="text-gray-400 text-sm">Suivi du plan de formation</p>
                </div>
              </div>
              <div className="flex gap-2">
                {['trainings', 'certifications', 'plan'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveTrainingView(view)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      activeTrainingView === view
                        ? 'bg-amber-600 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {view === 'trainings' ? 'Formations' : view === 'certifications' ? 'Certifications' : 'Plan annuel'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Formations */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-gray-400">Formations</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-400">{trainingStats.totalTrainings}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">Complétées</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-400">{trainingStats.completedThisYear}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">À venir</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-purple-400">{trainingStats.upcomingTrainings}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">Certifs expirantes</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-orange-400">{trainingStats.expiringCerts}</div>
              </div>
            </div>

            {/* Alerte certifications expirantes */}
            {trainingStats.expiringCerts > 0 && (
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 text-sm">
                    {trainingStats.expiringCerts} certification(s) expire(nt) dans les 3 prochains mois
                  </span>
                </div>
              </div>
            )}

            {/* Types de formations - Filtres cliquables */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-6">
              <button
                onClick={() => setSelectedTrainingType('all')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedTrainingType === 'all'
                    ? 'bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-1">📋</div>
                <div className={`text-xs ${selectedTrainingType === 'all' ? 'text-amber-300' : 'text-gray-300'}`}>Toutes</div>
              </button>
              {trainingTypes.map((type) => {
                const count = trainings.filter(t => t.type === type.id).length;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTrainingType(type.id)}
                    className={`p-3 rounded-xl border text-center transition-all relative ${
                      selectedTrainingType === type.id
                        ? 'bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className={`text-xs ${selectedTrainingType === type.id ? 'text-amber-300' : 'text-gray-300'}`}>
                      {type.label}
                    </div>
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full text-white text-xs flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contenu selon la vue */}
            {trainingsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500 mx-auto mb-4" />
                <p className="text-gray-400">Chargement...</p>
              </div>
            ) : activeTrainingView === 'trainings' ? (
              filteredTrainings.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">
                    {selectedTrainingType === 'all'
                      ? 'Aucune formation enregistrée'
                      : `Aucune formation de type "${trainingTypes.find(t => t.id === selectedTrainingType)?.label}"`}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {isUserAdmin ? 'Commencez à planifier les formations' : 'Les formations seront affichées ici'}
                  </p>
                  {isUserAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddTrainingModal(true)}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une formation
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Bouton ajouter (admin uniquement) */}
                  {isUserAdmin && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShowAddTrainingModal(true)}
                      className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-dashed border-white/20 text-gray-400 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter une formation
                    </motion.button>
                  )}
                  {filteredTrainings.map((training) => {
                    const type = trainingTypes.find(t => t.id === training.type) || trainingTypes[0];
                    const date = training.date?.toDate?.() || new Date(training.date);

                    return (
                      <motion.div
                        key={training.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg">
                              {type.icon}
                            </div>
                            <div>
                              <div className="font-medium text-white">{training.title}</div>
                              <div className="text-sm text-gray-400">
                                {type.label} • {date.toLocaleDateString('fr-FR')}
                                {training.location && ` • ${training.location}`}
                              </div>
                              {training.description && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-1">{training.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Statut */}
                            <span className={`px-2 py-1 rounded text-xs ${
                              training.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : training.status === 'scheduled'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {training.status === 'completed' ? 'Complétée' : training.status === 'scheduled' ? 'Planifiée' : 'Annulée'}
                            </span>

                            {/* Boutons admin */}
                            {isUserAdmin && (
                              <div className="flex items-center gap-1 ml-2">
                                {/* Menu de changement de statut */}
                                <select
                                  value={training.status}
                                  onChange={(e) => handleUpdateTrainingStatus(training.id, e.target.value)}
                                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
                                >
                                  <option value="scheduled" className="bg-slate-800">Planifiée</option>
                                  <option value="completed" className="bg-slate-800">Complétée</option>
                                  <option value="cancelled" className="bg-slate-800">Annulée</option>
                                </select>
                                {/* Bouton supprimer */}
                                <button
                                  onClick={() => handleDeleteTraining(training.id)}
                                  className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                                  title="Supprimer la formation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            ) : activeTrainingView === 'certifications' ? (
              <div className="space-y-3">
                {certifications.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                    <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune certification enregistrée</p>
                  </div>
                ) : (
                  certifications.map((cert) => {
                    const expiry = cert.expiryDate?.toDate?.() || new Date(cert.expiryDate);
                    const isExpiring = expiry <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                    const isExpired = expiry < new Date();

                    return (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 rounded-xl border ${
                          isExpired
                            ? 'bg-red-500/10 border-red-500/30'
                            : isExpiring
                            ? 'bg-orange-500/10 border-orange-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{cert.name}</div>
                            <div className="text-sm text-gray-400">
                              Expire le {expiry.toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          {isExpired ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                              Expiré
                            </span>
                          ) : isExpiring ? (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                              Expire bientôt
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              Valide
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Plan de formation annuel */
              <div className="space-y-4">
                {/* Résumé annuel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-blue-300 font-medium mb-2">📅 Prévues cette année</h4>
                    <div className="text-3xl font-bold text-white">{trainings.filter(t => {
                      const d = t.date?.toDate?.() || new Date(t.date);
                      return d.getFullYear() === new Date().getFullYear();
                    }).length}</div>
                    <p className="text-gray-400 text-sm mt-1">formations planifiées</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                    <h4 className="text-green-300 font-medium mb-2">✅ Réalisées</h4>
                    <div className="text-3xl font-bold text-white">{trainingStats.completedThisYear}</div>
                    <p className="text-gray-400 text-sm mt-1">formations complétées</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <h4 className="text-purple-300 font-medium mb-2">⏳ À venir</h4>
                    <div className="text-3xl font-bold text-white">{trainingStats.upcomingTrainings}</div>
                    <p className="text-gray-400 text-sm mt-1">formations à venir</p>
                  </div>
                </div>

                {/* Calendrier simplifié par mois */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    Calendrier des formations {new Date().getFullYear()}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].map((month, index) => {
                      const monthTrainings = trainings.filter(t => {
                        const d = t.date?.toDate?.() || new Date(t.date);
                        return d.getMonth() === index && d.getFullYear() === new Date().getFullYear();
                      });
                      const isPast = index < new Date().getMonth();
                      const isCurrent = index === new Date().getMonth();
                      return (
                        <div
                          key={month}
                          className={`p-3 rounded-lg text-center transition-all ${
                            isCurrent
                              ? 'bg-amber-500/30 border-2 border-amber-500'
                              : isPast
                              ? 'bg-white/5 border border-white/5'
                              : 'bg-white/5 border border-white/10'
                          }`}
                        >
                          <div className={`text-xs font-medium ${isCurrent ? 'text-amber-300' : 'text-gray-400'}`}>
                            {month}
                          </div>
                          <div className={`text-lg font-bold mt-1 ${
                            monthTrainings.length > 0 ? 'text-white' : 'text-gray-600'
                          }`}>
                            {monthTrainings.length}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Liste des formations à venir */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Prochaines formations
                  </h4>
                  {trainingStats.upcomingTrainings === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>Aucune formation planifiée</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveTrainingView('trainings');
                          setShowAddTrainingModal(true);
                        }}
                        className="mt-3 text-amber-400 hover:text-amber-300 text-sm"
                      >
                        + Planifier une formation
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {trainings
                        .filter(t => {
                          const d = t.date?.toDate?.() || new Date(t.date);
                          return d > new Date() && t.status === 'scheduled';
                        })
                        .sort((a, b) => {
                          const dA = a.date?.toDate?.() || new Date(a.date);
                          const dB = b.date?.toDate?.() || new Date(b.date);
                          return dA - dB;
                        })
                        .slice(0, 5)
                        .map(training => {
                          const type = trainingTypes.find(t => t.id === training.type) || trainingTypes[0];
                          const date = training.date?.toDate?.() || new Date(training.date);
                          return (
                            <div key={training.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                              <span className="text-xl">{type.icon}</span>
                              <div className="flex-1">
                                <div className="text-white text-sm font-medium">{training.title}</div>
                                <div className="text-gray-500 text-xs">{date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* ==========================================
              🎓 SECTION ALTERNANCE - PARCOURS SCOLAIRE
              ========================================== */}
          {(isAlternant || isTutor || user?.isAdmin) && (
            <AlternanceSection
              user={user}
              alternanceData={alternanceData}
              onValidateObjective={handleValidateSchoolObjective}
              onCreateObjective={handleCreateObjective}
              onUpdateObjective={handleUpdateObjective}
              onDeleteObjective={handleDeleteObjective}
              customObjectives={customObjectives}
              isAdmin={user?.isAdmin || user?.role === 'admin'}
              isTutor={isTutor}
              isAlternant={isAlternant}
              tutoredAlternants={tutoredAlternants}
            />
          )}

        </div>
      </div>

      {/* Modal Creation */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createSession}
        availableUsers={availableUsers}
        currentUser={user}
        SESSION_TYPES={SESSION_TYPES}
        MENTORING_TOPICS={MENTORING_TOPICS}
        DIFFICULTY_LEVELS={DIFFICULTY_LEVELS}
      />

      {/* Modal Feedback */}
      <FeedbackModal
        isOpen={!!feedbackSession}
        onClose={() => setFeedbackSession(null)}
        session={feedbackSession}
        onSubmit={submitFeedback}
        FEEDBACK_RATINGS={FEEDBACK_RATINGS}
      />

      {/* Modal Edition Session */}
      <EditSessionModal
        isOpen={!!editSession}
        onClose={() => setEditSession(null)}
        session={editSession}
        onUpdate={updateSession}
        SESSION_TYPES={SESSION_TYPES}
        DIFFICULTY_LEVELS={DIFFICULTY_LEVELS}
      />

      {/* Modal Ajout Formation */}
      <AddTrainingModal
        isOpen={showAddTrainingModal}
        onClose={() => setShowAddTrainingModal(false)}
        trainingTypes={trainingTypes}
        onAdd={async (trainingData) => {
          try {
            const trainingsRef = collection(db, 'hr_trainings');
            const docRef = await addDoc(trainingsRef, {
              ...trainingData,
              createdAt: serverTimestamp(),
              createdBy: user?.uid,
              status: 'scheduled'
            });
            // Ajouter à la liste locale
            setTrainings(prev => [{
              id: docRef.id,
              ...trainingData,
              status: 'scheduled'
            }, ...prev]);
            return { success: true };
          } catch (error) {
            console.error('Erreur ajout formation:', error);
            return { success: false, error };
          }
        }}
      />
    </Layout>
  );
};

// ==========================================
// MODAL AJOUT FORMATION
// ==========================================

const AddTrainingModal = ({ isOpen, onClose, trainingTypes, onAdd }) => {
  const [form, setForm] = useState({
    title: '',
    type: 'internal',
    date: '',
    duration: '1',
    description: '',
    location: '',
    trainer: ''
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;

    setSaving(true);
    const result = await onAdd({
      ...form,
      date: new Date(form.date),
      duration: parseInt(form.duration) || 1
    });

    if (result.success) {
      onClose();
      setForm({
        title: '',
        type: 'internal',
        date: '',
        duration: '1',
        description: '',
        location: '',
        trainer: ''
      });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Nouvelle Formation
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre de la formation *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Formation sécurité incendie"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            {/* Type de formation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de formation
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {trainingTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: type.id }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      form.type === type.id
                        ? 'bg-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xl mb-1">{type.icon}</div>
                    <div className={`text-xs ${form.type === type.id ? 'text-amber-300' : 'text-gray-400'}`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date et durée */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Durée (jours)
                </label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="1" className="bg-gray-800">1 jour</option>
                  <option value="2" className="bg-gray-800">2 jours</option>
                  <option value="3" className="bg-gray-800">3 jours</option>
                  <option value="5" className="bg-gray-800">5 jours</option>
                  <option value="10" className="bg-gray-800">10 jours</option>
                </select>
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lieu
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Ex: Salle de réunion, En ligne..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Formateur */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Formateur / Organisme
              </label>
              <input
                type="text"
                value={form.trainer}
                onChange={(e) => setForm(f => ({ ...f, trainer: e.target.value }))}
                placeholder="Ex: Marie Dupont, AFPA..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Objectifs et contenu de la formation..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-white/10 bg-slate-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !form.title || !form.date}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Ajouter la formation'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default MentoringPage;
