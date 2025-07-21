// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING COMPLÈTE - FORMATION GAME MASTER BRAIN
// ==========================================

import React, { useState, useCallback, useEffect } from 'react';
import { 
  BookOpen,
  Target,
  MessageSquare,
  Users,
  Trophy,
  Calendar,
  Star,
  CheckCircle,
  Clock,
  Award,
  RefreshCw,
  Play,
  Loader,
  Bug,
  XCircle,
  CheckCircle2,
  Building,
  Heart,
  Key,
  Coffee,
  Lightbulb,
  UserCheck,
  Eye,
  FileText,
  Shield,
  Gamepad2,
  Settings,
  Wrench,
  Sparkles,
  Circle,
  ChevronRight,
  ChevronDown,
  Plus,
  Pause,
  RotateCcw,
  Zap,
  AlertCircle,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  ChevronUp,
  Camera,
  Mail,
  Phone,
  MapPin,
  Send
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

// Imports Firebase pour les entretiens
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 PHASES D'INTÉGRATION BRAIN ESCAPE & QUIZ GAME
const ONBOARDING_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain & de l\'équipe',
    description: 'Première immersion dans l\'univers Brain',
    duration: 2,
    color: 'from-purple-500 to-pink-500',
    icon: '💡',
    order: 1,
    xpTotal: 50,
    badge: 'Bienvenue chez Brain !'
  },
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours client·e & expérience joueur·euse',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-blue-500 to-cyan-500',
    icon: '👥',
    order: 2,
    xpTotal: 80,
    badge: 'Ambassadeur·rice Brain'
  },
  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité, matériel & procédures',
    description: 'Sécurité et gestion du matériel',
    duration: 3,
    color: 'from-orange-500 to-red-500',
    icon: '🔐',
    order: 3,
    xpTotal: 100,
    badge: 'Gardien·ne du Temple'
  },
  FORMATION_EXPERIENCE: {
    id: 'formation_experience',
    name: '🔎 Formation par expérience',
    description: 'Maîtrise des Escape Games et Quiz Games',
    duration: 12,
    color: 'from-green-500 to-emerald-500',
    icon: '🔎',
    order: 4,
    xpTotal: 120,
    badge: 'Expert·e [Salle/Jeu]'
  },
  TACHES_QUOTIDIEN: {
    id: 'taches_quotidien',
    name: '🛠️ Tâches du quotidien & gestion',
    description: 'Autonomie dans les tâches quotidiennes',
    duration: 5,
    color: 'from-cyan-500 to-blue-500',
    icon: '🛠️',
    order: 5,
    xpTotal: 90,
    badge: 'Pilier du Quotidien'
  },
  SOFT_SKILLS: {
    id: 'soft_skills',
    name: '🌱 Soft Skills & communication',
    description: 'Développement des compétences humaines',
    duration: 7,
    color: 'from-pink-500 to-rose-500',
    icon: '🌱',
    order: 6,
    xpTotal: 70,
    badge: 'Esprit Brain'
  },
  VALIDATION_FINALE: {
    id: 'validation_finale',
    name: '🚩 Validation finale & intégration',
    description: 'Certification Game Master Brain',
    duration: 2,
    color: 'from-violet-500 to-purple-500',
    icon: '🚩',
    order: 7,
    xpTotal: 200,
    badge: 'Game Master certifié·e Brain'
  }
};

// 🎯 TÂCHES PAR PHASE
const PHASE_TASKS = {
  decouverte_brain: [
    {
      id: 'visite_locaux',
      name: 'Visite guidée des locaux et présentation de l\'équipe',
      description: 'Tour complet des espaces Brain avec présentation personnalisée de chaque membre de l\'équipe',
      icon: Building,
      xp: 10,
      required: true,
      estimatedTime: 90
    },
    {
      id: 'comprendre_valeurs',
      name: 'Comprendre les valeurs et la culture d\'entreprise',
      description: 'Découverte de l\'ADN Brain, notre vision, nos valeurs et notre façon de travailler ensemble',
      icon: Heart,
      xp: 10,
      required: true,
      estimatedTime: 60
    }
  ],
  parcours_client: [
    {
      id: 'accueil_client',
      name: 'Maîtriser l\'accueil client de A à Z',
      description: 'Techniques d\'accueil, première impression et gestion de l\'arrivée des groupes',
      icon: Users,
      xp: 15,
      required: true,
      estimatedTime: 120
    }
  ]
};

