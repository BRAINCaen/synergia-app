// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE - TOUTES FONCTIONNALITÉS RESTAURÉES
// ==========================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Users,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  Calendar,
  Target,
  Zap,
  Trophy,
  Archive,
  Repeat,
  MessageCircle,
  Upload,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Award,
  Bell,
  Flag,
  Tag,
  User,
  UserMinus,
  X,
  Save,
  AlertTriangle,
  Paperclip,
  FileText,
  EyeOff,
  ChevronRight,
  Building,
  Globe,
  MapPin,
  Video,
  Image as ImageIcon,
  Play
} from 'lucide-react';

// ✅ IMPORTS SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ✅ IMPORT RÔLES SYNERGIA COMPLETS
import { SYNERGIA_ROLES } from '../core/data/roles.js';

// ✅ IMPORT DU MODAL CORRIGÉ
import TaskDetailModal from '../components/tasks/TaskDetailsModal.jsx';

// ✅ SERVICE D'UPLOAD MÉDIA
import { storageService } from '../core/services/storageService.js';

/**
 * 🔄 CONFIGURATION RÉCURRENCE COMPLÈTE
 */
const RECURRENCE_OPTIONS = {
  none: { label: 'Tâche unique', multiplier: 1.0 },
  daily: { label: 'Quotidienne', multiplier: 0.6 },
  weekly: { label: 'Hebdomadaire', multiplier: 1.0 },
  monthly: { label: 'Mensuelle', multiplier: 2.0 },
  yearly: { label: 'Annuelle', multiplier: 5.0 }
};

/**
 * 🏆 CALCUL XP AUTOMATIQUE AVEC RÉCURRENCE
 */
const calculateXP = (difficulty, priority, recurrence = 'none') => {
  const base = { 
    easy: 15, 
    normal: 25, 
    medium: 25, 
    hard: 40, 
    expert: 60 
  }[difficulty] || 25;
  
  const mult = { 
    low: 1, 
    medium: 1.2, 
    high: 1.5, 
    urgent: 2 
  }[priority] || 1.2;
  
  const recMult = RECURRENCE_OPTIONS[recurrence]?.multiplier || 1;
  return Math.round(base * mult * recMult);
};

/**
 * 🎮 PAGE TÂCHES COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
 */
const TasksPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // ✅ ÉTATS PRINCIPAUX
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✅ NOUVEAUX ÉTATS POUR COMMENTAIRES
  const [taskComments, setTaskComments] = useState({}); // {taskId: count}
  // ✅ ÉTATS UI COMPLETS
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // ✅ ÉTATS MODALS
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // ✅ FORMULAIRE COMPLET
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'normal',
    roleId: '',
    xpReward: 25,
    estimatedHours: 1,
    dueDate: '',
    tags: [],
    notes: '',
    // ✅ RÉCURRENCE
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: null,
    // ✅ SYSTÈME VOLONTAIRES
    isOpenToVolunteers: true,
    volunteerAcceptanceMode: 'manual',
    maxVolunteers: null,
    volunteerMessage: '',
    // ✅ MÉDIAS
    hasMedia: false,
    mediaUrl: null,
    mediaType: null,
    mediaFilename: null
  });
  
  // ✅ ÉTATS UPLOAD
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // ✅ AUTRES ÉTATS
  const [tagInput, setTagInput] = useState('');
  const [manualXP, setManualXP] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ CHARGEMENT TEMPS RÉEL DES TÂCHES
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('📋 Chargement tâches temps réel...');
    setLoading(true);

    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() };
        tasksData.push(task);
      });
      
      console.log(`📋 ${tasksData.length} tâches chargées`);
      setTasks(tasksData);
      
      // ✅ CHARGER LES COMMENTAIRES POUR CHAQUE TÂCHE
      loadTaskComments(tasksData);
      
      setLoading(false);
    }, (error) => {
      console.error('❌ Erreur chargement tâches:', error);
      setError('Impossible de charger les tâches');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // ✅ FONCTION POUR CHARGER LES COMMENTAIRES DE TOUTES LES TÂCHES
  const loadTaskComments = async (tasksData) => {
    console.log('💬 Chargement commentaires pour', tasksData.length, 'tâches...');
    
    try {
      const commentsMap = {};
      
      // Charger les commentaires pour chaque tâche
      for (const task of tasksData) {
        try {
          const commentsQuery = query(
            collection(db, 'comments'),
            where('entityType', '==', 'task'),
            where('entityId', '==', task.id)
          );
          
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentCount = commentsSnapshot.size;
          
          if (commentCount > 0) {
            commentsMap[task.id] = commentCount;
            console.log(`💬 Tâche "${task.title}": ${commentCount} commentaires`);
          }
          
        } catch (error) {
          console.warn('❌ Erreur chargement commentaires pour tâche', task.id, ':', error);
        }
      }
      
      setTaskComments(commentsMap);
      console.log('💬 Commentaires chargés pour', Object.keys(commentsMap).length, 'tâches');
      
    } catch (error) {
      console.error('❌ Erreur chargement commentaires globaux:', error);
    }
  };

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
      setError(`Le fichier ne peut pas dépasser ${file.type.startsWith('video/') ? '100MB' : '10MB'}`);
      return;
    }

    // Vérifier le type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non supporté. Utilisez JPG, PNG, GIF, MP4, WebM, MOV ou AVI.');
      return;
    }

    setSelectedFile(file);
    setFileType(file.type.startsWith('video/') ? 'video' : 'image');
    setError('');
  };

  // ✅ UPLOAD DU FICHIER MÉDIA
  const uploadMediaFile = async () => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log('📤 Upload média:', selectedFile.name, selectedFile.type);

      const path = `tasks/media/${Date.now()}_${selectedFile.name}`;
      const result = await storageService.uploadFile(selectedFile, path, (progress) => {
        setUploadProgress(progress);
      });

      console.log('✅ Média uploadé:', result);

      return {
        url: result.downloadURL,
        type: fileType,
        filename: selectedFile.name,
        size: selectedFile.size,
        path: path
      };

    } catch (error) {
      console.error('❌ Erreur upload média:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ✅ FILTRAGE ET TRI DES TÂCHES
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Filtrage par onglet
    switch (activeTab) {
      case 'my':
        filtered = tasks.filter(t => 
          t.assignedTo === user?.uid || 
          t.createdBy === user?.uid ||
          (Array.isArray(t.assignedTo) && t.assignedTo.includes(user?.uid))
        );
        break;
      case 'available':
        filtered = tasks.filter(t => 
          !t.assignedTo || 
          t.assignedTo === null || 
          t.assignedTo === '' ||
          t.isOpenToVolunteers === true
        );
        break;
      case 'others':
        filtered = tasks.filter(t => 
          t.assignedTo && 
          t.assignedTo !== user?.uid && 
          t.createdBy !== user?.uid &&
          (!Array.isArray(t.assignedTo) || !t.assignedTo.includes(user?.uid))
        );
        break;
      case 'history':
        filtered = tasks.filter(t => 
          t.status === 'completed' || 
          t.status === 'validated'
        );
        break;
      default:
        filtered = tasks;
    }

    // Filtrage par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        SYNERGIA_ROLES[task.roleId]?.name?.toLowerCase().includes(term)
      );
    }

    // Filtrage par rôle Synergia
    if (selectedRole) {
      filtered = filtered.filter(task => task.roleId === selectedRole);
    }

    // Filtrage par priorité
    if (selectedPriority) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Filtrage par statut
    if (selectedStatus) {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Gestion des dates
      if (sortBy === 'dueDate' || sortBy === 'createdAt') {
        aVal = aVal ? new Date(aVal.seconds ? aVal.seconds * 1000 : aVal) : new Date(0);
        bVal = bVal ? new Date(bVal.seconds ? bVal.seconds * 1000 : bVal) : new Date(0);
      }

      // Gestion des strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase() || '';
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    return filtered;
  }, [tasks, activeTab, searchTerm, selectedRole, selectedPriority, selectedStatus, sortBy, sortOrder, user?.uid]);

  // ✅ GESTION DES TAGS
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ✅ OUVERTURE MODAL CONSULTATION
  const handleViewTask = (task) => {
    console.log('👁️ Consultation tâche:', task.title);
    setSelectedTask(task);
    setEditMode(false);
    setShowDetailModal(true);
  };

  // ✅ OUVERTURE MODAL MODIFICATION
  const handleEditTask = (task) => {
    console.log('✏️ Modification tâche:', task.title);
    setSelectedTask(task);
    setEditMode(true);
    
    // Pré-remplir le formulaire
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      difficulty: task.difficulty || 'normal',
      roleId: task.roleId || '',
      xpReward: task.xpReward || 25,
      estimatedHours: task.estimatedHours || 1,
      dueDate: task.dueDate ? new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate).toISOString().split('T')[0] : '',
      tags: task.tags || [],
      notes: task.notes || '',
      isRecurring: task.isRecurring || false,
      recurrenceType: task.recurrenceType || 'none',
      recurrenceInterval: task.recurrenceInterval || 1,
      recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate.seconds ? task.recurrenceEndDate.seconds * 1000 : task.recurrenceEndDate).toISOString().split('T')[0] : '',
      maxOccurrences: task.maxOccurrences || null,
      isOpenToVolunteers: task.isOpenToVolunteers !== false,
      volunteerAcceptanceMode: task.volunteerAcceptanceMode || 'manual',
      maxVolunteers: task.maxVolunteers || null,
      volunteerMessage: task.volunteerMessage || '',
      hasMedia: task.hasMedia || false,
      mediaUrl: task.mediaUrl || null,
      mediaType: task.mediaType || null,
      mediaFilename: task.mediaFilename || null
    });
    
    setShowCreateModal(true);
  };

  // ✅ SOUMISSION FORMULAIRE COMPLÈTE
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
    
    try {
      setSubmitting(true);
      setError('');

      // Upload du média si présent
      let mediaData = null;
      if (selectedFile) {
        mediaData = await uploadMediaFile();
      }

      // Préparer les données de la tâche
      const taskData = {
        ...formData,
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        status: editMode ? selectedTask.status : 'todo',
        
        // Rôle Synergia
        category: formData.roleId,
        roleId: formData.roleId,
        roleName: SYNERGIA_ROLES[formData.roleId]?.name || null,
        
        // Média
        hasMedia: !!mediaData || formData.hasMedia,
        mediaUrl: mediaData?.url || formData.mediaUrl,
        mediaType: mediaData?.type || formData.mediaType,
        mediaFilename: mediaData?.filename || formData.mediaFilename,
        
        // Compatibilité ancienne
        hasPhoto: (mediaData?.type === 'image') || (formData.mediaType === 'image'),
        photoUrl: (mediaData?.type === 'image' ? mediaData.url : null) || (formData.mediaType === 'image' ? formData.mediaUrl : null),
        hasVideo: (mediaData?.type === 'video') || (formData.mediaType === 'video'),
        videoUrl: (mediaData?.type === 'video' ? mediaData.url : null) || (formData.mediaType === 'video' ? formData.mediaUrl : null),
        
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
        
        // Timestamps
        ...(editMode ? { updatedAt: serverTimestamp() } : { createdAt: serverTimestamp() })
      };

      if (editMode) {
        await updateDoc(doc(db, 'tasks', selectedTask.id), taskData);
        console.log('✅ Tâche modifiée avec succès');
      } else {
        await addDoc(collection(db, 'tasks'), taskData);
        console.log('✅ Tâche créée avec succès');
      }

      // Réinitialiser
      resetForm();
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ RÉINITIALISATION DU FORMULAIRE
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      difficulty: 'normal',
      roleId: '',
      xpReward: 25,
      estimatedHours: 1,
      dueDate: '',
      tags: [],
      notes: '',
      isRecurring: false,
      recurrenceType: 'none',
      recurrenceInterval: 1,
      recurrenceEndDate: '',
      maxOccurrences: null,
      isOpenToVolunteers: true,
      volunteerAcceptanceMode: 'manual',
      maxVolunteers: null,
      volunteerMessage: '',
      hasMedia: false,
      mediaUrl: null,
      mediaType: null,
      mediaFilename: null
    });
    setSelectedFile(null);
    setFileType(null);
    setTagInput('');
    setManualXP(false);
    setError('');
    setEditMode(false);
    setSelectedTask(null);
  };

  // ✅ SUPPRESSION DE TÂCHE
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ Tâche supprimée');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setError('Impossible de supprimer la tâche');
    }
  };

  // ✅ ASSIGNATION À MOI
  const handleAssignToMe = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        assignedTo: user.uid,
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Tâche assignée à moi');
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      setError('Impossible de s\'assigner la tâche');
    }
  };

  // ✅ NOUVEAU: SE RETIRER D'UNE TÂCHE
  const handleUnassignFromMe = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir vous retirer de cette tâche ?')) return;
    
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        setError('Tâche introuvable');
        return;
      }
      
      const taskData = taskDoc.data();
      let newAssignedTo = null;
      
      // Gérer les différents cas d'assignation
      if (Array.isArray(taskData.assignedTo)) {
        // Si c'est un tableau, retirer mon ID
        newAssignedTo = taskData.assignedTo.filter(id => id !== user.uid);
        if (newAssignedTo.length === 0) newAssignedTo = null;
      } else if (taskData.assignedTo === user.uid) {
        // Si c'est juste mon ID, mettre à null
        newAssignedTo = null;
      }
      
      await updateDoc(taskRef, {
        assignedTo: newAssignedTo,
        status: newAssignedTo ? 'in_progress' : 'todo', // Retour en "à faire" si plus personne
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Retiré de la tâche avec succès');
    } catch (error) {
      console.error('❌ Erreur pour se retirer:', error);
      setError('Impossible de se retirer de la tâche');
    }
  };

  // ✅ ONGLETS AVEC COMPTEURS CORRIGÉS
  const tabs = [
    {
      id: 'my',
      label: 'Mes Tâches',
      icon: User,
      count: tasks.filter(t => 
        t.assignedTo === user?.uid || 
        (Array.isArray(t.assignedTo) && t.assignedTo.includes(user?.uid))
      ).length
    },
    {
      id: 'available',
      label: 'Disponibles',
      icon: Heart,
      count: tasks.filter(t => 
        !t.assignedTo || 
        t.assignedTo === null || 
        t.assignedTo === '' ||
        t.isOpenToVolunteers === true
      ).length
    },
    {
      id: 'others',
      label: 'Autres',
      icon: Users,
      count: tasks.filter(t => 
        t.assignedTo && 
        t.assignedTo !== user?.uid && 
        t.createdBy !== user?.uid &&
        (!Array.isArray(t.assignedTo) || !t.assignedTo.includes(user?.uid))
      ).length
    },
    {
      id: 'history',
      label: 'Historique',
      icon: Archive,
      count: tasks.filter(t => 
        t.status === 'completed' || 
        t.status === 'validated'
      ).length
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
            <p className="text-gray-600 mt-1">
              Organisez et suivez vos tâches par rôles Synergia
            </p>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Tâche
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">XP Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0)}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre, description, tags ou rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              {/* Filtre par rôle Synergia */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les rôles</option>
                {Object.values(SYNERGIA_ROLES).map(role => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.name}
                  </option>
                ))}
              </select>

              {/* Filtre par priorité */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>

              {/* Filtre par statut */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous statuts</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="validated">Validée</option>
              </select>

              {/* Tri */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dueDate-asc">Échéance ↑</option>
                <option value="dueDate-desc">Échéance ↓</option>
                <option value="createdAt-desc">Plus récentes</option>
                <option value="createdAt-asc">Plus anciennes</option>
                <option value="xpReward-desc">XP ↓</option>
                <option value="priority-desc">Priorité ↓</option>
              </select>

              {/* Bouton réinitialiser filtres */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('');
                  setSelectedPriority('');
                  setSelectedStatus('');
                  setSortBy('dueDate');
                  setSortOrder('asc');
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                title="Réinitialiser les filtres"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des tâches...</p>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedRole || selectedPriority || selectedStatus
                ? 'Aucune tâche ne correspond aux critères'
                : 'Aucune tâche dans cette catégorie'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'my' && 'Vous n\'avez aucune tâche assignée pour le moment.'}
              {activeTab === 'available' && 'Aucune tâche disponible pour le moment.'}
              {activeTab === 'others' && 'Aucune tâche assignée à d\'autres membres.'}
              {activeTab === 'history' && 'Aucune tâche terminée dans l\'historique.'}
            </p>
            {activeTab === 'my' && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Créer ma première tâche
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedTasks.map((task) => {
              const role = SYNERGIA_ROLES[task.roleId];
              const isMyTask = task.assignedTo === user?.uid || task.createdBy === user?.uid;
              const canEdit = task.createdBy === user?.uid;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  {/* Header de la carte */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {task.title}
                      </h3>
                      
                      {/* Rôle Synergia */}
                      {role && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-sm">{role.icon}</span>
                          <span className="text-xs text-gray-600">{role.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Indicateurs médias et commentaires */}
                    <div className="ml-2 flex items-center gap-1">
                      {/* Média indicator */}
                      {task.hasMedia && (
                        <div title={`${task.mediaType === 'video' ? 'Vidéo' : 'Image'} disponible`}>
                          {task.mediaType === 'video' ? (
                            <Video className="w-4 h-4 text-purple-500" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      )}
                      
                      {/* ✅ BADGE COMMENTAIRES */}
                      {taskComments[task.id] > 0 && (
                        <div 
                          className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                          onClick={() => handleViewTask(task)}
                          title={`${taskComments[task.id]} message${taskComments[task.id] > 1 ? 's' : ''}`}
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span className="text-xs font-medium">{taskComments[task.id]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Métadonnées */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Flag className={`w-4 h-4 ${
                          task.priority === 'urgent' ? 'text-red-500' :
                          task.priority === 'high' ? 'text-orange-500' :
                          task.priority === 'medium' ? 'text-yellow-500' :
                          'text-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600 capitalize">
                          {task.priority === 'urgent' ? 'Urgente' :
                           task.priority === 'high' ? 'Haute' :
                           task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-medium text-gray-900">
                          {task.xpReward || 0} XP
                        </span>
                      </div>
                    </div>

                    {/* Récurrence */}
                    {task.isRecurring && (
                      <div className="flex items-center gap-1">
                        <Repeat className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-purple-600">
                          {RECURRENCE_OPTIONS[task.recurrenceType]?.label || 'Récurrente'}
                        </span>
                      </div>
                    )}

                    {/* Date d'échéance */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-600">
                          {new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Statut */}
                    <div className="flex items-center gap-1">
                      {task.status === 'completed' || task.status === 'validated' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : task.status === 'in_progress' ? (
                        <Clock className="w-4 h-4 text-orange-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-600">
                        {task.status === 'completed' ? 'Terminée' :
                         task.status === 'validated' ? 'Validée' :
                         task.status === 'in_progress' ? 'En cours' :
                         'À faire'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex gap-1">
                      {/* Consultation */}
                      <button
                        onClick={() => handleViewTask(task)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Assignation à moi (disponibles) */}
                      {activeTab === 'available' && !isMyTask && (
                        <button
                          onClick={() => handleAssignToMe(task.id)}
                          className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-lg transition-colors"
                          title="M'assigner cette tâche"
                        >
                          <User className="w-4 h-4" />
                        </button>
                      )}

                      {/* ✅ NOUVEAU: Se retirer de la tâche (mes tâches) */}
                      {activeTab === 'my' && isMyTask && !canEdit && (
                        <button
                          onClick={() => handleUnassignFromMe(task.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Me retirer de cette tâche"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}

                      {/* Modification (propriétaire) */}
                      {canEdit && activeTab !== 'history' && (
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Suppression (propriétaire) */}
                      {canEdit && activeTab !== 'history' && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Indicator de propriété */}
                    {isMyTask && (
                      <div className="text-xs text-blue-600 font-medium">
                        {task.createdBy === user?.uid ? 'Ma tâche' : 'Assignée'}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création/modification */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editMode ? '✏️ Modifier la Tâche' : '➕ Nouvelle Tâche'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Erreur */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700">{error}</p>
                    </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Réorganiser l'espace de stockage"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Description détaillée *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Décrivez précisément ce qui doit être fait..."
                      required
                    />
                  </div>

                  {/* Rôle Synergia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Rôle Synergia *
                    </label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionnez un rôle</option>
                      {Object.values(SYNERGIA_ROLES).map(role => (
                        <option key={role.id} value={role.id}>
                          {role.icon} {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priorité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Flag className="w-4 h-4 inline mr-1" />
                      Priorité
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">🟢 Faible</option>
                      <option value="medium">🟡 Moyenne</option>
                      <option value="high">🟠 Haute</option>
                      <option value="urgent">🔴 Urgente</option>
                    </select>
                  </div>

                  {/* Difficulté */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Star className="w-4 h-4 inline mr-1" />
                      Difficulté
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">🟢 Facile (15 XP)</option>
                      <option value="normal">🟡 Normal (25 XP)</option>
                      <option value="hard">🟠 Difficile (40 XP)</option>
                      <option value="expert">🔴 Expert (60 XP)</option>
                    </select>
                  </div>

                  {/* XP Reward */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Trophy className="w-4 h-4 inline mr-1" />
                      Récompense XP
                      <button
                        type="button"
                        onClick={() => setManualXP(!manualXP)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        {manualXP ? 'Auto' : 'Manuel'}
                      </button>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.xpReward}
                        onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          !manualXP ? 'bg-gray-100 text-gray-500' : ''
                        }`}
                        disabled={!manualXP}
                        min="0"
                        max="1000"
                      />
                      <div className="text-yellow-600 font-bold">
                        {formData.xpReward} XP
                      </div>
                    </div>
                    {!manualXP && (
                      <p className="text-xs text-gray-500 mt-1">
                        XP calculés automatiquement selon difficulté et priorité
                        {formData.isRecurring && formData.recurrenceType !== 'none' 
                          ? ` (×${RECURRENCE_OPTIONS[formData.recurrenceType]?.multiplier} récurrence)` 
                          : ''
                        }
                      </p>
                    )}
                  </div>

                  {/* Temps estimé */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Temps estimé (heures)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0.5"
                      max="40"
                      step="0.5"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Récurrence */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Repeat className="w-5 h-5 text-purple-500" />
                    <h3 className="font-medium text-gray-900">Configuration Récurrence</h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          isRecurring: e.target.checked,
                          recurrenceType: e.target.checked ? 'weekly' : 'none'
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Tâche récurrente</span>
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={formData.recurrenceType}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          {Object.entries(RECURRENCE_OPTIONS).map(([key, option]) => (
                            key !== 'none' && (
                              <option key={key} value={key}>
                                {option.label} (×{option.multiplier} XP)
                              </option>
                            )
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Intervalle</label>
                        <input
                          type="number"
                          value={formData.recurrenceInterval}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="1"
                          max="365"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                        <input
                          type="date"
                          value={formData.recurrenceEndDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Média */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium text-gray-900">Tutoriel ou Exemple (Optionnel)</h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Ajoutez une image ou vidéo pour aider à comprendre la tâche (tutoriel, exemple, référence...)
                  </p>

                  {!selectedFile && !formData.mediaUrl ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Cliquez pour ajouter un fichier
                            </p>
                            <p className="text-xs text-gray-500">
                              Images: JPG, PNG, GIF (max 10MB) • Vidéos: MP4, WebM, MOV (max 100MB)
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Média existant (mode édition) */}
                      {formData.mediaUrl && !selectedFile && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            {formData.mediaType === 'video' ? (
                              <Video className="w-8 h-8 text-purple-500" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-blue-500" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {formData.mediaType === 'video' ? 'Vidéo tutoriel' : 'Image exemple'}
                              </p>
                              <p className="text-sm text-gray-600">{formData.mediaFilename}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ 
                                ...prev, 
                                mediaUrl: null, 
                                mediaType: null, 
                                mediaFilename: null,
                                hasMedia: false 
                              }))}
                              className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Nouveau fichier sélectionné */}
                      {selectedFile && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            {fileType === 'video' ? (
                              <Video className="w-8 h-8 text-purple-500" />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-blue-500" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {fileType === 'video' ? 'Vidéo tutoriel' : 'Image exemple'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setFileType(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Barre de progression upload */}
                          {uploading && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Upload en cours...</span>
                                <span className="text-gray-600">{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bouton pour ajouter/changer fichier */}
                      {(formData.mediaUrl || selectedFile) && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Changer le fichier
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Système volontaires */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h3 className="font-medium text-gray-900">Système Volontaires</h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isOpenToVolunteers}
                        onChange={(e) => setFormData(prev => ({ ...prev, isOpenToVolunteers: e.target.checked }))}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-600">Ouvrir aux volontaires</span>
                    </label>
                  </div>

                  {formData.isOpenToVolunteers && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mode d'acceptation
                        </label>
                        <select
                          value={formData.volunteerAcceptanceMode}
                          onChange={(e) => setFormData(prev => ({ ...prev, volunteerAcceptanceMode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        >
                          <option value="manual">Manuel (validation requise)</option>
                          <option value="auto">Automatique</option>
                          <option value="first_come">Premier arrivé, premier servi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre max de volontaires
                        </label>
                        <input
                          type="number"
                          value={formData.maxVolunteers || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxVolunteers: e.target.value ? parseInt(e.target.value) : null }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Illimité"
                          min="1"
                          max="10"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message aux volontaires
                        </label>
                        <textarea
                          value={formData.volunteerMessage}
                          onChange={(e) => setFormData(prev => ({ ...prev, volunteerMessage: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          rows={2}
                          placeholder="Message d'encouragement ou instructions spéciales..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags (optionnel)
                  </label>
                  
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ajouter un tag..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes internes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notes privées, contexte supplémentaire..."
                  />
                </div>

                {/* Boutons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>

                  <div className="flex items-center gap-3">
                    {/* Résumé XP */}
                    <div className="text-sm text-gray-600">
                      Récompense: <strong className="text-yellow-600">{formData.xpReward} XP</strong>
                      {formData.isRecurring && formData.recurrenceType !== 'none' && (
                        <span className="text-purple-600 ml-1">
                          (×{RECURRENCE_OPTIONS[formData.recurrenceType]?.multiplier} récurrence)
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || uploading}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {editMode ? 'Modification...' : 'Création...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {editMode ? 'Modifier la Tâche' : 'Créer la Tâche'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de détail/consultation */}
      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
          // ✅ RECHARGER LES COMMENTAIRES APRÈS FERMETURE DU MODAL
          if (tasks.length > 0) {
            loadTaskComments(tasks);
          }
        }}
        task={selectedTask}
        currentUser={user}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onTaskUpdate={(updatedTask) => {
          // La mise à jour sera automatique via le listener temps réel
          console.log('Tâche mise à jour:', updatedTask.title);
          // ✅ RECHARGER LES COMMENTAIRES
          if (tasks.length > 0) {
            loadTaskComments(tasks);
          }
        }}
      />
    </div>
  );
};

export default TasksPage;
