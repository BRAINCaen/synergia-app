// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// SYSTÈME D'INTÉGRATION COMPLET - FORMATION + ENTRETIENS - MENU HAMBURGER PREMIUM
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

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

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
        id: 'certification_interne',
        name: 'Certification interne',
        description: 'Évaluation finale des compétences techniques',
        xp: 40,
        required: false,
        estimatedTime: 180,
        room: 'En ligne',
        mentor: 'CTO'
      }
    ]
  },
  
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours Client',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-blue-500 to-cyan-500',
    icon: '👥',
    order: 3,
    xpTotal: 150,
    badge: 'Ambassadeur Brain',
    room: 'Salle expérience',
    tasks: [
      {
        id: 'experience_complete',
        name: 'Vivre une expérience complète',
        description: 'Participer à une session en tant que joueur',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle jeu',
        mentor: 'Game Master'
      },
      {
        id: 'observer_gm',
        name: 'Observer un Game Master',
        description: 'Observation d\'une session complète',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle jeu',
        mentor: 'Game Master senior'
      },
      {
        id: 'gestion_reservations',
        name: 'Gestion des réservations',
        description: 'Maîtrise du système de réservation et planning',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Accueil',
        mentor: 'Manager'
      },
      {
        id: 'relation_client',
        name: 'Relation client',
        description: 'Communication, gestion des attentes, satisfaction',
        xp: 35,
        required: true,
        estimatedTime: 180,
        room: 'Accueil',
        mentor: 'Responsable client'
      },
      {
        id: 'simulation_accueil',
        name: 'Simulation accueil client',
        description: 'Mise en pratique de l\'accueil de A à Z',
        xp: 30,
        required: false,
        estimatedTime: 60,
        room: 'Accueil',
        mentor: 'Team Lead'
      }
    ]
  },
  
  GAME_MASTER: {
    id: 'game_master',
    name: '🎮 Formation Game Master',
    description: 'Devenir Game Master certifié',
    duration: 10,
    color: 'from-pink-500 to-red-500',
    icon: '🎮',
    order: 4,
    xpTotal: 250,
    badge: 'Game Master Certifié',
    room: 'Salle formation GM',
    tasks: [
      {
        id: 'theatrical_performance',
        name: 'Performance théâtrale',
        description: 'Développer le jeu d\'acteur et la présence scénique',
        xp: 40,
        required: true,
        estimatedTime: 240,
        room: 'Salle formation',
        mentor: 'Coach théâtre'
      },
      {
        id: 'regles_jeux',
        name: 'Maîtrise des règles',
        description: 'Connaissance approfondie de tous les jeux',
        xp: 50,
        required: true,
        estimatedTime: 480,
        room: 'Salle formation',
        mentor: 'GM Expert'
      },
      {
        id: 'gestion_groupe',
        name: 'Gestion de groupe',
        description: 'Animation, dynamique de groupe, résolution conflits',
        xp: 40,
        required: true,
        estimatedTime: 180,
        room: 'Salle formation',
        mentor: 'Psychologue'
      },
      {
        id: 'premiere_animation',
        name: 'Première animation supervisée',
        description: 'Animer une session complète avec supervision',
        xp: 60,
        required: true,
        estimatedTime: 120,
        room: 'Salle jeu',
        mentor: 'GM Senior'
      },
      {
        id: 'certification_gm',
        name: 'Certification Game Master',
        description: 'Évaluation finale et validation des compétences',
        xp: 60,
        required: true,
        estimatedTime: 180,
        room: 'Salle jeu',
        mentor: 'Directeur'
      }
    ]
  },
  
  AUTONOMIE: {
    id: 'autonomie',
    name: '🚀 Vers l\'Autonomie',
    description: 'Devenir autonome et excellent dans son rôle',
    duration: 14,
    color: 'from-green-500 to-emerald-500',
    icon: '🚀',
    order: 5,
    xpTotal: 200,
    badge: 'Brain Expert',
    room: 'Terrain',
    tasks: [
      {
        id: 'missions_autonomes',
        name: 'Missions en autonomie',
        description: 'Effectuer des missions sans supervision',
        xp: 50,
        required: true,
        estimatedTime: 960,
        room: 'Tous espaces',
        mentor: 'Self'
      },
      {
        id: 'feedback_continue',
        name: 'Feedback continu',
        description: 'Sessions de feedback régulières',
        xp: 30,
        required: true,
        estimatedTime: 180,
        room: 'Bureau',
        mentor: 'Manager'
      },
      {
        id: 'mentor_junior',
        name: 'Mentorat d\'un junior',
        description: 'Accompagner l\'intégration d\'un nouveau',
        xp: 60,
        required: false,
        estimatedTime: 480,
        room: 'Terrain',
        mentor: 'Self'
      },
      {
        id: 'amelioration_continue',
        name: 'Amélioration continue',
        description: 'Proposer des améliorations, innovations',
        xp: 30,
        required: false,
        estimatedTime: 120,
        room: 'Bureau',
        mentor: 'Direction'
      },
      {
        id: 'bilan_final',
        name: 'Bilan final d\'intégration',
        description: 'Évaluation complète de l\'onboarding',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Bureau',
        mentor: 'RH + Manager'
      }
    ]
  }
};

