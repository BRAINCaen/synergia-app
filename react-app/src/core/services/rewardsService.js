// ==========================================
// 📁 react-app/src/core/services/rewardsService.js
// SERVICE DE GESTION DES RÉCOMPENSES BASÉES SUR XP
// ==========================================

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎁 SERVICE DE GESTION DES RÉCOMPENSES SYNERGIA
 */
class RewardsService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 🏆 RÉCOMPENSES INDIVIDUELLES PAR NIVEAUX XP
   */
  getIndividualRewards() {
    return {
      // 🥤 Mini-plaisirs (50-100 XP)
      miniPleasures: {
        category: 'Mini-plaisirs',
        icon: '🥤',
        minXP: 50,
        maxXP: 100,
        color: 'from-green-400 to-blue-500',
        rewards: [
          { id: 'snack_personal', name: 'Goûter personnalisé', xpCost: 50, description: 'Pâtisserie, donuts, croissant, cookie…' },
          { id: 'mini_game', name: 'Mini-jeu de bureau', xpCost: 80, description: 'Antistress, mini-plante, balle à malaxer' },
          { id: 'unlimited_break', name: 'Pause illimitée', xpCost: 100, description: 'Bon "pause illimitée" sur une journée calme' }
        ]
      },

      // ⏰ Petits avantages (100-200 XP)
      smallAdvantages: {
        category: 'Petits avantages',
        icon: '⏰',
        minXP: 100,
        maxXP: 200,
        color: 'from-blue-400 to-purple-500',
        rewards: [
          { id: 'time_off_15min', name: '15 min off', xpCost: 120, description: 'Arriver plus tard/partir plus tôt' },
          { id: 'nap_authorized', name: 'Pause sieste autorisée', xpCost: 150, description: 'Avec réveil garanti !' },
          { id: 'light_shift', name: 'Shift "super light"', xpCost: 180, description: 'Que les tâches sympas' }
        ]
      },

      // 🍱 Plaisirs utiles (200-400 XP)
      usefulPleasures: {
        category: 'Plaisirs utiles',
        icon: '🍱',
        minXP: 200,
        maxXP: 400,
        color: 'from-purple-400 to-pink-500',
        rewards: [
          { id: 'action_voucher', name: 'Bon "action"', xpCost: 220, description: 'Petit achat fun <10€ type Action/Nos/Foir\'Fouille' },
          { id: 'breakfast_surprise', name: 'Petit-déj surprise', xpCost: 280, description: 'Viennoiseries, jus, café…' },
          { id: 'book_choice', name: 'Livre au choix', xpCost: 320, description: 'Roman, BD…' },
          { id: 'pizza_lunch', name: 'Pizza du midi', xpCost: 380, description: 'Solo ou partagée' }
        ]
      },

      // 🍔 Plaisirs food & cadeaux (400-700 XP)
      foodGifts: {
        category: 'Plaisirs food & cadeaux',
        icon: '🍔',
        minXP: 400,
        maxXP: 700,
        color: 'from-pink-400 to-red-500',
        rewards: [
          { id: 'restaurant_voucher', name: 'Bon d\'achat "restauration"', xpCost: 450, description: '10/20€' },
          { id: 'poke_bowl', name: 'Poke bowl/burger livré', xpCost: 520, description: 'Plat du resto préféré livré sur place' },
          { id: 'gift_voucher', name: 'Bon cadeau magasins', xpCost: 600, description: 'Amazon, Fnac, Cultura, Carrefour, Decathlon (10/20€)' },
          { id: 'board_game', name: 'Jeu de société offert', xpCost: 680, description: 'Un jeu de société au choix' }
        ]
      },

      // 🧘 Bien-être & confort (700-1000 XP)
      wellness: {
        category: 'Bien-être & confort',
        icon: '🧘',
        minXP: 700,
        maxXP: 1000,
        color: 'from-red-400 to-yellow-500',
        rewards: [
          { id: 'relaxation_kit', name: 'Kit de relaxation', xpCost: 750, description: 'Masque yeux, bouillotte, infusions…' },
          { id: 'massage', name: 'Petit massage', xpCost: 850, description: 'Chez un pro ou offert par l\'entreprise' },
          { id: 'beauty_kit', name: 'Coffret de soins', xpCost: 920, description: 'Trousse beauté' },
          { id: 'home_office', name: 'Journée télétravail', xpCost: 980, description: 'Si possible' }
        ]
      },

      // 🎉 Loisirs & sorties (1000-1500 XP)
      entertainment: {
        category: 'Loisirs & sorties',
        icon: '🎉',
        minXP: 1000,
        maxXP: 1500,
        color: 'from-yellow-400 to-orange-500',
        rewards: [
          { id: 'cinema_tickets', name: '2 places de cinéma', xpCost: 1100, description: 'Pour toi et ton accompagnant' },
          { id: 'escape_game', name: 'Place d\'escape game', xpCost: 1200, description: 'À offrir (famille/ami)' },
          { id: 'discovery_activity', name: 'Initiation/découverte', xpCost: 1350, description: 'Escalade, atelier créatif, sport fun…' },
          { id: 'team_outing', name: 'Sortie collective', xpCost: 1450, description: 'Resto, bowling, escape (si validée par équipe)' }
        ]
      },

      // 📱 Lifestyle & bonus (1500-2500 XP)
      lifestyle: {
        category: 'Lifestyle & bonus',
        icon: '📱',
        minXP: 1500,
        maxXP: 2500,
        color: 'from-orange-400 to-red-500',
        rewards: [
          { id: 'streaming_subscription', name: 'Abonnement streaming', xpCost: 1600, description: '1 mois Netflix, Spotify, Deezer ou Disney+' },
          { id: 'tech_accessory', name: 'Accessoire high-tech', xpCost: 1800, description: 'Powerbank, support téléphone, mini enceinte…' },
          { id: 'shopping_card', name: 'Carte cadeau shopping', xpCost: 2200, description: 'Multi-enseignes (30/50€)' },
          { id: 'gaming_voucher', name: 'Bon jeux vidéo', xpCost: 2400, description: 'Steam, PlayStation Store…' }
        ]
      },

      // 🗓️ Avantages temps (2500-4000 XP)
      timeAdvantages: {
        category: 'Avantages temps offert',
        icon: '🗓️',
        minXP: 2500,
        maxXP: 4000,
        color: 'from-red-400 to-purple-500',
        rewards: [
          { id: 'hour_off', name: '1 heure de travail offerte', xpCost: 2800, description: 'Ou en moins à effectuer' },
          { id: 'day_off', name: '1 journée off', xpCost: 3500, description: 'Offerte ou payée' },
          { id: 'weekend_pass', name: 'Pass WEEK-END planning', xpCost: 3800, description: 'Weekend libre sur le planning' }
        ]
      },

      // 🍽️ Grands plaisirs (4000-6000 XP)
      bigPleasures: {
        category: 'Grands plaisirs',
        icon: '🍽️',
        minXP: 4000,
        maxXP: 6000,
        color: 'from-purple-400 to-blue-500',
        rewards: [
          { id: 'restaurant_choice', name: 'Bon resto au choix', xpCost: 4200, description: 'Seul·e ou à deux' },
          { id: 'team_aperitif', name: 'Apéro équipe fin de mois', xpCost: 4800, description: 'Dans un bar au choix' },
          { id: 'giant_buffet', name: 'Buffet géant partagé', xpCost: 5500, description: 'Petit-déj ou goûter géant' },
          { id: 'pizza_party_team', name: 'Pizza party équipe', xpCost: 5800, description: 'Repas livré pour l\'équipe' }
        ]
      },

      // 🏅 Premium (6000+ XP)
      premium: {
        category: 'Premium',
        icon: '🏅',
        minXP: 6000,
        maxXP: 15000,
        color: 'from-blue-400 to-green-500',
        rewards: [
          { id: 'premium_card', name: 'Carte cadeau premium', xpCost: 6500, description: '50 ou 100€' },
          { id: 'hotel_night', name: '1 nuit d\'hôtel pour 2', xpCost: 8000, description: 'Si gros niveau d\'XP' },
          { id: 'concert_ticket', name: 'Place concert/spectacle', xpCost: 9500, description: 'Festival, concert, spectacle' },
          { id: 'shopping_budget', name: 'Budget shopping coup de cœur', xpCost: 11000, description: 'Dans une boutique préférée' },
          { id: 'spa_day', name: 'Journée découverte', xpCost: 12500, description: 'Spa, balnéo, hammam, parc d\'attraction…' },
          { id: 'vip_event', name: 'Sortie événement VIP', xpCost: 15000, description: 'Escape géant, parc d\'attraction, événement pro…' }
        ]
      }
    };
  }

  /**
   * 👥 RÉCOMPENSES COLLECTIVES D'ÉQUIPE
   */
  getTeamRewards() {
    return {
      // 🥤 Petites attentions (500-1000 XP collectifs)
      smallTreats: {
        category: 'Petites attentions',
        icon: '🥤',
        minXP: 500,
        maxXP: 1000,
        color: 'from-green-400 to-blue-500',
        rewards: [
          { id: 'candy_bar', name: 'Bar à bonbons/chocolats', xpCost: 600, description: 'Pour tout le monde' },
          { id: 'giant_snack', name: 'Goûter géant livré', xpCost: 800, description: 'Viennoiseries, cookies, pâtisseries' },
          { id: 'giant_breakfast', name: 'Buffet petit-déj "géant"', xpCost: 950, description: 'Avant l\'ouverture' }
        ]
      },

      // 🍕 Food & apéro (1000-2000 XP collectifs)
      foodAperitif: {
        category: 'Food & apéro',
        icon: '🍕',
        minXP: 1000,
        maxXP: 2000,
        color: 'from-blue-400 to-purple-500',
        rewards: [
          { id: 'pizza_party', name: 'Pizza party sur place', xpCost: 1200, description: 'Pour toute l\'équipe' },
          { id: 'aperitif_dinner', name: 'Apéro dinatoire', xpCost: 1600, description: 'Soft ou festif' },
          { id: 'tasting_collective', name: 'Dégustation collective', xpCost: 1800, description: 'Fromages, bières, vins, chocolats…' }
        ]
      },

      // 🎲 Jeux & fun (2000-3500 XP collectifs)
      gamesFun: {
        category: 'Jeux & fun',
        icon: '🎲',
        minXP: 2000,
        maxXP: 3500,
        color: 'from-purple-400 to-pink-500',
        rewards: [
          { id: 'board_game_night', name: 'Soirée jeux de société', xpCost: 2200, description: 'En interne' },
          { id: 'who_is_who', name: 'Animation "qui est qui ?"', xpCost: 2800, description: 'Sur anecdotes d\'équipe' },
          { id: 'creative_workshop', name: 'Atelier créatif collectif', xpCost: 3200, description: 'Peinture, dessin, sculpture collaborative…' },
          { id: 'karaoke', name: 'Karaoké', xpCost: 3400, description: 'Sur appli ou en salle dédiée' }
        ]
      },

      // 🏞️ Sorties & loisirs (3500-6000 XP collectifs)
      outingsLeisure: {
        category: 'Sorties & loisirs',
        icon: '🏞️',
        minXP: 3500,
        maxXP: 6000,
        color: 'from-pink-400 to-red-500',
        rewards: [
          { id: 'cinema_team', name: 'Sortie collective cinéma', xpCost: 3800, description: 'Toute l\'équipe' },
          { id: 'bowling_team', name: 'Sortie bowling/mini-golf', xpCost: 4200, description: 'Ou laser game' },
          { id: 'nature_excursion', name: 'Excursion nature', xpCost: 4800, description: 'Balade forêt, plage, parc aventure' },
          { id: 'picnic_day', name: 'Journée détente', xpCost: 5200, description: 'Parc, pique-nique ou barbecue' },
          { id: 'after_work', name: 'After work', xpCost: 5800, description: 'Dans un bar sympa ou rooftop' }
        ]
      },

      // 😌 Bien-être & relax (6000-8000 XP collectifs)
      wellnessRelax: {
        category: 'Bien-être & relax',
        icon: '😌',
        minXP: 6000,
        maxXP: 8000,
        color: 'from-red-400 to-yellow-500',
        rewards: [
          { id: 'collective_nap', name: 'Sieste collective', xpCost: 6500, description: 'Avec coussins, musique douce…' },
          { id: 'wellness_workshop', name: 'Atelier bien-être', xpCost: 7500, description: 'Yoga, relaxation, sophrologie par un pro' }
        ]
      },

      // 🚀 Activités premium (8000-12000 XP collectifs)
      premiumActivities: {
        category: 'Activités premium',
        icon: '🚀',
        minXP: 8000,
        maxXP: 12000,
        color: 'from-yellow-400 to-orange-500',
        rewards: [
          { id: 'private_escape', name: 'Escape game privé', xpCost: 9000, description: 'Activité privée rien que pour l\'équipe' }
        ]
      },

      // 🎁 Grands moments (12000-20000 XP collectifs)
      bigMoments: {
        category: 'Grands moments',
        icon: '🎁',
        minXP: 12000,
        maxXP: 20000,
        color: 'from-orange-400 to-red-500',
        rewards: [
          { id: 'vip_day', name: 'Journée VIP', xpCost: 13500, description: 'Activités surprises hors du commun' },
          { id: 'weekend_surprise', name: 'Week-end surprise', xpCost: 16000, description: 'Si très gros budget/réussite' },
          { id: 'common_fund', name: 'Cagnotte commune', xpCost: 18000, description: 'Pour choisir ensemble un cadeau (enceinte, Switch, mobilier…)' },
          { id: 'collective_voucher', name: 'Chèque cadeau collectif', xpCost: 19500, description: 'Parc d\'attraction, resto étoilé…' }
        ]
      },

      // ✨ Exceptionnel (20000+ XP collectifs)
      exceptional: {
        category: 'Exceptionnel',
        icon: '✨',
        minXP: 20000,
        maxXP: 50000,
        color: 'from-red-400 to-purple-500',
        rewards: [
          { id: 'vip_guest', name: 'Intervenant VIP surprise', xpCost: 22000, description: 'Magicien, chef, humoriste…' },
          { id: 'no_constraint_day', name: 'Journée sans contrainte', xpCost: 28000, description: 'Chacun fait son planning à sa sauce' },
          { id: 'unique_event', name: 'Événement d\'équipe unique', xpCost: 35000, description: 'Escape géant, parc à thème, activité insolite' }
        ]
      }
    };
  }

  /**
   * 🎯 OBTENIR TOUTES LES RÉCOMPENSES DISPONIBLES POUR UN UTILISATEUR
   */
  getAvailableRewardsForUser(userXP) {
    const individualRewards = this.getIndividualRewards();
    const availableRewards = [];

    Object.values(individualRewards).forEach(category => {
      if (userXP >= category.minXP) {
        const affordableRewards = category.rewards.filter(reward => reward.xpCost <= userXP);
        if (affordableRewards.length > 0) {
          availableRewards.push({
            ...category,
            rewards: affordableRewards
          });
        }
      }
    });

    return availableRewards;
  }

  /**
   * 🏆 OBTENIR LES RÉCOMPENSES D'ÉQUIPE DISPONIBLES
   */
  getAvailableTeamRewards(teamTotalXP) {
    const teamRewards = this.getTeamRewards();
    const availableTeamRewards = [];

    Object.values(teamRewards).forEach(category => {
      if (teamTotalXP >= category.minXP) {
        const affordableRewards = category.rewards.filter(reward => reward.xpCost <= teamTotalXP);
        if (affordableRewards.length > 0) {
          availableTeamRewards.push({
            ...category,
            rewards: affordableRewards
          });
        }
      }
    });

    return availableTeamRewards;
  }

  /**
   * 🎁 DEMANDER UNE RÉCOMPENSE
   */
  async requestReward(userId, rewardId, rewardType = 'individual') {
    try {
      const requestData = {
        userId,
        rewardId,
        rewardType,
        status: 'pending',
        requestedAt: serverTimestamp(),
        approvedAt: null,
        approvedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null
      };

      const requestRef = await addDoc(collection(db, 'rewardRequests'), requestData);
      
      console.log('✅ Demande de récompense créée:', requestRef.id);
      return { success: true, requestId: requestRef.id };
    } catch (error) {
      console.error('❌ Erreur demande récompense:', error);
      throw error;
    }
  }

  /**
   * 👑 APPROUVER UNE DEMANDE DE RÉCOMPENSE (ADMIN)
   */
  async approveRewardRequest(requestId, adminId, userCurrentXP) {
    try {
      const requestRef = doc(db, 'rewardRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        throw new Error('Demande introuvable');
      }

      const requestData = requestDoc.data();
      
      // Vérifier si l'utilisateur a encore assez d'XP
      const individualRewards = this.getIndividualRewards();
      let rewardFound = null;
      let rewardCost = 0;

      Object.values(individualRewards).forEach(category => {
        const reward = category.rewards.find(r => r.id === requestData.rewardId);
        if (reward) {
          rewardFound = reward;
          rewardCost = reward.xpCost;
        }
      });

      if (!rewardFound) {
        throw new Error('Récompense introuvable');
      }

      if (userCurrentXP < rewardCost) {
        throw new Error('XP insuffisants');
      }

      // Approuver la demande
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: adminId
      });

      // Déduire les XP de l'utilisateur
      const userRef = doc(db, 'users', requestData.userId);
      await updateDoc(userRef, {
        'gamification.totalXp': increment(-rewardCost),
        'gamification.rewardsRedeemed': increment(1),
        'gamification.lastRewardRedeemed': serverTimestamp()
      });

      console.log('✅ Récompense approuvée et XP déduits');
      return { success: true, xpDeducted: rewardCost };
    } catch (error) {
      console.error('❌ Erreur approbation récompense:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UNE DEMANDE DE RÉCOMPENSE (ADMIN)
   */
  async rejectRewardRequest(requestId, adminId, reason) {
    try {
      const requestRef = doc(db, 'rewardRequests', requestId);
      
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: adminId,
        rejectionReason: reason
      });

      console.log('✅ Demande de récompense rejetée');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur rejet récompense:', error);
      throw error;
    }
  }

  /**
   * 📋 OBTENIR LES DEMANDES DE RÉCOMPENSES EN ATTENTE (ADMIN)
   */
  async getPendingRewardRequests() {
    try {
      const q = query(
        collection(db, 'rewardRequests'),
        where('status', '==', 'pending'),
        orderBy('requestedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const requests = [];

      for (const doc of snapshot.docs) {
        const requestData = doc.data();
        
        // Récupérer les données utilisateur
        const userRef = doc(db, 'users', requestData.userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : null;

        requests.push({
          id: doc.id,
          ...requestData,
          userData
        });
      }

      return requests;
    } catch (error) {
      console.error('❌ Erreur récupération demandes:', error);
      throw error;
    }
  }

  /**
   * 📈 OBTENIR L'HISTORIQUE DES RÉCOMPENSES D'UN UTILISATEUR
   */
  async getUserRewardHistory(userId) {
    try {
      const q = query(
        collection(db, 'rewardRequests'),
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Erreur historique récompenses:', error);
      throw error;
    }
  }

  /**
   * 📊 ÉCOUTER LES DEMANDES EN TEMPS RÉEL (ADMIN)
   */
  listenToPendingRequests(callback) {
    const q = query(
      collection(db, 'rewardRequests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = [];

      for (const doc of snapshot.docs) {
        const requestData = doc.data();
        
        // Récupérer les données utilisateur
        try {
          const userRef = doc(db, 'users', requestData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : null;

          requests.push({
            id: doc.id,
            ...requestData,
            userData
          });
        } catch (error) {
          console.error('❌ Erreur récupération utilisateur:', error);
          requests.push({
            id: doc.id,
            ...requestData,
            userData: null
          });
        }
      }

      callback(requests);
    });

    this.listeners.set('pendingRequests', unsubscribe);
    return unsubscribe;
  }

  /**
   * 🧹 NETTOYER LES ABONNEMENTS
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

// Export singleton
export const rewardsService = new RewardsService();
export default rewardsService;
