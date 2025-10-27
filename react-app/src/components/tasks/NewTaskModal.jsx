// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// CORRECTION RESPONSIVE MOBILE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Save, 
  Calendar, 
  Tag, 
  User, 
  AlertTriangle,
  Clock,
  Trophy,
  Paperclip,
  CheckCircle,
  Edit,
  Star,
  Target,
  Shield,
  Repeat,
  Users,
  Info,
  Zap,
  Flag,
  FileText,
  Upload,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { createTaskSafely } from '../../core/services/taskCreationFix.js';
import storageService from '../../core/services/storageService.js';

/**
 * 🎭 RÔLES SYNERGIA OFFICIELS
 */
const SYNERGIA_ROLES = {
  game_master: {
    id: 'game_master',
    name: 'Game Master',
    icon: '🕹️',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-purple-600',
    description: 'Animateur des sessions, garant de l\'immersion et satisfaction client'
  },
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🛠️',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-orange-600',
    description: 'Garant du bon état, sécurité et qualité des salles'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '🌟',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    textColor: 'text-yellow-600',
    description: 'Surveillance et valorisation des avis clients'
  },
  content_creation: {
    id: 'content_creation',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-600',
    description: 'Création et diffusion de contenus marketing'
  },
  social_media: {
    id: 'social_media',
    name: 'Gestion Réseaux Sociaux',
    icon: '📱',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    description: 'Animation et croissance des réseaux sociaux'
  },
  customer_relations: {
    id: 'customer_relations',
    name: 'Relations Clients',
    icon: '💬',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-600',
    description: 'Gestion des demandes et satisfaction client'
  },
  sales: {
    id: 'sales',
    name: 'Ventes & Partenariats',
    icon: '🤝',
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    textColor: 'text-indigo-600',
    description: 'Développement commercial et partenariats'
  },
  operations: {
    id: 'operations',
    name: 'Gestion des Opérations',
    icon: '📊',
    color: 'bg-gradient-to-r from-gray-500 to-slate-500',
    textColor: 'text-gray-600',
    description: 'Planification et optimisation opérationnelle'
  },
  admin: {
    id: 'admin',
    name: 'Administrateur',
    icon: '👑',
    color: 'bg-gradient-to-r from-yellow-600 to-orange-600',
    textColor: 'text-yellow-700',
    description: 'Gestion administrative et financière'
  }
};

/**
 * 🎯 TYPES DE TÂCHES
 */
const TASK_TYPES = [
  { value: 'task', label: '📋 Tâche Standard', icon: '📋' },
  { value: 'challenge', label: '🎯 Défi', icon: '🎯' },
  { value: 'milestone', label: '🏆 Objectif Majeur', icon: '🏆' },
  { value: 'recurring', label: '🔄 Récurrente', icon: '🔄' },
  { value: 'urgent', label: '⚡ Urgente', icon: '⚡' }
];

/**
 * 🔥 DIFFICULTÉS
 */
const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Facile', xp: 10, color: 'green', icon: '😊' },
  { value: 'medium', label: 'Moyenne', xp: 25, color: 'yellow', icon: '😐' },
  { value: 'hard', label: 'Difficile', xp: 35, color: 'red', icon: '😤' },
  { value: 'expert', label: 'Expert', xp: 50, color: 'purple', icon: '🔥' }
];

/**
 * 🏷️ CATÉGORIES DE TÂCHES
 */
const TASK_CATEGORIES = [
  { value: 'operations', label: 'Opérations', icon: '⚙️', color: 'blue' },
  { value: 'marketing', label: 'Marketing', icon: '📣', color: 'pink' },
  { value: 'customer_service', label: 'Service Client', icon: '💬', color: 'green' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'orange' },
  { value: 'content', label: 'Création Contenu', icon: '🎨', color: 'purple' },
  { value: 'sales', label: 'Ventes', icon: '💰', color: 'yellow' },
  { value: 'admin', label: 'Administration', icon: '📊', color: 'gray' },
  { value: 'training', label: 'Formation', icon: '📚', color: 'indigo' },
  { value: 'other', label: 'Autre', icon: '📌', color: 'slate' }
];

/**
 * 🗓️ PRIORITÉS
 */
const PRIORITY_LEVELS = [
  { value: 'low', label: 'Basse', icon: '⬇️', color: 'gray' },
  { value: 'medium', label: 'Moyenne', icon: '➡️', color: 'blue' },
  { value: 'high', label: 'Haute', icon: '⬆️', color: 'orange' },
  { value: 'urgent', label: 'Urgente', icon: '🔥', color: 'red' }
];

/**
 * 🚀 MODAL DE CRÉATION/ÉDITION DE TÂCHE
 */
