// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// TASK FORM AVEC SYSTÈME RÉCURRENCES XP ADAPTATIF COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Calendar, 
  Flag, 
  Star, 
  Tag,
  Target,
  Clock,
  User,
  Trophy,
  Repeat,
  Zap,
  TrendingUp,
  Info
} from 'lucide-react';

/**
 * 🔄 CONFIGURATION DES RÉCURRENCES AVEC XP ADAPTATIF
 */
const RECURRENCE_CONFIG = {
  none: {
    label: 'Tâche unique',
    icon: '📋',
    multiplier: 1,
    description: 'Tâche à faire une seule fois'
  },
  daily: {
    label: 'Quotidienne',
    icon: '📅',
    multiplier: 0.5, // Moins d'XP car très fréquent
    description: 'Se répète tous les jours',
    intervals: [1, 2, 3, 5, 7], // Tous les X jours
    defaultInterval: 1
  },
  weekly: {
    label: 'Hebdomadaire',
    icon: '📆',
    multiplier: 1.2, // XP standard+
    description: 'Se répète toutes les semaines',
    intervals: [1, 2, 3, 4], // Toutes les X semaines
    defaultInterval: 1
  },
  monthly: {
    label: 'Mensuelle',
    icon: '🗓️',
    multiplier: 2.5, // Plus d'XP car plus rare
    description: 'Se répète tous les mois',
    intervals: [1, 2, 3, 6], // Tous les X mois
    defaultInterval: 1
  },
  yearly: {
    label: 'Annuelle',
    icon: '📊',
    multiplier: 5, // Beaucoup d'XP car très rare
    description: 'Se répète tous les ans',
    intervals: [1], // Tous les X ans
    defaultInterval: 1
  }
};

/**
 * 🏆 CALCUL INTELLIGENT DES XP SELON RÉCURRENCE ET COMPLEXITÉ
 */
const calculateAdaptiveXP = (baseComplexity, priority, recurrenceType, interval = 1) => {
  // XP de base selon la complexité
  const baseXpMap = {
    'easy': 15,
    'medium': 25,
    'hard': 40,
    'expert': 60
  };
  
  // Multiplicateur de priorité
  const priorityMultiplier = {
    'low': 1,
    'medium': 1.2,
    'high': 1.5,
    'urgent': 2
  };
  
  // XP de base
  const baseXp = baseXpMap[baseComplexity] || 25;
  const priorityXp = baseXp * (priorityMultiplier[priority] || 1);
  
  // Multiplicateur de récurrence
  const recurrenceMultiplier = RECURRENCE_CONFIG[recurrenceType]?.multiplier || 1;
  
  // Multiplicateur d'intervalle (plus l'intervalle est grand, plus c'est rare)
  const intervalMultiplier = interval > 1 ? 1 + (interval - 1) * 0.2 : 1;
  
  // Calcul final arrondi
  return Math.round(priorityXp * recurrenceMultiplier * intervalMultiplier);
};

