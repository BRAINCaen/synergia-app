// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// CORRECTION IMPORT SERVICE VALIDATION
// ==========================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  Camera, 
  Video, 
  Send, 
  Loader, 
  CheckCircle, 
  AlertTriangle,
  WifiOff,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
// ✅ CORRECTION: Import correct du service de validation
import { taskValidationService } from '../../core/services/taskValidationService.js';

/**
 * 🖼️ MODAL DE SOUMISSION DE TÂCHE POUR VALIDATION
 */
const TaskSubmissionModal = ({ 
  isOpen, 
  onClose, 
  task,
  onSubmit
}) => {
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(''); // 'image' ou 'video'
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [corsWarning, setCorsWarning] = useState(false);
  const [submitWithoutMedia, setSubmitWithoutMedia] = useState(false);
  const fileInputRef = useRef(null);

  // Calculer l'XP attendu
  const expectedXP = task?.xpReward || task?.difficulty === 'hard' ? 35 : 
                     task?.difficulty === 'easy' ? 10 : 25;

  // 🔄 Reset modal à l'ouverture
  React.useEffect(() => {
    if (isOpen) {
      setComment('');
      setSelectedFile(null);
      setFilePreview(null);
      setFileType('');
      setSubmitting(false);
      setSuccess(false);
      setError('');
      setCorsWarning(false);
      setSubmitWithoutMedia(false);
    }
  }, [isOpen]);

  // 📎 Gestion de sélection de fichier
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    // Vérifier le type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Seuls les images et vidéos sont acceptées');
      return;
    }

    setSelectedFile(file);
    setFileType(isImage ? 'image' : 'video');
    setError('');

    // Générer un aperçu pour les images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // 🗑️ Supprimer le fichier sélectionné
  const handleFileRemove = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ❌ Fermer le modal
  const handleClose = () => {
    if (!submitting) {
      setComment('');
      setSelectedFile(null);
      setFilePreview(null);
      setSuccess(false);
      setError('');
      setCorsWarning(false);
      onClose();
    }
  };

  // 📤 Soumettre la validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    // Vérification minimale
    if (!comment.trim() && !selectedFile && !submitWithoutMedia) {
      setError('Veuillez ajouter un commentaire ou une preuve');
      return;
    }

    setSubmitting(true);
    setError('');
    setCorsWarning(false);

    try {
      console.log('📤 Début soumission validation:', {
        taskId: task.id,
        hasFile: !!selectedFile,
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

      // ✅ CORRECTION: Utiliser le service correctement importé
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
      } else if (error.message.includes('submitTaskForValidation is not a function')) {
        setError('❌ Service de validation indisponible. Veuillez réessayer.');
      } else {
        setError(`Erreur: ${error.message}`);
      }
      
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

          {/* Contenu */}
          <form onSubmit={handleSubmit} className="p-6">
            
            {/* Message de succès */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Validation soumise !</p>
                  <p className="text-green-700 text-sm">
                    Votre tâche est en attente de validation par un administrateur.
                    Vous recevrez {expectedXP} XP une fois validée.
                  </p>
                </div>
              </div>
            )}

            {/* Messages d'erreur et d'avertissement */}
            {corsWarning && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                <WifiOff className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-orange-800 font-medium">Problème d'upload détecté</p>
                  <p className="text-orange-700 text-sm">
                    La validation a été soumise mais sans les fichiers média. 
                    Vous pouvez fermer cette fenêtre.
                  </p>
                </div>
              </div>
            )}

            {error && !corsWarning && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Zone de commentaire */}
            {!success && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Décrivez votre travail *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Expliquez ce que vous avez fait pour accomplir cette tâche..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={submitting}
                    required
                  />
                </div>

                {/* Zone d'upload optionnel */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preuve optionnelle (photo/vidéo)
                  </label>
                  
                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                          <Camera className="w-8 h-8 text-gray-400" />
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600">Glissez un fichier ici ou cliquez pour sélectionner</p>
                        <p className="text-xs text-gray-500">Images et vidéos acceptées (max 10MB)</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={submitting}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={submitting}
                          className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4 inline mr-2" />
                          Choisir un fichier
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {fileType === 'image' ? '📷' : '🎥'} {selectedFile.name}
                        </span>
                        <button
                          type="button"
                          onClick={handleFileRemove}
                          disabled={submitting}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {filePreview && (
                        <img 
                          src={filePreview} 
                          alt="Aperçu" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}

                  {/* Option pour soumettre sans média */}
                  <div className="mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={submitWithoutMedia}
                        onChange={(e) => setSubmitWithoutMedia(e.target.checked)}
                        disabled={submitting}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">
                        Soumettre sans preuve visuelle (commentaire uniquement)
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Informations sur la validation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              
              {!success && (
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
                      Soumettre pour validation
                    </>
                  )}
                </button>
              )}
              
              {success && corsWarning && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fermer
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskSubmissionModal;
