// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// VERSION COMPLÈTE CORRIGÉE - SOLUTION API REST FIREBASE
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Shield,
  Cloud,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

// 🔥 IMPORT MINIMAL FIREBASE (JUSTE POUR AUTH)
import { getAuth } from 'firebase/auth';

// 🛡️ SERVICE REST API FIREBASE - CONTOURNEMENT DU BUG SDK
const firebaseRestService = {
  PROJECT_ID: 'synergia-app-f27e7',
  // 🔧 CORRECTION: URL corrigée avec le bon endpoint
  BASE_URL: `https://firestore.googleapis.com/v1/projects/synergia-app-f27e7/databases/(default)/documents`,
  
  // 🔑 OBTENIR TOKEN D'AUTHENTIFICATION
  async getAuthToken() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('❌ [REST] Erreur récupération token:', error);
      throw error;
    }
  },
  
  // 💾 SAUVEGARDE VIA API REST
  async saveProgressRest(userId, formationData) {
    try {
      console.log('💾 [REST] Sauvegarde via API REST Firebase...');
      
      const token = await this.getAuthToken();
      const timestamp = new Date().toISOString();
      
      const document = {
        fields: {
          userId: { stringValue: userId },
          formationData: { stringValue: JSON.stringify(formationData) },
          lastUpdated: { stringValue: timestamp },
          savedAt: { timestampValue: timestamp },
          version: { stringValue: '3.5.3' },
          syncId: { integerValue: Date.now().toString() }
        }
      };
      
      // 🔧 CORRECTION: URL complète avec le bon endpoint
      const url = `${this.BASE_URL}/onboardingProgress/${userId}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(document)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      console.log('✅ [REST] Sauvegarde API REST réussie');
      
      // 🔧 CORRECTION: Vérifier que showNotification existe avant utilisation
      if (typeof this.showNotification === 'function') {
        this.showNotification('Sauvegardé via API REST !', 'success');
      }
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ [REST] Erreur sauvegarde API REST:', error);
      throw error;
    }
  },
  
  // 📥 CHARGEMENT VIA API REST
  async loadProgressRest(userId) {
    try {
      console.log('📥 [REST] Chargement via API REST Firebase...');
      
      const token = await this.getAuthToken();
      // 🔧 CORRECTION: URL complète avec le bon endpoint
      const url = `${this.BASE_URL}/onboardingProgress/${userId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 404) {
        console.log('📝 [REST] Aucune progression trouvée');
        return { success: false, error: 'Document non trouvé' };
      }
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      
      // 🔧 CORRECTION: Vérification sécurisée des champs
      if (!result.fields || !result.fields.formationData) {
        throw new Error('Structure de document invalide');
      }
      
      // Extraire les données du format Firestore REST
      const formationData = JSON.parse(result.fields.formationData.stringValue);
      const lastUpdated = result.fields.lastUpdated.stringValue;
      
      console.log('✅ [REST] Chargement API REST réussi');
      
      // 🔧 CORRECTION: Vérifier que showNotification existe avant utilisation
      if (typeof this.showNotification === 'function') {
        this.showNotification('Progression chargée via API REST', 'success');
      }
      
      return { 
        success: true, 
        data: formationData,
        lastUpdated: lastUpdated
      };
      
    } catch (error) {
      console.error('❌ [REST] Erreur chargement API REST:', error);
      throw error;
    }
  },
  
  // 🔄 SYNCHRONISATION XP VIA API REST
  async syncXpRest(userId, earnedXp, completedTasks) {
    try {
      console.log(`🔄 [REST] Synchronisation ${earnedXp} XP via API REST...`);
      
      const token = await this.getAuthToken();
      
      // D'abord lire les données actuelles
      const currentUserUrl = `${this.BASE_URL}/users/${userId}`;
      const currentResponse = await fetch(currentUserUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let currentXp = 0;
      let currentLevel = 1;
      
      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        currentXp = parseInt(currentData.fields?.xp?.integerValue || '0');
        currentLevel = parseInt(currentData.fields?.level?.integerValue || '1');
      }
      
      // Calculer le nouveau total
      const newXp = currentXp + earnedXp;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      // Mettre à jour via API REST
      const updateDocument = {
        fields: {
          xp: { integerValue: newXp.toString() },
          level: { integerValue: newLevel.toString() },
          lastXpUpdate: { timestampValue: new Date().toISOString() },
          completedOnboardingTasks: { integerValue: completedTasks.toString() }
        }
      };
      
      const updateResponse = await fetch(currentUserUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateDocument)
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Erreur sync XP: ${updateResponse.status}`);
      }
      
      console.log(`✅ [REST] XP synchronisé: ${currentXp} → ${newXp} (+${earnedXp})`);
      this.showNotification(`+${earnedXp} XP gagné ! (Total: ${newXp})`, 'success');
      
      return { success: true, newXp, newLevel, earnedXp };
      
    } catch (error) {
      console.error('❌ [REST] Erreur sync XP:', error);
      throw error;
    }
  },

  // 🔧 CORRECTION: Méthode showNotification ajoutée
  showNotification(message, type = 'info') {
    console.log(`📢 [${type.toUpperCase()}] ${message}`);
    
    // Créer une notification visuelle temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-family: system-ui;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
};

// 📚 DONNÉES DE FORMATION BRAIN
const BRAIN_FORMATION_DATA = {
  welcome: {
    id: 'welcome',
    title: '🧠 Bienvenue chez Brain !',
    description: 'Voici tes premières étapes pour te sentir chez toi et découvrir l\'esprit Brain.',
    category: 'introduction',
    order: 1,
    estimatedTime: '2 minutes',
    tasks: [
      {
        id: 'tour_bureaux',
        label: 'Tour des bureaux avec ton référent',
        description: 'Découverte physique des espaces, présentation équipes',
        xp: 20,
        category: 'discovery'
      },
      {
        id: 'presentation_equipe',
        label: 'Présentation à l\'équipe',
        description: 'Rencontrer les futurs collègues et te présenter',
        xp: 25,
        category: 'social'
      }
    ]
  },
  setup: {
    id: 'setup',
    title: '⚙️ Accès aux outils Brain (PC, badgeuse, etc.)',
    description: 'Configuration de ton poste de travail',
    category: 'setup',
    order: 2,
    estimatedTime: '30 minutes',
    tasks: [
      {
        id: 'config_pc',
        label: 'Configuration PC et accès réseau',
        description: 'Installation logiciels, comptes, mots de passe',
        xp: 30,
        category: 'technical'
      },
      {
        id: 'test_badgeuse',
        label: 'Test de la badgeuse et pointage',
        description: 'Premier test du système de pointage',
        xp: 15,
        category: 'tools'
      },
      {
        id: 'acces_synergia',
        label: 'Première connexion à Synergia',
        description: 'Découverte de la plateforme collaborative',
        xp: 25,
        category: 'platform'
      }
    ]
  },
  culture: {
    id: 'culture',
    title: '🏢 Présentation de la culture et des valeurs Brain',
    description: 'Découvrir l\'ADN de l\'entreprise',
    category: 'culture',
    order: 3,
    estimatedTime: '15 minutes',
    tasks: [
      {
        id: 'valeurs_brain',
        label: 'Découvrir les valeurs Brain',
        description: 'Comprendre notre philosophie et nos principes',
        xp: 20,
        category: 'culture'
      },
      {
        id: 'histoire_entreprise',
        label: 'Histoire et évolution de Brain',
        description: 'Connaître le parcours et les ambitions',
        xp: 15,
        category: 'knowledge'
      },
      {
        id: 'organigramme',
        label: 'Structure organisationnelle',
        description: 'Comprendre l\'organisation et les rôles',
        xp: 20,
        category: 'organization'
      }
    ]
  }
};

// ==========================================
// 🎯 COMPOSANT PRINCIPAL
// ==========================================
const OnboardingPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [formationData, setFormationData] = useState(BRAIN_FORMATION_DATA);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState('offline'); // offline, online, syncing
  const [lastSaved, setLastSaved] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['welcome']));
  
  // Références
  const saveTimeoutRef = useRef(null);
  const lastSyncRef = useRef(0);

  // 📥 CHARGEMENT INITIAL
  useEffect(() => {
    if (user?.uid) {
      loadProgress();
    }
  }, [user]);

  // 💾 SAUVEGARDE AUTOMATIQUE
  useEffect(() => {
    if (user?.uid && completedTasks.size > 0) {
      scheduleAutoSave();
    }
  }, [completedTasks, user]);

  // 📥 CHARGEMENT PROGRESSION
  const loadProgress = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      // Essayer d'abord localStorage
      const localData = localStorage.getItem(`onboarding_${user.uid}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        setCompletedTasks(new Set(parsed.completedTasks || []));
        console.log('📱 Progression chargée depuis localStorage');
      }
      
      // Ensuite tenter Firebase REST
      try {
        const result = await firebaseRestService.loadProgressRest(user.uid);
        if (result.success && result.data) {
          setCompletedTasks(new Set(result.data.completedTasks || []));
          setLastSaved(new Date(result.lastUpdated));
          setSyncStatus('online');
          console.log('☁️ Progression synchronisée depuis Firebase');
        } else {
          setSyncStatus('offline');
        }
      } catch (firebaseError) {
        console.warn('⚠️ Firebase indisponible, mode hors ligne');
        setSyncStatus('offline');
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
      setSyncStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  // 💾 SAUVEGARDE DIFFÉRÉE
  const scheduleAutoSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 2000); // Sauvegarde après 2 secondes d'inactivité
  };

  // 💾 SAUVEGARDE PROGRESSION
  const saveProgress = async () => {
    if (!user?.uid || saving) return;
    
    setSaving(true);
    setSyncStatus('syncing');
    
    const progressData = {
      completedTasks: Array.from(completedTasks),
      lastUpdated: new Date().toISOString(),
      userId: user.uid,
      version: '3.5.3'
    };
    
    try {
      // Sauvegarde locale immédiate
      localStorage.setItem(`onboarding_${user.uid}`, JSON.stringify(progressData));
      
      // Tentative sauvegarde Firebase
      try {
        await firebaseRestService.saveProgressRest(user.uid, progressData);
        setSyncStatus('online');
        setLastSaved(new Date());
        console.log('☁️ Progression sauvegardée sur Firebase');
      } catch (firebaseError) {
        console.warn('⚠️ Sauvegarde Firebase échouée, données locales conservées');
        setSyncStatus('offline');
      }
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      firebaseRestService.showNotification('Erreur de sauvegarde', 'error');
      setSyncStatus('offline');
    } finally {
      setSaving(false);
    }
  };

  // ✅ MARQUER TÂCHE COMME TERMINÉE
  const toggleTask = async (sectionId, taskId) => {
    const task = formationData[sectionId]?.tasks?.find(t => t.id === taskId);
    if (!task) return;
    
    const newCompleted = new Set(completedTasks);
    const wasCompleted = newCompleted.has(taskId);
    
    if (wasCompleted) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
      
      // 🎯 GAGNER XP POUR NOUVELLE TÂCHE
      if (user?.uid) {
        try {
          await firebaseRestService.syncXpRest(user.uid, task.xp, newCompleted.size);
        } catch (error) {
          console.warn('⚠️ Sync XP échoué, progression locale conservée');
        }
      }
    }
    
    setCompletedTasks(newCompleted);
  };

  // 📊 CALCULS STATISTIQUES
  const totalTasks = Object.values(formationData).reduce((sum, section) => sum + section.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
  const earnedXp = Object.values(formationData)
    .flatMap(section => section.tasks)
    .filter(task => completedTasks.has(task.id))
    .reduce((sum, task) => sum + task.xp, 0);

  // 🎨 ICÔNE STATUT SYNC
  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'online': return <Cloud className="w-4 h-4 text-green-500" />;
      case 'syncing': return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-gray-500" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  // 📱 INTERFACE
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* 🎯 HEADER AVEC PROGRESSION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                🧠 Intégration Brain
              </h1>
              <p className="text-gray-400 mt-2">
                Bienvenue ! Voici tes premières étapes pour te sentir chez toi et découvrir l'esprit Brain.
              </p>
            </div>
            
            {/* 💾 STATUT SYNC */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {getSyncIcon()}
                <span>
                  {syncStatus === 'online' && lastSaved && `Sauvegardé ${lastSaved.toLocaleTimeString()}`}
                  {syncStatus === 'syncing' && 'Synchronisation...'}
                  {syncStatus === 'offline' && 'Hors ligne'}
                </span>
              </div>
              
              {saving && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Save className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Sauvegarde...</span>
                </div>
              )}
            </div>
          </div>

          {/* 📊 BARRE DE PROGRESSION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{completedCount} / {totalTasks} tâches terminées</span>
              <span>⭐ {earnedXp} XP gagnés</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            
            <div className="text-center">
              <span className="text-lg font-semibold text-white">
                {Math.round(progressPercentage)}% terminé
              </span>
            </div>
          </div>
        </motion.div>

        {/* 📚 SECTIONS DE FORMATION */}
        <div className="space-y-6">
          {Object.values(formationData).map((section, sectionIndex) => {
            const sectionCompleted = section.tasks.every(task => completedTasks.has(task.id));
            const sectionProgress = section.tasks.filter(task => completedTasks.has(task.id)).length;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border transition-all duration-300 ${
                  sectionCompleted 
                    ? 'border-green-500/50 bg-green-900/20' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                {/* 📋 HEADER SECTION */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => {
                    const newExpanded = new Set(expandedSections);
                    if (isExpanded) {
                      newExpanded.delete(section.id);
                    } else {
                      newExpanded.add(section.id);
                    }
                    setExpandedSections(newExpanded);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        sectionCompleted 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {sectionCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {section.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {section.description} • {section.estimatedTime}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{sectionProgress} / {section.tasks.length} tâches</span>
                          <span>⭐ {section.tasks.reduce((sum, task) => sum + (completedTasks.has(task.id) ? task.xp : 0), 0)} XP</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {sectionCompleted && (
                        <Award className="w-6 h-6 text-yellow-400" />
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 📋 TÂCHES */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-3">
                        {section.tasks.map((task, taskIndex) => {
                          const isCompleted = completedTasks.has(task.id);
                          
                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: taskIndex * 0.05 }}
                              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                isCompleted
                                  ? 'bg-green-900/30 border-green-500/30 text-green-100'
                                  : 'bg-gray-700/30 border-gray-600/30 text-gray-100 hover:bg-gray-700/50 hover:border-gray-500/50'
                              }`}
                              onClick={() => toggleTask(section.id, task.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {isCompleted ? (
                                    <CheckSquare className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <Square className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-medium ${isCompleted ? 'line-through text-green-300' : ''}`}>
                                      {task.label}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <Star className="w-4 h-4 text-yellow-400" />
                                      <span className="text-sm font-medium">+{task.xp} XP</span>
                                    </div>
                                  </div>
                                  
                                  <p className={`text-sm ${isCompleted ? 'text-green-400/80' : 'text-gray-400'}`}>
                                    {task.description}
                                  </p>
                                  
                                  {isCompleted && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Tâche terminée</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* 🎉 MESSAGE DE FÉLICITATIONS */}
        {progressPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Félicitations ! Intégration terminée !
              </h2>
              <p className="text-gray-300 mb-4">
                Tu as terminé toutes les étapes d'intégration chez Brain. 
                Bienvenue officiellement dans l'équipe !
              </p>
              <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">{earnedXp} XP total</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Badge "Nouveau Brainy" débloqué</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 📱 DEBUG (MODE DEV) */}
        {import.meta.env.DEV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="mt-8 bg-gray-900/50 rounded-lg p-4 text-xs text-gray-400"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Debug Info:</strong>
                <div>User: {user?.email}</div>
                <div>Completed: {Array.from(completedTasks).join(', ')}</div>
                <div>Progress: {Math.round(progressPercentage)}%</div>
              </div>
              <div>
                <strong>Sync Status:</strong>
                <div>Mode: {syncStatus}</div>
                <div>Saving: {saving ? 'Yes' : 'No'}</div>
                <div>Last Saved: {lastSaved?.toLocaleString() || 'Never'}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
