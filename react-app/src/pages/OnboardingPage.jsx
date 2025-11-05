// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING AVEC MENU HAMBURGER IDENTIQUE AUX AUTRES PAGES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Target,
  Zap,
  RefreshCw,
  User,
  TrendingUp,
  MessageSquare,
  Calendar,
  MapPin,
  ChevronRight,
  Star,
  Trophy,
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
  Unlock,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER (IDENTIQUE AUX AUTRES PAGES)
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ==========================================
// 📋 DONNÉES DE FORMATION
// ==========================================

const FORMATION_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '👶 Découverte de Brain',
    description: 'Immersion dans l\'univers Brain',
    duration: 3,
    color: 'from-blue-500 to-cyan-500',
    icon: '👶',
    order: 1,
    xpTotal: 100,
    badge: 'Explorateur Brain',
    room: 'Salle de réunion principale',
    tasks: [
      {
        id: 'visite_locaux',
        name: 'Visite guidée des locaux',
        description: 'Tour complet des espaces Brain avec présentation de chaque zone',
        xp: 20,
        required: true,
        estimatedTime: 90,
        room: 'Tous espaces',
        mentor: 'Manager'
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
        room: 'Salle de dev',
        mentor: 'Tech Lead'
      },
      {
        id: 'code_review',
        name: 'Code Review avec mentor',
        description: 'Revue de code détaillée avec retours constructifs',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Salle de dev',
        mentor: 'Senior Developer'
      },
      {
        id: 'certification_tech',
        name: 'Certification technique',
        description: 'Examen technique pour valider les compétences acquises',
        xp: 40,
        required: false,
        estimatedTime: 180,
        room: 'En ligne',
        mentor: 'CTO'
      }
    ]
  },

  INTEGRATION_EQUIPE: {
    id: 'integration_equipe',
    name: '🤝 Intégration Équipe',
    description: 'Devenir un membre actif de l\'équipe Brain',
    duration: 5,
    color: 'from-green-500 to-emerald-500',
    icon: '🤝',
    order: 3,
    xpTotal: 150,
    badge: 'Team Player',
    room: 'Espaces collaboratifs',
    tasks: [
      {
        id: 'premier_standup',
        name: 'Participer au Daily Standup',
        description: 'Présentation de son travail lors du standup quotidien',
        xp: 25,
        required: true,
        estimatedTime: 15,
        room: 'Salle de réunion',
        mentor: 'Scrum Master'
      },
      {
        id: 'collaboration_projets',
        name: 'Collaborer sur un projet d\'équipe',
        description: 'Travailler en binôme ou en équipe sur un projet réel',
        xp: 40,
        required: true,
        estimatedTime: 480,
        room: 'Open space',
        mentor: 'Project Manager'
      },
      {
        id: 'partage_connaissances',
        name: 'Session de partage de connaissances',
        description: 'Présenter un sujet devant l\'équipe (tech talk ou retour d\'expérience)',
        xp: 35,
        required: true,
        estimatedTime: 60,
        room: 'Salle de réunion',
        mentor: 'Team Lead'
      },
      {
        id: 'feedback_360',
        name: 'Session de feedback 360°',
        description: 'Recevoir et donner du feedback constructif avec l\'équipe',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salle privée',
        mentor: 'HR Manager'
      },
      {
        id: 'evenement_team',
        name: 'Participer à un événement d\'équipe',
        description: 'Team building, afterwork ou événement social',
        xp: 20,
        required: false,
        estimatedTime: 180,
        room: 'Externe',
        mentor: 'Équipe'
      }
    ]
  },

  AUTONOMIE_COMPLETE: {
    id: 'autonomie_complete',
    name: '🚀 Autonomie Complète',
    description: 'Prendre en charge des responsabilités de manière autonome',
    duration: 10,
    color: 'from-orange-500 to-red-500',
    icon: '🚀',
    order: 4,
    xpTotal: 250,
    badge: 'Autonome Brain',
    room: 'Tous espaces',
    tasks: [
      {
        id: 'projet_solo',
        name: 'Gérer un projet en autonomie',
        description: 'Mener un projet de A à Z sans supervision constante',
        xp: 60,
        required: true,
        estimatedTime: 960,
        room: 'Espace de travail',
        mentor: 'Senior Manager'
      },
      {
        id: 'decision_technique',
        name: 'Prendre des décisions techniques',
        description: 'Argumenter et défendre des choix techniques devant l\'équipe',
        xp: 50,
        required: true,
        estimatedTime: 120,
        room: 'Salle de réunion',
        mentor: 'Tech Lead'
      },
      {
        id: 'mentorat',
        name: 'Mentorer un nouveau membre',
        description: 'Accompagner un nouvel arrivant dans son onboarding',
        xp: 60,
        required: true,
        estimatedTime: 480,
        room: 'Variable',
        mentor: 'HR Manager'
      },
      {
        id: 'initiative_amelioration',
        name: 'Proposer et implémenter une amélioration',
        description: 'Identifier un problème et proposer une solution concrète',
        xp: 50,
        required: true,
        estimatedTime: 360,
        room: 'Espace de travail',
        mentor: 'Manager'
      },
      {
        id: 'certification_finale',
        name: 'Certification Brain',
        description: 'Évaluation finale et validation de l\'autonomie complète',
        xp: 30,
        required: false,
        estimatedTime: 120,
        room: 'Salle de réunion',
        mentor: 'Direction'
      }
    ]
  }
};

