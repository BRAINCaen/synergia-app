// ==========================================
// 📁 react-app/src/pages/OnboardingPageFixed.jsx
// CORRECTION PAGE INTÉGRATION - SAUVEGARDE PROGRESSION
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  CheckSquare, 
  Square, 
  Award, 
  Star, 
  Target, 
  Clock, 
  Users, 
  ChevronDown, 
  ChevronRight,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

// Services Firebase
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🏗️ PAGE D'INTÉGRATION AVEC SAUVEGARDE FIREBASE GARANTIE
 * Corrige le problème de perte de progression au rafraîchissement
 */
const OnboardingPageFixed = () => {
  const { user } = useAuthStore();
  
  // États
  const [formationData, setFormationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  // Collection Firebase pour la progression d'intégration
  const ONBOARDING_COLLECTION = 'onboardingProgress';

  /**
   * 📊 DONNÉES DE FORMATION PAR DÉFAUT
   */
  const getDefaultFormationData = () => ({
    userId: user?.uid,
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    overallProgress: 0,
    phases: {
      // Phase 1: Découverte de Brain & de l'équipe
      decouverte: {
        id: 'decouverte',
        name: '🧠 Découverte de Brain & de l\'équipe',
        description: 'Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
        icon: 'Users',
        color: 'from-blue-500 to-cyan-500',
        order: 1,
        status: 'active',
        progress: 0,
        xp: 120,
        badge: 'Bienvenue chez Brain !',
        tasks: [
          {
            id: 'visite_bureau',
            name: 'Tour des bureaux avec ton référent',
            description: 'Découverte physique des espaces, présentation équipes',
            completed: false,
            xp: 20,
            estimatedTime: 60
          },
          {
            id: 'presentation_equipe',
            name: 'Présentation à l\'équipe',
            description: 'Rencontrer tes futurs collègues et te présenter',
            completed: false,
            xp: 25,
            estimatedTime: 30
          },
          {
            id: 'acces_outils',
            name: 'Accès aux outils Brain (PC, badgeuse, etc.)',
            description: 'Configuration de ton poste de travail',
            completed: false,
            xp: 30,
            estimatedTime: 90
          },
          {
            id: 'presentation_culture',
            name: 'Présentation de la culture et des valeurs Brain',
            description: 'Découvrir l\'ADN de l\'entreprise',
            completed: false,
            xp: 25,
            estimatedTime: 45
          },
          {
            id: 'questions_generales',
            name: 'Temps pour poser tes questions générales',
            description: 'Moment d\'échange libre avec ton référent',
            completed: false,
            xp: 20,
            estimatedTime: 30
          }
        ]
      },

      // Phase 2: Formation technique escape game
      formation_technique: {
        id: 'formation_technique',
        name: '🎮 Formation technique escape game',
        description: 'Maîtrise les aspects techniques de nos escape games : mécaniques, énigmes, scénarios.',
        icon: 'Target',
        color: 'from-purple-500 to-pink-500',
        order: 2,
        status: 'locked',
        progress: 0,
        xp: 150,
        badge: 'Technicien Game Master',
        tasks: [
          {
            id: 'mecaniques_jeu',
            name: 'Comprendre les mécaniques de jeu de chaque escape',
            description: 'Étude détaillée de chaque salle et ses mécanismes',
            completed: false,
            xp: 35,
            estimatedTime: 180
          },
          {
            id: 'scenarios_enigmes',
            name: 'Mémoriser les scénarios et énigmes',
            description: 'Apprentissage des histoires et solutions',
            completed: false,
            xp: 40,
            estimatedTime: 240
          },
          {
            id: 'manipulation_objets',
            name: 'Savoir manipuler et réinitialiser les objets/mécanismes',
            description: 'Formation pratique sur la réinitialisation',
            completed: false,
            xp: 35,
            estimatedTime: 120
          },
          {
            id: 'troubleshooting',
            name: 'Troubleshooting : que faire si quelque chose ne marche pas',
            description: 'Procédures de dépannage et contact support',
            completed: false,
            xp: 40,
            estimatedTime: 90
          }
        ]
      },

      // Phase 3: Accueil et gestion client
      accueil_client: {
        id: 'accueil_client',
        name: '👥 Accueil et gestion client',
        description: 'Apprends à créer une expérience client exceptionnelle du premier contact à la sortie.',
        icon: 'Users',
        color: 'from-green-500 to-emerald-500',
        order: 3,
        status: 'locked',
        progress: 0,
        xp: 140,
        badge: 'Expert Relation Client',
        tasks: [
          {
            id: 'accueil_chaleureux',
            name: 'Techniques d\'accueil chaleureux et professionnel',
            description: 'Formation sur l\'art de recevoir les clients',
            completed: false,
            xp: 30,
            estimatedTime: 90
          },
          {
            id: 'briefing_equipes',
            name: 'Briefing des équipes avant le jeu',
            description: 'Script et techniques de présentation',
            completed: false,
            xp: 35,
            estimatedTime: 120
          },
          {
            id: 'gestion_stress',
            name: 'Gestion du stress des participants',
            description: 'Techniques pour rassurer et motiver',
            completed: false,
            xp: 35,
            estimatedTime: 90
          },
          {
            id: 'debriefing_final',
            name: 'Debriefing et feedback après la session',
            description: 'Comment terminer sur une note positive',
            completed: false,
            xp: 40,
            estimatedTime: 60
          }
        ]
      },

      // Phase 4: Animation et Game Mastering
      animation: {
        id: 'animation',
        name: '🎭 Animation et Game Mastering',
        description: 'Développe tes compétences d\'animation pour créer des moments inoubliables.',
        icon: 'Star',
        color: 'from-orange-500 to-red-500',
        order: 4,
        status: 'locked',
        progress: 0,
        xp: 160,
        badge: 'Game Master Expert',
        tasks: [
          {
            id: 'donner_indices',
            name: 'Savoir donner des indices subtils et adaptés',
            description: 'Art du hint au bon moment',
            completed: false,
            xp: 40,
            estimatedTime: 150
          },
          {
            id: 'maintenir_ambiance',
            name: 'Maintenir l\'ambiance et le suspense',
            description: 'Techniques d\'immersion et de tension',
            completed: false,
            xp: 40,
            estimatedTime: 120
          },
          {
            id: 'adaptation_groupe',
            name: 'S\'adapter au type de groupe (enfants, adultes, entreprises)',
            description: 'Personnalisation de l\'expérience',
            completed: false,
            xp: 40,
            estimatedTime: 90
          },
          {
            id: 'gestion_temps',
            name: 'Gestion du timing et du rythme de jeu',
            description: 'Maîtrise du tempo pour une expérience optimale',
            completed: false,
            xp: 40,
            estimatedTime: 90
          }
        ]
      },

      // Phase 5: Situations spéciales
      situations_speciales: {
        id: 'situations_speciales',
        name: '🚨 Situations spéciales et résolution de problèmes',
        description: 'Prépare-toi à gérer toutes les situations, même les plus inattendues.',
        icon: 'AlertCircle',
        color: 'from-red-500 to-pink-500',
        order: 5,
        status: 'locked',
        progress: 0,
        xp: 140,
        badge: 'Résolveur de Problèmes',
        tasks: [
          {
            id: 'groupes_difficiles',
            name: 'Gérer les groupes difficiles ou peu coopératifs',
            description: 'Techniques de gestion de conflit et remotivation',
            completed: false,
            xp: 35,
            estimatedTime: 120
          },
          {
            id: 'urgences',
            name: 'Procédures d\'urgence et de sécurité',
            description: 'Protocoles de sécurité et évacuation',
            completed: false,
            xp: 35,
            estimatedTime: 90
          },
          {
            id: 'pannes_techniques',
            name: 'Gestion des pannes techniques majeures',
            description: 'Solutions de contournement et contact support',
            completed: false,
            xp: 35,
            estimatedTime: 60
          },
          {
            id: 'reclamations',
            name: 'Gestion des réclamations et fidélisation client',
            description: 'Techniques de gestion des mécontentements',
            completed: false,
            xp: 35,
            estimatedTime: 90
          }
        ]
      },

      // Phase 6: Certification finale
      certification: {
        id: 'certification',
        name: '🏆 Certification finale',
        description: 'Validation complète et intégration officielle dans l\'équipe Brain.',
        icon: 'Award',
        color: 'from-yellow-500 to-orange-500',
        order: 6,
        status: 'locked',
        progress: 0,
        xp: 150,
        badge: 'Game Master Certifié Brain',
        tasks: [
          {
            id: 'evaluation_complete',
            name: 'Évaluation complète des compétences',
            description: 'Test pratique sur l\'ensemble des compétences acquises',
            completed: false,
            xp: 50,
            estimatedTime: 240
          },
          {
            id: 'entretien_final',
            name: 'Entretien final avec l\'équipe dirigeante',
            description: 'Bilan complet, feedback, définition des objectifs futurs',
            completed: false,
            xp: 50,
            estimatedTime: 90
          },
          {
            id: 'integration_officielle',
            name: 'Intégration officielle à l\'équipe',
            description: 'Présentation officielle et remise du badge Brain',
            completed: false,
            xp: 50,
            estimatedTime: 60
          }
        ]
      }
    }
  });

  /**
   * 🔄 CHARGER LA PROGRESSION DEPUIS FIREBASE
   */
  const loadProgressFromFirebase = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setSyncStatus('loading');

      const docRef = doc(db, ONBOARDING_COLLECTION, user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('📊 [ONBOARDING] Progression chargée depuis Firebase');
        const data = docSnap.data();
        setFormationData(data);
        setLastSaved(data.lastActivityAt);
        setSyncStatus('synced');
      } else {
        console.log('📝 [ONBOARDING] Aucune progression trouvée, initialisation...');
        const defaultData = getDefaultFormationData();
        await saveProgressToFirebase(defaultData);
        setFormationData(defaultData);
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur chargement progression:', error);
      setSyncStatus('error');
      
      // Fallback: utiliser les données par défaut
      setFormationData(getDefaultFormationData());
    } finally {
      setLoading(false);
    }
  };

  /**
   * 💾 SAUVEGARDER LA PROGRESSION DANS FIREBASE
   */
  const saveProgressToFirebase = async (data = formationData) => {
    if (!user?.uid || !data) return;

    try {
      setSaving(true);
      setSyncStatus('saving');

      const docRef = doc(db, ONBOARDING_COLLECTION, user.uid);
      
      const dataToSave = {
        ...data,
        lastActivityAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      };

      await setDoc(docRef, dataToSave, { merge: true });
      
      console.log('💾 [ONBOARDING] Progression sauvegardée');
      setLastSaved(dataToSave.lastActivityAt);
      setSyncStatus('synced');
      
      return true;
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur sauvegarde:', error);
      setSyncStatus('error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * ✅ BASCULER L'ÉTAT D'UNE TÂCHE
   */
  const toggleTaskCompletion = async (phaseId, taskId) => {
    if (!formationData) return;

    const updatedData = { ...formationData };
    const phase = updatedData.phases[phaseId];
    const task = phase.tasks.find(t => t.id === taskId);
    
    if (!task) return;

    // Basculer l'état
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;

    // Recalculer la progression de la phase
    const completedTasks = phase.tasks.filter(t => t.completed).length;
    const totalTasks = phase.tasks.length;
    phase.progress = Math.round((completedTasks / totalTasks) * 100);

    // Si phase complète, débloquer la suivante
    if (phase.progress === 100 && phase.status !== 'completed') {
      phase.status = 'completed';
      phase.completedAt = new Date().toISOString();
      
      // Débloquer la phase suivante
      const currentOrder = phase.order;
      const nextPhase = Object.values(updatedData.phases).find(p => p.order === currentOrder + 1);
      if (nextPhase && nextPhase.status === 'locked') {
        nextPhase.status = 'active';
      }
    }

    // Recalculer progression globale
    const allTasks = Object.values(updatedData.phases).reduce((acc, p) => acc + p.tasks.length, 0);
    const allCompletedTasks = Object.values(updatedData.phases).reduce((acc, p) => 
      acc + p.tasks.filter(t => t.completed).length, 0);
    updatedData.overallProgress = Math.round((allCompletedTasks / allTasks) * 100);

    // Mettre à jour l'état local
    setFormationData(updatedData);

    // Sauvegarder en Firebase (asynchrone)
    await saveProgressToFirebase(updatedData);
  };

  /**
   * 🎨 COMPOSANT TÂCHE INDIVIDUELLE
   */
  const TaskItem = ({ task, onToggle, phaseId }) => (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        task.completed 
          ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30' 
          : 'bg-gray-700/30 border-gray-600 hover:bg-gray-600/30'
      }`}
      onClick={() => onToggle(phaseId, task.id)}
    >
      <div className="mt-1">
        {task.completed ? (
          <CheckSquare className="w-5 h-5 text-green-400" />
        ) : (
          <Square className="w-5 h-5 text-gray-500 hover:text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <p className={`${task.completed ? 'text-green-300 line-through' : 'text-white'}`}>
          {task.name}
        </p>
        <p className="text-sm text-gray-400 mt-1">{task.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            +{task.xp} XP
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{task.estimatedTime}min
          </span>
        </div>
      </div>
    </div>
  );

  /**
   * 🎨 INDICATEUR DE SYNCHRONISATION
   */
  const SyncIndicator = () => {
    const statusConfig = {
      idle: { color: 'gray', text: '', show: false },
      loading: { color: 'blue', text: 'Chargement...', show: true },
      saving: { color: 'orange', text: 'Sauvegarde...', show: true },
      synced: { color: 'green', text: 'Sauvegardé', show: true },
      error: { color: 'red', text: 'Erreur sync', show: true }
    };

    const config = statusConfig[syncStatus] || statusConfig.idle;
    
    if (!config.show) return null;

    return (
      <div className={`flex items-center gap-2 text-${config.color}-400 text-sm`}>
        {syncStatus === 'saving' || syncStatus === 'loading' ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : syncStatus === 'synced' ? (
          <CheckCircle className="w-4 h-4" />
        ) : syncStatus === 'error' ? (
          <AlertCircle className="w-4 h-4" />
        ) : null}
        <span>{config.text}</span>
        {lastSaved && syncStatus === 'synced' && (
          <span className="text-gray-500">
            ({new Date(lastSaved).toLocaleTimeString()})
          </span>
        )}
      </div>
    );
  };

  // Charger la progression au montage
  useEffect(() => {
    if (user?.uid) {
      loadProgressFromFirebase();
    }
  }, [user?.uid]);

  // Calculer les statistiques
  const calculateStats = () => {
    if (!formationData) return { completedTasks: 0, totalTasks: 0, earnedXP: 0, totalXP: 0, completionRate: 0 };

    let completedTasks = 0;
    let totalTasks = 0;
    let earnedXP = 0;
    let totalXP = 0;

    Object.values(formationData.phases).forEach(phase => {
      phase.tasks.forEach(task => {
        totalTasks++;
        totalXP += task.xp;
        if (task.completed) {
          completedTasks++;
          earnedXP += task.xp;
        }
      });
    });

    return {
      completedTasks,
      totalTasks,
      earnedXP,
      totalXP,
      completionRate: Math.round((completedTasks / totalTasks) * 100)
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <div className="text-white text-lg">Chargement de votre progression...</div>
          <div className="text-gray-400 text-sm mt-2">Synchronisation avec Firebase</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header avec progression globale */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">
              🧠 Ton Parcours d'Intégration Game Master chez Brain
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {stats.completionRate === 100 
                ? "🎉 Félicitations ! Tu as terminé ton intégration !" 
                : "Escape & Quiz Game – 1 mois – coche chaque tâche, gagne des XP et débloque des badges"
              }
            </p>
          </div>

          {/* Barre de progression globale */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">
                🎯 Ton Parcours Game Master
              </h3>
              <SyncIndicator />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Ta progression sera visible à chaque étape</span>
                <span>{stats.completionRate}% complété</span>
              </div>
              <div className="bg-gray-700/50 rounded-full h-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <div className="text-sm opacity-80">Tâches terminées</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <div className="text-sm opacity-80">Tâches totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.earnedXP}</div>
                <div className="text-sm opacity-80">XP gagné</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalXP}</div>
                <div className="text-sm opacity-80">XP total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Phases de formation */}
        <div className="space-y-6">
          {Object.values(formationData?.phases || {})
            .sort((a, b) => a.order - b.order)
            .map((phase) => {
              const isExpanded = expandedPhase === phase.id;
              const isLocked = phase.status === 'locked';
              const completedInPhase = phase.tasks.filter(task => task.completed).length;
              const totalInPhase = phase.tasks.length;
              
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 ${
                    isLocked ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-6">
                    {/* En-tête de phase */}
                    <div 
                      className={`flex items-center justify-between mb-4 ${
                        !isLocked ? 'cursor-pointer hover:bg-gray-700/20 rounded-lg p-2 -m-2 transition-colors' : ''
                      }`}
                      onClick={() => !isLocked && setExpandedPhase(isExpanded ? null : phase.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${phase.color} flex items-center justify-center`}>
                          <span className="text-2xl">{phase.name.match(/🧠|🎮|👥|🎭|🚨|🏆/)?.[0] || '📋'}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{phase.name}</h4>
                          <p className="text-gray-400 text-sm">{phase.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{phase.progress}%</div>
                          <div className="text-gray-400 text-sm">{completedInPhase}/{totalInPhase} tâches</div>
                        </div>
                        {!isLocked && (
                          <div className="text-gray-400">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        )}
                        {isLocked && (
                          <div className="text-gray-500">🔒</div>
                        )}
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="bg-gray-700/50 rounded-full h-2 mb-4">
                      <div 
                        className={`bg-gradient-to-r ${phase.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>

                    {/* Badge et XP */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">🏅 Badge: {phase.badge}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">+{phase.xp} XP</span>
                      </div>
                    </div>

                    {/* Contenu expandable */}
                    <AnimatePresence>
                      {isExpanded && !isLocked && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 pt-4 border-t border-gray-700">
                            <h5 className="font-semibold text-white mb-3">📋 Ce que tu dois valider :</h5>
                            {phase.tasks.map((task) => (
                              <TaskItem
                                key={task.id}
                                task={task}
                                phaseId={phase.id}
                                onToggle={toggleTaskCompletion}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Section finale */}
        {stats.completionRate === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">🎉 Félicitations !</h2>
              <p className="text-xl mb-4">
                Tu as terminé ton parcours d'intégration Game Master chez Brain !
              </p>
              <p className="text-lg opacity-90">
                Tu fais maintenant partie de l'équipe officiellement ! 🚀
              </p>
            </div>
          </motion.div>
        )}

        {/* Bouton de sauvegarde manuelle */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => saveProgressToFirebase()}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white p-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
            title="Sauvegarder maintenant"
          >
            {saving ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPageFixed;
