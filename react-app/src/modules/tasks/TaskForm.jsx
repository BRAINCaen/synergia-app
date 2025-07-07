// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE DE CRÉATION DE TÂCHE AVEC SÉLECTION DE PROJETS
// ==========================================

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag, User, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectService } from '../../core/services/projectService.js';

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE AVEC PROJETS
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  loading = false 
}) => {
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

    if (isOpen) {
      loadUserProjects();
    }
  }, [isOpen, user?.uid]);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData) {
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
    } else {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre de la tâche *
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

            {/* Projet */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Projet *
              </label>
              {loadingProjects ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  Chargement des projets...
                </div>
              ) : (
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
                      {project.title} ({project.status === 'active' ? 'Actif' : project.status})
                    </option>
                  ))}
                </select>
              )}
              {errors.projectId && <p className="text-red-400 text-sm mt-1">{errors.projectId}</p>}
              
              {/* Message si aucun projet */}
              {!loadingProjects && projects.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-800 bg-opacity-50 border border-yellow-600 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ Aucun projet trouvé. <a href="/projects" className="text-yellow-100 underline">Créez d'abord un projet</a> pour pouvoir y ajouter des tâches.
                  </p>
                </div>
              )}
            </div>

            {/* Priorité et Complexité */}
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">🔹 Basse</option>
                  <option value="normal">🔸 Normale</option>
                  <option value="high">🔶 Haute</option>
                  <option value="urgent">🔴 Urgente</option>
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">🟢 Facile</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="hard">🔴 Difficile</option>
                </select>
              </div>
            </div>

            {/* Date d'échéance et Temps estimé */}
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
                  className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.dueDate && <p className="text-red-400 text-sm mt-1">{errors.dueDate}</p>}
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
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ex: 2.5"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags
              </label>
              
              {/* Affichage des tags existants */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* Ajout de nouveaux tags */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ajouter un tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Assignation */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Assigné à
              </label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ID de l'utilisateur assigné"
                readOnly
              />
              <p className="text-xs text-gray-400 mt-1">
                Par défaut, la tâche vous est assignée
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || loadingProjects || projects.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {initialData ? 'Mettre à jour' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
