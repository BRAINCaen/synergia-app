// ==========================================
// react-app/src/pages/TavernePage.jsx
// 🍺 TAVERNE - ESPACE SOCIAL INTERACTIF
// Messagerie + Boosts + Interactions sociales
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Beer, MessageCircle, Zap, Send, Inbox, Users, TrendingUp, Clock,
  Filter, RefreshCw, Search, X, Heart, Sparkles, Star, Trophy,
  MessageSquare, UserPlus, Crown, Flame, Coffee, PartyPopper
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import UserAvatar from '../components/common/UserAvatar.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { boostService, BOOST_TYPES } from '../core/services/boostService.js';
import { BoostButton } from '../components/boost';
import notificationService from '../core/services/notificationService.js';
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
  doc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🍺 PAGE TAVERNE - ESPACE SOCIAL
 */
const TavernePage = () => {
  const { user } = useAuthStore();

  // Onglet principal
  const [activeSection, setActiveSection] = useState('messages'); // 'messages' | 'boosts' | 'activity'

  // États messagerie
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // États boosts
  const [boostsReceived, setBoostsReceived] = useState([]);
  const [boostsSent, setBoostsSent] = useState([]);
  const [boostStats, setBoostStats] = useState(null);
  const [boostTab, setBoostTab] = useState('received');
  const [filterType, setFilterType] = useState('all');
  const [showSendBoostModal, setShowSendBoostModal] = useState(false);
  const [boostSearchTerm, setBoostSearchTerm] = useState('');

  // États équipe (pour envoyer des messages)
  const [teamMembers, setTeamMembers] = useState([]);

  // États généraux
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 Chargement initial
  useEffect(() => {
    if (!user?.uid) return;
    loadAllData();
  }, [user?.uid]);

  // 📬 Listener temps réel pour les messages
  useEffect(() => {
    if (!user?.uid) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = [];
      let unread = 0;
      const conversationsMap = new Map();

      snapshot.forEach((doc) => {
        const messageData = { id: doc.id, ...doc.data() };
        messagesData.push(messageData);

        if (!messageData.read && messageData.recipientId === user.uid) {
          unread++;
        }

        const otherUserId = messageData.senderId === user.uid
          ? messageData.recipientId
          : messageData.senderId;

        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            userName: messageData.senderId === user.uid
              ? messageData.recipientName
              : messageData.senderName,
            userPhoto: messageData.senderId === user.uid
              ? messageData.recipientPhoto
              : messageData.senderPhoto,
            lastMessage: messageData.content,
            lastMessageDate: messageData.createdAt,
            unreadCount: 0,
            messages: []
          });
        }

        const conv = conversationsMap.get(otherUserId);
        conv.messages.push(messageData);

        if (!messageData.read && messageData.recipientId === user.uid) {
          conv.unreadCount++;
        }
      });

      setMessages(messagesData);
      setUnreadCount(unread);
      setConversations(Array.from(conversationsMap.values()).sort((a, b) => {
        const aTime = a.lastMessageDate?.toDate?.() || new Date(a.lastMessageDate);
        const bTime = b.lastMessageDate?.toDate?.() || new Date(b.lastMessageDate);
        return bTime - aTime;
      }));
    });

    return () => unsubscribe();
  }, [user?.uid]);

  /**
   * 📊 Charger toutes les données
   */
  const loadAllData = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      await Promise.all([
        loadBoostData(),
        loadTeamMembers()
      ]);
    } catch (error) {
      console.error('❌ [TAVERNE] Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⚡ Charger les données de boosts
   */
  const loadBoostData = async () => {
    if (!user?.uid) return;

    try {
      const [received, sent, stats] = await Promise.all([
        boostService.getUserBoostsReceived(user.uid, 100),
        boostService.getUserBoostsSent(user.uid, 100),
        boostService.getBoostStats(user.uid)
      ]);

      setBoostsReceived(received);
      setBoostsSent(sent);
      setBoostStats(stats);

      if (received.some(b => !b.read)) {
        await boostService.markAllBoostsAsRead(user.uid);
      }
    } catch (error) {
      console.error('❌ [TAVERNE] Erreur chargement boosts:', error);
    }
  };

  /**
   * 👥 Charger les membres de l'équipe
   */
  const loadTeamMembers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('displayName', 'asc'),
        limit(100)
      );

      const snapshot = await getDocs(usersQuery);
      const members = [];

      snapshot.forEach((doc) => {
        if (doc.id !== user?.uid) {
          const data = doc.data();
          members.push({
            id: doc.id,
            name: data.displayName || data.name || data.email?.split('@')[0] || 'Inconnu',
            email: data.email || '',
            photoURL: data.photoURL || null,
            role: data.role || 'Membre',
            isOnline: data.isOnline || false
          });
        }
      });

      setTeamMembers(members);
    } catch (error) {
      console.error('❌ [TAVERNE] Erreur chargement équipe:', error);
    }
  };

  /**
   * 🔄 Rafraîchir les données
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  /**
   * ✉️ Envoyer un message
   */
  const handleSendMessage = async (recipientId, recipientName) => {
    if (!newMessage.trim() || !recipientId) return;

    try {
      const messageContent = newMessage;
      const docRef = await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderPhoto: user.photoURL || null,
        recipientId: recipientId,
        recipientName: recipientName,
        recipientPhoto: teamMembers.find(m => m.id === recipientId)?.photoURL || null,
        content: messageContent,
        participants: [user.uid, recipientId],
        read: false,
        createdAt: serverTimestamp()
      });

      // Envoyer une notification au destinataire
      await notificationService.notifyMessageReceived(recipientId, {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderPhoto: user.photoURL || null,
        messagePreview: messageContent,
        conversationId: docRef.id
      });

      setNewMessage('');
      showNotification('Message envoyé !', 'success');
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      showNotification('Erreur lors de l\'envoi', 'error');
    }
  };

  /**
   * ✅ Marquer les messages comme lus
   */
  const markConversationAsRead = async (conversationUserId) => {
    const unreadMessages = messages.filter(
      m => m.senderId === conversationUserId &&
           m.recipientId === user.uid &&
           !m.read
    );

    for (const msg of unreadMessages) {
      try {
        await updateDoc(doc(db, 'messages', msg.id), { read: true });
      } catch (error) {
        console.error('Erreur marquage lu:', error);
      }
    }
  };

  /**
   * 📢 Notification
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg transition-opacity duration-300 z-50 ${
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
   * 📅 Formater la date
   */
  const formatDate = (date) => {
    if (!date) return '';
    const d = date?.toDate?.() || new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // Filtrer les boosts
  const filteredBoosts = useMemo(() => {
    const boosts = boostTab === 'received' ? boostsReceived : boostsSent;
    if (filterType === 'all') return boosts;
    return boosts.filter(b => b.type === filterType);
  }, [boostTab, boostsReceived, boostsSent, filterType]);

  // Filtrer les membres pour nouveau message
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return teamMembers;
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamMembers, searchTerm]);

  // Filtrer les membres pour envoi de boost
  const filteredBoostMembers = useMemo(() => {
    if (!boostSearchTerm) return teamMembers;
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(boostSearchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(boostSearchTerm.toLowerCase())
    );
  }, [teamMembers, boostSearchTerm]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-4 animate-bounce">🍺</div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-amber-200 text-lg font-medium">Ouverture de la Taverne...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-yellow-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">

          {/* 🍺 HEADER TAVERNE */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="p-3 sm:p-4 bg-gradient-to-br from-amber-500/30 to-orange-600/30 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-lg shadow-amber-500/20"
                >
                  <Beer className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    La Taverne
                  </h1>
                  <p className="text-amber-200/60 text-sm sm:text-base mt-0.5">
                    Lieu de rencontre et d'echange entre aventuriers
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 sm:p-3 text-amber-300 hover:text-amber-200 bg-white/5 hover:bg-white/10 border border-amber-500/20 rounded-xl transition-all disabled:opacity-50"
                title="Rafraichir"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </motion.button>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/20 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-white">{conversations.length}</p>
                    <p className="text-xs sm:text-sm text-gray-400">Conversations</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="mt-2 text-xs text-blue-400 font-medium">
                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                  </div>
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/20 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-white">{boostStats?.totalReceived || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-400">Boosts recus</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/20 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-white">+{boostStats?.xpFromBoosts || 0}</p>
                    <p className="text-xs sm:text-sm text-gray-400">XP gagnes</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 📑 ONGLETS PRINCIPAUX */}
          <div className="flex gap-2 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 mb-6">
            <button
              onClick={() => setActiveSection('messages')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                activeSection === 'messages'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Messages</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px]">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection('boosts')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                activeSection === 'boosts'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Boosts</span>
            </button>
            <button
              onClick={() => setActiveSection('activity')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                activeSection === 'activity'
                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Activite</span>
            </button>
          </div>

          {/* 💬 SECTION MESSAGES */}
          <AnimatePresence mode="wait">
            {activeSection === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Actions messages */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Conversations
                  </h2>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/25"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Nouveau message</span>
                  </button>
                </div>

                {/* Liste des conversations */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  {conversations.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center">
                      <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">Aucune conversation</p>
                      <p className="text-gray-500 text-sm">
                        Commencez a discuter avec vos collegues !
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {conversations.map((conv) => (
                        <motion.div
                          key={conv.userId}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          onClick={() => {
                            setSelectedConversation(conv);
                            markConversationAsRead(conv.userId);
                          }}
                          className="p-4 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative">
                              {conv.userPhoto ? (
                                <img
                                  src={conv.userPhoto}
                                  alt={conv.userName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                  {conv.userName?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {conv.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {conv.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium truncate">{conv.userName}</span>
                                <span className="text-gray-500 text-xs">{formatDate(conv.lastMessageDate)}</span>
                              </div>
                              <p className="text-gray-400 text-sm truncate">{conv.lastMessage}</p>
                            </div>
                            <MessageCircle className="w-5 h-5 text-gray-600 shrink-0" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ⚡ SECTION BOOSTS */}
            {activeSection === 'boosts' && (
              <motion.div
                key="boosts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Bouton envoyer un boost */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Boosts
                  </h2>
                  <button
                    onClick={() => setShowSendBoostModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl transition-all shadow-lg shadow-yellow-500/25"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Envoyer un Boost</span>
                  </button>
                </div>

                {/* Stats boosts par type */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Boosts recus par type
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {Object.values(BOOST_TYPES).map((type) => (
                      <motion.div
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all"
                      >
                        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{type.emoji}</div>
                        <div className="text-xs sm:text-sm text-gray-400">{type.label}</div>
                        <div className="text-lg sm:text-xl font-bold text-white mt-1">
                          {boostStats?.receivedByType?.[type.id] || 0}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Onglets boosts */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setBoostTab('received')}
                      className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                        boostTab === 'received'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Inbox size={16} />
                      Recus ({boostsReceived.length})
                    </button>
                    <button
                      onClick={() => setBoostTab('sent')}
                      className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
                        boostTab === 'sent'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Send size={16} />
                      Envoyes ({boostsSent.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Filter size={14} className="text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="flex-1 sm:flex-initial bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 transition-all"
                    >
                      <option value="all" className="bg-slate-900">Tous les types</option>
                      {Object.values(BOOST_TYPES).map((type) => (
                        <option key={type.id} value={type.id} className="bg-slate-900">
                          {type.emoji} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Liste des boosts */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  {filteredBoosts.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center">
                      <div className="text-4xl sm:text-6xl mb-4">
                        {boostTab === 'received' ? '📭' : '📤'}
                      </div>
                      <p className="text-gray-400 text-sm sm:text-lg">
                        {boostTab === 'received'
                          ? 'Aucun Boost recu pour le moment'
                          : 'Vous n\'avez pas encore envoye de Boost'
                        }
                      </p>
                      {boostTab === 'sent' && (
                        <p className="text-gray-500 text-xs sm:text-sm mt-2">
                          Rendez-vous sur la page Equipe pour envoyer des Boosts !
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {filteredBoosts.map((boost, index) => (
                        <motion.div
                          key={boost.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="p-3 sm:p-4 hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg sm:text-xl font-bold text-white flex-shrink-0">
                              {boostTab === 'received'
                                ? (boost.fromUserName?.charAt(0) || '?')
                                : (boost.toUserName?.charAt(0) || '?')
                              }
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                <span className="text-xl sm:text-2xl">{boost.typeInfo?.emoji || BOOST_TYPES[boost.type]?.emoji}</span>
                                <span className="font-semibold text-white text-sm sm:text-base">
                                  {boostTab === 'received'
                                    ? boost.fromUserName
                                    : boost.toUserName
                                  }
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r ${boost.typeInfo?.color || BOOST_TYPES[boost.type]?.color} text-white`}>
                                  {boost.typeInfo?.label || BOOST_TYPES[boost.type]?.label}
                                </span>
                              </div>

                              {boost.message && (
                                <p className="text-gray-300 text-xs sm:text-sm mb-2 italic line-clamp-2">
                                  "{boost.message}"
                                </p>
                              )}

                              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                                <span className="text-gray-500 flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatDate(boost.createdAt)}
                                </span>
                                <span className={`font-medium ${boostTab === 'received' ? 'text-green-400' : 'text-blue-400'}`}>
                                  +{boostTab === 'received' ? boost.xpAwarded : boost.xpGiven} XP
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 💖 SECTION ACTIVITE */}
            {activeSection === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-pink-400" />
                  Activite recente
                </h2>

                {/* Feed d'activite */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Combiner messages et boosts recents */}
                    {[...boostsReceived.slice(0, 5), ...messages.slice(0, 5)]
                      .sort((a, b) => {
                        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
                        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
                        return bTime - aTime;
                      })
                      .slice(0, 10)
                      .map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-xl"
                        >
                          <div className={`p-2 rounded-lg ${
                            item.type ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                          }`}>
                            {item.type ? (
                              <Zap className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <MessageCircle className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm">
                              {item.type ? (
                                <>
                                  <span className="font-medium">{item.fromUserName}</span>
                                  {' '}vous a envoye un boost {item.typeInfo?.emoji || BOOST_TYPES[item.type]?.emoji}
                                </>
                              ) : (
                                <>
                                  <span className="font-medium">{item.senderName}</span>
                                  {' '}: {item.content?.substring(0, 50)}...
                                </>
                              )}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">{formatDate(item.createdAt)}</p>
                          </div>
                        </motion.div>
                      ))
                    }

                    {boostsReceived.length === 0 && messages.length === 0 && (
                      <div className="text-center py-8">
                        <Coffee className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Aucune activite recente</p>
                        <p className="text-gray-500 text-sm mt-1">C'est calme a la Taverne...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Actions rapides
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowNewMessageModal(true)}
                      className="flex items-center justify-center gap-2 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-blue-400 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Envoyer un message</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSection('boosts');
                      }}
                      className="flex items-center justify-center gap-2 p-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl text-yellow-400 transition-all"
                    >
                      <Zap className="w-5 h-5" />
                      <span className="text-sm font-medium">Voir les Boosts</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 💬 MODAL CONVERSATION */}
        <AnimatePresence>
          {selectedConversation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
              onClick={() => setSelectedConversation(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border-t sm:border border-white/10 sm:rounded-2xl w-full sm:max-w-2xl h-[85vh] sm:h-auto sm:max-h-[80vh] flex flex-col"
              >
                {/* Header conversation */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    {selectedConversation.userPhoto ? (
                      <img
                        src={selectedConversation.userPhoto}
                        alt={selectedConversation.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedConversation.userName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-medium">{selectedConversation.userName}</h3>
                      <p className="text-gray-500 text-xs">Conversation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedConversation.messages
                    .sort((a, b) => {
                      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
                      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
                      return aTime - bTime;
                    })
                    .map((message) => {
                      const isOwn = message.senderId === user.uid;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl p-3 ${
                            isOwn
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'bg-white/10 text-gray-100'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Input message */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newMessage.trim()) {
                          handleSendMessage(selectedConversation.userId, selectedConversation.userName);
                        }
                      }}
                      placeholder="Votre message..."
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSendMessage(selectedConversation.userId, selectedConversation.userName)}
                      disabled={!newMessage.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📝 MODAL NOUVEAU MESSAGE */}
        <AnimatePresence>
          {showNewMessageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowNewMessageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    Nouveau message
                  </h3>
                  <button
                    onClick={() => setShowNewMessageModal(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher un collegue..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <div className="space-y-2">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setSelectedConversation({
                            userId: member.id,
                            userName: member.name,
                            userPhoto: member.photoURL,
                            messages: messages.filter(
                              m => m.senderId === member.id || m.recipientId === member.id
                            )
                          });
                          setShowNewMessageModal(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
                      >
                        <UserAvatar
                          user={member}
                          size="md"
                          showBorder={true}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{member.name}</p>
                          <p className="text-gray-500 text-sm truncate">{member.role}</p>
                        </div>
                        {member.isOnline && (
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        )}
                      </button>
                    ))}

                    {filteredMembers.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        Aucun membre trouve
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ⚡ MODAL ENVOYER UN BOOST */}
        <AnimatePresence>
          {showSendBoostModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowSendBoostModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Envoyer un Boost
                  </h3>
                  <button
                    onClick={() => setShowSendBoostModal(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={boostSearchTerm}
                      onChange={(e) => setBoostSearchTerm(e.target.value)}
                      placeholder="Rechercher un collegue..."
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <div className="space-y-3">
                    {filteredBoostMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <UserAvatar
                            user={member}
                            size="md"
                            showBorder={true}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{member.name}</p>
                            <p className="text-gray-500 text-sm truncate">{member.role}</p>
                          </div>
                        </div>
                        <BoostButton
                          targetUser={{
                            uid: member.id,
                            displayName: member.name,
                            email: member.email,
                            photoURL: member.photoURL
                          }}
                          currentUser={{
                            uid: user?.uid,
                            displayName: user?.displayName || user?.email,
                            email: user?.email,
                            photoURL: user?.photoURL
                          }}
                          variant="small"
                          className="w-full justify-center"
                          onBoostSent={(result) => {
                            showNotification(result.message, 'success');
                            loadBoostData();
                            setShowSendBoostModal(false);
                          }}
                        />
                      </div>
                    ))}

                    {filteredBoostMembers.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        Aucun membre trouve
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default TavernePage;
