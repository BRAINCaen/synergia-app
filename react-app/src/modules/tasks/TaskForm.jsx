// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE DE TÂCHE AVEC RÉCURRENCE HEBDOMADAIRE INTELLIGENTE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Play,
  FileVideo,
  AlertTriangle,
  Users,
  Clock,
  Star,
  Info,
  CheckCircle,
  Loader,
  Target,
  Flag,
  Trophy,
  Tag,
  Calendar,
  FileText,
  Shield,
  Repeat,
  Heart,
  Save
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectService } from '../../core/services/projectService.js';
import { calculateXP } from '../../shared/utils/xpCalculator.js';
import { mediaUploadService } from '../../core/services/mediaUploadService.js';
import weeklyRecurrenceService from '../../core/services/weeklyRecurrenceService.js';

/**
 * 🎭 RÔLES SYNERGIA COMPLETS
 */
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-yellow-500'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500'
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-purple-500'
  },
  content: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-pink-500'
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-green-500'
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500'
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux',
    icon: '📱',
    color: 'bg-cyan-500'
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500'
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & XP',
    icon: '🎮',
    color: 'bg-red-500'
  }
};

/**
 * 🎯 OPTIONS DE DIFFICULTÉ ET PRIORITÉ
 */
const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Facile (15 XP)', xp: 15, color: 'text-green-600' },
  { value: 'medium', label: 'Moyen (25 XP)', xp: 25, color: 'text-yellow-600' },
  { value: 'hard', label: 'Difficile (40 XP)', xp: 40, color: 'text-orange-600' },
  { value: 'expert', label: 'Expert (60 XP)', xp: 60, color: 'text-red-600' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Faible', color: 'text-gray-600' },
  { value: 'medium', label: 'Moyenne', color: 'text-blue-600' },
  { value: 'high', label: 'Élevée', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' }
];

const RECURRENCE_OPTIONS = {
  none: { label: 'Aucune', value: 'none' },
  daily: { label: 'Quotidienne', value: 'daily' },
  weekly: { label: 'Hebdomadaire', value: 'weekly' },
  monthly: { label: 'Mensuelle', value: 'monthly' }
};

// ✅ JOURS DE LA SEMAINE POUR RÉCURRENCE SPÉCIFIQUE
const WEEKDAYS = [
  { id: 1, name: 'Lundi', short: 'Lun', value: 'monday' },
  { id: 2, name: 'Mardi', short: 'Mar', value: 'tuesday' },
  { id: 3, name: 'Mercredi', short: 'Mer', value: 'wednesday' },
  { id: 4, name: 'Jeudi', short: 'Jeu', value: 'thursday' },
  { id: 5, name: 'Vendredi', short: 'Ven', value: 'friday' },
  { id: 6, name: 'Samedi', short: 'Sam', value: 'saturday' },
  { id: 0, name: 'Dimanche', short: 'Dim', value: 'sunday' }
];

const TaskForm = ({ isOpen, onClose, onSubmit, initialData, submitting = false }) => {
  const { user } = useAuthStore();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    priority: 'medium',
    xpReward: 25, // Sera calculé automatiquement
    estimatedTime: 1,
    dueDate: '',
    assignedTo: [],
    projectId: '',
    roleId: '', // ✅ AJOUT RÔLE SYNERGIA
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    recurrenceDays: [], // ✅ NOUVEAU: Jours spécifiques (lundi, mardi, etc.)
    notes: ''
  });

  // États de l'interface
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  
  // États pour l'upload de média
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium',
        priority: initialData.priority || 'medium',
        xpReward: initialData.xpReward || 25,
        estimatedTime: initialData.estimatedTime || 1,
        dueDate: initialData.dueDate ? 
          (initialData.dueDate.toDate ? 
            initialData.dueDate.toDate().toISOString().split('T')[0] : 
            new Date(initialData.dueDate).toISOString().split('T')[0]
          ) : '',
        roleId: initialData.roleId || '',
        isRecurring: initialData.isRecurring || false,
        recurrenceType: initialData.recurrenceType || 'none',
        recurrenceInterval: initialData.recurrenceInterval || 1,
        recurrenceDays: initialData.recurrenceDays || [],
        recurrenceEndDate: initialData.recurrenceEndDate ?
          (initialData.recurrenceEndDate.toDate ?
            initialData.recurrenceEndDate.toDate().toISOString().split('T')[0] :
            new Date(initialData.recurrenceEndDate).toISOString().split('T')[0]
          ) : '',
        notes: initialData.notes || ''
      });
      
      // ✅ FORCER LE RECALCUL XP SELON LA DIFFICULTÉ (même en modification)
      const difficultyOption = DIFFICULTY_OPTIONS.find(d => d.value === (initialData.difficulty || 'medium'));
      if (difficultyOption) {
        setFormData(prev => ({ ...prev, xpReward: difficultyOption.xp }));
      }
      
      console.log('✅ Données initialisées pour modification');
    } else {
      // Réinitialiser pour création
      console.log('📝 Réinitialisation pour nouvelle tâche');
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        priority: 'medium',
        xpReward: 25,
        estimatedTime: 1,
        dueDate: '',
        assignedTo: [],
        projectId: '',
        roleId: '',
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceInterval: 1,
        recurrenceDays: [],
        notes: ''
      });
    }
  }, [initialData]);

  // Charger les projets
  useEffect(() => {
    if (user?.uid) {
      loadProjects();
    }
  }, [user?.uid]);

  const loadProjects = async () => {
    try {
      const userProjects = await projectService.getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
    }
  };

  // ✅ FONCTION POUR GÉRER LA SÉLECTION DES JOURS
  const handleDayToggle = (dayValue) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(dayValue)
        ? prev.recurrenceDays.filter(day => day !== dayValue)
        : [...prev.recurrenceDays, dayValue]
    }));
  };

  // Upload de fichier média
  const uploadMediaFile = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploading(true);
      console.log('📤 Upload média:', selectedFile.name);
      
      const uploadResult = await mediaUploadService.uploadFile(selectedFile, {
        folder: 'tasks',
        userId: user.uid,
        taskTitle: formData.title
      });
      
      console.log('✅ Média uploadé:', uploadResult);
      return {
        url: uploadResult.url,
        type: selectedFile.type.startsWith('image/') ? 'image' : 
              selectedFile.type.startsWith('video/') ? 'video' : 'file',
        filename: selectedFile.name,
        size: selectedFile.size
      };
      
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      setError('Erreur lors de l\'upload du fichier. La tâche sera créée sans média.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ✅ SOUMISSION DU FORMULAIRE AVEC RÉCURRENCE HEBDOMADAIRE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('La description est obligatoire');
      return;
    }
    
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    // ✅ VALIDATION RÉCURRENCE HEBDOMADAIRE
    if (formData.isRecurring && formData.recurrenceType === 'weekly' && formData.recurrenceDays.length === 0) {
      setError('Veuillez sélectionner au moins un jour de la semaine pour la récurrence');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('📝 Création/modification tâche avec récurrence intelligente:', {
        title: formData.title,
        recurring: formData.isRecurring,
        recurrenceType: formData.recurrenceType,
        recurrenceDays: formData.recurrenceDays,
        hasMedia: !!selectedFile
      });

      // Upload du média si présent
      let mediaData = null;
      if (selectedFile) {
        mediaData = await uploadMediaFile();
      }

      // ✅ PRÉPARER LES DONNÉES DE LA TÂCHE
      const taskData = {
        ...formData,
        // Métadonnées de base
        userId: user.uid,
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        userEmail: user.email,
        
        // Rôle Synergia
        category: formData.roleId, // Pour compatibilité
        roleId: formData.roleId,
        roleName: SYNERGIA_ROLES[formData.roleId]?.name || null,
        
        // Média (si présent)
        hasMedia: !!mediaData,
        mediaUrl: mediaData?.url || null,
        mediaType: mediaData?.type || null,
        mediaFilename: mediaData?.filename || null,
        mediaSize: mediaData?.size || null,
        
        // Dates
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
        
        // Statut
        status: 'todo',
        assignedTo: user.uid
      };

      // ✅ TRAITEMENT SPÉCIAL POUR RÉCURRENCE HEBDOMADAIRE
      if (formData.isRecurring && formData.recurrenceType === 'weekly' && formData.recurrenceDays.length > 0) {
        console.log('📅 Création tâche récurrente hebdomadaire avec jours spécifiques');
        
        const result = await weeklyRecurrenceService.createWeeklyRecurringTask(taskData);
        
        if (result.success) {
          console.log('✅ Tâche récurrente créée avec succès');
          onSubmit && onSubmit(result);
          onClose();
        } else {
          throw new Error(result.error || 'Erreur création tâche récurrente');
        }
      } else {
        // ✅ TÂCHE NORMALE OU AUTRE TYPE DE RÉCURRENCE
        console.log('📝 Création tâche normale ou récurrence non-hebdomadaire');
        onSubmit && onSubmit(taskData);
        onClose();
      }
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des fichiers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (10MB max pour images, 50MB pour vidéos)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`Le fichier ne peut pas dépasser ${file.type.startsWith('video/') ? '50MB' : '10MB'}`);
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculer XP automatiquement
  useEffect(() => {
    const difficultyOption = DIFFICULTY_OPTIONS.find(d => d.value === formData.difficulty);
    if (difficultyOption) {
      setFormData(prev => ({ ...prev, xpReward: difficultyOption.xp }));
    }
  }, [formData.difficulty]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Nettoyer la cuisine, Sortir les poubelles..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading || uploading}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez ce qui doit être fait..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                  disabled={loading || uploading}
                />
              </div>

              {/* Difficulté */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  Difficulté
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                >
                  {DIFFICULTY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Flag className="w-4 h-4 inline mr-1" />
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                >
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rôle Synergia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Rôle Synergia
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                >
                  <option value="">Sélectionner un rôle...</option>
                  {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
                    <option key={key} value={key}>
                      {role.icon} {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* XP Reward (calculé automatiquement) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Récompense XP
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.xpReward}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    readOnly
                    disabled
                  />
                  <Info className="w-5 h-5 text-blue-500" title="XP calculé automatiquement selon la difficulté" />
                </div>
              </div>

              {/* Temps estimé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Temps estimé (heures)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseFloat(e.target.value) || 1 }))}
                  min="0.5"
                  max="40"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                />
              </div>

              {/* Date d'échéance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                />
              </div>
            </div>

            {/* ✅ SECTION RÉCURRENCE HEBDOMADAIRE INTELLIGENTE */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Repeat className="w-5 h-5 text-purple-500" />
                <h3 className="font-medium text-gray-900">Récurrence intelligente</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isRecurring: e.target.checked,
                      recurrenceType: e.target.checked ? 'weekly' : 'none',
                      recurrenceDays: e.target.checked ? prev.recurrenceDays : [] // Garder les jours sélectionnés
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    <Repeat className="w-4 h-4 inline mr-1" />
                    Tâche récurrente
                  </label>
                </div>
              </div>

              {formData.isRecurring && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fréquence
                      </label>
                      <select
                        value={formData.recurrenceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={loading || uploading}
                      >
                        {Object.entries(RECURRENCE_OPTIONS).filter(([key]) => key !== 'none').map(([key, option]) => (
                          <option key={key} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intervalle
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.recurrenceInterval}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={loading || uploading}
                      />
                    </div>
                  </div>

                  {/* ✅ SÉLECTION DES JOURS DE LA SEMAINE POUR RÉCURRENCE HEBDOMADAIRE */}
                  {formData.recurrenceType === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        📅 Jours de récurrence
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {WEEKDAYS.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => handleDayToggle(day.value)}
                            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              formData.recurrenceDays.includes(day.value)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            disabled={loading || uploading}
                          >
                            <div className="text-center">
                              <div className="font-bold">{day.short}</div>
                              <div className="text-xs">{day.name.slice(0, 3)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      {formData.recurrenceDays.length === 0 && (
                        <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Sélectionnez au moins un jour de la semaine
                        </p>
                      )}
                      {formData.recurrenceDays.length > 0 && (
                        <p className="text-blue-600 text-xs mt-2">
                          Récurrence : {formData.recurrenceDays.map(day => 
                            WEEKDAYS.find(d => d.value === day)?.name
                          ).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.recurrenceType !== 'none' && (
                    <div className="p-3 bg-blue-100 border border-blue-200 rounded text-sm text-blue-800">
                      <Info className="w-4 h-4 inline mr-1" />
                      Cette tâche se répétera {RECURRENCE_OPTIONS[formData.recurrenceType]?.label.toLowerCase()}
                      {formData.recurrenceInterval > 1 && ` (tous les ${formData.recurrenceInterval})`}
                      {formData.recurrenceType === 'weekly' && formData.recurrenceDays.length > 0 && 
                        ` les ${formData.recurrenceDays.map(day => WEEKDAYS.find(d => d.value === day)?.name).join(', ')}`
                      }
                      <br />
                      <strong>Comportement :</strong> Si la tâche n'est pas réalisée le jour prévu, elle se reporte au lendemain jusqu'à ce qu'elle soit faite.
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin de récurrence (optionnel)
                    </label>
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Upload de média */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Fichier tutoriel ou exemple (optionnel)
              </h3>
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={loading || uploading}
                  />
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Glissez un fichier ici ou</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    disabled={loading || uploading}
                  >
                    parcourir vos fichiers
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Images jusqu'à 10MB, vidéos jusqu'à 50MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {selectedFile.type.startsWith('image/') ? (
                      <ImageIcon className="w-8 h-8 text-blue-600" />
                    ) : (
                      <VideoIcon className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-blue-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="flex-shrink-0 text-red-600 hover:text-red-700"
                    disabled={loading || uploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Notes supplémentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes supplémentaires (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations complémentaires, contexte, références..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading || uploading}
              />
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || uploading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || uploading || !formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading || uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {uploading ? 'Upload en cours...' : (initialData ? 'Modification...' : 'Création...')}
                  </>
                ) : (
                  <>
                    {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {initialData ? 'Modifier la tâche' : 'Créer la tâche'}
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
