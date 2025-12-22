// ==========================================
// react-app/src/pages/AdminRolePermissionsPage.jsx
// PAGE ADMINISTRATION DES PERMISSIONS UTILISATEURS V4.0
// SYSTÈME COMPLET DE GESTION DES DROITS PAR MODULE
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Settings,
  Lock,
  Unlock,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Crown,
  Zap,
  Target,
  Award,
  Clock,
  Calendar,
  FileText,
  BarChart3,
  UserPlus,
  Layers,
  Database,
  BookOpen,
  Search,
  Filter,
  History,
  TrendingUp,
  Flag,
  Gamepad2,
  Trophy,
  Gift,
  MessageSquare,
  PieChart,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  UserCog,
  Key,
  Briefcase,
  Heart,
  DollarSign,
  Palette,
  Bell,
  Mail,
  Phone,
  MapPin,
  Building,
  Clipboard,
  Timer,
  Star,
  Sparkles,
  GraduationCap,
  Megaphone,
  Package,
  Wrench,
  Handshake,
  ShieldCheck,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';

// Firebase
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Hooks
import { useAuthStore } from '../shared/stores/authStore.js';

// Layout
import Layout from '../components/layout/Layout.jsx';

// Notifications
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-[10000] px-4 py-3 rounded-xl text-white font-medium max-w-md transform transition-all duration-300 translate-x-full ${
    type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
    type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
    'bg-gradient-to-r from-blue-500 to-indigo-600'
  } shadow-lg backdrop-blur-xl border border-white/20`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};

// ==========================================
// DÉFINITION COMPLÈTE DES MODULES ET PERMISSIONS
// ==========================================

const PERMISSION_MODULES = {
  // ===== ADMINISTRATION SYSTÈME =====
  system_admin: {
    id: 'system_admin',
    name: 'Administration Système',
    icon: ShieldCheck,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/20',
    description: 'Accès complet à tous les paramètres système',
    category: 'admin',
    permissions: [
      { id: 'system_full_access', name: 'Accès complet système', icon: Crown, level: 'god', description: 'Tous les droits sans restriction' },
      { id: 'system_settings', name: 'Paramètres Synergia', icon: Settings, level: 'admin', description: 'Modifier les paramètres globaux' },
      { id: 'system_users_manage', name: 'Gérer tous les utilisateurs', icon: Users, level: 'admin', description: 'Créer, modifier, supprimer des comptes' },
      { id: 'system_roles_manage', name: 'Gérer les rôles', icon: Key, level: 'admin', description: 'Attribuer et modifier les rôles' },
      { id: 'system_permissions_manage', name: 'Gérer les permissions', icon: Lock, level: 'admin', description: 'Modifier les droits des utilisateurs' },
      { id: 'system_logs_view', name: 'Voir les logs système', icon: FileText, level: 'admin', description: 'Consulter l\'historique des actions' }
    ]
  },

  // ===== ANALYTICS & RAPPORTS =====
  analytics: {
    id: 'analytics',
    name: 'Analytics & Rapports',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/20',
    description: 'Statistiques et tableaux de bord',
    category: 'admin',
    permissions: [
      { id: 'analytics_view_basic', name: 'Voir stats basiques', icon: Eye, level: 'view', description: 'Statistiques générales' },
      { id: 'analytics_view_detailed', name: 'Voir stats détaillées', icon: PieChart, level: 'edit', description: 'Rapports complets avec détails' },
      { id: 'analytics_view_team', name: 'Voir stats équipe', icon: Users, level: 'edit', description: 'Performance de toute l\'équipe' },
      { id: 'analytics_view_individual', name: 'Voir stats individuelles', icon: UserCog, level: 'edit', description: 'Performance par collaborateur' },
      { id: 'analytics_export', name: 'Exporter les données', icon: FileText, level: 'admin', description: 'Export PDF/Excel des rapports' },
      { id: 'analytics_admin', name: 'Administration analytics', icon: Crown, level: 'admin', description: 'Configuration des tableaux de bord' }
    ]
  },

  // ===== PLANNING & HORAIRES =====
  planning: {
    id: 'planning',
    name: 'Planning & Horaires',
    icon: Calendar,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-500/20',
    description: 'Gestion des plannings et emplois du temps',
    category: 'tools',
    permissions: [
      { id: 'planning_view_own', name: 'Voir son planning', icon: Eye, level: 'view', description: 'Consulter son propre emploi du temps' },
      { id: 'planning_view_team', name: 'Voir planning équipe', icon: Users, level: 'view', description: 'Consulter les plannings de tous' },
      { id: 'planning_edit_own', name: 'Modifier son planning', icon: Edit, level: 'edit', description: 'Changer ses propres horaires' },
      { id: 'planning_edit_team', name: 'Modifier planning équipe', icon: UserCog, level: 'admin', description: 'Gérer les plannings de tous' },
      { id: 'planning_create_events', name: 'Créer des événements', icon: Calendar, level: 'edit', description: 'Ajouter des réunions, événements' },
      { id: 'planning_admin', name: 'Administration planning', icon: Crown, level: 'admin', description: 'Paramétrage complet du planning' }
    ]
  },

  // ===== POINTEUSE & TEMPS =====
  timetracking: {
    id: 'timetracking',
    name: 'Pointeuse & Temps de travail',
    icon: Timer,
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500/20',
    description: 'Suivi du temps et pointages',
    category: 'tools',
    permissions: [
      { id: 'time_clock_own', name: 'Pointer soi-même', icon: Clock, level: 'view', description: 'Enregistrer ses propres pointages' },
      { id: 'time_view_own', name: 'Voir son historique', icon: Eye, level: 'view', description: 'Consulter ses heures' },
      { id: 'time_view_team', name: 'Voir historique équipe', icon: Users, level: 'edit', description: 'Consulter les heures de tous' },
      { id: 'time_edit_own', name: 'Corriger ses pointages', icon: Edit, level: 'edit', description: 'Modifier ses propres entrées' },
      { id: 'time_edit_team', name: 'Corriger pointages équipe', icon: UserCog, level: 'admin', description: 'Modifier les pointages de tous' },
      { id: 'time_validate', name: 'Valider les heures', icon: CheckCircle, level: 'admin', description: 'Approuver les feuilles de temps' },
      { id: 'time_admin', name: 'Administration pointeuse', icon: Crown, level: 'admin', description: 'Paramétrage de la pointeuse' }
    ]
  },

  // ===== RESSOURCES HUMAINES =====
  hr: {
    id: 'hr',
    name: 'Ressources Humaines',
    icon: Briefcase,
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/20',
    description: 'Informations sensibles des collaborateurs',
    category: 'admin',
    permissions: [
      { id: 'hr_view_own', name: 'Voir son dossier RH', icon: Eye, level: 'view', description: 'Consulter ses propres infos' },
      { id: 'hr_view_basic', name: 'Voir infos basiques équipe', icon: Users, level: 'view', description: 'Nom, poste, département' },
      { id: 'hr_view_contact', name: 'Voir coordonnées', icon: Phone, level: 'edit', description: 'Email, téléphone, adresse' },
      { id: 'hr_view_sensitive', name: 'Voir infos sensibles', icon: ShieldAlert, level: 'admin', description: 'Salaire, contrat, documents' },
      { id: 'hr_edit_profiles', name: 'Modifier profils', icon: Edit, level: 'admin', description: 'Modifier les fiches collaborateurs' },
      { id: 'hr_manage_contracts', name: 'Gérer contrats', icon: FileText, level: 'admin', description: 'Documents contractuels' },
      { id: 'hr_admin', name: 'Administration RH', icon: Crown, level: 'admin', description: 'Accès complet aux dossiers RH' }
    ]
  },

  // ===== QUÊTES & TÂCHES =====
  tasks: {
    id: 'tasks',
    name: 'Quêtes & Tâches',
    icon: Target,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/20',
    description: 'Gestion des missions et objectifs',
    category: 'gamification',
    permissions: [
      { id: 'tasks_view_own', name: 'Voir ses quêtes', icon: Eye, level: 'view', description: 'Consulter ses missions' },
      { id: 'tasks_view_team', name: 'Voir quêtes équipe', icon: Users, level: 'view', description: 'Consulter les missions de tous' },
      { id: 'tasks_create', name: 'Créer des quêtes', icon: Target, level: 'edit', description: 'Ajouter de nouvelles missions' },
      { id: 'tasks_assign', name: 'Assigner des quêtes', icon: UserPlus, level: 'edit', description: 'Attribuer des missions à d\'autres' },
      { id: 'tasks_validate', name: 'Valider les quêtes', icon: CheckCircle, level: 'admin', description: 'Approuver les missions terminées' },
      { id: 'tasks_manage_xp', name: 'Gérer l\'XP des quêtes', icon: Zap, level: 'admin', description: 'Modifier les points attribués' },
      { id: 'tasks_admin', name: 'Administration quêtes', icon: Crown, level: 'admin', description: 'Paramétrage complet des quêtes' }
    ]
  },

  // ===== CAMPAGNES & OBJECTIFS =====
  campaigns: {
    id: 'campaigns',
    name: 'Campagnes & Objectifs',
    icon: Flag,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-500/20',
    description: 'Campagnes d\'objectifs collectifs',
    category: 'gamification',
    permissions: [
      { id: 'campaigns_view', name: 'Voir les campagnes', icon: Eye, level: 'view', description: 'Consulter les objectifs' },
      { id: 'campaigns_participate', name: 'Participer', icon: Target, level: 'view', description: 'Contribuer aux campagnes' },
      { id: 'campaigns_create', name: 'Créer des campagnes', icon: Flag, level: 'edit', description: 'Lancer de nouvelles campagnes' },
      { id: 'campaigns_edit', name: 'Modifier les campagnes', icon: Edit, level: 'edit', description: 'Changer les paramètres' },
      { id: 'campaigns_validate', name: 'Valider les objectifs', icon: CheckCircle, level: 'admin', description: 'Approuver les contributions' },
      { id: 'campaigns_admin', name: 'Administration campagnes', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== RÉCOMPENSES & BOUTIQUE =====
  rewards: {
    id: 'rewards',
    name: 'Récompenses & Boutique',
    icon: Gift,
    color: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-500/20',
    description: 'Système de récompenses et échanges',
    category: 'gamification',
    permissions: [
      { id: 'rewards_view', name: 'Voir les récompenses', icon: Eye, level: 'view', description: 'Consulter le catalogue' },
      { id: 'rewards_claim', name: 'Réclamer des récompenses', icon: Gift, level: 'view', description: 'Échanger ses points' },
      { id: 'rewards_create', name: 'Créer des récompenses', icon: Sparkles, level: 'edit', description: 'Ajouter au catalogue' },
      { id: 'rewards_edit', name: 'Modifier les récompenses', icon: Edit, level: 'edit', description: 'Changer prix et détails' },
      { id: 'rewards_validate', name: 'Valider les demandes', icon: CheckCircle, level: 'admin', description: 'Approuver les échanges' },
      { id: 'rewards_manage_stock', name: 'Gérer les stocks', icon: Package, level: 'admin', description: 'Inventaire des récompenses' },
      { id: 'rewards_admin', name: 'Administration boutique', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== BADGES & ACHIEVEMENTS =====
  badges: {
    id: 'badges',
    name: 'Badges & Succès',
    icon: Trophy,
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-500/20',
    description: 'Système de badges et accomplissements',
    category: 'gamification',
    permissions: [
      { id: 'badges_view', name: 'Voir les badges', icon: Eye, level: 'view', description: 'Consulter les badges disponibles' },
      { id: 'badges_view_team', name: 'Voir badges équipe', icon: Users, level: 'view', description: 'Badges des collègues' },
      { id: 'badges_create', name: 'Créer des badges', icon: Award, level: 'edit', description: 'Concevoir nouveaux badges' },
      { id: 'badges_assign', name: 'Attribuer des badges', icon: UserPlus, level: 'admin', description: 'Donner des badges manuellement' },
      { id: 'badges_admin', name: 'Administration badges', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== XP & GAMIFICATION =====
  gamification: {
    id: 'gamification',
    name: 'XP & Niveaux',
    icon: Zap,
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-500/20',
    description: 'Système d\'expérience et progression',
    category: 'gamification',
    permissions: [
      { id: 'xp_view_own', name: 'Voir son XP', icon: Eye, level: 'view', description: 'Consulter sa progression' },
      { id: 'xp_view_team', name: 'Voir XP équipe', icon: Users, level: 'view', description: 'Classement et stats' },
      { id: 'xp_grant_manual', name: 'Attribuer de l\'XP', icon: Zap, level: 'admin', description: 'Donner de l\'XP manuellement' },
      { id: 'xp_remove', name: 'Retirer de l\'XP', icon: AlertTriangle, level: 'admin', description: 'Enlever des points' },
      { id: 'xp_configure', name: 'Configurer l\'XP', icon: Settings, level: 'admin', description: 'Paramètres de gain/perte' },
      { id: 'xp_admin', name: 'Administration XP', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== BOOSTS & BONUS =====
  boosts: {
    id: 'boosts',
    name: 'Boosts & Bonus',
    icon: Sparkles,
    color: 'from-fuchsia-500 to-pink-600',
    bgColor: 'bg-fuchsia-500/20',
    description: 'Bonus temporaires et multiplicateurs',
    category: 'gamification',
    permissions: [
      { id: 'boosts_view', name: 'Voir les boosts', icon: Eye, level: 'view', description: 'Consulter les bonus actifs' },
      { id: 'boosts_activate', name: 'Activer des boosts', icon: Zap, level: 'edit', description: 'Lancer des bonus' },
      { id: 'boosts_create', name: 'Créer des boosts', icon: Sparkles, level: 'admin', description: 'Concevoir nouveaux bonus' },
      { id: 'boosts_admin', name: 'Administration boosts', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== CAGNOTTE ÉQUIPE =====
  teampool: {
    id: 'teampool',
    name: 'Cagnotte Équipe',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/20',
    description: 'Cagnotte collective et achats',
    category: 'team',
    permissions: [
      { id: 'teampool_view', name: 'Voir la cagnotte', icon: Eye, level: 'view', description: 'Consulter le solde' },
      { id: 'teampool_view_details', name: 'Voir les détails', icon: FileText, level: 'view', description: 'Historique des transactions' },
      { id: 'teampool_contribute', name: 'Contribuer', icon: DollarSign, level: 'edit', description: 'Ajouter à la cagnotte' },
      { id: 'teampool_purchase', name: 'Faire des achats', icon: Gift, level: 'admin', description: 'Utiliser la cagnotte' },
      { id: 'teampool_configure', name: 'Configurer les taux', icon: Settings, level: 'admin', description: 'Paramètres de contribution' },
      { id: 'teampool_admin', name: 'Administration cagnotte', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== MENTORAT & FORMATION =====
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation',
    icon: GraduationCap,
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-500/20',
    description: 'Parrainage et apprentissage',
    category: 'team',
    permissions: [
      { id: 'mentoring_view', name: 'Voir l\'académie', icon: Eye, level: 'view', description: 'Consulter les formations' },
      { id: 'mentoring_be_mentee', name: 'Être parrainé', icon: GraduationCap, level: 'view', description: 'Avoir un parrain' },
      { id: 'mentoring_be_mentor', name: 'Être parrain', icon: UserPlus, level: 'edit', description: 'Parrainer des collègues' },
      { id: 'mentoring_create_content', name: 'Créer des formations', icon: BookOpen, level: 'edit', description: 'Ajouter du contenu' },
      { id: 'mentoring_admin', name: 'Administration mentorat', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== PULSE & SONDAGES =====
  pulse: {
    id: 'pulse',
    name: 'Pulse & Sondages',
    icon: MessageSquare,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/20',
    description: 'Sondages et feedback équipe',
    category: 'communication',
    permissions: [
      { id: 'pulse_view', name: 'Voir les sondages', icon: Eye, level: 'view', description: 'Consulter les sondages actifs' },
      { id: 'pulse_participate', name: 'Participer', icon: MessageSquare, level: 'view', description: 'Répondre aux sondages' },
      { id: 'pulse_view_results', name: 'Voir les résultats', icon: PieChart, level: 'edit', description: 'Résultats détaillés' },
      { id: 'pulse_create', name: 'Créer des sondages', icon: Clipboard, level: 'edit', description: 'Lancer de nouveaux sondages' },
      { id: 'pulse_admin', name: 'Administration pulse', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== INFOS & COMMUNICATION =====
  communication: {
    id: 'communication',
    name: 'Infos & Communication',
    icon: Megaphone,
    color: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-500/20',
    description: 'Annonces et boîte à idées',
    category: 'communication',
    permissions: [
      { id: 'infos_view', name: 'Voir les annonces', icon: Eye, level: 'view', description: 'Consulter les actualités' },
      { id: 'infos_create', name: 'Créer des annonces', icon: Megaphone, level: 'edit', description: 'Publier des informations' },
      { id: 'ideas_submit', name: 'Soumettre des idées', icon: Sparkles, level: 'view', description: 'Proposer des idées' },
      { id: 'ideas_vote', name: 'Voter pour les idées', icon: Heart, level: 'view', description: 'Voter pour les propositions' },
      { id: 'ideas_manage', name: 'Gérer les idées', icon: Settings, level: 'admin', description: 'Accepter/refuser les idées' },
      { id: 'communication_admin', name: 'Administration comm', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== PERSONNALISATION =====
  customization: {
    id: 'customization',
    name: 'Personnalisation',
    icon: Palette,
    color: 'from-pink-500 to-fuchsia-600',
    bgColor: 'bg-pink-500/20',
    description: 'Avatars et personnalisation',
    category: 'user',
    permissions: [
      { id: 'custom_own', name: 'Personnaliser son profil', icon: Palette, level: 'view', description: 'Modifier son apparence' },
      { id: 'custom_unlock_items', name: 'Débloquer des items', icon: Unlock, level: 'view', description: 'Utiliser ses points' },
      { id: 'custom_create_items', name: 'Créer des items', icon: Sparkles, level: 'admin', description: 'Ajouter au catalogue' },
      { id: 'custom_admin', name: 'Administration custom', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== ONBOARDING =====
  onboarding: {
    id: 'onboarding',
    name: 'Onboarding & Intégration',
    icon: BookOpen,
    color: 'from-lime-500 to-green-600',
    bgColor: 'bg-lime-500/20',
    description: 'Parcours d\'intégration',
    category: 'admin',
    permissions: [
      { id: 'onboarding_view', name: 'Voir son parcours', icon: Eye, level: 'view', description: 'Consulter son onboarding' },
      { id: 'onboarding_view_team', name: 'Voir parcours équipe', icon: Users, level: 'edit', description: 'Suivre les nouvelles recrues' },
      { id: 'onboarding_edit', name: 'Modifier le parcours', icon: Edit, level: 'admin', description: 'Éditer le contenu' },
      { id: 'onboarding_admin', name: 'Administration onboarding', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== PROJETS =====
  projects: {
    id: 'projects',
    name: 'Projets & Conquêtes',
    icon: Layers,
    color: 'from-sky-500 to-blue-600',
    bgColor: 'bg-sky-500/20',
    description: 'Gestion de projets',
    category: 'tools',
    permissions: [
      { id: 'projects_view', name: 'Voir les projets', icon: Eye, level: 'view', description: 'Consulter les projets' },
      { id: 'projects_participate', name: 'Participer', icon: Users, level: 'view', description: 'Rejoindre des projets' },
      { id: 'projects_create', name: 'Créer des projets', icon: Layers, level: 'edit', description: 'Lancer de nouveaux projets' },
      { id: 'projects_manage', name: 'Gérer les projets', icon: Settings, level: 'admin', description: 'Modifier tous les projets' },
      { id: 'projects_admin', name: 'Administration projets', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  },

  // ===== NOTIFICATIONS =====
  notifications: {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-500/20',
    description: 'Système de notifications',
    category: 'admin',
    permissions: [
      { id: 'notif_receive', name: 'Recevoir des notifs', icon: Bell, level: 'view', description: 'Notifications personnelles' },
      { id: 'notif_send_team', name: 'Envoyer à l\'équipe', icon: Mail, level: 'edit', description: 'Notifier l\'équipe' },
      { id: 'notif_send_all', name: 'Envoyer à tous', icon: Megaphone, level: 'admin', description: 'Notifications globales' },
      { id: 'notif_admin', name: 'Administration notifs', icon: Crown, level: 'admin', description: 'Gestion complète' }
    ]
  }
};

// Catégories pour l'affichage
const CATEGORIES = {
  admin: { name: 'Administration', icon: ShieldCheck, color: 'from-red-500 to-rose-600' },
  tools: { name: 'Outils', icon: Wrench, color: 'from-purple-500 to-violet-600' },
  gamification: { name: 'Gamification', icon: Gamepad2, color: 'from-green-500 to-emerald-600' },
  team: { name: 'Équipe', icon: Users, color: 'from-blue-500 to-cyan-600' },
  communication: { name: 'Communication', icon: MessageSquare, color: 'from-pink-500 to-rose-600' },
  user: { name: 'Utilisateur', icon: UserCog, color: 'from-amber-500 to-yellow-600' }
};

// Niveaux de permissions
const PERMISSION_LEVELS = {
  god: { name: 'DIEU', color: 'bg-gradient-to-r from-yellow-500 to-amber-500', textColor: 'text-yellow-300', icon: Crown },
  admin: { name: 'Admin', color: 'bg-gradient-to-r from-red-500 to-rose-500', textColor: 'text-red-300', icon: ShieldCheck },
  edit: { name: 'Éditeur', color: 'bg-gradient-to-r from-blue-500 to-indigo-500', textColor: 'text-blue-300', icon: Edit },
  view: { name: 'Lecture', color: 'bg-gradient-to-r from-green-500 to-emerald-500', textColor: 'text-green-300', icon: Eye }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

/**
 * PAGE ADMINISTRATION DES PERMISSIONS V4
 */
const AdminRolePermissionsPage = () => {
  const { user } = useAuthStore();

  // États principaux
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [permissionHistory, setPermissionHistory] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithPermissions: 0,
    totalPermissionsGranted: 0,
    admins: 0
  });

  /**
   * CHARGER LES DONNÉES
   */
  const loadData = async () => {
    try {
      setLoading(true);

      // Charger tous les utilisateurs
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const allUsers = [];
      let usersWithPerms = 0;
      let totalPerms = 0;
      let adminCount = 0;

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userPerms = userData.modulePermissions || {};
        const permCount = Object.values(userPerms).flat().length;

        if (permCount > 0) usersWithPerms++;
        totalPerms += permCount;

        if (userData.isAdmin || userData.role === 'admin') adminCount++;

        allUsers.push({
          id: doc.id,
          ...userData,
          modulePermissions: userPerms,
          permissionCount: permCount
        });
      });

      // Trier par nom
      allUsers.sort((a, b) => {
        const nameA = a.displayName || a.email || '';
        const nameB = b.displayName || b.email || '';
        return nameA.localeCompare(nameB);
      });

      setUsers(allUsers);
      setStats({
        totalUsers: allUsers.length,
        usersWithPermissions: usersWithPerms,
        totalPermissionsGranted: totalPerms,
        admins: adminCount
      });

    } catch (error) {
      console.error('Erreur chargement données:', error);
      showNotification('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * OUVRIR LE MODAL D'ÉDITION PERMISSIONS
   */
  const openUserPermissions = (targetUser) => {
    setSelectedUser(targetUser);
    setUserPermissions(targetUser.modulePermissions || {});
    setExpandedModules({});
    setShowUserModal(true);
  };

  /**
   * TOGGLE UNE PERMISSION
   */
  const togglePermission = (moduleId, permissionId) => {
    setUserPermissions(prev => {
      const modulePerms = prev[moduleId] || [];
      const newModulePerms = modulePerms.includes(permissionId)
        ? modulePerms.filter(p => p !== permissionId)
        : [...modulePerms, permissionId];

      return {
        ...prev,
        [moduleId]: newModulePerms
      };
    });
  };

  /**
   * ACTIVER TOUTES LES PERMISSIONS D'UN MODULE
   */
  const toggleAllModulePermissions = (moduleId, enable) => {
    const module = PERMISSION_MODULES[moduleId];
    if (!module) return;

    setUserPermissions(prev => ({
      ...prev,
      [moduleId]: enable ? module.permissions.map(p => p.id) : []
    }));
  };

  /**
   * ACTIVER TOUTES LES PERMISSIONS (GOD MODE)
   */
  const enableAllPermissions = () => {
    const allPerms = {};
    Object.entries(PERMISSION_MODULES).forEach(([moduleId, module]) => {
      allPerms[moduleId] = module.permissions.map(p => p.id);
    });
    setUserPermissions(allPerms);
  };

  /**
   * DÉSACTIVER TOUTES LES PERMISSIONS
   */
  const disableAllPermissions = () => {
    setUserPermissions({});
  };

  /**
   * SAUVEGARDER LES PERMISSIONS
   */
  const savePermissions = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      const userRef = doc(db, 'users', selectedUser.id);

      // Calculer si l'utilisateur doit avoir le flag isAdmin
      const hasAdminPermissions = Object.entries(userPermissions).some(([moduleId, perms]) => {
        const module = PERMISSION_MODULES[moduleId];
        return perms.some(permId => {
          const perm = module?.permissions.find(p => p.id === permId);
          return perm?.level === 'admin' || perm?.level === 'god';
        });
      });

      // Mettre à jour l'utilisateur
      await updateDoc(userRef, {
        modulePermissions: userPermissions,
        isAdmin: hasAdminPermissions,
        role: hasAdminPermissions ? 'admin' : 'member',
        'profile.role': hasAdminPermissions ? 'admin' : 'member',
        permissionsUpdatedAt: new Date().toISOString(),
        permissionsUpdatedBy: user.uid
      });

      // Log dans l'historique
      try {
        const historyRef = collection(db, 'permissionHistory');
        await addDoc(historyRef, {
          action: 'UPDATE_USER_PERMISSIONS',
          targetUserId: selectedUser.id,
          targetUserEmail: selectedUser.email,
          permissions: userPermissions,
          adminId: user.uid,
          adminEmail: user.email,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.warn('Historique non enregistré:', e);
      }

      // Mettre à jour l'état local
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? {
              ...u,
              modulePermissions: userPermissions,
              isAdmin: hasAdminPermissions,
              role: hasAdminPermissions ? 'admin' : 'member',
              permissionCount: Object.values(userPermissions).flat().length
            }
          : u
      ));

      showNotification('Permissions sauvegardées avec succès !', 'success');
      setShowUserModal(false);

    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
   * TOGGLE MODULE EXPAND
   */
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  /**
   * OBTENIR LE RÉSUMÉ DES PERMISSIONS D'UN USER
   */
  const getUserPermissionSummary = (targetUser) => {
    const perms = targetUser.modulePermissions || {};
    const summary = { admin: 0, edit: 0, view: 0, total: 0 };

    Object.entries(perms).forEach(([moduleId, permIds]) => {
      const module = PERMISSION_MODULES[moduleId];
      if (!module) return;

      permIds.forEach(permId => {
        const perm = module.permissions.find(p => p.id === permId);
        if (perm) {
          summary.total++;
          if (perm.level === 'admin' || perm.level === 'god') summary.admin++;
          else if (perm.level === 'edit') summary.edit++;
          else summary.view++;
        }
      });
    });

    return summary;
  };

  /**
   * FILTRER LES UTILISATEURS
   */
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const search = searchTerm.toLowerCase();
    return users.filter(u =>
      u.displayName?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search)
    );
  }, [users, searchTerm]);

  /**
   * FILTRER LES MODULES PAR CATÉGORIE
   */
  const filteredModules = useMemo(() => {
    if (selectedCategory === 'all') return Object.entries(PERMISSION_MODULES);
    return Object.entries(PERMISSION_MODULES).filter(([, module]) =>
      module.category === selectedCategory
    );
  }, [selectedCategory]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400">Chargement des permissions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 max-w-7xl mx-auto"
        >
          {/* HEADER */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/30 to-pink-500/20 backdrop-blur-xl border border-white/10 rounded-xl">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                    Gestion des Permissions
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    Contrôle complet des accès par utilisateur
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                className="p-2.5 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </motion.div>

          {/* STATS */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
              { label: 'Avec permissions', value: stats.usersWithPermissions, icon: Key, color: 'from-green-500 to-emerald-500' },
              { label: 'Permissions totales', value: stats.totalPermissionsGranted, icon: Lock, color: 'from-purple-500 to-pink-500' },
              { label: 'Administrateurs', value: stats.admins, icon: Crown, color: 'from-yellow-500 to-amber-500' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-xs">{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* SEARCH BAR */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm"
              />
            </div>
          </motion.div>

          {/* USERS LIST */}
          <motion.div variants={itemVariants} className="space-y-3">
            {filteredUsers.map((targetUser) => {
              const summary = getUserPermissionSummary(targetUser);
              const isCurrentUser = targetUser.id === user?.uid;
              const isAdmin = targetUser.isAdmin || targetUser.role === 'admin';

              return (
                <motion.div
                  key={targetUser.id}
                  whileHover={{ scale: 1.005 }}
                  className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 transition-all ${
                    isAdmin ? 'border-yellow-500/30' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                        isAdmin
                          ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                          : 'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}>
                        {targetUser.customization?.avatar ||
                         (targetUser.displayName?.[0] || targetUser.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">
                            {targetUser.displayName || targetUser.email?.split('@')[0] || 'Utilisateur'}
                          </h3>
                          {isAdmin && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full flex items-center gap-1">
                              <Crown className="w-3 h-3" /> Admin
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                              Vous
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">{targetUser.email}</p>
                      </div>
                    </div>

                    {/* Permission summary */}
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {summary.admin > 0 && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-lg flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> {summary.admin}
                          </span>
                        )}
                        {summary.edit > 0 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg flex items-center gap-1">
                            <Edit className="w-3 h-3" /> {summary.edit}
                          </span>
                        )}
                        {summary.view > 0 && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {summary.view}
                          </span>
                        )}
                        {summary.total === 0 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-lg">
                            Aucune permission
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openUserPermissions(targetUser)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium"
                      >
                        <Settings className="w-4 h-4" />
                        Gérer
                      </motion.button>
                    </div>
                  </div>

                  {/* Quick permission overview */}
                  {summary.total > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(targetUser.modulePermissions || {}).slice(0, 5).map(([moduleId]) => {
                          const module = PERMISSION_MODULES[moduleId];
                          if (!module) return null;
                          return (
                            <span
                              key={moduleId}
                              className={`px-2 py-1 ${module.bgColor} text-white/80 text-xs rounded-lg flex items-center gap-1`}
                            >
                              <module.icon className="w-3 h-3" />
                              {module.name.split(' ')[0]}
                            </span>
                          );
                        })}
                        {Object.keys(targetUser.modulePermissions || {}).length > 5 && (
                          <span className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded-lg">
                            +{Object.keys(targetUser.modulePermissions).length - 5} modules
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* MODAL GESTION PERMISSIONS */}
        <AnimatePresence>
          {showUserModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto"
              onClick={() => setShowUserModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-5xl my-4 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                        {selectedUser.customization?.avatar ||
                         (selectedUser.displayName?.[0] || selectedUser.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {selectedUser.displayName || selectedUser.email?.split('@')[0]}
                        </h2>
                        <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={enableAllPermissions}
                      className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors"
                    >
                      <Crown className="w-4 h-4" />
                      Tout activer (GOD)
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={disableAllPermissions}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Tout désactiver
                    </motion.button>
                  </div>

                  {/* Category filter */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Tous
                    </button>
                    {Object.entries(CATEGORIES).map(([catId, cat]) => (
                      <button
                        key={catId}
                        onClick={() => setSelectedCategory(catId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedCategory === catId
                            ? `bg-gradient-to-r ${cat.color} text-white`
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Body - Modules list */}
                <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-3">
                    {filteredModules.map(([moduleId, module]) => {
                      const modulePerms = userPermissions[moduleId] || [];
                      const allEnabled = modulePerms.length === module.permissions.length;
                      const someEnabled = modulePerms.length > 0;
                      const isExpanded = expandedModules[moduleId];

                      return (
                        <div
                          key={moduleId}
                          className={`border rounded-xl overflow-hidden transition-all ${
                            someEnabled ? 'border-white/20 bg-white/5' : 'border-white/10 bg-white/[0.02]'
                          }`}
                        >
                          {/* Module header */}
                          <div
                            className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${module.bgColor}`}
                            onClick={() => toggleModule(moduleId)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 bg-gradient-to-br ${module.color} rounded-lg`}>
                                  <module.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-white font-medium">{module.name}</h3>
                                  <p className="text-gray-400 text-xs">{module.description}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Quick toggle all */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAllModulePermissions(moduleId, !allEnabled);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    allEnabled
                                      ? 'bg-green-500/30 text-green-300'
                                      : someEnabled
                                        ? 'bg-yellow-500/30 text-yellow-300'
                                        : 'bg-white/10 text-gray-400'
                                  }`}
                                >
                                  {allEnabled ? (
                                    <ToggleRight className="w-5 h-5" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5" />
                                  )}
                                </motion.button>

                                {/* Count badge */}
                                <span className={`px-2 py-1 rounded-lg text-xs ${
                                  modulePerms.length > 0
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-white/10 text-gray-500'
                                }`}>
                                  {modulePerms.length}/{module.permissions.length}
                                </span>

                                {/* Expand arrow */}
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                </motion.div>
                              </div>
                            </div>
                          </div>

                          {/* Permissions list */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-white/10"
                              >
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {module.permissions.map((perm) => {
                                    const isEnabled = modulePerms.includes(perm.id);
                                    const levelConfig = PERMISSION_LEVELS[perm.level];

                                    return (
                                      <motion.label
                                        key={perm.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                          isEnabled
                                            ? 'bg-white/10 border-2 border-green-500/50'
                                            : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isEnabled}
                                          onChange={() => togglePermission(moduleId, perm.id)}
                                          className="sr-only"
                                        />

                                        {/* Custom checkbox */}
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                          isEnabled
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/10 border border-white/20'
                                        }`}>
                                          {isEnabled && <CheckCircle className="w-3.5 h-3.5" />}
                                        </div>

                                        {/* Icon */}
                                        <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-white/20' : 'bg-white/5'}`}>
                                          <perm.icon className={`w-4 h-4 ${isEnabled ? 'text-white' : 'text-gray-400'}`} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${isEnabled ? 'text-white' : 'text-gray-300'}`}>
                                              {perm.name}
                                            </span>
                                            <span className={`px-1.5 py-0.5 ${levelConfig.color} text-white text-[10px] rounded font-bold`}>
                                              {levelConfig.name}
                                            </span>
                                          </div>
                                          <p className="text-gray-500 text-xs truncate">{perm.description}</p>
                                        </div>
                                      </motion.label>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-400 text-sm">
                      {Object.values(userPermissions).flat().length} permissions sélectionnées
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowUserModal(false)}
                        className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
                        disabled={saving}
                      >
                        Annuler
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={savePermissions}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl disabled:opacity-50 font-medium"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Sauvegarder
                          </>
                        )}
                      </motion.button>
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

export default AdminRolePermissionsPage;
