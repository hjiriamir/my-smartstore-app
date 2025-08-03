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
