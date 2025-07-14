// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE DE TÂCHE SIMPLIFIÉ ET FONCTIONNEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, User, Briefcase, Target, Plus } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectService } from '../../core/services/projectService.js';

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE
 */
const TaskForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  loading = false 
}) => {
  const { user } = useAuthStore();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'medium',
    difficulty: 'normal',
    dueDate: '',
    estimatedTime: '',
    tags: []
  });
  
  // États des projets
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // États UI
  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');

  // Charger les projets de l'utilisateur
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!user?.uid) return;
      
      setLoadingProjects(true);
      try {
        console.log('🔄 Chargement projets pour le formulaire de tâche...');
        const userProjects = await projectService.getUserProjects(user.uid);
        
        console.log('✅ Projets chargés pour le formulaire:', userProjects?.length || 0);
        setProjects(userProjects || []);
        
      } catch (error) {
        console.error('❌ Erreur chargement projets pour TaskForm:', error);
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadUserProjects();
  }, [user?.uid]);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        projectId: initialData.projectId || '',
        priority: initialData.priority || 'medium',
        difficulty: initialData.difficulty || 'normal',
        dueDate: initialData.dueDate || '',
        estimatedTime: initialData.estimatedTime || '',
        tags: initialData.tags || []
      });
    }
    setErrors({});
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
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
    
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'La date d\'échéance ne peut pas être dans le passé';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Préparer les données à soumettre
    const taskData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      tags: formData.tags.filter(tag => tag.trim()),
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
      dueDate: formData.dueDate || null,
      status: 'todo',
      priority: formData.priority,
      difficulty: formData.difficulty
    };
    
    console.log('📝 Soumission TaskForm:', taskData);
    onSubmit(taskData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Titre de la tâche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 inline mr-2" />
            Titre de la tâche *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Implémenter la fonctionnalité de chat"
            disabled={loading}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
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
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Décrivez les détails de la tâche..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Projet (optionnel)
            </label>
            
            {loadingProjects ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-500">
                Chargement des projets...
              </div>
            ) : (
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Aucun projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Priorité
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Difficulté */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulté
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="easy">Facile (+10 XP)</option>
              <option value="normal">Normal (+25 XP)</option>
              <option value="hard">Difficile (+50 XP)</option>
              <option value="expert">Expert (+100 XP)</option>
            </select>
          </div>

          {/* Date d'échéance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date d'échéance
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dueDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Temps estimé */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Temps estimé (en heures)
          </label>
          <input
            type="number"
            name="estimatedTime"
            value={formData.estimatedTime}
            onChange={handleInputChange}
            min="0.5"
            step="0.5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 2.5"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optionnel)
          </label>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ajouter un tag..."
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={loading || !currentTag.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-600"
                    disabled={loading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Boutons de validation */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {initialData ? 'Mettre à jour' : 'Créer la tâche'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
