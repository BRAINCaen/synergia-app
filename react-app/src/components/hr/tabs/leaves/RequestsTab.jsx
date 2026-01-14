import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from '../../GlassCard.jsx';

const LEAVE_TYPES = [
  { id: 'paid', label: 'Congés payés', color: 'green', icon: '🏖️' },
  { id: 'unpaid', label: 'Sans solde', color: 'orange', icon: '📅' },
  { id: 'sick', label: 'Maladie', color: 'red', icon: '🏥' },
  { id: 'rtt', label: 'RTT', color: 'blue', icon: '⏰' },
  { id: 'family', label: 'Événement familial', color: 'purple', icon: '👨‍👩‍👧' },
  { id: 'training', label: 'Formation', color: 'indigo', icon: '📚' }
];

const RequestsTab = ({
  filteredRequests,
  employees,
  filter,
  setFilter,
  loading,
  handleApprove,
  handleReject
}) => {
  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En attente' },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Approuvé' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Refusé' }
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <GlassCard>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Demandes de Congés</h2>
          <p className="text-gray-400 text-sm">Demandes de congés et absences</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvés' : 'Refusés'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Aucune demande de congé</p>
          <p className="text-gray-500 text-sm">Les demandes de congés apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const employee = employees.find(e => e.id === request.employeeId);
            const leaveType = LEAVE_TYPES.find(t => t.id === request.type) || LEAVE_TYPES[0];
            const startDate = request.startDate?.toDate?.() || new Date(request.startDate);
            const endDate = request.endDate?.toDate?.() || new Date(request.endDate);

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                      {leaveType.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {employee?.firstName} {employee?.lastName}
                        </span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {leaveType.label} • {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  )}
                </div>

                {request.reason && (
                  <div className="mt-3 p-3 bg-gray-900/30 rounded-lg">
                    <p className="text-gray-400 text-sm">{request.reason}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

export default RequestsTab;
