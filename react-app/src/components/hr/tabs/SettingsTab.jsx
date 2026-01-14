import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  AlertCircle as AlertCircleIcon,
  Briefcase,
  Calendar,
  Building,
  Clock,
  Save,
  Info,
  AlertTriangle,
  Palette,
  Plus
} from 'lucide-react';
import { db } from '../../../core/firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import GlassCard from '../GlassCard.jsx';

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
                        <p className="text-xs text-orange-400 mt-1">La CNIL considère cela comme une collecte excessive de données</p>
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
                          Collecte des données de géolocalisation : automatiquement effacées après 3 mois
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

export default SettingsTab;
