// ==========================================
// 📁 components/hr/EmployeeCard.jsx
// CARTE SALARIÉ POUR LA LISTE
// ==========================================

import React from 'react';
import { Mail, Phone, Briefcase, Eye, Edit } from 'lucide-react';
import UserAvatar from '../common/UserAvatar.jsx';

const EmployeeCard = ({ employee, onViewEmployee, onEditEmployee, onRefresh }) => {
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
          <UserAvatar
            user={{
              ...employee,
              displayName: `${employee.firstName} ${employee.lastName}`
            }}
            size="lg"
            showBorder={true}
          />
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
        <button
          onClick={() => onEditEmployee(employee)}
          className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors"
          title="Modifier la fiche"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default EmployeeCard;
