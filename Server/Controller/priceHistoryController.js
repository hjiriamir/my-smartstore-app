import PriceHistory from "../Model/PriceHistory.js";
import Categorie1 from '../Model/Categorie1.js';
import Produit from '../Model/Produit.js';
import magasin1 from '../Model/magasin1.js';
import { Op } from 'sequelize';

export const getPriceHistoryByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const history = await PriceHistory.findAll({
      where: { product_id },
      order: [["changed_at", "DESC"]],
    });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération de l'historique des prix." });
  }
};

export const getPricesChangement = async (req, res) => {
  try {
    const { idEntreprise } = req.params;
    if (!idEntreprise) {
      return res.status(400).json({ error: "Le paramètre idEntreprise est obligatoire" });
    }

    // 1. Récupération des magasins
    const magasins = await magasin1.findAll({
      where: { entreprise_id: idEntreprise },
    });

    if (magasins.length === 0) {
      return res.status(400).json({ error: "Aucun magasin trouvé" });
    }

    const magasinsIds = magasins.map((m) => m.magasin_id);

    // 2. Récupération des catégories
    const categories = await Categorie1.findAll({
      where: {
        magasin_id: {
          [Op.in]: magasinsIds,
        },
      },
    });

    if (categories.length === 0) {
      return res.status(400).json({ error: "Aucune catégorie trouvée" });
    }

    const categoriesIds = categories.map((c) => c.categorie_id);

    // 3. Récupération des produits
    const produits = await Produit.findAll({
      where: {
        categorie_id: {
          [Op.in]: categoriesIds,
        },
      },
    });

    const produitsIds = produits.map((p) => p.produit_id);

    // 4. Définir l'intervalle de la journée
    const maintenant = new Date();
    
    // Calcul du début de la semaine (lundi à 00:00:00)
    const debutSemaine = new Date(maintenant);
    const jour = debutSemaine.getDay(); // 0=Dimanche, 1=Lundi, ...
    const diff = (jour === 0 ? -6 : 1) - jour; // Ajustement pour revenir au lundi
    debutSemaine.setDate(debutSemaine.getDate() + diff);
    debutSemaine.setHours(0, 0, 0, 0);

    // Calcul de la fin de la semaine (dimanche à 23:59:59.999)
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(finSemaine.getDate() + 6);
    finSemaine.setHours(23, 59, 59, 999);

    // 5. Compter les tickets générés aujourd'hui
    const priceChangements = await PriceHistory.findAndCountAll({
      where: {
        product_id: {
          [Op.in]: produitsIds,
        },
        changed_at: {
          [Op.between]: [debutSemaine, finSemaine],
        },
      },
    });

    res.status(200).json({
      count: priceChangements.count,
      rows: priceChangements.rows,
    });

  } catch (error) {
    console.error("Erreur getDailyGeneratedTicket :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getLastPrice = async (req, res) => {
  try {
    const { product_id } = req.params;

    const lastHistory = await PriceHistory.findOne({
      where: { product_id },
      order: [["changed_at", "DESC"]],
    });

    if (!lastHistory) {
      return res.status(404).json({ error: "Aucun historique trouvé pour ce produit." });
    }

    res.json(lastHistory);
  } catch (error) {
    console.error("Erreur dans getLastPrice :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération du dernier changement de prix." });
  }
};
