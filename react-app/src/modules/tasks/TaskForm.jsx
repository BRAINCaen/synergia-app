// ==========================================
// 📝 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE COMPLET ORIGINAL + PROJET AJOUTÉ
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Hash, Trophy, Clock, Target, Calendar, Users, 
  Upload, ImageIcon, VideoIcon, FileText, Info, Star
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { rolesConfig } from '../../shared/config/rolesConfig.js';
import { calculateXP } from '../../shared/utils/xpCalculator.js';
import { storageService } from '../../core/services/storageService.js';
import { projectService } from '../../core/services/projectService.js';

// ✅ CONSTANTES CONFIGURATION
const PRIORITY_OPTIONS = {
  low: { label: 'Basse', color: 'text-green-600', bg: 'bg-green-100', multiplier: 1 },
  medium: { label: 'Normale', color: 'text-yellow-600', bg: 'bg-yellow-100', multiplier: 1.2 },
  high: { label: 'Haute', color: 'text-orange-600', bg: 'bg-orange-100', multiplier: 1.5 },
  urgent: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-100', multiplier: 2 }
};

const DIFFICULTY_OPTIONS = {
  easy: { label: 'Facile', multiplier: 0.8 },
  medium: { label: 'Moyen', multiplier: 1 },
  hard: { label: 'Difficile', multiplier: 1.5 },
  expert: { label: 'Expert', multiplier: 2 }
};

const RECURRENCE_OPTIONS = {
  none: { label: 'Aucune', multiplier: 1 },
  daily: { label: 'Quotidienne', multiplier: 1.2 },
  weekly: { label: 'Hebdomadaire', multiplier: 1.5 },
  monthly: { label: 'Mensuelle', multiplier: 2 },
  custom: { label: 'Personnalisée', multiplier: 1.3 }
};

const VOLUNTEER_MODES = {
  manual: { label: 'Validation manuelle', description: 'Vous validez chaque demande' },
  auto: { label: 'Acceptation automatique', description: 'Les volontaires sont acceptés automatiquement' },
  first_come: { label: 'Premier arrivé', description: 'Le premier volontaire est accepté' }
};