// 🎯 RÔLES SYNERGIA POUR LES COMPÉTENCES
const SYNERGIA_ROLES = {
  GAME_MASTER: {
    id: 'game_master',
    name: 'Game Master',
    icon: '🎮',
    color: 'from-purple-500 to-purple-600',
    description: 'Animation des sessions et expérience client',
    competences: [
      'Animation de sessions',
      'Gestion des groupes',
      'Techniques de game mastering',
      'Improvisation et créativité',
      'Communication client'
    ]
  },
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Entretien & Maintenance',
    icon: '🔧',
    color: 'from-orange-500 to-orange-600',
    description: 'Responsable de la maintenance et des réparations',
    competences: [
      'Maintenance préventive',
      'Réparations techniques',
      'Gestion des équipements',
      'Sécurité et normes',
      'Diagnostic de pannes'
    ]
  },
  REPUTATION: {
    id: 'reputation',
    name: 'Gestion Réputation',
    icon: '⭐',
    color: 'from-yellow-500 to-yellow-600',
    description: 'Gestion de l\'image et des retours clients',
    competences: [
      'Gestion des avis clients',
      'Communication digitale',
      'Résolution de conflits',
      'Stratégie de réputation',
      'Analyse des feedbacks'
    ]
  },
  STOCK: {
    id: 'stock',
    name: 'Gestion Stocks',
    icon: '📦',
    color: 'from-blue-500 to-blue-600',
    description: 'Gestion des inventaires et approvisionnements',
    competences: [
      'Gestion des inventaires',
      'Approvisionnement',
      'Organisation des stocks',
      'Suivi des commandes',
      'Optimisation logistique'
    ]
  },
  ORGANIZATION: {
    id: 'organization',
    name: 'Organisation Interne',
    icon: '📋',
    color: 'from-purple-500 to-purple-600',
    description: 'Coordination et organisation des équipes',
    competences: [
      'Planification des équipes',
      'Coordination des tâches',
      'Gestion des horaires',
      'Optimisation des processus',
      'Communication interne'
    ]
  },
  CONTENT: {
    id: 'content',
    name: 'Création Contenu',
    icon: '🎨',
    color: 'from-pink-500 to-pink-600',
    description: 'Création de contenu visuel et communication',
    competences: [
      'Création graphique',
      'Rédaction de contenu',
      'Photographie',
      'Réseaux sociaux',
      'Marketing digital'
    ]
  }
};

// 🎯 TYPES D'ENTRETIENS
const INTERVIEW_TYPES = {
  initial: { 
    name: 'Entretien Initial', 
    icon: '🚀', 
    color: 'from-blue-500 to-blue-600',
    duration: 60,
    description: 'Premier entretien d\'accueil et présentation'
  },
  weekly: { 
    name: 'Suivi Hebdomadaire', 
    icon: '📅', 
    color: 'from-green-500 to-green-600',
    duration: 30,
    description: 'Point régulier sur l\'avancement'
  },
  milestone: { 
    name: 'Bilan d\'Étape', 
    icon: '🎯', 
    color: 'from-purple-500 to-purple-600',
    duration: 45,
    description: 'Validation des compétences acquises'
  },
  final: { 
    name: 'Entretien Final', 
    icon: '🏆', 
    color: 'from-yellow-500 to-yellow-600',
    duration: 60,
    description: 'Bilan complet et certification'
  },
  support: { 
    name: 'Entretien de Soutien', 
    icon: '🤝', 
    color: 'from-red-500 to-red-600',
    duration: 30,
    description: 'Accompagnement en cas de difficulté'
  }
};

// 🎯 SERVICE D'ONBOARDING SIMPLE
class OnboardingService {
  constructor() {
    this.FORMATION_COLLECTION = 'onboardingFormation';
    this.INTERVIEWS_COLLECTION = 'onboardingInterviews';
  }

  async createFormationProfile(userId) {
    try {
      console.log('🚀 Création profil formation pour userId:', userId);
      
      if (!userId || !db) {
        return { success: false, error: 'Paramètres manquants' };
      }

      const formationProfile = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startDate: new Date().toISOString(),
        completionDate: null,
        currentPhase: 'decouverte_brain',
        phases: {},
        interviews: [],
        earnedBadges: [],
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          totalXP: 0,
          earnedXP: 0,
          completionRate: 0,
          averageTaskTime: 0
        }
      };

      // Initialiser toutes les phases
      Object.keys(ONBOARDING_PHASES).forEach(phaseKey => {
        const phase = ONBOARDING_PHASES[phaseKey];
        formationProfile.phases[phase.id] = {
          id: phase.id,
          name: phase.name,
          status: phase.order === 1 ? 'active' : 'locked',
          startDate: phase.order === 1 ? new Date().toISOString() : null,
          completionDate: null,
          progress: 0,
          tasks: [],
          earnedXP: 0,
          badge: null
        };
      });

