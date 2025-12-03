// ==========================================
// 📁 react-app/src/components/layout/Layout.jsx
// LAYOUT PRINCIPAL SYNERGIA - NOTIFICATIONS CORRIGÉES
// ✅ FIX: Timestamps Firestore + Callbacks + Try/Catch
// ==========================================

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Target, Trophy, Users, BarChart3, Settings, LogOut, 
  Clock, Star, Award, Gift, Info, Bell, X, User, Shield,
  Calendar, MessageSquare, Briefcase, BookOpen, Menu,
  ChevronRight, Zap
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';

// 🔥 IMPORT FIREBASE POUR NOTIFICATIONS
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// ==========================================
// 🎨 COMPOSANT MENU HAMBURGER PREMIUM
// ==========================================

const HamburgerMenu = memo(({ isOpen, onClose, navigate, user }) => {
  const location = useLocation();
  
  // 👑 VÉRIFIER SI L'UTILISATEUR EST ADMIN
  const isAdmin = user?.email === 'alan.boehme61@gmail.com' || 
                 user?.role === 'admin' || 
                 user?.profile?.role === 'admin';

  // 📋 CONFIGURATION DES MENUS
  const menuItems = [
    { 
      section: 'PRINCIPAL',
      items: [
        { path: '/', label: 'Tableau de bord', icon: Home, emoji: '🏠' },
        { path: '/tasks', label: 'Quêtes', icon: Target, emoji: '⚔️' },
        { path: '/rewards', label: 'Récompenses', icon: Gift, emoji: '🎁' },
        { path: '/team', label: 'Équipe', icon: Users, emoji: '👥' },
      ]
    },
    {
      section: 'OUTILS',
      items: [
        { path: '/timetrack', label: 'Badgeuse', icon: Clock, emoji: '⏱️' },
        { path: '/analytics', label: 'Statistiques', icon: BarChart3, emoji: '📊' },
        { path: '/infos', label: 'Infos équipe', icon: Info, emoji: '📢' },
      ]
    },
    {
      section: 'PROFIL',
      items: [
        { path: '/profile', label: 'Mon profil', icon: User, emoji: '👤' },
      ]
    }
  ];

  // 🛡️ MENU ADMIN (si admin)
  const adminItems = isAdmin ? [
    {
      section: 'ADMINISTRATION',
      items: [
        { path: '/admin', label: 'Dashboard Admin', icon: Shield, emoji: '🛡️' },
        { path: '/admin/users', label: 'Gestion utilisateurs', icon: Users, emoji: '👥' },
        { path: '/admin/validation', label: 'Validation quêtes', icon: Target, emoji: '✅' },
        { path: '/admin/rewards', label: 'Gestion récompenses', icon: Gift, emoji: '🎁' },
        { path: '/admin/settings', label: 'Paramètres', icon: Settings, emoji: '⚙️' },
        { path: '/hr', label: 'Ressources Humaines', icon: Briefcase, emoji: '💼' },
        { path: '/onboarding', label: 'Onboarding', icon: BookOpen, emoji: '📚' },
      ]
    }
  ] : [];

  const allMenuSections = [...menuItems, ...adminItems];

  const handleNavigation = useCallback((path) => {
    console.log('🧭 [MENU] Navigation vers:', path);
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  const handleLogout = useCallback(async () => {
    try {
      const { logout } = useAuthStore.getState();
      await logout();
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  }, [navigate, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999998]"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 z-[999999] shadow-2xl"
      >
        {/* Header du menu */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Synergia</h2>
                <p className="text-xs text-gray-400">v3.5</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="mt-4 flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.displayName?.[0] || user.email?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              {isAdmin && (
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full">
                  Admin
                </span>
              )}
            </div>
          )}
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          {allMenuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }
                      `}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer du menu */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>

        {/* Custom scrollbar styles */}
        <style>{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          
          div::-webkit-scrollbar-track {
            background: rgba(75, 85, 99, 0.2);
            border-radius: 3px;
          }
          
          div::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 4px;
          }
          
          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          }
        `}</style>
      </motion.div>
    </>
  );
});

// ==========================================
// 🔔 COMPOSANT NOTIFICATIONS (CORRIGÉ)
// ==========================================

