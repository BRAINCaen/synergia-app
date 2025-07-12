// ==========================================
// 📁 react-app/src/components/admin/AdminSkillsValidation.jsx
// INTERFACE ADMIN - VALIDATION COMPÉTENCES & ENTRETIENS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  User, 
  Calendar, 
  Star,
  Award,
  FileText,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Edit,
  Save,
  AlertCircle,
  Eye,
  Users,
  Target
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { 
  SkillsAcquisitionService, 
  BRAIN_EXPERIENCES, 
  EXPERIENCE_SKILLS, 
  EXPERIENCE_BADGES 
} from '../../core/services/skillsAcquisitionService.js';

const AdminSkillsValidation = () => {
  const { user } = useAuthStore();
  const [allProfiles, setAllProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('validation');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExperience, setFilterExperience] = useState('all');
  
  // État pour la validation de compétences
  const [validationComments, setValidationComments] = useState({});
  const [validatingSkills, setValidatingSkills] = useState({});
  
  // État pour l'entretien
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewData, setInterviewData] = useState({
    competencesTechniques: '',
    difficultesRencontrees: '',
    situationsMarquantes: '',
    competencesApprofondir: '',
    besoinAide: '',
    feedbackReferent: '',
    globalAssessment: '',
    nextSteps: '',
    rating: 0
  });

  // 📊 Charger tous les profils de compétences
  const loadAllProfiles = async () => {
    try {
      setLoading(true);
      const result = await SkillsAcquisitionService.getAllSkillsProfiles();
      
      if (result.success) {
        setAllProfiles(result.profiles);
        
        // Sélectionner le premier profil par défaut
        if (result.profiles.length > 0) {
          setSelectedProfile(result.profiles[0]);
          const firstExp = Object.keys(result.profiles[0].experiences)[0];
          if (firstExp) setSelectedExperience(firstExp);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profils:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Valider une compétence
  const validateSkill = async (userId, experienceId, skillId, validated, comments = '') => {
    try {
      setValidatingSkills(prev => ({ ...prev, [skillId]: true }));
      
      await SkillsAcquisitionService.adminValidateSkill(
        userId, 
        experienceId, 
        skillId, 
        user.uid, 
        validated, 
        comments
      );
      
      // Recharger les données
      await loadAllProfiles();
      
      // Réinitialiser le commentaire
      setValidationComments(prev => ({ ...prev, [skillId]: '' }));
      
    } catch (error) {
      console.error('Erreur validation compétence:', error);
    } finally {
      setValidatingSkills(prev => ({ ...prev, [skillId]: false }));
    }
  };

  // 🎤 Soumettre un entretien
  const submitInterview = async () => {
    if (!selectedProfile || !selectedExperience) return;
    
    try {
      await SkillsAcquisitionService.addAdminInterview(
        selectedProfile.userId,
        user.uid,
        {
          ...interviewData,
          experienceId: selectedExperience
        }
      );
      
      // Réinitialiser le formulaire
      setInterviewData({
        competencesTechniques: '',
        difficultesRencontrees: '',
        situationsMarquantes: '',
        competencesApprofondir: '',
        besoinAide: '',
        feedbackReferent: '',
        globalAssessment: '',
        nextSteps: '',
        rating: 0
      });
      
      setShowInterviewForm(false);
      await loadAllProfiles();
      
    } catch (error) {
      console.error('Erreur soumission entretien:', error);
    }
  };

  // 🔍 Filtrer les profils
  const filteredProfiles = allProfiles.filter(profile => {
    const matchesSearch = profile.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (profile.personalInfo?.firstName + ' ' + profile.personalInfo?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterExperience === 'all' || 
                         Object.keys(profile.experiences).includes(filterExperience);
    
    return matchesSearch && matchesFilter;
  });

  // 📊 Calculer les statistiques globales
  const calculateGlobalStats = () => {
    const totalUsers = allProfiles.length;
    const activeUsers = allProfiles.filter(p => Object.keys(p.experiences).length > 0).length;
    const completedExperiences = allProfiles.reduce((acc, p) => 
      acc + Object.values(p.experiences).filter(exp => exp.completed).length, 0
    );
    const pendingValidations = allProfiles.reduce((acc, p) => 
      acc + Object.values(p.experiences).reduce((expAcc, exp) => 
        expAcc + Object.values(exp.skills).filter(skill => skill.selfAssessment && !skill.completed).length, 0
      ), 0
    );
    
    return { totalUsers, activeUsers, completedExperiences, pendingValidations };
  };

  useEffect(() => {
    loadAllProfiles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Chargement des profils...</span>
      </div>
    );
  }

  const globalStats = calculateGlobalStats();
  const profile = selectedProfile;
  const experience = profile?.experiences[selectedExperience];
  const experienceData = BRAIN_EXPERIENCES[selectedExperience?.toUpperCase()];

  return (
    <div className="space-y-6">
      
      {/* Header avec statistiques globales */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Award className="w-8 h-8 mr-3 text-purple-600" />
          Administration - Validation de Compétences
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{globalStats.totalUsers}</div>
            <div className="text-sm text-gray-600">Utilisateurs total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{globalStats.activeUsers}</div>
            <div className="text-sm text-gray-600">Utilisateurs actifs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{globalStats.completedExperiences}</div>
            <div className="text-sm text-gray-600">Expériences terminées</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{globalStats.pendingValidations}</div>
            <div className="text-sm text-gray-600">Validations en attente</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar - Liste des utilisateurs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            
            {/* Filtres et recherche */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Toutes les expériences</option>
                {Object.values(BRAIN_EXPERIENCES).map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.name}</option>
                ))}
              </select>
            </div>

            {/* Liste des utilisateurs */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredProfiles.map((profileItem) => {
                const isSelected = selectedProfile?.userId === profileItem.userId;
                const stats = SkillsAcquisitionService.calculateProfileStats(profileItem);
                
                return (
                  <div
                    key={profileItem.userId}
                    onClick={() => {
                      setSelectedProfile(profileItem);
                      const firstExp = Object.keys(profileItem.experiences)[0];
                      if (firstExp) setSelectedExperience(firstExp);
                    }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {profileItem.personalInfo?.firstName || profileItem.userId} {profileItem.personalInfo?.lastName || ''}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{stats.completedExperiences}/{stats.totalExperiences} expériences</div>
                      <div>{stats.validatedSkills}/{stats.totalSkills} compétences</div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-purple-500 h-1 rounded-full"
                          style={{ width: `${stats.averageCompletionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Indicateur validations en attente */}
                    {Object.values(profileItem.experiences).some(exp => 
                      Object.values(exp.skills).some(skill => skill.selfAssessment && !skill.completed)
                    ) && (
                      <div className="mt-2">
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                          Validations en attente
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredProfiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          
          {!profile ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sélectionnez un utilisateur
              </h3>
              <p className="text-gray-600">
                Choisissez un utilisateur dans la liste pour valider ses compétences
              </p>
            </div>
          ) : (
            <>
              {/* Sélection d'expérience */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {profile.personalInfo?.firstName || profile.userId} {profile.personalInfo?.lastName || ''}
                    </h2>
                    <p className="text-gray-600">ID: {profile.userId}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {Object.keys(profile.experiences).map((expId) => {
                      const exp = BRAIN_EXPERIENCES[expId.toUpperCase()];
                      const expData = profile.experiences[expId];
                      const isSelected = selectedExperience === expId;
                      
                      if (!exp) return null;
                      
                      return (
                        <button
                          key={expId}
                          onClick={() => setSelectedExperience(expId)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg">{exp.icon}</div>
                          <div>
                            <div className="font-medium text-sm">{exp.name}</div>
                            {expData.completed && (
                              <div className="text-xs text-green-600">✅ Certifié</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-lg mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'validation', label: 'Validation Compétences', icon: <CheckCircle2 className="w-4 h-4" /> },
                      { id: 'interview', label: 'Entretien', icon: <MessageSquare className="w-4 h-4" /> },
                      { id: 'history', label: 'Historique', icon: <Clock className="w-4 h-4" /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Contenu des tabs */}
              {activeTab === 'validation' && experience && (
                <div className="space-y-6">
                  
                  {/* Header expérience */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{experienceData?.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{experienceData?.name}</h3>
                          <p className="text-gray-600">{experienceData?.description}</p>
                        </div>
                      </div>
                      
                      {experience.completed && (
                        <div className="flex items-center space-x-2 bg-green-100 text-green-600 px-4 py-2 rounded-lg">
                          <Award className="w-5 h-5" />
                          <span className="font-medium">Certifié Expert</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compétences par catégorie */}
                  {Object.entries(EXPERIENCE_SKILLS[selectedExperience] || {}).map(([categoryName, skills]) => (
                    <div key={categoryName} className="bg-white rounded-xl shadow-lg p-6">
                      <h4 className="text-lg font-bold text-gray-800 mb-6 capitalize">
                        {categoryName.replace('_', ' ')}
                      </h4>
                      
                      <div className="space-y-4">
                        {skills.map((skill) => {
                          const skillData = experience.skills[skill.id];
                          const isCompleted = skillData?.completed;
                          const isSelfAssessed = skillData?.selfAssessment;
                          const isValidating = validatingSkills[skill.id];
                          
                          return (
                            <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start space-x-4">
                                
                                {/* Statut */}
                                <div className="flex-shrink-0 mt-1">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                  ) : isSelfAssessed ? (
                                    <AlertCircle className="w-6 h-6 text-orange-500" />
                                  ) : (
                                    <XCircle className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800 mb-2">{skill.title}</p>
                                  
                                  {/* Commentaires existants */}
                                  {skillData?.adminComments && (
                                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                                      <p className="text-sm text-blue-700">
                                        💬 Commentaire précédent: {skillData.adminComments}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Zone de commentaire pour validation */}
                                  {isSelfAssessed && !isCompleted && (
                                    <div className="space-y-3">
                                      <textarea
                                        value={validationComments[skill.id] || ''}
                                        onChange={(e) => setValidationComments(prev => ({
                                          ...prev,
                                          [skill.id]: e.target.value
                                        }))}
                                        placeholder="Commentaires de validation (optionnel)..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        rows="2"
                                      />
                                      
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => validateSkill(
                                            profile.userId, 
                                            selectedExperience, 
                                            skill.id, 
                                            true, 
                                            validationComments[skill.id] || ''
                                          )}
                                          disabled={isValidating}
                                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                          {isValidating ? '...' : '✅ Valider'}
                                        </button>
                                        
                                        <button
                                          onClick={() => validateSkill(
                                            profile.userId, 
                                            selectedExperience, 
                                            skill.id, 
                                            false, 
                                            validationComments[skill.id] || 'Compétence non validée'
                                          )}
                                          disabled={isValidating}
                                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                          {isValidating ? '...' : '❌ Refuser'}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Statuts */}
                                  <div className="flex items-center space-x-2 mt-3">
                                    {isSelfAssessed && (
                                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                        Auto-évaluée
                                      </span>
                                    )}
                                    {isCompleted && (
                                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                        ✅ Validée
                                      </span>
                                    )}
                                    {skillData?.validationDate && (
                                      <span className="text-xs text-gray-500">
                                        {skillData.validationDate.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Entretien */}
              {activeTab === 'interview' && (
                <div className="space-y-6">
                  
                  {/* Bouton Nouvel entretien */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Entretien de Suivi</h3>
                        <p className="text-gray-600">Réaliser un entretien structuré avec commentaires</p>
                      </div>
                      <button
                        onClick={() => setShowInterviewForm(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        + Nouvel entretien
                      </button>
                    </div>
                  </div>

                  {/* Formulaire d'entretien */}
                  {showInterviewForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h4 className="text-lg font-bold text-gray-800 mb-6">
                        Entretien - {experienceData?.name}
                      </h4>
                      
                      <div className="space-y-6">
                        
                        {/* Questions structurées */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              1. Compétences techniques acquises cette semaine
                            </label>
                            <textarea
                              value={interviewData.competencesTechniques}
                              onChange={(e) => setInterviewData({...interviewData, competencesTechniques: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows="3"
                              placeholder="Nouvelles compétences maîtrisées..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              2. Difficultés rencontrées
                            </label>
                            <textarea
                              value={interviewData.difficultesRencontrees}
                              onChange={(e) => setInterviewData({...interviewData, difficultesRencontrees: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows="3"
                              placeholder="Technique, animation, relationnel..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              3. Situations marquantes
                            </label>
                            <textarea
                              value={interviewData.situationsMarquantes}
                              onChange={(e) => setInterviewData({...interviewData, situationsMarquantes: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows="3"
                              placeholder="Incident, stress, réussite, retour client..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              4. Compétences à approfondir
                            </label>
                            <textarea
                              value={interviewData.competencesApprofondir}
                              onChange={(e) => setInterviewData({...interviewData, competencesApprofondir: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows="3"
                              placeholder="Objectifs d'amélioration..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              5. Besoin d'aide ou formation
                            </label>
                            <textarea
                              value={interviewData.besoinAide}
                              onChange={(e) => setInterviewData({...interviewData, besoinAide: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows="3"
                              placeholder="Besoins spécifiques..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              6. Feedback du référent
                            </label>
                            <textarea
                              value={interviewData.feedbackReferent}
                              onChange={(e) => setInterviewData({...interviewData, feedbackReferent: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              rows="3"
                              placeholder="Retours et conseils..."
                            />
                          </div>
                        </div>
                        
                        {/* Évaluation globale */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Évaluation globale
                          </label>
                          <textarea
                            value={interviewData.globalAssessment}
                            onChange={(e) => setInterviewData({...interviewData, globalAssessment: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows="3"
                            placeholder="Synthèse de la progression et recommandations..."
                          />
                        </div>
                        
                        {/* Prochaines étapes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prochaines étapes
                          </label>
                          <textarea
                            value={interviewData.nextSteps}
                            onChange={(e) => setInterviewData({...interviewData, nextSteps: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows="2"
                            placeholder="Objectifs et actions pour la période suivante..."
                          />
                        </div>
                        
                        {/* Note */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Note globale (/5)
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setInterviewData({...interviewData, rating: star})}
                                className={`w-8 h-8 ${
                                  star <= interviewData.rating 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              >
                                <Star className="w-full h-full" />
                              </button>
                            ))}
                            <span className="ml-2 text-gray-600">
                              {interviewData.rating > 0 ? `${interviewData.rating}/5` : 'Non noté'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={submitInterview}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            💾 Enregistrer l'entretien
                          </button>
                          <button
                            onClick={() => setShowInterviewForm(false)}
                            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Historique des entretiens */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Historique des entretiens</h4>
                    
                    {profile.adminInterviews?.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Aucun entretien enregistré</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profile.adminInterviews
                          ?.filter(interview => interview.experienceId === selectedExperience)
                          ?.map((interview, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="font-medium text-gray-800">
                                Entretien #{index + 1}
                              </div>
                              <div className="flex items-center space-x-4">
                                {interview.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm text-gray-600">{interview.rating}/5</span>
                                  </div>
                                )}
                                <div className="text-sm text-gray-500">
                                  {interview.date?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {interview.globalAssessment && (
                                <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg">
                                  <span className="font-medium text-purple-700">Évaluation globale :</span>
                                  <p className="text-purple-600 mt-1">{interview.globalAssessment}</p>
                                </div>
                              )}
                              
                              {interview.competencesTechniques && (
                                <div>
                                  <span className="font-medium text-gray-700">Compétences techniques :</span>
                                  <p className="text-gray-600 mt-1">{interview.competencesTechniques}</p>
                                </div>
                              )}
                              
                              {interview.difficultesRencontrees && (
                                <div>
                                  <span className="font-medium text-gray-700">Difficultés :</span>
                                  <p className="text-gray-600 mt-1">{interview.difficultesRencontrees}</p>
                                </div>
                              )}
                              
                              {interview.nextSteps && (
                                <div className="md:col-span-2 bg-green-50 p-4 rounded-lg">
                                  <span className="font-medium text-green-700">Prochaines étapes :</span>
                                  <p className="text-green-600 mt-1">{interview.nextSteps}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab Historique */}
              {activeTab === 'history' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Historique des validations</h4>
                  
                  {experience?.adminValidations?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>Aucune validation enregistrée</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {experience?.adminValidations?.map((validation, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            validation.validated ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {validation.validated ? '✓' : '✗'}
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              Compétence {validation.skillId}
                            </div>
                            {validation.comments && (
                              <div className="text-sm text-gray-600 mt-1">
                                💬 {validation.comments}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            {validation.date?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSkillsValidation;
