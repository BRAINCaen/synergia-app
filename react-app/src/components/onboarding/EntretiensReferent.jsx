// ==========================================
// 📁 react-app/src/components/onboarding/EntretiensReferent.jsx
// SYSTÈME ENTRETIENS COMPLET CORRIGÉ - v3.5
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Edit, 
  MessageSquare,
  FileText,
  AlertCircle,
  Search,
  Filter,
  CalendarDays,
  Users,
  TrendingUp,
  Target,
  Star,
  Award,
  Phone,
  Video,
  MapPin,
  Send,
  Save,
  RotateCcw,
  Eye,
  Activity,
  BarChart3,
  Zap,
  Heart,
  Lightbulb,
  RefreshCw,
  Rocket,
  Coffee,
  X,
  Trash2,
  UserCheck,
  Gamepad2,
  Crown,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { ScheduleInterviewModalWithUsers } from './InterviewFormWithUsers.jsx';

// 🔥 IMPORTS FIREBASE
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// 🎯 TEMPLATES D'ENTRETIENS COMPLETS AVEC TYPES GAME MASTER
const INTERVIEW_TEMPLATES = {
  // ========== ENTRETIENS D'INTÉGRATION ==========
  initial: {
    id: 'initial',
    name: 'Entretien Initial',
    category: 'integration',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    duration: 60,
    description: 'Premier entretien d\'accueil et présentation',
    targetAudience: 'nouveaux',
    objectives: [
      'Accueillir le nouvel employé et le mettre à l\'aise',
      'Présenter l\'entreprise, ses valeurs et sa culture',
      'Définir les objectifs de formation et d\'intégration',
      'Identifier les attentes et motivations',
      'Planifier le parcours d\'onboarding personnalisé'
    ],
    questions: [
      'Comment vous sentez-vous pour ce premier jour chez nous ?',
      'Qu\'est-ce qui vous a motivé à rejoindre notre équipe ?',
      'Avez-vous des questions sur l\'organisation ou le fonctionnement ?',
      'Quels sont vos objectifs personnels pour cette formation ?',
      'Y a-t-il des domaines spécifiques que vous aimeriez approfondir ?',
      'Comment préférez-vous apprendre (pratique, théorie, observation) ?',
      'Avez-vous des expériences précédentes dans ce secteur ?'
    ]
  },
  
  weekly: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    category: 'integration',
    icon: CalendarDays,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
    duration: 30,
    description: 'Point régulier sur les progrès et difficultés',
    targetAudience: 'nouveaux',
    objectives: [
      'Faire le point sur les apprentissages de la semaine',
      'Identifier et résoudre les difficultés rencontrées',
      'Évaluer l\'intégration dans l\'équipe',
      'Ajuster le plan de formation si nécessaire',
      'Maintenir la motivation et l\'engagement'
    ],
    questions: [
      'Quelles sont les nouvelles compétences que vous avez développées cette semaine ?',
      'Quelles difficultés avez-vous rencontrées et comment les avez-vous surmontées ?',
      'Comment vous sentez-vous dans l\'équipe et avec vos collègues ?',
      'Avez-vous besoin d\'aide ou d\'accompagnement sur des points spécifiques ?',
      'Votre charge de travail vous semble-t-elle adaptée ?',
      'Y a-t-il des processus ou outils que vous aimeriez mieux maîtriser ?',
      'Quels sont vos objectifs pour la semaine prochaine ?'
    ]
  },

  milestone: {
    id: 'milestone',
    name: 'Entretien d\'Étape',
    category: 'integration',
    icon: Target,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-500 to-violet-500',
    duration: 45,
    description: 'Validation de fin de phase et passage à l\'étape suivante',
    targetAudience: 'nouveaux',
    objectives: [
      'Évaluer l\'atteinte des objectifs de la phase',
      'Valider les compétences acquises',
      'Identifier les axes d\'amélioration',
      'Préparer la transition vers la phase suivante',
      'Ajuster le parcours si nécessaire'
    ],
    questions: [
      'Comment évaluez-vous votre progression sur cette phase ?',
      'Quelles sont vos réussites principales ?',
      'Sur quels points devez-vous encore progresser ?',
      'Vous sentez-vous prêt(e) pour la phase suivante ?',
      'Quelles compétences souhaitez-vous développer ensuite ?',
      'Y a-t-il des défis particuliers que vous anticipez ?'
    ]
  },

  final: {
    id: 'final',
    name: 'Entretien de Validation',
    category: 'integration',
    icon: Award,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
    duration: 60,
    description: 'Entretien final de validation de l\'intégration',
    targetAudience: 'nouveaux',
    objectives: [
      'Valider l\'intégration complète du nouvel employé',
      'Évaluer l\'autonomie opérationnelle atteinte',
      'Recueillir les retours sur le parcours d\'onboarding',
      'Définir les perspectives d\'évolution',
      'Planifier le suivi post-intégration'
    ],
    questions: [
      'Comment jugez-vous votre intégration globale ?',
      'Quelles compétences vous semblent les plus développées ?',
      'Quels aspects aimeriez-vous encore améliorer ?',
      'Avez-vous des suggestions pour améliorer le parcours ?',
      'Dans quelles missions vous sentez-vous le plus à l\'aise ?',
      'Quelles sont vos aspirations pour les prochains mois ?'
    ]
  },

  // ========== ENTRETIENS GAME MASTER ==========
  gamemaster_mission: {
    id: 'gamemaster_mission',
    name: 'Entretien Mission Game Master',
    category: 'gamemaster',
    icon: Gamepad2,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    duration: 45,
    description: 'Suivi des missions et projets en tant que Game Master',
    targetAudience: 'anciens',
    objectives: [
      'Évaluer la performance sur les missions actuelles',
      'Identifier les défis et opportunités',
      'Analyser la gestion d\'équipe et leadership',
      'Planifier les prochaines missions stratégiques',
      'Développer les compétences de Game Master'
    ],
    questions: [
      'Comment évaluez-vous vos performances sur vos missions actuelles ?',
      'Quels sont les principaux défis que vous rencontrez en tant que Game Master ?',
      'Comment gérez-vous votre équipe et les conflits éventuels ?',
      'Quelles compétences de leadership souhaitez-vous développer ?',
      'Quels types de missions vous motivent le plus ?',
      'Comment voyez-vous votre évolution dans Synergia ?',
      'Avez-vous des idées pour améliorer nos processus ?'
    ]
  },

  gamemaster_role: {
    id: 'gamemaster_role',
    name: 'Entretien Rôle & Responsabilités',
    category: 'gamemaster',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    duration: 50,
    description: 'Évaluation du rôle et des responsabilités Game Master',
    targetAudience: 'anciens',
    objectives: [
      'Clarifier les attentes du rôle de Game Master',
      'Évaluer la prise de responsabilités',
      'Identifier les besoins en formation avancée',
      'Développer la vision stratégique',
      'Préparer l\'évolution de carrière'
    ],
    questions: [
      'Comment définiriez-vous votre rôle actuel dans Synergia ?',
      'Quelles responsabilités vous motivent le plus ?',
      'Dans quels domaines vous sentez-vous expert ?',
      'Quels sont vos objectifs de développement professionnel ?',
      'Comment envisagez-vous votre contribution à long terme ?',
      'Quelles nouvelles responsabilités aimeriez-vous prendre ?',
      'Comment pourrions-nous mieux valoriser votre expertise ?'
    ]
  },

  gamemaster_synergia: {
    id: 'gamemaster_synergia',
    name: 'Entretien Vision Synergia',
    category: 'gamemaster',
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    duration: 60,
    description: 'Discussion stratégique sur l\'avenir de Synergia',
    targetAudience: 'anciens',
    objectives: [
      'Recueillir la vision stratégique du Game Master',
      'Identifier les opportunités d\'innovation',
      'Évaluer l\'alignement avec la vision entreprise',
      'Développer les projets futurs',
      'Renforcer l\'engagement à long terme'
    ],
    questions: [
      'Comment voyez-vous l\'évolution de Synergia dans les prochaines années ?',
      'Quelles innovations pourrions-nous mettre en place ?',
      'Comment améliorer l\'expérience de nos clients ?',
      'Quels sont les défis majeurs à anticiper ?',
      'Dans quels domaines devrions-nous investir prioritairement ?',
      'Comment renforcer la culture d\'équipe ?',
      'Quel serait votre projet idéal pour Synergia ?'
    ]
  },

  gamemaster_skills: {
    id: 'gamemaster_skills',
    name: 'Entretien Compétences Avancées',
    category: 'gamemaster',
    icon: ShieldCheck,
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-green-500 to-teal-500',
    duration: 40,
    description: 'Évaluation et développement des compétences avancées',
    targetAudience: 'anciens',
    objectives: [
      'Cartographier les compétences avancées maîtrisées',
      'Identifier les domaines d\'excellence',
      'Planifier la montée en compétences',
      'Développer l\'expertise métier',
      'Préparer la transmission de savoir'
    ],
    questions: [
      'Quelles sont vos compétences les plus pointues ?',
      'Dans quels domaines vous sentez-vous expert reconnu ?',
      'Quelles compétences techniques souhaitez-vous approfondir ?',
      'Comment pourriez-vous transmettre votre expertise aux nouveaux ?',
      'Quels sont vos besoins en formation avancée ?',
      'Comment mesurer votre progression dans ces domaines ?',
      'Quelles certifications ou formations vous intéressent ?'
    ]
  }
};

