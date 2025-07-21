// ==========================================
// 📁 react-app/src/components/onboarding/EntretiensReferent.jsx
// SYSTÈME TEMPLATES ENTRETIENS - COMPLET FONCTIONNEL
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
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
  Coffee
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';

// 🔥 IMPORTS FIREBASE
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// 🎯 TEMPLATES D'ENTRETIENS COMPLETS
const INTERVIEW_TEMPLATES = {
  initial: {
    id: 'initial',
    name: 'Entretien Initial',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    duration: 60,
    description: 'Premier entretien d\'accueil et présentation',
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
    ],
    evaluationCriteria: [
      'Motivation et enthousiasme',
      'Compréhension des enjeux',
      'Qualité des questions posées',
      'Attitude générale et ouverture',
      'Clarté des objectifs personnels'
    ],
    preparationChecklist: [
      'Préparer le dossier d\'accueil complet',
      'Organiser la visite des locaux',
      'Prévoir les accès et équipements nécessaires',
      'Planifier les présentations aux équipes clés'
    ]
  },
  
  weekly: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    icon: CalendarDays,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
    duration: 30,
    description: 'Point régulier sur les progrès et difficultés',
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
      'Comment vous sentez-vous dans votre intégration avec l\'équipe ?',
      'Y a-t-il des aspects du travail qui vous semblent encore flous ?',
      'Avez-vous besoin d\'aide ou de formation sur des points spécifiques ?',
      'Comment évaluez-vous votre progression par rapport à vos objectifs ?',
      'Quels sont vos projets d\'apprentissage pour la semaine prochaine ?'
    ],
    evaluationCriteria: [
      'Progression technique observée',
      'Qualité de l\'intégration équipe',
      'Niveau d\'autonomie atteint',
      'Capacité d\'identification des difficultés',
      'Attitude proactive dans l\'apprentissage'
    ],
    preparationChecklist: [
      'Consulter les retours des collègues',
      'Préparer les ressources de formation nécessaires',
      'Noter les observations de la semaine écoulée'
    ]
  },
  
  milestone: {
    id: 'milestone',
    name: 'Bilan d\'Étape',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
    duration: 45,
    description: 'Validation des compétences acquises',
    objectives: [
      'Évaluer les compétences acquises depuis le début',
      'Valider la maîtrise des objectifs de phase',
      'Identifier les points d\'amélioration',
      'Définir les objectifs pour la phase suivante',
      'Célébrer les réussites et progrès accomplis'
    ],
    questions: [
      'Comment évaluez-vous votre progression depuis le début de votre formation ?',
      'Quelles sont vos plus grandes réussites durant cette période ?',
      'Sur quels aspects vous sentez-vous maintenant à l\'aise ?',
      'Quels domaines nécessitent encore du travail selon vous ?',
      'Vous sentez-vous prêt(e) pour passer à la phase suivante ?',
      'Quels défis anticipez-vous pour la suite ?',
      'Comment pourrait-on améliorer votre parcours de formation ?'
    ],
    evaluationCriteria: [
      'Maîtrise des compétences clés de la phase',
      'Qualité de l\'auto-évaluation',
      'Capacité d\'analyse et de recul',
      'Préparation mentale pour la phase suivante',
      'Vision claire des prochaines étapes'
    ],
    preparationChecklist: [
      'Préparer l\'évaluation des compétences',
      'Rassembler les feedbacks des formateurs',
      'Définir les critères de passage à la phase suivante'
    ]
  },
  
  final: {
    id: 'final',
    name: 'Entretien Final',
    icon: Award,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
    duration: 60,
    description: 'Bilan complet et certification',
    objectives: [
      'Dresser le bilan complet de l\'intégration',
      'Valider l\'acquisition de toutes les compétences',
      'Évaluer la satisfaction du parcours de formation',
      'Définir les perspectives d\'évolution',
      'Officialiser la fin de la période d\'onboarding'
    ],
    questions: [
      'Comment jugez-vous votre intégration globale dans l\'entreprise ?',
      'Quelles compétences vous semblent les mieux maîtrisées maintenant ?',
      'Quels aspects de votre travail vous passionnent le plus ?',
      'Y a-t-il encore des domaines que vous aimeriez développer ?',
      'Comment évaluez-vous la qualité de votre accompagnement ?',
      'Quelles améliorations suggéreriez-vous pour le parcours d\'onboarding ?',
      'Quelles sont vos ambitions et projets au sein de l\'entreprise ?',
      'Vous sentez-vous prêt(e) à travailler de manière totalement autonome ?'
    ],
    evaluationCriteria: [
      'Intégration réussie et complète',
      'Autonomie opérationnelle confirmée',
      'Satisfaction du parcours de formation',
      'Vision claire des perspectives d\'évolution',
      'Esprit critique constructif'
    ],
    preparationChecklist: [
      'Compiler tous les résultats d\'évaluation',
      'Préparer le certificat de fin de formation',
      'Organiser la présentation aux équipes',
      'Planifier la suite du parcours professionnel'
    ]
  },
  
  support: {
    id: 'support',
    name: 'Entretien de Soutien',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
    duration: 30,
    description: 'Accompagnement personnalisé en cas de difficulté',
    objectives: [
      'Identifier précisément les difficultés rencontrées',
      'Apporter un soutien personnalisé et adapté',
      'Restaurer la confiance et la motivation',
      'Adapter le plan de formation aux besoins',
      'Mettre en place un suivi renforcé'
    ],
    questions: [
      'Pouvez-vous me décrire précisément les difficultés que vous rencontrez ?',
      'Depuis quand ressentez-vous ces difficultés ?',
      'Qu\'avez-vous déjà essayé pour les surmonter ?',
      'Quel type d\'accompagnement vous aiderait le plus ?',
      'Comment vous sentez-vous par rapport à vos collègues et à l\'équipe ?',
      'Avez-vous l\'impression que le rythme de formation vous convient ?',
      'Qu\'est-ce qui pourrait vous remotiver et vous aider à progresser ?',
      'Préférez-vous un accompagnement plus fréquent ou différent ?'
    ],
    evaluationCriteria: [
      'Identification claire des obstacles',
      'Ouverture à recevoir de l\'aide',
      'Motivation à surmonter les difficultés',
      'Capacité à exprimer ses besoins',
      'Réceptivité aux solutions proposées'
    ],
    preparationChecklist: [
      'Analyser les retours des formateurs',
      'Identifier les ressources de soutien disponibles',
      'Préparer des solutions d\'accompagnement adaptées',
      'Envisager des ajustements du plan de formation'
    ]
  }
};

