import React from 'react';
import { Mail, Phone, Briefcase, Calendar, Award, Target } from 'lucide-react';

const PersonalInfoSection = ({ employee }) => {
  return (
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
  );
};

export default PersonalInfoSection;
