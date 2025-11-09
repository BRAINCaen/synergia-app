// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION CORRIGÉE : Checkboxes + Compte-rendu 100% fonctionnels
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
// 🎯 TEMPLATES D'ENTRETIENS COMPLETS
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

  // Charger la progression
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
          await initializeProgress();
        }

        // Charger les entretiens
        await loadInterviews();
      } catch (error) {
        console.error('❌ Erreur chargement:', error);
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
    let completedPhases = 0;

    Object.values(FORMATION_PHASES).forEach(phase => {
      totalTasks += phase.tasks.length;

      if (progressData?.phases?.[phase.id]) {
        const phaseProgress = progressData.phases[phase.id];
        if (phaseProgress.completed) {
          completedPhases++;
        }
        phaseProgress.tasks?.forEach(task => {
          if (task.completed) {
            completedTasks++;
          }
        });
      }
    });

    setStats({
      totalTasks,
      completedTasks,
      completedPhases,
      totalPhases: Object.keys(FORMATION_PHASES).length
    });
  };

  // Initialiser la progression
  const initializeProgress = async () => {
    if (!user?.uid) return;

    try {
      console.log('🚀 Initialisation progression pour:', user.uid);
      
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
      });

      await setDoc(doc(db, 'userOnboarding', user.uid), initialProgress);
      setUserProgress(initialProgress);
      calculateStats(initialProgress);
      
      console.log('✅ Progression initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
    }
  };

  // ✅ FIX CHECKBOX : Compléter une tâche - VERSION 100% FONCTIONNELLE
  const completeTask = async (phaseId, taskId, event) => {
    // 🔥 CRITIQUE : Empêcher la propagation pour éviter le conflit avec le bouton parent
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!user?.uid || !userProgress) return;

    try {
      console.log('✅ [CHECKBOX] Complétion tâche:', { phaseId, taskId });

      // Créer une copie profonde des données
      const updatedProgress = JSON.parse(JSON.stringify(userProgress));
      const phase = updatedProgress.phases[phaseId];
      
      if (!phase) {
        console.error('❌ Phase non trouvée:', phaseId);
        return;
      }

      const taskIndex = phase.tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) {
        console.error('❌ Tâche non trouvée:', taskId);
        return;
      }

      const task = phase.tasks[taskIndex];

      if (task.completed) {
        console.log('⚠️ Tâche déjà complétée');
        return;
      }

      // Marquer la tâche comme complétée
      task.completed = true;
      task.completedAt = new Date().toISOString();

      // Vérifier si toutes les tâches de la phase sont complétées
      const allTasksCompleted = phase.tasks.every(t => t.completed);
      if (allTasksCompleted) {
        phase.completed = true;
        phase.completedAt = new Date().toISOString();
        console.log('🎉 Phase complète:', phaseId);
      }

      // Sauvegarder dans Firebase
      const progressRef = doc(db, 'userOnboarding', user.uid);
      await setDoc(progressRef, updatedProgress, { merge: true });
      
      // Mettre à jour l'état local immédiatement
      setUserProgress(updatedProgress);
      calculateStats(updatedProgress);
      
      console.log('✅ [CHECKBOX] Tâche complétée avec succès');
    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
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
      
      console.log('📊 Entretiens chargés:', loadedInterviews.length);
      setInterviews(loadedInterviews);
    } catch (error) {
      console.error('❌ Erreur chargement entretiens:', error);
      setInterviews([]);
    }
  };

  // Planifier un entretien
  const scheduleInterview = async () => {
    if (!user?.uid || !selectedTemplate) return;

    try {
      const newInterview = {
        userId: user.uid,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        date: new Date(`${interviewForm.date}T${interviewForm.time}`).toISOString(),
        referent: interviewForm.referent,
        location: interviewForm.location,
        type: interviewForm.type,
        notes: interviewForm.notes,
        status: 'planned',
        questions: selectedTemplate.questions,
        responses: {},
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'interviews'), newInterview);
      await loadInterviews();
      setShowInterviewModal(false);
      resetInterviewForm();
      
      console.log('✅ Entretien planifié');
    } catch (error) {
      console.error('❌ Erreur planification:', error);
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
      
      console.log('✅ Entretien terminé et sauvegardé');
    } catch (error) {
      console.error('❌ Erreur passage entretien:', error);
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
        <div className="flex items-center justify-center h-screen">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500" />
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            icon={CheckCircle} 
            label="Tâches complétées" 
            value={`${stats.completedTasks}/${stats.totalTasks}`}
            color="green"
          />
          <StatCard 
            icon={Target} 
            label="Phases complétées" 
            value={`${stats.completedPhases}/${stats.totalPhases}`}
            color="blue"
          />
          <StatCard 
            icon={Calendar} 
            label="Entretiens" 
            value={interviews.length}
            color="purple"
          />
        </div>

        {/* Progress Bar */}
        <PremiumCard className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Progression globale</h3>
            <span className="text-2xl font-bold text-blue-400">
              {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
            </span>
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
        </PremiumCard>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('formation')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'formation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400'
            }`}
          >
            📚 Formation
          </button>
          <button
            onClick={() => setActiveTab('entretiens')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'entretiens'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400'
            }`}
          >
            💬 Entretiens
          </button>
          <button
            onClick={() => setActiveTab('progression')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'progression'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400'
            }`}
          >
            📊 Progression
          </button>
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
              <PremiumCard>
                <h3 className="text-2xl font-bold text-white mb-6">📋 Liste de Formation</h3>
                
                <div className="space-y-4">
                  {Object.values(FORMATION_PHASES).map((phase) => {
                    const phaseProgress = userProgress?.phases?.[phase.id];
                    const completedTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
                    const totalTasks = phase.tasks.length;
                    const isExpanded = expandedPhase === phase.id;

                    return (
                      <div key={phase.id} className="border border-gray-700/50 rounded-lg overflow-hidden">
                        {/* Phase Header */}
                        <button
                          onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                          className="w-full p-4 bg-gray-800/50 hover:bg-gray-800/70 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                            <span className="text-2xl">{phase.icon}</span>
                            <div className="text-left">
                              <h4 className="font-bold text-white">{phase.name}</h4>
                              <p className="text-sm text-gray-400">{phase.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{completedTasks}/{totalTasks}</div>
                            <div className="text-sm text-gray-400">{phase.duration} jours</div>
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
                              <div className="p-4 space-y-2 bg-gray-900/50">
                                {phase.tasks.map((task) => {
                                  const taskProgress = phaseProgress?.tasks?.find(t => t.id === task.id);
                                  const isCompleted = taskProgress?.completed || false;

                                  return (
                                    <div
                                      key={task.id}
                                      className={`p-3 rounded-lg border transition-all ${
                                        isCompleted
                                          ? 'bg-green-500/10 border-green-500/30'
                                          : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        {/* ✅ FIX : Bouton checkbox standalone avec stopPropagation */}
                                        <button
                                          onClick={(e) => completeTask(phase.id, task.id, e)}
                                          disabled={isCompleted}
                                          className="mt-1 cursor-pointer flex-shrink-0"
                                          type="button"
                                        >
                                          {isCompleted ? (
                                            <CheckSquare className="h-5 w-5 text-green-400" />
                                          ) : (
                                            <Square className="h-5 w-5 text-gray-400 hover:text-blue-400 transition-colors" />
                                          )}
                                        </button>
                                        <div className="flex-1">
                                          <h5 className={`font-semibold ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                                            {task.name}
                                          </h5>
                                          <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                                          <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {task.estimatedTime} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <User className="h-3 w-3" />
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
              </PremiumCard>
            </motion.div>
          )}

          {activeTab === 'entretiens' && (
            <motion.div
              key="entretiens"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PremiumCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">💬 Mes Entretiens</h3>
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Planifier
                  </button>
                </div>

                {/* Liste des entretiens */}
                <div className="space-y-4">
                  {interviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">
                      Aucun entretien planifié. Commencez par planifier votre premier entretien !
                    </p>
                  ) : (
                    interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white">{interview.templateName}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            interview.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : interview.status === 'planned'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {interview.status === 'completed' ? 'Terminé' : 
                             interview.status === 'planned' ? 'Planifié' : 'En attente'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(interview.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {interview.referent}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {interview.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {interview.type === 'presentiel' ? 'Présentiel' : 'Visio'}
                          </div>
                        </div>
                        {interview.status === 'planned' && (
                          <button
                            onClick={() => {
                              console.log('🎯 Passage entretien:', interview.id);
                              setConductingInterview(interview);
                            }}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Passer l'entretien
                          </button>
                        )}
                        {interview.status === 'completed' && (
                          <button
                            onClick={() => {
                              console.log('👁️ Voir compte-rendu:', interview.id);
                              console.log('📋 Données entretien:', interview);
                              setViewingInterview(interview);
                            }}
                            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Voir le compte-rendu
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </PremiumCard>
            </motion.div>
          )}

          {activeTab === 'progression' && (
            <motion.div
              key="progression"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PremiumCard>
                <h3 className="text-2xl font-bold text-white mb-6">📊 Votre Progression</h3>
                
                <div className="space-y-6">
                  {Object.values(FORMATION_PHASES).map((phase) => {
                    const phaseProgress = userProgress?.phases?.[phase.id];
                    const completedTasks = phaseProgress?.tasks?.filter(t => t.completed).length || 0;
                    const totalTasks = phase.tasks.length;
                    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                    return (
                      <div key={phase.id} className="border-b border-gray-700/50 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{phase.icon}</span>
                            <div>
                              <h4 className="font-semibold text-white">{phase.name}</h4>
                              <p className="text-sm text-gray-400">
                                {completedTasks}/{totalTasks} tâches
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
        </AnimatePresence>

        {/* Modal Planification Entretien */}
        {showInterviewModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Planifier un entretien</h3>
                <button
                  onClick={() => {
                    setShowInterviewModal(false);
                    resetInterviewForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              {!selectedTemplate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(INTERVIEW_TEMPLATES).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <template.icon className="h-6 w-6 text-blue-400" />
                        <h4 className="font-bold text-white">{template.name}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {template.duration} min
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-bold text-white mb-2">{selectedTemplate.name}</h4>
                    <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                      <input
                        type="date"
                        value={interviewForm.date}
                        onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Heure</label>
                      <input
                        type="time"
                        value={interviewForm.time}
                        onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Référent</label>
                    <input
                      type="text"
                      value={interviewForm.referent}
                      onChange={(e) => setInterviewForm({...interviewForm, referent: e.target.value})}
                      placeholder="Nom du référent"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                      <select
                        value={interviewForm.type}
                        onChange={(e) => setInterviewForm({...interviewForm, type: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="presentiel">Présentiel</option>
                        <option value="visio">Visioconférence</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Lieu</label>
                      <input
                        type="text"
                        value={interviewForm.location}
                        onChange={(e) => setInterviewForm({...interviewForm, location: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                    <textarea
                      value={interviewForm.notes}
                      onChange={(e) => setInterviewForm({...interviewForm, notes: e.target.value})}
                      rows={3}
                      placeholder="Notes complémentaires..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      Retour
                    </button>
                    <button
                      onClick={scheduleInterview}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Planifier
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Passage Entretien */}
        {conductingInterview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{conductingInterview.templateName}</h3>
                <button
                  onClick={() => {
                    setConductingInterview(null);
                    setInterviewResponses({});
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(conductingInterview.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="h-4 w-4" />
                      {conductingInterview.referent}
                    </div>
                  </div>
                </div>

                {conductingInterview.questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-white font-medium">
                      {index + 1}. {question}
                    </label>
                    <textarea
                      value={interviewResponses[`question_${index}`] || ''}
                      onChange={(e) => setInterviewResponses({
                        ...interviewResponses,
                        [`question_${index}`]: e.target.value
                      })}
                      rows={3}
                      placeholder="Votre réponse..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                ))}

                <button
                  onClick={conductInterview}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Enregistrer l'entretien
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ FIX COMPTE-RENDU : Modal Voir Compte-Rendu - VERSION CORRIGÉE */}
        {viewingInterview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">📄 Compte-rendu d'entretien</h3>
                <button
                  onClick={() => {
                    console.log('❌ Fermeture modal compte-rendu');
                    setViewingInterview(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="font-bold text-white mb-3">{viewingInterview.templateName}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(viewingInterview.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="h-4 w-4" />
                      {viewingInterview.referent}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {viewingInterview.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-4 w-4" />
                      Terminé le {viewingInterview.completedAt ? new Date(viewingInterview.completedAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-white text-lg">Réponses :</h4>
                  {/* ✅ FIX : Vérifier que questions existe et utiliser le bon mapping */}
                  {viewingInterview.questions && viewingInterview.questions.length > 0 ? (
                    viewingInterview.questions.map((question, index) => {
                      const responseKey = `question_${index}`;
                      const response = viewingInterview.responses?.[responseKey] || 'Pas de réponse';
                      
                      return (
                        <div key={index} className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <p className="text-white font-medium mb-2">
                            {index + 1}. {question}
                          </p>
                          <p className="text-gray-300 pl-4">
                            {response}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-center py-4">
                      Aucune question trouvée pour cet entretien
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setViewingInterview(null)}
                  className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default OnboardingPage;
