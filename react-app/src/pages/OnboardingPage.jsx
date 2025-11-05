// ==========================================
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

// 🎯 IMPORT DU VRAI LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';

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
// 🎓 ONGLET FORMATION (Composant séparé pour éviter duplication)
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
        const canStart = true; // ✅ TOUJOURS ACCESSIBLE

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
