// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION COMPLÈTE : 10 PHASES BRAIN ESCAPE & QUIZ GAME
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle, 
  ArrowRight, 
  Play, 
  Clock, 
  Users, 
  Target, 
  Award, 
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  Zap,
  User,
  FileText,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
  TrendingUp,
  Crown,
  Gamepad2,
  Coffee,
  Lightbulb,
  Rocket,
  Shield,
  Heart,
  Brain,
  Headphones,
  Monitor,
  PhoneCall,
  Video,
  Send,
  Save,
  X,
  Filter,
  Search
} from 'lucide-react';

// Firebase imports
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 IMPORT DU VRAI LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// 🎯 LES 10 PHASES DE FORMATION BRAIN COMPLÈTES
// ==========================================

const FORMATION_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '🎯 Découverte de Brain',
    description: 'Immersion dans l\'univers et la culture Brain',
    duration: 3,
    color: 'from-blue-500 to-cyan-500',
    icon: '🎯',
    order: 1,
    xpTotal: 100,
    badge: 'Bienvenue chez Brain !',
    room: 'Salle principale',
    tasks: [
      {
        id: 'visite_locaux',
        name: 'Visite guidée des locaux',
        description: 'Tour complet des espaces Brain avec présentation de chaque zone',
        xp: 20,
        required: true,
        estimatedTime: 90,
        room: 'Tous les espaces',
        mentor: 'Responsable RH'
      },
      {
        id: 'comprendre_valeurs',
        name: 'Comprendre les valeurs Brain',
        description: 'Découverte de l\'ADN Brain, vision, valeurs et culture',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Salle de réunion',
        mentor: 'Direction'
      },
      {
        id: 'rencontrer_equipe',
        name: 'Rencontrer l\'équipe',
        description: 'Discussions informelles avec les membres de l\'équipe',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Open space',
        mentor: 'Équipe'
      },
      {
        id: 'decouverte_outils',
        name: 'Découverte des outils',
        description: 'Formation aux outils numériques (Synergia, etc.)',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'IT Manager'
      }
    ]
  },

  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours client & expérience joueur',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-green-500 to-emerald-500',
    icon: '👥',
    order: 2,
    xpTotal: 150,
    badge: 'Ambassadeur·rice Brain',
    room: 'Salle expérience',
    tasks: [
      {
        id: 'vivre_experience',
        name: 'Vivre une expérience complète en tant que joueur·euse',
        description: 'Participer à une session complète pour comprendre le ressenti',
        xp: 40,
        required: true,
        estimatedTime: 90,
        room: 'Salle jeu',
        mentor: 'Game Master'
      },
      {
        id: 'observer_sessions',
        name: 'Observer 2 sessions animées',
        description: 'Observer des sessions pour comprendre l\'animation',
        xp: 30,
        required: true,
        estimatedTime: 180,
        room: 'Régie',
        mentor: 'Game Master senior'
      },
      {
        id: 'accueil_clients',
        name: 'Accueil et briefing clients',
        description: 'Maîtriser l\'accueil chaleureux et le briefing',
        xp: 40,
        required: true,
        estimatedTime: 90,
        room: 'Accueil',
        mentor: 'Responsable Accueil'
      },
      {
        id: 'debriefing_photo',
        name: 'Debriefing et photo de groupe',
        description: 'Conclure l\'expérience et créer le souvenir',
        xp: 40,
        required: true,
        estimatedTime: 60,
        room: 'Espace photo',
        mentor: 'Game Master'
      }
    ]
  },

  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité et procédures',
    description: 'Maîtrise des protocoles de sécurité',
    duration: 4,
    color: 'from-red-500 to-orange-500',
    icon: '🔐',
    order: 3,
    xpTotal: 130,
    badge: 'Gardien·ne du Temple',
    room: 'Salle sécurité',
    tasks: [
      {
        id: 'protocoles_urgence',
        name: 'Protocoles d\'urgence',
        description: 'Connaître les protocoles d\'évacuation et premiers secours',
        xp: 40,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Responsable Sécurité'
      },
      {
        id: 'systeme_surveillance',
        name: 'Système de surveillance',
        description: 'Maîtriser caméras, micros et interphone',
        xp: 35,
        required: true,
        estimatedTime: 60,
        room: 'Régie',
        mentor: 'Technicien Senior'
      },
      {
        id: 'gestion_conflits',
        name: 'Gestion des conflits',
        description: 'Gérer situations difficiles et désaccords',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Formateur Communication'
      },
      {
        id: 'hygiene_nettoyage',
        name: 'Hygiène et nettoyage',
        description: 'Standards de propreté et protocoles sanitaires',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Toutes salles',
        mentor: 'Responsable Ops'
      }
    ]
  },

  EXPERIENCE_PSYCHIATRIC: {
    id: 'experience_psychiatric',
    name: '🩺 Expert·e Psychiatric',
    description: 'Formation complète sur l\'expérience Psychiatric',
    duration: 8,
    color: 'from-purple-500 to-indigo-500',
    icon: '🩺',
    order: 4,
    xpTotal: 245,
    badge: 'Expert·e Psychiatric',
    room: 'Salle Psychiatric',
    tasks: [
      {
        id: 'scenario_psychiatric',
        name: 'Lire et comprendre le scénario',
        description: 'Maîtriser l\'histoire, les énigmes et l\'ambiance',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Game Master expert'
      },
      {
        id: 'temps_forts_psy',
        name: 'Repérer les temps forts',
        description: 'Identifier moments-clés, passages difficiles, révélations',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Game Master senior'
      },
      {
        id: 'gerer_stress_psy',
        name: 'Gérer le stress des joueurs',
        description: 'Rassurer sans casser l\'immersion',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Formateur'
      },
      {
        id: 'musiques_effets_psy',
        name: 'Musiques et effets sonores',
        description: 'Connaître les musiques et effets principaux de Psychiatric',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Régie Psychiatric',
        mentor: 'Technicien'
      },
      {
        id: 'cameras_micros_psy',
        name: 'Caméras et micros spécifiques',
        description: 'Maîtriser l\'utilisation des équipements Psychiatric',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Régie Psychiatric',
        mentor: 'Technicien Senior'
      },
      {
        id: 'effets_speciaux_psy',
        name: 'Effets spéciaux Psychiatric',
        description: 'Maîtriser tous les effets spéciaux et leur timing',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle Psychiatric',
        mentor: 'Game Master expert'
      },
      {
        id: 'reset_psychiatric',
        name: 'Reset complet Psychiatric',
        description: 'Reset rapide avec check de tous les éléments sensibles',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle Psychiatric',
        mentor: 'Game Master'
      },
      {
        id: 'accompagnement_anxieux',
        name: 'Rassurer et accompagner',
        description: 'Gérer un groupe anxieux ou effrayé avec bienveillance',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Formateur Communication'
      },
      {
        id: 'indices_immersion',
        name: 'Donner indices sans casser l\'immersion',
        description: 'Techniques d\'aide adaptées selon âge/expérience',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Régie Psychiatric',
        mentor: 'Game Master senior'
      },
      {
        id: 'briefing_psychiatric',
        name: 'Briefing Psychiatric complet',
        description: 'Pratiquer le briefing en jeu de rôle puis en réel',
        xp: 30,
        required: true,
        estimatedTime: 45,
        room: 'Salle briefing',
        mentor: 'Game Master expert'
      },
      {
        id: 'validation_psychiatric',
        name: 'Sessions Psychiatric validées',
        description: 'Animer 2 sessions dont 1 en quasi-autonomie',
        xp: 25,
        required: true,
        estimatedTime: 180,
        room: 'Salle Psychiatric',
        mentor: 'Référent·e'
      }
    ]
  },

  EXPERIENCE_PRISON: {
    id: 'experience_prison',
    name: '🚨 Expert·e Prison',
    description: 'Formation complète sur l\'expérience Prison',
    duration: 7,
    color: 'from-gray-600 to-gray-800',
    icon: '🚨',
    order: 5,
    xpTotal: 220,
    badge: 'Expert·e Prison',
    room: 'Salle Prison',
    tasks: [
      {
        id: 'scenario_prison',
        name: 'Lire et comprendre le scénario Prison',
        description: 'Expliquer les enjeux et l\'ambiance carcérale',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Game Master expert'
      },
      {
        id: 'temps_forts_prison',
        name: 'Repérer les temps forts',
        description: 'Identifier stress, compétition, coopération',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Game Master senior'
      },
      {
        id: 'equipes_multiples',
        name: 'Gestion des équipes multiples',
        description: 'Gérer plusieurs équipes en simultané',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle Prison',
        mentor: 'Game Master expert'
      },
      {
        id: 'dispositifs_securite',
        name: 'Dispositifs de sécurité Prison',
        description: 'Maîtriser portes, menottes, alarmes',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Salle Prison',
        mentor: 'Technicien'
      },
      {
        id: 'effets_prison',
        name: 'Effets sonores et lumineux',
        description: 'Lancer/arrêter les effets au bon moment',
        xp: 25,
        required: true,
        estimatedTime: 45,
        room: 'Régie Prison',
        mentor: 'Technicien'
      },
      {
        id: 'reset_prison',
        name: 'Reset complet Prison',
        description: 'Cellules, objets cachés, routine nettoyage',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle Prison',
        mentor: 'Game Master'
      },
      {
        id: 'interactions_equipes',
        name: 'Interactions entre équipes',
        description: 'Gérer compétition ou coopération, triche, blocages',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle Prison',
        mentor: 'Game Master senior'
      },
      {
        id: 'briefing_prison',
        name: 'Briefing Prison complet',
        description: 'Pratiquer briefing en jeu de rôle puis en réel',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Salle briefing',
        mentor: 'Game Master expert'
      },
      {
        id: 'validation_prison',
        name: 'Sessions Prison validées',
        description: 'Animer 2 sessions dont 1 en quasi-autonomie',
        xp: 15,
        required: true,
        estimatedTime: 180,
        room: 'Salle Prison',
        mentor: 'Référent·e'
      }
    ]
  },

  EXPERIENCE_80S: {
    id: 'experience_80s',
    name: '🎸 Expert·e Back to the 80\'s',
    description: 'Formation complète sur l\'expérience rétro',
    duration: 5,
    color: 'from-pink-500 to-purple-500',
    icon: '🎸',
    order: 6,
    xpTotal: 200,
    badge: 'Expert·e Back to the 80\'s',
    room: 'Salle 80\'s',
    tasks: [
      {
        id: 'scenario_80s',
        name: 'Lire et comprendre le scénario',
        description: 'Maîtriser références, anecdotes, musiques et objets emblématiques',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Game Master expert'
      },
      {
        id: 'playlist_ambiance',
        name: 'Gérer la playlist et l\'ambiance rétro',
        description: 'Maîtriser la playlist et renforcer l\'ambiance 80\'s',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Salle 80\'s',
        mentor: 'Game Master'
      },
      {
        id: 'objets_vintage',
        name: 'Objets et mécanismes vintage',
        description: 'Maîtriser téléphone, cassettes et tous les objets d\'époque',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle 80\'s',
        mentor: 'Technicien'
      },
      {
        id: 'reset_80s',
        name: 'Reset complet 80\'s',
        description: 'Remise en place de tous les éléments fragiles',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle 80\'s',
        mentor: 'Game Master'
      },
      {
        id: 'adaptation_culture',
        name: 'Adapter selon culture 80\'s du groupe',
        description: 'Rendre l\'expérience inclusive et fun, quel que soit l\'âge',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Formateur'
      },
      {
        id: 'humour_nostalgie',
        name: 'Humour et nostalgie',
        description: 'Gérer clins d\'œil, easter eggs et références',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Game Master senior'
      },
      {
        id: 'briefing_80s',
        name: 'Briefing Back to the 80\'s complet',
        description: 'Pratiquer briefing en jeu de rôle puis en réel',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Salle briefing',
        mentor: 'Game Master expert'
      },
      {
        id: 'validation_80s',
        name: 'Sessions 80\'s validées',
        description: 'Animer 2 sessions dont 1 en quasi-autonomie',
        xp: 25,
        required: true,
        estimatedTime: 180,
        room: 'Salle 80\'s',
        mentor: 'Référent·e'
      }
    ]
  },

  EXPERIENCE_QUIZ: {
    id: 'experience_quiz',
    name: '🏆 Expert·e Quiz Game',
    description: 'Formation complète sur l\'animation Quiz Game',
    duration: 6,
    color: 'from-yellow-500 to-orange-500',
    icon: '🏆',
    order: 7,
    xpTotal: 190,
    badge: 'Expert·e Quiz Game',
    room: 'Salle Quiz',
    tasks: [
      {
        id: 'concept_quiz',
        name: 'Comprendre le concept Quiz Game',
        description: 'Format, règles, catégories et ambiance soirée',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Animateur Quiz'
      },
      {
        id: 'animation_dynamique',
        name: 'Animation dynamique et rythme',
        description: 'Gérer le timing, l\'énergie et les transitions',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle Quiz',
        mentor: 'Animateur expert'
      },
      {
        id: 'gestion_scores',
        name: 'Gestion des scores et classement',
        description: 'Tenir les scores en temps réel et gérer les contestations',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Régie Quiz',
        mentor: 'Animateur'
      },
      {
        id: 'interaction_public',
        name: 'Interaction avec le public',
        description: 'Gérer ambiance, blagues, rebondissements',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle Quiz',
        mentor: 'Animateur expert'
      },
      {
        id: 'technique_quiz',
        name: 'Équipements techniques Quiz',
        description: 'Maîtriser micro, écrans, sons, lumières',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Régie Quiz',
        mentor: 'Technicien'
      },
      {
        id: 'preparation_soiree',
        name: 'Préparation d\'une soirée Quiz',
        description: 'Setup complet, check technique, briefing équipe',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Salle Quiz',
        mentor: 'Animateur senior'
      },
      {
        id: 'validation_quiz',
        name: 'Sessions Quiz validées',
        description: 'Animer 2 soirées dont 1 en quasi-autonomie',
        xp: 25,
        required: true,
        estimatedTime: 240,
        room: 'Salle Quiz',
        mentor: 'Référent·e'
      }
    ]
  },

  GESTION_QUOTIDIEN: {
    id: 'gestion_quotidien',
    name: '🛠️ Gestion quotidienne',
    description: 'Maîtrise des tâches et routines quotidiennes',
    duration: 4,
    color: 'from-cyan-500 to-blue-500',
    icon: '🛠️',
    order: 8,
    xpTotal: 120,
    badge: 'Pilier du Quotidien',
    room: 'Tous espaces',
    tasks: [
      {
        id: 'ouverture_fermeture',
        name: 'Procédures ouverture/fermeture',
        description: 'Check d\'ouverture et fermeture sécurisée',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Tous espaces',
        mentor: 'Responsable Ops'
      },
      {
        id: 'gestion_planning',
        name: 'Gestion du planning',
        description: 'Consulter et gérer le planning des sessions',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Bureau',
        mentor: 'Responsable Planning'
      },
      {
        id: 'entretien_quotidien',
        name: 'Entretien quotidien des salles',
        description: 'Routines de nettoyage et maintenance préventive',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Toutes salles',
        mentor: 'Responsable Maintenance'
      },
      {
        id: 'gestion_stocks',
        name: 'Gestion des stocks et consommables',
        description: 'Inventaire et commande de matériel',
        xp: 35,
        required: true,
        estimatedTime: 60,
        room: 'Stockage',
        mentor: 'Responsable Achats'
      }
    ]
  },

  SOFT_SKILLS: {
    id: 'soft_skills',
    name: '🌱 Soft skills & communication',
    description: 'Développement des compétences relationnelles',
    duration: 3,
    color: 'from-green-400 to-teal-500',
    icon: '🌱',
    order: 9,
    xpTotal: 110,
    badge: 'Esprit Brain',
    room: 'Salle formation',
    tasks: [
      {
        id: 'communication_equipe',
        name: 'Communication d\'équipe',
        description: 'Collaboration, feedback, résolution de problèmes',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Formateur Communication'
      },
      {
        id: 'gestion_stress',
        name: 'Gestion du stress',
        description: 'Techniques de gestion du stress en situation',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Coach'
      },
      {
        id: 'service_client',
        name: 'Excellence du service client',
        description: 'Dépasser les attentes et créer la magie Brain',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Customer Success'
      },
      {
        id: 'creativite_adaptation',
        name: 'Créativité et adaptation',
        description: 'Improvisation et adaptation aux situations inédites',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Formateur'
      }
    ]
  },

  CERTIFICATION_FINALE: {
    id: 'certification_finale',
    name: '🎓 Certification finale',
    description: 'Évaluation complète et certification Game Master',
    duration: 2,
    color: 'from-violet-500 to-purple-600',
    icon: '🎓',
    order: 10,
    xpTotal: 200,
    badge: 'Game Master certifié·e Brain',
    room: 'Salle certification',
    tasks: [
      {
        id: 'evaluation_theorique',
        name: 'Évaluation théorique',
        description: 'Quiz complet sur toutes les connaissances',
        xp: 40,
        required: true,
        estimatedTime: 60,
        room: 'En ligne',
        mentor: 'Équipe pédagogique'
      },
      {
        id: 'evaluation_pratique',
        name: 'Évaluation pratique',
        description: 'Session complète en autonomie observée',
        xp: 60,
        required: true,
        estimatedTime: 120,
        room: 'Salle au choix',
        mentor: 'Panel d\'experts'
      },
      {
        id: 'debriefing_final',
        name: 'Debriefing final',
        description: 'Retour sur le parcours et axes d\'amélioration',
        xp: 50,
        required: true,
        estimatedTime: 60,
        room: 'Salle réunion',
        mentor: 'Responsable Formation'
      },
      {
        id: 'remise_certification',
        name: 'Remise de certification',
        description: 'Célébration officielle avec toute l\'équipe',
        xp: 50,
        required: true,
        estimatedTime: 120,
        room: 'Espace convivial',
        mentor: 'Toute l\'équipe'
      }
    ]
  }
};