// 💼 COMPOSANT PRINCIPAL ENTRETIENS
const EntretiensReferent = () => {
  const { user } = useAuthStore();
  
  // 📊 États principaux
  const [activeView, setActiveView] = useState('dashboard');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  // 📝 Formulaire planification
  const [newInterview, setNewInterview] = useState({
    title: '',
    templateId: '',
    date: '',
    time: '',
    location: 'Bureau Brain',
    type: 'presentiel',
    referent: '',
    notes: '',
    targetUser: '',
    status: 'planned'
  });

  // 📋 Formulaire de passage d'entretien
  const [interviewForm, setInterviewForm] = useState({
    responses: {},
    notes: '',
    evaluation: '',
    nextSteps: [],
    followUpDate: ''
  });

  // 🔄 Charger les entretiens depuis Firebase
  const loadInterviews = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      console.log('🔄 Chargement des entretiens...');

      // CORRECTION: Utiliser une seule collection cohérente
      const interviewsRef = collection(db, 'interviews');
      const q = query(
        interviewsRef,
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const loadedInterviews = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedInterviews.push({
          id: doc.id,
          ...data,
          // Normaliser les dates
          date: data.date || data.scheduledDate?.split('T')[0] || '',
          time: data.time || data.scheduledDate?.split('T')[1]?.substring(0, 5) || ''
        });
      });

      console.log(`✅ ${loadedInterviews.length} entretiens chargés`);
      setInterviews(loadedInterviews);

    } catch (error) {
      console.error('❌ Erreur chargement entretiens:', error);
      // Fallback gracieux sans plantage
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🚀 Planifier un nouvel entretien
  const scheduleInterview = async () => {
    if (!selectedTemplate || !newInterview.date || !newInterview.time) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      console.log('🚀 Planification entretien...');
      
      const template = INTERVIEW_TEMPLATES[selectedTemplate];
      
      // CORRECTION: Structure cohérente pour Firebase
      const interviewData = {
        // Métadonnées utilisateur
        userId: user.uid,
        createdBy: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        
        // Données template
        templateId: selectedTemplate,
        templateName: template.name,
        category: template.category,
        targetAudience: template.targetAudience,
        
        // Planification
        title: newInterview.title || template.name,
        scheduledDate: `${newInterview.date}T${newInterview.time}:00`,
        date: newInterview.date,
        time: newInterview.time,
        duration: template.duration,
        
        // Détails
        location: newInterview.location,
        type: newInterview.type,
        referent: newInterview.referent,
        referentId: newInterview.referentId,
        referentEmail: newInterview.referentEmail,
        targetUser: newInterview.targetUser,
        participantIds: newInterview.participantIds || [],
        participantEmails: newInterview.participantEmails || [],
        notes: newInterview.notes,
        
        // Contenu template
        objectives: template.objectives,
        questions: template.questions,
        description: template.description,
        
        // Statut et suivi
        status: 'planned',
        completed: false,
        
        // Horodatage
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('📝 Données entretien:', interviewData);
      
      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      console.log('✅ Entretien planifié avec ID:', docRef.id);
      
      // Réinitialiser et recharger
      resetScheduleForm();
      await loadInterviews();
      
      alert('✅ Entretien planifié avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur planification:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 🎯 Conduire un entretien
  const conductInterview = async () => {
    if (!selectedInterview || !interviewForm.evaluation) {
      alert('Veuillez remplir l\'évaluation');
      return;
    }

    try {
      setSubmitting(true);
      
      const interviewRef = doc(db, 'interviews', selectedInterview.id);
      
      const updateData = {
        // Résultats entretien
        responses: interviewForm.responses,
        conductorNotes: interviewForm.notes,
        evaluation: interviewForm.evaluation,
        nextSteps: interviewForm.nextSteps,
        followUpDate: interviewForm.followUpDate,
        
        // Statut
        status: 'completed',
        completed: true,
        completedAt: serverTimestamp(),
        completedBy: user.uid,
        
        // Mise à jour
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(interviewRef, updateData);
      
      console.log('✅ Entretien finalisé');
      
      // Réinitialiser et recharger
      setShowInterviewForm(false);
      setSelectedInterview(null);
      setInterviewForm({
        responses: {},
        notes: '',
        evaluation: '',
        nextSteps: [],
        followUpDate: ''
      });
      
      await loadInterviews();
      alert('✅ Entretien finalisé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur finalisation:', error);
      alert('❌ Erreur: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 🗑️ Supprimer un entretien
  const deleteInterview = async (interviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) return;
    
    try {
      await deleteDoc(doc(db, 'interviews', interviewId));
      console.log('✅ Entretien supprimé');
      await loadInterviews();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('❌ Erreur suppression: ' + error.message);
    }
  };

  // 🔄 Réinitialiser le formulaire
  const resetScheduleForm = () => {
    setShowScheduleForm(false);
    setSelectedTemplate(null);
    setNewInterview({
      title: '',
      templateId: '',
      date: '',
      time: '',
      location: 'Bureau Brain',
      type: 'presentiel',
      referent: '',
      notes: '',
      targetUser: '',
      participantIds: [],
      participantEmails: [],
      referentId: '',
      referentEmail: '',
      status: 'planned'
    });
  };

  // 📅 Sélectionner un template
  const selectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    const template = INTERVIEW_TEMPLATES[templateId];
    setNewInterview(prev => ({
      ...prev,
      templateId,
      title: template.name,
      duration: template.duration
    }));
    setShowScheduleForm(true);
  };

  // 🎯 Démarrer un entretien
  const startInterview = (interview) => {
    setSelectedInterview(interview);
    setInterviewForm({
      responses: {},
      notes: '',
      evaluation: '',
      nextSteps: [],
      followUpDate: ''
    });
    setShowInterviewForm(true);
  };

  // 🔄 Charger au montage
  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  // 📊 Filtrer les entretiens
  const filteredInterviews = interviews.filter(interview => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'integration') return INTERVIEW_TEMPLATES[interview.templateId]?.category === 'integration';
    if (filterCategory === 'gamemaster') return INTERVIEW_TEMPLATES[interview.templateId]?.category === 'gamemaster';
    if (filterCategory === 'planned') return interview.status === 'planned';
    if (filterCategory === 'completed') return interview.status === 'completed';
    return true;
  });

  // 📈 Statistiques
  const stats = {
    total: interviews.length,
    planned: interviews.filter(i => i.status === 'planned').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    integration: interviews.filter(i => INTERVIEW_TEMPLATES[i.templateId]?.category === 'integration').length,
    gamemaster: interviews.filter(i => INTERVIEW_TEMPLATES[i.templateId]?.category === 'gamemaster').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 📊 En-tête */}
      <div className="text-center mb-8">
        <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          💬 Système d'Entretiens Complet
        </h3>
        <p className="text-gray-300 text-lg">
          Suivi d'intégration et entretiens Game Master
        </p>
      </div>

      {/* 📊 Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.planned}</div>
          <div className="text-sm text-gray-400">Planifiés</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-sm text-gray-400">Terminés</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.integration}</div>
          <div className="text-sm text-gray-400">Intégration</div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{stats.gamemaster}</div>
          <div className="text-sm text-gray-400">Game Master</div>
        </div>
      </div>

      {/* 📊 Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
              { id: 'planifier', name: 'Planifier', icon: Plus },
              { id: 'historique', name: 'Historique', icon: Calendar }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeView === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.name}
                </button>
              );
            })}
            
            {/* Bouton rechargement */}
            <button
              onClick={loadInterviews}
              disabled={loading}
              className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50"
              title="Recharger les entretiens"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 🔍 Filtres */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2 bg-gray-800/30 rounded-xl p-2">
          {[
            { id: 'all', name: 'Tous', count: stats.total },
            { id: 'integration', name: 'Intégration', count: stats.integration },
            { id: 'gamemaster', name: 'Game Master', count: stats.gamemaster },
            { id: 'planned', name: 'Planifiés', count: stats.planned },
            { id: 'completed', name: 'Terminés', count: stats.completed }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterCategory(filter.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterCategory === filter.id
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {filter.name} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Contenu selon la vue */}
      {activeView === 'dashboard' && (
        <DashboardView 
          interviews={filteredInterviews}
          onStartInterview={startInterview}
          onDelete={deleteInterview}
        />
      )}
      
      {activeView === 'planifier' && (
        <PlanifierView 
          templates={INTERVIEW_TEMPLATES}
          onSelectTemplate={selectTemplate}
          filterCategory={filterCategory}
        />
      )}
      
      {activeView === 'historique' && (
        <HistoriqueView 
          interviews={filteredInterviews}
          onStartInterview={startInterview}
          onDelete={deleteInterview}
        />
      )}

      {/* 📝 Modal de planification */}
      <AnimatePresence>
        {showScheduleForm && selectedTemplate && (
          <ScheduleInterviewModalWithUsers
            template={INTERVIEW_TEMPLATES[selectedTemplate]}
            newInterview={newInterview}
            setNewInterview={setNewInterview}
            onSchedule={scheduleInterview}
            onClose={resetScheduleForm}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

      {/* 🎯 Modal de conduite d'entretien */}
      <AnimatePresence>
        {showInterviewForm && selectedInterview && (
          <ConductInterviewModal
            interview={selectedInterview}
            template={INTERVIEW_TEMPLATES[selectedInterview.templateId]}
            form={interviewForm}
            setForm={setInterviewForm}
            onComplete={conductInterview}
            onClose={() => setShowInterviewForm(false)}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 📊 COMPOSANT DASHBOARD
const DashboardView = ({ interviews, onStartInterview, onDelete }) => {
  const upcomingInterviews = interviews
    .filter(i => i.status === 'planned')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  
  const completedInterviews = interviews
    .filter(i => i.status === 'completed')
    .sort((a, b) => new Date(b.completedAt?.seconds * 1000) - new Date(a.completedAt?.seconds * 1000));

  return (
    <div className="space-y-6">
      {/* Prochains entretiens */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h4 className="text-xl font-bold text-white mb-4">📅 Prochains Entretiens</h4>
        
        {upcomingInterviews.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucun entretien planifié</p>
            <p className="text-gray-500 text-sm mt-2">
              Utilisez l'onglet "Planifier" pour créer un nouvel entretien
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews.slice(0, 3).map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onStartInterview={onStartInterview}
                onDelete={onDelete}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Derniers entretiens terminés */}
      {completedInterviews.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h4 className="text-xl font-bold text-white mb-4">✅ Derniers Entretiens Terminés</h4>
          <div className="space-y-3">
            {completedInterviews.slice(0, 2).map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onStartInterview={onStartInterview}
                onDelete={onDelete}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 📅 COMPOSANT PLANIFIER
const PlanifierView = ({ templates, onSelectTemplate, filterCategory }) => {
  // Filtrer les templates selon la catégorie
  const filteredTemplates = Object.entries(templates).filter(([templateId, template]) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'integration') return template.category === 'integration';
    if (filterCategory === 'gamemaster') return template.category === 'gamemaster';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-white mb-2">📝 Choisir un type d'entretien</h4>
        <p className="text-gray-400">Sélectionnez le template adapté à votre besoin</p>
      </div>

      {/* Templates d'intégration */}
      <div className="space-y-6">
        {(filterCategory === 'all' || filterCategory === 'integration') && (
          <div>
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-400" />
              Entretiens d'Intégration (Nouveaux employés)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates
                .filter(([_, template]) => template.category === 'integration')
                .map(([templateId, template]) => (
                  <TemplateCard 
                    key={templateId}
                    templateId={templateId}
                    template={template}
                    onSelectTemplate={onSelectTemplate}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Templates Game Master */}
        {(filterCategory === 'all' || filterCategory === 'gamemaster') && (
          <div>
            <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Entretiens Game Master (Employés expérimentés)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates
                .filter(([_, template]) => template.category === 'gamemaster')
                .map(([templateId, template]) => (
                  <TemplateCard 
                    key={templateId}
                    templateId={templateId}
                    template={template}
                    onSelectTemplate={onSelectTemplate}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 📚 COMPOSANT HISTORIQUE
const HistoriqueView = ({ interviews, onStartInterview, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-white mb-2">📚 Historique des Entretiens</h4>
        <p className="text-gray-400">Tous vos entretiens passés et à venir</p>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucun entretien enregistré</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onStartInterview={onStartInterview}
              onDelete={onDelete}
              showActions={true}
              detailed={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 🃏 COMPOSANT CARTE TEMPLATE
const TemplateCard = ({ templateId, template, onSelectTemplate }) => {
  const IconComponent = template.icon;
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${template.color} flex items-center justify-center mr-4`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-white">{template.name}</h4>
          <p className="text-gray-400 text-sm">{template.duration} minutes</p>
        </div>
      </div>
      
      <p className="text-gray-300 mb-4 text-sm">{template.description}</p>
      
      <div className="mb-4">
        <p className="text-white font-medium text-sm mb-2">Public cible :</p>
        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${
          template.targetAudience === 'nouveaux' 
            ? 'bg-blue-500/20 text-blue-300' 
            : 'bg-yellow-500/20 text-yellow-300'
        }`}>
          {template.targetAudience === 'nouveaux' ? '👶 Nouveaux employés' : '👑 Game Masters'}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-white font-medium text-sm mb-2">Objectifs :</p>
        <ul className="text-gray-400 text-xs space-y-1">
          {template.objectives.slice(0, 3).map((objective, idx) => (
            <li key={idx}>• {objective}</li>
          ))}
          {template.objectives.length > 3 && (
            <li className="text-gray-500">... et {template.objectives.length - 3} autres</li>
          )}
        </ul>
      </div>
      
      <button 
        onClick={() => onSelectTemplate(templateId)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
      >
        Planifier cet entretien
      </button>
    </div>
  );
};

// 🎯 COMPOSANT CARTE ENTRETIEN
const InterviewCard = ({ interview, onStartInterview, onDelete, showActions = true, detailed = false }) => {
  const template = INTERVIEW_TEMPLATES[interview.templateId];
  const IconComponent = template?.icon || MessageSquare;
  
  const interviewDate = new Date(`${interview.date}T${interview.time}`);
  const isUpcoming = interviewDate >= new Date() && interview.status === 'planned';
  const isPast = interviewDate < new Date() && interview.status === 'planned';
  const isCompleted = interview.status === 'completed';

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      isCompleted ? 'bg-green-900/20 border-green-500/30' :
      isUpcoming ? 'bg-blue-900/20 border-blue-500/30' :
      'bg-gray-700/30 border-gray-600'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            template ? template.bgColor : 'bg-gray-600'
          }`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h5 className="font-semibold text-white">{interview.title}</h5>
            <p className="text-gray-400 text-sm">{template?.description}</p>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(`${interview.date}T${interview.time}`).toLocaleDateString('fr-FR')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {interview.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {interview.location}
              </span>
            </div>

            {interview.participantIds && interview.participantIds.length > 0 && (
              <div className="mt-2">
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  👥 {interview.participantIds.length} participant(s)
                </span>
              </div>
            )}

            {interview.referentEmail && (
              <div className="mt-2">
                <span className="text-xs bg-purple-700/20 text-purple-300 px-2 py-1 rounded">
                  👤 {interview.referent} ({interview.referentEmail})
                </span>
              </div>
            )}

            {detailed && interview.notes && (
              <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm text-gray-300">
                📝 {interview.notes}
              </div>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {interview.status === 'planned' && (
              <button
                onClick={() => onStartInterview(interview)}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
              >
                Démarrer
              </button>
            )}
            
            {interview.status === 'completed' && (
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded text-sm font-medium">
                ✅ Terminé
              </span>
            )}
            
            <button
              onClick={() => onDelete(interview.id)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntretiensReferent;
