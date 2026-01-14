// ==========================================
// 📁 react-app/src/pages/HRPage.jsx
// PAGE RH COMPLÈTE - MODULE GESTION DU PERSONNEL - AVEC PARAMÈTRES RH COMPLETS
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  FileText,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Save,
  RefreshCw,
  Copy,
  Clipboard,
  Target,
  TrendingUp,
  Award,
  Shield,
  Bell,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  PieChart,
  BarChart,
  Activity,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  User as UserIcon,
  UserPlus,
  UserCheck,
  UserX,
  Repeat,
  Share2,
  Lock,
  Unlock,
  Archive,
  Printer,
  Send,
  X,
  Info,
  ChevronRight,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Building,
  Palette,
  UserCog,
  Flag,
  Moon,
  Sun,
  AlertCircle as AlertCircleIcon,
  Folder,
  FolderOpen,
  File,
  FilePlus,
  FileSearch,
  FileSpreadsheet,
  Loader2,
  Pen,
  PenTool,
  MessageCircle,
  AlertOctagon,
  CheckSquare,
  Square,
  Heart
} from 'lucide-react';

// 🎯 IMPORTS
import Layout from '../components/layout/Layout.jsx';
import UserAvatar from '../components/common/UserAvatar.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import leaveAccrualService from '../core/services/leaveAccrualService.js';
import WellbeingDashboard from '../components/wellbeing/WellbeingDashboard.jsx';

// 🔥 FIREBASE
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import hrDocumentService, { DOCUMENT_TYPES } from '../core/services/hrDocumentService.js';
import timesheetExportService, { MONTHS_FR, exportPayrollComplete } from '../core/services/timesheetExportService.js';
import notificationService from '../core/services/notificationService.js';

// 🎨 COMPOSANTS HR EXTRAITS
import {
  GlassCard,
  StatCard,
  SignatureCanvas,
  EmployeeCard,
  EmployeesTab,
  LeavesTab,
  InterviewsTab,
  TrainingTab,
  TimesheetTab,
  DocumentsTab,
  PayrollTab,
  SettingsTab,
  NewEmployeeModal,
  NewScheduleModal
} from '../components/hr';

/**
 * 🏢 COMPOSANT PRINCIPAL - PAGE RH
 */
