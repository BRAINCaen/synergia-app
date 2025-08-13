// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE AVEC FILTRAGE CORRIGÉ
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
  Play,
  Shield
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
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ✅ IMPORT RÔLES SYNERGIA COMPLETS
import { SYNERGIA_ROLES } from '../core/data/roles.js';

// ✅ IMPORT DU MODAL CORRIGÉ
import TaskDetailModal from '../components/tasks/TaskDetailsModal.jsx';

// ✅ SERVICE D'UPLOAD MÉDIA
import { storageService } from '../core/services/storageService.js';

// ✅ FORMULAIRE DE TÂCHE
import TaskForm from '../modules/tasks/TaskForm.jsx';

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
    // Récurrence
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: null,
    // ✅ NOUVEAU : Système volontaires
    isOpenToVolunteers: false,
    volunteerAcceptanceMode: 'manual', // 'manual', 'auto', 'first_come'
    maxVolunteers: null,
    volunteerMessage: ''
  });

  // ✅ ÉTATS UPLOAD MÉDIA
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  // États pour tags
  const [tagInput, setTagInput] = useState('');
  const [manualXP, setManualXP] = useState(false);

  // ✅ CHARGEMENT TEMPS RÉEL DES TÂCHES DEPUIS FIREBASE
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    console.log('🔄 Chargement tâches en temps réel pour:', user.email);

    // ✅ QUERY FIREBASE OPTIMISÉE
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasksData.push({
          id: doc.id,
          ...data
        });
      });

      console.log(`✅ ${tasksData.length} tâches chargées depuis Firebase`);
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

  // ✅ FILTRAGE ET TRI DES TÂCHES SELON LES RÈGLES EXACTES SPÉCIFIÉES
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // ✅ FILTRAGE PAR ONGLET SELON LES RÈGLES SPÉCIFIÉES
    switch (activeTab) {
      case 'my':
        // 📋 MES TÂCHES : uniquement les tâches ASSIGNÉES à l'utilisateur (pas les tâches créées par lui)
        filtered = tasks.filter(t => {
          // Tâche assignée à moi ET pas terminée/validée
          const isAssignedToMe = t.assignedTo === user?.uid || 
                                (Array.isArray(t.assignedTo) && t.assignedTo.includes(user?.uid));
          const isNotCompleted = t.status !== 'completed' && t.status !== 'validated';
          
          return isAssignedToMe && isNotCompleted;
        });
        break;
        
      case 'available':
        // 💝 DISPONIBLES : les tâches ouvertes aux volontaires
        filtered = tasks.filter(t => {
          const isNotCompleted = t.status !== 'completed' && t.status !== 'validated';
          const isOpenToVolunteers = t.isOpenToVolunteers === true;
          const hasNoAssignee = !t.assignedTo || t.assignedTo === null || t.assignedTo === '';
          
          return isNotCompleted && (isOpenToVolunteers || hasNoAssignee);
        });
        break;
        
      case 'others':
        // 👥 AUTRES : les tâches prises par d'autres utilisateurs qui sont volontaires
        filtered = tasks.filter(t => {
          const isNotCompleted = t.status !== 'completed' && t.status !== 'validated';
          const isAssignedToSomeoneElse = t.assignedTo && 
                                         t.assignedTo !== user?.uid && 
                                         (!Array.isArray(t.assignedTo) || !t.assignedTo.includes(user?.uid));
          const isNotCreatedByMe = t.createdBy !== user?.uid;
          
          return isNotCompleted && isAssignedToSomeoneElse && isNotCreatedByMe;
        });
        break;
        
      case 'history':
        // 📚 HISTORIQUE : toutes les tâches terminées et validées
        // Quand une tâche est validée par un admin, elle disparaît des autres onglets et va dans historique
        // avec le nom de celui qui a réalisé la tâche de façon visible !
        filtered = tasks.filter(t => {
          return t.status === 'completed' || t.status === 'validated';
        });
        break;
        
      default:
        filtered = tasks;
    }

    // ✅ FILTRAGE PAR TERME DE RECHERCHE
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        SYNERGIA_ROLES[task.roleId]?.name?.toLowerCase().includes(term) ||
        // Dans l'historique, rechercher aussi par nom du réalisateur
        (activeTab === 'history' && (
          task.completedByName?.toLowerCase().includes(term) ||
          task.validatedByName?.toLowerCase().includes(term)
        ))
      );
    }

    // ✅ FILTRAGE PAR RÔLE SYNERGIA
    if (selectedRole) {
      filtered = filtered.filter(task => task.roleId === selectedRole);
    }

    // ✅ FILTRAGE PAR PRIORITÉ
    if (selectedPriority) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // ✅ FILTRAGE PAR STATUT
    if (selectedStatus) {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // ✅ TRI
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Gestion des dates
      if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'completedAt') {
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

  // ✅ ONGLETS AVEC COMPTEURS CORRIGÉS SELON LES RÈGLES EXACTES
  const tabs = [
    {
      id: 'my',
      label: 'Mes Tâches',
      icon: User,
      count: tasks.filter(t => {
        // uniquement les tâches assignées à l'utilisateur (pas les tâches créées par l'utilisateur)
        const isAssignedToMe = t.assignedTo === user?.uid || 
                              (Array.isArray(t.assignedTo) && t.assignedTo.includes(user?.uid));
        const isNotCompleted = t.status !== 'completed' && t.status !== 'validated';
        return isAssignedToMe && isNotCompleted;
      }).length
    },
    {
      id: 'available',
      label: 'Disponibles',
      icon: Heart,
      count: tasks.filter(t => {
        // les tâches ouvertes aux volontaires
        const isNotCompleted = t.status !== 'completed' && t.status !== 'validated';
        const isOpenToVolunteers = t.isOpenToVolunteers === true;
        const hasNoAssignee = !t.assignedTo || t.assignedTo === null || t.assignedTo === '';
        return isNotCompleted && (isOpenToVolunteers || hasNoAssignee);
      }).length
    },
    {
      id: 'others',
      label: 'Autres',
      icon: Users,
      count: tasks.filter(t => {
        // les tâches prises par d'autres utilisateurs qui sont volontaires
        const isNotCompleted = t.status !== 'completed' && t.status !== 'validated';
        const isAssignedToSomeoneElse = t.assignedTo && 
                                       t.assignedTo !== user?.uid && 
                                       (!Array.isArray(t.assignedTo) || !t.assignedTo.includes(user?.uid));
        const isNotCreatedByMe = t.createdBy !== user?.uid;
        return isNotCompleted && isAssignedToSomeoneElse && isNotCreatedByMe;
      }).length
    },
    {
      id: 'history',
      label: 'Historique',
      icon: Archive,
      count: tasks.filter(t => {
        // toutes les tâches terminées et validées
        return t.status === 'completed' || t.status === 'validated';
      }).length
    }
  ];

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
      dueDate: task.dueDate ? new Date(task.dueDate.seconds ? 
        task.dueDate.seconds * 1000 : task.dueDate
      ).toISOString().split('T')[0] : '',
      tags: task.tags || [],
      notes: task.notes || '',
      isRecurring: task.isRecurring || false,
      recurrenceType: task.recurrenceType || 'none',
      recurrenceInterval: task.recurrenceInterval || 1,
      recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate.seconds ?
        task.recurrenceEndDate.seconds * 1000 : task.recurrenceEndDate
      ).toISOString().split('T')[0] : '',
      isOpenToVolunteers: task.isOpenToVolunteers || false,
      volunteerAcceptanceMode: task.volunteerAcceptanceMode || 'manual',
      maxVolunteers: task.maxVolunteers || null,
      volunteerMessage: task.volunteerMessage || ''
    });
    
    setShowCreateModal(true);
  };

  // ✅ RÉINITIALISER LE FORMULAIRE
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
      isOpenToVolunteers: false,
      volunteerAcceptanceMode: 'manual',
      maxVolunteers: null,
      volunteerMessage: ''
    });
    setSelectedFile(null);
    setFileType(null);
    setTagInput('');
    setSelectedTask(null);
    setEditMode(false);
    setError('');
    setManualXP(false);
  };

  // ✅ SOUMISSION DU FORMULAIRE
  const handleSubmit = async (taskData) => {
    try {
      console.log('📝 Soumission tâche:', taskData);

      const finalTaskData = {
        ...taskData,
        userId: user.uid,
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        userEmail: user.email,
        status: 'todo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedTo: taskData.assignedTo || user.uid
      };

      if (selectedTask) {
        // Modification
        await updateDoc(doc(db, 'tasks', selectedTask.id), {
          ...finalTaskData,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Tâche modifiée avec succès');
      } else {
        // Création
        await addDoc(collection(db, 'tasks'), finalTaskData);
        console.log('✅ Tâche créée avec succès');
      }

      setShowCreateModal(false);
      resetForm();
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError('Erreur lors de la sauvegarde');
    }
  };

  // ✅ SUPPRESSION DE TÂCHE
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ Tâche supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      setError('Impossible de supprimer la tâche');
    }
  };

  // ✅ PRENDRE UNE TÂCHE EN CHARGE
  const handleTakeTask = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        assignedTo: user.uid,
        takenAt: serverTimestamp(),
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche prise en charge avec succès');
    } catch (error) {
      console.error('❌ Erreur pour prendre la tâche:', error);
      setError('Impossible de prendre la tâche en charge');
    }
  };

  // ✅ SE RETIRER D'UNE TÂCHE
  const handleLeaveTask = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        assignedTo: null,
        leftAt: serverTimestamp(),
        status: 'todo',
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Retiré de la tâche avec succès');
    } catch (error) {
      console.error('❌ Erreur pour se retirer:', error);
      setError('Impossible de se retirer de la tâche');
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Terminées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.status === 'completed' || t.status === 'validated').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">XP Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.reduce((total, task) => total + (task.xpReward || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-4 mt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Recherche */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher des tâches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
              {/* Filtre par rôle */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les rôles</option>
                {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
                  <option key={key} value={key}>
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
                <option value="high">Élevée</option>
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
                            <ImageIcon className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      )}
                      
                      {/* Commentaires indicator */}
                      {taskComments[task.id] && (
                        <div className="flex items-center gap-1" title={`${taskComments[task.id]} commentaire(s)`}>
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-blue-600">{taskComments[task.id]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Métadonnées */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Priorité */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority === 'urgent' ? 'Urgente' :
                         task.priority === 'high' ? 'Élevée' :
                         task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>

                      {/* XP */}
                      <div className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">{task.xpReward || 0} XP</span>
                      </div>
                    </div>

                    {/* Date d'échéance */}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(task.dueDate.seconds ? 
                            task.dueDate.seconds * 1000 : task.dueDate
                          ).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* ✅ AFFICHAGE SPÉCIAL POUR L'HISTORIQUE */}
                  {activeTab === 'history' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">
                          {task.status === 'validated' ? 'Validée par un admin' : 'Terminée'}
                        </span>
                      </div>
                      
                      {/* ✅ NOM DU RÉALISATEUR VISIBLE - RÈGLE IMPORTANTE */}
                      {task.completedByName && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1">
                          <User className="w-3 h-3" />
                          <span>Réalisée par : <strong className="text-green-700">{task.completedByName}</strong></span>
                        </div>
                      )}
                      
                      {/* Date de completion */}
                      {task.completedAt && (
                        <div className="text-xs text-gray-600 mb-1">
                          📅 Terminée le {new Date(task.completedAt.seconds ? 
                            task.completedAt.seconds * 1000 : task.completedAt
                          ).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                      
                      {/* Validateur si validée */}
                      {task.status === 'validated' && task.validatedByName && (
                        <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                          <Shield className="w-3 h-3" />
                          <span>✅ Validée par <strong>{task.validatedByName}</strong></span>
                        </div>
                      )}
                      
                      {/* Commentaire admin si présent */}
                      {task.adminComment && (
                        <div className="mt-2 p-2 bg-blue-50 border-l-3 border-blue-400 text-xs text-gray-700">
                          <strong>💬 Commentaire admin :</strong><br />
                          <em>"{task.adminComment}"</em>
                        </div>
                      )}

                      {/* XP gagnés */}
                      {task.xpReward && (
                        <div className="flex items-center gap-1 text-xs text-amber-700 mt-1">
                          <Trophy className="w-3 h-3" />
                          <span><strong>+{task.xpReward} XP</strong> gagnés</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions pour les tâches non-historiques */}
                  {activeTab !== 'history' && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {/* Statut */}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'validated' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'completed' ? 'Terminée' :
                         task.status === 'in_progress' ? 'En cours' :
                         task.status === 'validated' ? 'Validée' : 'À faire'}
                      </span>

                      {/* Boutons d'action */}
                      <div className="flex items-center gap-1">
                        {/* Bouton voir */}
                        <button
                          onClick={() => handleViewTask(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Bouton prendre/quitter la tâche */}
                        {activeTab === 'available' && (
                          <button
                            onClick={() => handleTakeTask(task.id)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Prendre cette tâche"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        )}

                        {isMyTask && task.status !== 'completed' && (
                          <button
                            onClick={() => handleLeaveTask(task.id)}
                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                            title="Se retirer de cette tâche"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Bouton modifier */}
                        {canEdit && (
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Bouton supprimer */}
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Modal de création/modification */}
      <TaskForm
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        initialData={editMode ? selectedTask : null}
        submitting={uploading}
      />

      {/* Modal de détails */}
      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onTake={handleTakeTask}
        onLeave={handleLeaveTask}
        canEdit={selectedTask?.createdBy === user?.uid}
        canTake={activeTab === 'available'}
        canLeave={selectedTask?.assignedTo === user?.uid}
      />
    </div>
  );
};

export default TasksPage;
