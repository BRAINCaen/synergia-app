// ==========================================
// 📁 react-app/src/pages/AdminObjectiveValidationPage.jsx
// PAGE ADMIN DE VALIDATION DES RÉCLAMATIONS D'OBJECTIFS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Target, 
  Award,
  Filter,
  Search,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Calendar,
  Star,
  Eye,
  ChevronRight,
  Users
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext.jsx';
import { useObjectiveClaims } from '../shared/hooks/useObjectiveClaims.js';
import LayoutComponent from '../layouts/LayoutComponent.jsx';

/**
 * 🛡️ PAGE ADMIN DE VALIDATION DES RÉCLAMATIONS D'OBJECTIFS
 */
const AdminObjectiveValidationPage = () => {
  const { user } = useAuth();
  const {
    allClaims,
    claimStats,
    loading,
    error,
    processingClaim,
    loadAllClaims,
    approveClaim,
    rejectClaim,
    loadClaimStats
  } = useObjectiveClaims();

  // États locaux
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedClaims, setSelectedClaims] = useState([]);

  // Charger les données au montage
  useEffect(() => {
    loadAllClaims({ status: activeTab === 'all' ? null : activeTab });
    loadClaimStats();
  }, [activeTab, loadAllClaims, loadClaimStats]);

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const handleRefresh = async () => {
    await Promise.all([
      loadAllClaims({ status: activeTab === 'all' ? null : activeTab }),
      loadClaimStats()
    ]);
  };

  /**
   * ✅ APPROUVER UNE RÉCLAMATION
   */
  const handleApproveClaim = async (claim) => {
    try {
      const result = await approveClaim(claim.id, adminNotes);
      
      if (result.success) {
        setShowDetailModal(false);
        setSelectedClaim(null);
        setAdminNotes('');
        
        // Afficher notification de succès
        showNotification(`Réclamation approuvée: +${result.xpAwarded} XP attribués`, 'success');
      }
    } catch (err) {
      showNotification(`Erreur: ${err.message}`, 'error');
    }
  };

  /**
   * ❌ REJETER UNE RÉCLAMATION
   */
  const handleRejectClaim = async (claim) => {
    if (!adminNotes.trim()) {
      showNotification('Veuillez fournir une raison pour le rejet', 'warning');
      return;
    }

    try {
      const result = await rejectClaim(claim.id, adminNotes);
      
      if (result.success) {
        setShowDetailModal(false);
        setSelectedClaim(null);
        setAdminNotes('');
        
        showNotification('Réclamation rejetée avec succès', 'success');
      }
    } catch (err) {
      showNotification(`Erreur: ${err.message}`, 'error');
    }
  };

  /**
   * 👁️ OUVRIR LE DÉTAIL D'UNE RÉCLAMATION
   */
  const openClaimDetail = (claim) => {
    setSelectedClaim(claim);
    setAdminNotes('');
    setShowDetailModal(true);
  };

  /**
   * 🔍 FILTRER LES RÉCLAMATIONS
   */
  const filteredClaims = allClaims.filter(claim => {
    const matchesSearch = searchTerm === '' || 
      claim.objectiveTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === 'all' || claim.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || claim.objectiveCategory === filterCategory;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  /**
   * 📊 OBTENIR LES STATISTIQUES RAPIDES
   */
  const getQuickStats = () => {
    const pending = filteredClaims.filter(c => c.status === 'pending').length;
    const highPriority = filteredClaims.filter(c => c.priority === 'high').length;
    const totalXP = filteredClaims
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + (c.xpAmount || 0), 0);

    return { pending, highPriority, totalXP };
  };

  const quickStats = getQuickStats();

  /**
   * 🔔 AFFICHER UNE NOTIFICATION
   */
  const showNotification = (message, type = 'info') => {
    // Ici on pourrait utiliser un système de notifications plus sophistiqué
    alert(`${type.toUpperCase()}: ${message}`);
  };

  /**
   * 🎨 OBTENIR LA COULEUR DU STATUT
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  /**
   * 🎯 OBTENIR L'ICÔNE DE PRIORITÉ
   */
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'normal': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'low': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <LayoutComponent>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🎯 Validation des Objectifs
            </h1>
            <p className="text-gray-400">
              Gérer les réclamations d'objectifs des utilisateurs
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En attente</p>
                <p className="text-2xl font-bold text-yellow-400">{claimStats?.pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approuvées</p>
                <p className="text-2xl font-bold text-green-400">{claimStats?.approved || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Taux d'approbation</p>
                <p className="text-2xl font-bold text-blue-400">{claimStats?.approvalRate || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Temps moyen</p>
                <p className="text-2xl font-bold text-purple-400">{claimStats?.averageProcessingHours || 0}h</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Onglets de statut */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'pending' && '⏳ En attente'}
                {tab === 'approved' && '✅ Approuvées'}
                {tab === 'rejected' && '❌ Rejetées'}
                {tab === 'all' && '📋 Toutes'}
              </button>
            ))}
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher objectif ou utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtres */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="high">Priorité haute</option>
            <option value="normal">Priorité normale</option>
            <option value="low">Priorité faible</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes catégories</option>
            <option value="leadership">Leadership</option>
            <option value="innovation">Innovation</option>
            <option value="teamwork">Travail d'équipe</option>
            <option value="customer_service">Service client</option>
          </select>
        </div>

        {/* Liste des réclamations */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <span className="ml-3 text-gray-400">Chargement des réclamations...</span>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center p-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Aucune réclamation trouvée
              </h3>
              <p className="text-gray-500">
                {activeTab === 'pending' 
                  ? 'Aucune réclamation en attente de validation'
                  : 'Aucune réclamation ne correspond à vos critères'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => openClaimDetail(claim)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                          {claim.status === 'pending' && '⏳ En attente'}
                          {claim.status === 'approved' && '✅ Approuvée'}
                          {claim.status === 'rejected' && '❌ Rejetée'}
                        </span>
                        
                        {getPriorityIcon(claim.priority)}
                        
                        <span className="text-xs text-gray-400">
                          {new Date(claim.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-1">
                        {claim.objectiveTitle}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {claim.userName}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {claim.xpAmount} XP
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {claim.objectiveCategory}
                        </div>
                      </div>

                      {claim.evidence && (
                        <p className="text-sm text-gray-500 mt-2 truncate">
                          💬 {claim.evidence}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {claim.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClaim(claim);
                              handleApproveClaim(claim);
                            }}
                            disabled={processingClaim === claim.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            ✅ Approuver
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openClaimDetail(claim);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            ❌ Rejeter
                          </button>
                        </>
                      )}

                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de détail */}
        {showDetailModal && selectedClaim && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Détail de la réclamation
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informations générales */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📋 Informations générales</h3>
                    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                      <p><span className="text-gray-400">Objectif:</span> <span className="text-white">{selectedClaim.objectiveTitle}</span></p>
                      <p><span className="text-gray-400">Description:</span> <span className="text-white">{selectedClaim.objectiveDescription}</span></p>
                      <p><span className="text-gray-400">Utilisateur:</span> <span className="text-white">{selectedClaim.userName} ({selectedClaim.userEmail})</span></p>
                      <p><span className="text-gray-400">Type:</span> <span className="text-white">{selectedClaim.objectiveType}</span></p>
                      <p><span className="text-gray-400">Catégorie:</span> <span className="text-white">{selectedClaim.objectiveCategory}</span></p>
                      <p><span className="text-gray-400">XP à attribuer:</span> <span className="text-green-400 font-semibold">{selectedClaim.xpAmount}</span></p>
                      <p><span className="text-gray-400">Badge:</span> <span className="text-yellow-400">{selectedClaim.badgeReward || 'Aucun'}</span></p>
                    </div>
                  </div>

                  {/* Preuves */}
                  {selectedClaim.evidence && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">💬 Preuves fournies</h3>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-white">{selectedClaim.evidence}</p>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📅 Dates</h3>
                    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                      <p><span className="text-gray-400">Demande soumise:</span> <span className="text-white">{new Date(selectedClaim.createdAt).toLocaleString('fr-FR')}</span></p>
                      {selectedClaim.approvedAt && (
                        <p><span className="text-gray-400">Approuvée le:</span> <span className="text-green-400">{new Date(selectedClaim.approvedAt).toLocaleString('fr-FR')}</span></p>
                      )}
                      {selectedClaim.rejectedAt && (
                        <p><span className="text-gray-400">Rejetée le:</span> <span className="text-red-400">{new Date(selectedClaim.rejectedAt).toLocaleString('fr-FR')}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Notes admin */}
                  {selectedClaim.status === 'pending' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">📝 Notes administrateur</h3>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Ajoutez vos commentaires (obligatoire pour un rejet)..."
                        className="w-full h-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  )}

                  {/* Notes existantes */}
                  {selectedClaim.adminNotes && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">💭 Notes administrateur</h3>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-white">{selectedClaim.adminNotes}</p>
                        {selectedClaim.approvedBy && (
                          <p className="text-xs text-gray-400 mt-2">Par: {selectedClaim.approvedBy}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedClaim.status === 'pending' && (
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Annuler
                    </button>
                    
                    <button
                      onClick={() => handleRejectClaim(selectedClaim)}
                      disabled={processingClaim === selectedClaim.id}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      ❌ Rejeter
                    </button>
                    
                    <button
                      onClick={() => handleApproveClaim(selectedClaim)}
                      disabled={processingClaim === selectedClaim.id}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      ✅ Approuver
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
};

export default AdminObjectiveValidationPage;
