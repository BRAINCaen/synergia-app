// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE DE TÂCHE AVEC LIAISON PROJET OPTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Save, 
  AlertTriangle, 
  Target, 
  Flag, 
  Clock, 
  Trophy,
  Tag,
  Users,
  Calendar,
  FileText,
  Folder,
  Link,
  Zap
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import ProjectSelector, { LinkedProjectDisplay } from '../../components/tasks/TaskProjectLinking';

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE AVEC PROJETS
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = [],
  teamMembers = []
}) => {
  const { user } = useAuthStore();

  // 📊 État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    xpReward: 25,
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    assignedTo: [],
    projectId: null, // ✅ NOUVEAU : ID du projet lié
    notes: ''
  });

  // 🎨 États UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTag, setNewTag] = useState('');

  // 📥 Initialiser le formulaire
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        category: initialData.category || '',
        xpReward: initialData.xpReward || 25,
        estimatedHours: initialData.estimatedHours || 1,
        dueDate: initialData.dueDate ? formatDateForInput(initialData.dueDate) : '',
        tags: initialData.tags || [],
        assignedTo: initialData.assignedTo || [],
        projectId: initialData.projectId || null, // ✅ NOUVEAU
        notes: initialData.notes || ''
      });

      // Charger les infos du projet si projectId existe
      if (initialData.projectId) {
        loadProjectInfo(initialData.projectId);
      }
    } else {
      // Formulaire vide pour nouvelle tâche
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        xpReward: 25,
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        assignedTo: [],
        projectId: null,
        notes: ''
      });
      setSelectedProject(null);
    }
  }, [initialData, isOpen]);

  /**
   * 📁 CHARGER LES INFORMATIONS D'UN PROJET
   */
  const loadProjectInfo = async (projectId) => {
    try {
      const { projectService } = await import('../../core/services/projectService');
      const projectData = await projectService.getProject(projectId);
      
      if (projectData) {
        setSelectedProject(projectData);
      }
    } catch (error) {
      console.error('❌ Erreur chargement projet:', error);
    }
  };

  /**
   * 📅 FORMATER DATE POUR INPUT
   */
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  /**
   * ✅ VALIDATION DU FORMULAIRE
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.xpReward < 1 || formData.xpReward > 1000) {
      newErrors.xpReward = 'Les XP doivent être entre 1 et 1000';
    }

    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) {
      newErrors.estimatedHours = 'La durée doit être entre 0.5 et 100 heures';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 📤 SOUMISSION DU FORMULAIRE
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Préparer les données avec projet
      const taskData = {
        ...formData,
        projectId: selectedProject?.id || null,
        projectTitle: selectedProject?.title || null, // Pour affichage rapide
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        createdBy: user.uid,
        updatedAt: new Date()
      };

      console.log('📤 Soumission tâche avec projet:', {
        title: taskData.title,
        projectId: taskData.projectId,
        projectTitle: taskData.projectTitle
      });

      await onSubmit(taskData);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        xpReward: 25,
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        assignedTo: [],
        projectId: null,
        notes: ''
      });
      setSelectedProject(null);
      setErrors({});
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🏷️ GESTION DES TAGS
   */
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  /**
   * 📁 GESTION LIAISON PROJET
   */
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFormData(prev => ({
      ...prev,
      projectId: project.id
    }));
    console.log('🔗 Projet sélectionné:', project.title);
  };

  const handleProjectClear = () => {
    setSelectedProject(null);
    setFormData(prev => ({
      ...prev,
      projectId: null
    }));
    console.log('🔗 Projet délié');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
              </h2>
              <p className="text-gray-400 text-sm">
                {selectedProject ? `Liée au projet: ${selectedProject.title}` : 'Tâche indépendante'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* ✅ NOUVELLE SECTION : LIAISON PROJET */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              <Folder className="w-4 h-4 inline mr-2" />
              Projet associé (optionnel)
            </label>
            
            {selectedProject ? (
              <LinkedProjectDisplay
                project={selectedProject}
                onUnlink={handleProjectClear}
                showUnlinkButton={true}
              />
            ) : (
              <ProjectSelector
                selectedProjectId={formData.projectId}
                onProjectSelect={handleProjectSelect}
                onProjectClear={handleProjectClear}
                showCreateOption={true}
              />
            )}
            
            <p className="text-xs text-gray-400">
              Lier cette tâche à un projet permet de l'organiser et de suivre la progression globale.
            </p>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Titre de la tâche *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Ex: Mettre à jour le site web"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Décrivez la tâche en détail..."
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Grille 2 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Flag className="w-4 h-4 inline mr-2" />
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Haute</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grille 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* XP Reward */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Trophy className="w-4 h-4 inline mr-2" />
                Récompense XP
              </label>
              <input
                type="number"
                value={formData.xpReward}
                onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.xpReward ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                max="1000"
              />
              {errors.xpReward && (
                <p className="mt-1 text-xs text-red-400">{errors.xpReward}</p>
              )}
            </div>

            {/* Durée estimée */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Durée (heures)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-600'
                }`}
                min="0.5"
                max="100"
              />
              {errors.estimatedHours && (
                <p className="mt-1 text-xs text-red-400">{errors.estimatedHours}</p>
              )}
            </div>

            {/* Date d'échéance */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Tags
            </label>
            
            {/* Tags existants */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-300 text-sm rounded border border-blue-500/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-400 hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Ajouter tag */}
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes supplémentaires */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Notes supplémentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
              placeholder="Informations complémentaires, ressources, etc..."
            />
          </div>

          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="flex items-center p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-300">{errors.submit}</span>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
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
