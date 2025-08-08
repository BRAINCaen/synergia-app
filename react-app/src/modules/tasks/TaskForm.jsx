// ==========================================
// 📁 react-app/src/modules/tasks/TaskForm.jsx
// FORMULAIRE COMPLET AVEC PROJET ET TOUTES FONCTIONNALITÉS
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
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
  Repeat,
  Info,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  FileVideo,
  Loader,
  FolderPlus,
  Search
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import { storageService } from '../../core/services/storageService';
import { projectService } from '../../core/services/projectService';

/**
 * 🎭 RÔLES SYNERGIA
 */
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-yellow-500'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500'
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-purple-500'
  },
  content: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-pink-500'
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-green-500'
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500'
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux',
    icon: '📱',
    color: 'bg-cyan-500'
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500'
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & XP',
    icon: '🎮',
    color: 'bg-red-500'
  }
};

/**
 * 🔄 CONFIGURATION RÉCURRENCE
 */
const RECURRENCE_OPTIONS = {
  none: { label: 'Tâche unique', multiplier: 1.0 },
  daily: { label: 'Quotidienne', multiplier: 0.6 },
  weekly: { label: 'Hebdomadaire', multiplier: 1.0 },
  monthly: { label: 'Mensuelle', multiplier: 2.0 },
  yearly: { label: 'Annuelle', multiplier: 5.0 }
};

/**
 * 🏆 CALCUL XP AVEC RÉCURRENCE
 */
const calculateXP = (difficulty, priority, recurrence = 'none') => {
  const base = { easy: 15, medium: 25, hard: 40, expert: 60 }[difficulty] || 25;
  const mult = { low: 1, medium: 1.2, high: 1.5, urgent: 2 }[priority] || 1.2;
  const recMult = RECURRENCE_OPTIONS[recurrence]?.multiplier || 1;
  return Math.round(base * mult * recMult);
};

/**
 * 📂 COMPOSANT SÉLECTEUR DE PROJET INTÉGRÉ
 */
