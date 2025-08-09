// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE COMPLET DE CRÉATION/ÉDITION DE TÂCHE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  X, 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Video,
  Loader,
  Save,
  Sparkles,
  Tag,
  Repeat
} from 'lucide-react';

// Services et stores
import { useAuthStore } from '../../shared/stores/authStore.js';
import { mediaUploadService } from '../../core/services/mediaUploadService.js';
import { projectService } from '../../core/services/projectService.js';

// Constants
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Faible', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Élevée', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Facile', xp: 15 },
  { value: 'medium', label: 'Moyenne', xp: 25 },
  { value: 'hard', label: 'Difficile', xp: 40 },
  { value: 'expert', label: 'Expert', xp: 60 }
];

const SYNERGIA_ROLES = {
  maintenance: { name: 'Entretien & Maintenance', icon: '🔧' },
  reputation: { name: 'Gestion de la Réputation', icon: '⭐' },
  stock: { name: 'Gestion des Stocks', icon: '📦' },
  organization: { name: 'Organisation Interne', icon: '📋' },
  content: { name: 'Création de Contenu', icon: '🎨' },
  mentoring: { name: 'Mentorat & Formation', icon: '🎓' },
  partnerships: { name: 'Partenariats', icon: '🤝' },
  communication: { name: 'Communication', icon: '📢' },
  b2b: { name: 'Relations B2B', icon: '💼' }
};

const RECURRENCE_OPTIONS = {
  none: { label: 'Aucune', multiplier: 1 },
  daily: { label: 'Quotidienne', multiplier: 1.2 },
  weekly: { label: 'Hebdomadaire', multiplier: 1.5 },
  monthly: { label: 'Mensuelle', multiplier: 2 }
};

/**
 * 📎 COMPOSANT APERÇU FICHIER
 */