// ==========================================
// 🏆 BADGES D'ONBOARDING - GAMIFICATION
// ==========================================

const BADGES_ONBOARDING = [
  {
    id: 'bienvenue_brain',
    name: 'Bienvenue chez Brain !',
    description: 'Découverte de Brain complétée',
    icon: '💡',
    rarity: 'common',
    xp: 50
  },
  {
    id: 'ambassadeur_brain',
    name: 'Ambassadeur·rice Brain',
    description: 'Parcours client maîtrisé',
    icon: '👥',
    rarity: 'uncommon',
    xp: 80
  },
  {
    id: 'gardien_temple',
    name: 'Gardien·ne du Temple',
    description: 'Sécurité et procédures validées',
    icon: '🔐',
    rarity: 'rare',
    xp: 100
  },
  {
    id: 'expert_psychiatric',
    name: 'Expert·e Psychiatric',
    description: 'Expérience Psychiatric maîtrisée',
    icon: '🩺',
    rarity: 'epic',
    xp: 120
  },
  {
    id: 'expert_prison',
    name: 'Expert·e Prison',
    description: 'Expérience Prison maîtrisée',
    icon: '🚨',
    rarity: 'epic',
    xp: 120
  },
  {
    id: 'expert_80s',
    name: 'Expert·e Back to the 80\'s',
    description: 'Expérience rétro maîtrisée',
    icon: '🎸',
    rarity: 'epic',
    xp: 120
  },
  {
    id: 'expert_quiz',
    name: 'Expert·e Quiz Game',
    description: 'Animation Quiz Game maîtrisée',
    icon: '🏆',
    rarity: 'epic',
    xp: 120
  },
  {
    id: 'pilier_quotidien',
    name: 'Pilier du Quotidien',
    description: 'Gestion quotidienne maîtrisée',
    icon: '🛠️',
    rarity: 'rare',
    xp: 90
  },
  {
    id: 'esprit_brain',
    name: 'Esprit Brain',
    description: 'Soft skills et communication validées',
    icon: '🌱',
    rarity: 'rare',
    xp: 70
  },
  {
    id: 'gm_certifie',
    name: 'Game Master certifié·e Brain',
    description: 'Parcours complet validé avec excellence',
    icon: '🎓',
    rarity: 'legendary',
    xp: 300
  }
];