const TaskProjectSelector = ({ 
  selectedProjectId, 
  onProjectSelect, 
  onProjectClear,
  className = '' 
}) => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les projets disponibles
  useEffect(() => {
    loadUserProjects();
  }, [user?.uid]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      if (!user?.uid) return;

      console.log('🔄 Chargement projets pour sélecteur...');
      const userProjects = await projectService.getUserProjects(user.uid);
      
      // Filtrer seulement les projets actifs
      const activeProjects = (userProjects || []).filter(project => 
        project.status !== 'completed' && project.status !== 'cancelled'
      );
      
      setProjects(activeProjects);
      console.log('✅ Projets chargés pour sélecteur:', activeProjects.length);
    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Projet sélectionné
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        📂 Rattacher à un projet (optionnel)
      </label>
      
      {/* Bouton de sélection */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          {selectedProject ? (
            <>
              <Folder className="w-4 h-4 mr-2 text-blue-500" />
              <span className="truncate">{selectedProject.title}</span>
              <span className="ml-2 text-xs text-gray-500">
                ({selectedProject.status})
              </span>
            </>
          ) : (
            <>
              <FolderPlus className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-500">Sélectionner un projet...</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {selectedProject && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onProjectClear();
                setShowDropdown(false);
              }}
              className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
              title="Retirer le projet"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <div className="text-gray-400">
            {showDropdown ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {/* Dropdown de sélection */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          
          {/* Barre de recherche */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liste des projets */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <Loader className="w-4 h-4 animate-spin mx-auto mb-1" />
                <div className="text-sm">Chargement...</div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                <div className="text-sm">
                  {searchTerm ? 'Aucun projet trouvé' : 'Aucun projet actif disponible'}
                </div>
                {!searchTerm && (
                  <div className="text-xs text-gray-400 mt-1">
                    Créez un projet d'abord pour pouvoir y rattacher des tâches
                  </div>
                )}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    onProjectSelect(project.id);
                    setShowDropdown(false);
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <Folder className="w-4 h-4 mr-2 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {project.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {project.description || 'Pas de description'}
                        {project.status && (
                          <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            {project.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Option aucun projet */}
          <div className="border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onProjectClear();
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-gray-600"
            >
              <div className="flex items-center">
                <X className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">Aucun projet (tâche indépendante)</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Affichage du projet sélectionné */}
      {selectedProject && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-sm text-blue-800">
            <Link className="w-3 h-3 mr-1" />
            <span>Rattachée au projet : <strong>{selectedProject.title}</strong></span>
          </div>
          {selectedProject.description && (
            <div className="text-xs text-blue-600 mt-1 truncate">
              {selectedProject.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 🎬 COMPOSANT DE PRÉVISUALISATION MÉDIA
 */
const MediaPreview = ({ file, onRemove }) => {
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
      
      {/* Prévisualisation vidéo */}
      {file.type.startsWith('video/') && (
        <div className="flex items-center justify-center w-full h-32 bg-gray-200 rounded-lg mb-2">
          <div className="text-center">
            <Play className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Fichier vidéo</div>
          </div>
        </div>
      )}
      
      {/* Informations du fichier */}
      <div className="text-sm">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          {file.type.startsWith('image/') ? (
            <ImageIcon className="w-4 h-4" />
          ) : (
            <VideoIcon className="w-4 h-4" />
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
 * 📝 FORMULAIRE PRINCIPAL DE CRÉATION/ÉDITION DE TÂCHE
 */
const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData = null,
  submitting = false 
}) => {
  const { user } = useAuthStore();
  
  // ✅ ÉTAT DU FORMULAIRE COMPLET AVEC PROJET
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
    // Projet rattaché
    projectId: null,
    // Récurrence
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: null,
    // Système volontaires
    isOpenToVolunteers: false,
    volunteerAcceptanceMode: 'manual',
    maxVolunteers: null,
    volunteerMessage: ''
  });

  // ✅ ÉTATS UI COMPLETS
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [manualXP, setManualXP] = useState(false);
  
  // ✅ ÉTATS UPLOAD MÉDIA
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ✅ INITIALISATION AVEC DONNÉES EXISTANTES (MODE ÉDITION)
  useEffect(() => {
    if (initialData) {
      console.log('📝 Mode édition - initialisation avec:', initialData);
      setFormData(prev => ({
        ...prev,
        ...initialData,
        tags: initialData.tags || [],
        // Préserver le projectId en mode édition
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
      const autoXP = calculateXP(initialData.difficulty || 'medium', initialData.priority || 'medium', initialData.recurrenceType || 'none');
      if (initialData.xpReward && initialData.xpReward !== autoXP) {
        setManualXP(true);
      }
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
    setFileType(file.type.startsWith('image/') ? 'image' : 'video');
    setError('');
  };

  // ✅ UPLOAD MÉDIA VERS FIREBASE STORAGE
  const uploadMediaFile = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log('📤 Upload média:', selectedFile.name);

      const uploadResult = await storageService.uploadTaskMedia(
        selectedFile,
        user.uid,
        (progress) => setUploadProgress(progress)
      );

      console.log('✅ Média uploadé:', uploadResult);
      return uploadResult;

    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      setError('Erreur lors de l\'upload du média');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ✅ GESTION TAGS
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
      
      console.log('📝 Soumission tâche avec toutes les fonctionnalités:', {
        title: formData.title,
        role: formData.roleId,
        recurring: formData.isRecurring,
        hasMedia: !!selectedFile,
        mediaType: fileType,
        xpReward: formData.xpReward,
        projectId: formData.projectId
      });

      // Upload du média si présent
      let mediaData = null;
      if (selectedFile) {
        mediaData = await uploadMediaFile();
        if (!mediaData) {
          console.warn('⚠️ Échec upload média, création tâche sans média');
        }
      }

      // ✅ PRÉPARER TOUTES LES DONNÉES DE LA TÂCHE AVEC PROJET
      const taskData = {
        ...formData,
        // Métadonnées de base
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        
        // Projet rattaché
        projectId: formData.projectId || null,
        
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
        
        // Compatibilité avec l'ancien système
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
        
        // Statut par défaut
        status: 'todo',
        assignedTo: []
      };

      console.log('✅ Données tâche préparées:', taskData);

      // Appeler la fonction de soumission
      await onSubmit(taskData);
      
      // Réinitialiser le formulaire
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
        isOpenToVolunteers: false,
        volunteerAcceptanceMode: 'manual',
        maxVolunteers: null,
        volunteerMessage: ''
      });
      
      setSelectedFile(null);
      setFileType(null);
      setCurrentTag('');
      setManualXP(false);
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError(`Erreur lors de la création: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ne pas afficher si pas ouvert
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {initialData ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                </h2>
                <p className="text-sm text-gray-500">
                  Formulaire complet avec XP auto, récurrence, rôles, projet et upload média
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading || uploading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Formulaire avec scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-6 space-y-6">
            
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* ✅ INFORMATIONS DE BASE */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Vérifier les stocks de boissons"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez précisément ce qui doit être fait, les étapes, les outils nécessaires..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                  required
                />
              </div>

              {/* ✅ SÉLECTEUR DE PROJET */}
              <TaskProjectSelector
                selectedProjectId={formData.projectId}
                onProjectSelect={(projectId) => setFormData(prev => ({ ...prev, projectId }))}
                onProjectClear={() => setFormData(prev => ({ ...prev, projectId: null }))}
              />
            </div>

            {/* ✅ PARAMÈTRES ET PRIORITÉ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                >
                  <option value="low">📝 Basse</option>
                  <option value="medium">📌 Moyenne</option>
                  <option value="high">⚡ Haute</option>
                  <option value="urgent">🔥 Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulté
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                >
                  <option value="easy">🟢 Facile</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="hard">🟠 Difficile</option>
                  <option value="expert">🔴 Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle Synergia
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                >
                  <option value="">Aucun rôle spécifique</option>
                  {Object.values(SYNERGIA_ROLES).map(role => (
                    <option key={role.id} value={role.id}>
                      {role.icon} {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ XP ET TEMPS ESTIMÉ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Récompense XP
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.xpReward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!manualXP || loading || uploading}
                  />
                  <button
                    type="button"
                    onClick={() => setManualXP(!manualXP)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      manualXP 
                        ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                        : 'bg-green-100 text-green-800 border border-green-300'
                    }`}
                    disabled={loading || uploading}
                  >
                    {manualXP ? '🔧 Manuel' : '🤖 Auto'}
                  </button>
                </div>
                {!manualXP && (
                  <p className="text-xs text-gray-500 mt-1">
                    Calculé automatiquement selon la difficulté et priorité
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temps estimé (heures)
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                />
              </div>
            </div>

            {/* ✅ DATE D'ÉCHÉANCE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance (optionnelle)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || uploading}
              />
            </div>

            {/* ✅ TAGS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optionnels)
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || uploading}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading || uploading}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Tags actuels */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        disabled={loading || uploading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ RÉCURRENCE */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Tâche récurrente
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isRecurring ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  disabled={loading || uploading}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isRecurring ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de récurrence
                    </label>
                    <select
                      value={formData.recurrenceType}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                    >
                      {Object.entries(RECURRENCE_OPTIONS).filter(([key]) => key !== 'none').map(([key, option]) => (
                        <option key={key} value={key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intervalle
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.recurrenceInterval}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin (optionnelle)
                    </label>
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ✅ UPLOAD MÉDIA */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Joindre un média (optionnel)
              </label>
              
              {!selectedFile ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading || uploading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    disabled={loading || uploading}
                  >
                    <Upload className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      Cliquez pour ajouter une image ou vidéo
                    </span>
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Images: max 10 MB • Vidéos: max 100 MB
                  </p>
                </div>
              ) : (
                <MediaPreview 
                  file={selectedFile} 
                  onRemove={() => {
                    setSelectedFile(null);
                    setFileType(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }} 
                />
              )}

              {uploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Upload en cours...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ✅ SYSTÈME VOLONTAIRES */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  Ouverte aux volontaires
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isOpenToVolunteers: !prev.isOpenToVolunteers }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isOpenToVolunteers ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  disabled={loading || uploading}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isOpenToVolunteers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.isOpenToVolunteers && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode d'acceptation
                    </label>
                    <select
                      value={formData.volunteerAcceptanceMode}
                      onChange={(e) => setFormData(prev => ({ ...prev, volunteerAcceptanceMode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                    >
                      <option value="manual">Validation manuelle</option>
                      <option value="auto">Acceptation automatique</option>
                      <option value="first_come">Premier arrivé, premier servi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre max de volontaires (optionnel)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.maxVolunteers || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxVolunteers: e.target.value ? parseInt(e.target.value) : null }))}
                      placeholder="Illimité"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message pour les volontaires (optionnel)
                    </label>
                    <textarea
                      value={formData.volunteerMessage}
                      onChange={(e) => setFormData(prev => ({ ...prev, volunteerMessage: e.target.value }))}
                      placeholder="Ex: Cette tâche nécessite une formation préalable..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading || uploading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ✅ NOTES ADDITIONNELLES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes additionnelles (optionnelles)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations complémentaires, liens, références..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || uploading}
              />
            </div>
          </div>

          {/* ✅ BOUTONS D'ACTION */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={loading || uploading || submitting || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {(loading || uploading || submitting) ? (
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

// ✅ EXPORTS POUR BUILD
export default TaskForm;
export { TaskForm };
