import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Edit,
  Save,
  X,
  FileText,
  DollarSign,
  User as UserIcon
} from 'lucide-react';
import { db } from '../../../core/firebase.js';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import UserAvatar from '../../common/UserAvatar.jsx';

// Sous-composants
import { PersonalInfoSection, ContractSection, SalarySection } from './employee-detail';

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
            <PersonalInfoSection employee={employee} />
          )}
          {activeSection === 'contract' && (
            <ContractSection
              contractData={contractData}
              setContractData={setContractData}
              isEditing={isEditing}
            />
          )}
          {activeSection === 'salary' && (
            <SalarySection
              salaryData={salaryData}
              setSalaryData={setSalaryData}
              isEditing={isEditing}
            />
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

export default EmployeeDetailModal;
