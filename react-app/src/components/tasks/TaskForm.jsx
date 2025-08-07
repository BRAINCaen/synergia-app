// ==========================================
// 📁 react-app/src/components/tasks/TaskForm.jsx
// FORMULAIRE DE CRÉATION DE TÂCHE COMPLET - TOUTES FONCTIONNALITÉS
// ==========================================

import React, { useState, useRef } from 'react';
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
  Repeat
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { storageService } from '../../core/services/storageService.js';

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
 * 🔄 CONFIGURATION RÉCURRENCE COMPLÈTE
 */
const RECURRENCE_OPTIONS = {
  none: { label: 'Tâche unique', multiplier: 1.0 },
  daily: { label: 'Quotidienne', multiplier: 0.6 },
  weekly: { label: 'Hebdomadaire', multiplier: 1.0 },
  monthly: { label: 'Mensuelle', multiplier: 2.0 },
  yearly: { label: 'Annuelle', multiplier: 5.0 }
};

/**
 * 🏆 CALCUL XP AUTOMATIQUE AVEC RÉCURRENCE
 */
const calculateXP = (difficulty, priority, recurrence = 'none') => {
  const base = { 
    easy: 15, 
    normal: 25, 
    medium: 25, 
    hard: 40, 
    expert: 60 
  }[difficulty] || 25;
  
  const mult = { 
    low: 1, 
    medium: 1.2, 
    high: 1.5, 
    urgent: 2 
  }[priority] || 1.2;
  
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
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <FileVideo className="w-4 h-4" />
            <span>Vidéo tutoriel/exemple</span>
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
        <div className="flex items-center gap-2 text-blue-600 font-medium">
          <ImageIcon className="w-4 h-4" />
          <span>Image tutoriel/exemple</span>
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
 * 📝 FORMULAIRE DE CRÉATION DE TÂCHE COMPLET
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  submitting = false 
}) => {
  const { user } = useAuthStore();
  
  // ✅ ÉTAT DU FORMULAIRE COMPLET
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'normal',
    roleId: '',
    xpReward: 25,
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    notes: '',
    // Récurrence
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: null
  });

  // ✅ ÉTATS UI COMPLETS
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [manualXP, setManualXP] = useState(false);
  
  // ✅ ÉTATS UPLOAD MÉDIA
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ✅ CALCUL XP AUTOMATIQUE
  React.useEffect(() => {
    if (!manualXP) {
      const recurrenceType = formData.isRecurring ? formData.recurrenceType : 'none';
      const autoXP = calculateXP(formData.difficulty, formData.priority, recurrenceType);
      setFormData(prev => ({ ...prev, xpReward: autoXP }));
    }
  }, [formData.difficulty, formData.priority, formData.isRecurring, formData.recurrenceType, manualXP]);

  // ✅ GESTION FICHIERS MÉDIA
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Le fichier ne peut pas dépasser ${file.type.startsWith('video/') ? '100MB' : '10MB'}`);
      return;
    }

    // Vérifier le type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Seules les images et vidéos sont acceptées');
      return;
    }

    setSelectedFile(file);
    setFileType(isVideo ? 'video' : 'image');
    setError('');
    
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

  // ✅ GESTION TAGS
  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // ✅ UPLOAD DU MÉDIA
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
        setError('⚠️ Problème de connexion détecté. La tâche sera créée sans média.');
        return null;
      }
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // ✅ SOUMISSION DU FORMULAIRE COMPLÈTE
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
    
    try {
      setError('');
      setLoading(true);
      
      console.log('📝 Création tâche complète avec toutes les fonctionnalités:', {
        title: formData.title,
        role: formData.roleId,
        recurring: formData.isRecurring,
        hasMedia: !!selectedFile,
        mediaType: fileType,
        xpReward: formData.xpReward
      });

      // Upload du média si présent
      let mediaData = null;
      if (selectedFile) {
        mediaData = await uploadMediaFile();
      }

      // ✅ PRÉPARER TOUTES LES DONNÉES DE LA TÂCHE
      const taskData = {
        ...formData,
        // Métadonnées de base
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        
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
        
        // Compatibilité avec l'ancien système
        hasPhoto: !!mediaData && mediaData.type === 'image',
        photoUrl: mediaData?.type === 'image' ? mediaData.url : null,
        hasVideo: !!mediaData && mediaData.type === 'video',
        videoUrl: mediaData?.type === 'video' ? mediaData.url : null,
        
        // Dates
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
        
        // Configuration récurrence
        recurrenceConfig: formData.isRecurring ? {
          type: formData.recurrenceType,
          interval: formData.recurrenceInterval,
          endDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
          maxOccurrences: formData.maxOccurrences,
          xpMultiplier: RECURRENCE_OPTIONS[formData.recurrenceType]?.multiplier || 1
        } : null,
        
        // Horodatage
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending'
      };

      console.log('✅ Données tâche complètes prêtes:', taskData);
      await onSubmit(taskData);
      
      // ✅ RESET COMPLET DU FORMULAIRE
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        difficulty: 'normal',
        roleId: '',
        xpReward: 25,
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        notes: '',
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        maxOccurrences: null
      });
      setSelectedFile(null);
      setFileType(null);
      setCurrentTag('');
      setManualXP(false);
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError('Erreur lors de la création: ' + error.message);
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
            className="bg-white rounded-xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-2xl"
          >
            {/* ✅ EN-TÊTE COMPLET */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Créer une nouvelle tâche
                  </h2>
                  <p className="text-sm text-gray-500">
                    Formulaire complet avec XP auto, récurrence, rôles et upload média
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
                      placeholder="Décrivez précisément ce qui doit être fait..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      disabled={loading || uploading}
                      required
                    />
                  </div>
                </div>

                {/* ✅ RÔLE SYNERGIA */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Rôle Synergia</h3>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Nouveau</span>
                  </div>
                  
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  >
                    <option value="">Sélectionner un rôle (optionnel)</option>
                    {Object.values(SYNERGIA_ROLES).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>

                  {formData.roleId && SYNERGIA_ROLES[formData.roleId] && (
                    <div className="mt-2 p-2 bg-white border border-purple-200 rounded flex items-center gap-2">
                      <span className="text-lg">{SYNERGIA_ROLES[formData.roleId].icon}</span>
                      <span className="text-sm text-purple-700 font-medium">
                        {SYNERGIA_ROLES[formData.roleId].name}
                      </span>
                    </div>
                  )}
                </div>

                {/* ✅ DIFFICULTÉ ET PRIORITÉ */}
                <div className="grid grid-cols-2 gap-4">
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
                      <option value="easy">🟢 Facile (15 XP base)</option>
                      <option value="normal">🟡 Normal (25 XP base)</option>
                      <option value="hard">🟠 Difficile (40 XP base)</option>
                      <option value="expert">🔴 Expert (60 XP base)</option>
                    </select>
                  </div>

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
                      <option value="low">⬇️ Basse (×1)</option>
                      <option value="medium">➡️ Moyenne (×1.2)</option>
                      <option value="high">⬆️ Haute (×1.5)</option>
                      <option value="urgent">🚨 Urgente (×2)</option>
                    </select>
                  </div>
                </div>

                {/* ✅ RÉCURRENCE */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">Récurrence</h3>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Nouveau</span>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading || uploading}
                      />
                      <span className="text-sm text-gray-700">Tâche récurrente</span>
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type de récurrence
                          </label>
                          <select
                            value={formData.recurrenceType}
                            onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            disabled={loading || uploading}
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
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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

                      {formData.recurrenceType !== 'none' && (
                        <div className="p-3 bg-blue-100 border border-blue-200 rounded text-sm text-blue-800">
                          <Info className="w-4 h-4 inline mr-1" />
                          Cette tâche se répétera {RECURRENCE_OPTIONS[formData.recurrenceType]?.label.toLowerCase()}
                          {formData.recurrenceInterval > 1 && ` (tous les ${formData.recurrenceInterval})`}
                        </div>
                      )}
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
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Nouveau</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Ajoutez une image ou vidéo pour aider à comprendre la tâche (tutoriel, exemple, référence...)
                  </p>

                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
                        className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors w-full"
                      >
                        <div className="p-3 bg-gray-200 rounded-full">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-sm">
                          Cliquez pour ajouter une photo ou vidéo
                        </span>
                        <span className="text-xs text-gray-400">
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
                          <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Upload en cours... {uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ TAGS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (optionnel)
                  </label>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                            disabled={loading || uploading}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleTagKeyPress}
                      placeholder="Tapez un tag et appuyez sur Entrée"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!currentTag.trim() || loading || uploading}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ✅ DÉTAILS SUPPLÉMENTAIRES */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée estimée (heures)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'échéance (optionnel)
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>

                {/* ✅ NOTES SUPPLÉMENTAIRES */}
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

                {/* ✅ MESSAGES D'ERREUR */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                  </div>
                )}
              </div>

              {/* ✅ BOUTONS D'ACTION */}
              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
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
                      {uploading ? 'Upload en cours...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Créer la tâche complète
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskForm;
