import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare, ExternalLink } from 'lucide-react';

const XPRequestCard = ({ request, onValidate, isAdmin }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fonction pour valider la demande
  const handleValidate = async (approved) => {
    if (!isAdmin) return;
    
    setProcessing(true);
    try {
      await onValidate(request.id, approved, adminNotes);
      setAdminNotes('');
    } catch (error) {
      console.error('Erreur validation:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Couleurs selon le statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'border-yellow-500 bg-yellow-900/20';
      case 'approved': return 'border-green-500 bg-green-900/20';
      case 'rejected': return 'border-red-500 bg-red-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`rounded-xl border p-6 transition-all duration-200 ${getStatusColor(request.status)}`}>
      
      {/* En-tête de la demande */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          
          {/* Avatar utilisateur */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {request.userAvatar ? (
              <img 
                src={request.userAvatar} 
                alt={request.userName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          
          {/* Infos demande */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-semibold">{request.userName}</h4>
              <div className="flex items-center gap-1">
                {getStatusIcon(request.status)}
                <span className="text-sm text-gray-400">{getStatusText(request.status)}</span>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-2">{request.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(request.createdAt)}
              </div>
              {request.taskId && (
                <div className="flex items-center gap-1">
                  <span>📋 Tâche ID: {request.taskId.slice(-6)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Points XP demandés */}
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">+{request.xpAmount}</div>
          <div className="text-xs text-gray-400">XP demandés</div>
        </div>
      </div>

      {/* Preuve/Evidence si disponible */}
      {request.evidenceUrl && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <ExternalLink className="w-4 h-4" />
            Preuve fournie :
          </div>
          <a 
            href={request.evidenceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm break-all"
          >
            {request.evidenceUrl}
          </a>
        </div>
      )}

      {/* Notes admin si approuvée/rejetée */}
      {(request.status === 'approved' || request.status === 'rejected') && request.adminNotes && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <MessageSquare className="w-4 h-4" />
            Notes de l'administrateur :
          </div>
          <p className="text-gray-300 text-sm">{request.adminNotes}</p>
          <div className="text-xs text-gray-400 mt-2">
            {request.status === 'approved' 
              ? `Approuvé le ${formatDate(request.approvedAt)}`
              : `Rejeté le ${formatDate(request.rejectedAt)}`
            }
          </div>
        </div>
      )}

      {/* Actions admin (si en attente et utilisateur est admin) */}
      {request.status === 'pending' && isAdmin && (
        <div className="border-t border-gray-700 pt-4">
          
          {/* Bouton pour afficher/masquer les détails */}
          <div className="mb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              {showDetails ? 'Masquer' : 'Ajouter'} des notes admin
            </button>
          </div>

          {/* Zone notes admin */}
          {showDetails && (
            <div className="mb-4">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Notes pour l'utilisateur (optionnel)..."
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:border-blue-500 focus:outline-none"
                rows="3"
              />
            </div>
          )}

          {/* Boutons validation */}
          <div className="flex gap-3">
            <button
              onClick={() => handleValidate(true)}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {processing ? 'Validation...' : 'Approuver'}
            </button>
            
            <button
              onClick={() => handleValidate(false)}
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              {processing ? 'Rejet...' : 'Rejeter'}
            </button>
          </div>
        </div>
      )}

      {/* Informations de validation (si déjà traitée) */}
      {request.status !== 'pending' && (
        <div className="border-t border-gray-700 pt-4">
          <div className="text-xs text-gray-400">
            {request.status === 'approved' && (
              <>✅ Approuvé par {request.approvedBy} le {formatDate(request.approvedAt)}</>
            )}
            {request.status === 'rejected' && (
              <>❌ Rejeté par {request.rejectedBy} le {formatDate(request.rejectedAt)}</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default XPRequestCard;
