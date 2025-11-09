// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION COMPLÈTE : Tous les composants inclus
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
  RotateCcw
} from 'lucide-react';

// Firebase imports
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  setDoc,
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
// 🎯 DONNÉES DE FORMATION BRAIN - MIX COMPLET
// ==========================================

const FORMATION_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain',
    description: 'Immersion dans l\'univers et la culture Brain',
    duration: 3,
    color: 'from-blue-500 to-cyan-500',
    icon: '💡',
    order: 1,
    xpTotal: 150,
    badge: 'Bienvenue chez Brain !',
    room: 'Tous les espaces',
    tasks: [
      {
        id: 'accueil_officiel',
        name: 'Accueil officiel et tour des locaux',
        description: 'Participer à ton accueil et découvrir tous les espaces Brain',
        xp: 20,
        required: true,
        estimatedTime: 90,
        room: 'Tous les espaces',
        mentor: 'Responsable RH'
      },
      {
        id: 'charte_histoire',
        name: 'Charte, règlement et histoire Brain',
        description: 'Lire et comprendre l\'ADN, la vision et les valeurs Brain',
        xp: 15,
        required: true,
        estimatedTime: 45,
        room: 'Salle de réunion',
        mentor: 'Direction'
      },
      {
        id: 'equipe_organigramme',
        name: 'Découvrir l\'équipe et l\'organigramme',
        description: 'Rencontrer l\'équipe (photos, rôles, anecdotes) et comprendre qui fait quoi',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Open space',
        mentor: 'Équipe'
      },
      {
        id: 'outils_internes',
        name: 'Outils de communication internes',
        description: 'Configuration messagerie, email, planning, réservations, canaux internes',
        xp: 25,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'IT Manager'
      },
      {
        id: 'presentation_equipe',
        name: 'Te présenter à l\'équipe',
        description: 'Présentation officielle en live ou par message à toute l\'équipe',
        xp: 20,
        required: true,
        estimatedTime: 30,
        room: 'Open space',
        mentor: 'Équipe'
      }
    ]
  },
  
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours Client',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-green-500 to-emerald-500',
    icon: '👥',
    order: 2,
    xpTotal: 180,
    badge: 'Ambassadeur·rice Brain',
    room: 'Salle expérience',
    tasks: [
      {
        id: 'observer_accueil',
        name: 'Observer l\'accueil client',
        description: 'Observer l\'accueil avec un·e Game Master expérimenté·e',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Accueil',
        mentor: 'Game Master senior'
      },
      {
        id: 'observer_briefing',
        name: 'Observer un briefing complet',
        description: 'Observer briefing Escape et Quiz Game en conditions réelles',
        xp: 20,
        required: true,
        estimatedTime: 45,
        room: 'Salle briefing',
        mentor: 'Game Master expert'
      },
      {
        id: 'comprendre_parcours',
        name: 'Comprendre le parcours client type',
        description: 'Maîtriser toutes les étapes : accueil, briefing, jeu, débriefing',
        xp: 25,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Responsable Expérience'
      },
      {
        id: 'accueil_duo',
        name: 'Participer à un accueil en duo',
        description: 'Premier accueil client en binôme avec un·e GM confirmé·e',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Accueil',
        mentor: 'Game Master senior'
      },
      {
        id: 'briefing_roleplay',
        name: 'Briefing fictif en jeu de rôle',
        description: 'Pratiquer un briefing complet en simulation',
        xp: 25,
        required: true,
        estimatedTime: 45,
        room: 'Salle formation',
        mentor: 'Formateur'
      },
      {
        id: 'debriefing_reel',
        name: 'Participer à un débriefing',
        description: 'Observer et participer au débriefing client après session',
        xp: 20,
        required: true,
        estimatedTime: 30,
        room: 'Salle débriefing',
        mentor: 'Game Master'
      },
      {
        id: 'notes_session',
        name: 'Prendre des notes sur session réelle',
        description: 'Observer et noter tous les détails d\'une session complète',
        xp: 20,
        required: false,
        estimatedTime: 90,
        room: 'Régie',
        mentor: 'Game Master'
      }
    ]
  },

  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité & Procédures',
    description: 'Garantir la sécurité et maîtriser les procédures',
    duration: 3,
    color: 'from-red-500 to-orange-500',
    icon: '🔐',
    order: 3,
    xpTotal: 200,
    badge: 'Gardien·ne du Temple',
    room: 'Tous les espaces',
    tasks: [
      {
        id: 'consignes_securite',
        name: 'Consignes de sécurité',
        description: 'Lire et comprendre incendie, évacuation, premiers secours',
        xp: 30,
        required: true,
        estimatedTime: 60,
        room: 'Salle formation',
        mentor: 'Responsable Sécurité'
      },
      {
        id: 'equipements_securite',
        name: 'Repérer les équipements de sécurité',
        description: 'Localiser extincteurs, issues de secours, alarmes',
        xp: 25,
        required: true,
        estimatedTime: 30,
        room: 'Tous les espaces',
        mentor: 'Responsable Sécurité'
      },
      {
        id: 'procedures_urgence',
        name: 'Procédures d\'urgence',
        description: 'Maîtriser coupure courant, alarme, incidents, malaise joueur',
        xp: 35,
        required: true,
        estimatedTime: 90,
        room: 'Salle formation',
        mentor: 'Responsable Ops'
      },
      {
        id: 'outils_techniques',
        name: 'Prise en main outils techniques',
        description: 'Caméras, micros, écrans, effets spéciaux de toutes les salles',
        xp: 40,
        required: true,
        estimatedTime: 120,
        room: 'Salle technique',
        mentor: 'Technicien Senior'
      },
      {
        id: 'reset_complet',
        name: 'Reset complet d\'une salle',
        description: 'Apprendre à réinitialiser complètement chaque salle',
        xp: 30,
        required: true,
        estimatedTime: 90,
        room: 'Salles jeu',
        mentor: 'Game Master expert'
      },
      {
        id: 'gestion_materiel',
        name: 'Gestion du matériel',
        description: 'Cadenas, accessoires, maintenance de base, vérifications',
        xp: 20,
        required: true,
        estimatedTime: 60,
        room: 'Réserve',
        mentor: 'Responsable Maintenance'
      },
      {
        id: 'ouverture_fermeture',
        name: 'Procédure ouverture/fermeture',
        description: 'Réaliser procédure complète sous supervision',
        xp: 20,
        required: false,
        estimatedTime: 120,
        room: 'Tous les espaces',
        mentor: 'Manager'
      }
    ]
  }
};

