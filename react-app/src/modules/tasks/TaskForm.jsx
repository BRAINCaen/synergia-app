// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE DE TÂCHE COMPLET SANS FRAMER MOTION
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Upload, Star, Calendar, Clock, User, Layers, 
  Tag, FileText, Settings, AlertTriangle, Loader, Target,
  Globe, Users, MessageSquare, Repeat, Camera, Video,
  Image as ImageIcon, Paperclip, Save, Trash2
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectService } from '../../core/services/projectService.js';

/**
 * 📐 HELPER - CALCUL XP AUTOMATIQUE
 */
const calculateXP = (difficulty, priority, recurrenceType) => {
  const baseValues = {
    difficulty: { easy: 15, medium: 25, hard: 40, expert: 60 },
    priority: { low: 1, medium: 1.2, high: 1.5, urgent: 2 },
    recurrence: { none: 1, daily: 0.8, weekly: 1.1, monthly: 1.3 }
  };
  
  const base = baseValues.difficulty[difficulty] || 25;
  const priorityMultiplier = baseValues.priority[priority] || 1.2;
  const recurrenceMultiplier = baseValues.recurrence[recurrenceType] || 1;
  
  return Math.round(base * priorityMultiplier * recurrenceMultiplier);
};

/**
 * 📎 COMPOSANT APERÇU FICHIER
 */
