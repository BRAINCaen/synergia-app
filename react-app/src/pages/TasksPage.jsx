// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC DESIGN PREMIUM ET MENU HAMBURGER
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

// 🎨 IMPORT DU DESIGN SYSTEM PREMIUM AVEC MENU HAMBURGER
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

// 🎮 SERVICES ET CONSTANTES (corrigé)
import { SYNERGIA_ROLES } from '../core/data/roles.js';

// 📊 CONSTANTES TÂCHES (conservées)
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '⚡' },
  review: { label: 'En révision', color: 'yellow', icon: '👀' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'purple', icon: '🏆' },
  cancelled: { label: 'Annulée', color: 'red', icon: '❌' }
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
  planning: { label: 'Planification', color: 'amber', icon: '📅' }
};

/**
 * 🏠 PAGE PRINCIPALE DES TÂCHES
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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list' | 'kanban'

  // 📊 Statistiques calculées
  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      myTasks: tasks.filter(t => t.assignedTo === user?.uid).length
    };
  }, [tasks, user]);

  // 🔥 Charger les tâches depuis Firebase
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || null
      }));

      setTasks(tasksData);
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Erreur chargement tâches:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔍 Filtrage et tri des tâches
  useEffect(() => {
    let filtered = [...tasks];

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    // Filtrage par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    // Filtrage par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task.role === selectedRole);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dueDate') {
        aValue = aValue?.getTime() || 0;
        bValue = bValue?.getTime() || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedCategory, selectedRole, sortBy, sortOrder]);

  // 🎯 Fonctions de gestion des tâches
  const handleCreateTask = async (taskData) => {
    try {
      const newTask = {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        status: 'todo'
      };

      await addDoc(collection(db, 'tasks'), newTask);
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
    }
  };

  // 🎨 Rendu des cartes de tâches
  const renderTaskCard = (task) => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <PremiumCard className="p-4 hover:scale-[1.02] transition-all duration-300">
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
                'bg-gray-100 text-gray-800'
              }`}>
                {TASK_STATUS[task.status]?.icon} {TASK_STATUS[task.status]?.label}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setSelectedTask(task)}
              className="p-1 rounded text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Edit logic */}}
              className="p-1 rounded text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-1 rounded text-gray-400 hover:text-red-400 transition-colors"
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

        {/* Métadonnées */}
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

          {/* Date d'échéance */}
          {task.dueDate && (
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{task.dueDate.toLocaleDateString()}</span>
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

        {/* Actions rapides */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-2">
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
            {task.createdAt.toLocaleDateString()}
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );

  // 🎨 Rendu de la barre de filtres
  const renderFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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

      {/* Catégorie */}
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
        { title: 'Urgentes', value: taskStats.urgent, icon: AlertCircle, color: 'red' }
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
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher des tâches..."
        />
      </div>

      {/* Filtres */}
      {renderFilters()}

      {/* Contenu principal */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
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
                {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCategory !== 'all' || selectedRole !== 'all'
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

      {/* Modal nouvelle tâche (à implémenter) */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Nouvelle tâche</h3>
            <p className="text-gray-400 mb-6">Formulaire de création en cours de développement...</p>
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

      {/* Modal détails tâche (à implémenter) */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-400 mb-6">Détails de la tâche en cours de développement...</p>
          </div>
        </div>
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
