// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES AVEC SYSTÈME D'ÉQUIPE + CAGNOTTE XP
// GESTION ADMIN COMPLÈTE + DEMANDES DE VALIDATION
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Filter, Star, Gift, Coins, Users, Target, 
  Plus, Edit2, Trash2, Settings, AlertCircle, Check, X, 
  ShoppingCart, Clock, User, Calendar, TrendingUp, Crown,
  Shield, Eye, EyeOff, Package, Zap, Heart, Coffee, Gamepad2,
  MapPin, Camera, Music, Book, Palette, Dumbbell, ChefHat
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, query, orderBy, onSnapshot, where, getDocs, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch, runTransaction
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 📊 ÉTATS RÉCOMPENSES
  const [userRewards, setUserRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [teamRewards, setTeamRewards] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [teamPool, setTeamPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('individual'); // individual | team

  // 🛡️ ÉTATS ADMIN
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showEditRewardModal, setShowEditRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // 📋 ÉTATS DEMANDES
  const [rewardRequests, setRewardRequests] = useState([]);
  const [teamRewardRequests, setTeamRewardRequests] = useState([]);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);

  // 🎨 FORM DONNÉES
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'individual', // individual | team
    category: 'Mini-plaisirs',
    xpCost: 100,
    icon: '🎁',
    isAvailable: true,
    stock: -1,
    requirements: {}
  });

  // 🎁 CATALOGUE RÉCOMPENSES INDIVIDUELLES (existant)
  const INDIVIDUAL_REWARDS_CATALOG = {
    // Mini-plaisirs (50-100 XP)
    boost_xp_10: { id: 'boost_xp_10', name: '⚡ Boost XP +10%', description: 'Bonus de 10% d\'XP pendant 1 heure', type: 'individual', category: 'Mini-plaisirs', xpCost: 50, icon: '⚡', isAvailable: true },
    pause_cafe: { id: 'pause_cafe', name: '☕ Pause café premium', description: 'Pause café avec viennoiseries', type: 'individual', category: 'Mini-plaisirs', xpCost: 75, icon: '☕', isAvailable: true },
    playlist_perso: { id: 'playlist_perso', name: '🎵 Playlist perso', description: 'Écouter sa musique pendant 2h', type: 'individual', category: 'Mini-plaisirs', xpCost: 60, icon: '🎵', isAvailable: true },
    
    // Petits avantages (100-200 XP)
    parking_premium: { id: 'parking_premium', name: '🚗 Place parking premium', description: 'Place de parking proche pour 1 semaine', type: 'individual', category: 'Petits avantages', xpCost: 150, icon: '🚗', isAvailable: true },
    dejeuner_prolonge: { id: 'dejeuner_prolonge', name: '🍽️ Déjeuner prolongé', description: 'Pause déjeuner de 1h30 au lieu d\'1h', type: 'individual', category: 'Petits avantages', xpCost: 120, icon: '🍽️', isAvailable: true },
    flexibilite_horaire: { id: 'flexibilite_horaire', name: '⏰ Flexibilité horaire', description: 'Arrivée libre entre 8h et 10h pendant 1 semaine', type: 'individual', category: 'Petits avantages', xpCost: 180, icon: '⏰', isAvailable: true },

    // Plaisirs utiles (200-400 XP)
    formation_courte: { id: 'formation_courte', name: '📚 Formation courte', description: 'Formation en ligne de votre choix (2h)', type: 'individual', category: 'Plaisirs utiles', xpCost: 300, icon: '📚', isAvailable: true },
    materiel_bureau: { id: 'materiel_bureau', name: '🖥️ Matériel bureau', description: 'Accessoire bureau jusqu\'à 50€', type: 'individual', category: 'Plaisirs utiles', xpCost: 350, icon: '🖥️', isAvailable: true },
    
    // Food & cadeaux (400-700 XP)
    repas_restaurant: { id: 'repas_restaurant', name: '🍴 Repas restaurant', description: 'Repas au restaurant (jusqu\'à 30€)', type: 'individual', category: 'Plaisirs food & cadeaux', xpCost: 500, icon: '🍴', isAvailable: true },
    bon_achat: { id: 'bon_achat', name: '🎁 Bon d\'achat 25€', description: 'Bon d\'achat Amazon, Fnac ou autre', type: 'individual', category: 'Plaisirs food & cadeaux', xpCost: 600, icon: '🎁', isAvailable: true },

    // Bien-être (700-1000 XP)
    massage_15min: { id: 'massage_15min', name: '💆 Massage 15min', description: 'Massage de détente au bureau', type: 'individual', category: 'Bien-être & confort', xpCost: 800, icon: '💆', isAvailable: true },
    
    // Loisirs (1000-1500 XP)
    cinema_2places: { id: 'cinema_2places', name: '🎬 Cinéma 2 places', description: 'Places de cinéma pour 2 personnes', type: 'individual', category: 'Loisirs & sorties', xpCost: 1200, icon: '🎬', isAvailable: true },
    
    // Lifestyle (1500-2500 XP)
    weekend_hotel: { id: 'weekend_hotel', name: '🏨 Nuit d\'hôtel', description: 'Nuit d\'hôtel pour le weekend (150€)', type: 'individual', category: 'Lifestyle & bonus', xpCost: 2000, icon: '🏨', isAvailable: true },
    
    // Temps offert (2500-4000 XP)
    demie_journee_conge: { id: 'demie_journee_conge', name: '🌅 Demi-journée congé', description: 'Demi-journée de congé supplémentaire', type: 'individual', category: 'Avantages temps offert', xpCost: 3000, icon: '🌅', isAvailable: true },
    
    // Grands plaisirs (4000-6000 XP)
    journee_conge: { id: 'journee_conge', name: '🌴 Journée congé', description: 'Journée de congé supplémentaire', type: 'individual', category: 'Grands plaisirs', xpCost: 5000, icon: '🌴', isAvailable: true },
    
    // Premium (6000-15000 XP)
    voyage_weekend: { id: 'voyage_weekend', name: '✈️ Weekend voyage', description: 'Weekend voyage en Europe (500€)', type: 'individual', category: 'Premium', xpCost: 10000, icon: '✈️', isAvailable: true }
  };

  // 🏆 CATALOGUE RÉCOMPENSES D'ÉQUIPE (nouveau)
  const TEAM_REWARDS_CATALOG = {
    // Récompenses d'équipe petit budget (500-1500 XP cagnotte)
    team_breakfast: { id: 'team_breakfast', name: '🥐 Petit-déj équipe', description: 'Petit-déjeuner offert pour toute l\'équipe', type: 'team', category: 'Team Mini-plaisirs', xpCost: 800, icon: '🥐', isAvailable: true },
    team_coffee: { id: 'team_coffee', name: '☕ Machine café premium', description: 'Machine à café premium pendant 1 mois', type: 'team', category: 'Team Mini-plaisirs', xpCost: 1200, icon: '☕', isAvailable: true },
    
    // Récompenses moyennes (1500-3000 XP)
    team_lunch: { id: 'team_lunch', name: '🍕 Déjeuner équipe', description: 'Repas d\'équipe livré au bureau', type: 'team', category: 'Team Food', xpCost: 2000, icon: '🍕', isAvailable: true },
    team_game_session: { id: 'team_game_session', name: '🎮 Session gaming', description: '2h de session gaming d\'équipe', type: 'team', category: 'Team Loisirs', xpCost: 2500, icon: '🎮', isAvailable: true },
    
    // Grandes récompenses (3000-6000 XP)
    team_outing: { id: 'team_outing', name: '🏃 Sortie équipe', description: 'Activité d\'équipe (laser game, escape game...)', type: 'team', category: 'Team Sorties', xpCost: 4000, icon: '🏃', isAvailable: true },
    team_restaurant: { id: 'team_restaurant', name: '🍽️ Restaurant équipe', description: 'Repas au restaurant pour toute l\'équipe', type: 'team', category: 'Team Food', xpCost: 5000, icon: '🍽️', isAvailable: true },
    
    // Récompenses premium (6000+ XP)
    team_seminar: { id: 'team_seminar', name: '🏖️ Séminaire équipe', description: 'Séminaire d\'équipe 1 jour en extérieur', type: 'team', category: 'Team Premium', xpCost: 8000, icon: '🏖️', isAvailable: true },
    team_formation: { id: 'team_formation', name: '📚 Formation équipe', description: 'Formation spécialisée pour toute l\'équipe', type: 'team', category: 'Team Formation', xpCost: 10000, icon: '📚', isAvailable: true }
  };

  // 🎨 ICÔNES PAR CATÉGORIE
  const CATEGORY_ICONS = {
    'Mini-plaisirs': '☕',
    'Petits avantages': '⭐',
    'Plaisirs utiles': '📚',
    'Plaisirs food & cadeaux': '🍴',
    'Bien-être & confort': '💆',
    'Loisirs & sorties': '🎬',
    'Lifestyle & bonus': '🏨',
    'Avantages temps offert': '⏰',
    'Grands plaisirs': '🌴',
    'Premium': '✈️',
    // Équipe
    'Team Mini-plaisirs': '🥐',
    'Team Food': '🍕',
    'Team Loisirs': '🎮',
    'Team Sorties': '🏃',
    'Team Formation': '📚',
    'Team Premium': '🏖️'
  };

  /**
   * 🔄 CHARGEMENT INITIAL
   */
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadRewards();
      loadTeamPool();
      if (userIsAdmin) {
        loadRewardRequests();
      }
    }
  }, [user, userIsAdmin]);

  /**
   * 👤 CHARGER PROFIL UTILISATEUR
   */
  const loadUserProfile = async () => {
    try {
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        setUserProfile({
          ...profileData,
          totalXp: profileData.gamification?.totalXp || 0,
          level: profileData.gamification?.level || 1
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement profil:', error);
    }
  };

  /**
   * 🎁 CHARGER RÉCOMPENSES
   */
  const loadRewards = async () => {
    try {
      // Récompenses individuelles Firebase
      const rewardsQuery = query(
        collection(db, 'rewards'),
        where('type', '==', 'individual'),
        orderBy('xpCost', 'asc')
      );
      
      const unsubscribeIndividual = onSnapshot(rewardsQuery, (snapshot) => {
        const firebaseRewards = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Combiner avec catalogue par défaut
        const catalogRewards = Object.values(INDIVIDUAL_REWARDS_CATALOG);
        const combinedRewards = [...catalogRewards, ...firebaseRewards];
        setAllRewards(combinedRewards);
      });

      // Récompenses d'équipe Firebase
      const teamRewardsQuery = query(
        collection(db, 'rewards'),
        where('type', '==', 'team'),
        orderBy('xpCost', 'asc')
      );
      
      const unsubscribeTeam = onSnapshot(teamRewardsQuery, (snapshot) => {
        const firebaseTeamRewards = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Combiner avec catalogue d'équipe
        const catalogTeamRewards = Object.values(TEAM_REWARDS_CATALOG);
        const combinedTeamRewards = [...catalogTeamRewards, ...firebaseTeamRewards];
        setTeamRewards(combinedTeamRewards);
      });

      return () => {
        unsubscribeIndividual();
        unsubscribeTeam();
      };
    } catch (error) {
      console.error('❌ Erreur chargement récompenses:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🏆 CHARGER CAGNOTTE ÉQUIPE
   */
  const loadTeamPool = async () => {
    try {
      const poolRef = doc(db, 'teamPool', 'main');
      const unsubscribe = onSnapshot(poolRef, (snapshot) => {
        if (snapshot.exists()) {
          setTeamPool({
            id: snapshot.id,
            ...snapshot.data()
          });
        } else {
          // Initialiser la cagnotte si elle n'existe pas
          initializeTeamPool();
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur chargement cagnotte équipe:', error);
    }
  };

  /**
   * 🚀 INITIALISER CAGNOTTE ÉQUIPE
   */
  const initializeTeamPool = async () => {
    try {
      const poolRef = doc(db, 'teamPool', 'main');
      await setDoc(poolRef, {
        totalXP: 0,
        contributorsCount: 0,
        totalContributions: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statistics: {
          weeklyContributions: 0,
          monthlyContributions: 0,
          averageContribution: 0
        }
      });
      console.log('✅ Cagnotte équipe initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation cagnotte:', error);
    }
  };

  /**
   * 📋 CHARGER DEMANDES RÉCOMPENSES
   */
  const loadRewardRequests = async () => {
    try {
      // Demandes récompenses individuelles
      const requestsQuery = query(
        collection(db, 'rewardRequests'),
        where('type', '==', 'individual'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeIndividual = onSnapshot(requestsQuery, async (snapshot) => {
        const requests = [];
        for (const docSnap of snapshot.docs) {
          const requestData = docSnap.data();
          
          // Récupérer infos utilisateur
          const userRef = doc(db, 'users', requestData.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          
          requests.push({
            id: docSnap.id,
            ...requestData,
            userName: userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.email,
            userXP: userData.gamification?.totalXp || 0
          });
        }
        setRewardRequests(requests);
      });

      // Demandes récompenses d'équipe
      const teamRequestsQuery = query(
        collection(db, 'rewardRequests'),
        where('type', '==', 'team'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeTeam = onSnapshot(teamRequestsQuery, async (snapshot) => {
        const requests = [];
        for (const docSnap of snapshot.docs) {
          const requestData = docSnap.data();
          
          // Récupérer infos utilisateur
          const userRef = doc(db, 'users', requestData.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          
          requests.push({
            id: docSnap.id,
            ...requestData,
            userName: userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.email,
            userXP: userData.gamification?.totalXp || 0
          });
        }
        setTeamRewardRequests(requests);
      });

      return () => {
        unsubscribeIndividual();
        unsubscribeTeam();
      };
    } catch (error) {
      console.error('❌ Erreur chargement demandes:', error);
    }
  };

  /**
   * 🛒 DEMANDER UNE RÉCOMPENSE INDIVIDUELLE
   */
  const requestReward = async (reward) => {
    try {
      if (!userProfile || userProfile.totalXp < reward.xpCost) {
        showNotification('❌ XP insuffisants pour cette récompense', 'error');
        return;
      }

      const requestData = {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        xpCost: reward.xpCost,
        type: 'individual',
        status: 'pending',
        createdAt: serverTimestamp(),
        userNotes: ''
      };

      await addDoc(collection(db, 'rewardRequests'), requestData);
      showNotification('✅ Demande de récompense envoyée !', 'success');
    } catch (error) {
      console.error('❌ Erreur demande récompense:', error);
      showNotification('❌ Erreur lors de la demande', 'error');
    }
  };

  /**
   * 🏆 DEMANDER UNE RÉCOMPENSE D'ÉQUIPE
   */
  const requestTeamReward = async (reward) => {
    try {
      if (!teamPool || teamPool.totalXP < reward.xpCost) {
        showNotification('❌ Cagnotte équipe insuffisante pour cette récompense', 'error');
        return;
      }

      const requestData = {
        userId: user.uid,
        rewardId: reward.id,
        rewardName: reward.name,
        xpCost: reward.xpCost,
        type: 'team',
        status: 'pending',
        createdAt: serverTimestamp(),
        teamPoolXP: teamPool.totalXP,
        userNotes: ''
      };

      await addDoc(collection(db, 'rewardRequests'), requestData);
      showNotification('✅ Demande de récompense d\'équipe envoyée !', 'success');
    } catch (error) {
      console.error('❌ Erreur demande récompense équipe:', error);
      showNotification('❌ Erreur lors de la demande', 'error');
    }
  };

  /**
   * ✅ APPROUVER UNE DEMANDE (Admin)
   */
  const approveRequest = async (requestId, request) => {
    try {
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, 'rewardRequests', requestId);
        
        if (request.type === 'individual') {
          // Déduire XP du profil utilisateur
          const userRef = doc(db, 'users', request.userId);
          const userSnap = await transaction.get(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentXP = userData.gamification?.totalXp || 0;
            
            if (currentXP >= request.xpCost) {
              transaction.update(userRef, {
                'gamification.totalXp': currentXP - request.xpCost,
                'gamification.rewardsCount': (userData.gamification?.rewardsCount || 0) + 1
              });
            } else {
              throw new Error('XP insuffisants');
            }
          }
        } else if (request.type === 'team') {
          // Déduire XP de la cagnotte équipe
          const poolRef = doc(db, 'teamPool', 'main');
          const poolSnap = await transaction.get(poolRef);
          
          if (poolSnap.exists()) {
            const poolData = poolSnap.data();
            const currentXP = poolData.totalXP || 0;
            
            if (currentXP >= request.xpCost) {
              transaction.update(poolRef, {
                totalXP: currentXP - request.xpCost,
                'statistics.totalRewardsRedeemed': (poolData.statistics?.totalRewardsRedeemed || 0) + 1
              });
            } else {
              throw new Error('Cagnotte équipe insuffisante');
            }
          }
        }
        
        // Mettre à jour la demande
        transaction.update(requestRef, {
          status: 'approved',
          approvedAt: serverTimestamp(),
          approvedBy: user.uid
        });
      });

      showNotification('✅ Demande approuvée avec succès !', 'success');
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      showNotification(`❌ Erreur: ${error.message}`, 'error');
    }
  };

  /**
   * ❌ REJETER UNE DEMANDE (Admin)
   */
  const rejectRequest = async (requestId) => {
    try {
      const requestRef = doc(db, 'rewardRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user.uid
      });

      showNotification('❌ Demande rejetée', 'info');
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      showNotification('❌ Erreur lors du rejet', 'error');
    }
  };

  /**
   * ➕ CRÉER/MODIFIER RÉCOMPENSE (Admin)
   */
  const handleSaveReward = async () => {
    try {
      const rewardData = {
        ...rewardForm,
        xpCost: parseInt(rewardForm.xpCost),
        stock: parseInt(rewardForm.stock),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      };

      if (selectedReward) {
        // Modifier récompense existante
        const rewardRef = doc(db, 'rewards', selectedReward.id);
        await updateDoc(rewardRef, rewardData);
        showNotification('✅ Récompense modifiée !', 'success');
      } else {
        // Créer nouvelle récompense
        await addDoc(collection(db, 'rewards'), rewardData);
        showNotification('✅ Récompense créée !', 'success');
      }

      // Fermer modal et réinitialiser
      setShowCreateRewardModal(false);
      setShowEditRewardModal(false);
      setSelectedReward(null);
      resetRewardForm();
    } catch (error) {
      console.error('❌ Erreur sauvegarde récompense:', error);
      showNotification('❌ Erreur lors de la sauvegarde', 'error');
    }
  };

  /**
   * 🗑️ SUPPRIMER RÉCOMPENSE (Admin)
   */
  const deleteReward = async (rewardId) => {
    try {
      if (!window.confirm('Confirmer la suppression de cette récompense ?')) return;
      
      await deleteDoc(doc(db, 'rewards', rewardId));
      showNotification('🗑️ Récompense supprimée', 'info');
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showNotification('❌ Erreur lors de la suppression', 'error');
    }
  };

  /**
   * 📢 NOTIFICATION
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white font-medium shadow-lg transform translate-x-full transition-transform duration-300 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  /**
   * 🔄 RESET FORM
   */
  const resetRewardForm = () => {
    setRewardForm({
      name: '',
      description: '',
      type: 'individual',
      category: 'Mini-plaisirs',
      xpCost: 100,
      icon: '🎁',
      isAvailable: true,
      stock: -1,
      requirements: {}
    });
  };

  /**
   * 🔍 FILTRAGE DES RÉCOMPENSES
   */
  const filteredRewards = useMemo(() => {
    let rewards = [];
    
    // Choisir le bon catalogue selon l'onglet actif
    if (activeTab === 'individual') {
      if (userIsAdmin && showAdminPanel) {
        rewards = allRewards;
      } else {
        rewards = Object.values(INDIVIDUAL_REWARDS_CATALOG);
      }
    } else {
      if (userIsAdmin && showAdminPanel) {
        rewards = teamRewards;
      } else {
        rewards = Object.values(TEAM_REWARDS_CATALOG);
      }
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      rewards = rewards.filter(reward => 
        reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      rewards = rewards.filter(reward => reward.category === filterCategory);
    }

    return rewards;
  }, [allRewards, teamRewards, searchTerm, filterCategory, showAdminPanel, userIsAdmin, activeTab]);

  /**
   * 🎨 COULEUR PAR TYPE ET CATÉGORIE
   */
  const getRewardColor = (reward) => {
    if (reward.type === 'team') return 'from-purple-600 to-indigo-600';
    
    const xp = reward.xpCost;
    if (xp <= 100) return 'from-green-600 to-emerald-600';
    if (xp <= 200) return 'from-blue-600 to-cyan-600';
    if (xp <= 400) return 'from-yellow-600 to-orange-600';
    if (xp <= 700) return 'from-red-600 to-pink-600';
    if (xp <= 1000) return 'from-purple-600 to-violet-600';
    if (xp <= 2500) return 'from-indigo-600 to-blue-600';
    if (xp <= 6000) return 'from-pink-600 to-rose-600';
    return 'from-yellow-500 to-amber-500';
  };

  /**
   * ⏰ TEMPS RELATIF
   */
  const getRelativeTime = (date) => {
    if (!date) return 'Date inconnue';
    const now = new Date();
    const past = date.toDate ? date.toDate() : new Date(date);
    const diff = now - past;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Chargement des récompenses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 🎯 HEADER AVEC STATS */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Gift className="w-8 h-8 mr-3 text-yellow-400" />
                Récompenses Synergia
              </h1>
              <p className="text-gray-400">
                Échangez vos XP contre des récompenses individuelles ou contribuez à la cagnotte équipe !
              </p>
            </div>

            {/* STATS UTILISATEUR */}
            <div className="mt-4 lg:mt-0">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Mes XP</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {userProfile?.totalXp || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Niveau</p>
                    <p className="text-xl font-bold text-blue-400">
                      {userProfile?.level || 1}
                    </p>
                  </div>
                  {teamPool && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Cagnotte équipe</p>
                      <p className="text-xl font-bold text-purple-400">
                        {teamPool.totalXP || 0} XP
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ONGLETS INDIVIDUAL/TEAM */}
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('individual')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'individual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <User className="w-5 h-5 mr-2" />
              Récompenses Individuelles
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all duration-200 ${
                activeTab === 'team'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Récompenses d'Équipe
            </button>
          </div>

          {/* BARRE D'OUTILS */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* RECHERCHE */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* FILTRES */}
            <div className="flex items-center space-x-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Toutes catégories</option>
                {activeTab === 'individual' ? (
                  <>
                    <option value="Mini-plaisirs">Mini-plaisirs</option>
                    <option value="Petits avantages">Petits avantages</option>
                    <option value="Plaisirs utiles">Plaisirs utiles</option>
                    <option value="Plaisirs food & cadeaux">Food & cadeaux</option>
                    <option value="Bien-être & confort">Bien-être</option>
                    <option value="Loisirs & sorties">Loisirs</option>
                    <option value="Lifestyle & bonus">Lifestyle</option>
                    <option value="Avantages temps offert">Temps offert</option>
                    <option value="Grands plaisirs">Grands plaisirs</option>
                    <option value="Premium">Premium</option>
                  </>
                ) : (
                  <>
                    <option value="Team Mini-plaisirs">Team Mini-plaisirs</option>
                    <option value="Team Food">Team Food</option>
                    <option value="Team Loisirs">Team Loisirs</option>
                    <option value="Team Sorties">Team Sorties</option>
                    <option value="Team Formation">Team Formation</option>
                    <option value="Team Premium">Team Premium</option>
                  </>
                )}
              </select>

              {/* BOUTONS ADMIN */}
              {userIsAdmin && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      showAdminPanel
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title="Mode Admin"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setShowRequestsPanel(!showRequestsPanel)}
                    className={`p-2 rounded-lg transition-all duration-200 relative ${
                      showRequestsPanel
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title="Demandes en attente"
                  >
                    <Clock className="w-5 h-5" />
                    {(rewardRequests.filter(r => r.status === 'pending').length + 
                      teamRewardRequests.filter(r => r.status === 'pending').length) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {rewardRequests.filter(r => r.status === 'pending').length + 
                         teamRewardRequests.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </button>

                  {showAdminPanel && (
                    <button
                      onClick={() => setShowCreateRewardModal(true)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Créer récompense"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🎁 GRILLE DES RÉCOMPENSES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredRewards.map((reward) => {
            const canAfford = activeTab === 'individual' 
              ? (userProfile?.totalXp || 0) >= reward.xpCost
              : (teamPool?.totalXP || 0) >= reward.xpCost;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gradient-to-br ${getRewardColor(reward)} p-0.5 rounded-xl`}
              >
                <div className="bg-gray-900 rounded-xl p-6 h-full flex flex-col">
                  {/* HEADER CARTE */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{reward.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight">
                          {reward.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            canAfford ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {reward.xpCost} XP
                          </span>
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                            {CATEGORY_ICONS[reward.category]} {reward.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOUTONS ADMIN */}
                    {userIsAdmin && showAdminPanel && reward.id && !Object.values(INDIVIDUAL_REWARDS_CATALOG).find(r => r.id === reward.id) && !Object.values(TEAM_REWARDS_CATALOG).find(r => r.id === reward.id) && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setSelectedReward(reward);
                            setRewardForm({ ...reward });
                            setShowEditRewardModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReward(reward.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-gray-300 text-sm mb-4 flex-grow">
                    {reward.description}
                  </p>

                  {/* TYPE BADGE */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      reward.type === 'team' 
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {reward.type === 'team' ? (
                        <>
                          <Users className="w-3 h-3 mr-1" />
                          Équipe
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          Individuelle
                        </>
                      )}
                    </span>
                  </div>

                  {/* STOCK */}
                  {reward.stock !== undefined && reward.stock !== -1 && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-xs">
                        Stock disponible: <span className="text-white font-medium">{reward.stock}</span>
                      </p>
                    </div>
                  )}

                  {/* BOUTON D'ACTION */}
                  <div className="mt-auto">
                    {!userIsAdmin || !showAdminPanel ? (
                      <button
                        onClick={() => activeTab === 'individual' ? requestReward(reward) : requestTeamReward(reward)}
                        disabled={!canAfford || (reward.stock === 0)}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                          canAfford && (reward.stock !== 0)
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>
                          {reward.stock === 0 ? 'Épuisé' : canAfford ? 'Demander' : 'XP insuffisants'}
                        </span>
                      </button>
                    ) : (
                      <div className="text-center text-gray-400 text-sm py-2">
                        Mode administration
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 📋 PANNEAU DEMANDES ADMIN */}
        <AnimatePresence>
          {userIsAdmin && showRequestsPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-yellow-400" />
                Demandes en Attente
              </h2>

              {/* ONGLETS DEMANDES */}
              <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setActiveTab('individual')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
                    activeTab === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Individuelles ({rewardRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
                    activeTab === 'team'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Équipe ({teamRewardRequests.filter(r => r.status === 'pending').length})
                </button>
              </div>

              {/* LISTE DES DEMANDES */}
              <div className="space-y-4">
                {(activeTab === 'individual' ? rewardRequests : teamRewardRequests)
                  .filter(request => request.status === 'pending')
                  .map((request) => {
                    const rewardDetails = activeTab === 'individual' 
                      ? Object.values(INDIVIDUAL_REWARDS_CATALOG).find(r => r.id === request.rewardId) || { name: request.rewardName, xpCost: request.xpCost, category: 'Inconnue' }
                      : Object.values(TEAM_REWARDS_CATALOG).find(r => r.id === request.rewardId) || { name: request.rewardName, xpCost: request.xpCost, category: 'Inconnue' };
                    
                    const canAfford = activeTab === 'individual'
                      ? request.userXP >= request.xpCost
                      : (request.teamPoolXP || 0) >= request.xpCost;

                    return (
                      <div key={request.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-white">{rewardDetails.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                canAfford ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {rewardDetails.xpCost} XP
                              </span>
                              <span className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                                {rewardDetails.category}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{request.userName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{getRelativeTime(request.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Coins className="w-4 h-4" />
                                <span>
                                  {activeTab === 'individual' 
                                    ? `${request.userXP} XP disponibles`
                                    : `Cagnotte: ${request.teamPoolXP || 0} XP`
                                  }
                                </span>
                              </div>
                            </div>

                            {!canAfford && (
                              <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>
                                  ⚠️ {activeTab === 'individual' 
                                    ? `Utilisateur n'a pas assez d'XP (${request.userXP}/${rewardDetails.xpCost})`
                                    : `Cagnotte équipe insuffisante (${request.teamPoolXP}/${rewardDetails.xpCost})`
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => approveRequest(request.id, request)}
                              disabled={!canAfford}
                              className={`p-2 rounded-lg transition-colors ${
                                canAfford
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              }`}
                              title="Approuver"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => rejectRequest(request.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              title="Rejeter"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* MESSAGE SI AUCUNE DEMANDE */}
                {(activeTab === 'individual' ? rewardRequests : teamRewardRequests)
                  .filter(request => request.status === 'pending').length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune demande en attente</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎨 MODAL CRÉER/MODIFIER RÉCOMPENSE */}
        <AnimatePresence>
          {(showCreateRewardModal || showEditRewardModal) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-white mb-6">
                  {showEditRewardModal ? 'Modifier la récompense' : 'Créer une récompense'}
                </h3>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveReward(); }} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Nom de la récompense
                    </label>
                    <input
                      type="text"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={rewardForm.description}
                      onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Type
                      </label>
                      <select
                        value={rewardForm.type}
                        onChange={(e) => setRewardForm({ ...rewardForm, type: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="individual">Individuelle</option>
                        <option value="team">Équipe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Coût XP
                      </label>
                      <input
                        type="number"
                        value={rewardForm.xpCost}
                        onChange={(e) => setRewardForm({ ...rewardForm, xpCost: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Catégorie
                    </label>
                    <select
                      value={rewardForm.category}
                      onChange={(e) => setRewardForm({ ...rewardForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      {rewardForm.type === 'individual' ? (
                        <>
                          <option value="Mini-plaisirs">Mini-plaisirs</option>
                          <option value="Petits avantages">Petits avantages</option>
                          <option value="Plaisirs utiles">Plaisirs utiles</option>
                          <option value="Plaisirs food & cadeaux">Food & cadeaux</option>
                          <option value="Bien-être & confort">Bien-être</option>
                          <option value="Loisirs & sorties">Loisirs</option>
                          <option value="Lifestyle & bonus">Lifestyle</option>
                          <option value="Avantages temps offert">Temps offert</option>
                          <option value="Grands plaisirs">Grands plaisirs</option>
                          <option value="Premium">Premium</option>
                        </>
                      ) : (
                        <>
                          <option value="Team Mini-plaisirs">Team Mini-plaisirs</option>
                          <option value="Team Food">Team Food</option>
                          <option value="Team Loisirs">Team Loisirs</option>
                          <option value="Team Sorties">Team Sorties</option>
                          <option value="Team Formation">Team Formation</option>
                          <option value="Team Premium">Team Premium</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Icône (emoji)
                      </label>
                      <input
                        type="text"
                        value={rewardForm.icon}
                        onChange={(e) => setRewardForm({ ...rewardForm, icon: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="🎁"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Stock (-1 = illimité)
                      </label>
                      <input
                        type="number"
                        value={rewardForm.stock}
                        onChange={(e) => setRewardForm({ ...rewardForm, stock: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        min="-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={rewardForm.isAvailable}
                      onChange={(e) => setRewardForm({ ...rewardForm, isAvailable: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isAvailable" className="text-gray-300 text-sm">
                      Récompense disponible
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {showEditRewardModal ? 'Modifier' : 'Créer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateRewardModal(false);
                        setShowEditRewardModal(false);
                        setSelectedReward(null);
                        resetRewardForm();
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default RewardsPage;
