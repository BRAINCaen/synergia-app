// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION CORRIGÉE - VERSION COMPLÈTE
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
  Filter
} from 'lucide-react';

// ✅ IMPORTS CORRIGÉS
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

  /**
   * 🔄 CHARGEMENT INITIAL
   */
  useEffect(() => {
    loadValidations();
    loadStats();
  }, [activeTab]);

  /**
   * 📥 CHARGER LES VALIDATIONS SELON L'ONGLET ACTIF - VERSION CORRIGÉE
   */
  const loadValidations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 [ADMIN] Chargement validations:', activeTab);
      
      let fetchedValidations = [];
      
      if (activeTab === 'pending') {
        // ✅ CORRECTION PRINCIPALE : Récupérer directement les tâches avec status = 'validation_pending'
        console.log('🔍 [ADMIN] Recherche des tâches en attente de validation...');
        
        try {
          // Récupérer toutes les tâches avec statut validation_pending
          const allTasks = await taskService.getAllTasks();
          const pendingTasks = allTasks.filter(task => task.status === 'validation_pending');
          
          console.log(`📊 [ADMIN] ${pendingTasks.length} tâches trouvées avec statut validation_pending`);
          
          // Transformer les tâches en format validation pour compatibilité avec l'UI
          fetchedValidations = pendingTasks.map(task => ({
            id: task.id,
            taskId: task.id,
            taskTitle: task.title,
            status: 'pending', // Pour la logique UI
            userId: task.submittedBy || task.assignedTo?.[0] || task.createdBy,
            userName: 'Utilisateur', // On résoudra plus tard
            userEmail: 'email@exemple.com', // On résoudra plus tard
            comment: task.submissionNotes || 'Tâche soumise pour validation',
            xpAmount: task.xpReward || 25,
            difficulty: task.difficulty || 'medium',
            submittedAt: task.submittedAt || task.updatedAt || new Date(),
            submittedBy: task.submittedBy || task.assignedTo?.[0] || task.createdBy,
            // Métadonnées supplémentaires
            taskData: task,
            type: 'task_submission'
          }));
          
          // Enrichir avec les infos utilisateurs
          for (let i = 0; i < fetchedValidations.length; i++) {
            const validation = fetchedValidations[i];
            try {
              // Import du service users si disponible
              const { userService } = await import('../core/services/userService.js');
              const userData = await userService.getUserById(validation.userId);
              
              if (userData) {
                validation.userName = userData.displayName || userData.name || 'Utilisateur inconnu';
                validation.userEmail = userData.email || 'email@inconnu.com';
              }
            } catch (userError) {
              console.warn('⚠️ Erreur récupération utilisateur:', userError);
            }
          }
          
        } catch (tasksError) {
          console.error('❌ [ADMIN] Erreur récupération tâches:', tasksError);
          // Fallback : essayer avec le service de validation classique
          try {
            const pendingFromService = await adminValidationService.getPendingValidations();
            fetchedValidations = pendingFromService;
            console.log(`📊 [ADMIN] Fallback: ${fetchedValidations.length} validations depuis le service`);
          } catch (fallbackError) {
            console.error('❌ [ADMIN] Erreur fallback:', fallbackError);
            throw new Error('Impossible de récupérer les validations');
          }
        }
        
      } else if (activeTab === 'approved') {
        // Récupérer les validations approuvées
        fetchedValidations = await adminValidationService.getApprovedValidations();
        
      } else if (activeTab === 'rejected') {
        // Récupérer les validations rejetées  
        fetchedValidations = await adminValidationService.getRejectedValidations();
        
      } else {
        // Toutes les validations
        fetchedValidations = await adminValidationService.getAllValidations();
      }
      
      console.log(`✅ [ADMIN] ${fetchedValidations.length} validations chargées pour l'onglet ${activeTab}`);
      setValidations(fetchedValidations);
      
    } catch (error) {
      console.error('❌ [ADMIN] Erreur chargement validations:', error);
      setError(`Erreur lors du chargement: ${error.message}`);
      setValidations([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CHARGER LES STATISTIQUES
   */
  const loadStats = async () => {
    try {
      const statsData = await adminValidationService.getValidationStats();
      setStats(statsData);
    } catch (error) {
      console.error('❌ [ADMIN] Erreur chargement stats:', error);
    }
  };

  /**
   * ✅ APPROUVER UNE VALIDATION - VERSION CORRIGÉE
   */
  const handleApprove = async (validationId, comment = '') => {
    try {
      setActionLoading(true);
      console.log('✅ [ADMIN] Approbation validation:', validationId);
      
      // Trouver la validation correspondante
      const validation = validations.find(v => v.id === validationId);
      if (!validation) {
        throw new Error('Validation introuvable');
      }
      
      if (validation.type === 'task_submission') {
        // ✅ NOUVEAU : Gérer les soumissions de tâches directement
        console.log('📋 [ADMIN] Approbation soumission de tâche:', validation.taskId);
        
        // Mettre à jour le statut de la tâche vers 'completed'
        await taskService.updateTask(validation.taskId, {
          status: 'completed',
          completedAt: new Date(),
          validatedBy: user.uid,
          adminValidationComment: comment || 'Tâche approuvée par l\'admin',
          updatedAt: new Date()
        });
        
        // TODO: Ajouter XP à l'utilisateur ici si nécessaire
        
        console.log('✅ [ADMIN] Tâche marquée comme terminée avec succès');
        
      } else {
        // Ancien système de validation
        await adminValidationService.approveValidation(validationId, user.uid, comment);
      }
      
      console.log('✅ [ADMIN] Validation approuvée avec succès');
      
      // Recharger les données
      await loadValidations();
      await loadStats();
      
      // Fermer le modal des détails
      setShowDetailModal(false);
      setSelectedValidation(null);
      
    } catch (error) {
      console.error('❌ [ADMIN] Erreur approbation:', error);
      alert('Erreur lors de l\'approbation: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * ❌ REJETER UNE VALIDATION - VERSION CORRIGÉE
   */
  const handleReject = async (validationId, comment) => {
    try {
      if (!comment || comment.trim() === '') {
        alert('Un commentaire est requis pour rejeter une validation');
        return;
      }

      setActionLoading(true);
      console.log('❌ [ADMIN] Rejet validation:', validationId);
      
      // Trouver la validation correspondante
      const validation = validations.find(v => v.id === validationId);
      if (!validation) {
        throw new Error('Validation introuvable');
      }
      
      if (validation.type === 'task_submission') {
        // ✅ NOUVEAU : Gérer le rejet de soumissions de tâches
        console.log('📋 [ADMIN] Rejet soumission de tâche:', validation.taskId);
        
        // Remettre la tâche en cours pour permettre une nouvelle soumission
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
      await loadValidations();
      await loadStats();
      
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
  const filteredValidations = validations.filter(validation => {
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
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  /**
   * 🎨 OBTENIR LA COULEUR DU STATUT
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-400 bg-orange-900/20';
      case 'approved': return 'text-green-400 bg-green-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  // ===================================================
  // 🎨 RENDU DE L'INTERFACE
  // ===================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🛡️ Administration - Validation des Tâches
            </h1>
            <p className="text-gray-400">
              Gérer les demandes de validation de tâches des utilisateurs
            </p>
          </div>
          
          <button
            onClick={loadValidations}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="text-blue-400 text-2xl">📊</div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En attente</p>
                <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
              </div>
              <div className="text-orange-400 text-2xl">⏳</div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approuvées</p>
                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
              </div>
              <div className="text-green-400 text-2xl">✅</div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejetées</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <div className="text-red-400 text-2xl">❌</div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-4 mb-6">
          {[
            { id: 'pending', label: 'En attente', count: stats.pending },
            { id: 'approved', label: 'Approuvées', count: stats.approved },
            { id: 'rejected', label: 'Rejetées', count: stats.rejected },
            { id: 'all', label: 'Toutes', count: stats.total }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-sm opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par titre, utilisateur ou commentaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Liste des validations */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-600 overflow-hidden">
          <div className="p-4 border-b border-gray-600">
            <h2 className="text-lg font-semibold text-white flex items-center">
              {activeTab === 'pending' ? '⏳ Validations en Attente' :
               activeTab === 'approved' ? '✅ Validations Approuvées' :
               activeTab === 'rejected' ? '❌ Validations Rejetées' :
               '📋 Toutes les Validations'}
              <span className="ml-2 text-sm text-gray-400">
                ({filteredValidations.length})
              </span>
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-400">Chargement des validations...</span>
            </div>
          ) : filteredValidations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {activeTab === 'pending' ? '⏳' : activeTab === 'approved' ? '✅' : '❌'}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Aucune validation trouvée
              </h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'pending' ? 'Aucune demande en attente de validation' :
                 activeTab === 'approved' ? 'Aucune validation approuvée' :
                 activeTab === 'rejected' ? 'Aucune validation rejetée' :
                 'Aucune validation dans cette catégorie'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-600">
              {filteredValidations.map(validation => (
                <ValidationCard
                  key={validation.id}
                  validation={validation}
                  onViewDetails={handleViewDetails}
                  onApprove={handleApprove}
                  onReject={(id) => {
                    setSelectedValidation(validation);
                    setShowRejectModal(true);
                  }}
                  actionLoading={actionLoading}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de détails */}
        {showDetailModal && selectedValidation && (
          <ValidationDetailModal
            validation={selectedValidation}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedValidation(null);
            }}
            onApprove={handleApprove}
            onReject={(id) => {
              setShowRejectModal(true);
            }}
            actionLoading={actionLoading}
            formatDate={formatDate}
          />
        )}

        {/* Modal de rejet */}
        {showRejectModal && selectedValidation && (
          <RejectModal
            validation={selectedValidation}
            comment={adminComment}
            onCommentChange={setAdminComment}
            onConfirm={() => {
              handleReject(selectedValidation.id, adminComment);
            }}
            onCancel={() => {
              setShowRejectModal(false);
              setSelectedValidation(null);
              setAdminComment('');
            }}
            loading={actionLoading}
          />
        )}
      </div>
    </div>
  );
};

/**
 * 🎴 COMPOSANT CARTE DE VALIDATION
 */
const ValidationCard = ({ validation, onViewDetails, onApprove, onReject, actionLoading, formatDate, getStatusColor }) => (
  <div className="p-6 hover:bg-gray-700/30 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-lg font-semibold text-white">
            {validation.taskTitle}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(validation.status)}`}>
            {validation.status === 'pending' ? 'En attente' :
             validation.status === 'approved' ? 'Approuvée' :
             validation.status === 'rejected' ? 'Rejetée' : validation.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center text-gray-400">
            <User className="w-4 h-4 mr-2" />
            {validation.userName}
          </div>
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(validation.submittedAt)}
          </div>
          <div className="flex items-center text-gray-400">
            <Trophy className="w-4 h-4 mr-2" />
            {validation.xpAmount || validation.difficulty || 'N/A'} XP
          </div>
          {validation.comment && (
            <div className="flex items-center text-gray-400">
              <MessageSquare className="w-4 h-4 mr-2" />
              Commentaire fourni
            </div>
          )}
        </div>

        {validation.comment && (
          <p className="text-gray-300 text-sm italic mb-4 bg-gray-800/50 p-3 rounded">
            "{validation.comment}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onViewDetails(validation)}
          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-600 rounded-lg transition-colors"
          title="Voir les détails"
        >
          <Eye className="w-4 h-4" />
        </button>

        {validation.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(validation.id, 'Validation approuvée rapidement')}
              disabled={actionLoading}
              className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              title="Approuver"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onReject(validation.id)}
              disabled={actionLoading}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              title="Rejeter"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

/**
 * 📋 MODAL DE DÉTAILS DE VALIDATION
 */
const ValidationDetailModal = ({ validation, onClose, onApprove, onReject, actionLoading, formatDate }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Détails de la validation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-400">Tâche</label>
            <p className="text-white">{validation.taskTitle}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400">Utilisateur</label>
            <p className="text-white">{validation.userName} ({validation.userEmail})</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400">Date de soumission</label>
            <p className="text-white">{formatDate(validation.submittedAt)}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-400">Récompense XP</label>
            <p className="text-white">{validation.xpAmount || 'N/A'} XP</p>
          </div>

          {validation.comment && (
            <div>
              <label className="text-sm font-medium text-gray-400">Commentaire de l'utilisateur</label>
              <p className="text-white bg-gray-700 p-3 rounded">{validation.comment}</p>
            </div>
          )}
        </div>

        {validation.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={() => onApprove(validation.id, 'Validation approuvée depuis les détails')}
              disabled={actionLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Approbation...' : '✅ Approuver'}
            </button>
            
            <button
              onClick={() => onReject(validation.id)}
              disabled={actionLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              ❌ Rejeter
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * ❌ MODAL DE REJET
 */
const RejectModal = ({ validation, comment, onCommentChange, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-lg max-w-md w-full">
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Rejeter la validation</h3>
        
        <p className="text-gray-300 mb-4">
          Voulez-vous vraiment rejeter la validation de "{validation.taskTitle}" ?
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Commentaire (obligatoire)
          </label>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Expliquez pourquoi cette validation est rejetée..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          
          <button
            onClick={onConfirm}
            disabled={loading || !comment.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Rejet...' : 'Confirmer le rejet'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AdminTaskValidationPage;
