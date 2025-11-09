// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// CORRECTION FINALE : Ajout bouton reset + meilleure gestion des IDs
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
// 🎯 DONNÉES DE FORMATION BRAIN - MÊME CODE QU'AVANT
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
  
  // ... (GARDER TOUTES LES AUTRES PHASES IDENTIQUES)
  // Je ne les réécris pas pour gagner de la place, mais elles restent exactement pareilles
};

// [... GARDER TOUT LE CODE DES AUTRES PHASES ET BADGES ...]

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
  const [resetting, setResetting] = useState(false);
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
        await initializeOnboardingProfile();
      }

      // Charger entretiens...
      console.log('✅ Données onboarding chargées');

    } catch (error) {
      console.error('❌ Erreur chargement onboarding:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // ✅ NOUVELLE FONCTION : Réinitialiser complètement
  const resetOnboardingProfile = async () => {
    if (!user?.uid) return;
    
    const confirm = window.confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser votre progression ? Toutes les tâches complétées seront perdues.');
    if (!confirm) return;

    try {
      setResetting(true);
      console.log('🔄 Réinitialisation complète du profil onboarding');

      // Supprimer l'ancien document
      await deleteDoc(doc(db, 'userOnboarding', user.uid));
      
      // Recréer un nouveau profil propre
      await initializeOnboardingProfile();
      
      console.log('✅ Profil réinitialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur réinitialisation:', error);
      alert('Erreur lors de la réinitialisation. Vérifiez la console.');
    } finally {
      setResetting(false);
    }
  };

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

  // Compléter une tâche
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
        console.log('📋 Phases disponibles:', Object.keys(updatedPhases));
        return;
      }

      console.log('📋 Tâches dans la phase:', phase.tasks.map(t => t.id));
      
      const task = phase.tasks.find(t => t.id === taskId);

      if (!task) {
        console.error('❌ Tâche non trouvée:', taskId);
        console.log('📋 IDs de tâches disponibles:', phase.tasks.map(t => t.id));
        alert(`Erreur : La tâche "${taskId}" n'existe pas dans cette phase. Cliquez sur le bouton "Réinitialiser" pour corriger.`);
        return;
      }

      if (task.completed) {
        console.log('⚠️ Tâche déjà complétée');
        return;
      }

      // Marquer la tâche comme complétée
      task.completed = true;
      task.completedAt = new Date().toISOString();

      // Vérifier si la phase est complète
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
      alert('Erreur lors de la complétion. Vérifiez la console.');
    }
  };

  // ... [GARDER LES AUTRES FONCTIONS]

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
        
        {/* En-tête */}
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

        {/* [GARDER LE RESTE DU CODE IDENTIQUE] */}

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

// [GARDER TOUS LES COMPOSANTS FormationTab, EntretiensTab, ProgressTab, etc. IDENTIQUES]

export default OnboardingPage;
