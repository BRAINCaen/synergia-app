// ==========================================
// AlternanceSection - Apprenticeship objectives management
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Zap, Trophy, School, PenTool, ClipboardCheck, Medal, Sparkles,
  X, Check, Plus, Edit3, Trash2, Users, User, ChevronRight
} from 'lucide-react';

// School objectives constants
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
    id: 'school_grades',
    category: 'academic',
    title: 'Excellence académique',
    description: 'Maintenir une moyenne supérieure à 14/20',
    icon: School,
    xpReward: 100,
    color: 'blue',
    frequency: 'semester'
  },
  {
    id: 'project_delivery',
    category: 'work',
    title: 'Projet rendu à temps',
    description: 'Livrer un projet/rapport dans les délais',
    icon: Target,
    xpReward: 75,
    color: 'purple',
    frequency: 'project'
  },
  {
    id: 'presentation',
    category: 'communication',
    title: 'Présentation réussie',
    description: 'Présenter un travail devant un jury ou l\'équipe',
    icon: Medal,
    xpReward: 80,
    color: 'amber',
    frequency: 'event'
  },
  {
    id: 'initiative',
    category: 'work',
    title: 'Prise d\'initiative',
    description: 'Proposer une amélioration ou un nouveau projet',
    icon: Zap,
    xpReward: 60,
    color: 'cyan',
    frequency: 'quarterly'
  },
  {
    id: 'skills_progress',
    category: 'milestones',
    title: 'Progression compétences',
    description: 'Valider une nouvelle compétence technique',
    icon: Trophy,
    xpReward: 90,
    color: 'indigo',
    frequency: 'milestone'
  },
  {
    id: 'school_report',
    category: 'academic',
    title: 'Rapport de stage validé',
    description: 'Rendre un rapport de qualité validé par le tuteur',
    icon: PenTool,
    xpReward: 120,
    color: 'rose',
    frequency: 'annual'
  },
  {
    id: 'diploma_progress',
    category: 'milestones',
    title: 'Année validée',
    description: 'Valider son année scolaire avec succès',
    icon: Sparkles,
    xpReward: 200,
    color: 'gradient',
    frequency: 'annual'
  }
];

export const OBJECTIVE_CATEGORIES = {
  presence: { label: 'Présence', icon: ClipboardCheck, color: 'emerald' },
  academic: { label: 'Académique', icon: School, color: 'blue' },
  work: { label: 'Travail', icon: Target, color: 'purple' },
  communication: { label: 'Communication', icon: Medal, color: 'amber' },
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
      emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
      amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
      cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
      indigo: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', text: 'text-indigo-400' },
      rose: { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-400' },
      gradient: { bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', text: 'text-purple-400' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/30 rounded-xl">
              <School className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Parcours Alternance</h3>
              <p className="text-sm text-gray-400">{alternantInfo.schoolName} - {alternantInfo.diploma}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{alternantInfo.totalXpEarned || 0} XP</div>
            <div className="text-xs text-gray-400">gagnés cette année</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Année {alternantInfo.currentYear}/{alternantInfo.totalYears}</span>
            <span>{Math.round(progressPercent)}% du parcours</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Sélecteur d'alternant pour tuteurs/admins */}
        {(isTutor || isAdmin) && tutoredAlternants.length > 0 && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl">
            <label className="block text-xs text-gray-400 mb-2">Sélectionner un alternant :</label>
            <select
              value={selectedAlternantId || ''}
              onChange={(e) => setSelectedAlternantId(e.target.value || null)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">Mon profil</option>
              {tutoredAlternants.map(alt => (
                <option key={alt.id} value={alt.id}>
                  {alt.userName || alt.displayName || alt.name || alt.email || 'Alternant'} - {alt.schoolName || 'École non renseignée'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
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

      {/* Bouton créer objectif (tuteur/admin) */}
      {canValidate && (
        <button
          onClick={handleOpenCreateObjective}
          className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 text-purple-300 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Créer un objectif personnalisé</span>
        </button>
      )}

      {/* Liste des objectifs */}
      <div className="grid gap-4">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : `${colorClasses.bg} ${colorClasses.border}`
              }`}
            >
              {/* Badge custom/modified */}
              {(objective.isCustom || objective.isModifiedDefault) && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500/30 rounded-full text-[10px] text-purple-300">
                  {objective.isCustom ? 'Personnalisé' : 'Modifié'}
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${isCompleted ? 'bg-emerald-500/30' : colorClasses.bg}`}>
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold ${isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                      {objective.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isCompleted ? 'bg-emerald-500/30 text-emerald-300' : `${colorClasses.bg} ${colorClasses.text}`
                    }`}>
                      +{objective.xpReward} XP
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{objective.description}</p>

                  {/* Compteur pour objectifs répétables */}
                  {count > 0 && isRepeatable && (
                    <div className="mt-2 text-xs text-gray-500">
                      Validé {count} fois
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {canValidateThis && (
                      <button
                        onClick={() => handleValidate(objective)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm flex items-center gap-1 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        {isCompleted && isRepeatable ? 'Revalider' : 'Valider'}
                      </button>
                    )}
                    {canValidate && (
                      <>
                        <button
                          onClick={() => handleOpenEditObjective(objective)}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteObjective(objective)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    )}
                    {isCompleted && !canValidate && (
                      <span className="text-xs text-emerald-400">✓ Objectif validé !</span>
                    )}
                    {isCompleted && canValidate && !isRepeatable && (
                      <span className="text-xs text-emerald-400">✓ Déjà validé (unique)</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                    >
                      {Object.entries(OBJECTIVE_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.label}</option>
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
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm ml-6"
                          >
                            <option value="">Sélectionner...</option>
                            {tutoredAlternants.map(alt => (
                              <option key={alt.id} value={alt.userId || alt.id}>{alt.userName || alt.displayName || alt.name || alt.email || 'Alternant'}</option>
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
    </div>
  );
};

export default AlternanceSection;