const FilePreview = ({ file, onRemove }) => {
  const isImage = file.type?.startsWith('image/');
  const isVideo = file.type?.startsWith('video/');
  
  const formatFileSize = (size) => {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return Math.round(size / 1024) + ' KB';
    return Math.round(size / (1024 * 1024)) + ' MB';
  };

  return (
    <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-gray-600">
          {isImage ? (
            <ImageIcon className="w-4 h-4" />
          ) : isVideo ? (
            <Video className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>Média joint</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          📁 {file.name} • {formatFileSize(file.size)}
        </div>
      </div>
      
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

/**
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE COMPLET
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData = null,
  submitting = false 
}) => {
  const { user } = useAuthStore();
  
  // ✅ ÉTAT DU FORMULAIRE COMPLET
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'medium',
    roleId: '',
    xpReward: 25,
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    notes: '',
    projectId: null,
    // Récurrence
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: null,
    // Système volontaires
    isOpenToVolunteers: true,
    volunteerAcceptanceMode: 'manual',
    maxVolunteers: null,
    volunteerMessage: ''
  });

  // ✅ ÉTATS UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [manualXP, setManualXP] = useState(false);
  const [projects, setProjects] = useState([]);
  
  // ✅ ÉTATS UPLOAD MÉDIA
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ INITIALISATION AVEC DONNÉES EXISTANTES (MODE ÉDITION)
  useEffect(() => {
    if (initialData) {
      console.log('📝 Mode édition - initialisation avec:', initialData);
      
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tags: initialData.tags || [],
        projectId: initialData.projectId || null,
        dueDate: initialData.dueDate ? 
          (initialData.dueDate.toDate ? 
            initialData.dueDate.toDate().toISOString().split('T')[0] : 
            new Date(initialData.dueDate).toISOString().split('T')[0]
          ) : '',
        recurrenceEndDate: initialData.recurrenceEndDate ?
          (initialData.recurrenceEndDate.toDate ?
            initialData.recurrenceEndDate.toDate().toISOString().split('T')[0] :
            new Date(initialData.recurrenceEndDate).toISOString().split('T')[0]
          ) : ''
      }));
      
      // Activer le mode XP manuel si différent de l'auto
      const autoXP = calculateXP(
        initialData.difficulty || 'medium', 
        initialData.priority || 'medium', 
        initialData.recurrenceType || 'none'
      );
      if (initialData.xpReward && initialData.xpReward !== autoXP) {
        setManualXP(true);
      }
    } else {
      // Réinitialiser pour une nouvelle tâche
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        difficulty: 'medium',
        roleId: '',
        xpReward: 25,
        estimatedHours: 1,
        dueDate: '',
        tags: [],
        notes: '',
        projectId: null,
        isRecurring: false,
        recurrenceType: 'none',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        maxOccurrences: null,
        isOpenToVolunteers: true,
        volunteerAcceptanceMode: 'manual',
        maxVolunteers: null,
        volunteerMessage: ''
      });
      setManualXP(false);
    }
  }, [initialData]);

  // ✅ CALCUL XP AUTOMATIQUE
  useEffect(() => {
    if (!manualXP) {
      const recurrenceType = formData.isRecurring ? formData.recurrenceType : 'none';
      const autoXP = calculateXP(formData.difficulty, formData.priority, recurrenceType);
      setFormData(prev => ({ ...prev, xpReward: autoXP }));
    }
  }, [formData.difficulty, formData.priority, formData.isRecurring, formData.recurrenceType, manualXP]);

  // ✅ CHARGER LES PROJETS
  useEffect(() => {
    const loadProjects = async () => {
      try {
        if (user?.uid) {
          const userProjects = await projectService.getUserProjects(user.uid);
          setProjects(userProjects || []);
        }
      } catch (error) {
        console.error('❌ Erreur chargement projets:', error);
      }
    };

    if (isOpen) {
      loadProjects();
    }
  }, [isOpen, user?.uid]);

  // ✅ GESTION FICHIERS MÉDIA
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Le fichier ne peut pas dépasser ${file.type.startsWith('video/') ? '100 MB' : '10 MB'}`);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  // ✅ GESTION TAGS
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.name === 'currentTag') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // ✅ SOUMISSION FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Le titre est obligatoire');
      }
      if (!formData.description.trim()) {
        throw new Error('La description est obligatoire');
      }

      let finalData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        xpReward: Number(formData.xpReward) || 25,
        estimatedHours: Number(formData.estimatedHours) || 1,
        tags: formData.tags.filter(tag => tag.trim()),
        isOpenToVolunteers: Boolean(formData.isOpenToVolunteers)
      };

      // Mode édition : préserver les données critiques
      if (initialData) {
        finalData = {
          ...finalData,
          // Préserver les données existantes importantes
          assignedTo: initialData.assignedTo || [],
          createdBy: initialData.createdBy,
          createdAt: initialData.createdAt,
          completedAt: initialData.completedAt,
          submittedAt: initialData.submittedAt,
          submittedBy: initialData.submittedBy,
          validationRequestId: initialData.validationRequestId,
          validatedAt: initialData.validatedAt,
          validatedBy: initialData.validatedBy,
          updatedAt: new Date()
        };
      }

      // Gestion des dates
      if (formData.dueDate) {
        finalData.dueDate = new Date(formData.dueDate);
      }
      if (formData.recurrenceEndDate) {
        finalData.recurrenceEndDate = new Date(formData.recurrenceEndDate);
      }

      console.log('📝 Soumission avec données finales:', finalData);

      // Soumission
      await onSubmit(finalData);
      
      // Reset après succès pour nouvelle tâche
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          difficulty: 'medium',
          roleId: '',
          xpReward: 25,
          estimatedHours: 1,
          dueDate: '',
          tags: [],
          notes: '',
          projectId: null,
          isRecurring: false,
          recurrenceType: 'none',
          recurrenceInterval: 1,
          recurrenceEndDate: '',
          maxOccurrences: null,
          isOpenToVolunteers: true,
          volunteerAcceptanceMode: 'manual',
          maxVolunteers: null,
          volunteerMessage: ''
        });
        setSelectedFile(null);
        setCurrentTag('');
        setManualXP(false);
      }
      
      onClose();
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Ne pas afficher si fermé
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        
        {/* ✅ EN-TÊTE */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
              </h2>
              <p className="text-sm text-gray-600">
                {initialData ? 'Modifiez les détails de cette tâche' : 'Créez une tâche collaborative complète'}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ✅ FORMULAIRE COMPLET */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Informations de base
              </h3>
              
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Donnez un titre clair et descriptif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez la tâche en détail : objectifs, livrables attendus, contraintes..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={loading || uploading}
                  required
                />
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🟠 Haute</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>

                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  >
                    <option value="easy">⭐ Facile</option>
                    <option value="medium">⭐⭐ Moyenne</option>
                    <option value="hard">⭐⭐⭐ Difficile</option>
                    <option value="expert">⭐⭐⭐⭐ Expert</option>
                  </select>
                </div>

                {/* XP Reward */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Récompense XP
                      <button
                        type="button"
                        onClick={() => setManualXP(!manualXP)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {manualXP ? 'Auto' : 'Manuel'}
                      </button>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading || !manualXP}
                  />
                </div>

                {/* Heures estimées */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Heures estimées
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                    min="0.5"
                    max="100"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                </div>

                {/* Date limite */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date limite
                    </div>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                </div>

                {/* Projet rattaché */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Projet rattaché
                    </div>
                  </label>
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  >
                    <option value="">Aucun projet</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags et mots-clés
                </div>
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  name="currentTag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading || uploading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading || uploading}
                >
                  Ajouter
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
                        className="text-blue-600 hover:text-blue-800"
                        disabled={loading || uploading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes supplémentaires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes supplémentaires (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations complémentaires, contexte, références..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={loading || uploading}
              />
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || uploading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || uploading || !formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading || uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {uploading ? 'Upload en cours...' : (initialData ? 'Modification...' : 'Création...')}
                  </>
                ) : (
                  <>
                    {initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {initialData ? 'Modifier la tâche' : 'Créer la tâche'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
