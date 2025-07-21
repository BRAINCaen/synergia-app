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
        
        // Fermer le formulaire et l
