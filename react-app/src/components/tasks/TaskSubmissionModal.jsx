// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL POUR SOUMETTRE UNE TÂCHE AVEC PHOTO OU VIDÉO
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
  Clock,
  Video,
  Upload,
  Play
} from 'lucide-react';

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
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // ✅ PLUS DE LIMITE DE TAILLE
      console.log('📎 Fichier sélectionné:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      // Vérifier le type (image ou vidéo)
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('❌ Veuillez sélectionner une image ou une vidéo');
        return;
      }

      setSelectedFile(file);
      setFileType(file.type.startsWith('video/') ? 'video' : 'image');
      
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
      photoFile: selectedFile, // Garde le nom photoFile pour compatibilité
      submittedAt: new Date()
    };

    onSubmit(task, submissionData);
  };

  const resetForm = () => {
    setComment('');
    setSelectedFile(null);
    setPreview(null);
    setFileType(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <p className="opacity-90">
                {task.title} • Récompense: +{task.difficulty === 'expert' ? '100' : 
                  task.difficulty === 'hard' ? '50' : 
                  task.difficulty === 'easy' ? '10' : '25'} XP
              </p>
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
            {/* Info importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trophy className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Validation par administrateur</h3>
                  <p className="text-blue-800 text-sm mt-1">
                    Cette tâche sera examinée par un administrateur avant d'attribuer les XP. 
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

            {/* ✅ UPLOAD PHOTO OU VIDÉO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Photo ou vidéo de preuve (optionnel mais recommandé)
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="media-upload"
                />
                
                {preview ? (
                  <div className="space-y-3">
                    {/* Prévisualisation */}
                    {fileType === 'video' ? (
                      <div className="relative">
                        <video 
                          src={preview} 
                          className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                          controls
                          preload="metadata"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>Vidéo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img 
                          src={preview} 
                          alt="Prévisualisation" 
                          className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          <span>Image</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Infos fichier */}
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        {fileType === 'video' ? 'Vidéo' : 'Photo'} prête à envoyer
                      </span>
                    </div>
                    
                    {/* Taille du fichier */}
                    <div className="text-xs text-gray-600">
                      📁 {selectedFile.name} • {formatFileSize(selectedFile.size)}
                    </div>
                    
                    <label 
                      htmlFor="media-upload" 
                      className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Changer le fichier
                    </label>
                  </div>
                ) : (
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <Camera className="w-8 h-8 text-gray-400" />
                        <Video className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Cliquez pour ajouter une photo ou vidéo de votre travail
                      </p>
                      <p className="text-xs text-gray-500">
                        Images : JPG, PNG, GIF, WEBP<br/>
                        Vidéos : MP4, MOV, AVI, WEBM<br/>
                        ✨ Aucune limite de taille !
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
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>
                      {fileType === 'video' ? 'Vidéo de preuve' : 'Photo de preuve'} ajoutée 
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                )}
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
                  <span>Upload en cours...</span>
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
