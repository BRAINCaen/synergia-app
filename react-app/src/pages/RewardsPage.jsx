import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Coins, ShoppingCart, Award, Crown, Gem, Zap, Trophy, Target } from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(1250);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // Récompenses simulées
  const availableRewards = [
    {
      id: 1,
      name: 'Badge Premium',
      description: 'Badge exclusif pour votre profil',
      cost: 100,
      category: 'badges',
      icon: '🏆',
      rarity: 'common'
    },
    {
      id: 2,
      name: 'Avatar Personnalisé',
      description: 'Avatar unique pour se démarquer',
      cost: 250,
      category: 'cosmetic',
      icon: '🎭',
      rarity: 'rare'
    },
    {
      id: 3,
      name: 'Bonus XP 24h',
      description: 'Double XP pendant 24 heures',
      cost: 300,
      category: 'boost',
      icon: '⚡',
      rarity: 'rare'
    },
    {
      id: 4,
      name: 'Titre Légendaire',
      description: 'Titre exclusif "Maître de Synergia"',
      cost: 500,
      category: 'titles',
      icon: '👑',
      rarity: 'legendary'
    },
    {
      id: 5,
      name: 'Thème Sombre Premium',
      description: 'Interface sombre exclusive',
      cost: 200,
      category: 'themes',
      icon: '🌙',
      rarity: 'uncommon'
    },
    {
      id: 6,
      name: 'Certificat Excellence',
      description: 'Certificat imprimable de performance',
      cost: 400,
      category: 'certificates',
      icon: '📜',
      rarity: 'epic'
    }
  ];

  const headerStats = [
    { label: "Mes points", value: userPoints.toLocaleString(), icon: Coins, color: "text-yellow-400" },
    { label: "Récompenses", value: availableRewards.length.toString(), icon: Gift, color: "text-blue-400" },
    { label: "Échangées", value: "3", icon: Award, color: "text-green-400" },
    { label: "Économisées", value: "1,250", icon: Star, color: "text-purple-400" }
  ];

  const headerActions = (
    <div className="flex space-x-3">
      <PremiumButton variant="secondary" icon={Trophy}>
        Historique
      </PremiumButton>
      <PremiumButton variant="primary" icon={ShoppingCart}>
        Boutique
      </PremiumButton>
    </div>
  );

  const categories = [
    { id: 'all', name: 'Toutes', icon: Gift },
    { id: 'badges', name: 'Badges', icon: Award },
    { id: 'cosmetic', name: 'Cosmétiques', icon: Star },
    { id: 'boost', name: 'Bonus', icon: Zap },
    { id: 'titles', name: 'Titres', icon: Crown },
    { id: 'themes', name: 'Thèmes', icon: Gem },
    { id: 'certificates', name: 'Certificats', icon: Target }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10';
      case 'uncommon': return 'border-green-500 bg-green-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity) {
      case 'common': return 'Commun';
      case 'uncommon': return 'Peu commun';
      case 'rare': return 'Rare';
      case 'epic': return 'Épique';
      case 'legendary': return 'Légendaire';
      default: return 'Commun';
    }
  };

  const filteredRewards = selectedCategory === 'all' 
    ? availableRewards 
    : availableRewards.filter(reward => reward.category === selectedCategory);

  const handlePurchase = (reward) => {
    if (userPoints >= reward.cost) {
      setUserPoints(prev => prev - reward.cost);
      setPurchaseHistory(prev => [...prev, { ...reward, purchasedAt: new Date() }]);
      // Animation d'achat réussi
      alert(`${reward.name} acheté avec succès !`);
    } else {
      alert('Points insuffisants !');
    }
  };

  return (
    <PremiumLayout
      title="Récompenses"
      subtitle="Échangez vos points contre des récompenses exclusives"
      icon={Gift}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Solde de points */}
      <div className="mb-6">
        <PremiumCard>
          <div className="text-center py-6">
            <div className="flex items-center justify-center mb-4">
              <Coins className="w-16 h-16 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {userPoints.toLocaleString()} Points
            </h2>
            <p className="text-gray-400">Votre solde disponible</p>
            <div className="mt-4">
              <PremiumButton variant="primary" icon={Zap}>
                Gagner plus de points
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Filtres par catégorie */}
      <div className="mb-6">
        <PremiumCard>
          <h3 className="text-white text-lg font-semibold mb-4">Catégories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </PremiumCard>
      </div>

      {/* Grille des récompenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-all ${getRarityColor(reward.rarity)}`}
          >
            <div className="text-center">
              {/* Icône de la récompense */}
              <div className="text-6xl mb-4">{reward.icon}</div>
              
              {/* Nom et rareté */}
              <h3 className="text-white font-bold text-lg mb-2">{reward.name}</h3>
              <div className="mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reward.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                  reward.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                  reward.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                  reward.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {getRarityText(reward.rarity)}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
              
              {/* Prix et bouton d'achat */}
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-1">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-lg">{reward.cost}</span>
                </div>
                
                <button
                  onClick={() => handlePurchase(reward)}
                  disabled={userPoints < reward.cost}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                    userPoints >= reward.cost
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {userPoints >= reward.cost ? 'Acheter' : 'Points insuffisants'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Section historique des achats */}
      {purchaseHistory.length > 0 && (
        <div className="mt-8">
          <PremiumCard>
            <h3 className="text-white text-xl font-semibold mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
              Mes achats récents
            </h3>
            <div className="space-y-3">
              {purchaseHistory.slice(-5).reverse().map((purchase, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{purchase.icon}</div>
                    <div>
                      <p className="text-white font-medium">{purchase.name}</p>
                      <p className="text-gray-400 text-sm">
                        {purchase.purchasedAt.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <Coins className="w-4 h-4 mr-1" />
                    <span className="font-medium">{purchase.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default RewardsPage;
