// src/modules/tasks/TaskForm.jsx - Version avec gestion dates corrigée
import React, { useState, useEffect } from 'react';
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

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    // Titre requis
    if (!formData.title?.trim()) {
      newErrors.title = 'Le titre est requis';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Le titre ne peut pas dépasser 100 caractères';
    }
    
    // Description optionnelle mais limitée
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }
    
    // Validation du temps estimé
    if (formData.estimatedTime) {
      const time = parseInt(formData.estimatedTime);
      if (isNaN(time) || time < 5 || time > 2880) {
        newErrors.estimatedTime = 'Le temps estimé doit être entre 5 minutes et 48 heures';
      }
    }
    
    // 🔧 CORRECTION : Validation de la date d'échéance
    if (formData.dueDate) {
      try {
        const dueDate = new Date(formData.dueDate);
        if (!dateUtils.fromFirebaseTimestamp(dueDate)) {
          newErrors.dueDate = 'Date d\'échéance invalide';
        } else {
          // Vérifier que la date n'est pas dans le passé (sauf si on modifie une tâche existante)
          const now = new Date();
          if (!task && dueDate < now) {
            newErrors.dueDate = 'La date d\'échéance ne peut pas être dans le passé';
          }
        }
      } catch (error) {
        newErrors.dueDate = 'Format de date invalide';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔧 CORRECTION : Sauvegarder avec gestion dates sécurisée
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Vérification utilisateur
    if (!user?.uid) {
      setErrors({ general: 'Utilisateur non connecté' });
      return;
    }
    
    try {
      // 🔧 CORRECTION : Préparer les données avec dates normalisées
      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority,
        projectId: formData.projectId || null,
        tags: formData.tags,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
        dueDate: null
      };
      
      // Gestion sécurisée de la date d'échéance
      if (formData.dueDate) {
        try {
          const dueDate = dateUtils.toFirebaseTimestamp(new Date(formData.dueDate));
          if (dueDate) {
            taskData.dueDate = dueDate;
          }
        } catch (error) {
          console.warn('Erreur conversion date échéance:', error);
          setErrors({ dueDate: 'Erreur de format de date' });
          return;
        }
      }
      
      console.log('🚀 Données tâche à sauvegarder:', taskData);
      
      if (task) {
        await updateTask(task.id, taskData, user.uid);
        console.log('✅ Tâche mise à jour avec succès');
      } else {
        await createTask(taskData, user.uid);
        console.log('✅ Tâche créée avec succès');
      }
      
      onSave?.();
    } catch (error) {
      console.error('❌ Erreur sauvegarde tâche:', error);
      setErrors({ general: 'Erreur lors de la sauvegarde: ' + error.message });
    }
  };

  // Ajouter un tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag) && formData.tags.length < 10) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  // Supprimer un tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const isLoading = creating || updating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-400 text-xl">✕</span>
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Erreur générale */}
          {errors.general && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <span>📝</span>
              Titre de la tâche *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Que devez-vous faire ?"
              className={`w-full px-3 py-2 bg-gray-700 border text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Détails supplémentaires..."
              rows={3}
              className={`w-full px-3 py-2 bg-gray-700 border text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Ligne avec priorité et projet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priorité */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <span>🚩</span>
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">📝 Basse</option>
                <option value="medium">📌 Moyenne</option>
                <option value="high">⚡ Haute</option>
                <option value="urgent">🔥 Urgent</option>
              </select>
            </div>

            {/* Projet */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <span>📁</span>
                Projet
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucun projet</option>
                {projects.filter(p => p.status === 'active').map(project => (
                  <option key={project.id} value={project.id}>
                    {project.icon} {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ligne avec échéance et temps estimé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🔧 CORRECTION : Échéance avec validation */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <span>📅</span>
                Échéance
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className={`w-full bg-gray-700 border text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.dueDate && (
                <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>

            {/* Temps estimé */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <span>⏱️</span>
                Temps estimé (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder="120"
                min="5"
                max="2880"
                className={`w-full bg-gray-700 border text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimatedTime ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.estimatedTime && (
                <p className="text-red-400 text-sm mt-1">{errors.estimatedTime}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <span>🏷️</span>
              Tags ({formData.tags.length}/10)
            </label>
            
            {/* Tags existants */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900 border border-blue-700 text-blue-300 text-sm rounded-md"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-400 hover:text-blue-200 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Input pour nouveaux tags */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Tapez un tag et appuyez sur Entrée..."
              disabled={formData.tags.length >= 10}
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-800 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Appuyez sur Entrée pour ajouter un tag
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !user?.uid}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {!user?.uid ? 'Non connecté' : 
               isLoading ? 'Sauvegarde...' :
               task ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
