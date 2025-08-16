// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES VERSION STABLE D'URGENCE
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare,
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  User,
  Users,
  FileText,
  Play,
  Calendar,
  Target,
  Zap,
  Clock,
  AlertCircle,
  Star,
  Eye,
  Edit,
  Trash2,
  X
} from 'lucide-react';

// 🔥 HOOKS ET SERVICES (stables)
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE (stable)
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎮 DÉFINITION LOCALE DES RÔLES (pour éviter les erreurs d'import)
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & Réputation',
    icon: '⭐',
    color: 'bg-yellow-500'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500'
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'bg-purple-500'
  },
  content: {
    id: 'content',
    name: 'Création de Contenu',
    icon: '🎨',
    color: 'bg-pink-500'
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: '🎓',
    color: 'bg-green-500'
  }
};

// 📊 CONSTANTES TÂCHES
const TASK_STATUS = {
  todo: { label: 'À faire', color: 'gray', icon: '⏳' },
  in_progress: { label: 'En cours', color: 'blue', icon: '⚡' },
  review: { label: 'En révision', color: 'yellow', icon: '👀' },
  completed: { label: 'Terminée', color: 'green', icon: '✅' },
  validated: { label: 'Validée', color: 'purple', icon: '🏆' }
};

const TASK_PRIORITY = {
  low: { label: 'Basse', color: 'gray', icon: '🟢' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡' },
  high: { label: 'Haute', color: 'orange', icon: '🟠' },
  urgent: { label: 'Urgente', color: 'red', icon: '🔴' }
};

/**
 * 🏠 PAGE PRINCIPALE DES TÂCHES - VERSION STABLE
 */
const TasksPage = () => {
  const { user } = useAuthStore();

  // États de base
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // 📊 Statistiques calculées
  const taskStats = useMemo(() => {
    if (!Array.isArray(tasks)) return { total: 0, todo: 0, inProgress: 0, completed: 0, urgent: 0, myTasks: 0 };
    
    return {
      total: tasks.length,
      todo: tasks.filter(t => t?.status === 'todo').length,
      inProgress: tasks.filter(t => t?.status === 'in_progress').length,
      completed: tasks.filter(t => t?.status === 'completed').length,
      urgent: tasks.filter(t => t?.priority === 'urgent').length,
      myTasks: tasks.filter(t => t?.assignedTo === user?.uid).length
    };
  }, [tasks, user]);

  // 🔥 Charger les tâches depuis Firebase
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          dueDate: doc.data().dueDate?.toDate() || null
        }));

        setTasks(tasksData || []);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Erreur chargement tâches:', error);
        setTasks([]);
        setIsLoading(false);
      }
    }, (error) => {
      console.error('❌ Erreur listener tâches:', error);
      setTasks([]);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔍 Filtrage des tâches
  useEffect(() => {
    if (!Array.isArray(tasks)) {
      setFilteredTasks([]);
      return;
    }

    let filtered = [...tasks];

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task?.status === selectedStatus);
    }

    // Filtrage par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task?.priority === selectedPriority);
    }

    // Filtrage par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(task => task?.role === selectedRole);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue = a?.[sortBy];
      let bValue = b?.[sortBy];

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
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedRole, sortBy, sortOrder]);

  // 🎯 Fonctions de gestion des tâches
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

  // 🎨 Rendu de base sans design premium (pour éviter les erreurs)
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header simple */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
                <p className="text-gray-600">Organisez et suivez vos tâches</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle tâche</span>
            </button>
          </div>

          {/* Statistiques simples */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-gray-600">Terminées</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-red-600">{taskStats.urgent}</div>
              <div className="text-sm text-gray-600">Urgentes</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-purple-600">{taskStats.myTasks}</div>
              <div className="text-sm text-gray-600">Mes tâches</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-600">{taskStats.todo}</div>
              <div className="text-sm text-gray-600">À faire</div>
            </div>
          </div>
        </div>

        {/* Barre de recherche simple */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(TASK_STATUS).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des tâches */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm">
            {Array.isArray(filteredTasks) && filteredTasks.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{task.title || 'Tâche sans titre'}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          {task.status && TASK_STATUS[task.status] && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {TASK_STATUS[task.status].label}
                            </span>
                          )}
                          {task.priority && TASK_PRIORITY[task.priority] && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              {TASK_PRIORITY[task.priority].label}
                            </span>
                          )}
                          {task.role && SYNERGIA_ROLES[task.role] && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                              {SYNERGIA_ROLES[task.role].icon} {SYNERGIA_ROLES[task.role].name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
                <p className="text-gray-600 mb-6">Commencez par créer votre première tâche.</p>
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Créer une tâche
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal simple nouvelle tâche */}
        {showNewTaskModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelle tâche</h3>
              <p className="text-gray-600 mb-6">Fonctionnalité en développement...</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal détails tâche */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedTask.title}</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTask.description || 'Aucune description'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTask.status && TASK_STATUS[selectedTask.status] 
                      ? TASK_STATUS[selectedTask.status].label 
                      : 'Non défini'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priorité</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTask.priority && TASK_PRIORITY[selectedTask.priority] 
                      ? TASK_PRIORITY[selectedTask.priority].label 
                      : 'Non définie'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Créée le</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTask.createdAt ? selectedTask.createdAt.toLocaleDateString() : 'Date inconnue'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
