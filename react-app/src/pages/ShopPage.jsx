// ==========================================
// 📁 react-app/src/pages/ShopPage.jsx
// BOUTIQUE DE RÉCOMPENSES COMPLÈTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Star, 
  Coins, 
  Gift, 
  Trophy, 
  Crown, 
  Gem, 
  Package,
  Check,
  X,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Zap,
  Heart,
  Award,
  Flame,
  Shield,
  Target
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { useToast } from '../shared/components/ui/Toast.jsx';

/**
 * 🛍️ PAGE BOUTIQUE COMPLÈTE
 */
const ShopPage = () => {
  const { user } = useAuthStore();
  const { success, error, info } = useToast();
  
  // États principaux
  const [userXP, setUserXP] = useState(1250); // Mock data
  const [userCoins, setUserCoins] = useState(850); // Mock data
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [showCart, setShowCart] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // Données des articles de la boutique
  const shopItems = [
    // Cosmétiques
    {
      id: 'avatar_crown',
      name: 'Couronne Dorée',
      description: 'Avatar exclusif avec couronne dorée',
      category: 'cosmetic',
      price: 500,
      currency: 'xp',
      rarity: 'legendary',
      icon: Crown,
      preview: '👑',
      inStock: true,
      limited: false
    },
    {
      id: 'badge_flame',
      name: 'Badge Flamme',
      description: 'Badge animé avec effet flamme',
      category: 'cosmetic',
      price: 300,
      currency: 'xp',
      rarity: 'epic',
      icon: Flame,
      preview: '🔥',
      inStock: true,
      limited: false
    },
    {
      id: 'title_master',
      name: 'Titre "Maître"',
      description: 'Titre spécial affiché sur votre profil',
      category: 'cosmetic',
      price: 200,
      currency: 'coins',
      rarity: 'rare',
      icon: Star,
      preview: '⭐',
      inStock: true,
      limited: false
    },
    
    // Boosters
    {
      id: 'xp_boost_24h',
      name: 'Boost XP 24h',
      description: '+50% XP pendant 24 heures',
      category: 'booster',
      price: 150,
      currency: 'coins',
      rarity: 'common',
      icon: Zap,
      preview: '⚡',
      inStock: true,
      limited: false,
      duration: '24h'
    },
    {
      id: 'streak_protection',
      name: 'Protection de Série',
      description: 'Protège votre série en cas d\'absence',
      category: 'booster',
      price: 100,
      currency: 'coins',
      rarity: 'common',
      icon: Shield,
      preview: '🛡️',
      inStock: true,
      limited: false
    },
    {
      id: 'task_multiplier',
      name: 'Multiplicateur de Tâches',
      description: 'Double les récompenses des 5 prochaines tâches',
      category: 'booster',
      price: 250,
      currency: 'xp',
      rarity: 'rare',
      icon: Target,
      preview: '🎯',
      inStock: true,
      limited: false
    },
    
    // Récompenses physiques
    {
      id: 'coffee_voucher',
      name: 'Bon Café',
      description: 'Bon pour un café offert',
      category: 'physical',
      price: 400,
      currency: 'coins',
      rarity: 'rare',
      icon: Gift,
      preview: '☕',
      inStock: 5,
      limited: true
    },
    {
      id: 'team_lunch',
      name: 'Déjeuner d\'Équipe',
      description: 'Organisez un déjeuner pour votre équipe',
      category: 'physical',
      price: 1000,
      currency: 'xp',
      rarity: 'legendary',
      icon: Heart,
      preview: '🍽️',
      inStock: 2,
      limited: true
    },
    
    // Articles exclusifs
    {
      id: 'founder_badge',
      name: 'Badge Fondateur',
      description: 'Badge exclusif des premiers utilisateurs',
      category: 'exclusive',
      price: 1500,
      currency: 'xp',
      rarity: 'mythic',
      icon: Gem,
      preview: '💎',
      inStock: 1,
      limited: true
    }
  ];

  // Catégories
  const categories = [
    { id: 'all', name: 'Tout', icon: Package },
    { id: 'cosmetic', name: 'Cosmétiques', icon: Star },
    { id: 'booster', name: 'Boosters', icon: Zap },
    { id: 'physical', name: 'Récompenses', icon: Gift },
    { id: 'exclusive', name: 'Exclusifs', icon: Crown }
  ];

  // Couleurs par rareté
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
    mythic: 'from-pink-400 to-red-600'
  };

  // Filtrer les articles
  const filteredItems = shopItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      default:
        return 0;
    }
  });

  // Ajouter au panier
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    success(`${item.name} ajouté au panier !`);
  };

  // Supprimer du panier
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Calculer le total du panier
  const cartTotal = cart.reduce((total, item) => ({
    xp: total.xp + (item.currency === 'xp' ? item.price * item.quantity : 0),
    coins: total.coins + (item.currency === 'coins' ? item.price * item.quantity : 0)
  }), { xp: 0, coins: 0 });

  // Vérifier si l'utilisateur peut acheter
  const canAfford = (item) => {
    if (item.currency === 'xp') {
      return userXP >= item.price;
    } else {
      return userCoins >= item.price;
    }
  };

  // Acheter les articles du panier
  const purchaseCart = async () => {
    if (cart.length === 0) return;

    setPurchasing(true);
    try {
      // Vérifier si l'utilisateur peut se permettre tous les articles
      if (cartTotal.xp > userXP || cartTotal.coins > userCoins) {
        error('Fonds insuffisants pour cet achat !');
        return;
      }

      // Simuler l'achat
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Déduire les coûts
      setUserXP(prev => prev - cartTotal.xp);
      setUserCoins(prev => prev - cartTotal.coins);

      // Vider le panier
      setCart([]);
      setShowCart(false);

      success(`Achat réussi ! ${cart.length} article(s) ajouté(s) à votre inventaire.`);

    } catch (err) {
      error('Erreur lors de l\'achat. Veuillez réessayer.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header avec stats utilisateur */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                🛍️ Boutique de Récompenses
              </h1>
              <p className="text-purple-100">Échangez vos points contre des récompenses exclusives</p>
            </div>
            
            {/* Soldes utilisateur */}
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">XP</span>
                </div>
                <div className="text-xl font-bold">{userXP.toLocaleString()}</div>
              </div>
              
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm font-medium">Coins</span>
                </div>
                <div className="text-xl font-bold">{userCoins.toLocaleString()}</div>
              </div>
              
              {/* Bouton panier */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="bg-white/20 backdrop-blur rounded-lg p-3 relative hover:bg-white/30 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Catégories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                    ${activeCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>

            {/* Recherche et tri */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="price">Prix</option>
                <option value="name">Nom</option>
                <option value="rarity">Rareté</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grille des articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Header avec rareté */}
              <div className={`
                bg-gradient-to-r ${rarityColors[item.rarity]} 
                text-white text-xs font-bold px-2 py-1 rounded-full mb-4 inline-block
              `}>
                {item.rarity.toUpperCase()}
              </div>

              {/* Icône de l'article */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{item.preview}</div>
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>

              {/* Prix et stock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {item.currency === 'xp' ? 
                      <Zap className="w-4 h-4 text-blue-500" /> :
                      <Coins className="w-4 h-4 text-yellow-500" />
                    }
                    <span className="font-bold text-lg">{item.price.toLocaleString()}</span>
                  </div>
                  
                  {item.limited && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      Stock: {item.inStock}
                    </span>
                  )}
                </div>

                {/* Bouton d'achat */}
                <button
                  onClick={() => addToCart(item)}
                  disabled={!canAfford(item) || item.inStock === 0}
                  className={`
                    w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                    ${canAfford(item) && item.inStock > 0
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {item.inStock === 0 ? (
                    'Épuisé'
                  ) : !canAfford(item) ? (
                    'Fonds insuffisants'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Ajouter
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}

        {/* Panier coulissant */}
        <AnimatePresence>
          {showCart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCart(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Panier</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Votre panier est vide</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Articles du panier */}
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{item.preview}</span>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            Quantité: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {(item.price * item.quantity).toLocaleString()}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        {cartTotal.xp > 0 && (
                          <div className="flex justify-between font-semibold">
                            <span>Total XP:</span>
                            <span>{cartTotal.xp.toLocaleString()}</span>
                          </div>
                        )}
                        {cartTotal.coins > 0 && (
                          <div className="flex justify-between font-semibold">
                            <span>Total Coins:</span>
                            <span>{cartTotal.coins.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Bouton d'achat */}
                      <button
                        onClick={purchaseCart}
                        disabled={purchasing || cartTotal.xp > userXP || cartTotal.coins > userCoins}
                        className={`
                          w-full mt-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                          ${(cartTotal.xp <= userXP && cartTotal.coins <= userCoins) && !purchasing
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        {purchasing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Achat en cours...
                          </>
                        ) : cartTotal.xp > userXP || cartTotal.coins > userCoins ? (
                          'Fonds insuffisants'
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Acheter ({cart.length} article{cart.length > 1 ? 's' : ''})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopPage;
