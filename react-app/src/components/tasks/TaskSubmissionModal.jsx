// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL DE SOUMISSION DE TÂCHE AVEC PREUVE
// ==========================================

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  Upload, 
  Send, 
  AlertCircle, 
  CheckCircle,
  FileImage,
  MessageSquare,
  Trophy,
  Clock
} from 'lucide-react';
import { taskValidationService } from '../../core/services/taskValidationService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 📝 MODAL DE SOUMISSION DE TÂCHE AVEC PREUVE
 */
const TaskSubmissionModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onSubmissionSuccess 
}) => {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  
  // États du formulaire
  const [comment, setComment] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // XP calculé selon la difficulté
  const getXPForDifficulty = (difficulty) => {
    const xpMap = {
      'easy': 25,
      'normal': 50,
      'hard': 100,
      'expert': 200
    };
    return xpMap[difficulty] || 50;
  };

  const expectedXP = getXPForDifficulty(task?.difficulty || 'normal');

  // Gérer la sélection de photo
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('L\'image ne doit pas dépasser 10MB');
      return;
    }

    setSelectedPhoto(file);
    setError('');

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Supprimer la photo sélectionnée
  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Soumettre la tâche
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Veuillez ajouter un commentaire décrivant votre travail');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submissionData = {
        taskId: task.id,
        userId: user.uid,
        taskTitle: task.title,
        projectId: task.projectId,
        difficulty: task.difficulty || 'normal',
        comment: comment.trim(),
        photoFile: selectedPhoto,
        xpAmount: expectedXP
      };

      const result = await taskValidationService.submitTaskForValidation(submissionData);

      if (result.success) {
        setSuccess(true);
        
        // Callback de succès
        if (onSubmissionSuccess) {
          onSubmissionSuccess(result);
        }

        // Fermer après 2 secondes
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError(error.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset du formulaire
  const resetForm = () => {
    setComment('');
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fermer et reset
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Soumettre la tâche</h2>
              <p className="text-sm text-gray-600 mt-1">
                Ajoutez une preuve de votre travail pour validation
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            // Écran de succès
            <div className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tâche soumise !</h3>
              <p className="text-gray-600 mb-4">
                Votre tâche a été envoyée pour validation par un administrateur.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 text-blue-800">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">+{expectedXP} XP en attente</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Vous serez notifié dès que la validation sera effectuée.
              </p>
            </div>
          ) : (
            <>
              {/* Informations de la tâche */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">{task.title}</h3>
                {task.description && (
                  <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      task.difficulty === 'easy' ? 'bg-green-500' :
                      task.difficulty === 'hard' ? 'bg-orange-500' :
                      task.difficulty === 'expert' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></div>
                    <span className="text-gray-700 font-medium">
                      {task.difficulty || 'normal'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">+{expectedXP} XP</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span>Validation requise</span>
                  </div>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Commentaire obligatoire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Décrivez votre travail *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Expliquez comment vous avez réalisé cette tâche, les difficultés rencontrées, les résultats obtenus..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 caractères. Soyez précis pour faciliter la validation.
                  </p>
                </div>

                {/* Upload de photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Photo de preuve (recommandée)
                  </label>
                  
                  {!photoPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Cliquez pour ajouter une photo</p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG jusqu'à 10MB • Screenshot, photo du résultat, etc.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        <FileImage className="w-3 h-3 inline mr-1" />
                        {selectedPhoto?.name}
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Message d'erreur */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Information validation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Processus de validation</p>
                      <p>
                        Votre soumission sera examinée par un administrateur qui vérifiera 
                        la qualité du travail avant d'attribuer les {expectedXP} XP.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim() || comment.trim().length < 10}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Envoi...' : 'Soumettre pour validation'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskSubmissionModal;