const FilePreview = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-100 rounded-lg">
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
      
      // Si XP personnalisé
      const defaultXP = DIFFICULTY_OPTIONS.find(d => d.value === initialData.difficulty)?.xp || 25;
      if (initialData.xpReward !== defaultXP) {
        setManualXP(true);
      }
    }
  }, [initialData]);

  // ✅ CHARGER LES PROJETS DISPONIBLES
  useEffect(() => {
    if (user?.uid) {
      loadProjects();
    }
  }, [user?.uid]);

  const loadProjects = async () => {
    try {
      const userProjects = await projectService.getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
    }
  };

  // ✅ MISE À JOUR AUTOMATIQUE XP SELON DIFFICULTÉ
  useEffect(() => {
    if (!manualXP && formData.difficulty) {
      const difficultyOption = DIFFICULTY_OPTIONS.find(d => d.value === formData.difficulty);
      if (difficultyOption) {
        setFormData(prev => ({ ...prev, xpReward: difficultyOption.xp }));
      }
    }
  }, [formData.difficulty, manualXP]);

  // ✅ UPLOAD DE FICHIER MÉDIA
  const uploadMediaFile = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploading(true);
      console.log('📤 Upload média:', selectedFile.name);
      
      const uploadResult = await mediaUploadService.uploadFile(selectedFile, {
        folder: 'tasks',
        userId: user.uid,
        taskTitle: formData.title
      });
      
      console.log('✅ Média uploadé:', uploadResult);
      return {
        url: uploadResult.url,
        type: selectedFile.type.startsWith('image/') ? 'image' : 
              selectedFile.type.startsWith('video/') ? 'video' : 'file',
        filename: selectedFile.name,
        size: selectedFile.size
      };
      
    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      
      if (error.message?.includes('too large')) {
        setError('Fichier trop volumineux (max 10MB)');
      } else {
        console.warn('⚠️ Upload échoué, tâche créée sans média');
        setError('Upload échoué, la tâche sera créée sans média.');
        return null;
      }
      
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // ✅ SOUMISSION DU FORMULAIRE COMPLÈTE
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('La description est obligatoire');
      return;
    }
    
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('📝 Soumission tâche complète:', {
        title: formData.title,
        role: formData.roleId,
        recurring: formData.isRecurring,
        hasMedia: !!selectedFile,
        xpReward: formData.xpReward
      });

      // Upload du média si présent
      let mediaData = null;
      if (selectedFile) {
        mediaData = await uploadMediaFile();
      }

      // ✅ PRÉPARER TOUTES LES DONNÉES DE LA TÂCHE
      const taskData = {
        ...formData,
        // Métadonnées de base
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        
        // Rôle Synergia
        category: formData.roleId,
        roleId: formData.roleId,
        roleName: SYNERGIA_ROLES[formData.roleId]?.name || null,
        
        // Média (si présent)
        hasMedia: !!mediaData,
        mediaUrl: mediaData?.url || null,
        mediaType: mediaData?.type || null,
        mediaFilename: mediaData?.filename || null,
        mediaSize: mediaData?.size || null,
        
        // Compatibilité ancien système
        hasPhoto: !!mediaData && mediaData.type === 'image',
        photoUrl: mediaData?.type === 'image' ? mediaData.url : null,
        hasVideo: !!mediaData && mediaData.type === 'video',
        videoUrl: mediaData?.type === 'video' ? mediaData.url : null,
        
        // Dates
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
        
        // Configuration récurrence
        recurrenceConfig: formData.isRecurring ? {
          type: formData.recurrenceType,
          interval: formData.recurrenceInterval,
          endDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
          maxOccurrences: formData.maxOccurrences,
          xpMultiplier: RECURRENCE_OPTIONS[formData.recurrenceType]?.multiplier || 1
        } : null,
        
        // Configuration système volontaires
        isOpenToVolunteers: formData.isOpenToVolunteers,
        volunteerSystem: formData.isOpenToVolunteers ? {
          acceptanceMode: formData.volunteerAcceptanceMode,
          maxVolunteers: formData.maxVolunteers,
          message: formData.volunteerMessage
        } : null,
        
        // Statut initial
        status: 'todo',
        assignedTo: [],
        volunteers: [],
        
        // Dates système
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Appeler la fonction de soumission
      await onSubmit(taskData);
      
      console.log('✅ Tâche soumise avec succès');
      
      // Reset formulaire
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

  // ✅ GESTION FICHIER
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Fichier trop volumineux (max 10MB)');
        return;
      }
      
      console.log('📎 Fichier sélectionné:', file.name, file.type);
      setSelectedFile(file);
      setError('');
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
                  placeholder="Décrivez précisément ce qui doit être fait, les étapes, les ressources nécessaires..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={loading || uploading}
                  required
                />
              </div>

              {/* Priorité et Difficulté */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {PRIORITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                    {DIFFICULTY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.xp} XP)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Rôle Synergia */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Rôle Synergia
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domaine d'expertise
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading || uploading}
                >
                  <option value="">Sélectionner un domaine...</option>
                  {Object.entries(SYNERGIA_ROLES).map(([id, role]) => (
                    <option key={id} value={id}>
                      {role.icon} {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Configuration XP */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Récompense XP
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points d'expérience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={formData.xpReward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 25 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading || !manualXP}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="manualXP"
                    checked={manualXP}
                    onChange={(e) => setManualXP(e.target.checked)}
                    className="mr-2"
                    disabled={loading || uploading}
                  />
                  <label htmlFor="manualXP" className="text-sm text-gray-600">
                    XP personnalisé
                  </label>
                </div>
              </div>
            </div>

            {/* Dates et temps */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Planning
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date limite (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps estimé (heures)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="40"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading || uploading}
                  />
                </div>
              </div>
            </div>

            {/* Tâche récurrente */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Repeat className="w-5 h-5 text-indigo-600" />
                Récurrence
              </h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="mr-2"
                  disabled={loading || uploading}
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                  Cette tâche est récurrente
                </label>
              </div>

              {formData.isRecurring && (
                <div className="pl-6 space-y-4 border-l-2 border-indigo-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de récurrence
                      </label>
                      <select
                        value={formData.recurrenceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={loading || uploading}
                      >
                        {Object.entries(RECURRENCE_OPTIONS).filter(([key]) => key !== 'none').map(([key, option]) => (
                          <option key={key} value={key}>
                            {option.label} (×{option.multiplier} XP)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin (optionnel)
                      </label>
                      <input
                        type="date"
                        value={formData.recurrenceEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={loading || uploading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Projet lié */}
            {projects.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Projet
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lier à un projet (optionnel)
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
            )}

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-600" />
                Tags
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading || uploading}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || loading || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Ajouter
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
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

            {/* Upload média */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Média (optionnel)
              </h3>
              
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading || uploading}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Cliquez pour ajouter une image, vidéo ou document
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 10MB • JPG, PNG, MP4, PDF, DOC
                  </p>
                </button>

                {selectedFile && (
                  <FilePreview 
                    file={selectedFile} 
                    onRemove={() => setSelectedFile(null)} 
                  />
                )}
              </div>
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
