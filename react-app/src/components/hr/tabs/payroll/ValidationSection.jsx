import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, FileText, Users, CheckCircle, AlertTriangle, RefreshCw,
  ChevronRight, ChevronDown, Send, Bell, Pen, PenTool, AlertOctagon,
  CheckSquare, Square, Loader2
} from 'lucide-react';
import UserAvatar from '../../../common/UserAvatar.jsx';
import GlassCard from '../../GlassCard.jsx';

const ValidationSection = ({
  selectedMonth,
  selectedYear,
  showValidationPanel,
  setShowValidationPanel,
  currentValidation,
  validationStats,
  isAdmin,
  employees,
  currentUserStatus,
  notifying,
  exporting,
  onRequestValidation,
  onSendToPayroll,
  onOpenSignatureModal,
  MONTHS_FR
}) => {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
            <PenTool className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Validation des Pointages</h2>
            <p className="text-gray-400 text-sm">Signature électronique pour {MONTHS_FR[selectedMonth]} {selectedYear}</p>
          </div>
        </div>
        <button
          onClick={() => setShowValidationPanel(!showValidationPanel)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {showValidationPanel ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      <AnimatePresence>
        {showValidationPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Statut de validation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl border ${
                currentValidation?.status === 'draft' ? 'bg-gray-500/20 border-gray-500/30' :
                currentValidation?.status === 'pending_validation' ? 'bg-orange-500/20 border-orange-500/30' :
                currentValidation?.status === 'ready_for_payroll' ? 'bg-green-500/20 border-green-500/30' :
                currentValidation?.status === 'sent_to_payroll' ? 'bg-blue-500/20 border-blue-500/30' :
                'bg-gray-500/20 border-gray-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {currentValidation?.status === 'draft' && <FileText className="w-5 h-5 text-gray-400" />}
                  {currentValidation?.status === 'pending_validation' && <Clock className="w-5 h-5 text-orange-400" />}
                  {currentValidation?.status === 'ready_for_payroll' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {currentValidation?.status === 'sent_to_payroll' && <Send className="w-5 h-5 text-blue-400" />}
                  <span className="text-sm font-medium text-white">Statut</span>
                </div>
                <p className="text-lg font-bold text-white">
                  {currentValidation?.status === 'draft' && 'Brouillon'}
                  {currentValidation?.status === 'pending_validation' && 'En attente'}
                  {currentValidation?.status === 'ready_for_payroll' && 'Prêt'}
                  {currentValidation?.status === 'sent_to_payroll' && 'Envoyé'}
                  {!currentValidation?.status && 'Non initié'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-white">Employés</span>
                </div>
                <p className="text-lg font-bold text-white">{validationStats.total}</p>
              </div>

              <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-white">Signés</span>
                </div>
                <p className="text-lg font-bold text-white">{validationStats.signed}</p>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/20 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Square className="w-5 h-5 text-orange-400" />
                  <span className="text-sm font-medium text-white">En attente</span>
                </div>
                <p className="text-lg font-bold text-white">{validationStats.pending}</p>
              </div>
            </div>

            {/* Actions selon le rôle */}
            {isAdmin ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {currentValidation?.status === 'draft' || !currentValidation?.status ? (
                    <button
                      onClick={onRequestValidation}
                      disabled={notifying}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium"
                    >
                      {notifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          Demander validation aux employés
                        </>
                      )}
                    </button>
                  ) : currentValidation?.status === 'ready_for_payroll' ? (
                    <button
                      onClick={onSendToPayroll}
                      disabled={exporting}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium"
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Envoyer à la paie
                        </>
                      )}
                    </button>
                  ) : currentValidation?.status === 'sent_to_payroll' ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-300 font-medium">Envoyé à la paie le {new Date(currentValidation.sentToPayrollAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ) : null}

                  {currentValidation?.status === 'pending_validation' && (
                    <button
                      onClick={onRequestValidation}
                      disabled={notifying}
                      className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Relancer les non-signés
                    </button>
                  )}
                </div>

                {/* Liste des employés et leur statut de signature */}
                {currentValidation?.employeeSignatures && (
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      Statut des signatures
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {employees.map(emp => {
                        const sig = currentValidation.employeeSignatures[emp.id];
                        return (
                          <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                user={{
                                  ...emp,
                                  displayName: `${emp.firstName} ${emp.lastName}`
                                }}
                                size="sm"
                                showBorder={true}
                              />
                              <span className="text-white">{emp.firstName} {emp.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {sig?.status === 'signed' ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                  <span className="text-green-400 text-sm">Signé le {new Date(sig.signedAt).toLocaleDateString('fr-FR')}</span>
                                </>
                              ) : sig?.status === 'pending' ? (
                                <>
                                  <Clock className="w-5 h-5 text-orange-400" />
                                  <span className="text-orange-400 text-sm">En attente</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-5 h-5 text-gray-500" />
                                  <span className="text-gray-500 text-sm">Non demandé</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Signature personnelle de l'admin */}
                {currentUserStatus && currentValidation?.status === 'pending_validation' && (
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Pen className="w-5 h-5 text-purple-400" />
                      Ma signature personnelle
                    </h3>
                    {currentUserStatus?.status === 'pending' ? (
                      <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertOctagon className="w-8 h-8 text-orange-400" />
                            <div>
                              <p className="text-white font-medium">Vous devez aussi signer vos pointages</p>
                              <p className="text-gray-400 text-sm">Cliquez pour valider vos propres pointages de {MONTHS_FR[selectedMonth]} {selectedYear}</p>
                            </div>
                          </div>
                          <button
                            onClick={onOpenSignatureModal}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-medium"
                          >
                            <Pen className="w-4 h-4" />
                            Signer mes pointages
                          </button>
                        </div>
                      </div>
                    ) : currentUserStatus?.status === 'signed' ? (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-8 h-8 text-green-400" />
                          <div>
                            <p className="text-white font-medium">Vos pointages sont validés</p>
                            <p className="text-gray-400 text-sm">Signé le {new Date(currentUserStatus.signedAt).toLocaleDateString('fr-FR')} à {new Date(currentUserStatus.signedAt).toLocaleTimeString('fr-FR')}</p>
                          </div>
                          {currentUserStatus.signature && (
                            <img src={currentUserStatus.signature} alt="Ma signature" className="h-10 ml-auto rounded border border-white/10" />
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : (
              // Vue Employé
              <div>
                {currentUserStatus?.status === 'pending' ? (
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-6 text-center">
                    <AlertOctagon className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Validation requise</h3>
                    <p className="text-gray-300 mb-4">
                      Vos pointages de {MONTHS_FR[selectedMonth]} {selectedYear} doivent être validés par signature électronique.
                    </p>
                    <button
                      onClick={onOpenSignatureModal}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto font-medium"
                    >
                      <Pen className="w-5 h-5" />
                      Signer mes pointages
                    </button>
                  </div>
                ) : currentUserStatus?.status === 'signed' ? (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Pointages validés</h3>
                    <p className="text-gray-300">
                      Vous avez signé vos pointages le {new Date(currentUserStatus.signedAt).toLocaleDateString('fr-FR')} à {new Date(currentUserStatus.signedAt).toLocaleTimeString('fr-FR')}
                    </p>
                    {currentUserStatus.signature && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm mb-2">Votre signature :</p>
                        <img src={currentUserStatus.signature} alt="Signature" className="max-h-20 mx-auto rounded-lg border border-white/10" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-500/20 border border-gray-500/30 rounded-xl p-6 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">En attente</h3>
                    <p className="text-gray-300">
                      La validation des pointages pour cette période n'a pas encore été demandée.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default ValidationSection;
