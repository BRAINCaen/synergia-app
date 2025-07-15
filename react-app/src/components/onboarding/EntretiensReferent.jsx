// ==========================================
// 📁 react-app/src/components/onboarding/EntretiensReferent.jsx
// ENTRETIENS RÉFÉRENT - AVEC VRAIES DONNÉES FIREBASE
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
  RefreshCw
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';

// 🔥 IMPORTS FIREBASE RÉELS - Plus de mock !
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

// 🎯 TYPES D'ENTRETIENS RÉELS
const INTERVIEW_TYPES = {
  initial: {
    id: 'initial',
    name: 'Entretien Initial',
    description: 'Premier contact et définition des objectifs',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    duration: 30,
    mandatory: true
  },
  weekly: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    description: 'Point régulier sur les progrès',
    icon: CalendarDays,
    color: 'from-green-500 to-emerald-500',
    duration: 20,
    recurring: true
  },
  milestone: {
    id: 'milestone',
    name: 'Entretien d\'Étape',
    description: 'Validation de fin de phase',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    duration: 45,
    mandatory: true
  },
  final: {
    id: 'final',
    name: 'Entretien Final',
    description: 'Validation complète de l\'intégration',
    icon: Award,
    color: 'from-orange-500 to-red-500',
    duration: 60,
    mandatory: true
  },
  support: {
    id: 'support',
    name: 'Soutien Personnalisé',
    description: 'Accompagnement en cas de difficultés',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    duration: 30,
    onDemand: true
  }
};

