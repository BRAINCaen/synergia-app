// ==========================================
// 📁 react-app/src/pages/AdminObjectiveValidationPage.jsx
// PAGE ADMIN DE VALIDATION DES RÉCLAMATIONS D'OBJECTIFS
// AVEC DESIGN SYNERGIA PREMIUM + MENU HAMBURGER
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Users,
  ArrowLeft,
  Shield,
  CheckCircle2
} from 'lucide-react';

// ✅ IMPORTS SYNERGIA
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

/**
 * 🛡️ PAGE ADMIN DE VALIDATION DES OBJECTIFS
 * Interface pour valider les réclamations d'objectifs des utilisateurs
 */
const AdminObjectiveValidationPage = () => {
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
      
      // Simulation des réclamations d'objectifs
      const mockClaims = [
        {
          id: 'claim_001',
          userId: 'user_123',
          userName: 'Alice Martin',
          userEmail: 'alice.martin@example.com',
          objectiveId: 'obj_001',
          objectiveTitle: 'Maîtriser React hooks avancés',
          objectiveCategory: 'Développement Frontend',
          claimDescription: 'J\'ai complété le cours sur les hooks avancés et créé 3 projets pratiques utilisant useReducer, useContext et custom hooks.',
          evidenceUrls: [
            'https://github.com/alice/react-hooks-project',
            'https://deploy.example.com/project1'
          ],
          status: 'pending',
          submittedAt: new Date('2025-08-20T10:30:00'),
          priority: 'high',
          estimatedReward: 150
        },
        {
          id: 'claim_002', 
          userId: 'user_456',
          userName: 'Bob Durant',
          userEmail: 'bob.durant@example.com',
          objectiveId: 'obj_002',
          objectiveTitle: 'Optimisation des performances API',
          objectiveCategory: 'Backend',
          claimDescription: 'Optimisation de 5 endpoints API avec réduction de 60% du temps de réponse moyen.',
          evidenceUrls: [
            'https://github.com/bob/api-optimization',
            'https://monitoring.example.com/metrics'
          ],
          status: 'pending',
          submittedAt: new Date('2025-08-19T14:15:00'),
          priority: 'medium',
          estimatedReward: 200
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
      console.log('✅ Approbation réclamation:', claimId);
      
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'approved', 
              processedAt: new Date(),
              adminNotes: 'Objectif validé par admin'
            }
          : claim
      ));
      
      alert('Réclamation approuvée avec succès !');
      
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
      console.log('❌ Rejet réclamation:', claimId, reason);
      
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'rejected',
              processedAt: new Date(),
              adminNotes: reason || 'Objectif non validé'
            }
          : claim
      ));
      
      alert('Réclamation rejetée');
      
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
    if (activeTab !== 'all' && claim.status !== activeTab) {
      return false;
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        claim.objectiveTitle?.toLowerCase().includes(search) ||
        claim.userName?.toLowerCase().includes(search) ||
        claim.claimDescription?.toLowerCase().includes(search) ||
        claim.objectiveCategory?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // ==========================================
  // 🎨 RENDU DE L'INTERFACE
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Chargement des réclamations d'objectifs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
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
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Administration
            </Link>
            <div className="h-6 w-px bg-gray-700"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <Target className="w-10 h-10 text-blue-400" />
              Validation des Objectifs
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg">
            Gérez les réclamations d'objectifs soumises par les utilisateurs
          </p>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">En attente</p>
                <p className="text-3xl font-bold text-orange-400">
                  {claims.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-orange-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Approuvées</p>
                <p className="text-3xl font-bold text-green-400">
                  {claims.filter(c => c.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Rejetées</p>
                <p className="text-3xl font-bold text-red-400">
                  {claims.filter(c => c.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total</p>
                <p className="text-3xl font-bold text-blue-400">
                  {claims.length}
                </p>
              </div>
              <Target className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, objectif, utilisateur..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={loadClaims}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/50"
            >
              <RefreshCw className="w-5 h-5" />
              Actualiser
            </button>
          </div>

          {/* Onglets de filtrage */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Toutes ({claims.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              En attente ({claims.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'approved'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Approuvées ({claims.filter(c => c.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune réclamation trouvée
              </h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? 'Aucune réclamation ne correspond à votre recherche'
                  : 'Il n\'y a aucune réclamation d\'objectif pour le moment'}
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
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:scale-[1.02] hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-400" />
                          <span className="font-medium text-white">{claim.userName}</span>
                          <span className="text-gray-400 text-sm">({claim.userEmail})</span>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          claim.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          claim.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {claim.status === 'pending' ? 'En attente' :
                           claim.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-white mb-2">
                        {claim.objectiveTitle}
                      </h3>

                      <p className="text-gray-300 mb-3">
                        {claim.claimDescription}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Soumis le {claim.submittedAt.toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-400" />
                          {claim.estimatedReward} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-blue-400" />
                          {claim.objectiveCategory}
                        </span>
                      </div>

                      {claim.evidenceUrls && claim.evidenceUrls.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-2">Preuves fournies :</p>
                          <div className="flex gap-2">
                            {claim.evidenceUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
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
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-green-500/50"
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
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-red-500/50"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeter
                        </button>
                      </div>
                    )}

                    {/* Notes admin pour les réclamations traitées */}
                    {claim.status !== 'pending' && claim.adminNotes && (
                      <div className="ml-6 max-w-xs">
                        <p className="text-sm text-gray-300">
                          <strong className="text-white">Notes admin:</strong> {claim.adminNotes}
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
            className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 font-medium"
          >
            Retour Administration
          </Link>
          
          <Link
            to="/admin/task-validation"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/50"
          >
            Validation Tâches
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminObjectiveValidationPage;
