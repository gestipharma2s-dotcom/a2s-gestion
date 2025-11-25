import { installationService } from './installationService';

/**
 * Service d'automatisation pour renouveler les installations après 1 an
 * À appeler régulièrement (ex: au démarrage de l'app, toutes les heures, etc.)
 */
export const autoRenewalService = {
  /**
   * Démarre le processus de renouvellement automatique
   * @param {number} intervalMs - Intervalle de vérification en millisecondes (défaut: toutes les heures)
   */
  startAutoRenewal(intervalMs = 3600000) {
    console.log('🔄 Auto-renewal service started');
    
    // Vérifier au démarrage
    this.checkAndRenew();
    
    // Puis vérifier régulièrement
    this.intervalId = setInterval(() => {
      this.checkAndRenew();
    }, intervalMs);
  },

  /**
   * Arrête le processus de renouvellement automatique
   */
  stopAutoRenewal() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Auto-renewal service stopped');
    }
  },

  /**
   * Effectue la vérification et le renouvellement
   */
  async checkAndRenew() {
    try {
      const result = await installationService.checkAndRenewAcquisitions();
      
      if (result.renewedCount > 0) {
        console.log(`✅ ${result.renewedCount} installation(s) renouvelée(s) automatiquement`);
        // Vous pouvez ajouter une notification ici si nécessaire
      }
    } catch (error) {
      console.error('❌ Erreur lors du renouvellement automatique:', error);
    }
  }
};