/**
 * 🎮 COMPOSANT PRINCIPAL DU FORMULAIRE DE TÂCHE
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = [],
  projects = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    complexity: 'medium',
    dueDate: '',
    category: '',
    projectId: '',
    assignedTo: '',
    tags: [],
    // 🔄 RÉCURRENCE
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: ''
  });

  const [newTag, setNewTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 🎯 Calcul XP en temps réel
  const [xpCalculation, setXpCalculation] = useState(null);

  /**
   * 🧮 RECALCUL AUTOMATIQUE DES XP
   */
  useEffect(() => {
    const finalXp = calculateAdaptiveXP(
      formData.complexity,
      formData.priority,
      formData.isRecurring ? formData.recurrenceType : 'none',
      formData.recurrenceInterval
    );

    const calculation = {
      baseXp: 25,
      priority: formData.priority,
      complexity: formData.complexity,
      recurrenceType: formData.isRecurring ? formData.recurrenceType : 'none',
      interval: formData.recurrenceInterval,
      finalXp,
      breakdown: {
        base: 25,
        priorityMultiplier: RECURRENCE_CONFIG.none.multiplier,
        recurrenceMultiplier: RECURRENCE_CONFIG[formData.isRecurring ? formData.recurrenceType : 'none']?.multiplier || 1,
        intervalMultiplier: formData.recurrenceInterval > 1 ? 1 + (formData.recurrenceInterval - 1) * 0.2 : 1
      }
    };

    setXpCalculation(calculation);
  }, [formData.complexity, formData.priority, formData.isRecurring, formData.recurrenceType, formData.recurrenceInterval]);

  /**
   * 🔄 INITIALISATION DU FORMULAIRE
   */
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        complexity: initialData.complexity || 'medium',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        category: initialData.category || '',
        projectId: initialData.projectId || '',
        assignedTo: initialData.assignedTo || '',
        tags: initialData.tags || [],
        isRecurring: initialData.isRecurring || false,
        recurrenceType: initialData.recurrenceType || 'none',
        recurrenceInterval: initialData.recurrenceInterval || 1,
        recurrenceEndDate: initialData.recurrenceEndDate ? new Date(initialData.recurrenceEndDate).toISOString().split('T')[0] : '',
        maxOccurrences: initialData.maxOccurrences || ''
      });
    } else {
      // Reset pour nouvelle tâche
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        complexity: 'medium',
        dueDate: '',
        category: '',
        projectId: '',
        assignedTo: '',
        tags: [],
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        maxOccurrences: ''
      });
    }
    
    setError(null);
    setNewTag('');
  }, [initialData, isOpen]);

  /**
   * 📝 SOUMISSION DU FORMULAIRE
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
        maxOccurrences: formData.maxOccurrences ? parseInt(formData.maxOccurrences) : null,
        // Métadonnées XP
        xpCalculation: xpCalculation,
        baseXpReward: xpCalculation?.finalXp || 25,
        // Métadonnées récurrence
        recurrenceConfig: formData.isRecurring ? RECURRENCE_CONFIG[formData.recurrenceType] : null
      };
      
      await onSubmit(taskData);
      console.log('✅ Tâche avec récurrence soumise:', taskData);
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError(error.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {initialData ? 'Modifier la tâche' : 'Nouvelle tâche'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formData.isRecurring ? 'Tâche récurrente avec XP adaptatif' : 'Tâche unique'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre de la tâche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la tâche *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Rapport hebdomadaire de performance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez les détails de la tâche..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                disabled={submitting}
              />
            </div>

            {/* Priorité et Complexité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Flag className="inline w-4 h-4 mr-1" />
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="low">🟢 Basse</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="high">🟠 Haute</option>
                  <option value="urgent">🔴 Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="inline w-4 h-4 mr-1" />
                  Complexité
                </label>
                <select
                  value={formData.complexity}
                  onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="easy">😊 Facile (15 XP base)</option>
                  <option value="medium">🤔 Moyenne (25 XP base)</option>
                  <option value="hard">😰 Difficile (40 XP base)</option>
                  <option value="expert">🤯 Expert (60 XP base)</option>
                </select>
              </div>
            </div>

            {/* Date d'échéance et Catégorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 🔄 SECTION RÉCURRENCE AVANCÉE */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Repeat className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Récurrence et XP Adaptatif</h3>
                  <p className="text-sm text-gray-600">Configurez la répétition automatique et les récompenses</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isRecurring: e.target.checked,
                      recurrenceType: e.target.checked ? 'daily' : 'none'
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span className="text-sm font-medium text-gray-700">Activer</span>
                </label>
              </div>

              {/* Types de récurrence */}
              {formData.isRecurring && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(RECURRENCE_CONFIG).filter(([key]) => key !== 'none').map(([key, config]) => (
                      <label
                        key={key}
                        className={`relative flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.recurrenceType === key
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="recurrenceType"
                          value={key}
                          checked={formData.recurrenceType === key}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            recurrenceType: e.target.value,
                            recurrenceInterval: RECURRENCE_CONFIG[e.target.value]?.defaultInterval || 1
                          }))}
                          className="sr-only"
                          disabled={submitting}
                        />
                        <div className="text-center">
                          <div className="text-lg mb-1">{config.icon}</div>
                          <div className="text-xs font-medium text-gray-900">{config.label}</div>
                          <div className="text-xs text-blue-600 font-semibold">×{config.multiplier}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Configuration de l'intervalle */}
                  {formData.isRecurring && RECURRENCE_CONFIG[formData.recurrenceType]?.intervals && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Intervalle
                        </label>
                        <select
                          value={formData.recurrenceInterval}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={submitting}
                        >
                          {RECURRENCE_CONFIG[formData.recurrenceType].intervals.map(interval => (
                            <option key={interval} value={interval}>
                              Tous les {interval} {formData.recurrenceType === 'daily' ? 'jour(s)' : 
                                         formData.recurrenceType === 'weekly' ? 'semaine(s)' :
                                         formData.recurrenceType === 'monthly' ? 'mois' : 'an(s)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de fin (optionnel)
                        </label>
                        <input
                          type="date"
                          value={formData.recurrenceEndDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nb max d'occurrences
                        </label>
                        <input
                          type="number"
                          value={formData.maxOccurrences}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxOccurrences: e.target.value }))}
                          placeholder="Illimité"
                          min="1"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🎯 PREVIEW XP ADAPTATIF */}
            {xpCalculation && (
              <div className="border border-yellow-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Récompense XP Calculée</h3>
                    <p className="text-sm text-gray-600">Basée sur la complexité, priorité et récurrence</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">{xpCalculation.finalXp}</div>
                    <div className="text-xs text-gray-500">XP par occurrence</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-gray-500">Complexité</div>
                    <div className="font-semibold">{formData.complexity}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-gray-500">Priorité</div>
                    <div className="font-semibold">{formData.priority}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-gray-500">Récurrence</div>
                    <div className="font-semibold">×{xpCalculation.breakdown.recurrenceMultiplier}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-gray-500">Intervalle</div>
                    <div className="font-semibold">×{xpCalculation.breakdown.intervalMultiplier.toFixed(1)}</div>
                  </div>
                </div>

                {formData.isRecurring && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Info className="w-4 h-4" />
                      <span className="font-medium">Stratégie recommandée :</span>
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      {formData.recurrenceType === 'daily' && 'Parfait pour les habitudes quotidiennes et la progression constante'}
                      {formData.recurrenceType === 'weekly' && 'Idéal pour les tâches récurrentes importantes'}
                      {formData.recurrenceType === 'monthly' && 'Excellent pour les projets de moyenne envergure'}
                      {formData.recurrenceType === 'yearly' && 'Parfait pour les bilans et projets annuels majeurs'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
                Tags
              </label>
              
              {/* Tags existants */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={submitting}
                        className="ml-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Ajouter nouveau tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={submitting || !formData.title.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {submitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {submitting ? 'Création...' : (initialData ? 'Modifier' : 'Créer la tâche')}
                {formData.isRecurring && <Repeat className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskForm;
