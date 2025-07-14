// ==========================================
// 📁 react-app/src/components/forms/TaskForm.jsx
// FORMULAIRE DE TÂCHE AVEC RÉCURRENCE ET XP ADAPTATIF
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
  const intervalMultiplier = interval > 1 ? 1 + (interval - 1) * 0.3 : 1;
  
  // Calcul final
  const finalXp = Math.round(priorityXp * recurrenceMultiplier * intervalMultiplier);
  
  return {
    baseXp,
    priorityXp: Math.round(priorityXp),
    recurrenceMultiplier,
    intervalMultiplier,
    finalXp
  };
};

/**
 * 📝 FORMULAIRE DE CRÉATION/MODIFICATION DE TÂCHE AVEC RÉCURRENCE
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    complexity: 'medium',
    xpReward: 25,
    dueDate: '',
    tags: [],
    // ✅ NOUVEAUX CHAMPS RÉCURRENCE
    isRecurring: false,
    recurrenceType: 'none', // daily, weekly, monthly, yearly
    recurrenceInterval: 1, // Tous les X jours/semaines/mois
    recurrenceEndDate: '', // Date de fin optionnelle
    maxOccurrences: '', // Nombre max d'occurrences
  });

  const [newTag, setNewTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [xpCalculation, setXpCalculation] = useState(null);

  // Charger les données initiales si modification
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        complexity: initialData.complexity || 'medium',
        xpReward: initialData.xpReward || 25,
        dueDate: initialData.dueDate ? 
          (initialData.dueDate.seconds ? 
            new Date(initialData.dueDate.seconds * 1000).toISOString().split('T')[0] :
            new Date(initialData.dueDate).toISOString().split('T')[0]
          ) : '',
        tags: initialData.tags || [],
        // Récurrence existante
        isRecurring: initialData.isRecurring || false,
        recurrenceType: initialData.recurrenceType || 'none',
        recurrenceInterval: initialData.recurrenceInterval || 1,
        recurrenceEndDate: initialData.recurrenceEndDate || '',
        maxOccurrences: initialData.maxOccurrences || '',
      });
    }
  }, [initialData]);

  // ✅ CALCUL AUTOMATIQUE DES XP SELON TOUS LES PARAMÈTRES
  useEffect(() => {
    const calculation = calculateAdaptiveXP(
      formData.complexity, 
      formData.priority, 
      formData.isRecurring ? formData.recurrenceType : 'none',
      formData.recurrenceInterval
    );
    
    setXpCalculation(calculation);
    
    // Mettre à jour les XP dans le formulaire
    if (formData.xpReward !== calculation.finalXp) {
      setFormData(prev => ({ ...prev, xpReward: calculation.finalXp }));
    }
  }, [formData.complexity, formData.priority, formData.isRecurring, formData.recurrenceType, formData.recurrenceInterval]);

  // Gérer l'activation de la récurrence
  const handleRecurrenceToggle = (enabled) => {
    setFormData(prev => ({
      ...prev,
      isRecurring: enabled,
      recurrenceType: enabled ? 'weekly' : 'none',
      recurrenceInterval: 1
    }));
  };

  // Gérer le changement de type de récurrence
  const handleRecurrenceTypeChange = (type) => {
    const config = RECURRENCE_CONFIG[type];
    setFormData(prev => ({
      ...prev,
      recurrenceType: type,
      recurrenceInterval: config?.defaultInterval || 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }
    
    // Validation récurrence
    if (formData.isRecurring && formData.recurrenceType === 'none') {
      setError('Veuillez sélectionner un type de récurrence');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // ✅ PRÉPARER LES DONNÉES AVEC RÉCURRENCE
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
        maxOccurrences: formData.maxOccurrences ? parseInt(formData.maxOccurrences) : null,
        // Métadonnées XP
        xpCalculation: xpCalculation,
        baseXpReward: xpCalculation?.baseXp || 25,
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
                  <p className="text-sm text-gray-600">
                    Créez une tâche avec récurrence et XP adaptatif
                  </p>
                </div>
              </div>
              
              {/* Affichage XP calculé */}
              {xpCalculation && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-800">
                      +{xpCalculation.finalXp} XP
                    </div>
                    <div className="text-xs text-yellow-600">
                      {formData.isRecurring && `${RECURRENCE_CONFIG[formData.recurrenceType]?.icon} ${RECURRENCE_CONFIG[formData.recurrenceType]?.label}`}
                    </div>
                  </div>
                </div>
              )}
              
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
            
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Titre */}
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
                  <option value="low">🟢 Faible (×1.0)</option>
                  <option value="medium">🟡 Moyenne (×1.2)</option>
                  <option value="high">🔴 Haute (×1.5)</option>
                  <option value="urgent">🚨 Urgente (×2.0)</option>
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
                  <option value="easy">⭐ Facile (15 XP base)</option>
                  <option value="medium">⭐⭐ Moyenne (25 XP base)</option>
                  <option value="hard">⭐⭐⭐ Difficile (40 XP base)</option>
                  <option value="expert">⭐⭐⭐⭐ Expert (60 XP base)</option>
                </select>
              </div>
            </div>

            {/* ✅ SECTION RÉCURRENCE NOUVELLE */}
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Repeat className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Récurrence de la tâche</h3>
                    <p className="text-sm text-gray-600">Les tâches récurrentes adaptent automatiquement leurs XP</p>
                  </div>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => handleRecurrenceToggle(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Tâche récurrente
                  </span>
                </label>
              </div>

              {formData.isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Type de récurrence */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type de récurrence
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(RECURRENCE_CONFIG)
                        .filter(([key]) => key !== 'none')
                        .map(([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleRecurrenceTypeChange(key)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.recurrenceType === key
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          disabled={submitting}
                        >
                          <div className="text-2xl mb-1">{config.icon}</div>
                          <div className="font-medium text-sm">{config.label}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            ×{config.multiplier} XP
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intervalle */}
                  {formData.recurrenceType !== 'none' && RECURRENCE_CONFIG[formData.recurrenceType]?.intervals && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intervalle
                        </label>
                        <select
                          value={formData.recurrenceInterval}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={submitting}
                        >
                          {RECURRENCE_CONFIG[formData.recurrenceType].intervals.map(interval => (
                            <option key={interval} value={interval}>
                              Tous les {interval} {
                                formData.recurrenceType === 'daily' ? (interval === 1 ? 'jour' : 'jours') :
                                formData.recurrenceType === 'weekly' ? (interval === 1 ? 'semaine' : 'semaines') :
                                formData.recurrenceType === 'monthly' ? 'mois' :
                                formData.recurrenceType === 'yearly' ? (interval === 1 ? 'an' : 'ans') : ''
                              }
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre max d'occurrences (optionnel)
                        </label>
                        <input
                          type="number"
                          value={formData.maxOccurrences}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxOccurrences: e.target.value }))}
                          placeholder="Ex: 10"
                          min="1"
                          max="1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  )}

                  {/* Date de fin optionnelle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin de récurrence (optionnelle)
                    </label>
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                    />
                  </div>

                  {/* Aperçu XP */}
                  {xpCalculation && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-900 mb-2">Calcul des XP adaptatif</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Base (complexité)</div>
                              <div className="font-medium">{xpCalculation.baseXp} XP</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Avec priorité</div>
                              <div className="font-medium">{xpCalculation.priorityXp} XP</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Multiplicateur récurrence</div>
                              <div className="font-medium">×{xpCalculation.recurrenceMultiplier}</div>
                            </div>
                            <div>
                              <div className="text-yellow-700 font-bold">XP Final</div>
                              <div className="text-lg font-bold text-yellow-800">{xpCalculation.finalXp} XP</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Date d'échéance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date d'échéance {formData.isRecurring && '(première occurrence)'}
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
                Tags
              </label>
              
              {/* Tags existants */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-600"
                        disabled={submitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Ajouter un tag */}
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
