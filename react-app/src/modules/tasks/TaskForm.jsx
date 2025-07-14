// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// TASK FORM AVEC SYSTÈME RÉCURRENCES XP ADAPTATIF COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Flag, FileText, Target, Clock, Users, Repeat, Settings, Zap } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

const TaskForm = ({ 
  isOpen, 
  onClose, 
  task = null, 
  onSave,
  loading = false 
}) => {
  const { user } = useAuthStore();

  // État du formulaire avec récurrence
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    estimatedHours: '',
    projectId: '',
    xpReward: 50,
    // 🔄 SYSTÈME DE RÉCURRENCE
    isRecurring: false,
    recurrence: {
      type: 'daily', // 'daily', 'weekly', 'monthly', 'yearly', 'custom'
      interval: 1, // Tous les X jours/semaines/mois
      endDate: '', // Date de fin optionnelle
      maxOccurrences: '', // Nombre max d'occurrences
      daysOfWeek: [], // Pour récurrence hebdomadaire
      dayOfMonth: 1, // Pour récurrence mensuelle
      monthOfYear: 1 // Pour récurrence annuelle
    }
  });

  const [errors, setErrors] = useState({});
  const [calculatedXP, setCalculatedXP] = useState(50);

  // Options pour les sélects
  const statusOptions = [
    { value: 'todo', label: 'À faire' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminée' },
    { value: 'blocked', label: 'Bloquée' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: 'text-green-400', multiplier: 1.0 },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-400', multiplier: 1.2 },
    { value: 'high', label: 'Haute', color: 'text-orange-400', multiplier: 1.5 },
    { value: 'urgent', label: 'Urgente', color: 'text-red-400', multiplier: 2.0 }
  ];

  // 🔄 Options de récurrence avec multiplicateurs XP
  const recurrenceOptions = [
    { value: 'unique', label: '📋 Tâche unique', multiplier: 1.0, description: 'Une seule fois' },
    { value: 'daily', label: '📅 Quotidienne', multiplier: 0.5, description: 'Chaque jour' },
    { value: 'weekly', label: '📆 Hebdomadaire', multiplier: 1.2, description: 'Chaque semaine' },
    { value: 'monthly', label: '🗓️ Mensuelle', multiplier: 2.5, description: 'Chaque mois' },
    { value: 'yearly', label: '📊 Annuelle', multiplier: 5.0, description: 'Chaque année' },
    { value: 'custom', label: '⚙️ Personnalisée', multiplier: 1.0, description: 'Intervalle personnalisé' }
  ];

  // Complexité basée sur les heures estimées
  const getComplexityMultiplier = (hours) => {
    if (!hours) return 1.0;
    if (hours <= 1) return 0.8;
    if (hours <= 3) return 1.0;
    if (hours <= 8) return 1.5;
    if (hours <= 16) return 2.0;
    return 3.0; // Plus de 16h = très complexe
  };

  // 🎯 CALCUL XP ADAPTATIF EN TEMPS RÉEL
  const calculateAdaptiveXP = () => {
    const baseXP = parseInt(formData.xpReward) || 50;
    
    // Multiplicateur de priorité
    const priorityMultiplier = priorityOptions.find(p => p.value === formData.priority)?.multiplier || 1.2;
    
    // Multiplicateur de récurrence
    const recurrenceType = formData.isRecurring ? formData.recurrence.type : 'unique';
    const recurrenceMultiplier = recurrenceOptions.find(r => r.value === recurrenceType)?.multiplier || 1.0;
    
    // Multiplicateur de complexité
    const complexityMultiplier = getComplexityMultiplier(parseFloat(formData.estimatedHours));
    
    // Multiplicateur d'intervalle pour récurrence personnalisée
    let intervalMultiplier = 1.0;
    if (recurrenceType === 'custom' && formData.recurrence.interval > 1) {
      intervalMultiplier = 1.0 + (formData.recurrence.interval - 1) * 0.1;
    }
    
    // Calcul final
    const finalXP = Math.round(baseXP * priorityMultiplier * recurrenceMultiplier * complexityMultiplier * intervalMultiplier);
    
    return Math.max(10, finalXP); // Minimum 10 XP
  };

  // Recalculer XP quand les paramètres changent
  useEffect(() => {
    const newXP = calculateAdaptiveXP();
    setCalculatedXP(newXP);
    setFormData(prev => ({ ...prev, xpReward: newXP }));
  }, [formData.priority, formData.isRecurring, formData.recurrence.type, formData.recurrence.interval, formData.estimatedHours]);

  // Initialiser le formulaire quand la tâche change
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        projectId: task.projectId || '',
        xpReward: task.xpReward || 50,
        isRecurring: task.isRecurring || false,
        recurrence: task.recurrence || {
          type: 'daily',
          interval: 1,
          endDate: '',
          maxOccurrences: '',
          daysOfWeek: [],
          dayOfMonth: 1,
          monthOfYear: 1
        }
      });
    } else {
      // Réinitialiser pour une nouvelle tâche
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        estimatedHours: '',
        projectId: '',
        xpReward: 50,
        isRecurring: false,
        recurrence: {
          type: 'daily',
          interval: 1,
          endDate: '',
          maxOccurrences: '',
          daysOfWeek: [],
          dayOfMonth: 1,
          monthOfYear: 1
        }
      });
    }
    setErrors({});
  }, [task]);

  // Gestion des changements d'input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('recurrence.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        recurrence: {
          ...prev.recurrence,
          [field]: type === 'number' ? parseInt(value) || 1 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours <= 0)) {
      newErrors.estimatedHours = 'Les heures estimées doivent être un nombre positif';
    }

    if (formData.xpReward && (isNaN(formData.xpReward) || formData.xpReward <= 0)) {
      newErrors.xpReward = 'La récompense XP doit être un nombre positif';
    }

    // Validation récurrence
    if (formData.isRecurring) {
      if (formData.recurrence.type === 'custom' && formData.recurrence.interval < 1) {
        newErrors['recurrence.interval'] = 'L\'intervalle doit être au moins 1';
      }
      
      if (formData.recurrence.endDate && formData.dueDate) {
        const startDate = new Date(formData.dueDate);
        const endDate = new Date(formData.recurrence.endDate);
        if (endDate <= startDate) {
          newErrors['recurrence.endDate'] = 'La date de fin doit être après la date de début';
        }
      }
      
      if (formData.recurrence.maxOccurrences && (isNaN(formData.recurrence.maxOccurrences) || formData.recurrence.maxOccurrences < 1)) {
        newErrors['recurrence.maxOccurrences'] = 'Le nombre d\'occurrences doit être un nombre positif';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        xpReward: calculatedXP,
        recurrence: formData.isRecurring ? {
          ...formData.recurrence,
          endDate: formData.recurrence.endDate ? new Date(formData.recurrence.endDate) : null,
          maxOccurrences: formData.recurrence.maxOccurrences ? parseInt(formData.recurrence.maxOccurrences) : null
        } : null,
        updatedAt: new Date()
      };

      await onSave(taskData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche:', error);
      setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde' });
    }
  };

  if (!isOpen) return null;

  const selectedRecurrence = recurrenceOptions.find(r => r.value === (formData.isRecurring ? formData.recurrence.type : 'unique'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header du modal */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Informations de base */}
          <div className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Titre de la tâche *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Ex: Créer la présentation du projet"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Décrivez les détails de la tâche..."
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Ligne 1 : Statut et Priorité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Flag className="w-4 h-4 inline mr-2" />
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Flag className="w-4 h-4 inline mr-2" />
                  Priorité
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} (×{option.multiplier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne 2 : Date et Heures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date d'échéance */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Heures estimées */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Heures estimées
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                  min="0.5"
                  step="0.5"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.estimatedHours ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="ex: 2.5"
                />
                {errors.estimatedHours && <p className="text-red-400 text-sm mt-1">{errors.estimatedHours}</p>}
              </div>
            </div>

            {/* 🔄 SECTION RÉCURRENCE */}
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700/30">
              <div className="flex items-center gap-3 mb-4">
                <Repeat className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Récurrence et XP Adaptatif</h3>
                <div className="flex-1"></div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">Activer la récurrence</span>
                </label>
              </div>

              {/* Type de récurrence */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {recurrenceOptions.map(option => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      (!formData.isRecurring && option.value === 'unique') || 
                      (formData.isRecurring && formData.recurrence.type === option.value)
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    } ${!formData.isRecurring && option.value !== 'unique' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="recurrence.type"
                      value={option.value}
                      checked={(!formData.isRecurring && option.value === 'unique') || 
                               (formData.isRecurring && formData.recurrence.type === option.value)}
                      onChange={handleInputChange}
                      disabled={!formData.isRecurring && option.value !== 'unique'}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{option.label}</span>
                      <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                        ×{option.multiplier}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{option.description}</span>
                  </label>
                ))}
              </div>

              {/* Options de récurrence avancées */}
              {formData.isRecurring && formData.recurrence.type === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tous les (jours)
                    </label>
                    <input
                      type="number"
                      name="recurrence.interval"
                      value={formData.recurrence.interval}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors['recurrence.interval'] && <p className="text-red-400 text-xs mt-1">{errors['recurrence.interval']}</p>}
                  </div>
                </div>
              )}

              {/* Limites de récurrence */}
              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      name="recurrence.endDate"
                      value={formData.recurrence.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors['recurrence.endDate'] && <p className="text-red-400 text-xs mt-1">{errors['recurrence.endDate']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre max d'occurrences
                    </label>
                    <input
                      type="number"
                      name="recurrence.maxOccurrences"
                      value={formData.recurrence.maxOccurrences}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Illimité si vide"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors['recurrence.maxOccurrences'] && <p className="text-red-400 text-xs mt-1">{errors['recurrence.maxOccurrences']}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* 🎯 SECTION XP ADAPTATIF */}
            <div className="border border-gray-600 rounded-lg p-4 bg-gray-700/30">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Récompense XP Adaptative</h3>
              </div>

              {/* XP calculé automatiquement */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-yellow-400">{calculatedXP} XP</p>
                    <p className="text-sm text-gray-300">Calculé automatiquement</p>
                  </div>
                  <Target className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              {/* Détail du calcul */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Détail du calcul :</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Base :</span>
                    <span className="text-white ml-2">{formData.xpReward || 50} XP</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Priorité :</span>
                    <span className="text-yellow-400 ml-2">
                      ×{priorityOptions.find(p => p.value === formData.priority)?.multiplier || 1.2}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Récurrence :</span>
                    <span className="text-blue-400 ml-2">
                      ×{selectedRecurrence?.multiplier || 1.0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Complexité :</span>
                    <span className="text-green-400 ml-2">
                      ×{getComplexityMultiplier(parseFloat(formData.estimatedHours)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Exemples de gains selon récurrence */}
              <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-2">💡 Exemples de stratégies :</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• <span className="text-green-400">Tâches quotidiennes</span> : XP réduit mais progression constante</p>
                  <p>• <span className="text-blue-400">Tâches hebdomadaires</span> : Bon équilibre XP/fréquence</p>
                  <p>• <span className="text-purple-400">Tâches mensuelles</span> : XP élevé, idéal pour gros projets</p>
                  <p>• <span className="text-orange-400">Tâches annuelles</span> : XP maximum, perfect pour bilans</p>
                </div>
              </div>
            </div>

            {/* XP Manuel (optionnel pour override) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Récompense XP manuelle (optionnel)
              </label>
              <input
                type="number"
                name="xpReward"
                value={formData.xpReward}
                onChange={handleInputChange}
                min="10"
                step="10"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.xpReward ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Laissez vide pour calcul automatique"
              />
              <p className="text-xs text-gray-400 mt-1">
                Laissez ce champ pour utiliser le calcul automatique, ou saisissez une valeur personnalisée
              </p>
              {errors.xpReward && <p className="text-red-400 text-sm mt-1">{errors.xpReward}</p>}
            </div>
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Sauvegarde...' : task ? 'Mettre à jour' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
