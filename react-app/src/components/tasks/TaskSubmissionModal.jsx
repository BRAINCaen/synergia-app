// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL DE SOUMISSION AVEC GESTION CORS AMÉLIORÉE
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
  Loader,
  Wifi,
  WifiOff
} from 'lucide-react';
import { taskValidationService } from '../../core/services/taskValidationService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

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
 * 📝 MODAL DE SOUMISSION AVEC GESTION CORS
 */
const TaskSubmissionModal = ({ 
  isOpen, 
  task, 
  onClose, 
  onSubmit,
  submitting: externalSubmitting = false 
}) => {
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [corsWarning, setCorsWarning] = useState(false);
  const [submitWithoutMedia, setSubmitWithoutMedia] = useState(false);
  const fileInputRef = useRef(null);

  // Reset du formulaire à l'ouverture
  React.useEffect(() => {
    if (isOpen) {
      setComment('');
      setSelectedFile(null);
      setFileType(null);
      setError('');
      setCorsWarning(false);
      setSubmitWithoutMedia(false);
    }
  }, [isOpen]);

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
    setCorsWarning(false);
    
    console.log('📎 Fichier sélectionné:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileType(null);
    setCorsWarning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() && !selectedFile && !submitWithoutMedia) {
      setError('Veuillez ajouter un commentaire ou une preuve (photo/vidéo), ou cocher "Soumettre sans média"');
      return;
    }
    
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setCorsWarning(false);
    
    try {
      console.log('📝 Soumission validation tâche:', {
        taskId: task.id,
        userId: user.uid,
        hasMedia: !!selectedFile,
        submitWithoutMedia
      });

      // Préparer les données de validation
      const validationData = {
        taskId: task.id,
        userId: user.uid,
        taskTitle: task.title,
        projectId: task.projectId,
        difficulty: task.difficulty || 'normal',
        comment: comment.trim(),
        photoFile: fileType === 'image' ? selectedFile : null,
        videoFile: fileType === 'video' ? selectedFile : null
      };

      // Si l'utilisateur a choisi de soumettre sans média, on ne passe pas les fichiers
      if (submitWithoutMedia) {
        validationData.photoFile = null;
        validationData.videoFile = null;
      }

      // Soumettre la validation
      const result = await taskValidationService.submitTaskForValidation(validationData);
      
      if (result.success) {
        console.log('✅ Validation soumise avec succès:', result.validationId);
        
        // Vérifier s'il y a eu un problème CORS
        if (result.corsWarning) {
          setCorsWarning(true);
          setError('⚠️ Problème d\'upload détecté - Validation soumise sans média');
        }
        
        // Notifier le parent
        if (onSubmit) {
          onSubmit({
            ...result,
            taskId: task.id,
            newStatus: 'validation_pending'
          });
        }
        
        // Fermer le modal après un délai si pas de problème CORS
        if (!result.corsWarning) {
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
        
      } else {
        setError('Erreur lors de la soumission');
      }
      
    } catch (error) {
      console.error('❌ Erreur soumission validation:', error);
      
      if (error.message.includes('CORS')) {
        setCorsWarning(true);
        setError('⚠️ Problème de connexion détecté. Vous pouvez soumettre sans média.');
      } else {
        setError(error.message || 'Erreur lors de la soumission');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const getExpectedXP = () => {
    if (task.xpReward) return task.xpReward;
    
    switch (task.difficulty) {
      case 'easy': return 10;
      case 'hard': return 50;
      case 'expert': return 100;
      default: return 25; // normal
    }
  };

  const expectedXP = getExpectedXP();

  if (!isOpen) return null;

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
              
              {/* Indicateur XP */}
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800 font-medium">+{expectedXP} XP</span>
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
            
            {/* Alerte CORS */}
            {corsWarning && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-orange-800 font-medium">Problème de connexion détecté</p>
                  <p className="text-orange-700 text-sm mt-1">
                    L'upload des médias rencontre des difficultés. Vous pouvez continuer sans fichier.
                  </p>
                </div>
              </div>
            )}

            {/* Message de succès */}
            {submitting && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-blue-800 font-medium">Soumission en cours...</p>
                  <p className="text-blue-700 text-sm">Validation de votre travail</p>
                </div>
              </div>
            )}

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
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-blue-800 text-xs">
                          💡 Une preuve photo/vidéo augmente vos chances de validation rapide
                        </p>
                      </div>
                    </div>
                  </label>
                )}
                
                {selectedFile && (
                  <div className="mt-3 text-center">
                    <p className="text-green-600 text-sm font-medium">
                      ✅ Vérifiez que votre {fileType === 'video' ? 'vidéo' : 'photo'} montre bien votre travail accompli
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Option pour soumettre sans média en cas de problème */}
            {(corsWarning || error.includes('CORS') || error.includes('connexion')) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={submitWithoutMedia}
                    onChange={(e) => setSubmitWithoutMedia(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Soumettre sans média (en cas de problème de connexion)
                  </span>
                </label>
              </div>
            )}

            {/* Récompense */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Récompense à la validation</p>
                    <p className="text-sm text-gray-600">Une fois validé par un administrateur</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">+{expectedXP}</p>
                  <p className="text-xs text-gray-600">XP</p>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={submitting || (!comment.trim() && !selectedFile && !submitWithoutMedia)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader className="w-4 h-4 animate-spin" />}
                {submitting ? 'Soumission...' : 'Soumettre pour validation'}
                {!submitting && <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskSubmissionModal;
