// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE ALLÉGÉ - VERSION OPTIMISÉE POUR BUILD
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Clock,
  Play,
  Edit,
  Trash2,
  UserPlus,
  X,
  Check,
  User,
  AlertTriangle
} from 'lucide-react';

// Layout et composants
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Store et Firebase
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🎯 MODAL D'ASSIGNATION SIMPLE - VERSION OPTIMISÉE
 */
const SimpleAssignmentModal = ({ isOpen, onClose, task, onSuccess }) => {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les membres
  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const membersList = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.email) {
          membersList.push({
            id: doc.id,
            name: userData.displayName || userData.email.split('@')[0],
            email: userData.email
          });
        }
      });
      
      setMembers(membersList);
    } catch (error) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (member) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === member.id);
      if (exists) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleAssign = async () => {
    if (selectedMembers.length === 0) return;

    try {
      setLoading(true);
      
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        assignedTo: selectedMembers.map(m => m.id),
        assignedMembers: selectedMembers,
        status: 'assigned',
        assignedAt: serverTimestamp(),
        assignedBy: user.uid
      });

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      setError('Erreur d\'assignation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">Assigner des membres</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Selected members */}
          {selectedMembers.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <div className="text-sm font-medium text-blue-900 mb-2">
                Sélectionnés ({selectedMembers.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedMembers.map(member => (
                  <span key={member.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {member.name}
                    <button onClick={() => toggleMember(member)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Members list */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Chargement...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Aucun membre trouvé</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map(member => {
                const isSelected = selectedMembers.find(m => m.id === member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member)}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        isSelected ? 'bg-blue-600' : 'bg-gray-400'
                      }`}>
                        {isSelected ? <Check className="w-4 h-4" /> : member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{member.name}</div>
                        <div className="text-sm text-gray-600 truncate">{member.email}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedMembers.length === 0 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            Assigner ({selectedMembers.length})
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 🎯 COMPOSANT PRINCIPAL TASKS PAGE ALLÉGÉ
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // États des modals
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Charger les tâches
  useEffect(() => {
    if (!user?.uid) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setTasks(tasksData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.uid]);

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actions
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        description: '',
        status: 'todo',
        priority: 'medium',
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      setNewTaskTitle('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erreur création:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'completed',
        completedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur completion:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  // Statistiques
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'todo').length,
    assigned: tasks.filter(t => t.assignedTo?.length > 0).length
  };

  // Composant Card simplifié
  const TaskCard = ({ task }) => (
    <PremiumCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <span className={`px-2 py-1 text-xs rounded ${
          task.priority === 'high' ? 'bg-red-100 text-red-800' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <Clock className="w-3 h-3" />
        {task.status}
        {task.assignedMembers?.length > 0 && (
          <>
            <span>•</span>
            <Users className="w-3 h-3" />
            {task.assignedMembers.length} assigné(s)
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleCompleteTask(task.id)}
          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center justify-center gap-1"
        >
          <Play className="w-3 h-3" />
          Terminer
        </button>
        
        <button
          onClick={() => {
            setSelectedTask(task);
            setShowAssignmentModal(true);
          }}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          <UserPlus className="w-3 h-3" />
        </button>
        
        <button
          onClick={() => handleDeleteTask(task.id)}
          className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </PremiumCard>
  );

  return (
    <PremiumLayout title="Gestion des Tâches">
      
      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total" value={stats.total} icon={CheckSquare} color="blue" />
        <StatCard title="Terminées" value={stats.completed} icon={Check} color="green" />
        <StatCard title="En attente" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard title="Assignées" value={stats.assigned} icon={Users} color="purple" />
      </div>

      {/* Barre d'outils */}
      <PremiumCard className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher des tâches..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <PremiumButton
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant={showCreateForm ? "secondary" : "primary"}
              icon={Plus}
            >
              {showCreateForm ? 'Annuler' : 'Nouvelle tâche'}
            </PremiumButton>
          </div>
        </div>

        {/* Formulaire de création rapide */}
        {showCreateForm && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Titre de la tâche..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
            />
            <button
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Créer
            </button>
          </div>
        )}
      </PremiumCard>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement des tâches...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Essayez un autre terme de recherche' : 'Créez votre première tâche'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Modal d'assignation */}
      <SimpleAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSuccess={() => {
          console.log('Assignation réussie');
        }}
      />
    </PremiumLayout>
  );
};

export default TasksPage;
