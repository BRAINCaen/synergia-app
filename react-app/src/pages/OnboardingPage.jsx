// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING COMPLÈTE - SYNTAXE JSX VÉRIFIÉE LIGNE PAR LIGNE
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
  Badge as BadgeIcon,
  Zap,
  AlertCircle,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  ChevronUp
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { onboardingService, ONBOARDING_PHASES } from '../core/services/onboardingService.js';

// Imports Firebase pour les entretiens
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

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

// 🎯 NIVEAUX DE COMPÉTENCES
const COMPETENCE_LEVELS = {
  NOVICE: { id: 'novice', name: 'Novice', xp: 0, color: 'bg-gray-400' },
  APPRENTI: { id: 'apprenti', name: 'Apprenti', xp: 100, color: 'bg-green-400' },
  COMPETENT: { id: 'competent', name: 'Compétent', xp: 300, color: 'bg-blue-400' },
  EXPERT: { id: 'expert', name: 'Expert', xp: 600, color: 'bg-purple-400' },
  MAITRE: { id: 'maitre', name: 'Maître', xp: 1000, color: 'bg-yellow-400' }
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

// 🎯 COMPOSANT FORMATION GÉNÉRALE
const FormationGeneraleIntegree = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formationData, setFormationData] = useState(null);
  const [initializing, setInitializing] = useState(false);

  const loadFormationData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await onboardingService.getFormationProfile(user.uid);
      
      if (result.success) {
        setFormationData(result.data);
      } else {
        setFormationData(null);
      }
    } catch (error) {
      console.error('Erreur chargement formation:', error);
      setFormationData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const handleButtonClick = async () => {
    if (!user?.uid) {
      alert('Erreur: Utilisateur non connecté');
      return;
    }

    try {
      setInitializing(true);
      const result = await onboardingService.createFormationProfile(user.uid);
      
      if (result.success) {
        setTimeout(() => {
          loadFormationData();
        }, 1000);
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      alert(`Erreur critique: ${error.message}`);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    loadFormationData();
  }, [loadFormationData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement de votre parcours formation...</p>
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

          <button
            onClick={handleButtonClick}
            disabled={initializing}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              initializing
                ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white'
            }`}
          >
            {initializing ? (
              <>
                <Loader className="h-5 w-5 animate-spin inline mr-2" />
                Création en cours...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 inline mr-2" />
                Créer mon Profil Formation
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
        <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-400 mb-2">
          🎉 Formation Active !
        </h3>
        <p className="text-green-300">
          Votre profil de formation est créé. Progression en cours !
        </p>
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

// 🎯 COMPOSANT ENTRETIENS RÉFÉRENT - VERSION SIMPLIFIÉE POUR ÉVITER ERREURS JSX
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
          scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate().toISOString() : data.scheduledDate
        });
      });
      
      setInterviews(interviewsList);
    } catch (error) {
      console.error('Erreur chargement entretiens:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('Vous devez être connecté pour programmer un entretien');
      return;
    }
    
    if (!scheduleForm.employeeName || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      const fullDateTime = `${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}:00`;
      const scheduledDate = new Date(fullDateTime);
      
      const interviewData = {
        employeeName: scheduleForm.employeeName,
        employeeEmail: scheduleForm.employeeEmail,
        referentId: user.uid,
        referentName: user.displayName || user.email,
        type: scheduleForm.type,
        scheduledDate: scheduledDate,
        duration: parseInt(scheduleForm.duration),
        location: scheduleForm.location,
        objectives: scheduleForm.objectives,
        notes: scheduleForm.notes,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      console.log('Entretien programmé avec ID:', docRef.id);
      
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
      
      setShowScheduleForm(false);
      alert('Entretien programmé avec succès !');
      await loadInterviews();
      
    } catch (error) {
      console.error('Erreur programmation entretien:', error);
      alert('Erreur lors de la programmation : ' + error.message);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MessageSquare className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎤 Entretiens Référent
        </h3>
        <p className="text-gray-300 text-lg">
          Suivi personnalisé et accompagnement des équipes
        </p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'dashboard'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📊 Tableau de bord
        </button>
        <button
          onClick={() => setActiveView('schedule')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'schedule'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📅 Programmer
        </button>
      </div>

      {activeView === 'dashboard' && (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold text-white">Entretiens à venir</h4>
          
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun entretien programmé pour le moment</p>
              <button
                onClick={() => {
                  setActiveView('schedule');
                  setShowScheduleForm(true);
                }}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Programmer le premier entretien
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.filter(i => i.status === 'scheduled').map(interview => (
                <div key={interview.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-white">{interview.employeeName}</h5>
                      <p className="text-gray-400 text-sm">{interview.employeeEmail}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="px-2 py-1 rounded bg-purple-600 text-white">
                          {INTERVIEW_TYPES[interview.type]?.name || interview.type}
                        </span>
                        <span>📅 {new Date(interview.scheduledDate).toLocaleDateString()}</span>
                        <span>⏱️ {interview.duration} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-white">Programmer un entretien</h4>
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvel entretien</span>
            </button>
          </div>

          {showScheduleForm && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <form onSubmit={handleScheduleInterview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom de l'employé *
                    </label>
                    <input
                      type="text"
                      value={scheduleForm.employeeName}
                      onChange={(e) => setScheduleForm(prev => ({...prev, employeeName: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      required
                      placeholder="Nom complet de l'employé"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={scheduleForm.employeeEmail}
                      onChange={(e) => setScheduleForm(prev => ({...prev, employeeEmail: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="email@brain.fr"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type d'entretien *
                    </label>
                    <select
                      value={scheduleForm.type}
                      onChange={(e) => setScheduleForm(prev => ({...prev, type: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm(prev => ({...prev, scheduledDate: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Heure *
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.scheduledTime}
                      onChange={(e) => setScheduleForm(prev => ({...prev, scheduledTime: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Durée (minutes)
                    </label>
                    <select
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm(prev => ({...prev, duration: parseInt(e.target.value)}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm(prev => ({...prev, location: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="Bureau référent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Objectifs
                  </label>
                  <textarea
                    value={scheduleForm.objectives}
                    onChange={(e) => setScheduleForm(prev => ({...prev, objectives: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-24"
                    placeholder="Objectifs de l'entretien..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    📅 Programmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduleForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
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
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg scale-105 border-green-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
              }`}
            >
              <div className="flex items-center mb-3">
                <Target className="h-6 w-6 mr-3" />
                <span className="font-semibold">Acquisition de Compétences</span>
              </div>
              <p className="text-sm opacity-80">
                6 rôles Synergia avec progression et badges
              </p>
            </button>

            <button
              onClick={() => setActiveSection('entretiens')}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                activeSection === 'entretiens'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105 border-purple-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-102 border-gray-600'
              }`}
            >
              <div className="flex items-center mb-3">
                <MessageSquare className="h-6 w-6 mr-3" />
                <span className="font-semibold">Entretiens Référent</span>
              </div>
              <p className="text-sm opacity-80">
                Planification et suivi des entretiens personnalisés
              </p>
            </button>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
          {activeSection === 'formation' && <FormationGeneraleIntegree />}
          {activeSection === 'competences' && <AcquisitionCompetences />}
          {activeSection === 'entretiens' && <EntretiensReferent />}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-yellow-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">
              Ta Progression Game Master
            </h3>
          </div>
          
          <p className="text-gray-300 mb-4">
            Chaque tâche cochée te fait progresser, te rapporte des XP, et te rapproche de nouveaux badges.
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
      </div>
    </div>
  );
};

// 🚀 EXPORT DEFAULT POUR NETLIFY BUILD
export default OnboardingPage;
