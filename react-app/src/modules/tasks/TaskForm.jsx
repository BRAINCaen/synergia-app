// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE COMPLET - XP Auto + Récurrence + Rôles Synergia + UPLOAD MÉDIA
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
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
  Repeat,
  Info,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  FileVideo,
  Loader
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import { storageService } from '../../core/services/storageService';
import ProjectSelector, { LinkedProjectDisplay } from '../../components/tasks/TaskProjectLinking';

/**
 * 🎭 RÔLES SYNERGIA
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
 * 🔄 CONFIGURATION RÉCURRENCE
 */
const RECURRENCE_OPTIONS = {
  none: { label: 'Tâche unique', multiplier: 1.0 },
  daily: { label: 'Quotidienne', multiplier: 0.6 },
  weekly: { label: 'Hebdomadaire', multiplier: 1.0 },
  monthly: { label: 'Mensuelle', multiplier: 2.0 },
  yearly: { label: 'Annuelle', multiplier: 5.0 }
};

/**
 * 🏆 CALCUL XP AVEC RÉCURRENCE
 */
const calculateXP = (difficulty, priority, recurrence = 'none') => {
  const base = { easy: 15, medium: 25, hard: 40, expert: 60 }[difficulty] || 25;
  const mult = { low: 1, medium: 1.2, high: 1.5, urgent: 2 }[priority] || 1.2;
  const recMult = RECURRENCE_OPTIONS[recurrence]?.multiplier || 1;
  return Math.round(base * mult * recMult);
};

/**
 * 🎬 COMPOSANT DE PRÉVISUALISATION MÉDIA
 */