// ==========================================
// 🏆 BADGES DE GAMIFICATION
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
          completedAt: null,
          tasks: phase.tasks.map(task => ({
            id: task.id,
            name: task.name,
            completed: false,
            completedAt: null,
            xp: task.xp
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
  const markTaskCompleted = async (phaseId, taskId) => {
    if (!user?.uid) return;

    try {
      console.log('✅ Marquage tâche complétée:', phaseId, taskId);

      const progressRef = doc(db, 'userOnboarding', user.uid);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const currentProgress = progressDoc.data();
        const phase = currentProgress.phases[phaseId];
        
        // Mettre à jour la tâche
        const updatedTasks = phase.tasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: true,
              completedAt: serverTimestamp()
            };
          }
          return task;
        });

        // Vérifier si toutes les tâches sont complétées
        const allTasksCompleted = updatedTasks.every(task => task.completed);
        
        // Mettre à jour Firestore
        await updateDoc(progressRef, {
          [`phases.${phaseId}.tasks`]: updatedTasks,
          [`phases.${phaseId}.completed`]: allTasksCompleted,
          [`phases.${phaseId}.completedAt`]: allTasksCompleted ? serverTimestamp() : null
        });

        // Recharger les données
        await loadUserProgress();
      }

    } catch (error) {
      console.error('❌ Erreur marquage tâche:', error);
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
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu selon l'onglet */}
      <AnimatePresence mode="wait">
        {activeTab === 'formation' && (
          <motion.div
            key="formation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {Object.values(FORMATION_PHASES).map(phase => {
              const phaseProgress = userProgress.phases?.[phase.id];
              const isActive = stats.currentPhase === phase.id;
              const isCompleted = phaseProgress?.completed;
              const completedTasksCount = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
              const totalTasksCount = phase.tasks.length;
              const progressPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

              return (
                <PremiumCard key={phase.id} className="overflow-hidden">
                  <div className="flex items-start gap-6">
                    {/* Icône de phase */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-4xl">{phase.icon}</span>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            {phase.name}
                          </h3>
                          <p className="text-gray-400">{phase.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Complété
                            </span>
                          )}
                          {isActive && !isCompleted && (
                            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              En cours
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">
                            {completedTasksCount} / {totalTasksCount} tâches
                          </span>
                          <span className="text-blue-400 font-medium">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full bg-gradient-to-r ${phase.color}`}
                          />
                        </div>
                      </div>

                      {/* Tâches */}
                      <div className="space-y-2">
                        {phase.tasks.map(task => {
                          const taskProgress = phaseProgress?.tasks?.find(t => t.id === task.id);
                          const isTaskCompleted = taskProgress?.completed || false;

                          return (
                            <div
                              key={task.id}
                              className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                                isTaskCompleted
                                  ? 'bg-green-500/10 border border-green-500/30'
                                  : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50'
                              }`}
                            >
                              <button
                                onClick={() => !isTaskCompleted && markTaskCompleted(phase.id, task.id)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                                  isTaskCompleted
                                    ? 'bg-green-500 text-white'
                                    : 'border-2 border-gray-600 hover:border-blue-500'
                                }`}
                              >
                                {isTaskCompleted && <CheckCircle className="w-4 h-4" />}
                              </button>

                              <div className="flex-1">
                                <h4 className={`font-semibold mb-1 ${
                                  isTaskCompleted ? 'text-green-400 line-through' : 'text-white'
                                }`}>
                                  {task.name}
                                </h4>
                                <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {task.estimatedTime} min
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    {task.room}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <User className="w-3 h-3" />
                                    {task.mentor}
                                  </span>
                                  <span className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-3 h-3" />
                                    +{task.xp} XP
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Stats de phase */}
                      <div className="mt-4 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">{phase.duration} jours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400">{phase.xpTotal} XP total</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-400">Badge: {phase.badge}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'entretiens' && (
          <motion.div
            key="entretiens"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <PremiumCard>
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Système d'Entretiens
                </h3>
                <p className="text-gray-400 mb-4">
                  Fonctionnalité en cours de développement
                </p>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                title="Phases Actives"
                value={Object.values(userProgress.phases || {}).filter(p => p.started && !p.completed).length}
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

            {/* Badges disponibles */}
            <PremiumCard>
              <h3 className="text-xl font-bold text-white mb-6">🏆 Badges Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BADGES_ONBOARDING.map(badge => {
                  const isEarned = stats.badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-6 rounded-xl border ${
                        isEarned
                          ? 'bg-yellow-500/10 border-yellow-500/50'
                          : 'bg-gray-800/30 border-gray-700/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-5xl mb-3">{badge.icon}</div>
                        <h4 className={`font-bold mb-2 ${isEarned ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {badge.name}
                        </h4>
                        <p className="text-sm text-gray-500 mb-3">{badge.description}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-400">+{badge.xp} XP</span>
                        </div>
                        {isEarned && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Obtenu
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumLayout>
  );
};

export default OnboardingPage;
