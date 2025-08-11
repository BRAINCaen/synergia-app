// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION CORRIGÉE - CORRECTION IMPORTS FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Trophy,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Search,
  RefreshCw,
  AlertTriangle,
  Eye,
  Loader,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';

// ✅ IMPORTS CORRIGÉS - CHEMIN CORRECT VERS FIREBASE
import { adminValidationService } from '../core/services/adminValidationService.js';
import { taskService } from '../core/services/taskService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// ✅ PAS D'IMPORT DYNAMIQUE POUR ÉVITER LES ERREURS DE CHARGEMENT
// Utilisation directe des services existants

/**
 * 🛡️ PAGE D'ADMINISTRATION DES VALIDATIONS - VERSION CORRIGÉE
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // 📊 États principaux
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    today: 0
  });

  // 🎨 États UI
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // 📝 États pour l'action admin
  const [adminComment, setAdminComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // 🔄 États pour le debug
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ✅ MODE CLASSIQUE UNIQUEMENT - PAS DE SYNCHRONISATION COMPLEXE

  /**
   * 🔄 CHARGEMENT INITIAL - MODE CLASSIQUE SIMPLE
   */
  useEffect(() => {
    loadValidationsClassic();
    loadStatsClassic();
  }, [activeTab]);

  /**
   * 📥 CHARGER LES VALIDATIONS - MODE CLASSIQUE
   */
  const loadValidationsClassic = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 [ADMIN-CLASSIC] Chargement validations:', activeTab);
      
      let fetchedValidations = [];
      
      if (activeTab === 'pending') {
        // Récupérer directement les tâches avec status = 'validation_pending'
        console.log('🔍 [ADMIN-CLASSIC] Recherche des tâches en attente de validation...');
        
        try {
          const allTasks = await taskService.getAllTasks();
          const pendingTasks = allTasks.filter(task => task.status === 'validation_pending');
          
          console.log(`📊 [ADMIN-CLASSIC] ${pendingTasks.length} tâches trouvées avec statut validation_pending`);
          
          // Transformer les tâches en format validation
          fetchedValidations = pendingTasks.map(task => ({
            id: task.id,
            taskId: task.id,
            taskTitle: task.title,
            status: 'pending',
            userId: task.submittedBy || task.assignedTo?.[0] || task.createdBy,
            userName: 'Utilisateur',
            userEmail: 'email@exemple.com',
            comment: task.submissionNotes || 'Tâche soumise pour validation',
            xpReward: this.calculateXPForDifficulty(task.difficulty || 'normal'),
            difficulty: task.difficulty || 'normal',
            submittedAt: task.submittedAt || task.updatedAt || new Date(),
            submittedBy: task.submittedBy || task.assignedTo?.[0] || task.createdBy,
            taskData: task,
            type: 'task_submission',
            source: 'tasks_collection'
          }));
          
        } catch (tasksError) {
          console.error('❌ [ADMIN-CLASSIC] Erreur récupération tâches:', tasksError);
          // Fallback vers le service de validation classique
          try {
            fetchedValidations = await adminValidationService.getPendingValidations();
            console.log(`📊 [ADMIN-CLASSIC] Fallback: ${fetchedValidations.length} validations`);
          } catch (fallbackError) {
            console.error('❌ [ADMIN-CLASSIC] Erreur fallback:', fallbackError);
            throw new Error('Impossible de récupérer les validations');
          }
        }
        
      } else if (activeTab === 'approved') {
        fetchedValidations = await adminValidationService.getApprovedValidations();
        
      } else if (activeTab === 'rejected') {
        fetchedValidations = await adminValidationService.getRejectedValidations();
        
      } else {
        fetchedValidations = await adminValidationService.getAllValidations();
      }
      
      console.log(`✅ [ADMIN-CLASSIC] ${fetchedValidations.length} validations chargées pour l'onglet ${activeTab}`);
      setValidations(fetchedValidations);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ [ADMIN-CLASSIC] Erreur chargement validations:', error);
      setError(`Erreur lors du chargement: ${error.message}`);
      setValidations([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CHARGER LES STATISTIQUES - MODE CLASSIQUE
   */
  const loadStatsClassic = async () => {
    try {
      const statsData = await adminValidationService.getValidationStats();
      setStats(statsData);
    } catch (error) {
      console.error('❌ [ADMIN-CLASSIC] Erreur chargement stats:', error);
    }
  };

  /**
   * 🎯 CALCULER L'XP SELON LA DIFFICULTÉ
   */
  const calculateXPForDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 10;
      case 'normal': return 25;
      case 'hard': return 50;
      case 'expert': return 100;
      default: return 25;
    }
  };

  /**
   * 🔄 FORCER LA SYNCHRONISATION
   */
  const forceRefresh = async () => {
    try {
      setLoading(true);
      // Mode classique simple
      await loadValidationsClassic();
      await loadStatsClassic();
      console.log('✅ [ADMIN] Refresh forcé terminé');
    } catch (error) {
      console.error('❌ [ADMIN] Erreur refresh forcé:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 OBTENIR LES VALIDATIONS SELON L'ONGLET ACTIF
   */
  const getValidationsForTab = () => {
    const allValidations = validations || [];
    
    switch (activeTab) {
      case 'pending':
        return allValidations.filter(v => v.status === 'pending' || v.type === 'task_submission');
      case 'approved':
        return allValidations.filter(v => v.status === 'approved');
      case 'rejected':
        return allValidations.filter(v => v.status === 'rejected');
      case 'all':
      default:
        return allValidations;
    }
  };

  /**
   * ✅ APPROUVER UNE VALIDATION
   */
  const handleApprove = async (validationId, comment = '') => {
    try {
      setActionLoading(true);
      console.log('✅ [ADMIN] Approbation validation:', validationId);
      
      const validation = validations.find(v => v.id === validationId);
      if (!validation) {
        throw new Error('Validation introuvable');
      }
      
      if (validation.type === 'task_submission' || validation.source === 'tasks_collection') {
        // Nouveau système : mettre à jour la tâche
        await taskService.updateTask(validation.taskId, {
          status: 'completed',
          completedAt: new Date(),
          validatedAt: new Date(),
          validatedBy: user.uid,
          adminComment: comment,
          xpAwarded: validation.xpReward || 25,
          updatedAt: new Date()
        });
        
        console.log('✅ [ADMIN] Tâche marquée comme terminée avec XP');
        
      } else {
        // Ancien système de validation  
        await adminValidationService.approveValidation(validationId, user.uid, comment);
      }
      
      console.log('✅ [ADMIN] Validation approuvée avec succès');
      
      // Recharger les données
      await forceRefresh();
      
      // Fermer les modals
      setShowDetailModal(false);
      setSelectedValidation(null);
      setAdminComment('');
      
    } catch (error) {
      console.error('❌ [ADMIN] Erreur approbation:', error);
      alert('Erreur lors de l\'approbation: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * ❌ REJETER UNE VALIDATION
   */
  const handleReject = async (validationId, comment = '') => {
    try {
      setActionLoading(true);
      console.log('❌ [ADMIN] Rejet validation:', validationId);
      
      const validation = validations.find(v => v.id === validationId);
      if (!validation) {
        throw new Error('Validation introuvable');
      }
      
      if (validation.type === 'task_submission' || validation.source === 'tasks_collection') {
        // Nouveau système : remettre la tâche en cours
        await taskService.updateTask(validation.taskId, {
          status: 'in_progress',
          submittedForValidation: false,
          rejectedAt: new Date(),
          rejectedBy: user.uid,
          rejectionReason: comment,
          updatedAt: new Date()
        });
        
        console.log('✅ [ADMIN] Tâche remise en cours avec succès');
        
      } else {
        // Ancien système de validation  
        await adminValidationService.rejectValidation(validationId, user.uid, comment);
      }
      
      console.log('❌ [ADMIN] Validation rejetée avec succès');
      
      // Recharger les données
      await forceRefresh();
      
      // Fermer les modals
      setShowDetailModal(false);
      setShowRejectModal(false);
      setSelectedValidation(null);
      setAdminComment('');
      
    } catch (error) {
      console.error('❌ [ADMIN] Erreur rejet:', error);
      alert('Erreur lors du rejet: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * 👁️ OUVRIR LES DÉTAILS D'UNE VALIDATION
   */
  const handleViewDetails = (validation) => {
    setSelectedValidation(validation);
    setShowDetailModal(true);
  };

  /**
   * 🔍 FILTRER LES VALIDATIONS
   */
  const filteredValidations = getValidationsForTab().filter(validation => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      validation.taskTitle?.toLowerCase().includes(searchLower) ||
      validation.userName?.toLowerCase().includes(searchLower) ||
      validation.userEmail?.toLowerCase().includes(searchLower) ||
      validation.comment?.toLowerCase().includes(searchLower)
    );
  });

  /**
   * 📅 FORMATER UNE DATE
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  /**
   * 🎨 OBTENIR LA CLASSE CSS POUR LE STATUT
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  /**
   * 🏷️ RENDER DU BADGE DE STATUT
   */
  const StatusBadge = ({ status, type }) => {
    const getIcon = () => {
      switch (status) {
        case 'pending':
          return <Clock className="w-3 h-3" />;
        case 'approved':
          return <CheckCircle className="w-3 h-3" />;
        case 'rejected':
          return <XCircle className="w-3 h-3" />;
        default:
          return <AlertTriangle className="w-3 h-3" />;
      }
    };

    const getText = () => {
      if (type === 'task_submission') {
        return status === 'pending' ? 'Soumission en attente' : status;
      }
      return status === 'pending' ? 'En attente' : status;
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(status)}`}>
        {getIcon()}
        {getText()}
      </span>
    );
  };

  // 🎨 AFFICHAGE DE L'ÉTAT DE CHARGEMENT
  if (loading && !validations.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement des validations...
          </h3>
          <p className="text-gray-600">
            Récupération des données depuis Firebase
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      {/* 📊 HEADER AVEC STATS */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Administration - Validation des Tâches
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    Gérer les demandes de validation des tâches utilisateurs
                    <span className="inline-flex items-center gap-1 text-orange-600">
                      <RefreshCw className="w-4 h-4" />
                      Mode classique
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 🔄 BOUTON REFRESH MANUEL */}
              <button
                onClick={forceRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              {/* 🔧 BOUTON DEBUG */}
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Debug
              </button>
            </div>
          </div>

          {/* 📊 STATISTIQUES */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Filter className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">En attente</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Approuvées</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Rejetées</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Aujourd'hui</p>
                  <p className="text-2xl font-bold">{stats.today}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* 🔧 INFO DEBUG */}
          {showDebugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🔧 Informations de Debug</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Mode:</strong> Classique (stable)</p>
                  <p><strong>Validations chargées:</strong> {validations.length}</p>
                  <p><strong>Erreur:</strong> {error ? '❌ Oui' : '✅ Non'}</p>
                </div>
                <div>
                  <p><strong>Dernière MAJ:</strong> {lastUpdate ? formatDate(lastUpdate) : 'Jamais'}</p>
                  <p><strong>Onglet actif:</strong> {activeTab}</p>
                  <p><strong>Recherche:</strong> "{searchTerm || 'Aucune'}"</p>
                </div>
              </div>
              {error && (
                <p className="mt-2 text-red-600"><strong>Erreur:</strong> {error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔍 BARRE DE RECHERCHE ET ONGLETS */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* 🔍 RECHERCHE */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par titre, utilisateur ou commentaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-96"
              />
            </div>
          </div>
        </div>

        {/* 🏷️ ONGLETS */}
        <div className="flex space-x-1">
          {[
            { id: 'pending', label: 'En attente', count: stats.pending, icon: Clock },
            { id: 'approved', label: 'Approuvées', count: stats.approved, icon: CheckCircle },
            { id: 'rejected', label: 'Rejetées', count: stats.rejected, icon: XCircle },
            { id: 'all', label: 'Toutes', count: stats.total, icon: Filter }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📋 CONTENU PRINCIPAL */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={forceRefresh}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {filteredValidations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'pending' ? 'Aucune validation en attente' : `Aucune validation ${activeTab}`}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? `Aucun résultat pour "${searchTerm}"`
                  : 'Les nouvelles demandes de validation apparaîtront ici.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {filteredValidations.map((validation) => (
                <div key={validation.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* 📋 INFO TÂCHE */}
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {validation.userAvatar ? (
                              <img
                                src={validation.userAvatar}
                                alt={validation.userName}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {validation.taskTitle || 'Tâche sans titre'}
                              </h3>
                              <StatusBadge status={validation.status} type={validation.type} />
                              {validation.source === 'tasks_collection' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  <Zap className="w-3 h-3" />
                                  Nouveau système
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {validation.userName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(validation.submittedAt)}
                              </span>
                              {validation.xpReward && (
                                <span className="flex items-center gap-1">
                                  <Trophy className="w-4 h-4" />
                                  {validation.xpReward} XP
                                </span>
                              )}
                            </div>

                            {/* 📄 COMMENTAIRE */}
                            {validation.comment && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700">
                                  <MessageSquare className="w-4 h-4 inline mr-2" />
                                  {validation.comment}
                                </p>
                              </div>
                            )}

                            {/* 🎬 MÉDIAS */}
                            {(validation.hasPhoto || validation.hasVideo || validation.hasMedia) && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                {validation.hasPhoto && (
                                  <span className="flex items-center gap-1">
                                    <ImageIcon className="w-4 h-4" />
                                    Photo
                                  </span>
                                )}
                                {validation.hasVideo && (
                                  <span className="flex items-center gap-1">
                                    <Video className="w-4 h-4" />
                                    Vidéo
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 🎯 ACTIONS */}
                      <div className="flex items-center gap-2 ml-4">
                        {validation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(validation.id)}
                              disabled={actionLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approuver
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedValidation(validation);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeter
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleViewDetails(validation)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔄 LOADING OVERLAY */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Traitement en cours...</span>
          </div>
        </div>
      )}

      {/* 📋 MODAL DÉTAILS */}
      {showDetailModal && selectedValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Détails de la validation
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* INFO UTILISATEUR */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Utilisateur</h3>
                  <div className="flex items-center gap-3">
                    {selectedValidation.userAvatar ? (
                      <img
                        src={selectedValidation.userAvatar}
                        alt={selectedValidation.userName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{selectedValidation.userName}</p>
                      <p className="text-sm text-gray-600">{selectedValidation.userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* INFO TÂCHE */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Tâche</h3>
                  <p className="text-lg font-medium">{selectedValidation.taskTitle}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Difficulté: {selectedValidation.difficulty || 'normal'}</span>
                    <span>XP: {selectedValidation.xpReward || 25}</span>
                    <span>Soumise: {formatDate(selectedValidation.submittedAt)}</span>
                  </div>
                </div>

                {/* COMMENTAIRE */}
                {selectedValidation.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Commentaire</h3>
                    <p className="text-gray-700">{selectedValidation.comment}</p>
                  </div>
                )}

                {/* DONNÉES DEBUG */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Informations techniques</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>ID:</strong> {selectedValidation.id}</p>
                    <p><strong>Source:</strong> {selectedValidation.source || 'inconnue'}</p>
                    <p><strong>Type:</strong> {selectedValidation.type || 'standard'}</p>
                    <p><strong>Statut:</strong> {selectedValidation.status}</p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              {selectedValidation.status === 'pending' && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleApprove(selectedValidation.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                  
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ❌ MODAL REJET */}
      {showRejectModal && selectedValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Rejeter la validation
                </h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Vous êtes sur le point de rejeter la validation de la tâche :
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{selectedValidation.taskTitle}</p>
                  <p className="text-sm text-gray-600">par {selectedValidation.userName}</p>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="reject-comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  id="reject-comment"
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Expliquez pourquoi cette validation est rejetée..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleReject(selectedValidation.id, adminComment)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Confirmer le rejet
                </button>
                
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setAdminComment('');
                  }}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskValidationPage;

console.log('🚀 AdminTaskValidationPage corrigée - Imports Firebase corrigés');
