// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE INTÉGRATION COMPLÈTE AVEC SAUVEGARDE FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BookOpen,
  MessageSquare,
  Brain,
  Save,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

// 🔥 IMPORTS FIREBASE POUR SAUVEGARDE
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🔧 SERVICE DE SAUVEGARDE ONBOARDING
const onboardingSaveService = {
  COLLECTION: 'onboardingProgress',
  
  async saveProgress(userId, formationData) {
    if (!userId || !formationData) return { success: false };
    
    try {
      console.log('💾 Sauvegarde progression onboarding...');
      
      const docRef = doc(db, this.COLLECTION, userId);
      await setDoc(docRef, {
        userId,
        formationData,
        lastUpdated: new Date().toISOString(),
        savedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Progression sauvegardée');
      this.showSaveNotification('Progression sauvegardée !');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      this.showSaveNotification('Erreur de sauvegarde', 'error');
      return { success: false, error };
    }
  },
  
  async loadProgress(userId) {
    if (!userId) return { success: false };
    
    try {
      console.log('📊 Chargement progression onboarding...');
      
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Progression chargée');
        this.showSaveNotification('Progression rechargée !');
        return { success: true, data: data.formationData };
      }
      
      return { success: false, error: 'Aucune sauvegarde trouvée' };
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      return { success: false, error };
    }
  },
  
  async syncXpToProfile(userId, earnedXp, completedTasks) {
    if (!userId || !earnedXp) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentXp = userData.gamification?.totalXp || 0;
        const newTotalXp = currentXp + earnedXp;
        const newLevel = Math.floor(newTotalXp / 100) + 1;
        
        await setDoc(userRef, {
          'gamification.totalXp': newTotalXp,
          'gamification.weeklyXp': (userData.gamification?.weeklyXp || 0) + earnedXp,
          'gamification.level': newLevel,
          'gamification.tasksCompleted': (userData.gamification?.tasksCompleted || 0) + completedTasks,
          'gamification.lastActivityAt': new Date().toISOString(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log(`✅ +${earnedXp} XP synchronisés vers profil`);
      }
    } catch (error) {
      console.error('❌ Erreur sync XP:', error);
    }
  },
  
  showSaveNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }
};

// 🎯 COMPOSANT PRINCIPAL ONBOARDING
const OnboardingPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [activeTab, setActiveTab] = useState('formation');
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  
  // 🗂️ DONNÉES DE FORMATION COMPLÈTES
  const [formationData, setFormationData] = useState({
    // Phase 1: Découverte de Brain & de l'équipe
    decouverte_brain: {
      id: 'decouverte_brain',
      name: '🧠 Découverte de Brain & de l\'équipe',
      description: 'Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      order: 1,
      xp: 120,
      badge: 'Bienvenue chez Brain !',
      tasks: [
        {
          id: 'visite_bureau',
          name: 'Tour des bureaux avec ton référent',
          description: 'Découverte physique des espaces, présentation équipes',
          completed: false,
          xp: 20
        },
        {
          id: 'presentation_equipe',
          name: 'Présentation à l\'équipe',
          description: 'Rencontrer tes futurs collègues et te présenter',
          completed: false,
          xp: 25
        },
        {
          id: 'acces_outils',
          name: 'Accès aux outils Brain (PC, badgeuse, etc.)',
          description: 'Configuration de ton poste de travail',
          completed: false,
          xp: 30
        },
        {
          id: 'presentation_culture',
          name: 'Présentation de la culture et des valeurs Brain',
          description: 'Découvrir l\'ADN de l\'entreprise',
          completed: false,
          xp: 25
        },
        {
          id: 'questions_generales',
          name: 'Temps pour poser tes questions générales',
          description: 'Moment d\'échange libre avec ton référent',
          completed: false,
          xp: 20
        }
      ]
    },

    // Phase 2: Formation technique escape game
    formation_technique: {
      id: 'formation_technique',
      name: '🎮 Formation technique escape game',
      description: 'Maîtrise les aspects techniques de nos escape games : mécaniques, énigmes, scénarios.',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      order: 2,
      xp: 150,
      badge: 'Technicien Game Master',
      tasks: [
        {
          id: 'mecaniques_jeu',
          name: 'Comprendre les mécaniques de jeu de chaque escape',
          description: 'Étude détaillée de chaque salle et ses mécanismes',
          completed: false,
          xp: 35
        },
        {
          id: 'scenarios_enigmes',
          name: 'Mémoriser les scénarios et énigmes',
          description: 'Apprentissage des histoires et solutions',
          completed: false,
          xp: 40
        },
        {
          id: 'manipulation_objets',
          name: 'Savoir manipuler et réinitialiser les objets/mécanismes',
          description: 'Formation pratique sur la réinitialisation',
          completed: false,
          xp: 35
        },
        {
          id: 'troubleshooting',
          name: 'Troubleshooting : que faire si quelque chose ne marche pas',
          description: 'Procédures de dépannage et contact support',
          completed: false,
          xp: 40
        }
      ]
    },

    // Phase 3: Accueil et gestion client
    accueil_client: {
      id: 'accueil_client',
      name: '👥 Accueil et gestion client',
      description: 'Apprends à créer une expérience client exceptionnelle du premier contact à la sortie.',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      order: 3,
      xp: 140,
      badge: 'Expert Relation Client',
      tasks: [
        {
          id: 'accueil_chaleureux',
          name: 'Techniques d\'accueil chaleureux et professionnel',
          description: 'Formation sur l\'art de recevoir les clients',
          completed: false,
          xp: 30
        },
        {
          id: 'briefing_equipes',
          name: 'Briefing des équipes avant le jeu',
          description: 'Script et techniques de présentation',
          completed: false,
          xp: 35
        },
        {
          id: 'gestion_stress',
          name: 'Gestion du stress des participants',
          description: 'Techniques pour rassurer et motiver',
          completed: false,
          xp: 35
        },
        {
          id: 'debriefing_final',
          name: 'Debriefing et feedback après la session',
          description: 'Comment terminer sur une note positive',
          completed: false,
          xp: 40
        }
      ]
    },

    // Phase 4: Animation et Game Mastering
    animation: {
      id: 'animation',
      name: '🎭 Animation et Game Mastering',
      description: 'Développe tes compétences d\'animation pour créer des moments inoubliables.',
      icon: Star,
      color: 'from-orange-500 to-red-500',
      order: 4,
      xp: 160,
      badge: 'Game Master Expert',
      tasks: [
        {
          id: 'donner_indices',
          name: 'Savoir donner des indices subtils et adaptés',
          description: 'Art du hint au bon moment',
          completed: false,
          xp: 40
        },
        {
          id: 'maintenir_ambiance',
          name: 'Maintenir l\'ambiance et le suspense',
          description: 'Techniques d\'immersion et de tension',
          completed: false,
          xp: 40
        },
        {
          id: 'adaptation_groupe',
          name: 'S\'adapter au type de groupe (enfants, adultes, entreprises)',
          description: 'Personnalisation de l\'expérience',
          completed: false,
          xp: 40
        },
        {
          id: 'gestion_temps',
          name: 'Gestion du timing et du rythme de jeu',
          description: 'Maîtrise du tempo pour une expérience optimale',
          completed: false,
          xp: 40
        }
      ]
    },

    // Phase 5: Situations spéciales
    situations_speciales: {
      id: 'situations_speciales',
      name: '🚨 Situations spéciales et résolution de problèmes',
      description: 'Prépare-toi à gérer toutes les situations, même les plus inattendues.',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      order: 5,
      xp: 140,
      badge: 'Résolveur de Problèmes',
      tasks: [
        {
          id: 'groupes_difficiles',
          name: 'Gérer les groupes difficiles ou peu coopératifs',
          description: 'Techniques de gestion de conflit et remotivation',
          completed: false,
          xp: 35
        },
        {
          id: 'urgences',
          name: 'Procédures d\'urgence et de sécurité',
          description: 'Protocoles de sécurité et évacuation',
          completed: false,
          xp: 35
        },
        {
          id: 'pannes_techniques',
          name: 'Gestion des pannes techniques majeures',
          description: 'Solutions de contournement et contact support',
          completed: false,
          xp: 35
        },
        {
          id: 'reclamations',
          name: 'Gestion des réclamations et fidélisation client',
          description: 'Techniques de gestion des mécontentements',
          completed: false,
          xp: 35
        }
      ]
    },

    // Phase 6: Certification finale
    certification: {
      id: 'certification',
      name: '🏆 Certification finale',
      description: 'Validation complète et intégration officielle dans l\'équipe Brain.',
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      order: 6,
      xp: 150,
      badge: 'Game Master Certifié Brain',
      tasks: [
        {
          id: 'evaluation_complete',
          name: 'Évaluation complète des compétences',
          description: 'Test pratique sur l\'ensemble des compétences acquises',
          completed: false,
          xp: 50
        },
        {
          id: 'entretien_final',
          name: 'Entretien final avec l\'équipe dirigeante',
          description: 'Bilan complet, feedback, définition des objectifs futurs',
          completed: false,
          xp: 50
        },
        {
          id: 'integration_officielle',
          name: 'Intégration officielle à l\'équipe',
          description: 'Présentation officielle et remise du badge Brain',
          completed: false,
          xp: 50
        }
      ]
    }
  });

  // 🔄 CHARGER LA PROGRESSION SAUVEGARDÉE AU DÉMARRAGE
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      const result = await onboardingSaveService.loadProgress(user.uid);
      
      if (result.success && result.data) {
        console.log('📊 Progression rechargée depuis Firebase');
        setFormationData(result.data);
      } else {
        console.log('📝 Nouvelle session, données par défaut');
      }
      
      setLoading(false);
    };
    
    loadSavedProgress();
  }, [user?.uid]);

  // ✅ FONCTION DE TOGGLE AVEC SAUVEGARDE AUTOMATIQUE
  const toggleTaskCompletion = async (phaseId, taskId, experienceId = null) => {
    setSaveStatus('saving');
    
    setFormationData(prev => {
      const newData = { ...prev };
      let taskXp = 0;
      let taskCompleted = false;
      
      if (experienceId) {
        // Tâche dans une expérience
        const task = newData[phaseId].experiences?.[experienceId]?.tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
          if (task.completed) {
            taskXp = task.xp || 10;
            taskCompleted = true;
          }
        }
      } else {
        // Tâche normale
        const task = newData[phaseId].tasks.find(t => t.id === taskId);
        if (task) {
          task.completed = !task.completed;
          if (task.completed) {
            taskXp = task.xp || 10;
            taskCompleted = true;
          }
        }
      }
      
      // Sauvegarder immédiatement
      if (user?.uid) {
        setTimeout(async () => {
          await onboardingSaveService.saveProgress(user.uid, newData);
          
          // Si tâche complétée, synchroniser XP
          if (taskCompleted && taskXp > 0) {
            await onboardingSaveService.syncXpToProfile(user.uid, taskXp, 1);
          }
          
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }, 100);
      }
      
      return newData;
    });
  };

  // 📊 Calculer les statistiques
  const calculateStats = () => {
    let completedTasks = 0;
    let totalTasks = 0;
    let earnedXP = 0;
    let totalXP = 0;

    Object.values(formationData).forEach(phase => {
      // Tâches normales
      if (phase.tasks) {
        phase.tasks.forEach(task => {
          totalTasks++;
          totalXP += task.xp;
          if (task.completed) {
            completedTasks++;
            earnedXP += task.xp;
          }
        });
      }

      // Tâches dans les expériences
      if (phase.experiences) {
        Object.values(phase.experiences).forEach(exp => {
          exp.tasks.forEach(task => {
            totalTasks++;
            totalXP += task.xp;
            if (task.completed) {
              completedTasks++;
              earnedXP += task.xp;
            }
          });
        });
      }
    });

    return {
      completedTasks,
      totalTasks,
      earnedXP,
      totalXP,
      completionRate: Math.round((completedTasks / totalTasks) * 100)
    };
  };

  // 🎨 INDICATEUR DE SAUVEGARDE
  const SaveIndicator = () => {
    if (saveStatus === 'idle') return null;
    
    return (
      <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
        saveStatus === 'saving' ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {saveStatus === 'saving' ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Sauvegarde...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Sauvegardé !
          </>
        )}
      </div>
    );
  };

  // 🎯 COMPOSANT TÂCHE INDIVIDUELLE
  const TaskItem = ({ task, onToggle, small = false }) => {
    return (
      <div 
        className={`flex items-start gap-3 ${small ? 'p-2' : 'p-3'} rounded-lg border transition-all duration-200 cursor-pointer ${
          task.completed 
            ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30' 
            : 'bg-gray-700/30 border-gray-600 hover:bg-gray-600/30'
        }`}
        onClick={onToggle}
      >
        <div className="mt-1">
          {task.completed ? (
            <CheckSquare className={`${small ? 'w-4 h-4' : 'w-5 h-5'} text-green-400`} />
          ) : (
            <Square className={`${small ? 'w-4 h-4' : 'w-5 h-5'} text-gray-500 hover:text-gray-400`} />
          )}
        </div>
        <div className="flex-1">
          <p className={`${task.completed ? 'text-green-300 line-through' : 'text-white'} ${small ? 'text-sm' : ''}`}>
            {task.name}
          </p>
          <p className="text-sm text-gray-400 mt-1">{task.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              +{task.xp} XP
            </span>
          </div>
        </div>
      </div>
    );
  };

  // 🎯 SECTION FORMATION GÉNÉRALE
  const FormationGenerale = ({ stats }) => {
    return (
      <div className="space-y-8">
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
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-4">
                🎯 Ton Parcours Game Master
              </h3>
              <p className="text-gray-400 mb-4">Ta progression sera visible à chaque étape</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progression : {stats.completionRate}%</span>
                <span>{stats.completedTasks}/{stats.totalTasks} tâches</span>
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
          {Object.values(formationData)
            .sort((a, b) => a.order - b.order)
            .map((phase) => {
              const IconComponent = phase.icon;
              const isExpanded = expandedPhase === phase.id;
              
              // Calculer progression de la phase
              let phaseTasks = [];
              if (phase.tasks) {
                phaseTasks = phase.tasks;
              }
              if (phase.experiences) {
                Object.values(phase.experiences).forEach(exp => {
                  phaseTasks = [...phaseTasks, ...exp.tasks];
                });
              }
              
              const completedInPhase = phaseTasks.filter(task => task.completed).length;
              const totalInPhase = phaseTasks.length;
              const phaseProgress = totalInPhase > 0 ? Math.round((completedInPhase / totalInPhase) * 100) : 0;
              
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700"
                >
                  <div className="p-6">
                    {/* En-tête de phase */}
                    <div 
                      className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-700/20 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${phase.color} flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{phase.name}</h4>
                          <p className="text-gray-400 text-sm">{phase.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{phaseProgress}%</div>
                          <div className="text-gray-400 text-sm">{completedInPhase}/{totalInPhase} tâches</div>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="bg-gray-700/50 rounded-full h-2 mb-4">
                      <div 
                        className={`bg-gradient-to-r ${phase.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${phaseProgress}%` }}
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
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 pt-4 border-t border-gray-700">
                            <h5 className="font-semibold text-white mb-3">📋 Ce que tu dois valider :</h5>
                            {phase.tasks && phase.tasks.map((task) => (
                              <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={() => toggleTaskCompletion(phase.id, task.id)}
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
      </div>
    );
  };

  // 🎯 COMPOSANT COMPÉTENCES SIMPLIFIÉ
  const AcquisitionCompetences = ({ stats }) => {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">🎮 Acquisition de Compétences</h3>
        <p className="text-gray-300 mb-6">
          Tes compétences se développent automatiquement en validant les tâches de formation !
        </p>
        <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-3xl font-bold text-purple-400">{stats.completionRate}%</div>
          <div className="text-gray-400">Progression globale</div>
          <div className="mt-4 text-sm text-gray-300">
            {stats.completedTasks} / {stats.totalTasks} tâches complétées
          </div>
        </div>
      </div>
    );
  };

  // 🎯 COMPOSANT ENTRETIENS SIMPLIFIÉ
  const EntretiensReferent = () => {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4">💬 Entretiens avec ton Référent</h3>
        <p className="text-gray-300 mb-6">
          Des points réguliers pour t'accompagner dans ta progression !
        </p>
        <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-2xl font-bold text-blue-400 mb-2">Entretiens planifiés</div>
          <div className="text-gray-400 text-sm">
            Ton référent t'accompagne tout au long de ton parcours
          </div>
        </div>
      </div>
    );
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement de votre formation</h2>
          <p className="text-gray-400">Chargement de la progression...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Indicateur de sauvegarde */}
        <SaveIndicator />
        
        {/* 🎯 En-tête */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 Ton Parcours d'Intégration Game Master chez Brain
          </h1>
          <p className="text-gray-400 text-lg">
            Escape & Quiz Game – 1 mois – coche chaque tâche, gagne des XP et débloque des badges
          </p>
        </div>

        {/* 📊 Navigation par onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
            <div className="flex space-x-2">
              {[
                { id: 'formation', name: 'Ma Formation', icon: BookOpen },
                { id: 'competences', name: 'Compétences', icon: Target },
                { id: 'entretiens', name: 'Entretiens', icon: MessageSquare }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📋 Contenu selon l'onglet actif */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'formation' && <FormationGenerale stats={stats} />}
          {activeTab === 'competences' && <AcquisitionCompetences stats={stats} />}
          {activeTab === 'entretiens' && <EntretiensReferent />}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
