// ==========================================
// 📁 react-app/src/components/onboarding/SkillsAcquisition.jsx
// SKILLS ACQUISITION AVEC MODAL CORRIGÉ
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  Camera, 
  Users, 
  Gamepad2, 
  CheckCircle, 
  Circle, 
  RefreshCw, 
  Calendar, 
  Award, 
  TrendingUp,
  FileCheck,
  X,
  Send
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { SkillsAcquisitionService, GAME_MASTER_SKILLS, WEEKLY_FOLLOW_UP_TEMPLATE } from '../../core/services/skillsAcquisitionService.js';

const SkillsAcquisition = () => {
  const { user } = useAuthStore();
  
  // États
  const [skillsProfile, setSkillsProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [weeklyFollowUp, setWeeklyFollowUp] = useState(WEEKLY_FOLLOW_UP_TEMPLATE);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // 📊 Charger les données existantes
  const loadSkillsData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('📊 Chargement données Game Master...');
      const result = await SkillsAcquisitionService.getSkillsProfile(user.uid);
      
      if (result.success) {
        console.log('✅ Profil Game Master trouvé');
        setSkillsProfile(result.data);
        setStats(SkillsAcquisitionService.calculateProfileStats(result.data));
      } else {
        console.log('📝 Profil Game Master non trouvé');
        setSkillsProfile(null);
        setStats(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement Game Master:', error);
      setSkillsProfile(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🚀 Initialiser le profil Game Master
  const initializeGameMasterProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('🚀 Initialisation profil Game Master...');
      const result = await SkillsAcquisitionService.createSkillsProfile(user.uid, ['gamemaster']);
      
      if (result.success) {
        console.log('✅ Profil Game Master créé');
        await loadSkillsData();
      } else {
        console.error('❌ Échec création profil Game Master');
        alert('Erreur lors de la création du profil Game Master');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Game Master:', error);
      alert('Erreur lors de l\'initialisation du profil Game Master');
    } finally {
      setLoading(false);
    }
  };

  // 📝 Soumettre le suivi hebdomadaire
  const submitWeeklyFollowUp = async () => {
    if (!user?.uid) return;
    
    try {
      setSubmittingFollowUp(true);
      
      const result = await SkillsAcquisitionService.addWeeklyFollowUp(
        user.uid,
        'gamemaster',
        weeklyFollowUp
      );
      
      if (result.success) {
        setShowWeeklyModal(false);
        setWeeklyFollowUp(WEEKLY_FOLLOW_UP_TEMPLATE);
        await loadSkillsData();
        console.log('✅ Suivi hebdomadaire soumis');
      }
    } catch (error) {
      console.error('❌ Erreur soumission suivi Game Master:', error);
      alert('Erreur lors de la soumission du suivi hebdomadaire');
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  // 🔄 Charger les données au montage
  useEffect(() => {
    loadSkillsData();
  }, [loadSkillsData]);

  // 🎨 Icônes par catégorie
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'decouverte_immersion': return <BookOpen className="h-5 w-5" />;
      case 'gestion_technique': return <Camera className="h-5 w-5" />;
      case 'animation_clients': return <Users className="h-5 w-5" />;
      case 'quiz_game': return <Gamepad2 className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  // 🎨 Noms des catégories
  const getCategoryName = (category) => {
    switch (category) {
      case 'decouverte_immersion': return 'Découverte & Immersion';
      case 'gestion_technique': return 'Gestion Technique';
      case 'animation_clients': return 'Animation Clients';
      case 'quiz_game': return 'Quiz Game';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement de votre parcours Game Master...</p>
        </div>
      </div>
    );
  }

  // Si aucun profil Game Master n'existe
  if (!skillsProfile) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🎮</div>
        <h3 className="text-xl font-semibold text-white mb-4">
          Formation Game Master Brain
        </h3>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Commencez votre formation complète de Game Master pour maîtriser l'animation 
          de toutes les expériences Brain : Psychiatric, Prison, Back to the 80's et Quiz Game.
        </p>
        <button
          onClick={initializeGameMasterProfile}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
        >
          <Target className="h-5 w-5 mr-2" />
          Commencer la Formation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📊 En-tête avec stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Formation Game Master</h2>
            <p className="opacity-90">Maîtrisez toutes les expériences Brain</p>
          </div>
          
          {stats && (
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
              <div className="text-sm opacity-80">Progression</div>
            </div>
          )}
        </div>
        
        {stats && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-xl font-bold">{stats.validatedSkills}</div>
              <div className="text-sm opacity-80">Compétences validées</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.weeklyFollowUps || 0}</div>
              <div className="text-sm opacity-80">Suivis hebdomadaires</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.totalSkills}</div>
              <div className="text-sm opacity-80">Compétences totales</div>
            </div>
          </div>
        )}
      </div>

      {/* 📋 Compétences par catégorie */}
      <div className="space-y-6">
        {Object.entries(GAME_MASTER_SKILLS).map(([categoryKey, skills]) => {
          const validatedCount = skills.filter(skill => 
            skillsProfile?.experiences?.gamemaster?.skills?.[skill.id]?.selfAssessment
          ).length;
          
          return (
            <motion.div
              key={categoryKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    {getCategoryIcon(categoryKey)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {getCategoryName(categoryKey)}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {validatedCount}/{skills.length} compétences validées
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400">Progression</div>
                  <div className="text-xl font-bold text-blue-400">
                    {Math.round((validatedCount / skills.length) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {skills.map((skill) => {
                  const isValidated = skillsProfile?.experiences?.gamemaster?.skills?.[skill.id]?.selfAssessment;
                  
                  return (
                    <div
                      key={skill.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isValidated ? 'bg-green-900/30 border border-green-700' : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isValidated ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <div className={`font-medium ${isValidated ? 'text-green-300' : 'text-white'}`}>
                            {skill.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {skill.description}
                          </div>
                        </div>
                      </div>
                      
                      {isValidated && (
                        <div className="flex items-center text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Validé
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 📝 Bouton suivi hebdomadaire */}
      <div className="text-center">
        <button
          onClick={() => setShowWeeklyModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
        >
          <FileCheck className="h-5 w-5 mr-2" />
          Suivi Hebdomadaire Game Master
        </button>
      </div>

      {/* 🏆 Progression globale - AVEC Z-INDEX RÉDUIT */}
      <div 
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white relative"
        style={{ zIndex: 1 }} // ← Z-INDEX RÉDUIT POUR ÉVITER LE CONFLIT
      >
        <div className="flex items-center space-x-3 mb-4">
          <Award className="h-6 w-6 text-yellow-300" />
          <h3 className="text-xl font-bold">Ta Progression Game Master</h3>
        </div>
        
        <p className="text-purple-100 mb-6">
          Chaque tâche cochée te fait progresser, te rapporte des XP, et te rapproche de nouveaux badges.
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">🎯</div>
            <div className="text-sm mt-1">Objectif</div>
            <div className="font-medium">Devenir rapidement autonome</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">📋</div>
            <div className="text-sm mt-1">Résultat</div>
            <div className="font-medium">Épanoui·e et reconnu·e</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">🤝</div>
            <div className="text-sm mt-1">Support</div>
            <div className="font-medium">Aide disponible à chaque étape</div>
          </div>
        </div>
      </div>

      {/* 📝 Modal suivi hebdomadaire - Z-INDEX MAXIMAL */}
      <AnimatePresence>
        {showWeeklyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
            style={{ zIndex: 9999 }} // ← Z-INDEX MAXIMAL
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700"
              style={{ 
                maxHeight: '90vh', 
                overflowY: 'auto',
                position: 'relative',
                zIndex: 10000 // ← Z-INDEX ENCORE PLUS ÉLEVÉ
              }}
            >
              {/* Header du modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">
                  🎮 Suivi Hebdomadaire Game Master
                </h3>
                <button
                  onClick={() => setShowWeeklyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu du modal */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Compétences techniques développées cette semaine
                  </label>
                  <textarea
                    value={weeklyFollowUp.competences_techniques}
                    onChange={(e) => setWeeklyFollowUp({
                      ...weeklyFollowUp,
                      competences_techniques: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Décrivez les compétences Game Master que vous avez développées..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficultés rencontrées
                  </label>
                  <textarea
                    value={weeklyFollowUp.difficultes_rencontrees}
                    onChange={(e) => setWeeklyFollowUp({
                      ...weeklyFollowUp,
                      difficultes_rencontrees: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Quelles difficultés avez-vous rencontrées dans votre formation ?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Situations marquantes
                  </label>
                  <textarea
                    value={weeklyFollowUp.situations_marquantes}
                    onChange={(e) => setWeeklyFollowUp({
                      ...weeklyFollowUp,
                      situations_marquantes: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Sessions marquantes, moments forts de la semaine..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Compétences à approfondir
                  </label>
                  <textarea
                    value={weeklyFollowUp.competences_approfondir}
                    onChange={(e) => setWeeklyFollowUp({
                      ...weeklyFollowUp,
                      competences_approfondir: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows={2}
                    placeholder="Sur quoi souhaitez-vous vous concentrer la semaine prochaine ?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Besoin d'aide ou de formation
                  </label>
                  <textarea
                    value={weeklyFollowUp.besoin_aide}
                    onChange={(e) => setWeeklyFollowUp({
                      ...weeklyFollowUp,
                      besoin_aide: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows={2}
                    placeholder="Avez-vous besoin d'aide sur des aspects spécifiques ?"
                  />
                </div>
              </div>

              {/* Footer du modal */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
                <button
                  onClick={() => setShowWeeklyModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={submitWeeklyFollowUp}
                  disabled={submittingFollowUp}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {submittingFollowUp ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Valider le Suivi
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillsAcquisition;
