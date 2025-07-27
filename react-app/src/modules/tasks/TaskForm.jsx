// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE DE TÂCHE - REMPLACER SEULEMENT LE CHAMP XP PAR CALCUL AUTO
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
  Zap,
  Shield
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import ProjectSelector, { LinkedProjectDisplay } from '../../components/tasks/TaskProjectLinking';

/**
 * 🏆 CALCUL XP SIMPLE
 */
const calculateXP = (difficulty, priority) => {
  const base = { easy: 15, medium: 25, hard: 40, expert: 60 }[difficulty] || 25;
  const mult = { low: 1, medium: 1.2, high: 1.5, urgent: 2 }[priority] || 1.2;
  return Math.round(base * mult);
};

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
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  // 📊 État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
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

  // 🎨 États UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [manualXP, setManualXP] = useState(false);

  // Calcul XP automatique
  useEffect(() => {
    if (!manualXP) {
      const autoXP = calculateXP(formData.difficulty, formData.priority);
      setFormData(prev => ({ ...prev, xpReward: autoXP }));
    }
  }, [formData.difficulty, formData.priority, manualXP]);

  // 📥 Initialiser le formulaire
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium',
        priority: initialData.priority || 'medium',
        category: initialData.category || '',
        xpReward: initialData.xpReward || 25,
        estimatedHours: initialData.estimatedHours || 1,
        dueDate: initialData.dueDate ? formatDateForInput(initialData.dueDate) : '',
        tags: initialData.tags || [],
        assignedTo: initialData.assignedTo || [],
        projectId: initialData.projectId || null,
        notes: initialData.notes || ''
      });

      if (isAdmin && initialData.xpReward) {
        setManualXP(true);
      }

      if (initialData.projectId) {
        loadProjectInfo(initialData.projectId);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
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
      setManualXP(false);
    }
  }, [initialData, isOpen, isAdmin]);

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

  const formatDateForInput = (date) => {
    if (!date) return '';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.xpReward < 1 || formData.xpReward > 1000) newErrors.xpReward = 'Les XP doivent être entre 1 et 1000';
    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) newErrors.estimatedHours = 'La durée doit être entre 0.5 et 100 heures';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const taskData = {
        ...formData,
        projectId: selectedProject?.id || null,
        projectTitle: selectedProject?.title || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        createdBy: user.uid,
        updatedAt: new Date()
      };

      await onSubmit(taskData);
      
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
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
      setManualXP(false);
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setFormData(prev => ({ ...prev, projectId: project.id }));
  };

  const handleProjectClear = () => {
    setSelectedProject(null);
    setFormData(prev => ({ ...prev, projectId: null }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
        
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
                {selectedProject ? `Projet: ${selectedProject.title}` : 'Tâche indépendante'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
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
            {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
          </div>

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
            {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Flag className="w-4 h-4 inline mr-2" />
                Difficulté
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">🟢 Facile</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="hard">🟠 Difficile</option>
                <option value="expert">🔴 Expert</option>
              </select>
            </div>

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
                <option value="low">🔵 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Élevée</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="development">Développement</option>
                <option value="marketing">Marketing</option>
                <option value="design">Design</option>
                <option value="support">Support</option>
                <option value="management">Gestion</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Durée estimée (heures)
              </label>
              <input
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.estimatedHours && <p className="mt-1 text-sm text-red-400">{errors.estimatedHours}</p>}
            </div>
          </div>

          {/* NOUVELLE SECTION XP */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Récompense XP</h3>
                  <p className="text-gray-400 text-sm">
                    {manualXP ? 'Valeur personnalisée' : 'Calculée automatiquement'}
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{formData.xpReward}</div>
            </div>

            {isAdmin && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="manualXP"
                    checked={!manualXP}
                    onChange={(e) => setManualXP(!e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="manualXP" className="text-gray-300 text-sm">Calcul automatique</label>
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>

                {manualXP && (
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.xpReward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="XP personnalisé"
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Folder className="w-4 h-4 inline mr-2" />
              Projet (optionnel)
            </label>
            {selectedProject ? (
              <LinkedProjectDisplay
                project={selectedProject}
                onUnlink={handleProjectClear}
                showUnlinkButton={true}
              />
            ) : (
              <ProjectSelector onProjectSelect={handleProjectSelect} />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Tags
            </label>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajouter un tag..."
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Notes supplémentaires</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
              placeholder="Informations complémentaires, ressources, etc..."
            />
          </div>

          {errors.submit && (
            <div className="flex items-center p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-300">{errors.submit}</span>
            </div>
          )}

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
