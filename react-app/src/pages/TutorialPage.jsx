// ==========================================
// react-app/src/pages/TutorialPage.jsx
// PAGE TUTORIEL COMPLET SYNERGIA v5.0
// Guide pédagogique exhaustif pour tous les utilisateurs
// Mis à jour : 29/12/2024
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronRight, ChevronDown, Play, CheckCircle2,
  Home, Target, Flag, Users, Calendar, MessageSquare,
  Trophy, Zap, Star, Gift, Crown, Shield, Award,
  Settings, BarChart3, Bell, Search, Plus, Edit,
  Clock, MapPin, Briefcase, GraduationCap, Lightbulb,
  Heart, Coins, TrendingUp, Lock, Unlock, Eye,
  HelpCircle, Info, AlertCircle, ArrowRight, Sparkles,
  FileText, DollarSign, Pen, CheckSquare, Send,
  Building, UserCheck, CalendarDays, Clipboard,
  FileSignature, AlertTriangle, RefreshCw
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// ==========================================
// DONNÉES DU TUTORIEL - SECTIONS UTILISATEUR
// ==========================================

const TUTORIAL_SECTIONS = [
  {
    id: 'introduction',
    title: 'Bienvenue sur Synergia !',
    icon: '🎮',
    color: 'from-purple-500 to-pink-500',
    description: 'Découvrez la plateforme gamifiée de gestion d\'équipe',
    content: [
      {
        title: 'Qu\'est-ce que Synergia ?',
        text: 'Synergia est une application de gestion d\'équipe gamifiée. Elle transforme les tâches quotidiennes en quêtes, les objectifs en défis, et récompense votre progression avec de l\'XP et des rangs ! Version 5.0 avec signature électronique, planning avancé et bien plus.',
        tips: ['Chaque action vous fait progresser', 'Collaborez avec votre équipe pour des bonus', 'Montez en rang pour débloquer des avantages', 'Signez vos pointages électroniquement']
      },
      {
        title: 'Le système RPG',
        text: 'Comme dans un jeu de rôle, vous avez un profil avec un niveau, de l\'XP (points d\'expérience), des compétences (skills) et un rang. Plus vous êtes actif, plus vous progressez ! Les quêtes vous font gagner de l\'XP dans vos compétences.',
        tips: ['Niveau = votre progression globale', 'XP = points gagnés par vos actions', 'Rang = titre honorifique avec bonus', 'Skills = compétences professionnelles']
      },
      {
        title: 'Navigation dans l\'app',
        text: 'Utilisez le menu hamburger (☰) en haut à gauche pour accéder à toutes les sections. L\'icône de cloche affiche vos notifications urgentes (pointages à signer, quêtes à valider, etc.).',
        tips: ['Menu accessible partout', 'Notifications en temps réel', 'Thème sombre pour le confort visuel', 'Notifications urgentes en rouge']
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Tableau de Bord',
    icon: '🏠',
    color: 'from-blue-500 to-cyan-500',
    description: 'Votre vue d\'ensemble quotidienne',
    content: [
      {
        title: 'Vue d\'ensemble',
        text: 'Le tableau de bord affiche un résumé de votre activité : XP du jour, quêtes en cours, streak de connexion, et les dernières actualités de l\'équipe.',
        tips: ['Consultez-le chaque jour', 'Suivez votre streak de connexion', 'Voyez les actions de votre équipe']
      },
      {
        title: 'Streak de connexion',
        text: 'Connectez-vous chaque jour pour maintenir votre streak ! Chaque jour consécutif augmente votre bonus d\'XP. Un streak de 7 jours = +15% XP bonus !',
        tips: ['1 connexion/jour minimum', 'Bonus croissant avec le temps', 'Ne cassez pas la chaîne !']
      },
      {
        title: 'Widgets rapides',
        text: 'Les cartes du dashboard vous donnent un accès rapide à vos quêtes urgentes, vos défis en cours, et vos statistiques personnelles. Les alertes importantes (pointages à signer) sont affichées en évidence.',
        tips: ['Cliquez pour plus de détails', 'Alertes pointages en orange', 'Actualisation en temps réel']
      }
    ]
  },
  {
    id: 'quests',
    title: 'Quêtes',
    icon: '⚔️',
    color: 'from-amber-500 to-orange-500',
    description: 'Vos missions quotidiennes et projets',
    content: [
      {
        title: 'Qu\'est-ce qu\'une quête ?',
        text: 'Les quêtes sont les tâches à accomplir. Elles peuvent être personnelles ou liées à une campagne d\'équipe. Chaque quête complétée rapporte de l\'XP et fait progresser vos compétences (skills) !',
        tips: ['Quête = Tâche gamifiée', 'XP variable selon difficulté', 'Skills associés progressent']
      },
      {
        title: 'Types de quêtes',
        text: 'Il existe plusieurs types : quêtes rapides (10 XP), missions standard (25 XP), défis complexes (50 XP), et épiques (100+ XP). La difficulté détermine la récompense.',
        tips: ['🟢 Facile = 10 XP', '🟡 Moyen = 25 XP', '🔴 Difficile = 50 XP', '⭐ Épique = 100+ XP']
      },
      {
        title: 'Créer une quête',
        text: 'Cliquez sur "+ Nouvelle Quête" pour créer une tâche. Définissez le titre, la description, la difficulté, la date limite et les compétences associées. Les skills sélectionnés recevront de l\'XP quand la quête sera validée.',
        tips: ['Soyez précis dans la description', 'Assignez les bonnes compétences', 'Fixez des deadlines réalistes', 'Plus de skills = XP divisé entre eux']
      },
      {
        title: 'Compléter une quête',
        text: 'Quand vous terminez une quête, cliquez sur "Soumettre". Un admin validera votre quête. À la validation, vous gagnez l\'XP et vos compétences associées progressent automatiquement !',
        tips: ['Soumettez dès que terminé', 'L\'admin valide', 'XP crédité à la validation', 'Skills XP = 50% XP quête']
      },
      {
        title: 'Se porter volontaire',
        text: 'Certaines quêtes sont ouvertes aux volontaires. Cliquez sur "Volontaire" pour vous assigner. Vous devenez responsable de cette quête.',
        tips: ['Choisissez selon vos compétences', 'Engagez-vous sérieusement', 'Collaborez si nécessaire']
      }
    ]
  },
  {
    id: 'campaigns',
    title: 'Conquêtes',
    icon: '🏰',
    color: 'from-indigo-500 to-purple-500',
    description: 'Campagnes et défis d\'équipe',
    content: [
      {
        title: 'Les Campagnes',
        text: 'Une campagne est un grand projet regroupant plusieurs quêtes. Exemple : "Préparation Noël 2025" avec toutes les tâches associées.',
        tips: ['Organisez vos grands projets', 'Suivez la progression globale', 'Toutes les quêtes sont liées']
      },
      {
        title: 'Statuts de campagne',
        text: 'Les campagnes ont des statuts : Planification (préparation), Active (en cours), En pause, Terminée. Le statut reflète l\'avancement.',
        tips: ['📋 Planification = Préparation', '🔥 Active = En cours', '⏸️ Pause = Suspendue', '✅ Terminée = Accomplie']
      },
      {
        title: 'Défis d\'équipe',
        text: 'Les défis sont des objectifs collectifs avec une cagnotte XP. Exemple : "500 XP en équipe cette semaine". Tous contribuent et la récompense est partagée !',
        tips: ['Objectif commun à atteindre', 'Chacun contribue à sa mesure', 'Récompense partagée']
      },
      {
        title: 'La Cagnotte d\'équipe',
        text: 'À chaque quête validée, une partie de l\'XP alimente la cagnotte d\'équipe. Quand un défi est réussi ou un palier atteint, des récompenses d\'équipe sont débloquées.',
        tips: ['Contribution automatique', 'Niveaux : Bronze → Diamant', 'Récompenses collectives']
      }
    ]
  },
  {
    id: 'skills',
    title: 'Arbre de Compétences',
    icon: '🌳',
    color: 'from-emerald-500 to-teal-500',
    description: 'Développez vos talents professionnels',
    content: [
      {
        title: 'Les 7 branches',
        text: 'Votre arbre comporte 7 branches de compétences : Relationnel, Technique, Communication, Organisation, Créativité, Pédagogie et Commercial. Chaque branche contient plusieurs skills.',
        tips: ['🤝 Relationnel = Service client', '🔧 Technique = Maintenance', '📱 Communication = Réseaux', '📋 Organisation = Planning', '🎨 Créativité = Design', '👩‍🏫 Pédagogie = Formation', '💼 Commercial = Vente']
      },
      {
        title: 'Gagner des XP de skill',
        text: 'Quand vous complétez une quête avec des skills associés, ces skills gagnent de l\'XP ! La formule : XP skill = (XP quête × 50%) / nombre de skills. Exemple : quête 50 XP avec 2 skills = 12.5 XP par skill.',
        tips: ['Quêtes = source principale', 'XP divisé entre skills', 'Plus de quêtes = plus de XP']
      },
      {
        title: 'Progression des skills',
        text: 'Chaque compétence a 3 tiers. En accumulant de l\'XP, vous débloquez des tiers et pouvez choisir des talents qui donnent des bonus permanents.',
        tips: ['Tier 1 = 100 XP requis', 'Tier 2 = 400 XP requis', 'Tier 3 = 1000 XP requis']
      },
      {
        title: 'Choisir un talent',
        text: 'À chaque tier atteint, vous recevez une notification ! Rendez-vous dans l\'arbre de compétences, un indicateur vous montre les choix disponibles. Choisissez 1 talent parmi 3 options.',
        tips: ['Choix définitif', '3 options par tier', 'Notification à chaque palier']
      },
      {
        title: 'Bonus actifs',
        text: 'Vos talents choisis s\'accumulent et donnent des bonus : +5% XP en relationnel, +10% efficacité technique, etc. Plus vous progressez, plus vous êtes fort !',
        tips: ['Les bonus s\'additionnent', 'Visibles dans le résumé', 'Affectent vos gains d\'XP']
      }
    ]
  },
  {
    id: 'ranks',
    title: 'Système de Rangs',
    icon: '👑',
    color: 'from-yellow-500 to-amber-500',
    description: 'Gravissez les échelons de la guilde',
    content: [
      {
        title: 'Les 10 rangs',
        text: 'Il existe 10 rangs : Apprenti → Initié → Aventurier → Héros → Champion → Maître → Sage → Légende → Transcendant → Immortel',
        tips: ['🌱 Apprenti (Niv. 1-9)', '⚔️ Initié (Niv. 10-19)', '🏹 Aventurier (Niv. 20-29)', '🛡️ Héros (Niv. 30-44)', '🏆 Champion (Niv. 45-59)', '👑 Maître (Niv. 60-74)', '📚 Sage (Niv. 75-89)', '✨ Légende (Niv. 90-99)', '🌟 Transcendant (Niv. 100-109)', '💫 Immortel (Niv. 110+)']
      },
      {
        title: 'Bonus de rang',
        text: 'Chaque rang donne un bonus d\'XP permanent. Plus votre rang est élevé, plus vous gagnez d\'XP rapidement !',
        tips: ['Apprenti = 0% bonus', 'Héros = +5% XP', 'Maître = +15% XP', 'Immortel = +50% XP']
      },
      {
        title: 'Avantages exclusifs',
        text: 'Les rangs débloquent des avantages : accès à des quêtes spéciales, badges exclusifs, personnalisation premium...',
        tips: ['Nouveaux privilèges par rang', 'Reconnaissance de la guilde', 'Motivation à progresser']
      }
    ]
  },
  {
    id: 'planning',
    title: 'Planning Avancé',
    icon: '📅',
    color: 'from-cyan-500 to-blue-500',
    description: 'Gérez vos horaires, shifts et pointages',
    content: [
      {
        title: 'Vue calendrier',
        text: 'Le planning affiche vos shifts (créneaux de travail) sur un calendrier. Navigation par semaine avec les flèches. Chaque colonne = un jour, chaque ligne = un employé.',
        tips: ['Vue semaine complète', 'Flèches pour naviguer', 'Cliquez sur un shift pour détails']
      },
      {
        title: 'Colonnes du planning',
        text: 'Pour chaque employé : Nom, shifts de la semaine, et colonne finale avec 3 chiffres : Pointé/Planifié/Contrat. Exemple : 32h/35h/35h signifie 32h pointées sur 35h planifiées.',
        tips: ['Bleu cyan = heures pointées', 'Blanc = heures planifiées', 'Gris = heures contrat']
      },
      {
        title: 'Créer/modifier un shift',
        text: 'Admins : cliquez sur une case vide pour ajouter un shift. Cliquez sur un shift existant pour le modifier. Définissez horaires, lieu, et notes.',
        tips: ['Double-clic = nouveau shift', 'Clic = modifier existant', 'Drag & drop disponible']
      },
      {
        title: 'Demandes de congés',
        text: 'Les demandes de congés approuvées apparaissent dans le planning. Les jours de congé sont colorés différemment.',
        tips: ['Congés = couleur spéciale', 'RTT, maladie, vacances', 'Approuvés par admin RH']
      }
    ]
  },
  {
    id: 'hr',
    title: 'Module RH',
    icon: '🏢',
    color: 'from-slate-500 to-gray-600',
    description: 'Gestion des ressources humaines complète',
    content: [
      {
        title: 'Onglet Salariés',
        text: 'Liste de tous les employés avec leurs informations : nom, poste, contrat, date d\'entrée. Admins peuvent ajouter, modifier ou archiver des profils.',
        tips: ['Recherche par nom', 'Filtres par poste/contrat', 'Fiche détaillée au clic']
      },
      {
        title: 'Onglet Congés',
        text: 'Consultez et gérez les demandes de congés. Employés : soumettez vos demandes. Admins : approuvez ou refusez avec commentaire.',
        tips: ['Types : CP, RTT, Maladie...', 'Solde visible', 'Historique complet']
      },
      {
        title: 'Onglet Pointage',
        text: 'Historique de vos pointages (check-in/check-out). Voyez vos heures travaillées par jour, semaine, mois. Les admins peuvent corriger les erreurs.',
        tips: ['Historique détaillé', 'Calcul automatique', 'Corrections possibles']
      },
      {
        title: 'Onglet Documents',
        text: 'Bibliothèque de documents RH. Les admins déposent des documents (fiches de paie, contrats, attestations). Les employés consultent et téléchargent leurs documents.',
        tips: ['Documents par catégorie', 'Téléchargement sécurisé', 'Notification nouveau doc']
      },
      {
        title: 'Onglet Paie',
        text: 'Gestion des exports paie avec validation par signature électronique. Voir section dédiée "Signature des pointages" pour le processus complet.',
        tips: ['Export CSV/PDF', 'Validation signatures', 'Envoi à la paie']
      },
      {
        title: 'Onglet Paramètres',
        text: 'Configuration RH : types de contrats, types de congés, jours fériés, règles d\'entreprise. Réservé aux administrateurs.',
        tips: ['Personnalisation complète', 'Règles métier', 'Admin only']
      }
    ]
  },
  {
    id: 'signature',
    title: 'Signature des Pointages',
    icon: '✍️',
    color: 'from-purple-500 to-pink-500',
    description: 'Validation électronique mensuelle',
    content: [
      {
        title: 'Pourquoi signer ?',
        text: 'Chaque mois, vous devez valider vos pointages par signature électronique. C\'est une obligation légale et cela permet d\'envoyer les données correctes à la paie.',
        tips: ['Obligation légale', 'Validation mensuelle', 'Avant envoi paie']
      },
      {
        title: 'Recevoir la notification',
        text: 'Quand le gestionnaire demande la validation, vous recevez une notification urgente "⏰ Pointages à valider". Si vous n\'avez pas signé, vous recevrez un rappel "🚨 RAPPEL URGENT".',
        tips: ['Notification haute priorité', 'Rappels automatiques', 'Ne pas ignorer !']
      },
      {
        title: 'Comment signer',
        text: '1. Allez dans RH > onglet Paie. 2. Un bloc orange "Validation requise" apparaît. 3. Cliquez sur "Signer mes pointages". 4. Dessinez votre signature avec la souris/doigt. 5. Cliquez "Signer et valider".',
        tips: ['Menu RH > Paie', 'Bloc orange = action requise', 'Signature manuscrite']
      },
      {
        title: 'Après signature',
        text: 'Une fois signé, le bloc devient vert "Pointages validés" avec votre signature affichée et la date/heure. Le gestionnaire est notifié. Quand tous ont signé, les données peuvent être envoyées à la paie.',
        tips: ['Confirmation immédiate', 'Signature conservée', 'Gestionnaire notifié']
      },
      {
        title: 'Si vous êtes aussi gestionnaire',
        text: 'Si vous êtes admin ET employé, vous verrez les deux vues : la liste de tous les employés ET votre propre section "Ma signature personnelle" en bas pour signer vos propres pointages.',
        tips: ['Vue admin complète', 'Section personnelle en bas', 'N\'oubliez pas de signer aussi !']
      }
    ]
  },
  {
    id: 'poste-garde',
    title: 'Poste de Garde',
    icon: '🏛️',
    color: 'from-slate-600 to-gray-700',
    description: 'Pointage et présence quotidienne',
    content: [
      {
        title: 'Check-in / Check-out',
        text: 'Le Poste de Garde permet de pointer votre arrivée et votre départ chaque jour. C\'est votre badgeuse virtuelle ! Un gros bouton pour pointer facilement.',
        tips: ['Pointez en arrivant', 'Pointez en partant', 'Un clic suffit']
      },
      {
        title: 'Historique de présence',
        text: 'Consultez votre historique de pointages : heures d\'arrivée, de départ, durée travaillée. Ces données alimentent le planning (colonne "Pointé").',
        tips: ['Historique complet', 'Stats par semaine/mois', 'Base pour la paie']
      },
      {
        title: 'Statut en temps réel',
        text: 'Voyez qui est actuellement présent dans l\'équipe. L\'avatar vert = présent, gris = absent. Pratique pour savoir qui est disponible !',
        tips: ['Liste des présents', 'Actualisation live', 'Indication de disponibilité']
      }
    ]
  },
  {
    id: 'wellbeing',
    title: 'Bien-être au Travail',
    icon: '💚',
    color: 'from-pink-500 to-rose-500',
    description: 'Suivez et améliorez votre bien-être quotidien',
    content: [
      {
        title: 'Question au dépointage',
        text: 'Lorsque vous pointez votre départ, une question apparaît : "Comment s\'est passée ta journée ?". Choisissez parmi 5 niveaux d\'humeur (😫 à 😄). Cette information est anonymisée et aide l\'équipe à suivre le bien-être global.',
        tips: ['5 niveaux de mood', 'Commentaire optionnel', 'Données anonymisées', 'Option "Passer" disponible']
      },
      {
        title: 'Défi bien-être du jour',
        text: 'Chaque jour, un mini-défi bien-être vous est proposé sur la page Poste de Garde. Ces défis sont concrets et simples : pause active, hydratation, respiration, rangement... Validez-les pour gagner de l\'XP bonus !',
        tips: ['🚶 Pause active = 10 XP', '💧 Hydratation = 5 XP', '🧘 Respiration = 5 XP', '🧹 Bureau zen = 10 XP']
      },
      {
        title: 'Types de défis',
        text: 'Les défis couvrent différentes catégories : physique (marche, étirements, posture), santé (hydratation, pause écran), relaxation (respiration, vraie pause), organisation (priorités, rangement), et mental (gratitude).',
        tips: ['Différent chaque jour', 'Adapté à votre profil', 'XP de 5 à 15 points', 'Un défi par jour']
      },
      {
        title: 'Données personnelles',
        text: 'Vos réponses de bien-être sont personnelles et anonymisées dans les statistiques d\'équipe. Seuls les managers voient les tendances globales, jamais les réponses individuelles identifiées.',
        tips: ['Anonymat garanti', 'Aucun jugement', 'Aide à améliorer l\'ambiance', 'Contribue au bien-être collectif']
      }
    ]
  },
  {
    id: 'academie',
    title: 'Académie',
    icon: '🎓',
    color: 'from-teal-500 to-emerald-500',
    description: 'Formation, mentorat et alternance',
    content: [
      {
        title: 'Parcours de formation',
        text: 'L\'Académie propose des parcours d\'apprentissage. Suivez des modules pour développer vos compétences et gagner de l\'XP ! Chaque module validé fait progresser vos skills.',
        tips: ['Modules structurés', 'XP à chaque étape', 'Skills progressent']
      },
      {
        title: 'Système de mentorat',
        text: 'Les membres expérimentés peuvent devenir mentors. Les nouveaux sont accompagnés par un mentor pour une intégration réussie. Relation mentor/mentoré visible dans l\'app.',
        tips: ['Mentor = Guide attitré', 'Sessions régulières', 'Suivi de progression']
      },
      {
        title: 'Section Alternance',
        text: 'Gestion complète des alternants : profils, tuteurs assignés, suivi de formation, évaluations. Les tuteurs ont une vue spéciale pour suivre leurs alternants.',
        tips: ['Profils alternants', 'Tuteurs assignés', 'Suivi de progression']
      },
      {
        title: 'Ressources',
        text: 'Accédez à la bibliothèque de ressources : guides, tutoriels, procédures, documentation... Tout pour vous aider !',
        tips: ['Docs centralisées', 'Recherche facile', 'Toujours à jour']
      }
    ]
  },
  {
    id: 'crieur',
    title: 'Le Crieur',
    icon: '📢',
    color: 'from-red-500 to-orange-500',
    description: 'Actualités et annonces',
    content: [
      {
        title: 'Fil d\'actualités',
        text: 'Le Crieur est votre journal d\'équipe. Il affiche les annonces importantes, les news, les événements à venir. Les posts urgents sont mis en évidence.',
        tips: ['Infos officielles', 'Annonces importantes', 'Événements à venir']
      },
      {
        title: 'Publications',
        text: 'Les admins publient les informations. Vous pouvez réagir et commenter les publications. Les posts peuvent être catégorisés par type.',
        tips: ['Réagissez aux posts', 'Commentez si besoin', 'Restez informé']
      }
    ]
  },
  {
    id: 'boite-idees',
    title: 'Boîte à Idées',
    icon: '💡',
    color: 'from-yellow-400 to-orange-500',
    description: 'Proposez et votez pour des améliorations',
    content: [
      {
        title: 'Proposer une idée',
        text: 'Vous avez une suggestion ? Soumettez-la via la Boîte à Idées ! Décrivez votre proposition et pourquoi elle serait utile. Vous gagnez de l\'XP si votre idée est adoptée !',
        tips: ['Toute idée est bienvenue', 'Soyez constructif', 'XP si adoptée']
      },
      {
        title: 'Voter pour les idées',
        text: 'Chaque membre peut voter pour les idées qu\'il trouve pertinentes. Les plus votées sont prioritaires pour l\'équipe. L\'auteur est notifié des votes.',
        tips: ['1 vote par idée', 'Soutenez les bonnes idées', 'Notification au vote']
      },
      {
        title: 'Suivi des propositions',
        text: 'Suivez le statut de vos idées : En attente, En cours d\'étude, Adoptée, Refusée, Implémentée. Notification à chaque changement de statut.',
        tips: ['Statut visible', 'Feedback des admins', 'XP bonus si implémentée']
      }
    ]
  },
  {
    id: 'recompenses',
    title: 'Récompenses',
    icon: '🎁',
    color: 'from-pink-500 to-rose-500',
    description: 'Échangez vos points contre des avantages',
    content: [
      {
        title: 'Boutique de récompenses',
        text: 'Échangez vos points de récompense contre des avantages : jours de congé bonus, cadeaux, privilèges... Le catalogue est défini par les admins.',
        tips: ['Points ≠ XP', 'Catalogue varié', 'Demande = validation admin']
      },
      {
        title: 'Récompenses d\'équipe',
        text: 'Certaines récompenses sont collectives et utilisent la cagnotte d\'équipe. Quand l\'équipe atteint un objectif, une récompense commune peut être débloquée.',
        tips: ['Cagnotte d\'équipe', 'Objectifs collectifs', 'Récompenses partagées']
      },
      {
        title: 'Historique',
        text: 'Consultez l\'historique de vos demandes de récompenses et leur statut : en attente, approuvée, refusée, distribuée.',
        tips: ['Suivi des demandes', 'Statuts en temps réel', 'Feedback si refus']
      }
    ]
  },
  {
    id: 'personnalisation',
    title: 'Personnalisation',
    icon: '🎨',
    color: 'from-pink-500 to-purple-500',
    description: 'Customisez votre profil',
    content: [
      {
        title: 'Avatar et titre',
        text: 'Personnalisez votre avatar et choisissez un titre affiché sous votre nom. Débloquez de nouvelles options en progressant !',
        tips: ['Avatars débloquables', 'Titres exclusifs par rang', 'Montrez votre style']
      },
      {
        title: 'Badges collectés',
        text: 'Affichez vos badges de réussite. Chaque accomplissement peut vous donner un badge unique à collectionner.',
        tips: ['Badges = Succès', 'Collection à compléter', 'Certains sont rares']
      },
      {
        title: 'Thèmes',
        text: 'Choisissez parmi plusieurs thèmes visuels pour personnaliser l\'apparence de votre app.',
        tips: ['Mode sombre par défaut', 'Autres thèmes disponibles', 'Confort visuel']
      }
    ]
  },
  {
    id: 'taverne',
    title: 'La Taverne',
    icon: '🍺',
    color: 'from-amber-500 to-orange-600',
    description: 'Espace social : messagerie et boosts',
    content: [
      {
        title: 'Qu\'est-ce que la Taverne ?',
        text: 'La Taverne est votre espace social dans Synergia. C\'est le lieu de rencontre virtuel où vous pouvez discuter avec vos collègues et leur envoyer des encouragements (Boosts) !',
        tips: ['Espace convivial', 'Communication d\'équipe', 'Encouragements mutuels']
      },
      {
        title: 'Messagerie',
        text: 'Échangez des messages privés avec vos collègues. Démarrez une nouvelle conversation ou continuez une discussion existante. Les messages non lus sont signalés avec une notification.',
        tips: ['Conversations privées', 'Historique conservé', 'Notifications temps réel']
      },
      {
        title: 'Système de Boosts',
        text: 'Les Boosts sont des encouragements que vous envoyez à vos collègues. Chaque Boost donne de l\'XP au destinataire ET à l\'envoyeur ! Types disponibles : 🔥 Motivation, ⭐ Excellence, 💪 Force, 🎯 Focus.',
        tips: ['🔥 Boost Motivation', '⭐ Boost Excellence', '💪 Boost Force', '🎯 Boost Focus']
      },
      {
        title: 'Historique des Boosts',
        text: 'Consultez tous les Boosts que vous avez reçus et envoyés. Filtrez par type et suivez vos statistiques de Boosts.',
        tips: ['Boosts reçus = XP gagné', 'Boosts envoyés = XP donné', 'Stats par type']
      }
    ]
  },
  {
    id: 'equipe',
    title: 'Page Équipe',
    icon: '👥',
    color: 'from-blue-500 to-indigo-500',
    description: 'Découvrez les membres de votre équipe',
    content: [
      {
        title: 'Annuaire d\'équipe',
        text: 'La page Équipe affiche tous les membres avec leurs profils : niveau, XP, rang, skills principaux. Découvrez qui fait partie de votre guilde !',
        tips: ['Profils détaillés', 'Stats de chacun', 'Filtres de recherche']
      },
      {
        title: 'Profils détaillés',
        text: 'Cliquez sur un membre pour voir son profil complet : ses quêtes, ses badges, son historique, ses compétences, son arbre de skills.',
        tips: ['Quêtes assignées', 'Badges obtenus', 'Progression visible']
      },
      {
        title: 'Envoyer un Boost',
        text: 'Depuis la page Équipe, envoyez directement un Boost à un collègue pour l\'encourager. C\'est rapide et ça fait du bien !',
        tips: ['Boost depuis la carte', 'Choisissez le type', 'Message personnalisé']
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Système de Notifications',
    icon: '🔔',
    color: 'from-red-500 to-pink-500',
    description: 'Restez informé en temps réel',
    content: [
      {
        title: 'Types de notifications',
        text: 'Vous recevez des notifications pour : quêtes à valider, quêtes validées/refusées, boosts reçus, congés approuvés, pointages à signer, nouvelles idées, et plus encore.',
        tips: ['Quêtes = orange', 'Validation = vert/rouge', 'Urgents = icône 🚨']
      },
      {
        title: 'Notifications urgentes',
        text: 'Certaines notifications sont prioritaires : pointages à signer, rappels urgents. Elles apparaissent avec une icône 🚨 et restent visibles jusqu\'à action.',
        tips: ['Icône rouge = urgent', 'Action requise', 'Ne pas ignorer']
      },
      {
        title: 'Marquer comme lu',
        text: 'Cliquez sur une notification pour la marquer comme lue et accéder à la page concernée. Utilisez "Tout marquer comme lu" pour nettoyer la liste.',
        tips: ['Clic = marquer lu', 'Lien direct vers action', 'Bulk clear disponible']
      }
    ]
  }
];

// ==========================================
// SECTIONS ADMIN
// ==========================================

const ADMIN_SECTIONS = [
  {
    id: 'admin-validation',
    title: 'Validation des Quêtes',
    icon: '🛡️',
    color: 'from-green-600 to-emerald-600',
    description: 'Approuvez ou refusez les quêtes soumises',
    adminOnly: true,
    content: [
      {
        title: 'Liste des soumissions',
        text: 'Voyez toutes les quêtes en attente de validation. Chaque soumission affiche : nom de l\'employé, titre de la quête, XP prévu, date de soumission.',
        tips: ['Triées par date', 'Filtres disponibles', 'Nombre en attente visible']
      },
      {
        title: 'Valider une quête',
        text: 'Cliquez sur une soumission pour voir les détails. Vous pouvez approuver (l\'XP est crédité + skills progressent) ou rejeter avec un commentaire.',
        tips: ['Approuver = XP + Skills', 'Rejeter = commentaire requis', 'Notification à l\'employé']
      },
      {
        title: 'Impact sur les skills',
        text: 'Quand vous validez, les compétences associées à la quête reçoivent automatiquement de l\'XP. Vérifiez que les bons skills sont assignés.',
        tips: ['Distribution automatique', 'Skills XP = 50% XP quête', 'Divisé entre tous les skills']
      }
    ]
  },
  {
    id: 'admin-payroll',
    title: 'Gestion Paie (Admin)',
    icon: '💰',
    color: 'from-emerald-600 to-teal-600',
    description: 'Workflow de validation des pointages',
    adminOnly: true,
    content: [
      {
        title: 'Demander les signatures',
        text: 'Dans RH > Paie, cliquez sur "Demander validation aux employés". Tous les employés reçoivent une notification urgente pour signer leurs pointages du mois.',
        tips: ['Notification à tous', 'Mois sélectionnable', 'Urgence haute']
      },
      {
        title: 'Suivre les signatures',
        text: 'Le tableau affiche le statut de chaque employé : En attente (orange) ou Signé (vert + date). Les compteurs montrent la progression globale.',
        tips: ['Compteurs en haut', 'Statut par employé', 'Date de signature visible']
      },
      {
        title: 'Relancer les non-signés',
        text: 'Si certains n\'ont pas signé, cliquez sur "Relancer les non-signés". Ils recevront un rappel URGENT 🚨. Seuls les non-signés sont relancés.',
        tips: ['Rappel ciblé', 'Message urgent', 'Ne relance pas les signés']
      },
      {
        title: 'Envoyer à la paie',
        text: 'Quand tous ont signé, le bouton "Envoyer à la paie" apparaît. Cliquez pour finaliser et exporter les données. Les pointages sont alors verrouillés.',
        tips: ['Tous doivent signer', 'Export automatique', 'Verrouillage final']
      },
      {
        title: 'Votre propre signature',
        text: 'Si vous êtes aussi employé, n\'oubliez pas de signer vos propres pointages ! Une section "Ma signature personnelle" apparaît en bas de la vue admin.',
        tips: ['Section en bas', 'Même processus', 'N\'oubliez pas !']
      }
    ]
  },
  {
    id: 'admin-wellbeing',
    title: 'Dashboard Bien-être',
    icon: '💚',
    color: 'from-pink-600 to-rose-600',
    description: 'Suivez le moral de votre équipe',
    adminOnly: true,
    content: [
      {
        title: 'Accéder au dashboard',
        text: 'Dans le module RH, un nouvel onglet "Bien-être" affiche les statistiques de bien-être de l\'équipe. Ces données sont anonymisées : vous voyez des tendances, pas des noms.',
        tips: ['Menu RH > Onglet Bien-être', 'Données anonymisées', 'Pas d\'identification individuelle']
      },
      {
        title: 'Statistiques disponibles',
        text: 'Le dashboard affiche : la moyenne de moral (1-5), le nombre de réponses collectées, la distribution des humeurs (graphique), et la tendance (hausse/baisse/stable).',
        tips: ['Moyenne sur 5', 'Distribution par niveau', 'Tendance sur 7/14/30 jours']
      },
      {
        title: 'Alertes bien-être',
        text: 'Si la tendance est en baisse et la moyenne inférieure à 3, une alerte orange s\'affiche pour vous suggérer d\'agir (réunion d\'équipe, actions de soutien...).',
        tips: ['Alerte si tendance négative', 'Suggestions d\'actions', 'Anticipez les problèmes']
      },
      {
        title: 'Défis bien-être',
        text: 'Les employés peuvent valider des mini-défis quotidiens (pause, hydratation, etc.). Cela encourage de bonnes habitudes et génère de l\'XP bonus.',
        tips: ['10 défis différents', 'XP de 5 à 15 points', 'Encourage le bien-être actif']
      }
    ]
  },
  {
    id: 'admin-analytics',
    title: 'Analytics',
    icon: '📊',
    color: 'from-blue-600 to-indigo-600',
    description: 'Statistiques et rapports d\'équipe',
    adminOnly: true,
    content: [
      {
        title: 'Vue d\'ensemble',
        text: 'Les Analytics donnent une vision complète de l\'activité : XP total de l\'équipe, quêtes accomplies, membres actifs, progression des skills.',
        tips: ['KPIs principaux', 'Graphiques d\'évolution', 'Export PDF disponible']
      },
      {
        title: 'Rapports détaillés',
        text: 'Générez des rapports par période, par équipe, par membre. Identifiez les top performers et les axes d\'amélioration.',
        tips: ['Filtres avancés', 'Comparaisons possibles', 'Données exploitables']
      }
    ]
  },
  {
    id: 'admin-permissions',
    title: 'Permissions & Rôles',
    icon: '🔐',
    color: 'from-red-600 to-orange-600',
    description: 'Gérez qui peut faire quoi',
    adminOnly: true,
    content: [
      {
        title: 'Système de rôles',
        text: 'Les rôles définissent les permissions : Admin (tout), Manager (équipe), Organisation (planning/RH), Membre (standard). Chaque rôle a des accès spécifiques.',
        tips: ['Rôles prédéfinis', 'Permissions granulaires', 'Cumul possible']
      },
      {
        title: 'Assigner un rôle',
        text: 'Dans la page Permissions, sélectionnez un utilisateur et cochez les rôles à lui attribuer. Les changements sont immédiats.',
        tips: ['Multi-rôles possible', 'Effet immédiat', 'Historique conservé']
      },
      {
        title: 'Modules de permission',
        text: 'Chaque module (RH, Planning, Quêtes, etc.) a ses propres permissions. Un utilisateur peut être admin sur un module et simple membre sur un autre.',
        tips: ['Permissions par module', 'Flexibilité totale', 'Audit des accès']
      }
    ]
  },
  {
    id: 'admin-settings',
    title: 'Paramètres Admin',
    icon: '⚙️',
    color: 'from-gray-600 to-slate-600',
    description: 'Configuration de l\'application',
    adminOnly: true,
    content: [
      {
        title: 'Paramètres généraux',
        text: 'Configurez le nom de l\'équipe, le logo, les horaires par défaut, les règles de gamification (XP par type de quête, etc.).',
        tips: ['Personnalisez l\'app', 'Ajustez les règles XP', 'Logo d\'entreprise']
      },
      {
        title: 'Gestion des rangs',
        text: 'Personnalisez les rangs : noms, icônes, niveaux requis, bonus associés. Créez une hiérarchie adaptée à votre culture.',
        tips: ['Rangs personnalisés', 'Bonus ajustables', 'Noms créatifs']
      },
      {
        title: 'Synchronisation',
        text: 'Page de synchronisation pour corriger les données : recalculer les XP, synchroniser les profils, nettoyer les données obsolètes.',
        tips: ['Outils de maintenance', 'Recalculs possibles', 'Utilisez avec précaution']
      }
    ]
  }
];

// ==========================================
// COMPOSANT SECTION DE TUTORIEL
// ==========================================

const TutorialSection = ({ section, isExpanded, onToggle }) => {
  const [activeContent, setActiveContent] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header cliquable */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
      >
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl sm:text-3xl">{section.icon}</span>
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg">{section.title}</h3>
            {section.adminOnly && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-full font-bold">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-0.5">{section.description}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      {/* Contenu expandable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5">
              {/* Navigation entre sous-sections */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/10">
                {section.content.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveContent(idx)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeContent === idx
                        ? `bg-gradient-to-r ${section.color} text-white`
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {/* Contenu actif */}
              <motion.div
                key={activeContent}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-purple-400" />
                  {section.content[activeContent].title}
                </h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {section.content[activeContent].text}
                </p>

                {/* Tips */}
                {section.content[activeContent].tips && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">À retenir</span>
                    </div>
                    <ul className="space-y-2">
                      {section.content[activeContent].tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// PAGE PRINCIPALE
// ==========================================

const TutorialPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);
  const [expandedSection, setExpandedSection] = useState('introduction');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les sections
  const allSections = [...TUTORIAL_SECTIONS, ...(userIsAdmin ? ADMIN_SECTIONS : [])];
  const filteredSections = allSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculer stats
  const totalLessons = allSections.reduce((sum, s) => sum + s.content.length, 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Guide Complet Synergia
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
              Apprenez à utiliser toutes les fonctionnalités de l'application pour devenir un maître de la guilde !
            </p>
            <div className="mt-2 inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
              Version 5.0 - Mise à jour 29/12/2024
            </div>
          </motion.div>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un sujet (ex: signature, pointage, skills...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </motion.div>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">{TUTORIAL_SECTIONS.length}</div>
              <div className="text-[10px] sm:text-xs text-gray-400">Sections</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{totalLessons}</div>
              <div className="text-[10px] sm:text-xs text-gray-400">Leçons</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">∞</div>
              <div className="text-[10px] sm:text-xs text-gray-400">XP à gagner</div>
            </div>
          </motion.div>

          {/* Nouveautés v5.0 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">🆕 Nouveautés v5.0</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>💚 <strong>Bien-être au travail</strong> : question au dépointage + défis quotidiens</li>
                  <li>📊 <strong>Dashboard bien-être</strong> pour les managers (données anonymisées)</li>
                  <li>✍️ <strong>Signature électronique</strong> des pointages mensuels</li>
                  <li>🌳 <strong>Système de Skills</strong> avec choix de talents</li>
                  <li>📅 <strong>Planning avancé</strong> avec heures pointées/planifiées</li>
                  <li>🔔 <strong>Notifications urgentes</strong> pour les rappels paie</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Message de bienvenue */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Conseil du jour</h3>
                <p className="text-sm text-gray-300">
                  Lisez chaque section dans l'ordre pour une compréhension complète.
                  Commencez par l'introduction, puis explorez les fonctionnalités une par une !
                  <strong className="text-purple-300"> N'oubliez pas de signer vos pointages chaque mois !</strong>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Liste des sections */}
          <div className="space-y-3">
            {/* Titre sections utilisateur */}
            <div className="flex items-center gap-2 mt-6 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Fonctionnalités</h2>
              <span className="text-xs text-gray-500">({TUTORIAL_SECTIONS.length} sections)</span>
            </div>

            {filteredSections.filter(s => !s.adminOnly).map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.02 }}
              >
                <TutorialSection
                  section={section}
                  isExpanded={expandedSection === section.id}
                  onToggle={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                />
              </motion.div>
            ))}

            {/* Sections admin */}
            {userIsAdmin && filteredSections.filter(s => s.adminOnly).length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-8 mb-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-bold text-white">Administration</h2>
                  <span className="text-xs text-gray-500">(réservé aux admins)</span>
                </div>

                {filteredSections.filter(s => s.adminOnly).map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                  >
                    <TutorialSection
                      section={section}
                      isExpanded={expandedSection === section.id}
                      onToggle={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    />
                  </motion.div>
                ))}
              </>
            )}

            {/* Aucun résultat */}
            {filteredSections.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun résultat pour "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-3 px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            )}
          </div>

          {/* Raccourcis rapides */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4"
          >
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Raccourcis rapides
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => { setSearchTerm(''); setExpandedSection('wellbeing'); }}
                className="p-3 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg text-center transition-colors"
              >
                <span className="text-xl">💚</span>
                <p className="text-xs text-gray-300 mt-1">Bien-être</p>
              </button>
              <button
                onClick={() => { setSearchTerm(''); setExpandedSection('signature'); }}
                className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-center transition-colors"
              >
                <span className="text-xl">✍️</span>
                <p className="text-xs text-gray-300 mt-1">Signature</p>
              </button>
              <button
                onClick={() => { setSearchTerm(''); setExpandedSection('skills'); }}
                className="p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-center transition-colors"
              >
                <span className="text-xl">🌳</span>
                <p className="text-xs text-gray-300 mt-1">Skills</p>
              </button>
              <button
                onClick={() => { setSearchTerm(''); setExpandedSection('quests'); }}
                className="p-3 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-center transition-colors"
              >
                <span className="text-xl">⚔️</span>
                <p className="text-xs text-gray-300 mt-1">Quêtes</p>
              </button>
              <button
                onClick={() => { setSearchTerm(''); setExpandedSection('hr'); }}
                className="p-3 bg-slate-500/20 hover:bg-slate-500/30 rounded-lg text-center transition-colors"
              >
                <span className="text-xl">🏢</span>
                <p className="text-xs text-gray-300 mt-1">RH</p>
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              Besoin d'aide supplémentaire ? Contactez votre administrateur.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Synergia v5.0 - Guide mis à jour le 29/12/2024
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorialPage;
