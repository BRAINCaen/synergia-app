// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE AVEC TOUS LES SYSTÈMES
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
  Trash2,
  X,
  UserPlus,
  UserMinus,
  Send,
  History,
  Filter as FilterIcon,
  SortDesc as SortDescIcon,
  ThumbsUp,
  Award,
  MapPin,
  Tag,
  Paperclip,
  Video,
  Camera,
  Globe,
  Lock,
  Users2
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE
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
  getDocs,
  getDoc,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎮 SERVICES ET CONSTANTES
import { SYNERGIA_ROLES } from '../core/data/roles.js';

// 📊 CONSTANTES ÉTENDUES
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '⚡' },
  review: { label: 'En révision', color: 'yellow', icon: '👀' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'purple', icon: '🏆' },
  cancelled: { label: 'Annulée', color: 'red', icon: '❌' },
  volunteer_pending: { label: 'Recherche volontaires', color: 'orange', icon: '🙋' },
  volunteer_review: { label: 'Candidatures en cours', color: 'cyan', icon: '📋' }
};

const TASK_PRIORITY = {
  low: { label: 'Basse', color: 'gray', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

const TASK_CATEGORIES = {
  maintenance: { label: 'Maintenance', color: 'orange', icon: '🔧' },
  management: { label: 'Gestion', color: 'blue', icon: '📊' },
  development: { label: 'Développement', color: 'green', icon: '💻' },
  communication: { label: 'Communication', color: 'purple', icon: '📢' },
  training: { label: 'Formation', color: 'indigo', icon: '🎓' },
  marketing: { label: 'Marketing', color: 'pink', icon: '📱' },
  sales: { label: 'Ventes', color: 'emerald', icon: '💰' },
  support: { label: 'Support', color: 'cyan', icon: '🎧' },
  research: { label: 'Recherche', color: 'violet', icon: '🔬' },
  planning: { label: 'Planification', color: 'amber', icon: '📅' },
  volunteer: { label: 'Volontariat', color: 'rose', icon: '❤️' }
};

const SORT_OPTIONS = {
  createdAt: { label: 'Date création', icon: Calendar },
  updatedAt: { label: 'Date modification', icon: Clock },
  dueDate: { label: 'Date échéance', icon: AlertCircle },
  priority: { label: 'Priorité', icon: Star },
  title: { label: 'Titre', icon: FileText },
  status: { label: 'Statut', icon: CheckSquare },
  xpReward: { label: 'Récompense XP', icon: Award },
  volunteerCount: { label: 'Nb volontaires', icon: Users },
  complexity: { label: 'Complexité', icon: Target }
};

// 🔧 FONCTION HELPER POUR CONVERTIR LES TIMESTAMPS
const convertFirebaseTimestamp = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate();
    } catch (error) {
      console.warn('Erreur conversion timestamp:', error);
      return new Date();
    }
  }
  if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

/**
 * 🏠 PAGE PRINCIPALE DES TÂCHES COMPLÈTE
 */
