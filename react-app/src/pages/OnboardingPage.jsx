// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// SYSTÈME D'INTÉGRATION COMPLET - FORMATION + ENTRETIENS
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

// Firebase imports - IMPORT CORRIGÉ
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
import { db } from './core/firebase.js';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../components/layout/PremiumLayout.jsx';

// ==========================================
// 🎯 DONNÉES DE FORMATION PAR SALLE COMPLÈTES
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
    badge: 'Explorateur Brain',
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
        xp: 15,
        required: true,
        estimatedTime: 120,
        room: 'Open space',
        mentor: 'Équipe'
      },
      {
        id: 'outils_communication',
        name: 'Outils de communication',
        description: 'Configuration et présentation de Discord, Slack, emails...',
        xp: 25,
        required: true,
        estimatedTime: 45,
        room: 'Salle formation',
        mentor: 'IT Manager'
      },
      {
        id: 'quiz_culture',
        name: 'Quiz culture Brain',
        description: 'Test de connaissances sur l\'entreprise et ses valeurs',
        xp: 20,
        required: false,
        estimatedTime: 30,
        room: 'En ligne',
        mentor: 'Auto-évaluation'
      }
    ]
  },
  
  FORMATION_TECHNIQUE: {
    id: 'formation_technique',
    name: '🛠️ Formation Technique',
    description: 'Montée en compétences techniques spécifiques au poste',
    duration: 7,
    color: 'from-purple-500 to-pink-500',
    icon: '🛠️',
    order: 2,
    xpTotal: 200,
    badge: 'Technicien Certifié',
    room: 'Salle technique',
    tasks: [
      {
        id: 'setup_environnement',
        name: 'Setup environnement de travail',
        description: 'Installation et configuration de tous les outils nécessaires',
        xp: 30,
        required: true,
        estimatedTime: 180,
        room: 'Salle technique',
        mentor: 'Lead Developer'
      },
      {
        id: 'formation_outils',
        name: 'Formation aux outils Brain',
        description: 'Maîtrise des outils internes et workflows',
        xp: 40,
        required: true,
        estimatedTime: 240,
        room: 'Salle formation',
        mentor: 'Senior Developer'
      },
      {
        id: 'premier_projet',
        name: 'Premier mini-projet',
        description: 'Réalisation d\'un projet simple pour valider les acquis',
        xp: 50,
        required: true,
        estimatedTime: 480,
        room: 'Open space',
        mentor: 'Binôme senior'
      },
      {
        id: 'code_review',
        name: 'Sessions code review',
        description: 'Apprentissage des bonnes pratiques via review de code',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Salle de réunion',
        mentor: 'Tech Lead'
      },
      {
        id: 'certification',
        name: 'Certification technique',
        description: 'Validation officielle des compétences acquises',
        xp: 40,
        required: false,
        estimatedTime: 60,
        room: 'Salle d\'examen',
        mentor: 'Évaluateur externe'
      }
    ]
  },

  INTEGRATION_EQUIPE: {
    id: 'integration_equipe',
    name: '👥 Intégration Équipe',
    description: 'Intégration sociale et collaborative dans les équipes',
    duration: 5,
    color: 'from-green-500 to-teal-500',
    icon: '👥',
    order: 3,
    xpTotal: 150,
    badge: 'Team Player',
    room: 'Espaces collaboratifs',
    tasks: [
      {
        id: 'integration_team',
        name: 'Intégration dans l\'équipe',
        description: 'Participation active aux projets et rituels d\'équipe',
        xp: 40,
        required: true,
        estimatedTime: 300,
        room: 'Open space',
        mentor: 'Scrum Master'
      },
      {
        id: 'methodologies',
        name: 'Méthodologies de travail',
        description: 'Formation aux méthodologies agiles et outils collaboratifs',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Salle agile',
        mentor: 'Agile Coach'
      },
      {
        id: 'feedback_session',
        name: 'Sessions de feedback',
        description: 'Échanges réguliers avec mentor et équipe sur l\'intégration',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle privée',
        mentor: 'Mentor assigné'
      },
      {
        id: 'team_building',
        name: 'Activité team building',
        description: 'Participation à une activité de cohésion d\'équipe',
        xp: 30,
        required: false,
        estimatedTime: 240,
        room: 'Extérieur',
        mentor: 'Équipe complète'
      },
      {
        id: 'presentation_equipe',
        name: 'Présentation à l\'équipe',
        description: 'Présentation personnelle et de ses compétences',
        xp: 25,
        required: true,
        estimatedTime: 30,
        room: 'Salle de réunion',
        mentor: 'Manager'
      }
    ]
  },

  AUTONOMIE_COMPLETE: {
    id: 'autonomie_complete',
    name: '🚀 Autonomie Complète',
    description: 'Prise de responsabilités et autonomie totale',
    duration: 15,
    color: 'from-orange-500 to-red-500',
    icon: '🚀',
    order: 4,
    xpTotal: 300,
    badge: 'Brain Autonome',
    room: 'Tous les espaces',
    tasks: [
      {
        id: 'projets_autonomes',
        name: 'Projets en autonomie',
        description: 'Gestion complète de projets sans supervision constante',
        xp: 80,
        required: true,
        estimatedTime: 2400,
        room: 'Espace personnel',
        mentor: 'Manager (distant)'
      },
      {
        id: 'mentoring_junior',
        name: 'Mentoring d\'un junior',
        description: 'Accompagnement d\'un nouveau collaborateur',
        xp: 60,
        required: false,
        estimatedTime: 480,
        room: 'Variable',
        mentor: 'Auto-géré'
      },
      {
        id: 'innovation_proposal',
        name: 'Proposition d\'innovation',
        description: 'Proposer et défendre une idée d\'amélioration ou innovation',
        xp: 70,
        required: true,
        estimatedTime: 360,
        room: 'Salle de présentation',
        mentor: 'Comité innovation'
      },
      {
        id: 'formation_externe',
        name: 'Formation externe',
        description: 'Participation à une formation ou conférence externe',
        xp: 50,
        required: false,
        estimatedTime: 480,
        room: 'Externe',
        mentor: 'Formateur externe'
      },
      {
        id: 'evaluation_finale',
        name: 'Évaluation finale',
        description: 'Bilan complet des compétences et de l\'intégration',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Bureau manager',
        mentor: 'Manager + RH'
      }
    ]
  }
};

