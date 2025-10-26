// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// CORRECTION LARGEUR RESPONSIVE - CONTENU IDENTIQUE
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
  client_experience: {
    id: 'client_experience',
    name: 'Expérience Client',
    icon: '😊',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-600',
    description: 'Satisfaction et parcours client'
  },
  communication: {
    id: 'communication',
    name: 'Communication & Marketing',
    icon: '📣',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    textColor: 'text-purple-600',
    description: 'Promotion et communication'
  },
  admin: {
    id: 'admin',
    name: 'Administration & Gestion',
    icon: '📋',
    color: 'bg-gradient-to-r from-gray-600 to-gray-700',
    textColor: 'text-gray-600',
    description: 'Tâches administratives'
  },
  environment: {
    id: 'environment',
    name: 'Développement Durable',
    icon: '🌱',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-600',
    description: 'Écologie et durabilité'
  },
  innovation: {
    id: 'innovation',
    name: 'Innovation & Amélioration',
    icon: '💡',
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textColor: 'text-cyan-600',
    description: 'Projets d\'innovation'
  }
};

const NewTaskModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  mode = 'create',
  initialData = null
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
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

  // ✅ CALCUL AUTOMATIQUE DES XP - OBLIGATOIRE
  useEffect(() => {
    // Calculer XP automatiquement selon difficulté, priorité et récurrence
    const baseXP = {
      easy: 15,
      medium: 25,
      hard: 40
    }[formData.difficulty] || 25;

    const priorityMultiplier = {
      low: 1.0,
      medium: 1.2,
      high: 1.5
    }[formData.priority] || 1.2;

    const recurrenceMultiplier = formData.isRecurring ? 0.8 : 1.0;

    const calculatedXP = Math.round(baseXP * priorityMultiplier * recurrenceMultiplier);

    setFormData(prev => ({
      ...prev,
      xpReward: Math.max(5, calculatedXP) // Minimum 5 XP
    }));
  }, [formData.difficulty, formData.priority, formData.isRecurring]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
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
          roleId: initialData.roleId || '',
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
        setShowAdvanced(mode === 'edit');
      } else {
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
      setShowAdvanced(mode === 'edit');
    }
  }, [initialData, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

  const toggleRecurrenceDay = (day) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    setTagInput('');
    setSelectedFile(null);
    setShowAdvanced(false);
    onClose();
  };

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
      const cleanedData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority || 'medium',
        difficulty: formData.difficulty || 'medium',
        category: formData.category || 'general',
        status: formData.status || 'todo',
        xpReward: formData.xpReward,
        estimatedHours: parseFloat(formData.estimatedHours) || 1,
        roleId: formData.roleId || null,
        dueDate: formData.dueDate || null,
        scheduledDate: formData.scheduledDate || null,
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start sm:items-center sm:justify-center z-50 p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-none sm:rounded-xl shadow-xl w-full max-w-[375px] sm:max-w-[95vw] md:max-w-4xl h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {mode === 'edit' ? 
                    <Edit className="w-5 h-5" /> : 
                    <Plus className="w-5 h-5" />
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
          <div className="overflow-y-auto flex-1">
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
                    Catégorie Synergia
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Aucune catégorie spécifique</option>
                    {Object.values(SYNERGIA_ROLES).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez la tâche en détail..."
                  rows="4"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              {/* Ligne 2: Priorité + Difficulté + Catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                </div>

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
                    <option value="easy">😊 Facile</option>
                    <option value="medium">😐 Moyenne</option>
                    <option value="hard">😰 Difficile</option>
                  </select>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Catégorie
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="general">Général</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="development">Développement</option>
                    <option value="content">Contenu</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              {/* Ligne 3: Date de planification + Date limite */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date de planification */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date de planification
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* Date limite */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Date limite
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Ligne 4: Temps estimé UNIQUEMENT (XP calculé automatiquement) */}
              <div className="grid grid-cols-1 gap-6">
                {/* Temps estimé */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Temps estimé (heures)
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    💡 Les XP sont calculés automatiquement selon la difficulté, la priorité et la récurrence
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Ajouter un tag..."
                    className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-indigo-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload fichiers/photos/vidéos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Pièce jointe (photo/vidéo/fichier)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3 text-sm text-gray-700">
                        <Paperclip className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Choisir un fichier
                      </button>
                      <p className="text-xs text-gray-500">
                        Photos, vidéos, PDF ou documents (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Options avancées */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAdvanced ? 'Masquer' : 'Afficher'} les options avancées
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                  
                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Target className="w-4 h-4 inline mr-2" />
                      Statut
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    >
                      <option value="todo">À faire</option>
                      <option value="in_progress">En cours</option>
                      <option value="validation_pending">En validation</option>
                      <option value="completed">Terminée</option>
                    </select>
                  </div>

                  {/* Ouvert aux volontaires */}
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200">
                    <input
                      type="checkbox"
                      id="openToVolunteers"
                      name="openToVolunteers"
                      checked={formData.openToVolunteers}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <label htmlFor="openToVolunteers" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Ouvert aux volontaires
                    </label>
                  </div>

                  {/* Récurrence */}
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-gray-200">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Tâche récurrente
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="space-y-4 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      {/* Type de récurrence */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Type de récurrence
                        </label>
                        <select
                          name="recurrenceType"
                          value={formData.recurrenceType}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg"
                        >
                          <option value="daily">Quotidienne</option>
                          <option value="weekly">Hebdomadaire</option>
                          <option value="monthly">Mensuelle</option>
                        </select>
                      </div>

                      {/* Intervalle */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Intervalle
                        </label>
                        <input
                          type="number"
                          name="recurrenceInterval"
                          value={formData.recurrenceInterval}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full p-3 border-2 border-gray-200 rounded-lg"
                        />
                      </div>

                      {/* Jours de la semaine (si hebdomadaire) */}
                      {formData.recurrenceType === 'weekly' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Jours de la semaine
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleRecurrenceDay(index)}
                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                  formData.recurrenceDays.includes(index)
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 border-2 border-gray-200'
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Date de fin */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          name="recurrenceEndDate"
                          value={formData.recurrenceEndDate}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Notes supplémentaires
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Notes internes, instructions spéciales..."
                      rows="3"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Footer */}
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
