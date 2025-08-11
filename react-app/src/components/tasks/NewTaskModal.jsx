// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// MODAL CRÉATION/ÉDITION TÂCHES - FIX PRÉ-REMPLISSAGE COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
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
  Edit
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { createTaskSafely } from '../../core/services/taskCreationFix.js';

/**
 * 📝 MODAL DE CRÉATION/ÉDITION DE TÂCHES AVEC PRÉ-REMPLISSAGE
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
                    placeholder="Décrivez précisément le qui doit être fait, les étapes, les ressources requises..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Configuration
                </div>

                {/* Ligne 1: Difficulté et Priorité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulté *
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="easy">Facile (5-15 XP) - Tâche standard, 1-2h</option>
                      <option value="medium">Moyenne (20-40 XP) - Tâche complexe, 2-4h</option>
                      <option value="hard">Difficile (50-80 XP) - Tâche avancée, 4-8h</option>
                      <option value="expert">Expert (100+ XP) - Tâche experte, 8h+</option>
                    </select>
                  </div>

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
                      <option value="low">🟢 Basse - Peut attendre</option>
                      <option value="medium">🟡 Moyenne - À faire bientôt</option>
                      <option value="high">🟠 Haute - Important</option>
                      <option value="urgent">🔴 Urgente - À faire immédiatement</option>
                    </select>
                  </div>
                </div>

                {/* Ligne 2: XP et Temps estimé */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Récompense XP
                    </label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                      <input
                        type="number"
                        name="xpReward"
                        value={formData.xpReward}
                        onChange={handleInputChange}
                        placeholder="25"
                        min="1"
                        max="500"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      XP calculé automatiquement selon la difficulté
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temps estimé (heures)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                      <input
                        type="number"
                        name="estimatedHours"
                        value={formData.estimatedHours}
                        onChange={handleInputChange}
                        placeholder="1"
                        min="0.25"
                        max="40"
                        step="0.25"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Date d'échéance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag(e);
                            }
                          }}
                          placeholder="Ajouter un tag..."
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        disabled={loading || !tagInput.trim()}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Liste des tags */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-purple-900"
                              disabled={loading}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="openToVolunteers"
                      name="openToVolunteers"
                      checked={formData.openToVolunteers}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <label htmlFor="openToVolunteers" className="text-sm text-gray-700">
                      🤝 Ouverte aux volontaires (autres membres peuvent se proposer)
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <label htmlFor="isRecurring" className="text-sm text-gray-700">
                      🔄 Tâche récurrente (se répète automatiquement)
                    </label>
                  </div>
                </div>
              </div>

              {/* Messages d'erreur */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Erreur</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={loading || !formData.title.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === 'edit' ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === 'edit' ? 'Modifier la tâche' : 'Créer la tâche'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewTaskModal;