const NotificationBell = memo(({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef(null);

  // ✅ HELPER: Convertir timestamp Firestore en Date
  const convertTimestamp = useCallback((timestamp) => {
    if (!timestamp) return null;
    
    try {
      // Si c'est un Timestamp Firestore avec toDate()
      if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      // Si c'est un objet avec seconds (Timestamp sérialisé)
      if (timestamp?.seconds) {
        return new Date(timestamp.seconds * 1000);
      }
      // Si c'est déjà une Date
      if (timestamp instanceof Date) {
        return timestamp;
      }
      // Si c'est un string ISO
      if (typeof timestamp === 'string') {
        return new Date(timestamp);
      }
      // Si c'est un nombre (timestamp en ms)
      if (typeof timestamp === 'number') {
        return new Date(timestamp);
      }
      return null;
    } catch (error) {
      console.warn('⚠️ [NOTIF] Erreur conversion timestamp:', error);
      return null;
    }
  }, []);

  // ✅ HELPER: Formater la date relative
  const formatTimeAgo = useCallback((timestamp) => {
    const date = convertTimestamp(timestamp);
    if (!date) return '';

    try {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}j`;
      
      // Utiliser toLocaleDateString seulement sur un objet Date valide
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch (error) {
      console.warn('⚠️ [NOTIF] Erreur formatage date:', error);
      return '';
    }
  }, [convertTimestamp]);

  // ✅ ABONNEMENT AUX NOTIFICATIONS (AVEC TRY/CATCH)
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    console.log('🔔 [LAYOUT] Abonnement aux notifications...');
    setLoading(true);

    try {
      const notifQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      unsubscribeRef.current = onSnapshot(
        notifQuery,
        (snapshot) => {
          try {
            const notifList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            setNotifications(notifList);
            const unread = notifList.filter(n => !n.read).length;
            setUnreadCount(unread);
            
            console.log(`🔔 [LAYOUT] ${notifList.length} notifications, ${unread} non lues`);
          } catch (error) {
            console.error('❌ [LAYOUT] Erreur traitement notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('❌ [LAYOUT] Erreur listener notifications:', error);
          setLoading(false);
          setNotifications([]);
          setUnreadCount(0);
        }
      );
    } catch (error) {
      console.error('❌ [LAYOUT] Erreur création listener:', error);
      setLoading(false);
    }

    return () => {
      console.log('🔔 [LAYOUT] Désabonnement notifications');
      if (unsubscribeRef.current && typeof unsubscribeRef.current === 'function') {
        try {
          unsubscribeRef.current();
        } catch (e) {
          console.warn('⚠️ Erreur désabonnement:', e);
        }
      }
    };
  }, [user?.uid]);

  // ✅ MARQUER COMME LU
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
    }
  }, []);

  // ✅ ICÔNE NOTIFICATION TYPE
  const getNotificationIcon = useCallback((type) => {
    const icons = {
      quest_validation_pending: '🎯',
      quest_approved: '✅',
      quest_rejected: '❌',
      badge_earned: '🏆',
      level_up: '⭐',
      xp_earned: '⚡',
      new_info: '📢',
      reward_requested: '🎁',
      reward_approved: '🎉',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  }, []);

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Liste */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2 text-sm">Chargement...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="text-4xl mb-2 block">🎉</span>
                    <p className="text-gray-400">Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/50">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className={`p-4 hover:bg-gray-700/30 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.read ? 'font-semibold text-white' : 'text-gray-300'}`}>
                              {notif.title || 'Notification'}
                            </p>
                            {notif.message && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {notif.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

// ==========================================
// 🔒 COMPOSANT LAYOUT PRINCIPAL
// ==========================================

const Layout = memo(({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const openMenu = useCallback(() => {
    console.log('🔓 [LAYOUT] Ouverture menu demandée');
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    console.log('🔒 [LAYOUT] Fermeture menu demandée');
    setMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* 🔒 HEADER AVEC BOUTON HAMBURGER ET NOTIFICATIONS */}
      <div className="fixed top-0 left-0 right-0 z-[999] bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Bouton hamburger */}
          <button
            onClick={openMenu}
            className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Logo central */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">Synergia</span>
          </div>

          {/* Notifications */}
          <NotificationBell user={user} />
        </div>
      </div>

      {/* 🍔 MENU HAMBURGER */}
      <AnimatePresence>
        {menuOpen && (
          <HamburgerMenu
            isOpen={menuOpen}
            onClose={closeMenu}
            navigate={navigate}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* 📄 CONTENU PRINCIPAL */}
      <main className="pt-20 pb-6">
        {children}
      </main>
    </div>
  );
});

export default Layout;