const EntretiensReferent = () => {
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    completed: 0,
    pending: 0,
    avgRating: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Formulaire de programmation
  const [scheduleForm, setScheduleForm] = useState({
    employeeName: 'Allan',
    employeeEmail: 'alan.boehme61@gmail.com',
    employeeId: 'alan_boehme',
    type: 'initial',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '14:00',
    duration: 60,
    location: 'Bureau référent',
    objectives: '',
    notes: ''
  });

  // Formulaire de finalisation
  const [completeForm, setCompleteForm] = useState({
    rating: 5,
    summary: '',
    strengths: '',
    improvements: '',
    nextSteps: '',
    validated: false
  });

  // 📊 CHARGEMENT INITIAL
  useEffect(() => {
    if (user?.uid) {
      loadAllData();
    }
  }, [user?.uid]);

  // 📊 CHARGER TOUTES LES DONNÉES
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInterviews(),
        loadEmployees()
      ]);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // 📅 CHARGER LES ENTRETIENS
  const loadInterviews = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      console.log('📅 Chargement entretiens Firebase...');
      
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
          scheduledDate: data.scheduledDate?.toDate ? 
            data.scheduledDate.toDate().toISOString() : data.scheduledDate
        });
      });
      
      setInterviews(interviewsList);
      calculateStats(interviewsList);
      
      console.log(`✅ ${interviewsList.length} entretiens chargés`);
      
    } catch (error) {
      console.error('❌ Erreur chargement entretiens:', error);
      setInterviews([]);
    }
  }, [user?.uid]);

  // 👥 CHARGER LES EMPLOYÉS
  const loadEmployees = useCallback(async () => {
    try {
      const employeesList = [
        {
          id: 'alan_boehme',
          name: 'Allan',
          email: 'alan.boehme61@gmail.com',
          startDate: new Date().toISOString(),
          currentPhase: 'decouverte_brain',
          progress: 15
        }
      ];
      
      // Essayer de charger depuis Firebase
      try {
        const onboardingQuery = query(
          collection(db, 'onboardingFormation'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const querySnapshot = await getDocs(onboardingQuery);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.employeeName && !employeesList.find(e => e.email === data.employeeEmail)) {
            employeesList.push({
              id: doc.id,
              userId: data.userId,
              name: data.employeeName || data.name || 'Employé',
              email: data.employeeEmail || data.email || 'email@brain.fr',
              startDate: data.startDate,
              currentPhase: data.currentPhase || 'decouverte_brain',
              progress: data.progress || 0
            });
          }
        });
      } catch (fbError) {
        console.warn('⚠️ Impossible de charger depuis Firebase:', fbError.message);
      }
      
      setEmployees(employeesList);
      
    } catch (error) {
      console.error('❌ Erreur chargement employés:', error);
      setEmployees([{
        id: 'alan_boehme',
        name: 'Allan',
        email: 'alan.boehme61@gmail.com',
        startDate: new Date().toISOString(),
        currentPhase: 'decouverte_brain',
        progress: 15
      }]);
    }
  }, []);

  // 📊 CALCULER LES STATISTIQUES
  const calculateStats = (interviewsList) => {
    const total = interviewsList.length;
    const completed = interviewsList.filter(i => i.status === 'completed').length;
    const pending = interviewsList.filter(i => i.status === 'scheduled').length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = interviewsList.filter(i => {
      const interviewDate = new Date(i.scheduledDate);
      return interviewDate >= oneWeekAgo;
    }).length;
    
    const ratedInterviews = interviewsList.filter(i => i.rating && i.rating > 0);
    const avgRating = ratedInterviews.length > 0 
      ? ratedInterviews.reduce((sum, i) => sum + i.rating, 0) / ratedInterviews.length 
      : 0;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    setStats({
      total,
      thisWeek,
      completed,
      pending,
      avgRating: Math.round(avgRating * 10) / 10,
      completionRate
    });
  };

  // ✅ PROGRAMMER UN ENTRETIEN AVEC TEMPLATE
  const handleScheduleWithTemplate = async (templateId) => {
    try {
      const template = INTERVIEW_TEMPLATES[templateId];
      if (!template) return;

      const interviewData = {
        employeeName: scheduleForm.employeeName,
        employeeEmail: scheduleForm.employeeEmail,
        employeeId: scheduleForm.employeeId,
        referentId: user.uid,
        referentName: user.displayName || user.email,
        type: templateId,
        scheduledDate: new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}:00`),
        duration: template.duration,
        location: scheduleForm.location,
        objectives: template.objectives.join('\n• '),
        notes: scheduleForm.notes,
        status: 'scheduled',
        
        // Données du template
        template: {
          name: template.name,
          description: template.description,
          questions: template.questions,
          evaluationCriteria: template.evaluationCriteria,
          preparationChecklist: template.preparationChecklist
        },
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      console.log('✅ Entretien programmé avec template:', templateId, docRef.id);
      
      // Notification de succès
      showNotification(`✅ Entretien ${template.name} programmé avec succès !`, 'success');
      
      // Fermer le modal et recharger
      setShowScheduleForm(false);
      setSelectedTemplate(null);
      resetScheduleForm();
      await loadInterviews();
      
    } catch (error) {
      console.error('❌ Erreur programmation entretien:', error);
      showNotification('❌ Erreur lors de la programmation', 'error');
    }
  };

  // 🔄 RÉINITIALISER LE FORMULAIRE
  const resetScheduleForm = () => {
    setScheduleForm({
      employeeName: 'Allan',
      employeeEmail: 'alan.boehme61@gmail.com',
      employeeId: 'alan_boehme',
      type: 'initial',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '14:00',
      duration: 60,
      location: 'Bureau référent',
      objectives: '',
      notes: ''
    });
  };

  // 📺 AFFICHER UNE NOTIFICATION
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 16px 20px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      max-width: 400px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                   type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                   'linear-gradient(135deg, #3b82f6, #2563eb)'};
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  // 📅 FORMATER LA DATE
  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🎨 OBTENIR LA COULEUR DU STATUT
  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-600 border-blue-200',
      completed: 'bg-green-100 text-green-600 border-green-200',
      cancelled: 'bg-red-100 text-red-600 border-red-200',
      postponed: 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[status] || colors.scheduled;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement des entretiens</h2>
          <p className="text-gray-400">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🎯 En-tête */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Entretiens avec Référent
          </h1>
          <p className="text-gray-400 text-lg">
            Suivi personnalisé de votre intégration
          </p>
        </div>

        {/* 📊 Navigation par onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
            <div className="flex space-x-2">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                { id: 'planifier', name: 'Planifier', icon: Calendar },
                { id: 'historique', name: 'Historique', icon: FileText }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeView === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
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

        {/* 🎯 AFFICHAGE DU DASHBOARD */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            {/* 📊 Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500/20 rounded-full p-3">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-blue-400 text-sm font-medium">Total</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-gray-400 text-sm">Entretiens programmés</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/20 rounded-full p-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-green-400 text-sm font-medium">Terminés</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.completed}</div>
                <div className="text-gray-400 text-sm">Entretiens finalisés</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-500/20 rounded-full p-3">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-yellow-400 text-sm font-medium">Satisfaction</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.avgRating}/5</div>
                <div className="text-gray-400 text-sm">Note moyenne</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500/20 rounded-full p-3">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-purple-400 text-sm font-medium">Réussite</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.completionRate}%</div>
                <div className="text-gray-400 text-sm">Taux de complétion</div>
              </div>
            </div>

            {/* 🎯 Templates d'entretiens */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Templates d'Entretiens</h2>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Programmer un entretien
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(INTERVIEW_TEMPLATES).map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <div
                      key={template.id}
                      className="group bg-gray-700/50 rounded-2xl p-6 border border-gray-600 hover:border-purple-500/50 transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setScheduleForm(prev => ({
                          ...prev,
                          type: template.id,
                          duration: template.duration
                        }));
                        setShowScheduleForm(true);
                      }}
                    >
                      <div className={`${template.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                      <p className="text-gray-400 mb-4 text-sm">{template.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {template.duration} min
                        </span>
                        <button className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                          Planifier
                          <Rocket className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 📋 Prochains entretiens */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Prochains Entretiens</h2>
                <button
                  onClick={loadAllData}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {interviews.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    Aucun entretien programmé
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Utilisez les templates ci-dessus pour planifier votre premier entretien.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interviews.slice(0, 3).map((interview) => {
                    const template = INTERVIEW_TEMPLATES[interview.type];
                    const employee = employees.find(e => e.id === interview.employeeId);
                    
                    return (
                      <div
                        key={interview.id}
                        className="bg-gray-700/50 rounded-xl p-6 border border-gray-600 hover:border-purple-500/30 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {template && (
                                <div className={`${template.bgColor} w-10 h-10 rounded-lg flex items-center justify-center`}>
                                  <template.icon className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {template?.name || interview.type}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  avec {interview.employeeName || employee?.name || 'Employé'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-300">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(interview.scheduledDate)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-300">
                                <Clock className="w-4 h-4" />
                                <span>{interview.duration} minutes</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-300">
                                <MapPin className="w-4 h-4" />
                                <span>{interview.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(interview.status)}`}>
                              {interview.status === 'scheduled' ? 'Programmé' : interview.status}
                            </span>
                            
                            {interview.status === 'scheduled' && (
                              <button
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setShowCompleteForm(true);
                                }}
                                className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium"
                              >
                                Finaliser
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 📅 MODAL DE PROGRAMMATION */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Programmer un Entretien
                  </h3>
                  {selectedTemplate && (
                    <div className="flex items-center gap-3">
                      <div className={`${selectedTemplate.bgColor} w-8 h-8 rounded-lg flex items-center justify-center`}>
                        <selectedTemplate.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-300">{selectedTemplate.name}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowScheduleForm(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (selectedTemplate) {
                  handleScheduleWithTemplate(selectedTemplate.id);
                }
              }} className="space-y-6">
                {/* Sélection employé */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Employé
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={scheduleForm.employeeName}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeName: e.target.value }))}
                      placeholder="Nom de l'employé"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      required
                    />
                    <input
                      type="email"
                      value={scheduleForm.employeeEmail}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeEmail: e.target.value }))}
                      placeholder="Email de l'employé"
                      className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  {/* Suggestions d'employés */}
                  {employees.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-2">Employés en formation :</div>
                      <div className="flex flex-wrap gap-2">
                        {employees.map(employee => (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() => setScheduleForm(prev => ({
                              ...prev,
                              employeeName: employee.name,
                              employeeEmail: employee.email,
                              employeeId: employee.id
                            }))}
                            className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full hover:bg-purple-500/30 transition-colors"
                          >
                            {employee.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Date et heure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.scheduledTime}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Lieu */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Lieu de l'entretien
                  </label>
                  <select
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Bureau référent">Bureau référent</option>
                    <option value="Salle de réunion A">Salle de réunion A</option>
                    <option value="Salle de réunion B">Salle de réunion B</option>
                    <option value="Visioconférence">Visioconférence</option>
                    <option value="Espace détente">Espace détente</option>
                  </select>
                </div>

                {/* Notes additionnelles */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Notes additionnelles
                  </label>
                  <textarea
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes, préparation particulière..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Aperçu du template sélectionné */}
                {selectedTemplate && (
                  <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                    <h4 className="text-lg font-semibold text-white mb-4">Aperçu de l'entretien</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Objectifs principaux:</h5>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {selectedTemplate.objectives.slice(0, 3).map((objective, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Questions types:</h5>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {selectedTemplate.questions.slice(0, 3).map((question, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      setSelectedTemplate(null);
                    }}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Programmer l'entretien
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntretiensReferent;