const BADGES = [
  {
    id: 'first_steps',
    name: 'Premiers Pas',
    description: 'Début du parcours de réflexion et découverte',
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

        console.log('✅ Progression chargée:', { totalXP, completedTasks });
      } else {
        console.log('⚠️ Aucune progression trouvée, initialisation nécessaire');
      }

      // Charger les entretiens disponibles
      const entretiensQuery = query(
        collection(db, 'interviewSlots'),
        where('status', '==', 'available'),
        orderBy('date', 'asc'),
        limit(10)
      );

      const entretiensSnapshot = await getDocs(entretiensQuery);
      const entretiensData = entretiensSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAvailableEntretiens(entretiensData);

      // Charger les entretiens planifiés
      const scheduledQuery = query(
        collection(db, 'interviewSlots'),
        where('bookedBy', '==', user.uid),
        orderBy('date', 'asc')
      );

      const scheduledSnapshot = await getDocs(scheduledQuery);
      const scheduledData = scheduledSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setScheduledEntretiens(scheduledData);

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
        console.error('❌ Profil onboarding introuvable');
        return;
      }

      const progressData = progressDoc.data();
      const phaseData = progressData.phases[phaseId];

      if (!phaseData) {
        console.error('❌ Phase introuvable:', phaseId);
        return;
      }

      // Mettre à jour la tâche
      const updatedTasks = phaseData.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            completed: true,
            completedAt: serverTimestamp()
          };
        }
        return task;
      });

      // Vérifier si toutes les tâches requises sont complétées
      const requiredTasks = FORMATION_PHASES[phaseId].tasks.filter(t => t.required);
      const completedRequiredTasks = updatedTasks.filter(t =>
        requiredTasks.some(rt => rt.id === t.id && t.completed)
      );

      const phaseCompleted = completedRequiredTasks.length === requiredTasks.length;

      // Mettre à jour la phase
      const updatedPhase = {
        ...phaseData,
        tasks: updatedTasks,
        completed: phaseCompleted,
        completedAt: phaseCompleted ? serverTimestamp() : null
      };

      // Calculer les nouveaux totaux
      const allPhases = { ...progressData.phases, [phaseId]: updatedPhase };
      const totalXP = Object.values(allPhases).reduce((total, phase) => {
        return total + phase.tasks.reduce((taskTotal, task) => {
          return taskTotal + (task.completed ? task.xp : 0);
        }, 0);
      }, 0);

      const completedTasks = Object.values(allPhases).reduce((total, phase) => {
        return total + phase.tasks.filter(t => t.completed).length;
      }, 0);

      // Mettre à jour Firebase
      await updateDoc(progressRef, {
        [`phases.${phaseId}`]: updatedPhase,
        totalXP,
        completedTasks,
        updatedAt: serverTimestamp()
      });

      // Recharger les données
      await loadUserProgress();

      console.log('✅ Tâche complétée avec succès');

    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
    }
  };

  // Réserver un entretien
  const bookEntretien = async (slotId) => {
    if (!user?.uid) return;

    try {
      console.log('📅 Réservation entretien:', slotId);

      const slotRef = doc(db, 'interviewSlots', slotId);

      await updateDoc(slotRef, {
        status: 'booked',
        bookedBy: user.uid,
        bookedAt: serverTimestamp()
      });

      await loadUserProgress();

      console.log('✅ Entretien réservé');

    } catch (error) {
      console.error('❌ Erreur réservation:', error);
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
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Chargement de votre parcours d'intégration...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================
  // 🎨 RENDU
  // ==========================================

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Parcours d'Onboarding
              </h1>
              <p className="text-gray-400">Votre intégration personnalisée chez Brain</p>
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">XP Total</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.totalXP}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tâches Complétées</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completedTasks}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Phase Actuelle</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.currentPhase
                      ? FORMATION_PHASES[stats.currentPhase]?.name.split(' ')[1] || 'N/A'
                      : 'Début'}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Badges Obtenus</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.badges.length}</p>
                </div>
                <Award className="w-8 h-8 text-purple-400" />
              </div>
            </div>
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
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'formation' && (
            <motion.div
              key="formation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Vérifier si profil existe */}
              {!userProgress.phases && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center mb-6">
                  <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Profil d'onboarding non initialisé
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Cliquez sur le bouton ci-dessous pour démarrer votre parcours
                  </p>
                  <button
                    onClick={initializeOnboardingProfile}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <Play className="w-5 h-5 inline mr-2" />
                    Démarrer mon parcours
                  </button>
                </div>
              )}

              {/* Phases de formation */}
              {userProgress.phases && (
                <div className="space-y-6">
                  {Object.values(FORMATION_PHASES).map(phase => {
                    const phaseProgress = userProgress.phases[phase.id];
                    const isStarted = phaseProgress?.started;
                    const isCompleted = phaseProgress?.completed;

                    return (
                      <div
                        key={phase.id}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
                      >
                        {/* En-tête de phase */}
                        <div className={`p-6 bg-gradient-to-r ${phase.color}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">{phase.icon}</div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">
                                  {phase.name}
                                </h3>
                                <p className="text-white/80">{phase.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-white">
                                {phase.xpTotal} XP
                              </div>
                              <div className="text-white/80 text-sm">
                                {phase.duration} jours
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tâches de la phase */}
                        <div className="p-6">
                          <div className="space-y-3">
                            {phase.tasks.map(task => {
                              const taskProgress = phaseProgress?.tasks.find(
                                t => t.id === task.id
                              );
                              const isTaskCompleted = taskProgress?.completed;

                              return (
                                <div
                                  key={task.id}
                                  className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 hover:border-purple-500/50 transition-all"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div>
                                        {isTaskCompleted ? (
                                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                                        ) : (
                                          <div className="w-6 h-6 border-2 border-gray-600 rounded-full" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="text-white font-medium">
                                            {task.name}
                                          </h4>
                                          {task.required && (
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                              Requis
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                          {task.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {task.estimatedTime} min
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {task.room}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {task.mentor}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <div className="text-yellow-400 font-bold">
                                          +{task.xp} XP
                                        </div>
                                      </div>
                                      {!isTaskCompleted && isStarted && (
                                        <button
                                          onClick={() => completeTask(phase.id, task.id)}
                                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                          Compléter
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Badge de phase */}
                          {isCompleted && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-yellow-400" />
                                <div>
                                  <h4 className="text-white font-bold">
                                    Badge obtenu : {phase.badge}
                                  </h4>
                                  <p className="text-gray-400 text-sm">
                                    Phase complétée avec succès !
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              {/* Entretiens planifiés */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  Mes Entretiens Planifiés
                </h3>
                {scheduledEntretiens.length === 0 ? (
                  <p className="text-gray-400">Aucun entretien planifié</p>
                ) : (
                  <div className="space-y-3">
                    {scheduledEntretiens.map(entretien => (
                      <div
                        key={entretien.id}
                        className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{entretien.type}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(entretien.date).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Avec</p>
                            <p className="text-white">{entretien.interviewer}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Entretiens disponibles */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-green-400" />
                  Créneaux Disponibles
                </h3>
                {availableEntretiens.length === 0 ? (
                  <p className="text-gray-400">Aucun créneau disponible pour le moment</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableEntretiens.map(slot => (
                      <div
                        key={slot.id}
                        className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4"
                      >
                        <div className="mb-3">
                          <h4 className="text-white font-medium mb-1">{slot.type}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(slot.date).toLocaleString('fr-FR')}
                          </p>
                          <p className="text-sm text-gray-400">Avec {slot.interviewer}</p>
                        </div>
                        <button
                          onClick={() => bookEntretien(slot.id)}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        >
                          Réserver ce créneau
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              {/* Vue d'ensemble */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Vue d'Ensemble
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                    <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.totalXP}
                    </div>
                    <div className="text-sm text-gray-400">XP Total Gagné</div>
                  </div>

                  <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.completedTasks}
                    </div>
                    <div className="text-sm text-gray-400">Tâches Complétées</div>
                  </div>

                  <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                    <Award className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-white mb-1">
                      {stats.badges.length}
                    </div>
                    <div className="text-sm text-gray-400">Badges Débloqués</div>
                  </div>
                </div>

                {/* Progression par phase */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Progression par Phase</h4>
                  {Object.values(FORMATION_PHASES).map(phase => {
                    const phaseProgress = userProgress.phases?.[phase.id];
                    const completedTasks = phaseProgress?.tasks.filter(t => t.completed).length || 0;
                    const totalTasks = phase.tasks.length;
                    const percentage = Math.round((completedTasks / totalTasks) * 100);

                    return (
                      <div key={phase.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{phase.icon}</span>
                            <span className="text-white font-medium">{phase.name}</span>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {completedTasks}/{totalTasks} tâches
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${phase.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Collection de Badges
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {BADGES.map(badge => {
                    const isEarned = stats.badges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`text-center p-4 rounded-lg border ${
                          isEarned
                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                            : 'bg-gray-900/50 border-gray-700/50 opacity-50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <div className="text-sm font-medium text-white mb-1">
                          {badge.name}
                        </div>
                        <div className="text-xs text-gray-400">{badge.description}</div>
                        {isEarned && (
                          <div className="mt-2 text-yellow-400 text-xs font-bold">
                            +{badge.xp} XP
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default OnboardingPage;// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// SYSTÈME D'INTÉGRATION COMPLET - FORMATION + ENTRETIENS
// VERSION CORRIGÉE : Menu fonctionnel + Formation déverrouillée
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
        estimatedTime: 60,
        room: 'Accueil',
        mentor: 'Responsable Booking'
      },
      {
        id: 'accueil_clients',
        name: 'Accueil et briefing clients',
        description: 'Techniques d\'accueil et présentation des expériences',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Accueil',
        mentor: 'Responsable Accueil'
      },
      {
        id: 'gestion_feedback',
        name: 'Gestion des feedbacks',
        description: 'Collecte et traitement des retours clients',
        xp: 35,
        required: false,
        estimatedTime: 60,
        room: 'Bureau',
        mentor: 'Customer Success'
      }
    ]
  },
  
  GAME_MASTER: {
    id: 'game_master',
    name: '🎮 Game Master',
    description: 'Formation complète Game Master',
    duration: 14,
    color: 'from-orange-500 to-red-500',
    icon: '🎮',
    order: 4,
    xpTotal: 300,
    badge: 'Game Master Certifié',
    room: 'Salle jeu principale',
    tasks: [
      {
        id: 'scenarios_base',
        name: 'Maîtrise des scénarios de base',
        description: 'Apprentissage complet de tous les scénarios standards',
        xp: 50,
        required: true,
        estimatedTime: 360,
        room: 'Salle jeu',
        mentor: 'Game Master expert'
      },
      {
        id: 'gestion_technique',
        name: 'Gestion technique des salles',
        description: 'Setup, troubleshooting, réinitialisation',
        xp: 40,
        required: true,
        estimatedTime: 240,
        room: 'Salle technique',
        mentor: 'Technicien Senior'
      },
      {
        id: 'animation_groupe',
        name: 'Techniques d\'animation de groupe',
        description: 'Communication, gestion des personnalités, dynamique',
        xp: 45,
        required: true,
        estimatedTime: 180,
        room: 'Salle formation',
        mentor: 'Formateur Communication'
      },
      {
        id: 'gestion_incidents',
        name: 'Gestion des incidents et imprevus',
        description: 'Protocoles d\'urgence et résolution de problèmes',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Salle briefing',
        mentor: 'Responsable Ops'
      },
      {
        id: 'scenarios_avances',
        name: 'Scénarios avancés et personnalisation',
        description: 'Maîtrise des variantes et adaptations',
        xp: 60,
        required: true,
        estimatedTime: 300,
        room: 'Salle jeu',
        mentor: 'Game Master Legend'
      },
      {
        id: 'certification_gm',
        name: 'Certification Game Master',
        description: 'Évaluation finale en conditions réelles',
        xp: 65,
        required: true,
        estimatedTime: 240,
        room: 'Salle certification',
        mentor: 'Panel d\'experts'
      }
    ]
  },
  
  SPECIALISATIONS: {
    id: 'specialisations',
    name: '⭐ Spécialisations',
    description: 'Formations avancées optionnelles',
    duration: 999,
    color: 'from-yellow-500 to-orange-500',
    icon: '⭐',
    order: 5,
    xpTotal: 500,
    badge: 'Expert Spécialisé',
    room: 'Salles diverses',
    tasks: [
      {
        id: 'evenements_speciaux',
        name: 'Événements spéciaux et corporate',
        description: 'Organisation et animation d\'événements sur mesure',
        xp: 80,
        required: false,
        estimatedTime: 360,
        room: 'Salle événements',
        mentor: 'Event Manager'
      },
      {
        id: 'scenarios_vr',
        name: 'Scénarios VR avancés',
        description: 'Maîtrise des expériences en réalité virtuelle',
        xp: 90,
        required: false,
        estimatedTime: 300,
        room: 'Salle VR',
        mentor: 'VR Specialist'
      },
      {
        id: 'creation_scenarios',
        name: 'Création de nouveaux scénarios',
        description: 'Concevoir et développer de nouvelles expériences',
        xp: 100,
        required: false,
        estimatedTime: 600,
        room: 'Salle créative',
        mentor: 'Creative Director'
      },
      {
        id: 'formation_formateurs',
        name: 'Formation de formateurs',
        description: 'Former les nouveaux Game Masters',
        xp: 120,
        required: false,
        estimatedTime: 480,
        room: 'Salle formation',
        mentor: 'Lead Trainer'
      },
      {
        id: 'master_brain',
        name: 'Master Brain Certification',
        description: 'Niveau expert ultime et reconnaissance',
        xp: 110,
        required: false,
        estimatedTime: 720,
        room: 'Certification finale',
        mentor: 'CEO & Founders'
      }
    ]
  }
};

// ==========================================
// 🏆 BADGES D'ONBOARDING - GAMIFICATION
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

      // Vérifier si la phase est complète
      const allTasksCompleted = phase.tasks.every(t => t.completed);
      if (allTasksCompleted) {
        phase.completed = true;
        phase.completedAt = serverTimestamp();
      }

      // Mettre à jour Firebase
      await updateDoc(progressRef, {
        phases: currentProgress.phases
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
        const canStart = true; // ✅ TOUJOURS ACCESSIBLE

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
              ) : (
                <div className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Disponible
                </div>
              )}
            </div>

            {/* En-tête de la phase */}
            <div className="mb-6">
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
                  {phase.duration} jours
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
            <div className="space-y-3">
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

const EntretiensTab = ({ availableEntretiens, scheduledEntretiens, onScheduleEntretien, currentUser }) => {
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

const ProgressTab = ({ userProgress, stats, currentUser }) => {
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
          <p className="text-gray-400">Aucun badge obtenu pour le moment</p>
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
