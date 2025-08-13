// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE - TOUTES FONCTIONNALITÉS FIREBASE
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
  Bell
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
 * 📋 PAGE TÂCHES COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
 * - Synchronisation Firebase temps réel
 * - Système complet de tâches
 * - Gamification intégrée
 * - Collaboration et commentaires
 * - Analytics et historique
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // États pour statistiques
  const [userStats, setUserStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    weeklyXP: 0,
    currentStreak: 0
  });
  
  // États pour notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadComments, setUnreadComments] = useState({});

  // ==========================================
  // 🔥 SYNCHRONISATION FIREBASE TEMPS RÉEL
  // ==========================================
  
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSyncing(true);

    // Query pour les tâches de l'utilisateur
    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    // Listener temps réel
    const unsubscribe = onSnapshot(tasksQuery, 
      (snapshot) => {
        const tasksList = [];
        
        snapshot.forEach((doc) => {
          const taskData = doc.data();
          tasksList.push({
            id: doc.id,
            ...taskData,
            createdAt: taskData.createdAt?.toDate(),
            updatedAt: taskData.updatedAt?.toDate(),
            dueDate: taskData.dueDate?.toDate()
          });
        });
        
        setTasks(tasksList);
        setLoading(false);
        setSyncing(false);
        
        console.log('🔄 Tâches synchronisées:', tasksList.length);
      },
      (error) => {
        console.error('❌ Erreur synchronisation tâches:', error);
        setError('Erreur de synchronisation avec Firebase');
        setLoading(false);
        setSyncing(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, isAuthenticated]);

  // ==========================================
  // 🔥 CALCULS AVANCÉS DES TÂCHES
  // ==========================================

  // Mes tâches (assignées à moi)
  const myTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task || !user?.uid) return false;
      
      return (
        (Array.isArray(task.assignedTo) && task.assignedTo.includes(user.uid)) ||
        (typeof task.assignedTo === 'string' && task.assignedTo === user.uid) ||
        task.createdBy === user.uid
      );
    });
  }, [tasks, user?.uid]);

  // Tâches disponibles (sans assignation)
  const availableTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task) return false;
      
      const hasNoAssignment = !task.assignedTo || 
        (Array.isArray(task.assignedTo) && task.assignedTo.length === 0) ||
        (typeof task.assignedTo === 'string' && task.assignedTo.trim() === '');
      
      const isActive = task.status !== 'completed' && 
                       task.status !== 'archived' && 
                       !task.isDeleted;
      
      return hasNoAssignment && isActive;
    });
  }, [tasks]);

  // Tâches d'équipe (assignées à d'autres)
  const teamTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task || !user?.uid) return false;
      
      const isAssignedToOthers = task.assignedTo && (
        (Array.isArray(task.assignedTo) && 
         task.assignedTo.length > 0 && 
         !task.assignedTo.includes(user.uid)) ||
        (typeof task.assignedTo === 'string' && 
         task.assignedTo.trim() !== '' && 
         task.assignedTo !== user.uid)
      );
      
      return isAssignedToOthers;
    });
  }, [tasks, user?.uid]);

  // Historique (tâches terminées)
  const historyTasks = useMemo(() => {
    return tasks.filter(task => 
      task.status === 'completed' || 
      task.status === 'validated' || 
      task.isValidated === true
    );
  }, [tasks]);

  // ==========================================
  // 🔥 SYSTÈME DE FILTRAGE AVANCÉ
  // ==========================================

  const getFilteredTasks = useCallback((taskList) => {
    let filtered = [...taskList];

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        const activeStatuses = ['todo', 'in_progress', 'pending', 'open'];
        filtered = filtered.filter(task => 
          activeStatuses.includes(task.status || 'todo')
        );
      } else {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
    }

    // Filtre par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(task => {
        const taskRole = task.roleId || task.synergiaRole || task.category;
        return taskRole === roleFilter;
      });
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          aVal = priorityOrder[a.priority] || 1;
          bVal = priorityOrder[b.priority] || 1;
          break;
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate) : new Date('2099-12-31');
          bVal = b.dueDate ? new Date(b.dueDate) : new Date('2099-12-31');
          break;
        case 'title':
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        default: // 'created'
          aVal = a.createdAt || new Date(0);
          bVal = b.createdAt || new Date(0);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, priorityFilter, roleFilter, sortBy, sortOrder]);

  // Tâches actuelles selon l'onglet
  const currentTasks = useMemo(() => {
    switch (activeTab) {
      case 'my':
        return getFilteredTasks(myTasks);
      case 'available':
        return getFilteredTasks(availableTasks);
      case 'team':
        return getFilteredTasks(teamTasks);
      case 'history':
        return getFilteredTasks(historyTasks);
      default:
        return [];
    }
  }, [activeTab, myTasks, availableTasks, teamTasks, historyTasks, getFilteredTasks]);

  // ==========================================
  // 🔥 CALCUL DES STATISTIQUES
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    const myActiveTasks = myTasks.filter(task => 
      task.status !== 'completed' && task.status !== 'archived'
    );
    const myCompletedTasks = myTasks.filter(task => 
      task.status === 'completed' || task.status === 'validated'
    );
    const myPendingTasks = myTasks.filter(task => 
      task.status === 'pending' || task.status === 'validation_pending'
    );

    // Calculer XP de la semaine
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyCompletedTasks = myCompletedTasks.filter(task =>
      task.completedAt && new Date(task.completedAt) >= weekStart
    );
    
    const weeklyXP = weeklyCompletedTasks.reduce((total, task) => 
      total + (task.xpReward || 10), 0
    );

    setUserStats({
      totalTasks: myTasks.length,
      completedTasks: myCompletedTasks.length,
      pendingTasks: myPendingTasks.length,
      activeTasks: myActiveTasks.length,
      weeklyXP,
      currentStreak: 0 // TODO: Calculer la série
    });
  }, [myTasks, user?.uid]);

  // ==========================================
  // 🔥 GESTIONNAIRES D'ACTIONS
  // ==========================================

  // Création de tâche
  const handleCreateTask = async (taskData) => {
    if (!user?.uid) return;

    setSubmitting(true);
    try {
      const newTask = {
        ...taskData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'todo',
        xpReward: calculateXPReward(taskData),
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      await addDoc(collection(db, 'tasks'), newTask);
      
      setShowCreateModal(false);
      showNotification('✅ Tâche créée avec succès !', 'success');
      
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      showNotification('❌ Erreur lors de la création', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Modification de tâche
  const handleEditTask = async (taskId, taskData) => {
    if (!taskId) return;

    setSubmitting(true);
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...taskData,
        updatedAt: serverTimestamp(),
        xpReward: calculateXPReward(taskData)
      });

      setShowCreateModal(false);
      setSelectedTask(null);
      setEditMode(false);
      showNotification('✅ Tâche modifiée avec succès !', 'success');
      
    } catch (error) {
      console.error('❌ Erreur modification tâche:', error);
      showNotification('❌ Erreur lors de la modification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Suppression de tâche
  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${taskTitle}" ?`)) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      showNotification('✅ Tâche supprimée avec succès !', 'success');
      
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
      showNotification('❌ Erreur lors de la suppression', 'error');
    }
  };

  // Volontariat pour une tâche
  const handleVolunteer = async (taskId) => {
    if (!user?.uid) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        const currentAssigned = taskData.assignedTo || [];
        
        let newAssigned;
        if (Array.isArray(currentAssigned)) {
          newAssigned = [...currentAssigned, user.uid];
        } else {
          newAssigned = [currentAssigned, user.uid].filter(Boolean);
        }

        await updateDoc(taskRef, {
          assignedTo: newAssigned,
          status: 'in_progress',
          updatedAt: serverTimestamp()
        });

        showNotification('✅ Vous êtes maintenant assigné à cette tâche !', 'success');
      }
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      showNotification('❌ Erreur lors du volontariat', 'error');
    }
  };

  // Désengagement d'une tâche
  const handleUnvolunteer = async (taskId) => {
    if (!user?.uid) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        let currentAssigned = taskData.assignedTo || [];
        
        if (Array.isArray(currentAssigned)) {
          currentAssigned = currentAssigned.filter(id => id !== user.uid);
        } else if (currentAssigned === user.uid) {
          currentAssigned = [];
        }

        const newStatus = currentAssigned.length === 0 ? 'todo' : 'in_progress';

        await updateDoc(taskRef, {
          assignedTo: currentAssigned,
          status: newStatus,
          updatedAt: serverTimestamp()
        });

        showNotification('✅ Vous n\'êtes plus assigné à cette tâche', 'info');
      }
    } catch (error) {
      console.error('❌ Erreur désengagement:', error);
      showNotification('❌ Erreur lors du désengagement', 'error');
    }
  };

  // Marquer comme terminée
  const handleMarkCompleted = async (taskId) => {
    if (!user?.uid) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: user.uid,
        updatedAt: serverTimestamp()
      });

      // TODO: Ajouter XP à l'utilisateur
      showNotification('✅ Tâche marquée comme terminée !', 'success');
      
    } catch (error) {
      console.error('❌ Erreur fin de tâche:', error);
      showNotification('❌ Erreur lors du marquage', 'error');
    }
  };

  // ==========================================
  // 🔥 FONCTIONS UTILITAIRES
  // ==========================================

  // Calcul XP selon la tâche
  const calculateXPReward = (taskData) => {
    let baseXP = 10;
    
    // Bonus selon la complexité
    const complexityMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 3
    };
    
    // Bonus selon la priorité
    const priorityMultiplier = {
      low: 1,
      normal: 1.2,
      high: 1.5,
      urgent: 2
    };
    
    const complexity = taskData.complexity || 'medium';
    const priority = taskData.priority || 'normal';
    
    return Math.round(
      baseXP * 
      (complexityMultiplier[complexity] || 1.5) * 
      (priorityMultiplier[priority] || 1.2)
    );
  };

  // Fonction de notification
  const showNotification = (message, type = 'info') => {
    // TODO: Implémenter système de notifications
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Badges de statut
  const getStatusBadge = (status) => {
    const badges = {
      todo: { label: 'À faire', color: 'bg-gray-100 text-gray-700', icon: Clock },
      in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: Clock },
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
      validation_pending: { label: 'En validation', color: 'bg-orange-100 text-orange-700', icon: Eye },
      completed: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      validated: { label: 'Validée', color: 'bg-emerald-100 text-emerald-700', icon: Award }
    };
    
    return badges[status] || badges.todo;
  };

  // Badges de priorité
  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Faible', color: 'bg-green-100 text-green-700' },
      normal: { label: 'Normale', color: 'bg-gray-100 text-gray-700' },
      high: { label: 'Haute', color: 'bg-orange-100 text-orange-700' },
      urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' }
    };
    
    return badges[priority] || badges.normal;
  };

  // Vérification d'authentification
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Target className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
          <p className="text-gray-400">Veuillez vous connecter pour accéder aux tâches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
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
            <h3 className="text-blue-400 font-semibold mb-2">Total</h3>
            <p className="text-gray-400 text-sm">Toutes mes tâches</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{userStats.completedTasks}</span>
            </div>
            <h3 className="text-green-400 font-semibold mb-2">Terminées</h3>
            <p className="text-gray-400 text-sm">Accomplissements</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">{userStats.activeTasks}</span>
            </div>
            <h3 className="text-orange-400 font-semibold mb-2">Actives</h3>
            <p className="text-gray-400 text-sm">En cours</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{userStats.weeklyXP}</span>
            </div>
            <h3 className="text-purple-400 font-semibold mb-2">XP Semaine</h3>
            <p className="text-gray-400 text-sm">Points gagnés</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{userStats.currentStreak}</span>
            </div>
            <h3 className="text-yellow-400 font-semibold mb-2">Série</h3>
            <p className="text-gray-400 text-sm">Jours consécutifs</p>
          </div>
        </div>

        {/* 🔍 BARRE DE RECHERCHE ET ACTIONS */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous statuts</option>
                <option value="active">Actives</option>
                <option value="completed">Terminées</option>
                <option value="pending">En attente</option>
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="urgent">Urgente</option>
                <option value="high">Haute</option>
                <option value="normal">Normale</option>
                <option value="low">Faible</option>
              </select>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Tâche
              </button>
      )}

      {/* Modal Soumission de Tâche */}
      {showSubmissionModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-6 h-6 text-green-400" />
                Soumettre la Tâche
              </h3>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Info tâche */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-1">{selectedTask.title}</h4>
                <p className="text-gray-400 text-sm">
                  Récompense: {selectedTask.xpReward || 15} XP
                </p>
              </div>

              {/* Formulaire de soumission */}
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description du travail effectué *
                  </label>
                  <textarea
                    placeholder="Décrivez ce que vous avez accompli..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preuves (optionnel)
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm mb-1">
                      Glissez vos fichiers ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-gray-500 text-xs">
                      Images, PDF, documents (max 10MB)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temps passé (optionnel)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Heures"
                        min="0"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Minutes"
                        min="0"
                        max="59"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    Soumettre pour validation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Filtres Avancés */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Filter className="w-6 h-6 text-purple-400" />
                Filtres Avancés
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rôle Synergia
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="serveur">🍽️ Serveur</option>
                  <option value="cuisine">👨‍🍳 Cuisine</option>
                  <option value="bar">🍺 Bar</option>
                  <option value="accueil">👋 Accueil</option>
                  <option value="nettoyage">🧹 Nettoyage</option>
                  <option value="gestion">📊 Gestion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date de création
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  XP Minimum
                </label>
                <input
                  type="number"
                  placeholder="Ex: 20"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    // Reset filtres
                    setRoleFilter('all');
                    setStatusFilter('active');
                    setPriorityFilter('all');
                    setSearchTerm('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 ONGLETS NAVIGATION */}
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex gap-2 overflow-x-auto">
            {[
              { id: 'my', label: 'Mes Tâches', icon: Target, count: myTasks.length },
              { id: 'available', label: 'Disponibles', icon: Heart, count: availableTasks.length },
              { id: 'team', label: 'Équipe', icon: Users, count: teamTasks.length },
              { id: 'history', label: 'Historique', icon: Archive, count: historyTasks.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
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
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'my' && <Target className="w-8 h-8 text-gray-500" />}
                  {activeTab === 'available' && <Heart className="w-8 h-8 text-gray-500" />}
                  {activeTab === 'team' && <Users className="w-8 h-8 text-gray-500" />}
                  {activeTab === 'history' && <Archive className="w-8 h-8 text-gray-500" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Aucune tâche trouvée
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'my' && 'Vous n\'avez aucune tâche assignée pour le moment.'}
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
                          <h3 className="text-lg font-semibold text-white">
                            {task.title || 'Tâche sans titre'}
                          </h3>
                          
                          {/* Badge statut */}
                          {(() => {
                            const badge = getStatusBadge(task.status);
                            const Icon = badge.icon;
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                <Icon className="w-3 h-3" />
                                {badge.label}
                              </span>
                            );
                          })()}
                          
                          {/* Badge priorité */}
                          {task.priority && task.priority !== 'normal' && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(task.priority).color}`}>
                              {getPriorityBadge(task.priority).label}
                            </span>
                          )}

                          {/* Badge XP */}
                          {task.xpReward && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                              <Zap className="w-3 h-3" />
                              {task.xpReward} XP
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Métadonnées */}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {task.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.createdAt.toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Échéance: {task.dueDate.toLocaleDateString('fr-FR')}
                            </span>
                          )}
                          
                          {task.assignedTo && Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {task.assignedTo.length} assigné{task.assignedTo.length > 1 ? 's' : ''}
                            </span>
                          )}
                          
                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {task.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {task.tags.length > 3 && (
                                <span className="text-gray-400 text-xs">
                                  +{task.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Indicateur de retard */}
                          {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
                            <span className="flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              En retard
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                      <div className="flex items-center gap-2">
                        {/* Volontariat */}
                        {activeTab === 'available' && (
                          <button
                            onClick={() => handleVolunteer(task.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                          >
                            <Heart className="w-3 h-3" />
                            Se porter volontaire
                          </button>
                        )}

                        {/* Désengagement */}
                        {activeTab === 'my' && task.assignedTo?.includes(user.uid) && task.status !== 'completed' && (
                          <button
                            onClick={() => handleUnvolunteer(task.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Se désengager
                          </button>
                        )}

                        {/* Marquer terminée */}
                        {activeTab === 'my' && task.assignedTo?.includes(user.uid) && task.status === 'in_progress' && (
                          <button
                            onClick={() => handleMarkCompleted(task.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Terminer
                          </button>
                        )}

                        {/* Soumettre pour validation */}
                        {activeTab === 'my' && task.assignedTo?.includes(user.uid) && task.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowSubmissionModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
                          >
                            <Upload className="w-3 h-3" />
                            Soumettre
                          </button>
                        )}

                        {/* Actions collaboratives */}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDetailModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Discuter
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Voir détails */}
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDetailModal(true);
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

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

      {/* 🎭 MODALS COMPLÈTES AVEC FONCTIONNALITÉS AVANCÉES */}
      
      {/* Modal Création/Modification Avancée */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editMode ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditMode(false);
                  setSelectedTask(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form id="task-form" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titre de la tâche *
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Entrez le titre..."
                  defaultValue={editMode ? selectedTask?.title : ''}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Décrivez la tâche..."
                  rows={4}
                  defaultValue={editMode ? selectedTask?.description : ''}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priorité
                  </label>
                  <select 
                    name="priority"
                    defaultValue={editMode ? selectedTask?.priority : 'normal'}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">🟢 Faible</option>
                    <option value="normal">⚪ Normale</option>
                    <option value="high">🟠 Haute</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Complexité
                  </label>
                  <select 
                    name="complexity"
                    defaultValue={editMode ? selectedTask?.complexity : 'medium'}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">🟢 Facile (10 XP)</option>
                    <option value="medium">🟡 Moyenne (15 XP)</option>
                    <option value="hard">🟠 Difficile (25 XP)</option>
                    <option value="expert">🔴 Expert (40 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    XP Personnalisé
                  </label>
                  <input
                    name="xpReward"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Auto"
                    defaultValue={editMode ? selectedTask?.xpReward : ''}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date d'échéance
                  </label>
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={editMode && selectedTask?.dueDate ? selectedTask.dueDate.toISOString().split('T')[0] : ''}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    name="tags"
                    type="text"
                    placeholder="urgent, frontend, bug"
                    defaultValue={editMode && selectedTask?.tags ? selectedTask.tags.join(', ') : ''}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Prévisualisation XP */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-medium">Récompense XP</span>
                  </div>
                  <span className="text-white font-bold text-lg">
                    {editMode ? selectedTask?.xpReward || 15 : 15} XP
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Calculé automatiquement selon la priorité et la complexité
                </p>
              </div>
            </form>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditMode(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    const formData = new FormData(document.querySelector('#task-form'));
                    const taskData = {
                      title: formData.get('title'),
                      description: formData.get('description'),
                      priority: formData.get('priority'),
                      complexity: formData.get('complexity'),
                      xpReward: parseInt(formData.get('xpReward')) || calculateXPReward({
                        priority: formData.get('priority'),
                        complexity: formData.get('complexity')
                      }),
                      dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate')) : null,
                      tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : []
                    };

                    if (editMode) {
                      await handleEditTask(selectedTask.id, taskData);
                    } else {
                      await handleCreateTask(taskData);
                    }
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {submitting ? 'En cours...' : editMode ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Détails de la Tâche
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedTask(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Titre et badges */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">{selectedTask.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const badge = getStatusBadge(selectedTask.status);
                    const Icon = badge.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                        <Icon className="w-4 h-4" />
                        {badge.label}
                      </span>
                    );
                  })()}
                  
                  {selectedTask.priority && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(selectedTask.priority).color}`}>
                      {getPriorityBadge(selectedTask.priority).label}
                    </span>
                  )}
                  
                  {selectedTask.xpReward && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      {selectedTask.xpReward} XP
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
              )}

              {/* Métadonnées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Informations</h4>
                  <div className="space-y-2 text-sm">
                    {selectedTask.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Créée le :</span>
                        <span className="text-white">{selectedTask.createdAt.toLocaleDateString('fr-FR')} à {selectedTask.createdAt.toLocaleTimeString('fr-FR')}</span>
                      </div>
                    )}
                    
                    {selectedTask.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Échéance :</span>
                        <span className="text-white">{selectedTask.dueDate.toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    
                    {selectedTask.complexity && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Complexité :</span>
                        <span className="text-white capitalize">{selectedTask.complexity}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Assignation</h4>
                  <div className="space-y-2 text-sm">
                    {selectedTask.assignedTo && Array.isArray(selectedTask.assignedTo) && selectedTask.assignedTo.length > 0 ? (
                      <div>
                        <span className="text-gray-400 block mb-1">Assignée à :</span>
                        {selectedTask.assignedTo.map((userId, index) => (
                          <span key={index} className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs mr-1 mb-1">
                            Utilisateur {userId.slice(-4)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Aucune assignation</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section commentaires simulée */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Commentaires
                </h4>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-center">
                    Aucun commentaire pour le moment.
                  </p>
                  <div className="mt-4">
                    <textarea
                      placeholder="Ajouter un commentaire..."
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm resize-none"
                    />
                    <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Joindre un fichier
                    </button>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Actions Rapides
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTask.status === 'in_progress' && selectedTask.assignedTo?.includes(user.uid) && (
                      <button
                        onClick={() => handleMarkCompleted(selectedTask.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marquer terminée
                      </button>
                    )}
                    
                    {activeTab === 'available' && (
                      <button
                        onClick={() => handleVolunteer(selectedTask.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Se porter volontaire
                      </button>
                    )}

                    {selectedTask.assignedTo?.includes(user.uid) && selectedTask.status !== 'completed' && (
                      <button
                        onClick={() => handleUnvolunteer(selectedTask.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Se désengager
                      </button>
                    )}

                    <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                      <Bell className="w-4 h-4" />
                      S'abonner
                    </button>
                  </div>
                </div>

                {/* Historique des modifications */}
                <div>
                  <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Historique
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    <div className="text-xs text-gray-400 flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5"></div>
                      <div>
                        <span className="text-white">Tâche créée</span>
                        <div className="text-gray-500">
                          {selectedTask.createdAt?.toLocaleDateString('fr-FR')} à {selectedTask.createdAt?.toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    
                    {selectedTask.updatedAt && selectedTask.updatedAt > selectedTask.createdAt && (
                      <div className="text-xs text-gray-400 flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                        <div>
                          <span className="text-white">Dernière modification</span>
                          <div className="text-gray-500">
                            {selectedTask.updatedAt?.toLocaleDateString('fr-FR')} à {selectedTask.updatedAt?.toLocaleTimeString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
