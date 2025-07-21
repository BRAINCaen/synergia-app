// ==========================================
// 📁 react-app/src/components/onboarding/EntretiensReferent.jsx
// ENTRETIENS RÉFÉRENT - VERSION CORRIGÉE SANS ERREUR PERMISSIONS
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
  Wifi,
  WifiOff
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import InterviewServiceFixed from '../../core/services/interviewServiceFixed.js';

// 🔥 IMPORTS FIREBASE POUR CHARGER LES EMPLOYÉS
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

// 🎯 TYPES D'ENTRETIENS
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
  const [syncStatus, setSyncStatus] = useState({ syncing: false, hasTemp: false });
  
  // Formulaire de programmation avec valeurs par défaut
  const [scheduleForm, setScheduleForm] = useState({
    employeeName: 'Allan',
    employeeEmail: 'alan.boehme61@gmail.com',
    employeeId: 'alan_boehme',
    type: 'initial',
    scheduledDate: new Date().toISOString().split('T')[0], // Date d'aujourd'hui
    scheduledTime: '19:15',
    duration: 30,
    location: 'Bureau référent',
    objectives: 'Points à aborder, compétences à évaluer...',
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

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    if (user?.uid) {
      loadAllData();
      checkSyncStatus();
      
      // Vérifier sync toutes les 30 secondes
      const syncInterval = setInterval(checkSyncStatus, 30000);
      return () => clearInterval(syncInterval);
    }
  }, [user?.uid]);

  // 📊 CHARGER TOUTES LES DONNÉES
  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('📊 [ENTRETIENS] Chargement de toutes les données...');
      
      await Promise.all([
        loadInterviews(),
        loadEmployees()
      ]);
      
    } catch (error) {
      console.error('❌ [ENTRETIENS] Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // 📅 CHARGER LES ENTRETIENS (TOUTES SOURCES)
  const loadInterviews = async () => {
    try {
      console.log('📅 [ENTRETIENS] Chargement entretiens avec service corrigé...');
      
      const interviewsList = await InterviewServiceFixed.loadAllInterviews(user.uid);
      
      setInterviews(interviewsList);
      calculateStats(interviewsList);
      
      console.log(`✅ [ENTRETIENS] ${interviewsList.length} entretiens chargés`);
      
    } catch (error) {
      console.error('❌ [ENTRETIENS] Erreur chargement entretiens:', error);
      setInterviews([]);
    }
  };

  // 👥 CHARGER LES EMPLOYÉS EN FORMATION
  const loadEmployees = async () => {
    try {
      console.log('👥 [ENTRETIENS] Chargement employés...');
      
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
      
      // Essayer de charger depuis Firebase aussi
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
        
        console.log(`✅ [ENTRETIENS] ${querySnapshot.size} employés additionnels depuis Firebase`);
        
      } catch (fbError) {
        console.warn('⚠️ [ENTRETIENS] Impossible de charger depuis Firebase:', fbError.message);
      }
      
      setEmployees(employeesList);
      console.log(`✅ [ENTRETIENS] ${employeesList.length} employés chargés au total`);
      
    } catch (error) {
      console.error('❌ [ENTRETIENS] Erreur chargement employés:', error);
      // Fallback avec employé par défaut
      setEmployees([{
        id: 'alan_boehme',
        name: 'Allan',
        email: 'alan.boehme61@gmail.com',
        startDate: new Date().toISOString(),
        currentPhase: 'decouverte_brain',
        progress: 15
      }]);
    }
  };

  // 📊 CALCULER LES STATISTIQUES
  const calculateStats = (interviewsList) => {
    const total = interviewsList.length;
    const completed = interviewsList.filter(i => i.status === 'completed').length;
    const pending = interviewsList.filter(i => i.status === 'scheduled').length;
    
    // Cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = interviewsList.filter(i => {
      const interviewDate = new Date(i.scheduledDate);
      return interviewDate >= oneWeekAgo;
    }).length;
    
    // Note moyenne
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

  // 🔄 VÉRIFIER LE STATUT DE SYNCHRONISATION
  const checkSyncStatus = async () => {
    try {
      const storageKey = `synergia_interviews`;
      const tempInterviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const hasTemp = tempInterviews.length > 0;
      
      setSyncStatus(prev => ({ ...prev, hasTemp }));
      
      // Tenter une synchronisation si nécessaire
      if (hasTemp && !syncStatus.syncing) {
        setSyncStatus(prev => ({ ...prev, syncing: true }));
        
        const syncResult = await InterviewServiceFixed.syncTemporaryInterviews();
        
        if (syncResult.success && syncResult.synced > 0) {
          console.log(`✅ [SYNC] ${syncResult.synced} entretiens synchronisés`);
          await loadInterviews(); // Recharger après sync
        }
        
        setSyncStatus(prev => ({ 
          ...prev, 
          syncing: false, 
          hasTemp: syncResult.remaining > 0 
        }));
      }
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur vérification sync:', error);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
    }
  };

  // ✅ PROGRAMMER UN ENTRETIEN (VERSION CORRIGÉE)
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    
    try {
      console.log('📅 [ENTRETIENS] Programmation entretien...');
      console.log('📋 Données formulaire:', scheduleForm);
      
      const interviewData = {
        ...scheduleForm,
        referentId: user.uid
      };
      
      const result = await InterviewServiceFixed.scheduleInterview(interviewData);
      
      if (result.success) {
        console.log('✅ [ENTRETIENS] Entretien programmé avec succès!');
        
        // Message de succès selon le mode de stockage
        let successMessage = 'Entretien programmé avec succès !';
        if (result.isTemporary) {
          successMessage = 'Entretien programmé temporairement. Synchronisation en cours...';
        } else if (result.fallbackCollection) {
          successMessage = 'Entretien programmé (mode de sauvegarde).';
        }
        
        // Afficher notification de succès
        showNotification(successMessage, 'success');
        
        // Fermer le formulaire et le réinitialiser
        setShowScheduleForm(false);
        resetScheduleForm();
        
        // Recharger les données
        await loadInterviews();
        
        // Vérifier sync si temporaire
        if (result.isTemporary) {
          setSyncStatus(prev => ({ ...prev, hasTemp: true }));
        }
        
      } else {
        console.error('❌ [ENTRETIENS] Échec programmation:', result.error);
        showNotification(result.error || 'Erreur lors de la programmation', 'error');
      }
      
    } catch (error) {
      console.error('❌ [ENTRETIENS] Erreur programmation entretien:', error);
      showNotification('Erreur inattendue. Veuillez réessayer.', 'error');
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
      scheduledTime: '19:15',
      duration: 30,
      location: 'Bureau référent',
      objectives: 'Points à aborder, compétences à évaluer...',
      notes: ''
    });
  };

  // 📺 AFFICHER UNE NOTIFICATION
  const showNotification = (message, type = 'info') => {
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 16px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      max-width: 400px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
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
    }, 4000);
  };

  // 📋 SÉLECTIONNER UN EMPLOYÉ AUTOMATIQUEMENT
  const handleEmployeeSelect = (employee) => {
    setScheduleForm(prev => ({
      ...prev,
      employeeName: employee.name,
      employeeEmail: employee.email,
      employeeId: employee.id
    }));
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

  // 🎨 OBTENIR LA COULEUR DU TYPE
  const getTypeColor = (type) => {
    return INTERVIEW_TYPES[type]?.color || 'from-gray-500 to-gray-600';
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

  // 🔢 FORMATER LA DURÉE
  const formatDuration = (duration) => {
    if (!duration) return '30 min';
    return `${duration} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 📊 En-tête avec statistiques */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Entretiens Référent
            </h1>
            <p className="text-gray-600">
              Gestion des entretiens de formation et de suivi
            </p>
            
            {/* Indicateur de sync */}
            {syncStatus.hasTemp && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                {syncStatus.syncing ? (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-orange-600">Synchronisation en cours...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600">Données en attente de synchronisation</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Programmer un entretien
          </button>
        </div>

        {/* 📊 Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.thisWeek}</div>
                <div className="text-sm text-gray-600">Cette semaine</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-sm text-gray-600">Terminés</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgRating}/5</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600">Taux de réussite</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Liste des entretiens */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Entretiens programmés ({interviews.length})
            </h2>
            <button
              onClick={loadAllData}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        <div className="p-6">
          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aucun entretien programmé
              </h3>
              <p className="text-gray-500 mb-6">
                Commencez par programmer votre premier entretien avec un employé en formation.
              </p>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Programmer un entretien
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => {
                const employee = employees.find(e => e.id === interview.employeeId);
                const typeInfo = INTERVIEW_TYPES[interview.type];
                
                return (
                  <div
                    key={interview.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getTypeColor(interview.type)}`}></div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {typeInfo?.name || interview.type}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(interview.status)}`}>
                            {interview.status}
                          </span>
                          {interview.source && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {interview.source === 'temporary' ? '⏳ Temporaire' : 
                               interview.source === 'alternative' ? '💾 Sauvegarde' : '✅ Principal'}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{interview.employeeName || employee?.name || 'Employé'}</span>
                            <span className="text-gray-400">({interview.employeeEmail || employee?.email})</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(interview.scheduledDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(interview.duration)}</span>
                          </div>
                        </div>
                        
                        {interview.objectives && (
                          <div className="mt-3 text-sm text-gray-600">
                            <strong>Objectifs:</strong> {interview.objectives}
                          </div>
                        )}
                        
                        {interview.location && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{interview.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {interview.status === 'scheduled' && (
                          <button
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowCompleteForm(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Finaliser
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedInterview(interview);
                            // Logique pour voir les détails
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 📝 Modal de programmation d'entretien */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Programmer un entretien
              </h3>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-6">
              {/* Sélection employé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employé
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={scheduleForm.employeeName}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeName: e.target.value }))}
                    placeholder="Nom de l'employé"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    value={scheduleForm.employeeEmail}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeEmail: e.target.value }))}
                    placeholder="Email de l'employé"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Suggestions d'employés */}
                {employees.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Employés en formation :</div>
                    <div className="flex flex-wrap gap-2">
                      {employees.map(employee => (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => handleEmployeeSelect(employee)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          {employee.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Type d'entretien */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'entretien
                </label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm(prev => ({ 
                    ...prev, 
                    type: e.target.value,
                    duration: INTERVIEW_TYPES[e.target.value]?.duration || 30
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="15"
                    max="180"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Bureau référent, Salle de réunion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Objectifs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectifs de l'entretien
                </label>
                <textarea
                  value={scheduleForm.objectives}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, objectives: e.target.value }))}
                  placeholder="Points à aborder, compétences à évaluer..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes additionnelles
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes, préparation particulière..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Programmer l'entretien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntretiensReferent;
