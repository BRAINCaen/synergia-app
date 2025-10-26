// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL SOUMISSION TÂCHE - VERSION RESPONSIVE
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
  const [fileType, setFileType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [corsWarning, setCorsWarning] = useState(false);
  const [submitWithoutMedia, setSubmitWithoutMedia] = useState(false);
  const fileInputRef = useRef(null);

  const expectedXP = task?.xpReward || task?.difficulty === 'hard' ? 35 : 
                     task?.difficulty === 'easy' ? 10 : 25;

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Seuls les images et vidéos sont acceptées');
      return;
    }

    setSelectedFile(file);
    setFileType(isImage ? 'image' : 'video');
    setError('');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
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

      const validationData = {
        taskId: task.id,
        userId: user.uid,
        taskTitle: task.title,
        projectId: task.projectId,
        difficulty: task.difficulty || 'normal',
        comment: comment.trim(),
        photoFile: fileType === 'image' ? selectedFile : null,
        videoFile: fileType === 'video' ? selectedFile : null,
        submitWithoutMedia: submitWithoutMedia || !selectedFile
      };

      console.log('📦 Données validation préparées:', {
        ...validationData,
        photoFile: validationData.photoFile ? 'présent' : 'absent',
        videoFile: validationData.videoFile ? 'présent' : 'absent'
      });

      const result = await taskValidationService.submitForValidation(validationData);

      console.log('✅ Résultat soumission:', result);

      if (result.success) {
        setSuccess(true);
        
        if (result.corsWarning) {
          setCorsWarning(true);
          console.warn('⚠️ CORS Warning détecté - média non uploadé');
        }

        if (onSubmit) {
          onSubmit({
            taskId: task.id,
            validationId: result.validationId,
            comment: validationData.comment,
            corsWarning: result.corsWarning
          });
        }

        setTimeout(() => {
          if (!result.corsWarning) {
            handleClose();
          }
        }, 2000);

      } else {
        setError(result.message || 'Erreur lors de la soumission');
      }

    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError(error.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start sm:items-center sm:justify-center z-50 p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && !submitting && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-none sm:rounded-xl shadow-xl w-full max-w-[375px] sm:max-w-[95vw] md:max-w-2xl h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Soumettre pour validation</h2>
                  <p className="text-sm text-green-100 mt-1">
                    Gagnez {expectedXP} XP après validation
                  </p>
                </div>
              </div>
              
              {!submitting && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">{task.title}</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Décrivez votre travail et ajoutez une preuve si possible
                    </div>
                  </div>
                </div>
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">
                      {corsWarning ? 'Soumission réussie (sans média)' : 'Soumission réussie !'}
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {corsWarning 
                        ? 'Votre commentaire a été envoyé. Le média n\'a pas pu être uploadé (restriction CORS).'
                        : 'Votre travail a été soumis et sera validé sous peu.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {corsWarning && success && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <WifiOff className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-amber-900">
                        Média non uploadé
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        Le fichier média n'a pas pu être envoyé en raison de restrictions CORS.
                        Votre commentaire a tout de même été enregistré.
                        Vous pouvez fermer cette fenêtre.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && !corsWarning && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              {!success && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Décrivez votre travail *
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Expliquez ce que vous avez fait pour accomplir cette tâche..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Camera className="w-4 h-4 inline mr-2" />
                      Preuve optionnelle (photo/vidéo)
                    </label>
                    
                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
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
                          className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          disabled={submitting}
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                        </button>
                        <p className="mt-2 text-sm text-gray-600">
                          Cliquez pour ajouter une photo ou vidéo
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Max 10MB • JPG, PNG, MP4, MOV
                        </p>
                      </div>
                    ) : (
                      <div className="relative border border-gray-300 rounded-lg p-4">
                        {fileType === 'image' && filePreview && (
                          <img 
                            src={filePreview} 
                            alt="Aperçu" 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                        {fileType === 'video' && (
                          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Video className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleFileRemove}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          disabled={submitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-sm text-gray-600 mt-2">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex gap-3">
                {!success && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Annuler
                  </button>
                )}
                
                {!success && (
                  <button
                    type="submit"
                    disabled={submitting || (!comment.trim() && !selectedFile)}
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 justify-center"
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
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskSubmissionModal;
