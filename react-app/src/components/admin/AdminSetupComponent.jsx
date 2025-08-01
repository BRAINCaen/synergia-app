// ==========================================
// 📁 react-app/src/components/admin/AdminSetupComponent.jsx
// INTERFACE POUR CONFIGURER LES ADMINISTRATEURS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  UserPlus, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  Settings,
  RefreshCw,
  Mail,
  User,
  Eye
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import adminSetupService from '../../core/services/adminSetupService.js';

/**
 * 🛡️ COMPOSANT DE CONFIGURATION ADMIN
 */
const AdminSetupComponent = () => {
  const { user } = useAuthStore();
  const [adminStatus, setAdminStatus] = useState(null);
  const [setupEmail, setSetupEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);
  const [showAdminList, setShowAdminList] = useState(false);

  // Vérifier le statut admin au montage
  useEffect(() => {
    if (user) {
      checkCurrentUserAdminStatus();
      loadAdminsList();
    }
  }, [user]);

  const checkCurrentUserAdminStatus = async () => {
    setLoading(true);
    try {
      const status = await adminSetupService.checkIfUserIsAdmin(user.uid);
      setAdminStatus(status);
      
      if (status.isAdmin) {
        setMessage({
          type: 'success',
          text: '✅ Vous êtes déjà administrateur !'
        });
      }
    } catch (error) {
      console.error('❌ Erreur vérification statut admin:', error);
      setMessage({
        type: 'error',
        text: `Erreur: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminsList = async () => {
    try {
      const admins = await adminSetupService.getAllAdmins();
      setAllAdmins(admins);
    } catch (error) {
      console.error('❌ Erreur chargement liste admins:', error);
    }
  };

  const handleMakeMeAdmin = async () => {
    setSetupLoading(true);
    setMessage(null);
    
    try {
      const result = await adminSetupService.makeUserAdmin(user.uid, 'self_setup');
      
      setMessage({
        type: 'success',
        text: `✅ ${result.message}`
      });
      
      // Recharger le statut
      await checkCurrentUserAdminStatus();
      await loadAdminsList();
      
    } catch (error) {
      console.error('❌ Erreur configuration admin:', error);
      setMessage({
        type: 'error',
        text: `❌ Erreur: ${error.message}`
      });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSetupByEmail = async (e) => {
    e.preventDefault();
    if (!setupEmail.trim()) return;
    
    setSetupLoading(true);
    setMessage(null);
    
    try {
      const result = await adminSetupService.makeUserAdminByEmail(
        setupEmail.trim(), 
        `setup_by_${user.email}`
      );
      
      setMessage({
        type: 'success',
        text: `✅ ${result.message} pour ${setupEmail}`
      });
      
      setSetupEmail('');
      await loadAdminsList();
      
    } catch (error) {
      console.error('❌ Erreur configuration admin par email:', error);
      setMessage({
        type: 'error',
        text: `❌ Erreur: ${error.message}`
      });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSetupFirstAdmin = async () => {
    setSetupLoading(true);
    setMessage(null);
    
    try {
      const result = await adminSetupService.setupFirstAdmin(user.email);
      
      setMessage({
        type: 'success',
        text: `✅ ${result.message} ${result.isFirstAdmin ? '(Premier admin)' : ''}`
      });
      
      await checkCurrentUserAdminStatus();
      await loadAdminsList();
      
    } catch (error) {
      console.error('❌ Erreur configuration premier admin:', error);
      setMessage({
        type: 'error',
        text: `❌ Erreur: ${error.message}`
      });
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
          <Shield className="w-7 h-7 text-blue-600" />
          Configuration Administrateur
        </h2>
        <p className="text-gray-600">
          Gérez les permissions administrateur de l'application
        </p>
      </div>

      {/* Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Statut utilisateur actuel */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Votre Statut Actuel
        </h3>
        
        {loading ? (
          <div className="flex items-center gap-3 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Vérification en cours...
          </div>
        ) : adminStatus ? (
          <div className="space-y-4">
            {/* Statut principal */}
            <div className={`p-4 rounded-lg border ${
              adminStatus.isAdmin 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-3">
                {adminStatus.isAdmin ? (
                  <Crown className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <h4 className={`font-semibold ${
                    adminStatus.isAdmin ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {adminStatus.isAdmin ? 'Administrateur Confirmé' : 'Pas d\'Accès Admin'}
                  </h4>
                  <p className={`text-sm ${
                    adminStatus.isAdmin ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {adminStatus.isAdmin 
                      ? 'Vous avez accès à toutes les fonctions administrateur'
                      : 'Vous n\'avez pas les permissions administrateur'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Détails des méthodes de vérification */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className={`p-3 rounded border ${
                adminStatus.methods?.roleBasedAdmin ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-medium">Rôle</div>
                <div className={adminStatus.methods?.roleBasedAdmin ? 'text-green-600' : 'text-gray-500'}>
                  {adminStatus.methods?.roleBasedAdmin ? '✅ Admin' : '❌ Non'}
                </div>
              </div>
              <div className={`p-3 rounded border ${
                adminStatus.methods?.flagBasedAdmin ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-medium">Flag</div>
                <div className={adminStatus.methods?.flagBasedAdmin ? 'text-green-600' : 'text-gray-500'}>
                  {adminStatus.methods?.flagBasedAdmin ? '✅ Admin' : '❌ Non'}
                </div>
              </div>
              <div className={`p-3 rounded border ${
                adminStatus.methods?.permissionBasedAdmin ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-medium">Permissions</div>
                <div className={adminStatus.methods?.permissionBasedAdmin ? 'text-green-600' : 'text-gray-500'}>
                  {adminStatus.methods?.permissionBasedAdmin ? '✅ Admin' : '❌ Non'}
                </div>
              </div>
              <div className={`p-3 rounded border ${
                adminStatus.methods?.collectionBasedAdmin ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-medium">Collection</div>
                <div className={adminStatus.methods?.collectionBasedAdmin ? 'text-green-600' : 'text-gray-500'}>
                  {adminStatus.methods?.collectionBasedAdmin ? '✅ Admin' : '❌ Non'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Données non disponibles</div>
        )}
      </div>

      {/* Actions de configuration */}
      {!adminStatus?.isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Me faire admin */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-blue-600" />
              Me Faire Administrateur
            </h3>
            <p className="text-gray-600 mb-4">
              Configurez votre compte actuel comme administrateur de l'application.
            </p>
            <button
              onClick={handleMakeMeAdmin}
              disabled={setupLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setupLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {setupLoading ? 'Configuration...' : 'Me Faire Admin'}
            </button>
          </div>

          {/* Premier admin */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-600" />
              Configuration Initiale
            </h3>
            <p className="text-gray-600 mb-4">
              Configuration automatique du premier administrateur système.
            </p>
            <button
              onClick={handleSetupFirstAdmin}
              disabled={setupLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setupLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              {setupLoading ? 'Configuration...' : 'Setup Premier Admin'}
            </button>
          </div>
        </div>
      )}

      {/* Configuration par email (pour les admins) */}
      {adminStatus?.isAdmin && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            Faire Admin par Email
          </h3>
          <p className="text-gray-600 mb-4">
            Configurez un autre utilisateur comme administrateur en utilisant son email.
          </p>
          <form onSubmit={handleSetupByEmail} className="flex gap-3">
            <input
              type="email"
              value={setupEmail}
              onChange={(e) => setSetupEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={setupLoading}
              required
            />
            <button
              type="submit"
              disabled={setupLoading || !setupEmail.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setupLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Configurer
            </button>
          </form>
        </div>
      )}

      {/* Liste des admins */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            Administrateurs Existants ({allAdmins.length})
          </h3>
          <button
            onClick={() => setShowAdminList(!showAdminList)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAdminList ? 'Masquer' : 'Afficher'}
          </button>
        </div>
        
        {showAdminList && (
          <div className="space-y-3">
            {allAdmins.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun administrateur configuré</p>
            ) : (
              allAdmins.map((admin, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{admin.displayName || 'Nom non défini'}</div>
                    <div className="text-sm text-gray-600">{admin.email}</div>
                    <div className="text-xs text-gray-500">
                      Configuré par: {admin.assignedBy} • 
                      {admin.assignedAt && ` ${admin.assignedAt.toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {admin.isActive !== false && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Actif
                      </span>
                    )}
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
        <div className="text-blue-800 space-y-2 text-sm">
          <p>• <strong>Me Faire Admin :</strong> Configure votre compte actuel comme administrateur</p>
          <p>• <strong>Premier Admin :</strong> Configuration automatique recommandée pour le premier administrateur</p>
          <p>• <strong>Admin par Email :</strong> Ajouter d'autres admins (nécessite d'être déjà admin)</p>
          <p>• <strong>Vérification :</strong> Rechargez la page après configuration pour voir les changements</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupComponent;
