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
  Settings,
  RefreshCw,
  DollarSign,
  Activity,
  Heart
} from 'lucide-react';

// 🎯 IMPORTS
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import WellbeingDashboard from '../components/wellbeing/WellbeingDashboard.jsx';

// 🔥 FIREBASE
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎨 COMPOSANTS HR EXTRAITS
import {
  StatCard,
  EmployeesTab,
  LeavesTab,
  TimesheetTab,
  DocumentsTab,
  PayrollTab,
  SettingsTab,
  NewEmployeeModal,
  NewScheduleModal,
  EmployeeDetailModal
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

export default HRPage;
