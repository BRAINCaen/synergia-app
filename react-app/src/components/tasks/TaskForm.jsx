// ==========================================
// 📁 react-app/src/components/tasks/TaskForm.jsx
// FORMULAIRE DE CRÉATION DE TÂCHE AVEC UPLOAD MÉDIA
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
  Loader
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { storageService } from '../../core/services/storageService.js';

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
 * 📝 FORMULAIRE DE CRÉATION DE TÂCHE AVEC UPLOAD MÉDIA
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  submitting = false 
}) => {
  const { user } = useAuthStore();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'normal',
    xpReward: 10,
    openToVolunteers: true,
    assignedTo: [],
    tags: []
  });
  
  // État média
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // État du formulaire
  const [error, setError] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  
  // Reset du formulaire à l'ouverture
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        difficulty: 'normal',
        xpReward: 10,
        openToVolunteers: true,
        assignedTo: [],
        tags: []
      });
      setSelectedFile(null);
      setFileType(null);
      setError('');
      setCurrentTag('');
      setUploadProgress(0);
      setUploading(false);
    }
  }, [isOpen]);

  /**
   * 📎 GESTION DES FICHIERS
   */
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

  /**
   * 🏷️ GESTION DES TAGS
   */
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

  /**
   * 📤 UPLOAD DU MÉDIA
   */
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

  /**
   * 📝 SOUMISSION DU FORMULAIRE
   */
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
      
      console.log('📝 Création tâche avec média:', {
        title: formData.title,
        hasMedia: !!selectedFile,
        mediaType: fileType
      });

      // Upload du média si présent
      let mediaData = null;
      if (selectedFile) {
        mediaData = await uploadMediaFile();
      }

      // Préparer les données de la tâche
      const taskData = {
        ...formData,
        // Métadonnées de base
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        
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
        videoUrl: mediaData?.type === 'video' ? mediaData.url : null
      };

      // Soumettre la tâche
      await onSubmit(taskData);
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError(`Erreur lors de la création: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plus className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Créer une nouvelle tâche
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={submitting || uploading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(95vh-80px)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Informations de base */}
              <div className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre clair et descriptif..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting || uploading}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description détaillée *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez précisément ce qui doit être fait..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting || uploading}
                    required
                  />
                </div>
              </div>

              {/* Paramètres de la tâche */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting || uploading}
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🟠 Haute</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>

                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting || uploading}
                  >
                    <option value="easy">⭐ Facile (5-15 XP)</option>
                    <option value="normal">⭐⭐ Normal (10-25 XP)</option>
                    <option value="hard">⭐⭐⭐ Difficile (20-50 XP)</option>
                    <option value="expert">⭐⭐⭐⭐ Expert (40-100 XP)</option>
                  </select>
                </div>

                {/* Récompense XP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting || uploading}
                  />
                </div>
              </div>

              {/* Section Upload Média */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">
                    Tutoriel ou exemple (optionnel)
                  </h3>
                  <Info className="w-4 h-4 text-gray-400" />
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
                      disabled={submitting || uploading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting || uploading}
                      className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors w-full"
                    >
                      <div className="flex gap-2">
                        <ImageIcon className="w-8 h-8" />
                        <VideoIcon className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-medium">
                        Cliquez pour ajouter un tutoriel
                      </span>
                      <span className="text-xs text-gray-400">
                        Images: 10MB max • Vidéos: 100MB max
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <MediaPreview
                      file={selectedFile}
                      fileType={fileType}
                      onRemove={handleRemoveFile}
                    />
                    
                    {/* Barre de progression upload */}
                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Upload en cours...</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (optionnel)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting || uploading}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={submitting || uploading || !currentTag.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                          disabled={submitting || uploading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Options avancées */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="openToVolunteers"
                    checked={formData.openToVolunteers}
                    onChange={(e) => setFormData(prev => ({ ...prev, openToVolunteers: e.target.checked }))}
                    disabled={submitting || uploading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="openToVolunteers" className="flex items-center gap-2 text-sm text-blue-800">
                    <Users className="w-4 h-4" />
                    <span>Ouverte aux volontaires (recommandé)</span>
                  </label>
                </div>
                <p className="text-xs text-blue-600 mt-2 ml-7">
                  Les utilisateurs pourront se porter volontaires pour cette tâche
                </p>
              </div>

              {/* Messages d'erreur */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedFile ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Média attaché: {selectedFile.name}
                    </span>
                  ) : (
                    <span>Aucun média attaché</span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting || uploading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading || !formData.title.trim() || !formData.description.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting || uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        {uploading ? 'Upload en cours...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Créer la tâche
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskForm;
