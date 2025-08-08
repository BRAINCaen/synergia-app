// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// TEAM PAGE CORRIGÉE - SYNCHRONISATION FIREBASE RÉELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Star,
  Crown,
  Shield,
  Zap,
  Target,
  MessageSquare,
  Video,
  MoreHorizontal,
  UserPlus,
  Settings,
  Edit,
  Trash2,
  Eye,
  Heart,
  Coffee,
  Brain,
  Rocket,
  Trophy,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

// Firebase
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 👥 PAGE ÉQUIPE AVEC SYNCHRONISATION FIREBASE RÉELLE
 * Corrige le problème des données aléatoires qui changent à chaque rafraîchissement
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [lastSync, setLastSync] = useState(null);

  console.log('👥 TeamPage rendue pour:', user?.email);

  // ==========================================
  // 🔄 SYNCHRONISATION FIREBASE TEMPS RÉEL
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 Initialisation synchronisation temps réel...');
    let unsubscribes = [];

    const initializeSync = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Charger les données utilisateur actuelles
        await loadCurrentUserData();

        // 2. Écouter tous les utilisateurs enregistrés
        const usersUnsubscribe = listenToAllUsers();
        unsubscribes.push(usersUnsubscribe);

        // 3. Écouter les membres d'équipe spécifiques
        const teamUnsubscribe = listenToTeamMembers();
        unsubscribes.push(teamUnsubscribe);

        setLastSync(new Date());
        
      } catch (error) {
        console.error('❌ Erreur initialisation sync:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeSync();

    // Cleanup
    return () => {
      unsubscribes.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [user?.uid]);

  // ==========================================
  // 📡 LISTENERS FIREBASE TEMPS RÉEL
  // ==========================================

  const loadCurrentUserData = async () => {
    try {
      if (!user?.uid) return;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ Données utilisateur chargées:', userData.gamification);
        
        // Ajouter l'utilisateur actuel à l'équipe
        const currentUserMember = formatUserToMember(user.uid, userData, user);
        setTeamMembers(prev => {
          const exists = prev.find(m => m.id === user.uid);
          if (exists) return prev;
          return [currentUserMember, ...prev];
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur actuel:', error);
    }
  };

  const listenToAllUsers = () => {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('gamification.totalXp', 'desc')
    );

    return onSnapshot(usersQuery, (snapshot) => {
      const users = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;
        
        // Créer un membre à partir des données utilisateur
        const member = formatUserToMember(userId, userData);
        users.push(member);
      });

      console.log(`📡 ${users.length} utilisateurs synchronisés depuis Firebase`);
      setTeamMembers(users);
      setLastSync(new Date());
    }, (error) => {
      console.error('❌ Erreur écoute utilisateurs:', error);
      setError(error.message);
    });
  };

  const listenToTeamMembers = () => {
    try {
      const teamQuery = query(
        collection(db, 'teamMembers'),
        where('status', '==', 'active'),
        orderBy('teamStats.totalXp', 'desc')
      );

      return onSnapshot(teamQuery, (snapshot) => {
        const members = [];
        
        snapshot.forEach((doc) => {
          const memberData = doc.data();
          members.push({
            id: doc.id,
            ...memberData,
            isTeamMember: true
          });
        });

        if (members.length > 0) {
          console.log(`📡 ${members.length} membres d'équipe synchronisés`);
          // Fusionner avec les utilisateurs existants
          setTeamMembers(prev => {
            const merged = [...prev];
            members.forEach(member => {
              const index = merged.findIndex(m => m.id === member.id);
              if (index >= 0) {
                merged[index] = { ...merged[index], ...member };
              } else {
                merged.push(member);
              }
            });
            return merged;
          });
        }
      }, (error) => {
        console.warn('⚠️ Pas de collection teamMembers ou erreur:', error.message);
      });
    } catch (error) {
      console.warn('⚠️ Collection teamMembers non disponible');
      return () => {}; // Return empty cleanup function
    }
  };

  // ==========================================
  // 🔄 FORMATAGE DES DONNÉES UTILISATEUR
  // ==========================================

  const formatUserToMember = (userId, userData, authUser = null) => {
    const gamification = userData.gamification || {};
    const profile = userData.profile || {};
    
    // ✅ CALCUL DÉTERMINISTE DE L'EFFICACITÉ (pas de Math.random)
    const baseEfficiency = Math.min(95, Math.max(65, 
      70 + (gamification.level || 1) * 2 + (gamification.tasksCompleted || 0) * 0.5
    ));
    
    return {
      id: userId,
      name: authUser?.displayName || userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
      email: authUser?.email || userData.email || 'email@example.com',
      role: profile.role || 'Membre',
      department: profile.department || 'Équipe Synergia',
      avatar: authUser?.photoURL || userData.photoURL || profile.avatar || '👤',
      status: userData.presence?.status || 'offline',
      isCurrentUser: userId === user?.uid,
      joinDate: userData.createdAt?.toDate?.() || new Date(userData.createdAt) || new Date(),
      
      // ✅ STATISTIQUES RÉELLES DEPUIS FIREBASE (pas aléatoires)
      stats: {
        tasksCompleted: gamification.tasksCompleted || 0,
        projectsActive: gamification.projectsActive || 0,
        xp: gamification.totalXp || 0,
        level: gamification.level || 1,
        efficiency: Math.round(baseEfficiency) // ✅ Déterministe basé sur les vraies données
      },
      
      skills: profile.skills || [],
      bio: profile.bio || 'Membre de l\'équipe Synergia',
      lastActive: userData.lastActivity?.toDate?.() || new Date(userData.lastActivity) || new Date(),
      badges: gamification.badges || [],
      
      // Données complètes Firebase
      gamification: gamification,
      profile: profile,
      
      // Métadonnées de synchronisation
      syncedAt: new Date(),
      dataSource: 'firebase'
    };
  };

  // ==========================================
  // 🔍 FILTRAGE ET RECHERCHE
  // ==========================================

  useEffect(() => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [teamMembers, searchTerm, roleFilter]);

  // ==========================================
  // 🎨 UTILITAIRES D'AFFICHAGE
  // ==========================================

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'admin': return Crown;
      case 'manager': return Shield;
      case 'lead': return Star;
      case 'membre': return Users;
      default: return Users;
    }
  };

  const forceRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loadCurrentUserData();
      setLastSync(new Date());
      console.log('🔄 Actualisation forcée terminée');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🎨 INTERFACE UTILISATEUR
  // ==========================================

  if (loading && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Synchronisation des données d'équipe...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ==========================================
            📊 HEADER AVEC STATISTIQUES
            ========================================== */}
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Équipe Synergia
              </h1>
              <p className="text-gray-400 text-lg">
                {teamMembers.length} membre{teamMembers.length > 1 ? 's' : ''} • Synchronisé avec Firebase
              </p>
              {lastSync && (
                <p className="text-xs text-gray-500 mt-1">
                  Dernière sync: {lastSync.toLocaleTimeString('fr-FR')}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <button
                onClick={forceRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Inviter un membre
              </button>
            </div>
          </div>

          {/* Statistiques de l'équipe */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Membres</p>
                  <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">XP Total</p>
                  <p className="text-2xl font-bold text-white">
                    {teamMembers.reduce((sum, m) => sum + (m.stats.xp || 0), 0).toLocaleString()}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tâches Réalisées</p>
                  <p className="text-2xl font-bold text-white">
                    {teamMembers.reduce((sum, m) => sum + (m.stats.tasksCompleted || 0), 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Niveau Moyen</p>
                  <p className="text-2xl font-bold text-white">
                    {teamMembers.length > 0 ? 
                      Math.round(teamMembers.reduce((sum, m) => sum + (m.stats.level || 1), 0) / teamMembers.length) 
                      : 0
                    }
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            🔍 BARRE DE RECHERCHE ET FILTRES
            ========================================== */}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre par rôle */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Lead">Lead</option>
              <option value="Membre">Membre</option>
            </select>

            {/* Toggle vue */}
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ==========================================
            ❌ GESTION DES ERREURS
            ========================================== */}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Erreur de synchronisation</span>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
              <button 
                onClick={forceRefresh}
                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Réessayer
              </button>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            👥 GRILLE/LISTE DES MEMBRES
            ========================================== */}
        
        {filteredMembers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Aucun membre trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || roleFilter !== 'all' 
                ? 'Ajustez vos filtres de recherche' 
                : 'L\'équipe se chargera automatiquement depuis Firebase'
              }
            </p>
            {searchTerm || roleFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Réinitialiser les filtres
              </button>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 
                  hover:border-gray-600 transition-all duration-300 group
                  ${viewMode === 'grid' 
                    ? 'p-6 hover:transform hover:scale-[1.02]' 
                    : 'p-4 flex items-center gap-4'
                  }
                `}
              >
                {/* Avatar et informations principales */}
                <div className={`flex items-center gap-4 ${viewMode === 'grid' ? 'mb-4' : ''}`}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(member.status)}`}></div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      {member.name}
                      {member.isCurrentUser && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Vous</span>
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      {(() => {
                        const RoleIcon = getRoleIcon(member.role);
                        return <RoleIcon className="w-3 h-3" />;
                      })()}
                      {member.role} • {member.department}
                    </p>
                  </div>
                </div>

                {/* Statistiques */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">{member.stats.level}</div>
                      <div className="text-xs text-gray-500">Niveau</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{member.stats.xp.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{member.stats.tasksCompleted}</div>
                      <div className="text-xs text-gray-500">Tâches</div>
                    </div>
                  </div>
                )}

                {/* Barre de progression et efficacité */}
                <div className={viewMode === 'grid' ? 'mb-4' : 'flex-1 mx-4'}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Efficacité</span>
                    <span>{member.stats.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${member.stats.efficiency}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'justify-between' : ''}`}>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded-lg transition-colors">
                    <Eye className="w-3 h-3" />
                    <span>Voir profil</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Métadonnées de synchronisation (debug) */}
                {member.syncedAt && (
                  <div className="mt-2 text-xs text-gray-600">
                    Sync: {member.syncedAt.toLocaleTimeString('fr-FR')}
                    {member.dataSource && ` • Source: ${member.dataSource}`}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal d'invitation (placeholder) */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Inviter un membre</h3>
              <p className="text-gray-400 mb-4">
                Les nouveaux membres seront automatiquement synchronisés depuis Firebase lors de leur première connexion.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
