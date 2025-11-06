// ==========================================
// 📁 react-app/src/pages/AdminCampaignValidationPage.jsx
// PAGE ADMIN DE VALIDATION DES RÉCLAMATIONS DE CAMPAGNES
// BASÉE SUR AdminObjectiveValidationPage
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Flag,
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
  Users,
  ArrowLeft,
  Shield,
  CheckCircle2,
  Sword
} from 'lucide-react';

// ✅ IMPORT CORRIGÉ - Utilise le store d'authentification correct
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🛡️ PAGE ADMIN DE VALIDATION DES CAMPAGNES
 * Interface pour valider les réclamations de campagnes des utilisateurs
 */
const AdminCampaignValidationPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [processingClaim, setProcessingClaim] = useState(false);

  // Protection d'accès admin
  if (!user || !isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ==========================================
  // 🔄 CHARGEMENT DES DONNÉES
  // ==========================================
  
  const loadClaims = async () => {
    try {
      setLoading(true);
      
      // Simulation des réclamations de campagnes
      // Dans une vraie app, ces données viendraient de Firebase
      const mockClaims = [
        {
          id: 'claim_001',
          userId: 'user_123',
          userName: 'Alice Martin',
          userEmail: 'alice.martin@example.com',
          campaignId: 'camp_001',
          campaignTitle: 'Conquête des Marchés Nordiques',
          campaignCategory: 'Expansion Commerciale',
          claimDescription: 'J\'ai complété toutes les étapes de la campagne avec succès : prospection de 50 clients, conversion de 15 nouveaux contrats, et augmentation du CA de 45%.',
          evidenceUrls: [
            'https://drive.google.com/campaign-report',
            'https://analytics.example.com/results'
          ],
          status: 'pending',
          submittedAt: new Date('2025-08-20T10:30:00'),
          priority: 'high',
          estimatedReward: 250
        },
        {
          id: 'claim_002', 
          userId: 'user_456',
          userName: 'Bob Durant',
          userEmail: 'bob.durant@example.com',
          campaignId: 'camp_002',
          campaignTitle: 'Refonte Infrastructure Technique',
          campaignCategory: 'Développement',
          claimDescription: 'Migration complète vers microservices avec amélioration de 80% des performances et réduction de 60% des coûts serveur.',
          evidenceUrls: [
            'https://github.com/bob/infrastructure-migration',
            'https://monitoring.example.com/metrics'
          ],
          status: 'pending',
          submittedAt: new Date('2025-08-19T14:15:00'),
          priority: 'medium',
          estimatedReward: 300
        },
        {
          id: 'claim_003',
          userId: 'user_789',
          userName: 'Claire Lopez',
          userEmail: 'claire.lopez@example.com', 
          campaignId: 'camp_003',
          campaignTitle: 'Lancement Produit Innovation 2025',
          campaignCategory: 'Marketing',
          claimDescription: 'Lancement réussi avec 10K utilisateurs en 1 mois, couverture médiatique dans 5 médias majeurs, et taux de satisfaction de 92%.',
          evidenceUrls: [
            'https://analytics.example.com/product-launch',
            'https://docs.example.com/press-review'
          ],
          status: 'approved',
          submittedAt: new Date('2025-08-18T09:00:00'),
          processedAt: new Date('2025-08-19T11:30:00'),
          priority: 'high',
          estimatedReward: 400,
          adminNotes: 'Excellent travail sur le lancement. Résultats au-dessus des objectifs.'
        }
      ];

      setClaims(mockClaims);
      
    } catch (error) {
      console.error('❌ Erreur chargement réclamations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadClaims();
  }, []);

  // ==========================================
  // 🎯 ACTIONS DE VALIDATION
  // ==========================================

  const handleApproveClaim = async (claimId) => {
    try {
      setProcessingClaim(true);
      
      // Simulation de l'approbation
      console.log('✅ Approbation réclamation campagne:', claimId);
      
      // Mettre à jour l'état local
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'approved', 
              processedAt: new Date(),
              adminNotes: 'Campagne validée par admin'
            }
          : claim
      ));
      
      alert('Réclamation de campagne approuvée avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setProcessingClaim(false);
    }
  };

  const handleRejectClaim = async (claimId, reason) => {
    try {
      setProcessingClaim(true);
      
      // Simulation du rejet
      console.log('❌ Rejet réclamation campagne:', claimId, reason);
      
      // Mettre à jour l'état local
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'rejected',
              processedAt: new Date(),
              adminNotes: reason || 'Campagne non validée'
            }
          : claim
      ));
      
      alert('Réclamation de campagne rejetée');
      
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      alert('Erreur lors du rejet');
    } finally {
      setProcessingClaim(false);
    }
  };

  // ==========================================
  // 🔍 FILTRAGE DES RÉCLAMATIONS
  // ==========================================

  const filteredClaims = claims.filter(claim => {
    // Filtrer par onglet actif
    if (activeTab !== 'all' && claim.status !== activeTab) {
      return false;
    }

    // Filtrer par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        claim.campaignTitle?.toLowerCase().includes(search) ||
        claim.userName?.toLowerCase().includes(search) ||
        claim.claimDescription?.toLowerCase().includes(search) ||
        claim.campaignCategory?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // ==========================================
  // 🎨 RENDU DE L'INTERFACE
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des réclamations de campagnes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Administration
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Flag className="w-8 h-8 text-purple-600" />
              Validation des Campagnes
            </h1>
          </div>
          
          <p className="text-gray-600">
            Gérez les réclamations de campagnes soumises par les utilisateurs
          </p>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {claims.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approuvées</p>
                <p className="text-2xl font-bold text-green-600">
                  {claims.filter(c => c.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejetées</p>
                <p className="text-2xl font-bold text-red-600">
                  {claims.filter(c => c.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {claims.length}
                </p>
              </div>
              <Flag className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, campagne, utilisateur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={loadClaims}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </button>
          </div>

          {/* Onglets de filtrage */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes ({claims.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              En attente ({claims.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approuvées ({claims.filter(c => c.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejetées ({claims.filter(c => c.status === 'rejected').length})
            </button>
          </div>
        </motion.div>

        {/* Liste des réclamations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredClaims.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune réclamation trouvée
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Aucune réclamation ne correspond à votre recherche'
                  : 'Il n\'y a aucune réclamation de campagne pour le moment'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClaims.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{claim.userName}</span>
                          <span className="text-gray-500 text-sm">({claim.userEmail})</span>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          claim.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {claim.status === 'pending' ? 'En attente' :
                           claim.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {claim.campaignTitle}
                      </h3>

                      <p className="text-gray-600 mb-3">
                        {claim.claimDescription}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Soumis le {claim.submittedAt.toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {claim.estimatedReward} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Flag className="w-4 h-4" />
                          {claim.campaignCategory}
                        </span>
                      </div>

                      {claim.evidenceUrls && claim.evidenceUrls.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Preuves fournies :</p>
                          <div className="flex gap-2">
                            {claim.evidenceUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                Lien {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions de validation */}
                    {claim.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveClaim(claim.id)}
                          disabled={processingClaim}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Raison du rejet (optionnel):');
                            if (reason !== null) {
                              handleRejectClaim(claim.id, reason);
                            }
                          }}
                          disabled={processingClaim}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </button>
                      </div>
                    )}

                    {/* Notes admin pour les réclamations traitées */}
                    {claim.status !== 'pending' && claim.adminNotes && (
                      <div className="ml-6 max-w-xs">
                        <p className="text-sm text-gray-600">
                          <strong>Notes admin:</strong> {claim.adminNotes}
                        </p>
                        {claim.processedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Traité le {claim.processedAt.toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Actions de navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <Link
            to="/admin"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour Administration
          </Link>
          
          <Link
            to="/admin/task-validation"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Validation Tâches
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminCampaignValidationPage;
