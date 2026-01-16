// ==========================================
// AlternanceSection - Apprenticeship objectives management
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Zap, Trophy, School, PenTool, ClipboardCheck, Medal, Sparkles,
  X, Check, Plus, Edit3, Trash2, Users, User, ChevronRight
} from 'lucide-react';

// School objectives constants - Objectifs par défaut
export const SCHOOL_OBJECTIVES = [
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
    id: 'good_grade',
    category: 'notes',
    title: 'Bonne note obtenue',
    description: 'Note supérieure à 14/20 sur un examen',
    icon: Medal,
    xpReward: 200,
    color: 'amber',
    frequency: 'per_event'
  },
  {
    id: 'excellent_grade',
    category: 'notes',
    title: 'Excellence académique',
    description: 'Note supérieure à 16/20 sur un examen',
    icon: Trophy,
    xpReward: 300,
    color: 'yellow',
    frequency: 'per_event'
  },
  {
    id: 'semester_pass',
    category: 'milestones',
    title: 'Semestre validé',
    description: 'Validation de tous les modules du semestre',
    icon: Target,
    xpReward: 300,
    color: 'purple',
    frequency: 'semester'
  },
  {
    id: 'year_pass',
    category: 'milestones',
    title: 'Année validée',
    description: 'Passage en année supérieure confirmé',
    icon: School,
    xpReward: 500,
    color: 'blue',
    frequency: 'yearly'
  },
  {
    id: 'diploma',
    category: 'milestones',
    title: 'Diplôme obtenu !',
    description: 'Félicitations ! Diplôme en poche !',
    icon: Sparkles,
    xpReward: 1000,
    color: 'gradient',
    frequency: 'once'
  }
];

export const OBJECTIVE_CATEGORIES = {
  presence: { label: 'Présence', icon: ClipboardCheck, color: 'emerald' },
  notes: { label: 'Notes', icon: Medal, color: 'amber' },
  travaux: { label: 'Travaux', icon: PenTool, color: 'blue' },
  projets: { label: 'Projets', icon: Target, color: 'purple' },
  competences: { label: 'Compétences', icon: Zap, color: 'cyan' },
  milestones: { label: 'Étapes clés', icon: Trophy, color: 'indigo' }
};

