import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Award } from 'lucide-react';

const XPRequestCard = ({ request, onValidate }) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleApprove = () => {
    onValidate(request.id, true, adminNotes);
    setAdminNotes('');
    setShowNotes(false);
  };

  const handleReject = () => {
    onValidate(request.id, false, adminNotes);
    setAdminNotes('');
    setShowNotes(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'approved': return 'text-green-400 bg-green-900/20';
      case 'rejected': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {request.userName?.charAt(0) || '?'}
          </div>
          <div>
            <h4 className="text-white font-medium">{request.userName || 'Utilisateur inconnu'}</h4>
            <p className="text-gray-400 text-sm">{request.taskTitle || 'Tâche inconnue'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
          {request.status === 'pending' ? 'En attente' :
           request.status === 'approved' ? 'Approuvée' :
           'Rejetée'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">XP demandés:</span>
          <span className="text-blue-400 font-semibold flex items-center">
            <Award size={16} className="mr-1" />
            {request.xpAmount || 0} XP
          </span>
        </div>

        {request.description && (
          <div>
            <span className="text-gray-400 text-sm">Description:</span>
            <p className="text-white text-sm mt-1">{request.description}</p>
          </div>
        )}

        <div className="text-gray-400 text-xs flex items-center">
          <Clock size={12} className="mr-1" />
          {request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString('fr-FR') : 'Date inconnue'}
        </div>
      </div>

      {request.status === 'pending' && (
        <div className="mt-4 space-y-3">
          {showNotes && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes administrateur:
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                rows={2}
                placeholder="Commentaires optionnels..."
              />
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={16} />
              <span>Approuver</span>
            </button>
            <button
              onClick={handleReject}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle size={16} />
              <span>Rejeter</span>
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Notes
            </button>
          </div>
        </div>
      )}

      {request.adminNotes && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <span className="text-gray-400 text-sm">Notes admin:</span>
          <p className="text-white text-sm mt-1">{request.adminNotes}</p>
        </div>
      )}
    </div>
  );
};

export default XPRequestCard;