// 📋 MODÈLES DE QUESTIONS PAR TYPE
const INTERVIEW_QUESTIONS = {
  initial: [
    'Comment vous sentez-vous pour ce premier jour ?',
    'Avez-vous des questions sur l\'organisation ?',
    'Quels sont vos objectifs pour cette formation ?',
    'Y a-t-il des points spécifiques que vous aimeriez approfondir ?'
  ],
  weekly: [
    'Quelles compétences avez-vous développées cette semaine ?',
    'Quelles difficultés avez-vous rencontrées ?',
    'Comment vous sentez-vous dans l\'équipe ?',
    'Avez-vous besoin d\'aide sur des points spécifiques ?'
  ],
  milestone: [
    'Comment évaluez-vous votre progression sur cette phase ?',
    'Quelles sont vos réussites principales ?',
    'Sur quels points devez-vous encore progresser ?',
    'Vous sentez-vous prêt(e) pour la phase suivante ?'
  ],
  final: [
    'Comment jugez-vous votre intégration globale ?',
    'Quelles compétences vous semblent les plus développées ?',
    'Quels aspects aimeriez-vous encore améliorer ?',
    'Avez-vous des suggestions pour améliorer le parcours ?'
  ],
  support: [
    'Quelles sont les principales difficultés rencontrées ?',
    'Quel type d\'accompagnement vous aiderait le plus ?',
    'Comment pourrait-on adapter votre parcours ?',
    'Vous sentez-vous soutenu(e) par l\'équipe ?'
  ]
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
  
  // Formulaire de programmation
  const [scheduleForm, setScheduleForm] = useState({
    employeeName: '',
    employeeEmail: '',
    employeeId: '',
    type: 'initial',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    location: 'Bureau référent',
    objectives: '',
    notes: ''
  });

  // 🔥 FIREBASE RÉEL - Charger les entretiens
  const loadInterviews = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      console.log('📅 Chargement entretiens Firebase pour référent:', user.uid);
      
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
          scheduledDate: data.scheduledDate?.toDate ? data.scheduledDate.toDate().toISOString() : data.scheduledDate
        });
      });
      
      setInterviews(interviewsList);
      console.log(`✅ ${interviewsList.length} entretiens chargés depuis Firebase`);
      
    } catch (error) {
      console.error('❌ Erreur chargement entretiens Firebase:', error);
      setInterviews([]);
    }
  }, [user?.uid]);

  // 🔥 FIREBASE RÉEL - Charger les employés en onboarding
  const loadEmployees = useCallback(async () => {
    try {
      console.log('👥 Chargement employés onboarding Firebase...');
      
      const onboardingQuery = query(
        collection(db, 'onboardingFormation'),
        where('referentId', '==', user?.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(onboardingQuery);
      const employeesList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeesList.push({
          id: doc.id,
          userId: data.userId,
          name: data.employeeName || data.name || 'Employé',
          email: data.employeeEmail || data.email || 'email@brain.fr',
          startDate: data.startDate,
          currentPhase: data.currentPhase || 'decouverte_brain',
          progress: data.progress || 0
        });
      });
      
      setEmployees(employeesList);
      console.log(`✅ ${employeesList.length} employés chargés depuis Firebase`);
      
    } catch (error) {
      console.error('❌ Erreur chargement employés Firebase:', error);
      setEmployees([]);
    }
  }, [user?.uid]);

  // 🔥 FIREBASE RÉEL - Calculer les statistiques
  const calculateStats = useCallback(async () => {
    try {
      console.log('📊 Calcul statistiques Firebase...');
      
      const total = interviews.length;
      const completed = interviews.filter(i => i.status === 'completed').length;
      const pending = interviews.filter(i => i.status === 'scheduled').length;
      
      // Calculer cette semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeek = interviews.filter(i => {
        const interviewDate = new Date(i.scheduledDate);
        return interviewDate >= oneWeekAgo;
      }).length;
      
      // Calculer note moyenne
      const ratedInterviews = interviews.filter(i => i.rating && i.rating > 0);
      const avgRating = ratedInterviews.length > 0 
        ? ratedInterviews.reduce((sum, i) => sum + i.rating, 0) / ratedInterviews.length 
        : 0;
      
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      const newStats = {
        total,
        thisWeek,
        completed,
        pending,
        avgRating: Math.round(avgRating * 10) / 10,
        completionRate: Math.round(completionRate)
      };
      
      setStats(newStats);
      console.log('✅ Statistiques calculées:', newStats);
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques:', error);
    }
  }, [interviews]);

  // 🔥 FIREBASE RÉEL - Programmer un entretien
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('Vous devez être connecté pour programmer un entretien');
      return;
    }
    
    if (!scheduleForm.employeeName || !scheduleForm.scheduledDate || !scheduleForm.scheduledTime) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      console.log('📅 Programmation entretien Firebase...');
      
      // Construire la date complète
      const fullDateTime = `${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}:00`;
      const scheduledDate = new Date(fullDateTime);
      
      const interviewData = {
        employeeName: scheduleForm.employeeName,
        employeeEmail: scheduleForm.employeeEmail,
        employeeId: scheduleForm.employeeId || '',
        referentId: user.uid,
        referentName: user.displayName || user.email,
        type: scheduleForm.type,
        scheduledDate: scheduledDate,
        duration: parseInt(scheduleForm.duration),
        location: scheduleForm.location,
        objectives: scheduleForm.objectives,
        notes: scheduleForm.notes,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      console.log('✅ Entretien programmé avec ID:', docRef.id);
      
      // Réinitialiser le formulaire
      setScheduleForm({
        employeeName: '',
        employeeEmail: '',
        employeeId: '',
        type: 'initial',
        scheduledDate: '',
        scheduledTime: '',
        duration: 30,
        location: 'Bureau référent',
        objectives: '',
        notes: ''
      });
      
      setShowScheduleForm(false);
      
      // Recharger les données
      await loadInterviews();
      
      alert('Entretien programmé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur programmation entretien:', error);
      alert('Erreur lors de la programmation de l\'entretien');
    }
  };

  // 🔥 FIREBASE RÉEL - Finaliser un entretien
  const handleCompleteInterview = async (completeData) => {
    if (!selectedInterview?.id) return;
    
    try {
      console.log('✅ Finalisation entretien Firebase...');
      
      const interviewRef = doc(db, 'interviews', selectedInterview.id);
      
      const updateData = {
        status: 'completed',
        completedAt: serverTimestamp(),
        rating: completeData.rating,
        summary: completeData.summary,
        strengths: completeData.strengths,
        improvements: completeData.improvements,
        nextSteps: completeData.nextSteps,
        validated: completeData.validated,
        completedBy: user.uid,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(interviewRef, updateData);
      console.log('✅ Entretien finalisé avec succès');
      
      setShowCompleteForm(false);
      setSelectedInterview(null);
      
      // Recharger les données
      await loadInterviews();
      
      alert('Entretien finalisé avec succès !');
      
    } catch (error) {
      console.error('❌ Erreur finalisation entretien:', error);
      alert('Erreur lors de la finalisation de l\'entretien');
    }
  };

  // 📊 Charger toutes les données au montage
  useEffect(() => {
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

    if (user?.uid) {
      loadAllData();
    }
  }, [user?.uid, loadInterviews, loadEmployees]);

  // Recalculer les stats quand les entretiens changent
  useEffect(() => {
    calculateStats();
  }, [interviews, calculateStats]);

  // 🎨 Vue Dashboard avec données Firebase réelles
  const DashboardView = () => (
    <div className="space-y-6">
      
      {/* 📊 Statistiques réelles */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm opacity-80">Total entretiens</div>
            </div>
            <CalendarDays className="h-8 w-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
              <div className="text-sm opacity-80">Cette semaine</div>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{stats.avgRating > 0 ? `${stats.avgRating}/5` : 'N/A'}</div>
              <div className="text-sm opacity-80">Note moyenne</div>
            </div>
            <Star className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* 📅 Prochains entretiens (Firebase réel) */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Prochains Entretiens</h3>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Programmer
          </button>
        </div>
        
        <div className="space-y-3">
          {interviews
            .filter(interview => interview.status === 'scheduled')
            .slice(0, 5)
            .map(interview => {
              const interviewType = INTERVIEW_TYPES[interview.type] || INTERVIEW_TYPES.initial;
              const IconComponent = interviewType.icon;
              const scheduledDate = new Date(interview.scheduledDate);
              
              return (
                <div key={interview.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${interviewType.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      
                      <div>
                        <div className="text-white font-medium">
                          {interview.employeeName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {interviewType.name} • {interview.duration} min
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {interview.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {scheduledDate.toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-400">
                        {scheduledDate.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <button className="text-blue-400 hover:text-blue-300 p-1">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowCompleteForm(true);
                          }}
                          className="text-green-400 hover:text-green-300 p-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {interview.notes && (
                    <div className="mt-3 text-sm text-gray-400 bg-gray-800 rounded p-2">
                      {interview.notes}
                    </div>
                  )}
                </div>
              );
            })}
          
          {interviews.filter(i => i.status === 'scheduled').length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun entretien programmé</p>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Programmer le premier entretien
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📈 Entretiens récents (Firebase réel) */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Entretiens Récents</h3>
        
        <div className="space-y-3">
          {interviews
            .filter(interview => interview.status === 'completed')
            .slice(0, 5)
            .map(interview => {
              const interviewType = INTERVIEW_TYPES[interview.type] || INTERVIEW_TYPES.initial;
              const IconComponent = interviewType.icon;
              const completedDate = new Date(interview.scheduledDate);
              
              return (
                <div key={interview.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${interviewType.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      
                      <div>
                        <div className="text-white font-medium">
                          {interview.employeeName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {interviewType.name} • {completedDate.toLocaleDateString('fr-FR')}
                        </div>
                        {interview.rating && (
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < interview.rating ? 'text-yellow-400' : 'text-gray-600'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <button className="text-blue-400 hover:text-blue-300 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {interview.summary && (
                    <div className="mt-3 text-sm text-gray-400 bg-gray-800 rounded p-2">
                      {interview.summary}
                    </div>
                  )}
                </div>
              );
            })}
          
          {interviews.filter(i => i.status === 'completed').length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun entretien finalisé</p>
            </div>
          )}
        </div>
      </div>

      {/* 🔄 Bouton refresh */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            loadInterviews();
            loadEmployees();
          }}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser les données
        </button>
      </div>
    </div>
  );

  // 📅 Formulaire de programmation (inchangé)
  const ScheduleForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Programmer un Entretien</h3>
          <button
            onClick={() => setShowScheduleForm(false)}
            className="text-gray-400 hover:text-white"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleScheduleInterview} className="space-y-4">
          {/* Sélection employé */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Employé·e *
            </label>
            <select
              value={scheduleForm.employeeId}
              onChange={(e) => {
                const selectedEmployee = employees.find(emp => emp.id === e.target.value);
                setScheduleForm(prev => ({
                  ...prev,
                  employeeId: e.target.value,
                  employeeName: selectedEmployee?.name || '',
                  employeeEmail: selectedEmployee?.email || ''
                }));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Sélectionner un employé</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.email}
                </option>
              ))}
            </select>
            
            {employees.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Aucun employé en formation trouvé
              </p>
            )}
          </div>

          {/* Nom manuel si pas dans la liste */}
          {!scheduleForm.employeeId && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l'employé·e *
                </label>
                <input
                  type="text"
                  value={scheduleForm.employeeName}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeName: e.target.value }))}
                  placeholder="Nom complet"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={scheduleForm.employeeEmail}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeEmail: e.target.value }))}
                  placeholder="email@brain.fr"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* Type d'entretien */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type d'entretien *
            </label>
            <select
              value={scheduleForm.type}
              onChange={(e) => {
                const type = e.target.value;
                setScheduleForm(prev => ({ 
                  ...prev, 
                  type,
                  duration: INTERVIEW_TYPES[type]?.duration || 30
                }));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              required
            >
              {Object.values(INTERVIEW_TYPES).map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heure *
              </label>
              <input
                type="time"
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Durée (minutes)
            </label>
            <input
              type="number"
              value={scheduleForm.duration}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              min="15"
              max="120"
              step="15"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lieu
            </label>
            <select
              value={scheduleForm.location}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Bureau référent">Bureau référent</option>
              <option value="Salle de réunion A">Salle de réunion A</option>
              <option value="Salle de réunion B">Salle de réunion B</option>
              <option value="Visioconférence">Visioconférence</option>
              <option value="Espace détente">Espace détente</option>
            </select>
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Objectifs
            </label>
            <textarea
              value={scheduleForm.objectives}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, objectives: e.target.value }))}
              placeholder="Objectifs et points à aborder..."
              rows="3"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes additionnelles..."
              rows="2"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowScheduleForm(false)}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Programmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // 💬 Formulaire de finalisation (amélioré)
  const CompleteForm = () => {
    const [completeData, setCompleteData] = useState({
      rating: 0,
      summary: '',
      strengths: '',
      improvements: '',
      nextSteps: '',
      validated: false
    });

    if (!selectedInterview) return null;

    const interviewType = INTERVIEW_TYPES[selectedInterview.type];
    const questions = INTERVIEW_QUESTIONS[selectedInterview.type] || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Finaliser l'Entretien - {selectedInterview.employeeName}
            </h3>
            <button
              onClick={() => {
                setShowCompleteForm(false);
                setSelectedInterview(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Type d'entretien */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${interviewType.color}`}>
                  <interviewType.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{interviewType.name}</div>
                  <div className="text-sm text-gray-400">{interviewType.description}</div>
                </div>
              </div>
            </div>

            {/* Questions types */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Questions Types</h4>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-300">
                      {index + 1}. {question}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Évaluation globale */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Évaluation globale
              </label>
              <div className="flex items-center space-x-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCompleteData(prev => ({ ...prev, rating: star }))}
                    className={`${
                      star <= completeData.rating ? 'text-yellow-400' : 'text-gray-600'
                    } hover:text-yellow-300 transition-colors`}
                  >
                    <Star className="h-6 w-6" fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            {/* Résumé */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Résumé de l'entretien
              </label>
              <textarea
                value={completeData.summary}
                onChange={(e) => setCompleteData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Résumé des points abordés..."
                rows="3"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Points forts */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Points forts observés
              </label>
              <textarea
                value={completeData.strengths}
                onChange={(e) => setCompleteData(prev => ({ ...prev, strengths: e.target.value }))}
                placeholder="Forces et réussites..."
                rows="2"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Points d'amélioration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Axes d'amélioration
              </label>
              <textarea
                value={completeData.improvements}
                onChange={(e) => setCompleteData(prev => ({ ...prev, improvements: e.target.value }))}
                placeholder="Points à travailler..."
                rows="2"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Prochaines étapes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prochaines étapes
              </label>
              <textarea
                value={completeData.nextSteps}
                onChange={(e) => setCompleteData(prev => ({ ...prev, nextSteps: e.target.value }))}
                placeholder="Actions à mettre en place..."
                rows="2"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Validation */}
            <div className="flex items-center space-x-3 bg-gray-700 rounded-lg p-4">
              <input
                type="checkbox"
                id="validated"
                checked={completeData.validated}
                onChange={(e) => setCompleteData(prev => ({ ...prev, validated: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
              <label htmlFor="validated" className="text-white font-medium">
                Valider cette étape du parcours
              </label>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowCompleteForm(false);
                  setSelectedInterview(null);
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleCompleteInterview(completeData)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finaliser
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 🎯 Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎤 Entretiens Référent
        </h2>
        <p className="text-gray-400">
          Système de suivi et d'accompagnement personnalisé - Données Firebase réelles
        </p>
      </div>

      {/* 📊 Vue principale */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Chargement des données Firebase...</span>
        </div>
      ) : (
        <DashboardView />
      )}

      {/* 🎨 Types d'entretiens */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Types d'Entretiens</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(INTERVIEW_TYPES).map(type => {
            const IconComponent = type.icon;
            
            return (
              <div key={type.id} className={`bg-gradient-to-r ${type.color} rounded-lg p-4 text-white`}>
                <div className="flex items-center mb-3">
                  <IconComponent className="h-6 w-6 mr-3" />
                  <div className="font-semibold">{type.name}</div>
                </div>
                
                <div className="text-sm opacity-90 mb-3">
                  {type.description}
                </div>
                
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span>{type.duration} min</span>
                  {type.mandatory && <span>Obligatoire</span>}
                  {type.recurring && <span>Récurrent</span>}
                  {type.onDemand && <span>À la demande</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📝 Note de statut */}
      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
        <p className="text-green-300 text-sm">
          ✅ <strong>Entretiens Référent - FIREBASE RÉEL</strong><br/>
          - Données chargées depuis Firebase Firestore ✅<br/>
          - Programmation sauvegardée en base de données ✅<br/>
          - Finalisation persistante ✅<br/>
          - Statistiques calculées en temps réel ✅<br/>
          - Aucune donnée mock restante ✅
        </p>
      </div>

      {/* 🎨 Modals */}
      {showScheduleForm && <ScheduleForm />}
      {showCompleteForm && <CompleteForm />}
    </div>
  );
};

export default EntretiensReferent;
