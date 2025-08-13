// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
// ==========================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  X,
  Save,
  AlertTriangle,
  Paperclip,
  FileText,
  EyeOff
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

/**
 * 🎭 RÔLES SYNERGIA COMPLETS
 */
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    textColor: 'text-orange-600',
    description: 'Maintenance technique et matériel'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    textColor: 'text-yellow-600',
    description: 'Gestion de la réputation et avis clients'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-blue-600',
    description: 'Inventaires et approvisionnements'
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    textColor: 'text-purple-600',
    description: 'Organisation et planification'
  },
  content: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-600',
    description: 'Création et gestion de contenu'
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-600',
    description: 'Formation et encadrement équipe'
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    textColor: 'text-indigo-600',
    description: 'Développement des partenariats'
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux',
    icon: '📱',
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textColor: 'text-cyan-600',
    description: 'Gestion des réseaux sociaux'
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-gradient-to-r from-slate-500 to-gray-600',
    textColor: 'text-slate-600',
    description: 'Relations professionnelles et devis'
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
    textColor: 'text-red-600',
    description: 'Gestion du système de gamification'
  }
};

/**
 * 🏆 SYSTÈME DE CALCUL XP AUTOMATIQUE OBLIGATOIRE
 */
const DIFFICULTY_XP_CONFIG = {
  easy: { 
    label: 'Facile (5-15 XP)', 
    baseXP: 10, 
    color: 'text-green-600',
    bgColor: 'bg-green-500/20'
  },
  medium: { 
    label: 'Moyen (15-35 XP)', 
    baseXP: 25, 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500/20'
  },
  hard: { 
    label: 'Difficile (35-65 XP)', 
    baseXP: 50, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-500/20'
  },
  expert: { 
    label: 'Expert (65-120 XP)', 
    baseXP: 85, 
    color: 'text-red-600',
    bgColor: 'bg-red-500/20'
  }
};

const PRIORITY_XP_MULTIPLIERS = {
  low: { multiplier: 0.8, label: 'Basse', color: 'text-gray-600' },
  medium: { multiplier: 1.0, label: 'Normale', color: 'text-blue-600' },
  high: { multiplier: 1.3, label: 'Haute', color: 'text-orange-600' },
  urgent: { multiplier: 1.6, label: 'Urgente', color: 'text-red-600' }
};

const RECURRENCE_MULTIPLIERS = {
  none: 1.0,
  daily: 1.5,
  weekly: 1.3,
  monthly: 1.1
};

/**
 * 📋 PAGE TÂCHES COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
 */
const TasksPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // ==========================================
  // 🔥 ÉTATS PRINCIPAUX
  // ==========================================
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // États de filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('my');
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // États pour la gamification
  const [userStats, setUserStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    xpEarned: 0,
    level: 1
  });

  // État du formulaire de création/édition
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'medium',
    category: 'general',
    status: 'todo',
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

  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ==========================================
  // 🔥 HOOKS ET EFFECTS
  // ==========================================

  // ✅ CALCUL AUTOMATIQUE XP
  const calculateAutoXP = useCallback((difficulty, priority, isRecurring, recurrenceType) => {
    const diffConfig = DIFFICULTY_XP_CONFIG[difficulty] || DIFFICULTY_XP_CONFIG.medium;
    const priorityConfig = PRIORITY_XP_MULTIPLIERS[priority] || PRIORITY_XP_MULTIPLIERS.medium;
    const recurrenceConfig = isRecurring ? 
      (RECURRENCE_MULTIPLIERS[recurrenceType] || RECURRENCE_MULTIPLIERS.none) : 
      RECURRENCE_MULTIPLIERS.none;
    
    const finalXP = Math.round(
      diffConfig.baseXP * 
      priorityConfig.multiplier * 
      recurrenceConfig.multiplier
    );
    
    return Math.max(5, Math.min(200, finalXP));
  }, []);

  // ✅ MISE À JOUR AUTOMATIQUE XP
  useEffect(() => {
    const autoXP = calculateAutoXP(
      formData.difficulty, 
      formData.priority, 
      formData.isRecurring, 
      formData.recurrenceType
    );
    
    setFormData(prev => ({ ...prev, xpReward: autoXP }));
  }, [formData.difficulty, formData.priority, formData.isRecurring, formData.recurrenceType, calculateAutoXP]);

  // ✅ ÉCOUTE TEMPS RÉEL DES TÂCHES
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('🔥 Mise en place de l\'écoute temps réel des tâches...');
    setSyncing(true);

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        console.log(`📋 ${snapshot.docs.length} tâches reçues de Firebase`);
        
        const fetchedTasks = [];
        snapshot.forEach((doc) => {
          const taskData = doc.data();
          fetchedTasks.push({
            id: doc.id,
            ...taskData,
            createdAt: taskData.createdAt?.toDate?.() || new Date(),
            dueDate: taskData.dueDate?.toDate?.() || null,
            updatedAt: taskData.updatedAt?.toDate?.() || null
          });
        });

        setTasks(fetchedTasks);
        calculateUserStats(fetchedTasks);
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

  // ✅ CALCUL DES STATISTIQUES UTILISATEUR
  const calculateUserStats = useCallback((tasksList) => {
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(t => t.status === 'completed').length;
    const pendingTasks = tasksList.filter(t => ['todo', 'in_progress'].includes(t.status)).length;
    const xpEarned = tasksList
      .filter(t => t.status === 'completed')
      .reduce((sum, task) => sum + (task.xpReward || 0), 0);
    
    const level = Math.floor(xpEarned / 100) + 1;

    setUserStats({
      totalTasks,
      completedTasks,
      pendingTasks,
      xpEarned,
      level
    });
  }, []);

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

  // Tâches selon l'onglet actif
  const currentTasks = useMemo(() => {
    switch (activeTab) {
      case 'my':
        return filteredAndSortedTasks.filter(task => 
          task.userId === user?.uid || task.assignedTo === user?.uid
        );
      case 'available':
        return filteredAndSortedTasks.filter(task => 
          task.openToVolunteers && !task.assignedTo && task.status === 'todo'
        );
      case 'team':
        return filteredAndSortedTasks.filter(task => 
          task.teamTask === true
        );
      case 'history':
        return filteredAndSortedTasks.filter(task => 
          task.status === 'completed' || task.status === 'cancelled'
        );
      default:
        return filteredAndSortedTasks;
    }
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
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };

      await addDoc(collection(db, 'tasks'), taskData);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        difficulty: 'medium',
        category: 'general',
        status: 'todo',
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

      setShowCreateModal(false);
      setEditMode(false);
      console.log('✅ Tâche créée avec succès');

    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError('Erreur lors de la création de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ MODIFICATION D'UNE TÂCHE
  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    setSubmitting(true);
    setError('');

    try {
      const taskRef = doc(db, 'tasks', selectedTask.id);
      await updateDoc(taskRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      });

      setShowCreateModal(false);
      setEditMode(false);
      setSelectedTask(null);
      console.log('✅ Tâche modifiée avec succès');

    } catch (error) {
      console.error('❌ Erreur modification tâche:', error);
      setError('Erreur lors de la modification de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ SUPPRESSION D'UNE TÂCHE
  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Voulez-vous vraiment supprimer la tâche "${taskTitle}" ?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ Tâche supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      setError('Erreur lors de la suppression de la tâche');
    }
  };

  // ✅ MARQUER UNE TÂCHE COMME TERMINÉE
  const handleCompleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        progress: 100
      });
      console.log('✅ Tâche marquée comme terminée');
    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      setError('Erreur lors de la completion de la tâche');
    }
  };

  // ✅ SE PORTER VOLONTAIRE POUR UNE TÂCHE
  const handleVolunteerTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        assignedTo: user.uid,
        assignedAt: serverTimestamp(),
        status: 'in_progress'
      });
      console.log('✅ Volontariat enregistré');
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      setError('Erreur lors du volontariat');
    }
  };

  // ==========================================
  // 🔥 GESTION DU FORMULAIRE
  // ==========================================

  // ✅ PRÉ-REMPLISSAGE POUR L'ÉDITION
  useEffect(() => {
    if (editMode && selectedTask) {
      setFormData({
        title: selectedTask.title || '',
        description: selectedTask.description || '',
        priority: selectedTask.priority || 'medium',
        difficulty: selectedTask.difficulty || 'medium',
        category: selectedTask.category || 'general',
        status: selectedTask.status || 'todo',
        dueDate: selectedTask.dueDate ? selectedTask.dueDate.toISOString().split('T')[0] : '',
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

  // ==========================================
  // 🔥 DONNÉES POUR LES ONGLETS
  // ==========================================
  
  const tabs = [
    {
      id: 'my',
      label: 'Mes Tâches',
      icon: User,
      count: currentTasks.length
    },
    {
      id: 'available',
      label: 'Disponibles',
      icon: Users,
      count: tasks.filter(t => t.openToVolunteers && !t.assignedTo).length
    },
    {
      id: 'team',
      label: 'Équipe',
      icon: Users,
      count: tasks.filter(t => t.teamTask).length
    },
    {
      id: 'history',
      label: 'Historique',
      icon: Archive,
      count: tasks.filter(t => ['completed', 'cancelled'].includes(t.status)).length
    }
  ];

  // ==========================================
  // 🎨 RENDU DE L'INTERFACE
  // ==========================================

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Accès Restreint</h1>
          <p className="text-gray-400">Veuillez vous connecter pour accéder aux tâches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 📊 EN-TÊTE AVEC STATISTIQUES */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Gestion des Tâches</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setShowFiltersModal(true)}
                className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Filter className="w-5 h-5 text-white" />
              </button>
            </div>
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

        {/* 📈 STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{userStats.totalTasks}</span>
            </div>
            <p className="text-gray-300 font-medium">Total Tâches</p>
            <p className="text-gray-500 text-sm">Créées par vous</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{userStats.completedTasks}</span>
            </div>
            <p className="text-gray-300 font-medium">Terminées</p>
            <p className="text-gray-500 text-sm">
              {userStats.totalTasks > 0 ? Math.round((userStats.completedTasks / userStats.totalTasks) * 100) : 0}% de réussite
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">{userStats.pendingTasks}</span>
            </div>
            <p className="text-gray-300 font-medium">En Cours</p>
            <p className="text-gray-500 text-sm">À terminer</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{userStats.xpEarned}</span>
            </div>
            <p className="text-gray-300 font-medium">XP Total</p>
            <p className="text-gray-500 text-sm">Points d'expérience</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{userStats.level}</span>
            </div>
            <p className="text-gray-300 font-medium">Niveau</p>
            <p className="text-gray-500 text-sm">
              {userStats.xpEarned % 100}/100 XP
            </p>
          </div>
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
                <option value="low">Basse</option>
                <option value="medium">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                {Object.values(SYNERGIA_ROLES).map(role => (
                  <option key={role.id} value={role.id}>
                    {role.icon} {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 📑 ONGLETS DE NAVIGATION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-medium ${
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
                  {activeTab === 'team' && 'Tâches d\'Équipe'}
                  {activeTab === 'history' && 'Historique des Tâches'}
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
                  {activeTab === 'team' && 'Aucune tâche d\'équipe'}
                  {activeTab === 'history' && 'Aucun historique'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === 'my' && 'Vous n\'avez actuellement aucune tâche assignée.'}
                  {activeTab === 'available' && 'Aucune tâche disponible au volontariat actuellement.'}
                  {activeTab === 'team' && 'Aucune tâche d\'équipe en cours.'}
                  {activeTab === 'history' && 'Aucune tâche complétée dans votre historique.'}
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
                            task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {PRIORITY_XP_MULTIPLIERS[task.priority]?.label}
                          </div>

                          {/* Badge XP */}
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-purple-400 text-xs font-medium">
                            <Zap className="w-3 h-3" />
                            {task.xpReward} XP
                          </div>

                          {/* Badge de rôle */}
                          {task.roleId && SYNERGIA_ROLES[task.roleId] && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded text-yellow-400 text-xs font-medium">
                              <span>{SYNERGIA_ROLES[task.roleId].icon}</span>
                              <span>{SYNERGIA_ROLES[task.roleId].name}</span>
                            </div>
                          )}
                        </div>

                        {/* Titre et description */}
                        <h4 className="text-lg font-semibold text-white mb-2">{task.title}</h4>
                        {task.description && (
                          <p className="text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {task.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-white/10 rounded text-gray-300 text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Métadonnées */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{task.dueDate.toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.estimatedHours && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{task.estimatedHours}h estimées</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Créée le {task.createdAt?.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Voir détails */}
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Marquer comme terminé (si pas déjà terminé) */}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Se porter volontaire (si tâche disponible) */}
                        {activeTab === 'available' && (
                          <button
                            onClick={() => handleVolunteerTask(task.id)}
                            className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        )}

                        {/* Modifier (si propriétaire) */}
                        {task.createdBy === user.uid && (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setEditMode(true);
                              setShowCreateModal(true);
                            }}
                            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Supprimer (si propriétaire) */}
                        {task.createdBy === user.uid && (
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* 🏆 SECTION GAMIFICATION */}
        <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">Productivité Gamifiée !</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Terminez des tâches pour gagner de l'XP, débloquer des badges et gravir les échelons !
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-white text-sm font-medium">Gagnez de l'XP</p>
                <p className="text-gray-400 text-xs">Chaque tâche terminée</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-white text-sm font-medium">Débloquez des badges</p>
                <p className="text-gray-400 text-xs">Accomplissements spéciaux</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                <div className="text-3xl mb-2">👑</div>
                <p className="text-white text-sm font-medium">Montez en niveau</p>
                <p className="text-gray-400 text-xs">Progressez dans votre rôle</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 MODAL DE CRÉATION/ÉDITION COMPLÈTE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editMode ? 'Modifier la Tâche' : 'Créer une Nouvelle Tâche'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditMode(false);
                  setSelectedTask(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Informations principales */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titre de la tâche *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Mettre à jour la documentation"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez la tâche en détail..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priorité
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">🟢 Basse</option>
                      <option value="medium">🔵 Normale</option>
                      <option value="high">🟠 Haute</option>
                      <option value="urgent">🔴 Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Difficulté
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">🟢 Facile</option>
                      <option value="medium">🟡 Moyen</option>
                      <option value="hard">🟠 Difficile</option>
                      <option value="expert">🔴 Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle Synergia
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun rôle spécifique</option>
                    {Object.values(SYNERGIA_ROLES).map(role => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Temps estimé (heures)
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
                </div>

                {/* ✅ AFFICHAGE XP CALCULÉ AUTOMATIQUEMENT */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Récompense XP (calculée automatiquement)
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-xl font-bold text-purple-400">{formData.xpReward} XP</span>
                    <span className="text-sm text-gray-400">
                      Basé sur difficulté, priorité et récurrence
                    </span>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Paramètres avancés */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Ajouter un tag..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="openToVolunteers"
                    checked={formData.openToVolunteers}
                    onChange={(e) => setFormData(prev => ({ ...prev, openToVolunteers: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="openToVolunteers" className="text-gray-300">
                    Ouverte au volontariat
                  </label>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRecurring" className="text-gray-300">
                    Tâche récurrente
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type de récurrence
                      </label>
                      <select
                        value={formData.recurrenceType}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Intervalle
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.recurrenceInterval}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date de fin (optionnel)
                      </label>
                      <input
                        type="date"
                        value={formData.recurrenceEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes supplémentaires
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes internes, instructions spéciales..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Bouton paramètres avancés */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? 'Masquer' : 'Afficher'} les paramètres avancés
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Catégorie
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">Général</option>
                        <option value="development">Développement</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="management">Management</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="research">Recherche</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Projet associé
                      </label>
                      <input
                        type="text"
                        value={formData.projectId}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                        placeholder="ID du projet (optionnel)"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions du modal */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditMode(false);
                  setSelectedTask(null);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={editMode ? handleUpdateTask : handleCreateTask}
                disabled={submitting || !formData.title.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editMode ? 'Mettre à jour' : 'Créer la tâche'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 MODAL DE FILTRES AVANCÉS */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Filtres Avancés</h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives</option>
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="low">🟢 Basse</option>
                  <option value="medium">🔵 Normale</option>
                  <option value="high">🟠 Haute</option>
                  <option value="urgent">🔴 Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rôle Synergia
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les rôles</option>
                  {Object.values(SYNERGIA_ROLES).map(role => (
                    <option key={role.id} value={role.id}>
                      {role.icon} {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trier par
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="created">Date de création</option>
                    <option value="dueDate">Date d'échéance</option>
                    <option value="priority">Priorité</option>
                    <option value="title">Titre</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('active');
                  setPriorityFilter('all');
                  setRoleFilter('all');
                  setSortBy('created');
                  setSortOrder('desc');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 MODAL DE DÉTAILS D'UNE TÂCHE */}
      {selectedTask && !editMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Détails de la Tâche</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* En-tête de la tâche */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTask.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    selectedTask.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    selectedTask.status === 'todo' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedTask.status === 'completed' && 'Terminée'}
                    {selectedTask.status === 'in_progress' && 'En cours'}
                    {selectedTask.status === 'todo' && 'À faire'}
                    {selectedTask.status === 'cancelled' && 'Annulée'}
                  </div>

                  <div className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedTask.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    selectedTask.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    selectedTask.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    Priorité {PRIORITY_XP_MULTIPLIERS[selectedTask.priority]?.label}
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded text-purple-400 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    {selectedTask.xpReward} XP
                  </div>
                </div>

                <h4 className="text-2xl font-bold text-white mb-3">{selectedTask.title}</h4>
                
                {selectedTask.description && (
                  <p className="text-gray-300 text-lg leading-relaxed">{selectedTask.description}</p>
                )}
              </div>

              {/* Métadonnées détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Informations générales
                  </h5>
                  
                  <div className="space-y-3">
                    {selectedTask.roleId && SYNERGIA_ROLES[selectedTask.roleId] && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Rôle:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{SYNERGIA_ROLES[selectedTask.roleId].icon}</span>
                          <span className="text-white font-medium">{SYNERGIA_ROLES[selectedTask.roleId].name}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 w-20">Difficulté:</span>
                      <span className={`font-medium ${DIFFICULTY_XP_CONFIG[selectedTask.difficulty]?.color || 'text-gray-400'}`}>
                        {DIFFICULTY_XP_CONFIG[selectedTask.difficulty]?.label || 'Non définie'}
                      </span>
                    </div>

                    {selectedTask.estimatedHours && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Durée:</span>
                        <div className="flex items-center gap-1 text-white">
                          <Clock className="w-4 h-4" />
                          <span>{selectedTask.estimatedHours}h estimées</span>
                        </div>
                      </div>
                    )}

                    {selectedTask.category && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Catégorie:</span>
                        <span className="text-white capitalize">{selectedTask.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Dates importantes
                  </h5>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 w-20">Créée:</span>
                      <div className="flex items-center gap-1 text-white">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedTask.createdAt?.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {selectedTask.dueDate && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Échéance:</span>
                        <div className="flex items-center gap-1 text-white">
                          <Flag className="w-4 h-4" />
                          <span>{selectedTask.dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    {selectedTask.completedAt && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-20">Terminée:</span>
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>{selectedTask.completedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Récurrence */}
              {selectedTask.isRecurring && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Récurrence</h5>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Repeat className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">
                        {selectedTask.recurrenceType === 'daily' && 'Quotidienne'}
                        {selectedTask.recurrenceType === 'weekly' && 'Hebdomadaire'}
                        {selectedTask.recurrenceType === 'monthly' && 'Mensuelle'}
                      </span>
                    </div>
                    {selectedTask.recurrenceInterval > 1 && (
                      <p className="text-gray-400 text-sm">
                        Toutes les {selectedTask.recurrenceInterval} {selectedTask.recurrenceType === 'daily' ? 'jours' : selectedTask.recurrenceType === 'weekly' ? 'semaines' : 'mois'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTask.notes && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-3">Notes</h5>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-300 leading-relaxed">{selectedTask.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-700">
                {selectedTask.status !== 'completed' && (
                  <button
                    onClick={() => handleCompleteTask(selectedTask.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer terminée
                  </button>
                )}

                {selectedTask.createdBy === user.uid && (
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