// ==========================================
// 🎮 DONNÉES ENTRETIENS LUDIQUES
// ==========================================

const ENTRETIEN_TYPES = {
  GAME_MASTER: {
    id: 'game_master',
    name: '🎮 Entretien Game Master',
    description: 'Évaluation créative à travers des jeux et challenges',
    duration: 90,
    color: 'from-purple-600 to-blue-600',
    icon: '🎮',
    activities: [
      {
        id: 'escape_game_virtuel',
        name: 'Escape Game Virtuel',
        description: 'Résolution collaborative de puzzles complexes',
        duration: 45,
        skills: ['Logique', 'Collaboration', 'Créativité'],
        room: 'Salle Game Master'
      },
      {
        id: 'improvisation_scenario',
        name: 'Improvisation Scénario',
        description: 'Création et narration d\'un scénario improvisé',
        duration: 30,
        skills: ['Communication', 'Créativité', 'Adaptabilité'],
        room: 'Studio création'
      },
      {
        id: 'defi_technique',
        name: 'Défi Technique Gamifié',
        description: 'Résolution de problèmes techniques sous forme de jeu',
        duration: 15,
        skills: ['Technique', 'Logique', 'Innovation'],
        room: 'Lab technique'
      }
    ]
  },
  
  CREATIVE_CHALLENGE: {
    id: 'creative_challenge',
    name: '🎨 Creative Challenge',
    description: 'Évaluation de la créativité et innovation',
    duration: 120,
    color: 'from-pink-500 to-purple-500',
    icon: '🎨',
    activities: [
      {
        id: 'brainstorm_challenge',
        name: 'Brainstorm Challenge',
        description: 'Génération d\'idées créatives pour un problème donné',
        duration: 40,
        skills: ['Créativité', 'Innovation', 'Pensée divergente'],
        room: 'Salle créative'
      },
      {
        id: 'prototype_rapide',
        name: 'Prototype Rapide',
        description: 'Création d\'un prototype en temps limité',
        duration: 60,
        skills: ['Conception', 'Exécution', 'Design thinking'],
        room: 'Fab lab'
      },
      {
        id: 'pitch_innovant',
        name: 'Pitch Innovant',
        description: 'Présentation créative de son idée',
        duration: 20,
        skills: ['Communication', 'Persuasion', 'Storytelling'],
        room: 'Scène de pitch'
      }
    ]
  },

  TEAM_DYNAMICS: {
    id: 'team_dynamics',
    name: '👥 Team Dynamics',
    description: 'Évaluation des compétences collaboratives',
    duration: 60,
    color: 'from-green-500 to-cyan-500',
    icon: '👥',
    activities: [
      {
        id: 'construction_collaborative',
        name: 'Construction Collaborative',
        description: 'Projet de construction en équipe avec contraintes',
        duration: 40,
        skills: ['Leadership', 'Collaboration', 'Communication'],
        room: 'Salle atelier'
      },
      {
        id: 'negociation_ludique',
        name: 'Négociation Ludique',
        description: 'Jeu de négociation et de gestion de conflits',
        duration: 20,
        skills: ['Négociation', 'Diplomatie', 'Gestion conflit'],
        room: 'Salle négociation'
      }
    ]
  }
};

