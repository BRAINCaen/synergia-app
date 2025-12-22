// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx  
// VERSION DEBUG : Auto-réparation + Logs complets
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
  Search,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Briefcase,
  UserCheck,
  ShieldCheck
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
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 IMPORT DU LAYOUT
import Layout from '../components/layout/Layout.jsx';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';

// ==========================================
// 🎯 LES 10 PHASES DE FORMATION (SANS XP)
// ==========================================

const FORMATION_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: 'Découverte de Brain',
    description: 'Immersion dans l\'univers et la culture Brain',
    duration: 3,
    color: 'from-blue-500 to-cyan-500',
    icon: '🎯',
    order: 1,
    tasks: [
      {
        id: 'visite_locaux',
        name: 'Visite guidée des locaux',
        description: 'Tour complet des espaces Brain',
        estimatedTime: 90,
        mentor: 'Responsable RH'
      },
      {
        id: 'comprendre_valeurs',
        name: 'Comprendre les valeurs Brain',
        description: 'Découverte de l\'ADN Brain',
        estimatedTime: 60,
        mentor: 'Direction'
      },
      {
        id: 'rencontrer_equipe',
        name: 'Rencontrer l\'équipe',
        description: 'Discussions avec les membres',
        estimatedTime: 120,
        mentor: 'Équipe'
      },
      {
        id: 'decouverte_outils',
        name: 'Découverte des outils',
        description: 'Formation aux outils (Synergia, etc.)',
        estimatedTime: 60,
        mentor: 'IT Manager'
      }
    ]
  },

  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: 'Parcours client & expérience joueur',
    description: 'Maîtrise du parcours client',
    duration: 5,
    color: 'from-green-500 to-emerald-500',
    icon: '👥',
    order: 2,
    tasks: [
      {
        id: 'vivre_experience',
        name: 'Vivre une expérience complète',
        description: 'Participer à une session',
        estimatedTime: 90,
        mentor: 'Game Master'
      },
      {
        id: 'observer_sessions',
        name: 'Observer 2 sessions animées',
        description: 'Observer pour comprendre',
        estimatedTime: 180,
        mentor: 'Game Master senior'
      },
      {
        id: 'accueil_clients',
        name: 'Accueil et briefing clients',
        description: 'Maîtriser l\'accueil',
        estimatedTime: 90,
        mentor: 'Responsable Accueil'
      },
      {
        id: 'debriefing_photo',
        name: 'Debriefing et photo de groupe',
        description: 'Conclure l\'expérience',
        estimatedTime: 60,
        mentor: 'Game Master'
      }
    ]
  },

  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: 'Sécurité et procédures',
    description: 'Protocoles de sécurité',
    duration: 4,
    color: 'from-red-500 to-orange-500',
    icon: '🔐',
    order: 3,
    tasks: [
      {
        id: 'protocoles_urgence',
        name: 'Protocoles d\'urgence',
        description: 'Évacuation et premiers secours',
        estimatedTime: 90,
        mentor: 'Responsable Sécurité'
      },
      {
        id: 'systeme_surveillance',
        name: 'Système de surveillance',
        description: 'Caméras, micros, interphone',
        estimatedTime: 60,
        mentor: 'Technicien Senior'
      },
      {
        id: 'gestion_conflits',
        name: 'Gestion des conflits',
        description: 'Situations difficiles',
        estimatedTime: 90,
        mentor: 'Formateur Communication'
      },
      {
        id: 'hygiene_nettoyage',
        name: 'Hygiène et nettoyage',
        description: 'Standards de propreté',
        estimatedTime: 60,
        mentor: 'Responsable Ops'
      }
    ]
  },

  EXPERIENCE_PSYCHIATRIC: {
    id: 'experience_psychiatric',
    name: 'Expert·e Psychiatric',
    description: 'Formation Psychiatric',
    duration: 8,
    color: 'from-purple-500 to-indigo-500',
    icon: '🩺',
    order: 4,
    tasks: [
      {
        id: 'scenario_psychiatric',
        name: 'Scénario Psychiatric',
        description: 'Maîtriser l\'histoire et les énigmes',
        estimatedTime: 90,
        mentor: 'Game Master expert'
      },
      {
        id: 'temps_forts_psy',
        name: 'Temps forts Psychiatric',
        description: 'Moments-clés à identifier',
        estimatedTime: 60,
        mentor: 'Game Master senior'
      },
      {
        id: 'gerer_stress_psy',
        name: 'Gérer le stress des joueurs',
        description: 'Rassurer sans casser immersion',
        estimatedTime: 90,
        mentor: 'Formateur'
      },
      {
        id: 'effets_speciaux_psy',
        name: 'Effets spéciaux',
        description: 'Maîtriser les effets',
        estimatedTime: 90,
        mentor: 'Game Master expert'
      },
      {
        id: 'reset_psychiatric',
        name: 'Reset complet',
        description: 'Check de tous les éléments',
        estimatedTime: 60,
        mentor: 'Game Master'
      },
      {
        id: 'validation_psychiatric',
        name: 'Sessions validées',
        description: 'Animer 2 sessions',
        estimatedTime: 180,
        mentor: 'Référent·e'
      }
    ]
  },

  EXPERIENCE_PRISON: {
    id: 'experience_prison',
    name: 'Expert·e Prison',
    description: 'Formation Prison',
    duration: 7,
    color: 'from-gray-600 to-gray-800',
    icon: '🚨',
    order: 5,
    tasks: [
      {
        id: 'scenario_prison',
        name: 'Scénario Prison',
        description: 'Comprendre l\'ambiance carcérale',
        estimatedTime: 90,
        mentor: 'Game Master expert'
      },
      {
        id: 'equipes_multiples',
        name: 'Gestion équipes multiples',
        description: 'Gérer plusieurs équipes',
        estimatedTime: 90,
        mentor: 'Game Master expert'
      },
      {
        id: 'dispositifs_securite',
        name: 'Dispositifs de sécurité',
        description: 'Portes, menottes, alarmes',
        estimatedTime: 60,
        mentor: 'Technicien'
      },
      {
        id: 'reset_prison',
        name: 'Reset complet Prison',
        description: 'Cellules et objets cachés',
        estimatedTime: 90,
        mentor: 'Game Master'
      },
      {
        id: 'validation_prison',
        name: 'Sessions validées',
        description: 'Animer 2 sessions',
        estimatedTime: 180,
        mentor: 'Référent·e'
      }
    ]
  },

  EXPERIENCE_80S: {
    id: 'experience_80s',
    name: 'Expert·e Back to the 80\'s',
    description: 'Formation rétro',
    duration: 5,
    color: 'from-pink-500 to-purple-500',
    icon: '🎸',
    order: 6,
    tasks: [
      {
        id: 'scenario_80s',
        name: 'Scénario 80\'s',
        description: 'Références et anecdotes',
        estimatedTime: 90,
        mentor: 'Game Master expert'
      },
      {
        id: 'playlist_ambiance',
        name: 'Playlist et ambiance',
        description: 'Maîtriser l\'ambiance rétro',
        estimatedTime: 45,
        mentor: 'Game Master'
      },
      {
        id: 'objets_vintage',
        name: 'Objets vintage',
        description: 'Téléphone, cassettes...',
        estimatedTime: 90,
        mentor: 'Technicien'
      },
      {
        id: 'reset_80s',
        name: 'Reset complet 80\'s',
        description: 'Remise en place',
        estimatedTime: 60,
        mentor: 'Game Master'
      },
      {
        id: 'validation_80s',
        name: 'Sessions validées',
        description: 'Animer 2 sessions',
        estimatedTime: 180,
        mentor: 'Référent·e'
      }
    ]
  },

  EXPERIENCE_QUIZ: {
    id: 'experience_quiz',
    name: 'Expert·e Quiz Game',
    description: 'Animation Quiz',
    duration: 6,
    color: 'from-yellow-500 to-orange-500',
    icon: '🏆',
    order: 7,
    tasks: [
      {
        id: 'concept_quiz',
        name: 'Concept Quiz Game',
        description: 'Format et règles',
        estimatedTime: 60,
        mentor: 'Animateur Quiz'
      },
      {
        id: 'animation_dynamique',
        name: 'Animation dynamique',
        description: 'Timing et énergie',
        estimatedTime: 90,
        mentor: 'Animateur expert'
      },
      {
        id: 'gestion_scores',
        name: 'Gestion scores',
        description: 'Scores en temps réel',
        estimatedTime: 60,
        mentor: 'Animateur'
      },
      {
        id: 'technique_quiz',
        name: 'Équipements techniques',
        description: 'Micro, écrans, sons',
        estimatedTime: 60,
        mentor: 'Technicien'
      },
      {
        id: 'validation_quiz',
        name: 'Sessions validées',
        description: 'Animer 2 soirées',
        estimatedTime: 240,
        mentor: 'Référent·e'
      }
    ]
  },

  GESTION_QUOTIDIEN: {
    id: 'gestion_quotidien',
    name: 'Gestion quotidienne',
    description: 'Tâches quotidiennes',
    duration: 4,
    color: 'from-cyan-500 to-blue-500',
    icon: '🛠️',
    order: 8,
    tasks: [
      {
        id: 'ouverture_fermeture',
        name: 'Ouverture/fermeture',
        description: 'Procédures quotidiennes',
        estimatedTime: 90,
        mentor: 'Responsable Ops'
      },
      {
        id: 'gestion_planning',
        name: 'Gestion du planning',
        description: 'Planning des sessions',
        estimatedTime: 60,
        mentor: 'Responsable Planning'
      },
      {
        id: 'entretien_quotidien',
        name: 'Entretien quotidien',
        description: 'Nettoyage et maintenance',
        estimatedTime: 90,
        mentor: 'Responsable Maintenance'
      },
      {
        id: 'gestion_stocks',
        name: 'Gestion des stocks',
        description: 'Inventaire et commandes',
        estimatedTime: 60,
        mentor: 'Responsable Achats'
      }
    ]
  },

  SOFT_SKILLS: {
    id: 'soft_skills',
    name: 'Soft skills & communication',
    description: 'Compétences relationnelles',
    duration: 3,
    color: 'from-green-400 to-teal-500',
    icon: '🌱',
    order: 9,
    tasks: [
      {
        id: 'communication_equipe',
        name: 'Communication d\'équipe',
        description: 'Collaboration et feedback',
        estimatedTime: 90,
        mentor: 'Formateur Communication'
      },
      {
        id: 'gestion_stress',
        name: 'Gestion du stress',
        description: 'Techniques de gestion',
        estimatedTime: 60,
        mentor: 'Coach'
      },
      {
        id: 'service_client',
        name: 'Excellence service client',
        description: 'Dépasser les attentes',
        estimatedTime: 90,
        mentor: 'Customer Success'
      },
      {
        id: 'creativite_adaptation',
        name: 'Créativité et adaptation',
        description: 'Improvisation',
        estimatedTime: 60,
        mentor: 'Formateur'
      }
    ]
  },

  CERTIFICATION_FINALE: {
    id: 'certification_finale',
    name: 'Certification finale',
    description: 'Évaluation complète',
    duration: 2,
    color: 'from-violet-500 to-purple-600',
    icon: '🎓',
    order: 10,
    tasks: [
      {
        id: 'evaluation_theorique',
        name: 'Évaluation théorique',
        description: 'Quiz complet',
        estimatedTime: 60,
        mentor: 'Équipe pédagogique'
      },
      {
        id: 'evaluation_pratique',
        name: 'Évaluation pratique',
        description: 'Session en autonomie',
        estimatedTime: 120,
        mentor: 'Panel d\'experts'
      },
      {
        id: 'debriefing_final',
        name: 'Debriefing final',
        description: 'Retour sur le parcours',
        estimatedTime: 60,
        mentor: 'Responsable Formation'
      },
      {
        id: 'remise_certification',
        name: 'Remise de certification',
        description: 'Célébration officielle',
        estimatedTime: 120,
        mentor: 'Toute l\'équipe'
      }
    ]
  }
};