      const docRef = doc(db, this.FORMATION_COLLECTION, userId);
      await setDoc(docRef, formationProfile);

      console.log('✅ Profil de formation créé avec succès');
      return { success: true, data: formationProfile };

    } catch (error) {
      console.error('❌ Erreur création profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  async getFormationProfile(userId) {
    try {
      if (!userId || !db) {
        return { success: false, error: 'Paramètres manquants' };
      }

      const docRef = doc(db, this.FORMATION_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: 'Profil non trouvé' };
      }
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return { success: false, error: error.message };
    }
  }

  async testFirebaseConnection() {
    try {
      if (!db) {
        return { success: false, error: 'Firebase non initialisé' };
      }

      const testRef = collection(db, 'test');
      return { success: true, message: 'Firebase OK' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const onboardingService = new OnboardingService();

// 🎯 COMPOSANT FORMATION GÉNÉRALE
const FormationGeneraleInterface = () => {
  const { user } = useAuthStore();
  const [formationData, setFormationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebugLog = (message, type = 'info') => {
    const logEntry = {
      timestamp: new Date(),
      message,
      type
    };
    setDebugLogs(prev => [...prev.slice(-9), logEntry]);
    console.log(`[DEBUG] ${message}`);
  };

  const loadFormationData = useCallback(async () => {
    if (!user?.uid) {
      addDebugLog('❌ Utilisateur non connecté');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      addDebugLog(`🔍 Chargement profil pour: ${user.uid}`);

      const result = await onboardingService.getFormationProfile(user.uid);
      addDebugLog(`📊 Résultat: ${result.success ? 'Succès' : result.error}`);

      if (result.success) {
        setFormationData(result.data);
        addDebugLog('✅ Données de formation chargées', 'success');
      } else {
        setFormationData(null);
        addDebugLog(`⚠️ Profil non trouvé: ${result.error}`);
      }
    } catch (error) {
      addDebugLog(`❌ Erreur chargement: ${error.message}`, 'error');
      setFormationData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const handleCreateProfile = async () => {
    if (!user?.uid) {
      alert('Utilisateur non connecté');
      return;
    }

    try {
      setInitializing(true);
      addDebugLog('🧪 Test connexion Firebase...');

      const testResult = await onboardingService.testFirebaseConnection();
      addDebugLog(`🧪 Test Firebase: ${testResult.success ? 'OK' : 'FAILED - ' + testResult.error}`);

      if (!testResult.success) {
        alert(`Erreur Firebase: ${testResult.error}`);
        return;
      }

      addDebugLog('🔧 Création profil formation...');
      const result = await onboardingService.createFormationProfile(user.uid);
      addDebugLog(`🔧 Création result: ${result.success ? 'SUCCESS' : result.error}`);

      if (result.success) {
        addDebugLog('🎉 SUCCÈS ! Profil créé', 'success');
        alert('Profil de formation créé avec succès !');

        setTimeout(() => {
          addDebugLog('🔄 Rechargement des données...');
          loadFormationData();
        }, 1000);
      } else {
        addDebugLog(`❌ ÉCHEC création: ${result.error}`, 'error');
        alert(`Échec: ${result.error}`);
      }
    } catch (error) {
      addDebugLog(`💥 ERREUR CRITIQUE: ${error.message}`, 'error');
      alert(`Erreur critique: ${error.message}`);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    addDebugLog('🏗️ Composant monté, chargement initial...');
    loadFormationData();
  }, [loadFormationData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement de votre parcours formation...</p>
          <p className="text-xs text-gray-500 mt-2">User: {user?.uid || 'Non connecté'}</p>
        </div>
      </div>
    );
  }

  if (!formationData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Commencez votre Formation Brain !
          </h3>
          <p className="text-gray-400 mb-8">
            Créez votre profil de formation personnalisé pour commencer votre parcours Game Master.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleCreateProfile}
              disabled={initializing}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 border-2 ${
                initializing
                  ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-105'
              }`}
            >
              {initializing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin inline mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 inline mr-2" />
                  🚀 Créer mon Profil Formation
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-gray-500 text-xs hover:text-gray-400"
              >
                {showDebug ? 'Masquer' : 'Afficher'} Debug Panel
              </button>
            </div>
          </div>
        </div>

        {showDebug && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <Bug className="h-4 w-4 mr-2" />
              Debug Panel
            </h4>

            <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-xs text-gray-400">Auth Status</div>
                <div className={`text-sm font-medium ${user?.uid ? 'text-green-400' : 'text-red-400'}`}>
                  {user?.uid ? '✅ Connected' : '❌ Not Connected'}
                </div>
                <div className="text-xs text-gray-500">{user?.uid || 'No UID'}</div>
              </div>

              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-xs text-gray-400">Service Status</div>
                <div className={`text-sm font-medium ${onboardingService ? 'text-green-400' : 'text-red-400'}`}>
                  {onboardingService ? '✅ Available' : '❌ Missing'}
                </div>
                <div className="text-xs text-gray-500">OnboardingService</div>
              </div>

              <div className="bg-gray-800/50 rounded p-3">
                <div className="text-xs text-gray-400">Formation Data</div>
                <div className={`text-sm font-medium ${formationData ? 'text-green-400' : 'text-yellow-400'}`}>
                  {formationData ? '✅ Loaded' : '⚠️ None'}
                </div>
                <div className="text-xs text-gray-500">Profile Status</div>
              </div>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun log pour le moment...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <div 
                    key={index}
                    className={`text-xs p-2 rounded font-mono ${
                      log.type === 'error' ? 'bg-red-900/30 text-red-300' :
                      log.type === 'success' ? 'bg-green-900/30 text-green-300' :
                      'bg-gray-800/30 text-gray-300'
                    }`}
                  >
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Environment: {import.meta.env.MODE || 'unknown'}</p>
          <p>React: {React.version}</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    );
  }

  // Si on a des données de formation
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          🧠 Formation Générale Brain
        </h2>
        <p className="text-gray-400 mb-6">
          Votre formation a été créée avec succès !
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-blue-400 font-semibold">🎯 Objectif</div>
            <div className="text-gray-300">Devenir rapidement autonome</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-green-400 font-semibold">🚀 Résultat</div>
            <div className="text-gray-300">Épanoui·e et reconnu·e</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-purple-400 font-semibold">🤝 Support</div>
            <div className="text-gray-300">Aide disponible à chaque étape</div>
          </div>
        </div>
        
        <div className="mt-4 text-purple-300 font-medium">
          💪 Tu fais partie de l'équipe dès maintenant !
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={loadFormationData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Actualiser
        </button>
      </div>

      {/* Affichage des phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(ONBOARDING_PHASES).map(phase => (
          <div key={phase.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${phase.color} flex items-center justify-center text-2xl mb-4`}>
              {phase.icon}
            </div>
            <h4 className="font-semibold text-white mb-2">{phase.name}</h4>
            <p className="text-gray-400 text-sm mb-4">{phase.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{phase.duration} jours</span>
              <span className="text-blue-400">{phase.xpTotal} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🎯 COMPOSANT ACQUISITION DE COMPÉTENCES
const AcquisitionCompetences = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎮 Acquisition de Compétences
        </h3>
        <p className="text-gray-300 text-lg">
          Développez votre expertise dans les 6 rôles clés de Brain
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(SYNERGIA_ROLES).map(role => (
          <div key={role.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center text-lg mr-3`}>
                {role.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{role.name}</h4>
              </div>
            </div>
            <p className="text-gray-400 text-sm">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🎯 COMPOSANT ENTRETIENS RÉFÉRENT
const EntretiensReferent = () => {
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    employeeName: '',
    employeeEmail: '',
    type: 'initial',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    location: 'Bureau référent',
    objectives: '',
    notes: ''
  });

  const loadInterviews = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('referentId', '==', user.uid),
        orderBy('scheduledDate', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(interviewsQuery);
      const interviewsList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interviewsList.push({
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate() : new Date(data.scheduledDate)
        });
      });
      
      setInterviews(interviewsList);
      console.log('✅ Entretiens chargés:', interviewsList.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement entretiens:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const interviewData = {
        ...scheduleForm,
        referentId: user.uid,
        referentName: user.displayName || user.email,
        scheduledDate: serverTimestamp(),
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'interviews'), interviewData);
      
      alert('Entretien programmé avec succès !');
      setShowScheduleForm(false);
      setScheduleForm({
        employeeName: '',
        employeeEmail: '',
        type: 'initial',
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        location: 'Bureau référent',
        objectives: '',
        notes: ''
      });
      
      loadInterviews();
      
    } catch (error) {
      console.error('❌ Erreur programmation entretien:', error);
      alert('Erreur lors de la programmation de l\'entretien');
    }
  };

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MessageSquare className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎯 Entretiens avec Référent
        </h3>
        <p className="text-gray-300 text-lg">
          Suivi personnalisé de votre intégration
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'dashboard'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📊 Dashboard
        </button>
        
        <button
          onClick={() => setActiveView('schedule')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'schedule'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📅 Planifier
        </button>
        
        <button
          onClick={() => setActiveView('history')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'history'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📋 Historique
        </button>
      </div>

      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
            <div key={key} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center text-2xl mb-4`}>
                {type.icon}
              </div>
              <h4 className="font-semibold text-white mb-2">{type.name}</h4>
              <p className="text-gray-400 text-sm mb-4">{type.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{type.duration} min</span>
                <button 
                  onClick={() => {
                    setScheduleForm({...scheduleForm, type: key});
                    setShowScheduleForm(true);
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Planifier →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'schedule' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
            <h4 className="text-xl font-semibold text-white mb-6">Planifier un entretien</h4>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l'employé·e
                  </label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.employeeName}
                    onChange={(e) => setScheduleForm({...scheduleForm, employeeName: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Prénom Nom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={scheduleForm.employeeEmail}
                    onChange={(e) => setScheduleForm({...scheduleForm, employeeEmail: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type d'entretien
                </label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.icon} {type.name} ({type.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée (min)
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="15"
                    max="120"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Bureau référent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Objectifs de l'entretien
                </label>
                <textarea
                  value={scheduleForm.objectives}
                  onChange={(e) => setScheduleForm({...scheduleForm, objectives: e.target.value})}
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Points à aborder, compétences à évaluer..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Planifier l'entretien
                </button>
                
                <button
                  type="button"
                  onClick={() => setScheduleForm({
                    employeeName: '',
                    employeeEmail: '',
                    type: 'initial',
                    scheduledDate: '',
                    scheduledTime: '',
                    duration: 30,
                    location: 'Bureau référent',
                    objectives: '',
                    notes: ''
                  })}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
          <h4 className="text-xl font-semibold text-white mb-6">Historique des entretiens</h4>
          
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400">Chargement des entretiens...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun entretien programmé pour le moment</p>
              <button
                onClick={() => setActiveView('schedule')}
                className="mt-4 text-blue-400 hover:text-blue-300"
              >
                Planifier votre premier entretien →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map(interview => (
                <div key={interview.id} className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${INTERVIEW_TYPES[interview.type]?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-sm mr-3`}>
                        {INTERVIEW_TYPES[interview.type]?.icon || '📅'}
                      </div>
                      <div>
                        <h5 className="font-semibold text-white">{interview.employeeName}</h5>
                        <p className="text-gray-400 text-sm">{INTERVIEW_TYPES[interview.type]?.name || interview.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{interview.scheduledDate.toLocaleDateString()}</p>
                      <p className="text-gray-400 text-xs">{interview.status || 'Programmé'}</p>
                    </div>
                  </div>
                  
                  {interview.objectives && (
                    <div className="bg-gray-800/50 rounded p-3 text-sm">
                      <p className="text-gray-300">{interview.objectives}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 🎯 COMPOSANT PRINCIPAL ONBOARDING
const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('formation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🎯 Intégration Game Master
          </h1>
          <p className="text-gray-300 text-lg">
            Votre parcours personnalisé pour devenir autonome et épanoui·e chez Brain
          </p>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <button
              onClick={() => setActiveSection('formation')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                activeSection === 'formation'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 border-blue-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
              }`}
            >
              <div className="flex items-center mb-3">
                <BookOpen className="h-6 w-6 mr-3" />
                <span className="font-semibold">Formation Générale</span>
              </div>
              <p className="text-sm opacity-80">
                7 phases complètes avec 38 tâches détaillées
              </p>
            </button>

            <button
              onClick={() => setActiveSection('competences')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                activeSection === 'competences'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg scale-105 border-green-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
              }`}
            >
              <div className="flex items-center mb-3">
                <Target className="h-6 w-6 mr-3" />
                <span className="font-semibold">Acquisition Compétences</span>
              </div>
              <p className="text-sm opacity-80">
                6 rôles Game Master avec compétences spécifiques
              </p>
            </button>

            <button
              onClick={() => setActiveSection('entretiens')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                activeSection === 'entretiens'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105 border-purple-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
              }`}
            >
              <div className="flex items-center mb-3">
                <MessageSquare className="h-6 w-6 mr-3" />
                <span className="font-semibold">Entretiens Référent</span>
              </div>
              <p className="text-sm opacity-80">
                5 types d'entretiens personnalisés avec suivi
              </p>
            </button>
          </div>
        </div>

        {/* Contenu des sections */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
          {activeSection === 'formation' && <FormationGeneraleInterface />}
          {activeSection === 'competences' && <AcquisitionCompetences />}
          {activeSection === 'entretiens' && <EntretiensReferent />}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
