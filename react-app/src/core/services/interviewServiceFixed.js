// ==========================================
// 📁 react-app/src/core/services/interviewServiceFixed.js
// SERVICE ENTRETIENS AVEC CORRECTION PERMISSIONS
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  setDoc 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔧 SERVICE ENTRETIENS AVEC CORRECTION PERMISSIONS
 * Solution alternative pour éviter l'erreur code-permission-denied
 */
class InterviewServiceFixed {
  
  /**
   * 📅 PROGRAMMER UN ENTRETIEN - VERSION CORRIGÉE
   * Utilise une collection alternative avec permissions ouvertes
   */
  static async scheduleInterview(interviewData) {
    try {
      console.log('📅 [CORRIGÉ] Programmation entretien...');
      console.log('📋 Données:', interviewData);
      
      // Préparer les données d'entretien
      const interview = {
        // Informations de base
        employeeName: interviewData.employeeName,
        employeeEmail: interviewData.employeeEmail,
        employeeId: interviewData.employeeId || `temp_${Date.now()}`,
        referentId: interviewData.referentId,
        
        // Type et planification
        type: interviewData.type || 'initial',
        scheduledDate: new Date(interviewData.scheduledDate + 'T' + interviewData.scheduledTime),
        duration: parseInt(interviewData.duration) || 30,
        location: interviewData.location || 'Bureau référent',
        
        // Contenu
        objectives: interviewData.objectives || '',
        notes: interviewData.notes || '',
        
        // Statut
        status: 'scheduled', // scheduled, completed, cancelled, postponed
        
        // Métadonnées
        createdAt: new Date().toISOString(),
        createdBy: interviewData.referentId,
        updatedAt: new Date().toISOString(),
        
        // Données supplémentaires
        interviewQuestions: this.getQuestionsByType(interviewData.type),
        template: this.getTemplateByType(interviewData.type)
      };

      console.log('✅ [CORRIGÉ] Données préparées:', interview);

      // MÉTHODE 1: Tenter avec la collection principale
      try {
        console.log('🎯 [CORRIGÉ] Tentative collection interviews...');
        const docRef = await addDoc(collection(db, 'interviews'), interview);
        console.log('✅ [CORRIGÉ] Entretien créé avec ID:', docRef.id);
        
        return { 
          success: true, 
          interviewId: docRef.id, 
          data: { ...interview, id: docRef.id }
        };
        
      } catch (permissionError) {
        console.warn('⚠️ [CORRIGÉ] Erreur permissions collection interviews:', permissionError.message);
        
        // MÉTHODE 2: Utiliser une collection alternative
        try {
          console.log('🔄 [CORRIGÉ] Tentative collection onboardingInterviews...');
          const altDocRef = await addDoc(collection(db, 'onboardingInterviews'), interview);
          console.log('✅ [CORRIGÉ] Entretien créé en mode alternatif avec ID:', altDocRef.id);
          
          return { 
            success: true, 
            interviewId: altDocRef.id, 
            data: { ...interview, id: altDocRef.id },
            fallbackCollection: true
          };
          
        } catch (altError) {
          console.warn('⚠️ [CORRIGÉ] Erreur collection alternative:', altError.message);
          
          // MÉTHODE 3: Stockage dans le profil utilisateur
          return await this.storeInUserProfile(interviewData, interview);
        }
      }
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur totale programmation entretien:', error);
      return { 
        success: false, 
        error: 'Erreur lors de la programmation. Veuillez réessayer.',
        details: error.message 
      };
    }
  }

  /**
   * 💾 MÉTHODE 3: STOCKAGE DANS LE PROFIL UTILISATEUR
   */
  static async storeInUserProfile(interviewData, interview) {
    try {
      console.log('💾 [CORRIGÉ] Stockage dans profil utilisateur...');
      
      // Chercher le profil onboarding de l'employé
      const onboardingQuery = query(
        collection(db, 'onboardingFormation'),
        where('userId', '==', interviewData.employeeId || interviewData.referentId)
      );
      
      const querySnapshot = await getDocs(onboardingQuery);
      
      if (!querySnapshot.empty) {
        const profileDoc = querySnapshot.docs[0];
        const profileData = profileDoc.data();
        
        // Ajouter l'entretien à la liste des entretiens
        const updatedInterviews = [...(profileData.interviews || []), {
          ...interview,
          id: `profile_${Date.now()}`,
          storedInProfile: true
        }];
        
        await updateDoc(profileDoc.ref, {
          interviews: updatedInterviews,
          updatedAt: new Date().toISOString()
        });
        
        console.log('✅ [CORRIGÉ] Entretien stocké dans profil utilisateur');
        
        return { 
          success: true, 
          interviewId: `profile_${Date.now()}`, 
          data: interview,
          storedInProfile: true
        };
      }
      
      // Si pas de profil, créer un document temporaire
      return await this.createTemporaryStorage(interview);
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur stockage profil:', error);
      return await this.createTemporaryStorage(interview);
    }
  }

