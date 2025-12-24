// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// MODAL CRÉATION QUÊTE COMPLÈTE AVEC UPLOAD FICHIERS VERS FIREBASE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Save,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  Trophy,
  Paperclip,
  CheckCircle,
  Edit,
  Star,
  Target,
  Repeat,
  Users,
  Info,
  Zap,
  Flag,
  FileText,
  Upload,
  Eye,
  EyeOff,
  MapPin,
  Loader,
  Tag
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { createTaskSafely } from '../../core/services/taskCreationFix.js';
import storageService from '../../core/services/storageService.js';
import { db } from '../../core/firebase.js';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { SKILLS, SKILL_BRANCHES } from '../../core/services/skillService.js';


/**
 * 🎮 NIVEAUX DE DIFFICULTÉ
 */
const DIFFICULTY_LEVELS = {
  easy: { label: 'Facile', icon: '🟢', xpMultiplier: 1, color: 'text-green-400' },
  medium: { label: 'Moyen', icon: '🟡', xpMultiplier: 1.5, color: 'text-yellow-400' },
  hard: { label: 'Difficile', icon: '🟠', xpMultiplier: 2, color: 'text-orange-400' },
  expert: { label: 'Expert', icon: '🔴', xpMultiplier: 3, color: 'text-red-400' }
};

/**
 * 📊 PRIORITÉS
 */
const PRIORITY_LEVELS = {
  low: { label: 'Basse', icon: '⬇️', color: 'text-gray-400' },
  medium: { label: 'Moyenne', icon: '➡️', color: 'text-yellow-400' },
  high: { label: 'Haute', icon: '⬆️', color: 'text-orange-400' },
  urgent: { label: 'Urgente', icon: '🔥', color: 'text-red-400' }
};

/**
 * 🎯 COMPOSANT PRINCIPAL : MODAL DE CRÉATION/ÉDITION DE QUÊTE
 */