const MediaPreview = ({ file, fileType, onRemove }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (fileType === 'video') {
    return (
      <div className="relative">
        <video
          ref={videoRef}
          src={URL.createObjectURL(file)}
          className="w-full h-48 object-cover rounded-lg"
          onLoadedData={() => console.log('✅ Vidéo chargée pour prévisualisation')}
          onError={(e) => console.error('❌ Erreur chargement vidéo:', e)}
        />
        
        {/* Overlay de contrôle */}
        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
          <button
            type="button"
            onClick={handleVideoPlay}
            className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all"
          >
            {isPlaying ? (
              <div className="w-4 h-4 bg-gray-800 rounded-sm" />
            ) : (
              <Play className="w-4 h-4 text-gray-800 ml-0.5" />
            )}
          </button>
        </div>
        
        {/* Informations du fichier */}
        <div className="mt-2 text-sm">
          <div className="flex items-center gap-2 text-blue-400 font-medium">
            <FileVideo className="w-4 h-4" />
            <span>Vidéo tutoriel/exemple</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
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
  }

  return (
    <div className="relative">
      <img
        src={URL.createObjectURL(file)}
        alt="Prévisualisation"
        className="w-full h-48 object-cover rounded-lg"
        onLoad={() => console.log('✅ Image chargée pour prévisualisation')}
        onError={(e) => console.error('❌ Erreur chargement image:', e)}
      />
      
      {/* Informations du fichier */}
      <div className="mt-2 text-sm">
        <div className="flex items-center gap-2 text-blue-400 font-medium">
          <ImageIcon className="w-4 h-4" />
          <span>Image tutoriel/exemple</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
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
  categories = [],
  teamMembers = []
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  // 📊 État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    priority: 'medium',
    roleId: '', // ✅ NOUVEAU : Rôle Synergia au lieu de category
    xpReward: 25,
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    assignedTo: [],
    projectId: null,
    notes: '',
    // ✅ NOUVEAU : Récurrence
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: null
  });

  // 🎨 États UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [manualXP, setManualXP] = useState(false);
  const [showXPDetails, setShowXPDetails] = useState(false);

  // ✅ NOUVEAUX ÉTATS POUR UPLOAD MÉDIA
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Calcul XP automatique avec récurrence
  useEffect(() => {
    if (!manualXP) {
      const recurrenceType = formData.isRecurring ? formData.recurrenceType : 'none';
      const autoXP = calculateXP(formData.difficulty, formData.priority, recurrenceType);
      setFormData(prev => ({ ...prev, xpReward: autoXP }));
    }
  }, [formData.difficulty, formData.priority, formData.isRecurring, formData.recurrenceType, manualXP]);

  // 📥 Initialiser le formulaire
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium',
        priority: initialData.priority || 'medium',
        roleId: initialData.roleId || initialData.category || '', // ✅ Compatibilité
        xpReward: initialData.xpReward || 25,
        estimatedHours: initialData.estimatedHours || 1,
        dueDate: initialData.dueDate ? formatDateForInput(initialData.dueDate) : '',
        tags: initialData.tags || [],
        assignedTo: initialData.assignedTo || [],
        projectId: initialData.projectId || null,
        notes: initialData.notes || '',
        // ✅ NOUVEAU : Récurrence
        isRecurring: initialData.isRecurring || false,
        recurrenceType: initialData.recurrenceType || 'none',
        recurrenceInterval: initialData.recurrenceInterval || 1,
        recurrenceEndDate: initialData.recurrenceEndDate ? formatDateForInput(initialData.recurrenceEndDate) : '',
        maxOccurrences: initialData.maxOccurrences || null
      });
      
      // ✅ NOUVEAU : Initialiser média existant
      if (initialData.mediaUrl) {
        // Pour l'édition, on garde les infos du média sans le fichier
        setFileType(initialData.mediaType);
      }
    }
  }, [initialData]);

  const formatDateForInput = (date) => {
    if (!date) return '';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  // ✅ NOUVEAU : Gestion des fichiers média
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ 
        ...prev, 
        media: `Le fichier ne peut pas dépasser ${file.type.startsWith('video/') ? '100MB' : '10MB'}` 
      }));
      return;
    }

    // Vérifier le type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setErrors(prev => ({ 
        ...prev, 
        media: 'Seules les images et vidéos sont acceptées' 
      }));
      return;
    }

    setSelectedFile(file);
    setFileType(isVideo ? 'video' : 'image');
    setErrors(prev => ({ ...prev, media: null }));
    
    console.log('📎 Fichier sélectionné pour la tâche:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileType(null);
    setUploadProgress(0);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ NOUVEAU : Upload du média
  const uploadMediaFile = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log('📤 Upload média pour tâche...');

      // Simuler le progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const uploadResult = await storageService.uploadFile(
        selectedFile,
        `tasks/media/${Date.now()}_${selectedFile.name}`
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadResult.success) {
        console.log('✅ Upload média réussi:', uploadResult.url);
        return {
          url: uploadResult.url,
          type: fileType,
          filename: selectedFile.name,
          size: selectedFile.size
        };
      } else {
        throw new Error('Upload failed');
      }

    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      
      if (error.message.includes('CORS')) {
        setErrors(prev => ({ 
          ...prev, 
          media: '⚠️ Problème de connexion détecté. La tâche sera créée sans média.' 
        }));
        return null;
      }
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.xpReward < 1 || formData.xpReward > 1000) newErrors.xpReward = 'Les XP doivent être entre 1 et 1000';
    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) newErrors.estimatedHours = 'La durée doit être entre 0.5 et 100 heures';
    
    // ✅ NOUVEAU : Validation récurrence
    if (formData.isRecurring && formData.recurrenceType === 'none') {
      newErrors.recurrenceType = 'Sélectionner un type de récurrence';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // ✅ NOUVEAU : Upload du média si présent
      let mediaData = null;
      if (selectedFile) {
        mediaData = await uploadMediaFile();
      }
      
      const taskData = {
        ...formData,
        // ✅ NOUVEAU : Rôle au lieu de category
        category: formData.roleId, // Pour compatibilité avec l'existant
        roleId: formData.roleId,
        roleName: SYNERGIA_ROLES[formData.roleId]?.name || null,
        // Projet
        projectId: selectedProject?.id || null,
        projectTitle: selectedProject?.title || null,
        // Dates
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
        // ✅ NOUVEAU : Données média
        hasMedia: !!mediaData,
        mediaUrl: mediaData?.url || null,
        mediaType: mediaData?.type || null,
        mediaFilename: mediaData?.filename || null,
        mediaSize: mediaData?.size || null,
        // Compatibilité ancienne version
        hasPhoto: !!mediaData && mediaData.type === 'image',
        photoUrl: mediaData?.type === 'image' ? mediaData.url : null,
        hasVideo: !!mediaData && mediaData.type === 'video',
        videoUrl: mediaData?.type === 'video' ? mediaData.url : null,
        // Métadonnées
        createdBy: user.uid,
        updatedAt: new Date(),
        // ✅ NOUVEAU : Métadonnées récurrence
        recurrenceConfig: formData.isRecurring ? {
          type: formData.recurrenceType,
          interval: formData.recurrenceInterval,
          endDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
          maxOccurrences: formData.maxOccurrences,
          xpMultiplier: RECURRENCE_OPTIONS[formData.recurrenceType]?.multiplier || 1
        } : null
      };

      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Erreur création tâche:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const tag = newTag.trim();
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Plus className="w-6 h-6" />
            <span>{initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 gap-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre de la tâche *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Vérifier les stocks de boissons"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description détaillée *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez précisément ce qui doit être fait..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Rôle Synergia */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Rôle Synergia</h3>
                <p className="text-gray-400 text-sm">Associer cette tâche à un domaine d'expertise</p>
              </div>
            </div>

            <select
              value={formData.roleId}
              onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sélectionner un rôle (optionnel)</option>
              {Object.values(SYNERGIA_ROLES).map(role => (
                <option key={role.id} value={role.id}>
                  {role.icon} {role.name}
                </option>
              ))}
            </select>

            {formData.roleId && SYNERGIA_ROLES[formData.roleId] && (
              <div className="mt-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-indigo-300">
                  <span className="text-lg">{SYNERGIA_ROLES[formData.roleId].icon}</span>
                  <span className="font-medium">{SYNERGIA_ROLES[formData.roleId].name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Difficulté et Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Difficulté
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">🟢 Facile</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="hard">🟠 Difficile</option>
                <option value="expert">🔴 Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Flag className="w-4 h-4 inline mr-1" />
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">⬇️ Basse</option>
                <option value="medium">➡️ Moyenne</option>
                <option value="high">⬆️ Haute</option>
                <option value="urgent">🚨 Urgente</option>
              </select>
            </div>
          </div>

          {/* Récurrence */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Repeat className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Récurrence</h3>
                  <p className="text-gray-400 text-sm">Tâche répétitive (ajuste automatiquement les XP)</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isRecurring" className="text-sm text-gray-300">
                  Tâche récurrente
                </label>
              </div>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type de récurrence
                    </label>
                    <select
                      value={formData.recurrenceType}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="none">Sélectionner</option>
                      {Object.entries(RECURRENCE_OPTIONS).map(([key, option]) => {
                        if (key === 'none') return null;
                        return (
                          <option key={key} value={key}>
                            {option.label} (XP×{option.multiplier})
                          </option>
                        );
                      })}
                    </select>
                    {errors.recurrenceType && <p className="text-red-400 text-sm mt-1">{errors.recurrenceType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Intervalle
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.recurrenceInterval}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nb max occurrences (optionnel)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxOccurrences || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxOccurrences: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: 10 occurrences"
                    />
                  </div>
                </div>

                {formData.recurrenceType !== 'none' && (
                  <div className="mt-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-indigo-300">
                      <Info className="w-4 h-4" />
                      <span>
                        Cette tâche se répétera {RECURRENCE_OPTIONS[formData.recurrenceType]?.label.toLowerCase()} 
                        {formData.recurrenceInterval > 1 && ` (tous les ${formData.recurrenceInterval})`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Récompense XP */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Récompense XP</h3>
                  <p className="text-gray-400 text-sm">
                    {manualXP ? 
                      'Mode manuel - Définir les XP manuellement' : 
                      'Mode automatique - XP calculés selon difficulté/priorité/récurrence'
                    }
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManualXP(!manualXP)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  manualXP 
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                    : 'bg-gray-600 text-gray-300 border border-gray-500'
                }`}
              >
                {manualXP ? 'Manuel' : 'Auto'}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.xpReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                  disabled={!manualXP}
                  className={`w-full px-3 py-2 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    manualXP 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                />
                {errors.xpReward && <p className="text-red-400 text-sm mt-1">{errors.xpReward}</p>}
              </div>
              
              <div className="text-yellow-400 font-bold text-lg">
                {formData.xpReward} XP
              </div>
              
              <button
                type="button"
                onClick={() => setShowXPDetails(!showXPDetails)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {showXPDetails && (
              <div className="mt-3 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300">
                <div className="space-y-1">
                  <div>Base ({formData.difficulty}): {calculateXP('easy', 'low') && (() => {
                    const bases = { easy: 15, medium: 25, hard: 40, expert: 60 };
                    return bases[formData.difficulty] || 25;
                  })()} XP</div>
                  <div>Priorité ({formData.priority}): ×{
                    { low: 1, medium: 1.2, high: 1.5, urgent: 2 }[formData.priority] || 1.2
                  }</div>
                  {formData.isRecurring && formData.recurrenceType !== 'none' && (
                    <div>Récurrence ({formData.recurrenceType}): ×{RECURRENCE_OPTIONS[formData.recurrenceType]?.multiplier || 1}</div>
                  )}
                  <div className="border-t border-gray-700 pt-1 font-medium">
                    Total: {formData.xpReward} XP
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ NOUVELLE SECTION : Upload Média */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Tutoriel ou exemple (optionnel)</h3>
                <p className="text-gray-400 text-sm">
                  Ajoutez une image ou vidéo pour aider à comprendre la tâche
                </p>
              </div>
            </div>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={loading || uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading}
                  className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <div className="p-3 bg-gray-600 rounded-full">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm">
                    Cliquez pour ajouter une photo ou vidéo
                  </span>
                  <span className="text-xs text-gray-500">
                    Images: 10MB max • Vidéos: 100MB max
                  </span>
                </button>
              </div>
            ) : (
              <div>
                <MediaPreview
                  file={selectedFile}
                  fileType={fileType}
                  onRemove={handleRemoveFile}
                />
                
                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Upload en cours... {uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.media && (
              <div className="mt-3 p-3 bg-orange-600/20 border border-orange-500/30 rounded-lg">
                <p className="text-orange-300 text-sm">{errors.media}</p>
              </div>
            )}
          </div>

          {/* Détails supplémentaires */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Durée estimée (heures)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="100"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.estimatedHours && <p className="text-red-400 text-sm mt-1">{errors.estimatedHours}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date d'échéance (optionnel)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-indigo-600 text-indigo-100 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-indigo-300 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Tapez un tag et appuyez sur Entrée"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Assignation d'équipe (si admin) */}
          {isAdmin && teamMembers && teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Assigner à l'équipe
              </label>
              <select
                multiple
                value={formData.assignedTo}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, assignedTo: values }));
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
              >
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.displayName || member.email}
                  </option>
                ))}
              </select>
              <p className="text-gray-400 text-sm mt-1">
                Maintenez Ctrl/Cmd pour sélectionner plusieurs membres
              </p>
            </div>
          )}

          {/* Liaison projet */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Folder className="w-4 h-4 inline mr-1" />
              Projet lié (optionnel)
            </label>
            <ProjectSelector
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
            />
            {selectedProject && (
              <LinkedProjectDisplay 
                project={selectedProject}
                onRemove={() => setSelectedProject(null)}
              />
            )}
          </div>

          {/* Notes supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes supplémentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires, contexte, références..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{initialData ? 'Modifier' : 'Créer'} la tâche</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
