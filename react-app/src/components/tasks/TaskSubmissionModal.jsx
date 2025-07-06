// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL POUR SOUMETTRE UNE TÂCHE AVEC PHOTO OU VIDÉO - VERSION CORRIGÉE
// ==========================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Camera, 
  Video, 
  Trophy, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Play,
  Image as ImageIcon,
  FileVideo,
  Loader
} from 'lucide-react';

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
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <FileVideo className="w-4 h-4" />
            <span>Vidéo prête à envoyer</span>
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
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <ImageIcon className="w-4 h-4" />
          <span>Photo prête à envoyer</span>
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
 * 📝 MODAL DE SOUMISSION DE TÂCHE POUR VALIDATION AVEC MÉDIAS
 */
const TaskSubmissionModal = ({ 
  isOpen, 
  task, 
  onClose, 
  onSubmit,
  submitting = false 
}) => {
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setError(null);
      
      console.log('📎 Fichier sélectionné:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      // Vérifier le type (image ou vidéo)
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError('Veuillez sélectionner une image ou une vidéo');
        return;
      }

      // Vérifier la taille (limite à 100MB pour les vidéos, 10MB pour les images)
      const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const limit = file.type.startsWith('video/') ? '100MB' : '10MB';
        setError(`Fichier trop volumineux. Limite: ${limit}`);
        return;
      }

      setSelectedFile(file);
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileType(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() && !selectedFile) {
      setError('Veuillez ajouter un commentaire ou un fichier');
      return;
    }
    
    setError(null);
    setUploadProgress(0);
    
    try {
      console.log('🎯 Soumission tâche:', {
        taskId: task.id,
        hasComment: !!comment.trim(),
        hasFile: !!selectedFile,
        fileType: selectedFile?.type
      });
      
      // Simuler le progress d'upload
      if (selectedFile) {
        setUploadProgress(25);
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(50);
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(75);
      }
      
      const result = await onSubmit(task, {
        comment: comment.trim(),
        photoFile: selectedFile
      });
      
      setUploadProgress(100);
      
      // Réinitialiser le formulaire en cas de succès
      setComment('');
      setSelectedFile(null);
      setFileType(null);
      setUploadProgress(0);
      
      console.log('✅ Soumission réussie:', result);
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError(error.message || 'Erreur lors de la soumission');
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setComment('');
      setSelectedFile(null);
      setFileType(null);
      setUploadProgress(0);
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Soumettre pour validation
                  </h2>
                  <p className="text-sm text-gray-600">
                    {task.title}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                disabled={submitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Erreur</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 Commentaire de soumission
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Décrivez votre travail, les difficultés rencontrées, ce que vous avez appris..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optionnel mais recommandé pour faciliter la validation
              </p>
            </div>

            {/* Zone d'upload de média */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📎 Preuve de réalisation (optionnel)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                id="media-upload"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={submitting}
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {selectedFile ? (
                  <MediaPreview 
                    file={selectedFile} 
                    fileType={fileType} 
                    onRemove={handleRemoveFile}
                  />
                ) : (
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-4">
                        <Camera className="w-8 h-8 text-gray-400" />
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Cliquez pour ajouter une photo ou vidéo
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Images : JPG, PNG, GIF, WEBP (max 10MB)<br/>
                          Vidéos : MP4, MOV, AVI, WEBM (max 100MB)
                        </p>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Barre de progression d'upload */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upload en cours...</span>
                  <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Checklist avant soumission */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Avant de soumettre
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>La tâche est entièrement terminée</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Le résultat correspond aux attentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>J'ai vérifié la qualité de mon travail</span>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Le {fileType === 'video' ? 'fichier vidéo' : 'fichier image'} est lisible et de bonne qualité</span>
                  </div>
                )}
              </div>
            </div>

            {/* Récompenses */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Récompenses à la validation</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">
                      {task.difficulty === 'easy' ? '10 XP' : 
                       task.difficulty === 'normal' ? '25 XP' : '50 XP'}
                    </span>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">
                        +5 XP (bonus preuve)
                      </span>
                    </div>
                  )}
                </div>
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={submitting || (!comment.trim() && !selectedFile)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Soumission...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Soumettre pour validation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskSubmissionModal;
