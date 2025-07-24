// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE TÂCHE COMPLET AVEC RÔLES SYNERGIA ET RÉCURRENCE
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
  Info,
  Save,
  AlertCircle,
  Loader
} from 'lucide-react';

/**
 * 🎭 RÔLES SYNERGIA OFFICIELS
 */
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Maintenance technique et réparations',
    baseXP: 30
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image et des retours clients',
    baseXP: 35
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires',
    baseXP: 25
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation',
    baseXP: 35
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création visuelle et communication',
    baseXP: 30
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation des équipes',
    baseXP: 40
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement partenariats',
    baseXP: 45
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Communication digitale',
    baseXP: 30
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Relations entreprises et devis',
    baseXP: 50
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-violet-500',
    description: 'Gestion du système de gamification',
    baseXP: 40
  }
};

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
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE COMPLET
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = [], // Garder pour compatibilité
  teamMembers = [] // Garder pour compatibilité
}) => {
  // 🔧 ÉTATS DU FORMULAIRE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', // Maintenant = rôle Synergia
    priority: 'medium',
    complexity: 'medium',
    estimatedHours: 1,
    dueDate: '',
    assignedTo: [],
    tags: [],
    xpReward: 25,
    // 🔄 RÉCURRENCE
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: ''
  });

  const [newTag, setNewTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
        priorityMultiplier: 1.2,
        recurrenceMultiplier: RECURRENCE_CONFIG[formData.isRecurring ? formData.recurrenceType : 'none']?.multiplier || 1,
        intervalMultiplier: formData.recurrenceInterval > 1 ? 1 + (formData.recurrenceInterval - 1) * 0.2 : 1
      }
    };

    setXpCalculation(calculation);
    setFormData(prev => ({ ...prev, xpReward: finalXp }));
  }, [formData.complexity, formData.priority, formData.isRecurring, formData.recurrenceType, formData.recurrenceInterval]);

  /**
   * ✅ CHARGER LES DONNÉES INITIALES (POUR ÉDITION)
   */
  useEffect(() => {
    if (initialData) {
      console.log('📝 Chargement données pour édition:', initialData);
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        priority: initialData.priority || 'medium',
        complexity: initialData.complexity || 'medium',
        estimatedHours: initialData.estimatedHours || 1,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        assignedTo: Array.isArray(initialData.assignedTo) ? initialData.assignedTo : [],
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        xpReward: initialData.xpReward || 25,
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
        category: '',
        priority: 'medium',
        complexity: 'medium',
        estimatedHours: 1,
        dueDate: '',
        assignedTo: [],
        tags: [],
        xpReward: 25,
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        maxOccurrences: ''
      });
    }
    setErrors({});
    setNewTag('');
  }, [initialData, isOpen]);

  /**
   * ✅ VALIDATION DU FORMULAIRE
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.category) {
      newErrors.category = 'Veuillez sélectionner un rôle';
    }

    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 40) {
      newErrors.estimatedHours = 'La durée doit être entre 0.5 et 40 heures';
    }

    if (formData.isRecurring && formData.recurrenceType === 'none') {
      newErrors.recurrenceType = 'Veuillez sélectionner un type de récurrence';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 📤 SOUMISSION DU FORMULAIRE
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Validation formulaire échouée:', errors);
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('📤 Soumission TaskForm:', formData);
      
      // Préparer les données à soumettre
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedHours: parseFloat(formData.estimatedHours),
        xpReward: parseInt(formData.xpReward),
        // Métadonnées XP
        xpCalculation: xpCalculation,
        // Métadonnées récurrence
        recurrenceConfig: formData.isRecurring ? {
          type: formData.recurrenceType,
          interval: formData.recurrenceInterval,
          endDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
          maxOccurrences: formData.maxOccurrences ? parseInt(formData.maxOccurrences) : null
        } : null,
        // Si édition, conserver l'ID
        ...(initialData && { id: initialData.id })
      };

      await onSubmit(taskData);
      console.log('✅ Tâche soumise avec succès');
      
      // Reset et fermeture
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 'medium',
          complexity: 'medium',
          estimatedHours: 1,
          dueDate: '',
          assignedTo: [],
          tags: [],
          xpReward: 25,
          isRecurring: false,
          recurrenceType: 'none',
          recurrenceInterval: 1,
          recurrenceEndDate: '',
          maxOccurrences: ''
        });
      }
      
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setErrors({ submit: error.message || 'Erreur lors de la soumission' });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🏷️ GESTION DES TAGS
   */
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ❌ Si modal fermée, ne rien afficher
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialData ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <p className="text-sm text-gray-400">
                {formData.isRecurring ? 'Tâche récurrente avec XP adaptatif' : 'Tâche unique'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la tâche *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Ex: Rapport hebdomadaire de performance"
              disabled={submitting}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez les détails de la tâche..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
              disabled={submitting}
            />
          </div>

          {/* Priorité et Complexité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Flag className="inline w-4 h-4 mr-1" />
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Haute</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Complexité
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="easy">😊 Facile (15 XP base)</option>
                <option value="medium">🤔 Moyenne (25 XP base)</option>
                <option value="hard">😰 Difficile (40 XP base)</option>
                <option value="expert">🤯 Expert (60 XP base)</option>
              </select>
            </div>
          </div>

          {/* Date d'échéance et Rôle Synergia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rôle Synergia *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={submitting}
              >
                <option value="">Sélectionner un rôle</option>
                {/* ✅ RÔLES SYNERGIA OFFICIELS */}
                {Object.values(SYNERGIA_ROLES).map(role => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Durée estimée et XP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Durée estimée (heures)
              </label>
              <input
                type="number"
                min="0.5"
                max="40"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={submitting}
              />
              {errors.estimatedHours && <p className="text-red-400 text-sm mt-1">{errors.estimatedHours}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Trophy className="inline w-4 h-4 mr-1" />
                Récompense XP (calculée)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.xpReward}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white cursor-not-allowed"
                  disabled
                />
                <div className="text-green-400 text-sm font-medium">
                  Auto
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                🧮 Calculé selon complexité, priorité et récurrence
              </p>
            </div>
          </div>

          {/* Section Récurrence */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Repeat className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Récurrence et XP Adaptatif</h3>
            </div>

            {/* Activer récurrence */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isRecurring: e.target.checked,
                  recurrenceType: e.target.checked ? 'weekly' : 'none'
                }))}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                disabled={submitting}
              />
              <label htmlFor="isRecurring" className="text-sm text-gray-300">
                Activer la récurrence automatique
              </label>
            </div>

            {/* Configuration récurrence */}
            {formData.isRecurring && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type de récurrence */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type de récurrence *
                      </label>
                      <select
                        value={formData.recurrenceType}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          recurrenceType: e.target.value,
                          recurrenceInterval: RECURRENCE_CONFIG[e.target.value]?.defaultInterval || 1
                        }))}
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.recurrenceType ? 'border-red-500' : 'border-gray-600'
                        }`}
                        disabled={submitting}
                      >
                        <option value="none">Sélectionner</option>
                        {Object.entries(RECURRENCE_CONFIG).filter(([key]) => key !== 'none').map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                      {errors.recurrenceType && <p className="text-red-400 text-sm mt-1">{errors.recurrenceType}</p>}
                    </div>

                    {/* Intervalle */}
                    {formData.recurrenceType !== 'none' && RECURRENCE_CONFIG[formData.recurrenceType]?.intervals && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Intervalle
                        </label>
                        <select
                          value={formData.recurrenceInterval}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={submitting}
                        >
                          {RECURRENCE_CONFIG[formData.recurrenceType].intervals.map(interval => (
                            <option key={interval} value={interval}>
                              Tous les {interval} {formData.recurrenceType === 'daily' ? 'jour' : 
                                                   formData.recurrenceType === 'weekly' ? 'semaine' :
                                                   formData.recurrenceType === 'monthly' ? 'mois' : 'an'}{interval > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Date de fin et occurrences max */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date de fin (optionnel)
                      </label>
                      <input
                        type="date"
                        value={formData.recurrenceEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre max d'occurrences
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.maxOccurrences}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxOccurrences: e.target.value }))}
                        placeholder="Ex: 10"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  {/* Aperçu XP */}
                  {xpCalculation && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <h4 className="text-sm font-medium text-blue-300">Calcul XP Adaptatif</h4>
                      </div>
                      <div className="text-sm text-blue-200">
                        <div>Base ({formData.complexity}): 25 XP</div>
                        <div>Priorité ({formData.priority}): ×{xpCalculation.breakdown.priorityMultiplier}</div>
                        {formData.isRecurring && (
                          <>
                            <div>Récurrence ({formData.recurrenceType}): ×{xpCalculation.breakdown.recurrenceMultiplier}</div>
                            {formData.recurrenceInterval > 1 && (
                              <div>Intervalle (tous les {formData.recurrenceInterval}): ×{xpCalculation.breakdown.intervalMultiplier.toFixed(1)}</div>
                            )}
                          </>
                        )}
                        <div className="border-t border-blue-400/30 mt-2 pt-2 font-semibold">
                          Total: {xpCalculation.finalXp} XP par occurrence
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Tag className="inline w-4 h-4 mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim() || submitting}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={submitting}
                      className="text-gray-400 hover:text-red-400 disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={submitting || !formData.title.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData ? 'Mettre à jour' : 'Créer la tâche'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskForm;
