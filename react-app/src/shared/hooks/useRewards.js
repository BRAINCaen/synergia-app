import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import useAuthStore from '../store/authStore';

const INDIVIDUAL_REWARDS = [
  { id: 1, title: 'Formation Gratuite', description: 'Accès à une formation en ligne de votre choix', requiredXP: 500, type: 'individual', icon: '📚', category: 'formation' },
  { id: 2, title: 'Pizza offerte !', description: 'Pizza au choix au distributeur de pizza :)', requiredXP: 200, type: 'individual', icon: '🍕', category: 'food' },
  { id: 3, title: 'Bon d\'achat 20€', description: 'Utilisable dans nos magasins partenaires', requiredXP: 1000, type: 'individual', icon: '🎁', category: 'shopping' },
  { id: 4, title: 'Journée de télétravail', description: 'Une journée de travail à distance supplémentaire', requiredXP: 750, type: 'individual', icon: '🏠', category: 'work' },
  { id: 5, title: 'Café Premium', description: 'Accès au café premium pendant un mois', requiredXP: 300, type: 'individual', icon: '☕', category: 'food' },
];

const TEAM_REWARDS = [
  { id: 101, title: 'Sortie d\'équipe', description: 'Bowling ou laser game pour toute l\'équipe', requiredXP: 5000, type: 'team', icon: '🎳', category: 'team' },
  { id: 102, title: 'Déjeuner d\'équipe', description: 'Restaurant pour toute l\'équipe', requiredXP: 3000, type: 'team', icon: '🍽️', category: 'team' },
  { id: 103, title: 'Atelier bien-être', description: 'Session de yoga ou massage pour l\'équipe', requiredXP: 4000, type: 'team', icon: '🧘', category: 'team' },
  { id: 104, title: 'Escape Game', description: 'Sortie escape game pour toute l\'équipe', requiredXP: 2500, type: 'team', icon: '🔐', category: 'team' },
  { id: 105, title: 'Journée team building', description: 'Activité team building au choix', requiredXP: 7500, type: 'team', icon: '🤝', category: 'team' },
];

const ALL_REWARDS = [...INDIVIDUAL_REWARDS, ...TEAM_REWARDS];

const useRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [pendingRewards, setPendingRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamTotalXP, setTeamTotalXP] = useState(0);
  
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Récupérer tous les utilisateurs pour calculer le total XP d'équipe
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let totalXP = 0;
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          totalXP += userData.xp || 0;
        });
        setTeamTotalXP(totalXP);

        // Récupérer les récompenses demandées
        const rewardsSnapshot = await getDocs(collection(db, 'rewards'));
        const rewardsData = rewardsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Séparer les récompenses selon leur statut
        const claimed = rewardsData.filter(r => 
          r.userId === user.uid && r.status === 'claimed'
        );
        const pending = rewardsData.filter(r => 
          r.userId === user.uid && r.status === 'pending'
        );

        setClaimedRewards(claimed);
        setPendingRewards(pending);

        // Filtrer les récompenses disponibles
        const userXP = user.xp || 0;
        
        const available = ALL_REWARDS.filter(reward => {
          const requiredXP = reward.type === 'team' ? teamTotalXP : userXP;
          const isAffordable = requiredXP >= reward.requiredXP;
          const notClaimed = !claimed.some(c => c.rewardId === reward.id);
          const notPending = !pending.some(p => p.rewardId === reward.id);
          
          return isAffordable && notClaimed && notPending;
        });

        setAvailableRewards(available);
        setRewards(ALL_REWARDS);

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return {
    rewards,
    availableRewards,
    claimedRewards,
    pendingRewards,
    loading,
    teamTotalXP,
    individualXP: user?.xp || 0
  };
};

export default useRewards;
