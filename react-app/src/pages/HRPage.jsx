// ==========================================
// 📁 react-app/src/pages/HRPage.jsx
// PAGE RH COMPLÈTE - MODULE GESTION DU PERSONNEL - AVEC MODAL DÉTAIL SALARIÉ
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
  X
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
  onSnapshot
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
  const [activeTab, setActiveTab] = useState('employees'); // employees, planning, timesheet, documents, payroll, settings
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

      // ✅ CORRECTION: Utiliser la collection 'users' existante
      console.log('👥 Chargement des salariés depuis la collection users...');
      const employeesQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const employeesSnapshot = await getDocs(employeesQuery);
      
      // Mapper les données users vers le format RH
      const employeesData = employeesSnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          // Mapping des champs users → RH
          firstName: userData.displayName?.split(' ')[0] || userData.profile?.firstName || 'Prénom',
          lastName: userData.displayName?.split(' ').slice(1).join(' ') || userData.profile?.lastName || 'Nom',
          email: userData.email || '',
          phone: userData.profile?.phone || userData.phone || '',
          position: userData.profile?.role || userData.role || 'Employé',
          department: userData.profile?.department || 'Non assigné',
          startDate: userData.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
          status: userData.isActive !== false ? 'active' : 'inactive',
          photoURL: userData.photoURL || null,
          // Données supplémentaires
          level: userData.gamification?.level || 1,
          totalXP: userData.gamification?.totalXp || 0,
          createdAt: userData.createdAt,
          // Données RH étendues (seront chargées/modifiées via le modal)
          contractData: userData.contractData || {},
          salaryData: userData.salaryData || {}
        };
      });
      
      console.log(`✅ ${employeesData.length} salariés chargés depuis users`);
      setEmployees(employeesData);

      // Charger les plannings
      const schedulesQuery = query(collection(db, 'hr_schedules'), orderBy('date', 'desc'));
      const schedulesSnapshot = await getDocs(schedulesQuery);
      const schedulesData = schedulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedules(schedulesData);

      // Charger les feuilles de temps
      const timesheetsQuery = query(collection(db, 'hr_timesheets'), orderBy('createdAt', 'desc'));
      const timesheetsSnapshot = await getDocs(timesheetsQuery);
      const timesheetsData = timesheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTimesheets(timesheetsData);

      // Calculer les statistiques
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
      pendingLeaves: 0, // À implémenter si gestion des congés
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
        {/* HEADER */}
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

        {/* BARRE DE RECHERCHE */}
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

        {/* LISTE DES SALARIÉS */}
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
  const [showMenu, setShowMenu] = useState(false);

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

  // États pour les données contractuelles
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

  // États pour les données salariales
  const [salaryData, setSalaryData] = useState({
    workingTime: employee.salaryData?.workingTime || 'Standard',
    weeklyHours: employee.salaryData?.weeklyHours || 35,
    amendments: employee.salaryData?.amendments || '',
    monthlyGrossSalary: employee.salaryData?.monthlyGrossSalary || 0,
    hourlyGrossRate: employee.salaryData?.hourlyGrossRate || 0,
    chargedHourlyRate: employee.salaryData?.chargedHourlyRate || 0,
    transportCost: employee.salaryData?.transportCost || 0
  });

  // Calcul automatique du taux horaire
  useEffect(() => {
    if (salaryData.monthlyGrossSalary && salaryData.weeklyHours) {
      const monthlyHours = (salaryData.weeklyHours * 52) / 12;
      const hourlyRate = salaryData.monthlyGrossSalary / monthlyHours;
      setSalaryData(prev => ({
        ...prev,
        hourlyGrossRate: Math.round(hourlyRate * 100) / 100,
        chargedHourlyRate: Math.round(hourlyRate * 1.43 * 100) / 100 // Estimation avec charges (43%)
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
          {/* INFORMATIONS PERSONNELLES */}
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

          {/* DONNÉES CONTRACTUELLES */}
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

          {/* DONNÉES SALARIALES */}
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

        {/* FOOTER */}
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
  const [view, setView] = useState('week'); // week, month, day

  return (
    <motion.div
      key="planning"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        {/* HEADER */}
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

        {/* CALENDRIER */}
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
        {/* HEADER */}
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

        {/* LISTE DES POINTAGES */}
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
        {/* HEADER */}
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

        {/* LISTE DES DOCUMENTS */}
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
        {/* HEADER */}
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

        {/* EXPORTS */}
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
// ⚙️ ONGLET PARAMÈTRES
// ==========================================
const SettingsTab = () => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Paramètres RH</h2>
          <p className="text-gray-400">Configuration des règles et alertes</p>
        </div>

        {/* PARAMÈTRES */}
        <div className="space-y-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Règles de temps de travail</h3>
            <p className="text-gray-400 text-sm mb-3">Temps de pause, amplitude, heures sup</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Configurer
            </button>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Alertes et notifications</h3>
            <p className="text-gray-400 text-sm mb-3">Gestion des alertes automatiques</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Configurer
            </button>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Sécurité et accès</h3>
            <p className="text-gray-400 text-sm mb-3">Droits d'accès et permissions</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Configurer
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
      // ✅ CORRECTION: Créer un nouvel utilisateur dans la collection 'users'
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
        {/* HEADER */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Nouveau Salarié</h2>
            <p className="text-gray-400">Ajouter un nouveau membre au personnel</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* FORMULAIRE */}
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
        {/* HEADER */}
        <div className="bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Nouveau Planning</h2>
            <p className="text-gray-400">Ajouter un shift au planning</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* FORMULAIRE */}
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
