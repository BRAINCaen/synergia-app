// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE TÂCHE AVEC PRÉSERVATION assignedTo
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Loader, 
  Upload, 
  ImageIcon, 
  VideoIcon, 
  FileText, 
  Plus,
  Trash2,
  Clock,
  Target,
  User,
  Calendar,
  Tag
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore';
import { projectService } from '../../core/services/projectService';

/**
 * 🧮 CALCUL XP AUTOMATIQUE
 */
const calculateXP = (difficulty, priority, recurrenceType) => {
  const difficultyMultipliers = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 3
  };

  const priorityMultipliers = {
    low: 1,
    medium: 1.2,
    high: 1.5,
    urgent: 2
  };

  const recurrenceMultipliers = {
    none: 1,
    daily: 0.5,
    weekly: 0.8,
    monthly: 1.2
  };

  const baseXP = 20;
  return Math.round(
    baseXP * 
    (difficultyMultipliers[difficulty] || 1) * 
    (priorityMultipliers[priority] || 1) * 
    (recurrenceMultipliers[recurrenceType] || 1)
  );
};

/**
 * 📁 COMPOSANT PRÉVISUALISATION FICHIER
 */
const FilePreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
    return () => setPreview(null);
  }, [file]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!file) return null;

  return (
    <div className="relative bg-gray-100 border border-gray-300 rounded-lg p-4">
      {/* Prévisualisation image */}
      {file.type.startsWith('image/') && preview && (
        <img
          src={preview}
          alt="Aperçu"
          className="w-full h-32 object-cover rounded-lg mb-2"
        />
      )}
      
      {/* Informations du fichier */}
      <div className="text-sm">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          {file.type.startsWith('image/') ? (
            <ImageIcon className="w-4 h-4" />
          ) : file.type.startsWith('video/') ? (
            <VideoIcon className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>Média joint</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          📁 {file.name} • {formatFileSize(file.size)}
        </div>
      </div>
      
      {/* Bouton supprimer */}
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
 * 📝 FORMULAIRE DE CRÉATION/ÉDITION DE TÂCHE
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
      
      // 🛡️ PRÉSERVER TOUTES LES DONNÉES CRITIQUES
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

    // Vérifier la taille
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Le fichier ne peut pas dépasser ${file.type.startsWith('video/') ? '100 MB' : '10 MB'}`);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  // ✅ GESTION DES TAGS
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ✅ SOUMISSION DU FORMULAIRE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Le titre est requis');
      }

      // 🛡️ PRÉPARATION DONNÉES AVEC PRÉSERVATION
      let finalData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        updatedAt: new Date()
      };

      // ✅ MODE ÉDITION : PRÉSERVER LES DONNÉES CRITIQUES
      if (initialData) {
        console.log('🔧 Mode édition - préservation des données critiques');
        
        finalData = {
          ...finalData,
          // 🛡️ PRÉSERVER ABSOLUMENT
          assignedTo: initialData.assignedTo || [],
          createdBy: initialData.createdBy,
          createdAt: initialData.createdAt,
          completedAt: initialData.completedAt,
          validationRequestId: initialData.validationRequestId,
          validatedAt: initialData.validatedAt,
          validatedBy: initialData.validatedBy,
          withdrawnAt: initialData.withdrawnAt,
          
          // Mise à jour seulement
          updatedAt: new Date()
        };

        console.log('🔧 Données préservées:', {
          assignedTo: finalData.assignedTo,
          createdBy: finalData.createdBy,
          titre: finalData.title
        });
      }

      // Dates
      if (formData.dueDate) {
        finalData.dueDate = new Date(formData.dueDate);
      }
      if (formData.recurrenceEndDate) {
        finalData.recurrenceEndDate = new Date(formData.recurrenceEndDate);
      }

      console.log('📝 Soumission avec données finales:', finalData);

      // Soumission
      await onSubmit(finalData);
      
      // Reset après succès seulement si nouvelle tâche
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
        setManualXP(false);
      }

    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Titre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Titre de la tâche *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Terminer la présentation client"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez les détails de la tâche..."
              />
            </div>

            {/* Priorité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
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
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyenne</option>
                <option value="hard">Difficile</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            {/* Temps estimé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Temps estimé (heures)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date d'échéance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Projet */}
            {projects.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet associé
                </label>
                <select
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucun projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* XP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Récompense XP
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={formData.xpReward}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }));
                    setManualXP(true);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setManualXP(false);
                    const autoXP = calculateXP(formData.difficulty, formData.priority, formData.recurrenceType);
                    setFormData(prev => ({ ...prev, xpReward: autoXP }));
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Auto
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upload de fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-1" />
              Fichier joint (optionnel)
            </label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Cliquez pour ajouter un fichier
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Images, vidéos ou documents (max 10MB pour images, 100MB pour vidéos)
                </p>
              </div>
            ) : (
              <FilePreview 
                file={selectedFile} 
                onRemove={() => setSelectedFile(null)} 
              />
            )}
          </div>

          {/* Options avancées */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Options avancées</h3>

            {/* Récurrence */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                Tâche récurrente
              </label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fréquence
                  </label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalle
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.recurrenceInterval}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Système volontaires */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOpenToVolunteers"
                checked={formData.isOpenToVolunteers}
                onChange={(e) => setFormData(prev => ({ ...prev, isOpenToVolunteers: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isOpenToVolunteers" className="text-sm font-medium text-gray-700">
                Ouvrir aux volontaires
              </label>
            </div>

            {formData.isOpenToVolunteers && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mode d'acceptation
                  </label>
                  <select
                    value={formData.volunteerAcceptanceMode}
                    onChange={(e) => setFormData(prev => ({ ...prev, volunteerAcceptanceMode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Validation manuelle</option>
                    <option value="automatic">Acceptation automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre max de volontaires
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxVolunteers || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxVolunteers: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Illimité"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes additionnelles
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Informations supplémentaires, instructions spéciales..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading || uploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? 'Upload...' : 'Sauvegarde...'}
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
