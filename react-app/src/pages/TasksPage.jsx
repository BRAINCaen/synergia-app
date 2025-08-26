// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES - CORRECTION DES VRAIS PROBLÈMES
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare,
  Plus,
  Search,
  Filter,
  User,
  Users,
  Heart,
  Archive,
  FileText,
  Clock,
  AlertCircle,
  Star,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Target,
  X
} from 'lucide-react';

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM - CORRIGÉ
import PremiumLayout, { PremiumCard, PremiumStatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// 🔥 IMPORT COMPOSANT TASK CARD QUI EXISTE
import TaskCard from '../modules/tasks/TaskCard.jsx';

// 🔥 IMPORT MODAL UI QUI EXISTE VRAIMENT
import TaskDetailModal from '../components/ui/TaskDetailModal.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE - SANS ORDERBY POUR ÉVITER L'ERREUR D'INDEX
import { 
  collection, 
  query,
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

// 📊 CONSTANTES TÂCHES
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '🔄' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  blocked: { label: 'Bloquée', color: 'red', icon: '🚫' }
};

const TASK_PRIORITY = {
  low: { label: 'Faible', color: 'green' },
  medium: { label: 'Moyenne', color: 'yellow' },
  high: { label: 'Élevée', color: 'orange' },
  urgent: { label: 'Urgente', color: 'red' }
};

const TASK_TABS = {
  all: { label: 'Toutes', icon: FileText },
  personal: { label: 'Personnelles', icon: Heart },
  assigned: { label: 'Assignées', icon: User }
};

/**
 * 🔍 COMPOSANT BARRE DE RECHERCHE
 */
const SearchBar = ({ searchTerm, onSearchChange, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher des tâches..."
        className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  );
};

/**
 * 🎯 MODAL SIMPLE POUR NOUVELLE TÂCHE
 */
const SimpleNewTaskModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
    }
  }, [initialData, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        status: initialData ? initialData.status : 'todo'
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde tâche:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la tâche"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la tâche"
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priorité
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TASK_PRIORITY).map(([key, prio]) => (
                <option key={key} value={key}>{prio.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {initialData ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * 📊 PAGE PRINCIPALE TÂCHES
 */
const TasksPage = () => {
  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  
  // 📊 ÉTATS
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎯 FILTRES ET RECHERCHE
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  
  // 🎯 MODALS
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);

  // 📊 CHARGEMENT DES TÂCHES - SANS ORDERBY POUR ÉVITER L'ERREUR D'INDEX
  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', user.uid)
        // ❌ SUPPRESSION DU orderBy POUR ÉVITER L'ERREUR D'INDEX
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const tasksData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
          }));

          console.log('📊 [TASKS] Tâches chargées:', tasksData.length);
          
          // ✅ PROTECTION CONTRE .map UNDEFINED
          setTasks(Array.isArray(tasksData) ? tasksData : []);
          setIsLoading(false);
          setError(null);
        } catch (mapError) {
          console.error('❌ [TASKS] Erreur mapping:', mapError);
          setTasks([]);
          setError('Erreur de formatage des données');
          setIsLoading(false);
        }
      }, (firebaseError) => {
        console.error('❌ [TASKS] Erreur Firebase:', firebaseError);
        setError(firebaseError.message);
        setTasks([]);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ [TASKS] Erreur setup listener:', error);
      setError(error.message);
      setTasks([]);
      setIsLoading(false);
    }
  }, [user?.uid]);

  // 📊 TÂCHES FILTRÉES - AVEC PROTECTION
  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    let filtered = [...tasks];

    // Filtre par onglet
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'assigned':
          filtered = filtered.filter(task => task.assignedTo && task.assignedTo !== user?.uid);
          break;
        case 'personal':
          filtered = filtered.filter(task => !task.assignedTo || task.assignedTo === user?.uid);
          break;
      }
    }

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Filtre par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Tri manuel par date
    return filtered.sort((a, b) => {
      const dateA = a.createdAt?.getTime?.() || 0;
      const dateB = b.createdAt?.getTime?.() || 0;
      return dateB - dateA; // Plus récent d'abord
    });
  }, [tasks, activeTab, searchTerm, selectedStatus, selectedPriority, user?.uid]);

  // 📊 STATISTIQUES - AVEC PROTECTION
  const stats = useMemo(() => {
    if (!Array.isArray(tasks)) return { total: 0, completed: 0, inProgress: 0, todo: 0 };
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;

    return { total, completed, inProgress, todo };
  }, [tasks]);

  // ⚡ ACTIONS
  const handleCreateTask = async (taskData) => {
    try {
      console.log('📝 [TASKS] Création tâche:', taskData);
      
      const newTask = {
        ...taskData,
        userId: user.uid,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'tasks'), newTask);
      console.log('✅ [TASKS] Tâche créée');
    } catch (error) {
      console.error('❌ [TASKS] Erreur création:', error);
      setError('Erreur lors de la création de la tâche');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      console.log('🔄 [TASKS] Mise à jour tâche:', taskId, updates);
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ [TASKS] Tâche mise à jour');
    } catch (error) {
      console.error('❌ [TASKS] Erreur mise à jour:', error);
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleEdit = (task) => {
    console.log('✏️ [TASKS] Édition tâche:', task.id);
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    
    try {
      console.log('🗑️ [TASKS] Suppression tâche:', taskId);
      await deleteDoc(doc(db, 'tasks', taskId));
      console.log('✅ [TASKS] Tâche supprimée');
    } catch (error) {
      console.error('❌ [TASKS] Erreur suppression:', error);
      setError('Erreur lors de la suppression');
    }
  };

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await handleUpdateTask(task.id, { status: newStatus });
  };

  // 📊 STATISTIQUES POUR LE HEADER
  const headerStats = [
    { title: 'Total', value: stats.total, icon: FileText, color: 'blue' },
    { title: 'Terminées', value: stats.completed, icon: CheckSquare, color: 'green' },
    { title: 'En cours', value: stats.inProgress, icon: Clock, color: 'yellow' },
    { title: 'À faire', value: stats.todo, icon: Target, color: 'purple' }
  ];

  // ⚡ ACTIONS DU HEADER
  const headerActions = (
    <div className="flex space-x-3">      
      <PremiumButton
        onClick={() => {
          setEditingTask(null);
          setShowTaskModal(true);
        }}
        icon={Plus}
        variant="primary"
      >
        Nouvelle tâche
      </PremiumButton>
    </div>
  );

  if (isLoading) {
    return (
      <PremiumLayout
        title="📝 Tâches"
        subtitle="Gestion et suivi de vos tâches"
        icon={CheckSquare}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des tâches...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="📝 Tâches"
        subtitle="Gestion et suivi de vos tâches"
        icon={CheckSquare}
      >
        <PremiumCard className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <PremiumButton 
              variant="primary" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </PremiumButton>
            <PremiumButton 
              variant="secondary" 
              onClick={() => {
                setError(null);
                setTasks([]);
              }}
            >
              Ignorer l'erreur
            </PremiumButton>
          </div>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="📝 Tâches"
      subtitle="Gestion et suivi de vos tâches"
      icon={CheckSquare}
      headerActions={headerActions}
      headerStats={headerStats}
    >
      {/* Contrôles de filtrage */}
      <div className="mb-8">
        <PremiumCard className="p-4">
          {/* Onglets */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(TASK_TABS).map(([key, tab]) => {
              const Icon = tab.icon;
              const isActive = activeTab === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
                    {key === 'all' ? stats.total : filteredTasks.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filtres et recherche */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>

            {/* Filtres */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(TASK_STATUS).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les priorités</option>
              {Object.entries(TASK_PRIORITY).map(([key, priority]) => (
                <option key={key} value={key}>{priority.label}</option>
              ))}
            </select>
          </div>
        </PremiumCard>
      </div>

      {/* Grille des tâches */}
      {Array.isArray(filteredTasks) && filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUser={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSubmit={handleToggleComplete}
              onView={() => setSelectedTaskForDetails(task)}
              onUpdate={handleUpdateTask}
            />
          ))}
        </div>
      ) : (
        /* Message si aucune tâche */
        <PremiumCard className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
              ? 'Aucune tâche ne correspond à vos critères de recherche.'
              : `Aucune tâche dans la catégorie "${TASK_TABS[activeTab].label}".`}
          </p>
          <PremiumButton
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
            icon={Plus}
            variant="primary"
          >
            Créer une tâche
          </PremiumButton>
        </PremiumCard>
      )}

      {/* Modal nouvelle/édition tâche */}
      <SimpleNewTaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? 
          (data) => handleUpdateTask(editingTask.id, data) : 
          handleCreateTask
        }
        initialData={editingTask}
      />

      {/* Modal détails tâche */}
      {selectedTaskForDetails && (
        <TaskDetailModal
          isOpen={!!selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          task={selectedTaskForDetails}
          currentUser={user}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleToggleComplete}
          onTaskUpdate={handleUpdateTask}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
