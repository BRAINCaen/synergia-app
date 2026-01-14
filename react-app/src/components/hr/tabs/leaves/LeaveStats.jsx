import React from 'react';
import { Clock, CheckCircle, Calendar, FileText } from 'lucide-react';
import StatCard from '../../StatCard.jsx';

const LeaveStats = ({ leaveRequests }) => {
  const stats = {
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    thisMonth: leaveRequests.filter(r => {
      const date = r.startDate?.toDate?.() || new Date(r.startDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatCard title="En attente" value={stats.pending} icon={Clock} color="yellow" />
      <StatCard title="Approuvés" value={stats.approved} icon={CheckCircle} color="green" />
      <StatCard title="Ce mois" value={stats.thisMonth} icon={Calendar} color="blue" />
      <StatCard title="Total demandes" value={leaveRequests.length} icon={FileText} color="purple" />
    </div>
  );
};

export default LeaveStats;
