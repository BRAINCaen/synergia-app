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
  Toggle,
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
  ScanLine,
  FileSearch,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';

// 🎯 IMPORTS
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

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
import payslipReaderService from '../core/services/payslipReaderService.js';
import timesheetExportService, { MONTHS_FR } from '../core/services/timesheetExportService.js';

// 🎨 COMPOSANT CARTE GLASSMORPHISM
const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// 🎨 STAT CARD
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const iconColors = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    orange: 'bg-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    indigo: 'bg-indigo-500/20 text-indigo-400'
  };

  const textColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    indigo: 'text-indigo-400'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <div className={`p-2 rounded-xl ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-xs sm:text-sm font-medium text-gray-400">{title}</h3>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold mb-1 ${textColors[color]}`}>{value}</div>
      {subtitle && <div className="text-xs sm:text-sm text-gray-500">{subtitle}</div>}
    </motion.div>
  );
};

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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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
                companyName={companySettings?.name}
                onRefresh={handleRefresh}
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
              onClose={() => {
                setShowEmployeeDetailModal(false);
                setSelectedEmployee(null);
              }}
              onSuccess={() => {
                setShowEmployeeDetailModal(false);
                setSelectedEmployee(null);
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
// 👥 ONGLET SALARIÉS
// ==========================================
const EmployeesTab = ({ employees, searchTerm, setSearchTerm, onAddEmployee, onViewEmployee, onRefresh }) => {
  return (
    <motion.div
      key="employees"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Gestion des Salariés</h2>
            <p className="text-gray-400">Fiches personnel et documents RH</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onRefresh}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={onAddEmployee}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Salarié
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un salarié (nom, email, poste...)"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">Aucun salarié pour le moment</p>
            <button
              onClick={onAddEmployee}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter votre premier salarié
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(employee => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee} 
                onViewEmployee={onViewEmployee}
                onRefresh={onRefresh} 
              />
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

// 👤 CARTE SALARIÉ
const EmployeeCard = ({ employee, onViewEmployee, onRefresh }) => {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    onLeave: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
  };

  const statusLabels = {
    active: 'Actif',
    inactive: 'Inactif',
    onLeave: 'En congé'
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {employee.photoURL ? (
            <img 
              src={employee.photoURL} 
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
          )}
          <div>
            <h3 className="text-white font-semibold">{employee.firstName} {employee.lastName}</h3>
            <p className="text-gray-400 text-sm">{employee.position}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[employee.status]}`}>
          {statusLabels[employee.status]}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Mail className="w-4 h-4" />
          <span>{employee.email}</span>
        </div>
        {employee.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{employee.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Briefcase className="w-4 h-4" />
          <span>{employee.department}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onViewEmployee(employee)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Eye className="w-4 h-4" />
          Voir détail
        </button>
        <button className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors">
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 📋 MODAL DÉTAIL / ÉDITION SALARIÉ
// ==========================================
const EmployeeDetailModal = ({ employee, onClose, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
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
            {employee.photoURL ? (
              <img 
                src={employee.photoURL} 
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </div>
            )}
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

// ==========================================
// 🏖️ ONGLET CONGÉS
// ==========================================
const LeavesTab = ({ employees, onRefresh }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [subTab, setSubTab] = useState('requests'); // 'requests' ou 'balances'
  const [employeeBalances, setEmployeeBalances] = useState({});
  const [editingBalance, setEditingBalance] = useState(null);
  const [balanceForm, setBalanceForm] = useState({ paidLeaveDays: 25, bonusOffDays: 0, rttDays: 0 });

  // Types de congés
  const leaveTypes = [
    { id: 'paid', label: 'Congés payés', color: 'green', icon: '🏖️' },
    { id: 'unpaid', label: 'Sans solde', color: 'orange', icon: '📅' },
    { id: 'sick', label: 'Maladie', color: 'red', icon: '🏥' },
    { id: 'rtt', label: 'RTT', color: 'blue', icon: '⏰' },
    { id: 'family', label: 'Événement familial', color: 'purple', icon: '👨‍👩‍👧' },
    { id: 'training', label: 'Formation', color: 'indigo', icon: '📚' }
  ];

  useEffect(() => {
    loadLeaveRequests();
    loadEmployeeBalances();
  }, [employees]);

  // Charger les soldes de congés de tous les employés
  const loadEmployeeBalances = async () => {
    try {
      const balances = {};
      for (const emp of employees) {
        const userDoc = await getDoc(doc(db, 'users', emp.id));
        if (userDoc.exists()) {
          balances[emp.id] = userDoc.data().leaveBalance || {
            paidLeaveDays: 25,
            bonusOffDays: 0,
            rttDays: 0,
            usedPaidLeaveDays: 0,
            usedBonusDays: 0,
            usedRttDays: 0
          };
        }
      }
      setEmployeeBalances(balances);
    } catch (error) {
      console.error('Erreur chargement soldes:', error);
    }
  };

  // Mettre à jour le solde d'un employé
  const updateEmployeeBalance = async (employeeId) => {
    try {
      await updateDoc(doc(db, 'users', employeeId), {
        leaveBalance: {
          ...employeeBalances[employeeId],
          ...balanceForm,
          lastUpdated: new Date().toISOString()
        }
      });
      setEditingBalance(null);
      loadEmployeeBalances();
    } catch (error) {
      console.error('Erreur mise à jour solde:', error);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const leavesRef = collection(db, 'leave_requests');
      const snapshot = await getDocs(query(leavesRef, orderBy('createdAt', 'desc')));
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaveRequests(requests);
    } catch (error) {
      console.error('Erreur chargement congés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await updateDoc(doc(db, 'leave_requests', requestId), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });
      loadLeaveRequests();
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, 'leave_requests', requestId), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });
      loadLeaveRequests();
    } catch (error) {
      console.error('Erreur rejet:', error);
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En attente' },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approuvé' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Refusé' }
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Stats rapides
  const stats = {
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    thisMonth: leaveRequests.filter(r => {
      const date = r.startDate?.toDate?.() || new Date(r.startDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <motion.div
      key="leaves"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard title="En attente" value={stats.pending} icon={Clock} color="yellow" />
        <StatCard title="Approuvés" value={stats.approved} icon={CheckCircle} color="green" />
        <StatCard title="Ce mois" value={stats.thisMonth} icon={Calendar} color="blue" />
        <StatCard title="Total demandes" value={leaveRequests.length} icon={FileText} color="purple" />
      </div>

      {/* Sous-onglets */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subTab === 'requests'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          📋 Demandes
        </button>
        <button
          onClick={() => setSubTab('balances')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            subTab === 'balances'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:text-white'
          }`}
        >
          🏖️ Compteurs CP
        </button>
      </div>

      {/* Vue Compteurs */}
      {subTab === 'balances' && (
        <GlassCard>
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Gestion des Compteurs</h2>
            <p className="text-gray-400 text-sm">Gérez les soldes de congés de chaque employé</p>
          </div>

          <div className="space-y-3">
            {employees.map((emp) => {
              const balance = employeeBalances[emp.id] || {};
              const isEditing = editingBalance === emp.id;

              return (
                <div
                  key={emp.id}
                  className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Info employé */}
                    <div className="flex items-center gap-3">
                      {emp.photoURL ? (
                        <img src={emp.photoURL} alt={emp.displayName} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {emp.displayName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{emp.displayName || emp.email}</p>
                        <p className="text-gray-400 text-sm">{emp.email}</p>
                      </div>
                    </div>

                    {/* Compteurs */}
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-sm">🏖️ CP:</span>
                          <input
                            type="number"
                            value={balanceForm.paidLeaveDays}
                            onChange={(e) => setBalanceForm({ ...balanceForm, paidLeaveDays: parseInt(e.target.value) || 0 })}
                            className="w-16 bg-gray-700 text-white px-2 py-1 rounded text-center text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 text-sm">🎁 Bonus:</span>
                          <input
                            type="number"
                            value={balanceForm.bonusOffDays}
                            onChange={(e) => setBalanceForm({ ...balanceForm, bonusOffDays: parseInt(e.target.value) || 0 })}
                            className="w-16 bg-gray-700 text-white px-2 py-1 rounded text-center text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm">⏰ RTT:</span>
                          <input
                            type="number"
                            value={balanceForm.rttDays}
                            onChange={(e) => setBalanceForm({ ...balanceForm, rttDays: parseInt(e.target.value) || 0 })}
                            className="w-16 bg-gray-700 text-white px-2 py-1 rounded text-center text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateEmployeeBalance(emp.id)}
                            className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => setEditingBalance(null)}
                            className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-1.5">
                          <span className="text-amber-300 text-sm">
                            🏖️ CP: <strong>{(balance.paidLeaveDays || 25) - (balance.usedPaidLeaveDays || 0)}</strong>/{balance.paidLeaveDays || 25}
                          </span>
                        </div>
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1.5">
                          <span className="text-purple-300 text-sm">
                            🎁 Bonus: <strong>{(balance.bonusOffDays || 0) - (balance.usedBonusDays || 0)}</strong>/{balance.bonusOffDays || 0}
                          </span>
                        </div>
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5">
                          <span className="text-green-300 text-sm">
                            ⏰ RTT: <strong>{(balance.rttDays || 0) - (balance.usedRttDays || 0)}</strong>/{balance.rttDays || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingBalance(emp.id);
                            setBalanceForm({
                              paidLeaveDays: balance.paidLeaveDays || 25,
                              bonusOffDays: balance.bonusOffDays || 0,
                              rttDays: balance.rttDays || 0
                            });
                          }}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                          title="Modifier les compteurs"
                        >
                          <Edit className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Vue Demandes */}
      {subTab === 'requests' && (
      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Demandes de Congés</h2>
            <p className="text-gray-400 text-sm">Demandes de congés et absences</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Refusés'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Aucune demande de congé</p>
            <p className="text-gray-500 text-sm">Les demandes de congés apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const employee = employees.find(e => e.id === request.employeeId);
              const leaveType = leaveTypes.find(t => t.id === request.type) || leaveTypes[0];
              const startDate = request.startDate?.toDate?.() || new Date(request.startDate);
              const endDate = request.endDate?.toDate?.() || new Date(request.endDate);

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                        {leaveType.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {employee?.firstName} {employee?.lastName}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {leaveType.label} • {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>

                  {request.reason && (
                    <div className="mt-3 p-3 bg-gray-900/30 rounded-lg">
                      <p className="text-gray-400 text-sm">{request.reason}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
      )}
    </motion.div>
  );
};

// ==========================================
// 📋 ONGLET ENTRETIENS
// ==========================================
const InterviewsTab = ({ employees, onRefresh }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Types d'entretiens
  const interviewTypes = [
    { id: 'annual', label: 'Entretien annuel', color: 'blue', duration: '1h30' },
    { id: 'professional', label: 'Entretien professionnel', color: 'purple', duration: '1h' },
    { id: 'probation', label: 'Fin de période d\'essai', color: 'orange', duration: '45min' },
    { id: 'followup', label: 'Suivi', color: 'green', duration: '30min' },
    { id: 'return', label: 'Retour absence longue', color: 'yellow', duration: '45min' }
  ];

  useEffect(() => {
    loadInterviews();
  }, [selectedYear]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const interviewsRef = collection(db, 'hr_interviews');
      const snapshot = await getDocs(query(interviewsRef, orderBy('scheduledDate', 'desc')));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInterviews(data);
    } catch (error) {
      console.error('Erreur chargement entretiens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = {
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    overdue: interviews.filter(i => {
      const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate);
      return date < new Date() && i.status === 'scheduled';
    }).length,
    thisMonth: interviews.filter(i => {
      const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  // Employés sans entretien annuel cette année
  const employeesWithoutAnnualReview = employees.filter(emp => {
    return !interviews.some(i =>
      i.employeeId === emp.id &&
      i.type === 'annual' &&
      new Date(i.scheduledDate?.toDate?.() || i.scheduledDate).getFullYear() === selectedYear
    );
  });

  return (
    <motion.div
      key="interviews"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard title="Planifiés" value={stats.scheduled} icon={Calendar} color="blue" />
        <StatCard title="Complétés" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard title="En retard" value={stats.overdue} icon={AlertTriangle} color="orange" />
        <StatCard title="Ce mois" value={stats.thisMonth} icon={Clock} color="purple" />
      </div>

      {/* Alerte employés sans entretien */}
      {employeesWithoutAnnualReview.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-400 mb-1">
                {employeesWithoutAnnualReview.length} salarié(s) sans entretien annuel en {selectedYear}
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {employeesWithoutAnnualReview.slice(0, 5).map(emp => (
                  <span key={emp.id} className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300 text-xs">
                    {emp.firstName} {emp.lastName}
                  </span>
                ))}
                {employeesWithoutAnnualReview.length > 5 && (
                  <span className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300 text-xs">
                    +{employeesWithoutAnnualReview.length - 5} autres
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Entretiens</h2>
            <p className="text-gray-400 text-sm">Entretiens annuels et professionnels</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewInterviewModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Planifier
            </button>
          </div>
        </div>

        {/* Types d'entretiens */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {interviewTypes.map((type) => (
            <div
              key={type.id}
              className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50 text-center"
            >
              <div className={`text-${type.color}-400 font-medium text-sm mb-1`}>{type.label}</div>
              <div className="text-gray-500 text-xs">~{type.duration}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Aucun entretien planifié</p>
            <p className="text-gray-500 text-sm mb-4">Planifiez vos entretiens annuels et professionnels</p>
            <button
              onClick={() => setShowNewInterviewModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Planifier un entretien
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => {
              const employee = employees.find(e => e.id === interview.employeeId);
              const type = interviewTypes.find(t => t.id === interview.type) || interviewTypes[0];
              const date = interview.scheduledDate?.toDate?.() || new Date(interview.scheduledDate);
              const isOverdue = date < new Date() && interview.status === 'scheduled';

              return (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-xl border ${
                    isOverdue
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-800/40 border-gray-700/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${type.color}-500/20 rounded-full flex items-center justify-center`}>
                        <UserCheck className={`w-5 h-5 text-${type.color}-400`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {employee?.firstName} {employee?.lastName}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs bg-${type.color}-500/20 text-${type.color}-400`}>
                            {type.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverdue && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                          En retard
                        </span>
                      )}
                      {interview.status === 'completed' && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Complété
                        </span>
                      )}
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

// ==========================================
// 🎓 ONGLET FORMATIONS
// ==========================================
const TrainingTab = ({ employees, onRefresh }) => {
  const [trainings, setTrainings] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('trainings'); // trainings, certifications, plan

  // Types de formations
  const trainingTypes = [
    { id: 'internal', label: 'Formation interne', color: 'blue', icon: '🏠' },
    { id: 'external', label: 'Formation externe', color: 'purple', icon: '🏫' },
    { id: 'elearning', label: 'E-learning', color: 'green', icon: '💻' },
    { id: 'certification', label: 'Certification', color: 'orange', icon: '📜' },
    { id: 'safety', label: 'Sécurité', color: 'red', icon: '🦺' }
  ];

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      setLoading(true);

      // Charger les formations
      const trainingsRef = collection(db, 'hr_trainings');
      const trainingsSnapshot = await getDocs(query(trainingsRef, orderBy('date', 'desc')));
      const trainingsData = trainingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrainings(trainingsData);

      // Charger les certifications
      const certsRef = collection(db, 'hr_certifications');
      const certsSnapshot = await getDocs(certsRef);
      const certsData = certsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCertifications(certsData);

    } catch (error) {
      console.error('Erreur chargement formations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = {
    totalTrainings: trainings.length,
    completedThisYear: trainings.filter(t => {
      const date = t.date?.toDate?.() || new Date(t.date);
      return date.getFullYear() === new Date().getFullYear() && t.status === 'completed';
    }).length,
    upcomingTrainings: trainings.filter(t => {
      const date = t.date?.toDate?.() || new Date(t.date);
      return date > new Date() && t.status === 'scheduled';
    }).length,
    expiringCerts: certifications.filter(c => {
      const expiry = c.expiryDate?.toDate?.() || new Date(c.expiryDate);
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      return expiry <= threeMonths && expiry > new Date();
    }).length
  };

  return (
    <motion.div
      key="training"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard title="Formations" value={stats.totalTrainings} icon={Award} color="blue" />
        <StatCard title="Complétées (année)" value={stats.completedThisYear} icon={CheckCircle} color="green" />
        <StatCard title="À venir" value={stats.upcomingTrainings} icon={Calendar} color="purple" />
        <StatCard title="Certifs expirantes" value={stats.expiringCerts} icon={AlertTriangle} color="orange" />
      </div>

      {/* Alerte certifications */}
      {stats.expiringCerts > 0 && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400">
              {stats.expiringCerts} certification(s) expire(nt) dans les 3 prochains mois
            </span>
          </div>
        </div>
      )}

      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Formations & Certifications</h2>
            <p className="text-gray-400 text-sm">Suivi du plan de formation</p>
          </div>
          <div className="flex gap-2">
            {['trainings', 'certifications', 'plan'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeView === view
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {view === 'trainings' ? 'Formations' : view === 'certifications' ? 'Certifications' : 'Plan annuel'}
              </button>
            ))}
          </div>
        </div>

        {/* Types de formations */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {trainingTypes.map((type) => (
            <div
              key={type.id}
              className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50 text-center"
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-gray-300 text-xs">{type.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : activeView === 'trainings' ? (
          trainings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Aucune formation enregistrée</p>
              <p className="text-gray-500 text-sm mb-4">Commencez à planifier les formations</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une formation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trainings.map((training) => {
                const type = trainingTypes.find(t => t.id === training.type) || trainingTypes[0];
                const date = training.date?.toDate?.() || new Date(training.date);

                return (
                  <motion.div
                    key={training.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                          {type.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white">{training.title}</div>
                          <div className="text-sm text-gray-400">
                            {type.label} • {date.toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        training.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : training.status === 'scheduled'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {training.status === 'completed' ? 'Complétée' : training.status === 'scheduled' ? 'Planifiée' : 'Annulée'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : activeView === 'certifications' ? (
          <div className="space-y-3">
            {certifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune certification enregistrée</p>
              </div>
            ) : (
              certifications.map((cert) => {
                const employee = employees.find(e => e.id === cert.employeeId);
                const expiry = cert.expiryDate?.toDate?.() || new Date(cert.expiryDate);
                const isExpiring = expiry <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                const isExpired = expiry < new Date();

                return (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-xl border ${
                      isExpired
                        ? 'bg-red-500/10 border-red-500/30'
                        : isExpiring
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-gray-800/40 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{cert.name}</div>
                        <div className="text-sm text-gray-400">
                          {employee?.firstName} {employee?.lastName} • Expire le {expiry.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      {isExpired ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Expiré</span>
                      ) : isExpiring ? (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">Bientôt</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Valide</span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Plan de formation annuel</p>
            <p className="text-gray-500 text-sm mb-4">Définissez vos objectifs de formation</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer le plan de formation
            </button>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

// ==========================================
// ⏰ ONGLET POINTAGE - AVEC HISTORIQUE COMPLET
// ==========================================
const TimesheetTab = ({ timesheets, employees, onRefresh, currentUserId }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [dateFilter, setDateFilter] = useState('month'); // 'today', 'week', 'month', 'all'

  // 📊 États pour l'export Excel
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth());
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportEmployeeId, setExportEmployeeId] = useState('all');
  const [exporting, setExporting] = useState(false);

  // Charger les pointages depuis Firebase
  useEffect(() => {
    const loadTimeEntries = async () => {
      try {
        setLoadingEntries(true);

        // Calculer les dates de filtre
        const now = new Date();
        let startDate = new Date();

        if (dateFilter === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (dateFilter === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else {
          startDate = new Date(2020, 0, 1); // Tout l'historique
        }

        const entriesQuery = query(
          collection(db, 'timeEntries'),
          where('date', '>=', startDate),
          orderBy('date', 'desc'),
          orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
          const entries = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status !== 'deleted') {
              entries.push({
                id: doc.id,
                ...data,
                date: data.date?.toDate(),
                timestamp: data.timestamp?.toDate(),
                createdAt: data.createdAt?.toDate()
              });
            }
          });

          // Filtrer par utilisateur si nécessaire
          const filteredEntries = selectedUserId === 'all'
            ? entries
            : entries.filter(e => e.userId === selectedUserId);

          setTimeEntries(filteredEntries);
          setLoadingEntries(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Erreur chargement pointages:', error);
        setLoadingEntries(false);
      }
    };

    loadTimeEntries();
  }, [dateFilter, selectedUserId]);

  // Supprimer un pointage
  const deleteTimeEntry = async (entryId) => {
    if (!confirm('Supprimer ce pointage ?')) return;
    try {
      const entryRef = doc(db, 'timeEntries', entryId);
      await updateDoc(entryRef, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  // Formater l'heure
  const formatHour = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Grouper les entrées par jour
  const groupedEntries = useMemo(() => {
    const groups = {};
    timeEntries.forEach(entry => {
      const dayKey = entry.date?.toDateString() || 'Unknown';
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(entry);
    });
    return groups;
  }, [timeEntries]);

  // Calculer le temps total par jour
  const calculateDayTotal = (entries) => {
    let totalSeconds = 0;
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < sorted.length; i += 2) {
      const arrival = sorted[i];
      const departure = sorted[i + 1];

      if (arrival?.type === 'arrival') {
        if (departure?.type === 'departure') {
          totalSeconds += Math.floor((departure.timestamp - arrival.timestamp) / 1000);
        }
      }
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  // Obtenir le nom de l'employé
  const getEmployeeName = (userId) => {
    const emp = employees.find(e => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Utilisateur inconnu';
  };

  // 📊 Fonction d'export Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const result = await timesheetExportService.exportMonthlyTimesheet(
        exportYear,
        exportMonth,
        {
          employeeId: exportEmployeeId === 'all' ? null : exportEmployeeId,
          companyName: 'Synergia'
        }
      );

      if (result.success) {
        setShowExportModal(false);
        alert(`✅ Export réussi : ${result.fileName}`);
      }
    } catch (error) {
      console.error('Erreur export:', error);
      alert('❌ Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Générer les années disponibles (5 ans en arrière)
  const availableYears = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i <= 5; i++) {
    availableYears.push(currentYear - i);
  }

  return (
    <motion.div
      key="timesheet"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Pointage & Badgeuse</h2>
            <p className="text-gray-400 text-sm sm:text-base">Historique complet des pointages</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
            <a
              href="/pulse"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Accès Badgeuse</span>
              <span className="sm:hidden">Badgeuse</span>
            </a>
            <button
              onClick={onRefresh}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Filtre par période */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="all">Tout l'historique</option>
          </select>

          {/* Filtre par employé */}
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          >
            <option value="all">Tous les employés</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Contenu */}
        {loadingEntries ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement des pointages...</p>
          </div>
        ) : Object.keys(groupedEntries).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Aucun pointage trouvé</p>
            <p className="text-gray-500 text-sm">Accédez à la badgeuse pour pointer vos heures</p>
            <a
              href="/pulse"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4" />
              Aller à la Badgeuse
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([dayKey, dayEntries]) => {
              const dayDate = new Date(dayKey);
              const dayTotal = calculateDayTotal(dayEntries);

              return (
                <div key={dayKey} className="bg-gray-800/30 rounded-xl p-4">
                  {/* En-tête du jour */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {dayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-gray-400 text-sm">{dayEntries.length} pointage(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">{dayTotal}</p>
                      <p className="text-xs text-gray-400">Total journée</p>
                    </div>
                  </div>

                  {/* Liste des pointages du jour */}
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${entry.type === 'arrival' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {entry.type === 'arrival' ? (
                              <UserCheck className="w-4 h-4 text-green-400" />
                            ) : (
                              <UserX className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {entry.type === 'arrival' ? 'Arrivée' : 'Départ'}
                            </div>
                            {selectedUserId === 'all' && (
                              <div className="text-xs text-gray-400">
                                {getEmployeeName(entry.userId)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white">{formatHour(entry.timestamp)}</span>
                          <button
                            onClick={() => deleteTimeEntry(entry.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* 📊 Modal Export Excel */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  Export des Pointages
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Info box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">Export Excel complet</p>
                    <p className="text-gray-400">
                      Génère un fichier Excel modifiable avec les arrivées, départs, heures travaillées, congés et statistiques.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Mois */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Mois</label>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {MONTHS_FR.map((month, index) => (
                      <option key={index} value={index} className="bg-slate-900">
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Année */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Année</label>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year} className="bg-slate-900">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employé */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Employé</label>
                  <select
                    value={exportEmployeeId}
                    onChange={(e) => setExportEmployeeId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="all" className="bg-slate-900">Tous les employés</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id} className="bg-slate-900">
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Télécharger
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 📋 CARTE POINTAGE
const TimesheetCard = ({ timesheet, employees }) => {
  const employee = employees.find(e => e.id === timesheet.employeeId);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {employee?.firstName?.[0]}{employee?.lastName?.[0]}
          </div>
          <div>
            <p className="text-white font-semibold">{employee?.firstName} {employee?.lastName}</p>
            <p className="text-gray-400 text-sm">{timesheet.date} - {timesheet.totalHours}h</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full ${
            timesheet.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
            timesheet.status === 'validated' ? 'bg-green-500/20 text-green-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {timesheet.status === 'pending' ? 'En attente' : 
             timesheet.status === 'validated' ? 'Validé' : 'Rejeté'}
          </span>
          {timesheet.status === 'pending' && (
            <div className="flex gap-2">
              <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                <CheckCircle className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                <XCircle className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 📄 ONGLET DOCUMENTS
// ==========================================
const DocumentsTab = ({ documents, employees, onRefresh, currentUser, isAdmin }) => {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedSubFolders, setExpandedSubFolders] = useState({});
  const [documentsByEmployee, setDocumentsByEmployee] = useState([]);
  const [myDocuments, setMyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    type: 'payslip',
    title: '',
    description: '',
    period: '',
    fileName: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  // 📄 États pour le scan de bulletin de paie
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanFile, setScanFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ step: '', progress: 0, message: '' });
  const [scanResult, setScanResult] = useState(null);
  const [manualValues, setManualValues] = useState({ cpSolde: '', rtt: '' });
  const [updatingBalance, setUpdatingBalance] = useState(false);

  // Charger les documents
  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);

    if (isAdmin) {
      // Admin voit tous les documents groupés par employé
      const unsubscribe = hrDocumentService.subscribeToAllDocuments((docs) => {
        setDocumentsByEmployee(docs);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Employé voit seulement ses propres documents
      const unsubscribe = hrDocumentService.subscribeToEmployeeDocuments(currentUser.uid, (docs) => {
        setMyDocuments(docs);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser?.uid, isAdmin]);

  // Toggle dossier employé
  const toggleFolder = (employeeId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  // Toggle sous-dossier (type de document)
  const toggleSubFolder = (employeeId, type) => {
    const key = `${employeeId}-${type}`;
    setExpandedSubFolders(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Ouvrir modal upload
  const openUploadModal = (employee) => {
    setSelectedEmployee(employee);
    setUploadForm({
      type: 'payslip',
      title: '',
      description: '',
      period: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      fileName: ''
    });
    setUploadFile(null); // Reset le fichier sélectionné
    setShowUploadModal(true);
  };

  // Handler pour la sélection de fichier
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10 Mo)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Le fichier est trop volumineux (max 10 Mo)');
        return;
      }
      // Vérifier le type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Type de fichier non autorisé. Utilisez PDF, DOC, DOCX, PNG ou JPG.');
        return;
      }
      setUploadFile(file);
      // Auto-remplir le titre si vide
      if (!uploadForm.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Enlever l'extension
        setUploadForm(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  // Upload du document
  const handleUpload = async () => {
    if (!selectedEmployee || !uploadForm.title || !uploadFile) {
      alert('❌ Veuillez remplir tous les champs obligatoires et sélectionner un fichier');
      return;
    }

    setUploading(true);
    try {
      // TODO: Dans un vrai cas, uploader d'abord le fichier vers Firebase Storage
      // et récupérer l'URL. Pour l'instant on enregistre les métadonnées.
      const result = await hrDocumentService.createDocument({
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        type: uploadForm.type,
        title: uploadForm.title,
        description: uploadForm.description,
        period: uploadForm.period,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        mimeType: uploadFile.type,
        uploadedBy: currentUser.uid,
        uploadedByName: currentUser.displayName || currentUser.email
      });

      if (result.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        alert('✅ Document ajouté avec succès !');
      } else {
        alert('❌ Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('❌ Erreur lors de l\'upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 📄 Ouvrir le modal de scan
  const openScanModal = (employee) => {
    setSelectedEmployee(employee);
    setScanFile(null);
    setScanResult(null);
    setScanProgress({ step: '', progress: 0, message: '' });
    setManualValues({ cpSolde: '', rtt: '' });
    setShowScanModal(true);
  };

  // 📄 Gérer la sélection de fichier pour scan
  const handleScanFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScanFile(file);
      setScanResult(null);
    }
  };

  // 📄 Lancer le scan OCR
  const handleScanPayslip = async () => {
    if (!scanFile || !selectedEmployee) return;

    setScanning(true);
    setScanResult(null);

    try {
      const result = await payslipReaderService.processAndUpdateBalance(
        scanFile,
        selectedEmployee.id,
        (progress) => setScanProgress(progress)
      );

      setScanResult(result);

      // Pré-remplir les valeurs manuelles avec les valeurs détectées
      if (result.extractedData) {
        setManualValues({
          cpSolde: result.extractedData.cpSolde?.toString() || '',
          rtt: result.extractedData.rtt?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Erreur scan:', error);
      setScanResult({ success: false, error: error.message });
    } finally {
      setScanning(false);
    }
  };

  // 📄 Mettre à jour le solde de congés
  const handleUpdateBalance = async () => {
    if (!selectedEmployee) return;

    setUpdatingBalance(true);

    try {
      const dataToUpdate = {
        cpSolde: manualValues.cpSolde ? parseFloat(manualValues.cpSolde) : null,
        rtt: manualValues.rtt ? parseFloat(manualValues.rtt) : null,
        periode: scanResult?.extractedData?.periode || null
      };

      const result = await payslipReaderService.updateLeaveBalance(
        selectedEmployee.id,
        dataToUpdate,
        { overwrite: true, source: 'payslip_scan' }
      );

      if (result.success) {
        alert(`✅ Compteurs mis à jour pour ${selectedEmployee.name} !\n\nCP: ${dataToUpdate.cpSolde || 'non modifié'} jours\nRTT: ${dataToUpdate.rtt || 'non modifié'} jours`);
        setShowScanModal(false);
      } else {
        alert('❌ Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('❌ Erreur lors de la mise à jour');
    } finally {
      setUpdatingBalance(false);
    }
  };

  // 📋 Mettre à jour le dossier RH complet avec les données scannées
  const handleUpdateHRFile = async (extractedData) => {
    if (!selectedEmployee) return;

    setUpdatingBalance(true);

    try {
      // Préparer les mises à jour pour l'utilisateur
      const updates = {};

      // Données de congés
      if (extractedData.cpSolde !== null) {
        updates['leaveBalance.paidLeaveDays'] = extractedData.cpSolde;
      }
      if (extractedData.cpN1 !== null) {
        updates['leaveBalance.paidLeaveN1'] = extractedData.cpN1;
      }
      if (extractedData.rtt !== null) {
        updates['leaveBalance.rttDays'] = extractedData.rtt;
      }

      // Données salariales
      if (extractedData.salaireBrut !== null) {
        updates['salary.grossMonthly'] = extractedData.salaireBrut;
      }
      if (extractedData.salaireNet !== null) {
        updates['salary.netMonthly'] = extractedData.salaireNet;
      }
      if (extractedData.tauxHoraire !== null) {
        updates['salary.hourlyRate'] = extractedData.tauxHoraire;
      }

      // Données contractuelles
      if (extractedData.matricule) {
        updates['contract.matricule'] = extractedData.matricule;
      }
      if (extractedData.typeContrat) {
        updates['contract.type'] = extractedData.typeContrat;
      }
      if (extractedData.emploi) {
        updates['contract.jobTitle'] = extractedData.emploi;
      }
      if (extractedData.dateEntree) {
        updates['contract.startDate'] = extractedData.dateEntree;
      }
      if (extractedData.codePCS) {
        updates['contract.pcsCode'] = extractedData.codePCS;
      }
      if (extractedData.coefficient) {
        updates['contract.coefficient'] = extractedData.coefficient;
      }
      if (extractedData.tempsTravail) {
        updates['contract.workTime'] = extractedData.tempsTravail;
      }
      if (extractedData.heuresTravaillees) {
        updates['contract.monthlyHours'] = extractedData.heuresTravaillees;
      }
      if (extractedData.convention) {
        updates['contract.collectiveAgreement'] = extractedData.convention;
      }

      // Métadonnées
      updates['leaveBalance.lastScanDate'] = new Date().toISOString();
      updates['leaveBalance.lastScanPeriod'] = extractedData.periode || null;

      // Appliquer les mises à jour
      const userRef = doc(db, 'users', selectedEmployee.id);
      await updateDoc(userRef, updates);

      // Construire le message de confirmation
      const updatedFields = [];
      if (extractedData.cpSolde !== null) updatedFields.push(`CP: ${extractedData.cpSolde}j`);
      if (extractedData.rtt !== null) updatedFields.push(`RTT: ${extractedData.rtt}j`);
      if (extractedData.salaireBrut !== null) updatedFields.push(`Salaire brut: ${extractedData.salaireBrut.toFixed(2)}€`);
      if (extractedData.tauxHoraire !== null) updatedFields.push(`Taux horaire: ${extractedData.tauxHoraire.toFixed(2)}€/h`);
      if (extractedData.matricule) updatedFields.push(`Matricule: ${extractedData.matricule}`);
      if (extractedData.typeContrat) updatedFields.push(`Contrat: ${extractedData.typeContrat}`);
      if (extractedData.emploi) updatedFields.push(`Emploi: ${extractedData.emploi}`);
      if (extractedData.codePCS) updatedFields.push(`Code PCS: ${extractedData.codePCS}`);

      alert(`✅ Dossier RH mis à jour pour ${selectedEmployee.name} !\n\n${updatedFields.join('\n')}`);
      setShowScanModal(false);
      // Rafraîchir les données
      if (typeof handleRefresh === 'function') {
        handleRefresh();
      }

    } catch (error) {
      console.error('Erreur mise à jour dossier RH:', error);
      alert('❌ Erreur lors de la mise à jour du dossier RH: ' + error.message);
    } finally {
      setUpdatingBalance(false);
    }
  };

  // Supprimer un document
  const handleDeleteDocument = async (docId) => {
    if (!confirm('Supprimer ce document ?')) return;
    await hrDocumentService.deleteDocument(docId, isAdmin);
  };

  // Grouper les documents par type
  const groupDocumentsByType = (docs) => {
    const grouped = {};
    docs.forEach(doc => {
      if (!grouped[doc.type]) {
        grouped[doc.type] = [];
      }
      grouped[doc.type].push(doc);
    });
    return grouped;
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Rendu d'un document
  const renderDocument = (doc) => (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${DOCUMENT_TYPES[doc.type]?.color}20` }}>
          <File className="w-4 h-4" style={{ color: DOCUMENT_TYPES[doc.type]?.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{doc.title}</p>
          <p className="text-gray-500 text-xs">
            {doc.period && <span className="mr-2">{doc.period}</span>}
            <span>{formatDate(doc.createdAt)}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors"
          title="Télécharger"
        >
          <Download className="w-4 h-4 text-blue-400" />
        </button>
        <button
          className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors"
          title="Voir"
        >
          <Eye className="w-4 h-4 text-green-400" />
        </button>
        {isAdmin && (
          <button
            onClick={() => handleDeleteDocument(doc.id)}
            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </motion.div>
  );

  // Rendu d'un sous-dossier (type de document)
  const renderSubFolder = (employeeId, type, docs) => {
    const key = `${employeeId}-${type}`;
    const isExpanded = expandedSubFolders[key];
    const typeInfo = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.other;

    return (
      <div key={type} className="ml-4">
        <button
          onClick={() => toggleSubFolder(employeeId, type)}
          className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <FolderOpen className="w-4 h-4" style={{ color: typeInfo.color }} />
          ) : (
            <Folder className="w-4 h-4" style={{ color: typeInfo.color }} />
          )}
          <span className="text-gray-300 text-sm flex-1 text-left">
            {typeInfo.emoji} {typeInfo.folder}
          </span>
          <span className="text-gray-500 text-xs bg-white/10 px-2 py-0.5 rounded-full">
            {docs.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ml-4 space-y-1 overflow-hidden"
            >
              {docs.map(doc => renderDocument(doc))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Vue ADMIN : tous les employés avec leurs dossiers
  const renderAdminView = () => (
    <div className="space-y-2">
      {employees.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Aucun employé trouvé
        </div>
      ) : (
        employees.map(employee => {
          const isExpanded = expandedFolders[employee.id];
          const employeeDocs = documentsByEmployee.find(e => e.employeeId === employee.id);
          const docCount = employeeDocs?.documents?.length || 0;
          const groupedDocs = employeeDocs ? groupDocumentsByType(employeeDocs.documents) : {};

          return (
            <div key={employee.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              {/* Header dossier employé */}
              <button
                onClick={() => toggleFolder(employee.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                {isExpanded ? (
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                ) : (
                  <Folder className="w-5 h-5 text-amber-400" />
                )}

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {employee.name?.charAt(0).toUpperCase() || '?'}
                </div>

                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{employee.name}</p>
                  <p className="text-gray-500 text-xs">{employee.position || 'Employé'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm bg-white/10 px-3 py-1 rounded-full">
                    {docCount} doc{docCount > 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Contenu dossier */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      {/* Boutons d'action */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openUploadModal(employee)}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/20 hover:border-green-500/50 hover:bg-green-500/10 rounded-lg transition-all text-gray-400 hover:text-green-400"
                        >
                          <FilePlus className="w-4 h-4" />
                          <span className="text-sm">Ajouter</span>
                        </button>
                        <button
                          onClick={() => openScanModal(employee)}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-lg transition-all text-gray-400 hover:text-blue-400"
                        >
                          <ScanLine className="w-4 h-4" />
                          <span className="text-sm">Scanner bulletin</span>
                        </button>
                      </div>

                      {/* Sous-dossiers par type */}
                      {Object.keys(groupedDocs).length > 0 ? (
                        Object.entries(groupedDocs).map(([type, docs]) =>
                          renderSubFolder(employee.id, type, docs)
                        )
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">
                          Aucun document
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );

  // Vue EMPLOYÉ : ses propres documents uniquement
  const renderEmployeeView = () => {
    const groupedDocs = groupDocumentsByType(myDocuments);

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">Mes documents personnels</p>
              <p className="text-gray-400 text-sm">Ces documents sont confidentiels et accessibles uniquement par vous et les administrateurs RH.</p>
            </div>
          </div>
        </div>

        {Object.keys(groupedDocs).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(groupedDocs).map(([type, docs]) => {
              const typeInfo = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.other;
              const isExpanded = expandedSubFolders[type];

              return (
                <div key={type} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                  <button
                    onClick={() => setExpandedSubFolders(prev => ({ ...prev, [type]: !prev[type] }))}
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                  >
                    {isExpanded ? (
                      <FolderOpen className="w-5 h-5" style={{ color: typeInfo.color }} />
                    ) : (
                      <Folder className="w-5 h-5" style={{ color: typeInfo.color }} />
                    )}
                    <span className="text-2xl">{typeInfo.emoji}</span>
                    <span className="text-white font-medium flex-1 text-left">{typeInfo.folder}</span>
                    <span className="text-gray-400 text-sm bg-white/10 px-3 py-1 rounded-full">
                      {docs.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 p-4 space-y-2 overflow-hidden"
                      >
                        {docs.map(doc => renderDocument(doc))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Aucun document</p>
            <p className="text-gray-500 text-sm">
              Vos bulletins de paie et autres documents apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <motion.div
        key="documents"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="documents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Documents RH</h2>
            <p className="text-gray-400">
              {isAdmin ? 'Bulletins de paie, contrats et documents par salarié' : 'Mes documents personnels'}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={onRefresh}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          )}
        </div>

        {/* Contenu selon le rôle */}
        {isAdmin ? renderAdminView() : renderEmployeeView()}
      </GlassCard>

      {/* Modal Upload Document */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-green-400" />
                  Ajouter un document
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {selectedEmployee && (
                <div className="bg-white/5 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {selectedEmployee.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedEmployee.name}</p>
                    <p className="text-gray-500 text-sm">{selectedEmployee.position || 'Employé'}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Type de document */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Type de document</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  >
                    {Object.values(DOCUMENT_TYPES).map(type => (
                      <option key={type.id} value={type.id} className="bg-slate-900">
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Titre du document *</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    placeholder="Ex: Bulletin de paie Janvier 2025"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  />
                </div>

                {/* Période */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Période concernée</label>
                  <input
                    type="text"
                    value={uploadForm.period}
                    onChange={(e) => setUploadForm({ ...uploadForm, period: e.target.value })}
                    placeholder="Ex: Janvier 2025"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Description (optionnel)</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    placeholder="Notes ou informations supplémentaires..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
                  />
                </div>

                {/* Zone upload fichier */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Fichier *</label>
                  <label className={`block border-2 border-dashed ${uploadFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 hover:border-green-500/50'} rounded-xl p-6 text-center transition-colors cursor-pointer`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploadFile ? (
                      <>
                        <File className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-medium text-sm">
                          {uploadFile.name}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} Mo
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          Cliquez pour changer de fichier
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">
                          Cliquez ou glissez un fichier ici
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          PDF, DOC, DOCX, PNG, JPG (max 10 Mo)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadForm.title || !uploadFile || uploading}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Ajouter
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Scan Bulletin de Paie */}
      <AnimatePresence>
        {showScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !scanning && setShowScanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-blue-400" />
                  Scanner un bulletin de paie
                </h3>
                <button
                  onClick={() => !scanning && setShowScanModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  disabled={scanning}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {selectedEmployee && (
                <div className="bg-white/5 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {selectedEmployee.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedEmployee.name}</p>
                    <p className="text-gray-500 text-sm">{selectedEmployee.position || 'Employé'}</p>
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FileSearch className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">Extraction automatique</p>
                    <p className="text-gray-400">
                      L'OCR va analyser le bulletin pour extraire automatiquement le solde de congés payés (CP) et RTT.
                    </p>
                  </div>
                </div>
              </div>

              {/* Zone de sélection fichier */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Fichier du bulletin de paie</label>
                <label className="block border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-xl p-6 text-center transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={handleScanFileSelect}
                    className="hidden"
                    disabled={scanning}
                  />
                  {scanFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <File className="w-8 h-8 text-blue-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">{scanFile.name}</p>
                        <p className="text-gray-500 text-xs">{(scanFile.size / 1024).toFixed(1)} Ko</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        Cliquez pour sélectionner un fichier
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        PDF, JPG, PNG, WEBP (scan ou photo)
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Bouton scan */}
              {!scanResult && (
                <button
                  onClick={handleScanPayslip}
                  disabled={!scanFile || scanning}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {scanProgress.message || 'Analyse en cours...'}
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-5 h-5" />
                      Lancer le scan OCR
                    </>
                  )}
                </button>
              )}

              {/* Barre de progression */}
              {scanning && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{scanProgress.message}</span>
                    <span className="text-blue-400">{scanProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Résultats du scan */}
              {scanResult && (
                <div className="space-y-4">
                  {scanResult.success ? (
                    <>
                      {/* Score de confiance */}
                      <div className={`p-3 rounded-xl ${
                        scanResult.extractedData.confidence >= 60
                          ? 'bg-green-500/10 border border-green-500/30'
                          : scanResult.extractedData.confidence >= 30
                            ? 'bg-yellow-500/10 border border-yellow-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Confiance OCR</span>
                          <span className={`font-bold ${
                            scanResult.extractedData.confidence >= 60
                              ? 'text-green-400'
                              : scanResult.extractedData.confidence >= 30
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}>
                            {scanResult.extractedData.confidence}%
                          </span>
                        </div>
                        {scanResult.extractedData.hrFieldsFound > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {scanResult.extractedData.hrFieldsFound}/{scanResult.extractedData.hrFieldsTotal} champs RH détectés
                          </div>
                        )}
                      </div>

                      {/* Données Congés */}
                      <div className="bg-white/5 rounded-xl p-3">
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          Congés
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">CP Solde:</span>
                            <span className={`ml-2 ${scanResult.extractedData.cpSolde !== null ? 'text-green-400' : 'text-gray-500'}`}>
                              {scanResult.extractedData.cpSolde !== null ? `${scanResult.extractedData.cpSolde}j` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">CP N-1:</span>
                            <span className={`ml-2 ${scanResult.extractedData.cpN1 !== null ? 'text-green-400' : 'text-gray-500'}`}>
                              {scanResult.extractedData.cpN1 !== null ? `${scanResult.extractedData.cpN1}j` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">RTT:</span>
                            <span className={`ml-2 ${scanResult.extractedData.rtt !== null ? 'text-green-400' : 'text-gray-500'}`}>
                              {scanResult.extractedData.rtt !== null ? `${scanResult.extractedData.rtt}j` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Période:</span>
                            <span className={`ml-2 ${scanResult.extractedData.periode ? 'text-white' : 'text-gray-500'}`}>
                              {scanResult.extractedData.periode || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Données Salariales */}
                      {(scanResult.extractedData.salaireBrut || scanResult.extractedData.salaireNet || scanResult.extractedData.tauxHoraire || scanResult.extractedData.netAPayer) && (
                        <div className="bg-white/5 rounded-xl p-3">
                          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            Données salariales
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {scanResult.extractedData.salaireBrut && (
                              <div>
                                <span className="text-gray-400">Brut mensuel:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.salaireBrut.toFixed(2)} €</span>
                              </div>
                            )}
                            {scanResult.extractedData.salaireNet && (
                              <div>
                                <span className="text-gray-400">Net imposable:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.salaireNet.toFixed(2)} €</span>
                              </div>
                            )}
                            {scanResult.extractedData.netAPayer && (
                              <div>
                                <span className="text-gray-400">Net à payer:</span>
                                <span className="ml-2 text-yellow-400">{scanResult.extractedData.netAPayer.toFixed(2)} €</span>
                              </div>
                            )}
                            {scanResult.extractedData.acomptes && (
                              <div>
                                <span className="text-gray-400">Acomptes:</span>
                                <span className="ml-2 text-orange-400">-{scanResult.extractedData.acomptes.toFixed(2)} €</span>
                              </div>
                            )}
                            {scanResult.extractedData.tauxHoraire && (
                              <div>
                                <span className="text-gray-400">Taux horaire:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.tauxHoraire.toFixed(2)} €/h</span>
                              </div>
                            )}
                            {scanResult.extractedData.heuresTravaillees && (
                              <div>
                                <span className="text-gray-400">Heures:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.heuresTravaillees}h</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Données Contractuelles */}
                      {(scanResult.extractedData.matricule || scanResult.extractedData.typeContrat || scanResult.extractedData.emploi || scanResult.extractedData.dateEntree || scanResult.extractedData.codePCS) && (
                        <div className="bg-white/5 rounded-xl p-3">
                          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-400" />
                            Données contractuelles
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {scanResult.extractedData.matricule && (
                              <div>
                                <span className="text-gray-400">Matricule:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.matricule}</span>
                              </div>
                            )}
                            {scanResult.extractedData.typeContrat && (
                              <div>
                                <span className="text-gray-400">Contrat:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.typeContrat}</span>
                              </div>
                            )}
                            {scanResult.extractedData.emploi && (
                              <div className="col-span-2">
                                <span className="text-gray-400">Emploi:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.emploi}</span>
                              </div>
                            )}
                            {scanResult.extractedData.dateEntree && (
                              <div>
                                <span className="text-gray-400">Date entrée:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.dateEntree}</span>
                              </div>
                            )}
                            {scanResult.extractedData.codePCS && (
                              <div>
                                <span className="text-gray-400">Code PCS:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.codePCS}</span>
                              </div>
                            )}
                            {scanResult.extractedData.coefficient && (
                              <div>
                                <span className="text-gray-400">Coefficient:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.coefficient}</span>
                              </div>
                            )}
                            {scanResult.extractedData.tempsTravail && (
                              <div>
                                <span className="text-gray-400">Temps travail:</span>
                                <span className="ml-2 text-green-400">{scanResult.extractedData.tempsTravail}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Saisie manuelle des congés */}
                      <div className="bg-white/5 rounded-xl p-3">
                        <h4 className="text-white font-medium mb-2">Correction / Saisie manuelle</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-gray-400 text-xs mb-1">CP (jours)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={manualValues.cpSolde}
                              onChange={(e) => setManualValues({ ...manualValues, cpSolde: e.target.value })}
                              placeholder="Ex: 25"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 text-xs mb-1">RTT (jours)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={manualValues.rtt}
                              onChange={(e) => setManualValues({ ...manualValues, rtt: e.target.value })}
                              placeholder="Ex: 10"
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Recommandations */}
                      {scanResult.recommendations?.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                          <p className="text-yellow-300 text-sm font-medium mb-1">Recommandations</p>
                          {scanResult.recommendations.map((rec, idx) => (
                            <p key={idx} className="text-gray-400 text-xs">{rec}</p>
                          ))}
                        </div>
                      )}

                      {/* Boutons d'action */}
                      <div className="flex flex-col gap-2">
                        {/* Bouton mise à jour complète du dossier RH */}
                        {scanResult.extractedData.hrFieldsFound > 0 && (
                          <button
                            onClick={() => handleUpdateHRFile(scanResult.extractedData)}
                            disabled={updatingBalance}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Mettre à jour le dossier RH complet
                          </button>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setScanResult(null);
                              setScanFile(null);
                            }}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                          >
                            Nouveau scan
                          </button>
                          <button
                            onClick={handleUpdateBalance}
                            disabled={(!manualValues.cpSolde && !manualValues.rtt) || updatingBalance}
                            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {updatingBalance ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Maj Congés
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                      <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-300 font-medium">Erreur lors du scan</p>
                      <p className="text-gray-400 text-sm">{scanResult.error}</p>
                      <button
                        onClick={() => {
                          setScanResult(null);
                          setScanFile(null);
                        }}
                        className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bouton fermer */}
              {!scanning && !scanResult && (
                <button
                  onClick={() => setShowScanModal(false)}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annuler
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
// 💰 ONGLET PAIE
// ==========================================
const PayrollTab = ({ employees, timesheets, leaves, companyName, onRefresh }) => {
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [exportSuccess, setExportSuccess] = useState(null);

  // Générer la liste des années disponibles
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push(y);
  }

  // Exporter en Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      setExportSuccess(null);

      const options = {
        employeeId: selectedEmployee === 'all' ? null : selectedEmployee,
        companyName: companyName || 'Entreprise'
      };

      const result = await timesheetExportService.exportMonthlyTimesheet(
        selectedYear,
        selectedMonth,
        options
      );

      if (result.success) {
        setExportSuccess(`Export généré: ${result.fileName}`);
        setTimeout(() => setExportSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Exporter en CSV simple
  const handleExportCSV = async () => {
    try {
      setExporting(true);

      // Préparer les données CSV
      const monthStart = new Date(selectedYear, selectedMonth, 1);
      const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Employé;Date;Heure Début;Heure Fin;Heures Travaillées;Type\n";

      const employeesToExport = selectedEmployee === 'all'
        ? employees
        : employees.filter(e => e.id === selectedEmployee);

      for (const emp of employeesToExport) {
        const empTimesheets = timesheets.filter(t =>
          t.userId === emp.id &&
          new Date(t.date) >= monthStart &&
          new Date(t.date) <= monthEnd
        );

        for (const ts of empTimesheets) {
          const hours = ts.endTime && ts.startTime
            ? ((new Date(`2000-01-01T${ts.endTime}`) - new Date(`2000-01-01T${ts.startTime}`)) / 3600000).toFixed(2)
            : '0';
          csvContent += `${emp.firstName} ${emp.lastName};${ts.date};${ts.startTime || ''};${ts.endTime || ''};${hours};Pointage\n`;
        }

        // Ajouter les congés
        const empLeaves = leaves?.filter(l =>
          l.userId === emp.id &&
          l.status === 'approved' &&
          new Date(l.startDate) <= monthEnd &&
          new Date(l.endDate) >= monthStart
        ) || [];

        for (const leave of empLeaves) {
          csvContent += `${emp.firstName} ${emp.lastName};${leave.startDate};-;-;${leave.days || 1};${leave.type}\n`;
        }
      }

      // Télécharger le fichier
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `export_paie_${MONTHS_FR[selectedMonth]}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess('Export CSV téléchargé !');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Erreur export CSV:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  // Imprimer
  const handlePrint = () => {
    const monthName = MONTHS_FR[selectedMonth];
    const printContent = `
      <html>
        <head>
          <title>Export Paie - ${monthName} ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4a5568; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .total { font-weight: bold; background-color: #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Récapitulatif Paie - ${monthName} ${selectedYear}</h1>
            <p>${companyName || 'Entreprise'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Jours travaillés</th>
                <th>Heures totales</th>
                <th>Congés pris</th>
                <th>RTT pris</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => {
                const empTimesheets = timesheets.filter(t => t.userId === emp.id);
                const totalHours = empTimesheets.reduce((sum, t) => {
                  if (t.startTime && t.endTime) {
                    const diff = (new Date(`2000-01-01T${t.endTime}`) - new Date(`2000-01-01T${t.startTime}`)) / 3600000;
                    return sum + diff;
                  }
                  return sum;
                }, 0);
                const cpLeaves = leaves?.filter(l => l.userId === emp.id && l.type === 'cp' && l.status === 'approved').length || 0;
                const rttLeaves = leaves?.filter(l => l.userId === emp.id && l.type === 'rtt' && l.status === 'approved').length || 0;
                return `
                  <tr>
                    <td>${emp.firstName} ${emp.lastName}</td>
                    <td>${empTimesheets.length}</td>
                    <td>${totalHours.toFixed(1)}h</td>
                    <td>${cpLeaves}j</td>
                    <td>${rttLeaves}j</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <motion.div
      key="payroll"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Exports Paie</h2>
            <p className="text-gray-400">Génération des fichiers de paie</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>

        {/* Sélecteurs de période */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
            >
              {MONTHS_FR.map((month, idx) => (
                <option key={idx} value={idx} className="bg-gray-800">{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
            >
              {years.map(year => (
                <option key={year} value={year} className="bg-gray-800">{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Employé</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 outline-none"
            >
              <option value="all" className="bg-gray-800">Tous les employés</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id} className="bg-gray-800">
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message de succès */}
        {exportSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{exportSuccess}</span>
          </div>
        )}

        {/* Bouton principal d'export Excel */}
        <div className="text-center py-8 bg-white/5 rounded-xl">
          <FileSpreadsheet className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">Export Excel complet</p>
          <p className="text-gray-400 text-sm mb-6">
            Génère un fichier Excel avec feuille par employé + récapitulatif
          </p>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Générer export Excel ({MONTHS_FR[selectedMonth]} {selectedYear})
              </>
            )}
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{employees.length}</p>
            <p className="text-gray-400 text-sm">Employés</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{timesheets.length}</p>
            <p className="text-gray-400 text-sm">Pointages</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{leaves?.filter(l => l.status === 'approved').length || 0}</p>
            <p className="text-gray-400 text-sm">Congés validés</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <FileText className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{MONTHS_FR[selectedMonth]}</p>
            <p className="text-gray-400 text-sm">{selectedYear}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ==========================================
// ⚙️ ONGLET PARAMÈTRES RH COMPLET
// ==========================================
const SettingsTab = () => {
  const [activeSection, setActiveSection] = useState('rules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // États pour les paramètres
  const [rules, setRules] = useState({
    conventionCollective: "IDCC 1790 - Espaces de loisirs, d'attractions et culturels",
    workHoursBeforeBreak: 6,
    breakDuration: 20,
    payBreaks: false,
    chargesRate: 43,
    mealCompensation: false,
    mealRules: ''
  });

  const [alerts, setAlerts] = useState([
    { id: 'consecutive_days', label: 'Nombre de jours consécutifs', description: 'Vos salariés ne doivent pas travailler plus de 6 jours d\'affilée', value: 6, active: true, blocking: true },
    { id: 'daily_rest', label: 'Repos journalier', description: 'Le repos journalier est fixé à 11.0 heures consécutives', value: 11, active: true, blocking: true },
    { id: 'shift_span', label: 'Délai entre début et fin de shift', description: 'Maximum 13.0 heures entre le début et la fin de journée', value: 13, active: true, blocking: true },
    { id: 'weekly_rest', label: 'Repos hebdomadaire', description: 'Tout salarié doit bénéficier d\'un repos de 35 heures par semaine', value: 35, active: true, blocking: true },
    { id: 'contract_hours', label: 'Temps de travail contractuel', description: 'Les employés doivent respecter leur temps de travail contractuel', active: true, blocking: true },
    { id: 'daily_hours', label: 'Volume horaire journée', description: 'Un employé ne peut travailler plus de 10.0 heures par jour', value: 10, active: true, blocking: true },
    { id: 'weekly_hours', label: 'Temps de travail maximum par semaine', description: 'Maximum 48 heures par semaine et 44 heures en moyenne sur 10 semaines', value: 48, active: true, blocking: true },
    { id: 'break', label: 'Pause', description: 'Un salarié travaillant 6h ou plus doit bénéficier d\'une pause de 20min minimum', value: 20, active: true, blocking: false },
    { id: 'cut', label: 'Coupure', description: 'La durée entre 2 shifts (coupure) est au maximum de 2 heures', value: 2, active: true, blocking: false },
    { id: 'night_work', label: 'Travail de nuit', description: 'Toute heure entre 22h et 7h donne lieu à majoration de 1€ si 6h effectuées', active: true, blocking: false },
    { id: 'holidays', label: 'Jours fériés', description: 'Le chômage des jours fériés ne peut entraîner de perte de salaire (3 mois d\'ancienneté)', active: true, blocking: false },
    { id: 'conflict', label: 'Conflit d\'horaires', description: 'Les horaires ajoutés ne doivent pas rentrer en conflit avec d\'autres shifts', active: true, blocking: true },
    { id: 'extra_hours', label: 'Limite heures complémentaires', description: 'Maximum 1/3 de la durée de travail prévue au contrat', active: true, blocking: true },
    { id: 'planning_change', label: 'Modification du planning en retard', description: 'Le planning peut être modifié au plus tard 7 jours avant la semaine (3 jours si activité intense)', active: true, blocking: false }
  ]);

  const [positions, setPositions] = useState([
    { id: 'game_master', name: 'Game master', color: '#8B5CF6', breakTime: 20 },
    { id: 'repos', name: 'Repos hebdomadaire', color: '#6B7280', breakTime: 0 },
    { id: 'ecole', name: 'École - CFA', color: '#3B82F6', breakTime: 0 },
    { id: 'journee', name: 'Journée', color: '#10B981', breakTime: 30 },
    { id: 'conges', name: 'Congés', color: '#F59E0B', breakTime: 0 },
    { id: 'maladie', name: 'Maladie', color: '#EF4444', breakTime: 0 }
  ]);

  const [absences, setAbsences] = useState([
    { id: 'paid_leave', name: 'Congés payés', includeInCounter: false, allowsAccrual: false, employeeRequest: true, active: true },
    { id: 'unpaid_leave', name: 'Congés sans solde', includeInCounter: false, allowsAccrual: false, employeeRequest: true, active: true },
    { id: 'sickness', name: 'Maladie', includeInCounter: false, allowsAccrual: false, employeeRequest: true, active: true },
    { id: 'work_accident', name: 'Accident du travail', includeInCounter: false, allowsAccrual: false, employeeRequest: false, active: true },
    { id: 'maternity', name: 'Congé maternité', includeInCounter: false, allowsAccrual: true, employeeRequest: false, active: true },
    { id: 'paternity', name: 'Congé paternité', includeInCounter: false, allowsAccrual: true, employeeRequest: false, active: true },
    { id: 'training', name: 'Formation', includeInCounter: true, allowsAccrual: true, employeeRequest: false, active: true },
    { id: 'rtt', name: 'RTT', includeInCounter: false, allowsAccrual: false, employeeRequest: true, active: true },
    { id: 'compensatory', name: 'Repos compensateur', includeInCounter: false, allowsAccrual: false, employeeRequest: true, active: true }
  ]);

  const [establishment, setEstablishment] = useState({
    name: 'BRAIN L\'ESCAPE GAME CAEN',
    legalName: 'SARL BOEHME',
    address: '',
    postalCode: '',
    city: 'CAEN',
    country: 'France Métropolitaine',
    timezone: '(UTC+01:00) Bruxelles, Copenhague, Madrid, Paris',
    siret: '',
    tva: '',
    payrollCode: '',
    nafCode: '',
    urssafCode: '',
    healthService: ''
  });

  const [badgeSettings, setBadgeSettings] = useState({
    pinCode: '0000',
    lateArrival: 'planned',
    earlyArrival: 'planned',
    lateDeparture: 'badged',
    earlyDeparture: 'badged',
    shortBreak: 'planned',
    remoteLocation: 'badged_location',
    frequency: 'per_shift',
    alertDelay: 15,
    alertRecipients: [],
    badgeBreaks: false,
    requireSignature: false,
    takePhoto: false,
    differentTablets: false,
    mobileApp: true,
    mobileBreaks: false,
    authorizedEmployees: []
  });

  // Chargement des paramètres
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const settingsRef = doc(db, 'hr_settings', 'main');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.rules) setRules(data.rules);
        if (data.alerts) setAlerts(data.alerts);
        if (data.positions) setPositions(data.positions);
        if (data.absences) setAbsences(data.absences);
        if (data.establishment) setEstablishment(data.establishment);
        if (data.badgeSettings) setBadgeSettings(data.badgeSettings);
        
        console.log('✅ Paramètres RH chargés');
      } else {
        console.log('📝 Paramètres RH par défaut utilisés');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement paramètres RH:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsRef = doc(db, 'hr_settings', 'main');
      await setDoc(settingsRef, {
        rules,
        alerts,
        positions,
        absences,
        establishment,
        badgeSettings,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Paramètres RH sauvegardés');
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      console.error('❌ Erreur sauvegarde paramètres:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'rules', label: 'Règles et compteurs', icon: FileText },
    { id: 'alerts', label: 'Alertes', icon: AlertCircleIcon },
    { id: 'positions', label: 'Postes', icon: Briefcase },
    { id: 'absences', label: 'Absences', icon: Calendar },
    { id: 'establishment', label: 'Établissement', icon: Building },
    { id: 'badge', label: 'Paramètres Badgeuse', icon: Clock }
  ];

  if (loading) {
    return (
      <motion.div
        key="settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <GlassCard>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement des paramètres...</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Paramètres RH</h2>
            <p className="text-gray-400">Configuration complète du système RH et planning</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </button>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
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

        {/* CONTENU DES SECTIONS */}
        <AnimatePresence mode="wait">
          {/* RÈGLES ET COMPTEURS */}
          {activeSection === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Configurez votre espace selon votre convention collective</p>
                    <p className="text-gray-400">Ces règles s'appliquent au planning et aux alertes de conformité</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* CONVENTION COLLECTIVE */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">Convention collective</label>
                  <select
                    value={rules.conventionCollective}
                    onChange={(e) => setRules({ ...rules, conventionCollective: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IDCC 1790 - Espaces de loisirs, d'attractions et culturels">IDCC 1790 - Espaces de loisirs, d'attractions et culturels</option>
                    <option value="Convention collective nationale">Convention collective nationale</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                {/* DURÉE DE TRAVAIL AVANT PAUSE */}
                <div>
                  <label className="block text-white font-semibold mb-2">Durée de travail avant déclenchement d'une pause</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={rules.workHoursBeforeBreak}
                      onChange={(e) => setRules({ ...rules, workHoursBeforeBreak: parseInt(e.target.value) })}
                      className="w-32 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <span className="text-gray-400">heures travaillées</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Temps de pause obligatoire : {rules.breakDuration} minutes
                  </p>
                </div>

                {/* RÉMUNÉRATION DES PAUSES */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.payBreaks}
                      onChange={(e) => setRules({ ...rules, payBreaks: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-white font-semibold">Activer la rémunération des pauses</span>
                      <p className="text-sm text-gray-400">Les pauses seront comptabilisées dans le temps de travail</p>
                    </div>
                  </label>
                </div>

                {/* TAUX DE CHARGES */}
                <div>
                  <label className="block text-white font-semibold mb-2">Taux de charges patronales</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={rules.chargesRate}
                      onChange={(e) => setRules({ ...rules, chargesRate: parseInt(e.target.value) })}
                      className="w-32 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Utilisé pour le calcul du taux horaire chargé
                  </p>
                </div>

                {/* INDEMNITÉS REPAS */}
                <div className="border-t border-gray-700 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={rules.mealCompensation}
                      onChange={(e) => setRules({ ...rules, mealCompensation: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-white font-semibold">Indemniser les repas de mes employés</span>
                      <p className="text-sm text-gray-400">Les indemnités sont calculées à partir des plannings</p>
                    </div>
                  </label>

                  {rules.mealCompensation && (
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Règles d'indemnisation</label>
                      <textarea
                        value={rules.mealRules}
                        onChange={(e) => setRules({ ...rules, mealRules: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                        placeholder="Définissez les règles pour attribuer les indemnités repas..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ALERTES */}
          {activeSection === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Définissez les alertes basées sur votre convention collective</p>
                    <p className="text-gray-400">Ces alertes s'affichent sur le planning pour vous guider lors de la planification</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={alert.active}
                            onChange={(e) => {
                              const updatedAlerts = alerts.map(a => 
                                a.id === alert.id ? { ...a, active: e.target.checked } : a
                              );
                              setAlerts(updatedAlerts);
                            }}
                            className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{alert.label}</span>
                            {alert.blocking && (
                              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">Bloquante</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 ml-8">{alert.description}</p>
                        {alert.value && (
                          <div className="flex items-center gap-2 mt-2 ml-8">
                            <input
                              type="number"
                              value={alert.value}
                              onChange={(e) => {
                                const updatedAlerts = alerts.map(a => 
                                  a.id === alert.id ? { ...a, value: parseInt(e.target.value) } : a
                                );
                                setAlerts(updatedAlerts);
                              }}
                              className="w-20 px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              disabled={!alert.active}
                            />
                            <span className="text-sm text-gray-400">
                              {alert.id.includes('hours') ? 'heures' : alert.id === 'consecutive_days' ? 'jours' : alert.id === 'break' ? 'minutes' : 'heures'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* POSTES */}
          {activeSection === 'positions' && (
            <motion.div
              key="positions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Définissez les postes utilisés dans votre planning</p>
                    <p className="text-gray-400">Chaque poste peut avoir sa propre couleur et temps de pause</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={position.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Nom du poste</label>
                        <input
                          type="text"
                          value={position.name}
                          onChange={(e) => {
                            const updatedPositions = [...positions];
                            updatedPositions[index].name = e.target.value;
                            setPositions(updatedPositions);
                          }}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Couleur</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={position.color}
                            onChange={(e) => {
                              const updatedPositions = [...positions];
                              updatedPositions[index].color = e.target.value;
                              setPositions(updatedPositions);
                            }}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={position.color}
                            onChange={(e) => {
                              const updatedPositions = [...positions];
                              updatedPositions[index].color = e.target.value;
                              setPositions(updatedPositions);
                            }}
                            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Temps de pause (min)</label>
                        <input
                          type="number"
                          value={position.breakTime}
                          onChange={(e) => {
                            const updatedPositions = [...positions];
                            updatedPositions[index].breakTime = parseInt(e.target.value) || 0;
                            setPositions(updatedPositions);
                          }}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setPositions([...positions, {
                    id: `position_${Date.now()}`,
                    name: 'Nouveau poste',
                    color: '#3B82F6',
                    breakTime: 0
                  }]);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter un poste
              </button>
            </motion.div>
          )}

          {/* ABSENCES */}
          {activeSection === 'absences' && (
            <motion.div
              key="absences"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Configurez les types d'absences</p>
                    <p className="text-gray-400">Définissez quelles absences sont incluses dans les compteurs et peuvent être demandées</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {absences.map((absence) => (
                  <div key={absence.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={absence.active}
                            onChange={(e) => {
                              const updatedAbsences = absences.map(a => 
                                a.id === absence.id ? { ...a, active: e.target.checked } : a
                              );
                              setAbsences(updatedAbsences);
                            }}
                            className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-white font-semibold">{absence.name}</span>
                        </div>
                        
                        <div className="ml-8 space-y-2">
                          <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input
                              type="checkbox"
                              checked={absence.includeInCounter}
                              onChange={(e) => {
                                const updatedAbsences = absences.map(a => 
                                  a.id === absence.id ? { ...a, includeInCounter: e.target.checked } : a
                                );
                                setAbsences(updatedAbsences);
                              }}
                              className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                              disabled={!absence.active}
                            />
                            Inclus dans le compteur d'heures
                          </label>
                          
                          <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input
                              type="checkbox"
                              checked={absence.allowsAccrual}
                              onChange={(e) => {
                                const updatedAbsences = absences.map(a => 
                                  a.id === absence.id ? { ...a, allowsAccrual: e.target.checked } : a
                                );
                                setAbsences(updatedAbsences);
                              }}
                              className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                              disabled={!absence.active}
                            />
                            Permet l'acquisition de congés
                          </label>
                          
                          <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input
                              type="checkbox"
                              checked={absence.employeeRequest}
                              onChange={(e) => {
                                const updatedAbsences = absences.map(a => 
                                  a.id === absence.id ? { ...a, employeeRequest: e.target.checked } : a
                                );
                                setAbsences(updatedAbsences);
                              }}
                              className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                              disabled={!absence.active}
                            />
                            Peut être demandée par l'employé
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ÉTABLISSEMENT */}
          {activeSection === 'establishment' && (
            <motion.div
              key="establishment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Informations légales de l'établissement</p>
                    <p className="text-gray-400">Ces données sont utilisées pour la génération des documents officiels</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Nom de l'établissement *</label>
                    <input
                      type="text"
                      value={establishment.name}
                      onChange={(e) => setEstablishment({ ...establishment, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Dénomination sociale *</label>
                    <input
                      type="text"
                      value={establishment.legalName}
                      onChange={(e) => setEstablishment({ ...establishment, legalName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Adresse</label>
                  <input
                    type="text"
                    value={establishment.address}
                    onChange={(e) => setEstablishment({ ...establishment, address: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Numéro et nom de rue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Code postal</label>
                    <input
                      type="text"
                      value={establishment.postalCode}
                      onChange={(e) => setEstablishment({ ...establishment, postalCode: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Ville</label>
                    <input
                      type="text"
                      value={establishment.city}
                      onChange={(e) => setEstablishment({ ...establishment, city: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Numéro de SIRET</label>
                    <input
                      type="text"
                      value={establishment.siret}
                      onChange={(e) => setEstablishment({ ...establishment, siret: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="14 chiffres"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Numéro de TVA</label>
                    <input
                      type="text"
                      value={establishment.tva}
                      onChange={(e) => setEstablishment({ ...establishment, tva: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="FR..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Code NAF/APE</label>
                    <input
                      type="text"
                      value={establishment.nafCode}
                      onChange={(e) => setEstablishment({ ...establishment, nafCode: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-medium">Code URSSAF</label>
                    <input
                      type="text"
                      value={establishment.urssafCode}
                      onChange={(e) => setEstablishment({ ...establishment, urssafCode: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Service de Santé au Travail</label>
                  <input
                    type="text"
                    value={establishment.healthService}
                    onChange={(e) => setEstablishment({ ...establishment, healthService: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du service de santé"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* PARAMÈTRES BADGEUSE */}
          {activeSection === 'badge' && (
            <motion.div
              key="badge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Configuration de la badgeuse</p>
                    <p className="text-gray-400">Paramétrez les règles de mise au réel et les alertes de retard</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* CODE PIN */}
                <div>
                  <label className="block text-white font-semibold mb-2">Code PIN de la badgeuse</label>
                  <input
                    type="text"
                    value={badgeSettings.pinCode}
                    onChange={(e) => setBadgeSettings({ ...badgeSettings, pinCode: e.target.value })}
                    className="w-40 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0000"
                    maxLength="4"
                  />
                </div>

                {/* RÈGLES DE MISE AU RÉEL */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg">Règles de mise au réel</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son arrivée en retard</label>
                      <select
                        value={badgeSettings.lateArrival}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, lateArrival: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="planned">Pré-remplir avec l'heure planifiée</option>
                        <option value="badged">Pré-remplir avec l'heure badgée</option>
                      </select>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son arrivée en avance</label>
                      <select
                        value={badgeSettings.earlyArrival}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, earlyArrival: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="planned">Pré-remplir avec l'heure planifiée</option>
                        <option value="badged">Pré-remplir avec l'heure badgée</option>
                      </select>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son départ en retard</label>
                      <select
                        value={badgeSettings.lateDeparture}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, lateDeparture: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="planned">Pré-remplir avec l'heure planifiée</option>
                        <option value="badged">Pré-remplir avec l'heure badgée</option>
                      </select>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge son départ en avance</label>
                      <select
                        value={badgeSettings.earlyDeparture}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, earlyDeparture: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="planned">Pré-remplir avec l'heure planifiée</option>
                        <option value="badged">Pré-remplir avec l'heure badgée</option>
                      </select>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <label className="block text-gray-300 mb-2 text-sm">Si l'employé badge moins de pause que prévu</label>
                      <select
                        value={badgeSettings.shortBreak}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, shortBreak: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="planned">Enregistrer le temps de pause prévu</option>
                        <option value="badged">Enregistrer le temps de pause badgé</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* FRÉQUENCE DES BADGES */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg">Fréquence des badges</h3>
                  <select
                    value={badgeSettings.frequency}
                    onChange={(e) => setBadgeSettings({ ...badgeSettings, frequency: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="per_shift">Au début et à la fin de chaque shift</option>
                    <option value="per_day">Au début et à la fin de la journée</option>
                  </select>
                </div>

                {/* ALERTES RETARDS */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg">Alertes des retards</h3>
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <label className="block text-gray-300 mb-3">Notifier les planificateurs par SMS après</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={badgeSettings.alertDelay}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, alertDelay: parseInt(e.target.value) })}
                        className="w-32 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                      <span className="text-gray-400">minutes de retard</span>
                    </div>
                  </div>
                </div>

                {/* PAUSES ET CONTRÔLES */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg">Pauses et contrôles</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={badgeSettings.badgeBreaks}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, badgeBreaks: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-white">Badger les pauses</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={badgeSettings.requireSignature}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, requireSignature: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-white">Faire signer mes employés lors du badge</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={badgeSettings.takePhoto}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, takePhoto: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-white">Prendre une photo lors du badge</span>
                        <p className="text-xs text-orange-400 mt-1">⚠️ La CNIL considère cela comme une collecte excessive de données</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={badgeSettings.differentTablets}
                        onChange={(e) => setBadgeSettings({ ...badgeSettings, differentTablets: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-white">Badger le début et la fin d'un shift depuis différentes tablettes</span>
                    </label>
                  </div>
                </div>

                {/* BADGEUSE MOBILE */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-lg">Badgeuse sur application mobile</h3>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={badgeSettings.mobileApp}
                      onChange={(e) => setBadgeSettings({ ...badgeSettings, mobileApp: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-white">J'active la badgeuse sur l'application mobile</span>
                  </label>

                  {badgeSettings.mobileApp && (
                    <div className="space-y-3 ml-8">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={badgeSettings.mobileBreaks}
                          onChange={(e) => setBadgeSettings({ ...badgeSettings, mobileBreaks: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-white">Badger les pauses</span>
                      </label>

                      <div className="bg-gray-700/30 rounded-lg p-3">
                        <p className="text-sm text-gray-400 mb-2">
                          📍 Collecte des données de géolocalisation : automatiquement effacées après 3 mois
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOUTON SAUVEGARDE FIXE */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Les paramètres modifiés seront appliqués immédiatement au planning et aux alertes
            </p>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 font-semibold"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Sauvegarde en cours...' : 'Sauvegarder tous les paramètres'}
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ==========================================
// 📝 MODAL NOUVEAU SALARIÉ
// ==========================================
const NewEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    startDate: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'users'), {
        displayName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.position,
          department: formData.department
        },
        isActive: formData.status === 'active',
        gamification: {
          level: 1,
          totalXp: 0,
          tasksCompleted: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Erreur création salarié:', error);
      alert('Erreur lors de la création du salarié');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Nouveau Salarié</h2>
            <p className="text-gray-400">Ajouter un nouveau membre au personnel</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Prénom *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Nom *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dupont"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jean.dupont@exemple.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Poste *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Game Master"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Département *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Operations"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Date d'entrée</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="onLeave">En congé</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le salarié'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ==========================================
// 📅 MODAL NOUVEAU PLANNING
// ==========================================
const NewScheduleModal = ({ employees, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    employeeId: '',
    startTime: '',
    endTime: '',
    position: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'hr_schedules'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Erreur création planning:', error);
      alert('Erreur lors de la création du planning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full"
      >
        <div className="bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Nouveau Planning</h2>
            <p className="text-gray-400">Ajouter un shift au planning</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Salarié *</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un salarié</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.position}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Heure de début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Heure de fin *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Poste</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Game Master"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le planning'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HRPage;
