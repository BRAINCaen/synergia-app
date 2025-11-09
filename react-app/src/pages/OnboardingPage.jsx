// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// SYSTÈME D'INTÉGRATION COMPLET - FORMATION + ENTRETIENS
// VERSION CORRIGÉE : setDoc pour créer le document Firebase
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
  setDoc,
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
// 🎯 DONNÉES DE FORMATION BRAIN - MIX COMPLET
// ==========================================

const FORMATION_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain',
    description: 'Immersion dans l\'univers et la culture Brain',
    duration: 3,
    color: 'from-blue-500 to-cyan-500',
    icon: '💡',
    order: 1,
    xpTotal: 150,
    badge: 'Bienvenue chez Brain !',
    room: 'Tous les espaces',
    tasks: [
      {
        id: 'accueil_officiel',
        name: 'Accueil officiel et tour des locaux',
        description: 'Participer à ton accueil et découvrir tous les espaces Brain',
        xp: 20,
        required: true,
        estimatedTime: 90,
        room: 'Tous les espaces',
        mentor: 'Responsable RH'
      },
      {
        id: 'charte_histoire',
        name: 'Charte, règlement et histoire Brain',
        description: 'Lire et comprendre l\'ADN, la vision et les valeurs Brain',
        xp: 15,
        required: true,
        estimatedTime: 45,
        room: 'Salle de réunion',
        mentor: 'Direction'
      },
      {
        id: 'equipe_organigramme',
        name: 'Découvrir l\'équipe et l\'organigramme',
        description: 'Rencontrer l\'équipe (photos, rôles, anecdotes) et comprendre qui fait quoi',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Open space',
        mentor: 'Équipe'
      },
      {
        id: 'outils_internes',
        name: 'Outils de communication internes',
        description: 'Configuration messagerie, email, planning, réservations, canaux internes',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'IT Manager'
      },
      {
        id: 'presentation_equipe',
        name: 'Te présenter à l\'équipe',
        description: 'Présentation officielle en live ou par message à toute l\'équipe',
        xp: 20,
        required: true,
        estimatedTime: 30,
        room: 'Open space',
        mentor: 'Équipe'
      }
    ]
  },
  
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours Client',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-green-500 to-emerald-500',
    icon: '👥',
    order: 2,
    xpTotal: 180,
    badge: 'Ambassadeur·rice Brain',
    room: 'Salle expérience',
    tasks: [
      {
        id: 'observer_accueil',
        name: 'Observer l\'accueil client',
        description: 'Observer l\'accueil avec un·e Game Master expérimenté·e',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Accueil',
        mentor: 'Game Master senior'
      },
      {
        id: 'observer_briefing',
        name: 'Observer un briefing complet',
        description: 'Observer briefing Escape et Quiz Game en conditions réelles',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Salle briefing',
        mentor: 'Game Master expert'
      },
      {
        id: 'comprendre_parcours',
        name: 'Comprendre le parcours client type',
        description: 'Maîtriser toutes les étapes : accueil, briefing, jeu, débriefing',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Responsable Expérience'
      },
      {
        id: 'accueil_duo',
        name: 'Participer à un accueil en duo',
        description: 'Premier accueil client en binôme avec un·e GM confirmé·e',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Accueil',
        mentor: 'Game Master senior'
      },
      {
        id: 'briefing_roleplay',
        name: 'Briefing fictif en jeu de rôle',
        description: 'Pratiquer un briefing complet en simulation',
        xp: 25,
        required: true,
        estimatedTime: 45,
        room: 'Salle formation',
        mentor: 'Formateur'
      },
      {
        id: 'debriefing_reel',
        name: 'Participer à un débriefing',
        description: 'Observer et participer au débriefing client après session',
        xp: 20,
        required: true,
        estimatedTime: 30,
        room: 'Salle débriefing',
        mentor: 'Game Master'
      },
      {
        id: 'notes_session',
        name: 'Prendre des notes sur session réelle',
        description: 'Observer et noter tous les détails d\'une session complète',
        xp: 20,
        required: false,
        estimatedTime: 90,
        room: 'Régie',
        mentor: 'Game Master'
      }
    ]
  },

  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité & Procédures',
    description: 'Garantir la sécurité et maîtriser les procédures',
    duration: 3,
    color: 'from-red-500 to-orange-500',
    icon: '🔐',
    order: 3,
    xpTotal: 200,
    badge: 'Gardien·ne du Temple',
    room: 'Tous les espaces',
    tasks: [
      {
        id: 'consignes_securite',
        name: 'Consignes de sécurité',
        description: 'Lire et comprendre incendie, évacuation, premiers secours',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Responsable Sécurité'
      },
      {
        id: 'equipements_securite',
        name: 'Repérer les équipements de sécurité',
        description: 'Localiser extincteurs, issues de secours, alarmes',
        xp: 25,
        required: true,
        estimatedTime: 30,
        room: 'Tous les espaces',
        mentor: 'Responsable Sécurité'
      },
      {
        id: 'procedures_urgence',
        name: 'Procédures d\'urgence',
        description: 'Maîtriser coupure courant, alarme, incidents, malaise joueur',
        xp: 35,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Responsable Ops'
      },
      {
        id: 'outils_techniques',
        name: 'Prise en main outils techniques',
        description: 'Caméras, micros, écrans, effets spéciaux de toutes les salles',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Salle technique',
        mentor: 'Technicien Senior'
      },
      {
        id: 'reset_complet',
        name: 'Reset complet d\'une salle',
        description: 'Apprendre à réinitialiser complètement chaque salle',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salles jeu',
        mentor: 'Game Master expert'
      },
      {
        id: 'gestion_materiel',
        name: 'Gestion du matériel',
        description: 'Cadenas, accessoires, maintenance de base, vérifications',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Réserve',
        mentor: 'Responsable Maintenance'
      },
      {
        id: 'ouverture_fermeture',
        name: 'Procédure ouverture/fermeture',
        description: 'Réaliser procédure complète sous supervision',
        xp: 20,
        required: false,
        estimatedTime: 120,
        room: 'Tous les espaces',
        mentor: 'Manager'
      }
    ]
  },

  EXPERIENCE_PSYCHIATRIC: {
    id: 'experience_psychiatric',
    name: '🩺 Expert·e Psychiatric',
    description: 'Formation complète sur l\'expérience Psychiatric',
    duration: 7,
    color: 'from-purple-500 to-pink-500',
    icon: '🩺',
    order: 4,
    xpTotal: 240,
    badge: 'Expert·e Psychiatric',
    room: 'Salle Psychiatric',
    tasks: [
      {
        id: 'scenario_psychiatric',
        name: 'Lire et comprendre le scénario',
        description: 'Maîtriser l\'ambiance, les enjeux et les moments clés',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Game Master expert'
      },
      {
        id: 'musiques_effets',
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
        description: 'Gérer clins d\'œil à l\'époque sans exclure les plus jeunes',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle 80\'s',
        mentor: 'Game Master senior'
      },
      {
        id: 'briefing_80s',
        name: 'Briefing 80\'s complet',
        description: 'Pratiquer briefing en jeu de rôle puis en réel',
        xp: 25,
        required: true,
        estimatedTime: 45,
        room: 'Salle briefing',
        mentor: 'Game Master expert'
      },
      {
        id: 'validation_80s',
        name: 'Sessions 80\'s validées',
        description: 'Animer 2 sessions dont 1 en quasi-autonomie',
        xp: 20,
        required: true,
        estimatedTime: 180,
        room: 'Salle 80\'s',
        mentor: 'Référent·e'
      }
    ]
  },

  EXPERIENCE_QUIZGAME: {
    id: 'experience_quizgame',
    name: '🏆 Expert·e Quiz Game',
    description: 'Formation complète animation Quiz Game',
    duration: 7,
    color: 'from-yellow-500 to-orange-500',
    icon: '🏆',
    order: 7,
    xpTotal: 220,
    badge: 'Expert·e Quiz Game',
    room: 'Plateau Quiz Game',
    tasks: [
      {
        id: 'modes_regles_quiz',
        name: 'Tous les modes de jeu et règles',
        description: 'Connaître parfaitement tous les modes et règles',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Plateau Quiz',
        mentor: 'Animateur expert'
      },
      {
        id: 'presentation_plateau',
        name: 'Présenter le plateau',
        description: 'Savoir présenter le plateau et ses fonctionnalités',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Plateau Quiz',
        mentor: 'Animateur'
      },
      {
        id: 'prise_micro',
        name: 'Prise de micro et animation de base',
        description: 'Maîtriser le micro et les bases de l\'animation',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Plateau Quiz',
        mentor: 'Animateur expert'
      },
      {
        id: 'lancement_modes',
        name: 'Lancer chaque mode de jeu',
        description: 'Buzzers, tablettes, pupitres : tout maîtriser',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Plateau Quiz',
        mentor: 'Technicien'
      },
      {
        id: 'scores_transitions',
        name: 'Affichage scores et transitions',
        description: 'Gérer l\'affichage et les transitions entre modes',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Régie Quiz',
        mentor: 'Technicien'
      },
      {
        id: 'bugs_litiges',
        name: 'Réagir en cas de bug ou litige',
        description: 'Gérer problème technique ou question litigieuse',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Animateur expert'
      },
      {
        id: 'ambiance_motivation',
        name: 'Créer l\'ambiance et motiver',
        description: 'Créer l\'ambiance et motiver chaque équipe',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Plateau Quiz',
        mentor: 'Animateur expert'
      },
      {
        id: 'adaptation_public_quiz',
        name: 'Adapter au public',
        description: 'S\'adapter : enfants, EVJF/G, entreprises, familles',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Plateau Quiz',
        mentor: 'Formateur'
      },
      {
        id: 'validation_quiz',
        name: 'Sessions Quiz validées',
        description: 'Animer 2 sessions dont 1 en quasi-autonomie',
        xp: 0,
        required: true,
        estimatedTime: 180,
        room: 'Plateau Quiz',
        mentor: 'Référent·e'
      }
    ]
  },

  QUOTIDIEN_GESTION: {
    id: 'quotidien_gestion',
    name: '🛠️ Quotidien & Gestion',
    description: 'Maîtriser les tâches quotidiennes',
    duration: 5,
    color: 'from-cyan-500 to-blue-500',
    icon: '🛠️',
    order: 8,
    xpTotal: 170,
    badge: 'Pilier du Quotidien',
    room: 'Tous les espaces',
    tasks: [
      {
        id: 'preparation_salle',
        name: 'Préparer une salle avant session',
        description: 'Reset, check matériel, vérifications complètes',
        xp: 25,
        required: true,
        estimatedTime: 45,
        room: 'Salles jeu',
        mentor: 'Game Master'
      },
      {
        id: 'stocks_consommables',
        name: 'Vérifier et réapprovisionner stocks',
        description: 'Gérer consommables et accessoires',
        xp: 20,
        required: true,
        estimatedTime: 30,
        room: 'Réserve',
        mentor: 'Responsable Stock'
      },
      {
        id: 'nettoyage_espaces',
        name: 'Nettoyer et entretenir les espaces',
        description: 'Espaces clients et staff, propreté quotidienne',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Tous les espaces',
        mentor: 'Équipe'
      },
      {
        id: 'gestion_caisse',
        name: 'Gérer la caisse et le bar',
        description: 'Caisse, consommations, encaissements',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Accueil/Bar',
        mentor: 'Responsable'
      },
      {
        id: 'outils_numeriques',
        name: 'Utiliser les outils numériques',
        description: 'Gestion réservations, mails, rapports d\'activité',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Bureau',
        mentor: 'Manager'
      },
      {
        id: 'ouverture_fermeture_quotidien',
        name: 'Ouverture/fermeture en autonomie',
        description: 'Procédure complète en binôme puis seul·e',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Tous les espaces',
        mentor: 'Manager'
      },
      {
        id: 'rapport_journalier',
        name: 'Remplir un rapport journalier',
        description: 'Carnet de bord, incidents, observations',
        xp: 20,
        required: false,
        estimatedTime: 30,
        room: 'Bureau',
        mentor: 'Manager'
      }
    ]
  },

  SOFT_SKILLS: {
    id: 'soft_skills',
    name: '🌱 Soft Skills & Communication',
    description: 'Développer tes qualités humaines',
    duration: 999,
    color: 'from-emerald-500 to-green-500',
    icon: '🌱',
    order: 9,
    xpTotal: 140,
    badge: 'Esprit Brain',
    room: 'Salle formation',
    tasks: [
      {
        id: 'formation_communication',
        name: 'Formation communication',
        description: 'Jeu de rôle sur gestion client difficile',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Salle formation',
        mentor: 'Formateur Communication'
      },
      {
        id: 'situation_delicate',
        name: 'Gérer une situation délicate',
        description: 'Observer ou gérer une situation client délicate',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'En situation',
        mentor: 'Game Master senior'
      },
      {
        id: 'feedback_collegue',
        name: 'Donner et recevoir du feedback',
        description: 'Exercice de feedback constructif avec collègue',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Salle formation',
        mentor: 'Manager'
      },
      {
        id: 'proposition_amelioration',
        name: 'Proposer une amélioration',
        description: 'Proposer une idée pour améliorer l\'équipe ou l\'expérience',
        xp: 25,
        required: false,
        estimatedTime: 60,
        room: 'Réunion',
        mentor: 'Manager'
      },
      {
        id: 'bilan_hebdo',
        name: 'Bilan personnel hebdomadaire',
        description: 'Auto-évaluation rapide chaque semaine',
        xp: 20,
        required: true,
        estimatedTime: 30,
        room: 'Chez soi',
        mentor: 'Auto-évaluation'
      },
      {
        id: 'initiative_equipe',
        name: 'Prendre l\'initiative',
        description: 'Dépanner un·e collègue, animer un moment convivial',
        xp: 20,
        required: false,
        estimatedTime: 60,
        room: 'En situation',
        mentor: 'Équipe'
      }
    ]
  },

  VALIDATION_FINALE: {
    id: 'validation_finale',
    name: '🚩 Validation Finale',
    description: 'Certification Game Master Brain',
    duration: 1,
    color: 'from-yellow-400 to-orange-500',
    icon: '🚩',
    order: 10,
    xpTotal: 300,
    badge: 'Game Master certifié·e Brain',
    room: 'Certification',
    tasks: [
      {
        id: 'session_complete_autonomie',
        name: 'Session complète en autonomie',
        description: 'Accueil, briefing, gestion, débriefing, reset - validé',
        xp: 100,
        required: true,
        estimatedTime: 180,
        room: 'Salle au choix',
        mentor: 'Référent·e + Manager'
      },
      {
        id: 'synthese_parcours',
        name: 'Présenter synthèse du parcours',
        description: 'Présentation orale ou écrite à manager/référent·e',
        xp: 50,
        required: true,
        estimatedTime: 60,
        room: 'Salle réunion',
        mentor: 'Manager'
      },
      {
        id: 'retour_experience',
        name: 'Retour d\'expérience complet',
        description: 'Bilan écrit ou oral de tout le parcours',
        xp: 50,
        required: true,
        estimatedTime: 90,
        room: 'Bureau',
        mentor: 'Manager'
      },
      {
        id: 'obtenir_validation',
        name: 'Obtenir la validation finale',
        description: 'Validation officielle par manager et référent·e',
        xp: 50,
        required: true,
        estimatedTime: 30,
        room: 'Bureau',
        mentor: 'Direction'
      },
      {
        id: 'celebration',
        name: 'Célébrer ton intégration !',
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

const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500", 
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
    yellow: "from-yellow-500 to-orange-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:scale-[1.02] transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL
// ==========================================

const OnboardingPage = () => {
  // États
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [userProgress, setUserProgress] = useState({});
  const [availableEntretiens, setAvailableEntretiens] = useState([]);
  const [scheduledEntretiens, setScheduledEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalXP: 0,
    completedTasks: 0,
    currentPhase: null,
    badges: []
  });

  // ==========================================
  // 📊 CHARGEMENT DES DONNÉES
  // ==========================================

  const loadUserProgress = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      console.log('📊 Chargement progression onboarding:', user.uid);

      // Charger la progression de formation
      const progressDoc = await getDoc(doc(db, 'userOnboarding', user.uid));
      
      if (progressDoc.exists()) {
        const progressData = progressDoc.data();
        setUserProgress(progressData);
        
        // Calculer les stats
        const totalXP = Object.values(progressData.phases || {}).reduce((total, phase) => {
          return total + (phase.tasks || []).reduce((taskTotal, task) => {
            return taskTotal + (task.completed ? task.xp : 0);
          }, 0);
        }, 0);

        const completedTasks = Object.values(progressData.phases || {}).reduce((total, phase) => {
          return total + (phase.tasks || []).filter(task => task.completed).length;
        }, 0);

        setStats({
          totalXP,
          completedTasks,
          currentPhase: progressData.currentPhase,
          badges: progressData.badges || []
        });

      } else {
        // Créer un nouveau profil d'onboarding
        await initializeOnboardingProfile();
      }

      // Charger les entretiens disponibles
      const entretiensQuery = query(
        collection(db, 'interviewSlots'),
        where('available', '==', true),
        orderBy('date', 'asc')
      );
      
      const entretiensSnapshot = await getDocs(entretiensQuery);
      const entretiens = [];
      entretiensSnapshot.forEach(doc => {
        entretiens.push({ id: doc.id, ...doc.data() });
      });
      
      setAvailableEntretiens(entretiens);

      // Charger les entretiens planifiés de l'utilisateur
      const scheduledQuery = query(
        collection(db, 'userInterviews'),
        where('userId', '==', user.uid),
        orderBy('scheduledDate', 'asc')
      );
      
      const scheduledSnapshot = await getDocs(scheduledQuery);
      const scheduled = [];
      scheduledSnapshot.forEach(doc => {
        scheduled.push({ id: doc.id, ...doc.data() });
      });
      
      setScheduledEntretiens(scheduled);

      console.log('✅ Données onboarding chargées');

    } catch (error) {
      console.error('❌ Erreur chargement onboarding:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // ✅ CORRECTION : Initialiser avec setDoc au lieu de updateDoc
  const initializeOnboardingProfile = async () => {
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
          started: true,
          completed: false,
          startedAt: new Date().toISOString(),
          completedAt: null,
          tasks: phase.tasks.map(task => ({
            id: task.id,
            completed: false,
            completedAt: null,
            xp: task.xp
          }))
        };
      });

      // ✅ UTILISER setDoc AU LIEU DE updateDoc
      await setDoc(doc(db, 'userOnboarding', user.uid), initialProgress);
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
      
      if (!progressDoc.exists()) {
        console.log('⚠️ Document n\'existe pas, initialisation...');
        await initializeOnboardingProfile();
        return;
      }

      const currentProgress = progressDoc.data();
      const phase = currentProgress.phases[phaseId];
      
      if (!phase) {
        console.error('❌ Phase non trouvée:', phaseId);
        return;
      }

      const task = phase.tasks.find(t => t.id === taskId);

      if (!task || task.completed) return;

      // Marquer la tâche comme complétée
      task.completed = true;
      task.completedAt = new Date().toISOString();

      // Vérifier si la phase est complète
      const allTasksCompleted = phase.tasks.every(t => t.completed);
      if (allTasksCompleted) {
        phase.completed = true;
        phase.completedAt = new Date().toISOString();
      }

      // Mettre à jour Firebase
      await updateDoc(progressRef, {
        [`phases.${phaseId}`]: phase
      });

      // Recharger les données
      await loadUserProgress();

      console.log('✅ Tâche complétée avec succès');

    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
    }
  };

  // Planifier un entretien
  const scheduleEntretien = async (entretienId) => {
    if (!user?.uid) return;

    try {
      console.log('📅 Planification entretien:', entretienId);

      await addDoc(collection(db, 'userInterviews'), {
        userId: user.uid,
        entretienId,
        scheduledDate: serverTimestamp(),
        status: 'scheduled'
      });

      // Recharger les données
      await loadUserProgress();

      console.log('✅ Entretien planifié');

    } catch (error) {
      console.error('❌ Erreur planification:', error);
    }
  };

  // Charger au montage
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadUserProgress();
    }
  }, [isAuthenticated, user?.uid, loadUserProgress]);

  // Vérification de sécurité
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Connectez-vous pour accéder à votre parcours d'onboarding</p>
        </div>
      </div>
    );
  }

  // État de chargement
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Chargement de votre parcours d'intégration...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Ton Parcours Game Master
              </h1>
              <p className="text-gray-400">Ton intégration personnalisée chez Brain Escape & Quiz Game</p>
            </div>
            <button
              onClick={loadUserProgress}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>

          {/* Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="XP Total"
              value={stats.totalXP}
              icon={Zap}
              color="yellow"
            />
            <StatCard
              title="Tâches Complétées"
              value={stats.completedTasks}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Phase Actuelle"
              value={stats.currentPhase ? FORMATION_PHASES[stats.currentPhase]?.name.split(' ')[1] || 'N/A' : 'Début'}
              icon={Target}
              color="blue"
            />
            <StatCard
              title="Badges Obtenus"
              value={stats.badges.length}
              icon={Award}
              color="purple"
            />
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {[
              { id: 'formation', label: 'Formation', icon: BookOpen },
              { id: 'entretiens', label: 'Entretiens', icon: MessageSquare },
              { id: 'progress', label: 'Progression', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'formation' && (
            <FormationTab
              userProgress={userProgress}
              onCompleteTask={completeTask}
            />
          )}
          
          {activeTab === 'entretiens' && (
            <EntretiensTab
              availableEntretiens={availableEntretiens}
              scheduledEntretiens={scheduledEntretiens}
              onScheduleEntretien={scheduleEntretien}
            />
          )}
          
          {activeTab === 'progress' && (
            <ProgressTab
              userProgress={userProgress}
              stats={stats}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

// ==========================================
// 🎓 ONGLET FORMATION
// ==========================================

const FormationTab = ({ userProgress, onCompleteTask }) => {
  return (
    <motion.div
      key="formation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {Object.values(FORMATION_PHASES).map(phase => {
        const phaseProgress = userProgress.phases?.[phase.id];
        const isActive = userProgress.currentPhase === phase.id;
        const isCompleted = phaseProgress?.completed;
        const canStart = true;

        return (
          <PremiumCard key={phase.id} className="relative overflow-hidden">
            {/* Gradient de fond */}
            <div className={`absolute inset-0 bg-gradient-to-r ${phase.color} opacity-5`} />
            
            {/* Badge de statut */}
            <div className="absolute top-4 right-4 z-10">
              {isCompleted ? (
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Terminé
                </div>
              ) : isActive ? (
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  En cours
                </div>
              ) : (
                <div className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Disponible
                </div>
              )}
            </div>

            {/* En-tête de la phase */}
            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">{phase.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{phase.name}</h3>
                  <p className="text-gray-400">{phase.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mt-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {phase.duration === 999 ? 'Flexible' : `${phase.duration} jours`}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {phase.xpTotal} XP
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {phase.room}
                </div>
              </div>
            </div>

            {/* Liste des tâches */}
            <div className="space-y-3 relative z-10">
              {phase.tasks.map(task => {
                const taskProgress = phaseProgress?.tasks?.find(t => t.id === task.id);
                const isTaskCompleted = taskProgress?.completed || false;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isTaskCompleted
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isTaskCompleted ? (
                            <CheckSquare className="w-5 h-5 text-green-400" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                          <h4 className={`font-semibold ${isTaskCompleted ? 'text-green-400' : 'text-white'}`}>
                            {task.name}
                          </h4>
                          {task.required && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                              Obligatoire
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{task.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedTime} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            +{task.xp} XP
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {task.room}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.mentor}
                          </div>
                        </div>
                      </div>

                      {!isTaskCompleted && canStart && (
                        <button
                          onClick={() => onCompleteTask(phase.id, task.id)}
                          className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Compléter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>
        );
      })}
    </motion.div>
  );
};

// ==========================================
// 💬 ONGLET ENTRETIENS
// ==========================================

const EntretiensTab = ({ availableEntretiens, scheduledEntretiens, onScheduleEntretien }) => {
  return (
    <motion.div
      key="entretiens"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Entretiens planifiés */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Mes Entretiens Planifiés
        </h3>
        
        {scheduledEntretiens.length === 0 ? (
          <p className="text-gray-400">Aucun entretien planifié pour le moment</p>
        ) : (
          <div className="space-y-3">
            {scheduledEntretiens.map(entretien => (
              <div
                key={entretien.id}
                className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{entretien.title}</h4>
                    <p className="text-sm text-gray-400">{entretien.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {new Date(entretien.scheduledDate?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>

      {/* Entretiens disponibles */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Entretiens Disponibles
        </h3>
        
        {availableEntretiens.length === 0 ? (
          <p className="text-gray-400">Aucun entretien disponible actuellement</p>
        ) : (
          <div className="space-y-3">
            {availableEntretiens.map(entretien => (
              <div
                key={entretien.id}
                className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">{entretien.title}</h4>
                    <p className="text-sm text-gray-400">{entretien.description}</p>
                  </div>
                  <button
                    onClick={() => onScheduleEntretien(entretien.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Planifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </motion.div>
  );
};

// ==========================================
// 📊 ONGLET PROGRESSION
// ==========================================

const ProgressTab = ({ userProgress, stats }) => {
  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="XP Total"
          value={stats.totalXP}
          icon={Zap}
          color="blue"
        />
        <StatCard
          title="Tâches Complétées"
          value={stats.completedTasks}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Badges Obtenus"
          value={stats.badges.length}
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Phases Actives"
          value={Object.values(userProgress.phases || {}).filter(p => p.started && !p.completed).length}
          icon={Target}
          color="orange"
        />
      </div>

      {/* Progression par phase */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Progression par Phase
        </h3>
        
        <div className="space-y-4">
          {Object.values(FORMATION_PHASES).map(phase => {
            const phaseProgress = userProgress.phases?.[phase.id];
            const completedTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
            const totalTasks = phase.tasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <div key={phase.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{phase.icon}</span>
                    <span className="font-medium text-white">{phase.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {completedTasks}/{totalTasks} tâches
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${phase.color} transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PremiumCard>

      {/* Badges obtenus */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Badges Obtenus
        </h3>
        
        {stats.badges.length === 0 ? (
          <p className="text-gray-400">Aucun badge obtenu pour le moment. Continue ta progression !</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.badges.map(badgeId => {
              const badge = BADGES_ONBOARDING.find(b => b.id === badgeId);
              if (!badge) return null;
              
              return (
                <div
                  key={badge.id}
                  className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-center hover:scale-105 transition-all"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-white text-sm">{badge.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </PremiumCard>
    </motion.div>
  );
};

export default OnboardingPage;
