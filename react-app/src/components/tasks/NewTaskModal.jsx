// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// MODAL CRÉATION TÂCHES CORRIGÉE - FIX CREATEDBY UNDEFINED
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
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { createTaskSafely } from '../../core/services/taskCreationFix.js';

/**
 * 📝 MODAL DE CRÉATION DE TÂCHES CORRIGÉE
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

  // Remplir les données initiales
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tags: Array.isArray(initialData.tags) ? initialData.tags : []
      }));
    } else {
      // Réinitialiser pour une nouvelle tâche
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
  }, [initialData, isOpen]);

  // Gestionnaire de changement de champ
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestionnaire ajout de tag
  const handleAddTag = () => {
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

  // Gestionnaire de soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    // Vérifier l'utilisateur
    if (!user || !user.uid) {
      setError('Utilisateur non connecté. Veuillez vous reconnecter.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('📝 [NEW_TASK_MODAL] Soumission formulaire...');
      console.log('📝 [NEW_TASK_MODAL] Données formulaire:', formData);
      console.log('📝 [NEW_TASK_MODAL] Utilisateur:', user.uid);
      
      // Préparer les données nettoyées
      const cleanedData = {
        // Champs obligatoires
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
        status: formData.status,
        difficulty: formData.difficulty,
        
        // Champs numériques
        xpReward: formData.xpReward ? parseInt(formData.xpReward) : 0,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        
        // Champs de date
        dueDate: formData.dueDate || null,
        
        // Champs booléens
        openToVolunteers: Boolean(formData.openToVolunteers),
        isRecurring: Boolean(formData.isRecurring),
        
        // Tableaux
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        assignedTo: [], // Vide par défaut, sera assigné après
        
        // Champs optionnels
        projectId: formData.projectId || null,
        attachments: Array.isArray(formData.attachments) ? formData.attachments : []
      };
      
      console.log('📝 [NEW_TASK_MODAL] Données nettoyées:', cleanedData);
      
      // ✅ UTILISER LE SERVICE CORRIGÉ
      const result = await createTaskSafely(cleanedData, user);
      
      if (result.success) {
        console.log('✅ [NEW_TASK_MODAL] Tâche créée avec succès:', result.id);
        
        // Notifier le parent
        if (onSuccess) {
          onSuccess(result.task);
        }
        
        // Fermer le modal
        onClose();
        
        // Réinitialiser le formulaire
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
        
      } else {
        console.error('❌ [NEW_TASK_MODAL] Erreur création:', result.error);
        setError(result.message || 'Erreur lors de la création');
      }
      
    } catch (error) {
      console.error('❌ [NEW_TASK_MODAL] Erreur soumission:', error);
      setError(`Erreur lors de la ${mode === 'edit' ? 'modification' : 'création'}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fermer le modal
  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === 'edit' ? 'Modifier la tâche' : 'Nouvelle tâche'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Erreur */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Erreur</span>
                  </div>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              )}

              {/* Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Nom de la tâche..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  maxLength={100}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Décrivez les détails de la tâche..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Grille de paramètres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Priorité */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                  </select>
                </div>

                {/* Catégorie */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="general">Général</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reputation">Réputation</option>
                    <option value="stock">Gestion Stock</option>
                    <option value="communication">Communication</option>
                    <option value="formation">Formation</option>
                  </select>
                </div>

                {/* Difficulté */}
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="easy">Facile</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difficile</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Récompense XP */}
                <div>
                  <label htmlFor="xpReward" className="block text-sm font-medium text-gray-700 mb-2">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    id="xpReward"
                    name="xpReward"
                    value={formData.xpReward}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Date d'échéance */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                {/* Heures estimées */}
                <div>
                  <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Heures estimées
                  </label>
                  <input
                    type="number"
                    id="estimatedHours"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    disabled={loading}
                    placeholder="0"
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading}
                        className="w-4 h-4 text-blue-500 hover:text-blue-700 disabled:opacity-50"
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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    disabled={loading}
                    placeholder="Ajouter un tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={loading || !tagInput.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
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
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="openToVolunteers" className="text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 inline mr-1" />
                    Ouverte aux volontaires
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    Tâche récurrente
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {user ? `Créée par: ${user.displayName || user.email}` : 'Utilisateur non connecté'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {mode === 'edit' ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mode === 'edit' ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewTaskModal;

console.log('📝 NewTaskModal corrigé - Fix createdBy undefined');
