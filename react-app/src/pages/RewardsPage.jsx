// ==========================================
// 📁 CORRECTION POUR react-app/src/pages/RewardsPage.jsx
// AJOUTER CET IMPORT ET REMPLACER LA FONCTION handlePurchaseReward
// ==========================================

// ✅ AJOUTER CET IMPORT EN HAUT DU FICHIER (après les autres imports)
import { rewardsPurchaseService } from '../core/services/rewardsPurchaseService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

// ✅ AJOUTER CES ÉTATS DANS LE COMPOSANT RewardsPage (après les autres useState)
const { user } = useAuthStore(); // Si pas déjà présent
const [purchasing, setPurchasing] = useState(false);
const [purchaseSuccess, setPurchaseSuccess] = useState(null);

// ✅ REMPLACER COMPLÈTEMENT LA FONCTION handlePurchaseReward PAR CELLE-CI :

/**
 * 🛒 ACHAT DE RÉCOMPENSE AVEC DÉDUCTION XP GARANTIE
 */
const handlePurchaseReward = async (reward) => {
  if (purchasing || !user?.uid) {
    return;
  }

  try {
    setPurchasing(true);
    console.log('🛒 [REWARDS-PAGE] Début achat:', reward.name);

    // Vérifications préalables
    if (totalXp < reward.cost) {
      throw new Error(`Vous n'avez pas assez d'XP! Il vous manque ${reward.cost - totalXp} XP.`);
    }

    if (!reward.unlocked) {
      throw new Error(`Cette récompense nécessite: ${reward.requirement}`);
    }

    // Acheter via le service sécurisé
    const result = await rewardsPurchaseService.purchaseReward(user.uid, reward);

    if (result.success) {
      // Succès !
      setPurchaseSuccess({
        reward: result.reward,
        previousXp: result.previousXp,
        newXp: result.newXp,
        message: result.message
      });

      // Fermer le modal d'achat
      setShowPurchaseModal(false);

      // Forcer la synchronisation pour mettre à jour l'interface
      setTimeout(() => {
        if (forceSync) {
          forceSync();
        }
      }, 500);

      console.log('✅ [REWARDS-PAGE] Achat réussi:', result);

      // Auto-clear le message de succès après 5 secondes
      setTimeout(() => {
        setPurchaseSuccess(null);
      }, 5000);

    } else {
      throw new Error('Achat échoué');
    }

  } catch (error) {
    console.error('❌ [REWARDS-PAGE] Erreur achat:', error);
    alert(`❌ Erreur lors de l'achat: ${error.message}`);
  } finally {
    setPurchasing(false);
  }
};

// ✅ AJOUTER CE COMPOSANT D'AFFICHAGE DE SUCCÈS (avant le return principal)

/**
 * 🎉 NOTIFICATION DE SUCCÈS D'ACHAT
 */
const PurchaseSuccessNotification = () => {
  if (!purchaseSuccess) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-xl z-50 max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{purchaseSuccess.reward.icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">Achat réussi ! 🎉</h4>
          <p className="text-sm opacity-90 mb-2">{purchaseSuccess.reward.name}</p>
          <div className="text-xs opacity-75">
            <div>XP avant: {purchaseSuccess.previousXp.toLocaleString()}</div>
            <div>XP après: {purchaseSuccess.newXp.toLocaleString()}</div>
            <div>Coût: -{purchaseSuccess.reward.cost} XP</div>
          </div>
        </div>
        <button
          onClick={() => setPurchaseSuccess(null)}
          className="text-white/70 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// ✅ MODIFIER LE BOUTON D'ACHAT DANS LE MODAL (remplacer le bouton existant par)

<button
  onClick={() => handlePurchaseReward(selectedReward)}
  disabled={totalXp < selectedReward.cost || purchasing}
  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
>
  {purchasing ? (
    <>
      <RefreshCw className="w-4 h-4 animate-spin" />
      Achat...
    </>
  ) : (
    <>
      <ShoppingBag className="w-4 h-4" />
      Acheter
    </>
  )}
</button>

// ✅ AJOUTER LA NOTIFICATION DANS LE RETURN PRINCIPAL (juste après <TeamPageXpSyncWrapper> si présent)

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
    
    {/* Notification de succès */}
    <AnimatePresence>
      <PurchaseSuccessNotification />
    </AnimatePresence>

    {/* Reste du contenu existant... */}
    
  </div>
);

// ✅ AJOUTER UN LISTENER POUR LES ACHATS (dans useEffect)

useEffect(() => {
  // Écouter les achats de récompenses
  const handleRewardPurchased = (event) => {
    const { userId, reward, newXp } = event.detail;
    
    if (userId === user?.uid) {
      console.log('🔄 [REWARDS-PAGE] Achat détecté, mise à jour interface');
      
      // Forcer la synchronisation XP
      if (forceSync) {
        forceSync();
      }
    }
  };

  window.addEventListener('rewardPurchased', handleRewardPurchased);

  return () => {
    window.removeEventListener('rewardPurchased', handleRewardPurchased);
  };
}, [user?.uid, forceSync]);

// ✅ INSTRUCTIONS D'INTÉGRATION COMPLÈTES

/*
POUR INTÉGRER CETTE CORRECTION DANS RewardsPage.jsx :

1. AJOUTER l'import du service en haut :
   import { rewardsPurchaseService } from '../core/services/rewardsPurchaseService.js';

2. AJOUTER les nouveaux états :
   const [purchasing, setPurchasing] = useState(false);
   const [purchaseSuccess, setPurchaseSuccess] = useState(null);

3. REMPLACER la fonction handlePurchaseReward existante par la nouvelle

4. AJOUTER le composant PurchaseSuccessNotification avant le return

5. MODIFIER le bouton d'achat dans le modal pour afficher l'état de chargement

6. AJOUTER la notification dans le return principal

7. AJOUTER le useEffect pour écouter les achats

RÉSULTAT : Les XP seront correctement déduits et l'interface se mettra à jour !
*/
