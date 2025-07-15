// ==========================================
// 📁 react-app/src/components/onboarding/SkillsAcquisition.jsx
// COMPOSANT ACQUISITION COMPÉTENCES GAME MASTER - VERSION FINALE
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  Clock, 
  Star, 
  Award,
  Users,
  Calendar,
  MessageSquare,
  AlertCircle,
  Zap,
  Trophy,
  Plus,
  RefreshCw,
  Play,
  Camera,
  Volume2,
  Gamepad2
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import SkillsAcquisitionService, { 
  BRAIN_EXPERIENCES, 
  EXPERIENCE_SKILLS,
  WEEKLY_FOLLOW_UP_TEMPLATE 
} from '../../core/services/skillsAcquisitionService.js';

const SkillsAcquisition = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [skillsProfile, setSkillsProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeCategory, setActiveCategory] = useState('decouverte_immersion');
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [weeklyFollowUp, setWeeklyFollowUp] = useState(WEEKLY_FOLLOW_UP_TEMPLATE);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // 🔄 Toggle une compétence Game Master
  const toggleSkill = useCallback(async (skillId) => {
    if (!user?.uid) return;
    
    try {
      const result = await SkillsAcquisitionService.toggleSkill(
        user.uid, 
        'gamemaster', 
        skillId
      );
      
      if (result.success) {
        await loadSkillsData();
      }
    } catch (error) {
      console.error('❌ Erreur toggle compétence Game Master:', error);
    }
  }, [user?.uid]);

  // 📊 Charger les données Game Master
  const loadSkillsData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await SkillsAcquisitionService.getSkillsProfile(user.uid);
      
      if (result.success) {
        setSkillsProfile(result.data);
        setStats(SkillsAcquisitionService.calculateProfileStats(result.data));
      } else {
        console.log('📝 Profil Game Master non trouvé');
        setSkillsProfile(null);
        setStats(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement Game Master:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🚀 Initialiser le profil Game Master
  const initializeGameMasterProfile = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await SkillsAcquisitionService.createSkillsProfile(user.uid, ['gamemaster']);
      
      if (result.success) {
        await loadSkillsData();
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Game Master:', error);
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
      }
    } catch (error) {
      console.error('❌ Erreur soumission suivi Game Master:', error);
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
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md mx-auto mb-8">
          <div className="text-3xl mb-4">🎮</div>
          <h4 className="text-lg font-semibold text-white mb-2">
            Game Master Brain
          </h4>
          <p className="text-gray-400 text-sm mb-4">
            Formation complète pour animer Psychiatric, Prison, Back to the 80's et Quiz Game
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>4-6 semaines</span>
            <span className="px-2 py-1 rounded text-xs bg-yellow-900 text-yellow-300">
              Intermédiaire
            </span>
          </div>
        </div>
        
        <button
          onClick={initializeGameMasterProfile}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Commencer ma formation Game Master
        </button>
      </div>
    );
  }

  const gameMasterExp = skillsProfile.experiences.gamemaster;
  const allSkills = EXPERIENCE_SKILLS.gamemaster;

  return (
    <div className="space-y-6">
      
      {/* 📊 Statistiques Game Master */}
      {stats && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              🎮 Formation Game Master Brain
              {stats.isGameMasterCertified && (
                <span className="ml-3 px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm">
                  ✅ CERTIFIÉ
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowWeeklyModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center text-sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Suivi hebdomadaire
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.validatedSkills}/{stats.totalSkills}
              </div>
              <div className="text-sm text-gray-400">Compétences validées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.selfAssessedSkills}/{stats.totalSkills}
              </div>
              <div className="text-sm text-gray-400">Auto-évaluées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageCompletionRate}%
              </div>
              <div className="text-sm text-gray-400">Progression</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.weeklyFollowUps}
              </div>
              <div className="text-sm text-gray-400">Suivis hebdo</div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Navigation par catégories */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(allSkills).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="ml-2 text-sm">{getCategoryName(category)}</span>
            </button>
          ))}
        </div>

        {/* 📋 Compétences de la catégorie sélectionnée */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4">
            {getCategoryName(activeCategory)}
          </h3>
          
          {allSkills[activeCategory]?.map((skill) => {
            const skillStatus = gameMasterExp.skills[skill.id];
            const isCompleted = skillStatus?.completed;
            const isSelfAssessed = skillStatus?.selfAssessment;
            const isValidated = skillStatus?.validatedBy;
            
            return (
              <div
                key={skill.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isCompleted 
                    ? 'bg-green-900 border-green-500' 
                    : isSelfAssessed
                    ? 'bg-blue-900 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => toggleSkill(skill.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    ) : isSelfAssessed ? (
                      <Clock className="h-5 w-5 text-blue-500 mr-3" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-400 rounded-full mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-white text-sm">
                        {skill.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {skill.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isSelfAssessed && (
                      <span className="px-2 py-1 bg-blue-800 text-blue-300 rounded text-xs">
                        Auto-évalué
                      </span>
                    )}
                    {isValidated && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📝 Modal suivi hebdomadaire */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                🎮 Suivi Hebdomadaire Game Master
              </h3>
              <button
                onClick={() => setShowWeeklyModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={2}
                  placeholder="Avez-vous besoin d'aide sur des aspects spécifiques ?"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Soumettre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsAcquisition;
