// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// CORRECTION URGENTE - BOUTON CRÉER QUI NE FONCTIONNE PAS
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
 * 📝 MODAL DE CRÉATION DE TÂCHES - CORRECTION BOUTON
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
    setError(''); // Reset error lors de l'ouverture
  }, [initialData, isOpen]);

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
    console.log('📝 [MODAL] Event:', e?.type);
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
      console.log('📝 [MODAL] 🚀 Début création tâche...');
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
        assignedTo: [], // Vide par défaut
        
        // Champs optionnels
        projectId: formData.projectId || null,
        attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
        
        // Métadonnées automatiques
        createdBy: user.uid, // OBLIGATOIRE pour éviter l'erreur
        creatorName: user.displayName || user.email || 'Utilisateur',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('📝 [MODAL] 📋 Données nettoyées pour création:', cleanedData);
      
      // ✅ APPEL SERVICE SÉCURISÉ
      console.log('📝 [MODAL] 🔧 Appel createTaskSafely...');
      const result = await createTaskSafely(cleanedData, user);
      
      console.log('📝 [MODAL] 📊 Résultat création:', result);
      
      if (result && result.success) {
        console.log('📝 [MODAL] ✅ Tâche créée avec succès!');
        console.log('📝 [MODAL] ID tâche:', result.id || result.taskId);
        
        // Notification de succès
        if (onSuccess) {
          console.log('📝 [MODAL] 📢 Appel callback onSuccess...');
          onSuccess(result.task || result);
        }
        
        // Fermer le modal
        console.log('📝 [MODAL] 🚪 Fermeture modal...');
        handleClose();
        
        // Notification utilisateur
        if (window.showNotification) {
          window.showNotification('Tâche créée avec succès !', 'success');
        }
        
      } else {
        // Erreur retournée par le service
        const errorMsg = result?.message || result?.error || 'Erreur lors de la création';
        console.error('📝 [MODAL] ❌ Erreur service:', errorMsg);
        setError(errorMsg);
      }
      
    } catch (error) {
      // Erreur d'exécution
      console.error('📝 [MODAL] ❌ Exception pendant création:', error);
      console.error('📝 [MODAL] Stack trace:', error.stack);
      
      let errorMessage = 'Erreur technique lors de la création';
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      setError(errorMessage);
    } finally {
      // Toujours arrêter le loading
      console.log('📝 [MODAL] 🏁 Fin soumission');
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
          // Fermer si clic sur le backdrop
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
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === 'edit' ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                </h2>
                <p className="text-sm text-gray-600">
                  Remplissez les informations ci-dessous
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notification d'erreur */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Erreur</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Titre (obligatoire) */}
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
                  placeholder="Ex: Développer la page d'accueil"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez les détails de cette tâche..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Ligne 1: Priorité et Difficulté */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="easy">Facile</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difficile</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Ligne 2: Catégorie et XP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="general">Général</option>
                    <option value="development">Développement</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="business">Business</option>
                    <option value="research">Recherche</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    name="xpReward"
                    value={formData.xpReward}
                    onChange={handleInputChange}
                    placeholder="25"
                    min="0"
                    max="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Ligne 3: Durée et Échéance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée estimée (heures)
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                          disabled={loading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                  <span className="text-sm text-gray-700">Ouvrir aux volontaires</span>
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
                  <span className="text-sm text-gray-700">Tâche récurrente</span>
                </label>
              </div>
            </form>
          </div>

          {/* Footer avec actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {user ? `Créée par: ${user.displayName || user.email}` : 'Utilisateur non connecté'}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
              
              {/* 🚨 BOUTON CORRIGÉ - AVEC GESTIONNAIRE onClick EXPLICITE */}
              <button
                type="button"
                onClick={(e) => {
                  console.log('📝 [MODAL] 🔘 CLIC BOUTON CRÉER!');
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
                    {mode === 'edit' ? 'Modifier' : 'Créer la tâche'}
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
