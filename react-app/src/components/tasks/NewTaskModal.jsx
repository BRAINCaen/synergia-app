// ==========================================
// 📁 react-app/src/components/tasks/NewTaskModal.jsx
// MODAL CRÉATION TÂCHE COMPLÈTE AVEC UPLOAD FICHIERS VERS FIREBASE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Save, 
  Calendar, 
  Tag, 
  User, 
  AlertTriangle,
  Clock,
  Trophy,
  Paperclip,
  CheckCircle,
  Edit,
  Star,
  Target,
  Shield,
  Repeat,
  Users,
  Info,
  Zap,
  Flag,
  FileText,
  Upload,
  Eye,
  EyeOff,
  MapPin,
  Loader
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { createTaskSafely } from '../../core/services/taskCreationFix.js';
import { storageService } from '../../core/services/storageService.js';

/**
 * 🎭 RÔLES SYNERGIA OFFICIELS
 */
const SYNERGIA_ROLES = {
  game_master: {
    id: 'game_master',
    name: 'Game Master',
    icon: '🕹️',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-purple-600',
    description: 'Animateur des sessions, garant de l\'immersion et satisfaction client'
  },
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🛠️',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-orange-600',
    description: 'Garant du bon état, sécurité et qualité des salles'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '🌟',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    textColor: 'text-yellow-600',
    description: 'Surveillance et valorisation des avis clients'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks',
    icon: '📦',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    description: 'Suivi du matériel et des consommables'
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    textColor: 'text-indigo-600',
    description: 'Coordination et planification des équipes'
  },
  content: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-600',
    description: 'Production de supports visuels et médias'
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-600',
    description: 'Accompagnement et développement des compétences'
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats',
    icon: '🤝',
    color: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    textColor: 'text-teal-600',
    description: 'Relations et collaborations externes'
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    icon: '📱',
    color: 'bg-gradient-to-r from-sky-500 to-blue-500',
    textColor: 'text-sky-600',
    description: 'Gestion des réseaux et visibilité'
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B',
    icon: '💼',
    color: 'bg-gradient-to-r from-gray-600 to-gray-700',
    textColor: 'text-gray-600',
    description: 'Relations commerciales entreprises'
  }
};

const NewTaskModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  mode = 'create',
  initialData = null
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'medium',
    category: 'general',
    status: 'todo',
    dueDate: '',
    scheduledDate: '',
    estimatedHours: 1,
    xpReward: 25,
    roleId: '',
    tags: [],
    openToVolunteers: true,
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceDays: [],
    recurrenceEndDate: '',
    projectId: '',
    attachments: [],
    notes: ''
  });

  // ✅ CALCUL AUTOMATIQUE DES XP
  useEffect(() => {
    const baseXP = {
      easy: 15,
      medium: 25,
      hard: 40
    }[formData.difficulty] || 25;

    const priorityMultiplier = {
      low: 1.0,
      medium: 1.2,
      high: 1.5
    }[formData.priority] || 1.2;

    const recurrenceMultiplier = formData.isRecurring ? 0.8 : 1.0;
    const calculatedXP = Math.round(baseXP * priorityMultiplier * recurrenceMultiplier);

    setFormData(prev => ({
      ...prev,
      xpReward: Math.max(5, calculatedXP)
    }));
  }, [formData.difficulty, formData.priority, formData.isRecurring]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'medium',
          difficulty: initialData.difficulty || 'medium',
          category: initialData.category || 'general',
          status: initialData.status || 'todo',
          dueDate: initialData.dueDate ? (
            typeof initialData.dueDate === 'string' ? initialData.dueDate : 
            initialData.dueDate.toISOString ? initialData.dueDate.toISOString().split('T')[0] :
            initialData.dueDate.seconds ? new Date(initialData.dueDate.seconds * 1000).toISOString().split('T')[0] :
            ''
          ) : '',
          scheduledDate: initialData.scheduledDate ? (
            typeof initialData.scheduledDate === 'string' ? initialData.scheduledDate : 
            initialData.scheduledDate.toISOString ? initialData.scheduledDate.toISOString().split('T')[0] :
            initialData.scheduledDate.seconds ? new Date(initialData.scheduledDate.seconds * 1000).toISOString().split('T')[0] :
            ''
          ) : '',
          estimatedHours: initialData.estimatedHours || 1,
          xpReward: initialData.xpReward || 25,
          roleId: initialData.roleId || '',
          tags: Array.isArray(initialData.tags) ? initialData.tags : [],
          openToVolunteers: initialData.openToVolunteers !== undefined ? initialData.openToVolunteers : true,
          isRecurring: initialData.isRecurring || false,
          recurrenceType: initialData.recurrenceType || 'none',
          recurrenceInterval: initialData.recurrenceInterval || 1,
          recurrenceDays: Array.isArray(initialData.recurrenceDays) ? initialData.recurrenceDays : [],
          recurrenceEndDate: initialData.recurrenceEndDate ? (
            typeof initialData.recurrenceEndDate === 'string' ? initialData.recurrenceEndDate :
            initialData.recurrenceEndDate.toISOString ? initialData.recurrenceEndDate.toISOString().split('T')[0] :
            initialData.recurrenceEndDate.seconds ? new Date(initialData.recurrenceEndDate.seconds * 1000).toISOString().split('T')[0] :
            ''
          ) : '',
          projectId: initialData.projectId || '',
          attachments: Array.isArray(initialData.attachments) ? initialData.attachments : [],
          notes: initialData.notes || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          difficulty: 'medium',
          category: 'general',
          status: 'todo',
          dueDate: '',
          scheduledDate: '',
          estimatedHours: 1,
          xpReward: 25,
          roleId: '',
          tags: [],
          openToVolunteers: true,
          isRecurring: false,
          recurrenceType: 'none',
          recurrenceInterval: 1,
          recurrenceDays: [],
          recurrenceEndDate: '',
          projectId: '',
          attachments: [],
          notes: ''
        });
      }
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);
      setError('');
      setTagInput('');
      setShowAdvanced(false);
    }
  }, [isOpen, mode, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleRecurrenceDay = (day) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  // ✅ NOUVELLE FONCTION : Upload du fichier vers Firebase Storage
  const uploadFileToStorage = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log('📤 Upload fichier vers Firebase Storage:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
      });

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload vers Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const path = `tasks/attachments/${fileName}`;
      
      const uploadResult = await storageService.uploadFile(selectedFile, path);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadResult.success) {
        console.log('✅ Upload réussi:', uploadResult.url);
        
        return {
          name: selectedFile.name,
          url: uploadResult.url,
          path: uploadResult.path,
          type: selectedFile.type,
          size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedAt: new Date().toISOString()
        };
      } else {
        throw new Error('Upload échoué');
      }

    } catch (error) {
      console.error('❌ Erreur upload fichier:', error);
      
      if (error.message.includes('CORS')) {
        setError('⚠️ Problème de connexion détecté. La tâche sera créée sans fichier.');
      } else {
        setError(`Erreur upload: ${error.message}`);
      }
      
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    setTagInput('');
    setSelectedFile(null);
    setShowAdvanced(false);
    setUploadProgress(0);
    setUploading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Utilisateur non connecté. Veuillez vous reconnecter.');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // ✅ ÉTAPE 1 : Upload du fichier si présent
      let uploadedAttachment = null;
      if (selectedFile) {
        console.log('📤 Upload du fichier avant création de la tâche...');
        uploadedAttachment = await uploadFileToStorage();
        
        if (!uploadedAttachment) {
          console.warn('⚠️ Upload échoué, création de la tâche sans fichier');
        }
      }

      // ✅ ÉTAPE 2 : Préparer les données avec l'attachment uploadé
      const attachments = uploadedAttachment 
        ? [uploadedAttachment] 
        : (Array.isArray(formData.attachments) ? formData.attachments : []);

      const cleanedData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority || 'medium',
        difficulty: formData.difficulty || 'medium',
        category: formData.category || 'general',
        status: formData.status || 'todo',
        xpReward: formData.xpReward,
        estimatedHours: parseFloat(formData.estimatedHours) || 1,
        roleId: formData.roleId || null,
        dueDate: formData.dueDate || null,
        scheduledDate: formData.scheduledDate || null,
        openToVolunteers: Boolean(formData.openToVolunteers),
        isRecurring: Boolean(formData.isRecurring),
        recurrenceType: formData.isRecurring ? formData.recurrenceType : 'none',
        recurrenceInterval: formData.isRecurring ? parseInt(formData.recurrenceInterval) || 1 : 1,
        recurrenceDays: formData.isRecurring ? formData.recurrenceDays : [],
        recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate ? formData.recurrenceEndDate : null,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        projectId: formData.projectId || null,
        attachments: attachments, // ✅ Attachments avec URL Firebase
        notes: formData.notes?.trim() || '',
        createdBy: initialData?.createdBy || user.uid,
        creatorName: initialData?.creatorName || user.displayName || user.email || 'Utilisateur',
        updatedAt: new Date()
      };

      if (mode === 'edit' && initialData?.id) {
        cleanedData.id = initialData.id;
        cleanedData.createdAt = initialData.createdAt;
      } else {
        cleanedData.createdAt = new Date();
      }

      console.log('📝 Création tâche avec attachments:', {
        title: cleanedData.title,
        hasAttachments: attachments.length > 0,
        attachmentsCount: attachments.length
      });
      
      // ✅ ÉTAPE 3 : Créer la tâche
      const result = await createTaskSafely(cleanedData, user);
      
      if (result && result.success) {
        if (onSuccess) {
          onSuccess(result.task || result);
        }
        handleClose();
        if (window.showNotification) {
          window.showNotification(
            mode === 'edit' ? 'Tâche modifiée avec succès !' : 'Tâche créée avec succès !', 
            'success'
          );
        }
      } else {
        const errorMsg = result?.message || result?.error || `Erreur lors de la ${mode === 'edit' ? 'modification' : 'création'}`;
        setError(errorMsg);
      }
      
    } catch (error) {
      console.error('Erreur traitement tâche:', error);
      setError(`Erreur technique lors de la ${mode === 'edit' ? 'modification' : 'création'}`);
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start sm:items-center sm:justify-center z-50 p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-none sm:rounded-xl shadow-xl w-full max-w-[375px] sm:max-w-[95vw] md:max-w-4xl h-[100vh] sm:h-auto sm:max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  {mode === 'edit' ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {mode === 'edit' ? 'Modifier la tâche' : 'Nouvelle tâche'}
                  </h2>
                  <p className="text-sm text-white text-opacity-80">
                    Les XP sont calculés automatiquement
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body avec scroll */}
          <div className="flex-1 overflow-y-auto">
            <form className="p-6 space-y-6">
              
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Star className="w-4 h-4 inline mr-2 text-indigo-600" />
                  Titre de la tâche *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Nettoyer la salle 2"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez la tâche en détail..."
                  rows="4"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              {/* Priorité et Difficulté */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Flag className="w-4 h-4 inline mr-2" />
                    Priorité
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="low">🟢 Basse</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🔴 Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Difficulté
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  >
                    <option value="easy">⭐ Facile (15 XP)</option>
                    <option value="medium">⭐⭐ Moyenne (25 XP)</option>
                    <option value="hard">⭐⭐⭐ Difficile (40 XP)</option>
                  </select>
                </div>
              </div>

              {/* XP calculés automatiquement */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Récompense : {formData.xpReward} XP
                    </div>
                    <div className="text-sm text-gray-600">
                      Calculé automatiquement selon la priorité et la difficulté
                    </div>
                  </div>
                </div>
              </div>

              {/* Rôle Synergia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Rôle Synergia
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(SYNERGIA_ROLES).map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, roleId: role.id }))}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.roleId === role.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{role.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {role.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {role.description}
                          </div>
                        </div>
                        {formData.roleId === role.id && (
                          <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ SECTION UPLOAD FICHIER */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Paperclip className="w-4 h-4 inline mr-2" />
                  Pièce jointe (optionnelle)
                </label>
                
                {selectedFile ? (
                  <div className="space-y-3">
                    {/* Aperçu fichier sélectionné */}
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                      <Paperclip className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium flex-1 truncate">{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadProgress(0);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    {/* Barre de progression lors de l'upload */}
                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Upload en cours...</span>
                          <span className="text-indigo-600 font-medium">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Vérifier la taille (10MB max)
                          if (file.size > 10 * 1024 * 1024) {
                            setError('Le fichier ne peut pas dépasser 10MB');
                            e.target.value = '';
                            return;
                          }
                          setSelectedFile(file);
                          setError('');
                        }
                      }}
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Choisir un fichier
                    </button>
                    <p className="text-xs text-gray-500">
                      Photos, vidéos, PDF ou documents (max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Options avancées */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAdvanced ? 'Masquer' : 'Options avancées'}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-6 pt-4 border-t border-gray-200">
                    {/* Date d'échéance */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date d'échéance
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    {/* Temps estimé */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Temps estimé (heures)
                      </label>
                      <input
                        type="number"
                        name="estimatedHours"
                        value={formData.estimatedHours}
                        onChange={handleInputChange}
                        min="0.5"
                        step="0.5"
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Tags
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Ajouter un tag"
                          className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:text-indigo-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ouverte aux volontaires */}
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <input
                        type="checkbox"
                        id="openToVolunteers"
                        name="openToVolunteers"
                        checked={formData.openToVolunteers}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="openToVolunteers" className="flex-1 text-sm">
                        <div className="font-medium text-gray-900">Ouverte aux volontaires</div>
                        <div className="text-gray-600 text-xs">
                          Les membres de l'équipe pourront se porter volontaires
                        </div>
                      </label>
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>

                    {/* Récurrence */}
                    <div className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="isRecurring" className="flex-1 text-sm">
                        <div className="font-medium text-gray-900">Tâche récurrente</div>
                        <div className="text-gray-600 text-xs">
                          La tâche se répètera automatiquement
                        </div>
                      </label>
                      <Repeat className="w-5 h-5 text-purple-600" />
                    </div>

                    {formData.isRecurring && (
                      <div className="space-y-4 pl-4 border-l-4 border-purple-200">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type de récurrence
                          </label>
                          <select
                            name="recurrenceType"
                            value={formData.recurrenceType}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                          >
                            <option value="daily">Quotidienne</option>
                            <option value="weekly">Hebdomadaire</option>
                            <option value="monthly">Mensuelle</option>
                          </select>
                        </div>

                        {formData.recurrenceType === 'weekly' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Jours de la semaine
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => toggleRecurrenceDay(index)}
                                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    formData.recurrenceDays.includes(index)
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date de fin de récurrence
                          </label>
                          <input
                            type="date"
                            name="recurrenceEndDate"
                            value={formData.recurrenceEndDate}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Notes supplémentaires
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Notes internes, instructions spéciales..."
                        rows="3"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                {uploadProgress > 0 && uploadProgress < 100 && uploading && (
                  <span className="text-indigo-600 font-medium">
                    Upload en cours: {uploadProgress}%
                  </span>
                )}
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading || uploading}
                  className="flex-1 sm:flex-none px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Annuler
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim() || uploading}
                  className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 justify-center"
                >
                  {loading || uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      {uploading ? 'Upload...' : mode === 'edit' ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mode === 'edit' ? 'Modifier' : 'Créer'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewTaskModal;