// ✅ COMPOSANT PRÉVISUALISATION FICHIER
const FilePreview = ({ file, onRemove }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  return (
    <div className="relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4">
      {/* Prévisualisation image */}
      {isImage && (
        <img 
          src={URL.createObjectURL(file)}
          alt="Prévisualisation"
          className="w-full h-32 object-cover rounded mb-2"
          onLoad={() => console.log('✅ Image chargée pour prévisualisation')}
          onError={(e) => console.error('❌ Erreur chargement image:', e)}
        />
      )}
      
      {/* Informations du fichier */}
      <div className="mt-2 text-sm">
        <div className="flex items-center gap-2 text-blue-600 font-medium">
          {isImage ? (
            <ImageIcon className="w-4 h-4" />
          ) : isVideo ? (
            <VideoIcon className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>Média joint</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          📁 {file.name} • {formatFileSize(file.size)}
        </div>
      </div>
      
      {/* Bouton supprimer */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE COMPLET
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData = null,
  submitting = false 
}) => {
  const { user } = useAuthStore();
  
  // ✅ ÉTAT DU FORMULAIRE COMPLET
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'medium',
    roleId: '',
    xpReward: 25,
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    notes: '',
    projectId: null, // ✅ NOUVEAU : Projet rattaché
    // Récurrence
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: null,
    // Système volontaires
    isOpenToVolunteers: true,
    volunteerAcceptanceMode: 'manual',
    maxVolunteers: null,
    volunteerMessage: ''
  });

  // ✅ ÉTATS UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [manualXP, setManualXP] = useState(false);
  const [projects, setProjects] = useState([]); // ✅ NOUVEAU : Liste des projets
  
  // ✅ ÉTATS UPLOAD MÉDIA
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ INITIALISATION AVEC DONNÉES EXISTANTES (MODE ÉDITION)
  useEffect(() => {
    if (initialData) {
      console.log('📝 Mode édition - initialisation avec:', initialData);
      
      // 🛡️ PRÉSERVER TOUTES LES DONNÉES CRITIQUES
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tags: initialData.tags || [],
        projectId: initialData.projectId || null, // ✅ NOUVEAU : Préserver projet
        dueDate: initialData.dueDate ? 
          (initialData.dueDate.toDate ? 
            initialData.dueDate.toDate().toISOString().split('T')[0] : 
            new Date(initialData.dueDate).toISOString().split('T')[0]
          ) : '',
        recurrenceEndDate: initialData.recurrenceEndDate ?
          (initialData.recurrenceEndDate.toDate ?
            initialData.recurrenceEndDate.toDate().toISOString().split('T')[0] :
            new Date(initialData.recurrenceEndDate).toISOString().split('T')[0]
          ) : ''
      }));
      
      // Activer le mode XP manuel si différent de l'auto
      const autoXP = calculateXP(
        initialData.difficulty || 'medium', 
        initialData.priority || 'medium', 
        initialData.recurrenceType || 'none'
      );
      if (initialData.xpReward && initialData.xpReward !== autoXP) {
        setManualXP(true);
      }
    } else {
      // Réinitialiser pour une nouvelle tâche
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        difficulty: 'medium',
        roleId: '',
        xpReward: 25,
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        notes: '',
        projectId: null, // ✅ NOUVEAU : Aucun projet par défaut
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        maxOccurrences: null,
        isOpenToVolunteers: true,
        volunteerAcceptanceMode: 'manual',
        maxVolunteers: null,
        volunteerMessage: ''
      });
      setManualXP(false);
    }
  }, [initialData]);

  // ✅ CALCUL XP AUTOMATIQUE
  useEffect(() => {
    if (!manualXP) {
      const recurrenceType = formData.isRecurring ? formData.recurrenceType : 'none';
      const autoXP = calculateXP(formData.difficulty, formData.priority, recurrenceType);
      setFormData(prev => ({ ...prev, xpReward: autoXP }));
    }
  }, [formData.difficulty, formData.priority, formData.isRecurring, formData.recurrenceType, manualXP]);

  // ✅ CHARGER LES PROJETS - NOUVEAU
  useEffect(() => {
    const loadProjects = async () => {
      try {
        if (user?.uid) {
          const userProjects = await projectService.getUserProjects(user.uid);
          setProjects(userProjects || []);
        }
      } catch (error) {
        console.error('❌ Erreur chargement projets:', error);
      }
    };

    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, user?.uid]);

  // ✅ GESTION FICHIERS MÉDIA
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Le fichier ne peut pas dépasser ${file.type.startsWith('video/') ? '100 MB' : '10 MB'}`);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  // ✅ GESTION DES TAGS
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ✅ SOUMISSION DU FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Le titre est requis');
      }

      // 🛡️ PRÉPARATION DONNÉES AVEC PRÉSERVATION
      let finalData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        updatedAt: new Date()
      };

      // ✅ MODE ÉDITION : PRÉSERVER LES DONNÉES CRITIQUES
      if (initialData) {
        console.log('🔧 Mode édition - préservation des données critiques');
        
        finalData = {
          ...finalData,
          // 🛡️ PRÉSERVER ABSOLUMENT
          assignedTo: initialData.assignedTo || [],
          createdBy: initialData.createdBy,
          createdAt: initialData.createdAt,
          completedAt: initialData.completedAt,
          validationRequestId: initialData.validationRequestId,
          validatedAt: initialData.validatedAt,
          validatedBy: initialData.validatedBy,
          withdrawnAt: initialData.withdrawnAt,
          
          // Mise à jour seulement
          updatedAt: new Date()
        };

        console.log('🔧 Données préservées:', {
          assignedTo: finalData.assignedTo,
          createdBy: finalData.createdBy,
          titre: finalData.title
        });
      }

      // Dates
      if (formData.dueDate) {
        finalData.dueDate = new Date(formData.dueDate);
      }
      if (formData.recurrenceEndDate) {
        finalData.recurrenceEndDate = new Date(formData.recurrenceEndDate);
      }

      console.log('📝 Soumission avec données finales:', finalData);

      // Soumission
      await onSubmit(finalData);
      
      // Reset après succès seulement si nouvelle tâche
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          difficulty: 'medium',
          roleId: '',
          xpReward: 25,
          estimatedHours: 1,
          dueDate: '',
          tags: [],
          notes: '',
          projectId: null, // ✅ NOUVEAU : Reset projet
          isRecurring: false,
          recurrenceType: 'none',
          recurrenceInterval: 1,
          recurrenceEndDate: '',
          maxOccurrences: null,
          isOpenToVolunteers: true,
          volunteerAcceptanceMode: 'manual',
          maxVolunteers: null,
          volunteerMessage: ''
        });
        setSelectedFile(null);
        setCurrentTag('');
        setManualXP(false);
      }
      
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl"
          >
            {/* ✅ EN-TÊTE COMPLET */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Formulaire complet avec XP auto, récurrence, rôles et projet
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading || uploading}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ✅ FORMULAIRE COMPLET */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
              <div className="p-6 space-y-6">
                
                {/* ✅ INFORMATIONS DE BASE */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la tâche *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Vérifier les stocks de boissons"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description détaillée *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez précisément ce qui doit être fait, comment, et le résultat attendu..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                      required
                    />
                  </div>
                </div>

                {/* ✅ PRIORITÉ ET DIFFICULTÉ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    >
                      {Object.entries(PRIORITY_OPTIONS).map(([key, option]) => (
                        <option key={key} value={key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulté
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    >
                      {Object.entries(DIFFICULTY_OPTIONS).map(([key, option]) => (
                        <option key={key} value={key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ✅ NOUVEAU : SÉLECTION PROJET */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">Projet associé (optionnel)</h3>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Nouveau</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Rattachez cette tâche à un projet existant pour un meilleur suivi
                  </p>
                  
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      projectId: e.target.value || null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={loading || uploading}
                  >
                    <option value="">Aucun projet sélectionné</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        🎯 {project.name} - {project.status === 'active' ? 'En cours' : project.status}
                      </option>
                    ))}
                  </select>
                  
                  {formData.projectId && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
                      <Info className="w-4 h-4 inline mr-1" />
                      Cette tâche sera visible dans le projet sélectionné
                    </div>
                  )}
                </div>

                {/* ✅ RÔLE ET TEMPS ESTIMÉ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle recommandé
                    </label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    >
                      <option value="">Tous les rôles</option>
                      {Object.entries(rolesConfig).map(([roleId, role]) => (
                        <option key={roleId} value={roleId}>
                          {role.icon} {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temps estimé (heures)
                    </label>
                    <input
                      type="number"
                      min="0.25"
                      max="40"
                      step="0.25"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>

                {/* ✅ DATE D'ÉCHÉANCE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance (optionnelle)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                </div>

                {/* ✅ GESTION DES TAGS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (mots-clés)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 relative">
                      <Hash className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Ajouter un tag..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={loading || uploading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!currentTag.trim() || loading || uploading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={loading || uploading}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ✅ NOTES ADDITIONNELLES */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes additionnelles
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Informations complémentaires, consignes spéciales, contacts..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                </div>

                {/* ✅ RÉCURRENCE */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Récurrence</h3>
                  </div>
                  
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        isRecurring: e.target.checked,
                        recurrenceType: e.target.checked ? 'weekly' : 'none'
                      }))}
                      className="rounded border-gray-300 focus:ring-blue-500"
                      disabled={loading || uploading}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Tâche récurrente
                    </span>
                  </label>

                  {formData.isRecurring && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Type de récurrence
                          </label>
                          <select
                            value={formData.recurrenceType}
                            onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={loading || uploading}
                          >
                            <option value="daily">Quotidienne</option>
                            <option value="weekly">Hebdomadaire</option>
                            <option value="monthly">Mensuelle</option>
                            <option value="custom">Personnalisée</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Intervalle
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={formData.recurrenceInterval}
                            onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={loading || uploading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Date de fin (optionnelle)
                          </label>
                          <input
                            type="date"
                            value={formData.recurrenceEndDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={loading || uploading}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nb max d'occurrences
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.maxOccurrences || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxOccurrences: parseInt(e.target.value) || null }))}
                            placeholder="Illimité"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={loading || uploading}
                          />
                        </div>
                      </div>

                      {formData.recurrenceType !== 'none' && (
                        <div className="p-3 bg-purple-100 border border-purple-200 rounded text-sm text-purple-800">
                          <Info className="w-4 h-4 inline mr-1" />
                          Cette tâche se répétera {RECURRENCE_OPTIONS[formData.recurrenceType]?.label.toLowerCase()}
                          {formData.recurrenceInterval > 1 && ` (tous les ${formData.recurrenceInterval})`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ SYSTÈME VOLONTAIRES */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Système de volontaires</h3>
                  </div>
                  
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.isOpenToVolunteers}
                      onChange={(e) => setFormData(prev => ({ ...prev, isOpenToVolunteers: e.target.checked }))}
                      className="rounded border-gray-300 focus:ring-blue-500"
                      disabled={loading || uploading}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Ouvrir aux volontaires
                    </span>
                  </label>

                  {formData.isOpenToVolunteers && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Mode d'acceptation
                        </label>
                        <select
                          value={formData.volunteerAcceptanceMode}
                          onChange={(e) => setFormData(prev => ({ ...prev, volunteerAcceptanceMode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={loading || uploading}
                        >
                          {Object.entries(VOLUNTEER_MODES).map(([key, mode]) => (
                            <option key={key} value={key}>
                              {mode.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {VOLUNTEER_MODES[formData.volunteerAcceptanceMode]?.description}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nombre max de volontaires (optionnel)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.maxVolunteers || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxVolunteers: parseInt(e.target.value) || null }))}
                          placeholder="Illimité"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={loading || uploading}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Message pour les volontaires
                        </label>
                        <textarea
                          value={formData.volunteerMessage}
                          onChange={(e) => setFormData(prev => ({ ...prev, volunteerMessage: e.target.value }))}
                          placeholder="Message d'accueil ou instructions spéciales pour les volontaires..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={loading || uploading}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ RÉCOMPENSE XP */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-medium text-gray-900">Récompense XP</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setManualXP(!manualXP)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        manualXP 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      disabled={loading || uploading}
                    >
                      {manualXP ? 'Manuel' : 'Auto'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formData.xpReward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                      disabled={!manualXP || loading || uploading}
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        !manualXP ? 'bg-gray-100 text-gray-500' : ''
                      }`}
                    />
                    <div className="text-yellow-600 font-bold text-lg">
                      {formData.xpReward} XP
                    </div>
                  </div>

                  {!manualXP && (
                    <p className="text-xs text-yellow-700 mt-2">
                      XP calculés automatiquement selon difficulté (×{
                        { easy: 0.8, medium: 1, hard: 1.5, expert: 2 }[formData.difficulty] || 1
                      } difficulté, ×{
                        { low: 1, medium: 1.2, high: 1.5, urgent: 2 }[formData.priority] || 1.2
                      } priorité{formData.isRecurring && formData.recurrenceType !== 'none' 
                        ? ` ×${RECURRENCE_OPTIONS[formData.recurrenceType]?.multiplier} récurrence` 
                        : ''
                      })
                    </p>
                  )}
                </div>

                {/* ✅ UPLOAD MÉDIA */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">
                      Tutoriel ou exemple (optionnel)
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Ajoutez une image ou vidéo pour aider à comprendre la tâche (tutoriel, exemple, référence...)
                  </p>

                  {!selectedFile ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading || uploading}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || uploading}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Cliquez pour sélectionner une image ou vidéo
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Images jusqu'à 10MB, vidéos jusqu'à 100MB
                        </p>
                      </button>
                    </div>
                  ) : (
                    <FilePreview 
                      file={selectedFile} 
                      onRemove={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }} 
                    />
                  )}
                </div>

                {/* ✅ AFFICHAGE ERREUR */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-red-700 text-sm font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ BOUTONS D'ACTION */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading || uploading}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {uploading && (
                      <div className="text-sm text-gray-600">
                        Upload en cours...
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={loading || uploading || !formData.title.trim() || !formData.description.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {initialData ? 'Modification...' : 'Création...'}
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          {initialData ? 'Modifier la tâche' : 'Créer la tâche'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskForm;
