// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION CORRIGÉE - CORRECTION IMPORT SHIELD
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Shield,
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
      console.error('❌ [ADMIN-CLASSIC] Erreur stats:', error);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        today: 0
      });
    }
  };

  /**
   * 🔄 RAFRAÎCHISSEMENT FORCÉ
   */
  const forceRefresh = async () => {
    console.log('🔄 [ADMIN] Rafraîchissement forcé...');
    await Promise.all([
      loadValidationsClassic(),
      loadStatsClassic()
    ]);
  };

  /**
   * 🏆 CALCULER L'XP SELON LA DIFFICULTÉ
   */
  const calculateXPForDifficulty = (difficulty) => {
    const xpMap = {
      easy: 10,
      normal: 25,
      hard: 50,
      expert: 100
    };
    return xpMap[difficulty] || 25;
  };

  /**
   * 🔍 FILTRER LES VALIDATIONS SELON LA RECHERCHE
   */
  const getFilteredValidations = () => {
    if (!searchTerm.trim()) return validations;
    
    const searchLower = searchTerm.toLowerCase();
    return validations.filter(validation => {
      return (
        validation.taskTitle?.toLowerCase().includes(searchLower) ||
        validation.userName?.toLowerCase().includes(searchLower) ||
        validation.userEmail?.toLowerCase().includes(searchLower) ||
        validation.comment?.toLowerCase().includes(searchLower)
      );
    });
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
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-orange-700">{stats.pending}</span>
                <span className="text-gray-500">en attente</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-700">{stats.approved}</span>
                <span className="text-gray-500">validées</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-700">{stats.total}</span>
                <span className="text-gray-500">total</span>
              </div>
            </div>

            {/* BOUTON RAFRAÎCHIR */}
            <button
              onClick={forceRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>

            {/* BOUTON DEBUG */}
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Debug
            </button>
          </div>
        </div>

        {/* INFO DEBUG */}
        {showDebugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Dernière mise à jour:</strong> {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Jamais'}
              </div>
              <div>
                <strong>Validations chargées:</strong> {validations.length}
              </div>
              <div>
                <strong>Onglet actif:</strong> {activeTab}
              </div>
              <div>
                <strong>Erreur:</strong> {error || 'Aucune'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🎨 ONGLETS */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔍 BARRE DE RECHERCHE */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par titre, utilisateur, commentaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 📋 CONTENU PRINCIPAL */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des validations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Erreur de chargement</p>
              <p className="text-gray-600 text-sm">{error}</p>
              <button
                onClick={forceRefresh}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        ) : getFilteredValidations().length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Aucune validation trouvée pour cette recherche' : 'Aucune validation à afficher'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {getFilteredValidations().map((validation) => {
                const difficultyInfo = formatDifficulty(validation.difficulty);
                
                return (
                  <div
                    key={validation.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {validation.taskTitle}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${difficultyInfo.color}`}>
                            {difficultyInfo.icon} {difficultyInfo.label}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            +{validation.xpReward} XP
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {validation.userName}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(validation.submittedAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            {validation.comment.substring(0, 50)}...
                          </div>
                        </div>

                        {/* MÉDIAS SI PRÉSENTS */}
                        {(validation.photoUrl || validation.videoUrl) && (
                          <div className="flex items-center gap-2 mb-4">
                            {validation.photoUrl && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <ImageIcon className="w-4 h-4" />
                                Photo jointe
                              </div>
                            )}
                            {validation.videoUrl && (
                              <div className="flex items-center gap-1 text-sm text-purple-600">
                                <Video className="w-4 h-4" />
                                Vidéo jointe
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(validation)}
                          className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {validation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(validation.id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedValidation(validation);
                                setShowRejectModal(true);
                              }}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 📱 MODAL DÉTAILS */}
      {showDetailModal && selectedValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Détails de la validation</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tâche</label>
                  <p className="text-gray-900">{selectedValidation.taskTitle}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Utilisateur</label>
                  <p className="text-gray-900">{selectedValidation.userName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Commentaire</label>
                  <p className="text-gray-900">{selectedValidation.comment}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Difficulté</label>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${formatDifficulty(selectedValidation.difficulty).color}`}>
                    {formatDifficulty(selectedValidation.difficulty).label}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Récompense XP</label>
                  <p className="text-gray-900">{selectedValidation.xpReward} XP</p>
                </div>

                {/* MÉDIAS */}
                {selectedValidation.photoUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Photo</label>
                    <img 
                      src={selectedValidation.photoUrl} 
                      alt="Validation" 
                      className="mt-2 max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                {selectedValidation.videoUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vidéo</label>
                    <video 
                      src={selectedValidation.videoUrl} 
                      controls 
                      className="mt-2 max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                {/* COMMENTAIRE ADMIN */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Commentaire admin (optionnel)</label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Ajoutez un commentaire..."
                  />
                </div>
              </div>

              {/* ACTIONS */}
              {selectedValidation.status === 'pending' && (
                <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedValidation.id, adminComment)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📱 MODAL REJET */}
      {showRejectModal && selectedValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-red-600">Rejeter la validation</h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                Vous êtes sur le point de rejeter la validation pour "{selectedValidation.taskTitle}".
                Un commentaire explicatif est requis.
              </p>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Raison du rejet *</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                  placeholder="Expliquez pourquoi cette validation est rejetée..."
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleReject(selectedValidation.id, adminComment)}
                  disabled={actionLoading || !adminComment.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Rejeter
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
