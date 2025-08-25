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
import { db } from '../firebase.config.js';

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
        description: 'Discussions individuelles avec chaque collaborateur',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Open Space',
        mentor: 'Chaque membre'
      },
      {
        id: 'decouverte_outils',
        name: 'Découverte des outils',
        description: 'Formation à Synergia et aux systèmes internes',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Poste de travail',
        mentor: 'IT Manager'
      }
    ]
  },

  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours Client & Expérience Joueur',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-green-500 to-emerald-500',
    icon: '👥',
    order: 2,
    xpTotal: 150,
    badge: 'Ambassadeur Client',
    room: 'Salle d\'expérience',
    tasks: [
      {
        id: 'accueil_client',
        name: 'Techniques d\'accueil client',
        description: 'Maîtriser l\'art de l\'accueil et de la première impression',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Hall d\'accueil',
        mentor: 'Chef d\'équipe'
      },
      {
        id: 'parcours_immersif',
        name: 'Comprendre l\'expérience immersive',
        description: 'Découvrir les mécaniques d\'immersion et d\'engagement',
        xp: 40,
        required: true,
        estimatedTime: 180,
        room: 'Salle d\'escape game',
        mentor: 'Game Master Senior'
      },
      {
        id: 'gestion_groupes',
        name: 'Gestion des groupes et dynamiques',
        description: 'Techniques de gestion de groupe et animation',
        xp: 40,
        required: true,
        estimatedTime: 150,
        room: 'Salle de briefing',
        mentor: 'Animateur expérimenté'
      },
      {
        id: 'scenarios_complexes',
        name: 'Gérer les scénarios complexes',
        description: 'Situations difficiles et résolution de problèmes',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Salle de simulation',
        mentor: 'Manager'
      }
    ]
  },

  MAITRISE_TECHNIQUE: {
    id: 'maitrise_technique',
    name: '🔧 Maîtrise Technique',
    description: 'Compétences techniques et maintenance',
    duration: 4,
    color: 'from-purple-500 to-violet-500',
    icon: '🔧',
    order: 3,
    xpTotal: 120,
    badge: 'Expert Technique',
    room: 'Atelier technique',
    tasks: [
      {
        id: 'systemes_audio_video',
        name: 'Systèmes audio-vidéo',
        description: 'Maîtrise des équipements audiovisuels et troubleshooting',
        xp: 30,
        required: true,
        estimatedTime: 180,
        room: 'Régie technique',
        mentor: 'Technicien'
      },
      {
        id: 'electronique_base',
        name: 'Électronique et capteurs',
        description: 'Comprendre les systèmes électroniques et capteurs',
        xp: 30,
        required: true,
        estimatedTime: 120,
        room: 'Labo électronique',
        mentor: 'Ingénieur'
      },
      {
        id: 'maintenance_preventive',
        name: 'Maintenance préventive',
        description: 'Protocoles de maintenance et vérifications quotidiennes',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salles de jeu',
        mentor: 'Responsable maintenance'
      },
      {
        id: 'depannage_urgence',
        name: 'Dépannage d\'urgence',
        description: 'Résolution rapide des pannes en cours de partie',
        xp: 30,
        required: false,
        estimatedTime: 60,
        room: 'Toutes les salles',
        mentor: 'Expert technique'
      }
    ]
  },

  EXPERTISE_GAME_MASTER: {
    id: 'expertise_gamemaster',
    name: '🎮 Expertise Game Master',
    description: 'Devenir un Game Master expert',
    duration: 6,
    color: 'from-orange-500 to-red-500',
    icon: '🎮',
    order: 4,
    xpTotal: 200,
    badge: 'Game Master Expert',
    room: 'Toutes les salles',
    tasks: [
      {
        id: 'maitrise_scenarios',
        name: 'Maîtrise de tous les scénarios',
        description: 'Connaître parfaitement chaque escape game proposé',
        xp: 50,
        required: true,
        estimatedTime: 300,
        room: 'Chaque salle de jeu',
        mentor: 'Game Master Principal'
      },
      {
        id: 'indices_progressifs',
        name: 'Gestion des indices progressifs',
        description: 'Art de donner les bons indices au bon moment',
        xp: 40,
        required: true,
        estimatedTime: 180,
        room: 'Salle d\'observation',
        mentor: 'Formateur GM'
      },
      {
        id: 'animation_avancee',
        name: 'Techniques d\'animation avancées',
        description: 'Créer une expérience mémorable et engageante',
        xp: 50,
        required: true,
        estimatedTime: 240,
        room: 'Salle de formation',
        mentor: 'Expert en animation'
      },
      {
        id: 'personnalisation_experience',
        name: 'Personnalisation de l\'expérience',
        description: 'Adapter l\'expérience selon le type de groupe',
        xp: 60,
        required: true,
        estimatedTime: 200,
        room: 'Toutes les salles',
        mentor: 'Directeur créatif'
      }
    ]
  },

  LEADERSHIP_EQUIPE: {
    id: 'leadership_equipe',
    name: '👑 Leadership & Gestion d\'Équipe',
    description: 'Développement des compétences de leader',
    duration: 4,
    color: 'from-yellow-500 to-orange-500',
    icon: '👑',
    order: 5,
    xpTotal: 180,
    badge: 'Leader d\'Équipe',
    room: 'Salle de management',
    tasks: [
      {
        id: 'formation_nouveaux',
        name: 'Formation des nouveaux collaborateurs',
        description: 'Transmettre son savoir et accompagner les novices',
        xp: 50,
        required: true,
        estimatedTime: 240,
        room: 'Salle de formation',
        mentor: 'Responsable RH'
      },
      {
        id: 'gestion_conflits',
        name: 'Gestion des conflits',
        description: 'Résoudre les tensions et maintenir la cohésion',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Bureau privé',
        mentor: 'Psychologue d\'entreprise'
      },
      {
        id: 'planification_avancee',
        name: 'Planification et organisation',
        description: 'Optimiser les plannings et la répartition des tâches',
        xp: 40,
        required: true,
        estimatedTime: 90,
        room: 'Bureau de planning',
        mentor: 'Operations Manager'
      },
      {
        id: 'innovation_processus',
        name: 'Innovation et amélioration continue',
        description: 'Proposer et implémenter des améliorations',
        xp: 50,
        required: false,
        estimatedTime: 180,
        room: 'Salle créative',
        mentor: 'Directeur innovation'
      }
    ]
  },

  CERTIFICATION_FINALE: {
    id: 'certification_finale',
    name: '🏆 Certification Finale',
    description: 'Validation complète et intégration officielle',
    duration: 2,
    color: 'from-gold-500 to-yellow-500',
    icon: '🏆',
    order: 6,
    xpTotal: 150,
    badge: 'Game Master Certifié Brain',
    room: 'Salle de certification',
    tasks: [
      {
        id: 'evaluation_complete',
        name: 'Évaluation complète des compétences',
        description: 'Test pratique sur l\'ensemble des compétences acquises',
        xp: 50,
        required: true,
        estimatedTime: 240,
        room: 'Centre d\'évaluation',
        mentor: 'Jury d\'experts'
      },
      {
        id: 'entretien_final',
        name: 'Entretien final avec la direction',
        description: 'Bilan complet, feedback et objectifs futurs',
        xp: 50,
        required: true,
        estimatedTime: 90,
        room: 'Bureau direction',
        mentor: 'Équipe dirigeante'
      },
      {
        id: 'presentation_equipe',
        name: 'Présentation officielle',
        description: 'Présentation des compétences et intégration officielle',
        xp: 50,
        required: true,
        estimatedTime: 60,
        room: 'Auditorium',
        mentor: 'Toute l\'équipe'
      }
    ]
  }
};

