// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE TÂCHE - XP AUTOMATIQUE + OVERRIDE ADMIN UNIQUEMENT
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Save, 
  AlertTriangle, 
  Target, 
  Flag, 
  Clock, 
  Trophy,
  Tag,
  Users,
  Calendar,
  FileText,
  Folder,
  Link,
  Zap,
  Shield,
  Info,
  Repeat
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import ProjectSelector, { LinkedProjectDisplay } from '../../components/tasks/TaskProjectLinking';

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
    multiplier: 0.6, // Moins d'XP car très fréquent
    description: 'Se répète tous les jours'
  },
  weekly: {
    label: 'Hebdomadaire',
    icon: '📆',
    multiplier: 1.0, // XP standard
    description: 'Se répète toutes les semaines'
  },
  monthly: {
    label: 'Mensuelle',
    icon: '🗓️',
    multiplier: 2.0, // Plus d'XP car moins fréquent
    description: 'Se répète tous les mois'
  }
};

/**
 * 🏆 CALCUL AUTOMATIQUE INTELLIGENT DES XP
 */
const calculateAutoXP = (difficulty, priority, recurrenceType = 'none') => {
  // XP de base selon la difficulté
  const difficultyXP = {
    'easy': 15,
    'medium': 25,
    'hard': 40,
    'expert': 60
  };
  
  // Multiplicateur de priorité
  const priorityMultiplier = {
    'low': 1.0,
    'medium': 1.2,
    'high': 1.5,
    'urgent': 2.0
  };
  
  const baseXP = difficultyXP[difficulty] || 25;
  const priorityXP = baseXP * (priorityMultiplier[priority] || 1.2);
  const recurrenceMultiplier = RECURRENCE_CONFIG[recurrenceType]?.multiplier || 1;
  
  return Math.round(priorityXP * recurrenceMultiplier);
};

/**
 * ✅ VÉRIFIER LES PERMISSIONS ADMIN
 */
