// ==========================================
// react-app/src/pages/TasksPage.jsx
// PAGE QUÊTES - SYNERGIA v4.0
// Design responsive mobile-first
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
  MessageCircle,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Swords,
  Target,
  Trophy,
  Flame,
  LayoutGrid,
  List,
  Columns,
  SlidersHorizontal
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';
import NewTaskModal from '../components/tasks/NewTaskModal.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import unifiedBadgeService from '../core/services/unifiedBadgeSystem.js';

// Constantes
const QUEST_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '📋', bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  in_progress: { label: 'En cours', color: 'blue', icon: '🚀', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  validation_pending: { label: 'Validation', color: 'yellow', icon: '⏳', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  completed: { label: 'Terminée', color: 'green', icon: '✅', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  validated: { label: 'Validée', color: 'emerald', icon: '🏆', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  cancelled: { label: 'Annulée', color: 'red', icon: '❌', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
};

const QUEST_PRIORITY = {
  low: { label: 'Basse', color: 'green', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

// Composant StatCard compact
const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`
      relative overflow-hidden rounded-xl p-3 sm:p-4
      bg-gradient-to-br ${gradient}
      border border-white/10 backdrop-blur-sm
    `}
  >
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`
        w-8 h-8 sm:w-10 sm:h-10 rounded-lg
        bg-white/10 flex items-center justify-center
      `}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-[10px] sm:text-xs text-gray-400 truncate">{label}</p>
      </div>
    </div>
  </motion.div>
);

// Composant Tab mobile-friendly
const TabButton = ({ active, onClick, icon: Icon, label, count, color }) => (
  <button
    onClick={onClick}
    className={`
      flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3
      rounded-xl font-medium transition-all whitespace-nowrap
      ${active
        ? `bg-gradient-to-r ${color} text-white shadow-lg`
        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm">{label}</span>
    {count !== undefined && (
      <span className={`
        px-1.5 py-0.5 rounded-full text-xs font-bold
        ${active ? 'bg-white/20' : 'bg-gray-700'}
      `}>
        {count}
      </span>
    )}
  </button>
);

// Composant FilterBottomSheet pour mobile
const FilterBottomSheet = ({
  isOpen,
  onClose,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  sortOrder,
  setSortOrder
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 rounded-t-3xl max-h-[80vh] overflow-y-auto"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
          </div>

          <div className="px-4 pb-8 pt-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                Filtres
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Statut</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedStatus === 'all'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  Tous
                </button>
                {Object.entries(QUEST_STATUS).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedStatus === key
                        ? `${info.bg} ${info.text} border ${info.border}`
                        : 'bg-white/5 text-gray-400 border border-transparent'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span className="truncate">{info.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priorite */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Priorite</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedPriority('all')}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedPriority === 'all'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  Toutes
                </button>
                {Object.entries(QUEST_PRIORITY).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPriority(key)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedPriority === key
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-white/5 text-gray-400 border border-transparent'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ordre de tri</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSortOrder('desc')}
                  className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    sortOrder === 'desc'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  <SortDesc className="w-4 h-4" />
                  Plus recent
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    sortOrder === 'asc'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-white/5 text-gray-400 border border-transparent'
                  }`}
                >
                  <SortAsc className="w-4 h-4" />
                  Plus ancien
                </button>
              </div>
            </div>

            {/* Bouton appliquer */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl"
            >
              Appliquer les filtres
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Composant principal
const TasksPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // Etats
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my_tasks');
  const [viewMode, setViewMode] = useState('cards');
  const [taskComments, setTaskComments] = useState({});
  const [usersInfo, setUsersInfo] = useState({});

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Modals
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});

  // Chargement des quetes
  useEffect(() => {
    if (!user?.uid) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const loadedTasks = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(task => task.id && task.title);

      setTasks(loadedTasks);
      setIsLoading(false);
    }, (error) => {
      console.error('Erreur chargement:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Chargement des commentaires
  useEffect(() => {
    if (!user?.uid || tasks.length === 0) return;

    const unsubscribes = [];

    tasks.forEach(task => {
      const commentsQuery = query(
        collection(db, 'tasks', task.id, 'comments'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTaskComments(prev => ({ ...prev, [task.id]: comments }));
      });

      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [tasks, user?.uid]);

  // Chargement des infos utilisateurs
  useEffect(() => {
    if (!tasks.length) return;

    const loadUsersInfo = async () => {
      const completedTasks = tasks.filter(t =>
        ['completed', 'validated', 'cancelled'].includes(t.status)
      );

      const userIds = new Set();
      completedTasks.forEach(task => {
        const assignedTo = Array.isArray(task.assignedTo)
          ? task.assignedTo
          : (task.assignedTo ? [task.assignedTo] : []);
        assignedTo.forEach(id => { if (id?.trim()) userIds.add(id); });
      });

      const newUsersInfo = { ...usersInfo };

      for (const userId of userIds) {
        if (!newUsersInfo[userId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              newUsersInfo[userId] = {
                name: userData.displayName || userData.email || 'Utilisateur',
                email: userData.email,
                photoURL: userData.photoURL
              };
            } else {
              newUsersInfo[userId] = { name: 'Utilisateur inconnu' };
            }
          } catch {
            newUsersInfo[userId] = { name: 'Utilisateur' };
          }
        }
      }

      setUsersInfo(newUsersInfo);
    };

    loadUsersInfo();
  }, [tasks]);

  // Filtrage et tri
  useEffect(() => {
    let filtered = [...tasks];

    // Filtre par onglet
    if (activeTab === 'my_tasks') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        const isAssignedToMe = assignedTo.includes(user?.uid);
        const isCompleted = ['completed', 'validated', 'cancelled'].includes(task.status);
        return isAssignedToMe && !isCompleted;
      });
    } else if (activeTab === 'available') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        const isAssignedToMe = assignedTo.includes(user?.uid);
        const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
        const isOpenToVolunteers = task.openToVolunteers === true;
        return !isAssignedToMe && (isOpenToVolunteers || hasNoAssignment) && task.status === 'todo';
      });
    } else if (activeTab === 'others') {
      filtered = filtered.filter(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
        const isAssignedToMe = assignedTo.includes(user?.uid);
        const hasAssignments = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
        const isCompleted = ['completed', 'validated', 'cancelled'].includes(task.status);
        return !isAssignedToMe && hasAssignments && !isCompleted;
      });
    } else if (activeTab === 'history') {
      filtered = filtered.filter(task => ['completed', 'validated', 'cancelled'].includes(task.status));
    }

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Autres filtres
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Tri
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredTasks(filtered);
  }, [tasks, activeTab, searchTerm, selectedStatus, selectedPriority, sortBy, sortOrder, user?.uid]);

  // Handlers
  const handleViewDetails = useCallback((task) => {
    if (task) setSelectedTaskForDetails(task);
  }, []);

  const handleEdit = useCallback((task) => {
    if (['completed', 'validated', 'cancelled'].includes(task.status)) {
      alert('Les quetes terminees ne peuvent plus etre modifiees');
      return;
    }
    setSelectedTaskForEdit(task);
  }, []);

  const handleDelete = useCallback(async (task) => {
    if (['completed', 'validated', 'cancelled'].includes(task.status)) {
      alert('Les quetes terminees ne peuvent plus etre supprimees');
      return;
    }
    if (!window.confirm('Supprimer cette quete ?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  }, []);

  const handleStatusChange = useCallback(async (task, newStatus) => {
    try {
      // Vérifier si c'est un changement vers un statut de complétion (et pas déjà complété)
      const isCompletion = (newStatus === 'completed' || newStatus === 'validated') &&
                           task.status !== 'completed' && task.status !== 'validated';

      await updateDoc(doc(db, 'tasks', task.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Si tâche complétée/validée, mettre à jour la gamification des utilisateurs assignés
      if (isCompletion) {
        const assignedUsers = Array.isArray(task.assignedTo) ? task.assignedTo : [];

        for (const userId of assignedUsers) {
          if (!userId?.trim()) continue;

          try {
            // Vérifier l'heure pour les badges Lève-tôt et Oiseau de Nuit
            const currentHour = new Date().getHours();
            const updateData = {
              'gamification.tasksCompleted': increment(1),
              'gamification.lastActivityAt': serverTimestamp()
            };

            // Badge Lève-tôt : compléter avant 13h
            if (currentHour < 13) {
              updateData['gamification.earlyBirdUnlocked'] = true;
            }

            // Badge Oiseau de Nuit : compléter après 22h
            if (currentHour >= 22) {
              updateData['gamification.nightOwlUnlocked'] = true;
            }

            // Incrémenter tasksCompleted et mettre à jour les flags
            await updateDoc(doc(db, 'users', userId), updateData);

            // Vérifier et débloquer les badges
            await unifiedBadgeService.checkAndUnlockBadges(userId, 'task_completed');

            console.log(`✅ [GAMIFICATION] Quête complétée pour ${userId}, badges vérifiés`);
          } catch (userError) {
            console.error(`❌ Erreur gamification pour ${userId}:`, userError);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      alert('Erreur lors du changement de statut');
    }
  }, []);

  const handleVolunteer = useCallback(async (task) => {
    try {
      const currentAssignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: [...currentAssignedTo, user.uid],
        status: task.status === 'todo' ? 'in_progress' : task.status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      alert('Erreur lors du volontariat');
    }
  }, [user?.uid]);

  const handleUnvolunteer = useCallback(async (task) => {
    if (!window.confirm('Vous retirer de cette quete ?')) return;
    try {
      const currentAssignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      const newAssignedTo = currentAssignedTo.filter(id => id !== user.uid);
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: newAssignedTo,
        status: newAssignedTo.length === 0 ? 'todo' : task.status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      alert('Erreur lors de la desassignation');
    }
  }, [user?.uid]);

  // Abandon par le créateur - la quête reste disponible pour d'autres
  const handleAbandon = useCallback(async (task) => {
    try {
      const currentAssignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      const newAssignedTo = currentAssignedTo.filter(id => id !== user.uid);
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: newAssignedTo,
        abandonedByCreator: true,
        abandonedAt: serverTimestamp(),
        previousCreator: user.uid,
        openToVolunteers: true,
        status: newAssignedTo.length === 0 ? 'todo' : task.status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      alert('Erreur lors de l\'abandon');
    }
  }, [user?.uid]);

  // [ADMIN] Désassigner tous les volontaires d'une quête
  const handleAdminUnassign = useCallback(async (task) => {
    if (!userIsAdmin) {
      alert('Vous n\'avez pas les droits pour cette action.');
      return;
    }
    try {
      const previousAssignees = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: [],
        previousAssignees, // Garder une trace des anciens assignés
        unassignedByAdmin: user.uid,
        unassignedAt: serverTimestamp(),
        openToVolunteers: true,
        status: 'todo', // Remettre en "à faire"
        updatedAt: serverTimestamp()
      });
      console.log('✅ [ADMIN] Quête désassignée:', task.title);
    } catch (error) {
      console.error('❌ Erreur désassignation admin:', error);
      alert('Erreur lors de la désassignation');
    }
  }, [user?.uid, userIsAdmin]);

  const toggleUserSection = useCallback((userId) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  }, []);

  // Statistiques
  const stats = useMemo(() => {
    const myTasks = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      const isAssignedToMe = assignedTo.includes(user?.uid);
      const isCompleted = ['completed', 'validated', 'cancelled'].includes(t.status);
      return isAssignedToMe && !isCompleted;
    });

    const available = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      const isAssignedToMe = assignedTo.includes(user?.uid);
      const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
      const isOpenToVolunteers = t.openToVolunteers === true;
      return !isAssignedToMe && (isOpenToVolunteers || hasNoAssignment) && t.status === 'todo';
    });

    const others = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      const isAssignedToMe = assignedTo.includes(user?.uid);
      const hasAssignments = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
      const isCompleted = ['completed', 'validated', 'cancelled'].includes(t.status);
      return !isAssignedToMe && hasAssignments && !isCompleted;
    });

    return {
      myTasks: myTasks.length,
      available: available.length,
      others: others.length,
      completed: tasks.filter(t => ['completed', 'validated'].includes(t.status)).length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      totalXP: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0)
    };
  }, [tasks, user?.uid]);

  // Historique groupe
  const historyGroupedByUser = useMemo(() => {
    if (activeTab !== 'history') return {};

    const completedTasks = tasks.filter(t =>
      ['completed', 'validated', 'cancelled'].includes(t.status)
    );

    const grouped = {};

    completedTasks.forEach(task => {
      const assignedTo = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : (task.assignedTo ? [task.assignedTo] : []);

      if (assignedTo.length === 0) {
        if (!grouped['unassigned']) {
          grouped['unassigned'] = { userName: 'Non assignees', userPhoto: null, tasks: [] };
        }
        grouped['unassigned'].tasks.push(task);
        return;
      }

      assignedTo.forEach(userId => {
        if (!userId?.trim()) return;
        if (!grouped[userId]) {
          const userInfo = usersInfo[userId] || { name: 'Chargement...' };
          grouped[userId] = {
            userName: userInfo.name,
            userPhoto: userInfo.photoURL,
            userEmail: userInfo.email,
            tasks: []
          };
        }
        grouped[userId].tasks.push(task);
      });
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1].tasks.length - a[1].tasks.length)
      .reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {});
  }, [tasks, activeTab, usersInfo]);

  const toggleAllSections = useCallback((expand) => {
    const newState = {};
    Object.keys(historyGroupedByUser).forEach(userId => { newState[userId] = expand; });
    setExpandedUsers(newState);
  }, [historyGroupedByUser]);

  // Nombre de filtres actifs
  const activeFiltersCount = [
    selectedStatus !== 'all',
    selectedPriority !== 'all'
  ].filter(Boolean).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 overflow-x-hidden relative">

        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        {/* Header compact mobile */}
        <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 py-4 sm:px-6">

            {/* Titre et boutons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Quetes</h1>
                  <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                    Gerez vos missions
                  </p>
                </div>
              </div>

              {/* Actions header - desktop */}
              <div className="hidden sm:flex items-center gap-2">
                {/* Vue switcher */}
                <div className="flex items-center bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouvelle</span>
                </button>
              </div>

              {/* Actions header - mobile */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2.5 rounded-lg transition-all ${showSearch ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowFilters(true)}
                  className="relative p-2.5 bg-white/5 rounded-lg text-gray-400"
                >
                  <Filter className="w-5 h-5" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Barre de recherche mobile */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="sm:hidden mb-4 overflow-hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats grid responsive */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              <StatCard
                icon={User}
                label="Mes quetes"
                value={stats.myTasks}
                color="text-blue-400"
                gradient="from-blue-500/10 to-blue-600/5"
              />
              <StatCard
                icon={Heart}
                label="Disponibles"
                value={stats.available}
                color="text-green-400"
                gradient="from-green-500/10 to-green-600/5"
              />
              <StatCard
                icon={Users}
                label="Autres"
                value={stats.others}
                color="text-purple-400"
                gradient="from-purple-500/10 to-purple-600/5"
              />
              <div className="hidden sm:block">
                <StatCard
                  icon={Flame}
                  label="En cours"
                  value={stats.inProgress}
                  color="text-orange-400"
                  gradient="from-orange-500/10 to-orange-600/5"
                />
              </div>
              <div className="hidden sm:block">
                <StatCard
                  icon={Trophy}
                  label="Terminees"
                  value={stats.completed}
                  color="text-emerald-400"
                  gradient="from-emerald-500/10 to-emerald-600/5"
                />
              </div>
              <div className="hidden sm:block">
                <StatCard
                  icon={Zap}
                  label="XP Total"
                  value={stats.totalXP}
                  color="text-yellow-400"
                  gradient="from-yellow-500/10 to-yellow-600/5"
                />
              </div>
            </div>
          </div>

          {/* Onglets scrollables */}
          <div className="px-4 sm:px-6 pb-3 overflow-x-auto scrollbar-hide -mx-4 sm:mx-0">
            <div className="flex gap-2 min-w-max px-4 sm:px-0">
              <TabButton
                active={activeTab === 'my_tasks'}
                onClick={() => setActiveTab('my_tasks')}
                icon={User}
                label="Mes quetes"
                count={stats.myTasks}
                color="from-blue-600 to-blue-700"
              />
              <TabButton
                active={activeTab === 'available'}
                onClick={() => setActiveTab('available')}
                icon={Heart}
                label="Disponibles"
                count={stats.available}
                color="from-green-600 to-green-700"
              />
              <TabButton
                active={activeTab === 'others'}
                onClick={() => setActiveTab('others')}
                icon={Users}
                label="Autres"
                count={stats.others}
                color="from-purple-600 to-purple-700"
              />
              <TabButton
                active={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                icon={Archive}
                label="Historique"
                color="from-gray-600 to-gray-700"
              />
            </div>
          </div>

          {/* Filtres desktop */}
          <div className="hidden sm:flex items-center gap-3 px-6 pb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une quete..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="all">Tous statuts</option>
              {Object.entries(QUEST_STATUS).map(([key, info]) => (
                <option key={key} value={key}>{info.icon} {info.label}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="all">Priorites</option>
              {Object.entries(QUEST_PRIORITY).map(([key, info]) => (
                <option key={key} value={key}>{info.icon} {info.label}</option>
              ))}
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-400">Chargement des quetes...</p>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucune quete</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                {activeTab === 'my_tasks' && "Vous n'avez pas de quetes en cours"}
                {activeTab === 'available' && "Aucune quete disponible"}
                {activeTab === 'others' && "Aucune quete assignee aux autres"}
                {activeTab === 'history' && "Pas encore de quetes terminees"}
              </p>
              {activeTab === 'my_tasks' && (
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
                >
                  Creer une quete
                </button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Vue Cartes */}
              {viewMode === 'cards' && activeTab !== 'history' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <AnimatePresence>
                    {filteredTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        commentCount={taskComments[task.id]?.length || 0}
                        isHistoryMode={false}
                        isAdmin={userIsAdmin}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onVolunteer={handleVolunteer}
                        onUnvolunteer={handleUnvolunteer}
                        onAbandon={handleAbandon}
                        onAdminUnassign={handleAdminUnassign}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Vue Liste */}
              {viewMode === 'list' && activeTab !== 'history' && (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        viewMode="list"
                        isAdmin={userIsAdmin}
                        commentCount={taskComments[task.id]?.length || 0}
                        isHistoryMode={false}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onVolunteer={handleVolunteer}
                        onUnvolunteer={handleUnvolunteer}
                        onAbandon={handleAbandon}
                        onAdminUnassign={handleAdminUnassign}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Vue Kanban */}
              {viewMode === 'kanban' && activeTab !== 'history' && (
                <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="flex gap-3 min-w-max sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:min-w-0">
                    {Object.entries(QUEST_STATUS).map(([statusKey, statusInfo]) => {
                      const tasksInColumn = filteredTasks.filter(t => t.status === statusKey);
                      return (
                        <div
                          key={statusKey}
                          className="w-72 sm:w-auto flex-shrink-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                              <span>{statusInfo.icon}</span>
                              <span className="hidden lg:inline">{statusInfo.label}</span>
                            </h3>
                            <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                              {tasksInColumn.length}
                            </span>
                          </div>
                          <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {tasksInColumn.map(task => (
                              <motion.div
                                key={task.id}
                                layout
                                onClick={() => handleViewDetails(task)}
                                className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 cursor-pointer hover:border-purple-500/50 transition-all active:scale-[0.98]"
                              >
                                <h4 className="font-medium text-white text-sm mb-1 line-clamp-2">{task.title}</h4>
                                <div className="flex items-center justify-between text-xs">
                                  {task.xpReward && (
                                    <span className="flex items-center text-yellow-400">
                                      <Zap className="w-3 h-3 mr-1" />
                                      {task.xpReward}
                                    </span>
                                  )}
                                  {taskComments[task.id]?.length > 0 && (
                                    <span className="flex items-center text-blue-400">
                                      <MessageCircle className="w-3 h-3 mr-1" />
                                      {taskComments[task.id].length}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Vue Historique groupee */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {/* Boutons deplier/replier */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">
                      {Object.keys(historyGroupedByUser).length} utilisateur(s)
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAllSections(true)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 flex items-center gap-1 active:scale-95"
                      >
                        <ChevronDown className="w-3 h-3" />
                        <span className="hidden sm:inline">Deplier</span>
                      </button>
                      <button
                        onClick={() => toggleAllSections(false)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 flex items-center gap-1 active:scale-95"
                      >
                        <ChevronUp className="w-3 h-3" />
                        <span className="hidden sm:inline">Replier</span>
                      </button>
                    </div>
                  </div>

                  {Object.entries(historyGroupedByUser).map(([userId, userGroup]) => {
                    const isExpanded = expandedUsers[userId] || false;

                    return (
                      <motion.div
                        key={userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleUserSection(userId)}
                          className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-white/5 transition-colors active:bg-white/10"
                        >
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="text-gray-400"
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>

                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                            {userGroup.userPhoto ? (
                              <img src={userGroup.userPhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              userGroup.userName.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                              {userGroup.userName}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-4 text-right">
                            <div className="text-center">
                              <span className="text-purple-400 font-bold text-sm sm:text-lg">
                                {userGroup.tasks.length}
                              </span>
                              <span className="text-gray-500 text-[10px] sm:text-xs block">quetes</span>
                            </div>
                            <div className="text-center">
                              <span className="text-yellow-400 font-bold text-sm sm:text-lg">
                                {userGroup.tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0)}
                              </span>
                              <span className="text-gray-500 text-[10px] sm:text-xs block">XP</span>
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 sm:p-4 pt-0 border-t border-white/10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                                  {userGroup.tasks.map(task => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      commentCount={taskComments[task.id]?.length || 0}
                                      isHistoryMode={true}
                                      isAdmin={userIsAdmin}
                                      onViewDetails={handleViewDetails}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                      onStatusChange={handleStatusChange}
                                      onVolunteer={handleVolunteer}
                                      onUnvolunteer={handleUnvolunteer}
                                      onAbandon={handleAbandon}
                                      onAdminUnassign={handleAdminUnassign}
                                    />
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* FAB mobile pour nouvelle quete */}
        <motion.button
          onClick={() => setShowNewTaskModal(true)}
          className="sm:hidden fixed right-4 bottom-24 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        {/* Vue switcher mobile */}
        <div className="sm:hidden fixed left-4 bottom-24 flex bg-gray-800/95 backdrop-blur-lg rounded-full shadow-lg border border-white/10 z-30">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-3 rounded-full transition-all ${
              viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-full transition-all ${
              viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-3 rounded-full transition-all ${
              viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-gray-400'
            }`}
          >
            <Columns className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet Filtres Mobile */}
      <FilterBottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Modals */}
      {showNewTaskModal && (
        <NewTaskModal onClose={() => setShowNewTaskModal(false)} />
      )}

      {selectedTaskForDetails && (
        <TaskDetailModal
          task={selectedTaskForDetails}
          isOpen={true}
          onClose={() => setSelectedTaskForDetails(null)}
        />
      )}

      {selectedTaskForEdit && (
        <NewTaskModal
          task={selectedTaskForEdit}
          mode="edit"
          onClose={() => setSelectedTaskForEdit(null)}
        />
      )}
    </Layout>
  );
};

export default TasksPage;