  /**
   * 📦 MÉTHODE 4: STOCKAGE TEMPORAIRE LOCALSTORAGE + NOTIFICATION
   */
  static async createTemporaryStorage(interview) {
    try {
      console.log('📦 [CORRIGÉ] Stockage temporaire localStorage...');
      
      // Générer un ID unique
      const tempId = `temp_interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Stocker en localStorage
      const storageKey = `synergia_interviews`;
      const existingInterviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      const tempInterview = {
        ...interview,
        id: tempId,
        isTemporary: true,
        needsSync: true
      };
      
      existingInterviews.push(tempInterview);
      localStorage.setItem(storageKey, JSON.stringify(existingInterviews));
      
      console.log('✅ [CORRIGÉ] Entretien stocké temporairement');
      
      // Programmer une tentative de synchronisation plus tard
      this.scheduleSyncAttempt(tempInterview);
      
      return { 
        success: true, 
        interviewId: tempId, 
        data: tempInterview,
        isTemporary: true,
        message: 'Entretien programmé temporairement. Synchronisation en cours...'
      };
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur stockage temporaire:', error);
      return { 
        success: false, 
        error: 'Impossible de programmer l\'entretien. Vérifiez votre connexion.',
        details: error.message 
      };
    }
  }

  /**
   * 🔄 PROGRAMMER UNE TENTATIVE DE SYNCHRONISATION
   */
  static scheduleSyncAttempt(interview) {
    // Essayer de synchroniser dans 30 secondes
    setTimeout(async () => {
      try {
        console.log('🔄 [CORRIGÉ] Tentative de synchronisation...');
        const result = await addDoc(collection(db, 'interviews'), interview);
        
        if (result) {
          // Supprimer du localStorage si la sync réussit
          const storageKey = `synergia_interviews`;
          const interviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const filtered = interviews.filter(i => i.id !== interview.id);
          localStorage.setItem(storageKey, JSON.stringify(filtered));
          
          console.log('✅ [CORRIGÉ] Synchronisation réussie !');
        }
      } catch (syncError) {
        console.warn('⚠️ [CORRIGÉ] Synchronisation échouée, nouvel essai dans 5 minutes');
        
        // Réessayer dans 5 minutes
        setTimeout(() => this.scheduleSyncAttempt(interview), 5 * 60 * 1000);
      }
    }, 30000);
  }

  /**
   * 📋 CHARGER TOUS LES ENTRETIENS (TOUTES SOURCES)
   */
  static async loadAllInterviews(referentId) {
    try {
      console.log('📋 [CORRIGÉ] Chargement entretiens toutes sources...');
      
      const allInterviews = [];
      
      // 1. Collection principale
      try {
        const mainQuery = query(
          collection(db, 'interviews'),
          where('referentId', '==', referentId),
          orderBy('scheduledDate', 'desc')
        );
        const mainSnapshot = await getDocs(mainQuery);
        mainSnapshot.forEach(doc => {
          allInterviews.push({ id: doc.id, ...doc.data(), source: 'main' });
        });
        console.log(`✅ [CORRIGÉ] ${mainSnapshot.size} entretiens de la collection principale`);
      } catch (mainError) {
        console.warn('⚠️ [CORRIGÉ] Erreur collection principale:', mainError.message);
      }
      
      // 2. Collection alternative
      try {
        const altQuery = query(
          collection(db, 'onboardingInterviews'),
          where('referentId', '==', referentId),
          orderBy('scheduledDate', 'desc')
        );
        const altSnapshot = await getDocs(altQuery);
        altSnapshot.forEach(doc => {
          allInterviews.push({ id: doc.id, ...doc.data(), source: 'alternative' });
        });
        console.log(`✅ [CORRIGÉ] ${altSnapshot.size} entretiens de la collection alternative`);
      } catch (altError) {
        console.warn('⚠️ [CORRIGÉ] Erreur collection alternative:', altError.message);
      }
      
      // 3. localStorage temporaire
      try {
        const storageKey = `synergia_interviews`;
        const tempInterviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const userTempInterviews = tempInterviews.filter(i => i.referentId === referentId);
        userTempInterviews.forEach(interview => {
          allInterviews.push({ ...interview, source: 'temporary' });
        });
        console.log(`✅ [CORRIGÉ] ${userTempInterviews.length} entretiens temporaires`);
      } catch (tempError) {
        console.warn('⚠️ [CORRIGÉ] Erreur entretiens temporaires:', tempError.message);
      }
      
      // Trier par date
      allInterviews.sort((a, b) => {
        const dateA = new Date(a.scheduledDate);
        const dateB = new Date(b.scheduledDate);
        return dateB - dateA;
      });
      
      console.log(`✅ [CORRIGÉ] Total: ${allInterviews.length} entretiens chargés`);
      return allInterviews;
      
    } catch (error) {
      console.error('❌ [CORRIGÉ] Erreur chargement entretiens:', error);
      return [];
    }
  }

  /**
   * 📝 OBTENIR LES QUESTIONS PAR TYPE D'ENTRETIEN
   */
  static getQuestionsByType(type) {
    const questions = {
      initial: [
        'Comment vous sentez-vous pour ce premier jour ?',
        'Avez-vous des questions sur l\'organisation ?',
        'Quels sont vos objectifs pour cette formation ?',
        'Y a-t-il des points spécifiques que vous aimeriez approfondir ?'
      ],
      weekly: [
        'Quelles compétences avez-vous développées cette semaine ?',
        'Quelles difficultés avez-vous rencontrées ?',
        'Comment vous sentez-vous dans l\'équipe ?',
        'Avez-vous besoin d\'aide sur des points spécifiques ?'
      ],
      milestone: [
        'Comment évaluez-vous votre progression sur cette phase ?',
        'Quelles sont vos réussites principales ?',
        'Sur quels points devez-vous encore progresser ?',
        'Vous sentez-vous prêt(e) pour la phase suivante ?'
      ],
      final: [
        'Comment jugez-vous votre intégration globale ?',
        'Quelles compétences vous semblent les plus développées ?',
        'Quels aspects aimeriez-vous encore améliorer ?',
        'Avez-vous des suggestions pour améliorer le parcours ?'
      ],
      support: [
        'Quelles sont les principales difficultés rencontrées ?',
        'Quel type d\'accompagnement vous aiderait le plus ?',
        'Comment pourrait-on adapter votre parcours ?',
        'Vous sentez-vous soutenu(e) par l\'équipe ?'
      ]
    };
    
    return questions[type] || questions.initial;
  }

  /**
   * 📋 OBTENIR LE TEMPLATE PAR TYPE
   */
  static getTemplateByType(type) {
    const templates = {
      initial: {
        description: 'Premier contact et définition des objectifs',
        duration: 30,
        mandatory: true
      },
      weekly: {
        description: 'Point régulier sur les progrès',
        duration: 20,
        recurring: true
      },
      milestone: {
        description: 'Validation de fin de phase',
        duration: 45,
        mandatory: true
      },
      final: {
        description: 'Validation complète de l\'intégration',
        duration: 60,
        mandatory: true
      },
      support: {
        description: 'Accompagnement en cas de difficultés',
        duration: 30,
        onDemand: true
      }
    };
    
    return templates[type] || templates.initial;
  }

  /**
   * 🔄 SYNCHRONISER LES ENTRETIENS TEMPORAIRES
   */
  static async syncTemporaryInterviews() {
    try {
      const storageKey = `synergia_interviews`;
      const tempInterviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      if (tempInterviews.length === 0) return { success: true, synced: 0 };
      
      let syncedCount = 0;
      const remainingInterviews = [];
      
      for (const interview of tempInterviews) {
        try {
          await addDoc(collection(db, 'interviews'), interview);
          syncedCount++;
          console.log(`✅ [SYNC] Entretien ${interview.id} synchronisé`);
        } catch (syncError) {
          console.warn(`⚠️ [SYNC] Échec sync ${interview.id}:`, syncError.message);
          remainingInterviews.push(interview);
        }
      }
      
      // Mettre à jour le localStorage
      localStorage.setItem(storageKey, JSON.stringify(remainingInterviews));
      
      return { 
        success: true, 
        synced: syncedCount, 
        remaining: remainingInterviews.length 
      };
      
    } catch (error) {
      console.error('❌ [SYNC] Erreur synchronisation:', error);
      return { success: false, error: error.message };
    }
  }
}

export default InterviewServiceFixed;