// ==========================================
// 🏆 SYSTÈME DE GAMIFICATION
// ==========================================

const BADGES_ONBOARDING = [
  {
    id: 'first_step',
    name: 'Premier Pas',
    description: 'Première connexion et découverte',
    icon: '👶',
    rarity: 'common',
    xp: 10
  },
  {
    id: 'formation_starter',
    name: 'Formation Starter',
    description: 'Première phase de formation complétée',
    icon: '🌟',
    rarity: 'uncommon',
    xp: 50
  },
  {
    id: 'tech_master',
    name: 'Tech Master',
    description: 'Formation technique réussie avec excellence',
    icon: '⚙️',
    rarity: 'rare',
    xp: 100
  },
  {
    id: 'team_spirit',
    name: 'Team Spirit',
    description: 'Intégration parfaite dans l\'équipe',
    icon: '🤝',
    rarity: 'epic',
    xp: 150
  },
  {
    id: 'brain_certified',
    name: 'Brain Certifié',
    description: 'Parcours d\'onboarding terminé avec succès',
    icon: '🎓',
    rarity: 'legendary',
    xp: 300
  }
];

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

  // Initialiser le profil d'onboarding
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

      // Initialiser chaque phase
      Object.values(FORMATION_PHASES).forEach(phase => {
        initialProgress.phases[phase.id] = {
          started: phase.id === 'decouverte_brain',
          completed: false,
          startedAt: phase.id === 'decouverte_brain' ? serverTimestamp() : null,
          tasks: phase.tasks.map(task => ({
            id: task.id,
            completed: false,
            xp: task.xp,
            completedAt: null
          }))
        };
      });

      await setDoc(doc(db, 'userOnboarding', user.uid), initialProgress);
      setUserProgress(initialProgress);
      
      console.log('✅ Profil onboarding initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation onboarding:', error);
    }
  };

  // Marquer une tâche comme complétée
  const completeTask = async (phaseId, taskId) => {
    if (!user?.uid) return;

    try {
      console.log('✅ Completion tâche:', phaseId, taskId);

      const updatedProgress = { ...userProgress };
      const task = updatedProgress.phases[phaseId].tasks.find(t => t.id === taskId);
      
      if (task && !task.completed) {
        task.completed = true;
        task.completedAt = new Date();

        // Vérifier si la phase est complétée
        const allTasksCompleted = updatedProgress.phases[phaseId].tasks.every(t => t.completed);
        if (allTasksCompleted) {
          updatedProgress.phases[phaseId].completed = true;
          updatedProgress.phases[phaseId].completedAt = new Date();

          // Démarrer la phase suivante
          const currentPhaseOrder = FORMATION_PHASES[phaseId].order;
          const nextPhase = Object.values(FORMATION_PHASES).find(p => p.order === currentPhaseOrder + 1);
          
          if (nextPhase) {
            updatedProgress.currentPhase = nextPhase.id;
            updatedProgress.phases[nextPhase.id].started = true;
            updatedProgress.phases[nextPhase.id].startedAt = new Date();
          }
        }

        // Sauvegarder
        await updateDoc(doc(db, 'userOnboarding', user.uid), updatedProgress);
        setUserProgress(updatedProgress);

        console.log('✅ Tâche complétée et progression sauvée');
      }

    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
    }
  };

  // Programmer un entretien
  const scheduleEntretien = async (entretienType, slotId) => {
    if (!user?.uid) return;

    try {
      console.log('📅 Programmation entretien:', entretienType, slotId);

      const entretienData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        entretienType,
        slotId,
        scheduledAt: serverTimestamp(),
        status: 'scheduled'
      };

      await addDoc(collection(db, 'userInterviews'), entretienData);
      
      // Marquer le slot comme non disponible
      await updateDoc(doc(db, 'interviewSlots', slotId), {
        available: false,
        bookedBy: user.uid
      });

      console.log('✅ Entretien programmé');
      
      // Recharger les données
      loadUserProgress();

    } catch (error) {
      console.error('❌ Erreur programmation entretien:', error);
    }
  };

  // Charger les données au montage
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
      <PremiumLayout title="Onboarding" subtitle="Chargement de votre parcours..." icon={BookOpen}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Chargement de votre parcours d'intégration...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  // Statistiques pour le header
  const headerStats = [
    {
      title: 'XP Total',
      value: stats.totalXP,
      icon: Zap,
      color: 'text-yellow-400'
    },
    {
      title: 'Tâches Complétées',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      title: 'Phase Actuelle',
      value: stats.currentPhase ? FORMATION_PHASES[stats.currentPhase]?.name.split(' ')[1] || 'N/A' : 'Début',
      icon: Target,
      color: 'text-blue-400'
    },
    {
      title: 'Badges Obtenus',
      value: stats.badges.length,
      icon: Award,
      color: 'text-purple-400'
    }
  ];

  return (
    <PremiumLayout
      title="Parcours d'Onboarding"
      subtitle="Votre intégration personnalisée chez Brain"
      icon={BookOpen}
      showStats={true}
      stats={headerStats}
      headerActions={
        <div className="flex items-center gap-3">
          <button
            onClick={loadUserProgress}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      }
    >
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
            currentUser={user}
          />
        )}
        
        {activeTab === 'entretiens' && (
          <EntretiensTab
            availableEntretiens={availableEntretiens}
            scheduledEntretiens={scheduledEntretiens}
            onScheduleEntretien={scheduleEntretien}
            currentUser={user}
          />
        )}
        
        {activeTab === 'progress' && (
          <ProgressTab
            userProgress={userProgress}
            stats={stats}
            currentUser={user}
          />
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
};

// ==========================================
// 🎓 ONGLET FORMATION
// ==========================================

const FormationTab = ({ userProgress, onCompleteTask, currentUser }) => {
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
        const canStart = phaseProgress?.started || isActive;

        return (
          <PremiumCard key={phase.id} className="relative overflow-hidden">
            {/* Gradient de fond */}
            <div className={`absolute inset-0 bg-gradient-to-r ${phase.color} opacity-5`} />
            
            {/* Badge de statut */}
            <div className="absolute top-4 right-4">
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
              ) : canStart ? (
                <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Disponible
                </div>
              ) : (
                <div className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm font-medium">
                  Verrouillé
                </div>
              )}
            </div>

            {/* En-tête de phase */}
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">{phase.icon}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{phase.name}</h3>
                <p className="text-gray-400 mb-3">{phase.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {phase.duration} jours
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {phase.room}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {phase.xpTotal} XP max
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {phase.badge}
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des tâches */}
            <div className="space-y-4">
              {phase.tasks.map(task => {
                const taskProgress = phaseProgress?.tasks?.find(t => t.id === task.id);
                const isTaskCompleted = taskProgress?.completed;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isTaskCompleted 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : canStart 
                          ? 'bg-gray-800/50 border-gray-600/50 hover:border-gray-500/50' 
                          : 'bg-gray-800/20 border-gray-700/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => !isTaskCompleted && canStart && onCompleteTask(phase.id, task.id)}
                          disabled={isTaskCompleted || !canStart}
                          className={`mt-1 ${
                            isTaskCompleted 
                              ? 'text-green-400' 
                              : canStart 
                                ? 'text-gray-400 hover:text-blue-400' 
                                : 'text-gray-600'
                          }`}
                        >
                          {isTaskCompleted ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 ${
                            isTaskCompleted ? 'text-green-300' : canStart ? 'text-white' : 'text-gray-500'
                          }`}>
                            {task.name}
                            {task.required && <span className="text-red-400 ml-1">*</span>}
                          </h4>
                          
                          <p className={`text-sm mb-3 ${
                            isTaskCompleted ? 'text-green-400/80' : canStart ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {task.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(task.estimatedTime / 60)}h{task.estimatedTime % 60 > 0 ? ` ${task.estimatedTime % 60}min` : ''}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {task.room}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.mentor}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              +{task.xp} XP
                            </div>
                            {task.required && (
                              <div className="flex items-center gap-1 text-red-400">
                                <AlertCircle className="w-3 h-3" />
                                Obligatoire
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isTaskCompleted && taskProgress?.completedAt && (
                      <div className="mt-3 pt-3 border-t border-green-500/20">
                        <div className="text-xs text-green-400">
                          ✅ Complété le {new Date(taskProgress.completedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Barre de progression */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progression</span>
                <span className="text-sm text-white font-medium">
                  {phaseProgress?.tasks?.filter(t => t.completed).length || 0} / {phase.tasks.length}
                </span>
              </div>
              
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${phase.color} transition-all duration-500`}
                  style={{ 
                    width: `${((phaseProgress?.tasks?.filter(t => t.completed).length || 0) / phase.tasks.length) * 100}%` 
                  }}
                />
              </div>
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

const EntretiensTab = ({ availableEntretiens, scheduledEntretiens, onScheduleEntretien, currentUser }) => {
  const [selectedType, setSelectedType] = useState(null);

  return (
    <motion.div
      key="entretiens"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Types d'entretiens disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(ENTRETIEN_TYPES).map(type => (
          <PremiumCard key={type.id} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${type.color} opacity-5`} />
            
            <div className="text-center">
              <div className="text-4xl mb-4">{type.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{type.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{type.description}</p>
              
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-6">
                <Clock className="w-4 h-4" />
                {type.duration} minutes
              </div>

              <button
                onClick={() => setSelectedType(type)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Programmer
              </button>
            </div>

            {/* Activités */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Activités incluses :</h4>
              <div className="space-y-2">
                {type.activities.map(activity => (
                  <div key={activity.id} className="text-xs text-gray-400">
                    • {activity.name} ({activity.duration}min)
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* Entretiens programmés */}
      {scheduledEntretiens.length > 0 && (
        <PremiumCard>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Vos Entretiens Programmés
          </h3>

          <div className="space-y-4">
            {scheduledEntretiens.map(entretien => {
              const entretienType = ENTRETIEN_TYPES[entretien.entretienType];
              
              return (
                <div key={entretien.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl">{entretienType?.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{entretienType?.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {entretien.scheduledDate ? new Date(entretien.scheduledDate.toDate()).toLocaleString('fr-FR') : 'Date à confirmer'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    entretien.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    entretien.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {entretien.status === 'completed' ? 'Terminé' :
                     entretien.status === 'in_progress' ? 'En cours' :
                     'Programmé'}
                  </div>
                </div>
              );
            })}
          </div>
        </PremiumCard>
      )}

      {/* Modal de programmation d'entretien */}
      {selectedType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Programmer - {selectedType.name}</h3>
              <button
                onClick={() => setSelectedType(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Créneaux disponibles */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Créneaux disponibles :</h4>
              
              {availableEntretiens.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun créneau disponible pour le moment</p>
                  <p className="text-sm mt-2">Contactez les RH pour plus d'informations</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableEntretiens.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        onScheduleEntretien(selectedType.id, slot.id);
                        setSelectedType(null);
                      }}
                      className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-colors"
                    >
                      <div className="text-white font-medium">
                        {new Date(slot.date.toDate()).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(slot.date.toDate()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {slot.location}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// 📈 ONGLET PROGRESSION
// ==========================================

const ProgressTab = ({ userProgress, stats, currentUser }) => {
  // Calculer la progression globale
  const totalTasks = Object.values(FORMATION_PHASES).reduce((total, phase) => total + phase.tasks.length, 0);
  const completedTasks = stats.completedTasks;
  const globalProgress = (completedTasks / totalTasks) * 100;

  // Calculer l'XP total possible
  const maxXP = Object.values(FORMATION_PHASES).reduce((total, phase) => total + phase.xpTotal, 0);

  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Vue d'ensemble */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Vue d'ensemble de votre progression
        </h3>

        {/* Barre de progression globale */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Progression globale</span>
            <span className="text-white font-bold">{Math.round(globalProgress)}%</span>
          </div>
          
          <div className="w-full bg-gray-700/50 rounded-full h-4">
            <div 
              className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
              style={{ width: `${globalProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{completedTasks} tâches complétées</span>
            <span>{totalTasks} tâches au total</span>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.totalXP}</div>
            <div className="text-sm text-gray-400">XP Gagnés</div>
            <div className="text-xs text-gray-500">/ {maxXP} max</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{completedTasks}</div>
            <div className="text-sm text-gray-400">Tâches Terminées</div>
            <div className="text-xs text-gray-500">/ {totalTasks} total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Object.values(userProgress.phases || {}).filter(p => p.completed).length}
            </div>
            <div className="text-sm text-gray-400">Phases Complètes</div>
            <div className="text-xs text-gray-500">/ 4 phases</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{stats.badges.length}</div>
            <div className="text-sm text-gray-400">Badges Obtenus</div>
            <div className="text-xs text-gray-500">/ {BADGES_ONBOARDING.length} total</div>
          </div>
        </div>
      </PremiumCard>

      {/* Progression par phase */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-6">Progression détaillée par phase</h3>
        
        <div className="space-y-6">
          {Object.values(FORMATION_PHASES).map(phase => {
            const phaseProgress = userProgress.phases?.[phase.id];
            const completedPhaseTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
            const totalPhaseTasks = phase.tasks.length;
            const phasePercentage = (completedPhaseTasks / totalPhaseTasks) * 100;

            return (
              <div key={phase.id} className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-2xl">{phase.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{phase.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{completedPhaseTasks} / {totalPhaseTasks} tâches</span>
                      <span>{Math.round(phasePercentage)}%</span>
                      {phaseProgress?.completed && (
                        <span className="text-green-400">✅ Terminé</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${phase.color} transition-all duration-500`}
                    style={{ width: `${phasePercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PremiumCard>

      {/* Badges obtenus */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges d'onboarding
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {BADGES_ONBOARDING.map(badge => {
            const isObtained = stats.badges.some(b => b.id === badge.id);
            
            return (
              <div
                key={badge.id}
                className={`text-center p-4 rounded-lg border transition-all ${
                  isObtained 
                    ? 'bg-gradient-to-b from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                    : 'bg-gray-800/30 border-gray-700/50 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="text-white font-semibold text-sm mb-1">{badge.name}</h4>
                <p className="text-gray-400 text-xs mb-2">{badge.description}</p>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400">+{badge.xp} XP</span>
                </div>
                
                {isObtained && (
                  <div className="mt-2 text-xs text-green-400 font-medium">
                    ✅ Obtenu
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PremiumCard>

      {/* Temps restant estimé */}
      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-6">Estimation de temps restant</h3>
        
        <div className="text-center py-6">
          <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          
          {globalProgress === 100 ? (
            <div>
              <div className="text-2xl font-bold text-green-400 mb-2">Félicitations ! 🎉</div>
              <p className="text-gray-400">Vous avez terminé votre parcours d'onboarding</p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                ~{Math.max(1, Math.round((100 - globalProgress) / 10))} jour(s)
              </div>
              <p className="text-gray-400">Estimation basée sur votre progression actuelle</p>
              <p className="text-sm text-gray-500 mt-2">
                {totalTasks - completedTasks} tâches restantes
              </p>
            </div>
          )}
        </div>
      </PremiumCard>
    </motion.div>
  );
};

export default OnboardingPage;
