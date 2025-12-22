// ==========================================
// 📁 react-app/src/pages/TutorialPage.jsx
// PAGE TUTORIEL COMPLET SYNERGIA
// Guide pédagogique pour tous les utilisateurs
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
  HelpCircle, Info, AlertCircle, ArrowRight, Sparkles
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// ==========================================
// DONNÉES DU TUTORIEL
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
        text: 'Synergia est une application de gestion d\'équipe gamifiée. Elle transforme les tâches quotidiennes en quêtes, les objectifs en défis, et récompense votre progression avec de l\'XP et des rangs !',
        tips: ['Chaque action vous fait progresser', 'Collaborez avec votre équipe pour des bonus', 'Montez en rang pour débloquer des avantages']
      },
      {
        title: 'Le système RPG',
        text: 'Comme dans un jeu de rôle, vous avez un profil avec un niveau, de l\'XP (points d\'expérience), des compétences et un rang. Plus vous êtes actif, plus vous progressez !',
        tips: ['Niveau = votre progression globale', 'XP = points gagnés par vos actions', 'Rang = titre honorifique avec bonus']
      },
      {
        title: 'Navigation dans l\'app',
        text: 'Utilisez le menu hamburger (☰) en haut à gauche pour accéder à toutes les sections. L\'icône de cloche affiche vos notifications.',
        tips: ['Menu accessible partout', 'Notifications en temps réel', 'Thème sombre pour le confort visuel']
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
        text: 'Les cartes du dashboard vous donnent un accès rapide à vos quêtes urgentes, vos défis en cours, et vos statistiques personnelles.',
        tips: ['Cliquez pour plus de détails', 'Personnalisable selon vos besoins', 'Actualisation en temps réel']
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
        text: 'Les quêtes sont les tâches à accomplir. Elles peuvent être personnelles ou liées à une campagne d\'équipe. Chaque quête complétée rapporte de l\'XP !',
        tips: ['Quête = Tâche gamifiée', 'XP variable selon difficulté', 'Peut être individuelle ou collective']
      },
      {
        title: 'Types de quêtes',
        text: 'Il existe plusieurs types : quêtes rapides (10 XP), missions standard (25 XP), défis complexes (50 XP), et épiques (100+ XP). La difficulté détermine la récompense.',
        tips: ['🟢 Facile = 10 XP', '🟡 Moyen = 25 XP', '🔴 Difficile = 50 XP', '⭐ Épique = 100+ XP']
      },
      {
        title: 'Créer une quête',
        text: 'Cliquez sur "+ Nouvelle Quête" pour créer une tâche. Définissez le titre, la description, la difficulté, la date limite et les compétences associées.',
        tips: ['Soyez précis dans la description', 'Assignez les bonnes compétences', 'Fixez des deadlines réalistes']
      },
      {
        title: 'Compléter une quête',
        text: 'Quand vous terminez une quête, cliquez sur "Soumettre". Selon la configuration, elle peut être validée automatiquement ou nécessiter une approbation.',
        tips: ['Soumettez dès que terminé', 'Ajoutez des preuves si demandé', 'L\'XP est crédité à la validation']
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
        text: 'Les défis sont des objectifs collectifs avec une cagnotte XP. Exemple : "500 XP en équipe cette semaine". Tous contribuent !',
        tips: ['Objectif commun à atteindre', 'Chacun contribue à sa mesure', 'Récompense partagée']
      },
      {
        title: 'La Cagnotte d\'équipe',
        text: 'Les XP collectifs alimentent la cagnotte d\'équipe. Quand un défi est réussi, les XP bonus sont distribués à tous les participants.',
        tips: ['Plus on participe, plus on gagne', 'Encouragez votre équipe', 'Célébrez les victoires ensemble']
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
        text: 'Votre arbre comporte 7 branches de compétences : Relationnel, Technique, Communication, Organisation, Créativité, Pédagogie et Commercial.',
        tips: ['🤝 Relationnel = Service client', '🔧 Technique = Maintenance', '📱 Communication = Réseaux', '📋 Organisation = Planning', '🎨 Créativité = Design', '👩‍🏫 Pédagogie = Formation', '💼 Commercial = Vente']
      },
      {
        title: 'Progression des skills',
        text: 'Chaque compétence (skill) a 3 tiers. En accumulant de l\'XP dans une compétence, vous débloquez des tiers et pouvez choisir des talents.',
        tips: ['Tier 1 = 100 XP requis', 'Tier 2 = 400 XP requis', 'Tier 3 = 1000 XP requis']
      },
      {
        title: 'Choisir un talent',
        text: 'À chaque tier atteint, choisissez 1 talent parmi 3 options. Chaque talent donne un bonus permanent qui correspond à votre style de jeu.',
        tips: ['Choix définitif', '3 options par tier', 'Bonus permanent actif']
      },
      {
        title: 'Bonus actifs',
        text: 'Vos talents choisis s\'accumulent et donnent des bonus : +5% XP en relationnel, +10% efficacité technique, etc. Plus vous progressez, plus vous êtes fort !',
        tips: ['Les bonus s\'additionnent', 'Visibles en bas de page', 'Affectent vos gains d\'XP']
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
        text: 'Les rangs débloquent des avantages : accès à des quêtes spéciales, badges exclusifs, fonctionnalités premium...',
        tips: ['Nouveaux privilèges par rang', 'Reconnaissance de la guilde', 'Motivation à progresser']
      }
    ]
  },
  {
    id: 'planning',
    title: 'Planning',
    icon: '📅',
    color: 'from-cyan-500 to-blue-500',
    description: 'Gérez vos horaires et shifts',
    content: [
      {
        title: 'Vue calendrier',
        text: 'Le planning affiche vos shifts (créneaux de travail) sur un calendrier. Vous voyez qui travaille quand et pouvez vous organiser.',
        tips: ['Vue semaine ou mois', 'Filtrez par équipe', 'Couleurs par type de shift']
      },
      {
        title: 'Mes shifts',
        text: 'Vos propres créneaux sont mis en évidence. Cliquez sur un shift pour voir les détails : horaires, lieu, équipe présente.',
        tips: ['Vos shifts en surbrillance', 'Détails au clic', 'Notification de rappel']
      },
      {
        title: 'Échanges de shifts',
        text: 'Besoin d\'échanger un créneau ? Proposez un échange à un collègue via l\'app. L\'admin valide les échanges.',
        tips: ['Proposez des échanges', 'Validation par admin', 'Historique conservé']
      }
    ]
  },
  {
    id: 'poste-garde',
    title: 'Poste de Garde',
    icon: '🏛️',
    color: 'from-slate-500 to-gray-600',
    description: 'Pointage et présence',
    content: [
      {
        title: 'Check-in / Check-out',
        text: 'Le Poste de Garde permet de pointer votre arrivée et votre départ. C\'est votre badgeuse virtuelle !',
        tips: ['Pointez en arrivant', 'Pointez en partant', 'Géolocalisation optionnelle']
      },
      {
        title: 'Historique de présence',
        text: 'Consultez votre historique de pointages : heures d\'arrivée, de départ, durée travaillée, retards éventuels.',
        tips: ['Historique complet', 'Stats par semaine/mois', 'Export possible']
      },
      {
        title: 'Statut en temps réel',
        text: 'Voyez qui est actuellement présent dans l\'équipe. Pratique pour savoir qui est disponible !',
        tips: ['Liste des présents', 'Actualisation live', 'Indication de disponibilité']
      }
    ]
  },
  {
    id: 'academie',
    title: 'Académie',
    icon: '🎓',
    color: 'from-teal-500 to-emerald-500',
    description: 'Formation et mentorat',
    content: [
      {
        title: 'Parcours de formation',
        text: 'L\'Académie propose des parcours d\'apprentissage. Suivez des modules pour développer vos compétences et gagner de l\'XP !',
        tips: ['Modules structurés', 'XP à chaque étape', 'Certificats à la clé']
      },
      {
        title: 'Système de mentorat',
        text: 'Les membres expérimentés peuvent devenir mentors. Les nouveaux sont accompagnés par un mentor pour une intégration réussie.',
        tips: ['Mentor = Guide attitré', 'Sessions régulières', 'Suivi de progression']
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
        text: 'Le Crieur est votre journal d\'équipe. Il affiche les annonces importantes, les news, les événements à venir.',
        tips: ['Infos officielles', 'Annonces importantes', 'Événements à venir']
      },
      {
        title: 'Publications',
        text: 'Les admins publient les informations. Vous pouvez réagir, commenter et partager les publications.',
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
        text: 'Vous avez une suggestion ? Soumettez-la via la Boîte à Idées ! Décrivez votre proposition et pourquoi elle serait utile.',
        tips: ['Toute idée est bienvenue', 'Soyez constructif', 'Détaillez votre proposition']
      },
      {
        title: 'Voter pour les idées',
        text: 'Chaque membre peut voter pour les idées qu\'il trouve pertinentes. Les plus votées sont prioritaires pour l\'équipe.',
        tips: ['1 vote par idée', 'Soutenez les bonnes idées', 'Les admins décident']
      },
      {
        title: 'Suivi des propositions',
        text: 'Suivez le statut de vos idées : En attente, En cours d\'étude, Acceptée, Refusée, Implémentée.',
        tips: ['Statut visible', 'Feedback des admins', 'Célébrez les implémentations']
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
  }
];

const ADMIN_SECTIONS = [
  {
    id: 'admin-analytics',
    title: 'Analytics (Admin)',
    icon: '📊',
    color: 'from-blue-600 to-indigo-600',
    description: 'Statistiques et rapports d\'équipe',
    adminOnly: true,
    content: [
      {
        title: 'Vue d\'ensemble',
        text: 'Les Analytics donnent une vision complète de l\'activité : XP total de l\'équipe, quêtes accomplies, membres actifs, tendances.',
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
    id: 'admin-team',
    title: 'Gestion d\'équipe (Admin)',
    icon: '👥',
    color: 'from-green-600 to-emerald-600',
    description: 'Gérez les membres et les rôles',
    adminOnly: true,
    content: [
      {
        title: 'Liste des membres',
        text: 'Visualisez tous les membres de l\'équipe avec leurs stats, rôles et statuts. Ajoutez ou retirez des membres.',
        tips: ['Profils détaillés', 'Attribution de rôles', 'Gestion des accès']
      },
      {
        title: 'Rôles et permissions',
        text: 'Définissez qui peut faire quoi : Admin, Manager, Membre standard. Chaque rôle a des permissions spécifiques.',
        tips: ['Admin = Tous droits', 'Manager = Gestion équipe', 'Membre = Accès standard']
      }
    ]
  },
  {
    id: 'admin-settings',
    title: 'Paramètres (Admin)',
    icon: '⚙️',
    color: 'from-gray-600 to-slate-600',
    description: 'Configuration de l\'application',
    adminOnly: true,
    content: [
      {
        title: 'Paramètres généraux',
        text: 'Configurez le nom de l\'équipe, le logo, les horaires par défaut, les règles de gamification.',
        tips: ['Personnalisez l\'app', 'Ajustez les règles XP', 'Configurez les notifications']
      },
      {
        title: 'Intégrations',
        text: 'Connectez Synergia à d\'autres outils : calendriers, messagerie, exports automatiques.',
        tips: ['Sync calendrier', 'Webhooks disponibles', 'API accessible']
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
              Guide de Synergia
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
              Apprenez à utiliser toutes les fonctionnalités de l'application pour devenir un maître de la guilde !
            </p>
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
                placeholder="Rechercher un sujet..."
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
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                {TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.content.length, 0)}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400">Leçons</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">∞</div>
              <div className="text-[10px] sm:text-xs text-gray-400">XP à gagner</div>
            </div>
          </motion.div>

          {/* Message de bienvenue */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Conseil du jour</h3>
                <p className="text-sm text-gray-300">
                  Lisez chaque section dans l'ordre pour une compréhension complète.
                  Commencez par l'introduction, puis explorez les fonctionnalités une par une !
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
                transition={{ delay: 0.1 + idx * 0.03 }}
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
              Synergia v4.0 - Guide mis à jour automatiquement
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorialPage;
