// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE DE TÂCHE CORRIGÉ - XP AUTO + ADMIN OVERRIDE
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
  Shield,
  Info
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import ProjectSelector, { LinkedProjectDisplay } from '../../components/tasks/TaskProjectLinking';

/**
 * 🏆 CALCUL AUTOMATIQUE DES XP
 */
const calculateAutoXP = (difficulty, priority) => {
  // XP de base selon la difficulté
  const difficultyXP = {
    'easy': 15,
    'medium': 25,
    'hard': 40,
    'expert': 60
  };
  
  // Multiplicateur de priorité
  const priorityMultiplier = {
    'low': 1.0,
    'medium': 1.2,
    'high': 1.5,
    'urgent': 2.0
  };
  
  const baseXP = difficultyXP[difficulty] || 25;
  const finalXP = baseXP * (priorityMultiplier[priority] || 1.2);
  
  return Math.round(finalXP);
};

/**
 * ✅ VÉRIFIER LES PERMISSIONS ADMIN
 */
const checkIsAdmin = (user) => {
  if (!user) return false;
  
  return (
    user.role === 'admin' ||
    user.profile?.role === 'admin' ||
    user.isAdmin === true ||
    user.permissions?.includes('manage_tasks') ||
    user.permissions?.includes('admin')
  );
};

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE AVEC XP AUTOMATIQUE
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
  const isAdmin = checkIsAdmin(user);

  // 📊 État du formulaire (basé sur l'existant)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium', // ✅ AJOUTÉ : pour calcul XP
    priority: 'medium',
    category: '',
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    assignedTo: [],
    projectId: null,
    notes: '',
    // ✅ ADMIN UNIQUEMENT : Override XP manuel
    xpOverride: null
  });

  // 🎨 États UI (conservés de l'existant)
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [calculatedXP, setCalculatedXP] = useState(25);

  // 🧮 CALCUL AUTOMATIQUE DES XP EN TEMPS RÉEL
  useEffect(() => {
    const autoXP = calculateAutoXP(formData.difficulty, formData.priority);
    setCalculatedXP(autoXP);
  }, [formData.difficulty, formData.priority]);

  // 📥 Initialiser le formulaire (conservé de l'existant + ajouts)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty: initialData.difficulty || 'medium', // ✅ AJOUTÉ
        priority: initialData.priority || 'medium',
        category: initialData.category || '',
        estimatedHours: initialData.estimatedHours || 1,
        dueDate: initialData.dueDate ? formatDateForInput(initialData.dueDate) : '',
        tags: initialData.tags || [],
        assignedTo: initialData.assignedTo || [],
        projectId: initialData.projectId || null,
        notes: initialData.notes || '',
        xpOverride: isAdmin && initialData.xpReward ? initialData.xpReward : null // ✅ AJOUTÉ
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
        difficulty: 'medium',
        priority: 'medium',
        category: '',
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        assignedTo: [],
        projectId: null,
        notes: '',
        xpOverride: null
      });
      setSelectedProject(null);
    }
  }, [initialData, isOpen, isAdmin]);

  /**
   * 📁 CHARGER LES INFORMATIONS D'UN PROJET (conservé)
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
   * 📅 FORMATER DATE POUR INPUT (conservé)
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
   * ✅ VALIDATION DU FORMULAIRE (mise à jour)
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) {
      newErrors.estimatedHours = 'La durée doit être entre 0.5 et 100 heures';
    }

    // ✅ VALIDATION XP OVERRIDE (ADMIN UNIQUEMENT)
    if (isAdmin && formData.xpOverride !== null) {
      if (formData.xpOverride < 1 || formData.xpOverride > 1000) {
        newErrors.xpOverride = 'L\'override XP doit être entre 1 et 1000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 📤 SOUMISSION DU FORMULAIRE (mise à jour)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      // ✅ CALCUL FINAL DES XP
      const finalXP = isAdmin && formData.xpOverride !== null 
        ? formData.xpOverride  // Admin override
        : calculatedXP;        // Calcul automatique

      // Préparer les données avec projet et XP finaux (conservé + ajouts)
      const taskData = {
        ...formData,
        projectId: selectedProject?.id || null,
        projectTitle: selectedProject?.title || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        xpReward: finalXP, // ✅ XP calculé automatiquement ou overridé par admin
        createdBy: user.uid,
        updatedAt: new Date(),
        // ✅ Métadonnées de calcul XP pour transparence
        xpCalculation: {
          automatic: calculatedXP,
          override: isAdmin ? formData.xpOverride : null,
          final: finalXP,
          calculatedBy: isAdmin && formData.xpOverride !== null ? 'admin_override' : 'automatic',
          factors: {
            difficulty: formData.difficulty,
            priority: formData.priority
          }
        }
      };

      console.log('📤 Soumission tâche avec XP auto:', {
        title: taskData.title,
        xpReward: taskData.xpReward,
        calculatedBy: taskData.xpCalculation.calculatedBy
      });

      await onSubmit(taskData);
      
      // Réinitialiser le formulaire (conservé)
      setFormData({
        title: '',
        description: '',
        difficulty: 'medium',
        priority: 'medium',
        category: '',
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        assignedTo: [],
        projectId: null,
        notes: '',
        xpOverride: null
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
   * 🏷️ GESTION DES TAGS (conservé)
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
   * 📁 GESTION LIAISON PROJET (conservé)
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
        
        {/* Header (conservé) */}
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu (mise à jour avec XP) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Titre (conservé) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
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
            />
            {errors.title && (
              <p className="mt-1 text-red-400 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Description (conservé) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Décrivez la tâche en détail..."
            />
            {errors.description && (
              <p className="mt-1 text-red-400 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Paramètres (mise à jour avec difficulté) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ✅ AJOUTÉ : Difficulté */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Difficulté
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">🟢 Facile (15 XP base)</option>
                <option value="medium">🟡 Moyenne (25 XP base)</option>
                <option value="hard">🟠 Difficile (40 XP base)</option>
                <option value="expert">🔴 Expert (60 XP base)</option>
              </select>
            </div>

            {/* Priorité (mise à jour avec indicateurs XP) */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🔵 Basse (×1.0)</option>
                <option value="medium">🟡 Moyenne (×1.2)</option>
                <option value="high">🟠 Élevée (×1.5)</option>
                <option value="urgent">🔴 Urgente (×2.0)</option>
              </select>
            </div>

            {/* Catégorie (conservé) */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                ) : (
                  <>
                    <option value="development">Développement</option>
                    <option value="marketing">Marketing</option>
                    <option value="design">Design</option>
                    <option value="support">Support</option>
                    <option value="management">Gestion</option>
                    <option value="maintenance">Maintenance</option>
                  </>
                )}
              </select>
            </div>

            {/* Durée estimée (conservé) */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
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
              {errors.estimatedHours && (
                <p className="mt-1 text-red-400 text-sm">{errors.estimatedHours}</p>
              )}
            </div>
          </div>

          {/* ✅ NOUVEAU : RÉCOMPENSE XP */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Récompense XP</h3>
                  <p className="text-gray-400 text-sm">Calculée automatiquement</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">
                  {isAdmin && formData.xpOverride !== null ? formData.xpOverride : calculatedXP}
                </div>
                <div className="text-xs text-gray-500">XP par tâche</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-2 bg-gray-600 rounded">
                <div className="text-gray-400">Difficulté</div>
                <div className="font-medium text-white">{formData.difficulty}</div>
              </div>
              <div className="text-center p-2 bg-gray-600 rounded">
                <div className="text-gray-400">Priorité</div>
                <div className="font-medium text-white">{formData.priority}</div>
              </div>
            </div>

            {/* ✅ ADMIN UNIQUEMENT : Override XP */}
            {isAdmin && (
              <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">Override Admin</span>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useXpOverride"
                    checked={formData.xpOverride !== null}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, xpOverride: calculatedXP }));
                      } else {
                        setFormData(prev => ({ ...prev, xpOverride: null }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useXpOverride" className="text-blue-300 text-sm">
                    Remplacer par une valeur personnalisée
                  </label>
                </div>

                {formData.xpOverride !== null && (
                  <div className="mt-3">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.xpOverride}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpOverride: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.xpOverride ? 'border-red-500' : 'border-blue-500'
                      }`}
                      placeholder="XP personnalisé (1-1000)"
                    />
                    {errors.xpOverride && (
                      <p className="mt-1 text-red-400 text-sm">{errors.xpOverride}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Projet (conservé) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <Folder className="w-4 h-4 inline mr-1" />
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

          {/* Tags (conservé) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-blue-300"
                    >
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajouter un tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Date d'échéance (conservé) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date d'échéance
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes supplémentaires (conservé) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Notes supplémentaires
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
              placeholder="Informations complémentaires, ressources, etc..."
            />
          </div>

          {/* Erreur de soumission (conservé) */}
          {errors.submit && (
            <div className="flex items-center p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-300">{errors.submit}</span>
            </div>
          )}

          {/* Boutons (conservé) */}
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
