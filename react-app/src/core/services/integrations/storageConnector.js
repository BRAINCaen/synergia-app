// ==========================================
// CONNECTEUR STOCKAGE
// Google Drive, OneDrive, Notion
// ==========================================

import { integrationsService } from './integrationsService.js';

class StorageConnector {
  constructor() {
    this.connectorType = 'storage';
  }

  // ==========================================
  // GOOGLE DRIVE
  // ==========================================

  async googleDrive_listFiles(companyId, userId, folderId = null, query = null) {
    const tokens = await integrationsService.getTokens(companyId, 'google_drive', userId);
    if (!tokens) throw new Error('Non connecté à Google Drive');

    let q = folderId ? `'${folderId}' in parents` : '';
    if (query) {
      q = q ? `${q} and name contains '${query}'` : `name contains '${query}'`;
    }
    q = q ? `${q} and trashed = false` : 'trashed = false';

    const params = new URLSearchParams({
      q,
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink)',
      orderBy: 'modifiedTime desc',
      pageSize: '100'
    });

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur listage fichiers');
    const data = await response.json();
    return data.files || [];
  }

  async googleDrive_uploadFile(companyId, userId, file, folderId = null) {
    const tokens = await integrationsService.getTokens(companyId, 'google_drive', userId);
    if (!tokens) throw new Error('Non connecté à Google Drive');

    const config = await integrationsService.getIntegrationConfig(companyId, 'google_drive');
    const targetFolderId = folderId || config?.config?.rootFolderId;

    // Créer les métadonnées
    const metadata = {
      name: file.name,
      mimeType: file.type
    };
    if (targetFolderId) {
      metadata.parents = [targetFolderId];
    }

    // Upload multipart
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        body: form
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur upload: ${error}`);
    }

    return await response.json();
  }

  async googleDrive_createFolder(companyId, userId, folderName, parentFolderId = null) {
    const tokens = await integrationsService.getTokens(companyId, 'google_drive', userId);
    if (!tokens) throw new Error('Non connecté à Google Drive');

    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      }
    );

    if (!response.ok) throw new Error('Erreur création dossier');
    return await response.json();
  }

  async googleDrive_deleteFile(companyId, userId, fileId) {
    const tokens = await integrationsService.getTokens(companyId, 'google_drive', userId);
    if (!tokens) throw new Error('Non connecté à Google Drive');

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error('Erreur suppression fichier');
    }

    return { success: true };
  }

  async googleDrive_getShareLink(companyId, userId, fileId) {
    const tokens = await integrationsService.getTokens(companyId, 'google_drive', userId);
    if (!tokens) throw new Error('Non connecté à Google Drive');

    // Créer une permission de lecture pour "anyone with link"
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
        })
      }
    );

    // Récupérer le lien
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`,
      {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération lien');
    const data = await response.json();
    return data.webViewLink;
  }

  // ==========================================
  // ONEDRIVE / SHAREPOINT
  // ==========================================

  async onedrive_listFiles(companyId, userId, folderId = null, search = null) {
    const tokens = await integrationsService.getTokens(companyId, 'onedrive', userId);
    if (!tokens) throw new Error('Non connecté à OneDrive');

    let url = folderId
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`
      : 'https://graph.microsoft.com/v1.0/me/drive/root/children';

    if (search) {
      url = `https://graph.microsoft.com/v1.0/me/drive/root/search(q='${encodeURIComponent(search)}')`;
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });

    if (!response.ok) throw new Error('Erreur listage fichiers OneDrive');
    const data = await response.json();
    return data.value || [];
  }

  async onedrive_uploadFile(companyId, userId, file, folderId = null) {
    const tokens = await integrationsService.getTokens(companyId, 'onedrive', userId);
    if (!tokens) throw new Error('Non connecté à OneDrive');

    const config = await integrationsService.getIntegrationConfig(companyId, 'onedrive');
    const targetFolderId = folderId || config?.config?.driveId;

    // Pour les fichiers < 4MB, upload simple
    if (file.size < 4 * 1024 * 1024) {
      const url = targetFolderId
        ? `https://graph.microsoft.com/v1.0/me/drive/items/${targetFolderId}:/${encodeURIComponent(file.name)}:/content`
        : `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(file.name)}:/content`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': file.type
        },
        body: file
      });

      if (!response.ok) throw new Error('Erreur upload OneDrive');
      return await response.json();
    }

    // Pour les gros fichiers, utiliser l'upload session (simplifié ici)
    throw new Error('Fichier trop volumineux - utiliser l\'upload session');
  }

  async onedrive_createFolder(companyId, userId, folderName, parentFolderId = null) {
    const tokens = await integrationsService.getTokens(companyId, 'onedrive', userId);
    if (!tokens) throw new Error('Non connecté à OneDrive');

    const url = parentFolderId
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${parentFolderId}/children`
      : 'https://graph.microsoft.com/v1.0/me/drive/root/children';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename'
      })
    });

    if (!response.ok) throw new Error('Erreur création dossier OneDrive');
    return await response.json();
  }

  async onedrive_deleteFile(companyId, userId, fileId) {
    const tokens = await integrationsService.getTokens(companyId, 'onedrive', userId);
    if (!tokens) throw new Error('Non connecté à OneDrive');

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error('Erreur suppression fichier OneDrive');
    }

    return { success: true };
  }

  async onedrive_getShareLink(companyId, userId, fileId) {
    const tokens = await integrationsService.getTokens(companyId, 'onedrive', userId);
    if (!tokens) throw new Error('Non connecté à OneDrive');

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/createLink`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'view',
          scope: 'anonymous'
        })
      }
    );

    if (!response.ok) throw new Error('Erreur création lien OneDrive');
    const data = await response.json();
    return data.link?.webUrl;
  }

  // ==========================================
  // NOTION
  // ==========================================

  async notion_listDatabases(companyId, userId) {
    const tokens = await integrationsService.getTokens(companyId, 'notion', userId);
    if (!tokens) throw new Error('Non connecté à Notion');

    const response = await fetch(
      'https://api.notion.com/v1/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          filter: { property: 'object', value: 'database' }
        })
      }
    );

    if (!response.ok) throw new Error('Erreur listage bases Notion');
    const data = await response.json();
    return data.results || [];
  }

  async notion_queryDatabase(companyId, userId, databaseId, filter = null, sorts = null) {
    const tokens = await integrationsService.getTokens(companyId, 'notion', userId);
    if (!tokens) throw new Error('Non connecté à Notion');

    const body = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) throw new Error('Erreur requête base Notion');
    const data = await response.json();
    return data.results || [];
  }

  async notion_createPage(companyId, userId, parentId, properties, content = []) {
    const tokens = await integrationsService.getTokens(companyId, 'notion', userId);
    if (!tokens) throw new Error('Non connecté à Notion');

    const config = await integrationsService.getIntegrationConfig(companyId, 'notion');
    const targetParentId = parentId || config?.config?.defaultDatabaseId;

    const response = await fetch(
      'https://api.notion.com/v1/pages',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: targetParentId },
          properties,
          children: content
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur création page Notion: ${error}`);
    }

    return await response.json();
  }

  async notion_updatePage(companyId, userId, pageId, properties) {
    const tokens = await integrationsService.getTokens(companyId, 'notion', userId);
    if (!tokens) throw new Error('Non connecté à Notion');

    const response = await fetch(
      `https://api.notion.com/v1/pages/${pageId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({ properties })
      }
    );

    if (!response.ok) throw new Error('Erreur mise à jour page Notion');
    return await response.json();
  }

  async notion_getPage(companyId, userId, pageId) {
    const tokens = await integrationsService.getTokens(companyId, 'notion', userId);
    if (!tokens) throw new Error('Non connecté à Notion');

    const response = await fetch(
      `https://api.notion.com/v1/pages/${pageId}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Notion-Version': '2022-06-28'
        }
      }
    );

    if (!response.ok) throw new Error('Erreur récupération page Notion');
    return await response.json();
  }

  /**
   * Créer des propriétés Notion à partir de données Synergia
   */
  notion_createEmployeeProperties(employee) {
    return {
      'Nom': {
        title: [{ text: { content: `${employee.firstName} ${employee.lastName}` } }]
      },
      'Email': {
        email: employee.email
      },
      'Poste': {
        rich_text: [{ text: { content: employee.position || '' } }]
      },
      'Département': {
        select: { name: employee.department || 'Non défini' }
      },
      'Date d\'embauche': {
        date: employee.hireDate ? { start: employee.hireDate } : null
      }
    };
  }

  notion_createLeaveProperties(leave, employeeName) {
    return {
      'Employé': {
        title: [{ text: { content: employeeName } }]
      },
      'Type': {
        select: { name: leave.type || 'Congés' }
      },
      'Du': {
        date: { start: leave.startDate }
      },
      'Au': {
        date: { start: leave.endDate }
      },
      'Statut': {
        select: { name: leave.status === 'approved' ? 'Approuvé' : 'En attente' }
      }
    };
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  /**
   * Uploader un fichier Synergia vers le stockage configuré
   */
  async uploadToConfiguredStorage(companyId, userId, file, folderPath = null) {
    // Vérifier quel stockage est configuré
    const gdConfig = await integrationsService.getIntegrationConfig(companyId, 'google_drive');
    const odConfig = await integrationsService.getIntegrationConfig(companyId, 'onedrive');

    if (gdConfig?.enabled) {
      return {
        provider: 'google_drive',
        result: await this.googleDrive_uploadFile(companyId, userId, file, folderPath)
      };
    }

    if (odConfig?.enabled) {
      return {
        provider: 'onedrive',
        result: await this.onedrive_uploadFile(companyId, userId, file, folderPath)
      };
    }

    throw new Error('Aucun service de stockage configuré');
  }

  /**
   * Lister les fichiers depuis le stockage configuré
   */
  async listFromConfiguredStorage(companyId, userId, folderId = null) {
    const gdConfig = await integrationsService.getIntegrationConfig(companyId, 'google_drive');
    const odConfig = await integrationsService.getIntegrationConfig(companyId, 'onedrive');

    if (gdConfig?.enabled) {
      const files = await this.googleDrive_listFiles(companyId, userId, folderId);
      return files.map(f => ({
        id: f.id,
        name: f.name,
        type: f.mimeType,
        size: f.size,
        modifiedAt: f.modifiedTime,
        url: f.webViewLink,
        provider: 'google_drive'
      }));
    }

    if (odConfig?.enabled) {
      const files = await this.onedrive_listFiles(companyId, userId, folderId);
      return files.map(f => ({
        id: f.id,
        name: f.name,
        type: f.file?.mimeType,
        size: f.size,
        modifiedAt: f.lastModifiedDateTime,
        url: f.webUrl,
        provider: 'onedrive'
      }));
    }

    throw new Error('Aucun service de stockage configuré');
  }
}

export const storageConnector = new StorageConnector();
export default storageConnector;