// ==========================================
// 🎯 TEMPLATES D'ENTRETIENS
// ==========================================

const INTERVIEW_TEMPLATES = {
  initial: {
    id: 'initial',
    name: 'Entretien Initial',
    category: 'integration',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    duration: 60,
    description: 'Premier entretien d\'accueil',
    questions: [
      'Comment vous sentez-vous pour ce premier jour ?',
      'Qu\'est-ce qui vous a motivé à rejoindre Brain ?',
      'Quels sont vos objectifs personnels ?',
      'Comment préférez-vous apprendre ?',
      'Avez-vous des questions sur l\'organisation ?'
    ]
  },
  weekly: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    category: 'integration',
    icon: CalendarDays,
    color: 'from-green-500 to-emerald-500',
    duration: 30,
    description: 'Point régulier',
    questions: [
      'Quelles compétences avez-vous développées cette semaine ?',
      'Quelles difficultés avez-vous rencontrées ?',
      'Comment vous sentez-vous dans l\'équipe ?',
      'Avez-vous besoin d\'aide sur des points spécifiques ?',
      'Quels sont vos objectifs pour la semaine prochaine ?'
    ]
  },
  milestone: {
    id: 'milestone',
    name: 'Entretien d\'Étape',
    category: 'integration',
    icon: Target,
    color: 'from-purple-500 to-violet-500',
    duration: 45,
    description: 'Validation de phase',
    questions: [
      'Comment évaluez-vous votre progression ?',
      'Quelles sont vos réussites principales ?',
      'Sur quels points devez-vous encore progresser ?',
      'Vous sentez-vous prêt(e) pour la phase suivante ?',
      'Quelles compétences souhaitez-vous développer ?'
    ]
  },
  final: {
    id: 'final',
    name: 'Entretien de Validation',
    category: 'integration',
    icon: Award,
    color: 'from-orange-500 to-red-500',
    duration: 60,
    description: 'Validation finale',
    questions: [
      'Comment jugez-vous votre intégration globale ?',
      'Quelles compétences vous semblent les plus développées ?',
      'Quels aspects aimeriez-vous encore améliorer ?',
      'Avez-vous des suggestions pour le parcours ?',
      'Quelles sont vos aspirations pour les prochains mois ?'
    ]
  },
  gamemaster_mission: {
    id: 'gamemaster_mission',
    name: 'Entretien Mission Game Master',
    category: 'gamemaster',
    icon: Gamepad2,
    color: 'from-cyan-500 to-blue-500',
    duration: 45,
    description: 'Suivi des missions',
    questions: [
      'Comment évaluez-vous vos performances actuelles ?',
      'Quels défis rencontrez-vous en tant que Game Master ?',
      'Comment gérez-vous votre équipe ?',
      'Quelles compétences souhaitez-vous développer ?',
      'Avez-vous des idées pour améliorer nos processus ?'
    ]
  },
  gamemaster_role: {
    id: 'gamemaster_role',
    name: 'Entretien Rôle & Responsabilités',
    category: 'gamemaster',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    duration: 50,
    description: 'Évaluation du rôle',
    questions: [
      'Comment définiriez-vous votre rôle actuel ?',
      'Quelles responsabilités vous motivent le plus ?',
      'Dans quels domaines vous sentez-vous expert ?',
      'Quels sont vos objectifs de développement ?',
      'Quelles nouvelles responsabilités aimeriez-vous prendre ?'
    ]
  }
};