// ==========================================
// 🏆 BADGES D'ONBOARDING - GAMIFICATION
// ==========================================

const BADGES_ONBOARDING = [
  {
    id: 'bienvenue_brain',
    name: 'Bienvenue chez Brain !',
    description: 'Découverte de Brain complétée',
    icon: '💡',
    rarity: 'common',
    xp: 50
  },
  {
    id: 'ambassadeur_brain',
    name: 'Ambassadeur·rice Brain',
    description: 'Parcours client maîtrisé',
    icon: '👥',
    rarity: 'uncommon',
    xp: 80
  },
  {
    id: 'gardien_temple',
    name: 'Gardien·ne du Temple',
    description: 'Sécurité et procédures validées',
    icon: '🔐',
    rarity: 'rare',
    xp: 100
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
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [userProgress, setUserProgress] = useState({});
  const [availableEntretiens, setAvailableEntretiens] = useState([]);
  const [scheduledEntretiens, setScheduledEntretiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [stats, setStats] = useState({
    totalXP: 0,
    completedTasks: 0,
    currentPhase: null,
    badges: []
  });

  const loadUserProgress = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      console.log('📊 Chargement progression onboarding:', user.uid);

      const progressDoc = await getDoc(doc(db, 'userOnboarding', user.uid));
      
      if (progressDoc.exists()) {
        const progressData = progressDoc.data();
        setUserProgress(progressData);
        
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
        await initializeOnboardingProfile();
      }

      console.log('✅ Données onboarding chargées');

    } catch (error) {
      console.error('❌ Erreur chargement onboarding:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const resetOnboardingProfile = async () => {
    if (!user?.uid) return;
    
    const confirm = window.confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser votre progression ? Toutes les tâches complétées seront perdues.');
    if (!confirm) return;

    try {
      setResetting(true);
      console.log('🔄 Réinitialisation complète du profil onboarding');

      await deleteDoc(doc(db, 'userOnboarding', user.uid));
      await initializeOnboardingProfile();
      
      console.log('✅ Profil réinitialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur réinitialisation:', error);
      alert('Erreur lors de la réinitialisation. Vérifiez la console.');
    } finally {
      setResetting(false);
    }
  };

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

      Object.values(FORMATION_PHASES).forEach(phase => {
        initialProgress.phases[phase.id] = {
          started: true,
          completed: false,
          startedAt: new Date().toISOString(),
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

  const completeTask = async (phaseId, taskId) => {
    if (!user?.uid) return;

    try {
      console.log('✅ Tentative complétion tâche:', { phaseId, taskId });

      const progressRef = doc(db, 'userOnboarding', user.uid);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        console.log('⚠️ Document n\'existe pas, initialisation...');
        await initializeOnboardingProfile();
        return;
      }

      const currentProgress = progressDoc.data();
      const updatedPhases = { ...currentProgress.phases };
      const phase = updatedPhases[phaseId];
      
      if (!phase) {
        console.error('❌ Phase non trouvée:', phaseId);
        return;
      }

      const task = phase.tasks.find(t => t.id === taskId);

      if (!task) {
        console.error('❌ Tâche non trouvée:', taskId);
        alert(`Erreur : La tâche "${taskId}" n'existe pas. Cliquez sur "Réinitialiser" pour corriger.`);
        return;
      }

      if (task.completed) {
        console.log('⚠️ Tâche déjà complétée');
        return;
      }

      task.completed = true;
      task.completedAt = new Date().toISOString();

      const allTasksCompleted = phase.tasks.every(t => t.completed);
      if (allTasksCompleted) {
        phase.completed = true;
        phase.completedAt = new Date().toISOString();
      }

      await updateDoc(progressRef, {
        phases: updatedPhases
      });

      await loadUserProgress();

      console.log('✅ Tâche complétée avec succès');

    } catch (error) {
      console.error('❌ Erreur complétion tâche:', error);
    }
  };

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

      await loadUserProgress();

      console.log('✅ Entretien planifié');

    } catch (error) {
      console.error('❌ Erreur planification:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadUserProgress();
    }
  }, [isAuthenticated, user?.uid, loadUserProgress]);

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
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Ton Parcours Game Master
              </h1>
              <p className="text-gray-400">Ton intégration personnalisée chez Brain Escape & Quiz Game</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadUserProgress}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <button
                onClick={resetOnboardingProfile}
                disabled={resetting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
              </button>
            </div>
          </div>

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
// 🎓 ONGLET FORMATION
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

        return (
          <PremiumCard key={phase.id} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${phase.color} opacity-5`} />
            
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

                      {!isTaskCompleted && (
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

      <PremiumCard>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Badges Obtenus
        </h3>
        
        {stats.badges.length === 0 ? (
          <p className="text-gray-400">Aucun badge obtenu pour le moment. Continue ta progression !</p>
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
