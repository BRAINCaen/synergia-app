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
  AlertCircle as AlertCircleIcon
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

// 🎨 COMPOSANT CARTE GLASSMORPHISM
const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// 🎨 STAT CARD
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
    indigo: 'from-indigo-500 to-purple-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-6 text-white`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6" />
        <h3 className="text-sm font-medium opacity-90">{title}</h3>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && <div className="text-sm opacity-80">{subtitle}</div>}
    </div>
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
        return {
          id: doc.id,
          firstName: userData.displayName?.split(' ')[0] || userData.profile?.firstName || 'Prénom',
          lastName: userData.displayName?.split(' ').slice(1).join(' ') || userData.profile?.lastName || 'Nom',
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
    { id: 'planning', label: 'Planning', icon: Calendar },
    { id: 'timesheet', label: 'Pointage', icon: Clock },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payroll', label: 'Paie', icon: DollarSign },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des données RH...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Gestion RH
                </h1>
                <p className="text-gray-400">Gestion du personnel et ressources humaines</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualiser
                </button>
              </div>
            </div>

            {/* STATISTIQUES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            {activeTab === 'planning' && (
              <PlanningTab 
                schedules={schedules}
                employees={employees}
                onAddSchedule={handleAddSchedule}
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
              />
            )}
            {activeTab === 'payroll' && (
              <PayrollTab 
                employees={employees}
                timesheets={timesheets}
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
// 📅 ONGLET PLANNING
// ==========================================
const PlanningTab = ({ schedules, employees, onAddSchedule, onRefresh }) => {
  const [view, setView] = useState('week');

  return (
    <motion.div
      key="planning"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Planning</h2>
            <p className="text-gray-400">Gestion des plannings et horaires</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-700/50 rounded-lg p-1">
              {['day', 'week', 'month'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded transition-colors text-sm ${
                    view === v
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>
            <button
              onClick={onAddSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau Planning
            </button>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">Planning interactif en développement</p>
            <p className="text-gray-500 text-sm mb-6">
              Fonctionnalités à venir : Drag & drop, copier-coller, génération automatique
            </p>
            <button
              onClick={onAddSchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer un planning manuel
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ==========================================
// ⏰ ONGLET POINTAGE
// ==========================================
const TimesheetTab = ({ timesheets, employees, onRefresh }) => {
  return (
    <motion.div
      key="timesheet"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Pointage & Badgeuse</h2>
            <p className="text-gray-400">Suivi des heures et validation</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onRefresh}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Valider Sélection
            </button>
          </div>
        </div>

        {timesheets.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucun pointage enregistré</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timesheets.map(timesheet => (
              <TimesheetCard key={timesheet.id} timesheet={timesheet} employees={employees} />
            ))}
          </div>
        )}
      </GlassCard>
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
const DocumentsTab = ({ documents, employees, onRefresh }) => {
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
            <p className="text-gray-400">Contrats, avenants et signatures</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importer
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau Document
            </button>
          </div>
        </div>

        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">Gestion documentaire en développement</p>
          <p className="text-gray-500 text-sm">
            Fonctionnalités : Stockage, signature électronique, archivage sécurisé
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ==========================================
// 💰 ONGLET PAIE
// ==========================================
const PayrollTab = ({ employees, timesheets, onRefresh }) => {
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
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>

        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">Module d'export paie en développement</p>
          <p className="text-gray-500 text-sm mb-6">
            Fonctionnalités : Calculs automatiques, exports personnalisables, intégration logiciels paie
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2">
            <Download className="w-5 h-5" />
            Générer export manuel
          </button>
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
