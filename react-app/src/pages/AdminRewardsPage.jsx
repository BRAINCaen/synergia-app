// ==========================================
// 📁 react-app/src/pages/AdminRewardsPage.jsx
// PAGE ADMIN RÉCOMPENSES - POOL ÉQUIPE CORRECT
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  X, 
  Eye, 
  User, 
  Calendar, 
  AlertCircle, 
  BarChart3, 
  RefreshCw, 
  Gift, 
  Coins,
  Clock4,
  MessageSquare,
  Zap,
  Users,
  Crown,
  Star
} from 'lucide-react';
import notificationService from '../core/services/notificationService.js';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// Firebase imports
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// 📊 CATALOGUES COMPLETS DES RÉCOMPENSES
// ==========================================

const DEFAULT_INDIVIDUAL_REWARDS = [
  // Mini-plaisirs (50-100 XP)
  { id: 'snack', name: 'Goûter surprise', description: 'Un goûter de ton choix', xpCost: 50, icon: '🍪', category: 'Mini-plaisirs', type: 'individual' },
  { id: 'coffee', name: 'Café premium', description: 'Un café de spécialité', xpCost: 75, icon: '☕', category: 'Mini-plaisirs', type: 'individual' },
  { id: 'tea', name: 'Thé premium', description: 'Une sélection de thés fins', xpCost: 80, icon: '🍵', category: 'Mini-plaisirs', type: 'individual' },
  
  // Petits avantages (100-200 XP)
  { id: 'earlyLeave', name: 'Sortie anticipée', description: 'Partir 30 min plus tôt', xpCost: 150, icon: '🏃', category: 'Petits avantages', type: 'individual' },
  { id: 'parking', name: 'Place de parking', description: 'Place réservée pour une semaine', xpCost: 180, icon: '🅿️', category: 'Petits avantages', type: 'individual' },
  
  // Plaisirs utiles (200-400 XP)
  { id: 'headphones', name: 'Écouteurs', description: 'Écouteurs sans fil', xpCost: 300, icon: '🎧', category: 'Plaisirs utiles', type: 'individual' },
  { id: 'powerbank', name: 'Batterie externe', description: 'Power bank haute capacité', xpCost: 250, icon: '🔋', category: 'Plaisirs utiles', type: 'individual' },
  
  // Food & cadeaux (400-700 XP)
  { id: 'restaurant', name: 'Restaurant', description: 'Bon pour un restaurant', xpCost: 500, icon: '🍽️', category: 'Food & cadeaux', type: 'individual' },
  { id: 'giftCard', name: 'Carte cadeau 30€', description: 'Utilisable en magasin', xpCost: 600, icon: '🎁', category: 'Food & cadeaux', type: 'individual' },
  
  // Bien-être (700-1000 XP)
  { id: 'massage', name: 'Massage', description: 'Séance de massage professionnel', xpCost: 800, icon: '💆', category: 'Bien-être', type: 'individual' },
  { id: 'ergonomic', name: 'Accessoire ergonomique', description: 'Fauteuil ou coussin ergonomique', xpCost: 900, icon: '🪑', category: 'Bien-être', type: 'individual' },
  
  // Loisirs (1000-1500 XP)
  { id: 'cinema', name: 'Pack cinéma', description: '2 places de cinéma + popcorn', xpCost: 1200, icon: '🎬', category: 'Loisirs', type: 'individual' },
  { id: 'concert', name: 'Concert', description: 'Billet pour un concert', xpCost: 1400, icon: '🎵', category: 'Loisirs', type: 'individual' },
  
  // Lifestyle (1500-2500 XP)
  { id: 'gadget', name: 'Gadget tech', description: 'Objet technologique au choix', xpCost: 2000, icon: '📺', category: 'Lifestyle', type: 'individual' },
  { id: 'sport', name: 'Équipement sportif', description: 'Matériel pour ton sport préféré', xpCost: 2300, icon: '⚽', category: 'Lifestyle', type: 'individual' },
  
  // Temps offert (2500-4000 XP)
  { id: 'halfDay', name: 'Demi-journée congé', description: 'Une demi-journée de repos supplémentaire', xpCost: 2800, icon: '🌅', category: 'Temps offert', type: 'individual' },
  { id: 'fullDay', name: 'Jour de congé bonus', description: 'Un jour de congé supplémentaire', xpCost: 3500, icon: '🏖️', category: 'Temps offert', type: 'individual' },
  
  // Grands plaisirs (4000-6000 XP)
  { id: 'weekend', name: 'Week-end découverte', description: 'Un week-end dans un lieu touristique', xpCost: 5000, icon: '🗺️', category: 'Grands plaisirs', type: 'individual' },
  { id: 'spa', name: 'Journée spa', description: 'Une journée complète dans un spa', xpCost: 4500, icon: '🧖', category: 'Grands plaisirs', type: 'individual' },
  
  // Premium (6000+ XP)
  { id: 'vacation', name: 'Semaine de vacances offerte', description: 'Une semaine de vacances payée', xpCost: 12500, icon: '✈️', category: 'Premium', type: 'individual' },
  { id: 'laptop', name: 'Ordinateur portable', description: 'Un laptop pour usage personnel', xpCost: 15000, icon: '💻', category: 'Premium', type: 'individual' }
];

