// ==========================================
// 📁 react-app/src/components/tasks/TaskSubmissionModal.jsx
// MODAL COMPLET DE SOUMISSION AVEC COMMENTAIRE ET PHOTO
// ==========================================

import React, { useState, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Camera, 
  Upload, 
  FileImage,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

/**
 * 🎯 MODAL COMPLET DE SOUMISSION DE TÂCHE
 */
const TaskSubmissionModal = ({ 
  task, 
  onSubmit, 
  onCancel, 
  submitting = false 
}) => {
  // États du formulaire
  const [comment, setComment] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Référence pour l'input file
  const fileInputRef = useRef(null);

  // Gérer la sélection de photo
  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setErrors({ photo: 'Seules les images sont autorisées' });
      return;
    }
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ photo: 'La photo doit faire moins de 5MB' });
      return;
    }
    
    // Créer l'aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setPhotoFile(file);
    setErrors({ ...errors, photo: null });
  };

  // Retirer la photo
  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Gérer la soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    const newErrors = {};
    
    if (!comment.trim() && !photoFile) {
      newErrors.general = 'Ajoutez au moins un commentaire ou une photo pour prouver la réalisation';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Données de soumission
    const submissionData = {
      comment: comment.trim(),
      photoFile: photoFile,
      submittedAt: new Date().toISOString()
    };
    
    onSubmit(task, submissionData);
  };

  // Obtenir l'XP de la tâche selon difficulté
  const getTaskXP = () => {
    switch (task.difficulty) {
      case 'easy': return 10;
      case 'normal': return 25;
      case 'hard': return 50;
      case 'expert': return 100;
      default: return 25;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Soumettre la tâche</h3>
            <p className="text-sm text-gray-600 mt-1">
              "{task.title}" • {getTaskXP()} XP en attente
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Message d'erreur général */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Action requise</h4>
                <p className="text-red-700 text-sm mt-1">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Commentaire */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4" />
              Commentaire de réalisation
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              placeholder="Décrivez comment vous avez réalisé cette tâche, les difficultés rencontrées, le temps passé..."
              rows="4"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce commentaire aidera l'administrateur à valider votre travail
            </p>
          </div>

          {/* Upload photo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Camera className="w-4 h-4" />
              Photo de preuve (optionnel)
            </label>
            
            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Cliquez pour ajouter une photo</p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG ou GIF • Max 5MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Aperçu"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={submitting}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {(photoFile?.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            )}
            
            {errors.photo && (
              <p className="text-red-600 text-sm mt-1">{errors.photo}</p>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              disabled={submitting}
              className="hidden"
            />
          </div>

          {/* Informations sur la validation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Processus de validation</h4>
                <div className="text-blue-800 text-sm mt-1 space-y-1">
                  <p>• Votre soumission sera examinée par un administrateur</p>
                  <p>• Vous recevrez {getTaskXP()} XP si la tâche est validée</p>
                  <p>• En cas de rejet, vous pourrez resoummettre avec corrections</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Soumission...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Soumettre pour validation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskSubmissionModal;
