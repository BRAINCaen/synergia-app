// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL POUR SOUMETTRE UNE TÂCHE À VALIDATION
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Camera, 
  FileImage, 
  Trophy, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

/**
 * 📝 MODAL DE SOUMISSION DE TÂCHE POUR VALIDATION
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
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        alert('❌ Veuillez sélectionner une image valide');
        return;
      }

      setSelectedFile(file);
      
      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!task) return;

    const submissionData = {
      comment: comment.trim(),
      photoFile: selectedFile,
      submittedAt: new Date()
    };

    onSubmit(task, submissionData);
  };

  const resetForm = () => {
    setComment('');
    setSelectedFile(null);
    setPreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-xl">
            <div>
              <h2 className="text-xl font-bold">📝 Soumettre pour validation</h2>
              <p className="opacity-90 text-sm mt-1">{task.title}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            
            {/* Informations de la tâche */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">Informations de la tâche</h3>
                  <p className="text-blue-800 text-sm mt-1">{task.description || 'Pas de description'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-orange-600">+{task.xpReward || 50} XP</span>
                    </span>
                    {task.difficulty && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        task.difficulty === 'normal' ? 'bg-blue-100 text-blue-800' :
                        task.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Information système */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-orange-900">Nouveau système de validation</h3>
                  <p className="text-orange-800 text-sm mt-1">
                    Vos XP seront attribués après validation par un administrateur. 
                    Vous recevrez une notification du résultat.
                  </p>
                </div>
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                💬 Commentaire sur votre travail (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Décrivez ce que vous avez fait, les défis rencontrés, les solutions trouvées..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Un bon commentaire aide l'admin à comprendre votre travail et accélère la validation
              </p>
            </div>

            {/* Upload de photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Photo de preuve (optionnel mais recommandé)
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                />
                
                {preview ? (
                  <div className="space-y-3">
                    <img 
                      src={preview} 
                      alt="Prévisualisation" 
                      className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Photo prête à envoyer</span>
                    </div>
                    <label 
                      htmlFor="photo-upload" 
                      className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Changer la photo
                    </label>
                  </div>
                ) : (
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Cliquez pour ajouter une photo de votre travail
                      </p>
                      <p className="text-xs text-gray-500">
                        Capture d'écran, photo du résultat, etc. (PNG, JPG jusqu'à 5MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Checklist avant soumission */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">✅ Avant de soumettre</h3>
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
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskSubmissionModal;
