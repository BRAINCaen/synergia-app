// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// PAGE ÉQUIPE COMPLÈTE AVEC MESSAGERIE INTERNE ET MENU HAMBURGER
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, Trophy, Star, Zap, Filter, Search, Mail, MessageCircle, 
  Phone, MapPin, Calendar, Award, Target, TrendingUp, Eye, UserPlus,
  Send, X, RefreshCw, Settings, MoreVertical, Heart, Shield, Flame,
  Clock, CheckCircle, AlertCircle, MessageSquare, Video, Plus, Edit
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AU DASHBOARD)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🏢 PAGE ÉQUIPE COMPLÈTE AVEC MESSAGERIE
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // États interface
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // États messagerie
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageRecipient, setMessageRecipient] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * 🚀 CHARGEMENT COMPLET DE L'ÉQUIPE DEPUIS FIREBASE
   */
  useEffect(() => {
    loadAllTeamMembers();
    loadMessagingData();
  }, [user?.uid]);

  const loadAllTeamMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👥 Chargement COMPLET de l\'équipe depuis Firebase...');
      
      // Récupérer TOUS les utilisateurs (pas de limite stricte)
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('gamification.totalXp', 'desc'),
        limit(100) // Augmenter la limite
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = [];
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        
        // Créer un membre d'équipe complet
        const member = {
          id: doc.id,
          uid: doc.id,
          name: cleanDisplayName(userData),
          displayName: cleanDisplayName(userData),
          email: userData.email,
          photoURL: userData.photoURL,
          
          // Données gamification
          totalXp: userData.gamification?.totalXp || userData.totalXp || 0,
          level: userData.gamification?.level || userData.level || 1,
          tasksCompleted: userData.gamification?.tasksCompleted || userData.tasksCompleted || 0,
          badges: userData.gamification?.badges || userData.badges || [],
          
          // Informations profil
          role: userData.profile?.role || userData.role || 'Membre',
          department: userData.profile?.department || userData.department || 'Général',
          position: userData.profile?.position || userData.position || '',
          bio: userData.profile?.bio || userData.bio || '',
          skills: userData.profile?.skills || userData.skills || [],
          
          // Statut et activité
          status: calculateUserStatus(userData),
          lastActivity: userData.gamification?.lastActivityDate || userData.lastActivity,
          joinedAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt) || new Date(),
          isOnline: calculateOnlineStatus(userData),
          
          // Données supplémentaires
          completionRate: calculateCompletionRate(userData),
          averageTaskTime: userData.stats?.averageTaskTime || 0,
          projectsCount: userData.stats?.projectsCount || 0,
          
          // Rôles Synergia
          synergiaRoles: userData.synergiaRoles || [],
          
          source: 'firebase'
        };
        
        allUsers.push(member);
      });
      
      console.log(`✅ ${allUsers.length} utilisateurs chargés depuis Firebase`);
      setTeamMembers(allUsers);
      
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      setError('Erreur lors du chargement de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧹 NETTOYER LES NOMS D'AFFICHAGE
   */
  const cleanDisplayName = (userData) => {
    let name = userData.displayName || userData.profile?.displayName || userData.email || 'Utilisateur';
    
    // Nettoyer les URLs
    if (name.includes('http') || name.includes('www.')) {
      name = userData.email?.split('@')[0] || 'Utilisateur';
    }
    
    // Cas spécifique pour votre email
    if (userData.email === 'alan.boehme61@gmail.com') {
      name = 'Alan Boehme (Admin)';
    }
    
    return name.length > 30 ? name.substring(0, 30) + '...' : name;
  };

  /**
   * 📊 CALCULER LE STATUT UTILISATEUR
   */
  const calculateUserStatus = (userData) => {
    const lastActivity = userData.gamification?.lastActivityDate || userData.lastActivity;
    if (!lastActivity) return 'inactif';
    
    const daysSinceActivity = (new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceActivity < 1) return 'actif';
    if (daysSinceActivity < 7) return 'récent';
    return 'inactif';
  };

  /**
   * 🟢 CALCULER STATUT EN LIGNE
   */
  const calculateOnlineStatus = (userData) => {
    const lastActivity = userData.gamification?.lastActivityDate || userData.lastActivity;
    if (!lastActivity) return false;
    
    const minutesSinceActivity = (new Date() - new Date(lastActivity)) / (1000 * 60);
    return minutesSinceActivity < 15; // En ligne si activité < 15 min
  };

  /**
   * 📈 CALCULER TAUX DE COMPLÉTION
   */
  const calculateCompletionRate = (userData) => {
    const tasksCompleted = userData.gamification?.tasksCompleted || userData.tasksCompleted || 0;
    const tasksCreated = userData.gamification?.tasksCreated || userData.tasksCreated || 0;
    const totalTasks = tasksCompleted + tasksCreated;
    
    if (totalTasks === 0) return 0;
    return Math.round((tasksCompleted / totalTasks) * 100);
  };

  /**
   * 💬 CHARGER DONNÉES MESSAGERIE
   */
  const loadMessagingData = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('💬 Chargement données messagerie...');
      
      // Écouter les messages reçus en temps réel
      const messagesQuery = query(
        collection(db, 'messages'),
        where('toUserId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const userMessages = [];
        let unread = 0;
        
        snapshot.forEach(doc => {
          const messageData = { id: doc.id, ...doc.data() };
          userMessages.push(messageData);
          if (!messageData.read) unread++;
        });
        
        setMessages(userMessages);
        setUnreadCount(unread);
        console.log(`💬 ${userMessages.length} messages chargés, ${unread} non lus`);
      });
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur chargement messagerie:', error);
    }
  };

  /**
   * 📨 ENVOYER UN MESSAGE
   */
  const sendMessage = async (recipientId, messageText, subject = '') => {
    if (!user?.uid || !recipientId || !messageText.trim()) return;
    
    try {
      console.log('📨 Envoi message à:', recipientId);
      
      const messageData = {
        fromUserId: user.uid,
        fromUserName: user.displayName || user.email,
        fromUserEmail: user.email,
        toUserId: recipientId,
        toUserName: teamMembers.find(m => m.id === recipientId)?.name || 'Utilisateur',
        subject: subject.trim() || 'Message direct',
        content: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
        starred: false,
        archived: false,
        messageType: 'direct',
        conversationId: generateConversationId(user.uid, recipientId)
      };
      
      await addDoc(collection(db, 'messages'), messageData);
      
      console.log('✅ Message envoyé avec succès');
      setNewMessage('');
      setShowMessageModal(false);
      
      // Notification de succès
      showNotification('Message envoyé avec succès', 'success');
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      showNotification('Erreur lors de l\'envoi', 'error');
    }
  };

  /**
   * 🆔 GÉNÉRER ID CONVERSATION
   */
  const generateConversationId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `conv_${sortedIds[0]}_${sortedIds[1]}`;
  };

  /**
   * 🔔 AFFICHER NOTIFICATION
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  /**
   * 🔍 FILTRER LES MEMBRES
   */
  const filteredMembers = teamMembers.filter(member => {
    // Filtre recherche
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre département
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    
    // Filtre rôle
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    
    // Filtre statut
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  /**
   * 📊 STATISTIQUES D'ÉQUIPE
   */
  const teamStats = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter(m => m.status === 'actif').length,
    totalXP: teamMembers.reduce((sum, m) => sum + (m.totalXp || 0), 0),
    averageLevel: teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.level || 0), 0) / teamMembers.length)
      : 0,
    onlineMembers: teamMembers.filter(m => m.isOnline).length,
    completionRate: teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.completionRate || 0), 0) / teamMembers.length)
      : 0
  };

  // Départements uniques pour les filtres
  const departments = ['all', ...new Set(teamMembers.map(m => m.department).filter(Boolean))];
  const roles = ['all', ...new Set(teamMembers.map(m => m.role).filter(Boolean))];

  // Statistiques header
  const headerStats = [
    { 
      label: "Membres Total", 
      value: teamStats.totalMembers, 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Membres Actifs", 
      value: teamStats.activeMembers, 
      icon: TrendingUp, 
      color: "text-green-400" 
    },
    { 
      label: "XP Total", 
      value: teamStats.totalXP.toLocaleString(), 
      icon: Zap, 
      color: "text-yellow-400" 
    },
    { 
      label: "Messages", 
      value: `${unreadCount}/${messages.length}`, 
      icon: MessageCircle, 
      color: unreadCount > 0 ? "text-red-400" : "text-gray-400" 
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Récupération de tous les utilisateurs Firebase...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadAllTeamMembers}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Réessayer
              </motion.button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🏆 EN-TÊTE TEAM PAGE AVEC STATS */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Users className="w-8 h-8 text-purple-400" />
                  Mon Équipe
                </h1>
                <p className="text-gray-300">
                  Collaborez et suivez les performances de votre équipe ({teamStats.totalMembers} membres)
                </p>
              </div>
              
              {/* Actions Header */}
              <div className="flex items-center gap-3 mt-4 lg:mt-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMessageModal(true)}
                  className="relative px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadAllTeamMembers}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Inviter
                </motion.button>
              </div>
            </div>

            {/* 📊 STATISTIQUES ÉQUIPE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {headerStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {stat.label}
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 🔍 FILTRES ET RECHERCHE */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filtre département */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'Tous les départements' : dept}
                    </option>
                  ))}
                </select>

                {/* Filtre rôle */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                >
                  {roles.slice(0, 6).map(role => (
                    <option key={role} value={role}>
                      {role === 'all' ? 'Tous les rôles' : role}
                    </option>
                  ))}
                </select>

                {/* Filtre statut */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actifs</option>
                  <option value="récent">Récents</option>
                  <option value="inactif">Inactifs</option>
                </select>

                {/* Bouton reset */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('all');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Résultats filtres */}
              <div className="mt-4 text-sm text-gray-400">
                {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} trouvé{filteredMembers.length !== 1 ? 's' : ''}
                {filteredMembers.length !== teamMembers.length && (
                  <span> sur {teamMembers.length} au total</span>
                )}
              </div>
            </div>
          </div>

          {/* 👥 GRILLE DES MEMBRES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => {
              const isCurrentUser = member.id === user?.uid;
              
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50
                    ${isCurrentUser ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700/50'}
                  `}
                >
                  {/* Badge utilisateur actuel */}
                  {isCurrentUser && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Vous
                    </div>
                  )}

                  {/* Statut en ligne */}
                  <div className="absolute top-3 left-3 flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${
                      member.isOnline ? 'bg-green-500' : 
                      member.status === 'actif' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-xs text-gray-400 capitalize">{member.status}</span>
                  </div>

                  {/* Avatar et infos */}
                  <div className="mt-6 text-center">
                    <div className="relative inline-block mb-4">
                      {member.photoURL ? (
                        <img 
                          src={member.photoURL} 
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white font-bold text-xl">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{member.role}</p>
                    <p className="text-gray-500 text-xs mb-3">{member.department}</p>

                    {/* Statistiques */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-yellow-400">{member.totalXp.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">XP</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">{member.level}</div>
                        <div className="text-xs text-gray-400">Niveau</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">{member.tasksCompleted}</div>
                        <div className="text-xs text-gray-400">Tâches</div>
                      </div>
                    </div>

                    {/* Barre de progression XP */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{Math.min(100, ((member.totalXp || 0) % 1000) / 10).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, ((member.totalXp || 0) % 1000) / 10)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Profil
                      </button>
                      
                      {!isCurrentUser && (
                        <button 
                          onClick={() => {
                            setMessageRecipient(member);
                            setShowMessageModal(true);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {member.email && (
                        <a 
                          href={`mailto:${member.email}`}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded-lg transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Message si aucun membre trouvé */}
          {filteredMembers.length === 0 && teamMembers.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucun membre trouvé</h3>
              <p className="text-gray-400 mb-4">Essayez de modifier vos critères de recherche</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('all');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Réinitialiser les filtres
              </motion.button>
            </div>
          )}

          {/* Résultats */}
          <div className="text-center text-gray-400 mt-8">
            Affichage de {filteredMembers.length} membre(s) sur {teamMembers.length}
          </div>
        </div>
      </div>

      {/* MODAL MESSAGERIE */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {messageRecipient ? `Message à ${messageRecipient.name}` : 'Messagerie Interne'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {messages.length} message{messages.length !== 1 ? 's' : ''}, {unreadCount} non lu{unreadCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Messages existants */}
              {messages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Messages récents</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {messages.slice(0, 5).map(message => (
                      <div key={message.id} className={`p-4 rounded-lg ${message.read ? 'bg-gray-700' : 'bg-blue-900/30'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{message.fromUserName}</span>
                            {!message.read && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Nouveau</span>}
                          </div>
                          <span className="text-xs text-gray-400">
                            {message.timestamp?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-1 font-medium">{message.subject}</p>
                        <p className="text-gray-400 text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouveau message */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  {messageRecipient ? `Nouveau message` : 'Envoyer un message'}
                </h4>
                
                {/* Sélection destinataire */}
                {!messageRecipient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Destinataire</label>
                    <select
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      onChange={(e) => {
                        const selected = teamMembers.find(m => m.id === e.target.value);
                        setMessageRecipient(selected);
                      }}
                    >
                      <option value="">Choisir un destinataire...</option>
                      {teamMembers.filter(m => m.id !== user?.uid).map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (messageRecipient && newMessage.trim()) {
                        sendMessage(messageRecipient.id, newMessage, 'Message direct');
                      }
                    }}
                    disabled={!messageRecipient || !newMessage.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PROFIL MEMBRE */}
      <AnimatePresence>
        {showMemberModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMemberModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {selectedMember.photoURL ? (
                    <img 
                      src={selectedMember.photoURL} 
                      alt={selectedMember.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {selectedMember.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedMember.name}</h3>
                    <p className="text-gray-400">{selectedMember.role} • {selectedMember.department}</p>
                    <p className="text-gray-500 text-sm">{selectedMember.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{selectedMember.totalXp.toLocaleString()}</div>
                  <div className="text-gray-400">XP Total</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{selectedMember.level}</div>
                  <div className="text-gray-400">Niveau</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{selectedMember.tasksCompleted}</div>
                  <div className="text-gray-400">Tâches</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{selectedMember.badges?.length || 0}</div>
                  <div className="text-gray-400">Badges</div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Informations</h4>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Statut :</span>
                      <span className={`capitalize ${
                        selectedMember.status === 'actif' ? 'text-green-400' :
                        selectedMember.status === 'récent' ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {selectedMember.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Taux de complétion :</span>
                      <span className="text-white">{selectedMember.completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Membre depuis :</span>
                      <span className="text-white">{selectedMember.joinedAt.toLocaleDateString()}</span>
                    </div>
                    {selectedMember.lastActivity && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dernière activité :</span>
                        <span className="text-white">
                          {new Date(selectedMember.lastActivity).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rôles Synergia */}
                {selectedMember.synergiaRoles?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Rôles Synergia</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.synergiaRoles.map((role, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                          {role.roleName || role.roleId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {selectedMember.id !== user?.uid && (
                    <button
                      onClick={() => {
                        setMessageRecipient(selectedMember);
                        setShowMemberModal(false);
                        setShowMessageModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Envoyer un message
                    </button>
                  )}
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="text-gray-400 font-mono text-sm mb-2">Debug Info:</h4>
          <pre className="text-xs text-gray-500">
            {JSON.stringify({ 
              totalUsers: teamMembers.length,
              filteredUsers: filteredMembers.length,
              messagesCount: messages.length,
              unreadCount,
              departments: departments.length - 1, // -1 pour "all"
              roles: roles.length - 1
            }, null, 2)}
          </pre>
        </div>
      )}
    </Layout>
  );
};

export default TeamPage;
