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
  
  // États pour l'upload de fichiers
  const [selectedFile, setSelectedFile] = useState(null);
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

  // Gestion de la sélection de fichier
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 5MB)');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  // Upload du fichier vers Firebase Storage
  const uploadFileToStorage = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      console.log('📤 [UPLOAD] Début upload fichier:', selectedFile.name);
      
      const uploadResult = await storageService.uploadTaskAttachment(
        selectedFile,
        user.uid,
        (progress) => {
          setUploadProgress(progress);
          console.log('📊 [UPLOAD] Progression:', progress + '%');
        }
      );
      
      console.log('✅ [UPLOAD] Fichier uploadé:', uploadResult);
      
      return {
        name: selectedFile.name,
        url: uploadResult.url,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.uid
      };
      
    } catch (error) {
      console.error('❌ [UPLOAD] Erreur upload:', error);
      
      if (error.message?.includes('non autorisé')) {
        setError('Upload non autorisé. Vérifiez les règles Firebase Storage.');
      } else if (error.message?.includes('trop volumineux')) {
        setError('Fichier trop volumineux (max 5MB)');
      } else {
        console.warn('⚠️ [UPLOAD] Échec upload, la quête sera créée sans fichier.');
      }
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    setTagInput('');
    setSelectedFile(null);
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
      // ✅ ÉTAPE 1 : Upload du fichier si présent
      let uploadedAttachment = null;
      if (selectedFile) {
        console.log('📤 Upload du fichier avant création de la quête...');
        uploadedAttachment = await uploadFileToStorage();
        
        if (!uploadedAttachment) {
          console.warn('⚠️ Upload échoué, création de la quête sans fichier');
        }
      }

      // ✅ ÉTAPE 2 : Préparer les données avec l'attachment uploadé
      const attachments = uploadedAttachment 
        ? [uploadedAttachment] 
        : (Array.isArray(formData.attachments) ? formData.attachments : []);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
        >
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {mode === 'edit' ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {mode === 'edit' ? 'Modifier la quête' : 'Nouvelle quête'}
                  </h2>
                  <p className="text-sm text-white text-opacity-80">
                    Les XP sont calculés automatiquement
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body avec scroll */}
          <div className="flex-1 overflow-y-auto">
            <form className="p-6 space-y-6">
              
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Star className="w-4 h-4 inline mr-2 text-indigo-600" />
                  Titre de la quête *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Nettoyer la salle 2"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2 text-indigo-600" />
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez l'objectif de la quête..."
                  rows={4}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                  required
                />
              </div>

              {/* Grille de sélections rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2 text-indigo-600" />
                    Difficulté
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, diff]) => (
                      <option key={key} value={key}>
                        {diff.icon} {diff.label} (x{diff.xpMultiplier})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priorité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Flag className="w-4 h-4 inline mr-2 text-indigo-600" />
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                      <option key={key} value={key}>
                        {priority.icon} {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Temps estimé et XP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Temps estimé */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2 text-indigo-600" />
                    Temps estimé (heures)
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* XP (calculé automatiquement) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Trophy className="w-4 h-4 inline mr-2 text-yellow-600" />
                    XP de récompense
                  </label>
                  <div className="w-full p-3 border-2 border-yellow-200 bg-yellow-50 rounded-xl font-bold text-yellow-700 flex items-center justify-between">
                    <span>{formData.xpReward} XP</span>
                    <span className="text-xs text-yellow-600">Calculé automatiquement</span>
                  </div>
                </div>
              </div>

              {/* 🌳 Compétences requises */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Zap className="w-4 h-4 inline mr-2 text-purple-600" />
                  Compétences développées (optionnel)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Sélectionnez les compétences que cette quête permet de développer. L'XP sera distribué automatiquement.
                </p>

                <div className="space-y-3 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-3">
                  {Object.entries(SKILL_BRANCHES).map(([branchId, branch]) => (
                    <div key={branchId} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span>{branch.emoji}</span>
                        <span>{branch.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-6">
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
                                flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all
                                ${isSelected
                                  ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-300 text-gray-600'
                                }
                              `}
                            >
                              <span>{skill.emoji}</span>
                              <span className="truncate">{skill.name}</span>
                              {isSelected && <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Afficher les skills sélectionnés */}
                {formData.requiredSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Sélectionnés :</span>
                    {formData.requiredSkills.map(skillId => {
                      const skill = SKILLS[skillId];
                      return skill ? (
                        <span
                          key={skillId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                        >
                          {skill.emoji} {skill.name}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              requiredSkills: prev.requiredSkills.filter(id => id !== skillId)
                            }))}
                            className="hover:text-purple-900"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Date d'échéance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2 text-indigo-600" />
                    Date d'échéance
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                {/* Date de planification */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2 text-indigo-600" />
                    Date de planification
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                
                {/* Ouverte aux volontaires */}
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="openToVolunteers"
                    checked={formData.openToVolunteers}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">Ouvrir aux volontaires</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Les membres peuvent se proposer pour cette quête
                    </p>
                  </div>
                </label>

                {/* Récurrente */}
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Repeat className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">Quête récurrente</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Cette quête se répète automatiquement
                    </p>
                  </div>
                </label>
              </div>

              {/* 🔄 Options de récurrence détaillées */}
              {formData.isRecurring && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Configuration de la récurrence
                  </h4>

                  {/* Type de récurrence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de répétition
                      </label>
                      <select
                        name="recurrenceType"
                        value={formData.recurrenceType}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all"
                      >
                        <option value="daily">Tous les jours</option>
                        <option value="weekly">Chaque semaine</option>
                        <option value="biweekly">Toutes les 2 semaines</option>
                        <option value="monthly">Chaque mois</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intervalle
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Tous les</span>
                        <input
                          type="number"
                          name="recurrenceInterval"
                          value={formData.recurrenceInterval}
                          onChange={handleInputChange}
                          min="1"
                          max="30"
                          className="w-20 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all text-center"
                        />
                        <span className="text-sm text-gray-600">
                          {formData.recurrenceType === 'daily' && 'jour(s)'}
                          {formData.recurrenceType === 'weekly' && 'semaine(s)'}
                          {formData.recurrenceType === 'biweekly' && 'quinzaine(s)'}
                          {formData.recurrenceType === 'monthly' && 'mois'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Jours de la semaine (pour weekly/biweekly) */}
                  {(formData.recurrenceType === 'weekly' || formData.recurrenceType === 'biweekly') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jours de la semaine
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'monday', label: 'Lun', full: 'Lundi' },
                          { id: 'tuesday', label: 'Mar', full: 'Mardi' },
                          { id: 'wednesday', label: 'Mer', full: 'Mercredi' },
                          { id: 'thursday', label: 'Jeu', full: 'Jeudi' },
                          { id: 'friday', label: 'Ven', full: 'Vendredi' },
                          { id: 'saturday', label: 'Sam', full: 'Samedi' },
                          { id: 'sunday', label: 'Dim', full: 'Dimanche' }
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
                                px-4 py-2 rounded-lg font-medium text-sm transition-all
                                ${isSelected
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300'
                                }
                              `}
                              title={day.full}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                      {formData.recurrenceDays.length === 0 && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Sélectionnez au moins un jour
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date de fin de récurrence */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      name="recurrenceEndDate"
                      value={formData.recurrenceEndDate}
                      onChange={handleInputChange}
                      className="w-full md:w-64 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide pour une récurrence sans fin
                    </p>
                  </div>

                  {/* Résumé de la récurrence */}
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <p className="text-sm text-indigo-700">
                      <strong>📅 Résumé :</strong>{' '}
                      {formData.recurrenceType === 'daily' && (
                        <>Cette quête sera recréée tous les {formData.recurrenceInterval > 1 ? `${formData.recurrenceInterval} jours` : 'jours'}</>
                      )}
                      {formData.recurrenceType === 'weekly' && formData.recurrenceDays.length > 0 && (
                        <>
                          Cette quête sera recréée chaque{' '}
                          {formData.recurrenceDays.map(d => {
                            const dayNames = { monday: 'lundi', tuesday: 'mardi', wednesday: 'mercredi', thursday: 'jeudi', friday: 'vendredi', saturday: 'samedi', sunday: 'dimanche' };
                            return dayNames[d];
                          }).join(', ')}
                          {formData.recurrenceInterval > 1 && ` (toutes les ${formData.recurrenceInterval} semaines)`}
                        </>
                      )}
                      {formData.recurrenceType === 'biweekly' && formData.recurrenceDays.length > 0 && (
                        <>
                          Cette quête sera recréée toutes les 2 semaines le{' '}
                          {formData.recurrenceDays.map(d => {
                            const dayNames = { monday: 'lundi', tuesday: 'mardi', wednesday: 'mercredi', thursday: 'jeudi', friday: 'vendredi', saturday: 'samedi', sunday: 'dimanche' };
                            return dayNames[d];
                          }).join(', ')}
                        </>
                      )}
                      {formData.recurrenceType === 'monthly' && (
                        <>Cette quête sera recréée tous les {formData.recurrenceInterval > 1 ? `${formData.recurrenceInterval} mois` : 'mois'}</>
                      )}
                      {formData.recurrenceEndDate && (
                        <> jusqu'au {new Date(formData.recurrenceEndDate).toLocaleDateString('fr-FR')}</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-2 text-indigo-600" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Ajouter un tag..."
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Liste des tags */}
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
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-indigo-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload de fichier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Paperclip className="w-4 h-4 inline mr-2 text-indigo-600" />
                  Pièce jointe (optionnel)
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-indigo-600"
                >
                  <Upload className="w-5 h-5" />
                  <span>{selectedFile ? selectedFile.name : 'Choisir un fichier'}</span>
                </button>

                {uploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Upload en cours... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* Footer avec actions */}
          <div className="p-6 bg-gray-100 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading || uploading}
                className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || uploading || !formData.title.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                {loading || uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>{uploading ? 'Upload en cours...' : 'Création...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{mode === 'edit' ? 'Mettre à jour' : 'Créer la quête'}</span>
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
