// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// BOUTIQUE DES RÉCOMPENSES SYNERGIA AUTHENTIQUES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Star, Zap, Crown, Award, ShoppingBag, 
  Coffee, Gamepad2, Palette, Clock, CheckCircle,
  Lock, Unlock, Filter, Search, Tag, Trophy,
  Target, Calendar, Users, Coins, RefreshCw, X,
  ShoppingCart, Heart, Sparkles, Flame, Candy,
  Car, Home, Utensils, Shirt, Music, Camera,
  Gamepad, BookOpen, Dumbbell, Plane, MapPin
} from 'lucide-react';
import { useUnifiedXP } from '../shared/hooks/useUnifiedXP.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { rewardsPurchaseService } from '../core/services/rewardsPurchaseService.js';

/**
 * 🎉 NOTIFICATION DE SUCCÈS D'ACHAT
 */
const PurchaseSuccessNotification = ({ purchaseSuccess, onClose }) => {
  if (!purchaseSuccess) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-xl z-50 max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{purchaseSuccess.reward.icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">Achat réussi ! 🎉</h4>
          <p className="text-sm opacity-90 mb-2">{purchaseSuccess.reward.name}</p>
          <div className="text-xs opacity-75">
            <div>XP avant: {purchaseSuccess.previousXp.toLocaleString()}</div>
            <div>XP après: {purchaseSuccess.newXp.toLocaleString()}</div>
            <div>Coût: -{purchaseSuccess.reward.cost} XP</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * 🎁 BOUTIQUE DES RÉCOMPENSES SYNERGIA AUTHENTIQUES
 */
const RewardsPage = () => {
  const { user } = useAuthStore();
  
  // ✅ DONNÉES XP UNIFIÉES
  const {
    gamificationData,
    level,
    totalXp,
    badges,
    loading,
    isReady,
    syncStatus,
    lastUpdate,
    addXP,
    forceSync
  } = useUnifiedXP();

  // États locaux
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  // 🎁 RÉCOMPENSES SYNERGIA AUTHENTIQUES BASÉES SUR VOS GAINS XP
  const rewardsData = {
    mini_plaisirs: [
      {
        id: 'bonbons_sachet',
        name: 'Sachet de bonbons à emporter',
        description: 'Sélection de bonbons au choix',
        icon: '🍭',
        cost: 25, // ~2-3 tâches simples
        category: 'mini_plaisirs',
        unlocked: true,
        requirement: 'Toujours disponible'
      },
      {
        id: 'snack_sale',
        name: 'Snack salé premium',
        description: 'Chips, bretzel, fromage, apéro au choix',
        icon: '🥨',
        cost: 30,
        category: 'mini_plaisirs',
        unlocked: true,
        requirement: 'Toujours disponible'
      },
      {
        id: 'boisson_soda',
        name: 'Boisson soda ou jus au choix',
        description: '1 bouteille de votre boisson préférée',
        icon: '🥤',
        cost: 20,
        category: 'mini_plaisirs',
        unlocked: true,
        requirement: 'Toujours disponible'
      },
      {
        id: 'cafe_special',
        name: 'Café spécial premium',
        description: 'Starbucks, Coffee Shop ou café artisanal',
        icon: '☕',
        cost: 35,
        category: 'mini_plaisirs',
        unlocked: true,
        requirement: 'Toujours disponible'
      },
      {
        id: 'fruits_saison',
        name: 'Panier fruits de saison',
        description: 'Sélection de fruits frais et de saison',
        icon: '🍎',
        cost: 40,
        category: 'mini_plaisirs',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'glace_service',
        name: 'Glace en fin de service',
        description: 'Une glace pour terminer la journée en douceur',
        icon: '🍦',
        cost: 30,
        category: 'mini_plaisirs',
        unlocked: true,
        requirement: 'Toujours disponible'
      },
      {
        id: 'chocolats_premium',
        name: 'Pack chocolats premium',
        description: 'Sélection de chocolats et friandises haut de gamme',
        icon: '🍫',
        cost: 45,
        category: 'mini_plaisirs',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'gouter_personnalise',
        name: 'Goûter personnalisé',
        description: 'Pâtisserie, donuts, croissant, cookie au choix',
        icon: '🧁',
        cost: 40,
        category: 'mini_plaisirs',
        unlocked: true,
        requirement: 'Toujours disponible'
      }
    ],

    petits_avantages: [
      {
        id: 'quinze_min_off',
        name: '15 min off',
        description: 'Arriver plus tard ou partir plus tôt',
        icon: '⏰',
        cost: 50, // ~2-3 tâches moyennes
        category: 'petits_avantages',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'pause_sieste',
        name: 'Pause sieste autorisée',
        description: 'Avec réveil garanti par un collègue !',
        icon: '😴',
        cost: 60,
        category: 'petits_avantages',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'droit_oubli',
        name: 'Droit à l\'oubli',
        description: '1 oubli ou retard "pardonnés" sans conséquence',
        icon: '🤫',
        cost: 80,
        category: 'petits_avantages',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'papeterie_fun',
        name: 'Pack papeterie original',
        description: 'Carnet, stylos fun, post-it originaux',
        icon: '📝',
        cost: 45,
        category: 'petits_avantages',
        unlocked: true,
        requirement: 'Toujours disponible'
      },
      {
        id: 'gadget_bureau',
        name: 'Gadget de bureau anti-stress',
        description: 'Mini-plante, balle à malaxer, objet zen',
        icon: '🌱',
        cost: 55,
        category: 'petits_avantages',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'shift_light',
        name: 'Shift "super light"',
        description: 'Que les tâches sympas de la journée',
        icon: '😎',
        cost: 85,
        category: 'petits_avantages',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'pause_illimitee',
        name: 'Pause illimitée',
        description: 'Sur une journée calme uniquement',
        icon: '🏖️',
        cost: 70,
        category: 'petits_avantages',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      }
    ],

    plaisirs_utiles: [
      {
        id: 'bon_action',
        name: 'Bon "Action/Foir\'Fouille"',
        description: 'Petit achat fun <10€ dans ces magasins',
        icon: '🛍️',
        cost: 120, // ~4-6 tâches moyennes
        category: 'plaisirs_utiles',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'lavage_voiture',
        name: 'Bon pour laver sa voiture',
        description: 'Service de lavage auto offert',
        icon: '🚗',
        cost: 150,
        category: 'plaisirs_utiles',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      },
      {
        id: 'heure_off',
        name: '1 heure off payée',
        description: '1 heure de pause offerte et payée',
        icon: '🕐',
        cost: 100,
        category: 'plaisirs_utiles',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'petit_dej_surprise',
        name: 'Petit-déj surprise',
        description: 'Viennoiseries, jus, café premium',
        icon: '🥐',
        cost: 110,
        category: 'plaisirs_utiles',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'tshirt_fun',
        name: 'T-shirt ou mug humoristique',
        description: 'Personnalisé selon vos goûts',
        icon: '👕',
        cost: 90,
        category: 'plaisirs_utiles',
        unlocked: level >= 2,
        requirement: 'Niveau 2'
      },
      {
        id: 'livre_choix',
        name: 'Livre au choix',
        description: 'Roman, BD, manga ou livre technique',
        icon: '📚',
        cost: 130,
        category: 'plaisirs_utiles',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'pizza_midi',
        name: 'Pizza du midi',
        description: 'Solo ou partagée avec l\'équipe',
        icon: '🍕',
        cost: 140,
        category: 'plaisirs_utiles',
        unlocked: level >= 3,
        requirement: 'Niveau 3'
      },
      {
        id: 'activite_loisir',
        name: 'Activité loisir locale',
        description: 'Bowling, laser game, mini-golf, arcade',
        icon: '🎯',
        cost: 160,
        category: 'plaisirs_utiles',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      }
    ],

    food_cadeaux: [
      {
        id: 'bon_resto',
        name: 'Bon d\'achat restauration',
        description: 'Ticket restaurant 15-25€',
        icon: '🎫',
        cost: 200, // ~8-10 tâches moyennes
        category: 'food_cadeaux',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      },
      {
        id: 'livraison_premium',
        name: 'Poke bowl/burger livré',
        description: 'Plat premium livré sur le lieu de travail',
        icon: '🥗',
        cost: 180,
        category: 'food_cadeaux',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      },
      {
        id: 'uber_eats',
        name: 'Repas Uber Eats/Deliveroo',
        description: 'Commande dans votre restaurant préféré',
        icon: '📱',
        cost: 170,
        category: 'food_cadeaux',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      },
      {
        id: 'bon_cadeau_shopping',
        name: 'Bon cadeau multi-enseignes',
        description: 'Amazon, Fnac, Cultura, Carrefour (15-25€)',
        icon: '🎁',
        cost: 220,
        category: 'food_cadeaux',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      },
      {
        id: 'carte_carburant',
        name: 'Carte carburant',
        description: 'Ou recharge électrique selon votre véhicule',
        icon: '⛽',
        cost: 250,
        category: 'food_cadeaux',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      },
      {
        id: 'bougie_parfumee',
        name: 'Bougie parfumée premium',
        description: 'Ou diffuseur d\'huiles essentielles',
        icon: '🕯️',
        cost: 190,
        category: 'food_cadeaux',
        unlocked: level >= 4,
        requirement: 'Niveau 4'
      }
    ],

    bien_etre: [
      {
        id: 'kit_relaxation',
        name: 'Kit de relaxation',
        description: 'Masque yeux, bouillotte, infusions zen',
        icon: '🧘‍♀️',
        cost: 280, // ~12-14 tâches moyennes
        category: 'bien_etre',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      },
      {
        id: 'massage_pro',
        name: 'Massage professionnel',
        description: 'Chez un pro ou offert par l\'entreprise',
        icon: '💆‍♀️',
        cost: 350,
        category: 'bien_etre',
        unlocked: level >= 6,
        requirement: 'Niveau 6'
      },
      {
        id: 'soins_beaute',
        name: 'Coffret soins/beauté',
        description: 'Trousse beauté ou produits de soins',
        icon: '💄',
        cost: 300,
        category: 'bien_etre',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      },
      {
        id: 'manucure_coiffure',
        name: 'Séance manucure/coiffure',
        description: 'Bon pour institut de beauté',
        icon: '💅',
        cost: 320,
        category: 'bien_etre',
        unlocked: level >= 6,
        requirement: 'Niveau 6'
      },
      {
        id: 'teletravail_jour',
        name: 'Journée télétravail',
        description: 'Si possible selon l\'organisation',
        icon: '🏠',
        cost: 250,
        category: 'bien_etre',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      }
    ],

    loisirs_sorties: [
      {
        id: 'cinema_places',
        name: '2 places de cinéma',
        description: 'Pour vous et un accompagnateur',
        icon: '🎬',
        cost: 400, // ~16-20 tâches moyennes 
        category: 'loisirs_sorties',
        unlocked: level >= 6,
        requirement: 'Niveau 6'
      },
      {
        id: 'escape_game',
        name: 'Place d\'escape game',
        description: 'À offrir famille/ami ou à utiliser',
        icon: '🔐',
        cost: 380,
        category: 'loisirs_sorties',
        unlocked: level >= 6,
        requirement: 'Niveau 6'
      },
      {
        id: 'initiation_sport',
        name: 'Initiation/découverte',
        description: 'Escalade, atelier créatif, sport fun',
        icon: '🧗‍♀️',
        cost: 420,
        category: 'loisirs_sorties',
        unlocked: level >= 7,
        requirement: 'Niveau 7'
      },
      {
        id: 'trampoline_park',
        name: 'Activité fun locale',
        description: 'Trampoline park, mini-golf, laser game',
        icon: '🤸‍♀️',
        cost: 360,
        category: 'loisirs_sorties',
        unlocked: level >= 6,
        requirement: 'Niveau 6'
      }
    ],

    lifestyle_bonus: [
      {
        id: 'abonnement_streaming',
        name: 'Abonnement streaming 1 mois',
        description: 'Netflix, Spotify, Disney+ ou autre',
        icon: '📺',
        cost: 500, // ~20-25 tâches moyennes
        category: 'lifestyle_bonus',
        unlocked: level >= 7,
        requirement: 'Niveau 7'
      },
      {
        id: 'accessoire_tech',
        name: 'Accessoire high-tech',
        description: 'Powerbank, support téléphone, mini enceinte',
        icon: '📱',
        cost: 550,
        category: 'lifestyle_bonus',
        unlocked: level >= 8,
        requirement: 'Niveau 8'
      },
      {
        id: 'bon_gaming',
        name: 'Bon gaming',
        description: 'Steam, PlayStation Store, Nintendo eShop',
        icon: '🎮',
        cost: 480,
        category: 'lifestyle_bonus',
        unlocked: level >= 7,
        requirement: 'Niveau 7'
      },
      {
        id: 'carte_shopping',
        name: 'Carte cadeau shopping',
        description: 'Multi-enseignes 40-60€',
        icon: '💳',
        cost: 600,
        category: 'lifestyle_bonus',
        unlocked: level >= 8,
        requirement: 'Niveau 8'
      }
    ],

    temps_offert: [
      {
        id: 'heure_travail_offerte',
        name: '1 heure de travail offerte',
        description: '1 heure en moins à effectuer, payée',
        icon: '⌛',
        cost: 800, // ~32-40 tâches moyennes
        category: 'temps_offert',
        unlocked: level >= 10,
        requirement: 'Niveau 10'
      },
      {
        id: 'journee_off',
        name: 'Journée off offerte',
        description: 'Journée complète payée sans travail',
        icon: '🌴',
        cost: 1200,
        category: 'temps_offert',
        unlocked: level >= 12,
        requirement: 'Niveau 12'
      },
      {
        id: 'zero_fermeture',
        name: 'Pass "zéro fermeture"',
        description: 'Pas obligé de fermer le local ce jour-là',
        icon: '🔓',
        cost: 900,
        category: 'temps_offert',
        unlocked: level >= 11,
        requirement: 'Niveau 11'
      }
    ],

    grands_plaisirs: [
      {
        id: 'resto_duo',
        name: 'Bon resto au choix',
        description: 'Seul ou à deux, restaurant de qualité',
        icon: '🍽️',
        cost: 1500, // ~60-75 tâches moyennes
        category: 'grands_plaisirs',
        unlocked: level >= 15,
        requirement: 'Niveau 15'
      },
      {
        id: 'apero_equipe',
        name: 'Apéro équipe fin de mois',
        description: 'Organisé et payé pour toute l\'équipe',
        icon: '🥂',
        cost: 1400,
        category: 'grands_plaisirs',
        unlocked: level >= 14,
        requirement: 'Niveau 14'
      },
      {
        id: 'pizza_party',
        name: 'Pizza party équipe',
        description: 'Repas livré pour toute l\'équipe',
        icon: '🍕',
        cost: 1300,
        category: 'grands_plaisirs',
        unlocked: level >= 13,
        requirement: 'Niveau 13'
      }
    ],

    premium: [
      {
        id: 'carte_premium_100',
        name: 'Carte cadeau premium 100€',
        description: 'Dans l\'enseigne de votre choix',
        icon: '💎',
        cost: 2500, // ~100+ tâches moyennes
        category: 'premium',
        unlocked: level >= 20,
        requirement: 'Niveau 20'
      },
      {
        id: 'nuit_hotel',
        name: 'Nuit d\'hôtel pour 2',
        description: 'Week-end romantique ou détente',
        icon: '🏨',
        cost: 3000,
        category: 'premium',
        unlocked: level >= 25,
        requirement: 'Niveau 25'
      },
      {
        id: 'concert_spectacle',
        name: 'Place concert/spectacle',
        description: 'Événement de votre choix',
        icon: '🎤',
        cost: 2800,
        category: 'premium',
        unlocked: level >= 22,
        requirement: 'Niveau 22'
      },
      {
        id: 'journee_spa',
        name: 'Journée spa complète',
        description: 'Spa, balnéo, hammam, détente ultime',
        icon: '🧖‍♀️',
        cost: 4000,
        category: 'premium',
        unlocked: level >= 30,
        requirement: 'Niveau 30'
      },
      {
        id: 'weekend_surprise',
        name: 'Week-end surprise',
        description: 'Gros budget collectif pour toute l\'équipe',
        icon: '✈️',
        cost: 5000,
        category: 'premium',
        unlocked: level >= 35,
        requirement: 'Niveau 35'
      }
    ],

    // Nouvelles récompenses Gen Z
    digital_genZ: [
      {
        id: 'setup_gaming',
        name: 'Accessoire setup gaming',
        description: 'Clavier RGB, souris gaming, casque ou tapis',
        icon: '⌨️',
        cost: 450,
        category: 'digital_genZ',
        unlocked: level >= 7,
        requirement: 'Niveau 7'
      },
      {
        id: 'skin_jeu',
        name: 'Skin rare ou contenu jeu',
        description: 'Fortnite, Valorant, LoL, CS2 ou autre',
        icon: '👾',
        cost: 380,
        category: 'digital_genZ',
        unlocked: level >= 6,
        requirement: 'Niveau 6'
      },
      {
        id: 'cours_skill',
        name: 'Cours en ligne skill',
        description: 'Masterclass, Skillshare, cours créatif',
        icon: '💻',
        cost: 420,
        category: 'digital_genZ',
        unlocked: level >= 7,
        requirement: 'Niveau 7'
      },
      {
        id: 'preset_lightroom',
        name: 'Pack presets créatifs',
        description: 'Lightroom, Photoshop, filtres Instagram',
        icon: '📸',
        cost: 280,
        category: 'digital_genZ',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      },
      {
        id: 'nft_art',
        name: 'Création NFT personnalisé',
        description: 'Votre avatar transformé en art digital',
        icon: '🎨',
        cost: 650,
        category: 'digital_genZ',
        unlocked: level >= 10,
        requirement: 'Niveau 10'
      },
      {
        id: 'crypto_starter',
        name: 'Starter pack crypto',
        description: 'Petite somme pour découvrir les cryptos',
        icon: '₿',
        cost: 800,
        category: 'digital_genZ',
        unlocked: level >= 12,
        requirement: 'Niveau 12'
      }
    ],

    experiences_genZ: [
      {
        id: 'karaoke_prive',
        name: 'Session karaoké privée',
        description: 'Box karaoké entre amis',
        icon: '🎤',
        cost: 320,
        category: 'experiences_genZ',
        unlocked: level >= 6,
        requirement: 'Niveau 6'
      },
      {
        id: 'photoshoot_insta',
        name: 'Photoshoot Instagram',
        description: 'Séance photo pro pour réseaux sociaux',
        icon: '📷',
        cost: 480,
        category: 'experiences_genZ',
        unlocked: level >= 8,
        requirement: 'Niveau 8'
      },
      {
        id: 'atelier_tiktok',
        name: 'Atelier création TikTok',
        description: 'Cours pour créer du contenu viral',
        icon: '🎬',
        cost: 380,
        category: 'experiences_genZ',
        unlocked: level >= 7,
        requirement: 'Niveau 7'
      },
      {
        id: 'bubble_tea',
        name: 'Tour des bubble tea',
        description: 'Découverte des meilleurs spots bubble tea',
        icon: '🧋',
        cost: 250,
        category: 'experiences_genZ',
        unlocked: level >= 5,
        requirement: 'Niveau 5'
      },
      {
        id: 'festival_local',
        name: 'Pass festival local',
        description: 'Musique, food, art ou culture pop',
        icon: '🎪',
        cost: 550,
        category: 'experiences_genZ',
        unlocked: level >= 9,
        requirement: 'Niveau 9'
      }
    ]
  };

  // Combiner toutes les récompenses
  const allRewards = [
    ...rewardsData.mini_plaisirs,
    ...rewardsData.petits_avantages,
    ...rewardsData.plaisirs_utiles,
    ...rewardsData.food_cadeaux,
    ...rewardsData.bien_etre,
    ...rewardsData.loisirs_sorties,
    ...rewardsData.lifestyle_bonus,
    ...rewardsData.temps_offert,
    ...rewardsData.grands_plaisirs,
    ...rewardsData.premium,
    ...rewardsData.digital_genZ,
    ...rewardsData.experiences_genZ
  ];

  // Filtrer et trier les récompenses
  const filteredRewards = allRewards
    .filter(reward => {
      if (selectedCategory !== 'all' && reward.category !== selectedCategory) return false;
      if (searchTerm && !reward.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.cost - b.cost;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  /**
   * 🛒 ACHAT DE RÉCOMPENSE AVEC DÉDUCTION XP GARANTIE
   */
  const handlePurchaseReward = async (reward) => {
    if (purchasing || !user?.uid) {
      return;
    }

    try {
      setPurchasing(true);
      console.log('🛒 [REWARDS-PAGE] Début achat:', reward.name);

      // Vérifications préalables
      if (totalXp < reward.cost) {
        throw new Error(`Vous n'avez pas assez d'XP! Il vous manque ${reward.cost - totalXp} XP.`);
      }

      if (!reward.unlocked) {
        throw new Error(`Cette récompense nécessite: ${reward.requirement}`);
      }

      // Acheter via le service sécurisé
      const result = await rewardsPurchaseService.purchaseReward(user.uid, reward);

      if (result.success) {
        // Succès !
        setPurchaseSuccess({
          reward: result.reward,
          previousXp: result.previousXp,
          newXp: result.newXp,
          message: result.message
        });

        // Fermer le modal d'achat
        setShowPurchaseModal(false);

        // Forcer la synchronisation pour mettre à jour l'interface
        setTimeout(() => {
          if (forceSync) {
            forceSync();
          }
        }, 500);

        console.log('✅ [REWARDS-PAGE] Achat réussi:', result);

        // Auto-clear le message de succès après 5 secondes
        setTimeout(() => {
          setPurchaseSuccess(null);
        }, 5000);

      } else {
        throw new Error('Achat échoué');
      }

    } catch (error) {
      console.error('❌ [REWARDS-PAGE] Erreur achat:', error);
      alert(`❌ Erreur lors de l'achat: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  // Écouter les achats de récompenses
  useEffect(() => {
    const handleRewardPurchased = (event) => {
      const { userId, reward, newXp } = event.detail;
      
      if (userId === user?.uid) {
        console.log('🔄 [REWARDS-PAGE] Achat détecté, mise à jour interface');
        
        // Forcer la synchronisation XP
        if (forceSync) {
          forceSync();
        }
      }
    };

    window.addEventListener('rewardPurchased', handleRewardPurchased);

    return () => {
      window.removeEventListener('rewardPurchased', handleRewardPurchased);
    };
  }, [user?.uid, forceSync]);

  // ⏳ CHARGEMENT
  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl animate-pulse flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Chargement de la boutique Synergia...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation: {syncStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative">
      
      {/* Notification de succès */}
      <AnimatePresence>
        <PurchaseSuccessNotification 
          purchaseSuccess={purchaseSuccess}
          onClose={() => setPurchaseSuccess(null)}
        />
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* 🎁 EN-TÊTE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Gift className="w-8 h-8 text-purple-400" />
                Boutique Synergia
              </h1>
              <p className="text-gray-400">
                Échangez vos XP contre des récompenses authentiques !
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Dernière synchronisation: {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'En cours...'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Solde XP */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-4 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">XP Disponibles</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</p>
                <p className="text-orange-100 text-sm">Niveau {level}</p>
              </div>
              
              <button
                onClick={forceSync}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>
          </div>
        </motion.div>

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="price">Trier par prix</option>
              <option value="name">Trier par nom</option>
              <option value="category">Trier par catégorie</option>
            </select>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', name: 'Toutes', icon: '🎁' },
              { id: 'mini_plaisirs', name: 'Mini-plaisirs', icon: '🍭' },
              { id: 'petits_avantages', name: 'Petits avantages', icon: '⏰' },
              { id: 'plaisirs_utiles', name: 'Plaisirs utiles', icon: '🛍️' },
              { id: 'food_cadeaux', name: 'Food & Cadeaux', icon: '🎫' },
              { id: 'bien_etre', name: 'Bien-être', icon: '🧘‍♀️' },
              { id: 'loisirs_sorties', name: 'Loisirs', icon: '🎬' },
              { id: 'lifestyle_bonus', name: 'Lifestyle', icon: '📺' },
              { id: 'digital_genZ', name: 'Digital GenZ', icon: '👾' },
              { id: 'experiences_genZ', name: 'Expériences GenZ', icon: '🎤' },
              { id: 'premium', name: 'Premium', icon: '💎' }
            ].map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 📊 STATISTIQUES RAPIDES */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* XP Disponibles */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">XP Disponibles</h4>
              <p className="text-gray-400 text-sm">
                {totalXp.toLocaleString()} XP
              </p>
              <p className="text-purple-400 text-xs mt-1">
                Peut acheter {allRewards.filter(r => r.unlocked && totalXp >= r.cost).length} articles
              </p>
            </div>
            
            {/* Niveau actuel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">Niveau Actuel</h4>
              <p className="text-gray-400 text-sm">
                Niveau {level}
              </p>
              <p className="text-blue-400 text-xs mt-1">
                {allRewards.filter(r => r.unlocked).length} récompenses débloquées
              </p>
            </div>
            
            {/* Prochaine récompense */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">Récompense Prochaine</h4>
              <p className="text-gray-400 text-sm">
                {(() => {
                  const nextReward = allRewards
                    .filter(r => !r.unlocked)
                    .sort((a, b) => a.cost - b.cost)[0];
                  return nextReward ? `${nextReward.cost} XP` : 'Toutes débloquées !';
                })()}
              </p>
              <p className="text-orange-400 text-xs mt-1">
                Continuez à progresser !
              </p>
            </div>
          </div>
        </motion.div>

        {/* 🎁 GRILLE DES RÉCOMPENSES */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                  !reward.unlocked ? 'opacity-60' : ''
                }`}
                onClick={() => {
                  setSelectedReward(reward);
                  setShowPurchaseModal(true);
                }}
              >
                {/* Badge catégorie */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-500/80 text-white">
                    {reward.cost} XP
                  </span>
                </div>

                {/* Icône de verrouillage */}
                {!reward.unlocked && (
                  <div className="absolute top-3 left-3 z-10">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                <div className="p-6">
                  {/* Icône principale */}
                  <div className="text-4xl mb-4 text-center">
                    {reward.icon}
                  </div>

                  {/* Nom et description */}
                  <h3 className="text-lg font-bold text-white mb-2 text-center">
                    {reward.name}
                  </h3>
                  <p className="text-gray-400 text-sm text-center mb-4 line-clamp-2">
                    {reward.description}
                  </p>

                  {/* Prix et statut */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">{reward.cost} XP</span>
                    </div>
                    
                    {reward.unlocked ? (
                      totalXp >= reward.cost ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <span className="text-red-400 text-sm">
                          -{(reward.cost - totalXp).toLocaleString()} XP
                        </span>
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message si aucune récompense */}
          {filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune récompense trouvée
              </h3>
              <p className="text-gray-400">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          )}
        </motion.div>

        {/* 🛒 MODAL D'ACHAT */}
        <AnimatePresence>
          {showPurchaseModal && selectedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPurchaseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-xl p-6 max-w-md w-full border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedReward.name}</h3>
                  <p className="text-gray-400">{selectedReward.description}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Prix:</span>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">{selectedReward.cost} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Vos XP:</span>
                    <span className="text-white font-bold">{totalXp.toLocaleString()} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Après achat:</span>
                    <span className={`font-bold ${totalXp - selectedReward.cost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(totalXp - selectedReward.cost).toLocaleString()} XP
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handlePurchaseReward(selectedReward)}
                    disabled={totalXp < selectedReward.cost || purchasing || !selectedReward.unlocked}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Achat...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Acheter
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RewardsPage;
