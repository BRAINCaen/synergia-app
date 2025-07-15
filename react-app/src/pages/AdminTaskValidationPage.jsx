// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN COMPLÈTE - VERSION CORRIGÉE SYNTAXE JS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Camera,
  Video,
  MessageSquare,
  Trophy,
  User,
  Calendar,
  Tag,
  Gift,
  Settings,
  Award,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import AdminRewardsManagement from '../components/admin/AdminRewardsManagement.jsx';

/**
 * 👨‍💼 PAGE ADMIN COMPLÈTE - VALIDATION + RÉCOMPENSES
 */
const AdminTaskValidationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // États généraux
  const [activeSection, setActiveSection] = useState('validation'); // 'validation' ou 'rewards'
  
  // États validation des tâches
  const [validationRequests, setValidationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  
  // Modal de validation
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    if (activeSection === 'validation') {
      loadValidationRequests();
    }
  }, [activeSection]);

  // Charger les demandes de validation
  const loadValidationRequests = async () => {
    try {
      setLoading(true);
      console.log('📋 Chargement des demandes de validation...');
      
      const requests = await taskValidationService.getPendingValidations();
      console.log('✅ Demandes chargées:', requests.length);
      
      setValidationRequests(requests);
      
    } catch (error) {
      console.error('❌ Erreur chargement validations:', error);
      setValidationRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Traiter une validation
  const handleValidation = async (approve) => {
    if (!selectedRequest) return;
    
    try {
      setValidating(true);
      console.log(`${approve ? '✅' : '❌'} Traitement validation:`, selectedRequest.id);
      
      await taskValidationService.validateTask(selectedRequest.id, {
        userId: user.uid,
        approved: approve,
        comment: adminComment || (approve ? 'Tâche validée' : 'Tâche rejetée'),
        xpAwarded: approve ? selectedRequest.xpAmount : 0
      });
      
      // Recharger les données
      await loadValidationRequests();
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedRequest(null);
      setAdminComment('');
      
    } catch (error) {
      console.error('❌ Erreur traitement validation:', error);
      alert('Erreur lors du traitement de la validation');
    } finally {
      setValidating(false);
    }
  };

  // Ouvrir le modal de validation
  const openValidationModal = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setShowValidationModal(true);
  };

  // Filtrer les demandes
  const filteredRequests = validationRequests.filter(request => {
    const matchesTab = activeTab === 'pending' 
      ? request.status === 'pending'
      : request.status !== 'pending';
    
    const matchesSearch = !searchTerm || 
      request.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = filterDifficulty === 'all' || 
      request.difficulty === filterDifficulty;
    
    return matchesTab && matchesSearch && matchesDifficulty;
  });

  // Statistiques
  const stats = {
    pending: validationRequests.filter(r => r.status === 'pending').length,
    approved: validationRequests.filter(r => r.status === 'approved').length,
    rejected: validationRequests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Header principal */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour Dashboard</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administration Synergia</h1>
            <p className="text-gray-600 mt-1">Gestion des validations et des récompenses</p>
          </div>
          
          <button
            onClick={() => activeSection === 'validation' ? loadValidationRequests() : null}
            disabled={loading && activeSection === 'validation'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading && activeSection === 'validation' ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Navigation entre les sections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveSection('validation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeSection === 'validation'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Validation des Tâches
              {stats.pending > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeSection === 'rewards'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Gift className="w-4 h-4" />
              Gestion des Récompenses
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu selon la section active */}
      {activeSection === 'validation' && (
        <ValidationSection
          stats={stats}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterDifficulty={filterDifficulty}
          setFilterDifficulty={setFilterDifficulty}
          filteredRequests={filteredRequests}
          loading={loading}
          openValidationModal={openValidationModal}
        />
      )}

      {activeSection === 'rewards' && (
        <AdminRewardsManagement user={user} />
      )}

      {/* Modal de validation */}
      {showValidationModal && selectedRequest && (
        <ValidationModal
          request={selectedRequest}
          adminComment={adminComment}
          setAdminComment={setAdminComment}
          validating={validating}
          onApprove={() => handleValidation(true)}
          onReject={() => handleValidation(false)}
          onClose={() => {
            setShowValidationModal(false);
            setSelectedRequest(null);
            setAdminComment('');
          }}
        />
      )}
    </div>
  );
};

/**
 * 📋 SECTION VALIDATION DES TÂCHES
 */
const ValidationSection = ({
  stats,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  filterDifficulty,
  setFilterDifficulty,
  filteredRequests,
  loading,
  openValidationModal
}) => {
  return (
    <div className="space-y-6">
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-gray-600">En attente</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-gray-600">Validées</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-gray-600">Rejetées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'pending', label: 'En Attente', count: stats.pending },
              { id: 'processed', label: 'Traitées', count: stats.approved + stats.rejected }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre difficulté */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-40"
            >
              <option value="all">Toutes difficultés</option>
              <option value="easy">Facile</option>
              <option value="normal">Normal</option>
              <option value="hard">Difficile</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {activeTab === 'pending' ? 'Aucune validation en attente' : 'Aucune validation traitée'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <ValidationRequestCard
                  key={request.id}
                  request={request}
                  onViewDetails={openValidationModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 📄 CARTE DE DEMANDE DE VALIDATION
 */
const ValidationRequestCard = ({ request, onViewDetails }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          
          {/* En-tête */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-lg">
              {request.taskTitle || 'Tâche sans titre'}
            </h3>
            
            {request.status !== 'pending' && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                request.status === 'approved' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {request.status === 'approved' ? 'Validée' : 'Rejetée'}
              </span>
            )}
          </div>
          
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            {/* Badge difficulté */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              request.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              request.difficulty === 'normal' ? 'bg-blue-100 text-blue-700' :
              request.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {request.difficulty}
            </span>
            
            {/* Badge XP */}
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              <Trophy className="w-3 h-3" />
              +{request.xpAmount || 25}
            </span>
          </div>
          
          {/* Métadonnées */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{request.userName || 'Utilisateur'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {request.submittedAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
              </span>
            </div>
            
            {request.hasMedia && (
              <div className="flex items-center gap-1">
                {request.photoUrl && <Camera className="w-4 h-4" />}
                {request.videoUrl && <Video className="w-4 h-4" />}
                <span>Médias joints</span>
              </div>
            )}
          </div>
          
          {/* Commentaire */}
          {request.comment && (
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                <p className="text-gray-700 text-sm">{request.comment}</p>
              </div>
            </div>
          )}

          {/* Commentaire admin si rejeté */}
          {request.adminComment && request.status !== 'pending' && (
            <div className={`p-3 rounded-lg mb-3 ${
              request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Commentaire admin:</p>
                  <p className="text-gray-700 text-sm">{request.adminComment}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ml-4">
          <button
            onClick={() => onViewDetails(request)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            {request.status === 'pending' ? 'Traiter' : 'Voir détails'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 🔍 MODAL DE VALIDATION
 */
const ValidationModal = ({
  request,
  adminComment,
  setAdminComment,
  validating,
  onApprove,
  onReject,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {request.status === 'pending' ? 'Validation de la tâche' : 'Détails de la validation'}
            </h3>
            <p className="text-gray-600 mt-1">{request.taskTitle}</p>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Détails de la tâche */}
        <div className="space-y-4 mb-6">
          
          {/* Informations principales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Utilisateur</label>
                <p className="text-gray-900">{request.userName || 'Utilisateur inconnu'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Date de soumission</label>
                <p className="text-gray-900">
                  {request.submittedAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Difficulté</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  request.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  request.difficulty === 'normal' ? 'bg-blue-100 text-blue-700' :
                  request.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {request.difficulty}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">XP à attribuer</label>
                <p className="text-gray-900 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  +{request.xpAmount || 25}
                </p>
              </div>
            </div>
          </div>

          {/* Commentaire utilisateur */}
          {request.comment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire de l'utilisateur
              </label>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-gray-700">{request.comment}</p>
              </div>
            </div>
          )}

          {/* Médias */}
          {request.hasMedia && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Médias joints
              </label>
              <div className="flex gap-2">
                {request.photoUrl && (
                  <div className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Photo disponible</span>
                  </div>
                )}
                {request.videoUrl && (
                  <div className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Video className="w-4 h-4" />
                    <span className="text-sm">Vidéo disponible</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commentaire admin existant */}
          {request.adminComment && request.status !== 'pending' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire administrateur
              </label>
              <div className={`p-3 rounded-lg ${
                request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="text-gray-700">{request.adminComment}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions pour validation en attente */}
        {request.status === 'pending' && (
          <div className="space-y-4">
            
            {/* Commentaire admin */}
            <div>
              <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                id="adminComment"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ajoutez un commentaire pour l'utilisateur..."
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={validating}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={onReject}
                disabled={validating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                {validating ? 'Rejet...' : 'Rejeter'}
              </button>
              
              <button
                onClick={onApprove}
                disabled={validating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {validating ? 'Validation...' : 'Valider'}
              </button>
            </div>
          </div>
        )}

        {/* Informations pour validation déjà traitée */}
        {request.status !== 'pending' && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminTaskValidationPage;
