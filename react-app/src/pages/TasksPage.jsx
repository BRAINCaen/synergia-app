// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC PREMIUMLAYOUT - FONCTION HANDLEDELETE CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  User,
  Users,
  Archive,
  Eye,
  Filter
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 IMPORT DES VRAIS COMPOSANTS QUI MARCHAIENT
import TaskCard from '../modules/tasks/TaskCard.jsx';
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';
import NewTaskModal from '../components/tasks/NewTaskModal.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎮 SERVICES ET CONSTANTES
import { SYNERGIA_ROLES } from '../core/data/roles.js';
import { taskService } from '../core/services/taskService.js';

// 📊 CONSTANTES TÂCHES
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
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

/**
 * 📋 PAGE TÂCHES AVEC DESIGN PREMIUM
 */
const TasksPage = () => {
  // 🔐 État de l'utilisateur
  const { user, isLoaded } = useAuthStore();

  // 📊 États des données
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    myTasks: 0,
    available: 0,
    completed: 0
  });

  // 🎮 États de l'interface
  const [activeTab, setActiveTab] = useState('my_tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // 🎯 États des modals
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);

  // 📡 CHARGEMENT TEMPS RÉEL DES TÂCHES
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('🔄 Mise en place du listener temps réel pour les tâches...');
    setLoading(true);

    const tasksQuery = query(
      collection(db, 'tasks'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        console.log('📊 Données tâches reçues:', snapshot.size, 'tâches');
        
        const tasksData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: convertFirebaseTimestamp(data.createdAt),
            updatedAt: convertFirebaseTimestamp(data.updatedAt),
            dueDate: data.dueDate ? convertFirebaseTimestamp(data.dueDate) : null
          };
        });

        setTasks(tasksData);
        setError(null);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erreur listener tâches:', error);
        setError('Impossible de charger les tâches');
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 Nettoyage du listener tâches');
      unsubscribe();
    };
  }, [user?.uid]);

  // 📊 CALCUL DES STATISTIQUES
  useEffect(() => {
    if (!user?.uid || tasks.length === 0) {
      setTaskStats({ total: 0, myTasks: 0, available: 0, completed: 0 });
      return;
    }

    const myTasks = tasks.filter(task => {
      const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo].filter(Boolean);
      return assignedTo.includes(user.uid) || task.createdBy === user.uid;
    });

    const availableTasks = tasks.filter(task => {
      const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo].filter(Boolean);
      return (assignedTo.length === 0 || task.openToVolunteers) && task.status !== 'completed';
    });

    const completedTasks = tasks.filter(task => 
      task.status === 'completed' || task.status === 'validated'
    );

    setTaskStats({
      total: tasks.length,
      myTasks: myTasks.length,
      available: availableTasks.length,
      completed: completedTasks.length
    });
  }, [tasks, user?.uid]);

  // 🔍 FILTRAGE ET TRI DES TÂCHES
  useEffect(() => {
    if (!user?.uid) {
      setFilteredTasks([]);
      return;
    }

    let filtered = [...tasks];

    // Filtrage par onglet
    switch (activeTab) {
      case 'my_tasks':
        filtered = filtered.filter(task => {
          const assignedTo = Array.isArray(task.assignedTo) 
            ? task.assignedTo 
            : (task.assignedTo ? [task.assignedTo] : []);
          return assignedTo.includes(user.uid) || task.createdBy === user.uid;
        });
        break;
      
      case 'available':
        filtered = filtered.filter(task => {
          const assignedTo = Array.isArray(task.assignedTo) 
            ? task.assignedTo 
            : (task.assignedTo ? [task.assignedTo] : []);
          const isAssignedToMe = assignedTo.includes(user?.uid);
          const isUnassigned = assignedTo.length === 0 || assignedTo.every(id => !id);
          const isOpenToVolunteers = task.openToVolunteers === true;
          const isNotCompleted = task.status !== 'completed' && task.status !== 'validated';
          
          return (isUnassigned || isOpenToVolunteers || isAssignedToMe) && isNotCompleted;
        });
        break;
      
      case 'others':
        filtered = filtered.filter(task => {
          const assignedTo = Array.isArray(task.assignedTo) 
            ? task.assignedTo 
            : (task.assignedTo ? [task.assignedTo] : []);
          const isAssignedToMe = assignedTo.includes(user?.uid);
          const hasAssignment = assignedTo.length > 0 && assignedTo.some(id => id && id !== '');
          const isAssignedToOthers = hasAssignment && !isAssignedToMe;
          const isOpenToVolunteers = task.openToVolunteers === true;
          
          return !isAssignedToMe && hasAssignment && isAssignedToOthers && !isOpenToVolunteers;
        });
        break;
      
      case 'history':
        filtered = filtered.filter(task => 
          task.status === 'completed' || 
          task.status === 'validated' || 
          task.status === 'cancelled'
        );
        break;
        
      default:
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
    setShowNewTaskModal(true);
  };

  // ✅ FONCTION HANDLEDELETE CORRIGÉE
  const handleDelete = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      console.log('🗑️ Suppression de la tâche:', taskId);
      await taskService.deleteTask(taskId);
      console.log('✅ Tâche supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la tâche: ' + error.message);
    }
  };

  const handleSubmit = async (task) => {
    try {
      console.log('📤 Soumission tâche pour validation:', task.title);
      await taskService.submitTask(task.id);
      console.log('✅ Tâche soumise pour validation');
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      alert('Erreur lors de la soumission: ' + error.message);
    }
  };

  const handleVolunteer = async (taskId) => {
    try {
      console.log('🙋 Se porter volontaire pour la tâche:', taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      const updatedAssigned = [...currentAssigned, user.uid];

      await taskService.updateTask(taskId, {
        assignedTo: updatedAssigned
      });

      console.log('✅ Volontariat enregistré');
    } catch (error) {
      console.error('❌ Erreur volontariat:', error);
      alert('Erreur lors du volontariat: ' + error.message);
    }
  };

  const handleUnvolunteer = async (taskId) => {
    try {
      console.log('🚫 Se retirer du volontariat pour la tâche:', taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const currentAssigned = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      const updatedAssigned = currentAssigned.filter(id => id !== user.uid);

      await taskService.updateTask(taskId, {
        assignedTo: updatedAssigned
      });

      console.log('✅ Retrait du volontariat enregistré');
    } catch (error) {
      console.error('❌ Erreur retrait volontariat:', error);
      alert('Erreur lors du retrait du volontariat: ' + error.message);
    }
  };

  // 🎨 STATISTIQUES POUR LE HEADER
  const headerStats = [
    { label: 'Total', value: taskStats.total.toString(), icon: CheckSquare, color: 'text-blue-400' },
    { label: 'Mes tâches', value: taskStats.myTasks.toString(), icon: User, color: 'text-purple-400' },
    { label: 'Disponibles', value: taskStats.available.toString(), icon: Users, color: 'text-green-400' },
    { label: 'Terminées', value: taskStats.completed.toString(), icon: Archive, color: 'text-emerald-400' }
  ];

  // 🎯 ACTIONS DU HEADER
  const headerActions = (
    <PremiumButton
      onClick={() => setShowNewTaskModal(true)}
      variant="primary"
      icon={Plus}
    >
      Nouvelle tâche
    </PremiumButton>
  );

  // 🔄 ÉTATS DE CHARGEMENT
  if (!isLoaded || loading) {
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

  if (error) {
    return (
      <PremiumLayout
        title="Gestion des Tâches"
        subtitle="Erreur de chargement"
        icon={CheckSquare}
      >
        <PremiumCard className="text-center py-8">
          <div className="text-red-400 mb-4">
            <CheckSquare className="w-12 h-12 mx-auto mb-2" />
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
      subtitle="Organisez et suivez votre progression"
      icon={CheckSquare}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* 🔍 BARRE DE RECHERCHE */}
      <div className="mb-6">
        <PremiumSearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une tâche..."
        />
      </div>

      {/* 🎛️ CONTRÔLES */}
      <PremiumCard className="mb-6">
        <div className="space-y-4">
          {/* Onglets de navigation */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(TASK_TABS).map(([key, tab]) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {filteredTasks.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recherche et filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Filtre par statut */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(TASK_STATUS).map(([key, status]) => (
                <option key={key} value={key}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>

            {/* Filtre par priorité */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes priorités</option>
              {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
                <option key={key} value={key}>
                  {priority.icon} {priority.label}
                </option>
              ))}
            </select>

            {/* Filtre par rôle */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les rôles</option>
              {SYNERGIA_ROLES.map(role => (
                <option key={role.id} value={role.id}>
                  {role.icon} {role.name}
                </option>
              ))}
            </select>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="updatedAt">Date modification</option>
              <option value="createdAt">Date création</option>
              <option value="dueDate">Date échéance</option>
              <option value="priority">Priorité</option>
              <option value="title">Titre</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white hover:bg-gray-600/50 transition-colors"
              title={`Tri ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </PremiumCard>

      {/* 📋 LISTE DES TÂCHES */}
      <AnimatePresence mode="wait">
        {filteredTasks.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PremiumCard className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Aucune tâche trouvée
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? `Aucune tâche ne correspond à "${searchTerm}"`
                  : "Commencez par créer une nouvelle tâche"}
              </p>
              {!searchTerm && (
                <PremiumButton
                  onClick={() => setShowNewTaskModal(true)}
                  variant="primary"
                  icon={Plus}
                >
                  Créer ma première tâche
                </PremiumButton>
              )}
            </PremiumCard>
          </motion.div>
        ) : (
          <motion.div
            key="tasks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard
                  task={task}
                  currentUser={user}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSubmit={handleSubmit}
                  onVolunteer={handleVolunteer}
                  onUnvolunteer={handleUnvolunteer}
                  isMyTask={task.createdBy === user?.uid}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 MODALS */}
      {showNewTaskModal && (
        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => {
            setShowNewTaskModal(false);
            setSelectedTaskForEdit(null);
          }}
          editTask={selectedTaskForEdit}
        />
      )}

      {selectedTaskForDetails && (
        <TaskDetailModal
          task={selectedTaskForDetails}
          isOpen={!!selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onVolunteer={handleVolunteer}
          onUnvolunteer={handleUnvolunteer}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
