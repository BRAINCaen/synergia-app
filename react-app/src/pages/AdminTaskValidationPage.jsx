// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE VALIDATION DES TÂCHES - Admin
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User,
  Calendar,
  Star,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  Download,
  ArrowLeft,
  Zap,
  Award,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [validatedTasks, setValidatedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Charger les tâches en attente de validation
      const pendingQuery = query(
        collection(db, 'taskValidationRequests'),
        where('status', '==', 'pending'),
        orderBy('submittedAt', 'desc')
      );
      
      const pendingSnapshot = await getDocs(pendingQuery);
      const pending = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date()
      }));

      // Charger les tâches validées récentes
      const validatedQuery = query(
        collection(db, 'taskValidationRequests'),
        where('status', 'in', ['approved', 'rejected']),
        orderBy('validatedAt', 'desc')
      );
      
      const validatedSnapshot = await getDocs(validatedQuery);
      const validated = validatedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        validatedAt: doc.data().validatedAt?.toDate() || new Date()
      }));

      setPendingTasks(pending);
      setValidatedTasks(validated);
      
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateTask = async (taskId, action, xpAmount = null) => {
    try {
      const taskRef = doc(db, 'taskValidationRequests', taskId);
      
      await updateDoc(taskRef, {
        status: action, // 'approved' ou 'rejected'
        validatedBy: user.uid,
        validatedAt: new Date(),
        adminMessage: validationMessage,
        finalXpAmount: action === 'approved' ? xpAmount : 0
      });

      // Recharger les données
      await loadTasks();
      setSelectedTask(null);
      setValidationMessage('');
      
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTasks = (activeTab === 'pending' ? pendingTasks : validatedTasks).filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || task.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={16} />
            Retour au Dashboard
          </Link>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  Validation des Tâches
                </h1>
                <p className="text-gray-600 mt-1">
                  Examinez et validez les soumissions d'équipe
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
                  <div className="text-sm text-yellow-700">En attente</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{validatedTasks.length}</div>
                  <div className="text-sm text-green-700">Traitées</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Onglets */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'pending' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                En attente ({pendingTasks.length})
              </button>
              <button
                onClick={() => setActiveTab('validated')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'validated' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Traitées ({validatedTasks.length})
              </button>
            </div>

            {/* Recherche et filtres */}
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Toutes difficultés</option>
                <option value="facile">Facile</option>
                <option value="moyen">Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
              
              <button
                onClick={loadTasks}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {task.title || 'Tâche sans titre'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      {task.userId}
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </span>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {task.description}
                  </p>
                )}

                {/* XP et date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-purple-600">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">{task.xpAmount} XP</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {task.submittedAt.toLocaleDateString()}
                  </div>
                </div>

                {/* Statut ou actions */}
                {activeTab === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleValidateTask(task.id, 'approved', task.xpAmount)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleValidateTask(task.id, 'rejected')}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${getStatusColor(task.status)}`}>
                      {task.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="font-medium capitalize">{task.status}</span>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {task.validatedAt?.toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucune tâche */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune tâche {activeTab === 'pending' ? 'en attente' : 'traitée'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'Toutes les tâches ont été traitées !' 
                : 'Aucune tâche validée pour le moment.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTaskValidationPage;
