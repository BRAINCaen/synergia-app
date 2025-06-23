// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// CORRECTION : Tous les imports avec chemins corrects
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Clock, Flag, Tag, FileText } from 'lucide-react';

// 🔧 CORRECTION : Imports avec chemins corrects depuis shared/stores
import { useTaskStore } from '../../shared/stores/taskStore';
import { useProjectStore } from '../../shared/stores/projectStore';
import { useAuthStore } from '../../shared/stores/authStore';
import dateUtils from '../../shared/utils/dateUtils.js';

export const TaskForm = ({ task, onClose, onSave }) => {
  const { createTask, updateTask, creating, updating } = useTaskStore();
  const { projects } = useProjectStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedTime: '',
    projectId: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // 🔧 CORRECTION : Initialiser le formulaire avec gestion dates sécurisée
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? dateUtils.formatForInput(task.dueDate) : '',
        estimatedTime: task.estimatedTime || '',
        projectId: task.projectId || '',
        tags: Array.isArray(task.tags) ? task.tags : []
      });
    }
  }, [task]);

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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.projectId) {
      newErrors.projectId = 'Veuillez sélectionner un projet';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'La date d\'échéance ne peut pas être dans le passé';
    }

    if (formData.estimatedTime && (isNaN(formData.estimatedTime) || formData.estimatedTime <= 0)) {
      newErrors.estimatedTime = 'Le temps estimé doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
        userId: user.uid,
        updatedAt: new Date()
      };

      if (task) {
        await updateTask(task.id, taskData);
      } else {
        taskData.createdAt = new Date();
        taskData.status = 'todo';
        await createTask(taskData);
      }

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde tâche:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Faible', color: 'text-green-400' },
    { value: 'medium', label: 'Moyenne', color: 'text-yellow-400' },
    { value: 'high', label: 'Haute', color: 'text-red-400' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {task ? '✏️ Modifier la tâche' : '➕ Nouvelle tâche'}
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
              Titre *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Entrez le titre de la tâche..."
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description détaillée de la tâche..."
            />
          </div>

          {/* Projet et Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Projet */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Projet *
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.projectId ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Sélectionner un projet</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {errors.projectId && <p className="text-red-400 text-sm mt-1">{errors.projectId}</p>}
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

          {/* Date d'échéance et temps estimé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Date d'échéance */}
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

            {/* Temps estimé */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock size={16} className="inline mr-1" />
                Temps estimé (heures)
              </label>
              <input
                type="number"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleInputChange}
                min="0.5"
                step="0.5"
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedTime ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ex: 2.5"
              />
              {errors.estimatedTime && <p className="text-red-400 text-sm mt-1">{errors.estimatedTime}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            
            {/* Tags existants */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-200 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Ajouter nouveau tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
              </button>
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
              {creating || updating ? 'Sauvegarde...' : task ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