// ==========================================
// 🎨 COMPOSANTS UTILITAIRES
// ==========================================

const PremiumCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

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
// 📄 COMPOSANT PRINCIPAL
// ==========================================

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [userProgress, setUserProgress] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState(null);
  
  // États pour les entretiens
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewingInterview, setViewingInterview] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    referent: '',
    location: 'Bureau Brain',
    type: 'presentiel',
    notes: ''
  });
  const [conductingInterview, setConductingInterview] = useState(null);
  const [interviewResponses, setInterviewResponses] = useState({});

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completedPhases: 0,
    totalPhases: Object.keys(FORMATION_PHASES).length
  });

  // 🛠️ FONCTION D'AUTO-RÉPARATION DES DONNÉES
  const ensureDataIntegrity = (progressData) => {
    console.log('🔧 [AUTO-REPAIR] Vérification intégrité des données...');
    
    let needsRepair = false;
    const repairedData = { ...progressData };

    // Vérifier que toutes les phases existent
    Object.values(FORMATION_PHASES).forEach(phase => {
      if (!repairedData.phases || !repairedData.phases[phase.id]) {
        console.warn(`⚠️ [AUTO-REPAIR] Phase manquante: ${phase.id}`);
        needsRepair = true;
        
        if (!repairedData.phases) {
          repairedData.phases = {};
        }
        
        repairedData.phases[phase.id] = {
          started: true,
          completed: false,
          startedAt: new Date().toISOString(),
          completedAt: null,
          tasks: phase.tasks.map(task => ({
            id: task.id,
            completed: false,
            completedAt: null
          }))
        };
      } else {
        // Vérifier que toutes les tâches existent dans la phase
        const existingTaskIds = repairedData.phases[phase.id].tasks?.map(t => t.id) || [];
        const missingTasks = phase.tasks.filter(t => !existingTaskIds.includes(t.id));
        
        if (missingTasks.length > 0) {
          console.warn(`⚠️ [AUTO-REPAIR] Tâches manquantes dans ${phase.id}:`, missingTasks.map(t => t.id));
          needsRepair = true;
          
          if (!repairedData.phases[phase.id].tasks) {
            repairedData.phases[phase.id].tasks = [];
          }
          
          missingTasks.forEach(task => {
            repairedData.phases[phase.id].tasks.push({
              id: task.id,
              completed: false,
              completedAt: null
            });
          });
        }
      }
    });

    if (needsRepair) {
      console.log('✅ [AUTO-REPAIR] Données réparées automatiquement');
      return { repaired: true, data: repairedData };
    }

    console.log('✅ [AUTO-REPAIR] Données intègres');
    return { repaired: false, data: progressData };
  };

  // Charger la progression avec auto-réparation
  useEffect(() => {
    if (!user?.uid) return;

    const loadProgress = async () => {
      try {
        console.log('📊 [LOAD] Chargement progression pour:', user.uid);
        
        const docRef = doc(db, 'userOnboarding', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('📊 [LOAD] Données brutes chargées:', data);
          
          // Auto-réparation des données
          const { repaired, data: repairedData } = ensureDataIntegrity(data);
          
          if (repaired) {
            console.log('💾 [LOAD] Sauvegarde des données réparées...');
            await setDoc(docRef, repairedData, { merge: true });
          }
          
          setUserProgress(repairedData);
          calculateStats(repairedData);
          
          console.log('✅ [LOAD] Progression chargée avec succès');
        } else {
          console.log('🆕 [LOAD] Aucune progression existante, initialisation...');
          await initializeProgress();
        }

        // Charger les entretiens
        await loadInterviews();
      } catch (error) {
        console.error('❌ [LOAD] Erreur chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Calculer les statistiques
  const calculateStats = (progressData) => {
    console.log('📊 [STATS] Calcul statistiques...');
    
    let totalTasks = 0;
    let completedTasks = 0;
    let completedPhases = 0;

    Object.values(FORMATION_PHASES).forEach(phase => {
      totalTasks += phase.tasks.length;

      if (progressData?.phases?.[phase.id]) {
        const phaseProgress = progressData.phases[phase.id];
        
        // Compter les tâches complétées
        let phaseCompletedTasks = 0;
        phaseProgress.tasks?.forEach(task => {
          if (task.completed) {
            completedTasks++;
            phaseCompletedTasks++;
          }
        });
        
        // ✅ FIX : Une phase est complète si TOUTES ses tâches sont complétées
        const allTasksCompleted = phaseCompletedTasks === phase.tasks.length;
        if (allTasksCompleted || phaseProgress.completed) {
          completedPhases++;
        }
      }
    });

    const newStats = {
      totalTasks,
      completedTasks,
      completedPhases,
      totalPhases: Object.keys(FORMATION_PHASES).length
    };

    console.log('📊 [STATS] Stats calculées:', newStats);
    setStats(newStats);
  };

  // Initialiser la progression
  const initializeProgress = async () => {
    if (!user?.uid) return;

    try {
      console.log('🚀 [INIT] Initialisation progression pour:', user.uid);
      
      const initialProgress = {
        userId: user.uid,
        startedAt: new Date().toISOString(),
        currentPhase: 'decouverte_brain',
        phases: {},
        completedTasks: 0
      };

      Object.values(FORMATION_PHASES).forEach(phase => {
        initialProgress.phases[phase.id] = {
          started: true,
          completed: false,
          startedAt: new Date().toISOString(),
          completedAt: null,
          tasks: phase.tasks.map(task => ({
            id: task.id,
            completed: false,
            completedAt: null
          }))
        };
        
        console.log(`✅ [INIT] Phase ${phase.id} initialisée avec ${phase.tasks.length} tâches`);
      });

      await setDoc(doc(db, 'userOnboarding', user.uid), initialProgress);
      setUserProgress(initialProgress);
      calculateStats(initialProgress);
      
      console.log('✅ [INIT] Progression initialisée avec succès');
    } catch (error) {
      console.error('❌ [INIT] Erreur initialisation:', error);
    }
  };

  // ✅ FONCTION COMPLETETASK AVEC DEBUG COMPLET
  const completeTask = async (phaseId, taskId, event) => {
    // Empêcher la propagation
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('🎯 [CHECKBOX] ========================================');
    console.log('🎯 [CHECKBOX] Tentative complétion tâche');
    console.log('🎯 [CHECKBOX] Phase:', phaseId);
    console.log('🎯 [CHECKBOX] Task:', taskId);
    console.log('🎯 [CHECKBOX] User UID:', user?.uid);
    console.log('🎯 [CHECKBOX] UserProgress exists:', !!userProgress);

    if (!user?.uid) {
      console.error('❌ [CHECKBOX] User UID manquant');
      return;
    }

    if (!userProgress) {
      console.error('❌ [CHECKBOX] UserProgress null');
      return;
    }

    try {
      // Log des données avant modification
      console.log('📋 [CHECKBOX] UserProgress avant:', JSON.stringify(userProgress, null, 2));

      // Créer une copie profonde
      const updatedProgress = JSON.parse(JSON.stringify(userProgress));
      
      console.log('📋 [CHECKBOX] Phases disponibles:', Object.keys(updatedProgress.phases || {}));
      
      const phase = updatedProgress.phases?.[phaseId];
      
      if (!phase) {
        console.error('❌ [CHECKBOX] Phase non trouvée:', phaseId);
        console.error('❌ [CHECKBOX] Phases existantes:', Object.keys(updatedProgress.phases || {}));
        
        // AUTO-RÉPARATION: Réinitialiser les données
        console.log('🔧 [CHECKBOX] Tentative auto-réparation...');
        const { data: repairedData } = ensureDataIntegrity(updatedProgress);
        const progressRef = doc(db, 'userOnboarding', user.uid);
        await setDoc(progressRef, repairedData, { merge: true });
        setUserProgress(repairedData);
        console.log('✅ [CHECKBOX] Données réparées, réessayez');
        return;
      }

      console.log('📋 [CHECKBOX] Tâches dans phase:', phase.tasks?.map(t => t.id));

      const taskIndex = phase.tasks?.findIndex(t => t.id === taskId) ?? -1;
      
      if (taskIndex === -1) {
        console.error('❌ [CHECKBOX] Tâche non trouvée:', taskId);
        console.error('❌ [CHECKBOX] Tâches disponibles:', phase.tasks?.map(t => t.id));
        
        // AUTO-RÉPARATION
        console.log('🔧 [CHECKBOX] Tentative auto-réparation des tâches...');
        const { data: repairedData } = ensureDataIntegrity(updatedProgress);
        const progressRef = doc(db, 'userOnboarding', user.uid);
        await setDoc(progressRef, repairedData, { merge: true });
        setUserProgress(repairedData);
        console.log('✅ [CHECKBOX] Tâches réparées, réessayez');
        return;
      }

      const task = phase.tasks[taskIndex];
      console.log('📋 [CHECKBOX] Tâche trouvée:', task);

      if (task.completed) {
        console.log('⚠️ [CHECKBOX] Tâche déjà complétée');
        return;
      }

      // Marquer comme complétée
      task.completed = true;
      task.completedAt = new Date().toISOString();
      console.log('✅ [CHECKBOX] Tâche marquée complétée');

      // Vérifier si toutes les tâches sont complétées
      const allTasksCompleted = phase.tasks.every(t => t.completed);
      if (allTasksCompleted) {
        phase.completed = true;
        phase.completedAt = new Date().toISOString();
        console.log('🎉 [CHECKBOX] Phase complète:', phaseId);
      }

      // Sauvegarder dans Firebase
      console.log('💾 [CHECKBOX] Sauvegarde dans Firebase...');
      const progressRef = doc(db, 'userOnboarding', user.uid);
      await setDoc(progressRef, updatedProgress, { merge: true });
      
      // Mettre à jour l'état local
      setUserProgress(updatedProgress);
      calculateStats(updatedProgress);
      
      console.log('✅ [CHECKBOX] Complétion réussie !');
      console.log('🎯 [CHECKBOX] ========================================');
    } catch (error) {
      console.error('❌ [CHECKBOX] Erreur:', error);
      console.log('🎯 [CHECKBOX] ========================================');
    }
  };

  // Charger les entretiens
  const loadInterviews = async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, 'interviews'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const loadedInterviews = [];
      snapshot.forEach(doc => {
        loadedInterviews.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📊 [INTERVIEWS] Entretiens chargés:', loadedInterviews.length);
      setInterviews(loadedInterviews);
    } catch (error) {
      console.error('❌ [INTERVIEWS] Erreur chargement:', error);
      setInterviews([]);
    }
  };

  // Planifier un entretien
  const scheduleInterview = async () => {
    if (!user?.uid || !selectedTemplate) return;

    // ✅ VALIDATION : Vérifier que date et heure sont remplies
    if (!interviewForm.date || !interviewForm.time) {
      alert('⚠️ Veuillez renseigner la date et l\'heure de l\'entretien !');
      console.error('❌ [INTERVIEWS] Date ou heure manquante');
      return;
    }

    if (!interviewForm.referent || interviewForm.referent.trim() === '') {
      alert('⚠️ Veuillez renseigner le nom du référent !');
      console.error('❌ [INTERVIEWS] Référent manquant');
      return;
    }

    try {
      console.log('📅 [INTERVIEWS] Création entretien avec date:', interviewForm.date, 'heure:', interviewForm.time);
      
      // Créer la date de manière sûre
      const dateString = `${interviewForm.date}T${interviewForm.time}`;
      const interviewDate = new Date(dateString);
      
      // Vérifier que la date est valide
      if (isNaN(interviewDate.getTime())) {
        alert('⚠️ Date ou heure invalide !');
        console.error('❌ [INTERVIEWS] Date invalide:', dateString);
        return;
      }

      const newInterview = {
        userId: user.uid,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        date: interviewDate.toISOString(),
        referent: interviewForm.referent.trim(),
        location: interviewForm.location,
        type: interviewForm.type,
        notes: interviewForm.notes,
        status: 'planned',
        questions: selectedTemplate.questions,
        responses: {},
        createdAt: new Date().toISOString()
      };

      console.log('💾 [INTERVIEWS] Sauvegarde entretien:', newInterview);
      
      await addDoc(collection(db, 'interviews'), newInterview);
      await loadInterviews();
      setShowInterviewModal(false);
      resetInterviewForm();
      
      console.log('✅ [INTERVIEWS] Entretien planifié avec succès');
      alert('✅ Entretien planifié avec succès !');
    } catch (error) {
      console.error('❌ [INTERVIEWS] Erreur planification:', error);
      alert('❌ Erreur lors de la planification de l\'entretien');
    }
  };

  // Passer un entretien
  const conductInterview = async () => {
    if (!conductingInterview) return;

    try {
      const interviewRef = doc(db, 'interviews', conductingInterview.id);
      
      await updateDoc(interviewRef, {
        responses: interviewResponses,
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      await loadInterviews();
      setConductingInterview(null);
      setInterviewResponses({});
      
      console.log('✅ [INTERVIEWS] Entretien terminé');
    } catch (error) {
      console.error('❌ [INTERVIEWS] Erreur passage:', error);
    }
  };

  const resetInterviewForm = () => {
    setSelectedTemplate(null);
    setInterviewForm({
      date: '',
      time: '',
      referent: '',
      location: 'Bureau Brain',
      type: 'presentiel',
      notes: ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/30 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
            </motion.div>
            <p className="text-gray-400 text-sm sm:text-lg">Chargement de votre progression...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/30 to-purple-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
              >
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                  Formation Brain
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                  Devenez Game Master certifié·e
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-lg sm:rounded-xl">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.completedTasks}/{stats.totalTasks}</p>
                  <p className="text-[10px] sm:text-sm text-gray-400">Tâches</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/30 to-indigo-500/20 rounded-lg sm:rounded-xl">
                  <Target className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-white">{stats.completedPhases}/{stats.totalPhases}</p>
                  <p className="text-[10px] sm:text-sm text-gray-400">Phases</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-lg font-bold text-white">Progression globale</h3>
              <span className="text-lg sm:text-2xl font-bold text-blue-400">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </span>
            </div>
            <div className="h-2.5 sm:h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-1">
            <motion.button
              onClick={() => setActiveTab('formation')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'formation'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              📚 Formation
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('progression')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'progression'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              📊 Stats
            </motion.button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'formation' && (
              <motion.div
                key="formation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                >
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">📋 Liste de Formation</h3>

                  <div className="space-y-2 sm:space-y-4">
                    {Object.values(FORMATION_PHASES).map((phase) => {
                      const phaseProgress = userProgress?.phases?.[phase.id];
                      const completedTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
                      const totalTasks = phase.tasks.length;
                      const isExpanded = expandedPhase === phase.id;

                      return (
                        <div key={phase.id} className="border border-white/10 rounded-xl overflow-hidden">
                          {/* Phase Header */}
                          <button
                            onClick={() => {
                              console.log('📋 [UI] Toggle phase:', phase.id, 'was expanded:', isExpanded);
                              setExpandedPhase(isExpanded ? null : phase.id);
                            }}
                            className="w-full p-3 sm:p-4 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              {isExpanded ? <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /> : <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
                              <span className="text-xl sm:text-2xl">{phase.icon}</span>
                              <div className="text-left">
                                <h4 className="font-bold text-white text-sm sm:text-base">{phase.name}</h4>
                                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">{phase.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-medium text-sm sm:text-base">{completedTasks}/{totalTasks}</div>
                              <div className="text-xs sm:text-sm text-gray-400">{phase.duration}j</div>
                            </div>
                          </button>

                          {/* Phase Tasks */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2 bg-black/20">
                                  {phase.tasks.map((task) => {
                                    const taskProgress = phaseProgress?.tasks?.find(t => t.id === task.id);
                                    const isCompleted = taskProgress?.completed || false;

                                    return (
                                      <div
                                        key={task.id}
                                        className={`p-2.5 sm:p-3 rounded-lg border transition-all ${
                                          isCompleted
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-white/5 border-white/10 hover:border-blue-500/50'
                                        }`}
                                      >
                                        <div className="flex items-start gap-2 sm:gap-3">
                                          {/* Bouton checkbox */}
                                          <motion.button
                                            onClick={(e) => {
                                              console.log('🖱️ [UI] Clic checkbox:', task.id);
                                              completeTask(phase.id, task.id, e);
                                            }}
                                            disabled={isCompleted}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="mt-0.5 cursor-pointer flex-shrink-0"
                                            type="button"
                                          >
                                            {isCompleted ? (
                                              <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                            ) : (
                                              <Square className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-blue-400 transition-colors" />
                                            )}
                                          </motion.button>
                                          <div className="flex-1 min-w-0">
                                            <h5 className={`font-semibold text-xs sm:text-sm ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                                              {task.name}
                                            </h5>
                                            <p className="text-[10px] sm:text-sm text-gray-400 mb-1 sm:mb-2 hidden sm:block">{task.description}</p>
                                            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                {task.estimatedTime}min
                                              </span>
                                              <span className="flex items-center gap-1 truncate">
                                                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                {task.mentor}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
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
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'progression' && (
              <motion.div
                key="progression"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                >
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">📊 Votre Progression</h3>

                  <div className="space-y-4 sm:space-y-6">
                    {Object.values(FORMATION_PHASES).map((phase) => {
                      const phaseProgress = userProgress?.phases?.[phase.id];
                      const completedTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
                      const totalTasks = phase.tasks.length;
                      const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                      return (
                        <div key={phase.id} className="border-b border-white/10 pb-4 sm:pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-xl sm:text-2xl">{phase.icon}</span>
                              <div>
                                <h4 className="font-semibold text-white text-sm sm:text-base">{phase.name}</h4>
                                <p className="text-xs sm:text-sm text-gray-400">
                                  {completedTasks}/{totalTasks} tâches
                                </p>
                              </div>
                            </div>
                            <span className="text-sm sm:text-lg font-bold text-blue-400">
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                          <div className="h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className={`h-full bg-gradient-to-r ${phase.color}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </Layout>
  );
};

export default OnboardingPage;
