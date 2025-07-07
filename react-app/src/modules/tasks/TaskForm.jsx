// ==========================================
// 📁 react-app/src/components/tasks/TaskForm.jsx
// CRÉATION DU FICHIER MANQUANT - Import Fix Netlify
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, User, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectService } from '../../core/services/projectService.js';

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE
 * Version simplifiée pour éviter les conflits d'imports
 */
function TaskForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  loading = false 
}) {
  const { user } = useAuthStore();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'normal',
    complexity: 'medium',
    dueDate: '',
    estimatedTime: '',
    tags: [],
    assignedTo: user?.uid || ''
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
      if (!user?.uid || !isOpen) return;
      
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
  }, [isOpen, user?.uid]);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        projectId: initialData.projectId || '',
        priority: initialData.priority || 'normal',
        complexity: initialData.complexity || 'medium',
        dueDate: initialData.dueDate || '',
        estimatedTime: initialData.estimatedTime || '',
        tags: initialData.tags || [],
        assignedTo: initialData.assignedTo || user?.uid || ''
      });
    } else if (isOpen) {
      // Reset pour nouvelle tâche
      setFormData({
        title: '',
        description: '',
        projectId: '',
        priority: 'normal',
        complexity: 'medium',
        dueDate: '',
        estimatedTime: '',
        tags: [],
        assignedTo: user?.uid || ''
      });
    }
    setErrors({});
  }, [initialData, user?.uid, isOpen]);

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
    
    if (!formData.projectId) {
      newErrors.projectId = 'Veuillez sélectionner un projet';
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
      dueDate: formData.dueDate || null
    };
    
    console.log('📝 Soumission TaskForm:', taskData);
    onSubmit(taskData);
  };

  // Si le modal n'est pas ouvert, ne rien afficher
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? '✏️ Modifier la tâche' : '➕ Nouvelle tâche'}
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du formulaire */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Titre de la tâche */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Titre de la tâche *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Ex: Implémenter la fonctionnalité de chat"
                disabled={loading}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Décrivez les détails de la tâche..."
                disabled={loading}
              />
            </div>

            {/* Projet */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Projet *
              </label>
              
              {loadingProjects ? (
                <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                  Chargement des projets...
                </div>
              ) : projects.length === 0 ? (
                <div className="w-full px-4 py-3 bg-gray-700 border border-red-500 rounded-lg text-red-400">
                  Aucun projet disponible. Créez un projet d'abord.
                </div>
              ) : (
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.projectId ? 'border-red-500' : 'border-gray-600'
                  }`}
                  disabled={loading}
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              )}
              
              {errors.projectId && (
                <p className="text-red-400 text-sm mt-1">{errors.projectId}</p>
              )}
            </div>

            {/* Ligne avec priorité et complexité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="low">🟢 Basse</option>
                  <option value="normal">🟡 Normale</option>
                  <option value="high">🔴 Haute</option>
                  <option value="urgent">🚨 Urgente</option>
                </select>
              </div>

              {/* Complexité */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Complexité
                </label>
                <select
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="simple">🟢 Simple</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="complex">🔴 Complexe</option>
                  <option value="expert">🚀 Expert</option>
                </select>
              </div>
            </div>

            {/* Ligne avec date et temps estimé */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Date d'échéance */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-600'
                  }`}
                  disabled={loading}
                />
                {errors.dueDate && (
                  <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>
                )}
              </div>

              {/* Temps estimé */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Temps estimé (heures)
                </label>
                <input
                  type="number"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 4.5"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajouter un tag..."
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={loading || !currentTag.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Ajouter
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-gray-300"
                        disabled={loading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer avec boutons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingProjects || projects.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {initialData ? 'Mettre à jour' : 'Créer la tâche'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;
