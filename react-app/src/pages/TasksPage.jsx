// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC LES VRAIS COMPOSANTS QUI MARCHAIENT
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
  X
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 IMPORT DES VRAIS COMPOSANTS QUI MARCHAIENT
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';
import NewTaskModal from '../components/tasks/NewTaskModal.jsx';

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

// 🎮 SERVICES ET CONSTANTES (corrigé)
import { SYNERGIA_ROLES } from '../core/data/roles.js';
import { taskService } from '../core/services/taskService.js';

// 📊 CONSTANTES TÂCHES (conservées)
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '⚡' },
  review: { label: 'En révision', color: 'yellow', icon: '👀' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'purple', icon: '🏆' },
  cancelled: { label: 'Annulée', color: 'red', icon: '❌' },
  validation_pending: { label: 'En attente validation', color: 'orange', icon: '⏰' }
};

const TASK_PRIORITY = {
  low: { label: 'Basse', color: 'gray', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

// 🆕 ONGLETS DE TRI DES TÂCHES
const TASK_TABS = {
  my_tasks: { label: 'Mes tâches', icon: User, color: 'blue' },
  available: { label: 'Disponibles', icon: Users, color: 'green' },
  others: { label: 'Autres', icon: Eye, color: 'purple' },
  history: { label: 'Historique', icon: Archive, color: 'gray' }
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
 * 🏠 PAGE PRINCIPALE DES TÂCHES AVEC VRAIS COMPOSANTS
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
  const [selectedRole, setSelectedRole] = useState('all');
  const [activeTab, setActiveTab] = useState('my_tasks'); // 🆕 État pour l'onglet actif
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  // 🆕 États pour les modals et actions
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  // 📊 Statistiques calculées
  const taskStats = useMemo(() => {
    const myTasks = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      return assignedTo.includes(user?.uid);
    });
    
    const available = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
      return (t.openToVolunteers === true || hasNoAssignment) && t.status === 'todo';
    });
    
    const others = tasks.filter(t => {
      const assignedTo = Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []);
      const hasAssignment = assignedTo.some(id => id && id !== '');
      const isAssignedToOthers = assignedTo.some(id => id && id !== '' && id !== user?.uid);
      return hasAssignment && isAssignedToOthers;
    });
    
    const history = tasks.filter(t => 
      t.status === 'completed' || 
      t.status === 'validated' || 
      t.status === 'cancelled'
    );

    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      myTasks: myTasks.length,
      pending: tasks.filter(t => t.status === 'validation_pending').length,
      available: available.length,
      others: others.length,
      history: history.length
    };
  }, [tasks, user]);

  // 🔥 Charger les tâches depuis Firebase
  useEffect(() => {
    if (!user) return;

    console.log('🔄 [TASKS] Démarrage chargement tâches...');
    
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
            dueDate: data.dueDate ? convertFirebaseTimestamp(data.dueDate) : null
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

  // 🔍 Filtrage et tri des tâches avec onglets
  useEffect(() => {
    let filtered = [...tasks];

    // 🆕 Filtrage par onglet actif
    switch (activeTab) {
      case 'my_tasks':
        // Mes tâches : tâches assignées à l'utilisateur actuel
        filtered = filtered.filter(task => {
          const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
          return assignedTo.includes(user?.uid);
        });
        break;
      
      case 'available':
        // Tâches disponibles : ouvertes aux volontaires OU sans assignation
        filtered = filtered.filter(task => {
          const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
          const hasNoAssignment = assignedTo.length === 0 || !assignedTo.some(id => id && id !== '');
          return (task.openToVolunteers === true || hasNoAssignment) && task.status === 'todo';
        });
        break;
      
      case 'others':
        // Autres tâches : assignées à d'autres personnes (pas à moi)
        filtered = filtered.filter(task => {
          const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []);
          const hasAssignment = assignedTo.some(id => id && id !== '');
          const isAssignedToOthers = assignedTo.some(id => id && id !== '' && id !== user?.uid);
          return hasAssignment && isAssignedToOthers;
        });
        break;
      
      case 'history':
        // Historique : tâches terminées ou annulées
        filtered = filtered.filter(task => 
          task.status === 'completed' || 
          task.status === 'validated' || 
          task.status === 'cancelled'
        );
        break;
        
      default:
        // Par défaut, afficher toutes les tâches
        break;
    }

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrage par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Filtrage par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Filtrage par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task.role === selectedRole);
    }

    // Tri sécurisé
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dueDate') {
        aValue = aValue instanceof Date ? aValue.getTime() : 0;
        bValue = bValue instanceof Date ? bValue.getTime() : 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedRole, sortBy, sortOrder, activeTab, user]);

  // 🎯 Gestionnaires d'événements pour TaskCard
  const handleViewDetails = (task) => {
    console.log('👁️ Voir détails tâche:', task.title);
    setSelectedTaskForDetails(task);
  };

  const handleEdit = (task) => {
    console.log('✏️ Modifier tâche:', task.title);
    setSelectedTaskForEdit(task);
    setShowNewTaskModal(true); // Ouvrir le modal avec la tâche à modifier
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ [TASKS] Tâche supprimée');
    } catch (error) {
      console.error('❌ [TASKS] Erreur suppression tâche:', error);
    }
  };

  const handleVolunteer = async (task) => {
    try {
      console.log('🙋 Volontariat pour tâche:', task.title);
      
      // Ajouter l'utilisateur aux assignés
      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      const updatedAssigned = [...currentAssigned, user.uid];
      
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: updatedAssigned,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Volontariat enregistré');
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
    }
  };

  const handleUnvolunteer = async (task) => {
    try {
      console.log('🚪 Retrait volontariat:', task.title);
      
      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      const updatedAssigned = currentAssigned.filter(id => id !== user.uid);
      
      await updateDoc(doc(db, 'tasks', task.id), {
        assignedTo: updatedAssigned,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Retrait enregistré');
    } catch (error) {
      console.error('❌ Erreur retrait:', error);
    }
  };

  const handleSubmit = async (task) => {
    try {
      console.log('📤 Soumission tâche:', task.title);
      
      await updateDoc(doc(db, 'tasks', task.id), {
        status: 'validation_pending',
        submittedAt: serverTimestamp(),
        submittedBy: user.uid,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche soumise pour validation');
      alert(`✅ Tâche "${task.title}" soumise pour validation !`);
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      alert('❌ Erreur lors de la soumission');
    }
  };

  const handleTaskUpdate = () => {
    console.log('🔄 Mise à jour des tâches demandée');
    // Les tâches se mettent à jour automatiquement via onSnapshot
  };

  const handleCreateTask = async (taskData) => {
    try {
      if (selectedTaskForEdit) {
        // Mode édition : mettre à jour la tâche existante
        await updateDoc(doc(db, 'tasks', selectedTaskForEdit.id), {
          ...taskData,
          updatedAt: serverTimestamp()
        });
        console.log('✅ [TASKS] Tâche modifiée avec succès');
      } else {
        // Mode création : créer une nouvelle tâche
        const newTask = {
          ...taskData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
          creatorName: user.displayName || user.email,
          status: 'todo'
        };
        await addDoc(collection(db, 'tasks'), newTask);
        console.log('✅ [TASKS] Tâche créée avec succès');
      }
      
      setShowNewTaskModal(false);
      setSelectedTaskForEdit(null);
    } catch (error) {
      console.error('❌ [TASKS] Erreur traitement tâche:', error);
    }
  };

  // 🆕 Rendu des onglets de tri
  const renderTabs = () => (
    <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
      {Object.entries(TASK_TABS).map(([key, tab]) => {
        const Icon = tab.icon;
        const isActive = activeTab === key;
        const count = key === 'my_tasks' ? taskStats.myTasks : 
                     key === 'available' ? taskStats.available :
                     key === 'others' ? taskStats.others :
                     taskStats.history;
        
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isActive
                ? `bg-${tab.color}-600 text-white shadow-md`
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );

  // 🎨 Rendu de la barre de filtres (sans catégories)
  const renderFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Statut */}
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

      {/* Priorité */}
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

      {/* Rôle */}
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

      {/* Tri */}
      <div className="flex space-x-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 flex-1"
        >
          <option value="createdAt">Date création</option>
          <option value="updatedAt">Date modification</option>
          <option value="dueDate">Date échéance</option>
          <option value="priority">Priorité</option>
          <option value="title">Titre</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white hover:bg-gray-700 transition-colors"
        >
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
        </button>
      </div>
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
        { title: 'En attente', value: taskStats.pending, icon: Clock, color: 'orange' },
        { title: 'Urgentes', value: taskStats.urgent, icon: AlertCircle, color: 'red' },
        { title: 'Mes tâches', value: taskStats.myTasks, icon: User, color: 'purple' }
      ]}
      headerActions={
        <div className="flex items-center space-x-3">
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
            onClick={() => {
              setSelectedTaskForEdit(null);
              setShowNewTaskModal(true);
            }}
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

      {/* 🆕 Onglets de tri */}
      {renderTabs()}

      {/* Filtres (sans catégories) */}
      {renderFilters()}

      {/* Contenu principal */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-white">Chargement des tâches...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Liste des tâches avec VRAIS TaskCard */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <TaskCard
                      task={task}
                      currentUser={user}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onVolunteer={handleVolunteer}
                      onUnvolunteer={handleUnvolunteer}
                      onSubmit={handleSubmit}
                      onTaskUpdate={handleTaskUpdate}
                    />
                  </motion.div>
                ))}
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
                {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedRole !== 'all'
                  ? 'Aucune tâche ne correspond à vos critères de recherche.'
                  : `Aucune tâche dans la catégorie "${TASK_TABS[activeTab].label}".`}
              </p>
              <PremiumButton
                onClick={() => {
                  setSelectedTaskForEdit(null);
                  setShowNewTaskModal(true);
                }}
                icon={Plus}
                variant="primary"
              >
                Créer une tâche
              </PremiumButton>
            </PremiumCard>
          )}
        </div>
      )}

      {/* Modal nouvelle tâche */}
      {showNewTaskModal && (
        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => {
            setShowNewTaskModal(false);
            setSelectedTaskForEdit(null);
          }}
          onSubmit={handleCreateTask}
          onSuccess={handleCreateTask}
          currentUser={user}
          initialData={selectedTaskForEdit}
          mode={selectedTaskForEdit ? 'edit' : 'create'}
        />
      )}

      {/* Modal détails tâche */}
      {selectedTaskForDetails && (
        <TaskDetailModal
          isOpen={!!selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          task={selectedTaskForDetails}
          currentUser={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
