// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// MODAL CRÉATION/ÉDITION TÂCHES AVEC DATE DE PLANIFICATION
// ==========================================

import React, { useState, useEffect } from 'react';
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

/**
 * 🎭 RÔLES SYNERGIA COMPLETS
 */
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-orange-600',
    description: 'Maintenance technique et matériel'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    textColor: 'text-yellow-600',
    description: 'Gestion de la réputation et avis clients'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    description: 'Inventaires et approvisionnements'
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    textColor: 'text-purple-600',
    description: 'RH, plannings, pointages'
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichage',
    icon: '🎨',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-600',
    description: 'Supports visuels et communication'
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '👩‍🏫',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-600',
    description: 'Formation et accompagnement'
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-gradient-to-r from-indigo-500 to-blue-500',
    textColor: 'text-indigo-600',
    description: 'Relations extérieures et SEO'
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📱',
    color: 'bg-gradient-to-r from-cyan-500 to-teal-500',
    textColor: 'text-cyan-600',
    description: 'Animation des réseaux sociaux'
  }
};

const DIFFICULTY_XP_CONFIG = {
  easy: { 
    label: 'Facile (10-20 XP)', 
    baseXP: 15, 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Tâche simple, moins de 30 min'
  },
  medium: { 
    label: 'Moyen (20-35 XP)', 
    baseXP: 25, 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Tâche standard, 1-2 heures'
  },
  hard: { 
    label: 'Difficile (40-60 XP)', 
    baseXP: 50, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Tâche complexe, demi-journée'
  },
  expert: { 
    label: 'Expert (80-120 XP)', 
    baseXP: 100, 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Tâche très complexe, journée entière'
  }
};

const PRIORITY_MULTIPLIERS = {
  low: { label: 'Faible', multiplier: 0.8, color: 'text-gray-500' },
  medium: { label: 'Moyenne', multiplier: 1.0, color: 'text-blue-600' },
  high: { label: 'Haute', multiplier: 1.3, color: 'text-orange-600' },
  urgent: { label: 'Urgente', multiplier: 1.6, color: 'text-red-600' }
};

const RECURRENCE_MULTIPLIERS = {
  none: { label: 'Tâche unique', multiplier: 1.0 },
  daily: { label: 'Quotidienne', multiplier: 0.6 },
  weekly: { label: 'Hebdomadaire', multiplier: 1.0 },
  monthly: { label: 'Mensuelle', multiplier: 1.8 },
  yearly: { label: 'Annuelle', multiplier: 3.0 }
};

/**
 * 🧮 CALCUL AUTOMATIQUE XP
 */
const calculateAutoXP = (difficulty, priority, isRecurring, recurrenceType) => {
  const diffConfig = DIFFICULTY_XP_CONFIG[difficulty] || DIFFICULTY_XP_CONFIG.medium;
  const priorityConfig = PRIORITY_MULTIPLIERS[priority] || PRIORITY_MULTIPLIERS.medium;
  const recurrenceConfig = isRecurring ? 
    (RECURRENCE_MULTIPLIERS[recurrenceType] || RECURRENCE_MULTIPLIERS.none) : 
    RECURRENCE_MULTIPLIERS.none;
  
  const finalXP = Math.round(
    diffConfig.baseXP * 
    priorityConfig.multiplier * 
    recurrenceConfig.multiplier
  );
  
  return Math.max(5, Math.min(200, finalXP)); // Entre 5 et 200 XP
};

/**
 * 📝 MODAL DE CRÉATION/ÉDITION DE TÂCHES AVEC RÔLES SYNERGIA ET DATE PLANIFICATION
 */
const NewTaskModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData = null,
  mode = 'create' // 'create' ou 'edit'
}) => {
  const { user } = useAuthStore();
  
  // États du formulaire avec tous les champs avancés
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'medium',
    category: 'general',
    status: 'todo',
    dueDate: '',
    scheduledDate: '', // 🆕 DATE DE PLANIFICATION
    estimatedHours: 1,
    xpReward: 25,
    roleId: '', // ✅ RÔLE SYNERGIA
    tags: [],
    openToVolunteers: true,
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceDays: [],
    recurrenceEndDate: '',
    projectId: '',
    attachments: [],
    notes: ''
  });
  
  // États UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ CALCUL AUTOMATIQUE XP - OBLIGATION ABSOLUE
  useEffect(() => {
    const autoXP = calculateAutoXP(
      formData.difficulty, 
      formData.priority, 
      formData.isRecurring, 
      formData.recurrenceType
    );
    
    setFormData(prev => ({ ...prev, xpReward: autoXP }));
  }, [formData.difficulty, formData.priority, formData.isRecurring, formData.recurrenceType]);

  // ✅ PRÉ-REMPLISSAGE COMPLET POUR L'ÉDITION
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        // 🔧 MODE ÉDITION : PRÉ-REMPLIR AVEC TOUTES LES DONNÉES
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'medium',
          difficulty: initialData.difficulty || 'medium',
          category: initialData.category || 'general',
          status: initialData.status || 'todo',
          dueDate: initialData.dueDate ? (
            typeof initialData.dueDate === 'string' ? initialData.dueDate : 
            initialData.dueDate.toISOString ? initialData.dueDate.toISOString().split('T')[0] :
            initialData.dueDate.seconds ? new Date(initialData.dueDate.seconds * 1000).toISOString().split('T')[0] :
            ''
          ) : '',
          scheduledDate: initialData.scheduledDate ? (
            typeof initialData.scheduledDate === 'string' ? initialData.scheduledDate : 
            initialData.scheduledDate.toISOString ? initialData.scheduledDate.toISOString().split('T')[0] :
            initialData.scheduledDate.seconds ? new Date(initialData.scheduledDate.seconds * 1000).toISOString().split('T')[0] :
            ''
          ) : '',
          estimatedHours: initialData.estimatedHours || initialData.estimatedTime || 1,
          xpReward: initialData.xpReward || 25,
          roleId: initialData.roleId || '', // ✅ RÔLE SYNERGIA
          tags: Array.isArray(initialData.tags) ? [...initialData.tags] : [],
          openToVolunteers: Boolean(initialData.openToVolunteers),
          isRecurring: Boolean(initialData.isRecurring),
          recurrenceType: initialData.recurrenceType || 'none',
          recurrenceInterval: initialData.recurrenceInterval || 1,
          recurrenceDays: Array.isArray(initialData.recurrenceDays) ? [...initialData.recurrenceDays] : [],
          recurrenceEndDate: initialData.recurrenceEndDate ? (
            typeof initialData.recurrenceEndDate === 'string' ? initialData.recurrenceEndDate :
            initialData.recurrenceEndDate.toISOString ? initialData.recurrenceEndDate.toISOString().split('T')[0] :
            ''
          ) : '',
          projectId: initialData.projectId || '',
          attachments: Array.isArray(initialData.attachments) ? [...initialData.attachments] : [],
          notes: initialData.notes || ''
        });
        
      } else {
        // 🆕 MODE CRÉATION : FORMULAIRE VIDE AVEC VALEURS PAR DÉFAUT
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          difficulty: 'medium',
          category: 'general',
          status: 'todo',
          dueDate: '',
          scheduledDate: '',
          estimatedHours: 1,
          xpReward: 25,
          roleId: '',
          tags: [],
          openToVolunteers: true,
          isRecurring: false,
          recurrenceType: 'none',
          recurrenceInterval: 1,
          recurrenceDays: [],
          recurrenceEndDate: '',
          projectId: '',
          attachments: [],
          notes: ''
        });
      }
      
      setError('');
      setShowAdvanced(mode === 'edit'); // Montrer automatiquement les options avancées en mode édition
    }
  }, [initialData, mode, isOpen]);

  // Gestionnaire de changement de champ
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestion des tags
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Gestion des jours de récurrence
  const toggleRecurrenceDay = (day) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  // Fermeture de la modal
  const handleClose = () => {
    setError('');
    setLoading(false);
    setTagInput('');
    setSelectedFile(null);
    setShowAdvanced(false);
    onClose();
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Utilisateur non connecté. Veuillez vous reconnecter.');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Préparer les données nettoyées
      const cleanedData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority || 'medium',
        difficulty: formData.difficulty || 'medium',
        category: formData.category || 'general',
        status: formData.status || 'todo',
        xpReward: formData.xpReward, // ✅ XP calculé automatiquement
        estimatedHours: parseFloat(formData.estimatedHours) || 1,
        roleId: formData.roleId || null, // ✅ RÔLE SYNERGIA
        dueDate: formData.dueDate || null,
        scheduledDate: formData.scheduledDate || null, // 🆕 DATE DE PLANIFICATION
        openToVolunteers: Boolean(formData.openToVolunteers),
        isRecurring: Boolean(formData.isRecurring),
        recurrenceType: formData.isRecurring ? formData.recurrenceType : 'none',
        recurrenceInterval: formData.isRecurring ? parseInt(formData.recurrenceInterval) || 1 : 1,
        recurrenceDays: formData.isRecurring ? formData.recurrenceDays : [],
        recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate ? formData.recurrenceEndDate : null,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        projectId: formData.projectId || null,
        attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
        notes: formData.notes?.trim() || '',
        createdBy: initialData?.createdBy || user.uid,
        creatorName: initialData?.creatorName || user.displayName || user.email || 'Utilisateur',
        updatedAt: new Date()
      };

      // Mode édition vs création
      if (mode === 'edit' && initialData?.id) {
        cleanedData.id = initialData.id;
        cleanedData.createdAt = initialData.createdAt;
      } else {
        cleanedData.createdAt = new Date();
      }
      
      const result = await createTaskSafely(cleanedData, user);
      
      if (result && result.success) {
        if (onSuccess) {
          onSuccess(result.task || result);
        }
        
        handleClose();
        
        if (window.showNotification) {
          window.showNotification(
            mode === 'edit' ? 'Tâche modifiée avec succès !' : 'Tâche créée avec succès !', 
            'success'
          );
        }
      } else {
        const errorMsg = result?.message || result?.error || `Erreur lors de la ${mode === 'edit' ? 'modification' : 'création'}`;
        setError(errorMsg);
      }
      
    } catch (error) {
      console.error('Erreur traitement tâche:', error);
      setError(`Erreur technique lors de la ${mode === 'edit' ? 'modification' : 'création'}`);
    } finally {
      setLoading(false);
    }
  };

  // Ne pas render si pas ouvert
  if (!isOpen) return null;

  // Récupérer la config de difficulté actuelle
  const currentDifficultyConfig = DIFFICULTY_XP_CONFIG[formData.difficulty] || DIFFICULTY_XP_CONFIG.medium;
  const currentRoleConfig = SYNERGIA_ROLES[formData.roleId];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-4 pb-4 px-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
        style={{ paddingTop: '80px' }} // Décalage pour éviter la barre de navigation
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[calc(100vh-120px)] overflow-hidden shadow-2xl flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Compact */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-3">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  {mode === 'edit' ? 
                    <Edit className="w-4 h-4" /> : 
                    <Plus className="w-4 h-4" />
                  }
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {mode === 'edit' ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                  </h2>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              
              {/* Erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700">{error}</span>
                </motion.div>
              )}

              {/* Ligne 1: Titre + Rôle Synergia */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Titre */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Répondre aux avis Google"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    required
                  />
                </div>

                {/* Rôle Synergia */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Rôle Synergia
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Aucun rôle spécifique</option>
                    {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                  {currentRoleConfig && (
                    <p className={`text-xs mt-1 ${currentRoleConfig.textColor}`}>
                      {currentRoleConfig.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Ligne 2: Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Description détaillée
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Décrivez précisément ce qui doit être fait..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              {/* Ligne 3: Difficulté + Priorité + XP */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Difficulté
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    {Object.entries(DIFFICULTY_XP_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 ${currentDifficultyConfig.color}`}>
                    {currentDifficultyConfig.description}
                  </p>
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Flag className="w-4 h-4 inline mr-2" />
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    {Object.entries(PRIORITY_MULTIPLIERS).map(([key, config]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({config.label})
                      </option>
                    ))}
                  </select>
                </div>

                {/* XP Calculé automatiquement */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Trophy className="w-4 h-4 inline mr-2" />
                    XP (Calculé automatiquement)
                  </label>
                  <div className="w-full p-4 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-xl text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      ⚡ {formData.xpReward} XP
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      Auto-calculé selon difficulté et priorité
                    </div>
                  </div>
                </div>
              </div>

              {/* Ligne 4: Date échéance + Date planification + Heures estimées */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Date d'échéance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* 🆕 Date de planification */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Date de planification
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    ⭐ Jour précis où la tâche doit apparaître
                  </p>
                </div>

                {/* Heures estimées */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Heures estimées
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    min="0.5"
                    max="40"
                    step="0.5"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Options avancées */}
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 font-semibold mb-4"
                >
                  {showAdvanced ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  {showAdvanced ? 'Masquer les options avancées' : 'Afficher les options avancées'}
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6"
                    >
                      {/* Gestion des tags */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Tag className="w-4 h-4 inline mr-2" />
                          Tags
                        </label>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            placeholder="Ajouter un tag..."
                            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Tags existants */}
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:text-indigo-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Ouvert aux volontaires */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="openToVolunteers"
                          name="openToVolunteers"
                          checked={formData.openToVolunteers}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="openToVolunteers" className="text-sm font-medium text-gray-700">
                          <Users className="w-4 h-4 inline mr-2" />
                          Ouvert aux volontaires
                        </label>
                      </div>

                      {/* Tâche récurrente */}
                      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            id="isRecurring"
                            name="isRecurring"
                            checked={formData.isRecurring}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="isRecurring" className="text-sm font-semibold text-blue-700">
                            <Repeat className="w-4 h-4 inline mr-2" />
                            Tâche récurrente
                          </label>
                        </div>

                        {formData.isRecurring && (
                          <div className="space-y-4">
                            {/* Type de récurrence */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-blue-700 mb-2">
                                  Type de récurrence
                                </label>
                                <select
                                  name="recurrenceType"
                                  value={formData.recurrenceType}
                                  onChange={handleInputChange}
                                  className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                >
                                  <option value="daily">Quotidienne (x0.6 XP)</option>
                                  <option value="weekly">Hebdomadaire (x1.0 XP)</option>
                                  <option value="monthly">Mensuelle (x1.8 XP)</option>
                                  <option value="yearly">Annuelle (x3.0 XP)</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-blue-700 mb-2">
                                  Intervalle
                                </label>
                                <input
                                  type="number"
                                  name="recurrenceInterval"
                                  value={formData.recurrenceInterval}
                                  onChange={handleInputChange}
                                  min="1"
                                  max="12"
                                  className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                              </div>
                            </div>

                            {/* Jours de la semaine pour récurrence hebdomadaire */}
                            {formData.recurrenceType === 'weekly' && (
                              <div>
                                <label className="block text-sm font-medium text-blue-700 mb-2">
                                  Jours de la semaine
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={() => toggleRecurrenceDay(day)}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        formData.recurrenceDays.includes(day)
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                      }`}
                                    >
                                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Date de fin de récurrence */}
                            <div>
                              <label className="block text-sm font-medium text-blue-700 mb-2">
                                Date de fin de récurrence (optionnel)
                              </label>
                              <input
                                type="date"
                                name="recurrenceEndDate"
                                value={formData.recurrenceEndDate}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes supplémentaires */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Info className="w-4 h-4 inline mr-2" />
                          Notes supplémentaires
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Notes internes, contexte, remarques..."
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* Footer avec actions - FIXÉ VISIBLE */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                Les XP sont calculés automatiquement
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim()}
                  className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {mode === 'edit' ? 'Modification...' : 'Création...'}
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