const AlternanceSection = ({
  user,
  onValidateObjective,
  onCreateObjective,
  onUpdateObjective,
  onDeleteObjective,
  alternanceData,
  isAdmin,
  isTutor,
  isAlternant,
  tutoredAlternants = [],
  customObjectives = [],
  deletedObjectiveIds = [],
  modifiedObjectives = {}
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [validationNote, setValidationNote] = useState('');
  const [selectedAlternantId, setSelectedAlternantId] = useState(null);

  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    xpReward: 50,
    category: 'work',
    color: 'blue',
    targetType: 'all',
    targetUserId: null,
    targetUserIds: []
  });

  const currentAlternantData = selectedAlternantId
    ? tutoredAlternants.find(a => a.id === selectedAlternantId) || alternanceData
    : alternanceData;

  const viewedAlternantUserId = currentAlternantData?.userId || currentAlternantData?.id || user?.uid;

  const allObjectives = [
    ...SCHOOL_OBJECTIVES
      .filter(obj => !deletedObjectiveIds.includes(obj.id))
      .map(obj => {
        const mods = modifiedObjectives[obj.id];
        return mods ? { ...obj, ...mods, isModifiedDefault: true, targetType: mods.targetType || 'all' } : { ...obj, targetType: 'all' };
      }),
    ...customObjectives.map(obj => ({
      ...obj,
      icon: OBJECTIVE_CATEGORIES[obj.category]?.icon || Target,
      isCustom: true,
      targetType: obj.targetType || 'all'
    }))
  ]
    .filter(obj => {
      if (obj.targetType === 'all') return true;
      if (obj.targetType === 'specific' && obj.targetUserId === viewedAlternantUserId) return true;
      if (obj.targetType === 'multiple' && obj.targetUserIds?.includes(viewedAlternantUserId)) return true;
      return false;
    });

  const canValidate = isTutor || isAdmin;

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

  const progressPercent = Math.min(
    ((alternantInfo.currentYear - 1) / alternantInfo.totalYears) * 100 +
    (alternantInfo.completedObjectives?.length || 0) * 2,
    100
  );

  const filteredObjectives = selectedCategory === 'all'
    ? allObjectives
    : allObjectives.filter(obj => obj.category === selectedCategory);

  const handleOpenCreateObjective = () => {
    setEditingObjective(null);
    setObjectiveForm({
      title: '',
      description: '',
      xpReward: 50,
      category: 'work',
      color: 'blue',
      targetType: 'all',
      targetUserId: null,
      targetUserIds: []
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
      color: objective.color || 'blue',
      targetType: objective.targetType || 'all',
      targetUserId: objective.targetUserId || null,
      targetUserIds: objective.targetUserIds || []
    });
    setShowObjectiveModal(true);
  };

  const handleSaveObjective = () => {
    if (!objectiveForm.title.trim()) {
      alert('Le titre est requis');
      return;
    }

    // Validation: si ciblage spécifique, vérifier qu'un alternant est sélectionné
    if (objectiveForm.targetType === 'specific' && !objectiveForm.targetUserId) {
      alert('Veuillez sélectionner un alternant pour un objectif ciblé');
      return;
    }

    // Validation: si ciblage multiple, vérifier qu'au moins un alternant est sélectionné
    if (objectiveForm.targetType === 'multiple' && (!objectiveForm.targetUserIds || objectiveForm.targetUserIds.length === 0)) {
      alert('Veuillez sélectionner au moins un alternant');
      return;
    }

    if (editingObjective) {
      if (editingObjective.isCustom) {
        onUpdateObjective(editingObjective.id, objectiveForm);
      } else {
        onUpdateObjective(editingObjective.id, objectiveForm, true);
      }
    } else {
      onCreateObjective(objectiveForm);
    }
    setShowObjectiveModal(false);
  };

  const handleDeleteObjective = (objective) => {
    if (window.confirm(`Supprimer l'objectif "${objective.title}" ?`)) {
      onDeleteObjective(objective.id, objective.isCustom);
    }
  };

  const handleValidate = (objective) => {
    setSelectedObjective(objective);
    setValidationNote('');
    setShowValidateModal(true);
  };

  // Confirmer la validation d'un objectif - passer un objet complet + l'alternant cible
  const confirmValidation = async () => {
    if (!selectedObjective || !onValidateObjective) {
      setShowValidateModal(false);
      return;
    }

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

  // Vérifier si un objectif a été validé (completedObjectives contient des OBJETS avec objectiveId)
  const isObjectiveCompleted = (objectiveId) => {
    return alternantInfo.completedObjectives?.some(c => c.objectiveId === objectiveId);
  };

  // Obtenir le nombre de validations d'un objectif (pour les objectifs répétables)
  const getObjectiveCount = (objectiveId) => {
    return alternantInfo.completedObjectives?.filter(c => c.objectiveId === objectiveId).length || 0;
  };

  const getColorClasses = (color) => {
    const colors = {
      emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' },
      amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500 to-yellow-500' },
      yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', gradient: 'from-yellow-400 to-amber-400' },
      cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-500' },
      indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400', gradient: 'from-indigo-500 to-purple-500' },
      rose: { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-400', gradient: 'from-rose-500 to-pink-500' },
      pink: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500 to-rose-500' },
      gradient: { bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500 to-pink-500' }
    };
    return colors[color] || colors.blue;
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
              <School className="w-7 h-7 text-indigo-300" />
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {/* Afficher le nom de l'alternant si tuteur/admin avec sélection */}
              {canValidate && currentAlternantData?.userName ? (
                <>
                  {currentAlternantData.userName}
                  <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs rounded-full">
                    Alternant
                  </span>
                </>
              ) : (
                <>
                  Parcours Alternance
                  <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs rounded-full">
                    {isAlternant ? 'Mon parcours' : isTutor ? 'Tuteur' : 'Admin'}
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

        {/* Sélecteur d'alternant + stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {canValidate && tutoredAlternants.length > 0 && (
            <select
              value={selectedAlternantId || ''}
              onChange={(e) => setSelectedAlternantId(e.target.value || null)}
              className="px-3 py-2 bg-slate-800 border border-white/20 rounded-xl text-white text-sm focus:border-indigo-500 focus:outline-none min-w-[200px]"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" className="bg-slate-800 text-white">
                Choisir un alternant...
              </option>
              {tutoredAlternants.map(alt => (
                <option key={alt.id} value={alt.id} className="bg-slate-800 text-white">
                  {alt.userName || alt.displayName || alt.name || alt.email || 'Alternant'}
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
          </div>
          <p className="text-gray-400 text-xs text-center">
            Continue comme ça ! Chaque objectif te rapproche du diplôme
          </p>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="relative flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Tous ({allObjectives.length})
        </button>
        {Object.entries(OBJECTIVE_CATEGORIES).map(([key, cat]) => {
          const count = allObjectives.filter(o => o.category === key).length;
          if (count === 0) return null;
          const Icon = cat.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === key
                  ? `bg-${cat.color}-500/20 text-${cat.color}-400`
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Liste des objectifs - Grille 3 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredObjectives.map((objective) => {
          const Icon = objective.icon || Target;
          const colorClasses = getColorClasses(objective.color);
          const isCompleted = isObjectiveCompleted(objective.id);
          const count = getObjectiveCount(objective.id);
          // Un objectif est répétable si sa fréquence n'est pas 'once'
          const isRepeatable = objective.frequency !== 'once';
          // Peut valider si: tuteur/admin ET (pas encore validé OU répétable)
          const canValidateThis = canValidate && (!isCompleted || isRepeatable);

          return (
            <motion.div
              key={objective.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative p-4 rounded-xl border transition-all ${
                isCompleted
                  ? `${colorClasses.bg} ${colorClasses.border} ring-1 ring-${objective.color}-500/30`
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Badge XP en haut à droite */}
              <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border}`}>
                +{objective.xpReward} XP
              </div>

              {/* Boutons edit/delete pour tuteur/admin */}
              {canValidate && (
                <div className="absolute top-2 right-12 flex gap-1">
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
                <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                  <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm mb-0.5 flex items-center gap-2">
                    {objective.title}
                    {isCompleted && <Check className="w-4 h-4 text-emerald-400" />}
                  </h4>
                  <p className="text-gray-400 text-xs line-clamp-2">{objective.description}</p>

                  {/* Indicateur de ciblage */}
                  <div className="mt-1.5 flex items-center gap-1">
                    {objective.targetType === 'specific' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <User className="w-2.5 h-2.5" />
                        {tutoredAlternants.find(a => (a.userId || a.id) === objective.targetUserId)?.userName ||
                         tutoredAlternants.find(a => (a.userId || a.id) === objective.targetUserId)?.displayName ||
                         '1 alternant'}
                      </span>
                    ) : objective.targetType === 'multiple' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Users className="w-2.5 h-2.5" />
                        {objective.targetUserIds?.length || 0} alternants
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <Users className="w-2.5 h-2.5" />
                        Tous
                      </span>
                    )}
                  </div>

                  {/* Compteur si validé et répétable */}
                  {count > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Validé {count} fois
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton valider (tuteur ou admin) */}
              {canValidate && (
                <button
                  onClick={() => handleValidate(objective)}
                  disabled={isCompleted && !isRepeatable}
                  className={`mt-3 w-full py-2 rounded-lg text-xs font-medium transition-all ${
                    isCompleted && !isRepeatable
                      ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${colorClasses.gradient || `from-${objective.color}-500 to-${objective.color}-600`} text-white hover:opacity-90`
                  }`}
                >
                  {isCompleted && !isRepeatable ? '✓ Déjà validé' : 'Valider cet objectif'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bouton créer objectif (tuteur/admin) */}
      {canValidate && (
        <div className="mt-4">
          <button
            onClick={handleOpenCreateObjective}
            className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer un objectif personnalisé
          </button>
        </div>
      )}

      {/* Modal validation */}
      <AnimatePresence>
        {showValidateModal && selectedObjective && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowValidateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Valider l'objectif</h3>
              <p className="text-gray-400 mb-4">
                Confirmer la validation de "<span className="text-white">{selectedObjective.title}</span>" ?
              </p>
              <textarea
                value={validationNote}
                onChange={(e) => setValidationNote(e.target.value)}
                placeholder="Note de validation (optionnel)..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mb-4 h-24 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowValidateModal(false)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmValidation}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Valider (+{selectedObjective.xpReward} XP)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal création/édition objectif */}
      <AnimatePresence>
        {showObjectiveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowObjectiveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl border border-white/10 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editingObjective ? 'Modifier l\'objectif' : 'Créer un objectif'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={objectiveForm.title}
                    onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                    placeholder="Ex: Rapport mensuel validé"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={objectiveForm.description}
                    onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white h-20 resize-none"
                    placeholder="Description de l'objectif..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">XP Récompense</label>
                    <input
                      type="number"
                      value={objectiveForm.xpReward}
                      onChange={(e) => setObjectiveForm({ ...objectiveForm, xpReward: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                      min="0"
                      max="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Catégorie</label>
                    <select
                      value={objectiveForm.category}
                      onChange={(e) => setObjectiveForm({ ...objectiveForm, category: e.target.value })}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-2 text-white"
                      style={{ colorScheme: 'dark' }}
                    >
                      {Object.entries(OBJECTIVE_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key} className="bg-slate-800 text-white">{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ciblage */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Cible de l'objectif</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={objectiveForm.targetType === 'all'}
                        onChange={() => setObjectiveForm({ ...objectiveForm, targetType: 'all', targetUserId: null, targetUserIds: [] })}
                        className="text-purple-500"
                      />
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">Tous les alternants</span>
                    </label>

                    {tutoredAlternants.length > 0 && (
                      <>
                        {/* Option: Plusieurs alternants */}
                        <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="targetType"
                            checked={objectiveForm.targetType === 'multiple'}
                            onChange={() => setObjectiveForm({ ...objectiveForm, targetType: 'multiple', targetUserId: null })}
                            className="text-purple-500"
                          />
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white text-sm">Plusieurs alternants</span>
                        </label>

                        {objectiveForm.targetType === 'multiple' && (
                          <div className="ml-6 bg-white/5 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
                            <p className="text-xs text-gray-500 mb-2">Cochez les alternants concernés :</p>
                            {tutoredAlternants.map(alt => {
                              const altId = alt.userId || alt.id;
                              const isChecked = objectiveForm.targetUserIds?.includes(altId);
                              return (
                                <label
                                  key={alt.id}
                                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setObjectiveForm(prev => ({
                                          ...prev,
                                          targetUserIds: [...(prev.targetUserIds || []), altId]
                                        }));
                                      } else {
                                        setObjectiveForm(prev => ({
                                          ...prev,
                                          targetUserIds: (prev.targetUserIds || []).filter(id => id !== altId)
                                        }));
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                                  />
                                  <span className="text-white text-sm">
                                    {alt.userName || alt.displayName || alt.name || alt.email || 'Alternant'}
                                  </span>
                                </label>
                              );
                            })}
                            {objectiveForm.targetUserIds?.length > 0 && (
                              <p className="text-xs text-purple-400 mt-2 pt-2 border-t border-white/10">
                                {objectiveForm.targetUserIds.length} alternant{objectiveForm.targetUserIds.length > 1 ? 's' : ''} sélectionné{objectiveForm.targetUserIds.length > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Option: Un alternant spécifique */}
                        <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="targetType"
                            checked={objectiveForm.targetType === 'specific'}
                            onChange={() => setObjectiveForm({ ...objectiveForm, targetType: 'specific', targetUserIds: [] })}
                            className="text-purple-500"
                          />
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-white text-sm">Un alternant spécifique</span>
                        </label>

                        {objectiveForm.targetType === 'specific' && (
                          <select
                            value={objectiveForm.targetUserId || ''}
                            onChange={(e) => setObjectiveForm({ ...objectiveForm, targetUserId: e.target.value })}
                            className="w-full bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm ml-6"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="" className="bg-slate-800 text-white">Sélectionner...</option>
                            {tutoredAlternants.map(alt => (
                              <option key={alt.id} value={alt.userId || alt.id} className="bg-slate-800 text-white">{alt.userName || alt.displayName || alt.name || alt.email || 'Alternant'}</option>
                            ))}
                          </select>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowObjectiveModal(false)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveObjective}
                  className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white transition-all"
                >
                  {editingObjective ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AlternanceSection;