const DEFAULT_TEAM_REWARDS = [
  { id: 'teamSnack', name: 'Goûter d\'équipe', description: 'Goûter pour toute l\'équipe', xpCost: 500, icon: '🍰', category: 'Team', type: 'team' },
  { id: 'teamLunch', name: 'Déjeuner d\'équipe', description: 'Restaurant pour l\'équipe', xpCost: 1500, icon: '🍴', category: 'Team', type: 'team' },
  { id: 'teamActivity', name: 'Activité team building', description: 'Sortie ou activité collective', xpCost: 3000, icon: '🎯', category: 'Team', type: 'team' },
  { id: 'teamOuting', name: 'Sortie d\'équipe', description: 'Journée découverte en équipe', xpCost: 5000, icon: '🚀', category: 'Team', type: 'team' },
  { id: 'teamWeekend', name: 'Week-end d\'équipe', description: 'Week-end team building complet', xpCost: 10000, icon: '🏕️', category: 'Team', type: 'team' }
];

/**
 * 👑 PAGE ADMIN RÉCOMPENSES - POOL ÉQUIPE CORRECT
 */
const AdminRewardsPage = () => {
  const { user } = useAuthStore();
  
  // États locaux
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [firebaseRewards, setFirebaseRewards] = useState([]);
  const [teamPoolXP, setTeamPoolXP] = useState(0); // ✅ XP DU POOL ÉQUIPE

  // Statistiques réelles
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedToday: 0,
    totalXpDistributed: 0
  });

  // ✅ ÉCOUTER LE POOL D'ÉQUIPE EN TEMPS RÉEL
  useEffect(() => {
    console.log('🔄 Écoute du pool d\'équipe...');
    
    const poolRef = doc(db, 'teamPool', 'main');
    
    const unsubscribe = onSnapshot(poolRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const poolData = docSnapshot.data();
        const poolXP = poolData.totalXP || 0;
        setTeamPoolXP(poolXP);
        console.log('✅ XP Pool Équipe:', poolXP);
      } else {
        console.log('⚠️ Pool équipe non initialisé, création...');
        // Initialiser le pool si nécessaire
        setTeamPoolXP(0);
      }
    }, (error) => {
      console.error('❌ Erreur écoute pool:', error);
      setTeamPoolXP(0);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 CHARGER LES RÉCOMPENSES FIREBASE
  useEffect(() => {
    const loadFirebaseRewards = async () => {
      try {
        const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
        const rewards = rewardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFirebaseRewards(rewards);
        console.log('✅ Récompenses Firebase chargées:', rewards.length);
      } catch (error) {
        console.error('❌ Erreur chargement récompenses Firebase:', error);
      }
    };
    
    loadFirebaseRewards();
  }, []);

  /**
   * 🎁 OBTENIR LES DÉTAILS D'UNE RÉCOMPENSE
   */
  const getRewardDetails = (rewardId, rewardName, rewardIcon, rewardType) => {
    // 1. Chercher dans Firebase
    const firebaseReward = firebaseRewards.find(r => r.id === rewardId);
    if (firebaseReward) {
      return {
        name: firebaseReward.name,
        description: firebaseReward.description || '',
        xpCost: firebaseReward.xpCost,
        icon: firebaseReward.icon || '🎁',
        category: firebaseReward.category || 'Personnalisée',
        type: firebaseReward.type || 'individual'
      };
    }

    // 2. Chercher dans catalogues par défaut
    const allDefaultRewards = [...DEFAULT_INDIVIDUAL_REWARDS, ...DEFAULT_TEAM_REWARDS];
    const defaultReward = allDefaultRewards.find(r => r.id === rewardId);
    if (defaultReward) {
      return defaultReward;
    }

    // 3. Fallback
    return { 
      name: rewardName || rewardId || 'Récompense inconnue', 
      description: '',
      xpCost: 0, 
      icon: rewardIcon || '🎁',
      category: 'Inconnue',
      type: rewardType || 'individual'
    };
  };

  /**
   * 🎨 COULEUR PAR COÛT XP
   */
  const getRewardColor = (reward) => {
    if (reward.type === 'team') return 'from-purple-600 to-indigo-600';
    
    const xp = reward.xpCost;
    if (xp <= 100) return 'from-green-600 to-emerald-600';
    if (xp <= 200) return 'from-blue-600 to-cyan-600';
    if (xp <= 400) return 'from-yellow-600 to-orange-600';
    if (xp <= 700) return 'from-red-600 to-pink-600';
    if (xp <= 1000) return 'from-purple-600 to-violet-600';
    if (xp <= 1500) return 'from-indigo-600 to-blue-600';
    if (xp <= 2500) return 'from-pink-600 to-rose-600';
    if (xp <= 4000) return 'from-orange-600 to-red-600';
    if (xp <= 6000) return 'from-violet-600 to-purple-600';
    return 'from-yellow-500 to-amber-500';
  };

  // 🔥 ÉCOUTE FIREBASE DES DEMANDES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 Écoute Firebase des demandes...');
    
    const rewardRequestsQuery = query(
      collection(db, 'rewardRequests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(rewardRequestsQuery, async (snapshot) => {
      console.log(`📥 ${snapshot.docs.length} demandes trouvées`);
      
      const requestsWithUserData = [];
      
      for (const requestDoc of snapshot.docs) {
        const requestData = requestDoc.data();
        
        try {
          const userRef = doc(db, 'users', requestData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : null;

          requestsWithUserData.push({
            id: requestDoc.id,
            ...requestData,
            userData,
            userName: userData?.profile?.displayName || userData?.email?.split('@')[0] || 'Utilisateur inconnu',
            userEmail: userData?.email || 'Email inconnu',
            userXP: userData?.gamification?.totalXp || 0
          });
        } catch (error) {
          console.error('❌ Erreur récupération utilisateur:', error);
        }
      }
      
      setRequests(requestsWithUserData);
      setLoading(false);
      
      setStats(prev => ({
        ...prev,
        pendingRequests: requestsWithUserData.length
      }));
      
    }, (error) => {
      console.error('❌ Erreur écoute Firebase:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🔥 ÉCOUTE STATISTIQUES
  useEffect(() => {
    if (!user?.uid) return;

    const allRequestsQuery = query(
      collection(db, 'rewardRequests'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(allRequestsQuery, (snapshot) => {
      const allRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const approvedToday = allRequests.filter(req => {
        if (req.status !== 'approved' || !req.approvedAt) return false;
        const approvedDate = req.approvedAt.toDate ? req.approvedAt.toDate() : new Date(req.approvedAt);
        approvedDate.setHours(0, 0, 0, 0);
        return approvedDate.getTime() === today.getTime();
      }).length;

      const totalXpDistributed = allRequests
        .filter(req => req.status === 'approved')
        .reduce((sum, req) => sum + (req.xpCost || 0), 0);

      setStats({
        totalRequests: allRequests.length,
        pendingRequests: allRequests.filter(req => req.status === 'pending').length,
        approvedToday,
        totalXpDistributed
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  /**
   * ✅ APPROUVER UNE DEMANDE
   */
  const handleApprove = async (request) => {
    try {
      console.log('✅ Approbation de la demande:', request.id);
      
      const rewardDetails = getRewardDetails(request.rewardId, request.rewardName, request.rewardIcon, request.type);
      
      // ✅ VÉRIFICATION SELON LE TYPE
      if (rewardDetails.type === 'team') {
        // Récompense ÉQUIPE → vérifier le POOL
        if (teamPoolXP < rewardDetails.xpCost) {
          alert(`❌ Pool équipe insuffisant !\nDisponible: ${teamPoolXP} XP\nRequis: ${rewardDetails.xpCost} XP`);
          return;
        }
      } else {
        // Récompense INDIVIDUELLE → vérifier XP utilisateur
        if (request.userXP < rewardDetails.xpCost) {
          alert(`❌ XP utilisateur insuffisants !\nDisponible: ${request.userXP} XP\nRequis: ${rewardDetails.xpCost} XP`);
          return;
        }
      }

      // Mettre à jour la demande
      const requestRef = doc(db, 'rewardRequests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.uid,
        adminEmail: user.email
      });
// 🔔 NOTIFIER L'UTILISATEUR DE L'APPROBATION
try {
  await notificationService.notifyRewardApproved(request.userId, {
    rewardId: request.rewardId,
    rewardName: rewardDetails.name
  });
  console.log('🔔 [NOTIF] Utilisateur notifié de la récompense approuvée');
} catch (notifError) {
  console.warn('⚠️ [NOTIF] Erreur notification:', notifError);
}
      // ✅ DÉDUIRE LES XP DU BON ENDROIT
      if (rewardDetails.type === 'team') {
        // RÉCOMPENSE ÉQUIPE → Déduire du POOL collectif
        console.log(`💰 Déduction POOL ÉQUIPE: -${rewardDetails.xpCost} XP`);
        const poolRef = doc(db, 'teamPool', 'main');
        await updateDoc(poolRef, {
          totalXP: increment(-rewardDetails.xpCost),
          updatedAt: serverTimestamp()
        });
      } else {
        // RÉCOMPENSE INDIVIDUELLE → Déduire de l'utilisateur SEULEMENT
        console.log(`👤 Déduction XP INDIVIDUEL: -${rewardDetails.xpCost} XP pour ${request.userName}`);
        const userRef = doc(db, 'users', request.userId);
        await updateDoc(userRef, {
          'gamification.totalXp': increment(-rewardDetails.xpCost),
          'gamification.rewardsRedeemed': increment(1),
          'gamification.lastRewardRedeemed': serverTimestamp(),
          lastActivity: serverTimestamp()
        });
      }

      setShowModal(false);
      setSelectedRequest(null);
      
      const typeText = rewardDetails.type === 'team' ? '👥 ÉQUIPE' : '👤 INDIVIDUELLE';
      const sourceText = rewardDetails.type === 'team' 
        ? `Pool équipe: ${teamPoolXP} → ${teamPoolXP - rewardDetails.xpCost} XP`
        : `XP utilisateur: ${request.userXP} → ${request.userXP - rewardDetails.xpCost} XP`;
        
      alert(`✅ Récompense ${typeText} approuvée !\n\n"${rewardDetails.name}"\nPour: ${request.userName}\n\n${sourceText}`);
      
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      alert('❌ Erreur lors de l\'approbation : ' + error.message);
    }
  };

  /**
   * ❌ REJETER UNE DEMANDE
   */
  const handleReject = async (request) => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Veuillez indiquer une raison pour le rejet');
      return;
    }

    try {
      const requestRef = doc(db, 'rewardRequests', request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user.uid,
        rejectionReason: rejectionReason.trim(),
        adminEmail: user.email
      });
// 🔔 NOTIFIER L'UTILISATEUR DU REJET
try {
  await notificationService.notifyRewardRejected(request.userId, {
    rewardId: request.rewardId,
    rewardName: request.rewardName,
    reason: rejectionReason.trim()
  });
  console.log('🔔 [NOTIF] Utilisateur notifié du rejet de récompense');
} catch (notifError) {
  console.warn('⚠️ [NOTIF] Erreur notification:', notifError);
}
      setShowModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      alert(`❌ Demande rejetée.\n\nRaison: ${rejectionReason}`);
      
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      alert('❌ Erreur lors du rejet : ' + error.message);
    }
  };

  /**
   * 🔄 RAFRAÎCHIR
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      console.log('🔄 Données rafraîchies');
    }, 1000);
  };

  /**
   * 👁️ OUVRIR MODAL
   */
  const openModal = (request, type = 'view') => {
    const rewardDetails = getRewardDetails(request.rewardId, request.rewardName, request.rewardIcon, request.type);
    setSelectedRequest({
      ...request,
      rewardDetails
    });
    setModalType(type);
    setShowModal(true);
  };

  /**
   * 📊 FORMATER DATE
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  /**
   * ⏰ TEMPS RELATIF
   */
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Il y a moins d\'1h';
      if (hours < 24) return `Il y a ${hours}h`;
      return `Il y a ${Math.floor(hours / 24)} jour(s)`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Chargement administration...</h2>
            <p className="text-gray-400 mt-2">Synchronisation Firebase en cours</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* En-tête */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Shield className="w-10 h-10 text-purple-400" />
                  Administration des Récompenses
                </h1>
                <p className="text-gray-400 text-lg mt-2">
                  Validation des demandes - Pool équipe sécurisé
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
                
                <a
                  href="/rewards"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Gift className="w-4 h-4" />
                  <span>Page utilisateur</span>
                </a>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-lg border border-yellow-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">En attente</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
                    <p className="text-yellow-400/70 text-xs mt-1">Temps réel</p>
                  </div>
                  <Clock4 className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-blue-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold text-white">{stats.totalRequests}</p>
                    <p className="text-blue-400/70 text-xs mt-1">Demandes</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-green-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Aujourd'hui</p>
                    <p className="text-3xl font-bold text-white">{stats.approvedToday}</p>
                    <p className="text-green-400/70 text-xs mt-1">Approuvées</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-purple-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">XP distribués</p>
                    <p className="text-3xl font-bold text-white">{stats.totalXpDistributed.toLocaleString()}</p>
                    <p className="text-purple-400/70 text-xs mt-1">Total</p>
                  </div>
                  <Coins className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              {/* ✅ POOL ÉQUIPE */}
              <div className="bg-white/10 backdrop-blur-lg border border-pink-400/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-400 text-sm font-medium">Pool Équipe</p>
                    <p className="text-3xl font-bold text-white">{teamPoolXP.toLocaleString()}</p>
                    <p className="text-pink-400/70 text-xs mt-1">XP collectif</p>
                  </div>
                  <Users className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Liste des demandes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {requests.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-12 text-center">
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">Aucune demande en attente</h3>
                <p className="text-gray-400 text-lg">Toutes les demandes ont été traitées ! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  Demandes en attente ({requests.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.map((request) => {
                    const rewardDetails = getRewardDetails(request.rewardId, request.rewardName, request.rewardIcon, request.type);
                    
                    // ✅ VÉRIFICATION SELON LE TYPE
                    const requiredXP = rewardDetails.type === 'team' ? teamPoolXP : request.userXP;
                    const canAfford = requiredXP >= rewardDetails.xpCost;

                    return (
                      <motion.div
                        key={request.id}
                        className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {/* Header avec icône */}
                        <div className={`h-32 bg-gradient-to-r ${getRewardColor(rewardDetails)} flex items-center justify-center relative`}>
                          <span className="text-6xl">{rewardDetails.icon}</span>
                          
                          {rewardDetails.type === 'team' && (
                            <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Équipe
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{rewardDetails.name}</h3>
                          <p className="text-gray-400 text-sm mb-4">{rewardDetails.description || 'Récompense personnalisée'}</p>
                          
                          {/* Utilisateur */}
                          <div className="bg-white/5 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-semibold">{request.userName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{getRelativeTime(request.requestedAt)}</span>
                            </div>
                          </div>

                          {/* XP Info */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">
                              {rewardDetails.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Zap className={`w-4 h-4 ${canAfford ? 'text-yellow-400' : 'text-red-400'}`} />
                              <span className={`font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                                {rewardDetails.xpCost} XP
                              </span>
                            </div>
                          </div>

                          {/* XP Source */}
                          <div className={`border rounded-lg p-2 mb-4 ${
                            rewardDetails.type === 'team' 
                              ? 'bg-purple-500/10 border-purple-400/30' 
                              : 'bg-blue-500/10 border-blue-400/30'
                          }`}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">
                                {rewardDetails.type === 'team' ? '💰 Pool équipe:' : '👤 XP utilisateur:'}
                              </span>
                              <span className={`font-bold ${
                                rewardDetails.type === 'team' ? 'text-purple-400' : 'text-blue-400'
                              }`}>
                                {requiredXP.toLocaleString()} XP
                              </span>
                            </div>
                          </div>

                          {/* Alerte */}
                          {!canAfford && (
                            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <span className="text-red-400 text-xs">XP insuffisants</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal(request, 'view')}
                              className="flex-1 bg-white/5 border border-white/20 text-white py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Détails
                            </button>
                            
                            <button
                              onClick={() => openModal(request, 'approve')}
                              disabled={!canAfford}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Valider
                            </button>
                            
                            <button
                              onClick={() => openModal(request, 'reject')}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Refuser
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Modal */}
          {showModal && selectedRequest && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-slate-800 border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {modalType === 'view' && '📋 Détails'}
                    {modalType === 'approve' && '✅ Approuver'}
                    {modalType === 'reject' && '❌ Rejeter'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Aperçu */}
                <div className={`h-40 bg-gradient-to-r ${getRewardColor(selectedRequest.rewardDetails)} rounded-xl flex items-center justify-center mb-6`}>
                  <span className="text-8xl">{selectedRequest.rewardDetails.icon}</span>
                </div>

                <div className="space-y-4">
                  {/* Nom */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-2">{selectedRequest.rewardDetails.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedRequest.rewardDetails.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">
                        {selectedRequest.rewardDetails.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedRequest.rewardDetails.type === 'team' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {selectedRequest.rewardDetails.type === 'team' ? '👥 ÉQUIPE' : '👤 INDIVIDUELLE'}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{selectedRequest.rewardDetails.xpCost} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Utilisateur */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">👤 Utilisateur</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">Nom:</span>
                        <p className="text-white font-semibold">{selectedRequest.userName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <p className="text-white font-semibold">{selectedRequest.userEmail}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">XP utilisateur:</span>
                        <p className="text-blue-400 font-bold">{selectedRequest.userXP} XP</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Pool équipe:</span>
                        <p className="text-purple-400 font-bold">{teamPoolXP.toLocaleString()} XP</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400">Demandée le:</span>
                        <p className="text-white">{formatDate(selectedRequest.requestedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vérifications */}
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">🔍 Vérifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {(selectedRequest.rewardDetails.type === 'team' 
                          ? teamPoolXP >= selectedRequest.rewardDetails.xpCost
                          : selectedRequest.userXP >= selectedRequest.rewardDetails.xpCost
                        ) ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                        <span className="text-sm text-gray-300">
                          {selectedRequest.rewardDetails.type === 'team' 
                            ? `Pool équipe: ${teamPoolXP.toLocaleString()} / ${selectedRequest.rewardDetails.xpCost} XP`
                            : `XP utilisateur: ${selectedRequest.userXP} / ${selectedRequest.rewardDetails.xpCost} XP`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rejet */}
                  {modalType === 'reject' && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-3">💬 Raison du rejet</h4>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Expliquez pourquoi..."
                        className="w-full h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    
                    {modalType === 'approve' && (
                      <button
                        onClick={() => handleApprove(selectedRequest)}
                        disabled={
                          selectedRequest.rewardDetails.type === 'team' 
                            ? teamPoolXP < selectedRequest.rewardDetails.xpCost
                            : selectedRequest.userXP < selectedRequest.rewardDetails.xpCost
                        }
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approuver
                      </button>
                    )}
                    
                    {modalType === 'reject' && (
                      <button
                        onClick={() => handleReject(selectedRequest)}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        Rejeter
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminRewardsPage;
