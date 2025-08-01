// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION CORRIGÉE - UTILISE LES BONNES MÉTHODES
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

// ✅ IMPORT CORRIGÉ DU SERVICE ADMIN
import { adminValidationService } from '../core/services/adminValidationService';
import { useAuthStore } from '../shared/stores/authStore';

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
   * 📥 CHARGER LES VALIDATIONS SELON L'ONGLET ACTIF
   */
  const loadValidations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 [ADMIN] Chargement validations:', activeTab);
      
      let validationsData = [];
      
      // ✅ UTILISATION DES BONNES MÉTHODES DU SERVICE
      switch (activeTab) {
        case 'pending':
          validationsData = await adminValidationService.getPendingValidations();
          break;
        case 'approved':
          validationsData = await adminValidationService.getApprovedValidations();
          break;
        case 'rejected':
          validationsData = await adminValidationService.getRejectedValidations();
          break;
        case 'all':
        default:
          validationsData = await adminValidationService.getAllValidations();
          break;
      }
      
      console.log(`✅ [ADMIN] ${validationsData.length} validations chargées`);
      setValidations(validationsData);
      
    } catch (error) {
      console.error('❌ [ADMIN] Erreur chargement validations:', error);
      setError('Erreur lors du chargement des validations: ' + error.message);
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
   * ✅ APPROUVER UNE VALIDATION
   */
  const handleApprove = async (validationId, comment = '') => {
    try {
      setActionLoading(true);
      console.log('✅ [ADMIN] Approbation validation:', validationId);
      
      await adminValidationService.approveValidation(validationId, user.uid, comment);
      
      console.log('✅ [ADMIN] Validation approuvée avec succès');
      
      // Recharger les données
      await loadValidations();
      await loadStats();
      
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
  const handleReject = async (validationId, comment) => {
    try {
      if (!comment || comment.trim() === '') {
        alert('Un commentaire est requis pour rejeter une validation');
        return;
      }

      setActionLoading(true);
      console.log('❌ [ADMIN] Rejet validation:', validationId);
      
      await adminValidationService.rejectValidation(validationId, user.uid, comment);
      
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
   * 🎨 OBTENIR LA COULEUR D'UN STATUT
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  /**
   * 🔄 AFFICHAGE LOADING
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white">Chargement des validations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🛡️ Administration des Validations
            </h1>
            <p className="text-gray-400">
              Gérez les demandes de validation des tâches
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => {
                loadValidations();
                loadStats();
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-blue-300">Total</p>
            </div>
          </div>
          
          <div className="bg-yellow-600/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-sm text-yellow-300">En Attente</p>
            </div>
          </div>
          
          <div className="bg-green-600/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-sm text-green-300">Validées</p>
            </div>
          </div>
          
          <div className="bg-red-600/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              <p className="text-sm text-red-300">Rejetées</p>
            </div>
          </div>
          
          <div className="bg-purple-600/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.today}</p>
              <p className="text-sm text-purple-300">Aujourd'hui</p>
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Onglets de filtrage */}
            <div className="flex space-x-2">
              {[
                { key: 'pending', label: 'En Attente', count: stats.pending },
                { key: 'approved', label: 'Validées', count: stats.approved },
                { key: 'rejected', label: 'Rejetées', count: stats.rejected },
                { key: 'all', label: 'Toutes', count: stats.total }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par tâche, utilisateur, commentaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Liste des validations */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
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

            {filteredValidations.length === 0 ? (
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
                   'Aucune validation dans le système'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails - À implémenter selon vos besoins */}
      {showDetailModal && selectedValidation && (
        <ValidationDetailModal 
          validation={selectedValidation}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedValidation(null);
          }}
          onApprove={handleApprove}
          onReject={() => setShowRejectModal(true)}
          formatDate={formatDate}
          actionLoading={actionLoading}
        />
      )}

      {/* Modal de rejet - À implémenter selon vos besoins */}
      {showRejectModal && selectedValidation && (
        <RejectModal 
          validation={selectedValidation}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedValidation(null);
            setAdminComment('');
          }}
          onConfirm={(comment) => handleReject(selectedValidation.id, comment)}
          comment={adminComment}
          setComment={setAdminComment}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

/**
 * 🎴 COMPOSANT CARTE DE VALIDATION
 */
const ValidationCard = ({ 
  validation, 
  onViewDetails, 
  onApprove, 
  onReject, 
  formatDate, 
  getStatusColor, 
  actionLoading 
}) => {
  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 hover:bg-gray-700/70 transition-colors">
      <div className="flex items-start justify-between">
        
        {/* Informations principales */}
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-white">
              {validation.taskTitle || validation.originalTaskTitle || 'Tâche sans titre'}
            </h3>
            <span className={`ml-3 px-2 py-1 text-xs rounded border ${getStatusColor(validation.status)}`}>
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
};

/**
 * 📋 MODALS SIMPLIFIÉES (à développer selon vos besoins)
 */
const ValidationDetailModal = ({ validation, onClose, onApprove, onReject, formatDate, actionLoading }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Détails de la validation</h2>
          <p className="text-gray-300">Tâche: {validation.taskTitle}</p>
          <p className="text-gray-300">Utilisateur: {validation.userName}</p>
          <p className="text-gray-300">Date: {formatDate(validation.submittedAt)}</p>
          <div className="flex space-x-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">
              Fermer
            </button>
            {validation.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(validation.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Approuver
                </button>
                <button
                  onClick={onReject}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                >
                  Rejeter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectModal = ({ validation, onClose, onConfirm, comment, setComment, loading }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Rejeter la validation</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Commentaire obligatoire pour le rejet..."
            className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 h-24"
          />
          <div className="flex space-x-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">
              Annuler
            </button>
            <button
              onClick={() => onConfirm(comment)}
              disabled={loading || !comment.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Rejet...' : 'Rejeter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskValidationPage;
