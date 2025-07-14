// ==========================================
// 📁 react-app/src/components/forms/ProjectForm.jsx
// Modal complète pour créer/éditer des projets
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Target, AlertCircle, Upload, Tag, Flag, FileText } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

const ProjectForm = ({ 
  isOpen, 
  onClose, 
  project = null, 
  onSave,
  loading = false 
}) => {
  const { user } = useAuthStore();

  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    category: '',
    startDate: '',
    endDate: '',
    estimatedHours: '',
    tags: [],
    budget: ''
  });

  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');

  // Options pour les sélects
  const statusOptions = [
    { value: 'active', label: 'Actif', color: 'bg-blue-500' },
    { value: 'on_hold', label: 'En pause', color: 'bg-yellow-500' },
    { value: 'completed', label: 'Terminé', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Annulé', color: 'bg-red-500' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Basse', color: 'text-green-400' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-400' },
    { value: 'high', label: 'Haute', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-400' }
  ];

  const categoryOptions = [
    { value: 'web', label: 'Développement Web' },
    { value: 'mobile', label: 'Application Mobile' },
    { value: 'design', label: 'Design & UX' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'research', label: 'Recherche & Développement' },
    { value: 'internal', label: 'Projet Interne' },
    { value: 'client', label: 'Projet Client' },
    { value: 'other', label: 'Autre' }
  ];

  // Initialiser le formulaire quand le projet change
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'active',
        priority: project.priority || 'medium',
        category: project.category || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        estimatedHours: project.estimatedHours || '',
        tags: project.tags || [],
        budget: project.budget || ''
      });
    } else {
      // Réinitialiser pour un nouveau projet
      setFormData({
        title: '',
        description: '',
        status: 'active',
        priority: 'medium',
        category: '',
        startDate: '',
        endDate: '',
        estimatedHours: '',
        tags: [],
        budget: ''
      });
    }
    setErrors({});
  }, [project, user?.uid]);

  // Gestion des changements d'input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Gestion des tags
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'La date de fin doit être après la date de début';
      }
    }

    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours <= 0)) {
      newErrors.estimatedHours = 'Les heures estimées doivent être un nombre positif';
    }

    if (formData.budget && (isNaN(formData.budget) || formData.budget < 0)) {
      newErrors.budget = 'Le budget doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        updatedAt: new Date()
      };

      await onSave(projectData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet:', error);
      setErrors({ submit: 'Une erreur est survenue lors de la sauvegarde' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header du modal */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {project ? 'Modifier le projet' : 'Nouveau projet'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Titre */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Titre du projet *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Ex: Refonte du site web"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Décrivez les objectifs et la portée du projet..."
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Flag className="w-4 h-4 inline mr-2" />
                Priorité
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de début
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Date de fin
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
            </div>

            {/* Heures estimées */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heures estimées
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ex: 40"
              />
              {errors.estimatedHours && <p className="text-red-400 text-sm mt-1">{errors.estimatedHours}</p>}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Budget (€)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.budget ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ex: 15000"
              />
              {errors.budget && <p className="text-red-400 text-sm mt-1">{errors.budget}</p>}
            </div>

            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajouter un tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Ajouter
                </button>
              </div>
              
              {/* Liste des tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-blue-700 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Sauvegarde...' : project ? 'Mettre à jour' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
