// ==========================================
// 📁 react-app/src/pages/HRPage.jsx
// PAGE RH COMPLÈTE - MODULE GESTION DU PERSONNEL - VERSION CORRIGÉE
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
          createdAt: userData.createdAt
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
      pendingLeaves: 0, // À calculer depuis les absences
      monthlyHours: Math.round(monthlyHours),
      overtime: Math.round(overtime)
    });
  };

  // 🔍 FILTRAGE
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // 🎯 ONGLETS
  const tabs = [
    { id: 'employees', label: 'Salariés', icon: Users, count: employees.length },
    { id: 'planning', label: 'Planning', icon: Calendar, count: schedules.length },
    { id: 'timesheet', label: 'Pointage', icon: Clock, count: timesheets.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'payroll', label: 'Paie', icon: DollarSign, count: 0 },
    { id: 'settings', label: 'Paramètres', icon: Settings, count: 0 }
  ];

  // 🎨 RENDER LOADING
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des données RH...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 🎨 RENDER PRINCIPAL
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">

          {/* 📊 HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              🏢 Gestion RH & Planning
            </h1>
            <p className="text-gray-400 text-lg">
              Gestion complète du personnel, plannings et paie
            </p>
          </div>

          {/* 📊 STATISTIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Salariés" 
              value={stats.totalEmployees} 
              icon={Users} 
              color="blue"
              subtitle={`${stats.activeEmployees} actifs`}
            />
            <StatCard 
              title="Feuilles en Attente" 
              value={stats.pendingTimeSheets} 
              icon={Clock} 
              color="orange"
              subtitle="À valider"
            />
            <StatCard 
              title="Heures du Mois" 
              value={stats.monthlyHours} 
              icon={Activity} 
              color="green"
              subtitle="Heures travaillées"
            />
            <StatCard 
              title="Heures Supplémentaires" 
              value={stats.overtime} 
              icon={TrendingUp} 
              color="purple"
              subtitle="Ce mois"
            />
          </div>

          {/* 🎯 ONGLETS */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl mb-6 p-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                    ${activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 📋 CONTENU DES ONGLETS */}
          <AnimatePresence mode="wait">
            {activeTab === 'employees' && (
              <EmployeesTab 
                employees={filteredEmployees}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onRefresh={loadHRData}
                onAddEmployee={() => setShowNewEmployeeModal(true)}
              />
            )}

            {activeTab === 'planning' && (
              <PlanningTab 
                schedules={schedules}
                employees={employees}
                onRefresh={loadHRData}
                onAddSchedule={() => setShowNewScheduleModal(true)}
              />
            )}

            {activeTab === 'timesheet' && (
              <TimesheetTab 
                timesheets={timesheets}
                employees={employees}
                onRefresh={loadHRData}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsTab 
                documents={documents}
                employees={employees}
                onRefresh={loadHRData}
              />
            )}

            {activeTab === 'payroll' && (
              <PayrollTab 
                employees={employees}
                timesheets={timesheets}
                onRefresh={loadHRData}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* MODALS */}
      {showNewEmployeeModal && (
        <NewEmployeeModal 
          onClose={() => setShowNewEmployeeModal(false)}
          onSuccess={loadHRData}
        />
      )}

      {showNewScheduleModal && (
        <NewScheduleModal 
          employees={employees}
          onClose={() => setShowNewScheduleModal(false)}
          onSuccess={loadHRData}
        />
      )}
    </Layout>
  );
};

// ==========================================
// 👥 ONGLET SALARIÉS
// ==========================================
const EmployeesTab = ({ employees, searchTerm, setSearchTerm, onRefresh, onAddEmployee }) => {
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
              <EmployeeCard key={employee.id} employee={employee} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

// 👤 CARTE SALARIÉ
const EmployeeCard = ({ employee, onRefresh }) => {
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
    <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4 hover:bg-gray-700/50 transition-all">
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
            <h3 className="text-white font-semibold">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-gray-400 text-sm">{employee.position || 'Poste non défini'}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-white p-1"
          >
            <Settings className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
              <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Voir détails
              </button>
              <button className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Mail className="w-4 h-4" />
          {employee.email || 'Non renseigné'}
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Phone className="w-4 h-4" />
          {employee.phone || 'Non renseigné'}
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Briefcase className="w-4 h-4" />
          {employee.department || 'Non renseigné'}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-600/50">
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[employee.status] || statusColors.inactive}`}>
          {statusLabels[employee.status] || 'Inconnu'}
        </span>
        <span className="text-gray-400 text-xs">
          Depuis {employee.startDate || 'N/A'}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 📅 ONGLET PLANNING
// ==========================================
const PlanningTab = ({ schedules, employees, onRefresh, onAddSchedule }) => {
  const [view, setView] = useState('week'); // day, week, month
  const [selectedDate, setSelectedDate] = useState(new Date());

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
            <h2 className="text-2xl font-bold text-white mb-1">Planning & Horaires</h2>
            <p className="text-gray-400">Gestion des plannings et shifts</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-700/50 rounded-lg p-1">
              {['Jour', 'Semaine', 'Mois'].map((v, i) => (
                <button
                  key={v}
                  onClick={() => setView(['day', 'week', 'month'][i])}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    view === ['day', 'week', 'month'][i]
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {v}
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
            <p className="text-gray-400 text-lg mb-4">Aucun pointage enregistré</p>
            <p className="text-gray-500 text-sm">
              Les pointages apparaîtront ici après utilisation de la badgeuse
            </p>
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

// ⏰ CARTE POINTAGE
const TimesheetCard = ({ timesheet, employees }) => {
  const employee = employees.find(e => e.id === timesheet.employeeId);
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    validated: 'bg-green-500/20 text-green-400 border-green-500/50',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/50'
  };

  return (
    <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-4 hover:bg-gray-700/50 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {employee?.firstName?.[0]}{employee?.lastName?.[0]}
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {employee?.firstName} {employee?.lastName}
            </h3>
            <p className="text-gray-400 text-sm">
              {new Date(timesheet.date?.seconds * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-semibold">{timesheet.totalHours || 0}h</p>
            <p className="text-gray-400 text-sm">
              {timesheet.startTime} - {timesheet.endTime}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[timesheet.status] || statusColors.pending}`}>
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
              placeholder="+33 6 12 34 56 78"
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
              <label className="block text-gray-300 mb-2 text-sm font-medium">Département</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opérations"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Date d'entrée *</label>
              <input
                type="date"
                required
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
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-gray-300 mb-2 text-sm font-medium">Heure début *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">Heure fin *</label>
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
            <label className="block text-gray-300 mb-2 text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
