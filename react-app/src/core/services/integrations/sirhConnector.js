// ==========================================
// CONNECTEUR SIRH / PAIE
// PayFit, Lucca, Silae, ADP
// ==========================================

import { integrationsService } from './integrationsService.js';

class SirhConnector {
  constructor() {
    this.connectorType = 'sirh';
  }

  // ==========================================
  // PAYFIT
  // ==========================================

  async payfit_getEmployees(companyId) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'payfit');
    if (!config?.enabled) throw new Error('PayFit non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const companyPayfitId = config.config?.companyId;

    const response = await fetch(
      `https://api.payfit.com/v1/companies/${companyPayfitId}/employees`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération employés PayFit');
    const data = await response.json();
    return data.employees || [];
  }

  async payfit_getLeaves(companyId, startDate, endDate) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'payfit');
    if (!config?.enabled) throw new Error('PayFit non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const companyPayfitId = config.config?.companyId;

    const params = new URLSearchParams({
      from: startDate,
      to: endDate
    });

    const response = await fetch(
      `https://api.payfit.com/v1/companies/${companyPayfitId}/leaves?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération congés PayFit');
    const data = await response.json();
    return data.leaves || [];
  }

  async payfit_exportTimesheets(companyId, month, year, timesheets) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'payfit');
    if (!config?.enabled) throw new Error('PayFit non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const companyPayfitId = config.config?.companyId;

    const response = await fetch(
      `https://api.payfit.com/v1/companies/${companyPayfitId}/timesheets/import`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          period: `${year}-${String(month + 1).padStart(2, '0')}`,
          entries: timesheets.map(t => ({
            employeeId: t.employeeExternalId,
            date: t.date,
            hoursWorked: t.totalHours,
            overtimeHours: t.overtimeHours || 0
          }))
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur export PayFit: ${error}`);
    }

    return await response.json();
  }

  // ==========================================
  // LUCCA (TIMMI, FIGGO, POPLEE)
  // ==========================================

  async lucca_getUsers(companyId) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'lucca');
    if (!config?.enabled) throw new Error('Lucca non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const domain = config.config?.domain;

    const response = await fetch(
      `https://${domain}/api/v3/users`,
      {
        headers: {
          'Authorization': `lucca application=${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération utilisateurs Lucca');
    const data = await response.json();
    return data.data?.items || [];
  }

  async lucca_getLeaves(companyId, startDate, endDate) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'lucca');
    if (!config?.enabled) throw new Error('Lucca non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const domain = config.config?.domain;

    const params = new URLSearchParams({
      leavePeriod_since: startDate,
      leavePeriod_until: endDate
    });

    const response = await fetch(
      `https://${domain}/api/v3/leaves?${params}`,
      {
        headers: {
          'Authorization': `lucca application=${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération absences Lucca');
    const data = await response.json();
    return data.data?.items || [];
  }

  async lucca_createLeave(companyId, leave) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'lucca');
    if (!config?.enabled) throw new Error('Lucca non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const domain = config.config?.domain;

    const response = await fetch(
      `https://${domain}/api/v3/leaves`,
      {
        method: 'POST',
        headers: {
          'Authorization': `lucca application=${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ownerId: leave.employeeExternalId,
          leaveAccountId: leave.leaveTypeId,
          startsOn: leave.startDate,
          startsAM: leave.startsAM !== false,
          endsOn: leave.endDate,
          endsAM: leave.endsAM || false
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur création absence Lucca: ${error}`);
    }

    return await response.json();
  }

  async lucca_getTimesheets(companyId, startDate, endDate) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'lucca');
    if (!config?.enabled) throw new Error('Lucca non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const domain = config.config?.domain;

    const params = new URLSearchParams({
      startsAt: startDate,
      endsAt: endDate
    });

    const response = await fetch(
      `https://${domain}/timmi-timesheet/api/timesheets?${params}`,
      {
        headers: {
          'Authorization': `lucca application=${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération temps Lucca');
    const data = await response.json();
    return data.data?.items || [];
  }

  // ==========================================
  // SILAE
  // ==========================================

  async silae_getEmployees(companyId) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'silae');
    if (!config?.enabled) throw new Error('Silae non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const partnerId = config.config?.partnerId;
    const dossierPaie = config.config?.dossierPaie;

    const response = await fetch(
      `https://api.silae.fr/v1/paie/dossiers/${dossierPaie}/salaries`,
      {
        headers: {
          'X-API-Key': apiKey,
          'X-Partner-Id': partnerId,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération salariés Silae');
    const data = await response.json();
    return data.salaries || [];
  }

  async silae_exportPayrollVariables(companyId, month, year, variables) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'silae');
    if (!config?.enabled) throw new Error('Silae non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const partnerId = config.config?.partnerId;
    const dossierPaie = config.config?.dossierPaie;

    const response = await fetch(
      `https://api.silae.fr/v1/paie/dossiers/${dossierPaie}/variables`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'X-Partner-Id': partnerId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          periode: `${year}${String(month + 1).padStart(2, '0')}`,
          variables: variables.map(v => ({
            matricule: v.employeeMatricule,
            code: v.variableCode,
            valeur: v.value
          }))
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur export Silae: ${error}`);
    }

    return await response.json();
  }

  async silae_getAbsences(companyId, startDate, endDate) {
    const config = await integrationsService.getIntegrationConfig(companyId, 'silae');
    if (!config?.enabled) throw new Error('Silae non configuré');

    const apiKey = atob(config.config?.apiKey || '');
    const partnerId = config.config?.partnerId;
    const dossierPaie = config.config?.dossierPaie;

    const params = new URLSearchParams({
      dateDebut: startDate,
      dateFin: endDate
    });

    const response = await fetch(
      `https://api.silae.fr/v1/paie/dossiers/${dossierPaie}/absences?${params}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'X-Partner-Id': partnerId,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération absences Silae');
    const data = await response.json();
    return data.absences || [];
  }

  // ==========================================
  // ADP
  // ==========================================

  async adp_getWorkers(companyId, userId) {
    const tokens = await integrationsService.getTokens(companyId, 'adp', userId);
    if (!tokens) throw new Error('Non connecté à ADP');

    const response = await fetch(
      'https://api.adp.com/hr/v2/workers',
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération workers ADP');
    const data = await response.json();
    return data.workers || [];
  }

  async adp_getTimeCards(companyId, userId, startDate, endDate) {
    const tokens = await integrationsService.getTokens(companyId, 'adp', userId);
    if (!tokens) throw new Error('Non connecté à ADP');

    const params = new URLSearchParams({
      '$filter': `timePeriod/startDate ge '${startDate}' and timePeriod/endDate le '${endDate}'`
    });

    const response = await fetch(
      `https://api.adp.com/time/v2/time-cards?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération time cards ADP');
    const data = await response.json();
    return data.timeCards || [];
  }

  async adp_submitTimeCard(companyId, userId, timeCard) {
    const tokens = await integrationsService.getTokens(companyId, 'adp', userId);
    if (!tokens) throw new Error('Non connecté à ADP');

    const response = await fetch(
      'https://api.adp.com/time/v2/time-cards',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workerID: { idValue: timeCard.workerId },
          timePeriod: {
            startDate: timeCard.startDate,
            endDate: timeCard.endDate
          },
          dailyTotals: timeCard.dailyTotals.map(d => ({
            entryDate: d.date,
            payCodeTotalQuantity: { quantityValue: d.hours }
          }))
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur soumission ADP: ${error}`);
    }

    return await response.json();
  }

  // ==========================================
  // MÉTHODES UTILITAIRES - SYNCHRONISATION
  // ==========================================

  /**
   * Mapper un employé depuis un SIRH vers le format Synergia
   */
  mapEmployeeToSynergia(sirhType, externalEmployee) {
    switch (sirhType) {
      case 'payfit':
        return {
          externalId: externalEmployee.id,
          externalSource: 'payfit',
          firstName: externalEmployee.firstName,
          lastName: externalEmployee.lastName,
          email: externalEmployee.email,
          position: externalEmployee.jobTitle,
          department: externalEmployee.department,
          hireDate: externalEmployee.startDate,
          employmentType: externalEmployee.contractType
        };

      case 'lucca':
        return {
          externalId: externalEmployee.id,
          externalSource: 'lucca',
          firstName: externalEmployee.firstName,
          lastName: externalEmployee.lastName,
          email: externalEmployee.mail,
          position: externalEmployee.jobTitle,
          department: externalEmployee.department?.name,
          hireDate: externalEmployee.dtContractStart
        };

      case 'silae':
        return {
          externalId: externalEmployee.matricule,
          externalSource: 'silae',
          firstName: externalEmployee.prenom,
          lastName: externalEmployee.nom,
          email: externalEmployee.email,
          position: externalEmployee.emploi,
          department: externalEmployee.service
        };

      case 'adp':
        return {
          externalId: externalEmployee.associateOID,
          externalSource: 'adp',
          firstName: externalEmployee.person?.legalName?.givenName,
          lastName: externalEmployee.person?.legalName?.familyName1,
          email: externalEmployee.businessCommunication?.emails?.[0]?.emailUri,
          position: externalEmployee.workerStatus?.statusCode?.shortName,
          hireDate: externalEmployee.workerDates?.originalHireDate
        };

      default:
        return null;
    }
  }

  /**
   * Mapper un congé depuis un SIRH vers le format Synergia
   */
  mapLeaveToSynergia(sirhType, externalLeave) {
    switch (sirhType) {
      case 'payfit':
        return {
          externalId: externalLeave.id,
          externalSource: 'payfit',
          employeeExternalId: externalLeave.employeeId,
          type: this.mapLeaveType(sirhType, externalLeave.type),
          startDate: externalLeave.startDate,
          endDate: externalLeave.endDate,
          status: externalLeave.status === 'approved' ? 'approved' : 'pending'
        };

      case 'lucca':
        return {
          externalId: externalLeave.id,
          externalSource: 'lucca',
          employeeExternalId: externalLeave.ownerId,
          type: this.mapLeaveType(sirhType, externalLeave.leaveAccount?.name),
          startDate: externalLeave.startsOn,
          endDate: externalLeave.endsOn,
          status: externalLeave.isConfirmed ? 'approved' : 'pending'
        };

      case 'silae':
        return {
          externalId: externalLeave.id,
          externalSource: 'silae',
          employeeExternalId: externalLeave.matricule,
          type: this.mapLeaveType(sirhType, externalLeave.codeAbsence),
          startDate: externalLeave.dateDebut,
          endDate: externalLeave.dateFin,
          status: 'approved'
        };

      default:
        return null;
    }
  }

  /**
   * Mapper les types de congés entre SIRH et Synergia
   */
  mapLeaveType(sirhType, externalType) {
    const mappings = {
      payfit: {
        'paid_leave': 'conges_payes',
        'sick': 'maladie',
        'unpaid': 'sans_solde',
        'rtt': 'rtt'
      },
      lucca: {
        'Congés payés': 'conges_payes',
        'RTT': 'rtt',
        'Maladie': 'maladie',
        'Sans solde': 'sans_solde'
      },
      silae: {
        'CP': 'conges_payes',
        'RTT': 'rtt',
        'MAL': 'maladie',
        'CSS': 'sans_solde'
      }
    };

    return mappings[sirhType]?.[externalType] || 'autre';
  }

  /**
   * Synchroniser les employés depuis un SIRH
   */
  async syncEmployeesFromSirh(companyId, sirhType) {
    let employees = [];

    switch (sirhType) {
      case 'payfit':
        employees = await this.payfit_getEmployees(companyId);
        break;
      case 'lucca':
        employees = await this.lucca_getUsers(companyId);
        break;
      case 'silae':
        employees = await this.silae_getEmployees(companyId);
        break;
      default:
        throw new Error('SIRH non supporté');
    }

    return employees.map(emp => this.mapEmployeeToSynergia(sirhType, emp));
  }

  /**
   * Synchroniser les congés depuis un SIRH
   */
  async syncLeavesFromSirh(companyId, sirhType, startDate, endDate) {
    let leaves = [];

    switch (sirhType) {
      case 'payfit':
        leaves = await this.payfit_getLeaves(companyId, startDate, endDate);
        break;
      case 'lucca':
        leaves = await this.lucca_getLeaves(companyId, startDate, endDate);
        break;
      case 'silae':
        leaves = await this.silae_getAbsences(companyId, startDate, endDate);
        break;
      default:
        throw new Error('SIRH non supporté');
    }

    return leaves.map(leave => this.mapLeaveToSynergia(sirhType, leave));
  }
}

export const sirhConnector = new SirhConnector();
export default sirhConnector;
