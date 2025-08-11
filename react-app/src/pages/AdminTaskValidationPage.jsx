// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION CORRIGÉE - CORRECTION FILTER SÉCURISÉ
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
            xpReward: calculateXPForDifficulty(task.difficulty || 'normal'),
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
   * 📊 OBTENIR LES VALIDATIONS SELON L'ONGLET ACTIF - SÉCURISÉ
   */
  const getValidationsForTab = () => {
    // 🛡️ SÉCURITÉ : Toujours retourner un tableau
    const allValidations = validations || [];
    
    try {
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
    } catch (filterError) {
      console.error('🛡️ [SAFEGUARD] Erreur filtrage, retour tableau vide:', filterError);
      return [];
    }
  };

  /**
   * 🔍 FILTRER LES VALIDATIONS - SÉCURISÉ
   */
  const filteredValidations = (getValidationsForTab() || []).filter(validation => {
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

      // Nouveau système avec taskData
      if (validation.taskData && validation.source === 'tasks_collection') {
        console.log('🚀 [ADMIN] Nouveau système - Approbation via taskService');
        
        await taskService.updateTask(validation.taskId, {
          status: 'completed',
          validatedAt: new Date(),
          validatedBy: user.uid,
          validationComment: comment,
          updatedAt: new Date()
        });
        
        console.log('✅ [ADMIN] Tâche validée avec succès');
        
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

      // Nouveau système avec taskData
      if (validation.taskData && validation.source === 'tasks_collection') {
        console.log('🚀 [ADMIN] Nouveau système - Rejet via taskService');
        
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
      console.error('Erreur formatage date:', error);
      return 'Date invalide';
    }
  };

  /**
   * 🏆 FORMATER LA DIFFICULTÉ
   */
  const formatDifficulty = (difficulty) => {
    const difficultyMap = {
      easy: { label: 'Facile', color: 'bg-green-100 text-green-700', icon: '🟢' },
      normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
      hard: { label: 'Difficile', color: 'bg-orange-100 text-orange-700', icon: '🟠' },
      expert: { label: 'Expert', color: 'bg-red-100 text-red-700', icon: '🔴' }
    };
    
    return difficultyMap[difficulty] || difficultyMap.normal;
  };

  // 📊 Calculer les statistiques pour les onglets
  const tabStats = {
    pending: (validations || []).filter(v => v.status === 'pending' || v.type === 'task_submission').length,
    approved: (validations || []).filter(v => v.status === 'approved').length,
    rejected: (validations || []).filter(v => v.status === 'rejected').length,
    all: (validations || []).length
  };

  // 🎨 Configuration des onglets
  const tabs = [
    { id: 'pending', label: 'En attente', icon: Clock, count: tabStats.pending },
    { id: 'approved', label: 'Approuvées', icon: CheckCircle, count: tabStats.approved },
    { id: 'rejected', label: 'Rejetées', icon: XCircle, count: tabStats.rejected },
    { id: 'all', label: 'Toutes', icon: Eye, count: tabStats.all }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 📊 EN-TÊTE AVEC STATISTIQUES */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-blue-600" />
              Validation des Tâches
            </h1>
            <p className="text-gray-600 mt-1">
              Gérer les demandes de validation des collaborateurs
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* STATS RAPIDES */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.pending || 0}</div>
                <div className="text-xs text-gray-500">En attente</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{stats.approved || 0}</div>
                <div className="text-xs text-gray-500">Approuvées</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{stats.rejected || 0}</div>
                <div className="text-xs text-gray-500">Rejetées</div>
              </div>
            </div>

            {/* ACTIONS */}
            <button
              onClick={forceRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* DERNIÈRE MISE À JOUR */}
        {lastUpdate && (
          <div className="mt-2 text-sm text-gray-500">
            Dernière mise à jour: {formatDate(lastUpdate)}
          </div>
        )}
      </div>

      {/* 🔍 RECHERCHE ET FILTRES */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une validation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="text-sm text-gray-500">
            {filteredValidations.length} validation{filteredValidations.length > 1 ? 's' : ''} trouvée{filteredValidations.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* 🗂️ ONGLETS DE NAVIGATION */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
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
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {validation.taskTitle}
                              </h3>
                              {(() => {
                                const diff = formatDifficulty(validation.difficulty);
                                return (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${diff.color}`}>
                                    {diff.icon} {diff.label}
                                  </span>
                                );
                              })()}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {validation.userName} ({validation.userEmail})
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(validation.submittedAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4" />
                                +{validation.xpReward} XP
                              </div>
                            </div>

                            {validation.comment && (
                              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 text-sm">{validation.comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 🎛️ ACTIONS */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewDetails(validation)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>

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
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{selectedValidation.userName}</div>
                      <div className="text-sm text-gray-600">{selectedValidation.userEmail}</div>
                    </div>
                  </div>
                </div>

                {/* INFO TÂCHE */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Tâche</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Titre:</span>
                      <span className="font-medium">{selectedValidation.taskTitle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Difficulté:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${formatDifficulty(selectedValidation.difficulty).color}`}>
                        {formatDifficulty(selectedValidation.difficulty).label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Récompense XP:</span>
                      <span className="font-medium text-blue-600">+{selectedValidation.xpReward} XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Soumise le:</span>
                      <span className="font-medium">{formatDate(selectedValidation.submittedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* COMMENTAIRE */}
                {selectedValidation.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Commentaire</h3>
                    <p className="text-gray-700">{selectedValidation.comment}</p>
                  </div>
                )}

                {/* ACTIONS SI PENDING */}
                {selectedValidation.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleApprove(selectedValidation.id);
                        setShowDetailModal(false);
                      }}
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ❌ MODAL REJET */}
      {showRejectModal && selectedValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Rejeter la validation</h2>
                  <p className="text-gray-600">Cette action remettra la tâche en cours</p>
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

console.log('🚀 AdminTaskValidationPage corrigée - Filter sécurisé appliqué');