const NewTaskModal = ({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  initialTask = null,
  mode = 'create'
}) => {
  const { user } = useAuthStore();
  const modalRef = useRef(null);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task',
    difficulty: 'medium',
    category: 'operations',
    priority: 'medium',
    dueDate: '',
    assignedRole: '',
    location: '',
    tags: [],
    xpReward: 25,
    isPrivate: false,
    needsValidation: true,
    attachments: [],
    notes: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialiser le formulaire en mode édition
  useEffect(() => {
    if (initialTask && mode === 'edit') {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        type: initialTask.type || 'task',
        difficulty: initialTask.difficulty || 'medium',
        category: initialTask.category || 'operations',
        priority: initialTask.priority || 'medium',
        dueDate: initialTask.dueDate || '',
        assignedRole: initialTask.assignedRole || '',
        location: initialTask.location || '',
        tags: initialTask.tags || [],
        xpReward: initialTask.xpReward || 25,
        isPrivate: initialTask.isPrivate || false,
        needsValidation: initialTask.needsValidation !== false,
        attachments: initialTask.attachments || [],
        notes: initialTask.notes || ''
      });
    }
  }, [initialTask, mode]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        type: 'task',
        difficulty: 'medium',
        category: 'operations',
        priority: 'medium',
        dueDate: '',
        assignedRole: '',
        location: '',
        tags: [],
        xpReward: 25,
        isPrivate: false,
        needsValidation: true,
        attachments: [],
        notes: ''
      });
      setCurrentTag('');
      setError('');
      setShowAdvanced(false);
    }
  }, [isOpen]);

  // Mise à jour automatique des XP selon la difficulté
  useEffect(() => {
    const selectedDiff = DIFFICULTY_LEVELS.find(d => d.value === formData.difficulty);
    if (selectedDiff) {
      setFormData(prev => ({ ...prev, xpReward: selectedDiff.xp }));
    }
  }, [formData.difficulty]);

  // Gestion des changements de champs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Ajout de tag
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  // Suppression de tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Fermeture sécurisée
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!user?.uid) {
      setError('Vous devez être connecté pour créer une tâche');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Création de tâche avec données:', formData);

      const taskData = {
        ...formData,
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'todo',
        assignedTo: [],
        completedBy: [],
        validatedBy: null,
        validationDate: null
      };

      const result = await createTaskSafely(taskData);

      if (result.success) {
        console.log('✅ Tâche créée avec succès:', result.taskId);
        onTaskCreated?.(result);
        handleClose();
      } else {
        throw new Error(result.error || 'Erreur lors de la création');
      }

    } catch (err) {
      console.error('❌ Erreur création tâche:', err);
      setError(err.message || 'Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col mx-auto"
          style={{ maxWidth: 'calc(100vw - 16px)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold truncate">
                    {mode === 'edit' ? 'Modifier la tâche' : 'Nouvelle tâche'}
                  </h2>
                  <p className="text-indigo-100 text-xs sm:text-sm mt-1 truncate">
                    Créez une tâche pour votre équipe
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-800 font-medium text-sm sm:text-base">Erreur</p>
                <p className="text-red-600 text-xs sm:text-sm mt-1 break-words">{error}</p>
              </div>
            </div>
          )}

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Informations de base */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  Informations de base
                </h3>

                {/* Titre */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Titre de la tâche <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Nettoyer la salle Dracula"
                    required
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez la tâche en détail..."
                    rows="4"
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Type et Catégorie */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Type de tâche
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                    >
                      {TASK_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Catégorie
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                    >
                      {TASK_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Difficulté et Priorité */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Difficulté
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                    >
                      {DIFFICULTY_LEVELS.map(diff => (
                        <option key={diff.value} value={diff.value}>
                          {diff.icon} {diff.label} - {diff.xp} XP
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <Flag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Priorité
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                    >
                      {PRIORITY_LEVELS.map(prio => (
                        <option key={prio.value} value={prio.value}>
                          {prio.icon} {prio.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date d'échéance et Rôle assigné */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                      Rôle assigné
                    </label>
                    <select
                      name="assignedRole"
                      value={formData.assignedRole}
                      onChange={handleInputChange}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                    >
                      <option value="">Tous les rôles</option>
                      {Object.values(SYNERGIA_ROLES).map(role => (
                        <option key={role.id} value={role.id}>
                          {role.icon} {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Localisation */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                    Localisation
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ex: Salle Dracula, Bureau..."
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Ajouter un tag..."
                      className="flex-1 p-2 sm:p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm"
                      >
                        <span className="truncate max-w-[120px] sm:max-w-none">{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-indigo-900 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Options avancées */}
              <div className="border-t pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-3 sm:mb-4 text-sm sm:text-base"
                >
                  {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Options avancées
                </button>

                {showAdvanced && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Checkboxes */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPrivate"
                          checked={formData.isPrivate}
                          onChange={handleInputChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                          Tâche privée
                        </span>
                      </label>

                      <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="needsValidation"
                          checked={formData.needsValidation}
                          onChange={handleInputChange}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                          Validation admin requise
                        </span>
                      </label>
                    </div>

                    {/* XP personnalisés */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                        XP personnalisés
                      </label>
                      <input
                        type="number"
                        name="xpReward"
                        value={formData.xpReward}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                        Notes supplémentaires
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Notes internes..."
                        rows="3"
                        className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-sm sm:text-base"
                      />
                    </div>
                  </div>
                )}

              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                Les XP sont calculés automatiquement
              </div>
              
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim()}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 justify-center text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">{mode === 'edit' ? 'Modification...' : 'Création...'}</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mode === 'edit' ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewTaskModal;
