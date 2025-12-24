// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL SOUMISSION TÂCHE - VERSION MULTI-FICHIERS SANS LIMITE
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
  MessageSquare,
  Image,
  Film,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { taskValidationService } from '../../core/services/taskValidationService.js';
import storageService from '../../core/services/storageService.js';

/**
 * 🖼️ MODAL DE SOUMISSION DE TÂCHE POUR VALIDATION
 * Supporte plusieurs photos/vidéos sans limite de taille
 */
const TaskSubmissionModal = ({
  isOpen,
  onClose,
  task,
  onSubmit
}) => {
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [corsWarning, setCorsWarning] = useState(false);
  const fileInputRef = useRef(null);

  const expectedXP = task?.xpReward || task?.difficulty === 'hard' ? 35 :
                     task?.difficulty === 'easy' ? 10 : 25;

  React.useEffect(() => {
    if (isOpen) {
      setComment('');
      setSelectedFiles([]);
      setFilePreviews([]);
      setSubmitting(false);
      setUploadProgress(0);
      setSuccess(false);
      setError('');
      setCorsWarning(false);
    }
  }, [isOpen]);

  // Sélection de fichiers (multi-fichiers)
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Filtrer pour n'accepter que images et vidéos
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length === 0) {
      setError('Seuls les images et vidéos sont acceptés');
      return;
    }

    // Créer des previews pour les images
    const newPreviews = [];
    validFiles.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => {
            const updated = [...prev];
            updated[selectedFiles.length + index] = {
              type: 'image',
              url: e.target.result,
              name: file.name
            };
            return updated;
          });
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          type: 'video',
          url: null,
          name: file.name
        });
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError('');

    // Reset input pour permettre la resélection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Supprimer un fichier
  const handleFileRemove = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    if (!submitting) {
      setComment('');
      setSelectedFiles([]);
      setFilePreviews([]);
      setSuccess(false);
      setError('');
      setCorsWarning(false);
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!comment.trim() && selectedFiles.length === 0) {
      setError('Veuillez ajouter un commentaire ou une preuve (photo/vidéo)');
      return;
    }

    setSubmitting(true);
    setError('');
    setCorsWarning(false);
    setUploadProgress(0);

    try {
      console.log('📤 Début soumission validation:', {
        taskId: task.id,
        filesCount: selectedFiles.length
      });

      // Upload des fichiers si présents
      let uploadedMedias = [];
      if (selectedFiles.length > 0) {
        console.log('📤 Upload de', selectedFiles.length, 'fichiers...');

        try {
          uploadedMedias = await storageService.uploadMultipleFiles(
            selectedFiles,
            user.uid,
            'validation',
            task.id,
            (progress) => setUploadProgress(progress)
          );
          console.log('✅ Fichiers uploadés:', uploadedMedias.length);
        } catch (uploadError) {
          console.error('❌ Erreur upload:', uploadError);
          setCorsWarning(true);
          // Continuer sans les médias
        }
      }

      // Séparer photos et vidéos
      const photos = uploadedMedias.filter(m => m.type === 'image').map(m => m.url);
      const videos = uploadedMedias.filter(m => m.type === 'video').map(m => m.url);

      const validationData = {
        taskId: task.id,
        userId: user.uid,
        taskTitle: task.title,
        projectId: task.projectId,
        difficulty: task.difficulty || 'normal',
        comment: comment.trim(),
        // Ancienne compatibilité (1 fichier)
        photoFile: null,
        videoFile: null,
        // Nouvelles données multi-fichiers
        photoUrls: photos,
        videoUrls: videos,
        mediaCount: uploadedMedias.length,
        submitWithoutMedia: selectedFiles.length === 0 || uploadedMedias.length === 0
      };

      console.log('📦 Données validation préparées:', {
        ...validationData,
        photoUrls: photos.length,
        videoUrls: videos.length
      });

      const result = await taskValidationService.submitForValidation(validationData);

      console.log('✅ Résultat soumission:', result);

      if (result.success) {
        setSuccess(true);

        if (onSubmit) {
          onSubmit({
            taskId: task.id,
            validationId: result.validationId,
            comment: validationData.comment,
            mediaCount: uploadedMedias.length,
            corsWarning: corsWarning
          });
        }

        setTimeout(() => {
          if (!corsWarning) {
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && !submitting && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Soumettre pour validation</h2>
                  <p className="text-sm text-green-100/80">
                    Gagnez <span className="font-bold">{expectedXP} XP</span> après validation
                  </p>
                </div>
              </div>

              {!submitting && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">
              {/* Info quête */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">{task.title}</div>
                    <div className="text-sm text-blue-300/80 mt-1">
                      Décrivez votre travail et ajoutez des preuves
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages de statut */}
              {success && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div className="flex-1">
                    <div className="font-medium text-green-300">
                      {corsWarning ? 'Soumission réussie (sans médias)' : 'Soumission réussie !'}
                    </div>
                    <p className="text-sm text-green-400/80 mt-1">
                      {corsWarning
                        ? 'Votre commentaire a été envoyé. Les médias n\'ont pas pu être uploadés.'
                        : 'Votre travail sera validé sous peu.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {error && !corsWarning && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {!success && (
                <>
                  {/* Commentaire */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2 text-purple-400" />
                      Décrivez votre travail *
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Expliquez ce que vous avez fait pour accomplir cette quête..."
                      className="w-full h-28 p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none transition-all"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Upload de fichiers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Camera className="w-4 h-4 inline mr-2 text-cyan-400" />
                      Photos / Vidéos
                      <span className="text-xs text-gray-500 ml-2">(sans limite de taille)</span>
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={submitting}
                      multiple
                    />

                    {/* Zone de drop */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-green-500/50 hover:bg-green-500/5 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-green-400"
                    >
                      <div className="flex items-center gap-3">
                        <Image className="w-6 h-6" />
                        <Film className="w-6 h-6" />
                      </div>
                      <span className="text-sm">
                        {selectedFiles.length > 0
                          ? `${selectedFiles.length} fichier(s) - Ajouter plus`
                          : 'Cliquez pour ajouter des photos ou vidéos'}
                      </span>
                    </button>

                    {/* Liste des fichiers sélectionnés */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10"
                          >
                            {/* Preview */}
                            {file.type.startsWith('image/') && filePreviews[index]?.url ? (
                              <img
                                src={filePreviews[index].url}
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                {file.type.startsWith('video/') ? (
                                  <Film className="w-5 h-5 text-blue-400" />
                                ) : (
                                  <Image className="w-5 h-5 text-purple-400" />
                                )}
                              </div>
                            )}

                            {/* Info fichier */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                {file.type.startsWith('video/') && ' • Vidéo'}
                              </p>
                            </div>

                            {/* Supprimer */}
                            <button
                              type="button"
                              onClick={() => handleFileRemove(index)}
                              disabled={submitting}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Barre de progression upload */}
                    {submitting && selectedFiles.length > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">
                          Upload en cours... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white/5 border-t border-white/10 p-4 flex-shrink-0">
              <div className="flex gap-3">
                {!success && (
                  <>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 border border-white/20 text-gray-300 rounded-xl hover:bg-white/5 transition-colors font-medium disabled:opacity-50"
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || (!comment.trim() && selectedFiles.length === 0)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 justify-center shadow-lg shadow-green-500/25"
                    >
                      {submitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          {selectedFiles.length > 0 ? 'Upload...' : 'Envoi...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Soumettre
                        </>
                      )}
                    </button>
                  </>
                )}

                {success && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
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
