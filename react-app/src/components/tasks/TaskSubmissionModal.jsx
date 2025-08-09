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
  WifiOff,
  MessageSquare,
  Star
} from 'lucide-react';
import taskValidationService from '../../core/services/taskValidationService.js';
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
  const [success, setSuccess] = useState(false);
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
      setSuccess(false);
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
        setSuccess(true);
        
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
          }, 2000);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
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
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Soumettre la tâche
              </h2>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Informations de la tâche */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty || 'normal'}
                </span>
                <div className="flex items-center gap-1 text-green-600">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">+{expectedXP} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Décrivez votre travail *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Décrivez comment vous avez accompli cette tâche..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                disabled={submitting}
              />
            </div>

            {/* Upload de fichier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-2" />
                Preuve (photo ou vidéo)
              </label>
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">
                      Cliquez pour ajouter une photo ou vidéo
                    </span>
                    <span className="text-xs text-gray-400">
                      Images: 10MB max • Vidéos: 100MB max
                    </span>
                  </button>
                </div>
              ) : (
                <MediaPreview
                  file={selectedFile}
                  fileType={fileType}
                  onRemove={handleRemoveFile}
                />
              )}
            </div>

            {/* Option soumettre sans média */}
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <input
                type="checkbox"
                id="submitWithoutMedia"
                checked={submitWithoutMedia}
                onChange={(e) => setSubmitWithoutMedia(e.target.checked)}
                disabled={submitting}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="submitWithoutMedia" className="text-sm text-yellow-800 flex-1">
                Soumettre sans média (si upload impossible)
              </label>
            </div>

            {/* Messages d'état */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Tâche soumise avec succès ! En attente de validation.
                </span>
              </div>
            )}

            {corsWarning && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <WifiOff className="w-5 h-5 text-orange-600" />
                <div className="text-orange-800">
                  <p className="font-medium">Problème d'upload détecté</p>
                  <p className="text-sm">La tâche a été soumise sans média. Vous pouvez fermer cette fenêtre.</p>
                </div>
              </div>
            )}

            {error && !corsWarning && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Informations sur la validation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-blue-800">
                  <p className="font-medium text-sm">À propos de la validation</p>
                  <ul className="text-xs mt-2 space-y-1">
                    <li>• Votre soumission sera examinée par un administrateur</li>
                    <li>• Vous recevrez {expectedXP} XP une fois validée</li>
                    <li>• Un commentaire peut être demandé si la preuve n'est pas claire</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || (!comment.trim() && !selectedFile && !submitWithoutMedia)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Soumission...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {success ? 'Soumis ✓' : 'Soumettre pour validation'}
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