const NewTaskModal = ({ 
  onClose, 
  onTaskCreated, 
  task = null, 
  mode = 'create' 
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  // États pour l'upload de fichiers (MULTI-FICHIERS)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // État du formulaire avec valeurs par défaut
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'medium',
    status: 'todo',
    xpReward: 50,
    estimatedHours: 1,
    dueDate: '',
    scheduledDate: '',
    openToVolunteers: false,
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceDays: [],
    recurrenceEndDate: '',
    tags: [],
    attachments: [],
    requiredSkills: []
  });

  // Charger les données si mode édition
  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        difficulty: task.difficulty || 'medium',
        status: task.status || 'todo',
        xpReward: task.xpReward || 50,
        estimatedHours: task.estimatedHours || 1,
        dueDate: task.dueDate || '',
        scheduledDate: task.scheduledDate || '',
        openToVolunteers: task.openToVolunteers || false,
        isRecurring: task.isRecurring || false,
        recurrenceType: task.recurrenceType || 'none',
        recurrenceInterval: task.recurrenceInterval || 1,
        recurrenceDays: task.recurrenceDays || [],
        recurrenceEndDate: task.recurrenceEndDate || '',
        tags: Array.isArray(task.tags) ? task.tags : [],
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
        requiredSkills: Array.isArray(task.requiredSkills) ? task.requiredSkills : []
      });
    }
  }, [task, mode]);

  // Calcul automatique des XP
  useEffect(() => {
    const difficultyMultiplier = DIFFICULTY_LEVELS[formData.difficulty]?.xpMultiplier || 1;
    const baseXP = 30;
    const hoursXP = formData.estimatedHours * 10;
    const priorityBonus = formData.priority === 'urgent' ? 20 : formData.priority === 'high' ? 10 : 0;
    
    const calculatedXP = Math.round((baseXP + hoursXP) * difficultyMultiplier + priorityBonus);
    
    setFormData(prev => ({ ...prev, xpReward: calculatedXP }));
  }, [formData.difficulty, formData.estimatedHours, formData.priority]);

  // Gestion des changements d'input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestion des tags
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Gestion de la sélection de fichiers (MULTI-FICHIERS, SANS LIMITE)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Vérifier que ce sont des images ou vidéos
      const validFiles = files.filter(file => {
        const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
        if (!isValid) {
          console.warn('⚠️ Fichier ignoré (type non supporté):', file.name);
        }
        return isValid;
      });

      if (validFiles.length === 0) {
        setError('Seules les images et vidéos sont acceptées');
        return;
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
      setError('');

      // Reset input pour permettre la resélection
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Supprimer un fichier de la sélection
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload de tous les fichiers vers Firebase Storage
  const uploadFilesToStorage = async () => {
    if (selectedFiles.length === 0) return [];

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log('📤 [UPLOAD] Début upload de', selectedFiles.length, 'fichiers');

      const uploadResults = await storageService.uploadMultipleFiles(
        selectedFiles,
        user.uid,
        'task',
        null,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      console.log('✅ [UPLOAD] Tous les fichiers uploadés:', uploadResults.length);

      return uploadResults.map(result => ({
        name: result.name,
        url: result.url,
        type: result.type,
        size: result.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.uid
      }));

    } catch (error) {
      console.error('❌ [UPLOAD] Erreur upload:', error);
      setError('Erreur lors de l\'upload des fichiers. La quête sera créée sans pièces jointes.');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    setTagInput('');
    setSelectedFiles([]);
    setShowAdvanced(false);
    setUploadProgress(0);
    setUploading(false);
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
      // ✅ ÉTAPE 1 : Upload des fichiers si présents
      let uploadedAttachments = [];
      if (selectedFiles.length > 0) {
        console.log('📤 Upload de', selectedFiles.length, 'fichiers avant création de la quête...');
        uploadedAttachments = await uploadFilesToStorage();

        if (uploadedAttachments.length === 0) {
          console.warn('⚠️ Upload échoué, création de la quête sans fichiers');
        } else {
          console.log('✅', uploadedAttachments.length, 'fichiers uploadés');
        }
      }

      // ✅ ÉTAPE 2 : Préparer les données avec les attachments uploadés
      const existingAttachments = Array.isArray(formData.attachments) ? formData.attachments : [];
      const attachments = [...existingAttachments, ...uploadedAttachments];

      const cleanedData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority || 'medium',
        difficulty: formData.difficulty || 'medium',
        status: formData.status || 'todo',
        xpReward: formData.xpReward,
        estimatedHours: parseFloat(formData.estimatedHours) || 1,
        dueDate: formData.dueDate || null,
        scheduledDate: formData.scheduledDate || null,
        openToVolunteers: Boolean(formData.openToVolunteers),
        isRecurring: Boolean(formData.isRecurring),
        recurrenceType: formData.isRecurring ? formData.recurrenceType : 'none',
        recurrenceInterval: formData.isRecurring ? parseInt(formData.recurrenceInterval) || 1 : 1,
        recurrenceDays: formData.isRecurring ? formData.recurrenceDays : [],
        recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate ? formData.recurrenceEndDate : null,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        attachments: attachments,
        requiredSkills: Array.isArray(formData.requiredSkills) ? formData.requiredSkills : [],
        createdBy: user.uid,
        createdByName: user.displayName || user.email || 'Utilisateur',
        assignedTo: []
      };

      console.log('✅ [QUÊTE] Données nettoyées:', cleanedData);

      // ✅ ÉTAPE 3 : Créer la quête via le service sécurisé
      if (mode === 'create') {
        await createTaskSafely(cleanedData);
        console.log('✅ [QUÊTE] Quête créée avec succès');
} else if (mode === 'edit' && task?.id) {
  // 🔥 MISE À JOUR DE LA QUÊTE
  console.log('🔄 [QUÊTE] Mise à jour de la quête:', task.id);
  
  const taskRef = doc(db, 'tasks', task.id);
  const taskSnap = await getDoc(taskRef);
  
  if (!taskSnap.exists()) {
    throw new Error('Cette quête n\'existe plus dans la base de données.');
  }
  
  // Préparer les données sans les champs de création
  const { createdBy, createdByName, createdAt, assignedTo, ...updateFields } = cleanedData;
  
  await updateDoc(taskRef, {
    ...updateFields,
    updatedAt: serverTimestamp(),
    lastUpdatedBy: user.uid
  });
  
  console.log('✅ [QUÊTE] Quête mise à jour avec succès');
}

      // ✅ Succès
      handleClose();
      if (onTaskCreated) onTaskCreated();
      
    } catch (error) {
      console.error('❌ [QUÊTE] Erreur création:', error);
      setError(error.message || 'Erreur lors de la création de la quête');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[95vh] bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
        >
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  {mode === 'edit' ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {mode === 'edit' ? 'Modifier la quête' : 'Nouvelle quête'}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/70">
                    Les XP sont calculés automatiquement
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body avec scroll */}
          <div className="flex-1 overflow-y-auto">
            <form className="p-4 sm:p-5 space-y-4">

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Star className="w-4 h-4 inline mr-2 text-yellow-400" />
                  Titre de la quête *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Nettoyer la salle 2"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2 text-blue-400" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez l'objectif de la quête..."
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />
              </div>

              {/* Grille de sélections rapides */}
              <div className="grid grid-cols-2 gap-3">

                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Target className="w-4 h-4 inline mr-2 text-orange-400" />
                    Difficulté
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 transition-all"
                  >
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, diff]) => (
                      <option key={key} value={key} className="bg-gray-800">
                        {diff.icon} {diff.label} (x{diff.xpMultiplier})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Flag className="w-4 h-4 inline mr-2 text-red-400" />
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 transition-all"
                  >
                    {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                      <option key={key} value={key} className="bg-gray-800">
                        {priority.icon} {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Temps estimé et XP */}
              <div className="grid grid-cols-2 gap-3">

                {/* Temps estimé */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2 text-cyan-400" />
                    Temps (heures)
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 transition-all"
                  />
                </div>

                {/* XP (calculé automatiquement) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Trophy className="w-4 h-4 inline mr-2 text-yellow-400" />
                    XP Récompense
                  </label>
                  <div className="w-full p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl font-bold text-yellow-400 flex items-center justify-between">
                    <span>{formData.xpReward} XP</span>
                    <span className="text-[10px] text-yellow-500/70">Auto</span>
                  </div>
                </div>
              </div>

              {/* Compétences développées */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Zap className="w-4 h-4 inline mr-2 text-purple-400" />
                  Compétences développées
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  L'XP sera distribué automatiquement aux compétences sélectionnées.
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-3">
                  {Object.entries(SKILL_BRANCHES).map(([branchId, branch]) => (
                    <div key={branchId} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <span>{branch.emoji}</span>
                        <span>{branch.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pl-4">
                        {branch.skills?.map(skillId => {
                          const skill = SKILLS[skillId];
                          if (!skill) return null;

                          const isSelected = formData.requiredSkills.includes(skillId);

                          return (
                            <button
                              key={skillId}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  requiredSkills: isSelected
                                    ? prev.requiredSkills.filter(id => id !== skillId)
                                    : [...prev.requiredSkills, skillId]
                                }));
                              }}
                              className={`
                                flex items-center gap-1.5 p-2 rounded-lg text-left text-xs transition-all
                                ${isSelected
                                  ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                                  : 'bg-white/5 border border-transparent hover:border-white/20 text-gray-400'
                                }
                              `}
                            >
                              <span>{skill.emoji}</span>
                              <span className="truncate">{skill.name}</span>
                              {isSelected && <CheckCircle className="w-3 h-3 ml-auto text-purple-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills sélectionnés */}
                {formData.requiredSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formData.requiredSkills.map(skillId => {
                      const skill = SKILLS[skillId];
                      return skill ? (
                        <span
                          key={skillId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                        >
                          {skill.emoji} {skill.name}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              requiredSkills: prev.requiredSkills.filter(id => id !== skillId)
                            }))}
                            className="hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2 text-green-400" />
                    Échéance
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 transition-all [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2 text-pink-400" />
                    Planification
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 bg-white/5 border border-white/10 p-3 rounded-xl">

                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    name="openToVolunteers"
                    checked={formData.openToVolunteers}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/30 bg-white/5 text-purple-500 focus:ring-purple-500/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Ouvrir aux volontaires</span>
                    </div>
                    <p className="text-xs text-gray-500">Les membres peuvent se proposer</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-white/30 bg-white/5 text-purple-500 focus:ring-purple-500/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-gray-300">Quête récurrente</span>
                    </div>
                    <p className="text-xs text-gray-500">Se répète automatiquement</p>
                  </div>
                </label>
              </div>

              {/* Options de récurrence */}
              {formData.isRecurring && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 space-y-3">
                  <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Configuration récurrence
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Type
                      </label>
                      <select
                        name="recurrenceType"
                        value={formData.recurrenceType}
                        onChange={handleInputChange}
                        className="w-full p-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-purple-500 transition-all"
                      >
                        <option value="daily" className="bg-gray-800">Quotidien</option>
                        <option value="weekly" className="bg-gray-800">Hebdomadaire</option>
                        <option value="biweekly" className="bg-gray-800">Bi-hebdo</option>
                        <option value="monthly" className="bg-gray-800">Mensuel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Intervalle
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="recurrenceInterval"
                          value={formData.recurrenceInterval}
                          onChange={handleInputChange}
                          min="1"
                          max="30"
                          className="w-16 p-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm text-center focus:border-purple-500 transition-all"
                        />
                        <span className="text-xs text-gray-400">
                          {formData.recurrenceType === 'daily' && 'jour(s)'}
                          {formData.recurrenceType === 'weekly' && 'sem.'}
                          {formData.recurrenceType === 'biweekly' && 'quinz.'}
                          {formData.recurrenceType === 'monthly' && 'mois'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(formData.recurrenceType === 'weekly' || formData.recurrenceType === 'biweekly') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">
                        Jours
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'monday', label: 'L' },
                          { id: 'tuesday', label: 'M' },
                          { id: 'wednesday', label: 'M' },
                          { id: 'thursday', label: 'J' },
                          { id: 'friday', label: 'V' },
                          { id: 'saturday', label: 'S' },
                          { id: 'sunday', label: 'D' }
                        ].map(day => {
                          const isSelected = formData.recurrenceDays.includes(day.id);
                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  recurrenceDays: isSelected
                                    ? prev.recurrenceDays.filter(d => d !== day.id)
                                    : [...prev.recurrenceDays, day.id]
                                }));
                              }}
                              className={`
                                w-8 h-8 rounded-lg font-medium text-xs transition-all
                                ${isSelected
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-purple-500/50'
                                }
                              `}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      name="recurrenceEndDate"
                      value={formData.recurrenceEndDate}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-purple-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2 text-indigo-400" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Ajouter un tag..."
                    className="flex-1 p-2.5 bg-white/5 border border-white/20 rounded-xl text-white text-sm placeholder-gray-500 focus:border-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-500/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload de fichiers (MULTI-FICHIERS) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Paperclip className="w-4 h-4 inline mr-2 text-gray-400" />
                  Photos / Vidéos
                  <span className="text-xs text-gray-500 ml-2">(sans limite de taille)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full p-3 border border-dashed border-white/20 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-purple-300"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} fichier(s) sélectionné(s) - Ajouter plus`
                      : 'Ajouter des photos ou vidéos'}
                  </span>
                </button>

                {/* Liste des fichiers sélectionnés */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10"
                      >
                        {file.type.startsWith('image/') ? (
                          <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center">
                            <Paperclip className="w-4 h-4 text-purple-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                            {file.type.startsWith('video/') && ' • Vidéo'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploading && (
                  <div className="mt-2">
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Upload... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/5 border-t border-white/10 flex-shrink-0">
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading || uploading}
                className="px-5 py-2.5 text-gray-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || uploading || !formData.title.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-purple-500/25"
              >
                {loading || uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>{uploading ? 'Upload...' : 'Création...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{mode === 'edit' ? 'Modifier' : 'Créer'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewTaskModal;