// ==========================================
// 🎨 COMPOSANT CARD PREMIUM
// ==========================================

const PremiumCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// ==========================================
// 📊 COMPOSANT STAT CARD
// ==========================================

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div className={`p-3 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

// ==========================================
// 📄 COMPOSANT PRINCIPAL - ONBOARDING PAGE
// ==========================================

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalXP: 0,
    earnedXP: 0,
    completedPhases: 0,
    totalPhases: Object.keys(FORMATION_PHASES).length,
    badges: []
  });

  // Charger la progression utilisateur
  useEffect(() => {
    if (!user?.uid) return;

    const loadProgress = async () => {
      try {
        const docRef = doc(db, 'userOnboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProgress(data);
          calculateStats(data);
        } else {
          // Initialiser si pas de progression
          await initializeProgress();
        }
      } catch (error) {
        console.error('❌ Erreur chargement progression:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Calculer les statistiques
  const calculateStats = (progressData) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalXP = 0;
    let earnedXP = 0;
    let completedPhases = 0;

    Object.values(FORMATION_PHASES).forEach(phase => {
      totalTasks += phase.tasks.length;
      totalXP += phase.xpTotal;

      if (progressData?.phases?.[phase.id]) {
        const phaseProgress = progressData.phases[phase.id];
        if (phaseProgress.completed) {
          completedPhases++;
        }
        phaseProgress.tasks?.forEach(task => {
          if (task.completed) {
            completedTasks++;
            earnedXP += task.xp;
          }
        });
      }
    });

    setStats({
      totalTasks,
      completedTasks,
      totalXP,
      earnedXP,
      completedPhases,
      totalPhases: Object.keys(FORMATION_PHASES).length,
      badges: progressData?.badges || []
    });
  };

  // Initialiser la progression
  const initializeProgress = async () => {
    if (!user?.uid) return;

    try {
      console.log('🚀 Initialisation profil onboarding');

      const initialProgress = {
        userId: user.uid,
        startedAt: serverTimestamp(),
        currentPhase: 'decouverte_brain',
        phases: {},
        badges: [],
        totalXP: 0,
        completedTasks: 0
      };

      // Initialiser chaque phase - TOUTES DÉVERROUILLÉES
      Object.values(FORMATION_PHASES).forEach(phase => {
        initialProgress.phases[phase.id] = {
          started: true, // ✅ TOUTES LES PHASES DÉMARRÉES
          completed: false,
          startedAt: serverTimestamp(),
          completedAt: null,
          tasks: phase.tasks.map(task => ({
            id: task.id,
            completed: false,
            completedAt: null,
            xp: task.xp
          }))
        };
      });

      await updateDoc(doc(db, 'userOnboarding', user.uid), initialProgress);
      setUserProgress(initialProgress);

      console.log('✅ Profil onboarding initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
    }
  };

  // Compléter une tâche
  const completeTask = async (phaseId, taskId) => {
    if (!user?.uid) return;

    try {
      console.log('✅ Complétion tâche:', { phaseId, taskId });

      const progressRef = doc(db, 'userOnboarding', user.uid);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) return;

      const currentProgress = progressDoc.data();
      const phase = currentProgress.phases[phaseId];
      const task = phase.tasks.find(t => t.id === taskId);

      if (!task || task.completed) return;

      // Marquer la tâche comme complétée
      task.completed = true;
      task.completedAt = serverTimestamp();

      // Vérifier si toutes les tâches de la phase sont complétées
      const allTasksCompleted = phase.tasks.every(t => t.completed);
      if (allTasksCompleted) {
        phase.completed = true;
        phase.completedAt = serverTimestamp();
        
        // Ajouter le badge de la phase
        const phaseData = FORMATION_PHASES[phaseId.toUpperCase()];
        if (phaseData && !currentProgress.badges.includes(phaseData.badge)) {
          currentProgress.badges.push(phaseData.badge);
        }
      }

      await updateDoc(progressRef, currentProgress);
      setUserProgress(currentProgress);
      calculateStats(currentProgress);

      console.log('✅ Tâche complétée avec succès');

    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement de votre formation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎓 Formation Brain Escape & Quiz Game
          </h1>
          <p className="text-gray-400">
            Votre parcours complet pour devenir Game Master certifié·e
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={CheckCircle} 
            label="Tâches complétées" 
            value={`${stats.completedTasks}/${stats.totalTasks}`}
            color="green"
          />
          <StatCard 
            icon={Zap} 
            label="XP gagnés" 
            value={`${stats.earnedXP}/${stats.totalXP}`}
            color="yellow"
          />
          <StatCard 
            icon={Target} 
            label="Phases complétées" 
            value={`${stats.completedPhases}/${stats.totalPhases}`}
            color="blue"
          />
          <StatCard 
            icon={Award} 
            label="Badges obtenus" 
            value={stats.badges.length}
            color="purple"
          />
        </div>

        {/* Progress Bar Globale */}
        <PremiumCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Progression globale</h3>
            <span className="text-2xl font-bold text-blue-400">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </span>
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </PremiumCard>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('formation')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'formation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            📚 Formation
          </button>
          <button
            onClick={() => setActiveTab('progression')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'progression'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            📊 Ma Progression
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'badges'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            🏆 Badges
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'formation' && (
            <motion.div
              key="formation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Object.values(FORMATION_PHASES).map((phase) => {
                const phaseProgress = userProgress?.phases?.[phase.id];
                const completedTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
                const totalTasks = phase.tasks.length;
                const progressPercent = (completedTasks / totalTasks) * 100;
                const isCompleted = phaseProgress?.completed || false;

                return (
                  <PremiumCard
                    key={phase.id}
                    className={`cursor-pointer ${isCompleted ? 'border-green-500/50' : ''}`}
                    onClick={() => setSelectedPhase(phase)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`text-4xl`}>{phase.icon}</div>
                        <div>
                          <h3 className="font-bold text-white">{phase.name}</h3>
                          <p className="text-sm text-gray-400">{phase.duration} jours</p>
                        </div>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{phase.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-white font-medium">
                          {completedTasks}/{totalTasks}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${phase.color}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Zap className="h-4 w-4" />
                          <span>{phase.xpTotal} XP</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{phase.room}</span>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'progression' && (
            <motion.div
              key="progression"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PremiumCard>
                <h3 className="text-2xl font-bold text-white mb-6">📊 Votre Progression Détaillée</h3>
                
                <div className="space-y-6">
                  {Object.values(FORMATION_PHASES).map((phase) => {
                    const phaseProgress = userProgress?.phases?.[phase.id];
                    const completedTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
                    const totalTasks = phase.tasks.length;
                    const progressPercent = (completedTasks / totalTasks) * 100;

                    return (
                      <div key={phase.id} className="border-b border-gray-700/50 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{phase.icon}</span>
                            <div>
                              <h4 className="font-semibold text-white">{phase.name}</h4>
                              <p className="text-sm text-gray-400">
                                {completedTasks}/{totalTasks} tâches • {phase.xpTotal} XP
                              </p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-blue-400">
                            {Math.round(progressPercent)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${phase.color}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PremiumCard>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PremiumCard>
                <h3 className="text-2xl font-bold text-white mb-6">🏆 Vos Badges</h3>
                
                {stats.badges.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">
                    Complétez des phases pour débloquer des badges !
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats.badges.map((badgeName, index) => {
                      const badge = BADGES_ONBOARDING.find(b => b.name === badgeName);
                      if (!badge) return null;

                      return (
                        <div
                          key={index}
                          className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 text-center hover:scale-105 transition-all"
                        >
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <h4 className="font-semibold text-white text-sm mb-1">{badge.name}</h4>
                          <p className="text-xs text-gray-400">{badge.description}</p>
                          <div className="mt-2 text-xs text-yellow-400">+{badge.xp} XP</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </PremiumCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Détails Phase */}
        <AnimatePresence>
          {selectedPhase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPhase(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedPhase.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedPhase.name}</h2>
                      <p className="text-gray-400">{selectedPhase.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPhase(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                {/* Info Phase */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Durée</span>
                    </div>
                    <p className="text-white font-semibold">{selectedPhase.duration} jours</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">XP Total</span>
                    </div>
                    <p className="text-white font-semibold">{selectedPhase.xpTotal} XP</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">Lieu</span>
                    </div>
                    <p className="text-white font-semibold">{selectedPhase.room}</p>
                  </div>
                </div>

                {/* Liste des tâches */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white mb-4">📋 Tâches à accomplir</h3>
                  {selectedPhase.tasks.map((task) => {
                    const phaseProgress = userProgress?.phases?.[selectedPhase.id];
                    const taskProgress = phaseProgress?.tasks?.find(t => t.id === task.id);
                    const isCompleted = taskProgress?.completed || false;

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isCompleted
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isCompleted ? (
                                <CheckSquare className="w-5 h-5 text-green-400" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                              <h4 className={`font-semibold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                                {task.name}
                              </h4>
                            </div>
                            <p className="text-gray-400 text-sm mb-3 ml-7">{task.description}</p>
                            
                            <div className="flex items-center gap-4 ml-7 text-sm">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>{task.estimatedTime} min</span>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Zap className="h-4 w-4" />
                                <span>{task.xp} XP</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <User className="h-4 w-4" />
                                <span>{task.mentor}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-400">
                                <MapPin className="h-4 w-4" />
                                <span>{task.room}</span>
                              </div>
                            </div>
                          </div>

                          {!isCompleted && (
                            <button
                              onClick={() => completeTask(selectedPhase.id, task.id)}
                              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Compléter
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Badge */}
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-yellow-400" />
                    <div>
                      <h4 className="font-semibold text-white">Badge à débloquer</h4>
                      <p className="text-sm text-gray-400">{selectedPhase.badge}</p>
                    </div>
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

export default OnboardingPage;
