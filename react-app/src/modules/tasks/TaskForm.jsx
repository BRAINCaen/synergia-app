// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE TÂCHE CORRIGÉ AVEC CATÉGORIES
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Flag, 
  Star, 
  Clock, 
  Target, 
  Save,
  AlertCircle,
  Loader
} from 'lucide-react';

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE CORRIGÉ
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = [], // ✅ AJOUT : Liste des catégories reçue en prop
  teamMembers = [] // ✅ AJOUT : Liste des membres pour assignation
}) => {
  // 🔧 ÉTATS DU FORMULAIRE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    complexity: 'medium',
    estimatedHours: 1,
    dueDate: '',
    assignedTo: [],
    tags: [],
    xpReward: 25
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ CHARGER LES DONNÉES INITIALES (POUR ÉDITION)
  useEffect(() => {
    if (initialData) {
      console.log('📝 Chargement données pour édition:', initialData);
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        priority: initialData.priority || 'medium',
        complexity: initialData.complexity || 'medium',
        estimatedHours: initialData.estimatedHours || 1,
        dueDate: initialData.dueDate || '',
        assignedTo: Array.isArray(initialData.assignedTo) ? initialData.assignedTo : [],
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        xpReward: initialData.xpReward || 25
      });
    } else {
      // Reset pour nouvelle tâche
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        complexity: 'medium',
        estimatedHours: 1,
        dueDate: '',
        assignedTo: [],
        tags: [],
        xpReward: 25
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // ✅ CALCUL AUTOMATIQUE DES XP SELON LA COMPLEXITÉ
  useEffect(() => {
    const baseXP = {
      easy: 15,
      medium: 25,
      hard: 40,
      expert: 60
    };
    
    const newXP = baseXP[formData.complexity] || 25;
    if (formData.xpReward !== newXP && !initialData) {
      setFormData(prev => ({ ...prev, xpReward: newXP }));
    }
  }, [formData.complexity, initialData]);

  /**
   * ✅ VALIDATION DU FORMULAIRE
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.category) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 40) {
      newErrors.estimatedHours = 'La durée doit être entre 0.5 et 40 heures';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 📤 SOUMISSION DU FORMULAIRE
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Validation formulaire échouée:', errors);
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('📤 Soumission TaskForm:', formData);
      
      // Préparer les données à soumettre
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        estimatedHours: parseFloat(formData.estimatedHours),
        xpReward: parseInt(formData.xpReward),
        // Si édition, conserver l'ID
        ...(initialData && { id: initialData.id })
      };

      await onSubmit(taskData);
      console.log('✅ Tâche soumise avec succès');
      
      // Reset et fermeture
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 'medium',
          complexity: 'medium',
          estimatedHours: 1,
          dueDate: '',
          assignedTo: [],
          tags: [],
          xpReward: 25
        });
      }
      
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setErrors({ submit: error.message || 'Erreur lors de la soumission' });
    } finally {
      setSubmitting(false);
    }
  };

  // ❌ Si modal fermée, ne rien afficher
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errors.submit}</span>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la tâche *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Ex: Développer la page d'accueil"
              disabled={submitting}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez les détails de la tâche..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
              disabled={submitting}
            />
          </div>

          {/* Priorité et Complexité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Flag className="inline w-4 h-4 mr-1" />
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Haute</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Complexité
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="easy">😊 Facile (15 XP base)</option>
                <option value="medium">🤔 Moyenne (25 XP base)</option>
                <option value="hard">😰 Difficile (40 XP base)</option>
                <option value="expert">🤯 Expert (60 XP base)</option>
              </select>
            </div>
          </div>

          {/* Date d'échéance et Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={submitting}
              >
                <option value="">Sélectionner une catégorie</option>
                {/* ✅ CORRECTION : Utiliser les catégories reçues en prop */}
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon ? `${category.icon} ` : ''}{category.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              
              {/* Info si aucune catégorie */}
              {categories.length === 0 && (
                <p className="text-yellow-400 text-sm mt-1">
                  ⚠️ Aucune catégorie disponible - chargement en cours...
                </p>
              )}
            </div>
          </div>

          {/* Durée estimée et XP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Durée estimée (heures)
              </label>
              <input
                type="number"
                min="0.5"
                max="40"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-600'
                }`}
                disabled={submitting}
              />
              {errors.estimatedHours && <p className="text-red-400 text-sm mt-1">{errors.estimatedHours}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Récompense XP
              </label>
              <input
                type="number"
                min="5"
                max="500"
                value={formData.xpReward}
                onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 25 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              />
              <p className="text-gray-400 text-xs mt-1">
                Suggestion basée sur la complexité : {formData.complexity === 'easy' ? '15' : formData.complexity === 'medium' ? '25' : formData.complexity === 'hard' ? '40' : '60'} XP
              </p>
            </div>
          </div>

          {/* Assignation (si membres disponibles) */}
          {teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Assigner à (optionnel)
              </label>
              <select
                value={formData.assignedTo[0] || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  assignedTo: e.target.value ? [e.target.value] : [] 
                }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="">Non assignée</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.displayName || member.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={submitting || !formData.title.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData ? 'Mettre à jour' : 'Créer la tâche'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
