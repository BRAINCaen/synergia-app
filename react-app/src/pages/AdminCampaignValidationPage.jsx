// ==========================================
// 📁 react-app/src/pages/AdminObjectiveValidationPage.jsx
// PAGE ADMIN DE VALIDATION DES RÉCLAMATIONS D'OBJECTIFS
// IMPORT CORRIGÉ - UTILISE useAuthStore
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

// ✅ IMPORT CORRIGÉ - Utilise le store d'authentification correct
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
      // Dans une vraie app, ces données viendraient de Firebase
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
        },
        {
          id: 'claim_003',
          userId: 'user_789',
          userName: 'Claire Lopez',
          userEmail: 'claire.lopez@example.com', 
          objectiveId: 'obj_003',
          objectiveTitle: 'Configuration CI/CD avancée',
          objectiveCategory: 'DevOps',
          claimDescription: 'Mise en place pipeline CI/CD avec tests automatisés, déploiement multi-environnements et monitoring.',
          evidenceUrls: [
            'https://gitlab.example.com/devops/pipeline',
            'https://docs.example.com/cicd-guide'
          ],
          status: 'approved',
          submittedAt: new Date('2025-08-18T09:00:00'),
          processedAt: new Date('2025-08-19T11:30:00'),
          priority: 'high',
          estimatedReward: 300,
          adminNotes: 'Excellent travail sur la pipeline. Implémentation très propre.'
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
      console.log('✅ Approbation réclamation:', claimId);
      
      // Mettre à jour l'état local
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
      
      // Simulation du rejet
      console.log('❌ Rejet réclamation:', claimId, reason);
      
      // Mettre à jour l'état local
      setClaims(prev => prev.map(claim => 
        claim.id === claimId 
          ? { 
              ...claim, 
              status: 'rejected', 
              processedAt: new Date(),
              adminNotes: reason || 'Réclamation rejetée par admin'
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
  // 🔍 FILTRAGE ET RECHERCHE
  // ==========================================

  const filteredClaims = claims.filter(claim => {
    // Filtre par statut
    if (activeTab !== 'all' && claim.status !== activeTab) {
      return false;
    }
    
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        claim.userName.toLowerCase().includes(searchLower) ||
        claim.objectiveTitle.toLowerCase().includes(searchLower) ||
        claim.objectiveCategory.toLowerCase().includes(searchLower)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des réclamations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
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
              <Target className="w-8 h-8 text-blue-600" />
              Validation des Objectifs
            </h1>
          </div>
          
          <p className="text-gray-600">
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
                <p className="text-2xl font-bold text-gray-900">
                  {claims.length}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Onglets de statut */}
            <div className="flex gap-2">
              {[
                { key: 'pending', label: 'En attente', color: 'orange' },
                { key: 'approved', label: 'Approuvées', color: 'green' },
                { key: 'rejected', label: 'Rejetées', color: 'red' },
                { key: 'all', label: 'Toutes', color: 'gray' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? `bg-${tab.color}-600 text-white`
                      : `bg-${tab.color}-50 text-${tab.color}-600 hover:bg-${tab.color}-100`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, objectif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <button
              onClick={loadClaims}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </motion.div>

        {/* Liste des réclamations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border overflow-hidden"
        >
          {filteredClaims.length === 0 ? (
            <div className="p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune réclamation trouvée
              </h3>
              <p className="text-gray-600">
                {activeTab === 'all' 
                  ? 'Aucune réclamation d\'objectif disponible'
                  : `Aucune réclamation ${activeTab === 'pending' ? 'en attente' : activeTab === 'approved' ? 'approuvée' : 'rejetée'}`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredClaims.map((claim, index) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-gray-900">{claim.userName}</span>
                        <span className="text-sm text-gray-500">({claim.userEmail})</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          claim.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {claim.status === 'pending' ? 'En attente' :
                           claim.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {claim.objectiveTitle}
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
                          <Target className="w-4 h-4" />
                          {claim.objectiveCategory}
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
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                Lien {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {claim.status === 'pending' && (
                      <div className="flex gap-2 ml-6">
                        <button
                          onClick={() => handleApproveClaim(claim.id)}
                          disabled={processingClaim}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
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
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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

export default AdminObjectiveValidationPage;
