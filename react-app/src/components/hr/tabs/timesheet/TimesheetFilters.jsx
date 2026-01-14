import React from 'react';

const TimesheetFilters = ({
  dateFilter,
  setDateFilter,
  selectedUserId,
  setSelectedUserId,
  employees
}) => {
  return (
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
  );
};

export default TimesheetFilters;