const HRPage = () => {
  const { user } = useAuthStore();

  // 📊 ÉTATS
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [initialEditMode, setInitialEditMode] = useState(false);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [showEmployeeDetailModal, setShowEmployeeDetailModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔐 Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Vérifier admin par isAdmin ou role ou synergiaRoles
          const hasAdminRole = userData.isAdmin === true ||
                              userData.role === 'admin' ||
                              userData.synergiaRoles?.some(r => r.roleId === 'organization');
          setIsAdmin(hasAdminRole);
        }
      } catch (error) {
        console.error('Erreur vérification admin:', error);
      }
    };
    checkAdminStatus();
  }, [user?.uid]);
  
  // 📊 STATISTIQUES RH
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingTimeSheets: 0,
    pendingLeaves: 0,
    monthlyHours: 0,
    overtime: 0
  });

  // 🔥 CHARGEMENT DES DONNÉES
  useEffect(() => {
    loadHRData();
  }, []);

  const loadHRData = async () => {
    try {
      setLoading(true);

      console.log('👥 Chargement des salariés depuis la collection users...');
      const employeesQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const employeesSnapshot = await getDocs(employeesQuery);
      
      const employeesData = employeesSnapshot.docs.map(doc => {
        const userData = doc.data();
        const firstName = userData.displayName?.split(' ')[0] || userData.profile?.firstName || 'Prénom';
        const lastName = userData.displayName?.split(' ').slice(1).join(' ') || userData.profile?.lastName || 'Nom';
        return {
          id: doc.id,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(), // Nom complet pour DocumentsTab
          email: userData.email || '',
          phone: userData.profile?.phone || userData.phone || '',
          position: userData.profile?.role || userData.role || 'Employé',
          department: userData.profile?.department || 'Non assigné',
          startDate: userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
          status: userData.isActive !== false ? 'active' : 'inactive',
          photoURL: userData.photoURL || null,
          level: userData.gamification?.level || 1,
          totalXP: userData.gamification?.totalXp || 0,
          createdAt: userData.createdAt,
          contractData: userData.contractData || {},
          salaryData: userData.salaryData || {}
        };
      });
      
      console.log(`✅ ${employeesData.length} salariés chargés depuis users`);
      setEmployees(employeesData);

      const schedulesQuery = query(collection(db, 'hr_schedules'), orderBy('date', 'desc'));
      const schedulesSnapshot = await getDocs(schedulesQuery);
      const schedulesData = schedulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedules(schedulesData);

      const timesheetsQuery = query(collection(db, 'hr_timesheets'), orderBy('createdAt', 'desc'));
      const timesheetsSnapshot = await getDocs(timesheetsQuery);
      const timesheetsData = timesheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTimesheets(timesheetsData);

      // Charger les congés pour PayrollTab
      const leavesQuery = query(collection(db, 'leave_requests'), orderBy('createdAt', 'desc'));
      const leavesSnapshot = await getDocs(leavesQuery);
      const leavesData = leavesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaves(leavesData);

      calculateStats(employeesData, timesheetsData);

      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement données RH:', error);
      setLoading(false);
    }
  };

  const calculateStats = (employeesData, timesheetsData) => {
    const activeEmployees = employeesData.filter(e => e.status === 'active').length;
    const pendingTimeSheets = timesheetsData.filter(t => t.status === 'pending').length;
    const monthlyHours = timesheetsData.reduce((acc, t) => acc + (t.totalHours || 0), 0);
    const overtime = timesheetsData.reduce((acc, t) => acc + (t.overtime || 0), 0);

    setStats({
      totalEmployees: employeesData.length,
      activeEmployees,
      pendingTimeSheets,
      pendingLeaves: 0,
      monthlyHours: Math.round(monthlyHours),
      overtime: Math.round(overtime)
    });
  };

  // 📝 FILTRAGE DES SALARIÉS
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    
    const term = searchTerm.toLowerCase();
    return employees.filter(emp => 
      emp.firstName?.toLowerCase().includes(term) ||
      emp.lastName?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.position?.toLowerCase().includes(term) ||
      emp.department?.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // 🎯 HANDLERS
  const handleAddEmployee = () => {
    setShowNewEmployeeModal(true);
  };

  const handleAddSchedule = () => {
    setShowNewScheduleModal(true);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setInitialEditMode(false);
    setShowEmployeeDetailModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setInitialEditMode(true);
    setShowEmployeeDetailModal(true);
  };

  const handleRefresh = () => {
    loadHRData();
  };

  // 📋 ONGLETS
  const tabs = [
    { id: 'employees', label: 'Salariés', icon: Users },
    { id: 'leaves', label: 'Congés', icon: Calendar },
    { id: 'timesheet', label: 'Pointage', icon: Clock },
    { id: 'wellbeing', label: 'Bien-être', icon: Heart },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payroll', label: 'Paie', icon: DollarSign },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Chargement des données RH...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-8 max-w-7xl mx-auto">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/30 to-purple-500/20 backdrop-blur-xl border border-white/10 rounded-xl"
                >
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </motion.div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    Gestion RH
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Gestion du personnel et ressources humaines</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02, rotate: 180 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Actualiser</span>
              </motion.button>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <StatCard 
                title="Total Salariés" 
                value={stats.totalEmployees} 
                icon={Users} 
                color="blue"
                subtitle={`${stats.activeEmployees} actifs`}
              />
              <StatCard 
                title="Pointages en attente" 
                value={stats.pendingTimeSheets} 
                icon={Clock} 
                color="orange"
                subtitle="À valider"
              />
              <StatCard 
                title="Heures du mois" 
                value={stats.monthlyHours} 
                icon={Activity} 
                color="green"
                subtitle={`${stats.overtime}h supplémentaires`}
              />
              <StatCard 
                title="Congés en attente" 
                value={stats.pendingLeaves} 
                icon={Calendar} 
                color="purple"
                subtitle="Demandes"
              />
            </div>
          </motion.div>

          {/* ONGLETS */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* CONTENU DES ONGLETS */}
          <AnimatePresence mode="wait">
            {activeTab === 'employees' && (
              <EmployeesTab
                employees={filteredEmployees}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onAddEmployee={handleAddEmployee}
                onViewEmployee={handleViewEmployee}
                onEditEmployee={handleEditEmployee}
                onRefresh={handleRefresh}
              />
            )}
            {activeTab === 'leaves' && (
              <LeavesTab
                employees={employees}
                onRefresh={handleRefresh}
              />
            )}
            {activeTab === 'timesheet' && (
              <TimesheetTab
                timesheets={timesheets}
                employees={employees}
                onRefresh={handleRefresh}
              />
            )}
            {activeTab === 'wellbeing' && (
              <motion.div
                key="wellbeing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <WellbeingDashboard />
              </motion.div>
            )}
            {activeTab === 'documents' && (
              <DocumentsTab
                documents={documents}
                employees={employees}
                onRefresh={handleRefresh}
                currentUser={user}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'payroll' && (
              <PayrollTab
                employees={employees}
                timesheets={timesheets}
                leaves={leaves}
                companyName="Synergia"
                onRefresh={handleRefresh}
                currentUser={user}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'settings' && <SettingsTab />}
          </AnimatePresence>

          {/* MODALS */}
          {showNewEmployeeModal && (
            <NewEmployeeModal 
              onClose={() => setShowNewEmployeeModal(false)}
              onSuccess={() => {
                setShowNewEmployeeModal(false);
                handleRefresh();
              }}
            />
          )}

          {showNewScheduleModal && (
            <NewScheduleModal 
              employees={employees}
              onClose={() => setShowNewScheduleModal(false)}
              onSuccess={() => {
                setShowNewScheduleModal(false);
                handleRefresh();
              }}
            />
          )}

          {showEmployeeDetailModal && selectedEmployee && (
            <EmployeeDetailModal
              employee={selectedEmployee}
              initialEditMode={initialEditMode}
              onClose={() => {
                setShowEmployeeDetailModal(false);
                setSelectedEmployee(null);
                setInitialEditMode(false);
              }}
              onSuccess={() => {
                setShowEmployeeDetailModal(false);
                setSelectedEmployee(null);
                setInitialEditMode(false);
                handleRefresh();
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

// ==========================================
// 📋 MODAL DÉTAIL / ÉDITION SALARIÉ
// ==========================================
const EmployeeDetailModal = ({ employee, initialEditMode = false, onClose, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  const [contractData, setContractData] = useState({
    contractType: employee.contractData?.contractType || '',
    jobTitle: employee.contractData?.jobTitle || employee.position || '',
    startDateOrg: employee.contractData?.startDateOrg || '',
    contractStartDate: employee.contractData?.contractStartDate || '',
    trialEndDate: employee.contractData?.trialEndDate || '',
    contractEndDate: employee.contractData?.contractEndDate || '',
    status: employee.contractData?.status || 'Employé',
    registrationNumber: employee.contractData?.registrationNumber || '',
    pcsCode: employee.contractData?.pcsCode || '',
    dpaeCompleted: employee.contractData?.dpaeCompleted || false,
    lastMedicalVisit: employee.contractData?.lastMedicalVisit || ''
  });

  const [salaryData, setSalaryData] = useState({
    workingTime: employee.salaryData?.workingTime || 'Standard',
    weeklyHours: employee.salaryData?.weeklyHours || 35,
    amendments: employee.salaryData?.amendments || '',
    monthlyGrossSalary: employee.salaryData?.monthlyGrossSalary || 0,
    hourlyGrossRate: employee.salaryData?.hourlyGrossRate || 0,
    chargedHourlyRate: employee.salaryData?.chargedHourlyRate || 0,
    transportCost: employee.salaryData?.transportCost || 0
  });

  useEffect(() => {
    if (salaryData.monthlyGrossSalary && salaryData.weeklyHours) {
      const monthlyHours = (salaryData.weeklyHours * 52) / 12;
      const hourlyRate = salaryData.monthlyGrossSalary / monthlyHours;
      setSalaryData(prev => ({
        ...prev,
        hourlyGrossRate: Math.round(hourlyRate * 100) / 100,
        chargedHourlyRate: Math.round(hourlyRate * 1.43 * 100) / 100
      }));
    }
  }, [salaryData.monthlyGrossSalary, salaryData.weeklyHours]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const employeeRef = doc(db, 'users', employee.id);
      await updateDoc(employeeRef, {
        contractData: contractData,
        salaryData: salaryData,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Fiche salarié mise à jour');
      alert('Fiche salarié mise à jour avec succès !');
      onSuccess();
    } catch (error) {
      console.error('❌ Erreur mise à jour fiche:', error);
      alert('Erreur lors de la mise à jour de la fiche');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Informations personnelles', icon: UserIcon },
    { id: 'contract', label: 'Données contractuelles', icon: FileText },
    { id: 'salary', label: 'Données salariales', icon: DollarSign }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              user={{
                ...employee,
                displayName: `${employee.firstName} ${employee.lastName}`
              }}
              size="xl"
              showBorder={true}
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{employee.firstName} {employee.lastName}</h2>
              <p className="text-blue-100">{employee.position}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </>
            )}
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* NAVIGATION DES SECTIONS */}
        <div className="border-b border-gray-700 bg-gray-800/50">
          <div className="flex gap-2 p-4 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="text-gray-400 text-sm mb-1 block">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-white">{employee.email}</p>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="text-gray-400 text-sm mb-1 block">Téléphone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-white">{employee.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="text-gray-400 text-sm mb-1 block">Département</label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <p className="text-white">{employee.department}</p>
                    </div>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="text-gray-400 text-sm mb-1 block">Date d'arrivée</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-white">{employee.startDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Gamification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                    <label className="text-gray-300 text-sm mb-1 block">Niveau</label>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      <p className="text-white text-2xl font-bold">{employee.level}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4 border border-blue-500/30">
                    <label className="text-gray-300 text-sm mb-1 block">XP Total</label>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-400" />
                      <p className="text-white text-2xl font-bold">{employee.totalXP}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contract' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Données contractuelles</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Type de contrat *</label>
                  {isEditing ? (
                    <select
                      value={contractData.contractType}
                      onChange={(e) => setContractData({ ...contractData, contractType: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Apprenti">Apprenti</option>
                      <option value="Alternance">Alternance</option>
                      <option value="Stage">Stage</option>
                      <option value="Temps Plein">Temps Plein</option>
                      <option value="Temps Partiel">Temps Partiel</option>
                    </select>
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.contractType || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Intitulé du poste</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={contractData.jobTitle}
                      onChange={(e) => setContractData({ ...contractData, jobTitle: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Gestion PME PMI"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.jobTitle || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Date d'arrivée dans l'organisation</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={contractData.startDateOrg}
                      onChange={(e) => setContractData({ ...contractData, startDateOrg: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.startDateOrg || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Date de début de contrat *</label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={contractData.contractStartDate}
                      onChange={(e) => setContractData({ ...contractData, contractStartDate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.contractStartDate || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Date de fin de période d'essai</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={contractData.trialEndDate}
                      onChange={(e) => setContractData({ ...contractData, trialEndDate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.trialEndDate || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Date de fin de contrat</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={contractData.contractEndDate}
                      onChange={(e) => setContractData({ ...contractData, contractEndDate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.contractEndDate || 'CDI'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Statut</label>
                  {isEditing ? (
                    <select
                      value={contractData.status}
                      onChange={(e) => setContractData({ ...contractData, status: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Employé">Employé</option>
                      <option value="Cadre">Cadre</option>
                      <option value="Agent de maîtrise">Agent de maîtrise</option>
                      <option value="Ouvrier">Ouvrier</option>
                    </select>
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Matricule contrat</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={contractData.registrationNumber}
                      onChange={(e) => setContractData({ ...contractData, registrationNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: CAR00001"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.registrationNumber || 'Non renseigné'}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Code PCS-ESE</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={contractData.pcsCode}
                      onChange={(e) => setContractData({ ...contractData, pcsCode: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 55 Employés de commerce - 553c Autres vendeurs non spécialisés"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.pcsCode || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">DPAE effectuée ?</label>
                  {isEditing ? (
                    <select
                      value={contractData.dpaeCompleted ? 'true' : 'false'}
                      onChange={(e) => setContractData({ ...contractData, dpaeCompleted: e.target.value === 'true' })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">Non</option>
                      <option value="true">Oui</option>
                    </select>
                  ) : (
                    <p className={`px-4 py-2 rounded-lg ${contractData.dpaeCompleted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {contractData.dpaeCompleted ? 'Oui' : 'Non'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Date de la dernière visite médicale</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={contractData.lastMedicalVisit}
                      onChange={(e) => setContractData({ ...contractData, lastMedicalVisit: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{contractData.lastMedicalVisit || 'Non renseigné'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'salary' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Données salariales</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Temps de travail *</label>
                  {isEditing ? (
                    <select
                      value={salaryData.workingTime}
                      onChange={(e) => setSalaryData({ ...salaryData, workingTime: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Temps partiel">Temps partiel</option>
                      <option value="Temps plein">Temps plein</option>
                      <option value="Forfait jours">Forfait jours</option>
                    </select>
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.workingTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Heures par semaine</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.5"
                      value={salaryData.weeklyHours}
                      onChange={(e) => setSalaryData({ ...salaryData, weeklyHours: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.weeklyHours} h / semaine</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Avenants au volume horaire</label>
                  {isEditing ? (
                    <textarea
                      value={salaryData.amendments}
                      onChange={(e) => setSalaryData({ ...salaryData, amendments: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Aucun avenant ou décrire les avenants..."
                    />
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.amendments || 'Aucun avenant'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Salaire mensuel brut</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={salaryData.monthlyGrossSalary}
                        onChange={(e) => setSalaryData({ ...salaryData, monthlyGrossSalary: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.monthlyGrossSalary.toFixed(2)} €</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Taux horaire brut moyen</label>
                  <p className="text-white bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                    {salaryData.hourlyGrossRate.toFixed(2)} €
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Calculé automatiquement</p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Taux horaire moyen chargé</label>
                  <p className="text-white bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30">
                    {salaryData.chargedHourlyRate.toFixed(2)} €
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Avec charges patronales estimées</p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm font-medium">Coût de transport pour l'employeur</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={salaryData.transportCost}
                        onChange={(e) => setSalaryData({ ...salaryData, transportCost: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  ) : (
                    <p className="text-white bg-gray-700/30 px-4 py-2 rounded-lg">{salaryData.transportCost.toFixed(2)} €</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium mb-1">Information</p>
                      <p>Le taux horaire brut moyen est calculé automatiquement : Salaire mensuel brut ÷ (Heures hebdomadaires × 52 semaines ÷ 12 mois)</p>
                      <p className="mt-2">Le taux horaire chargé inclut une estimation des charges patronales à 43%.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="border-t border-gray-700 bg-gray-800/50 p-4 flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default HRPage;
