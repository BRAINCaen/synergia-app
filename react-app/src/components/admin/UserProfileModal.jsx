// ==========================================
// 📁 react-app/src/components/admin/UserProfileModal.jsx
// MODAL POUR VOIR LE PROFIL COMPLET D'UN UTILISATEUR
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  Award, 
  Star,
  Clock,
  MapPin,
  Phone,
  Briefcase
} from 'lucide-react';
import { adminBadgeService } from '../../core/services/adminBadgeService.js';

/**
 * 👤 MODAL PROFIL UTILISATEUR COMPLET
 */
const UserProfileModal = ({ isOpen, user, onClose }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadUserDetails();
    }
  }, [isOpen, user]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      // Charger les détails complets de l'utilisateur
      const details = await adminBadgeService.getUserDetailedProfile(user.id);
      setUserDetails(details);
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
      // Utiliser les données de base si erreur
      setUserDetails(user);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Non défini';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateLevel = (xp) => {
    return Math.floor(xp / 100) + 1;
  };

  const getXPProgress = (xp) => {
    const currentLevelXP = xp % 100;
    return (currentLevelXP / 100) * 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil Utilisateur
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement du profil...</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Informations principales */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {(userDetails?.displayName || userDetails?.email || 'U')[0].toUpperCase()}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900">
                    {userDetails?.displayName || 'Nom non défini'}
                  </h3>
                  
                  <p className="text-gray-600 flex items-center justify-center gap-1">
                    <Mail className="w-4 h-4" />
                    {userDetails?.email}
                  </p>
                </div>

                {/* Statistiques de gamification */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Progression
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {calculateLevel(userDetails?.xp || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Niveau</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {userDetails?.xp || 0}
                      </p>
                      <p className="text-sm text-gray-600">XP Total</p>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression niveau</span>
                      <span>{Math.round(getXPProgress(userDetails?.xp || 0))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getXPProgress(userDetails?.xp || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Badges obtenus */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Badges ({(userDetails?.badges || []).length})
                  </h4>
                  
                  {(userDetails?.badges || []).length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {(userDetails.badges || []).slice(0, 6).map((badge, index) => (
                        <div 
                          key={index}
                          className="bg-white border rounded-lg p-2 text-center hover:shadow-md transition-shadow"
                          title={badge.description}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mx-auto mb-1">
                            🏆
                          </div>
                          <p className="text-xs text-gray-600 truncate">{badge.name}</p>
                        </div>
                      ))}
                      {(userDetails.badges || []).length > 6 && (
                        <div className="bg-gray-100 border rounded-lg p-2 text-center flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            +{(userDetails.badges || []).length - 6} autres
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Aucun badge obtenu pour le moment
                    </p>
                  )}
                </div>

                {/* Informations détaillées */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Informations détaillées</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Membre depuis :</span>
                      <span className="font-medium">{formatDate(userDetails?.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Dernière activité :</span>
                      <span className="font-medium">{formatDate(userDetails?.lastLoginAt)}</span>
                    </div>
                    
                    {userDetails?.department && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Département :</span>
                        <span className="font-medium">{userDetails.department}</span>
                      </div>
                    )}
                    
                    {userDetails?.role && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Rôle :</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userDetails.role === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : userDetails.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userDetails.role}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfileModal;