const checkIsAdmin = (user) => {
  if (!user) return false;
  
  return (
    user.role === 'admin' ||
    user.profile?.role === 'admin' ||
    user.isAdmin === true ||
    user.permissions?.includes('manage_tasks') ||
    user.permissions?.includes('admin')
  );
};

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE AVEC XP AUTOMATIQUE
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = [],
  teamMembers = []
}) => {
  const { user } = useAuthStore();
  const isAdmin = checkIsAdmin(user);

  // 📊 État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium', // ✅ NOUVEAU : Difficulté au lieu de complexity
    priority: 'medium',
    category: '',
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    assignedTo: [],
    projectId: null,
    notes: '',
    // ✅ NOUVEAU : Support récurrence
    isRecurring: false,
    recurrenceType: 'none',
    // ✅ ADMIN UNIQUEMENT : Override XP manuel
    xpOverride: null // null = utiliser calcul auto, number = override admin
  });

  // 🎨 États UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [calculatedXP, setCalculatedXP] = useState(25);
  const [showXPDetails, setShowXPDetails] = useState(false);

  // 🧮 CALCUL AUTOMATIQUE DES XP EN TEMPS RÉEL
  useEffect(() => {
    const autoXP = calculateAutoXP(
      formData.difficulty,
      formData.priority,
      formData.isRecurring ? formData.recurrenceType : 'none'
    );
    setCalculatedXP(autoXP);
  }, [formData.difficulty, formData.priority, formData.isRecurring, formData.recurrenceType]);

  // 📥 Initialiser le formulaire
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || initialData.complexity || 'medium',
        priority: initialData.priority || 'medium',
        category: initialData.category || '',
        estimatedHours: initialData.estimatedHours || 1,
        dueDate: initialData.dueDate ? formatDateForInput(initialData.dueDate) : '',
        tags: initialData.tags || [],
        assignedTo: initialData.assignedTo || [],
        projectId: initialData.projectId || null,
        notes: initialData.notes || '',
        isRecurring: initialData.isRecurring || false,
        recurrenceType: initialData.recurrenceType || 'none',
        // ✅ ADMIN : Préserver override XP existant
        xpOverride: isAdmin && initialData.xpReward ? initialData.xpReward : null
      });

      // Charger les infos du projet si projectId existe
      if (initialData.projectId) {
        loadProjectInfo(initialData.projectId);
      }
    } else {
      // Formulaire vide pour nouvelle tâche
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        priority: 'medium',
        category: '',
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        assignedTo: [],
        projectId: null,
        notes: '',
        isRecurring: false,
        recurrenceType: 'none',
        xpOverride: null
      });
      setSelectedProject(null);
    }
  }, [initialData, isOpen, isAdmin]);

  /**
   * 📁 CHARGER LES INFORMATIONS D'UN PROJET
   */
  const loadProjectInfo = async (projectId) => {
    try {
      const { projectService } = await import('../../core/services/projectService');
      const projectData = await projectService.getProject(projectId);
      
      if (projectData) {
        setSelectedProject(projectData);
      }
    } catch (error) {
      console.error('❌ Erreur chargement projet:', error);
    }
  };

  /**
   * 📅 FORMATER DATE POUR INPUT
   */
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  /**
   * 🔄 GESTION CHANGEMENT FORMULAIRE
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer les erreurs pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * 🏷️ GESTION DES TAGS
   */
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

  /**
   * 📁 GESTION PROJET
   */
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFormData(prev => ({
      ...prev,
      projectId: project?.id || null
    }));
  };

  const handleProjectUnlink = () => {
    setSelectedProject(null);
    setFormData(prev => ({
      ...prev,
      projectId: null
    }));
  };

  /**
   * ✅ VALIDATION DU FORMULAIRE
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) {
      newErrors.estimatedHours = 'La durée doit être entre 0.5 et 100 heures';
    }

    // ✅ VALIDATION XP OVERRIDE (ADMIN UNIQUEMENT)
    if (isAdmin && formData.xpOverride !== null) {
      if (formData.xpOverride < 1 || formData.xpOverride > 1000) {
        newErrors.xpOverride = 'L\'override XP doit être entre 1 et 1000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 📤 SOUMISSION DU FORMULAIRE
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      // ✅ CALCUL FINAL DES XP
      const finalXP = isAdmin && formData.xpOverride !== null 
        ? formData.xpOverride  // Admin override
        : calculatedXP;        // Calcul automatique

      // Préparer les données avec projet et XP finaux
      const taskData = {
        ...formData,
        projectId: selectedProject?.id || null,
        projectTitle: selectedProject?.title || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        xpReward: finalXP, // ✅ XP calculé automatiquement ou overridé par admin
        // Métadonnées de calcul XP pour transparence
        xpCalculation: {
          automatic: calculatedXP,
          override: isAdmin ? formData.xpOverride : null,
          final: finalXP,
          calculatedBy: isAdmin && formData.xpOverride !== null ? 'admin_override' : 'automatic',
          factors: {
            difficulty: formData.difficulty,
            priority: formData.priority,
            recurrence: formData.isRecurring ? formData.recurrenceType : 'none'
          }
        }
      };

      await onSubmit(taskData);
      onClose();

    } catch (error) {
      console.error('❌ Erreur soumission formulaire:', error);
      setErrors({ general: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* 🎯 HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">
                  {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {selectedProject ? `Projet: ${selectedProject.title}` : 'Tâche indépendante'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 📝 CONTENU */}
        <div className="p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 📄 INFORMATIONS DE BASE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informations de base
              </h3>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Mettre à jour le site web"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez la tâche en détail..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* 🎯 PARAMÈTRES DE TÂCHE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Paramètres
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">🟢 Facile (15 XP base)</option>
                    <option value="medium">🟡 Moyenne (25 XP base)</option>
                    <option value="hard">🟠 Difficile (40 XP base)</option>
                    <option value="expert">🔴 Expert (60 XP base)</option>
                  </select>
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🔵 Basse (×1.0)</option>
                    <option value="medium">🟡 Moyenne (×1.2)</option>
                    <option value="high">🟠 Élevée (×1.5)</option>
                    <option value="urgent">🔴 Urgente (×2.0)</option>
                  </select>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    ) : (
                      <>
                        <option value="development">Développement</option>
                        <option value="marketing">Marketing</option>
                        <option value="design">Design</option>
                        <option value="support">Support</option>
                        <option value="management">Gestion</option>
                        <option value="maintenance">Maintenance</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Durée estimée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée estimée (heures)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.estimatedHours && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimatedHours}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 🔄 RÉCURRENCE */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Récurrence
              </h3>

              {/* Activer récurrence */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    handleInputChange('isRecurring', isChecked);
                    if (!isChecked) {
                      handleInputChange('recurrenceType', 'none');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                  Tâche récurrente
                </label>
              </div>

              {/* Type de récurrence */}
              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de récurrence
                  </label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => handleInputChange('recurrenceType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">Sélectionner...</option>
                    {Object.entries(RECURRENCE_CONFIG).filter(([key]) => key !== 'none').map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label} (×{config.multiplier} XP)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 🏆 RÉCOMPENSE XP */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Récompense XP
                <button
                  type="button"
                  onClick={() => setShowXPDetails(!showXPDetails)}
                  className="ml-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Voir les détails du calcul"
                >
                  <Info className="w-4 h-4 text-gray-500" />
                </button>
              </h3>

              {/* Affichage XP calculé */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">XP Automatique</h4>
                      <p className="text-sm text-gray-600">
                        Calculé selon difficulté, priorité et récurrence
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">
                      {isAdmin && formData.xpOverride !== null ? formData.xpOverride : calculatedXP}
                    </div>
                    <div className="text-xs text-gray-500">XP par occurrence</div>
                  </div>
                </div>

                {/* Détails du calcul XP */}
                {showXPDetails && (
                  <div className="mt-4 pt-4 border-t border-yellow-200">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-gray-500">Difficulté</div>
                        <div className="font-semibold">{formData.difficulty}</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-gray-500">Priorité</div>
                        <div className="font-semibold">{formData.priority}</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="text-gray-500">Récurrence</div>
                        <div className="font-semibold">
                          {formData.isRecurring ? formData.recurrenceType : 'unique'}
                        </div>
                      </div>
                    </div>

                    {formData.isRecurring && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <Info className="w-4 h-4" />
                          <span>
                            Tâche récurrente : {RECURRENCE_CONFIG[formData.recurrenceType]?.description}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ✅ ADMIN UNIQUEMENT : Override XP */}
              {isAdmin && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Override Admin</h4>
                      <p className="text-sm text-blue-700">
                        Remplacer le calcul automatique par une valeur personnalisée
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useXpOverride"
                      checked={formData.xpOverride !== null}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('xpOverride', calculatedXP);
                        } else {
                          handleInputChange('xpOverride', null);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useXpOverride" className="text-sm font-medium text-blue-700">
                      Utiliser un override XP
                    </label>
                  </div>

                  {formData.xpOverride !== null && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        XP personnalisé (1-1000)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.xpOverride}
                        onChange={(e) => handleInputChange('xpOverride', parseInt(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.xpOverride ? 'border-red-500' : 'border-blue-300'
                        }`}
                      />
                      {errors.xpOverride && (
                        <p className="mt-1 text-sm text-red-600">{errors.xpOverride}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 📁 PROJET (OPTIONNEL) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Projet (optionnel)
              </h3>

              {selectedProject ? (
                <LinkedProjectDisplay
                  project={selectedProject}
                  onUnlink={handleProjectUnlink}
                  showUnlinkButton={true}
                />
              ) : (
                <ProjectSelector onProjectSelect={handleProjectSelect} />
              )}
            </div>

            {/* 🏷️ TAGS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {/* 📅 ÉCHÉANCE ET AUTRES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date d'échéance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 📝 NOTES SUPPLÉMENTAIRES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes supplémentaires
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Informations complémentaires..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 🚨 ERREURS GÉNÉRALES */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{errors.general}</p>
                </div>
              </div>
            )}

            {/* 🎛️ ACTIONS */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{initialData ? 'Mettre à jour' : 'Créer la tâche'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
