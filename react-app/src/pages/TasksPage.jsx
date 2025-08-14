// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC DESIGN PREMIUM HARMONISÉ
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  User,
  Users,
  Heart,
  Archive,
  FileText,
  Play,
  Image as ImageIcon,
  MessageCircle,
  Calendar,
  Target,
  Zap,
  Clock,
  AlertCircle,
  ChevronDown,
  Star,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES (conservés)
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE (conservé)
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎮 SERVICES ET CONSTANTES (conservés)
import { SYNERGIA_ROLES } from '../core/services/escapeGameRolesService.js';

// 📊 CONSTANTES TÂCHES (conservées)
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '⚡' },
  review: { label: 'En révision', color: 'yellow', icon: '👀' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'emerald', icon: '🏆' }
};

const TASK_PRIORITY = {
  low: { label: 'Faible', color: 'gray', icon: '🔽' },
  medium: { label: 'Normale', color: 'blue', icon: '➡️' },
  high: { label: 'Élevée', color: 'orange', icon: '🔼' },
  urgent: { label: 'Urgente', color: 'red', icon: '🚨' }
};

const DIFFICULTY_LEVELS = {
  easy: { label: 'Facile', xp: 15, color: 'green', icon: '🟢' },
  normal: { label: 'Normal', xp: 25, color: 'blue', icon: '🔵' },
  medium: { label: 'Moyen', xp: 25, color: 'yellow', icon: '🟡' },
  hard: { label: 'Difficile', xp: 40, color: 'orange', icon: '🟠' },
  expert: { label: 'Expert', xp: 60, color: 'red', icon: '🔴' }
};

/**
 * 🎮 PAGE TÂCHES PREMIUM COMPLÈTE
 */
const TasksPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  
  // ✅ ÉTATS PRINCIPAUX (conservés)
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ✅ ÉTATS UI COMPLETS (conservés)
  const [activeTab, setActiveTab] = useState('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // ✅ ÉTATS MODALS (conservés)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // ✅ CHARGEMENT DES TÂCHES (conservé)
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setLoading(false);
      return;
    }

    console.log('📊 [TASKS] Configuration listener tâches...');
    
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const tasksData = [];
        snapshot.forEach((doc) => {
          tasksData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`📊 [TASKS] ${tasksData.length} tâches chargées`);
        setTasks(tasksData);
        setLoading(false);
        setError('');
      },
      (error) => {
        console.error('❌ [TASKS] Erreur listener:', error);
        setError('Erreur de chargement des tâches');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  // ✅ FILTRAGE ET TRI DES TÂCHES (conservé)
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Filtres par onglet
      if (activeTab === 'my') {
        const isAssignedToMe = task.assignedTo === user?.uid || 
                              (Array.isArray(task.assignedTo) && task.assignedTo.includes(user?.uid));
        const isNotCompleted = task.status !== 'completed' && task.status !== 'validated';
        if (!(isAssignedToMe && isNotCompleted)) return false;
      } else if (activeTab === 'available') {
        const isNotCompleted = task.status !== 'completed' && task.status !== 'validated';
        const isOpenToVolunteers = task.isOpenToVolunteers === true;
        const hasNoAssignee = !task.assignedTo || task.assignedTo === null || task.assignedTo === '';
        if (!(isNotCompleted && (isOpenToVolunteers || hasNoAssignee))) return false;
      } else if (activeTab === 'others') {
        const isNotCompleted = task.status !== 'completed' && task.status !== 'validated';
        const isAssignedToSomeoneElse = task.assignedTo && 
                                       task.assignedTo !== user?.uid && 
                                       (!Array.isArray(task.assignedTo) || !task.assignedTo.includes(user?.uid));
        const isNotCreatedByMe = task.createdBy !== user?.uid;
        if (!(isNotCompleted && isAssignedToSomeoneElse && isNotCreatedByMe)) return false;
      } else if (activeTab === 'history') {
        if (!(task.status === 'completed' || task.status === 'validated')) return false;
      }

      // Filtres de recherche
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedRole && task.roleId !== selectedRole) return false;
      if (selectedPriority && task.priority !== selectedPriority) return false;
      if (selectedStatus && task.status !== selectedStatus) return false;

      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'dueDate' || sortBy === 'createdAt') {
        aVal = aVal ? new Date(aVal.seconds ? aVal.seconds * 1000 : aVal) : new Date(0);
        bVal = bVal ? new Date(bVal.seconds ? bVal.seconds * 1000 : bVal) : new Date(0);
      }

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

  // ✅ ONGLETS AVEC COMPTEURS (conservés)
  const tabs = [
    {
      id: 'my',
      label: 'Mes Tâches',
      icon: User,
      count: tasks.filter(t => {
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
        return t.status === 'completed' || t.status === 'validated';
      }).length
    }
  ];

  // ✅ FONCTIONS CRUD (conservées)
  const handleCreateTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Tâche créée avec succès');
      setShowCreateModal(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      setError('Impossible de créer la tâche');
    }
  };

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

  const handleCompleteTask = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Tâche marquée comme terminée');
    } catch (error) {
      console.error('❌ Erreur pour terminer la tâche:', error);
      setError('Impossible de terminer la tâche');
    }
  };

  // 📊 STATISTIQUES POUR HEADER PREMIUM
  const headerStats = [
    { 
      label: "Mes Tâches", 
      value: tabs[0].count, 
      icon: User, 
      color: "text-blue-400" 
    },
    { 
      label: "Disponibles", 
      value: tabs[1].count, 
      icon: Heart, 
      color: "text-green-400" 
    },
    { 
      label: "En Cours", 
      value: tasks.filter(t => t.status === 'in_progress').length, 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Terminées", 
      value: tasks.filter(t => t.status === 'completed' || t.status === 'validated').length, 
      icon: Target, 
      color: "text-purple-400" 
    }
  ];

  // 🎯 ACTIONS HEADER PREMIUM
  const headerActions = (
    <>
      {/* 🔍 BARRE DE RECHERCHE PREMIUM */}
      <PremiumSearchBar
        placeholder="Rechercher une tâche..."
        value={searchTerm}
        onChange={setSearchTerm}
        icon={Search}
        className="w-64"
      />

      {/* 🎛️ BOUTON FILTRES */}
      <PremiumButton
        variant={showFilters ? "primary" : "secondary"}
        icon={Filter}
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtres
      </PremiumButton>

      {/* ➕ NOUVELLE TÂCHE */}
      <PremiumButton
        variant="primary"
        icon={Plus}
        onClick={() => setShowCreateModal(true)}
      >
        Nouvelle Tâche
      </PremiumButton>
    </>
  );

  // 🚨 GESTION CHARGEMENT
  if (loading) {
    return (
      <PremiumLayout
        title="Gestion des Tâches"
        subtitle="Chargement de vos tâches..."
        icon={CheckSquare}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Synchronisation des tâches...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // 🚨 GESTION ERREUR
  if (error) {
    return (
      <PremiumLayout
        title="Gestion des Tâches"
        subtitle="Erreur de chargement"
        icon={CheckSquare}
      >
        <PremiumCard className="text-center py-8">
          <div className="text-red-400 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Erreur de synchronisation</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
          </div>
          <PremiumButton variant="primary" onClick={() => window.location.reload()}>
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Gestion des Tâches"
      subtitle="Organisez et suivez vos tâches par rôles Synergia"
      icon={CheckSquare}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🎛️ PANNEAU DE FILTRES PREMIUM */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <PremiumCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filtres Avancés</h3>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedRole('');
                    setSelectedPriority('');
                    setSelectedStatus('');
                    setSortBy('dueDate');
                    setSortOrder('asc');
                  }}
                >
                  Réinitialiser
                </PremiumButton>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtre Rôle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les rôles</option>
                    {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.icon} {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priorité</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes priorités</option>
                    {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
                      <option key={key} value={key}>
                        {priority.icon} {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtre Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous statuts</option>
                    {Object.entries(TASK_STATUS).map(([key, status]) => (
                      <option key={key} value={key}>
                        {status.icon} {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tri */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trier par</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dueDate">Date d'échéance</option>
                      <option value="createdAt">Date de création</option>
                      <option value="title">Titre</option>
                      <option value="priority">Priorité</option>
                    </select>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      icon={sortOrder === 'asc' ? SortAsc : SortDesc}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    />
                  </div>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📑 ONGLETS PREMIUM */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 flex-1
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              <span className={`
                px-2 py-1 rounded-full text-xs font-bold
                ${activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-600 text-gray-300'
                }
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 📋 CONTENU DES TÂCHES PREMIUM */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400">Chargement des tâches...</p>
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <PremiumCard className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm || selectedRole || selectedPriority || selectedStatus
                ? 'Aucune tâche ne correspond aux critères'
                : 'Aucune tâche dans cette catégorie'
              }
            </h3>
            <p className="text-gray-400 mb-4">
              {activeTab === 'my' && 'Vous n\'avez aucune tâche assignée pour le moment.'}
              {activeTab === 'available' && 'Aucune tâche disponible pour le moment.'}
              {activeTab === 'others' && 'Aucune tâche assignée à d\'autres membres.'}
              {activeTab === 'history' && 'Aucune tâche terminée dans l\'historique.'}
            </p>
            {activeTab === 'my' && (
              <PremiumButton
                variant="primary"
                icon={Plus}
                onClick={() => setShowCreateModal(true)}
              >
                Créer ma première tâche
              </PremiumButton>
            )}
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTasks.map((task, index) => {
              const role = SYNERGIA_ROLES[task.roleId];
              const status = TASK_STATUS[task.status];
              const priority = TASK_PRIORITY[task.priority];
              const difficulty = DIFFICULTY_LEVELS[task.difficulty];
              const isMyTask = task.assignedTo === user?.uid || task.createdBy === user?.uid;
              const canEdit = task.createdBy === user?.uid;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <PremiumCard className="h-full">
                    {/* Header de la carte */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">
                          {task.title}
                        </h3>
                        
                        {/* Rôle Synergia */}
                        {role && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{role.icon}</span>
                            <span className="text-sm text-gray-300">{role.name}</span>
                          </div>
                        )}

                        {/* Badges Status, Priorité, Difficulté */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {status && (
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${status.color === 'gray' ? 'bg-gray-600 text-gray-200' :
                                status.color === 'blue' ? 'bg-blue-600 text-blue-100' :
                                status.color === 'yellow' ? 'bg-yellow-600 text-yellow-100' :
                                status.color === 'green' ? 'bg-green-600 text-green-100' :
                                'bg-emerald-600 text-emerald-100'}
                            `}>
                              {status.icon} {status.label}
                            </span>
                          )}
                          
                          {priority && (
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${priority.color === 'gray' ? 'bg-gray-600 text-gray-200' :
                                priority.color === 'blue' ? 'bg-blue-600 text-blue-100' :
                                priority.color === 'orange' ? 'bg-orange-600 text-orange-100' :
                                'bg-red-600 text-red-100'}
                            `}>
                              {priority.icon} {priority.label}
                            </span>
                          )}

                          {difficulty && (
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${difficulty.color === 'green' ? 'bg-green-600 text-green-100' :
                                difficulty.color === 'blue' ? 'bg-blue-600 text-blue-100' :
                                difficulty.color === 'yellow' ? 'bg-yellow-600 text-yellow-100' :
                                difficulty.color === 'orange' ? 'bg-orange-600 text-orange-100' :
                                'bg-red-600 text-red-100'}
                            `}>
                              {difficulty.icon} {difficulty.xp} XP
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Indicateurs médias et actions */}
                      <div className="ml-2 flex flex-col items-end gap-2">
                        {/* Média indicator */}
                        <div className="flex items-center gap-1">
                          {task.hasMedia && (
                            <div title={`${task.mediaType === 'video' ? 'Vidéo' : 'Image'} disponible`}>
                              {task.mediaType === 'video' ? 
                                <Play className="w-4 h-4 text-blue-400" /> : 
                                <ImageIcon className="w-4 h-4 text-green-400" />
                              }
                            </div>
                          )}
                          
                          {/* Commentaires count */}
                          {task.commentsCount > 0 && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-xs">{task.commentsCount}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions rapides */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setShowDetailModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setEditMode(true);
                                  setShowCreateModal(true);
                                }}
                                className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                                title="Éditer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Date d'échéance */}
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate)
                            .toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    {/* Actions de la carte */}
                    <div className="flex gap-2 mt-auto pt-3 border-t border-gray-700/50">
                      {activeTab === 'available' && !isMyTask && (
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          icon={Heart}
                          onClick={() => handleTakeTask(task.id)}
                          className="flex-1"
                        >
                          Prendre
                        </PremiumButton>
                      )}
                      
                      {isMyTask && task.status !== 'completed' && task.status !== 'validated' && (
                        <PremiumButton
                          variant="primary"
                          size="sm"
                          icon={CheckSquare}
                          onClick={() => handleCompleteTask(task.id)}
                          className="flex-1"
                        >
                          Terminer
                        </PremiumButton>
                      )}
                      
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailModal(true);
                        }}
                        className="flex-1"
                      >
                        Détails
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📊 STATISTIQUES SUPPLÉMENTAIRES */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="XP Total Disponible"
          value={tasks.reduce((sum, task) => sum + (DIFFICULTY_LEVELS[task.difficulty]?.xp || 0), 0)}
          icon={Zap}
          color="yellow"
          trend={`${tasks.length} tâches`}
        />
        
        <StatCard
          title="Tâches Urgentes"
          value={tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length}
          icon={AlertCircle}
          color="red"
          trend="Action requise"
        />
        
        <StatCard
          title="Taux de Complétion"
          value={`${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed' || t.status === 'validated').length / tasks.length) * 100) : 0}%`}
          icon={Target}
          color="green"
          trend="Ce mois"
        />
      </div>

      {/* TODO: Modals à créer avec design premium */}
      {/* CreateTaskModal, TaskDetailModal */}
    </PremiumLayout>
  );
};

export default TasksPage;
