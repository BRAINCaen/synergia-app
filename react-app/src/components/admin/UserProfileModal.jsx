// ==========================================
// 📁 react-app/src/components/admin/UserProfileModal.jsx
// MODAL POUR VOIR LE PROFIL COMPLET D'UN UTILISATEUR
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Briefcase,
  Shield,
  Zap,
  Users,
  Activity
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLevelFromXP = (xp) => {
    if (!xp) return 1;
    return Math.floor(xp / 100) + 1;
  };

  const getXPForNextLevel = (xp) => {
    const currentLevel = getLevelFromXP(xp);
    return currentLevel * 100;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-purple-100 text-purple-800',
      leader: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {userDetails?.displayName?.[0] || userDetails?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userDetails?.displayName || userDetails?.email || 'Utilisateur'}
                </h2>
                <p className="text-gray-600">{userDetails?.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement du profil...</span>
            </div>
          ) : (
            <div className="p-6 space-y-6">

              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Statistiques principales */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Progression
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Niveau</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {getLevelFromXP(userDetails?.xp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">XP Total</span>
                      <span className="text-xl font-semibold text-gray-900">
                        {userDetails?.xp || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Prochain niveau</span>
                      <span className="text-lg text-gray-700">
                        {getXPForNextLevel(userDetails?.xp || 0)} XP
                      </span>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((userDetails?.xp || 0) % 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Informations du profil */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Informations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </span>
                      <span className="text-gray-900 font-medium">
                        {userDetails?.email || 'Non défini'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Rôle
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userDetails?.role || 'member')}`}>
                        {userDetails?.role || userDetails?.profile?.role || 'Membre'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Inscrit le
                      </span>
                      <span className="text-gray-900">
                        {formatDate(userDetails?.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Dernière activité
                      </span>
                      <span className="text-gray-900">
                        {formatDate(userDetails?.lastActivity || userDetails?.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Badges ({userDetails?.badges?.length || 0})
                </h3>
                
                {userDetails?.badges?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {userDetails.badges.map((badge, index) => (
                      <div key={index} className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                          {badge.icon || '🏆'}
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {badge.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(badge.awardedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun badge obtenu</p>
                  </div>
                )}
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {userDetails?.stats?.tasksCompleted || 0}
                  </p>
                  <p className="text-sm text-blue-800">Tâches terminées</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {userDetails?.stats?.projectsParticipated || 0}
                  </p>
                  <p className="text-sm text-green-800">Projets</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {userDetails?.stats?.streak || 0}
                  </p>
                  <p className="text-sm text-purple-800">Jours consécutifs</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-orange-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {userDetails?.stats?.averageRating || 0}
                  </p>
                  <p className="text-sm text-orange-800">Note moyenne</p>
                </div>
              </div>

              {/* Activité récente */}
              {userDetails?.recentActivity?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-600" />
                    Activité récente
                  </h3>
                  <div className="space-y-3">
                    {userDetails.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfileModal;
