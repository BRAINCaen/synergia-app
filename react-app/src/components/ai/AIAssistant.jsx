// ==========================================
// react-app/src/components/ai/AIAssistant.jsx
// COMPOSANT ASSISTANT IA NOVA
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Sparkles,
  Target,
  Lightbulb,
  Trophy,
  HelpCircle,
  ChevronRight,
  Zap,
  RefreshCw,
  MessageCircle,
  BookOpen
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore';
import aiAssistantService from '../../core/services/aiAssistantService';

// ==========================================
// COMPOSANT BULLE ASSISTANT
// ==========================================

const AssistantBubble = ({ onClick, hasNotification = false }) => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center"
    >
      {/* Pulse animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute inset-0 bg-purple-500 rounded-full"
      />

      {/* Icon */}
      <Bot className="w-7 h-7 text-white relative z-10" />

      {/* Notification dot */}
      {hasNotification && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
        />
      )}
    </motion.button>
  );
};

// ==========================================
// CARTE DE SUGGESTION
// ==========================================

const SuggestionCard = ({ suggestion, onAccept, onRefresh }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 rounded-xl p-4 border border-white/20"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{suggestion.icon}</div>
        <div className="flex-1">
          <h4 className="text-white font-medium">{suggestion.title}</h4>
          <p className="text-gray-400 text-sm mt-1">{suggestion.reason}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-400 text-sm flex items-center gap-1">
              <Zap className="w-3 h-3" />
              +{suggestion.xp} XP
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              suggestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              suggestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              suggestion.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {suggestion.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAccept(suggestion)}
          className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
        >
          Accepter la quête
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ==========================================
// PANNEAU ASSISTANT
// ==========================================

const AIAssistantPanel = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('suggestions');
  const [greeting, setGreeting] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    if (isOpen && user?.uid) {
      loadInitialData();
    }
  }, [isOpen, user?.uid]);

  const loadInitialData = async () => {
    setLoading(true);

    // Greeting
    const greet = aiAssistantService.getGreeting(user?.displayName);
    setGreeting(greet);

    // Suggestions
    const suggestedQuests = await aiAssistantService.generateQuestSuggestions(user.uid, 3);
    setSuggestions(suggestedQuests);

    // Tip
    const personalTip = await aiAssistantService.getPersonalizedTip(user.uid);
    setTip(personalTip);

    setLoading(false);
  };

  const refreshSuggestions = async () => {
    setLoading(true);
    const newSuggestions = await aiAssistantService.generateQuestSuggestions(user.uid, 3);
    setSuggestions(newSuggestions);
    setLoading(false);
  };

  const refreshTip = async () => {
    const newTip = await aiAssistantService.getPersonalizedTip(user.uid);
    setTip(newTip);
  };

  const handleAcceptQuest = (quest) => {
    // TODO: Créer la quête dans le système
    console.log('Quête acceptée:', quest);
    // Afficher un message de succès
  };

  const tabs = [
    { id: 'suggestions', label: 'Suggestions', icon: Sparkles },
    { id: 'tips', label: 'Conseils', icon: Lightbulb },
    { id: 'tutorial', label: 'Tutoriel', icon: BookOpen }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-l border-white/10 z-[61] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Nova</h2>
                    <p className="text-gray-400 text-sm">Ton assistant Synergia</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              {/* Greeting */}
              {greeting && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-purple-500/20 rounded-xl"
                >
                  <p className="text-purple-200 text-sm">
                    {greeting.emoji} {greeting.message}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 200px)' }}>
              {/* Tab Suggestions */}
              {activeTab === 'suggestions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Quêtes suggérées pour toi
                    </h3>
                    <motion.button
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                      onClick={refreshSuggestions}
                      disabled={loading}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </motion.button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={suggestion.id || index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <SuggestionCard
                            suggestion={suggestion}
                            onAccept={handleAcceptQuest}
                            onRefresh={refreshSuggestions}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Tips */}
              {activeTab === 'tips' && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Conseil du moment
                  </h3>

                  {tip && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30"
                    >
                      <p className="text-yellow-100">{tip.tip}</p>
                      <div className="flex justify-end mt-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={refreshTip}
                          className="text-yellow-400 text-sm flex items-center gap-1 hover:text-yellow-300"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Autre conseil
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Encouragement */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-green-500/20 rounded-xl p-4 border border-green-500/30 mt-4"
                  >
                    <p className="text-green-200">
                      {aiAssistantService.getEncouragement().message}
                    </p>
                  </motion.div>

                  {/* Quick Actions */}
                  <div className="mt-6">
                    <h4 className="text-gray-400 text-sm mb-3">Actions rapides</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Target, label: 'Voir mes quêtes', color: 'purple' },
                        { icon: Trophy, label: 'Mes badges', color: 'yellow' },
                        { icon: Zap, label: 'Envoyer un boost', color: 'blue' },
                        { icon: HelpCircle, label: 'Aide', color: 'gray' }
                      ].map((action, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3 bg-${action.color}-500/20 hover:bg-${action.color}-500/30 rounded-xl text-white text-sm flex items-center gap-2 transition-colors`}
                        >
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Tutorial */}
              {activeTab === 'tutorial' && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Tutoriel interactif
                  </h3>

                  <div className="space-y-3">
                    {aiAssistantService.getTutorialSteps().map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border transition-all ${
                          tutorialStep === index
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : tutorialStep > index
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            tutorialStep > index
                              ? 'bg-green-500 text-white'
                              : tutorialStep === index
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-gray-400'
                          }`}>
                            {tutorialStep > index ? '✓' : index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{step.title}</h4>
                            {tutorialStep === index && (
                              <p className="text-gray-400 text-sm mt-1">{step.message}</p>
                            )}
                          </div>
                          {tutorialStep === index && (
                            <motion.button
                              whileHover={{ x: 5 }}
                              onClick={() => setTutorialStep(prev => Math.min(prev + 1, aiAssistantService.getTutorialSteps().length - 1))}
                              className="p-2 bg-purple-500 rounded-lg"
                            >
                              <ChevronRight className="w-4 h-4 text-white" />
                            </motion.button>
                          )}
                        </div>

                        {step.xpReward && tutorialStep === index && (
                          <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                            <Zap className="w-4 h-4" />
                            +{step.xpReward} XP à la fin !
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {tutorialStep === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTutorialStep(1)}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium"
                    >
                      Commencer le tutoriel
                    </motion.button>
                  )}

                  {tutorialStep > 0 && (
                    <button
                      onClick={() => setTutorialStep(0)}
                      className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      Recommencer
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const AIAssistant = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);

  // Vérifier les préférences utilisateur
  useEffect(() => {
    if (!user?.uid) return;

    const checkPreference = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../core/firebase.js');

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const aiEnabled = userData.preferences?.interface?.aiAssistant ?? true;
          setIsEnabled(aiEnabled);
        }
      } catch (error) {
        console.log('ℹ️ Préférence IA non trouvée, activation par défaut');
        setIsEnabled(true);
      }
    };

    checkPreference();
  }, [user?.uid]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNotification(false);
  };

  // Ne pas afficher si désactivé
  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <AssistantBubble
        onClick={handleOpen}
        hasNotification={hasNotification}
      />
      <AIAssistantPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default AIAssistant;
