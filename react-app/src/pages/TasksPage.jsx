// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE GESTION DES TÂCHES GAMIFIÉE - CORRECTION ÉCRAN BLANC ONGLET AUTRES
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Calendar, 
  Star, 
  User, 
  Users, 
  BookOpen, 
  Eye, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Filter, 
  Heart, 
  MessageCircle, 
  FolderOpen, 
  X, 
  AlertTriangle,
  Upload,
  FileText,
  Image,
  Video,
  Repeat,
  Award,
  Zap,
  TrendingUp,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { SYNERGIA_ROLES } from '../core/data/roles.js';
import TaskDetailModal from '../components/tasks/TaskDetailModal.jsx';
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal.jsx';

const TasksPage = () => {
  const { user, isAuthenticated } = useAuthStore();

  // ==========================================
  // 🔥 ÉTATS LOCAUX
  // ==========================================
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  // Navigation et filtres
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Formulaire de création/édition
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
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

  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // ==========================================
  // 🔥 CHARGEMENT DES DONNÉES EN TEMPS RÉEL
  // ==========================================

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    console.log('🔄 Configuration écoute temps réel des tâches...');
    setSyncing(true);

    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        console.log(`📋 Mise à jour temps réel: ${snapshot.docs.length} tâches`);
        
        const fetchedTasks = snapshot.docs.map(doc => {
          const taskData = doc.data();
          return {
            id: doc.id,
            ...taskData,
            createdAt: taskData.createdAt?.toDate?.() || new Date(),
            dueDate: taskData.dueDate?.toDate?.() || null,
            updatedAt: taskData.updatedAt?.toDate?.() || null,
            completedAt: taskData.completedAt?.toDate?.() || null,
            validatedAt: taskData.validatedAt?.toDate?.() || null
          };
        });

        setTasks(fetchedTasks);
        setLoading(false);
        setSyncing(false);
      },
      (error) => {
        console.error('❌ Erreur écoute temps réel tâches:', error);
        setError('Erreur de synchronisation des tâches');
        setLoading(false);
        setSyncing(false);
      }
    );

    return () => {
      console.log('🔥 Nettoyage écoute temps réel tâches');
      unsubscribe();
    };
  }, [isAuthenticated, user]);

  // ==========================================
  // 🔥 FILTRAGE ET TRI DES TÂCHES
  // ==========================================
  
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filtrage par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtrage par statut
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(task => ['todo', 'in_progress'].includes(task.status));
      } else {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
    }

    // Filtrage par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Filtrage par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(task => task.roleId === roleFilter);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority] || 2;
          bValue = priorityOrder[b.priority] || 2;
          break;
        case 'dueDate':
          aValue = a.dueDate || new Date('2099-12-31');
          bValue = b.dueDate || new Date('2099-12-31');
          break;
        case 'created':
        default:
          aValue = a.createdAt || new Date(0);
          bValue = b.createdAt || new Date(0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, roleFilter, sortBy, sortOrder]);

  // ✅ LOGIQUE DE TRI CORRIGÉE - FIX ONGLET AUTRES
  const currentTasks = useMemo(() => {
    console.log('🔍 Filtrage onglet:', activeTab, 'User ID:', user?.uid);
    console.log('📊 Total tâches filtrées:', filteredAndSortedTasks.length);
    
    let result = [];
    
    switch (activeTab) {
      case 'my':
        // 🧑‍💼 MES TÂCHES : Tâches assignées UNIQUEMENT à moi
        result = filteredAndSortedTasks.filter(task => {
          const isAssignedToMe = task.assignedTo === user?.uid;
          console.log(`📋 Tâche "${task.title}": assignedTo=${task.assignedTo}, userId=${user?.uid}, match=${isAssignedToMe}`);
          return isAssignedToMe;
        });
        break;
        
      case 'available':
        // 💼 DISPONIBLES : Tâches SANS attribution OU avec assignedTo vide/null
        result = filteredAndSortedTasks.filter(task => {
          const isAvailable = !task.assignedTo || task.assignedTo === null || task.assignedTo === '' || task.assignedTo === undefined;
          console.log(`💼 Tâche "${task.title}": assignedTo="${task.assignedTo}", available=${isAvailable}`);
          return isAvailable;
        });
        break;
        
      case 'others':
        // 👥 AUTRES : Tâches assignées à d'AUTRES utilisateurs (pas moi, pas vide)
        result = filteredAndSortedTasks.filter(task => {
          const hasAssignee = task.assignedTo && task.assignedTo !== null && task.assignedTo !== '' && task.assignedTo !== undefined;
          const isNotMe = task.assignedTo !== user?.uid;
          const isOthers = hasAssignee && isNotMe;
          console.log(`👥 Tâche "${task.title}": assignedTo="${task.assignedTo}", hasAssignee=${hasAssignee}, isNotMe=${isNotMe}, isOthers=${isOthers}`);
          return isOthers;
        });
        break;
        
      case 'history':
        // 📚 HISTORIQUE : Tâches terminées ET validées par admin
        result = filteredAndSortedTasks.filter(task => {
          const isCompleted = task.status === 'completed';
          const isValidated = task.validatedBy && task.validatedBy !== null && task.validatedBy !== '';
          const inHistory = isCompleted && isValidated;
          console.log(`📚 Tâche "${task.title}": status=${task.status}, validatedBy=${task.validatedBy}, inHistory=${inHistory}`);
          return inHistory;
        });
        break;
        
      default:
        result = filteredAndSortedTasks;
        break;
    }
    
    console.log(`✅ Résultat onglet "${activeTab}":`, result.length, 'tâches');
    return result;
  }, [filteredAndSortedTasks, activeTab, user]);

  // ==========================================
  // 🔥 ACTIONS SUR LES TÂCHES
  // ==========================================

  // ✅ CRÉATION D'UNE NOUVELLE TÂCHE
  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const taskData = {
        ...formData,
        userId: user.uid,
        createdBy: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'todo',
        progress: 0,
        teamId: user.teamId || null,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        assignedTo: null // Nouvelles tâches non assignées par défaut
      };

      await addDoc(collection(db, 'tasks'), taskData);
      
      console.log('✅ Tâche créée avec succès');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError('Erreur lors de la création');
    }

    setSubmitting(false);
  };

  // ✅ MODIFIER UNE TÂCHE
  const handleUpdateTask = async () => {
    if (!selectedTask?.id || !formData.title.trim()) {
      setError('Données invalides');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const taskRef = doc(db, 'tasks', selectedTask.id);
      
      const updateData = {
        ...formData,
        updatedAt: serverTimestamp(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };

      await updateDoc(taskRef, updateData);
      
      console.log('✅ Tâche modifiée avec succès');
      setEditMode(false);
      setSelectedTask(null);
      resetForm();
    } catch (error) {
      console.error('❌ Erreur modification tâche:', error);
      setError('Erreur lors de la modification');
    }

    setSubmitting(false);
  };

  // ✅ SUPPRIMER UNE TÂCHE
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ Tâche supprimée avec succès');
      
      // Fermer les modals si la tâche supprimée était sélectionnée
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
        setEditMode(false);
      }
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      setError('Erreur lors de la suppression');
    }
  };

  // ✅ MARQUER UNE TÂCHE COMME TERMINÉE
  const handleCompleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        progress: 100,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche marquée comme terminée');
    } catch (error) {
      console.error('❌ Erreur finalisation tâche:', error);
      setError('Erreur lors de la finalisation');
    }
  };

  // ✅ S'ASSIGNER UNE TÂCHE DISPONIBLE
  const handleAssignToMe = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        assignedTo: user.uid,
        status: 'in_progress',
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche assignée à moi-même');
    } catch (error) {
      console.error('❌ Erreur assignation tâche:', error);
      setError('Erreur lors de l\'assignation');
    }
  };

  // ==========================================
  // 🔥 UTILITAIRES
  // ==========================================

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
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
    setTagInput('');
    setError('');
  };

  // Préremplir le formulaire en mode édition
  useEffect(() => {
    if (editMode && selectedTask) {
      setFormData({
        title: selectedTask.title || '',
        description: selectedTask.description || '',
        priority: selectedTask.priority || 'medium',
        dueDate: selectedTask.dueDate ? 
          selectedTask.dueDate.toISOString().split('T')[0] : '',
        estimatedHours: selectedTask.estimatedHours || 1,
        xpReward: selectedTask.xpReward || 25,
        roleId: selectedTask.roleId || '',
        tags: selectedTask.tags || [],
        openToVolunteers: selectedTask.openToVolunteers || true,
        isRecurring: selectedTask.isRecurring || false,
        recurrenceType: selectedTask.recurrenceType || 'none',
        recurrenceInterval: selectedTask.recurrenceInterval || 1,
        recurrenceDays: selectedTask.recurrenceDays || [],
        recurrenceEndDate: selectedTask.recurrenceEndDate || '',
        projectId: selectedTask.projectId || '',
        attachments: selectedTask.attachments || [],
        notes: selectedTask.notes || ''
      });
    }
  }, [editMode, selectedTask]);

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

  // ✅ ONGLETS SELON LOGIQUE CORRIGÉE
  const tabs = [
    {
      id: 'my',
      label: 'Mes Tâches',
      icon: User,
      count: tasks.filter(t => t.assignedTo === user?.uid).length
    },
    {
      id: 'available',
      label: 'Disponibles',
      icon: Heart,
      count: tasks.filter(t => !t.assignedTo || t.assignedTo === null || t.assignedTo === '' || t.assignedTo === undefined).length
    },
    {
      id: 'others',
      label: 'Autres',
      icon: Users,
      count: tasks.filter(t => t.assignedTo && t.assignedTo !== user?.uid && t.assignedTo !== null && t.assignedTo !== '' && t.assignedTo !== undefined).length
    },
    {
      id: 'history',
      label: 'Historique',
      icon: BookOpen,
      count: tasks.filter(t => t.status === 'completed' && t.validatedBy).length
    }
  ];

  // ==========================================
  // 🔥 RENDU
  // ==========================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">Connexion requise pour accéder aux tâches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🎯 HEADER */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Gestion des Tâches</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Organisez et suivez vos tâches avec gamification intégrée
          </p>
          {syncing && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-400 text-sm">Synchronisation...</span>
            </div>
          )}
        </div>

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actives</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="urgent">Urgente</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Tâche
              </button>
            </div>
          </div>
        </div>

        {/* 📊 ONGLETS DE NAVIGATION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 📋 LISTE DES TÂCHES */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {activeTab === 'my' && 'Mes Tâches Assignées'}
                  {activeTab === 'available' && 'Tâches Disponibles'}
                  {activeTab === 'others' && 'Tâches des Autres'}
                  {activeTab === 'history' && 'Historique Validé'}
                </h3>
                <p className="text-gray-400">
                  {currentTasks.length} tâche{currentTasks.length !== 1 ? 's' : ''} trouvée{currentTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created">Date de création</option>
                  <option value="dueDate">Date d'échéance</option>
                  <option value="priority">Priorité</option>
                  <option value="title">Titre</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Zone d'affichage des tâches */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Chargement des tâches...</p>
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {activeTab === 'my' && 'Aucune tâche assignée'}
                  {activeTab === 'available' && 'Aucune tâche disponible'}
                  {activeTab === 'others' && 'Aucune tâche assignée aux autres'}
                  {activeTab === 'history' && 'Aucun historique validé'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === 'my' && 'Vous n\'avez actuellement aucune tâche qui vous soit assignée.'}
                  {activeTab === 'available' && 'Aucune tâche n\'est actuellement disponible sans attribution.'}
                  {activeTab === 'others' && 'Aucune tâche n\'est assignée à d\'autres utilisateurs.'}
                  {activeTab === 'history' && 'Aucune tâche validée par un admin dans l\'historique.'}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Créer votre première tâche
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {currentTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all backdrop-blur-sm relative"
                  >
                    {/* Badge commentaires */}
                    <div className="absolute top-4 right-4 z-10">
                      <button className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full text-blue-400 text-xs hover:bg-blue-500/30 transition-colors">
                        <MessageCircle className="w-3 h-3" />
                        <span>0</span>
                      </button>
                    </div>

                    <div className="flex items-start justify-between pr-16">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {/* Badge de statut */}
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            task.status === 'todo' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {task.status === 'completed' && 'Terminée'}
                            {task.status === 'in_progress' && 'En cours'}
                            {task.status === 'todo' && 'À faire'}
                            {task.status === 'cancelled' && 'Annulée'}
                          </div>

                          {/* Badge de priorité */}
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {task.priority === 'urgent' && '🔥 Urgent'}
                            {task.priority === 'high' && '⚡ Haute'}
                            {task.priority === 'medium' && '📊 Moyenne'}
                            {task.priority === 'low' && '🔽 Basse'}
                          </div>

                          {/* Badge XP */}
                          {task.xpReward && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-purple-400 text-xs">
                              <Zap className="w-3 h-3" />
                              <span>{task.xpReward} XP</span>
                            </div>
                          )}

                          {/* Badge rôle */}
                          {task.roleId && SYNERGIA_ROLES[task.roleId] && (
                            <div className={`px-2 py-1 rounded text-xs font-medium text-white ${SYNERGIA_ROLES[task.roleId].color}`}>
                              {SYNERGIA_ROLES[task.roleId].emoji} {SYNERGIA_ROLES[task.roleId].name}
                            </div>
                          )}

                          {/* Compteur récurrence pour historique */}
                          {activeTab === 'history' && task.recurrenceCount && task.recurrenceCount > 1 && (
                            <div className="flex items-center gap-1">
                              <Repeat className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400">x{task.recurrenceCount}</span>
                            </div>
                          )}
                        </div>

                        <h4 className="text-lg font-semibold text-white mb-2">{task.title}</h4>
                        
                        {task.description && (
                          <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                            {task.description.length > 150 
                              ? `${task.description.substring(0, 150)}...`
                              : task.description
                            }
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{task.dueDate.toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}

                          {task.estimatedHours && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{task.estimatedHours}h estimées</span>
                            </div>
                          )}

                          {task.assignedTo && task.assignedTo !== user?.uid && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>Assignée</span>
                            </div>
                          )}

                          {/* Compteur récurrence pour historique */}
                          {activeTab === 'history' && task.recurrenceCount && task.recurrenceCount > 1 && (
                            <div className="flex items-center gap-1">
                              <Repeat className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400">x{task.recurrenceCount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Voir détails - TOUJOURS visible (transparence totale) */}
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Actions selon l'onglet actif et droits */}
                        
                        {/* Mes tâches : terminer, modifier, supprimer */}
                        {activeTab === 'my' && task.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Disponibles : s'assigner la tâche */}
                        {activeTab === 'available' && (
                          <button
                            onClick={() => handleAssignToMe(task.id)}
                            className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                            title="M'assigner cette tâche"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        )}

                        {/* Autres : pas d'action directe, juste consultation */}
                        {activeTab === 'others' && (
                          <div className="text-gray-400 text-sm px-2 py-1">
                            Consultation uniquement
                          </div>
                        )}

                        {/* Historique : affichage informations validation */}
                        {activeTab === 'history' && (
                          <div className="flex items-center gap-1 text-green-400 text-sm px-2 py-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Validée</span>
                          </div>
                        )}

                        {/* Modifier/Supprimer (propriétaire uniquement) */}
                        {(task.createdBy === user.uid || task.userId === user.uid) && activeTab !== 'history' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setEditMode(true);
                              }}
                              className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {task.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ========================= MODALS ========================= */}

        {/* 🔍 MODAL DE DÉTAILS D'UNE TÂCHE */}
        {selectedTask && !editMode && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onEdit={() => setEditMode(true)}
            onDelete={() => handleDeleteTask(selectedTask.id)}
            onSubmitForValidation={() => setShowSubmissionModal(true)}
            onAssign={() => setShowAssignmentModal(true)}
            currentUser={user}
          />
        )}

        {/* ✏️ MODAL DE CRÉATION/ÉDITION DE TÂCHE */}
        {(showCreateModal || editMode) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editMode ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditMode(false);
                    setSelectedTask(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Erreur</span>
                  </div>
                  <p className="text-red-300 mt-1">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Optimiser la base de données"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Décrivez la tâche en détail..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priorité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priorité
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">🔽 Basse</option>
                      <option value="medium">📊 Moyenne</option>
                      <option value="high">⚡ Haute</option>
                      <option value="urgent">🔥 Urgente</option>
                    </select>
                  </div>

                  {/* Date d'échéance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Estimation heures */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Heures estimées
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Récompense XP */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Points XP
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={formData.xpReward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 25 }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle spécialisé (optionnel)
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun rôle spécifique</option>
                    {Object.entries(SYNERGIA_ROLES).map(([id, role]) => (
                      <option key={id} value={id}>
                        {role.emoji} {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Ajouter un tag..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-400"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes internes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes pour les assignés..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditMode(false);
                    setSelectedTask(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={editMode ? handleUpdateTask : handleCreateTask}
                  disabled={submitting || !formData.title.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editMode ? 'Modifier' : 'Créer'} la Tâche
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📤 MODAL DE SOUMISSION POUR VALIDATION */}
        {showSubmissionModal && selectedTask && (
          <TaskSubmissionModal
            task={selectedTask}
            onClose={() => setShowSubmissionModal(false)}
            onSubmit={(result) => {
              console.log('🎯 Validation soumise:', result);
              setShowSubmissionModal(false);
              setSelectedTask(null);
            }}
          />
        )}

        {/* 👥 MODAL D'ASSIGNATION */}
        {showAssignmentModal && selectedTask && (
          <TaskAssignmentModal
            task={selectedTask}
            onClose={() => setShowAssignmentModal(false)}
            onAssign={(result) => {
              console.log('👥 Assignation effectuée:', result);
              setShowAssignmentModal(false);
              setSelectedTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
