import cron from "node-cron";
import Stock from "../Model/Stock.js";
import StockAlert from "../Model/StockAlert.js";

const seuil = 10; // seuil d'alerte

cron.schedule("*/5 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Vérification des stocks...`);
  try {
    const produits = await Stock.findAll();

    for (const p of produits) {
      if (p.quantite <= 0) {
        await StockAlert.findOrCreate({
          where: { product_id: p.produit_id, alert_type: 'out_of_stock' },
          defaults: {
            threshold: 0,
            is_active: true,
            notified_at: new Date()
          }
        });
      } else if (p.quantite <= seuil) {
        await StockAlert.findOrCreate({
          where: { product_id: p.produit_id, alert_type: 'low_stock' },
          defaults: {
            threshold: seuil,
            is_active: true,
            notified_at: new Date()
          }
        });
      }
    }
  } catch (err) {
    console.error("Erreur dans le scheduler d'alertes stock :", err);
  }
});

cron.schedule("*/5 * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Vérification des alertes de stock obsolètes...`);

  try {
    // Récupère toutes les alertes actives
    const alertes = await StockAlert.findAll({
      where: { is_active: true }
    });

    for (const alerte of alertes) {
      const produit = await Stock.findOne({ where: { produit_id: alerte.product_id } });

      if (!produit) continue;

      const quantite = produit.quantite;

      if (alerte.alert_type === 'out_of_stock' && quantite > 0) {
        // Le stock n'est plus nul => désactiver l'alerte de rupture
        await alerte.update({ is_active: false });
        console.log(`✅ Alerte "out_of_stock" désactivée pour produit ID: ${alerte.product_id}`);
      } else if (alerte.alert_type === 'low_stock' && quantite > alerte.threshold) {
        // Le stock dépasse le seuil => désactiver l'alerte de stock faible
        await alerte.update({ is_active: false });
        console.log(`✅ Alerte "low_stock" désactivée pour produit ID: ${alerte.product_id}`);
      }
    }
  } catch (err) {
    console.error("❌ Erreur dans le scheduler de désactivation des alertes obsolètes :", err);
  }
});
