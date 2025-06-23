// ==========================================
// 📁 react-app/src/modules/projects/ProjectForm.jsx
// Formulaire de création/édition de projets
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, FileText, Target, Clock } from 'lucide-react';

// 🔧 CORRECTION : Imports avec chemins corrects
import { useProjectStore } from '../../shared/stores/projectStore';
import { useAuthStore } from '../../shared/stores/authStore';
import dateUtils from '../../shared/utils/dateUtils';

const ProjectForm = ({ project, onClose, onSave }) => {
  const { createProject, updateProject, creating, updating } = useProjectStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    expectedDuration: '',
    category: ''
  });
  
  const [errors, setErrors] = useState({});

  // Initialiser le formulaire
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'active',
        priority: project.priority || 'medium',
        startDate: project.startDate ? dateUtils.formatForInput(project.startDate) : '',
        dueDate: project.dueDate ? dateUtils.formatForInput(project.dueDate) : '',
        expectedDuration: project.expectedDuration || '',
        category: project.category || ''
      });
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Nettoyer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);
      
      if (dueDate <= startDate) {
        newErrors.dueDate = 'La date de fin doit être après la date de début';
      }
    }

    if (formData.expectedDuration && (isNaN(formData.expectedDuration) || formData.expectedDuration <= 0)) {
      newErrors.expectedDuration = 'La durée doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        expectedDuration: formData.expectedDuration ? parseInt(formData.expectedDuration) : null,
        userId: user.uid,
        updatedAt: new Date()
      };

      if (project) {
        await updateProject(project.id, projectData);
      } else {
        projectData.createdAt = new Date();
        projectData.progress = 0;
        await createProject(projectData);
      }

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde projet:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Actif', color: 'text-green-400' },
    { value: 'on_hold', label: 'En pause', color: 'text-yellow-400' },
    { value: 'completed', label: 'Terminé', color: 'text-blue-400' },
    { value: 'cancelled', label: 'Annulé', color: 'text-red-400' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Faible', color: 'text-green-400' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-400' },
    { value: 'high', label: 'Haute', color: 'text-red-400' }
  ];

  const categoryOptions = [
    { value: 'development', label: 'Développement' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'research', label: 'Recherche' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Autre' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Target className="mr-2" size={20} />
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText size={16} className="inline mr-1" />
              Titre du projet *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Entrez le nom du projet..."
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Décrivez les objectifs et la portée du projet..."
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Statut et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <Flag size={16} className="inline mr-1" />
                Priorité
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date de début
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date d'échéance
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.dueDate && <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Durée estimée et Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Durée estimée */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock size={16} className="inline mr-1" />
                Durée estimée (jours)
              </label>
              <input
                type="number"
                name="expectedDuration"
                value={formData.expectedDuration}
                onChange={handleInputChange}
                min="1"
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.expectedDuration ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ex: 30"
              />
              {errors.expectedDuration && <p className="text-red-400 text-sm mt-1">{errors.expectedDuration}</p>}
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
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner une catégorie</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating || updating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating || updating ? 'Sauvegarde...' : project ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
