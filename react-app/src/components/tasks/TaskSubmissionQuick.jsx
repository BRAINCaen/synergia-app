// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionQuick.jsx
// MODAL SIMPLIFIÉ POUR CONTOURNER LES PROBLÈMES CORS
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Trophy, 
  AlertTriangle,
  CheckCircle,
  Loader,
  MessageSquare
} from 'lucide-react';
import { taskValidationService } from '../../core/services/taskValidationService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 📝 MODAL DE SOUMISSION RAPIDE SANS UPLOAD
 * Version simplifiée pour contourner les problèmes CORS
 */
const TaskSubmissionQuick = ({ 
  isOpen, 
  task, 
  onClose, 
  onSubmit
}) => {
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset du formulaire à l'ouverture
  React.useEffect(() => {
    if (isOpen) {
      setComment('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Veuillez ajouter un commentaire décrivant votre travail');
      return;
    }
    
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      console.log('📝 Soumission rapide (sans média):', {
        taskId: task.id,
        userId: user.uid,
        comment: comment.trim()
      });

      // Préparer les données de validation SANS médias
      const validationData = {
        taskId: task.id,
        userId: user.uid,
        taskTitle: task.title,
        projectId: task.projectId,
        difficulty: task.difficulty || 'normal',
        comment: comment.trim(),
        photoFile: null, // Pas de fichier
        videoFile: null  // Pas de fichier
      };

      // Soumettre la validation
      const result = await taskValidationService.submitTaskForValidation(validationData);
      
      if (result.success) {
        console.log('✅ Validation soumise avec succès:', result.validationId);
        setSuccess(true);
        
        // Notifier le parent
        if (onSubmit) {
          onSubmit({
            ...result,
            taskId: task.id,
            newStatus: 'validation_pending'
          });
        }
        
        // Fermer automatiquement après succès
        setTimeout(() => {
          onClose();
        }, 2000);
        
      } else {
        setError('Erreur lors de la soumission');
      }
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError('Erreur lors de la soumission: ' + error.message);
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
          className="bg-white rounded-xl shadow-xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Validation rapide
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

          <div className="p-6">
            
            {/* Message de succès */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Validation soumise !</p>
                  <p className="text-green-700 text-sm">Votre tâche est en attente de validation admin</p>
                </div>
              </div>
            )}

            {/* Message d'info */}
            {!success && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-medium">Soumission simplifiée</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Décrivez votre travail dans le commentaire ci-dessous. 
                      Vous pourrez ajouter des preuves plus tard si nécessaire.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Erreur</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Commentaire */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 Décrivez votre travail *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Décrivez ce que vous avez accompli, les étapes réalisées, les difficultés rencontrées..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                    disabled={submitting}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ce commentaire aidera l'administrateur à valider votre travail
                  </p>
                </div>

                {/* Récompense */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Récompense</p>
                        <p className="text-sm text-gray-600">À la validation</p>
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
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader className="w-4 h-4 animate-spin" />}
                    {submitting ? 'Soumission...' : 'Soumettre'}
                    {!submitting && <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskSubmissionQuick;
