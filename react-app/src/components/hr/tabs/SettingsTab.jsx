import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  AlertCircle as AlertCircleIcon,
  Briefcase,
  Calendar,
  Building,
  Clock,
  Save
} from 'lucide-react';
import { db } from '../../../core/firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import GlassCard from '../GlassCard.jsx';

// Sous-composants
import {
  RulesSection,
  AlertsSection,
  PositionsSection,
  AbsencesSection,
  EstablishmentSection,
  BadgeSection
} from './settings';

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
          {activeSection === 'rules' && (
            <RulesSection rules={rules} setRules={setRules} />
          )}
          {activeSection === 'alerts' && (
            <AlertsSection alerts={alerts} setAlerts={setAlerts} />
          )}
          {activeSection === 'positions' && (
            <PositionsSection positions={positions} setPositions={setPositions} />
          )}
          {activeSection === 'absences' && (
            <AbsencesSection absences={absences} setAbsences={setAbsences} />
          )}
          {activeSection === 'establishment' && (
            <EstablishmentSection establishment={establishment} setEstablishment={setEstablishment} />
          )}
          {activeSection === 'badge' && (
            <BadgeSection badgeSettings={badgeSettings} setBadgeSettings={setBadgeSettings} />
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

export default SettingsTab;