const TasksPage = () => {
  const { user } = useAuthStore();

  // États pour les données et UI
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  // 🆕 NOUVEAUX ÉTATS POUR LES SYSTÈMES AVANCÉS
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showVolunteerPanel, setShowVolunteerPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    hasMedia: false,
    isVolunteer: false,
    isRecurring: false,
    hasDeadline: false,
    myTasks: false,
    availableForVolunteer: false,
    completedByMe: false
  });
  const [taskHistory, setTaskHistory] = useState([]);
  const [volunteerRequests, setVolunteerRequests] = useState([]);
  const [taskMessages, setTaskMessages] = useState([]);

  // 📊 Statistiques calculées étendues
  const taskStats = useMemo(() => {
    const myVolunteerTasks = tasks.filter(t => 
      Array.isArray(t.assignedTo) && t.assignedTo.includes(user?.uid)
    );
    
    const availableVolunteerTasks = tasks.filter(t => 
      t.isOpenToVolunteers && 
      t.status !== 'completed' && 
      (!Array.isArray(t.assignedTo) || !t.assignedTo.includes(user?.uid))
    );

    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      myTasks: tasks.filter(t => t.createdBy === user?.uid).length,
      myVolunteerTasks: myVolunteerTasks.length,
      availableVolunteer: availableVolunteerTasks.length,
      withMedia: tasks.filter(t => t.hasMedia).length,
      recurring: tasks.filter(t => t.isRecurring).length
    };
  }, [tasks, user]);

  // 🔥 Charger les tâches depuis Firebase avec tous les systèmes
  useEffect(() => {
    if (!user) return;

    console.log('🔄 [TASKS] Démarrage chargement tâches complètes...');
    
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`📊 [TASKS] Snapshot reçu: ${snapshot.size} documents`);
      
      try {
        const tasksData = snapshot.docs.map(doc => {
          const data = doc.data();
          
          const taskData = {
            id: doc.id,
            ...data,
            createdAt: convertFirebaseTimestamp(data.createdAt),
            updatedAt: convertFirebaseTimestamp(data.updatedAt),
            dueDate: data.dueDate ? convertFirebaseTimestamp(data.dueDate) : null,
            // 🆕 SYSTÈMES ÉTENDUS
            volunteerCount: Array.isArray(data.assignedTo) ? data.assignedTo.length : 0,
            messageCount: data.messageCount || 0,
            historyCount: data.historyCount || 0,
            hasMedia: !!data.mediaUrl || !!data.photoUrl || !!data.videoUrl,
            isVolunteerTask: Array.isArray(data.assignedTo) && data.assignedTo.includes(user.uid),
            canVolunteer: data.isOpenToVolunteers && 
                         (!Array.isArray(data.assignedTo) || !data.assignedTo.includes(user.uid)) &&
                         data.status !== 'completed'
          };
          
          return taskData;
        });

        console.log(`✅ [TASKS] ${tasksData.length} tâches traitées avec succès`);
        setTasks(tasksData);
        setIsLoading(false);
        
      } catch (error) {
        console.error('❌ [TASKS] Erreur traitement données:', error);
        setTasks([]);
        setIsLoading(false);
      }
    }, (error) => {
      console.error('❌ [TASKS] Erreur écoute Firebase:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔍 Filtrage et tri avancés
  useEffect(() => {
    let filtered = [...tasks];

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        task.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtres de base
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task.role === selectedRole);
    }

    // 🆕 FILTRES AVANCÉS
    if (selectedFilters.hasMedia) {
      filtered = filtered.filter(task => task.hasMedia);
    }

    if (selectedFilters.isVolunteer) {
      filtered = filtered.filter(task => task.isVolunteerTask);
    }

    if (selectedFilters.isRecurring) {
      filtered = filtered.filter(task => task.isRecurring);
    }

    if (selectedFilters.hasDeadline) {
      filtered = filtered.filter(task => task.dueDate);
    }

    if (selectedFilters.myTasks) {
      filtered = filtered.filter(task => task.createdBy === user.uid);
    }

    if (selectedFilters.availableForVolunteer) {
      filtered = filtered.filter(task => task.canVolunteer);
    }

    if (selectedFilters.completedByMe) {
      filtered = filtered.filter(task => 
        task.status === 'completed' && 
        Array.isArray(task.assignedTo) && 
        task.assignedTo.includes(user.uid)
      );
    }

    // Tri avancé
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dueDate') {
        aValue = aValue instanceof Date ? aValue.getTime() : 0;
        bValue = bValue instanceof Date ? bValue.getTime() : 0;
      }

      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedCategory, selectedRole, sortBy, sortOrder, selectedFilters, user]);

  // 🎯 FONCTIONS DE GESTION DES TÂCHES ÉTENDUES

  const handleVolunteer = async (taskId) => {
    try {
      console.log('🙋 Volontariat pour tâche:', taskId);
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        assignedTo: arrayUnion(user.uid),
        volunteerHistory: arrayUnion({
          userId: user.uid,
          userName: user.displayName || user.email,
          action: 'volunteered',
          timestamp: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Volontariat enregistré');
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
    }
  };

  const handleWithdrawVolunteer = async (taskId) => {
    try {
      console.log('🚪 Retrait volontariat:', taskId);
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        assignedTo: arrayRemove(user.uid),
        volunteerHistory: arrayUnion({
          userId: user.uid,
          userName: user.displayName || user.email,
          action: 'withdrew',
          timestamp: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Retrait enregistré');
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
    }
  };

  const handleSendMessage = async (taskId, message) => {
    try {
      console.log('💬 Envoi message pour tâche:', taskId);
      
      await addDoc(collection(db, 'taskMessages'), {
        taskId,
        userId: user.uid,
        userName: user.displayName || user.email,
        message,
        timestamp: serverTimestamp()
      });

      // Mettre à jour le compteur de messages
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        messageCount: arrayUnion(user.uid),
        lastMessageAt: serverTimestamp()
      });

      console.log('✅ Message envoyé');
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
    }
  };

  const loadTaskHistory = async (taskId) => {
    try {
      const historyQuery = query(
        collection(db, 'taskHistory'),
        where('taskId', '==', taskId),
        orderBy('timestamp', 'desc')
      );
      
      const historySnapshot = await getDocs(historyQuery);
      const history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: convertFirebaseTimestamp(doc.data().timestamp)
      }));

      setTaskHistory(history);
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        creatorName: user.displayName || user.email,
        status: 'todo',
        messageCount: 0,
        historyCount: 0
      };

      await addDoc(collection(db, 'tasks'), newTask);
      setShowNewTaskModal(false);
      console.log('✅ [TASKS] Tâche créée avec succès');
    } catch (error) {
      console.error('❌ [TASKS] Erreur création tâche:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Ajouter à l'historique
      await addDoc(collection(db, 'taskHistory'), {
        taskId,
        userId: user.uid,
        userName: user.displayName || user.email,
        action: 'status_changed',
        oldValue: 'previous_status',
        newValue: newStatus,
        timestamp: serverTimestamp()
      });

      console.log('✅ [TASKS] Statut mis à jour:', newStatus);
    } catch (error) {
      console.error('❌ [TASKS] Erreur mise à jour statut:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ [TASKS] Tâche supprimée');
    } catch (error) {
      console.error('❌ [TASKS] Erreur suppression tâche:', error);
    }
  };

  // 🎨 Rendu des cartes de tâches COMPLÈTES
  const renderTaskCard = (task) => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <PremiumCard className="p-4 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
        {/* Indicateurs visuels */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {task.hasMedia && (
            <div className="w-2 h-2 bg-blue-400 rounded-full" title="Contient des médias" />
          )}
          {task.isRecurring && (
            <div className="w-2 h-2 bg-purple-400 rounded-full" title="Tâche récurrente" />
          )}
          {task.isOpenToVolunteers && (
            <div className="w-2 h-2 bg-pink-400 rounded-full" title="Ouverte aux volontaires" />
          )}
        </div>

        {/* En-tête de la tâche */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {task.role && SYNERGIA_ROLES[task.role] && (
                <span className="text-lg">{SYNERGIA_ROLES[task.role].icon}</span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                TASK_STATUS[task.status]?.color === 'green' ? 'bg-green-100 text-green-800' :
                TASK_STATUS[task.status]?.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                TASK_STATUS[task.status]?.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                TASK_STATUS[task.status]?.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                TASK_STATUS[task.status]?.color === 'red' ? 'bg-red-100 text-red-800' :
                TASK_STATUS[task.status]?.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                TASK_STATUS[task.status]?.color === 'cyan' ? 'bg-cyan-100 text-cyan-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {TASK_STATUS[task.status]?.icon} {TASK_STATUS[task.status]?.label}
              </span>
            </div>
          </div>

          {/* Actions étendues */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setSelectedTask(task)}
              className="p-1 rounded text-gray-400 hover:text-blue-400 transition-colors"
              title="Voir détails"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadTaskHistory(task.id)}
              className="p-1 rounded text-gray-400 hover:text-green-400 transition-colors"
              title="Voir historique"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMessageModal(task)}
              className="p-1 rounded text-gray-400 hover:text-purple-400 transition-colors"
              title="Messages"
            >
              <MessageCircle className="w-4 h-4" />
              {task.messageCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {task.messageCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Titre et description */}
        <h3 className="text-white font-semibold mb-2 line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
        )}

        {/* Métadonnées étendues */}
        <div className="space-y-2">
          {/* Priorité et catégorie */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {task.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  TASK_PRIORITY[task.priority]?.color === 'red' ? 'bg-red-100 text-red-800' :
                  TASK_PRIORITY[task.priority]?.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                  TASK_PRIORITY[task.priority]?.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {TASK_PRIORITY[task.priority]?.icon} {TASK_PRIORITY[task.priority]?.label}
                </span>
              )}
              {task.category && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {TASK_CATEGORIES[task.category]?.icon} {TASK_CATEGORIES[task.category]?.label}
                </span>
              )}
            </div>
          </div>

          {/* Informations volontaires */}
          {task.isOpenToVolunteers && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-pink-400">
                <Heart className="w-3 h-3" />
                <span>Ouverte aux volontaires</span>
              </div>
              {task.volunteerCount > 0 && (
                <span className="text-gray-400">{task.volunteerCount} volontaire{task.volunteerCount > 1 ? 's' : ''}</span>
              )}
            </div>
          )}

          {/* Date d'échéance */}
          {task.dueDate && task.dueDate instanceof Date && (
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{task.dueDate.toLocaleDateString()}</span>
            </div>
          )}

          {/* XP Reward */}
          {task.xpReward && (
            <div className="flex items-center space-x-1 text-yellow-400 text-xs">
              <Award className="w-3 h-3" />
              <span>{task.xpReward} XP</span>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  #{tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{task.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions rapides étendues */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            {/* Actions de volontariat */}
            {task.canVolunteer && (
              <button
                onClick={() => handleVolunteer(task.id)}
                className="text-xs px-3 py-1 rounded-full bg-pink-600 hover:bg-pink-700 text-white transition-colors"
              >
                <UserPlus className="w-3 h-3 mr-1 inline" />
                Se porter volontaire
              </button>
            )}

            {task.isVolunteerTask && task.status !== 'completed' && (
              <button
                onClick={() => handleWithdrawVolunteer(task.id)}
                className="text-xs px-3 py-1 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              >
                <UserMinus className="w-3 h-3 mr-1 inline" />
                Se retirer
              </button>
            )}

            {/* Actions normales */}
            {task.status !== 'completed' && (
              <button
                onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                className="text-xs px-3 py-1 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                <CheckSquare className="w-3 h-3 mr-1 inline" />
                Terminer
              </button>
            )}

            {task.status === 'todo' && (
              <button
                onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                className="text-xs px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Play className="w-3 h-3 mr-1 inline" />
                Démarrer
              </button>
            )}
          </div>

          <div className="text-xs text-gray-400">
            {task.createdAt instanceof Date ? task.createdAt.toLocaleDateString() : 'Date inconnue'}
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );

  // 🎨 Rendu de la barre de filtres AVANCÉE
  const renderAdvancedFilters = () => (
    <div className="space-y-6">
      {/* Filtres de base */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(TASK_STATUS).map(([key, status]) => (
            <option key={key} value={key}>{status.icon} {status.label}</option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes priorités</option>
          {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
            <option key={key} value={key}>{priority.icon} {priority.label}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(TASK_CATEGORIES).map(([key, category]) => (
            <option key={key} value={key}>{category.icon} {category.label}</option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les rôles</option>
          {Object.entries(SYNERGIA_ROLES).map(([key, role]) => (
            <option key={key} value={key}>{role.icon} {role.name}</option>
          ))}
        </select>

        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 flex-1"
          >
            {Object.entries(SORT_OPTIONS).map(([key, option]) => (
              <option key={key} value={key}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-700 transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFiltersPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800/50 rounded-lg p-4"
        >
          <h4 className="text-white font-medium mb-3">Filtres avancés</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries({
              hasMedia: { label: 'Avec médias', icon: Paperclip },
              isVolunteer: { label: 'Mes volontariats', icon: Heart },
              isRecurring: { label: 'Récurrentes', icon: Clock },
              hasDeadline: { label: 'Avec échéance', icon: Calendar },
              myTasks: { label: 'Mes tâches', icon: User },
              availableForVolunteer: { label: 'Disponibles', icon: UserPlus },
              completedByMe: { label: 'Terminées par moi', icon: CheckSquare }
            }).map(([key, filter]) => (
              <label key={key} className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFilters[key]}
                  onChange={(e) => setSelectedFilters(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600"
                />
                <filter.icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </label>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <PremiumLayout
      title="Gestion des Tâches"
      subtitle="Organisez et suivez vos tâches avec efficacité"
      icon={CheckSquare}
      showStats={true}
      stats={[
        { title: 'Total', value: taskStats.total, icon: FileText, color: 'blue' },
        { title: 'En cours', value: taskStats.inProgress, icon: Play, color: 'yellow' },
        { title: 'Terminées', value: taskStats.completed, icon: CheckSquare, color: 'green' },
        { title: 'Volontariats', value: taskStats.myVolunteerTasks, icon: Heart, color: 'pink' },
        { title: 'Disponibles', value: taskStats.availableVolunteer, icon: UserPlus, color: 'purple' },
        { title: 'Avec médias', value: taskStats.withMedia, icon: Paperclip, color: 'cyan' }
      ]}
      headerActions={
        <div className="flex items-center space-x-3">
          {/* Boutons d'actions étendus */}
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`p-2 rounded transition-colors ${
              showFiltersPanel ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Filtres avancés"
          >
            <FilterIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowVolunteerPanel(!showVolunteerPanel)}
            className={`p-2 rounded transition-colors ${
              showVolunteerPanel ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Gestion volontaires"
          >
            <Heart className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className={`p-2 rounded transition-colors ${
              showHistoryPanel ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Historique"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Modes d'affichage */}
          <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
            </button>
          </div>

          <PremiumButton
            onClick={() => setShowNewTaskModal(true)}
            icon={Plus}
            variant="primary"
          >
            Nouvelle tâche
          </PremiumButton>
        </div>
      }
    >
      {/* Barre de recherche */}
      <div className="mb-6">
        <PremiumSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher des tâches..."
        />
      </div>

      {/* Filtres avancés */}
      {renderAdvancedFilters()}

      {/* Panneaux d'information */}
      {showVolunteerPanel && (
        <PremiumCard className="mb-6 p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-pink-400" />
            Système de volontariat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">{taskStats.availableVolunteer}</div>
              <div className="text-gray-400">Tâches disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{taskStats.myVolunteerTasks}</div>
              <div className="text-gray-400">Mes volontariats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{taskStats.completed}</div>
              <div className="text-gray-400">Terminées</div>
            </div>
          </div>
        </PremiumCard>
      )}

      {showHistoryPanel && (
        <PremiumCard className="mb-6 p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <History className="w-5 h-5 mr-2 text-green-400" />
            Historique des tâches
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {taskHistory.length > 0 ? (
              taskHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{entry.timestamp.toLocaleDateString()}</span>
                    <span className="text-white">{entry.userName}</span>
                    <span className="text-gray-400">{entry.action}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">Aucun historique disponible</p>
            )}
          </div>
        </PremiumCard>
      )}

      {/* Contenu principal */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white">Chargement des tâches...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Liste des tâches */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTasks.map(renderTaskCard)}
              </AnimatePresence>
            </div>
          )}

          {/* Vue liste (à implémenter) */}
          {viewMode === 'list' && (
            <PremiumCard className="p-6">
              <p className="text-gray-400 text-center">Vue liste en cours de développement...</p>
            </PremiumCard>
          )}

          {/* Vue Kanban (à implémenter) */}
          {viewMode === 'kanban' && (
            <PremiumCard className="p-6">
              <p className="text-gray-400 text-center">Vue Kanban en cours de développement...</p>
            </PremiumCard>
          )}

          {/* Message si aucune tâche */}
          {filteredTasks.length === 0 && !isLoading && (
            <PremiumCard className="text-center py-12">
              <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedStatus !== 'all' || Object.values(selectedFilters).some(Boolean)
                  ? 'Aucune tâche ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre première tâche.'}
              </p>
              <PremiumButton
                onClick={() => setShowNewTaskModal(true)}
                icon={Plus}
                variant="primary"
              >
                Créer une tâche
              </PremiumButton>
            </PremiumCard>
          )}
        </div>
      )}

      {/* Modals */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Nouvelle tâche</h3>
            <p className="text-gray-400 mb-6">Formulaire de création complet en cours de développement...</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <PremiumButton variant="primary">
                Créer
              </PremiumButton>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">Description</h4>
                <p className="text-gray-400 mb-4">{selectedTask.description}</p>
                
                {selectedTask.tags && selectedTask.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-2">Informations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Statut:</span>
                    <span className="text-white">{TASK_STATUS[selectedTask.status]?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Priorité:</span>
                    <span className="text-white">{TASK_PRIORITY[selectedTask.priority]?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Créé le:</span>
                    <span className="text-white">{selectedTask.createdAt.toLocaleDateString()}</span>
                  </div>
                  {selectedTask.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Échéance:</span>
                      <span className="text-white">{selectedTask.dueDate.toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedTask.xpReward && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Récompense:</span>
                      <span className="text-yellow-400">{selectedTask.xpReward} XP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Messages de la tâche</h3>
            <p className="text-gray-400 mb-6">Système de messagerie en cours de développement...</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