// ==========================================
// 🎭 TEMPLATES D'ENTRETIENS COMPLETS
// ==========================================

const INTERVIEW_TEMPLATES = {
  // ENTRETIENS D'INTÉGRATION
  initial: {
    id: 'initial',
    name: 'Entretien Initial',
    category: 'integration',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    duration: 60,
    description: 'Premier entretien d\'accueil et présentation',
    objectives: [
      'Accueillir et mettre à l\'aise',
      'Présenter l\'entreprise et sa culture',
      'Définir les objectifs de formation',
      'Identifier les attentes et motivations',
      'Planifier le parcours personnalisé'
    ]
  },
  weekly: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    category: 'integration',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    duration: 30,
    description: 'Point régulier sur les progrès et difficultés'
  },
  milestone: {
    id: 'milestone',
    name: 'Entretien d\'Étape',
    category: 'integration',
    icon: Target,
    color: 'from-purple-500 to-violet-500',
    duration: 45,
    description: 'Validation de fin de phase et passage à l\'étape suivante'
  },
  final: {
    id: 'final',
    name: 'Entretien de Validation',
    category: 'integration',
    icon: Award,
    color: 'from-orange-500 to-red-500',
    duration: 60,
    description: 'Entretien final de validation de l\'intégration'
  },
  
  // ENTRETIENS GAME MASTER
  gamemaster_mission: {
    id: 'gamemaster_mission',
    name: 'Entretien Mission Game Master',
    category: 'gamemaster',
    icon: Gamepad2,
    color: 'from-cyan-500 to-blue-500',
    duration: 45,
    description: 'Suivi des missions et projets en tant que Game Master'
  },
  gamemaster_performance: {
    id: 'gamemaster_performance',
    name: 'Évaluation Performance',
    category: 'gamemaster',
    icon: TrendingUp,
    color: 'from-emerald-500 to-green-500',
    duration: 60,
    description: 'Évaluation des performances et feedback clients'
  },
  gamemaster_evolution: {
    id: 'gamemaster_evolution',
    name: 'Entretien d\'Évolution',
    category: 'gamemaster',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    duration: 90,
    description: 'Planification de carrière et développement professionnel'
  }
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL
// ==========================================

const OnboardingPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [activeTab, setActiveTab] = useState('formation');
  const [userProgress, setUserProgress] = useState({});
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États formation
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  
  // États entretiens
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewFilter, setInterviewFilter] = useState('all');

  // ✅ CHARGEMENT DES DONNÉES
  useEffect(() => {
    if (user?.uid) {
      loadUserProgress();
      loadInterviews();
    }
  }, [user?.uid]);

  const loadUserProgress = async () => {
    try {
      const progressDoc = await getDoc(doc(db, 'onboardingProgress', user.uid));
      if (progressDoc.exists()) {
        const data = progressDoc.data();
        setUserProgress(data.phases || {});
        setCompletedTasks(data.completedTasks || {});
      }
    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
    }
  };

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('participantId', '==', user.uid),
        orderBy('scheduledAt', 'desc')
      );
      
      const snapshot = await getDocs(interviewsQuery);
      const interviewData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: doc.data().scheduledAt?.toDate?.() || new Date(),
        completedAt: doc.data().completedAt?.toDate?.() || null
      }));
      
      setInterviews(interviewData);
    } catch (error) {
      console.error('❌ Erreur chargement entretiens:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ GESTION DES TÂCHES
  const handleTaskToggle = async (phaseId, taskId) => {
    try {
      const taskKey = `${phaseId}_${taskId}`;
      const newCompletedTasks = {
        ...completedTasks,
        [taskKey]: !completedTasks[taskKey]
      };
      
      // Calculer la progression de la phase
      const phase = FORMATION_PHASES[phaseId];
      const completedCount = phase.tasks.filter(task => 
        newCompletedTasks[`${phaseId}_${task.id}`]
      ).length;
      const progression = Math.round((completedCount / phase.tasks.length) * 100);
      
      // Sauvegarder en Firebase
      await updateDoc(doc(db, 'onboardingProgress', user.uid), {
        completedTasks: newCompletedTasks,
        [`phases.${phaseId}`]: {
          progression,
          completedCount,
          totalTasks: phase.tasks.length,
          lastUpdated: serverTimestamp()
        },
        lastActivity: serverTimestamp()
      });
      
      setCompletedTasks(newCompletedTasks);
      setUserProgress(prev => ({
        ...prev,
        [phaseId]: {
          progression,
          completedCount,
          totalTasks: phase.tasks.length
        }
      }));
      
      // XP et gamification si tâche complétée
      if (!completedTasks[taskKey] && newCompletedTasks[taskKey]) {
        const task = phase.tasks.find(t => t.id === taskId);
        if (task?.xp && window.gamificationService) {
          await window.gamificationService.addExperience(
            user.uid,
            task.xp,
            `Tâche complétée: ${task.name}`,
            { source: 'onboarding', taskId, phaseId }
          );
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
    }
  };

  // ✅ GESTION DES ENTRETIENS
  const handleScheduleInterview = async (templateId) => {
    try {
      const template = INTERVIEW_TEMPLATES[templateId];
      
      await addDoc(collection(db, 'interviews'), {
        participantId: user.uid,
        participantName: user.displayName || user.email,
        templateId,
        title: template.name,
        description: template.description,
        category: template.category,
        duration: template.duration,
        status: 'scheduled',
        scheduledAt: serverTimestamp(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      
      loadInterviews();
    } catch (error) {
      console.error('❌ Erreur planification entretien:', error);
    }
  };

  // ✅ STATISTIQUES
  const getOverallStats = () => {
    const phases = Object.values(FORMATION_PHASES);
    const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
    const completedCount = Object.values(completedTasks).filter(Boolean).length;
    const totalXP = phases.reduce((sum, phase) => sum + phase.xpTotal, 0);
    const earnedXP = phases.reduce((sum, phase) => {
      const phaseProgress = userProgress[phase.id];
      if (!phaseProgress) return sum;
      return sum + Math.round((phaseProgress.progression / 100) * phase.xpTotal);
    }, 0);
    
    return {
      totalTasks,
      completedCount,
      completion: Math.round((completedCount / totalTasks) * 100),
      totalXP,
      earnedXP,
      interviewsCount: interviews.length,
      completedInterviews: interviews.filter(i => i.status === 'completed').length
    };
  };

  const stats = getOverallStats();
  
  const headerStats = [
    { label: "Progression", value: `${stats.completion}%`, icon: Target, color: "text-blue-400" },
    { label: "XP Gagnés", value: `${stats.earnedXP}/${stats.totalXP}`, icon: Zap, color: "text-yellow-400" },
    { label: "Tâches", value: `${stats.completedCount}/${stats.totalTasks}`, icon: CheckCircle, color: "text-green-400" },
    { label: "Entretiens", value: `${stats.completedInterviews}/${stats.interviewsCount}`, icon: MessageSquare, color: "text-purple-400" }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={Plus}
        onClick={() => setShowInterviewModal(true)}
      >
        Nouvel Entretien
      </PremiumButton>
      <PremiumButton variant="primary" icon={Play}>
        Continuer
      </PremiumButton>
    </div>
  );

  // ✅ INTERFACE DE CHARGEMENT
  if (loading) {
    return (
      <PremiumLayout
        title="Intégration"
        subtitle="Chargement..."
        icon={BookOpen}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white">Chargement de votre progression...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Intégration"
      subtitle="Votre parcours de formation Brain"
      icon={BookOpen}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Onglets de navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
        {[
          { id: 'formation', label: 'Formation par Salle', icon: BookOpen },
          { id: 'entretiens', label: 'Entretiens', icon: MessageSquare },
          { id: 'progression', label: 'Ma Progression', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
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
            <FormationParSalle 
              phases={FORMATION_PHASES}
              userProgress={userProgress}
              completedTasks={completedTasks}
              onTaskToggle={handleTaskToggle}
              selectedPhase={selectedPhase}
              setSelectedPhase={setSelectedPhase}
            />
          </motion.div>
        )}

        {activeTab === 'entretiens' && (
          <motion.div
            key="entretiens"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SystemeEntretiens
              interviews={interviews}
              templates={INTERVIEW_TEMPLATES}
              onScheduleInterview={handleScheduleInterview}
              onReloadInterviews={loadInterviews}
              filter={interviewFilter}
              setFilter={setInterviewFilter}
            />
          </motion.div>
        )}

        {activeTab === 'progression' && (
          <motion.div
            key="progression"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProgressionGlobale
              phases={FORMATION_PHASES}
              userProgress={userProgress}
              interviews={interviews}
              stats={stats}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal planification entretien */}
      {showInterviewModal && (
        <InterviewModal
          templates={INTERVIEW_TEMPLATES}
          onClose={() => setShowInterviewModal(false)}
          onSchedule={handleScheduleInterview}
        />
      )}
    </PremiumLayout>
  );
};

// ==========================================
// 🎯 COMPOSANT FORMATION PAR SALLE
// ==========================================

const FormationParSalle = ({ 
  phases, 
  userProgress, 
  completedTasks, 
  onTaskToggle, 
  selectedPhase, 
  setSelectedPhase 
}) => {
  const phasesList = Object.values(phases).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble des phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {phasesList.map(phase => {
          const progress = userProgress[phase.id] || { progression: 0, completedCount: 0 };
          
          return (
            <motion.div
              key={phase.id}
              layoutId={`phase-${phase.id}`}
              onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
              className="cursor-pointer group"
            >
              <PremiumCard className="h-full hover:border-purple-500/50 transition-all">
                <div className={`bg-gradient-to-br ${phase.color} rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="text-2xl">{phase.icon}</div>
                    <div className="text-right">
                      <div className="text-sm opacity-80">Phase {phase.order}</div>
                      <div className="font-semibold">{progress.progression}%</div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-white font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                  {phase.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{phase.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progression</span>
                    <span className="text-white">{progress.completedCount}/{phase.tasks.length}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${phase.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${progress.progression}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">📍 {phase.room}</span>
                    <span className="text-gray-500">⚡ {phase.xpTotal} XP</span>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          );
        })}
      </div>

      {/* Détail de la phase sélectionnée */}
      <AnimatePresence>
        {selectedPhase && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <PhaseDetailView
              phase={phases[selectedPhase]}
              completedTasks={completedTasks}
              onTaskToggle={onTaskToggle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 🎯 COMPOSANT DÉTAIL DE PHASE
// ==========================================

const PhaseDetailView = ({ phase, completedTasks, onTaskToggle }) => {
  return (
    <PremiumCard>
      <div className={`bg-gradient-to-br ${phase.color} rounded-lg p-6 mb-6`}>
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold mb-2">{phase.name}</h2>
            <p className="opacity-90">{phase.description}</p>
          </div>
          <div className="text-4xl">{phase.icon}</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-white">
          <div className="text-center">
            <div className="text-lg font-semibold">{phase.duration} jours</div>
            <div className="text-sm opacity-80">Durée</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{phase.xpTotal} XP</div>
            <div className="text-sm opacity-80">Récompense</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{phase.room}</div>
            <div className="text-sm opacity-80">Lieu</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{phase.badge}</div>
            <div className="text-sm opacity-80">Badge</div>
          </div>
        </div>
      </div>

      {/* Liste des tâches avec checklist */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold mb-4">📋 Checklist de Formation</h3>
        
        {phase.tasks.map(task => {
          const taskKey = `${phase.id}_${task.id}`;
          const isCompleted = completedTasks[taskKey];
          
          return (
            <motion.div
              key={task.id}
              layout
              className={`border rounded-lg p-4 transition-all ${
                isCompleted 
                  ? 'border-green-500/50 bg-green-900/10' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onTaskToggle(phase.id, task.id)}
                  className={`mt-1 p-1 rounded transition-colors ${
                    isCompleted
                      ? 'text-green-400 hover:text-green-300'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${
                      isCompleted ? 'text-green-400 line-through' : 'text-white'
                    }`}>
                      {task.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm">
                      {task.required && (
                        <span className="text-red-400 text-xs">REQUIS</span>
                      )}
                      <span className="text-yellow-400">⚡ {task.xp} XP</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(task.estimatedTime / 60)}h {task.estimatedTime % 60}min
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
              </div>
            </motion.div>
          );
        })}
      </div>
    </PremiumCard>
  );
};

// ==========================================
// 🎯 COMPOSANT SYSTÈME ENTRETIENS
// ==========================================

const SystemeEntretiens = ({ 
  interviews, 
  templates, 
  onScheduleInterview, 
  onReloadInterviews,
  filter,
  setFilter 
}) => {
  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    if (filter === 'integration') return interview.category === 'integration';
    if (filter === 'gamemaster') return interview.category === 'gamemaster';
    if (filter === 'completed') return interview.status === 'completed';
    if (filter === 'pending') return interview.status !== 'completed';
    return true;
  });

  const stats = {
    total: interviews.length,
    completed: interviews.filter(i => i.status === 'completed').length,
    integration: interviews.filter(i => i.category === 'integration').length,
    gamemaster: interviews.filter(i => i.category === 'gamemaster').length
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-400' },
          { label: 'Terminés', value: stats.completed, color: 'text-green-400' },
          { label: 'Intégration', value: stats.integration, color: 'text-purple-400' },
          { label: 'Game Master', value: stats.gamemaster, color: 'text-orange-400' }
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'integration', label: 'Intégration' },
          { id: 'gamemaster', label: 'Game Master' },
          { id: 'completed', label: 'Terminés' },
          { id: 'pending', label: 'En cours' }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              filter === filterOption.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Templates d'entretiens disponibles */}
      <PremiumCard>
        <h3 className="text-white font-semibold mb-4">📝 Types d'Entretiens Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(templates).map(template => (
            <div
              key={template.id}
              className="border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all cursor-pointer"
              onClick={() => onScheduleInterview(template.id)}
            >
              <div className={`bg-gradient-to-br ${template.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                <template.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">{template.name}</h4>
              <p className="text-gray-400 text-sm mb-2">{template.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded text-xs ${
                  template.category === 'integration' 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'bg-orange-600/20 text-orange-400'
                }`}>
                  {template.category === 'integration' ? 'Intégration' : 'Game Master'}
                </span>
                <span className="text-gray-500">{template.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* Historique des entretiens */}
      <PremiumCard>
        <h3 className="text-white font-semibold mb-4">📅 Historique des Entretiens</h3>
        
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucun entretien trouvé pour ce filtre</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map(interview => {
              const template = templates[interview.templateId];
              
              return (
                <div
                  key={interview.id}
                  className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {template && (
                        <div className={`bg-gradient-to-br ${template.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                          <template.icon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-medium">{interview.title}</h4>
                        <p className="text-gray-400 text-sm">{interview.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        interview.status === 'completed'
                          ? 'bg-green-600/20 text-green-400'
                          : interview.status === 'scheduled'
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {interview.status === 'completed' ? 'Terminé' :
                         interview.status === 'scheduled' ? 'Planifié' : 'En attente'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>🕐 {interview.duration} min</span>
                      <span>📅 {interview.scheduledAt.toLocaleDateString()}</span>
                      {interview.completedAt && (
                        <span>✅ {interview.completedAt.toLocaleDateString()}</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      interview.category === 'integration' 
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'bg-orange-600/20 text-orange-400'
                    }`}>
                      {interview.category === 'integration' ? 'Intégration' : 'Game Master'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PremiumCard>
    </div>
  );
};

// ==========================================
// 🎯 COMPOSANT PROGRESSION GLOBALE
// ==========================================

const ProgressionGlobale = ({ phases, userProgress, interviews, stats }) => {
  const phasesList = Object.values(phases).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Résumé général */}
      <PremiumCard>
        <h3 className="text-white font-semibold mb-6">📊 Vue d'Ensemble</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.completion}%</div>
            <div className="text-gray-400">Progression</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.earnedXP}</div>
            <div className="text-gray-400">XP Gagnés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{stats.completedCount}</div>
            <div className="text-gray-400">Tâches Complétées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{stats.completedInterviews}</div>
            <div className="text-gray-400">Entretiens Terminés</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Progression Globale</span>
            <span className="text-white">{stats.completion}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${stats.completion}%` }}
            />
          </div>
        </div>
      </PremiumCard>

      {/* Détail par phase */}
      <PremiumCard>
        <h3 className="text-white font-semibold mb-6">🎯 Progression par Phase</h3>
        
        <div className="space-y-4">
          {phasesList.map(phase => {
            const progress = userProgress[phase.id] || { progression: 0, completedCount: 0 };
            const earnedXP = Math.round((progress.progression / 100) * phase.xpTotal);
            
            return (
              <div key={phase.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{phase.icon}</div>
                    <div>
                      <h4 className="text-white font-medium">{phase.name}</h4>
                      <p className="text-gray-400 text-sm">{phase.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold">{progress.progression}%</div>
                    <div className="text-sm text-gray-400">{earnedXP}/{phase.xpTotal} XP</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${phase.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${progress.progression}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                  <span>{progress.completedCount}/{phase.tasks.length} tâches</span>
                  <span>📍 {phase.room}</span>
                </div>
              </div>
            );
          })}
        </div>
      </PremiumCard>

      {/* Badges et réalisations */}
      <PremiumCard>
        <h3 className="text-white font-semibold mb-6">🏆 Badges et Réalisations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {phasesList.map(phase => {
            const progress = userProgress[phase.id] || { progression: 0 };
            const isCompleted = progress.progression >= 100;
            
            return (
              <div
                key={phase.id}
                className={`border rounded-lg p-4 text-center transition-all ${
                  isCompleted 
                    ? 'border-yellow-500/50 bg-yellow-900/10' 
                    : 'border-gray-700'
                }`}
              >
                <div className={`text-4xl mb-2 ${isCompleted ? '' : 'grayscale opacity-50'}`}>
                  {phase.icon}
                </div>
                <h4 className={`font-medium mb-1 ${
                  isCompleted ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {phase.badge}
                </h4>
                <p className="text-gray-500 text-sm">{phase.name}</p>
                
                {isCompleted && (
                  <div className="mt-2">
                    <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">
                      Débloqué
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PremiumCard>
    </div>
  );
};

// ==========================================
// 🎯 COMPOSANT MODAL ENTRETIEN
// ==========================================

const InterviewModal = ({ templates, onClose, onSchedule }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">📅 Planifier un Entretien</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(templates).map(template => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                onSchedule(template.id);
                onClose();
              }}
              className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-all"
            >
              <div className={`bg-gradient-to-br ${template.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                <template.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-white font-medium mb-2">{template.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs ${
                  template.category === 'integration' 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'bg-orange-600/20 text-orange-400'
                }`}>
                  {template.category === 'integration' ? 'Intégration' : 'Game Master'}
                </span>
                <span className="text-gray-500 text-sm">{template.duration} min</span>
              </div>
              
              {template.objectives && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">Objectifs:</p>
                  <ul className="text-gray-500 text-xs space-y-1">
                    {template.objectives.slice(0, 2).map((objective, idx) => (
                      <li key={idx}>• {objective}</li>
                    ))}
                    {template.objectives.length > 2 && (
                      <li>• Et {template.objectives.length - 2} autres...</li>
                    )}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
