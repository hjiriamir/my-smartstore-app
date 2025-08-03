import StockAlert from "../Model/StockAlert.js";
import Produit from "../Model/Produit.js";

// Liste des alertes
export const getAllStockAlerts = async (req, res) => {
  try {
    const alerts = await StockAlert.findAll({
      include: [
        {
          model: Produit,
          attributes: ["produit_id", "nom", "stock"],
        },
      ],
    });
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des alertes" });
  }
};

// Créer une alerte
export const createStockAlert = async (req, res) => {
  try {
    const alert = await StockAlert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de l'alerte" });
  }
};

// Mettre à jour une alerte
export const updateStockAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await StockAlert.update(req.body, { where: { id } });
    const updated = await StockAlert.findByPk(id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'alerte" });
  }
};

// Supprimer une alerte
export const deleteStockAlert = async (req, res) => {
  try {
    const { id } = req.params;
    await StockAlert.destroy({ where: { id } });
    res.json({ message: "Alerte supprimée" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'alerte" });
  }
};
