// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// MODAL CRÉATION/ÉDITION TÂCHES - AVEC MODIFICATION DE SOUMISSION
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Save, 
  Calendar, 
  Tag, 
  User, 
  AlertTriangle,
  Clock,
  Trophy,
  Paperclip,
  CheckCircle,
  Edit,
  Upload,
  Camera,
  Video,
  Loader,
  Send,
  FileImage,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { createTaskSafely } from '../../core/services/taskCreationFix.js';
// Import Firebase pour la soumission
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 📝 MODAL DE CRÉATION/ÉDITION DE TÂCHES AVEC MODIFICATION DE SOUMISSION
 */
const NewTaskModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData = null,
  mode = 'create' // 'create' ou 'edit'
}) => {
  const { user } = useAuthStore();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    status: 'todo',
    dueDate: '',
    estimatedHours: '',
    xpReward: '',
    difficulty: 'normal',
    tags: [],
    openToVolunteers: false,
    isRecurring: false,
    projectId: '',
    attachments: []
  });
  
  // États UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  // États pour la modification de soumission
  const [showSubmissionEdit, setShowSubmissionEdit] = useState(false);
  const [submissionComment, setSubmissionComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ DÉTECTER SI L'UTILISATEUR PEUT MODIFIER SA SOUMISSION
  const canEditSubmission = () => {
    return mode === 'edit' && 
           initialData && 
           initialData.status === 'validation_pending' &&
           (initialData.submittedBy === user?.uid || initialData.assignedTo?.includes(user?.uid));
  };

  // ✅ FIX PRÉ-REMPLISSAGE POUR L'ÉDITION
  useEffect(() => {
    console.log('📝 [MODAL] useEffect initialData:', { initialData, mode, isOpen });
    
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        // 🔧 MODE ÉDITION : PRÉ-REMPLIR AVEC LES DONNÉES DE LA TÂCHE
        console.log('📝 [MODAL] Mode édition - pré-remplissage avec:', initialData);
        
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'medium',
          category: initialData.category || 'general',
          status: initialData.status || 'todo',
          dueDate: initialData.dueDate ? (
            typeof initialData.dueDate === 'string' ? initialData.dueDate : 
            initialData.dueDate.toISOString ? initialData.dueDate.toISOString().split('T')[0] :
            initialData.dueDate.seconds ? new Date(initialData.dueDate.seconds * 1000).toISOString().split('T')[0] :
            ''
          ) : '',
          estimatedHours: initialData.estimatedHours || initialData.estimatedTime || '',
          xpReward: initialData.xpReward || '',
          difficulty: initialData.difficulty || 'normal',
          tags: Array.isArray(initialData.tags) ? [...initialData.tags] : [],
          openToVolunteers: Boolean(initialData.openToVolunteers),
          isRecurring: Boolean(initialData.isRecurring),
          projectId: initialData.projectId || '',
          attachments: Array.isArray(initialData.attachments) ? [...initialData.attachments] : []
        });

        // ✅ PRÉ-REMPLIR LES DONNÉES DE SOUMISSION SI DISPONIBLES
        if (canEditSubmission()) {
          setSubmissionComment(initialData.submissionNotes || initialData.description || '');
          setShowSubmissionEdit(true);
          
          // Si il y a déjà une photo/vidéo, l'afficher
          if (initialData.photoUrl) {
            setFilePreview(initialData.photoUrl);
            setFileType('image');
          } else if (initialData.videoUrl) {
            setFilePreview(initialData.videoUrl);
            setFileType('video');
          }
        }
        
        console.log('📝 [MODAL] Formulaire pré-rempli pour édition');
        
      } else {
        // 🆕 MODE CRÉATION : FORMULAIRE VIDE
        console.log('📝 [MODAL] Mode création - formulaire vide');
        
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          category: 'general',
          status: 'todo',
          dueDate: '',
          estimatedHours: '',
          xpReward: '',
          difficulty: 'normal',
          tags: [],
          openToVolunteers: false,
          isRecurring: false,
          projectId: '',
          attachments: []
        });
      }
      
      // Reset error lors de l'ouverture
      setError('');
    }
  }, [initialData, mode, isOpen]);

  // 📎 Gestion de sélection de fichier pour la soumission
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

  // 📤 Mettre à jour la soumission
  const handleUpdateSubmission = async () => {
    if (!initialData?.id) {
      setError('ID de tâche manquant');
      return;
    }

    setSubmissionLoading(true);
    setError('');

    try {
      console.log('📤 [SUBMISSION] Mise à jour soumission:', {
        taskId: initialData.id,
        hasFile: !!selectedFile,
        comment: submissionComment
      });

      // Préparer les données à mettre à jour
      const updateData = {
        submissionNotes: submissionComment.trim(),
        updatedAt: serverTimestamp(),
        submissionUpdatedAt: serverTimestamp()
      };

      // TODO: Implémenter l'upload de fichier si nécessaire
      if (selectedFile) {
        // Pour l'instant, simuler l'upload
        if (fileType === 'image') {
          updateData.photoUrl = 'uploaded_photo_url';
          updateData.videoUrl = null; // Supprimer l'ancienne vidéo
        } else {
          updateData.videoUrl = 'uploaded_video_url';
          updateData.photoUrl = null; // Supprimer l'ancienne photo
        }
        
        console.log('📷 [SUBMISSION] Fichier à uploader:', selectedFile.name);
      }

      // Mettre à jour la tâche dans Firebase
      await updateDoc(doc(db, 'tasks', initialData.id), updateData);

      console.log('✅ [SUBMISSION] Soumission mise à jour avec succès');
      
      // Notifier le parent
      if (onSuccess) {
        onSuccess({ 
          ...initialData, 
          ...updateData,
          submissionUpdated: true 
        });
      }

      // Fermer le modal
      handleClose();

      // Notification
      if (window.showNotification) {
        window.showNotification('✅ Soumission mise à jour avec succès !', 'success');
      }

    } catch (error) {
      console.error('❌ [SUBMISSION] Erreur mise à jour soumission:', error);
      setError('Erreur lors de la mise à jour: ' + error.message);
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Gestionnaire de changement de champ
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('📝 [MODAL] Changement champ:', { name, value, type, checked });
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error && name === 'title' && value.trim()) {
      setError('');
    }
  };

  // Gestionnaire ajout de tag
  const handleAddTag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Gestionnaire suppression de tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Gestionnaire de fermeture
  const handleClose = () => {
    console.log('📝 [MODAL] Fermeture modal');
    setError('');
    setLoading(false);
    setShowSubmissionEdit(false);
    setSubmissionComment('');
    setSelectedFile(null);
    setFilePreview(null);
    setFileType('');
    onClose();
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('Le titre est obligatoire');
    }
    
    if (formData.title.length > 100) {
      errors.push('Le titre ne peut pas dépasser 100 caractères');
    }
    
    if (formData.xpReward && (isNaN(formData.xpReward) || formData.xpReward < 0)) {
      errors.push('La récompense XP doit être un nombre positif');
    }
    
    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours < 0)) {
      errors.push('Les heures estimées doivent être un nombre positif');
    }
    
    return errors;
  };

  // 🔧 GESTIONNAIRE DE SOUMISSION CORRIGÉ
  const handleSubmit = async (e) => {
    // Empêcher comportements par défaut
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('📝 [MODAL] *** DÉBUT SOUMISSION ***');
    console.log('📝 [MODAL] Mode:', mode);
    console.log('📝 [MODAL] Loading state:', loading);
    console.log('📝 [MODAL] Form data:', formData);
    
    // Vérifier si déjà en cours
    if (loading) {
      console.log('📝 [MODAL] ⚠️ Soumission déjà en cours, abandon');
      return;
    }
    
    // Validation immédiate
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join(', ');
      console.error('📝 [MODAL] ❌ Erreurs validation:', errorMsg);
      setError(errorMsg);
      return;
    }
    
    // Vérifier l'utilisateur
    if (!user || !user.uid) {
      const errorMsg = 'Utilisateur non connecté. Veuillez vous reconnecter.';
      console.error('📝 [MODAL] ❌ Pas d\'utilisateur:', errorMsg);
      setError(errorMsg);
      return;
    }
    
    // Commencer le loading
    setLoading(true);
    setError('');
    
    try {
      console.log('📝 [MODAL] 🚀 Début traitement...');
      console.log('📝 [MODAL] User ID:', user.uid);
      console.log('📝 [MODAL] User email:', user.email);
      
      // Préparer les données nettoyées avec TOUS les champs requis
      const cleanedData = {
        // Champs obligatoires
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority || 'medium',
        category: formData.category || 'general',
        status: formData.status || 'todo',
        difficulty: formData.difficulty || 'normal',
        
        // Champs numériques avec validation
        xpReward: formData.xpReward ? parseInt(formData.xpReward, 10) : 25,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : 1,
        
        // Champs de date
        dueDate: formData.dueDate || null,
        
        // Champs booléens
        openToVolunteers: Boolean(formData.openToVolunteers),
        isRecurring: Boolean(formData.isRecurring),
        
        // Tableaux sécurisés
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        assignedTo: initialData?.assignedTo || [], // Préserver assignés en mode édition
        
        // Champs optionnels
        projectId: formData.projectId || null,
        attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
        
        // Métadonnées automatiques
        createdBy: initialData?.createdBy || user.uid, // Préserver créateur original en mode édition
        creatorName: initialData?.creatorName || user.displayName || user.email || 'Utilisateur',
        updatedAt: new Date()
      };

      // ✅ MODE ÉDITION VS CRÉATION
      if (mode === 'edit' && initialData?.id) {
        // MODE ÉDITION : Préserver l'ID et la date de création
        cleanedData.id = initialData.id;
        cleanedData.createdAt = initialData.createdAt;
        
        console.log('📝 [MODAL] 📝 Mode édition - données préparées:', cleanedData);
        
        // TODO: Implémenter updateTaskSafely ou utiliser le service existant
        // Pour l'instant, utiliser createTaskSafely avec l'ID pour la mise à jour
        const result = await createTaskSafely(cleanedData, user);
        
        if (result && result.success) {
          console.log('📝 [MODAL] ✅ Tâche modifiée avec succès!');
          
          if (onSuccess) {
            onSuccess(result.task || result);
          }
          
          handleClose();
          
          if (window.showNotification) {
            window.showNotification('Tâche modifiée avec succès !', 'success');
          }
        } else {
          const errorMsg = result?.message || result?.error || 'Erreur lors de la modification';
          console.error('📝 [MODAL] ❌ Erreur modification:', errorMsg);
          setError(errorMsg);
        }
        
      } else {
        // MODE CRÉATION
        cleanedData.createdAt = new Date();
        
        console.log('📝 [MODAL] 📋 Mode création - données préparées:', cleanedData);
        
        const result = await createTaskSafely(cleanedData, user);
        
        if (result && result.success) {
          console.log('📝 [MODAL] ✅ Tâche créée avec succès!');
          console.log('📝 [MODAL] ID tâche:', result.id || result.taskId);
          
          if (onSuccess) {
            console.log('📝 [MODAL] 📢 Appel callback onSuccess...');
            onSuccess(result.task || result);
          }
          
          handleClose();
          
          if (window.showNotification) {
            window.showNotification('Tâche créée avec succès !', 'success');
          }
          
        } else {
          const errorMsg = result?.message || result?.error || 'Erreur lors de la création';
          console.error('📝 [MODAL] ❌ Erreur création:', errorMsg);
          setError(errorMsg);
        }
      }
      
    } catch (error) {
      console.error('📝 [MODAL] ❌ Exception pendant traitement:', error);
      console.error('📝 [MODAL] Stack trace:', error.stack);
      
      let errorMessage = `Erreur technique lors de la ${mode === 'edit' ? 'modification' : 'création'}`;
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      setError(errorMessage);
    } finally {
      console.log('📝 [MODAL] 🏁 Fin traitement');
      setLoading(false);
    }
  };

  // Gestionnaire Enter sur les champs
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Ne pas render si pas ouvert
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {mode === 'edit' ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === 'edit' ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                </h2>
                <p className="text-sm text-gray-600">
                  {mode === 'edit' ? 'Modifiez les informations de la tâche' : 'Remplissez les informations ci-dessous'}
                </p>
                {canEditSubmission() && (
                  <p className="text-sm text-orange-600 font-medium">
                    🔄 Cette tâche est en validation - vous pouvez modifier votre soumission
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Body scrollable */}
          <div className="overflow-y-auto max-h-[60vh] p-6">
            
            {/* ✅ SECTION MODIFICATION DE SOUMISSION */}
            {canEditSubmission() && (
              <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Send className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">Modifier ma soumission</h3>
                </div>

                <div className="space-y-4">
                  {/* Commentaire de soumission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire de soumission
                    </label>
                    <textarea
                      value={submissionComment}
                      onChange={(e) => setSubmissionComment(e.target.value)}
                      placeholder="Décrivez ce que vous avez fait pour accomplir cette tâche..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      disabled={submissionLoading}
                    />
                  </div>

                  {/* Upload de fichier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo/Vidéo de preuve
                    </label>
                    
                    {!selectedFile && !filePreview ? (
                      <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-2">
                            <Camera className="w-6 h-6 text-orange-400" />
                            <Video className="w-6 h-6 text-orange-400" />
                          </div>
                          <p className="text-orange-600 text-sm">Choisir une nouvelle photo/vidéo</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={submissionLoading}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={submissionLoading}
                            className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                          >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Choisir un fichier
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-orange-300 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-orange-700">
                            {fileType === 'image' ? '📷' : '🎥'} {selectedFile?.name || 'Média existant'}
                          </span>
                          <button
                            type="button"
                            onClick={handleFileRemove}
                            disabled={submissionLoading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {filePreview && fileType === 'image' && (
                          <img 
                            src={filePreview} 
                            alt="Aperçu" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        
                        {filePreview && fileType === 'video' && (
                          <video 
                            src={filePreview} 
                            controls 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bouton mise à jour soumission */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleUpdateSubmission}
                      disabled={submissionLoading || !submissionComment.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      {submissionLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Mettre à jour ma soumission
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Informations de base */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Informations de base
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Décrivez précisément ce qui doit être fait..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description détaillée *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez précisément ce qui doit être fait, les étapes, les ressources requises..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Ligne priorité et difficulté */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priorité
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="low">🟢 Faible</option>
                      <option value="medium">🟡 Moyenne</option>
                      <option value="high">🟠 Élevée</option>
                      <option value="urgent">🔴 Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulté
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="easy">🟢 Facile (10 XP)</option>
                      <option value="normal">🔵 Normal (25 XP)</option>
                      <option value="hard">🟠 Difficile (50 XP)</option>
                      <option value="expert">🔴 Expert (100 XP)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Paramètres optionnels */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Paramètres optionnels
                </div>

                {/* Ligne date et temps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Temps estimé (heures)
                    </label>
                    <input
                      type="number"
                      name="estimatedHours"
                      value={formData.estimatedHours}
                      onChange={handleInputChange}
                      placeholder="Ex: 2.5"
                      step="0.5"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          disabled={loading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Ajouter un tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="openToVolunteers"
                      checked={formData.openToVolunteers}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">
                      <User className="w-4 h-4 inline mr-1" />
                      Ouverte aux volontaires
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">
                      <RotateCcw className="w-4 h-4 inline mr-1" />
                      Tâche récurrente
                    </span>
                  </label>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {mode === 'edit' ? 'Les modifications seront sauvegardées' : 'Une nouvelle tâche sera créée'}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {mode === 'edit' ? 'Modifier' : 'Créer'} la tâche
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewTaskModal;
